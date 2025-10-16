import { authenticate } from "@middlewares/auth.middleware.js";
import { Discussion } from "@models/Discussion.js";
import type { LeanDiscussion } from "@server/types/route-helpers";
import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";

// Validation schemas
const createDiscussionSchema = z.object({
  questionId: z.string().min(1),
  content: z.string().min(1).max(2000),
  parentId: z.string().optional(),
});

const updateDiscussionSchema = z.object({
  content: z.string().min(1).max(2000),
});

const reportDiscussionSchema = z.object({
  reason: z.string().optional(),
});

export default async function discussionRoutes(fastify: FastifyInstance) {
  /**
   * @route   GET /api/v1/discussions/:questionId
   * @desc    Get all discussions for a question
   * @access  Public
   */
  fastify.get<{
    Params: { questionId: string };
    Querystring: { page?: string; limit?: string };
  }>(
    "/:questionId",
    {
      schema: {
        params: zodToJsonSchema(z.object({ questionId: z.string() })),
        querystring: zodToJsonSchema(
          z.object({
            page: z.string().optional(),
            limit: z.string().optional(),
          })
        ),
      },
    },
    async (request, reply) => {
      try {
        const { questionId } = request.params;
        const page = parseInt(request.query.page || "1");
        const limit = parseInt(request.query.limit || "20");
        const skip = (page - 1) * limit;

        // Get top-level discussions
        const discussions = await Discussion.find({
          questionId,
          parentId: null,
        })
          .populate("userId", "name avatar gamification.level")
          .sort({ isPinned: -1, isBestAnswer: -1, createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .lean();

        // Get replies for each discussion
        const discussionsWithReplies = await Promise.all(
          (discussions as LeanDiscussion[]).map(async (discussion) => {
            const replies = await Discussion.find({ parentId: discussion._id })
              .populate("userId", "name avatar gamification.level")
              .sort({ createdAt: 1 })
              .lean();

            return {
              ...discussion,
              likesCount: discussion.likes?.length || 0,
              likedByCurrentUser: request.authUser
                ? discussion.likes?.some((id: string) => id.toString() === request.authUser?.id)
                : false,
              replies: (replies as LeanDiscussion[]).map((reply) => ({
                ...reply,
                likesCount: reply.likes?.length || 0,
                likedByCurrentUser: request.authUser
                  ? reply.likes?.some((id: string) => id.toString() === request.authUser?.id)
                  : false,
              })),
            };
          })
        );

        const total = await Discussion.countDocuments({ questionId, parentId: null });

        reply.send({
          success: true,
          discussions: discussionsWithReplies,
          pagination: {
            page,
            limit,
            total,
            hasMore: skip + discussions.length < total,
          },
        });
      } catch (error) {
        fastify.log.error(error);
        reply.status(500).send({
          success: false,
          message: "Failed to fetch discussions",
        });
      }
    }
  );

  /**
   * @route   POST /api/v1/discussions
   * @desc    Create a new discussion or reply
   * @access  Private
   */
  fastify.post<{
    Body: z.infer<typeof createDiscussionSchema>;
  }>(
    "/",
    {
      preHandler: [authenticate],
      schema: {
        body: zodToJsonSchema(createDiscussionSchema),
      },
      config: {
        rateLimit: {
          max: 10,
          timeWindow: "15 minutes",
        },
      },
    },
    async (request, reply) => {
      try {
        const userId = request.authUser?.id;
        if (!userId) {
          return reply.status(401).send({ success: false, message: "Unauthorized" });
        }

        const validatedData = createDiscussionSchema.parse(request.body);

        const discussion = await Discussion.create({
          ...validatedData,
          userId,
          likes: [],
          isEdited: false,
          isPinned: false,
          isReported: false,
          reportCount: 0,
          isBestAnswer: false,
        });

        const populatedDiscussion = await Discussion.findById(discussion._id)
          .populate("userId", "name avatar gamification.level")
          .lean();

        reply.status(201).send({
          success: true,
          message: "Discussion created successfully",
          discussion: {
            ...populatedDiscussion,
            likesCount: 0,
            likedByCurrentUser: false,
          },
        });
      } catch (error) {
        if (error instanceof z.ZodError) {
          return reply.status(400).send({
            success: false,
            message: "Validation error",
            errors: error.errors,
          });
        }
        fastify.log.error(error);
        reply.status(500).send({
          success: false,
          message: "Failed to create discussion",
        });
      }
    }
  );

  /**
   * @route   PUT /api/v1/discussions/:id
   * @desc    Update a discussion
   * @access  Private (owner or admin)
   */
  fastify.put<{
    Params: { id: string };
    Body: z.infer<typeof updateDiscussionSchema>;
  }>(
    "/:id",
    {
      preHandler: [authenticate],
      schema: {
        params: zodToJsonSchema(z.object({ id: z.string() })),
        body: zodToJsonSchema(updateDiscussionSchema),
      },
    },
    async (request, reply) => {
      try {
        const userId = request.authUser?.id;
        const { id } = request.params;

        if (!userId) {
          return reply.status(401).send({ success: false, message: "Unauthorized" });
        }

        const validatedData = updateDiscussionSchema.parse(request.body);
        const discussion = await Discussion.findById(id);

        if (!discussion) {
          return reply.status(404).send({ success: false, message: "Discussion not found" });
        }

        if (discussion.userId.toString() !== userId && request.authUser?.role !== "admin") {
          return reply.status(403).send({
            success: false,
            message: "You can only edit your own discussions",
          });
        }

        discussion.content = validatedData.content;
        discussion.isEdited = true;
        discussion.editedAt = new Date();
        await discussion.save();

        const populatedDiscussion = await Discussion.findById(discussion._id)
          .populate("userId", "name avatar gamification.level")
          .lean();

        const discussionData = populatedDiscussion as unknown as LeanDiscussion;
        reply.send({
          success: true,
          message: "Discussion updated successfully",
          discussion: {
            ...populatedDiscussion,
            likesCount: discussionData.likes?.length || 0,
            likedByCurrentUser: discussionData.likes?.some(
              (id: string) => id.toString() === userId
            ),
          },
        });
      } catch (error) {
        if (error instanceof z.ZodError) {
          return reply.status(400).send({
            success: false,
            message: "Validation error",
            errors: error.errors,
          });
        }
        fastify.log.error(error);
        reply.status(500).send({
          success: false,
          message: "Failed to update discussion",
        });
      }
    }
  );

  /**
   * @route   DELETE /api/v1/discussions/:id
   * @desc    Delete a discussion and its replies
   * @access  Private (owner or admin)
   */
  fastify.delete<{
    Params: { id: string };
  }>(
    "/:id",
    {
      preHandler: [authenticate],
      schema: {
        params: zodToJsonSchema(z.object({ id: z.string() })),
      },
    },
    async (request, reply) => {
      try {
        const userId = request.authUser?.id;
        const { id } = request.params;

        if (!userId) {
          return reply.status(401).send({ success: false, message: "Unauthorized" });
        }

        const discussion = await Discussion.findById(id);

        if (!discussion) {
          return reply.status(404).send({ success: false, message: "Discussion not found" });
        }

        if (discussion.userId.toString() !== userId && request.authUser?.role !== "admin") {
          return reply.status(403).send({
            success: false,
            message: "You can only delete your own discussions",
          });
        }

        await Discussion.deleteMany({
          $or: [{ _id: id }, { parentId: id }],
        });

        reply.send({
          success: true,
          message: "Discussion deleted successfully",
        });
      } catch (error) {
        fastify.log.error(error);
        reply.status(500).send({
          success: false,
          message: "Failed to delete discussion",
        });
      }
    }
  );

  /**
   * @route   POST /api/v1/discussions/:id/like
   * @desc    Like or unlike a discussion
   * @access  Private
   */
  fastify.post<{
    Params: { id: string };
  }>(
    "/:id/like",
    {
      preHandler: [authenticate],
      schema: {
        params: zodToJsonSchema(z.object({ id: z.string() })),
      },
    },
    async (request, reply) => {
      try {
        const userId = request.authUser?.id;
        const { id } = request.params;

        if (!userId) {
          return reply.status(401).send({ success: false, message: "Unauthorized" });
        }

        const discussion = await Discussion.findById(id);

        if (!discussion) {
          return reply.status(404).send({ success: false, message: "Discussion not found" });
        }

        const likeIndex = discussion.likes.findIndex(
          (likeId: string) => likeId.toString() === userId
        );

        if (likeIndex > -1) {
          discussion.likes.splice(likeIndex, 1);
        } else {
          discussion.likes.push(userId as never);
        }

        await discussion.save();

        reply.send({
          success: true,
          message: likeIndex > -1 ? "Discussion unliked" : "Discussion liked",
          likesCount: discussion.likes.length,
          likedByCurrentUser: likeIndex === -1,
        });
      } catch (error) {
        fastify.log.error(error);
        reply.status(500).send({
          success: false,
          message: "Failed to toggle like",
        });
      }
    }
  );

  /**
   * @route   POST /api/v1/discussions/:id/pin
   * @desc    Pin or unpin a discussion
   * @access  Private (admin only)
   */
  fastify.post<{
    Params: { id: string };
  }>(
    "/:id/pin",
    {
      preHandler: [authenticate],
      schema: {
        params: zodToJsonSchema(z.object({ id: z.string() })),
      },
    },
    async (request, reply) => {
      try {
        const { id } = request.params;

        if (request.authUser?.role !== "admin") {
          return reply.status(403).send({
            success: false,
            message: "Only admins can pin discussions",
          });
        }

        const discussion = await Discussion.findById(id);

        if (!discussion) {
          return reply.status(404).send({ success: false, message: "Discussion not found" });
        }

        discussion.isPinned = !discussion.isPinned;
        await discussion.save();

        reply.send({
          success: true,
          message: discussion.isPinned ? "Discussion pinned" : "Discussion unpinned",
          isPinned: discussion.isPinned,
        });
      } catch (error) {
        fastify.log.error(error);
        reply.status(500).send({
          success: false,
          message: "Failed to pin discussion",
        });
      }
    }
  );

  /**
   * @route   POST /api/v1/discussions/:id/best-answer
   * @desc    Mark discussion as best answer
   * @access  Private (question creator or admin)
   */
  fastify.post<{
    Params: { id: string };
  }>(
    "/:id/best-answer",
    {
      preHandler: [authenticate],
      schema: {
        params: zodToJsonSchema(z.object({ id: z.string() })),
      },
    },
    async (request, reply) => {
      try {
        const userId = request.authUser?.id;
        const { id } = request.params;

        if (!userId) {
          return reply.status(401).send({ success: false, message: "Unauthorized" });
        }

        const discussion = await Discussion.findById(id).populate("questionId");

        if (!discussion) {
          return reply.status(404).send({ success: false, message: "Discussion not found" });
        }

        const question = discussion.questionId as Record<string, unknown>;
        const isQuestionCreator = question?.createdBy?.toString() === userId;
        const isAdmin = request.authUser?.role === "admin";

        if (!isQuestionCreator && !isAdmin) {
          return reply.status(403).send({
            success: false,
            message: "Only question creator or admin can mark best answer",
          });
        }

        await Discussion.updateMany(
          { questionId: discussion.questionId, _id: { $ne: id } },
          { isBestAnswer: false }
        );

        discussion.isBestAnswer = !discussion.isBestAnswer;
        await discussion.save();

        reply.send({
          success: true,
          message: discussion.isBestAnswer ? "Marked as best answer" : "Removed best answer mark",
          isBestAnswer: discussion.isBestAnswer,
        });
      } catch (error) {
        fastify.log.error(error);
        reply.status(500).send({
          success: false,
          message: "Failed to mark best answer",
        });
      }
    }
  );

  /**
   * @route   POST /api/v1/discussions/:id/report
   * @desc    Report a discussion
   * @access  Private
   */
  fastify.post<{
    Params: { id: string };
    Body: z.infer<typeof reportDiscussionSchema>;
  }>(
    "/:id/report",
    {
      preHandler: [authenticate],
      schema: {
        params: zodToJsonSchema(z.object({ id: z.string() })),
        body: zodToJsonSchema(reportDiscussionSchema),
      },
      config: {
        rateLimit: {
          max: 5,
          timeWindow: "15 minutes",
        },
      },
    },
    async (request, reply) => {
      try {
        const userId = request.authUser?.id;
        const { id } = request.params;
        const { reason } = request.body;

        if (!userId) {
          return reply.status(401).send({ success: false, message: "Unauthorized" });
        }

        const discussion = await Discussion.findById(id);

        if (!discussion) {
          return reply.status(404).send({ success: false, message: "Discussion not found" });
        }

        discussion.reportCount += 1;

        if (discussion.reportCount >= 5) {
          discussion.isReported = true;
        }

        await discussion.save();

        fastify.log.info(`Discussion ${id} reported by ${userId}. Reason: ${reason}`);

        reply.send({
          success: true,
          message: "Discussion reported successfully",
          reportCount: discussion.reportCount,
          isReported: discussion.isReported,
        });
      } catch (error) {
        fastify.log.error(error);
        reply.status(500).send({
          success: false,
          message: "Failed to report discussion",
        });
      }
    }
  );

  /**
   * @route   GET /api/v1/discussions/user/:userId
   * @desc    Get all discussions by a user
   * @access  Public
   */
  fastify.get<{
    Params: { userId: string };
    Querystring: { page?: string; limit?: string };
  }>(
    "/user/:userId",
    {
      schema: {
        params: zodToJsonSchema(z.object({ userId: z.string() })),
        querystring: zodToJsonSchema(
          z.object({
            page: z.string().optional(),
            limit: z.string().optional(),
          })
        ),
      },
    },
    async (request, reply) => {
      try {
        const { userId } = request.params;
        const page = parseInt(request.query.page || "1");
        const limit = parseInt(request.query.limit || "20");
        const skip = (page - 1) * limit;

        const discussions = await Discussion.find({ userId })
          .populate("questionId", "title framework difficulty")
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .lean();

        const total = await Discussion.countDocuments({ userId });

        reply.send({
          success: true,
          discussions: (discussions as LeanDiscussion[]).map((d) => ({
            ...d,
            likesCount: d.likes?.length || 0,
          })),
          pagination: {
            page,
            limit,
            total,
            hasMore: skip + discussions.length < total,
          },
        });
      } catch (error) {
        fastify.log.error(error);
        reply.status(500).send({
          success: false,
          message: "Failed to fetch user discussions",
        });
      }
    }
  );
}
