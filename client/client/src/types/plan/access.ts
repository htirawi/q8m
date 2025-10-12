/**
 * Plan-based Access Control
 * Defines which plan tiers can access which difficulty levels and experience levels
 */

import type { PlanTier } from "@shared/types/plan";

export type StudyDifficulty = "easy" | "medium" | "hard";
export type QuizLevel = "junior" | "intermediate" | "senior";

/**
 * Study Mode Access Mapping
 * Maps difficulty levels to allowed plan tiers
 */
export const STUDY_ACCESS_MAP: Record<StudyDifficulty, PlanTier[]> = {
  easy: ["free", "intermediate", "advanced", "pro"],
  medium: ["intermediate", "advanced", "pro"],
  hard: ["advanced", "pro"],
};

/**
 * Quiz Mode Access Mapping
 * Maps experience levels to allowed plan tiers
 */
export const QUIZ_ACCESS_MAP: Record<QuizLevel, PlanTier[]> = {
  junior: ["free", "intermediate", "advanced", "pro"],
  intermediate: ["intermediate", "advanced", "pro"],
  senior: ["advanced", "pro"],
};

/**
 * Quiz Question Count by Level
 */
export const QUIZ_QUESTION_COUNT: Record<QuizLevel, number> = {
  junior: 30,
  intermediate: 40,
  senior: 50,
};

/**
 * Check if a user's plan tier can access a study difficulty level
 */
export function canAccessStudyDifficulty(
  userTier: PlanTier,
  difficulty: StudyDifficulty
): boolean {
  return STUDY_ACCESS_MAP[difficulty].includes(userTier);
}

/**
 * Check if a user's plan tier can access a quiz level
 */
export function canAccessQuizLevel(userTier: PlanTier, level: QuizLevel): boolean {
  return QUIZ_ACCESS_MAP[level].includes(userTier);
}

/**
 * Get required plan tier for a study difficulty
 * Returns the minimum required tier
 */
export function getRequiredStudyPlanTier(difficulty: StudyDifficulty): PlanTier {
  const allowedTiers = STUDY_ACCESS_MAP[difficulty];
  return allowedTiers[0]; // First tier in the array is the minimum
}

/**
 * Get required plan tier for a quiz level
 * Returns the minimum required tier
 */
export function getRequiredQuizPlanTier(level: QuizLevel): PlanTier {
  const allowedTiers = QUIZ_ACCESS_MAP[level];
  return allowedTiers[0]; // First tier in the array is the minimum
}

/**
 * Get suggested upgrade tier based on blocked content
 */
export function getSuggestedUpgradeTier(requiredTier: PlanTier, userTier: PlanTier): PlanTier {
  // If user is free and needs intermediate or higher, suggest intermediate
  if (userTier === "free" && requiredTier !== "free") {
    return "intermediate";
  }

  // Otherwise, suggest the required tier
  return requiredTier;
}
