/**
 * Content Schemas (Zod)
 * Validates study items, questions, and content packs
 */

import { z } from "zod";

// ─────────────────────────────────────────────────────────────
// Framework & Level Enums
// ─────────────────────────────────────────────────────────────

export const FrameworkEnum = z.enum(["angular", "react", "nextjs", "redux", "vue", "random"]);
export type Framework = z.infer<typeof FrameworkEnum>;

export const LevelEnum = z.enum(["junior", "intermediate", "senior", "bundle"]);
export type Level = z.infer<typeof LevelEnum>;

export const DifficultyEnum = z.enum(["easy", "medium", "hard"]);
export type Difficulty = z.infer<typeof DifficultyEnum>;

export const QuestionTypeEnum = z.enum([
  "mcq",
  "multiple-choice",
  "multi",
  "multiple-checkbox",
  "tf",
  "true-false",
  "fib",
  "fill-blank",
  "code-order",
  "study",
]);
export type QuestionType = z.infer<typeof QuestionTypeEnum>;

// ─────────────────────────────────────────────────────────────
// Multilingual Content
// ─────────────────────────────────────────────────────────────

export const MultilingualTextSchema = z.object({
  en: z.string().min(1, "English text required"),
  ar: z.string().optional(), // AR can be missing initially
});

export type MultilingualText = z.infer<typeof MultilingualTextSchema>;

// ─────────────────────────────────────────────────────────────
// Study Item Schema
// ─────────────────────────────────────────────────────────────

export const StudyItemSchema = z.object({
  id: z.string().min(1, "ID required"), // Format: <framework>:<topic>:<hash>
  framework: FrameworkEnum,
  topic: z.string().min(1, "Topic required"),
  category: z.string().optional(),
  title: MultilingualTextSchema,
  slug: z
    .string()
    .min(1, "Slug required")
    .regex(/^[a-z0-9-]+$/, "Slug must be kebab-case"),
  summary: MultilingualTextSchema.optional(),
  bodyMdx: MultilingualTextSchema, // Main content in MDX format
  difficulty: DifficultyEnum,
  level: LevelEnum, // Mapped from difficulty
  estTimeMins: z.number().int().positive().optional(),
  tags: z.array(z.string()).min(1, "At least one tag required"),
  sources: z.array(z.string().url()).optional(), // External references
  updatedAt: z.date(),
  createdAt: z.date().optional(),
  isActive: z.boolean().default(true),
  // Metadata
  legacyId: z.number().optional(), // Original ID from source
  sourceFile: z.string().optional(), // Track migration source
});

export type StudyItem = z.infer<typeof StudyItemSchema>;

// ─────────────────────────────────────────────────────────────
// Question Option Schema
// ─────────────────────────────────────────────────────────────

export const QuestionOptionSchema = z.object({
  id: z.string().min(1, "Option ID required"),
  text: MultilingualTextSchema,
  isCorrect: z.boolean(),
});

export type QuestionOption = z.infer<typeof QuestionOptionSchema>;

// ─────────────────────────────────────────────────────────────
// Question Schema
// ─────────────────────────────────────────────────────────────

export const QuestionSchema = z.object({
  id: z.string().min(1, "ID required"), // Format: <framework>:<topic>:<hash>
  framework: FrameworkEnum,
  topic: z.string().min(1, "Topic required"),
  category: z.string().optional(),
  type: QuestionTypeEnum,
  promptMdx: MultilingualTextSchema, // Question prompt in MDX
  options: z.array(QuestionOptionSchema).optional(), // For MCQ and multi
  answerKey: z.union([z.string(), z.array(z.string())]).optional(), // For FIB, TF, or multiple answers
  explanationMdx: MultilingualTextSchema.optional(), // Detailed explanation
  difficulty: DifficultyEnum,
  level: LevelEnum, // Mapped from difficulty
  points: z.number().int().positive().default(1),
  tags: z.array(z.string()).min(1, "At least one tag required"),
  updatedAt: z.date(),
  createdAt: z.date().optional(),
  isActive: z.boolean().default(true),
  // Metadata
  legacyId: z.union([z.number(), z.string()]).optional(),
  sourceFile: z.string().optional(),
});

export type Question = z.infer<typeof QuestionSchema>;

// ─────────────────────────────────────────────────────────────
// Content Pack Schema
// ─────────────────────────────────────────────────────────────

export const ContentPackSchema = z.object({
  id: z.string().min(1, "Pack ID required"), // Format: <framework>_<level>
  framework: FrameworkEnum,
  level: LevelEnum,
  name: MultilingualTextSchema,
  description: MultilingualTextSchema.optional(),
  studyIds: z.array(z.string()),
  questionIds: z.array(z.string()),
  curator: z.string().default("q8m"),
  version: z.string().regex(/^\d+\.\d+\.\d+$/, "SemVer required"),
  createdAt: z.date(),
  updatedAt: z.date(),
  // Counts for validation
  expectedStudyCount: z.number().int().nonnegative(),
  expectedQuestionCount: z.number().int().nonnegative(),
});

export type ContentPack = z.infer<typeof ContentPackSchema>;

// ─────────────────────────────────────────────────────────────
// Validation Helpers
// ─────────────────────────────────────────────────────────────

export function validateStudyItem(data: unknown): StudyItem {
  return StudyItemSchema.parse(data);
}

export function validateQuestion(data: unknown): Question {
  return QuestionSchema.parse(data);
}

export function validateContentPack(data: unknown): ContentPack {
  return ContentPackSchema.parse(data);
}

// Safe validation (returns error instead of throwing)
export function safeValidateStudyItem(data: unknown) {
  return StudyItemSchema.safeParse(data);
}

export function safeValidateQuestion(data: unknown) {
  return QuestionSchema.safeParse(data);
}

export function safeValidateContentPack(data: unknown) {
  return ContentPackSchema.safeParse(data);
}

// Batch validation
export function validateStudyItems(data: unknown[]): StudyItem[] {
  return data.map(validateStudyItem);
}

export function validateQuestions(data: unknown[]): Question[] {
  return data.map(validateQuestion);
}

export function validateContentPacks(data: unknown[]): ContentPack[] {
  return data.map(validateContentPack);
}
