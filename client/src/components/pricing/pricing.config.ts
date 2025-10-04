/**
 * Pricing configuration for the pricing page
 * Contains all plan data, features, FAQs, and comparison data
 */

export type PlanTier = "JUNIOR" | "INTERMEDIATE" | "SENIOR" | "BUNDLE";
export type BillingCycle = "monthly" | "yearly";

export interface Plan {
  id: string;
  tier: PlanTier;
  titleKey: string; // i18n key
  priceMonthly: number;
  priceYearly: number;
  currency: "USD" | "JOD" | "SAR";
  featuresKeys: string[]; // i18n keys
  badgeKey?: string; // e.g., "Most Popular"
  ctaLabelKey: string;
  ctaHref: string; // existing payment link or router link
  guaranteeDays?: number;
  popular?: boolean;
  recommended?: boolean;
}

export interface Feature {
  icon: string;
  titleKey: string;
  descriptionKey: string;
}

export interface ComparisonRow {
  featureKey: string;
  junior: boolean | string;
  intermediate: boolean | string;
  senior: boolean | string;
  bundle: boolean | string;
}

export interface FAQ {
  questionKey: string;
  answerKey: string;
}

// Plan configurations
export const plans: Plan[] = [
  {
    id: "junior",
    tier: "JUNIOR",
    titleKey: "pricing.plans.junior.title",
    priceMonthly: 0,
    priceYearly: 0,
    currency: "USD",
    featuresKeys: [
      "pricing.plans.junior.features.basic",
      "pricing.plans.junior.features.limited",
      "pricing.plans.junior.features.community",
      "pricing.plans.junior.features.mobile",
    ],
    ctaLabelKey: "pricing.plans.junior.cta",
    ctaHref: "/auth/register",
    guaranteeDays: 0,
  },
  {
    id: "intermediate",
    tier: "INTERMEDIATE",
    titleKey: "pricing.plans.intermediate.title",
    priceMonthly: 5,
    priceYearly: 50, // $5 * 12 * 0.83 = $49.80 ≈ $50
    currency: "USD",
    featuresKeys: [
      "pricing.plans.intermediate.features.advanced",
      "pricing.plans.intermediate.features.allTypes",
      "pricing.plans.intermediate.features.explanations",
      "pricing.plans.intermediate.features.analytics",
      "pricing.plans.intermediate.features.bookmarks",
      "pricing.plans.intermediate.features.priority",
    ],
    badgeKey: "pricing.plans.intermediate.popular",
    ctaLabelKey: "pricing.plans.intermediate.cta",
    ctaHref: "/checkout",
    popular: true,
    guaranteeDays: 7,
  },
  {
    id: "senior",
    tier: "SENIOR",
    titleKey: "pricing.plans.senior.title",
    priceMonthly: 10,
    priceYearly: 100, // $10 * 12 * 0.83 = $99.60 ≈ $100
    currency: "USD",
    featuresKeys: [
      "pricing.plans.senior.features.expert",
      "pricing.plans.senior.features.systemDesign",
      "pricing.plans.senior.features.mockInterviews",
      "pricing.plans.senior.features.advancedAnalytics",
      "pricing.plans.senior.features.customPlans",
      "pricing.plans.senior.features.expertReviews",
      "pricing.plans.senior.features.priority",
    ],
    ctaLabelKey: "pricing.plans.senior.cta",
    ctaHref: "/checkout",
    guaranteeDays: 7,
  },
  {
    id: "bundle",
    tier: "BUNDLE",
    titleKey: "pricing.plans.bundle.title",
    priceMonthly: 12,
    priceYearly: 120, // $12 * 12 * 0.83 = $119.52 ≈ $120
    currency: "USD",
    featuresKeys: [
      "pricing.plans.bundle.features.everything",
      "pricing.plans.bundle.features.custom",
      "pricing.plans.bundle.features.support",
      "pricing.plans.bundle.features.team",
      "pricing.plans.bundle.features.lifetime",
      "pricing.plans.bundle.features.unlimitedAI",
    ],
    badgeKey: "pricing.plans.bundle.recommended",
    ctaLabelKey: "pricing.plans.bundle.cta",
    ctaHref: "/checkout",
    recommended: true,
    guaranteeDays: 7,
  },
];

// Feature highlights
export const features: Feature[] = [
  {
    icon: "academic-cap",
    titleKey: "pricing.features.comprehensive.title",
    descriptionKey: "pricing.features.comprehensive.description",
  },
  {
    icon: "lightning-bolt",
    titleKey: "pricing.features.interactive.title",
    descriptionKey: "pricing.features.interactive.description",
  },
  {
    icon: "chart-bar",
    titleKey: "pricing.features.analytics.title",
    descriptionKey: "pricing.features.analytics.description",
  },
  {
    icon: "users",
    titleKey: "pricing.features.community.title",
    descriptionKey: "pricing.features.community.description",
  },
  {
    icon: "shield-check",
    titleKey: "pricing.features.secure.title",
    descriptionKey: "pricing.features.secure.description",
  },
  {
    icon: "device-mobile",
    titleKey: "pricing.features.mobile.title",
    descriptionKey: "pricing.features.mobile.description",
  },
];

// Comparison table rows
export const comparisonRows: ComparisonRow[] = [
  {
    featureKey: "pricing.comparison.basicQuestions",
    junior: true,
    intermediate: true,
    senior: true,
    bundle: true,
  },
  {
    featureKey: "pricing.comparison.advancedQuestions",
    junior: false,
    intermediate: true,
    senior: true,
    bundle: true,
  },
  {
    featureKey: "pricing.comparison.systemDesign",
    junior: false,
    intermediate: false,
    senior: true,
    bundle: true,
  },
  {
    featureKey: "pricing.comparison.mockInterviews",
    junior: false,
    intermediate: false,
    senior: true,
    bundle: true,
  },
  {
    featureKey: "pricing.comparison.analytics",
    junior: false,
    intermediate: true,
    senior: true,
    bundle: true,
  },
  {
    featureKey: "pricing.comparison.unlimitedAI",
    junior: false,
    intermediate: false,
    senior: false,
    bundle: true,
  },
  {
    featureKey: "pricing.comparison.customContent",
    junior: false,
    intermediate: false,
    senior: false,
    bundle: true,
  },
  {
    featureKey: "pricing.comparison.teamManagement",
    junior: false,
    intermediate: false,
    senior: false,
    bundle: true,
  },
];

// FAQ data
export const faqs: FAQ[] = [
  {
    questionKey: "pricing.faq.question1",
    answerKey: "pricing.faq.answer1",
  },
  {
    questionKey: "pricing.faq.question2",
    answerKey: "pricing.faq.answer2",
  },
  {
    questionKey: "pricing.faq.question3",
    answerKey: "pricing.faq.answer3",
  },
  {
    questionKey: "pricing.faq.question4",
    answerKey: "pricing.faq.answer4",
  },
  {
    questionKey: "pricing.faq.question5",
    answerKey: "pricing.faq.answer5",
  },
  {
    questionKey: "pricing.faq.question6",
    answerKey: "pricing.faq.answer6",
  },
];

// Import SVG logos as modules
import ppLogo from "@/assets/images/logos/pp.svg";
import hpLogo from "@/assets/images/logos/hp.svg";
import apsLogo from "@/assets/images/logos/aps.svg";
import sslLogo from "@/assets/images/logos/ssl.svg";

// Trust badges/logos
export const trustBadges = [
  {
    name: "PayPal",
    logo: ppLogo,
    altKey: "pricing.trust.paypal",
  },
  {
    name: "HyperPay",
    logo: hpLogo,
    altKey: "pricing.trust.hyperpay",
  },
  {
    name: "APS",
    logo: apsLogo,
    altKey: "pricing.trust.aps",
  },
  {
    name: "SSL",
    logo: sslLogo,
    altKey: "pricing.trust.ssl",
  },
];

// Hero section data
export const heroData = {
  titleKey: "pricing.hero.title",
  subtitleKey: "pricing.hero.subtitle",
  valuePropsKeys: ["pricing.hero.valueProp1", "pricing.hero.valueProp2", "pricing.hero.valueProp3"],
};

// Guarantee data
export const guaranteeData = {
  titleKey: "pricing.guarantee.title",
  descriptionKey: "pricing.guarantee.description",
  days: 7,
};

// Final CTA data
export const finalCtaData = {
  titleKey: "pricing.finalCta.title",
  subtitleKey: "pricing.finalCta.subtitle",
  ctaLabelKey: "pricing.finalCta.cta",
  ctaHref: "/auth/register",
};
