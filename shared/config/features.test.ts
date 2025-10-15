/**
 * Feature Access Functions Tests
 * Tests plan-based access control functions from shared/config/features.ts
 */

import { describe, it, expect } from 'vitest';
import {
  PLAN_FEATURES,
  canAccessStudyDifficulty,
  canAccessQuizLevel,
  getRequiredPlanForDifficulty,
  getRequiredPlanForLevel,
  getSuggestedUpgradePlan,
} from './features.js';
import type { PlanTier } from '../types/plan.js';

describe('Feature Access Functions', () => {
  describe('PLAN_FEATURES Configuration', () => {
    it('should define features for all plan tiers', () => {
      const expectedTiers: PlanTier[] = ['free', 'intermediate', 'advanced', 'pro'];

      for (const tier of expectedTiers) {
        expect(PLAN_FEATURES[tier]).toBeDefined();
        expect(PLAN_FEATURES[tier].study).toBeDefined();
        expect(PLAN_FEATURES[tier].quiz).toBeDefined();
      }
    });

    it('should have consistent feature structure', () => {
      for (const tier of Object.keys(PLAN_FEATURES) as PlanTier[]) {
        const features = PLAN_FEATURES[tier];

        // Study features
        expect(features.study.difficulties).toBeInstanceOf(Array);
        expect(typeof features.study.questionsPerDay).toBe('number');
        expect(typeof features.study.aiHints).toBe('number');

        // Quiz features
        expect(features.quiz.levels).toBeInstanceOf(Array);
        expect(typeof features.quiz.quizzesPerDay).toBe('number');
        expect(typeof features.quiz.retries).toBe('number');
      }
    });

    it('should have increasing quotas for higher tiers', () => {
      // free < intermediate
      expect(PLAN_FEATURES.free.study.questionsPerDay).toBeLessThan(
        PLAN_FEATURES.intermediate.study.questionsPerDay
      );

      // intermediate (50) < advanced (unlimited=-1) - just verify advanced is unlimited
      expect(PLAN_FEATURES.advanced.study.questionsPerDay).toBe(-1);

      // Quiz quotas
      expect(PLAN_FEATURES.free.quiz.quizzesPerDay).toBeLessThan(
        PLAN_FEATURES.intermediate.quiz.quizzesPerDay
      );
      expect(PLAN_FEATURES.advanced.quiz.quizzesPerDay).toBe(-1);
    });
  });

  describe('canAccessStudyDifficulty', () => {
    it('should allow free users to access easy difficulty', () => {
      expect(canAccessStudyDifficulty('free', 'easy')).toBe(true);
    });

    it('should block free users from medium difficulty', () => {
      expect(canAccessStudyDifficulty('free', 'medium')).toBe(false);
    });

    it('should block free users from hard difficulty', () => {
      expect(canAccessStudyDifficulty('free', 'hard')).toBe(false);
    });

    it('should allow intermediate users to access easy and medium', () => {
      expect(canAccessStudyDifficulty('intermediate', 'easy')).toBe(true);
      expect(canAccessStudyDifficulty('intermediate', 'medium')).toBe(true);
    });

    it('should block intermediate users from hard difficulty', () => {
      expect(canAccessStudyDifficulty('intermediate', 'hard')).toBe(false);
    });

    it('should allow advanced users to access all difficulties', () => {
      expect(canAccessStudyDifficulty('advanced', 'easy')).toBe(true);
      expect(canAccessStudyDifficulty('advanced', 'medium')).toBe(true);
      expect(canAccessStudyDifficulty('advanced', 'hard')).toBe(true);
    });

    it('should allow pro users to access all difficulties', () => {
      expect(canAccessStudyDifficulty('pro', 'easy')).toBe(true);
      expect(canAccessStudyDifficulty('pro', 'medium')).toBe(true);
      expect(canAccessStudyDifficulty('pro', 'hard')).toBe(true);
    });
  });

  describe('canAccessQuizLevel', () => {
    it('should allow free users to access junior level', () => {
      expect(canAccessQuizLevel('free', 'junior')).toBe(true);
    });

    it('should block free users from intermediate level', () => {
      expect(canAccessQuizLevel('free', 'intermediate')).toBe(false);
    });

    it('should block free users from senior level', () => {
      expect(canAccessQuizLevel('free', 'senior')).toBe(false);
    });

    it('should allow intermediate users to access junior and intermediate', () => {
      expect(canAccessQuizLevel('intermediate', 'junior')).toBe(true);
      expect(canAccessQuizLevel('intermediate', 'intermediate')).toBe(true);
    });

    it('should block intermediate users from senior level', () => {
      expect(canAccessQuizLevel('intermediate', 'senior')).toBe(false);
    });

    it('should allow advanced users to access all levels', () => {
      expect(canAccessQuizLevel('advanced', 'junior')).toBe(true);
      expect(canAccessQuizLevel('advanced', 'intermediate')).toBe(true);
      expect(canAccessQuizLevel('advanced', 'senior')).toBe(true);
    });

    it('should allow pro users to access all levels', () => {
      expect(canAccessQuizLevel('pro', 'junior')).toBe(true);
      expect(canAccessQuizLevel('pro', 'intermediate')).toBe(true);
      expect(canAccessQuizLevel('pro', 'senior')).toBe(true);
    });
  });

  describe('getRequiredPlanForDifficulty', () => {
    it('should return free for easy difficulty', () => {
      expect(getRequiredPlanForDifficulty('easy')).toBe('free');
    });

    it('should return intermediate for medium difficulty', () => {
      expect(getRequiredPlanForDifficulty('medium')).toBe('intermediate');
    });

    it('should return advanced for hard difficulty', () => {
      expect(getRequiredPlanForDifficulty('hard')).toBe('advanced');
    });
  });

  describe('getRequiredPlanForLevel', () => {
    it('should return free for junior level', () => {
      expect(getRequiredPlanForLevel('junior')).toBe('free');
    });

    it('should return intermediate for intermediate level', () => {
      expect(getRequiredPlanForLevel('intermediate')).toBe('intermediate');
    });

    it('should return advanced for senior level', () => {
      expect(getRequiredPlanForLevel('senior')).toBe('advanced');
    });
  });

  describe('getSuggestedUpgradePlan', () => {
    it('should always suggest intermediate for free users needing paid features', () => {
      expect(getSuggestedUpgradePlan('intermediate', 'free')).toBe('intermediate');
      expect(getSuggestedUpgradePlan('advanced', 'free')).toBe('intermediate');
      expect(getSuggestedUpgradePlan('pro', 'free')).toBe('intermediate');
    });

    it('should suggest required plan for intermediate users', () => {
      expect(getSuggestedUpgradePlan('advanced', 'intermediate')).toBe('advanced');
      expect(getSuggestedUpgradePlan('pro', 'intermediate')).toBe('pro');
    });

    it('should suggest required plan for advanced users', () => {
      expect(getSuggestedUpgradePlan('pro', 'advanced')).toBe('pro');
    });

    it('should return the required plan when current plan matches', () => {
      expect(getSuggestedUpgradePlan('free', 'free')).toBe('free');
      expect(getSuggestedUpgradePlan('intermediate', 'intermediate')).toBe('intermediate');
    });
  });

  describe('Integration Scenarios', () => {
    it('should correctly determine access for study workflow', () => {
      // Free user trying different difficulties
      const freeUser: PlanTier = 'free';
      expect(canAccessStudyDifficulty(freeUser, 'easy')).toBe(true);
      expect(canAccessStudyDifficulty(freeUser, 'medium')).toBe(false);

      // When blocked, should suggest correct plan
      if (!canAccessStudyDifficulty(freeUser, 'medium')) {
        const required = getRequiredPlanForDifficulty('medium');
        expect(required).toBe('intermediate');

        const suggested = getSuggestedUpgradePlan(required, freeUser);
        expect(suggested).toBe('intermediate');
      }
    });

    it('should correctly determine access for quiz workflow', () => {
      // Intermediate user trying different levels
      const intermediateUser: PlanTier = 'intermediate';
      expect(canAccessQuizLevel(intermediateUser, 'junior')).toBe(true);
      expect(canAccessQuizLevel(intermediateUser, 'intermediate')).toBe(true);
      expect(canAccessQuizLevel(intermediateUser, 'senior')).toBe(false);

      // When blocked, should suggest correct plan
      if (!canAccessQuizLevel(intermediateUser, 'senior')) {
        const required = getRequiredPlanForLevel('senior');
        expect(required).toBe('advanced');

        const suggested = getSuggestedUpgradePlan(required, intermediateUser);
        expect(suggested).toBe('advanced');
      }
    });

    it('should allow pro users unrestricted access', () => {
      const proUser: PlanTier = 'pro';

      // Study mode
      const studyDifficulties = ['easy', 'medium', 'hard'] as const;
      for (const difficulty of studyDifficulties) {
        expect(canAccessStudyDifficulty(proUser, difficulty)).toBe(true);
      }

      // Quiz mode
      const quizLevels = ['junior', 'intermediate', 'senior'] as const;
      for (const level of quizLevels) {
        expect(canAccessQuizLevel(proUser, level)).toBe(true);
      }
    });
  });

  describe('Edge Cases', () => {
    it('should ensure difficulty-to-plan mapping is consistent', () => {
      // Verify that the required plan can actually access the difficulty
      const difficulties = ['easy', 'medium', 'hard'] as const;

      for (const difficulty of difficulties) {
        const requiredPlan = getRequiredPlanForDifficulty(difficulty);
        expect(canAccessStudyDifficulty(requiredPlan, difficulty)).toBe(true);
      }
    });

    it('should ensure level-to-plan mapping is consistent', () => {
      // Verify that the required plan can actually access the level
      const levels = ['junior', 'intermediate', 'senior'] as const;

      for (const level of levels) {
        const requiredPlan = getRequiredPlanForLevel(level);
        expect(canAccessQuizLevel(requiredPlan, level)).toBe(true);
      }
    });
  });
});
