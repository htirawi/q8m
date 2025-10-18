import type { ITier } from "@/types/components/home";

/**
 * Homepage Pricing Tiers Data
 *
 * Pricing teaser cards for the homepage.
 * Full pricing details are in the dedicated pricing page.
 */
export const HOMEPAGE_TIERS: ITier[] = [
  {
    id: "free",
    titleKey: "home.pricing.tiers.free.title",
    priceKey: "home.pricing.tiers.free.price",
    descriptionKey: "home.pricing.tiers.free.description",
    bulletsKey: [
      "home.pricing.tiers.free.bullets.questions",
      "home.pricing.tiers.free.bullets.frameworks",
      "home.pricing.tiers.free.bullets.community",
    ],
    ctaKey: "home.pricing.tiers.free.cta",
    ctaHref: "/register",
    popular: false,
    highlighted: false,
  },
  {
    id: "intermediate",
    titleKey: "home.pricing.tiers.intermediate.title",
    priceKey: "home.pricing.tiers.intermediate.price",
    descriptionKey: "home.pricing.tiers.intermediate.description",
    bulletsKey: [
      "home.pricing.tiers.intermediate.bullets.allBasic",
      "home.pricing.tiers.intermediate.bullets.questions",
      "home.pricing.tiers.intermediate.bullets.analytics",
      "home.pricing.tiers.intermediate.bullets.bookmarks",
      "home.pricing.tiers.intermediate.bullets.support",
    ],
    ctaKey: "home.pricing.tiers.intermediate.cta",
    ctaHref: "/pricing",
    popular: true,
    highlighted: true,
  },
  {
    id: "pro",
    titleKey: "home.pricing.tiers.pro.title",
    priceKey: "home.pricing.tiers.pro.price",
    descriptionKey: "home.pricing.tiers.pro.description",
    bulletsKey: [
      "home.pricing.tiers.pro.bullets.allIntermediate",
      "home.pricing.tiers.pro.bullets.unlimited",
      "home.pricing.tiers.pro.bullets.ai",
      "home.pricing.tiers.pro.bullets.coaching",
      "home.pricing.tiers.pro.bullets.priority",
    ],
    ctaKey: "home.pricing.tiers.pro.cta",
    ctaHref: "/pricing",
    popular: false,
    highlighted: false,
  },
];
