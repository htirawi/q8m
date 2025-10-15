/**
 * Plan Guard Middleware
 * Enforces plan-based access control for study and quiz features
 */

import {
  canAccessStudyDifficulty,
  canAccessQuizLevel,
  getRequiredPlanForDifficulty,
  getRequiredPlanForLevel,
  getSuggestedUpgradePlan,
} from '@shared/config/features';
import type { PlanTier } from '@shared/types/plan';
import type { FastifyRequest, FastifyReply } from 'fastify';

export interface PlanGuardOptions {
  feature: 'study' | 'quiz';
  allowAnonymous?: boolean; // For public previews
}

/**
 * Extended FastifyRequest with auth user
 */
interface AuthenticatedRequest extends FastifyRequest {
  authUser?: {
    id: string;
    email: string;
    name: string;
    role: string;
    entitlements: string[];
    isEmailVerified: boolean;
  };
  sessionId?: string;
}

/**
 * Helper to determine user's plan tier from entitlements
 */
function getUserPlanTier(entitlements: string[]): PlanTier {
  if (entitlements.includes('SENIOR') || entitlements.includes('BUNDLE')) {
    return 'advanced';
  }
  if (entitlements.includes('INTERMEDIATE')) {
    return 'intermediate';
  }
  return 'free';
}

/**
 * Middleware factory to create plan guards
 */
export function createPlanGuard(options: PlanGuardOptions) {
  return async (request: AuthenticatedRequest, reply: FastifyReply) => {
    const { feature, allowAnonymous = false } = options;

    // Check authentication first
    if (!request.authUser && !allowAnonymous) {
      return reply.status(401).send({
        code: 401,
        error: 'Unauthorized',
        message: 'Authentication required',
      });
    }

    // If anonymous allowed and no user, let it pass (will be handled by route)
    if (!request.authUser && allowAnonymous) {
      return;
    }

    const userTier: PlanTier = request.authUser
      ? getUserPlanTier(request.authUser.entitlements)
      : 'free';

    // Study feature guard
    if (feature === 'study') {
      const { difficulty } = request.query as { difficulty?: string };

      if (difficulty && !['easy', 'medium', 'hard'].includes(difficulty)) {
        return reply.status(400).send({
          code: 400,
          error: 'Bad Request',
          message: 'Invalid difficulty level',
        });
      }

      if (difficulty) {
        const hasAccess = canAccessStudyDifficulty(
          userTier,
          difficulty as 'easy' | 'medium' | 'hard'
        );

        if (!hasAccess) {
          const requiredPlan = getRequiredPlanForDifficulty(
            difficulty as 'easy' | 'medium' | 'hard'
          );
          const suggestedPlan = getSuggestedUpgradePlan(requiredPlan, userTier);

          return reply.status(403).send({
            code: 403,
            error: 'Forbidden',
            message: `Access to ${difficulty} difficulty requires ${requiredPlan} plan or higher`,
            requiredPlan,
            suggestedPlan,
            currentPlan: userTier,
            upgradeUrl: `/pricing?plan=${suggestedPlan}`,
          });
        }
      }
    }

    // Quiz feature guard
    if (feature === 'quiz') {
      const { level } = request.query as { level?: string };

      if (level && !['junior', 'intermediate', 'senior'].includes(level)) {
        return reply.status(400).send({
          code: 400,
          error: 'Bad Request',
          message: 'Invalid quiz level',
        });
      }

      if (level) {
        const hasAccess = canAccessQuizLevel(
          userTier,
          level as 'junior' | 'intermediate' | 'senior'
        );

        if (!hasAccess) {
          const requiredPlan = getRequiredPlanForLevel(
            level as 'junior' | 'intermediate' | 'senior'
          );
          const suggestedPlan = getSuggestedUpgradePlan(requiredPlan, userTier);

          return reply.status(403).send({
            code: 403,
            error: 'Forbidden',
            message: `Access to ${level} level requires ${requiredPlan} plan or higher`,
            requiredPlan,
            suggestedPlan,
            currentPlan: userTier,
            upgradeUrl: `/pricing?plan=${suggestedPlan}`,
          });
        }
      }
    }

    // If we reach here, user has access
    return;
  };
}

/**
 * Convenience wrapper for study guard
 */
export const studyGuard = () => createPlanGuard({ feature: 'study' });

/**
 * Convenience wrapper for quiz guard
 */
export const quizGuard = () => createPlanGuard({ feature: 'quiz' });
