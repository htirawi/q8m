/**
 * Paywall Component Props & Types
 */

import type { PlanTier } from "@shared/types/plan";

export interface InlineUpsellCardProps {
  title: string;
  subtitle: string;
  targetPlan: PlanTier;
  benefits?: string[];
  ctaText?: string;
}

// Alias for backwards compatibility
export interface IInlineUpsellCardProps extends InlineUpsellCardProps {}

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
  (e: "dismiss"): void;
  (e: "close"): void;
  (e: "upgrade"): void;
}
