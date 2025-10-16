import { authenticate } from "@middlewares/auth.middleware.js";
import { Challenge } from "@models/Challenge.js";
import { Question } from "@models/Question.js";
import { UserConnection } from "@models/UserConnection.js";
import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";

// Validation schemas
const createChallengeSchema = z.object({
  challengedUserId: z.string().min(1),
  difficulty: z.enum(["easy", "medium", "hard"]),
  framework: z.enum(["angular", "react", "nextjs", "redux", "random"]).optional(),
  questionCount: z.number().min(1).max(20).default(10),
  timeLimit: z.number().min(60).max(3600).default(600),
  message: z.string().max(200).optional(),
});

const submitChallengeSchema = z.object({
  answers: z.array(
    z.object({
      questionId: z.string(),
      answer: z.union([z.string(), z.array(z.string())]),
      correct: z.boolean(),
      timeSpent: z.number().min(0),
    })
  ),
  score: z.number().min(0).max(100),
  time: z.number().min(0),
});

export default async function challengeRoutes(fastify: FastifyInstance) {
  /**
   * @route   POST /api/v1/challenges
   * @desc    Send a challenge to another user
   * @access  Private
   */
  fastify.post<{
    Body: z.infer<typeof createChallengeSchema>;
  }>(
    "/",
    {
      preHandler: [authenticate],
      schema: {
        body: zodToJsonSchema(createChallengeSchema),
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

        const validatedData = createChallengeSchema.parse(request.body);

        // Check if users are friends
        const friendship = await UserConnection.findOne({
          userId,
          friendId: validatedData.challengedUserId,
          status: "accepted",
        });

        if (!friendship) {
          return reply.status(403).send({
            success: false,
            message: "You can only challenge your friends",
          });
        }

        // Check if challenged user is same as challenger
        if (validatedData.challengedUserId === userId) {
          return reply.status(400).send({
            success: false,
            message: "You cannot challenge yourself",
          });
        }

        // Build question filter
        const questionFilter: { difficulty: string; framework?: string } = {
          difficulty: validatedData.difficulty,
        };

        if (validatedData.framework && validatedData.framework !== "random") {
          questionFilter.framework = validatedData.framework;
        }

        // Get random questions matching criteria
        const questions = await Question.aggregate([
          { $match: questionFilter },
          { $sample: { size: validatedData.questionCount } },
        ]);

        if (questions.length < validatedData.questionCount) {
          return reply.status(400).send({
            success: false,
            message: `Not enough questions available. Found ${questions.length}, need ${validatedData.questionCount}`,
          });
        }

        // Create challenge with 24 hour expiry
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 24);

        const challenge = await Challenge.create({
          challengerId: userId,
          challengedUserId: validatedData.challengedUserId,
          difficulty: validatedData.difficulty,
          framework: validatedData.framework,
          questionCount: validatedData.questionCount,
          timeLimit: validatedData.timeLimit,
          questions: questions.map((q: { _id: string }) => q._id),
          message: validatedData.message,
          expiresAt,
          status: "pending",
        });

        const populatedChallenge = await Challenge.findById(challenge._id)
          .populate("challengerId", "name avatar gamification.level")
          .populate("challengedUserId", "name avatar gamification.level")
          .lean();

        reply.status(201).send({
          success: true,
          message: "Challenge sent successfully",
          challenge: populatedChallenge,
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
          message: "Failed to create challenge",
        });
      }
    }
  );

  /**
   * @route   PUT /api/v1/challenges/:id/accept
   * @desc    Accept a challenge
   * @access  Private
   */
  fastify.put<{
    Params: { id: string };
  }>(
    "/:id/accept",
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

        const challenge = await Challenge.findById(id);

        if (!challenge) {
          return reply.status(404).send({ success: false, message: "Challenge not found" });
        }

        if (challenge.challengedUserId.toString() !== userId) {
          return reply.status(403).send({
            success: false,
            message: "You can only accept challenges sent to you",
          });
        }

        if (challenge.status !== "pending") {
          return reply.status(400).send({
            success: false,
            message: `Challenge is already ${challenge.status}`,
          });
        }

        if (new Date() > challenge.expiresAt) {
          challenge.status = "expired";
          await challenge.save();
          return reply.status(400).send({
            success: false,
            message: "Challenge has expired",
          });
        }

        challenge.status = "accepted";
        await challenge.save();

        const populatedChallenge = await Challenge.findById(challenge._id)
          .populate("challengerId", "name avatar gamification.level")
          .populate("challengedUserId", "name avatar gamification.level")
          .populate("questions", "title type options framework difficulty")
          .lean();

        reply.send({
          success: true,
          message: "Challenge accepted",
          challenge: populatedChallenge,
        });
      } catch (error) {
        fastify.log.error(error);
        reply.status(500).send({
          success: false,
          message: "Failed to accept challenge",
        });
      }
    }
  );

  /**
   * @route   PUT /api/v1/challenges/:id/reject
   * @desc    Reject a challenge
   * @access  Private
   */
  fastify.put<{
    Params: { id: string };
  }>(
    "/:id/reject",
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

        const challenge = await Challenge.findById(id);

        if (!challenge) {
          return reply.status(404).send({ success: false, message: "Challenge not found" });
        }

        if (challenge.challengedUserId.toString() !== userId) {
          return reply.status(403).send({
            success: false,
            message: "You can only reject challenges sent to you",
          });
        }

        if (challenge.status !== "pending") {
          return reply.status(400).send({
            success: false,
            message: `Challenge is already ${challenge.status}`,
          });
        }

        challenge.status = "rejected";
        await challenge.save();

        reply.send({
          success: true,
          message: "Challenge rejected",
        });
      } catch (error) {
        fastify.log.error(error);
        reply.status(500).send({
          success: false,
          message: "Failed to reject challenge",
        });
      }
    }
  );

  /**
   * @route   POST /api/v1/challenges/:id/submit
   * @desc    Submit challenge results
   * @access  Private
   */
  fastify.post<{
    Params: { id: string };
    Body: z.infer<typeof submitChallengeSchema>;
  }>(
    "/:id/submit",
    {
      preHandler: [authenticate],
      schema: {
        params: zodToJsonSchema(z.object({ id: z.string() })),
        body: zodToJsonSchema(submitChallengeSchema),
      },
    },
    async (request, reply) => {
      try {
        const userId = request.authUser?.id;
        const { id } = request.params;

        if (!userId) {
          return reply.status(401).send({ success: false, message: "Unauthorized" });
        }

        const validatedData = submitChallengeSchema.parse(request.body);
        const challenge = await Challenge.findById(id);

        if (!challenge) {
          return reply.status(404).send({ success: false, message: "Challenge not found" });
        }

        const isChallenger = challenge.challengerId.toString() === userId;
        const isChallenged = challenge.challengedUserId.toString() === userId;

        if (!isChallenger && !isChallenged) {
          return reply.status(403).send({
            success: false,
            message: "You are not part of this challenge",
          });
        }

        if (challenge.status === "pending") {
          return reply.status(400).send({
            success: false,
            message: "Challenge must be accepted before submitting results",
          });
        }

        if (challenge.status !== "accepted" && challenge.status !== "completed") {
          return reply.status(400).send({
            success: false,
            message: `Cannot submit results for ${challenge.status} challenge`,
          });
        }

        // Update results for the appropriate user
        if (isChallenger) {
          if (challenge.challengerScore !== undefined) {
            return reply.status(400).send({
              success: false,
              message: "You have already submitted your results",
            });
          }

          challenge.challengerScore = validatedData.score;
          challenge.challengerTime = validatedData.time;
          challenge.challengerAnswers = validatedData.answers as never[];
          challenge.challengerCompletedAt = new Date();
        } else {
          if (challenge.challengedScore !== undefined) {
            return reply.status(400).send({
              success: false,
              message: "You have already submitted your results",
            });
          }

          challenge.challengedScore = validatedData.score;
          challenge.challengedTime = validatedData.time;
          challenge.challengedAnswers = validatedData.answers as never[];
          challenge.challengedCompletedAt = new Date();
        }

        // If both users have submitted, mark as completed and determine winner
        if (challenge.challengerScore !== undefined && challenge.challengedScore !== undefined) {
          challenge.status = "completed";
          challenge.completedAt = new Date();
          challenge.determineWinner();
        }

        await challenge.save();

        const populatedChallenge = await Challenge.findById(challenge._id)
          .populate("challengerId", "name avatar gamification.level")
          .populate("challengedUserId", "name avatar gamification.level")
          .lean();

        reply.send({
          success: true,
          message: "Results submitted successfully",
          challenge: populatedChallenge,
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
          message: "Failed to submit results",
        });
      }
    }
  );

  /**
   * @route   GET /api/v1/challenges
   * @desc    Get user's challenges
   * @access  Private
   */
  fastify.get<{
    Querystring: {
      status?: string;
      page?: string;
      limit?: string;
    };
  }>(
    "/",
    {
      preHandler: [authenticate],
      schema: {
        querystring: zodToJsonSchema(
          z.object({
            status: z.string().optional(),
            page: z.string().optional(),
            limit: z.string().optional(),
          })
        ),
      },
    },
    async (request, reply) => {
      try {
        const userId = request.authUser?.id;
        if (!userId) {
          return reply.status(401).send({ success: false, message: "Unauthorized" });
        }

        const page = parseInt(request.query.page || "1");
        const limit = parseInt(request.query.limit || "20");
        const skip = (page - 1) * limit;

        const filter: { $or: Array<Record<string, string>>; status?: string } = {
          $or: [{ challengerId: userId }, { challengedUserId: userId }],
        };

        if (request.query.status) {
          filter.status = request.query.status;
        }

        const challenges = await Challenge.find(filter)
          .populate("challengerId", "name avatar gamification.level")
          .populate("challengedUserId", "name avatar gamification.level")
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .lean();

        const total = await Challenge.countDocuments(filter);

        reply.send({
          success: true,
          challenges,
          pagination: {
            page,
            limit,
            total,
            hasMore: skip + challenges.length < total,
          },
        });
      } catch (error) {
        fastify.log.error(error);
        reply.status(500).send({
          success: false,
          message: "Failed to fetch challenges",
        });
      }
    }
  );

  /**
   * @route   GET /api/v1/challenges/:id
   * @desc    Get challenge details
   * @access  Private
   */
  fastify.get<{
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

        const challenge = await Challenge.findById(id)
          .populate("challengerId", "name avatar gamification.level")
          .populate("challengedUserId", "name avatar gamification.level")
          .populate("questions", "title type options framework difficulty correctAnswer")
          .lean();

        if (!challenge) {
          return reply.status(404).send({ success: false, message: "Challenge not found" });
        }

        const challengeData = challenge as {
          _id: string;
          challengerId: { _id: { toString(): string } };
          challengedUserId: { _id: { toString(): string } };
          status: string;
          challengerAnswers?: unknown[];
          challengedAnswers?: unknown[];
        };

        const isChallenger = challengeData.challengerId._id.toString() === userId;
        const isChallenged = challengeData.challengedUserId._id.toString() === userId;

        if (!isChallenger && !isChallenged) {
          return reply.status(403).send({
            success: false,
            message: "You are not part of this challenge",
          });
        }

        // Hide opponent's answers until both have submitted
        const challengeResponse = { ...challenge } as Record<string, unknown>;
        if (challengeData.status !== "completed") {
          if (isChallenger) {
            delete challengeResponse.challengedAnswers;
          } else {
            delete challengeResponse.challengerAnswers;
          }
        }

        reply.send({
          success: true,
          challenge: challengeResponse,
        });
      } catch (error) {
        fastify.log.error(error);
        reply.status(500).send({
          success: false,
          message: "Failed to fetch challenge",
        });
      }
    }
  );

  /**
   * @route   GET /api/v1/challenges/history/stats
   * @desc    Get challenge history and stats
   * @access  Private
   */
  fastify.get(
    "/history/stats",
    {
      preHandler: [authenticate],
    },
    async (request, reply) => {
      try {
        const userId = request.authUser?.id;
        if (!userId) {
          return reply.status(401).send({ success: false, message: "Unauthorized" });
        }

        const completedChallenges = await Challenge.find({
          $or: [{ challengerId: userId }, { challengedUserId: userId }],
          status: "completed",
        }).lean();

        type ChallengeData = {
          _id: string;
          challengerId: string;
          challengedUserId: string;
          status: string;
          winnerId?: string;
          isTie?: boolean;
          challengerScore?: number;
          challengedScore?: number;
        };

        const stats = {
          totalChallenges: completedChallenges.length,
          wins: (completedChallenges as ChallengeData[]).filter(
            (c) => c.winnerId?.toString() === userId
          ).length,
          losses: (completedChallenges as ChallengeData[]).filter(
            (c) => c.winnerId && c.winnerId.toString() !== userId && !c.isTie
          ).length,
          ties: (completedChallenges as ChallengeData[]).filter((c) => c.isTie).length,
          averageScore: 0,
          bestScore: 0,
        };

        // Calculate average and best score
        const userScores = (completedChallenges as ChallengeData[]).map((c) => {
          return c.challengerId.toString() === userId ? c.challengerScore : c.challengedScore;
        });

        if (userScores.length > 0) {
          stats.averageScore =
            userScores.reduce((sum: number, score: number | undefined) => sum + (score ?? 0), 0) /
            userScores.length;
          stats.bestScore = Math.max(
            ...userScores.filter(
              (s: number | undefined): s is number => s !== undefined && s !== null
            )
          );
        }

        reply.send({
          success: true,
          stats,
        });
      } catch (error) {
        fastify.log.error(error);
        reply.status(500).send({
          success: false,
          message: "Failed to fetch challenge stats",
        });
      }
    }
  );
}
