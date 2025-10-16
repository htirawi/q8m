/**
 * Pricing Component Props & Types
 */

import type { PlanId, BillingCycle } from "@/types/domain/pricing";

export interface ICountdownTimerTimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export interface ICountdownTimerProps {
  endDate: Date;
  showLabels?: boolean;
}

export interface IModernPricingCardProps {
  planId: PlanId;
  title: string;
  description: string;
  price: number;
  billingCycle: BillingCycle;
  features: string[];
  popular?: boolean;
  recommended?: boolean;
}

export interface IPlanCardProps {
  planId: PlanId;
  title: string;
  price: number;
  billingCycle: BillingCycle;
  features: string[];
  popular?: boolean;
}

export interface IPlanCardEmits {
  (e: "select", planId: PlanId): void;
}

export interface ITestimonial {
  id: string;
  name: string;
  role: string;
  company: string;
  image: string;
  quote: string;
  rating: number;
}

export interface ITestimonialCarouselProps {
  testimonials: ITestimonial[];
  autoPlay?: boolean;
  interval?: number;
}

