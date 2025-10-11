
import { authorizationService } from "@services/auth/authorization.service.js";
import { sessionValidationService } from "@services/auth/session-validation.service.js";
import { tokenVerificationService } from "@services/auth/token-verification.service.js";
import {
  attachAuthUser,
  AuthErrors,
  handleAuthError,
  sendAuthError,
} from "@utils/auth.helpers.js";
import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";

import type { AuthOptions } from "../types/middleware/auth";

export type { AuthOptions };

// Extend FastifyRequest to include custom user and session properties
declare module "fastify" {
  interface FastifyRequest {
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

  interface FastifyInstance {
    authenticate: (
      options?: AuthOptions
    ) => (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
    requireRole: (
      roles: string | string[]
    ) => (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }
}

/**
 * Authentication middleware factory
 */
export function createAuthMiddleware(options: AuthOptions = {}) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      // Extract and verify token
      const { token, payload } = tokenVerificationService.extractAndVerify(
        request,
        options.allowExpiredTokens
      );

      // Validate session and fetch user
      const { session, user } = await sessionValidationService.validateSessionAndUser(
        token,
        payload.userId
      );

      // Perform authorization checks
      const authResult = authorizationService.authorize(user, {
        requireEmailVerification: options.requireEmailVerification,
        requiredRole: options.requiredRole,
        requiredEntitlements: options.requiredEntitlements,
      });

      if (!authResult.authorized) {
        const errorKey =
          authResult.reason === "Email verification required"
            ? "EMAIL_NOT_VERIFIED"
            : authResult.reason === "Insufficient permissions"
              ? "INSUFFICIENT_PERMISSIONS"
              : "INSUFFICIENT_ENTITLEMENTS";
        return sendAuthError(reply, AuthErrors[errorKey]);
      }

      // Update session and attach user to request
      await sessionValidationService.refreshSession(session);
      attachAuthUser(request, user, session);
    } catch (error) {
      handleAuthError(request, reply, error);
    }
  };
}

/**
 * Optional authentication middleware - doesn't fail if no token
 */
export const optionalAuth = async (request: FastifyRequest) => {
  try {
    // Try to extract and verify token (returns null if not present or invalid)
    const result = tokenVerificationService.extractAndVerifyOptional(request);
    if (!result) {
      return; // No token or invalid, continue without authentication
    }

    const { token, payload } = result;

    // Validate session and fetch user
    const { session, user } = await sessionValidationService.validateSessionAndUser(
      token,
      payload.userId
    );

    // Update session and attach user to request
    await sessionValidationService.refreshSession(session);
    attachAuthUser(request, user, session);
  } catch (error) {
    // Don't fail for optional auth, just log
    request.log.debug(
      { error: error instanceof Error ? error.message : String(error) },
      "Optional authentication error"
    );
  }
};

/**
 * Rate limiting middleware for auth endpoints
 */
export const authRateLimit = async (request: FastifyRequest) => {
  const { ip, log } = request;
  // Rate limiting using Redis key: `auth:${ip}` (Redis implementation pending)

  // This would integrate with Redis for actual rate limiting
  // For now, we'll just log the attempt
  log.info(`Auth attempt from IP: ${ip}`);
};

/**
 * Admin role middleware
 */
export const requireAdmin = createAuthMiddleware({
  requiredRole: ["admin"],
});

/**
 * Email verification required middleware
 */
export const requireEmailVerification = createAuthMiddleware({
  requireEmailVerification: true,
});

/**
 * Intermediate tier or higher middleware
 */
export const requireIntermediate = createAuthMiddleware({
  requiredEntitlements: ["INTERMEDIATE", "SENIOR", "BUNDLE"],
});

/**
 * Senior tier or higher middleware
 */
export const requireSenior = createAuthMiddleware({
  requiredEntitlements: ["SENIOR", "BUNDLE"],
});

/**
 * Bundle tier only middleware
 */
export const requireBundle = createAuthMiddleware({
  requiredEntitlements: ["BUNDLE"],
});

// Export default authentication middleware
export const authenticate = createAuthMiddleware();

// Fastify plugin registration
export default async function authPlugin(fastify: FastifyInstance) {
  console.warn("🔐 Registering auth plugin...");

  // Register authentication methods on fastify instance
  fastify.decorate("authenticate", createAuthMiddleware);
  fastify.decorate("requireRole", (roles: string | string[]) => {
    const roleArray = Array.isArray(roles) ? roles : [roles];
    return createAuthMiddleware({ requiredRole: roleArray });
  });

  console.warn("✅ Auth plugin registered successfully");
}
