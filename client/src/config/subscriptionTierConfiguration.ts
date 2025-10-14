/**
 * Content Levels Configuration
 * Defines tier-based content limits and mappings
 */

import type { Level, Difficulty } from "./contentValidationSchemas";

// ─────────────────────────────────────────────────────────────
// Level Definitions (Canonical Business Rules)
// ─────────────────────────────────────────────────────────────

export interface LevelConfig {
  id: Level;
  name: {
    en: string;
    ar: string;
  };
  order: number;
  maxStudyItems: number;
  maxQuestions: number;
  price: number; // USD
  isFree: boolean;
  features: string[];
  description: {
    en: string;
    ar: string;
  };
}

export const LEVELS: Record<Level, LevelConfig> = {
  junior: {
    id: "junior",
    name: {
      en: "Junior",
      ar: "مبتدئ",
    },
    order: 1,
    maxStudyItems: 50,
    maxQuestions: 50,
    price: 0,
    isFree: true,
    features: [
      "basic_study_materials",
      "basic_quiz_questions",
      "progress_tracking",
      "mobile_access",
    ],
    description: {
      en: "Free tier with essential study materials and quiz questions for beginners",
      ar: "مستوى مجاني مع مواد دراسية أساسية وأسئلة اختبارات للمبتدئين",
    },
  },
  intermediate: {
    id: "intermediate",
    name: {
      en: "Intermediate",
      ar: "متوسط",
    },
    order: 2,
    maxStudyItems: 200,
    maxQuestions: 250,
    price: 10,
    isFree: false,
    features: [
      "advanced_study_materials",
      "advanced_quiz_questions",
      "detailed_explanations",
      "bookmarks_notes",
      "analytics",
      "priority_support",
    ],
    description: {
      en: "Comprehensive materials for intermediate developers preparing for technical interviews",
      ar: "مواد شاملة للمطورين المتوسطين للتحضير للمقابلات التقنية",
    },
  },
  senior: {
    id: "senior",
    name: {
      en: "Senior",
      ar: "متقدم",
    },
    order: 3,
    maxStudyItems: 300,
    maxQuestions: 350,
    price: 15,
    isFree: false,
    features: [
      "expert_study_materials",
      "expert_quiz_questions",
      "system_design",
      "mock_interviews",
      "ai_support",
      "custom_study_plans",
      "advanced_analytics",
      "expert_reviews",
    ],
    description: {
      en: "Expert-level materials with AI support and advanced features for senior developers",
      ar: "مواد على مستوى الخبراء مع دعم الذكاء الاصطناعي وميزات متقدمة للمطورين المتقدمين",
    },
  },
  bundle: {
    id: "bundle",
    name: {
      en: "Bundle",
      ar: "الحزمة الكاملة",
    },
    order: 4,
    maxStudyItems: -1, // Unlimited
    maxQuestions: -1, // Unlimited
    price: 20,
    isFree: false,
    features: [
      "everything_intermediate",
      "everything_senior",
      "lifetime_access",
      "future_updates",
      "personal_mentor",
      "interview_coaching",
      "resume_review",
      "premium_support",
    ],
    description: {
      en: "Complete bundle with lifetime access, mentorship, and all premium features",
      ar: "حزمة كاملة مع وصول مدى الحياة والإرشاد وجميع الميزات المميزة",
    },
  },
};

// ─────────────────────────────────────────────────────────────
// Difficulty to Level Mapping
// ─────────────────────────────────────────────────────────────

export const DIFFICULTY_TO_LEVEL_MAP: Record<Difficulty, Level> = {
  easy: "junior",
  medium: "intermediate",
  hard: "senior",
};

// Legacy difficulty mapping (from source data)
export const LEGACY_DIFFICULTY_MAP: Record<string, Difficulty> = {
  // Standard
  easy: "easy",
  medium: "medium",
  hard: "hard",
  // Variants
  beginner: "easy",
  intermediate: "medium",
  advanced: "hard",
  senior: "hard",
  expert: "hard",
  // Numeric (if encountered)
  "1": "easy",
  "2": "medium",
  "3": "hard",
};

/**
 * Maps source difficulty to canonical difficulty
 */
export function normalizeDifficulty(sourceDifficulty?: string): Difficulty {
  if (!sourceDifficulty) return "medium"; // Default

  const normalized = sourceDifficulty.toLowerCase().trim();
  return (LEGACY_DIFFICULTY_MAP[normalized] as Difficulty) ?? "medium";
}

/**
 * Maps difficulty to tier level
 */
export function difficultyToLevel(difficulty: Difficulty): Level {
  return DIFFICULTY_TO_LEVEL_MAP[difficulty];
}

/**
 * Maps source difficulty directly to tier level
 */
export function mapSourceDifficultyToLevel(sourceDifficulty?: string): Level {
  const difficulty = normalizeDifficulty(sourceDifficulty);
  return difficultyToLevel(difficulty);
}

// ─────────────────────────────────────────────────────────────
// Level Utilities
// ─────────────────────────────────────────────────────────────

export function getLevelConfig(level: Level): LevelConfig {
  return LEVELS[level];
}

export function getAllLevels(): Level[] {
  return Object.keys(LEVELS) as Level[];
}

export function getOrderedLevels(): Level[] {
  return getAllLevels().sort((a, b) => LEVELS[a].order - LEVELS[b].order);
}

export function isLevelFree(level: Level): boolean {
  return LEVELS[level].isFree;
}

export function getLevelPrice(level: Level): number {
  return LEVELS[level].price;
}

export function canAccessLevel(userLevel: Level, requiredLevel: Level): boolean {
  return LEVELS[userLevel].order >= LEVELS[requiredLevel].order;
}

export function getContentLimits(level: Level) {
  const { maxStudyItems, maxQuestions } = LEVELS[level];
  return {
    maxStudyItems: maxStudyItems === -1 ? Infinity : maxStudyItems,
    maxQuestions: maxQuestions === -1 ? Infinity : maxQuestions,
  };
}

/**
 * Validates if content count fits within level limits
 */
export function validateContentCounts(
  level: Level,
  studyCount: number,
  questionCount: number
): { valid: boolean; errors: string[] } {
  const { maxStudyItems, maxQuestions } = getContentLimits(level);
  const errors: string[] = [];

  if (studyCount > maxStudyItems) {
    errors.push(
      `Study items (${studyCount}) exceed ${level} limit (${maxStudyItems === Infinity ? "unlimited" : maxStudyItems})`
    );
  }

  if (questionCount > maxQuestions) {
    errors.push(
      `Questions (${questionCount}) exceed ${level} limit (${maxQuestions === Infinity ? "unlimited" : maxQuestions})`
    );
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
