/**
 * Analytics Type Definitions
 * Types for analytics events, tracking, and A/B testing
 */

// Removed eslint-disable - fixing any types below

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

/**
 * Event Categories for comprehensive tracking
 */
export enum EventCategory {
  Navigation = "navigation",
  Authentication = "authentication",
  UserMenu = "user_menu",
  LevelSelection = "level_selection",
  Gamification = "gamification",
  Monetization = "monetization",
  Conversion = "conversion",
  Performance = "performance",
  Accessibility = "accessibility",
  Error = "error",
  Engagement = "engagement",
}

/**
 * Event Actions for tracking user interactions
 */
export enum EventAction {
  Click = "click",
  View = "view",
  Submit = "submit",
  Change = "change",
  Complete = "complete",
  Skip = "skip",
  Open = "open",
  Close = "close",
  Hover = "hover",
  Scroll = "scroll",
  Load = "load",
  Error = "error",
}

/**
 * Common event properties for all analytics events
 */
export interface CommonEventProperties {
  timestamp?: number;
  session_id?: string;
  user_id?: string;
  locale?: string;
  viewport?: "mobile" | "tablet" | "desktop";
  browser?: string;
  os?: string;
  referrer?: string;
  page_path?: string;
  page_title?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
}

/**
 * User properties for identification and segmentation
 */
export interface UserProperties {
  user_id: string;
  email_domain?: string;
  plan_tier?: "free" | "pro" | "team";
  account_age_days?: number;
  total_sessions?: number;
  preferred_locale?: "en" | "ar";
  preferred_difficulty?: "junior" | "intermediate" | "senior";
  courses_completed?: number;
  achievement_level?: number;
}

/**
 * Performance metrics for Core Web Vitals
 */
export interface PerformanceMetrics {
  lcp?: number; // Largest Contentful Paint
  fid?: number; // First Input Delay
  cls?: number; // Cumulative Layout Shift
  fcp?: number; // First Contentful Paint
  ttfb?: number; // Time to First Byte
  tti?: number; // Time to Interactive
}

/**
 * Comprehensive analytics event interface
 */
export interface AnalyticsEvent {
  name: string;
  category?: EventCategory;
  action?: EventAction;
  label?: string;
  value?: number;
  properties?: Record<string, string | number | boolean | null>;
  user_properties?: Partial<UserProperties>;
}

/**
 * Analytics provider interface for multiple tracking services
 */
export interface AnalyticsProvider {
  initialize(config: Record<string, unknown>): Promise<void>;
  track(event: AnalyticsEvent): void;
  identify(userId: string, properties?: Partial<UserProperties>): void;
  page(properties?: Record<string, string | number | boolean | null>): void;
  setUserProperties(properties: Partial<UserProperties>): void;
  reset(): void;
}

/**
 * Analytics plugin options for Vue integration
 */
export interface AnalyticsPluginOptions {
  debug?: boolean;
  googleAnalyticsId?: string;
  customApiEndpoint?: string;
  customApiKey?: string;
  router?: unknown; // Vue Router instance
  autoTrackPageViews?: boolean;
  autoTrackPerformance?: boolean;
  batchSize?: number;
  batchInterval?: number;
}
