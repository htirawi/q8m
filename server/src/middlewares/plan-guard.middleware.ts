/**
 * Plan Guard Middleware
 * Enforces plan-based access control for study and quiz features
 */

import { monitoringService } from "@services/monitoring.service.js";
import {
  canAccessStudyDifficulty,
  canAccessQuizLevel,
  getRequiredPlanForDifficulty,
  getRequiredPlanForLevel,
  getSuggestedUpgradePlan,
} from "@shared/config/features";
import { getQuestionLimits } from "@shared/config/plan-limits";
import type { PlanTier } from "@shared/types/plan";
import type { FastifyRequest, FastifyReply } from "fastify";

export interface PlanGuardOptions {
  feature: "study" | "quiz";
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
 * FIXED: Properly map BUNDLE to "pro" tier and SENIOR to "advanced"
 */
export function getUserPlanTier(entitlements: string[]): PlanTier {
  if (entitlements.includes("BUNDLE")) {
    return "pro";
  }
  if (entitlements.includes("SENIOR")) {
    return "advanced";
  }
  if (entitlements.includes("INTERMEDIATE")) {
    return "intermediate";
  }
  return "free";
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
        error: "Unauthorized",
        message: "Authentication required",
      });
    }

    // If anonymous allowed and no user, let it pass (will be handled by route)
    if (!request.authUser && allowAnonymous) {
      return;
    }

    // For quiz feature, allow free tier access if no user is authenticated
    const userTier: PlanTier = request.authUser
      ? getUserPlanTier(request.authUser.entitlements)
      : "free";

    // Study feature guard
    if (feature === "study") {
      const { difficulty } = request.query as { difficulty?: string };

      if (difficulty && !["easy", "medium", "hard"].includes(difficulty)) {
        return reply.status(400).send({
          code: 400,
          error: "Bad Request",
          message: "Invalid difficulty level",
        });
      }

      if (difficulty) {
        const hasAccess = canAccessStudyDifficulty(
          userTier,
          difficulty as "easy" | "medium" | "hard"
        );

        if (!hasAccess) {
          const requiredPlan = getRequiredPlanForDifficulty(
            difficulty as "easy" | "medium" | "hard"
          );
          const suggestedPlan = getSuggestedUpgradePlan(requiredPlan, userTier);

          // Log violation
          if (request.authUser) {
            monitoringService.logUnauthorizedAccess(
              request.authUser.id,
              userTier,
              request.url,
              request.method,
              { difficulty, requiredPlan }
            );
          }

          return reply.status(403).send({
            code: 403,
            error: "Forbidden",
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
    if (feature === "quiz") {
      const { level } = request.query as { level?: string };

      if (level && !["junior", "intermediate", "senior"].includes(level)) {
        return reply.status(400).send({
          code: 400,
          error: "Bad Request",
          message: "Invalid quiz level",
        });
      }

      if (level) {
        const hasAccess = canAccessQuizLevel(
          userTier,
          level as "junior" | "intermediate" | "senior"
        );

        if (!hasAccess) {
          const requiredPlan = getRequiredPlanForLevel(
            level as "junior" | "intermediate" | "senior"
          );
          const suggestedPlan = getSuggestedUpgradePlan(requiredPlan, userTier);

          // Log violation
          if (request.authUser) {
            monitoringService.logUnauthorizedAccess(
              request.authUser.id,
              userTier,
              request.url,
              request.method,
              { level, requiredPlan }
            );
          }

          return reply.status(403).send({
            code: 403,
            error: "Forbidden",
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
export const studyGuard = () => createPlanGuard({ feature: "study" });

/**
 * Convenience wrapper for quiz guard
 */
export const quizGuard = (options?: { allowAnonymous?: boolean }) =>
  createPlanGuard({ feature: "quiz", allowAnonymous: options?.allowAnonymous });

/**
 * Enforce question limits based on user's plan and framework
 * Returns the maximum number of questions allowed
 */
export function enforceQuestionLimit(
  userTier: PlanTier,
  framework: string = "other",
  mode: "study" | "quiz"
): number {
  return getQuestionLimits(userTier, framework, mode);
}

/**
 * Check if user has exceeded their question limit
 */
export function checkQuestionLimit(
  userTier: PlanTier,
  framework: string = "other",
  mode: "study" | "quiz",
  requestedCount: number
): { allowed: boolean; limit: number; message?: string } {
  const limit = getQuestionLimits(userTier, framework, mode);

  if (requestedCount > limit) {
    return {
      allowed: false,
      limit,
      message: `Your ${userTier} plan allows ${limit} ${mode} questions for ${framework}. Upgrade to access more.`,
    };
  }

  return { allowed: true, limit };
}
