/**
 * Middleware Types
 *
 * Type definitions for middleware functions and their configurations
 */

// Extend FastifyRequest to include entitlement data
declare module "fastify" {
  interface FastifyRequest {
    entitlementCheck?: {
      hasAccess: boolean;
      reason?: string;
      upgradeRequired?: string;
      trialExpired?: boolean;
      subscriptionExpired?: boolean;
    };
  }
}

export interface EntitlementOptions {
  requiredEntitlement: string;
  allowTrial?: boolean;
  customMessage?: string;
}

export interface EntitlementCheckResult {
  hasAccess: boolean;
  reason?: string;
  upgradeRequired?: string;
  trialExpired?: boolean;
  subscriptionExpired?: boolean;
}

export interface ContentAccessLevel {
  level: "JUNIOR" | "INTERMEDIATE" | "SENIOR" | "BUNDLE";
}

export interface RateLimitConfig {
  baseLimit: number;
  multiplier?: number;
}

export interface AuthMiddlewareOptions {
  required?: boolean;
  allowExpired?: boolean;
}
