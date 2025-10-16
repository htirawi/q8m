/**
 * Subscription Constants
 *
 * Subscription plans and cancellation-related constants.
 */

export interface ICancelReason {
  id: string;
  label: string;
  requiresComment?: boolean;
}

export const CANCEL_REASONS: ICancelReason[] = [
  {
    id: "too-expensive",
    label: "Too expensive",
    requiresComment: false,
  },
  {
    id: "not-using",
    label: "Not using the service enough",
    requiresComment: false,
  },
  {
    id: "found-alternative",
    label: "Found a better alternative",
    requiresComment: true,
  },
  {
    id: "missing-features",
    label: "Missing features I need",
    requiresComment: true,
  },
  {
    id: "technical-issues",
    label: "Technical issues",
    requiresComment: true,
  },
  {
    id: "other",
    label: "Other reason",
    requiresComment: true,
  },
];

export const PLAN_TIERS = {
  JUNIOR: "JUNIOR",
  INTERMEDIATE: "INTERMEDIATE",
  SENIOR: "SENIOR",
  BUNDLE: "BUNDLE",
} as const;

export type PlanTier = (typeof PLAN_TIERS)[keyof typeof PLAN_TIERS];

export const BILLING_CYCLES = {
  MONTHLY: "monthly",
  YEARLY: "yearly",
} as const;

export type BillingCycle = (typeof BILLING_CYCLES)[keyof typeof BILLING_CYCLES];
