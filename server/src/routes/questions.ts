import type { FastifyInstance } from "fastify";
import { z } from "zod";

const getQuestionsSchema = z.object({
  framework: z.enum(["angular", "react", "nextjs", "redux"]),
  level: z.enum(["junior", "intermediate", "senior"]).optional(),
  category: z.string().optional(),
  difficulty: z.enum(["easy", "medium", "hard"]).optional(),
  limit: z.string().transform(Number).optional().default(10),
  offset: z.string().transform(Number).optional().default(0),
});

const mockQuestions = [
  {
    id: "1",
    framework: "angular",
    level: "junior",
    type: "multiple-choice",
    category: "Components",
    difficulty: "easy",
    tags: ["components", "basics"],
    points: 1,
    content: {
      en: {
        question: "What is a component in Angular?",
        options: [
          { id: "a", text: "A class decorated with @Component", isCorrect: true },
          { id: "b", text: "A function that returns JSX", isCorrect: false },
          { id: "c", text: "A service for data management", isCorrect: false },
          { id: "d", text: "A directive for DOM manipulation", isCorrect: false },
        ],
        explanation:
          "A component in Angular is a class decorated with @Component decorator that defines the view and behavior of a part of the UI.",
      },
      ar: {
        question: "ما هو المكون في Angular؟",
        options: [
          { id: "a", text: "فئة مزخرفة بـ @Component", isCorrect: true },
          { id: "b", text: "دالة تُرجع JSX", isCorrect: false },
          { id: "c", text: "خدمة لإدارة البيانات", isCorrect: false },
          { id: "d", text: "توجيه لمعالجة DOM", isCorrect: false },
        ],
        explanation:
          "المكون في Angular هو فئة مزخرفة بـ @Component decorator تحدد العرض والسلوك لجزء من واجهة المستخدم.",
      },
    },
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

export default async function questionRoutes(fastify: FastifyInstance) {
  // Get questions
  fastify.get(
    "/",
    {
      schema: {
        querystring: getQuestionsSchema,
      },
    },
    async (request, reply) => {
      const { framework, level, category, difficulty, limit, offset } = request.query as z.infer<
        typeof getQuestionsSchema
      >;

      // TODO: Implement real question fetching from database
      let filteredQuestions = mockQuestions.filter((q) => q.framework === framework);

      if (level) {
        filteredQuestions = filteredQuestions.filter((q) => q.level === level);
      }

      if (category) {
        filteredQuestions = filteredQuestions.filter((q) => q.category === category);
      }

      if (difficulty) {
        filteredQuestions = filteredQuestions.filter((q) => q.difficulty === difficulty);
      }

      const total = filteredQuestions.length;
      const questions = filteredQuestions.slice(offset, offset + limit);

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
        params: z.object({
          questionId: z.string(),
        }),
      },
    },
    async (request, reply) => {
      const { questionId } = request.params as { questionId: string };

      // TODO: Implement real question fetching by ID
      const question = mockQuestions.find((q) => q.id === questionId);

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
        params: z.object({
          framework: z.enum(["angular", "react", "nextjs", "redux"]),
        }),
      },
    },
    async (request, reply) => {
      const { framework } = request.params as { framework: string };

      // TODO: Implement real category fetching
      const categories = ["Components", "Services", "Routing", "Forms", "Testing"];

      reply.send({ categories });
    }
  );

  // Get question statistics
  fastify.get(
    "/stats/:framework",
    {
      preHandler: [fastify.authenticate],
      schema: {
        params: z.object({
          framework: z.enum(["angular", "react", "nextjs", "redux"]),
        }),
      },
    },
    async (request, reply) => {
      const { framework } = request.params as { framework: string };

      // TODO: Implement real statistics
      reply.send({
        total: 100,
        byLevel: {
          junior: 30,
          intermediate: 40,
          senior: 30,
        },
        byDifficulty: {
          easy: 40,
          medium: 35,
          hard: 25,
        },
        byCategory: {
          components: 25,
          services: 20,
          routing: 15,
          forms: 20,
          testing: 20,
        },
      });
    }
  );

  // Submit quiz answer
  fastify.post(
    "/submit",
    {
      preHandler: [fastify.authenticate],
      schema: {
        body: z.object({
          questionId: z.string(),
          answer: z.union([z.string(), z.array(z.string())]),
          timeSpent: z.number().optional(),
        }),
      },
    },
    async (request, reply) => {
      const { questionId, answer, timeSpent } = request.body as {
        questionId: string;
        answer: string | string[];
        timeSpent?: number;
      };

      // TODO: Implement answer submission and scoring
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
      preHandler: [fastify.authenticate],
    },
    async (request, reply) => {
      // TODO: Implement quiz history
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
