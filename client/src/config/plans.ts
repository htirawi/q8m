/**
 * Canonical Plan Registry
 * Single source of truth for all plan data across Homepage, Pricing, Study, Quiz
 * Maps internal PlanTier to display labels, prices, features, and metadata
 */

import type { PlanTier } from "@shared/types/plan";
import type { PlanId } from "@/types/pricing";
import { PLAN_LIMITS } from "@shared/config/plan-limits";

export interface IPlanConfig {
  id: PlanId; // Machine ID: 'junior', 'intermediate', 'senior', 'bundle'
  tier: PlanTier; // Backend tier: 'free', 'intermediate', 'advanced', 'pro'
  labelKey: string; // i18n key for display name
  descriptionKey: string; // i18n key for short description
  priceMonthly: number; // USD monthly price (0 for free)
  priceYearly: number; // USD yearly price (with discount)
  currency: string; // Currency code
  badge?: {
    textKey: string; // i18n key: 'Most Popular', 'Best Value', etc.
    color: "green" | "blue" | "purple" | "gold"; // Visual accent
  };
  features: {
    studyItems: number; // Study guide items included
    quizQuestions: number; // Quiz questions included
    aiSupport: boolean; // AI assistant access
    priority: "low" | "medium" | "high"; // Support priority
    benefits: string[]; // i18n keys for bullet points
    showDeltas?: boolean; // Show "+150 vs Junior" in muted text
  };
  cta: {
    labelKey: string; // i18n key for CTA button
    action: "register" | "checkout"; // Click behavior
  };
  reassurance: {
    items: string[]; // i18n keys: 'Cancel anytime', 'Secure payments', etc.
  };
  visual: {
    icon: string; // Emoji or icon identifier
    gradient: string; // Tailwind gradient classes
    accentColor: string; // Hex color for highlights
  };
  metadata: {
    sortOrder: number; // Display order (1-4)
    showOnHomepage: boolean;
    showOnPricing: boolean;
    guaranteeDays: number; // Money-back guarantee period
    featured?: boolean; // Scale up card (like Intermediate)
  };
}

export const PLANS: IPlanConfig[] = [
  {
    id: "junior",
    tier: "free",
    labelKey: "plans.junior.name",
    descriptionKey: "plans.junior.description",
    priceMonthly: PLAN_LIMITS.junior?.price?.monthly ?? 0,
    priceYearly: PLAN_LIMITS.junior?.price?.yearly ?? 0,
    currency: "USD",
    features: {
      studyItems: 30, // Max from React framework limits (most generous)
      quizQuestions: 10, // Max from React framework limits
      aiSupport: false,
      priority: "low",
      benefits: [
        "plans.junior.benefits.studyItems",
        "plans.junior.benefits.quizQuestions",
        "plans.junior.benefits.community",
        "plans.junior.benefits.mobile",
      ],
      showDeltas: false,
    },
    cta: {
      labelKey: "plans.junior.cta",
      action: "register",
    },
    reassurance: {
      items: ["pricing.reassurance.noCreditCard"],
    },
    visual: {
      icon: "🟢",
      gradient: "from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20",
      accentColor: "#10b981",
    },
    metadata: {
      sortOrder: 1,
      showOnHomepage: true,
      showOnPricing: false, // Free plan shouldn't appear on pricing page (UX: focus on paid conversions)
      guaranteeDays: 0,
      featured: false,
    },
  },
  {
    id: "intermediate",
    tier: "intermediate",
    labelKey: "plans.intermediate.name",
    descriptionKey: "plans.intermediate.description",
    priceMonthly: PLAN_LIMITS.intermediate?.price?.monthly ?? 0,
    priceYearly: PLAN_LIMITS.intermediate?.price?.yearly ?? 0,
    currency: "USD",
    badge: {
      textKey: "plans.badges.mostPopular",
      color: "blue",
    },
    features: {
      studyItems: PLAN_LIMITS.intermediate?.global?.studyItems ?? 100,
      quizQuestions: PLAN_LIMITS.intermediate?.global?.quizQuestions ?? 100,
      aiSupport: false,
      priority: "medium",
      benefits: [
        "plans.intermediate.benefits.studyItems",
        "plans.intermediate.benefits.quizQuestions",
        "plans.intermediate.benefits.analytics",
        "plans.intermediate.benefits.bookmarks",
        "plans.intermediate.benefits.priority",
        "plans.intermediate.benefits.guarantee",
      ],
      showDeltas: true,
    },
    cta: {
      labelKey: "plans.intermediate.cta",
      action: "checkout",
    },
    reassurance: {
      items: [
        "pricing.reassurance.cancelAnytime",
        "pricing.reassurance.securePayments",
        "pricing.reassurance.noHiddenFees",
      ],
    },
    visual: {
      icon: "🟡",
      gradient: "from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20",
      accentColor: "#3b82f6",
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
    tier: "advanced",
    labelKey: "plans.senior.name",
    descriptionKey: "plans.senior.description",
    priceMonthly: PLAN_LIMITS.senior?.price?.monthly ?? 0,
    priceYearly: PLAN_LIMITS.senior?.price?.yearly ?? 0,
    currency: "USD",
    features: {
      studyItems: PLAN_LIMITS.senior?.global?.studyItems ?? 200,
      quizQuestions: PLAN_LIMITS.senior?.global?.quizQuestions ?? 200,
      aiSupport: true,
      priority: "high",
      benefits: [
        "plans.senior.benefits.studyItems",
        "plans.senior.benefits.quizQuestions",
        "plans.senior.benefits.aiSupport",
        "plans.senior.benefits.mockInterviews",
        "plans.senior.benefits.expertReview",
        "plans.senior.benefits.guarantee",
      ],
      showDeltas: true,
    },
    cta: {
      labelKey: "plans.senior.cta",
      action: "checkout",
    },
    reassurance: {
      items: [
        "pricing.reassurance.cancelAnytime",
        "pricing.reassurance.securePayments",
        "pricing.reassurance.noHiddenFees",
      ],
    },
    visual: {
      icon: "🔴",
      gradient: "from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20",
      accentColor: "#a855f7",
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
    tier: "pro",
    labelKey: "plans.bundle.name",
    descriptionKey: "plans.bundle.description",
    priceMonthly: PLAN_LIMITS.allAccess?.price?.monthly ?? 0,
    priceYearly: PLAN_LIMITS.allAccess?.price?.yearly ?? 0,
    currency: "USD",
    badge: {
      textKey: "plans.badges.bestValue",
      color: "gold",
    },
    features: {
      studyItems: 9999, // Unlimited (represented as high number)
      quizQuestions: 9999, // Unlimited
      aiSupport: true,
      priority: "high",
      benefits: [
        "plans.bundle.benefits.everything",
        "plans.bundle.benefits.unlimitedAI",
        "plans.bundle.benefits.coaching",
        "plans.bundle.benefits.resume",
        "plans.bundle.benefits.earlyAccess",
        "plans.bundle.benefits.priorityFeatures",
      ],
      showDeltas: false,
    },
    cta: {
      labelKey: "plans.bundle.cta",
      action: "checkout",
    },
    reassurance: {
      items: [
        "pricing.reassurance.cancelAnytime",
        "pricing.reassurance.securePayments",
        "pricing.reassurance.noHiddenFees",
      ],
    },
    visual: {
      icon: "💎",
      gradient:
        "from-amber-50 via-yellow-50 to-orange-50 dark:from-amber-900/20 dark:via-yellow-900/20 dark:to-orange-900/20",
      accentColor: "#f59e0b",
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

// Helper functions
export function getPlanById(id: PlanId): IPlanConfig | undefined {
  return PLANS.find((p) => p.id === id);
}

export function getPlanByTier(tier: PlanTier): IPlanConfig | undefined {
  return PLANS.find((p) => p.tier === tier);
}

export function getHomepagePlans(): IPlanConfig[] {
  return PLANS.filter((p) => p.metadata.showOnHomepage).sort(
    (a, b) => a.metadata.sortOrder - b.metadata.sortOrder
  );
}

export function getPricingPlans(): IPlanConfig[] {
  return PLANS.filter((p) => p.metadata.showOnPricing).sort(
    (a, b) => a.metadata.sortOrder - b.metadata.sortOrder
  );
}

/**
 * Map DifficultyLevel (easy/medium/hard) to Plan ID (junior/intermediate/senior)
 * Used to display "Junior" instead of "Easy" in Study Mode UI
 */
export const DIFFICULTY_TO_PLAN_ID: Record<"easy" | "medium" | "hard", PlanId> = {
  easy: "junior",
  medium: "intermediate",
  hard: "senior",
};

/**
 * Map ExperienceLevel (junior/intermediate/senior) to Plan ID
 * Used in Quiz Mode for consistent labeling
 */
export const EXPERIENCE_TO_PLAN_ID: Record<"junior" | "intermediate" | "senior", PlanId> = {
  junior: "junior",
  intermediate: "intermediate",
  senior: "senior",
};
