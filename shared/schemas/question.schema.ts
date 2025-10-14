import { z } from "zod";

// Question type schemas
export const questionTypeSchema = z.enum([
  "multiple-choice",
  "fill-blank",
  "true-false",
  "multiple-checkbox",
]);

export const questionLevelSchema = z.enum(["junior", "intermediate", "senior"]);

export const questionDifficultySchema = z.enum(["easy", "medium", "hard"]);

export const frameworkSchema = z.enum(["angular", "react", "nextjs", "redux"]);

// Quiz option schema
export const quizOptionSchema = z.object({
  id: z.string().min(1),
  text: z.string().min(1),
  isCorrect: z.boolean(),
});

// Multilingual content schema
export const questionContentSchema = z.object({
  en: z.object({
    question: z.string().min(10, "Question must be at least 10 characters"),
    options: z.array(quizOptionSchema).optional(),
    explanation: z.string().min(10, "Explanation must be at least 10 characters"),
  }),
  ar: z.object({
    question: z.string().min(10, "Question must be at least 10 characters"),
    options: z.array(quizOptionSchema).optional(),
    explanation: z.string().min(10, "Explanation must be at least 10 characters"),
  }),
});

// Question schema
export const questionSchema = z.object({
  id: z.string(),
  legacyId: z.number().positive(),
  framework: frameworkSchema,
  level: questionLevelSchema,
  type: questionTypeSchema,
  category: z.string().min(1).optional(),
  difficulty: questionDifficultySchema,
  tags: z.array(z.string().min(1)),
  points: z.number().positive().max(10),
  content: questionContentSchema,
  isActive: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Question response schema (for API responses)
export const QuestionResponseSchema = z.object({
  _id: z.string(),
  id: z.string(),
  type: questionTypeSchema,
  content: questionContentSchema,
  difficulty: questionDifficultySchema,
  level: questionLevelSchema,
  framework: frameworkSchema,
  category: z.string().optional(),
  tags: z.array(z.string()),
  points: z.number(),
  createdAt: z.union([z.date(), z.string()]),
  updatedAt: z.union([z.date(), z.string()]),
  isActive: z.boolean(),
});

// Base question object schema (without refinements)
const baseQuestionObjectSchema = z.object({
  legacyId: z.number().positive().optional(),
  framework: frameworkSchema,
  level: questionLevelSchema,
  type: questionTypeSchema,
  category: z.string().min(1).optional(),
  difficulty: questionDifficultySchema,
  tags: z.array(z.string().min(1)),
  points: z.number().positive().max(10),
  content: questionContentSchema,
  isActive: z.boolean().default(true),
});

// Question creation schema with validation
export const createQuestionSchema = baseQuestionObjectSchema.refine(
  (data) => {
    // Validate that multiple choice and multiple checkbox questions have options
    if (data.type === "multiple-choice" || data.type === "multiple-checkbox") {
      return data.content.en.options && data.content.en.options.length >= 2;
    }
    return true;
  },
  {
    message: "Multiple choice and multiple checkbox questions must have at least 2 options",
    path: ["content", "en", "options"],
  }
);

// Question update schema (partial, without strict validation)
export const updateQuestionSchema = baseQuestionObjectSchema.partial();

// Quiz session schema
export const quizSessionSchema = z.object({
  id: z.string(),
  userId: z.string(),
  framework: frameworkSchema,
  level: questionLevelSchema,
  questions: z.array(questionSchema),
  currentQuestionIndex: z.number().nonnegative(),
  answers: z.record(z.string(), z.union([z.string(), z.array(z.string())])),
  startTime: z.date(),
  endTime: z.date().optional(),
  timeLimit: z.number().positive().optional(),
  isCompleted: z.boolean(),
  score: z.number().nonnegative().optional(),
  totalQuestions: z.number().positive(),
});

// Quiz result schema
export const quizAnswerSchema = z.object({
  questionId: z.string(),
  userAnswer: z.union([z.string(), z.array(z.string())]),
  correctAnswer: z.union([z.string(), z.array(z.string())]),
  isCorrect: z.boolean(),
  timeSpent: z.number().nonnegative(),
});

export const quizResultSchema = z.object({
  id: z.string(),
  userId: z.string(),
  sessionId: z.string(),
  framework: frameworkSchema,
  level: questionLevelSchema,
  score: z.number().nonnegative(),
  totalQuestions: z.number().positive(),
  correctAnswers: z.number().nonnegative(),
  incorrectAnswers: z.number().nonnegative(),
  skippedAnswers: z.number().nonnegative(),
  timeSpent: z.number().nonnegative(),
  completedAt: z.date(),
  answers: z.record(z.string(), quizAnswerSchema),
});

// Quiz config schema
export const quizConfigSchema = z.object({
  framework: frameworkSchema,
  level: questionLevelSchema,
  questionCount: z.number().positive().max(50),
  timeLimit: z.number().positive().max(120).optional(),
  shuffleQuestions: z.boolean().default(true),
  shuffleOptions: z.boolean().default(true),
  showExplanation: z.boolean().default(true),
  allowReview: z.boolean().default(false),
});

// Quiz attempt schema
export const quizAttemptSchema = z.object({
  questionId: z.string(),
  userAnswer: z.union([z.string(), z.array(z.string())]),
  timeSpent: z.number().nonnegative(),
  isCorrect: z.boolean(),
  submittedAt: z.date(),
});

// Quiz progress schema
export const quizProgressSchema = z.object({
  sessionId: z.string(),
  currentQuestion: z.number().nonnegative(),
  totalQuestions: z.number().positive(),
  timeRemaining: z.number().nonnegative(),
  completedQuestions: z.number().nonnegative(),
  correctAnswers: z.number().nonnegative(),
  incorrectAnswers: z.number().nonnegative(),
  skippedQuestions: z.number().nonnegative(),
});

// Question filters schema
export const questionFiltersSchema = z.object({
  framework: frameworkSchema,
  level: questionLevelSchema.optional(),
  category: z.string().optional(),
  difficulty: questionDifficultySchema.optional(),
  tags: z.array(z.string()).optional(),
  isActive: z.boolean().optional(),
  limit: z.number().positive().max(100).default(20),
  offset: z.number().nonnegative().default(0),
  sortBy: z.enum(["createdAt", "updatedAt", "difficulty", "points"]).default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

// Question stats schema
export const questionStatsSchema = z.object({
  total: z.number().nonnegative(),
  byLevel: z.record(questionLevelSchema, z.number().nonnegative()),
  byDifficulty: z.record(questionDifficultySchema, z.number().nonnegative()),
  byCategory: z.record(z.string(), z.number().nonnegative()),
  byFramework: z.record(frameworkSchema, z.number().nonnegative()),
  active: z.number().nonnegative(),
  inactive: z.number().nonnegative(),
});

// Quiz stats schema
export const quizStatsSchema = z.object({
  totalQuizzes: z.number().nonnegative(),
  averageScore: z.number().min(0).max(100),
  bestScore: z.number().min(0).max(100),
  totalTimeSpent: z.number().nonnegative(),
  frameworks: z.record(
    z.string(),
    z.object({
      totalQuizzes: z.number().nonnegative(),
      averageScore: z.number().min(0).max(100),
      bestScore: z.number().min(0).max(100),
    })
  ),
  levels: z.record(
    z.string(),
    z.object({
      totalQuizzes: z.number().nonnegative(),
      averageScore: z.number().min(0).max(100),
      bestScore: z.number().min(0).max(100),
    })
  ),
  recentQuizzes: z.array(quizResultSchema),
});

// Type exports
export type QuestionType = z.infer<typeof questionTypeSchema>;
export type QuestionLevel = z.infer<typeof questionLevelSchema>;
export type QuestionDifficulty = z.infer<typeof questionDifficultySchema>;
export type Framework = z.infer<typeof frameworkSchema>;
export type QuizOption = z.infer<typeof quizOptionSchema>;
export type QuestionContent = z.infer<typeof questionContentSchema>;
export type Question = z.infer<typeof questionSchema>;
export type QuestionResponse = z.infer<typeof QuestionResponseSchema>;
export type CreateQuestionRequest = z.infer<typeof createQuestionSchema>;
export type UpdateQuestionRequest = z.infer<typeof updateQuestionSchema>;
export type QuizSession = z.infer<typeof quizSessionSchema>;
export type QuizAnswer = z.infer<typeof quizAnswerSchema>;
export type QuizResult = z.infer<typeof quizResultSchema>;
export type QuizConfig = z.infer<typeof quizConfigSchema>;
export type QuizAttempt = z.infer<typeof quizAttemptSchema>;
export type QuizProgress = z.infer<typeof quizProgressSchema>;
export type QuestionFilters = z.infer<typeof questionFiltersSchema>;
export type QuestionStats = z.infer<typeof questionStatsSchema>;
export type QuizStats = z.infer<typeof quizStatsSchema>;
