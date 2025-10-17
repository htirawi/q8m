/**
 * Centralized Rate Limit Profiles for Sensitive Endpoints
 *
 * Defines rate limiting strategies for different endpoint categories:
 * - STRICT: Auth endpoints, password resets, sensitive admin operations
 * - MODERATE: General POST/PUT/DELETE, content modifications
 * - GENEROUS: Idempotent GET, health checks
 *
 * All limits use combined IP + userId hashing to prevent abuse while respecting privacy.
 */

import type { FastifyRateLimitOptions } from "@fastify/rate-limit";
import type { FastifyRequest } from "fastify";

import { comboKey, ipKey } from "./rateLimit.js";

/**
 * Rate limit profile types
 */
export type RateLimitProfile = "strict" | "moderate" | "generous" | "webhook" | "admin";

/**
 * Rate limit profile configurations
 */
export const RATE_LIMIT_PROFILES: Record<
  RateLimitProfile,
  {
    max: number;
    timeWindow: string;
    keyMode: "ip" | "combo";
    description: string;
  }
> = {
  strict: {
    max: 5,
    timeWindow: "15m",
    keyMode: "combo",
    description: "Auth endpoints, password resets, high-value operations",
  },
  moderate: {
    max: 30,
    timeWindow: "15m",
    keyMode: "combo",
    description: "General POST/PUT/DELETE, content modifications",
  },
  generous: {
    max: 100,
    timeWindow: "15m",
    keyMode: "ip",
    description: "Idempotent GET requests, health checks",
  },
  webhook: {
    max: 100,
    timeWindow: "15m",
    keyMode: "ip",
    description: "Webhook endpoints (verified via signature)",
  },
  admin: {
    max: 20,
    timeWindow: "15m",
    keyMode: "combo",
    description: "Admin operations (role changes, subscriptions, content CRUD)",
  },
};

/**
 * Sensitive endpoint classifications
 */
export const SENSITIVE_ENDPOINTS = {
  // Auth endpoints (already rate-limited in auth.ts, documented here for reference)
  auth: {
    login: { profile: "strict" as RateLimitProfile, max: 5 },
    register: { profile: "strict" as RateLimitProfile, max: 5 },
    forgotPassword: { profile: "strict" as RateLimitProfile, max: 3 },
    resetPassword: { profile: "strict" as RateLimitProfile, max: 5 },
    changePassword: { profile: "strict" as RateLimitProfile, max: 10 },
    refresh: { profile: "generous" as RateLimitProfile, max: 100 },
  },

  // Admin endpoints
  admin: {
    userRoleUpdate: { profile: "admin" as RateLimitProfile, max: 10 },
    userUpdate: { profile: "admin" as RateLimitProfile, max: 20 },
    questionCreate: { profile: "admin" as RateLimitProfile, max: 30 },
    questionUpdate: { profile: "admin" as RateLimitProfile, max: 30 },
    questionDelete: { profile: "admin" as RateLimitProfile, max: 20 },
    dataExport: { profile: "strict" as RateLimitProfile, max: 5 },
  },

  // Payment webhooks
  webhooks: {
    paypal: { profile: "webhook" as RateLimitProfile, max: 100 },
    aps: { profile: "webhook" as RateLimitProfile, max: 100 },
    hyperpay: { profile: "webhook" as RateLimitProfile, max: 100 },
  },

  // Payment operations
  payments: {
    create: { profile: "moderate" as RateLimitProfile, max: 20 },
    callback: { profile: "moderate" as RateLimitProfile, max: 30 },
    refund: { profile: "strict" as RateLimitProfile, max: 5 },
  },
} as const;

/**
 * Create rate limit options for a specific profile
 */
export function createRateLimitOptions(
  profile: RateLimitProfile,
  routeId: string,
  overrides?: Partial<{
    max: number;
    timeWindow: string;
    keyMode: "ip" | "combo";
  }>
): { rateLimit: FastifyRateLimitOptions; config: { rateLimit: FastifyRateLimitOptions } } {
  const config = RATE_LIMIT_PROFILES[profile];
  const max = overrides?.max ?? config.max;
  const timeWindow = overrides?.timeWindow ?? config.timeWindow;
  const keyMode = overrides?.keyMode ?? config.keyMode;

  const keyGenerator = keyMode === "ip" ? ipKey : comboKey;

  const rateLimitConfig: FastifyRateLimitOptions = {
    max,
    timeWindow,
    hook: "onRequest",
    keyGenerator,
    errorResponseBuilder: (_request: FastifyRequest, context: { ttl: number; max: number }) => {
      const retryAfter = Math.round(context.ttl / 1000);
      return {
        code: 429,
        error: "Too Many Requests",
        message: `Rate limit exceeded for ${routeId}. Retry in ${retryAfter} seconds`,
        retryAfter,
      };
    },
    onExceeding: (request: FastifyRequest) => {
      const keyHash = keyGenerator(request).substring(0, 8);
      request.log.warn({
        event: "rate_limit_approaching",
        routeId,
        keyHash,
        profile,
        max,
      });
    },
    onExceeded: (request: FastifyRequest) => {
      const keyHash = keyGenerator(request).substring(0, 8);
      request.log.warn({
        event: "rate_limit_exceeded",
        routeId,
        keyHash,
        profile,
        max,
        ip: ipKey(request).substring(0, 8),
      });
    },
  };

  // Return both formats for compatibility
  return {
    rateLimit: rateLimitConfig,
    config: { rateLimit: rateLimitConfig },
  };
}

/**
 * Helper to get rate limit config for admin endpoints
 */
export const adminRateLimits = {
  userManagement: () => createRateLimitOptions("admin", "admin:user-management"),
  contentManagement: () => createRateLimitOptions("admin", "admin:content-management"),
  dataExport: () => createRateLimitOptions("strict", "admin:data-export", { max: 5 }),
  analytics: () => createRateLimitOptions("moderate", "admin:analytics"),
};

/**
 * Helper to get rate limit config for webhook endpoints
 */
export const webhookRateLimits = {
  paypal: () => createRateLimitOptions("webhook", "webhook:paypal"),
  aps: () => createRateLimitOptions("webhook", "webhook:aps"),
  hyperpay: () => createRateLimitOptions("webhook", "webhook:hyperpay"),
};

/**
 * Helper to get rate limit config for payment endpoints
 */
export const paymentRateLimits = {
  create: () => createRateLimitOptions("moderate", "payment:create", { max: 20 }),
  callback: () => createRateLimitOptions("moderate", "payment:callback", { max: 30 }),
  refund: () => createRateLimitOptions("strict", "payment:refund", { max: 5 }),
};

/**
 * Exempt health check endpoints from rate limiting
 */
export const RATE_LIMIT_EXEMPT_PATHS = ["/health", "/api/health", "/api/v1/health"];

/**
 * Check if a path should be exempt from rate limiting
 */
export function isRateLimitExempt(path: string): boolean {
  return RATE_LIMIT_EXEMPT_PATHS.includes(path);
}
