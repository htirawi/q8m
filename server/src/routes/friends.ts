import { authenticate } from "@middlewares/auth.middleware.js";
import { User } from "@models/User.js";
import { UserConnection } from "@models/UserConnection.js";
import type { LeanUserConnection, PopulatedUser } from "@server/types/route-helpers";
import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";

// Validation schemas
const friendRequestSchema = z.object({
  friendId: z.string().min(1),
});

const searchQuerySchema = z.object({
  q: z.string().optional(),
  query: z.string().optional(),
  page: z.string().optional(),
  limit: z.string().optional(),
});

const suggestionsQuerySchema = z.object({
  limit: z.string().optional(),
});

const paginationQuerySchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
});

export default async function friendRoutes(fastify: FastifyInstance) {
  /**
   * @route   POST /api/v1/friends/request
   * @desc    Send a friend request
   * @access  Private
   */
  fastify.post<{
    Body: z.infer<typeof friendRequestSchema>;
  }>(
    "/request",
    {
      preHandler: [authenticate],
      schema: {
        body: zodToJsonSchema(friendRequestSchema),
      },
      config: {
        rateLimit: {
          max: 20,
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

        const { friendId } = friendRequestSchema.parse(request.body);

        // Validate not sending request to self
        if (userId === friendId) {
          return reply.status(400).send({
            success: false,
            message: "Cannot send friend request to yourself",
          });
        }

        // Check if friend exists
        const friendUser = await User.findById(friendId);
        if (!friendUser) {
          return reply.status(404).send({ success: false, message: "User not found" });
        }

        // Check existing connection
        const existingConnection = await UserConnection.findOne({
          userId,
          friendId,
        });

        if (existingConnection) {
          if (existingConnection.status === "accepted") {
            return reply.status(400).send({
              success: false,
              message: "Already friends",
            });
          }
          if (existingConnection.status === "pending") {
            return reply.status(400).send({
              success: false,
              message: "Friend request already sent",
            });
          }
          if (existingConnection.status === "blocked") {
            return reply.status(403).send({
              success: false,
              message: "Cannot send request to blocked user",
            });
          }
        }

        // Create bidirectional connections
        await UserConnection.create([
          {
            userId,
            friendId,
            status: "pending",
            initiatedBy: userId,
          },
          {
            userId: friendId,
            friendId: userId,
            status: "pending",
            initiatedBy: userId,
          },
        ]);

        reply.status(201).send({
          success: true,
          message: "Friend request sent",
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
          message: "Failed to send friend request",
        });
      }
    }
  );

  /**
   * @route   PUT /api/v1/friends/accept/:friendId
   * @desc    Accept a friend request
   * @access  Private
   */
  fastify.put<{
    Params: { friendId: string };
  }>(
    "/accept/:friendId",
    {
      preHandler: [authenticate],
      schema: {
        params: zodToJsonSchema(z.object({ friendId: z.string() })),
      },
    },
    async (request, reply) => {
      try {
        const userId = request.authUser?.id;
        const { friendId } = request.params;

        if (!userId) {
          return reply.status(401).send({ success: false, message: "Unauthorized" });
        }

        // Find pending request where current user is recipient
        const connection = await UserConnection.findOne({
          userId,
          friendId,
          status: "pending",
          initiatedBy: friendId, // Request was sent by friendId
        });

        if (!connection) {
          return reply.status(404).send({
            success: false,
            message: "Friend request not found",
          });
        }

        // Update both connections to accepted
        await UserConnection.updateMany(
          {
            $or: [
              { userId, friendId },
              { userId: friendId, friendId: userId },
            ],
          },
          {
            status: "accepted",
            acceptedAt: new Date(),
          }
        );

        reply.send({
          success: true,
          message: "Friend request accepted",
        });
      } catch (error) {
        fastify.log.error(error);
        reply.status(500).send({
          success: false,
          message: "Failed to accept friend request",
        });
      }
    }
  );

  /**
   * @route   DELETE /api/v1/friends/reject/:friendId
   * @desc    Reject/cancel a friend request
   * @access  Private
   */
  fastify.delete<{
    Params: { friendId: string };
  }>(
    "/reject/:friendId",
    {
      preHandler: [authenticate],
      schema: {
        params: zodToJsonSchema(z.object({ friendId: z.string() })),
      },
    },
    async (request, reply) => {
      try {
        const userId = request.authUser?.id;
        const { friendId } = request.params;

        if (!userId) {
          return reply.status(401).send({ success: false, message: "Unauthorized" });
        }

        // Delete both pending connections
        const result = await UserConnection.deleteMany({
          $or: [
            { userId, friendId, status: "pending" },
            { userId: friendId, friendId: userId, status: "pending" },
          ],
        });

        if (result.deletedCount === 0) {
          return reply.status(404).send({
            success: false,
            message: "Friend request not found",
          });
        }

        reply.send({
          success: true,
          message: "Friend request rejected",
        });
      } catch (error) {
        fastify.log.error(error);
        reply.status(500).send({
          success: false,
          message: "Failed to reject friend request",
        });
      }
    }
  );

  /**
   * @route   DELETE /api/v1/friends/:friendId
   * @desc    Remove a friend
   * @access  Private
   */
  fastify.delete<{
    Params: { friendId: string };
  }>(
    "/:friendId",
    {
      preHandler: [authenticate],
      schema: {
        params: zodToJsonSchema(z.object({ friendId: z.string() })),
      },
    },
    async (request, reply) => {
      try {
        const userId = request.authUser?.id;
        const { friendId } = request.params;

        if (!userId) {
          return reply.status(401).send({ success: false, message: "Unauthorized" });
        }

        // Delete both connections
        const result = await UserConnection.deleteMany({
          $or: [
            { userId, friendId, status: "accepted" },
            { userId: friendId, friendId: userId, status: "accepted" },
          ],
        });

        if (result.deletedCount === 0) {
          return reply.status(404).send({
            success: false,
            message: "Friendship not found",
          });
        }

        reply.send({
          success: true,
          message: "Friend removed",
        });
      } catch (error) {
        fastify.log.error(error);
        reply.status(500).send({
          success: false,
          message: "Failed to remove friend",
        });
      }
    }
  );

  /**
   * @route   GET /api/v1/friends
   * @desc    Get all friends (accepted connections)
   * @access  Private
   */
  fastify.get<{
    Querystring: z.infer<typeof paginationQuerySchema>;
  }>(
    "/",
    {
      preHandler: [authenticate],
      schema: {
        querystring: zodToJsonSchema(paginationQuerySchema),
      },
    },
    async (request, reply) => {
      try {
        const userId = request.authUser?.id;
        if (!userId) {
          return reply.status(401).send({ success: false, message: "Unauthorized" });
        }

        const page = parseInt(request.query.page || "1");
        const limit = Math.min(parseInt(request.query.limit || "20"), 50);
        const skip = (page - 1) * limit;

        // Get accepted friend connections
        const connections = await UserConnection.find({
          userId,
          status: "accepted",
        })
          .skip(skip)
          .limit(limit)
          .lean();

        // Get friend user details
        const friendIds = (connections as LeanUserConnection[]).map((c) => c.friendId);
        const friends = await User.find({ _id: { $in: friendIds } })
          .select("name email avatar gamification createdAt")
          .lean();

        const total = await UserConnection.countDocuments({ userId, status: "accepted" });

        reply.send({
          success: true,
          friends: (friends as PopulatedUser[]).map((friend) => ({
            _id: friend._id.toString(),
            name: friend.name,
            email: friend.email || "",
            avatar: friend.avatar || "",
            level: friend.gamification?.level || 0,
            xp: friend.gamification?.xp || 0,
            friendsSince: (connections as LeanUserConnection[]).find(
              (c) => c.friendId.toString() === friend._id.toString()
            )?.createdAt,
          })),
          pagination: {
            page,
            limit,
            total,
            hasMore: skip + friends.length < total,
          },
        });
      } catch (error) {
        fastify.log.error(error);
        reply.status(500).send({
          success: false,
          message: "Failed to fetch friends",
        });
      }
    }
  );

  /**
   * @route   GET /api/v1/friends/requests/received
   * @desc    Get received friend requests (pending)
   * @access  Private
   */
  fastify.get(
    "/requests/received",
    {
      preHandler: [authenticate],
    },
    async (request, reply) => {
      try {
        const userId = request.authUser?.id;
        if (!userId) {
          return reply.status(401).send({ success: false, message: "Unauthorized" });
        }

        // Find pending requests where current user is recipient
        const connections = await UserConnection.find({
          userId,
          status: "pending",
          initiatedBy: { $ne: userId }, // Not initiated by current user
        }).lean();

        const senderIds = (connections as LeanUserConnection[]).map((c) => c.friendId);
        const senders = await User.find({ _id: { $in: senderIds } })
          .select("name email avatar gamification")
          .lean();

        reply.send({
          success: true,
          requests: (senders as PopulatedUser[]).map((sender) => ({
            _id: sender._id.toString(),
            name: sender.name,
            email: sender.email || "",
            avatar: sender.avatar || "",
            level: sender.gamification?.level || 0,
            xp: sender.gamification?.xp || 0,
            requestedAt: (connections as LeanUserConnection[]).find(
              (c) => c.friendId.toString() === sender._id.toString()
            )?.createdAt,
          })),
        });
      } catch (error) {
        fastify.log.error(error);
        reply.status(500).send({
          success: false,
          message: "Failed to fetch received requests",
        });
      }
    }
  );

  /**
   * @route   GET /api/v1/friends/requests/sent
   * @desc    Get sent friend requests (waiting for acceptance)
   * @access  Private
   */
  fastify.get(
    "/requests/sent",
    {
      preHandler: [authenticate],
    },
    async (request, reply) => {
      try {
        const userId = request.authUser?.id;
        if (!userId) {
          return reply.status(401).send({ success: false, message: "Unauthorized" });
        }

        // Find pending requests initiated by current user
        const connections = await UserConnection.find({
          userId,
          status: "pending",
          initiatedBy: userId,
        }).lean();

        const recipientIds = connections.map((c: LeanUserConnection) => c.friendId);
        const recipients = await User.find({ _id: { $in: recipientIds } })
          .select("name email avatar gamification")
          .lean();

        reply.send({
          success: true,
          requests: recipients.map((recipient: PopulatedUser) => ({
            _id: recipient._id.toString(),
            name: recipient.name,
            email: recipient.email,
            avatar: recipient.avatar,
            level: recipient.gamification?.level || 0,
            xp: recipient.gamification?.xp || 0,
            sentAt: connections.find(
              (c: LeanUserConnection) => c.friendId.toString() === recipient._id.toString()
            )?.createdAt,
          })),
        });
      } catch (error) {
        fastify.log.error(error);
        reply.status(500).send({
          success: false,
          message: "Failed to fetch sent requests",
        });
      }
    }
  );

  /**
   * @route   POST /api/v1/friends/block/:friendId
   * @desc    Block a user
   * @access  Private
   */
  fastify.post<{
    Params: { friendId: string };
  }>(
    "/block/:friendId",
    {
      preHandler: [authenticate],
      schema: {
        params: zodToJsonSchema(z.object({ friendId: z.string() })),
      },
    },
    async (request, reply) => {
      try {
        const userId = request.authUser?.id;
        const { friendId } = request.params;

        if (!userId) {
          return reply.status(401).send({ success: false, message: "Unauthorized" });
        }

        if (userId === friendId) {
          return reply.status(400).send({
            success: false,
            message: "Cannot block yourself",
          });
        }

        // Remove any existing connections
        await UserConnection.deleteMany({
          $or: [
            { userId, friendId },
            { userId: friendId, friendId: userId },
          ],
        });

        // Create blocked connection (one-way)
        await UserConnection.create({
          userId,
          friendId,
          status: "blocked",
          initiatedBy: userId,
        });

        reply.send({
          success: true,
          message: "User blocked",
        });
      } catch (error) {
        fastify.log.error(error);
        reply.status(500).send({
          success: false,
          message: "Failed to block user",
        });
      }
    }
  );

  /**
   * @route   DELETE /api/v1/friends/block/:friendId
   * @desc    Unblock a user
   * @access  Private
   */
  fastify.delete<{
    Params: { friendId: string };
  }>(
    "/block/:friendId",
    {
      preHandler: [authenticate],
      schema: {
        params: zodToJsonSchema(z.object({ friendId: z.string() })),
      },
    },
    async (request, reply) => {
      try {
        const userId = request.authUser?.id;
        const { friendId } = request.params;

        if (!userId) {
          return reply.status(401).send({ success: false, message: "Unauthorized" });
        }

        const result = await UserConnection.deleteOne({
          userId,
          friendId,
          status: "blocked",
        });

        if (result.deletedCount === 0) {
          return reply.status(404).send({
            success: false,
            message: "Block not found",
          });
        }

        reply.send({
          success: true,
          message: "User unblocked",
        });
      } catch (error) {
        fastify.log.error(error);
        reply.status(500).send({
          success: false,
          message: "Failed to unblock user",
        });
      }
    }
  );

  /**
   * @route   GET /api/v1/friends/blocked
   * @desc    Get blocked users
   * @access  Private
   */
  fastify.get(
    "/blocked",
    {
      preHandler: [authenticate],
    },
    async (request, reply) => {
      try {
        const userId = request.authUser?.id;
        if (!userId) {
          return reply.status(401).send({ success: false, message: "Unauthorized" });
        }

        const connections = await UserConnection.find({
          userId,
          status: "blocked",
        }).lean();

        const blockedIds = connections.map((c: LeanUserConnection) => c.friendId);
        const blocked = await User.find({ _id: { $in: blockedIds } })
          .select("name email avatar gamification")
          .lean();

        reply.send({
          success: true,
          blocked: blocked.map((user: PopulatedUser) => ({
            _id: user._id.toString(),
            name: user.name,
            email: user.email,
            avatar: user.avatar,
            level: user.gamification?.level || 0,
            xp: user.gamification?.xp || 0,
            blockedAt: connections.find(
              (c: LeanUserConnection) => c.friendId.toString() === user._id.toString()
            )?.createdAt,
          })),
        });
      } catch (error) {
        fastify.log.error(error);
        reply.status(500).send({
          success: false,
          message: "Failed to fetch blocked users",
        });
      }
    }
  );

  /**
   * @route   GET /api/v1/friends/search
   * @desc    Search users (excluding friends and blocked)
   * @access  Private
   */
  fastify.get<{
    Querystring: z.infer<typeof searchQuerySchema>;
  }>(
    "/search",
    {
      preHandler: [authenticate],
      schema: {
        querystring: zodToJsonSchema(searchQuerySchema),
      },
    },
    async (request, reply) => {
      try {
        const userId = request.authUser?.id;
        if (!userId) {
          return reply.status(401).send({ success: false, message: "Unauthorized" });
        }

        const searchTerm = request.query.q || request.query.query || "";
        const page = parseInt(request.query.page || "1");
        const limit = Math.min(parseInt(request.query.limit || "20"), 50);
        const skip = (page - 1) * limit;

        if (!searchTerm || searchTerm.length < 2) {
          return reply.status(400).send({
            success: false,
            message: "Search term must be at least 2 characters",
          });
        }

        // Get existing connections
        const existingConnections = await UserConnection.find({ userId }).lean();
        const excludeIds = [
          userId,
          ...existingConnections.map((c: LeanUserConnection) => c.friendId.toString()),
        ];

        // Search users
        const users = await User.find({
          _id: { $nin: excludeIds },
          $or: [
            { name: { $regex: searchTerm, $options: "i" } },
            { email: { $regex: searchTerm, $options: "i" } },
          ],
        })
          .select("name email avatar gamification")
          .skip(skip)
          .limit(limit)
          .lean();

        const total = await User.countDocuments({
          _id: { $nin: excludeIds },
          $or: [
            { name: { $regex: searchTerm, $options: "i" } },
            { email: { $regex: searchTerm, $options: "i" } },
          ],
        });

        reply.send({
          success: true,
          users: users.map((user: PopulatedUser) => ({
            _id: user._id.toString(),
            name: user.name,
            email: user.email,
            avatar: user.avatar,
            level: user.gamification?.level || 0,
            xp: user.gamification?.xp || 0,
          })),
          pagination: {
            page,
            limit,
            total,
            hasMore: skip + users.length < total,
          },
        });
      } catch (error) {
        fastify.log.error(error);
        reply.status(500).send({
          success: false,
          message: "Failed to search users",
        });
      }
    }
  );

  /**
   * @route   GET /api/v1/friends/suggestions
   * @desc    Get friend suggestions (users with mutual friends)
   * @access  Private
   */
  fastify.get<{
    Querystring: z.infer<typeof suggestionsQuerySchema>;
  }>(
    "/suggestions",
    {
      preHandler: [authenticate],
      schema: {
        querystring: zodToJsonSchema(suggestionsQuerySchema),
      },
    },
    async (request, reply) => {
      try {
        const userId = request.authUser?.id;
        if (!userId) {
          return reply.status(401).send({ success: false, message: "Unauthorized" });
        }

        const limit = Math.min(parseInt(request.query.limit || "10"), 20);

        // Get user's friends
        const friendConnections = await UserConnection.find({
          userId,
          status: "accepted",
        }).lean();

        const friendIds = friendConnections.map((c: LeanUserConnection) => c.friendId);

        // Get existing connections to exclude
        const allConnections = await UserConnection.find({ userId }).lean();
        const excludeIds = [
          userId,
          ...allConnections.map((c: LeanUserConnection) => c.friendId.toString()),
        ];

        // Find friends of friends (mutual connections)
        const suggestions = await UserConnection.aggregate([
          {
            $match: {
              userId: { $in: friendIds },
              status: "accepted",
              friendId: { $nin: excludeIds.map((id: string) => id) },
            },
          },
          {
            $group: {
              _id: "$friendId",
              mutualFriends: { $sum: 1 },
            },
          },
          { $sort: { mutualFriends: -1 } },
          { $limit: limit },
        ]);

        type SuggestionData = { _id: string; mutualFriends: number };
        const suggestionIds = (suggestions as SuggestionData[]).map((s) => s._id);
        const users = await User.find({ _id: { $in: suggestionIds } })
          .select("name email avatar gamification")
          .lean();

        reply.send({
          success: true,
          suggestions: (users as PopulatedUser[]).map((user) => {
            const suggestion = (suggestions as SuggestionData[]).find(
              (s) => s._id.toString() === user._id.toString()
            );
            return {
              _id: user._id.toString(),
              name: user.name,
              email: user.email || "",
              avatar: user.avatar || "",
              level: user.gamification?.level || 0,
              xp: user.gamification?.xp || 0,
              mutualFriends: suggestion?.mutualFriends || 0,
            };
          }),
        });
      } catch (error) {
        fastify.log.error(error);
        reply.status(500).send({
          success: false,
          message: "Failed to fetch suggestions",
        });
      }
    }
  );

  /**
   * @route   GET /api/v1/friends/status/:friendId
   * @desc    Get friendship status with a specific user
   * @access  Private
   */
  fastify.get<{
    Params: { friendId: string };
  }>(
    "/status/:friendId",
    {
      preHandler: [authenticate],
      schema: {
        params: zodToJsonSchema(z.object({ friendId: z.string() })),
      },
    },
    async (request, reply) => {
      try {
        const userId = request.authUser?.id;
        const { friendId } = request.params;

        if (!userId) {
          return reply.status(401).send({ success: false, message: "Unauthorized" });
        }

        const connection = await UserConnection.findOne({
          userId,
          friendId,
        }).lean();

        if (!connection) {
          return reply.send({
            success: true,
            status: "none",
            canAccept: false,
            canCancel: false,
          });
        }

        const { status } = connection;
        const canAccept = status === "pending" && connection.initiatedBy?.toString() !== userId;
        const canCancel = status === "pending" && connection.initiatedBy?.toString() === userId;

        reply.send({
          success: true,
          status,
          canAccept,
          canCancel,
        });
      } catch (error) {
        fastify.log.error(error);
        reply.status(500).send({
          success: false,
          message: "Failed to fetch friendship status",
        });
      }
    }
  );
}
