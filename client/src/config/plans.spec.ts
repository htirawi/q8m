/**
 * Unit tests for Canonical Plan Registry
 * Tests plan configuration integrity, helper functions, and mappings
 */

import { describe, it, expect } from 'vitest';
import {
  PLANS,
  getPlanById,
  getPlanByTier,
  getHomepagePlans,
  getPricingPlans,
  DIFFICULTY_TO_PLAN_ID,
  EXPERIENCE_TO_PLAN_ID,
} from '@/config/plans';
import type { PlanId } from '@/types/pricing';
import type { PlanTier } from '@shared/types/plan';

describe('Canonical Plan Registry', () => {
  describe('PLANS constant', () => {
    it('should contain exactly 4 plans', () => {
      expect(PLANS).toHaveLength(4);
    });

    it('should have all required plan IDs', () => {
      const planIds = PLANS.map((p) => p.id);
      expect(planIds).toEqual(['junior', 'intermediate', 'senior', 'bundle']);
    });

    it('should have all plans with valid structure', () => {
      PLANS.forEach((plan) => {
        // Core properties
        expect(plan.id).toBeDefined();
        expect(plan.tier).toBeDefined();
        expect(plan.labelKey).toBeDefined();
        expect(plan.descriptionKey).toBeDefined();
        expect(typeof plan.priceMonthly).toBe('number');
        expect(typeof plan.priceYearly).toBe('number');
        expect(plan.currency).toBe('USD');

        // Features
        expect(plan.features).toBeDefined();
        expect(typeof plan.features.studyItems).toBe('number');
        expect(typeof plan.features.quizQuestions).toBe('number');
        expect(typeof plan.features.aiSupport).toBe('boolean');
        expect(['low', 'medium', 'high']).toContain(plan.features.priority);
        expect(Array.isArray(plan.features.benefits)).toBe(true);
        expect(plan.features.benefits.length).toBeGreaterThan(0);

        // CTA
        expect(plan.cta).toBeDefined();
        expect(plan.cta.labelKey).toBeDefined();
        expect(['register', 'checkout']).toContain(plan.cta.action);

        // Visual
        expect(plan.visual).toBeDefined();
        expect(plan.visual.icon).toBeDefined();
        expect(plan.visual.gradient).toBeDefined();
        expect(plan.visual.accentColor).toMatch(/^#[0-9a-f]{6}$/i);

        // Metadata
        expect(plan.metadata).toBeDefined();
        expect(typeof plan.metadata.sortOrder).toBe('number');
        expect(typeof plan.metadata.showOnHomepage).toBe('boolean');
        expect(typeof plan.metadata.showOnPricing).toBe('boolean');
        expect(typeof plan.metadata.guaranteeDays).toBe('number');
      });
    });

    it('should have unique plan IDs', () => {
      const planIds = PLANS.map((p) => p.id);
      const uniqueIds = new Set(planIds);
      expect(uniqueIds.size).toBe(planIds.length);
    });

    it('should have unique sort orders', () => {
      const sortOrders = PLANS.map((p) => p.metadata.sortOrder);
      const uniqueOrders = new Set(sortOrders);
      expect(uniqueOrders.size).toBe(sortOrders.length);
    });

    it('should have junior plan as free tier', () => {
      const junior = PLANS.find((p) => p.id === 'junior');
      expect(junior).toBeDefined();
      expect(junior!.tier).toBe('free');
      expect(junior!.priceMonthly).toBe(0);
      expect(junior!.priceYearly).toBe(0);
      expect(junior!.cta.action).toBe('register');
    });

    it('should have intermediate plan with "Most Popular" badge', () => {
      const intermediate = PLANS.find((p) => p.id === 'intermediate');
      expect(intermediate).toBeDefined();
      expect(intermediate!.badge).toBeDefined();
      expect(intermediate!.badge!.textKey).toBe('plans.badges.mostPopular');
    });

    it('should have bundle plan with "Best Value" badge', () => {
      const bundle = PLANS.find((p) => p.id === 'bundle');
      expect(bundle).toBeDefined();
      expect(bundle!.badge).toBeDefined();
      expect(bundle!.badge!.textKey).toBe('plans.badges.bestValue');
    });

    it('should have valid pricing structure', () => {
      PLANS.forEach((plan) => {
        expect(plan.priceMonthly).toBeGreaterThanOrEqual(0);
        expect(plan.priceYearly).toBeGreaterThanOrEqual(0);

        // Yearly should be <= monthly * 12 (discount expected)
        if (plan.priceMonthly > 0) {
          expect(plan.priceYearly).toBeLessThanOrEqual(plan.priceMonthly * 12);
        }
      });
    });

    it('should have ascending feature counts by tier', () => {
      const junior = PLANS.find((p) => p.id === 'junior');
      const intermediate = PLANS.find((p) => p.id === 'intermediate');
      const senior = PLANS.find((p) => p.id === 'senior');

      expect(junior!.features.studyItems).toBeLessThan(intermediate!.features.studyItems);
      expect(intermediate!.features.studyItems).toBeLessThanOrEqual(senior!.features.studyItems);

      expect(junior!.features.quizQuestions).toBeLessThan(intermediate!.features.quizQuestions);
      expect(intermediate!.features.quizQuestions).toBeLessThanOrEqual(senior!.features.quizQuestions);
    });
  });

  describe('getPlanById()', () => {
    it('should return plan for valid ID', () => {
      const plan = getPlanById('junior');
      expect(plan).toBeDefined();
      expect(plan!.id).toBe('junior');
    });

    it('should return undefined for invalid ID', () => {
      const plan = getPlanById('nonexistent' as PlanId);
      expect(plan).toBeUndefined();
    });

    it('should return correct plan for each canonical ID', () => {
      const ids: PlanId[] = ['junior', 'intermediate', 'senior', 'bundle'];
      ids.forEach((id) => {
        const plan = getPlanById(id);
        expect(plan).toBeDefined();
        expect(plan!.id).toBe(id);
      });
    });
  });

  describe('getPlanByTier()', () => {
    it('should return plan for valid tier', () => {
      const plan = getPlanByTier('free');
      expect(plan).toBeDefined();
      expect(plan!.tier).toBe('free');
      expect(plan!.id).toBe('junior');
    });

    it('should return undefined for invalid tier', () => {
      const plan = getPlanByTier('nonexistent' as PlanTier);
      expect(plan).toBeUndefined();
    });

    it('should map tiers to correct plan IDs', () => {
      const tierMap: Record<PlanTier, PlanId> = {
        free: 'junior',
        intermediate: 'intermediate',
        advanced: 'senior',
        pro: 'bundle',
      };

      Object.entries(tierMap).forEach(([tier, expectedId]) => {
        const plan = getPlanByTier(tier as PlanTier);
        expect(plan).toBeDefined();
        expect(plan!.id).toBe(expectedId);
      });
    });
  });

  describe('getHomepagePlans()', () => {
    it('should return plans marked for homepage', () => {
      const plans = getHomepagePlans();
      expect(plans.length).toBeGreaterThan(0);
      plans.forEach((plan) => {
        expect(plan.metadata.showOnHomepage).toBe(true);
      });
    });

    it('should return plans in sort order', () => {
      const plans = getHomepagePlans();
      const sortOrders = plans.map((p) => p.metadata.sortOrder);

      // Check if sorted ascending
      for (let i = 1; i < sortOrders.length; i++) {
        expect(sortOrders[i]!).toBeGreaterThanOrEqual(sortOrders[i - 1]!);
      }
    });

    it('should include all 4 canonical plans', () => {
      const plans = getHomepagePlans();
      expect(plans).toHaveLength(4);

      const planIds = plans.map((p) => p.id);
      expect(planIds).toContain('junior');
      expect(planIds).toContain('intermediate');
      expect(planIds).toContain('senior');
      expect(planIds).toContain('bundle');
    });
  });

  describe('getPricingPlans()', () => {
    it('should return plans marked for pricing page', () => {
      const plans = getPricingPlans();
      expect(plans.length).toBeGreaterThan(0);
      plans.forEach((plan) => {
        expect(plan.metadata.showOnPricing).toBe(true);
      });
    });

    it('should return plans in sort order', () => {
      const plans = getPricingPlans();
      const sortOrders = plans.map((p) => p.metadata.sortOrder);

      // Check if sorted ascending
      for (let i = 1; i < sortOrders.length; i++) {
        expect(sortOrders[i]!).toBeGreaterThanOrEqual(sortOrders[i - 1]!);
      }
    });

    it('should include all 3 pricing plans (excludes free junior plan)', () => {
      const plans = getPricingPlans();
      expect(plans).toHaveLength(3);
    });
  });

  describe('DIFFICULTY_TO_PLAN_ID mapping', () => {
    it('should map easy to junior', () => {
      expect(DIFFICULTY_TO_PLAN_ID.easy).toBe('junior');
    });

    it('should map medium to intermediate', () => {
      expect(DIFFICULTY_TO_PLAN_ID.medium).toBe('intermediate');
    });

    it('should map hard to senior', () => {
      expect(DIFFICULTY_TO_PLAN_ID.hard).toBe('senior');
    });

    it('should contain exactly 3 mappings', () => {
      const keys = Object.keys(DIFFICULTY_TO_PLAN_ID);
      expect(keys).toHaveLength(3);
      expect(keys).toEqual(['easy', 'medium', 'hard']);
    });

    it('should map to valid plan IDs', () => {
      Object.values(DIFFICULTY_TO_PLAN_ID).forEach((planId) => {
        const plan = getPlanById(planId);
        expect(plan).toBeDefined();
      });
    });
  });

  describe('EXPERIENCE_TO_PLAN_ID mapping', () => {
    it('should map junior to junior', () => {
      expect(EXPERIENCE_TO_PLAN_ID.junior).toBe('junior');
    });

    it('should map intermediate to intermediate', () => {
      expect(EXPERIENCE_TO_PLAN_ID.intermediate).toBe('intermediate');
    });

    it('should map senior to senior', () => {
      expect(EXPERIENCE_TO_PLAN_ID.senior).toBe('senior');
    });

    it('should contain exactly 3 mappings', () => {
      const keys = Object.keys(EXPERIENCE_TO_PLAN_ID);
      expect(keys).toHaveLength(3);
      expect(keys).toEqual(['junior', 'intermediate', 'senior']);
    });

    it('should map to valid plan IDs', () => {
      Object.values(EXPERIENCE_TO_PLAN_ID).forEach((planId) => {
        const plan = getPlanById(planId);
        expect(plan).toBeDefined();
      });
    });
  });

  describe('i18n key integrity', () => {
    it('should have consistent i18n key patterns', () => {
      PLANS.forEach((plan) => {
        // Plan name keys
        expect(plan.labelKey).toMatch(/^plans\.[a-z]+\.name$/);

        // Description keys
        expect(plan.descriptionKey).toMatch(/^plans\.[a-z]+\.description$/);

        // CTA keys
        expect(plan.cta.labelKey).toMatch(/^plans\.[a-z]+\.cta$/);

        // Feature benefit keys
        plan.features.benefits.forEach((benefitKey) => {
          expect(benefitKey).toMatch(/^plans\.[a-z]+\.benefits\.[a-zA-Z]+$/);
        });

        // Badge keys (if present)
        if (plan.badge) {
          expect(plan.badge.textKey).toMatch(/^plans\.badges\.[a-zA-Z]+$/);
        }
      });
    });
  });

  describe('Business rules validation', () => {
    it('should have only junior plan with register CTA', () => {
      const registerPlans = PLANS.filter((p) => p.cta.action === 'register');
      expect(registerPlans).toHaveLength(1);
      expect(registerPlans[0]!.id).toBe('junior');
    });

    it('should have paid plans with checkout CTA', () => {
      const checkoutPlans = PLANS.filter((p) => p.cta.action === 'checkout');
      expect(checkoutPlans).toHaveLength(3);
      checkoutPlans.forEach((plan) => {
        expect(plan.priceMonthly).toBeGreaterThan(0);
      });
    });

    it('should have money-back guarantee for paid plans', () => {
      PLANS.forEach((plan) => {
        if (plan.priceMonthly > 0) {
          expect(plan.metadata.guaranteeDays).toBeGreaterThan(0);
        } else {
          expect(plan.metadata.guaranteeDays).toBe(0);
        }
      });
    });

    it('should have AI support only for senior and bundle', () => {
      const aiPlans = PLANS.filter((p) => p.features.aiSupport);
      expect(aiPlans).toHaveLength(2);
      expect(aiPlans.map((p) => p.id)).toEqual(['senior', 'bundle']);
    });
  });
});
