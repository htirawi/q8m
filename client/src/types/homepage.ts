/**
 * Homepage Type Definitions
 * Types for homepage-specific components and data structures
 */

/**
 * Company logo for social proof display
 */
export interface ISocialProofCompany {
  id: string;
  name: string;
  logo: string;
  alt: string;
}

/**
 * Pricing plan for homepage teaser (simplified version)
 */
export interface IHomepagePricingPlan {
  id: "free" | "pro" | "expert";
  nameKey: string;
  priceMonthly: number;
  priceYearly: number;
  descriptionKey: string;
  features: string[];
  popular: boolean;
  ctaKey: string;
}

/**
 * FAQ item for accordion section
 */
export interface IFaqItem {
  id: string;
  questionKey: string;
  answerKey: string;
}

/**
 * Homepage section identifiers for analytics tracking
 */
export type HomepageSection =
  | "hero"
  | "social-proof"
  | "benefits"
  | "product-peek"
  | "learning-path"
  | "pricing-teaser"
  | "testimonials"
  | "faq"
  | "final-cta";

/**
 * Trust badge for reassurance display
 */
export interface ITrustBadge {
  id: string;
  iconKey: string;
  textKey: string;
}
