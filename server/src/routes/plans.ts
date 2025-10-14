import { authenticate } from "@middlewares/auth.middleware.js";
import type { FastifyPluginAsync, FastifyRequest } from "fastify";

import type { PlanTier } from "../../../shared/types/plan.js";

interface AuthenticatedRequest extends FastifyRequest {
  authUser: {
    id: string;
    email: string;
    name: string;
    role: string;
    entitlements: string[];
    isEmailVerified: boolean;
  };
}

const plansRoutes: FastifyPluginAsync = async (fastify) => {
  /**
   * GET /api/plans/current
   * Get the current user's plan information
   */
  fastify.get(
    "/current",
    {
      preHandler: [authenticate],
    },
    async (request: FastifyRequest, reply) => {
      const authRequest = request as AuthenticatedRequest;
      const { entitlements } = authRequest.authUser;

      // Map entitlements to plan tier
      // Entitlements: ["JUNIOR"] -> free, ["INTERMEDIATE"] -> intermediate, ["SENIOR"] -> advanced, ["BUNDLE"] -> pro
      let tier: PlanTier = "free";
      let displayName = "Junior";
      let features: string[] = ["Easy Study Guide", "Easy Quizzes", "Community Support"];

      if (entitlements.includes("BUNDLE")) {
        tier = "pro";
        displayName = "Bundle";
        features = [
          "Everything in Senior",
          "Custom Questions",
          "24/7 Support",
          "Team Management",
          "Lifetime Updates",
          "Unlimited AI Assistant",
        ];
      } else if (entitlements.includes("SENIOR")) {
        tier = "advanced";
        displayName = "Senior";
        features = [
          "500+ Expert Questions",
          "System Design Questions",
          "Mock Interviews",
          "Advanced Analytics",
          "Custom Study Plans",
          "Expert Reviews",
          "Priority Support",
        ];
      } else if (entitlements.includes("INTERMEDIATE")) {
        tier = "intermediate";
        displayName = "Intermediate";
        features = [
          "300+ Advanced Questions",
          "All Question Types",
          "Detailed Explanations",
          "Performance Analytics",
          "Bookmarks & Notes",
          "Priority Support",
        ];
      }

      return reply.code(200).send({
        success: true,
        plan: {
          id: `plan-${authRequest.authUser.id}`,
          tier,
          name: tier,
          displayName,
          description: `Access to ${displayName} content`,
          features,
          isActive: true,
          startedAt: new Date(),
        },
      });
    }
  );
};

export default plansRoutes;
