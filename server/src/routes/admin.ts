import type { FastifyInstance } from "fastify";
import { z } from "zod";

export default async function adminRoutes(fastify: FastifyInstance) {
  // Get admin dashboard stats
  fastify.get(
    "/dashboard",
    {
      preHandler: [fastify.requireRole("admin")],
    },
    async (_request, reply) => {
      // TODO: Implement admin dashboard stats
      reply.send({
        totalUsers: 1250,
        activeUsers: 890,
        totalRevenue: 15680,
        monthlyRevenue: 3200,
        totalQuestions: 500,
        recentSignups: [
          {
            id: "user-1",
            name: "John Doe",
            email: "john@example.com",
            createdAt: new Date().toISOString(),
          },
        ],
        recentPayments: [
          {
            id: "payment-1",
            amount: 49,
            currency: "USD",
            tier: "senior",
            createdAt: new Date().toISOString(),
          },
        ],
      });
    }
  );

  // Get all users
  fastify.get(
    "/users",
    {
      preHandler: [fastify.requireRole("admin")],
      schema: {
        querystring: z.object({
          limit: z.string().transform(Number).optional().default("20"),
          offset: z.string().transform(Number).optional().default("0"),
          search: z.string().optional(),
          role: z.enum(["user", "admin"]).optional(),
        }),
      },
    },
    async (request, reply) => {
      const { limit, offset } = request.query as unknown;

      // TODO: Implement real user fetching
      reply.send({
        users: [
          {
            id: "user-1",
            name: "John Doe",
            email: "john@example.com",
            role: "user",
            isEmailVerified: true,
            createdAt: new Date().toISOString(),
          },
        ],
        total: 1,
        limit,
        offset,
      });
    }
  );

  // Get user by ID
  fastify.get(
    "/users/:userId",
    {
      preHandler: [fastify.requireRole("admin")],
      schema: {
        params: z.object({
          userId: z.string(),
        }),
      },
    },
    async (request, reply) => {
      const { userId } = request.params as { userId: string };

      // TODO: Implement real user fetching
      reply.send({
        id: userId,
        name: "John Doe",
        email: "john@example.com",
        role: "user",
        isEmailVerified: true,
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
      });
    }
  );

  // Update user role
  fastify.patch(
    "/users/:userId/role",
    {
      preHandler: [fastify.requireRole("admin")],
      schema: {
        params: z.object({
          userId: z.string(),
        }),
        body: z.object({
          role: z.enum(["user", "admin"]),
        }),
      },
    },
    async (request, reply) => {
      const { userId } = request.params as { userId: string };
      const { role } = request.body as { role: string };

      // TODO: Implement user role update
      reply.send({
        id: userId,
        role,
        message: "User role updated successfully",
      });
    }
  );

  // Get all questions
  fastify.get(
    "/questions",
    {
      preHandler: [fastify.requireRole("admin")],
      schema: {
        querystring: z.object({
          limit: z.string().transform(Number).optional().default("20"),
          offset: z.string().transform(Number).optional().default("0"),
          framework: z.enum(["angular", "react", "nextjs", "redux"]).optional(),
          level: z.enum(["junior", "intermediate", "senior"]).optional(),
        }),
      },
    },
    async (request, reply) => {
      const { limit, offset } = request.query as unknown;

      // TODO: Implement real question fetching
      reply.send({
        questions: [],
        total: 0,
        limit,
        offset,
      });
    }
  );

  // Create new question
  fastify.post(
    "/questions",
    {
      preHandler: [fastify.requireRole("admin")],
      schema: {
        body: z.object({
          framework: z.enum(["angular", "react", "nextjs", "redux"]),
          level: z.enum(["junior", "intermediate", "senior"]),
          type: z.enum(["multiple-choice", "fill-blank", "true-false", "multiple-checkbox"]),
          category: z.string().optional(),
          difficulty: z.enum(["easy", "medium", "hard"]),
          tags: z.array(z.string()),
          points: z.number().positive(),
          content: z.object({
            en: z.object({
              question: z.string(),
              options: z
                .array(
                  z.object({
                    id: z.string(),
                    text: z.string(),
                    isCorrect: z.boolean(),
                  })
                )
                .optional(),
              explanation: z.string(),
            }),
            ar: z.object({
              question: z.string(),
              options: z
                .array(
                  z.object({
                    id: z.string(),
                    text: z.string(),
                    isCorrect: z.boolean(),
                  })
                )
                .optional(),
              explanation: z.string(),
            }),
          }),
        }),
      },
    },
    async (request, reply) => {
      const questionData = request.body as unknown;

      // TODO: Implement question creation
      reply.status(201).send({
        id: "new-question-id",
        ...questionData,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }
  );

  // Update question
  fastify.patch(
    "/questions/:questionId",
    {
      preHandler: [fastify.requireRole("admin")],
      schema: {
        params: z.object({
          questionId: z.string(),
        }),
      },
    },
    async (request, reply) => {
      const { questionId } = request.params as { questionId: string };
      const updateData = request.body as unknown;

      // TODO: Implement question update
      reply.send({
        id: questionId,
        ...updateData,
        updatedAt: new Date(),
      });
    }
  );

  // Delete question
  fastify.delete(
    "/questions/:questionId",
    {
      preHandler: [fastify.requireRole("admin")],
      schema: {
        params: z.object({
          questionId: z.string(),
        }),
      },
    },
    async (request, reply) => {
      const { questionId } = request.params as { questionId: string };

      // TODO: Implement question deletion
      reply.send({
        message: "Question deleted successfully",
        id: questionId,
      });
    }
  );

  // Get payment analytics
  fastify.get(
    "/analytics/payments",
    {
      preHandler: [fastify.requireRole("admin")],
      schema: {
        querystring: z.object({
          period: z.enum(["day", "week", "month", "year"]).optional().default("month"),
        }),
      },
    },
    async (request, reply) => {
      const { period } = request.query as { period: string };

      // TODO: Implement payment analytics
      reply.send({
        period,
        totalRevenue: 15680,
        totalTransactions: 245,
        averageTransactionValue: 64,
        revenueByTier: {
          junior: 0,
          intermediate: 8930,
          senior: 6750,
          bundle: 0,
        },
        revenueByCurrency: {
          USD: 12000,
          JOD: 2340,
          SAR: 1340,
        },
      });
    }
  );

  // Get user analytics
  fastify.get(
    "/analytics/users",
    {
      preHandler: [fastify.requireRole("admin")],
      schema: {
        querystring: z.object({
          period: z.enum(["day", "week", "month", "year"]).optional().default("month"),
        }),
      },
    },
    async (request, reply) => {
      const { period } = request.query as { period: string };

      // TODO: Implement user analytics
      reply.send({
        period,
        totalUsers: 1250,
        newUsers: 89,
        activeUsers: 456,
        userRetention: 0.73,
        usersByTier: {
          junior: 890,
          intermediate: 245,
          senior: 98,
          bundle: 17,
        },
      });
    }
  );
}
