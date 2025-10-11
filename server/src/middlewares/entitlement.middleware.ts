import { entitlementService } from "@services/entitlement.service.js";
import type { FastifyReply, FastifyRequest } from "fastify";

import type { EntitlementOptions } from "../types/middleware";

/**
 * Create entitlement middleware for protecting routes
 */
export const createEntitlementMiddleware = (options: EntitlementOptions) => {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      // Check if user is authenticated
      if (!request.authUser) {
        return reply.status(401).send({
          code: 401,
          error: "Unauthorized",
          message: "Authentication required",
        });
      }

      // Check entitlement
      const entitlementCheck = await entitlementService.checkEntitlement(
        request.authUser.id,
        options.requiredEntitlement
      );

      // Attach entitlement check to request for potential use in route handler
      request.entitlementCheck = entitlementCheck;

      if (!entitlementCheck.hasAccess) {
        // Handle trial users if allowed
        if (options.allowTrial && entitlementCheck.trialExpired) {
          return reply.status(403).send({
            code: 403,
            error: "Trial Expired",
            message:
              options.customMessage || "Your trial period has expired. Please upgrade to continue.",
            upgradeRequired: entitlementCheck.upgradeRequired,
            trialExpired: true,
          });
        }

        // Handle subscription expired
        if (entitlementCheck.subscriptionExpired) {
          return reply.status(403).send({
            code: 403,
            error: "Subscription Expired",
            message:
              options.customMessage || "Your subscription has expired. Please renew to continue.",
            upgradeRequired: entitlementCheck.upgradeRequired,
            subscriptionExpired: true,
          });
        }

        // Standard entitlement denied
        return reply.status(403).send({
          code: 403,
          error: "Access Denied",
          message: options.customMessage || entitlementCheck.reason || "Insufficient permissions",
          upgradeRequired: entitlementCheck.upgradeRequired,
          requiredEntitlement: options.requiredEntitlement,
        });
      }

      // Access granted, continue to route handler
    } catch (error) {
      request.log.error(error);
      return reply.status(500).send({
        code: 500,
        error: "Internal Server Error",
        message: "Failed to verify entitlements",
      });
    }
  };
};

/**
 * Middleware to require INTERMEDIATE entitlement
 */
export const requireIntermediate = createEntitlementMiddleware({
  requiredEntitlement: "INTERMEDIATE",
});

/**
 * Middleware to require SENIOR entitlement
 */
export const requireSenior = createEntitlementMiddleware({
  requiredEntitlement: "SENIOR",
});

/**
 * Middleware to require BUNDLE entitlement
 */
export const requireBundle = createEntitlementMiddleware({
  requiredEntitlement: "BUNDLE",
});

/**
 * Optional entitlement middleware - doesn't block access but provides entitlement info
 */
export const optionalEntitlement = async (request: FastifyRequest, _reply: FastifyReply) => {
  try {
    if (request.authUser) {
      const userEntitlements = await entitlementService.getUserEntitlements(request.authUser.id);

      // Attach entitlement info to request without blocking access
      request.entitlementCheck = {
        hasAccess: userEntitlements.entitlements.length > 1, // More than just JUNIOR
      };
    }
  } catch (error) {
    request.log.debug(error);
    // Don't fail for optional checks
  }
};

/**
 * Content access middleware based on content level
 */
export const requireContentAccess = (
  contentLevel: "JUNIOR" | "INTERMEDIATE" | "SENIOR" | "BUNDLE"
) => {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      if (!request.authUser) {
        return reply.status(401).send({
          code: 401,
          error: "Unauthorized",
          message: "Authentication required",
        });
      }

      const accessCheck = await entitlementService.checkContentAccess(
        request.authUser.id,
        contentLevel
      );

      if (!accessCheck.hasAccess) {
        return reply.status(403).send({
          code: 403,
          error: "Access Denied",
          message: accessCheck.reason || "Insufficient access level",
          upgradeRequired: accessCheck.upgradeRequired,
          requiredLevel: contentLevel,
        });
      }

      // Attach access check to request
      request.entitlementCheck = accessCheck;
    } catch (error) {
      request.log.error(error);
      return reply.status(500).send({
        code: 500,
        error: "Internal Server Error",
        message: "Failed to verify content access",
      });
    }
  };
};

/**
 * Trial-aware entitlement middleware
 */
export const requireEntitlementWithTrial = (requiredEntitlement: string) => {
  return createEntitlementMiddleware({
    requiredEntitlement,
    allowTrial: true,
    customMessage: `This feature requires ${requiredEntitlement} access. Start your free trial or upgrade to continue.`,
  });
};

/**
 * Admin-only middleware with entitlement logging
 */
export const requireAdminWithEntitlements = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    if (!request.authUser) {
      return reply.status(401).send({
        code: 401,
        error: "Unauthorized",
        message: "Authentication required",
      });
    }

    if (request.authUser.role !== "admin") {
      return reply.status(403).send({
        code: 403,
        error: "Forbidden",
        message: "Admin access required",
      });
    }

    // Log admin access with entitlement info
    const userEntitlements = await entitlementService.getUserEntitlements(request.authUser.id);
    request.log.info({
      adminAccess: true,
      userId: request.authUser.id,
      entitlements: userEntitlements.entitlements,
      activeSubscription: userEntitlements.activeSubscription,
    });
  } catch (error) {
    request.log.error(error);
    return reply.status(500).send({
      code: 500,
      error: "Internal Server Error",
      message: "Failed to verify admin access",
    });
  }
};

/**
 * Rate limiting based on entitlements
 */
export const entitlementBasedRateLimit = (baseLimit: number = 100) => {
  return async (request: FastifyRequest, _reply: FastifyReply) => {
    try {
      if (!request.authUser) {
        // Apply base limit for unauthenticated users
        return;
      }

      const userEntitlements = await entitlementService.getUserEntitlements(request.authUser.id);

      // Calculate rate limit multiplier based on entitlements
      let multiplier = 1;

      if (userEntitlements.entitlements.includes("BUNDLE")) {
        multiplier = 5; // 5x rate limit for bundle users
      } else if (userEntitlements.entitlements.includes("SENIOR")) {
        multiplier = 3; // 3x rate limit for senior users
      } else if (userEntitlements.entitlements.includes("INTERMEDIATE")) {
        multiplier = 2; // 2x rate limit for intermediate users
      }

      // This would integrate with your rate limiting system
      // For now, we just log the calculated limit
      request.log.debug({
        userId: request.authUser.id,
        baseLimit,
        multiplier,
        calculatedLimit: baseLimit * multiplier,
        entitlements: userEntitlements.entitlements,
      });
    } catch (error) {
      request.log.debug(error);
      // Don't fail for rate limit checks
    }
  };
};

export default {
  createEntitlementMiddleware,
  requireIntermediate,
  requireSenior,
  requireBundle,
  optionalEntitlement,
  requireContentAccess,
  requireEntitlementWithTrial,
  requireAdminWithEntitlements,
  entitlementBasedRateLimit,
};
