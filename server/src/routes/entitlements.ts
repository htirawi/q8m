import { FastifyInstance } from "fastify";
import { z } from "zod";
import { authenticate } from "../middlewares/auth.middleware.js";
import { entitlementService } from "../services/entitlement.service.js";

// Validation schemas
const checkEntitlementSchema = z.object({
  requiredEntitlement: z.enum(["JUNIOR", "INTERMEDIATE", "SENIOR", "BUNDLE"]),
});

const checkContentAccessSchema = z.object({
  contentLevel: z.enum(["JUNIOR", "INTERMEDIATE", "SENIOR", "BUNDLE"]),
});

export default async function entitlementRoutes(fastify: FastifyInstance) {
  // Check user's current entitlements
  fastify.get(
    "/me/entitlements",
    {
      preHandler: [authenticate],
    },
    async (request, reply) => {
      try {
        const userId = request.authUser!.id;
        const userEntitlements = await entitlementService.getUserEntitlements(userId);

        reply.send({
          success: true,
          entitlements: userEntitlements,
        });
      } catch (error: any) {
        request.log.error("Get user entitlements error:", error);
        reply.status(500).send({
          success: false,
          error: "Failed to get user entitlements",
        });
      }
    }
  );

  // Check if user has specific entitlement
  fastify.post(
    "/check",
    {
      preHandler: [authenticate],
      schema: {
        body: checkEntitlementSchema,
      },
    },
    async (request, reply) => {
      try {
        const userId = request.authUser!.id;
        const { requiredEntitlement } = request.body as z.infer<typeof checkEntitlementSchema>;

        const entitlementCheck = await entitlementService.checkEntitlement(
          userId,
          requiredEntitlement
        );

        reply.send({
          success: true,
          hasAccess: entitlementCheck.hasAccess,
          reason: entitlementCheck.reason,
          upgradeRequired: entitlementCheck.upgradeRequired,
          subscriptionExpired: entitlementCheck.subscriptionExpired,
          trialExpired: entitlementCheck.trialExpired,
        });
      } catch (error: any) {
        request.log.error("Check entitlement error:", error);
        reply.status(500).send({
          success: false,
          error: "Failed to check entitlement",
        });
      }
    }
  );

  // Check content access based on minimum required level
  fastify.post(
    "/check-content",
    {
      preHandler: [authenticate],
      schema: {
        body: checkContentAccessSchema,
      },
    },
    async (request, reply) => {
      try {
        const userId = request.authUser!.id;
        const { contentLevel } = request.body as z.infer<typeof checkContentAccessSchema>;

        const contentCheck = await entitlementService.checkContentAccess(userId, contentLevel);

        reply.send({
          success: true,
          hasAccess: contentCheck.hasAccess,
          reason: contentCheck.reason,
          upgradeRequired: contentCheck.upgradeRequired,
        });
      } catch (error: any) {
        request.log.error("Check content access error:", error);
        reply.status(500).send({
          success: false,
          error: "Failed to check content access",
        });
      }
    }
  );

  // Check multiple entitlements at once
  fastify.post(
    "/check-multiple",
    {
      preHandler: [authenticate],
      schema: {
        body: z.object({
          requiredEntitlements: z.array(z.enum(["JUNIOR", "INTERMEDIATE", "SENIOR", "BUNDLE"])),
        }),
      },
    },
    async (request, reply) => {
      try {
        const userId = request.authUser!.id;
        const { requiredEntitlements } = request.body as { requiredEntitlements: string[] };

        const entitlementChecks = await entitlementService.checkMultipleEntitlements(
          userId,
          requiredEntitlements
        );

        reply.send({
          success: true,
          checks: entitlementChecks,
        });
      } catch (error: any) {
        request.log.error("Check multiple entitlements error:", error);
        reply.status(500).send({
          success: false,
          error: "Failed to check multiple entitlements",
        });
      }
    }
  );

  // Get entitlement hierarchy
  fastify.get(
    "/hierarchy",
    {
      preHandler: [authenticate],
    },
    async (request, reply) => {
      try {
        const hierarchy = entitlementService.getEntitlementHierarchy();

        reply.send({
          success: true,
          hierarchy,
        });
      } catch (error: any) {
        request.log.error("Get entitlement hierarchy error:", error);
        reply.status(500).send({
          success: false,
          error: "Failed to get entitlement hierarchy",
        });
      }
    }
  );

  // Get users with expiring subscriptions (admin only)
  fastify.get(
    "/expiring",
    {
      preHandler: [authenticate],
      schema: {
        querystring: z.object({
          days: z.string().transform(Number).optional().default("7"),
        }),
      },
    },
    async (request, reply) => {
      try {
        // Check if user is admin
        if (request.authUser!.role !== "admin") {
          return reply.status(403).send({
            success: false,
            error: "Admin access required",
          });
        }

        const { days } = request.query as { days: number };
        const expiringSubscriptions = await entitlementService.getExpiringSubscriptions(days);

        reply.send({
          success: true,
          expiringSubscriptions,
          days,
        });
      } catch (error: any) {
        request.log.error("Get expiring subscriptions error:", error);
        reply.status(500).send({
          success: false,
          error: "Failed to get expiring subscriptions",
        });
      }
    }
  );

  // Get entitlement statistics (admin only)
  fastify.get(
    "/stats",
    {
      preHandler: [authenticate],
    },
    async (request, reply) => {
      try {
        // Check if user is admin
        if (request.authUser!.role !== "admin") {
          return reply.status(403).send({
            success: false,
            error: "Admin access required",
          });
        }

        const stats = await entitlementService.getEntitlementStats();

        reply.send({
          success: true,
          stats,
        });
      } catch (error: any) {
        request.log.error("Get entitlement stats error:", error);
        reply.status(500).send({
          success: false,
          error: "Failed to get entitlement statistics",
        });
      }
    }
  );

  // Clear entitlement cache (admin only)
  fastify.delete(
    "/cache",
    {
      preHandler: [authenticate],
    },
    async (request, reply) => {
      try {
        // Check if user is admin
        if (request.authUser!.role !== "admin") {
          return reply.status(403).send({
            success: false,
            error: "Admin access required",
          });
        }

        entitlementService.clearAllCache();

        reply.send({
          success: true,
          message: "Entitlement cache cleared",
        });
      } catch (error: any) {
        request.log.error("Clear entitlement cache error:", error);
        reply.status(500).send({
          success: false,
          error: "Failed to clear entitlement cache",
        });
      }
    }
  );

  // Clear specific user's entitlement cache (admin only)
  fastify.delete(
    "/cache/:userId",
    {
      preHandler: [authenticate],
      schema: {
        params: z.object({
          userId: z.string(),
        }),
      },
    },
    async (request, reply) => {
      try {
        // Check if user is admin
        if (request.authUser!.role !== "admin") {
          return reply.status(403).send({
            success: false,
            error: "Admin access required",
          });
        }

        const { userId } = request.params as { userId: string };
        entitlementService.clearUserCache(userId);

        reply.send({
          success: true,
          message: `Entitlement cache cleared for user ${userId}`,
        });
      } catch (error: any) {
        request.log.error("Clear user entitlement cache error:", error);
        reply.status(500).send({
          success: false,
          error: "Failed to clear user entitlement cache",
        });
      }
    }
  );

  // Get cache statistics (admin only)
  fastify.get(
    "/cache/stats",
    {
      preHandler: [authenticate],
    },
    async (request, reply) => {
      try {
        // Check if user is admin
        if (request.authUser!.role !== "admin") {
          return reply.status(403).send({
            success: false,
            error: "Admin access required",
          });
        }

        const cacheStats = entitlementService.getCacheStats();

        reply.send({
          success: true,
          cacheStats,
        });
      } catch (error: any) {
        request.log.error("Get cache stats error:", error);
        reply.status(500).send({
          success: false,
          error: "Failed to get cache statistics",
        });
      }
    }
  );
}
