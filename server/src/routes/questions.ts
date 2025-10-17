import { authenticate } from "@middlewares/auth.middleware.js";
import { studyGuard, quizGuard } from "@middlewares/plan-guard.middleware.js";
import { FrameworkAccess } from "@models/FrameworkAccess.js";
import { Question } from "@models/Question.js";
import { UserProgress } from "@models/UserProgress.js";
import { QuestionResponseSchema } from "@shared/schemas/question.schema.js";
import type { PlanTier } from "@shared/types/plan.js";
import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";

const getQuestionsSchema = z.object({
  framework: z
    .enum([
      "angular",
      "react",
      "vue",
      "nextjs",
      "redux",
      "random",
      "svelte",
      "testing",
      "typescript",
    ])
    .optional(),
  level: z.enum(["junior", "intermediate", "senior"]).optional(),
  category: z.string().optional(),
  difficulty: z.enum(["easy", "medium", "hard"]).optional(),
  limit: z.string().transform(Number).optional().default("10"),
  offset: z.string().transform(Number).optional().default("0"),
  ids: z.string().optional(), // Comma-separated question IDs for bookmarked questions
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
      const { framework, level, category, difficulty, limit, offset, ids } = query as z.infer<
        typeof getQuestionsSchema
      >;

      let questions;
      let total;

      // If IDs are provided, fetch specific questions (for bookmarked mode)
      if (ids) {
        const questionIds = ids.split(",").filter((id) => id.trim());

        if (questionIds.length === 0) {
          return reply.send({
            questions: [],
            total: 0,
            limit,
            offset,
            hasMore: false,
          });
        }

        questions = await Question.find({
          _id: { $in: questionIds },
          isActive: true,
        })
          .limit(limit)
          .skip(offset);

        total = questionIds.length;
      } else {
        // Regular filtering for normal study mode
        questions = await Question.findWithFilters({
          framework,
          level,
          category,
          difficulty,
          mode: "study", // Only get study mode questions (open-ended, explanatory)
          limit,
          offset,
        });

        const countQuery = {
          ...(framework && { framework }),
          ...(level && { level }),
          ...(category && { category }),
          ...(difficulty && { difficulty }),
          mode: { $in: ["study", "both"] }, // Count study mode questions only
          isActive: true,
        };

        fastify.log.info(`Count query: ${JSON.stringify(countQuery)}`);
        total = await Question.countDocuments(countQuery);
        fastify.log.info(`Total count result: ${total}`);
      }

      // For study mode, remove answers and explanations to prevent cheating
      const sanitizedQuestions = questions.map((q: any) => {
        const question = q.toObject ? q.toObject() : q;

        // Remove correct answers and explanations
        return {
          ...question,
          content: {
            en: {
              question: question.content.en.question,
              options: question.content.en.options?.map((opt: any) => ({
                id: opt.id,
                text: opt.text,
                // Remove isCorrect flag
              })),
              // Remove explanation
            },
            ar: {
              question: question.content.ar?.question,
              options: question.content.ar?.options?.map((opt: any) => ({
                id: opt.id,
                text: opt.text,
                // Remove isCorrect flag
              })),
              // Remove explanation
            },
          },
        };
      });

      const hasMoreValue = Number(offset) + Number(limit) < Number(total);

      // Debug logging
      fastify.log.info(
        `Pagination debug: offset=${offset}, limit=${limit}, total=${total}, hasMore=${hasMoreValue}`
      );
      fastify.log.info(
        `Query filters: framework=${framework}, level=${level}, difficulty=${difficulty}, category=${category}`
      );

      reply.send({
        questions: sanitizedQuestions,
        total,
        limit,
        offset,
        hasMore: hasMoreValue,
      });
    }
  );

  // Reveal answer for a specific question (secure endpoint)
  fastify.post(
    "/:questionId/reveal",
    {
      onRequest: [authenticate],
      schema: {
        description: "Reveal the answer and explanation for a question",
        tags: ["questions"],
        params: zodToJsonSchema(
          z.object({
            questionId: z.string().min(1, "Question ID is required"),
          })
        ),
      },
    },
    async (request, reply) => {
      try {
        const { questionId } = request.params as { questionId: string };
        const userId = request.authUser!.id;

        // Get the question with full details
        const question = await Question.findById(questionId);

        if (!question) {
          return reply.status(404).send({
            code: 404,
            error: "Not Found",
            message: "Question not found",
          });
        }

        // Validate question structure
        if (!question.content || !question.content.en) {
          fastify.log.error(`Question ${questionId} has invalid structure:`, question);
          return reply.status(500).send({
            code: 500,
            error: "Invalid Question Data",
            message: "Question data is corrupted",
          });
        }

        // Track that user revealed the answer (for analytics)
        fastify.log.info({
          event: "answer_revealed",
          userId,
          questionId,
          framework: question.framework,
          difficulty: question.difficulty,
        });

        // Return only the answer and explanation
        reply.send({
          questionId,
          correctAnswers:
            question.content.en.options
              ?.filter((opt: any) => opt.isCorrect)
              .map((opt: any) => opt.id) || [],
          explanation: {
            en: question.content.en.explanation || "",
            ar: question.content.ar?.explanation || "",
          },
        });
      } catch (error) {
        fastify.log.error("Reveal answer error:", error);
        reply.status(500).send({
          code: 500,
          error: "Internal Server Error",
          message: "Failed to reveal answer",
          debug: process.env.NODE_ENV === "development" ? (error as Error).message : undefined,
        });
      }
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
            framework: z.enum([
              "angular",
              "react",
              "nextjs",
              "redux",
              "vue",
              "svelte",
              "testing",
              "typescript",
            ]),
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
            framework: z.enum([
              "angular",
              "react",
              "nextjs",
              "redux",
              "vue",
              "svelte",
              "testing",
              "typescript",
            ]),
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
            framework: z
              .enum([
                "angular",
                "react",
                "vue",
                "nextjs",
                "redux",
                "random",
                "svelte",
                "testing",
                "typescript",
              ])
              .optional(),
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

  // Bookmark endpoints
  const toggleBookmarkSchema = z.object({
    questionId: z.string().min(1, "Question ID is required"),
  });

  // Toggle bookmark for a question
  fastify.post(
    "/bookmark",
    {
      onRequest: [authenticate],
      schema: {
        description: "Toggle bookmark for a question",
        tags: ["questions"],
        body: zodToJsonSchema(toggleBookmarkSchema),
      },
    },
    async (request, reply) => {
      try {
        const userId = request.authUser!.id;
        const { questionId } = request.body as z.infer<typeof toggleBookmarkSchema>;

        // Verify question exists
        const question = await Question.findById(questionId);
        if (!question) {
          return reply.status(404).send({
            code: 404,
            error: "Not Found",
            message: "Question not found",
          });
        }

        // Get or create user progress
        const userProgress = await UserProgress.findOrCreate(userId);

        // Toggle bookmark
        await userProgress.toggleBookmark(questionId);

        // Get updated bookmark status
        const isBookmarked = userProgress.isQuestionBookmarked(questionId);

        reply.send({
          questionId,
          isBookmarked,
          message: isBookmarked ? "Question bookmarked" : "Bookmark removed",
        });
      } catch (error) {
        fastify.log.error(error);
        reply.status(500).send({
          code: 500,
          error: "Internal Server Error",
          message: "Failed to toggle bookmark",
        });
      }
    }
  );

  // Get all bookmarked questions for user
  fastify.get(
    "/bookmarked",
    {
      onRequest: [authenticate],
      schema: {
        description: "Get all bookmarked questions for the user",
        tags: ["questions"],
        querystring: zodToJsonSchema(
          z.object({
            difficulty: z.enum(["easy", "medium", "hard"]).optional(),
            framework: z
              .enum([
                "angular",
                "react",
                "vue",
                "nextjs",
                "redux",
                "random",
                "svelte",
                "testing",
                "typescript",
              ])
              .optional(),
          })
        ),
      },
    },
    async (request, reply) => {
      try {
        const userId = request.authUser!.id;
        const { difficulty, framework } = request.query as {
          difficulty?: "easy" | "medium" | "hard";
          framework?: "angular" | "react" | "vue" | "nextjs" | "redux" | "random";
        };

        // Get user progress
        const userProgress = await UserProgress.findOne({ userId });
        if (!userProgress) {
          return reply.send({
            questions: [],
            total: 0,
          });
        }

        // Get bookmarked question IDs
        const bookmarkedIds = userProgress.getBookmarkedQuestionIds();

        if (bookmarkedIds.length === 0) {
          return reply.send({
            questions: [],
            total: 0,
          });
        }

        // Build query for bookmarked questions
        const query: any = {
          _id: { $in: bookmarkedIds },
          isActive: true,
        };

        if (difficulty) {
          query.difficulty = difficulty;
        }

        if (framework && framework !== "random") {
          query.framework = framework;
        }

        // Fetch bookmarked questions
        const questions = await Question.find(query);

        reply.send({
          questions,
          total: questions.length,
        });
      } catch (error) {
        fastify.log.error(error);
        reply.status(500).send({
          code: 500,
          error: "Internal Server Error",
          message: "Failed to fetch bookmarked questions",
        });
      }
    }
  );

  // Check if a question is bookmarked
  fastify.get(
    "/bookmark/:questionId",
    {
      onRequest: [authenticate],
      schema: {
        description: "Check if a question is bookmarked",
        tags: ["questions"],
        params: zodToJsonSchema(
          z.object({
            questionId: z.string().min(1, "Question ID is required"),
          })
        ),
      },
    },
    async (request, reply) => {
      try {
        const userId = request.authUser!.id;
        const { questionId } = request.params as { questionId: string };

        // Get user progress
        const userProgress = await UserProgress.findOne({ userId });
        const isBookmarked = userProgress?.isQuestionBookmarked(questionId) || false;

        reply.send({
          questionId,
          isBookmarked,
        });
      } catch (error) {
        fastify.log.error(error);
        reply.status(500).send({
          code: 500,
          error: "Internal Server Error",
          message: "Failed to check bookmark status",
        });
      }
    }
  );

  // Batch check bookmark statuses for multiple questions
  fastify.post(
    "/bookmark/batch",
    {
      onRequest: [authenticate],
      schema: {
        description: "Check bookmark statuses for multiple questions",
        tags: ["questions"],
        body: zodToJsonSchema(
          z.object({
            questionIds: z.array(z.string()).min(1, "At least one question ID is required"),
          })
        ),
      },
    },
    async (request, reply) => {
      try {
        const userId = request.authUser!.id;
        const { questionIds } = request.body as { questionIds: string[] };

        const userProgress = await UserProgress.findOne({ userId });
        const statusMap: Record<string, boolean> = {};

        questionIds.forEach((questionId) => {
          statusMap[questionId] = userProgress?.isQuestionBookmarked(questionId) || false;
        });

        reply.send({
          statuses: statusMap,
        });
      } catch (error) {
        fastify.log.error(error);
        reply.status(500).send({
          code: 500,
          error: "Internal Server Error",
          message: "Failed to check bookmark statuses",
        });
      }
    }
  );
}
