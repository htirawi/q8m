import { describe, it, expect } from 'vitest';
import {
  PLANS,
  getPlanById,
  getPlanByTier,
  getHomepagePlans,
  getPricingPlans,
} from '@/config/plans';
import type { PlanId } from '@/types/pricing';
import type { PlanTier } from '@shared/types/plan';

describe('Plan Registry Integrity', () => {
  it('should have exactly 4 plans defined', () => {
    expect(PLANS).toHaveLength(4);
  });

  it('should have all required plan IDs', () => {
    const planIds: PlanId[] = ['junior', 'intermediate', 'senior', 'bundle'];
    planIds.forEach((id) => {
      const plan = getPlanById(id);
      expect(plan).toBeDefined();
      expect(plan?.id).toBe(id);
    });
  });

  it('should have correct tier mapping', () => {
    expect(getPlanByTier('free')?.id).toBe('junior');
    expect(getPlanByTier('intermediate')?.id).toBe('intermediate');
    expect(getPlanByTier('advanced')?.id).toBe('senior');
    expect(getPlanByTier('pro')?.id).toBe('bundle');
  });

  it('should have consistent pricing (annual < 12 × monthly)', () => {
    PLANS.filter((p) => p.priceMonthly > 0).forEach((plan) => {
      const monthlyCost = plan.priceMonthly * 12;
      expect(plan.priceYearly).toBeLessThan(monthlyCost);
      // Verify at least 10% savings
      const savings = monthlyCost - plan.priceYearly;
      const savingsPercent = (savings / monthlyCost) * 100;
      expect(savingsPercent).toBeGreaterThanOrEqual(10);
    });
  });

  it('should have correct study items progression', () => {
    expect(getPlanById('junior')?.features.studyItems).toBe(50);
    expect(getPlanById('intermediate')?.features.studyItems).toBe(200);
    expect(getPlanById('senior')?.features.studyItems).toBe(300);
    expect(getPlanById('bundle')?.features.studyItems).toBe(300);
  });

  it('should have correct quiz questions progression', () => {
    expect(getPlanById('junior')?.features.quizQuestions).toBe(50);
    expect(getPlanById('intermediate')?.features.quizQuestions).toBe(250);
    expect(getPlanById('senior')?.features.quizQuestions).toBe(350);
    expect(getPlanById('bundle')?.features.quizQuestions).toBe(350);
  });

  it('should have i18n keys for all plan names', () => {
    PLANS.forEach((plan) => {
      expect(plan.labelKey).toMatch(/^plans\.\w+\.name$/);
      expect(plan.descriptionKey).toMatch(/^plans\.\w+\.description$/);
      expect(plan.cta.labelKey).toMatch(/^plans\.\w+\.cta$/);
    });
  });

  it('should have i18n keys for all benefits', () => {
    PLANS.forEach((plan) => {
      plan.features.benefits.forEach((benefitKey) => {
        expect(benefitKey).toMatch(/^plans\.\w+\.benefits\.\w+$/);
      });
    });
  });

  it('should mark Intermediate as featured', () => {
    const intermediate = getPlanById('intermediate');
    expect(intermediate?.metadata.featured).toBe(true);

    // Other plans should not be featured
    expect(getPlanById('junior')?.metadata.featured).toBe(false);
    expect(getPlanById('senior')?.metadata.featured).toBe(false);
    expect(getPlanById('bundle')?.metadata.featured).toBe(false);
  });

  it('should have correct badges', () => {
    const intermediate = getPlanById('intermediate');
    expect(intermediate?.badge?.textKey).toBe('plans.badges.mostPopular');
    expect(intermediate?.badge?.color).toBe('blue');

    const bundle = getPlanById('bundle');
    expect(bundle?.badge?.textKey).toBe('plans.badges.bestValue');
    expect(bundle?.badge?.color).toBe('gold');
  });

  it('should have correct sort order', () => {
    expect(getPlanById('junior')?.metadata.sortOrder).toBe(1);
    expect(getPlanById('intermediate')?.metadata.sortOrder).toBe(2);
    expect(getPlanById('senior')?.metadata.sortOrder).toBe(3);
    expect(getPlanById('bundle')?.metadata.sortOrder).toBe(4);
  });

  it('should have all plans shown on pricing page', () => {
    const pricingPlans = getPricingPlans();
    expect(pricingPlans).toHaveLength(4);
    expect(pricingPlans.map((p) => p.id)).toEqual([
      'junior',
      'intermediate',
      'senior',
      'bundle',
    ]);
  });

  it('should have all plans shown on homepage', () => {
    const homepagePlans = getHomepagePlans();
    expect(homepagePlans).toHaveLength(4);
    expect(homepagePlans.map((p) => p.id)).toEqual([
      'junior',
      'intermediate',
      'senior',
      'bundle',
    ]);
  });

  it('should have correct AI support flags', () => {
    expect(getPlanById('junior')?.features.aiSupport).toBe(false);
    expect(getPlanById('intermediate')?.features.aiSupport).toBe(false);
    expect(getPlanById('senior')?.features.aiSupport).toBe(true);
    expect(getPlanById('bundle')?.features.aiSupport).toBe(true);
  });

  it('should have correct CTA actions', () => {
    expect(getPlanById('junior')?.cta.action).toBe('register');
    expect(getPlanById('intermediate')?.cta.action).toBe('checkout');
    expect(getPlanById('senior')?.cta.action).toBe('checkout');
    expect(getPlanById('bundle')?.cta.action).toBe('checkout');
  });

  it('should have correct reassurance items', () => {
    const junior = getPlanById('junior');
    expect(junior?.reassurance.items).toContain('pricing.reassurance.noCreditCard');

    const intermediate = getPlanById('intermediate');
    expect(intermediate?.reassurance.items).toContain('pricing.reassurance.cancelAnytime');
    expect(intermediate?.reassurance.items).toContain('pricing.reassurance.securePayments');
    expect(intermediate?.reassurance.items).toContain('pricing.reassurance.noHiddenFees');
  });

  it('should have correct money-back guarantee periods', () => {
    expect(getPlanById('junior')?.metadata.guaranteeDays).toBe(0);
    expect(getPlanById('intermediate')?.metadata.guaranteeDays).toBe(7);
    expect(getPlanById('senior')?.metadata.guaranteeDays).toBe(7);
    expect(getPlanById('bundle')?.metadata.guaranteeDays).toBe(7);
  });
});

describe('Price Formatting', () => {
  it('should format prices correctly', () => {
    const junior = getPlanById('junior');
    expect(junior?.priceMonthly).toBe(0);
    expect(junior?.priceYearly).toBe(0);

    const intermediate = getPlanById('intermediate');
    expect(intermediate?.priceMonthly).toBe(10);
    expect(intermediate?.priceYearly).toBe(100);

    const senior = getPlanById('senior');
    expect(senior?.priceMonthly).toBe(15);
    expect(senior?.priceYearly).toBe(150);

    const bundle = getPlanById('bundle');
    expect(bundle?.priceMonthly).toBe(20);
    expect(bundle?.priceYearly).toBe(200);
  });

  it('should have USD currency for all plans', () => {
    PLANS.forEach((plan) => {
      expect(plan.currency).toBe('USD');
    });
  });
});

describe('Plan Registry Snapshots', () => {
  it('should match plan data snapshot', () => {
    const planSnapshot = PLANS.map((plan) => ({
      id: plan.id,
      labelKey: plan.labelKey,
      priceMonthly: plan.priceMonthly,
      priceYearly: plan.priceYearly,
      studyItems: plan.features.studyItems,
      quizQuestions: plan.features.quizQuestions,
      benefits: plan.features.benefits,
    }));

    expect(planSnapshot).toMatchSnapshot();
  });
});
