/**
 * Framework Access Control Configuration
 * Defines which plan tiers can access which frameworks
 * This configuration serves as the default/fallback, but should be stored in MongoDB for flexibility
 */

import type { PlanTier } from "@shared/types/plan";

export type FrameworkType = "angular" | "react" | "nextjs" | "redux" | "vue" | "random";

export interface FrameworkAccessRule {
  framework: FrameworkType;
  requiredPlanTier: PlanTier;
  displayName: string;
  description: string;
  isActive: boolean;
}

/**
 * Framework Access Rules
 * Defines minimum required plan tier for each framework
 *
 * Access hierarchy:
 * - Free: React only (1 framework)
 * - Intermediate: React + Angular (2 frameworks)
 * - Advanced: React + Angular + Next.js + Redux (4 frameworks)
 * - Pro: All frameworks including Vue (5 frameworks) + Random
 */
export const FRAMEWORK_ACCESS_RULES: Record<FrameworkType, FrameworkAccessRule> = {
  react: {
    framework: "react",
    requiredPlanTier: "free",
    displayName: "React",
    description: "Available to all users",
    isActive: true,
  },
  angular: {
    framework: "angular",
    requiredPlanTier: "intermediate",
    displayName: "Angular",
    description: "Requires Intermediate plan or higher",
    isActive: true,
  },
  nextjs: {
    framework: "nextjs",
    requiredPlanTier: "advanced",
    displayName: "Next.js",
    description: "Requires Advanced plan or higher",
    isActive: true,
  },
  redux: {
    framework: "redux",
    requiredPlanTier: "advanced",
    displayName: "Redux",
    description: "Requires Advanced plan or higher",
    isActive: true,
  },
  vue: {
    framework: "vue",
    requiredPlanTier: "pro",
    displayName: "Vue",
    description: "Requires Pro plan",
    isActive: true,
  },
  random: {
    framework: "random",
    requiredPlanTier: "free",
    displayName: "Random Mix",
    description: "Available to all users (limited to accessible frameworks)",
    isActive: true,
  },
};

/**
 * Plan tier hierarchy for comparison
 */
export const PLAN_TIER_HIERARCHY: Record<PlanTier, number> = {
  free: 0,
  intermediate: 1,
  advanced: 2,
  pro: 3,
};

/**
 * Check if a user's plan tier can access a specific framework
 */
export function canAccessFramework(userTier: PlanTier, framework: FrameworkType): boolean {
  const rule = FRAMEWORK_ACCESS_RULES[framework];

  if (!rule || !rule.isActive) {
    return false;
  }

  const userLevel = PLAN_TIER_HIERARCHY[userTier];
  const requiredLevel = PLAN_TIER_HIERARCHY[rule.requiredPlanTier];

  return userLevel >= requiredLevel;
}

/**
 * Get all accessible frameworks for a plan tier
 */
export function getAccessibleFrameworks(userTier: PlanTier): FrameworkType[] {
  return (Object.keys(FRAMEWORK_ACCESS_RULES) as FrameworkType[]).filter((framework) =>
    canAccessFramework(userTier, framework)
  );
}

/**
 * Get the minimum required plan tier for a framework
 */
export function getRequiredPlanForFramework(framework: FrameworkType): PlanTier {
  const rule = FRAMEWORK_ACCESS_RULES[framework];
  return rule?.requiredPlanTier || "pro"; // Default to highest tier if not found
}

/**
 * Get human-readable plan name
 */
export function getPlanDisplayName(tier: PlanTier): string {
  const displayNames: Record<PlanTier, string> = {
    free: "Free",
    intermediate: "Intermediate",
    advanced: "Advanced",
    pro: "Pro",
  };
  return displayNames[tier] || tier;
}

/**
 * Get suggested upgrade tier for a blocked framework
 * Always suggests the minimum required tier
 */
export function getSuggestedUpgradeTier(framework: FrameworkType, userTier: PlanTier): PlanTier {
  const requiredTier = getRequiredPlanForFramework(framework);

  // If user is free and framework requires paid, suggest intermediate as entry point
  if (userTier === "free" && requiredTier !== "free") {
    // But if framework specifically requires advanced/pro, suggest that
    if (requiredTier === "advanced" || requiredTier === "pro") {
      return requiredTier;
    }
    return "intermediate";
  }

  return requiredTier;
}

/**
 * Framework metadata for UI display
 */
export interface FrameworkMetadata {
  framework: FrameworkType;
  icon: string;
  title: string;
  color: 'red' | 'black' | 'blue' | 'purple' | 'gray' | 'gradient';
  order: number;
}

export const FRAMEWORK_METADATA: Record<FrameworkType, FrameworkMetadata> = {
  angular: {
    framework: "angular",
    icon: "🅰️",
    title: "Angular",
    color: "red",
    order: 1,
  },
  nextjs: {
    framework: "nextjs",
    icon: "▲",
    title: "Next.js",
    color: "black",
    order: 2,
  },
  react: {
    framework: "react",
    icon: "⚛️",
    title: "React",
    color: "blue",
    order: 3,
  },
  redux: {
    framework: "redux",
    icon: "🔄",
    title: "Redux",
    color: "purple",
    order: 4,
  },
  vue: {
    framework: "vue",
    icon: "💚",
    title: "Vue",
    color: "gray",
    order: 5,
  },
  random: {
    framework: "random",
    icon: "🎲",
    title: "Random Mix",
    color: "gradient",
    order: 6,
  },
};
