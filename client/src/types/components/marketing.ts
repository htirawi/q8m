/**
 * Marketing Component Props & Types
 */

import type { PlanId, BillingCycle } from "@/types/domain/pricing";

export interface IPaymentCheckoutModalProps {
  open: boolean;
  planId?: PlanId;
  billingCycle?: BillingCycle;
}

export interface IPaymentCheckoutModalEmits {
  (e: "close"): void;
  (e: "success"): void;
}

export interface IPlanComparisonCardProps {
  planId: PlanId;
  title: string;
  description: string;
  price: number;
  currency: string;
  features: string[];
  popular?: boolean;
  recommended?: boolean;
}

export interface IComparisonFeature {
  name: string;
  included: boolean;
  tooltip?: string;
}

export interface IPlanConversionModalProps {
  open: boolean;
  targetPlan?: PlanId;
  currentPlan?: PlanId;
}

export interface IPlanConversionModalEmits {
  (e: "close"): void;
  (e: "converted", planId: PlanId): void;
}

export interface IPlanUpsellModalProps {
  open: boolean;
  feature?: string;
}

export interface IPlanUpsellModalEmits {
  (e: "close"): void;
  (e: "upgrade", planId: PlanId): void;
}

export interface IFaq {
  question: string;
  answer: string;
}

