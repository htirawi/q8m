/**
 * Pricing Type Definitions
 * Types for pricing plans, billing cycles, and payment information
 */

/**
 * Billing cycle options
 */
export type BillingCycle = "monthly" | "annual";

/**
 * Plan identifier
 */
export type PlanId = "junior" | "intermediate" | "senior" | "bundle";

/**
 * Full pricing plan details
 */
export interface IPricingPlan {
  id: PlanId;
  name: string;
  nameKey?: string;
  description: string;
  descriptionKey?: string;
  priceMonthly: number;
  priceYearly: number;
  features: string[];
  featureKeys?: string[];
  popular: boolean;
  ctaText?: string;
  ctaTextKey?: string;
  badge?: string;
  badgeKey?: string;
}

/**
 * Billing information
 */
export interface IBillingInfo {
  cycle: BillingCycle;
  price: number;
  currency: string;
  savings?: number;
  savingsPercentage?: number;
}

/**
 * Plan comparison feature
 */
export interface IPlanFeature {
  id: string;
  name: string;
  nameKey?: string;
  free: boolean;
  pro: boolean;
  expert: boolean;
}

/**
 * Pricing card display configuration
 */
export interface IPricingCardConfig {
  showBadge: boolean;
  showMonthlyPrice: boolean;
  showYearlyPrice: boolean;
  showSavings: boolean;
  highlightPopular: boolean;
  buttonVariant: "primary" | "secondary" | "outline";
}
