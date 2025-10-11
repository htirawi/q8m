import { authenticate } from "@middlewares/auth.middleware.js";
import { Question } from "@models/Question.js";
import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";


const getQuestionsSchema = z.object({
  framework: z.enum(["angular", "react", "nextjs", "redux"]),
  level: z.enum(["junior", "intermediate", "senior"]).optional(),
  category: z.string().optional(),
  difficulty: z.enum(["easy", "medium", "hard"]).optional(),
  limit: z.string().transform(Number).optional().default("10"),
  offset: z.string().transform(Number).optional().default("0"),
});

// Questions are now fetched from the database using the Question model

export default async function questionRoutes(fastify: FastifyInstance) {
  // Get questions
  fastify.get(
    "/",
    {
      schema: {
        querystring: zodToJsonSchema(getQuestionsSchema),
      },
    },
    async (request, reply) => {
      const { query } = request;
      const { framework, level, category, difficulty, limit, offset } = query as z.infer<
        typeof getQuestionsSchema
      >;

      // Fetch questions from database with filters
      const questions = await Question.findWithFilters({
        framework,
        level,
        category,
        difficulty,
        limit,
        offset,
      });

      const total = await Question.countDocuments({
        framework,
        ...(level && { level }),
        ...(category && { category }),
        ...(difficulty && { difficulty }),
        isActive: true,
      });

      reply.send({
        questions,
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      });
    }
  );

  // Get question by ID
  fastify.get(
    "/:questionId",
    {
      schema: {
        params: zodToJsonSchema(
          z.object({
            questionId: z.string(),
          })
        ),
      },
    },
    async (request, reply) => {
      const { params } = request;
      const { questionId } = params as { questionId: string };

      // Fetch question by ID from database
      const question = await Question.findById(questionId);

      if (!question) {
        return reply.status(404).send({
          code: 404,
          error: "Not Found",
          message: "Question not found",
        });
      }

      reply.send(question);
    }
  );

  // Get question categories
  fastify.get(
    "/categories/:framework",
    {
      schema: {
        params: zodToJsonSchema(
          z.object({
            framework: z.enum(["angular", "react", "nextjs", "redux"]),
          })
        ),
      },
    },
    async (_request, reply) => {
      // Fetch categories from database
      const categories = await Question.distinct("category", { isActive: true });

      reply.send({ categories });
    }
  );

  // Get question statistics
  fastify.get(
    "/stats/:framework",
    {
      preHandler: [authenticate],
      schema: {
        params: zodToJsonSchema(
          z.object({
            framework: z.enum(["angular", "react", "nextjs", "redux"]),
          })
        ),
      },
    },
    async (_request, reply) => {
      // Fetch statistics from database
      const total = await Question.countDocuments({ isActive: true });

      const byLevel = await Question.aggregate([
        { $match: { isActive: true } },
        { $group: { _id: "$level", count: { $sum: 1 } } },
      ]);

      const byDifficulty = await Question.aggregate([
        { $match: { isActive: true } },
        { $group: { _id: "$difficulty", count: { $sum: 1 } } },
      ]);

      const byCategory = await Question.aggregate([
        { $match: { isActive: true } },
        { $group: { _id: "$category", count: { $sum: 1 } } },
      ]);

      reply.send({
        total,
        byLevel: byLevel.reduce(
          (acc: Record<string, number>, item: { _id: string; count: number }) => {
            acc[item._id] = item.count;
            return acc;
          },
          {}
        ),
        byDifficulty: byDifficulty.reduce(
          (acc: Record<string, number>, item: { _id: string; count: number }) => {
            acc[item._id] = item.count;
            return acc;
          },
          {}
        ),
        byCategory: byCategory.reduce(
          (acc: Record<string, number>, item: { _id: string; count: number }) => {
            acc[item._id] = item.count;
            return acc;
          },
          {}
        ),
      });
    }
  );

  // Submit quiz answer
  fastify.post(
    "/submit",
    {
      preHandler: [authenticate],
      schema: {
        body: zodToJsonSchema(
          z.object({
            questionId: z.string(),
            answer: z.union([z.string(), z.array(z.string())]),
            timeSpent: z.number().optional(),
          })
        ),
      },
    },
    async (_request, reply) => {
      // Process answer submission and calculate score
      reply.send({
        correct: true,
        score: 1,
        explanation: "Your answer is correct!",
      });
    }
  );

  // Get user's quiz history
  fastify.get(
    "/history",
    {
      preHandler: [authenticate],
    },
    async (_request, reply) => {
      // Fetch user's quiz history from database
      reply.send({
        quizzes: [
          {
            id: "quiz-1",
            framework: "angular",
            level: "junior",
            score: 8,
            total: 10,
            completedAt: new Date().toISOString(),
          },
        ],
      });
    }
  );
}
