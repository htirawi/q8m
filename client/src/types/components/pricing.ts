/**
 * Pricing Component Props & Types
 */

import type { PlanId, BillingCycle } from "@/types/domain/pricing";

export interface ICountdownTimerTimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  total?: number; // Total time remaining in ms
}

export interface ICountdownTimerProps {
  endDate: Date;
  targetDate?: Date; // Alias for endDate
  showLabels?: boolean;
  variant?: string;
  celebrationStyle?: string;
  showIcon?: boolean;
  icon?: string;
  title?: string;
  message?: string;
  showDays?: boolean;
  showHours?: boolean;
  showMinutes?: boolean;
  showSeconds?: boolean;
  ctaText?: string;
  expiredMessage?: string;
  duration?: number;
  autoReset?: boolean;
  resetDuration?: number;
}

export interface IModernPricingCardProps {
  planId: PlanId;
  tier?: PlanId; // Alias for planId
  title: string;
  description: string;
  price: number;
  priceMonthly?: number;
  priceYearly?: number;
  billingCycle: BillingCycle;
  features: string[];
  popular?: boolean;
  recommended?: boolean;
  badge?: string;
  targetPlan?: string;
  shareable?: boolean;
  planName?: string;
}

export interface IPlanCardProps {
  plan: {
    id: PlanId;
    tier: string;
    labelKey: string;
    descriptionKey: string;
    priceMonthly: number;
    priceYearly: number;
    features?: Array<{ labelKey: string; included: boolean }> | {
      studyItems: number;
      quizQuestions: number;
      aiSupport: boolean;
      priority: "low" | "medium" | "high";
      benefits: string[];
      showDeltas?: boolean;
    };
    badge?: {
      textKey: string;
      color: string;
    };
    cta: {
      labelKey: string;
    };
    reassurance?: {
      items: string[];
    };
    visual?: {
      icon: string;
      color?: string;
      gradient?: string;
      accentColor?: string;
    };
    metadata?: {
      featured?: boolean;
    };
  };
  billing: BillingCycle;
  featured?: boolean;
  selected?: boolean;
  showSocialProof?: boolean;
}

export interface IPlanCardEmits {
  (e: "select", planId: PlanId, billing: BillingCycle): void;
}

export interface ITestimonial {
  id: string;
  name: string;
  role: string; // Job title/role
  title?: string; // Alternative to role (for backward compatibility)
  company: string;
  image?: string;
  avatar?: string; // Alternative to image
  quote: string; // Main testimonial text
  text?: string; // Alternative to quote (for backward compatibility)
  rating: number;
  badge?: string; // Achievement badge text
}

export interface ITestimonialCarouselProps {
  testimonials: ITestimonial[];
  autoPlay?: boolean;
  interval?: number;
  autoplayInterval?: number;
}
