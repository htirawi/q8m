/**
 * Conversion Surface Types
 * Plan gating, upsells, and conversion optimization
 */

import type { PlanTier } from './plan';

/**
 * Conversion trigger events
 */
export type ConversionTrigger =
  | 'mastery_threshold' // X questions mastered
  | 'question_limit' // Hit free plan question limit
  | 'feature_gate' // Tried to use locked feature
  | 'quiz_complete' // After quiz completion
  | 'session_end' // After study session
  | 'perfect_score' // Achieved 100% on quiz
  | 'streak_milestone' // Reached streak milestone
  | 'weak_area_detected' // Analytics detected weak areas
  | 'badge_earned' // Earned significant badge
  | 'level_up' // Reached new level
  | 'exit_intent'; // User attempting to leave

/**
 * Conversion surface timing
 */
export type ConversionTiming = 'immediate' | 'delayed_3s' | 'delayed_5s' | 'delayed_10s';

/**
 * Conversion CTA action types
 */
export type ConversionAction =
  | 'upgrade' // Direct upgrade to specific plan
  | 'view_plans' // Navigate to pricing page
  | 'start_trial' // Start free trial
  | 'contact_sales' // Enterprise/custom (future)
  | 'watch_demo' // Video demo (future)
  | 'dismiss'; // User dismissed

/**
 * Conversion surface conditions
 */
export interface IConversionConditions {
  planTier: PlanTier[]; // Which plans should see this surface
  threshold?: number; // e.g., "10 questions completed"
  minScore?: number; // e.g., "score >= 90"
  minStreak?: number; // e.g., "streak >= 7 days"
  timing: ConversionTiming;
  showOncePerSession?: boolean;
  showMaxTimes?: number; // Max times to show lifetime
  cooldownHours?: number; // Hours between shows
}

/**
 * Conversion surface content
 */
export interface IConversionContent {
  title: string;
  description: string;
  benefits: string[]; // Bullet points of what they get
  socialProof?: string; // e.g., "Join 10,000+ developers"
  urgency?: string; // e.g., "Limited time offer"
  cta: string; // Button text
  ctaAction: ConversionAction;
  targetPlan?: PlanTier; // Which plan to upgrade to
  dismissable: boolean;
  dismissText?: string; // e.g., "Maybe later"
  illustration?: string; // Icon/emoji
}

/**
 * Conversion surface analytics config
 */
export interface IConversionAnalytics {
  eventName: string;
  conversionGoal: 'trial_start' | 'upgrade_click' | 'plans_viewed' | 'contact_sales';
  segmentation?: Record<string, unknown>;
}

/**
 * Complete conversion surface definition
 */
export interface IConversionSurface {
  id: string;
  name: string; // Internal name for reference
  trigger: ConversionTrigger;
  conditions: IConversionConditions;
  content: IConversionContent;
  analytics: IConversionAnalytics;
  active: boolean; // Can be turned on/off
  priority: number; // If multiple surfaces match, show highest priority
  abTestVariant?: string; // A/B test variant ID
  createdAt: Date;
  updatedAt: Date;
}

/**
 * User interaction with conversion surface
 */
export interface IConversionInteraction {
  userId: string;
  surfaceId: string;
  trigger: ConversionTrigger;
  planTier: PlanTier;

  // Interaction details
  shownAt: Date;
  action?: ConversionAction;
  actionAt?: Date;
  dismissed: boolean;
  timeToAction?: number; // Seconds from show to action

  // Context
  context: {
    route: string;
    sessionId?: string;
    questionsCompleted?: number;
    currentStreak?: number;
    quizScore?: number;
    masteredCount?: number;
    xp?: number;
    level?: number;
    [key: string]: unknown;
  };

  // Outcome tracking
  converted: boolean; // Did they upgrade?
  convertedAt?: Date;
  conversionPlan?: PlanTier;
  conversionRevenue?: number;

  createdAt: Date;
}

/**
 * Feature gate definition
 */
export interface IFeatureGate {
  id: string;
  featureName: string;
  displayName: string;
  description: string;
  requiredPlan: PlanTier;
  icon?: string;
  category: 'study' | 'quiz' | 'analytics' | 'gamification' | 'social';
  upsellSurfaceId?: string; // Linked conversion surface
  fallbackBehavior: 'block' | 'limit' | 'degrade'; // What happens if locked
}

/**
 * Plan limit tracking
 */
export interface IPlanLimits {
  userId: string;
  planTier: PlanTier;

  // Study limits
  studyQuestionsPerSession: number;
  studyQuestionsPerDay: number;
  totalStudyQuestions: number;

  // Quiz limits
  quizzesPerDay: number;
  totalQuizQuestions: number;

  // Feature limits
  aiHintsPerMonth: number;
  mockInterviewsPerMonth: number;

  // Current usage
  usage: {
    studyQuestionsToday: number;
    studyQuestionsThisSession: number;
    quizzesToday: number;
    aiHintsThisMonth: number;
    mockInterviewsThisMonth: number;
  };

  // Limit hit tracking
  limitsHit: {
    limitType: string;
    hitAt: Date;
    upsellShown: boolean;
  }[];

  resetDate: Date; // Next reset (daily/monthly depending on limit)
  updatedAt: Date;
}

/**
 * Conversion funnel analytics
 */
export interface IConversionFunnel {
  funnelId: string;
  name: string;
  steps: {
    stepName: string;
    stepOrder: number;
    usersEntered: number;
    usersCompleted: number;
    conversionRate: number;
    averageTimeSeconds: number;
    dropOffRate: number;
  }[];
  overallConversionRate: number;
  startDate: Date;
  endDate: Date;
  segmentation?: {
    planTier?: PlanTier;
    userCohort?: string;
    abTestVariant?: string;
  };
}

/**
 * A/B test variant for conversion surfaces
 */
export interface IConversionABTest {
  testId: string;
  testName: string;
  surfaceId: string;
  variants: {
    variantId: string;
    variantName: string;
    content: IConversionContent;
    weight: number; // 0-1, must sum to 1 across variants
    usersAssigned: number;
    conversions: number;
    conversionRate: number;
  }[];
  status: 'draft' | 'running' | 'paused' | 'completed';
  startDate: Date;
  endDate?: Date;
  winner?: string; // Variant ID
  confidenceLevel?: number; // Statistical significance (0-1)
}

/**
 * Paywall hit event
 */
export interface IPaywallHit {
  userId: string;
  feature: string;
  planTier: PlanTier;
  requiredPlan: PlanTier;
  context: {
    route: string;
    sessionQuestionsCompleted?: number;
    quizScore?: number;
    [key: string]: unknown;
  };
  action: 'blocked' | 'limited' | 'degraded';
  upsellShown: boolean;
  upsellSurfaceId?: string;
  converted: boolean;
  timestamp: Date;
}

/**
 * Conversion revenue attribution
 */
export interface IConversionAttribution {
  userId: string;
  conversionDate: Date;
  fromPlan: PlanTier;
  toPlan: PlanTier;
  revenue: number;
  currency: string;

  // Attribution sources
  lastConversionSurface?: string;
  allConversionSurfaces: string[]; // All surfaces user interacted with
  lastPaywallHit?: string; // Last feature they hit paywall on
  conversionPath: {
    surfaceId: string;
    interactionDate: Date;
    action: ConversionAction;
  }[];

  // Context
  daysToConversion: number;
  sessionsBeforeConversion: number;
  paywallHitsBeforeConversion: number;
  totalInteractionsBeforeConversion: number;
}
