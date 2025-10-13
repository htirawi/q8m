/**
 * Plans Composable
 * Provides access to canonical plan registry with utility functions
 * Handles number-copy display modes (totals vs deltas)
 */

import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import {
  PLANS,
  getPlanById,
  getPlanByTier,
  getHomepagePlans,
  getPricingPlans,
  type IPlanConfig,
} from '@/config/plans';
import type { PlanId, BillingCycle } from '@/types/pricing';
import type { PlanTier } from '@shared/types/plan';

export type NumberCopyMode = 'totals' | 'deltas' | 'totals-with-deltas';

export interface IPlanPrice {
  monthly: number;
  annual: number;
  currency: string;
  annualSavings: number;
  annualSavingsPercent: number;
}

export function usePlans() {
  const { t } = useI18n();

  /**
   * Get all plans from registry
   */
  const allPlans = computed((): IPlanConfig[] => PLANS);

  /**
   * Get plans for homepage display
   */
  const homepagePlans = computed((): IPlanConfig[] => getHomepagePlans());

  /**
   * Get plans for pricing page display
   */
  const pricingPlans = computed((): IPlanConfig[] => getPricingPlans());

  /**
   * Get plan by ID
   */
  const getPlan = (id: PlanId): IPlanConfig | undefined => {
    return getPlanById(id);
  };

  /**
   * Get plan by tier (for backend mapping)
   */
  const getPlanByBackendTier = (tier: PlanTier): IPlanConfig | undefined => {
    return getPlanByTier(tier);
  };

  /**
   * Calculate price info for a plan
   */
  const getPlanPrice = (plan: IPlanConfig): IPlanPrice => {
    const monthlyCost = plan.priceMonthly * 12;
    const annualCost = plan.priceYearly;
    const savings = monthlyCost - annualCost;
    const savingsPercent = monthlyCost > 0 ? Math.round((savings / monthlyCost) * 100) : 0;

    return {
      monthly: plan.priceMonthly,
      annual: plan.priceYearly,
      currency: plan.currency,
      annualSavings: savings,
      annualSavingsPercent: savingsPercent,
    };
  };

  /**
   * Get formatted price for display
   */
  const getFormattedPrice = (
    plan: IPlanConfig,
    billing: BillingCycle = 'monthly'
  ): string => {
    const price = billing === 'monthly' ? plan.priceMonthly : plan.priceYearly;

    if (price === 0) {
      return t('pricing.free');
    }

    return `$${price}`;
  };

  /**
   * Get period label for billing cycle
   */
  const getPeriodLabel = (billing: BillingCycle): string => {
    return billing === 'monthly'
      ? t('pricing.billing.perMonth')
      : t('pricing.billing.perYear');
  };

  /**
   * Format study items count with optional delta
   */
  const getStudyItemsLabel = (
    plan: IPlanConfig,
    mode: NumberCopyMode = 'totals'
  ): string => {
    const total = plan.features.studyItems;
    const baselinePlan = getPlanById('junior');

    if (mode === 'totals' || !baselinePlan || plan.id === 'junior') {
      return t('plans.features.studyItemsCount', { count: total });
    }

    const delta = total - baselinePlan.features.studyItems;

    if (mode === 'deltas') {
      return t('plans.features.studyItemsDelta', { delta, total });
    }

    // mode === 'totals-with-deltas'
    return t('plans.features.studyItemsTotalsWithDeltas', { total, delta });
  };

  /**
   * Format quiz questions count with optional delta
   */
  const getQuizQuestionsLabel = (
    plan: IPlanConfig,
    mode: NumberCopyMode = 'totals'
  ): string => {
    const total = plan.features.quizQuestions;
    const baselinePlan = getPlanById('junior');

    if (mode === 'totals' || !baselinePlan || plan.id === 'junior') {
      return t('plans.features.quizQuestionsCount', { count: total });
    }

    const delta = total - baselinePlan.features.quizQuestions;

    if (mode === 'deltas') {
      return t('plans.features.quizQuestionsDelta', { delta, total });
    }

    // mode === 'totals-with-deltas'
    return t('plans.features.quizQuestionsTotalsWithDeltas', { total, delta });
  };

  /**
   * Get savings message for annual billing
   */
  const getAnnualSavingsMessage = (plan: IPlanConfig): string | null => {
    if (plan.priceMonthly === 0) return null;

    const priceInfo = getPlanPrice(plan);
    const monthsSaved = Math.round(priceInfo.annualSavings / plan.priceMonthly);

    if (monthsSaved < 1) return null;

    return t('pricing.billing.saveMonths', { months: monthsSaved });
  };

  /**
   * Check if plan is featured (should be scaled/highlighted)
   */
  const isFeaturedPlan = (plan: IPlanConfig): boolean => {
    return plan.metadata.featured ?? false;
  };

  /**
   * Get badge info for plan
   */
  const getPlanBadge = (plan: IPlanConfig): { text: string; color: string } | null => {
    if (!plan.badge) return null;

    return {
      text: t(plan.badge.textKey),
      color: plan.badge.color,
    };
  };

  /**
   * Get plan CTA label
   */
  const getPlanCTALabel = (plan: IPlanConfig): string => {
    return t(plan.cta.labelKey);
  };

  /**
   * Get plan reassurance items
   */
  const getPlanReassurance = (plan: IPlanConfig): string[] => {
    return plan.reassurance.items.map((key) => t(key));
  };

  return {
    // Plan lists
    allPlans,
    homepagePlans,
    pricingPlans,

    // Plan getters
    getPlan,
    getPlanByBackendTier,

    // Price utilities
    getPlanPrice,
    getFormattedPrice,
    getPeriodLabel,
    getAnnualSavingsMessage,

    // Feature formatting
    getStudyItemsLabel,
    getQuizQuestionsLabel,

    // Display utilities
    isFeaturedPlan,
    getPlanBadge,
    getPlanCTALabel,
    getPlanReassurance,
  };
}
