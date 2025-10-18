/**
 * Home Component Props & Types
 */

import type { Component } from "vue";

// ============================================================================
// Hero Section
// ============================================================================
export interface IHeroSectionProps {
  title?: string;
  subtitle?: string;
  ctaText?: string;
  headlineVariant?: "control" | "variant_a" | "variant_b";
}

// ============================================================================
// Features
// ============================================================================
export interface IFeature {
  id: string;
  icon: Component; // Heroicons component or Vue component
  titleKey: string; // i18n key
  bodyKey: string; // i18n key
  href?: string;
}

export interface IFeaturesGridProps {
  features?: IFeature[];
}

export interface IFeatureCardProps {
  feature: IFeature;
  index?: number;
}

// ============================================================================
// Pricing Tiers
// ============================================================================
export type TierType = "free" | "intermediate" | "pro";

export interface ITier {
  id: TierType;
  titleKey: string;
  priceKey: string;
  descriptionKey: string;
  bulletsKey: string[]; // array of i18n keys
  ctaKey: string;
  popular?: boolean;
  highlighted?: boolean;
  ctaHref?: string;
}

export interface IHomepagePricingTeaserProps {
  tiers?: ITier[];
}

export interface ITierCardProps {
  tier: ITier;
  highlighted?: boolean;
}

// ============================================================================
// Testimonials
// ============================================================================
export interface ITestimonial {
  id: string;
  quoteKey: string; // i18n key
  text?: string; // Direct text or i18n key
  nameKey: string; // i18n key
  roleKey: string; // i18n key
  companyKey?: string; // i18n key
  avatarUrl?: string;
  avatar?: string; // Alias for avatarUrl
  title?: string;
  badge?: string;
  rating?: number; // 1-5
}

export interface ITestimonialsSectionProps {
  testimonials?: ITestimonial[];
}

export interface ITestimonialCardProps {
  testimonial: ITestimonial;
  index?: number;
}

// ============================================================================
// FAQ
// ============================================================================
export interface IFaq {
  id: string;
  qKey: string; // i18n key for question
  aKey: string; // i18n key for answer
}

export interface IFaqSectionProps {
  faqs?: IFaq[];
}

export interface IFaqItemProps {
  faq: IFaq;
  isOpen?: boolean;
  index?: number;
}

export interface IFaqItemEmits {
  (e: "toggle", faqId: string): void;
}

// ============================================================================
// Credibility / Social Proof
// ============================================================================
export interface ICredibilityLogo {
  id: string;
  name: string; // company name
  logoUrl?: string; // optional logo image
  icon?: string; // or use icon/emoji
  altKey: string; // i18n key for alt text
}

export interface IHomeCredibilityProps {
  logos?: ICredibilityLogo[];
  titleKey?: string;
}

export interface ISocialProofBarProps {
  userCount?: number;
  companyLogos?: string[];
  showAnimation?: boolean;
  showLogos?: boolean;
  logoWidth?: number;
  logoHeight?: number;
}

// ============================================================================
// How It Works
// ============================================================================
export interface IHowItWorksStep {
  id: string;
  stepNumber: number;
  icon: Component; // Heroicons component or Vue component
  titleKey: string; // i18n key
  descriptionKey: string; // i18n key
}

export interface IHomeHowItWorksProps {
  steps?: IHowItWorksStep[];
}

// ============================================================================
// Section Header (Reusable)
// ============================================================================
export interface ISectionHeaderProps {
  titleKey?: string;
  subtitleKey?: string;
  tag?: "h2" | "h3" | "h4";
  align?: "left" | "center" | "right";
}

// ============================================================================
// Footer CTA
// ============================================================================
export interface IFooterCtaProps {
  titleKey?: string;
  subtitleKey?: string;
  ctaKey?: string;
}

// ============================================================================
// Mobile Sticky Bar
// ============================================================================
export interface IMobileStickyBarEmits {
  (e: "start"): void;
  (e: "cta-click"): void;
  (e: "dismiss"): void;
}

// ============================================================================
// Analytics Events
// ============================================================================
export interface IHomeCTAClickEvent {
  ctaType: "primary" | "secondary";
  ctaText: string;
  ctaLocation: string; // 'hero' | 'pricing-teaser' | 'footer-cta' | 'mobile-sticky'
  destinationUrl: string;
  variant?: string; // for A/B tests
}

export interface ISectionViewEvent {
  sectionName: string; // 'hero' | 'features' | 'testimonials' | etc.
  scrollDepth: number; // percentage
  timeOnSection?: number; // milliseconds
}

export interface IFAQInteractionEvent {
  faqId: string;
  question: string;
  action: "open" | "close";
}
