/**
 * Pricing Route Composable
 * Handles legacy URL mapping (pro/expert/easy/medium/hard → canonical plan IDs)
 * Provides 301 redirects for SEO and analytics tracking for legacy URLs
 */

import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import type { PlanId, BillingCycle } from '@/types/pricing';
import { useAnalytics } from '@/composables/useAnalytics';

export interface IResolvedPlan {
  planId: PlanId;
  billing: BillingCycle;
  isLegacy: boolean; // true if URL had legacy param
  originalParam?: string; // Original query param for analytics
}

/**
 * Legacy plan mapping
 * Maps old query params to canonical plan IDs
 */
const LEGACY_PLAN_MAP: Record<string, PlanId> = {
  // Old marketing names
  'pro': 'intermediate',
  'expert': 'senior',
  'premium': 'bundle',

  // Study/Quiz difficulty levels
  'easy': 'junior',
  'medium': 'intermediate',
  'hard': 'senior',

  // Pass-through canonical IDs
  'junior': 'junior',
  'intermediate': 'intermediate',
  'senior': 'senior',
  'bundle': 'bundle',

  // Free tier aliases
  'free': 'junior',
  'basic': 'junior',
};

/**
 * Legacy billing cycle mapping
 */
const LEGACY_BILLING_MAP: Record<string, BillingCycle> = {
  'month': 'monthly',
  'monthly': 'monthly',
  'year': 'annual',
  'yearly': 'annual',
  'annual': 'annual',
};

export function usePricingRoute() {
  const route = useRoute();
  const router = useRouter();
  const { track } = useAnalytics();

  /**
   * Resolve plan from query params (handles legacy URLs)
   */
  const resolvedPlan = computed((): IResolvedPlan | null => {
    const planParam = route.query.plan as string | undefined;
    const billingParam = route.query.billing as string | undefined;

    if (!planParam) return null;

    const normalizedPlan = planParam.toLowerCase().trim();
    const planId = LEGACY_PLAN_MAP[normalizedPlan];

    if (!planId) {
      console.warn(`[usePricingRoute] Unknown plan param: ${planParam}`);
      return null;
    }

    const billing: BillingCycle = billingParam
      ? LEGACY_BILLING_MAP[billingParam.toLowerCase().trim()] || 'monthly'
      : 'monthly';

    const isLegacy = normalizedPlan !== planId;

    return {
      planId,
      billing,
      isLegacy,
      originalParam: isLegacy ? normalizedPlan : undefined,
    };
  });

  /**
   * Redirect to canonical URL (301) if legacy params detected
   * Tracks legacy redirects for analytics
   */
  const redirectToCanonical = (): void => {
    const resolved = resolvedPlan.value;
    if (!resolved || !resolved.isLegacy) return;

    // Track legacy redirect
    track('legacy_plan_redirected', {
      from: resolved.originalParam,
      to: resolved.planId,
      billing: resolved.billing,
    });

    // Build canonical URL
    const locale = route.params.locale || 'en';

    router.replace({
      path: `/${locale}/pricing`,
      query: {
        plan: resolved.planId,
        billing: resolved.billing,
        // Preserve other query params (e.g., coupon, source)
        ...(route.query.coupon && { coupon: route.query.coupon }),
        ...(route.query.source && { source: route.query.source }),
      },
    });
  };

  /**
   * Check if current URL has legacy parameters
   */
  const hasLegacyParams = computed((): boolean => {
    return resolvedPlan.value?.isLegacy ?? false;
  });

  /**
   * Build pricing URL with plan and billing
   */
  const buildPricingUrl = (planId: PlanId, billing: BillingCycle = 'monthly'): string => {
    const locale = route.params.locale || 'en';
    return `/${locale}/pricing?plan=${planId}&billing=${billing}`;
  };

  return {
    resolvedPlan,
    redirectToCanonical,
    hasLegacyParams,
    buildPricingUrl,
  };
}
