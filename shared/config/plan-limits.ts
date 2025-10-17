/**
 * Centralized Plan Limits Configuration
 * Single source of truth for all plan-based limits and pricing
 * Matches business requirements exactly
 */

import type { PlanTier } from '../types/plan';

export interface FrameworkLimit {
  studyItems: number;
  quizQuestions: number;
}

export interface PlanLimitConfig {
  frameworks?: Record<string, FrameworkLimit>;
  global?: FrameworkLimit;
  price: {
    monthly: number;
    yearly: number;
  };
  features?: string[];
  aiHints?: number;
  mockInterviews?: number;
}

/**
 * Plan limits matching business requirements:
 * - Junior: Per-framework limits (React: 30/10, Angular: 20/7, Others: 30/10)
 * - Intermediate: Global 200/250
 * - Senior: Global 300/350
 * - All-Access: Unlimited everything
 */
export const PLAN_LIMITS: Record<string, PlanLimitConfig> = {
  junior: {
    frameworks: {
      react: { studyItems: 30, quizQuestions: 10 },
      angular: { studyItems: 20, quizQuestions: 7 },
      vue: { studyItems: 30, quizQuestions: 10 },
      nextjs: { studyItems: 30, quizQuestions: 10 },
      redux: { studyItems: 30, quizQuestions: 10 },
      mix: { studyItems: 30, quizQuestions: 10 },
      random: { studyItems: 30, quizQuestions: 10 },
      other: { studyItems: 30, quizQuestions: 10 }, // Default for unlisted frameworks
    },
    price: { monthly: 0, yearly: 0 },
    aiHints: 0,
    mockInterviews: 0,
  },
  intermediate: {
    global: { studyItems: 200, quizQuestions: 250 },
    price: { monthly: 15, yearly: 150 },
    features: [
      'analytics_dashboard',
      'bookmarks',
      'notes',
      'priority_email_support_24h',
      '7_day_money_back',
    ],
    aiHints: 10,
    mockInterviews: 0,
  },
  senior: {
    global: { studyItems: 300, quizQuestions: 350 },
    price: { monthly: 22, yearly: 220 },
    features: [
      'ai_explanations',
      'ai_hints',
      'mock_interview_simulations',
      'expert_review_12h',
      '7_day_money_back',
    ],
    aiHints: 50,
    mockInterviews: 3,
  },
  allAccess: {
    global: { studyItems: -1, quizQuestions: -1 }, // -1 = unlimited
    price: { monthly: 30, yearly: 300 },
    features: [
      'everything_intermediate',
      'everything_senior',
      'unlimited_ai',
      'one_on_one_coaching',
      'resume_review',
      'early_access',
      'priority_feature_requests',
    ],
    aiHints: -1, // unlimited
    mockInterviews: -1, // unlimited
  },
};

/**
 * Get question limits for a specific plan and framework
 */
export function getQuestionLimits(
  planTier: PlanTier,
  framework: string,
  mode: 'study' | 'quiz'
): number {
  // Map plan tiers to our config keys
  const tierToConfig: Record<PlanTier, string> = {
    free: 'junior',
    intermediate: 'intermediate',
    advanced: 'senior',
    pro: 'allAccess',
  };

  const configKey = tierToConfig[planTier];
  const config = PLAN_LIMITS[configKey];

  if (!config) {
    // Default to junior limits if plan not found
    const juniorFrameworks = PLAN_LIMITS.junior?.frameworks;
    if (!juniorFrameworks) return mode === 'study' ? 30 : 10;
    
    const juniorLimits = juniorFrameworks[framework] || juniorFrameworks.other;
    if (!juniorLimits) return mode === 'study' ? 30 : 10;
    
    return mode === 'study' ? juniorLimits.studyItems : juniorLimits.quizQuestions;
  }

  // For junior/free plan, use per-framework limits
  if (planTier === 'free' && config.frameworks) {
    const frameworkLimits = config.frameworks[framework] || config.frameworks.other;
    if (!frameworkLimits) return mode === 'study' ? 30 : 10;
    
    return mode === 'study' ? frameworkLimits.studyItems : frameworkLimits.quizQuestions;
  }

  // For paid plans, use global limits
  if (config.global) {
    const limit = mode === 'study' ? config.global.studyItems : config.global.quizQuestions;
    return limit === -1 ? 9999 : limit; // Convert unlimited to large number
  }

  // Fallback
  return mode === 'study' ? 30 : 10;
}

/**
 * Check if user has exceeded their plan limits
 */
export function hasExceededLimit(
  planTier: PlanTier,
  framework: string,
  mode: 'study' | 'quiz',
  currentCount: number
): boolean {
  const limit = getQuestionLimits(planTier, framework, mode);
  return currentCount >= limit;
}

/**
 * Get remaining questions for a user
 */
export function getRemainingQuestions(
  planTier: PlanTier,
  framework: string,
  mode: 'study' | 'quiz',
  usedCount: number
): number {
  const limit = getQuestionLimits(planTier, framework, mode);
  const remaining = limit - usedCount;
  return Math.max(0, remaining);
}

/**
 * Get plan pricing
 */
export function getPlanPricing(planName: string): { monthly: number; yearly: number } {
  const config = PLAN_LIMITS[planName];
  return config?.price || { monthly: 0, yearly: 0 };
}

/**
 * Get AI hints limit for a plan
 */
export function getAIHintsLimit(planTier: PlanTier): number {
  const tierToConfig: Record<PlanTier, string> = {
    free: 'junior',
    intermediate: 'intermediate',
    advanced: 'senior',
    pro: 'allAccess',
  };

  const config = PLAN_LIMITS[tierToConfig[planTier]];
  return config?.aiHints ?? 0;
}

/**
 * Get mock interviews limit for a plan
 */
export function getMockInterviewsLimit(planTier: PlanTier): number {
  const tierToConfig: Record<PlanTier, string> = {
    free: 'junior',
    intermediate: 'intermediate',
    advanced: 'senior',
    pro: 'allAccess',
  };

  const config = PLAN_LIMITS[tierToConfig[planTier]];
  return config?.mockInterviews ?? 0;
}