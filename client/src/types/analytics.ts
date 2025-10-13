/**
 * Analytics Type Definitions
 * Types for analytics events, tracking, and A/B testing
 */

import type { HomepageSection } from "./homepage";
import type { BillingCycle, PlanId } from "./pricing";

/**
 * Base analytics event
 */
export interface IAnalyticsEvent {
  eventName: string;
  properties: Record<string, unknown>;
  timestamp: number;
}

/**
 * Homepage-specific analytics event
 */
export interface IHomepageAnalyticsEvent extends IAnalyticsEvent {
  eventName:
    | "homepage_view"
    | "section_view"
    | "cta_click"
    | "scroll_depth"
    | "pricing_interaction"
    | "faq_interaction"
    | "social_proof_interaction";
}

/**
 * CTA click event properties
 */
export interface ICTAClickEvent extends Record<string, unknown> {
  ctaType: "primary" | "secondary" | "tertiary";
  ctaText: string;
  ctaLocation: HomepageSection;
  destinationUrl: string;
  variant?: string;
}

/**
 * Scroll depth event properties
 */
export interface IScrollDepthEvent extends Record<string, unknown> {
  depth: number;
  milestone: 25 | 50 | 75 | 100;
  timeToMilestone: number;
}

/**
 * Section view event properties
 */
export interface ISectionViewEvent extends Record<string, unknown> {
  section: HomepageSection;
  viewDuration?: number;
  scrollPosition: number;
}

/**
 * Pricing interaction event properties
 */
export interface IPricingInteractionEvent extends Record<string, unknown> {
  action: "toggle_cycle" | "select_plan" | "view_details";
  planId?: PlanId;
  billingCycle?: BillingCycle;
  priceDisplayed?: number;
}

/**
 * FAQ interaction event properties
 */
export interface IFaqInteractionEvent extends Record<string, unknown> {
  action: "expand" | "collapse";
  questionId: string;
  questionIndex: number;
}

/**
 * Social proof interaction event properties
 */
export interface ISocialProofInteractionEvent extends Record<string, unknown> {
  action: "logo_hover" | "logo_click";
  companyId: string;
  companyName: string;
}

/**
 * A/B test assignment event properties
 */
export interface IABTestAssignmentEvent extends Record<string, unknown> {
  testId: string;
  variant: string;
  timestamp: number;
}

/**
 * A/B test outcome event properties
 */
export interface IABTestOutcomeEvent {
  testId: string;
  variant: string;
  outcome: "conversion" | "bounce" | "continue";
  value?: number;
  timestamp: number;
}

/**
 * Conversion event properties
 */
export interface IConversionEvent {
  conversionType: "signup" | "trial_start" | "purchase" | "newsletter";
  source: string;
  variant?: string;
  value?: number;
  currency?: string;
}
