/**
 * Canonical Plan-to-Mode Mapping
 * Single source of truth for routing users based on their plan tier
 * Enforces: Free→Easy/Junior, Intermediate→Medium/Intermediate, Senior→Hard/Senior, Bundle→Medium+Hard/Intermediate+Senior
 */

import type { PlanTier } from "@shared/types/plan";
import type { DifficultyLevel, ExperienceLevel } from "@/types/plan/access";

export type IntentMode = "study" | "quiz";

export interface PlanIntent {
  mode: IntentMode;
  desired: DifficultyLevel | ExperienceLevel | "bundle";
  locale: string;
}

/**
 * Plan-to-Study difficulty mapping
 * Free → Easy, Intermediate → Medium, Advanced/Pro → Hard (Bundle behavior)
 */
const PLAN_TO_STUDY_MAP: Record<PlanTier, DifficultyLevel> = {
  free: "easy",
  intermediate: "medium",
  advanced: "hard",
  pro: "medium", // Bundle: default to Medium, but grants Hard too
};

/**
 * Plan-to-Quiz level mapping
 * Free → Junior, Intermediate → Intermediate, Advanced/Pro → Senior (Bundle behavior)
 */
const PLAN_TO_QUIZ_MAP: Record<PlanTier, ExperienceLevel> = {
  free: "junior",
  intermediate: "intermediate",
  advanced: "senior",
  pro: "intermediate", // Bundle: default to Intermediate, but grants Senior too
};

/**
 * Check if a plan has Bundle behavior (access to both tiers)
 * Pro plan acts as Bundle, granting access to both Medium+Hard / Intermediate+Senior
 */
export function isBundlePlan(tier: PlanTier): boolean {
  return tier === "pro";
}

/**
 * Get the default landing page (level selection) for all users
 * This is the unified entry point where users choose their level and mode
 */
export function getDefaultLandingPage(locale: string = "en"): string {
  return `/${locale}/select`;
}

/**
 * Get the Study target route for a given plan tier
 * Bundle (pro) yields medium by default, with UI also exposing Hard
 */
export function getStudyTargetFor(tier: PlanTier, locale: string = "en"): string {
  const difficulty = PLAN_TO_STUDY_MAP[tier];
  return `/${locale}/study/${difficulty}`;
}

/**
 * Get the Quiz target route for a given plan tier
 * Bundle (pro) yields intermediate by default, with UI also exposing Senior
 */
export function getQuizTargetFor(tier: PlanTier, locale: string = "en"): string {
  const level = PLAN_TO_QUIZ_MAP[tier];
  return `/${locale}/quiz/${level}`;
}

/**
 * Get all accessible difficulties for a plan (for UI visibility)
 * Bundle plans get both Medium and Hard
 */
export function getAccessibleStudyDifficulties(tier: PlanTier): DifficultyLevel[] {
  if (tier === "free") return ["easy"];
  if (tier === "intermediate") return ["easy", "medium"];
  if (tier === "advanced") return ["easy", "medium", "hard"];
  if (tier === "pro") return ["easy", "medium", "hard"]; // Bundle: all
  return ["easy"];
}

/**
 * Get all accessible quiz levels for a plan (for UI visibility)
 * Bundle plans get both Intermediate and Senior
 */
export function getAccessibleQuizLevels(tier: PlanTier): ExperienceLevel[] {
  if (tier === "free") return ["junior"];
  if (tier === "intermediate") return ["junior", "intermediate"];
  if (tier === "advanced") return ["junior", "intermediate", "senior"];
  if (tier === "pro") return ["junior", "intermediate", "senior"]; // Bundle: all
  return ["junior"];
}

/**
 * Build an intent-encoded redirect URL for pre-auth capture
 * Returns a relative path only (safe from open redirects)
 */
export function buildIntentRedirectUrl(
  mode: IntentMode,
  desired: DifficultyLevel | ExperienceLevel | "bundle",
  locale: string = "en"
): string {
  const base = `/${locale}/login`;
  const target = mode === "study" ? `/${locale}/study/${desired}` : `/${locale}/quiz/${desired}`;
  const encodedTarget = encodeURIComponent(target);
  return `${base}?signInSuccessUrl=${encodedTarget}`;
}

/**
 * Decode intent from signInSuccessUrl
 * Returns parsed intent or null if invalid
 */
export function decodeIntentFromUrl(url: string): PlanIntent | null {
  // Must be relative path
  if (!url.startsWith("/")) return null;

  // Extract locale, mode, and desired from path like "/en/study/medium" or "/ar/quiz/senior"
  const match = url.match(/^\/([a-z]{2})\/(study|quiz)\/([a-z]+)$/);
  if (!match) return null;

  const [, locale, mode, desired] = match;

  // Validate mode
  if (mode !== "study" && mode !== "quiz") return null;

  // Ensure locale and desired are defined
  if (!locale || !desired) return null;

  return {
    mode: mode as IntentMode,
    desired: desired as DifficultyLevel | ExperienceLevel | "bundle",
    locale,
  };
}

/**
 * Resolve the target route after login based on user's plan and intent
 * If intent was "bundle", route to the default for that plan (medium/intermediate) with Bundle UI
 */
export function resolvePostLoginTarget(
  userTier: PlanTier,
  intent: PlanIntent | null,
  locale: string
): string {
  // If no intent, use default landing based on plan
  if (!intent) {
    return getStudyTargetFor(userTier, locale);
  }

  // If intent is bundle, respect it for pro users, otherwise use plan default
  if (intent.desired === "bundle") {
    if (isBundlePlan(userTier)) {
      // Pro user accessing bundle: route to medium/intermediate with Bundle UI
      return intent.mode === "study" ? `/${locale}/study/medium` : `/${locale}/quiz/intermediate`;
    }
    // Non-bundle user: redirect to their plan's default
    return intent.mode === "study"
      ? getStudyTargetFor(userTier, locale)
      : getQuizTargetFor(userTier, locale);
  }

  // Specific intent: route to that target (guards will handle access control)
  const targetPath =
    intent.mode === "study"
      ? `/${locale}/study/${intent.desired}`
      : `/${locale}/quiz/${intent.desired}`;

  return targetPath;
}
