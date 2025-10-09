
import { Session } from "@models/Session.js";
import { User } from "@models/User.js";
import type { JWTPayload } from "@server/types/common";
import { jwtService } from "@services/jwt.service.js";
import type { FastifyRequest, FastifyReply, FastifyInstance } from "fastify";

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

export interface AuthOptions {
  requireEmailVerification?: boolean;
  requiredRole?: string[];
  requiredEntitlements?: string[];
  allowExpiredTokens?: boolean;
}

/**
 * Authentication middleware factory
 */
export function createAuthMiddleware(options: AuthOptions = {}) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      // Extract token from Authorization header
      const { headers } = request;
      const authHeader = headers.authorization;
      if (!authHeader?.startsWith("Bearer ")) {
        return reply.status(401).send({
          code: 401,
          error: "Unauthorized",
          message: "Missing or invalid authorization header",
        });
      }

      const token = authHeader.substring(7); // Remove 'Bearer ' prefix

      // Verify access token
      let payload;
      try {
        payload = jwtService.verifyAccessToken(token);
      } catch (error: unknown) {
        if ((error as Error).message === "Access token expired" && !options.allowExpiredTokens) {
          return reply.status(401).send({
            code: 401,
            error: "Unauthorized",
            message: "Access token expired",
            errorCode: "TOKEN_EXPIRED",
          });
        } else if (
          (error as Error).message === "Access token expired" &&
          options.allowExpiredTokens
        ) {
          // Allow expired tokens but decode without verification
          payload = jwtService.decodeToken(token);
          if (!payload) {
            return reply.status(401).send({
              code: 401,
              error: "Unauthorized",
              message: "Invalid token",
            });
          }
        } else {
          return reply.status(401).send({
            code: 401,
            error: "Unauthorized",
            message: "Invalid access token",
          });
        }
      }

      // Check if session exists and is valid
      const session = await Session.findActiveByAccessToken(token);
      if (!session) {
        return reply.status(401).send({
          code: 401,
          error: "Unauthorized",
          message: "Session not found or expired",
        });
      }

      // Fetch user from database
      const user = await User.findById((payload as JWTPayload).userId).select("+isEmailVerified");
      if (!user?.isActive) {
        return reply.status(401).send({
          code: 401,
          error: "Unauthorized",
          message: "User not found or inactive",
        });
      }

      // Check email verification requirement
      if (options.requireEmailVerification && !user.isEmailVerified) {
        return reply.status(403).send({
          code: 403,
          error: "Forbidden",
          message: "Email verification required",
        });
      }

      // Check role requirements
      if (options.requiredRole && !options.requiredRole.includes(user.role)) {
        return reply.status(403).send({
          code: 403,
          error: "Forbidden",
          message: "Insufficient permissions",
        });
      }

      // Check entitlement requirements
      if (options.requiredEntitlements) {
        const hasRequiredEntitlements = options.requiredEntitlements.every((entitlement) =>
          user.entitlements.includes(entitlement)
        );
        if (!hasRequiredEntitlements) {
          return reply.status(403).send({
            code: 403,
            error: "Forbidden",
            message: "Insufficient entitlements",
          });
        }
      }

      // Update session last used time
      await session.refresh();

      // Attach user and session info to request
      request.authUser = {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        role: user.role,
        entitlements: user.entitlements,
        isEmailVerified: user.isEmailVerified,
      };
      request.sessionId = session._id.toString();
    } catch (error) {
      request.log.error(
        { error: error instanceof Error ? error.message : String(error) },
        "Authentication error"
      );
      return reply.status(500).send({
        code: 500,
        error: "Internal Server Error",
        message: "Authentication failed",
      });
    }
  };
}

/**
 * Optional authentication middleware - doesn't fail if no token
 */
export const optionalAuth = async (request: FastifyRequest) => {
  try {
    const { headers } = request;
    const authHeader = headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      // No token provided, continue without authentication
      return;
    }

    const token = authHeader.substring(7);

    try {
      const payload = jwtService.verifyAccessToken(token);
      const session = await Session.findActiveByAccessToken(token);

      if (session) {
        const user = await User.findById((payload as JWTPayload).userId).select("+isEmailVerified");
        if (user?.isActive) {
          request.authUser = {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            role: user.role,
            entitlements: user.entitlements,
            isEmailVerified: user.isEmailVerified,
          };
          request.sessionId = session._id.toString();
          await session.refresh();
        }
      }
    } catch (error) {
      // Token invalid or expired, but we don't fail for optional auth
      request.log.debug(
        { error: error instanceof Error ? error.message : String(error) },
        "Optional auth failed"
      );
    }
  } catch (error) {
    request.log.error(
      { error: error instanceof Error ? error.message : String(error) },
      "Optional authentication error"
    );
    // Don't fail for optional auth
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
