/**
 * Plan Types
 * Defines subscription plans and access levels
 */

export type PlanTier = "free" | "intermediate" | "advanced" | "pro";

export type ExperienceLevel = "junior" | "intermediate" | "senior";

export interface Plan {
  id: string;
  tier: PlanTier;
  name: string;
  displayName: string;
  description: string;
  features: string[];
  isActive: boolean;
  startedAt?: Date;
  expiresAt?: Date;
  isTrial?: boolean;
}

export interface PlanFeatureAccess {
  tier: PlanTier;
  accessLevel: "free" | "paid" | "paid:intermediate" | "paid:advanced" | "paid:pro";
}

/**
 * Helper to check if a user's plan meets required access level
 */
export const hasAccessLevel = (
  userTier: PlanTier,
  requiredLevel: PlanFeatureAccess["accessLevel"]
): boolean => {
  const tierHierarchy: Record<PlanTier, number> = {
    free: 0,
    intermediate: 1,
    advanced: 2,
    pro: 3,
  };

  if (requiredLevel === "free") {
    return true; // Everyone has free access
  }

  if (requiredLevel === "paid") {
    return userTier !== "free"; // Any paid plan
  }

  // Specific tier requirements
  const requiredTier = requiredLevel.replace("paid:", "") as PlanTier;
  return tierHierarchy[userTier] >= tierHierarchy[requiredTier];
};
