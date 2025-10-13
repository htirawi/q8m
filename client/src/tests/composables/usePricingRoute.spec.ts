import { describe, it, expect, beforeEach, vi } from 'vitest';
import { usePricingRoute } from '@/composables/usePricingRoute';
import type { PlanId } from '@/types/pricing';

// Mock vue-router
const mockRoute = {
  params: { locale: 'en' },
  query: {},
};

const mockReplace = vi.fn();
const mockRouter = {
  replace: mockReplace,
};

vi.mock('vue-router', () => ({
  useRoute: () => mockRoute,
  useRouter: () => mockRouter,
}));

// Mock analytics
const mockTrackGenericEvent = vi.fn();
vi.mock('@/composables/useAnalytics', () => ({
  useAnalytics: () => ({
    trackGenericEvent: mockTrackGenericEvent,
  }),
}));

describe('usePricingRoute', () => {
  beforeEach(() => {
    // Reset mocks
    mockReplace.mockClear();
    mockTrackGenericEvent.mockClear();
    mockRoute.query = {};
    mockRoute.params = { locale: 'en' };
  });

  describe('resolvedPlan', () => {
    it('should return null when no plan param', () => {
      mockRoute.query = {};
      const { resolvedPlan } = usePricingRoute();
      expect(resolvedPlan.value).toBeNull();
    });

    it('should resolve canonical plan IDs', () => {
      mockRoute.query = { plan: 'intermediate', billing: 'monthly' };
      const { resolvedPlan } = usePricingRoute();

      expect(resolvedPlan.value).toEqual({
        planId: 'intermediate',
        billing: 'monthly',
        isLegacy: false,
        originalParam: undefined,
      });
    });

    it('should map legacy plan "pro" to "intermediate"', () => {
      mockRoute.query = { plan: 'pro', billing: 'month' };
      const { resolvedPlan } = usePricingRoute();

      expect(resolvedPlan.value).toEqual({
        planId: 'intermediate',
        billing: 'monthly',
        isLegacy: true,
        originalParam: 'pro',
      });
    });

    it('should map legacy plan "expert" to "senior"', () => {
      mockRoute.query = { plan: 'expert', billing: 'year' };
      const { resolvedPlan } = usePricingRoute();

      expect(resolvedPlan.value).toEqual({
        planId: 'senior',
        billing: 'annual',
        isLegacy: true,
        originalParam: 'expert',
      });
    });

    it('should map legacy plan "easy" to "junior"', () => {
      mockRoute.query = { plan: 'easy' };
      const { resolvedPlan } = usePricingRoute();

      expect(resolvedPlan.value).toEqual({
        planId: 'junior',
        billing: 'monthly',
        isLegacy: true,
        originalParam: 'easy',
      });
    });

    it('should map legacy plan "medium" to "intermediate"', () => {
      mockRoute.query = { plan: 'medium' };
      const { resolvedPlan } = usePricingRoute();

      expect(resolvedPlan.value?.planId).toBe('intermediate');
      expect(resolvedPlan.value?.isLegacy).toBe(true);
    });

    it('should map legacy plan "hard" to "senior"', () => {
      mockRoute.query = { plan: 'hard' };
      const { resolvedPlan } = usePricingRoute();

      expect(resolvedPlan.value?.planId).toBe('senior');
      expect(resolvedPlan.value?.isLegacy).toBe(true);
    });

    it('should map legacy plan "premium" to "bundle"', () => {
      mockRoute.query = { plan: 'premium' };
      const { resolvedPlan } = usePricingRoute();

      expect(resolvedPlan.value?.planId).toBe('bundle');
      expect(resolvedPlan.value?.isLegacy).toBe(true);
    });

    it('should map legacy plan "free" to "junior"', () => {
      mockRoute.query = { plan: 'free' };
      const { resolvedPlan } = usePricingRoute();

      expect(resolvedPlan.value?.planId).toBe('junior');
      expect(resolvedPlan.value?.isLegacy).toBe(true);
    });

    it('should map legacy plan "basic" to "junior"', () => {
      mockRoute.query = { plan: 'basic' };
      const { resolvedPlan } = usePricingRoute();

      expect(resolvedPlan.value?.planId).toBe('junior');
      expect(resolvedPlan.value?.isLegacy).toBe(true);
    });

    it('should handle case-insensitive plan params', () => {
      mockRoute.query = { plan: 'INTERMEDIATE' };
      const { resolvedPlan } = usePricingRoute();

      expect(resolvedPlan.value?.planId).toBe('intermediate');
    });

    it('should handle plan params with whitespace', () => {
      mockRoute.query = { plan: '  intermediate  ' };
      const { resolvedPlan } = usePricingRoute();

      expect(resolvedPlan.value?.planId).toBe('intermediate');
    });

    it('should default to monthly billing when billing param missing', () => {
      mockRoute.query = { plan: 'intermediate' };
      const { resolvedPlan } = usePricingRoute();

      expect(resolvedPlan.value?.billing).toBe('monthly');
    });

    it('should map legacy billing "month" to "monthly"', () => {
      mockRoute.query = { plan: 'intermediate', billing: 'month' };
      const { resolvedPlan } = usePricingRoute();

      expect(resolvedPlan.value?.billing).toBe('monthly');
    });

    it('should map legacy billing "year" to "annual"', () => {
      mockRoute.query = { plan: 'intermediate', billing: 'year' };
      const { resolvedPlan } = usePricingRoute();

      expect(resolvedPlan.value?.billing).toBe('annual');
    });

    it('should map legacy billing "yearly" to "annual"', () => {
      mockRoute.query = { plan: 'intermediate', billing: 'yearly' };
      const { resolvedPlan } = usePricingRoute();

      expect(resolvedPlan.value?.billing).toBe('annual');
    });

    it('should return null for unknown plan param', () => {
      mockRoute.query = { plan: 'unknown-plan' };
      const { resolvedPlan } = usePricingRoute();

      expect(resolvedPlan.value).toBeNull();
    });
  });

  describe('redirectToCanonical', () => {
    it('should not redirect for canonical URLs', () => {
      mockRoute.query = { plan: 'intermediate', billing: 'monthly' };
      const { redirectToCanonical } = usePricingRoute();

      redirectToCanonical();

      expect(mockReplace).not.toHaveBeenCalled();
      expect(mockTrackGenericEvent).not.toHaveBeenCalled();
    });

    it('should redirect legacy plan "pro" to "intermediate"', () => {
      mockRoute.query = { plan: 'pro', billing: 'month' };
      mockRoute.params = { locale: 'en' };
      const { redirectToCanonical } = usePricingRoute();

      redirectToCanonical();

      expect(mockTrackGenericEvent).toHaveBeenCalledWith('legacy_plan_redirected', {
        from: 'pro',
        to: 'intermediate',
        billing: 'monthly',
      });

      expect(mockReplace).toHaveBeenCalledWith({
        path: '/en/pricing',
        query: {
          plan: 'intermediate',
          billing: 'monthly',
        },
      });
    });

    it('should redirect legacy plan "expert" to "senior"', () => {
      mockRoute.query = { plan: 'expert', billing: 'year' };
      mockRoute.params = { locale: 'en' };
      const { redirectToCanonical } = usePricingRoute();

      redirectToCanonical();

      expect(mockTrackGenericEvent).toHaveBeenCalledWith('legacy_plan_redirected', {
        from: 'expert',
        to: 'senior',
        billing: 'annual',
      });

      expect(mockReplace).toHaveBeenCalledWith({
        path: '/en/pricing',
        query: {
          plan: 'senior',
          billing: 'annual',
        },
      });
    });

    it('should preserve coupon query param during redirect', () => {
      mockRoute.query = { plan: 'pro', coupon: 'SAVE20' };
      const { redirectToCanonical } = usePricingRoute();

      redirectToCanonical();

      expect(mockReplace).toHaveBeenCalledWith({
        path: '/en/pricing',
        query: {
          plan: 'intermediate',
          billing: 'monthly',
          coupon: 'SAVE20',
        },
      });
    });

    it('should preserve source query param during redirect', () => {
      mockRoute.query = { plan: 'expert', source: 'email-campaign' };
      const { redirectToCanonical } = usePricingRoute();

      redirectToCanonical();

      expect(mockReplace).toHaveBeenCalledWith({
        path: '/en/pricing',
        query: {
          plan: 'senior',
          billing: 'monthly',
          source: 'email-campaign',
        },
      });
    });

    it('should use Arabic locale when present', () => {
      mockRoute.query = { plan: 'pro' };
      mockRoute.params = { locale: 'ar' };
      const { redirectToCanonical } = usePricingRoute();

      redirectToCanonical();

      expect(mockReplace).toHaveBeenCalledWith({
        path: '/ar/pricing',
        query: {
          plan: 'intermediate',
          billing: 'monthly',
        },
      });
    });

    it('should default to "en" locale when not specified', () => {
      mockRoute.query = { plan: 'pro' };
      mockRoute.params = {};
      const { redirectToCanonical } = usePricingRoute();

      redirectToCanonical();

      expect(mockReplace).toHaveBeenCalledWith({
        path: '/en/pricing',
        query: {
          plan: 'intermediate',
          billing: 'monthly',
        },
      });
    });
  });

  describe('hasLegacyParams', () => {
    it('should return false for canonical URLs', () => {
      mockRoute.query = { plan: 'intermediate' };
      const { hasLegacyParams } = usePricingRoute();

      expect(hasLegacyParams.value).toBe(false);
    });

    it('should return true for legacy plan params', () => {
      mockRoute.query = { plan: 'pro' };
      const { hasLegacyParams } = usePricingRoute();

      expect(hasLegacyParams.value).toBe(true);
    });

    it('should return false when no plan param', () => {
      mockRoute.query = {};
      const { hasLegacyParams } = usePricingRoute();

      expect(hasLegacyParams.value).toBe(false);
    });
  });

  describe('buildPricingUrl', () => {
    it('should build URL with plan and default monthly billing', () => {
      mockRoute.params = { locale: 'en' };
      const { buildPricingUrl } = usePricingRoute();

      const url = buildPricingUrl('intermediate' as PlanId);

      expect(url).toBe('/en/pricing?plan=intermediate&billing=monthly');
    });

    it('should build URL with plan and annual billing', () => {
      mockRoute.params = { locale: 'en' };
      const { buildPricingUrl } = usePricingRoute();

      const url = buildPricingUrl('senior' as PlanId, 'annual');

      expect(url).toBe('/en/pricing?plan=senior&billing=annual');
    });

    it('should use Arabic locale when present', () => {
      mockRoute.params = { locale: 'ar' };
      const { buildPricingUrl } = usePricingRoute();

      const url = buildPricingUrl('bundle' as PlanId, 'annual');

      expect(url).toBe('/ar/pricing?plan=bundle&billing=annual');
    });

    it('should default to "en" locale when not specified', () => {
      mockRoute.params = {};
      const { buildPricingUrl } = usePricingRoute();

      const url = buildPricingUrl('junior' as PlanId);

      expect(url).toBe('/en/pricing?plan=junior&billing=monthly');
    });
  });
});
