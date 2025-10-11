/**
 * Pricing Service Types
 *
 * Type definitions for pricing and subscription plans
 */

import type { PricingInfo } from "./currency";

export interface PlanPricing {
  planId: string;
  name: string;
  description: string;
  features: string[];
  usdPrice: number;
  pricing: Record<string, PricingInfo>;
  popular?: boolean;
  recommended?: boolean;
}

export interface PricingTier {
  id: "JUNIOR" | "INTERMEDIATE" | "SENIOR" | "BUNDLE";
  name: string;
  description: string;
  features: string[];
  monthlyPrice: number;
  yearlyPrice: number;
  isPopular: boolean;
  isRecommended: boolean;
}
