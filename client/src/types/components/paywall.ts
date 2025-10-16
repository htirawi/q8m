/**
 * Paywall Component Props & Types
 */

import type { PlanTier } from "@shared/types/plan";

export interface InlineUpsellCardProps {
  feature: string;
  requiredPlan: PlanTier;
  benefits?: string[];
  ctaText?: string;
}

export interface ILockedBadgeProps {
  requiredPlan: PlanTier;
  size?: "sm" | "md" | "lg";
}

export interface ISoftPaywallModalProps {
  isVisible: boolean;
  targetRoute?: string;
  suggestedPlan?: PlanTier;
}

export interface ISoftPaywallModalEmits {
  (e: "close"): void;
  (e: "upgrade"): void;
}

