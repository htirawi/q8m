import { FastifyRequest, FastifyReply, FastifyInstance } from "fastify";
import { jwtService } from "../services/jwt.service.js";
import { User } from "../models/User.js";
import { Session } from "../models/Session.js";

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
      const authHeader = request.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
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
      } catch (error: any) {
        if (error.message === "Access token expired" && !options.allowExpiredTokens) {
          return reply.status(401).send({
            code: 401,
            error: "Unauthorized",
            message: "Access token expired",
            errorCode: "TOKEN_EXPIRED",
          });
        } else if (error.message === "Access token expired" && options.allowExpiredTokens) {
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
      const session = await (Session as any).findActiveByAccessToken(token);
      if (!session) {
        return reply.status(401).send({
          code: 401,
          error: "Unauthorized",
          message: "Session not found or expired",
        });
      }

      // Fetch user from database
      const user = await User.findById(payload.userId).select("+isEmailVerified");
      if (!user || !(user as any).isActive) {
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
          (user as any).entitlements.includes(entitlement)
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
        id: (user as any)._id.toString(),
        email: user.email,
        name: user.name,
        role: user.role,
        entitlements: (user as any).entitlements,
        isEmailVerified: user.isEmailVerified,
      };
      request.sessionId = session._id.toString();
    } catch (error) {
      (request.log as any).error("Authentication error:", error);
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
    const authHeader = request.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      // No token provided, continue without authentication
      return;
    }

    const token = authHeader.substring(7);

    try {
      const payload = jwtService.verifyAccessToken(token);
      const session = await (Session as any).findActiveByAccessToken(token);

      if (session) {
        const user = await User.findById(payload.userId).select("+isEmailVerified");
        if (user && (user as any).isActive) {
          request.authUser = {
            id: (user as any)._id.toString(),
            email: user.email,
            name: user.name,
            role: user.role,
            entitlements: (user as any).entitlements,
            isEmailVerified: user.isEmailVerified,
          };
          request.sessionId = session._id.toString();
          await session.refresh();
        }
      }
    } catch (error) {
      // Token invalid or expired, but we don't fail for optional auth
      (request.log as any).debug("Optional auth failed:", error);
    }
  } catch (error) {
    (request.log as any).error("Optional authentication error:", error);
    // Don't fail for optional auth
  }
};

/**
 * Rate limiting middleware for auth endpoints
 */
export const authRateLimit = async (request: FastifyRequest) => {
  const ip = request.ip;
  // TODO: Implement Redis-based rate limiting using key: `auth:${ip}`

  // This would integrate with Redis for actual rate limiting
  // For now, we'll just log the attempt
  (request.log as any).info(`Auth attempt from IP: ${ip}`);
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
  // Register authentication methods on fastify instance
  fastify.decorate("authenticate", createAuthMiddleware);
  fastify.decorate("requireRole", (roles: string | string[]) => {
    const roleArray = Array.isArray(roles) ? roles : [roles];
    return createAuthMiddleware({ requiredRole: roleArray });
  });
}
