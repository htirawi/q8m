import { describe, it, expect, beforeEach, vi } from "vitest";
import { usePlans } from "@/composables/usePlans";
import type { IPlanConfig } from "@/config/plans";

// Mock i18n
const mockT = vi.fn((key: string, params?: Record<string, any>) => {
  // Simple mock that returns the key with params
  if (params) {
    return `${key}:${JSON.stringify(params)}`;
  }
  return key;
});

vi.mock("vue-i18n", () => ({
  useI18n: () => ({
    t: mockT,
  }),
}));

// Mock plan data for testing
vi.mock("@/config/plans", () => {
  const mockPlans: IPlanConfig[] = [
    {
      id: "junior",
      labelKey: "plans.junior.name",
      descriptionKey: "plans.junior.description",
      tier: "free",
      priceMonthly: 0,
      priceYearly: 0,
      currency: "USD",
      features: {
        studyItems: 50,
        quizQuestions: 50,
        aiSupport: false,
        benefits: ["plans.junior.benefits.studyItems"],
      },
      visual: { icon: "🎓", color: "blue" },
      badge: null,
      cta: {
        labelKey: "plans.junior.cta",
        action: "register",
      },
      reassurance: {
        items: ["pricing.reassurance.noCreditCard"],
      },
      metadata: {
        sortOrder: 1,
        showOnHomepage: true,
        showOnPricing: true,
        guaranteeDays: 0,
        featured: false,
      },
    },
    {
      id: "intermediate",
      labelKey: "plans.intermediate.name",
      descriptionKey: "plans.intermediate.description",
      tier: "intermediate",
      priceMonthly: 10,
      priceYearly: 100,
      currency: "USD",
      features: {
        studyItems: 200,
        quizQuestions: 250,
        aiSupport: false,
        benefits: ["plans.intermediate.benefits.studyItems"],
      },
      visual: { icon: "🚀", color: "blue" },
      badge: {
        textKey: "plans.badges.mostPopular",
        color: "blue",
      },
      cta: {
        labelKey: "plans.intermediate.cta",
        action: "checkout",
      },
      reassurance: {
        items: ["pricing.reassurance.cancelAnytime"],
      },
      metadata: {
        sortOrder: 2,
        showOnHomepage: true,
        showOnPricing: true,
        guaranteeDays: 7,
        featured: true,
      },
    },
    {
      id: "senior",
      labelKey: "plans.senior.name",
      descriptionKey: "plans.senior.description",
      tier: "advanced",
      priceMonthly: 15,
      priceYearly: 150,
      currency: "USD",
      features: {
        studyItems: 300,
        quizQuestions: 350,
        aiSupport: true,
        benefits: ["plans.senior.benefits.studyItems"],
      },
      visual: { icon: "⭐", color: "gold" },
      badge: null,
      cta: {
        labelKey: "plans.senior.cta",
        action: "checkout",
      },
      reassurance: {
        items: ["pricing.reassurance.cancelAnytime"],
      },
      metadata: {
        sortOrder: 3,
        showOnHomepage: true,
        showOnPricing: true,
        guaranteeDays: 7,
        featured: false,
      },
    },
    {
      id: "bundle",
      labelKey: "plans.bundle.name",
      descriptionKey: "plans.bundle.description",
      tier: "pro",
      priceMonthly: 20,
      priceYearly: 200,
      currency: "USD",
      features: {
        studyItems: 300,
        quizQuestions: 350,
        aiSupport: true,
        benefits: ["plans.bundle.benefits.studyItems"],
      },
      visual: { icon: "💎", color: "gold" },
      badge: {
        textKey: "plans.badges.bestValue",
        color: "gold",
      },
      cta: {
        labelKey: "plans.bundle.cta",
        action: "checkout",
      },
      reassurance: {
        items: ["pricing.reassurance.cancelAnytime"],
      },
      metadata: {
        sortOrder: 4,
        showOnHomepage: true,
        showOnPricing: true,
        guaranteeDays: 7,
        featured: false,
      },
    },
  ];

  return {
    PLANS: mockPlans,
    getPlanById: (id: string) => mockPlans.find((p) => p.id === id),
    getPlanByTier: (tier: string) => mockPlans.find((p) => p.tier === tier),
    getHomepagePlans: () => mockPlans.filter((p) => p.metadata.showOnHomepage),
    getPricingPlans: () => mockPlans.filter((p) => p.metadata.showOnPricing),
  };
});

describe("usePlans", () => {
  beforeEach(() => {
    mockT.mockClear();
  });

  describe("Plan Lists", () => {
    it("should return all plans", () => {
      const { allPlans } = usePlans();
      expect(allPlans.value).toHaveLength(4);
      expect(allPlans.value.map((p) => p.id)).toEqual([
        "junior",
        "intermediate",
        "senior",
        "bundle",
      ]);
    });

    it("should return homepage plans", () => {
      const { homepagePlans } = usePlans();
      expect(homepagePlans.value).toHaveLength(4);
      expect(homepagePlans.value.every((p) => p.metadata.showOnHomepage)).toBe(true);
    });

    it("should return pricing page plans", () => {
      const { pricingPlans } = usePlans();
      expect(pricingPlans.value).toHaveLength(4);
      expect(pricingPlans.value.every((p) => p.metadata.showOnPricing)).toBe(true);
    });
  });

  describe("Plan Getters", () => {
    it("should get plan by ID", () => {
      const { getPlan } = usePlans();
      const plan = getPlan("intermediate");

      expect(plan).toBeDefined();
      expect(plan?.id).toBe("intermediate");
      expect(plan?.priceMonthly).toBe(10);
    });

    it("should return undefined for unknown plan ID", () => {
      const { getPlan } = usePlans();
      const plan = getPlan("unknown" as any);

      expect(plan).toBeUndefined();
    });

    it("should get plan by backend tier", () => {
      const { getPlanByBackendTier } = usePlans();
      const plan = getPlanByBackendTier("intermediate");

      expect(plan).toBeDefined();
      expect(plan?.id).toBe("intermediate");
    });

    it('should map "free" tier to "junior" plan', () => {
      const { getPlanByBackendTier } = usePlans();
      const plan = getPlanByBackendTier("free");

      expect(plan?.id).toBe("junior");
    });

    it('should map "advanced" tier to "senior" plan', () => {
      const { getPlanByBackendTier } = usePlans();
      const plan = getPlanByBackendTier("advanced");

      expect(plan?.id).toBe("senior");
    });

    it('should map "pro" tier to "bundle" plan', () => {
      const { getPlanByBackendTier } = usePlans();
      const plan = getPlanByBackendTier("pro");

      expect(plan?.id).toBe("bundle");
    });
  });

  describe("Price Utilities", () => {
    it("should calculate price info correctly", () => {
      const { getPlan, getPlanPrice } = usePlans();
      const plan = getPlan("intermediate")!;
      const priceInfo = getPlanPrice(plan);

      expect(priceInfo.monthly).toBe(10);
      expect(priceInfo.annual).toBe(100);
      expect(priceInfo.currency).toBe("USD");
      expect(priceInfo.annualSavings).toBe(20); // 10*12 - 100 = 20
      expect(priceInfo.annualSavingsPercent).toBe(17); // Math.round((20/120)*100) = 17
    });

    it("should handle free plan pricing", () => {
      const { getPlan, getPlanPrice } = usePlans();
      const plan = getPlan("junior")!;
      const priceInfo = getPlanPrice(plan);

      expect(priceInfo.monthly).toBe(0);
      expect(priceInfo.annual).toBe(0);
      expect(priceInfo.annualSavings).toBe(0);
      expect(priceInfo.annualSavingsPercent).toBe(0);
    });

    it("should format monthly price correctly", () => {
      const { getPlan, getFormattedPrice } = usePlans();
      const plan = getPlan("intermediate")!;
      const price = getFormattedPrice(plan, "monthly");

      expect(price).toBe("$10");
    });

    it("should format annual price correctly", () => {
      const { getPlan, getFormattedPrice } = usePlans();
      const plan = getPlan("intermediate")!;
      const price = getFormattedPrice(plan, "annual");

      expect(price).toBe("$100");
    });

    it("should format free plan price", () => {
      const { getPlan, getFormattedPrice } = usePlans();
      const plan = getPlan("junior")!;
      const price = getFormattedPrice(plan, "monthly");

      expect(price).toBe("pricing.free");
      expect(mockT).toHaveBeenCalledWith("pricing.free");
    });

    it("should default to monthly billing when not specified", () => {
      const { getPlan, getFormattedPrice } = usePlans();
      const plan = getPlan("intermediate")!;
      const price = getFormattedPrice(plan);

      expect(price).toBe("$10");
    });

    it("should get period label for monthly billing", () => {
      const { getPeriodLabel } = usePlans();
      const label = getPeriodLabel("monthly");

      expect(mockT).toHaveBeenCalledWith("pricing.billing.perMonth");
    });

    it("should get period label for annual billing", () => {
      const { getPeriodLabel } = usePlans();
      const label = getPeriodLabel("annual");

      expect(mockT).toHaveBeenCalledWith("pricing.billing.perYear");
    });

    it("should calculate annual savings message", () => {
      const { getPlan, getAnnualSavingsMessage } = usePlans();
      const plan = getPlan("intermediate")!;
      const message = getAnnualSavingsMessage(plan);

      // 10*12 - 100 = 20 savings, 20/10 = 2 months saved
      expect(mockT).toHaveBeenCalledWith("pricing.billing.saveMonths", { months: 2 });
    });

    it("should return null for free plan savings message", () => {
      const { getPlan, getAnnualSavingsMessage } = usePlans();
      const plan = getPlan("junior")!;
      const message = getAnnualSavingsMessage(plan);

      expect(message).toBeNull();
    });
  });

  describe("Feature Formatting", () => {
    it("should format study items with totals mode", () => {
      const { getPlan, getStudyItemsLabel } = usePlans();
      const plan = getPlan("intermediate")!;
      const label = getStudyItemsLabel(plan, "totals");

      expect(mockT).toHaveBeenCalledWith("plans.features.studyItemsCount", { count: 200 });
    });

    it("should format quiz questions with totals mode", () => {
      const { getPlan, getQuizQuestionsLabel } = usePlans();
      const plan = getPlan("intermediate")!;
      const label = getQuizQuestionsLabel(plan, "totals");

      expect(mockT).toHaveBeenCalledWith("plans.features.quizQuestionsCount", {
        count: 250,
      });
    });

    it("should format study items with deltas mode", () => {
      const { getPlan, getStudyItemsLabel } = usePlans();
      const plan = getPlan("intermediate")!;
      const label = getStudyItemsLabel(plan, "deltas");

      // 200 - 50 = 150 delta
      expect(mockT).toHaveBeenCalledWith("plans.features.studyItemsDelta", {
        delta: 150,
        total: 200,
      });
    });

    it("should format quiz questions with deltas mode", () => {
      const { getPlan, getQuizQuestionsLabel } = usePlans();
      const plan = getPlan("intermediate")!;
      const label = getQuizQuestionsLabel(plan, "deltas");

      // 250 - 50 = 200 delta
      expect(mockT).toHaveBeenCalledWith("plans.features.quizQuestionsDelta", {
        delta: 200,
        total: 250,
      });
    });

    it("should format study items with totals-with-deltas mode", () => {
      const { getPlan, getStudyItemsLabel } = usePlans();
      const plan = getPlan("senior")!;
      const label = getStudyItemsLabel(plan, "totals-with-deltas");

      // 300 - 50 = 250 delta
      expect(mockT).toHaveBeenCalledWith("plans.features.studyItemsTotalsWithDeltas", {
        total: 300,
        delta: 250,
      });
    });

    it("should not show delta for junior plan", () => {
      const { getPlan, getStudyItemsLabel } = usePlans();
      const plan = getPlan("junior")!;
      const label = getStudyItemsLabel(plan, "deltas");

      // Junior is baseline, so shows totals
      expect(mockT).toHaveBeenCalledWith("plans.features.studyItemsCount", { count: 50 });
    });

    it("should default to totals mode when not specified", () => {
      const { getPlan, getStudyItemsLabel } = usePlans();
      const plan = getPlan("intermediate")!;
      const label = getStudyItemsLabel(plan);

      expect(mockT).toHaveBeenCalledWith("plans.features.studyItemsCount", { count: 200 });
    });
  });

  describe("Display Utilities", () => {
    it("should identify featured plan", () => {
      const { getPlan, isFeaturedPlan } = usePlans();
      const plan = getPlan("intermediate")!;

      expect(isFeaturedPlan(plan)).toBe(true);
    });

    it("should identify non-featured plan", () => {
      const { getPlan, isFeaturedPlan } = usePlans();
      const plan = getPlan("junior")!;

      expect(isFeaturedPlan(plan)).toBe(false);
    });

    it("should get plan badge", () => {
      const { getPlan, getPlanBadge } = usePlans();
      const plan = getPlan("intermediate")!;
      const badge = getPlanBadge(plan);

      expect(badge).toBeDefined();
      expect(badge?.color).toBe("blue");
      expect(mockT).toHaveBeenCalledWith("plans.badges.mostPopular");
    });

    it("should return null for plan without badge", () => {
      const { getPlan, getPlanBadge } = usePlans();
      const plan = getPlan("junior")!;
      const badge = getPlanBadge(plan);

      expect(badge).toBeNull();
    });

    it("should get plan CTA label", () => {
      const { getPlan, getPlanCTALabel } = usePlans();
      const plan = getPlan("intermediate")!;
      getPlanCTALabel(plan);

      expect(mockT).toHaveBeenCalledWith("plans.intermediate.cta");
    });

    it("should get plan reassurance items", () => {
      const { getPlan, getPlanReassurance } = usePlans();
      const plan = getPlan("intermediate")!;
      const items = getPlanReassurance(plan);

      expect(items).toHaveLength(1);
      expect(mockT).toHaveBeenCalledWith("pricing.reassurance.cancelAnytime");
    });

    it("should get multiple reassurance items", () => {
      const { getPlan, getPlanReassurance } = usePlans();
      const plan = getPlan("junior")!;
      const items = getPlanReassurance(plan);

      expect(items).toHaveLength(1);
      expect(mockT).toHaveBeenCalledWith("pricing.reassurance.noCreditCard");
    });
  });

  describe("Edge Cases", () => {
    it("should handle senior plan with highest features", () => {
      const { getPlan, getPlanPrice } = usePlans();
      const plan = getPlan("senior")!;
      const priceInfo = getPlanPrice(plan);

      expect(plan.features.studyItems).toBe(300);
      expect(plan.features.quizQuestions).toBe(350);
      expect(plan.features.aiSupport).toBe(true);
      expect(priceInfo.monthly).toBe(15);
      expect(priceInfo.annual).toBe(150);
    });

    it("should handle bundle plan pricing", () => {
      const { getPlan, getPlanPrice } = usePlans();
      const plan = getPlan("bundle")!;
      const priceInfo = getPlanPrice(plan);

      expect(priceInfo.monthly).toBe(20);
      expect(priceInfo.annual).toBe(200);
      expect(priceInfo.annualSavings).toBe(40); // 20*12 - 200 = 40
      expect(priceInfo.annualSavingsPercent).toBe(17); // Math.round((40/240)*100) = 17
    });
  });
});
