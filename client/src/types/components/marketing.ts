/**
 * Marketing Component Props & Types
 */

import type { PlanId, BillingCycle } from "@/types/domain/pricing";

export interface IPaymentCheckoutModalProps {
  show: boolean;
  planId?: PlanId;
  billing?: BillingCycle;
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
  targetPlan?: string;
}

export interface IComparisonFeature {
  name: string;
  label?: string; // Alias for name
  included?: boolean; // Deprecated, use plan-specific properties
  tooltip?: string;
  target?: string;
  // Plan-specific availability
  free?: boolean | string;
  junior?: boolean | string;
  intermediate?: boolean | string;
  senior?: boolean | string;
  bundle?: boolean | string;
}

export interface IPlanConversionModalProps {
  open: boolean;
  isVisible?: boolean; // Alias for open
  targetPlan?: PlanId;
  currentPlan?: PlanId;
  requiredPlan?: PlanId | string;
  difficulty?: string;
  selectedDifficulty?: string;
  reassurance?: string;
  variant?: string;
}

export interface IPlanConversionModalEmits {
  (e: "close"): void;
  (e: "converted", planId: PlanId): void;
}

export interface IPlanUpsellModalProps {
  open: boolean;
  isVisible?: boolean; // Alias for open
  feature?: string;
  requiredPlan?: PlanId | string;
  difficulty?: string;
  selectedDifficulty?: string;
  target?: string;
  contentId?: string;
  reassurance?: string;
  variant?: string;
}

export interface IPlanUpsellModalEmits {
  (e: "close"): void;
  (e: "upgrade", planId: PlanId): void;
}

export interface IFaq {
  question: string;
  answer: string;
}
