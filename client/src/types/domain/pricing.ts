/**
 * Pricing Domain Types
 */

export type PlanId = "junior" | "intermediate" | "senior" | "bundle";
export type BillingCycle = "monthly" | "yearly" | "annual";
export type PlanTier = "JUNIOR" | "INTERMEDIATE" | "SENIOR" | "BUNDLE";

export interface Plan {
  id: string;
  tier: PlanTier;
  titleKey: string;
  descriptionKey?: string;
  priceMonthly: number;
  priceYearly: number;
  currency: "USD" | "JOD" | "SAR";
  featuresKeys: string[];
  badgeKey?: string;
  ctaLabelKey: string;
  ctaHref: string;
  guaranteeDays?: number;
  popular?: boolean;
  recommended?: boolean;
}

export interface Feature {
  icon: string;
  titleKey: string;
  descriptionKey: string;
}

export interface ComparisonRow {
  featureKey: string;
  junior: boolean | string;
  intermediate: boolean | string;
  senior: boolean | string;
  bundle: boolean | string;
}

export interface FAQ {
  questionKey: string;
  answerKey: string;
}
