/**
 * Plan Access Mapping
 * Maps plan tiers to accessible difficulty levels and experience levels
 */

import type { PlanTier } from "@shared/types/plan";

export type DifficultyLevel = "easy" | "medium" | "hard";
export type ExperienceLevel = "junior" | "intermediate" | "senior";

/**
 * Difficulty Access Map
 * Defines which plan tiers can access which difficulty levels in Study Mode
 * Hierarchical access: Free→Easy, Intermediate→Easy+Medium, Advanced→Easy+Medium+Hard, Pro(Bundle)→Easy+Medium+Hard
 */
export const DIFFICULTY_ACCESS_MAP: Record<DifficultyLevel, PlanTier[]> = {
  easy: ["free", "intermediate", "advanced", "pro"],
  medium: ["intermediate", "advanced", "pro"],
  hard: ["advanced", "pro"],
};

/**
 * Experience Level Access Map
 * Defines which plan tiers can access which experience levels in Quiz Mode
 * Hierarchical access: Free→Junior, Intermediate→Junior+Intermediate, Advanced→All, Pro(Bundle)→All
 */
export const LEVEL_ACCESS_MAP: Record<ExperienceLevel, PlanTier[]> = {
  junior: ["free", "intermediate", "advanced", "pro"],
  intermediate: ["intermediate", "advanced", "pro"],
  senior: ["advanced", "pro"],
};

/**
 * Check if a plan tier can access a specific difficulty level
 */
export function canAccessDifficulty(planTier: PlanTier, difficulty: DifficultyLevel): boolean {
  return DIFFICULTY_ACCESS_MAP[difficulty].includes(planTier);
}

/**
 * Check if a plan tier can access a specific experience level
 */
export function canAccessLevel(planTier: PlanTier, level: ExperienceLevel): boolean {
  return LEVEL_ACCESS_MAP[level].includes(planTier);
}

/**
 * Get all accessible difficulty levels for a plan tier
 */
export function getAccessibleDifficulties(planTier: PlanTier): DifficultyLevel[] {
  return (Object.keys(DIFFICULTY_ACCESS_MAP) as DifficultyLevel[]).filter((difficulty) =>
    canAccessDifficulty(planTier, difficulty)
  );
}

/**
 * Get all accessible experience levels for a plan tier
 */
export function getAccessibleLevels(planTier: PlanTier): ExperienceLevel[] {
  return (Object.keys(LEVEL_ACCESS_MAP) as ExperienceLevel[]).filter((level) =>
    canAccessLevel(planTier, level)
  );
}

/**
 * Get the minimum required plan for a difficulty level
 */
export function getMinimumPlanForDifficulty(difficulty: DifficultyLevel): PlanTier {
  const allowedPlans = DIFFICULTY_ACCESS_MAP[difficulty];
  // Return the first (lowest tier) plan that has access
  return allowedPlans[0]!;
}

/**
 * Get the minimum required plan for an experience level
 */
export function getMinimumPlanForLevel(level: ExperienceLevel): PlanTier {
  const allowedPlans = LEVEL_ACCESS_MAP[level];
  // Return the first (lowest tier) plan that has access
  return allowedPlans[0]!;
}

/**
 * Plan Tier Display Order
 */
export const PLAN_TIER_ORDER: PlanTier[] = ["free", "intermediate", "advanced", "pro"];

/**
 * Check if planTier1 is higher than or equal to planTier2
 */
export function isPlanHigherOrEqual(planTier1: PlanTier, planTier2: PlanTier): boolean {
  const index1 = PLAN_TIER_ORDER.indexOf(planTier1);
  const index2 = PLAN_TIER_ORDER.indexOf(planTier2);
  return index1 >= index2;
}

// Aliases for router compatibility
export const canAccessStudyDifficulty = canAccessDifficulty;
export const canAccessQuizLevel = canAccessLevel;
export const getRequiredStudyPlanTier = getMinimumPlanForDifficulty;
export const getRequiredQuizPlanTier = getMinimumPlanForLevel;

/**
 * Get suggested upgrade tier based on blocked content
 * Always suggests intermediate for free users, otherwise suggests the required tier
 */
export function getSuggestedUpgradeTier(requiredTier: PlanTier, userTier: PlanTier): PlanTier {
  // If user is free and needs any paid tier, suggest intermediate
  if (userTier === "free" && requiredTier !== "free") {
    return "intermediate";
  }

  // Otherwise, suggest the required tier
  return requiredTier;
}
