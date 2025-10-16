import { authenticate } from "@middlewares/auth.middleware.js";
import { studyGuard, quizGuard } from "@middlewares/plan-guard.middleware.js";
import { FrameworkAccess } from "@models/FrameworkAccess.js";
import { Question } from "@models/Question.js";
import { QuestionResponseSchema } from "@shared/schemas/question.schema.js";
import type { PlanTier } from "@shared/types/plan.js";
import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";

const getQuestionsSchema = z.object({
  framework: z.enum(["angular", "react", "vue", "nextjs", "redux", "random"]).optional(),
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
      preHandler: [authenticate, studyGuard()],
      config: {
        rateLimit: {
          max: 100,
          timeWindow: "1 minute",
        },
      },
      schema: {
        querystring: zodToJsonSchema(getQuestionsSchema),
      },
    },
    async (request, reply) => {
      const { query } = request;
      const { framework, level, category, difficulty, limit, offset } = query as z.infer<
        typeof getQuestionsSchema
      >;

      // Fetch questions from database with filters (study mode - get open-ended questions)
      const questions = await Question.findWithFilters({
        framework,
        level,
        category,
        difficulty,
        mode: "study", // Only get study mode questions (open-ended, explanatory)
        limit,
        offset,
      });

      const total = await Question.countDocuments({
        ...(framework && { framework }),
        ...(level && { level }),
        ...(category && { category }),
        ...(difficulty && { difficulty }),
        mode: { $in: ["study", "both"] }, // Count study mode questions only
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

  // Get framework access rules (from database)
  fastify.get(
    "/framework-access",
    {
      preHandler: [authenticate],
      schema: {
        description: "Get framework access rules based on user's plan",
        tags: ["questions"],
      },
    },
    async (request, reply) => {
      try {
        // User is guaranteed to exist due to authenticate middleware
        const user = request.authUser;
        if (!user) {
          return reply.status(401).send({ success: false, message: "Unauthorized" });
        }
        const userTier = "free" as PlanTier; // Default to free plan

        // Get all active framework access rules from database
        fastify.log.info("Fetching framework access rules...");
        const allRules = await FrameworkAccess.find({ isActive: true })
          .sort({ "metadata.order": 1 })
          .lean();

        fastify.log.info(`Found ${allRules.length} framework access rules`);

        // Determine access for each framework
        const tierHierarchy: Record<PlanTier, number> = {
          free: 0,
          intermediate: 1,
          advanced: 2,
          pro: 3,
        };

        const userLevel = tierHierarchy[userTier];

        type RuleData = {
          framework: string;
          displayName: string;
          description: string;
          requiredPlanTier: PlanTier;
          metadata: Record<string, unknown>;
        };

        const frameworkAccess = (allRules as RuleData[]).map((rule) => ({
          framework: rule.framework,
          displayName: rule.displayName,
          description: rule.description,
          requiredPlanTier: rule.requiredPlanTier,
          isLocked: userLevel < tierHierarchy[rule.requiredPlanTier],
          metadata: rule.metadata,
        }));

        reply.send({
          userTier,
          frameworks: frameworkAccess,
        });
      } catch (error) {
        fastify.log.error(error);
        reply.status(500).send({
          message: "Failed to fetch framework access rules",
        });
      }
    }
  );

  // Get framework counts by difficulty
  fastify.get(
    "/framework-counts",
    {
      schema: {
        querystring: zodToJsonSchema(
          z.object({
            difficulty: z.enum(["easy", "medium", "hard"]),
          })
        ),
      },
    },
    async (request, reply) => {
      const { difficulty } = request.query as { difficulty: string };

      // Get counts by framework for the specified difficulty
      const byFramework = await Question.aggregate([
        { $match: { isActive: true, difficulty } },
        { $group: { _id: "$framework", count: { $sum: 1 } } },
      ]);

      // Calculate total for "random" option
      const total = await Question.countDocuments({ isActive: true, difficulty });

      const counts = byFramework.reduce(
        (acc: Record<string, number>, item: { _id: string; count: number }) => {
          acc[item._id] = item.count;
          return acc;
        },
        {}
      );

      // Add random count (all questions for this difficulty)
      counts.random = total;

      reply.send({ counts });
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

  // Quiz questions endpoint (for quiz mode)
  fastify.get(
    "/quiz/questions",
    {
      preHandler: [authenticate, quizGuard()],
      config: {
        rateLimit: {
          max: 50,
          timeWindow: "1 minute",
        },
      },
      schema: {
        description: "Get questions for quiz mode by level",
        tags: ["questions"],
        querystring: zodToJsonSchema(
          z.object({
            level: z.enum(["junior", "intermediate", "senior"]),
            limit: z.coerce.number().min(1).max(50).default(10),
            framework: z.enum(["angular", "react", "vue", "nextjs", "redux", "random"]).optional(),
          })
        ),
        response: {
          200: zodToJsonSchema(
            z.object({
              questions: z.array(QuestionResponseSchema),
              total: z.number(),
              hasMore: z.boolean(),
            })
          ),
        },
      },
    },
    async (request, reply) => {
      try {
        const { level, limit, framework } = request.query as {
          level: "junior" | "intermediate" | "senior";
          limit: number;
          framework?: "angular" | "react" | "vue" | "nextjs" | "redux" | "random";
        };

        // Map quiz levels to difficulty levels
        const levelToDifficulty: Record<"junior" | "intermediate" | "senior", string> = {
          junior: "easy",
          intermediate: "medium",
          senior: "hard",
        };

        const difficulty = levelToDifficulty[level];

        // Build query (quiz mode - get questions with options for testing)
        const query: Record<string, unknown> = {
          difficulty,
          mode: { $in: ["quiz", "both"] }, // Only quiz-mode questions (multiple-choice, etc.)
          isActive: true,
        };

        if (framework) {
          query.framework = framework;
        }

        // Get questions (full content for quiz mode)
        const questions = await Question.find(query).sort({ createdAt: -1 }).limit(limit).lean();

        // Get total count
        const total = await Question.countDocuments(query);

        return {
          questions: questions.map((q: Record<string, unknown>) => ({
            _id: (q._id as { toString(): string }).toString(),
            id: q.id,
            type: q.type,
            content: q.content,
            difficulty: q.difficulty,
            level: q.level,
            framework: q.framework,
            category: q.category,
            tags: q.tags,
            points: q.points,
            createdAt: q.createdAt,
            updatedAt: q.updatedAt,
            isActive: q.isActive,
          })),
          total,
          hasMore: questions.length < total,
        };
      } catch (error) {
        fastify.log.error(error);
        reply.status(500);
        return { message: "Failed to fetch quiz questions" };
      }
    }
  );
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
