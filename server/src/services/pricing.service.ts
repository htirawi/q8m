import { currencyService, PricingInfo } from "./currency.service.js";

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

export class PricingService {
  private static instance: PricingService;

  // Base pricing in USD
  private readonly basePricing: Record<string, { monthly: number; yearly: number }> = {
    JUNIOR: { monthly: 0, yearly: 0 }, // Free tier
    INTERMEDIATE: { monthly: 29.99, yearly: 299.99 }, // ~$25/month with yearly discount
    SENIOR: { monthly: 49.99, yearly: 499.99 }, // ~$42/month with yearly discount
    BUNDLE: { monthly: 79.99, yearly: 799.99 }, // ~$67/month with yearly discount
  };

  private readonly planFeatures: Record<string, string[]> = {
    JUNIOR: [
      "Basic quiz access",
      "Limited question attempts",
      "Community support",
      "Basic analytics",
    ],
    INTERMEDIATE: [
      "All Junior features",
      "Advanced quiz categories",
      "Unlimited question attempts",
      "Priority support",
      "Detailed analytics",
      "Progress tracking",
      "Certificate generation",
    ],
    SENIOR: [
      "All Intermediate features",
      "Expert-level content",
      "1-on-1 mentoring sessions",
      "Custom study plans",
      "Advanced analytics dashboard",
      "API access",
      "White-label options",
    ],
    BUNDLE: [
      "All features from all tiers",
      "Enterprise support",
      "Custom integrations",
      "Dedicated account manager",
      "Advanced reporting",
      "Multi-user accounts",
      "Custom branding",
      "SLA guarantees",
    ],
  };

  private readonly planDescriptions: Record<string, string> = {
    JUNIOR: "Perfect for beginners who want to explore our quiz platform with basic features.",
    INTERMEDIATE: "Ideal for serious learners who need advanced tools and unlimited access.",
    SENIOR: "For professionals who want expert-level content and personalized guidance.",
    BUNDLE: "Complete solution for teams and organizations with enterprise needs.",
  };

  private constructor() {}

  static getInstance(): PricingService {
    if (!PricingService.instance) {
      PricingService.instance = new PricingService();
    }
    return PricingService.instance;
  }

  /**
   * Get pricing for all plans in specified currency
   */
  async getPricingForCurrency(currency: "USD" | "JOD" | "SAR"): Promise<PlanPricing[]> {
    const plans: PlanPricing[] = [];

    for (const [planId, pricing] of Object.entries(this.basePricing)) {
      if (planId === "JUNIOR") {
        // Free tier - no conversion needed
        plans.push({
          planId,
          name: this.getPlanName(planId)!,
          description: this.planDescriptions[planId]!,
          features: this.planFeatures[planId]!,
          usdPrice: 0,
          pricing: {
            USD: { currency: "USD", amount: 0, formatted: "Free", isEstimated: false },
            JOD: { currency: "JOD", amount: 0, formatted: "مجاني", isEstimated: false },
            SAR: { currency: "SAR", amount: 0, formatted: "مجاني", isEstimated: false },
          },
          popular: (planId as unknown) === "INTERMEDIATE",
          recommended: (planId as unknown) === "SENIOR",
        });
        continue;
      }

      const monthlyPricing = await currencyService.getPricingInfo(pricing.monthly, currency);

      plans.push({
        planId,
        name: this.getPlanName(planId)!,
        description: this.planDescriptions[planId]!,
        features: this.planFeatures[planId]!,
        usdPrice: pricing.monthly,
        pricing: {
          [currency]: monthlyPricing,
        },
        popular: (planId as unknown) === "INTERMEDIATE",
        recommended: (planId as unknown) === "SENIOR",
      });
    }

    return plans;
  }

  /**
   * Get comprehensive pricing for all currencies
   */
  async getAllPricing(): Promise<PlanPricing[]> {
    const plans: PlanPricing[] = [];

    for (const [planId, pricing] of Object.entries(this.basePricing)) {
      if (planId === "JUNIOR") {
        plans.push({
          planId,
          name: this.getPlanName(planId)!,
          description: this.planDescriptions[planId]!,
          features: this.planFeatures[planId]!,
          usdPrice: 0,
          pricing: {
            USD: { currency: "USD", amount: 0, formatted: "Free", isEstimated: false },
            JOD: { currency: "JOD", amount: 0, formatted: "مجاني", isEstimated: false },
            SAR: { currency: "SAR", amount: 0, formatted: "مجاني", isEstimated: false },
          },
          popular: (planId as unknown) === "INTERMEDIATE",
          recommended: (planId as unknown) === "SENIOR",
        });
        continue;
      }

      const multiCurrencyPricing = await currencyService.getMultiCurrencyPricing(pricing.monthly);

      plans.push({
        planId,
        name: this.getPlanName(planId)!,
        description: this.planDescriptions[planId]!,
        features: this.planFeatures[planId]!,
        usdPrice: pricing.monthly,
        pricing: multiCurrencyPricing,
        popular: (planId as unknown) === "INTERMEDIATE",
        recommended: (planId as unknown) === "SENIOR",
      });
    }

    return plans;
  }

  /**
   * Get pricing tiers with monthly and yearly options
   */
  async getPricingTiers(currency: "USD" | "JOD" | "SAR" = "USD"): Promise<PricingTier[]> {
    const tiers: PricingTier[] = [];

    for (const [planId, pricing] of Object.entries(this.basePricing)) {
      const monthlyPricing = await currencyService.getPricingInfo(pricing.monthly, currency);
      const yearlyPricing = await currencyService.getPricingInfo(pricing.yearly, currency);

      tiers.push({
        id: planId as "JUNIOR" | "INTERMEDIATE" | "SENIOR" | "BUNDLE",
        name: this.getPlanName(planId)!,
        description: this.planDescriptions[planId]!,
        features: this.planFeatures[planId]!,
        monthlyPrice: monthlyPricing.amount,
        yearlyPrice: yearlyPricing.amount,
        isPopular: planId === "INTERMEDIATE",
        isRecommended: planId === "SENIOR",
      });
    }

    return tiers;
  }

  /**
   * Calculate discount for yearly billing
   */
  calculateYearlyDiscount(monthlyPrice: number, yearlyPrice: number): number {
    const monthlyTotal = monthlyPrice * 12;
    const discount = ((monthlyTotal - yearlyPrice) / monthlyTotal) * 100;
    return Math.round(discount);
  }

  /**
   * Get pricing for specific plan
   */
  async getPlanPricing(
    planId: "JUNIOR" | "INTERMEDIATE" | "SENIOR" | "BUNDLE",
    currency: "USD" | "JOD" | "SAR" = "USD"
  ): Promise<PlanPricing | null> {
    const pricing = this.basePricing[planId];
    if (!pricing) return null;

    if (planId === "JUNIOR") {
      return {
        planId,
        name: this.getPlanName(planId)!,
        description: this.planDescriptions[planId]!,
        features: this.planFeatures[planId]!,
        usdPrice: 0,
        pricing: {
          [currency]: {
            currency,
            amount: 0,
            formatted: currency === "USD" ? "Free" : "مجاني",
            isEstimated: false,
          },
        },
        popular: (planId as unknown) === "INTERMEDIATE",
        recommended: (planId as unknown) === "SENIOR",
      };
    }

    const monthlyPricing = await currencyService.getPricingInfo(pricing.monthly, currency);

    return {
      planId,
      name: this.getPlanName(planId)!,
      description: this.planDescriptions[planId]!,
      features: this.planFeatures[planId]!,
      usdPrice: pricing.monthly,
      pricing: {
        [currency]: monthlyPricing,
      },
      popular: planId === "INTERMEDIATE",
      recommended: planId === "SENIOR",
    };
  }

  /**
   * Get recommended plan based on user preferences
   */
  getRecommendedPlan(
    userType: "individual" | "team" | "enterprise"
  ): "INTERMEDIATE" | "SENIOR" | "BUNDLE" {
    switch (userType) {
      case "individual":
        return "INTERMEDIATE";
      case "team":
        return "SENIOR";
      case "enterprise":
        return "BUNDLE";
      default:
        return "INTERMEDIATE";
    }
  }

  /**
   * Compare plans and show differences
   */
  comparePlans(
    plan1: string,
    plan2: string
  ): {
    plan1Features: string[];
    plan2Features: string[];
    commonFeatures: string[];
    plan1Only: string[];
    plan2Only: string[];
  } {
    const features1 = this.planFeatures[plan1] || [];
    const features2 = this.planFeatures[plan2] || [];

    const commonFeatures = features1.filter((feature) => features2.includes(feature));
    const plan1Only = features1.filter((feature) => !features2.includes(feature));
    const plan2Only = features2.filter((feature) => !features1.includes(feature));

    return {
      plan1Features: features1,
      plan2Features: features2,
      commonFeatures,
      plan1Only,
      plan2Only,
    };
  }

  /**
   * Get localized plan name
   */
  private getPlanName(planId: string): string {
    const names: Record<string, string> = {
      JUNIOR: "Junior",
      INTERMEDIATE: "Intermediate",
      SENIOR: "Senior",
      BUNDLE: "Bundle",
    };
    return names[planId] || planId;
  }

  /**
   * Validate pricing configuration
   */
  validatePricing(): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Check if all required plans exist
    const requiredPlans = ["JUNIOR", "INTERMEDIATE", "SENIOR", "BUNDLE"];
    for (const plan of requiredPlans) {
      if (!this.basePricing[plan]) {
        errors.push(`Missing pricing for plan: ${plan}`);
      }
    }

    // Check if pricing is reasonable
    for (const [plan, pricing] of Object.entries(this.basePricing)) {
      if (plan !== "JUNIOR" && pricing.monthly <= 0) {
        errors.push(`Invalid monthly price for ${plan}: ${pricing.monthly}`);
      }
      if (plan !== "JUNIOR" && pricing.yearly <= 0) {
        errors.push(`Invalid yearly price for ${plan}: ${pricing.yearly}`);
      }
      if (plan !== "JUNIOR" && pricing.yearly >= pricing.monthly * 12) {
        errors.push(`Yearly price should be less than monthly * 12 for ${plan}`);
      }
    }

    // Check if features exist for all plans
    for (const plan of requiredPlans) {
      if (!this.planFeatures[plan] || this.planFeatures[plan].length === 0) {
        errors.push(`Missing features for plan: ${plan}`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Get pricing statistics
   */
  getPricingStats(): {
    totalPlans: number;
    freePlans: number;
    paidPlans: number;
    averageMonthlyPrice: number;
    averageYearlyPrice: number;
    highestPrice: number;
    lowestPrice: number;
  } {
    const plans = Object.values(this.basePricing);
    const paidPlans = plans.filter((plan) => plan.monthly > 0);

    const monthlyPrices = paidPlans.map((plan) => plan.monthly);
    const yearlyPrices = paidPlans.map((plan) => plan.yearly);

    return {
      totalPlans: plans.length,
      freePlans: plans.length - paidPlans.length,
      paidPlans: paidPlans.length,
      averageMonthlyPrice:
        monthlyPrices.length > 0
          ? monthlyPrices.reduce((a, b) => a + b, 0) / monthlyPrices.length
          : 0,
      averageYearlyPrice:
        yearlyPrices.length > 0 ? yearlyPrices.reduce((a, b) => a + b, 0) / yearlyPrices.length : 0,
      highestPrice: Math.max(...monthlyPrices, 0),
      lowestPrice: Math.min(...monthlyPrices.filter((p) => p > 0), 0),
    };
  }
}

// Export singleton instance
export const pricingService = PricingService.getInstance();
