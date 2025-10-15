/**
 * Plan Features Configuration
 * Single source of truth for plan-based feature access
 */

import type { PlanTier } from '../types/plan';

export interface PlanFeatures {
  study: {
    difficulties: Array<'easy' | 'medium' | 'hard'>;
    questionsPerDay: number; // -1 = unlimited
    aiHints: number; // -1 = unlimited
    bookmarks: boolean;
    exportNotes: boolean;
  };
  quiz: {
    levels: Array<'junior' | 'intermediate' | 'senior'>;
    quizzesPerDay: number; // -1 = unlimited
    retries: number; // -1 = unlimited
    detailedResults: boolean;
    wrongQuestionsReview: boolean;
  };
  analytics: 'none' | 'basic' | 'advanced' | 'premium';
  support: 'community' | 'email' | 'priority' | 'dedicated';
  features: {
    mockInterviews: number; // per month, 0 = none
    codeReview: boolean;
    customStudyPlan: boolean;
    earlyAccess: boolean;
  };
}

export const PLAN_FEATURES: Record<PlanTier, PlanFeatures> = {
  free: {
    study: {
      difficulties: ['easy'],
      questionsPerDay: 10,
      aiHints: 0,
      bookmarks: false,
      exportNotes: false,
    },
    quiz: {
      levels: ['junior'],
      quizzesPerDay: 3,
      retries: 1,
      detailedResults: false,
      wrongQuestionsReview: false,
    },
    analytics: 'basic',
    support: 'community',
    features: {
      mockInterviews: 0,
      codeReview: false,
      customStudyPlan: false,
      earlyAccess: false,
    },
  },
  intermediate: {
    study: {
      difficulties: ['easy', 'medium'],
      questionsPerDay: 50,
      aiHints: 10,
      bookmarks: true,
      exportNotes: true,
    },
    quiz: {
      levels: ['junior', 'intermediate'],
      quizzesPerDay: 10,
      retries: 3,
      detailedResults: true,
      wrongQuestionsReview: true,
    },
    analytics: 'advanced',
    support: 'email',
    features: {
      mockInterviews: 0,
      codeReview: false,
      customStudyPlan: false,
      earlyAccess: false,
    },
  },
  advanced: {
    study: {
      difficulties: ['easy', 'medium', 'hard'],
      questionsPerDay: -1,
      aiHints: 50,
      bookmarks: true,
      exportNotes: true,
    },
    quiz: {
      levels: ['junior', 'intermediate', 'senior'],
      quizzesPerDay: -1,
      retries: -1,
      detailedResults: true,
      wrongQuestionsReview: true,
    },
    analytics: 'premium',
    support: 'priority',
    features: {
      mockInterviews: 3,
      codeReview: true,
      customStudyPlan: true,
      earlyAccess: false,
    },
  },
  pro: {
    study: {
      difficulties: ['easy', 'medium', 'hard'],
      questionsPerDay: -1,
      aiHints: -1,
      bookmarks: true,
      exportNotes: true,
    },
    quiz: {
      levels: ['junior', 'intermediate', 'senior'],
      quizzesPerDay: -1,
      retries: -1,
      detailedResults: true,
      wrongQuestionsReview: true,
    },
    analytics: 'premium',
    support: 'dedicated',
    features: {
      mockInterviews: -1,
      codeReview: true,
      customStudyPlan: true,
      earlyAccess: true,
    },
  },
} as const;

/**
 * Check if a plan has access to a specific study difficulty
 */
export function canAccessStudyDifficulty(
  planTier: PlanTier,
  difficulty: 'easy' | 'medium' | 'hard'
): boolean {
  return PLAN_FEATURES[planTier].study.difficulties.includes(difficulty);
}

/**
 * Check if a plan has access to a specific quiz level
 */
export function canAccessQuizLevel(
  planTier: PlanTier,
  level: 'junior' | 'intermediate' | 'senior'
): boolean {
  return PLAN_FEATURES[planTier].quiz.levels.includes(level);
}

/**
 * Get the minimum plan required for a study difficulty
 */
export function getRequiredPlanForDifficulty(difficulty: 'easy' | 'medium' | 'hard'): PlanTier {
  if (difficulty === 'easy') return 'free';
  if (difficulty === 'medium') return 'intermediate';
  return 'advanced';
}

/**
 * Get the minimum plan required for a quiz level
 */
export function getRequiredPlanForLevel(level: 'junior' | 'intermediate' | 'senior'): PlanTier {
  if (level === 'junior') return 'free';
  if (level === 'intermediate') return 'intermediate';
  return 'advanced';
}

/**
 * Get suggested upgrade plan (always suggest intermediate for free users)
 */
export function getSuggestedUpgradePlan(
  requiredPlan: PlanTier,
  currentPlan: PlanTier
): PlanTier {
  if (currentPlan === 'free' && requiredPlan !== 'free') {
    return 'intermediate';
  }
  return requiredPlan;
}
