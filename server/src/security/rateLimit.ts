import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { env } from "../config/env.js";
import type { FastifyRateLimitOptions } from "@fastify/rate-limit";
import redis from "@fastify/redis";
import * as crypto from "crypto";

// Types for rate limiting configuration
interface RateLimitOptions {
  max?: number;
  timeWindow?: string;
  keyMode?: "ip" | "combo";
}

interface LoginFailureData {
  count: number;
  lastAttempt: number;
  blockUntil?: number;
}

// HMAC key for hashing user identifiers
const HMAC_KEY = crypto.createHash("sha256").update(env.HMAC_RATE_KEY_SECRET).digest();

/**
 * Extract real IP address respecting trust proxy settings
 */
export function ipKey(request: FastifyRequest): string {
  const forwarded = request.headers["x-forwarded-for"];
  const realIp = request.headers["x-real-ip"];

  if (forwarded && typeof forwarded === "string") {
    // Take the first IP in the chain
    return (forwarded.split(",")[0]?.trim() || request.ip) ?? "0.0.0.0";
  }

  if (realIp && typeof realIp === "string") {
    return realIp;
  }

  return request.ip ?? "0.0.0.0";
}

/**
 * Extract user key from request body/query/params (email) and hash it
 */
function makeUserKey(request: FastifyRequest): string {
  let email = "";

  // Try to extract email from body
  if (request.body && typeof request.body === "object") {
    const body = request.body as Record<string, unknown>;
    if (typeof body.email === "string") {
      email = body.email.toLowerCase().trim();
    }
  }

  // Try to extract email from query
  if (request.query && typeof request.query === "object") {
    const query = request.query as Record<string, unknown>;
    if (typeof query.email === "string") {
      email = query.email.toLowerCase().trim();
    }
  }

  // Try to extract email from params
  if (request.params && typeof request.params === "object") {
    const params = request.params as Record<string, unknown>;
    if (typeof params.email === "string") {
      email = params.email.toLowerCase().trim();
    }
  }

  if (!email) {
    return "";
  }

  // Hash the email using HMAC to prevent PII leakage
  return crypto.createHmac("sha256", HMAC_KEY).update(email).digest("hex").substring(0, 16);
}

/**
 * Create a safe combination key from IP and user key
 */
export function comboKey(request: FastifyRequest): string {
  const ip = ipKey(request);
  const userKey = makeUserKey(request);

  // Hash the combination to avoid PII leakage
  const combined = `${ip}:${userKey}`;
  return crypto.createHash("sha256").update(combined).digest("hex").substring(0, 16);
}

/**
 * Create a rate limit configuration for a specific route
 */
function rateLimitFor(routeId: string, options: RateLimitOptions = {}) {
  const max = options.max ?? parseInt(env.RATE_LIMIT_USER_MAX);
  const timeWindow = options.timeWindow ?? env.RATE_LIMIT_USER_WINDOW;
  const keyMode = options.keyMode ?? "combo";

  const keyGenerator =
    keyMode === "ip"
      ? (request: FastifyRequest) => `${routeId}:${ipKey(request)}`
      : (request: FastifyRequest) => comboKey(request);

  return {
    keyGenerator,
    max,
    timeWindow,
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
      (request.log as any).warn({
        message: "Rate limit exceeded",
        routeId,
        keyHash,
        ip: ipKey(request).substring(0, 8),
      });
    },
    onExceeded: (request: FastifyRequest) => {
      const keyHash = keyGenerator(request).substring(0, 8);
      (request.log as any).warn({
        message: "Rate limit exceeded - request blocked",
        routeId,
        keyHash,
        ip: ipKey(request).substring(0, 8),
      });
    },
  };
}

/**
 * Build rate limit options for route-level configuration (CodeQL compliance)
 * @param routeId - Unique route identifier
 * @param opts - Rate limit options
 * @returns Fastify route options with rateLimit key
 */
export function buildRateLimitOptions(
  routeId: string,
  opts: Partial<FastifyRateLimitOptions> & {
    keyMode?: "combo" | "ip";
    max?: number;
    timeWindow?: string;
  } = {}
): { rateLimit: FastifyRateLimitOptions } {
  const { keyMode = "combo", max, timeWindow, ...rest } = opts;
  return {
    rateLimit: {
      max: max ?? Number(process.env.RATE_LIMIT_USER_MAX ?? 20),
      timeWindow: timeWindow ?? process.env.RATE_LIMIT_USER_WINDOW ?? "15m",
      hook: "onRequest",
      addHeaders: process.env.RATE_LIMIT_HEADERS === "standard",
      keyGenerator: (req: FastifyRequest) => (keyMode === "ip" ? ipKey(req) : comboKey(req)),
      errorResponseBuilder: (_request: FastifyRequest, context: { ttl: number; max: number }) => {
        const retryAfter = Math.round(context.ttl / 1000);
        return {
          code: 429,
          error: "Too Many Requests",
          message: `Rate limit exceeded for ${routeId}. Retry in ${retryAfter} seconds`,
          retryAfter,
        };
      },
      ...rest,
    },
  };
}

/**
 * Get Redis client if available
 */
async function getRedisClient(fastify: FastifyInstance): Promise<any | null> {
  try {
    return fastify.redis;
  } catch {
    return null;
  }
}

/**
 * Progressive login failure penalty system
 */
function loginFailurePenaltyPreHandler(_routeId: string) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const redisClient = await getRedisClient(request.server);
      const ip = ipKey(request);
      const userKey = makeUserKey(request);
      const failureKey = `login_failures:${crypto.createHash("sha256").update(`${ip}:${userKey}`).digest("hex").substring(0, 16)}`;

      if (redisClient) {
        // Use Redis for distributed rate limiting
        const failureData = await redisClient.get(failureKey);
        let failures: LoginFailureData = failureData
          ? JSON.parse(failureData)
          : { count: 0, lastAttempt: 0 };

        // Check if currently blocked
        if (failures.blockUntil && Date.now() < failures.blockUntil) {
          const retryAfter = Math.round((failures.blockUntil - Date.now()) / 1000);
          reply.header("Retry-After", retryAfter);
          reply.status(429).send({
            code: 429,
            error: "Too Many Requests",
            message: `Too many failed login attempts. Retry in ${retryAfter} seconds`,
            retryAfter,
          });
          return;
        }

        // Check if we need to apply progressive penalty
        const baseBlockMs = parseInt(env.LOGIN_FAIL_BASE_BLOCK_MS);
        const maxBlockMs = parseInt(env.LOGIN_FAIL_MAX_BLOCK_MS);
        const timeSinceLastAttempt = Date.now() - failures.lastAttempt;

        // If last attempt was recent (within 5 minutes), apply progressive penalty
        if (timeSinceLastAttempt < 5 * 60 * 1000 && failures.count > 0) {
          const penaltyMs = Math.min(baseBlockMs * Math.pow(2, failures.count - 1), maxBlockMs);
          failures.blockUntil = Date.now() + penaltyMs;
          failures.count += 1;
          failures.lastAttempt = Date.now();

          await redisClient.setex(
            failureKey,
            Math.ceil(penaltyMs / 1000),
            JSON.stringify(failures)
          );

          const retryAfter = Math.round(penaltyMs / 1000);
          reply.header("Retry-After", retryAfter);
          reply.status(429).send({
            code: 429,
            error: "Too Many Requests",
            message: `Too many failed login attempts. Retry in ${retryAfter} seconds`,
            retryAfter,
          });
          return;
        }

        // Reset if enough time has passed
        if (timeSinceLastAttempt >= 5 * 60 * 1000) {
          failures = { count: 0, lastAttempt: 0 };
          await redisClient.setex(failureKey, 300, JSON.stringify(failures)); // Store reset state
        }
      } else {
        // Fallback to in-memory storage (single instance only)
        const memoryKey = `memory_${failureKey}`;
        if (!(global as any).__rateLimitMemory) {
          (global as any).__rateLimitMemory = new Map();
        }

        const memory = (global as any).__rateLimitMemory;
        let failures: LoginFailureData = memory.get(memoryKey) || { count: 0, lastAttempt: 0 };

        // Check if currently blocked
        if (failures.blockUntil && Date.now() < failures.blockUntil) {
          const retryAfter = Math.round((failures.blockUntil - Date.now()) / 1000);
          reply.header("Retry-After", retryAfter);
          reply.status(429).send({
            code: 429,
            error: "Too Many Requests",
            message: `Too many failed login attempts. Retry in ${retryAfter} seconds`,
            retryAfter,
          });
          return;
        }

        // Apply progressive penalty logic (same as Redis version)
        const baseBlockMs = parseInt(env.LOGIN_FAIL_BASE_BLOCK_MS);
        const maxBlockMs = parseInt(env.LOGIN_FAIL_MAX_BLOCK_MS);
        const timeSinceLastAttempt = Date.now() - failures.lastAttempt;

        if (timeSinceLastAttempt < 5 * 60 * 1000 && failures.count > 0) {
          const penaltyMs = Math.min(baseBlockMs * Math.pow(2, failures.count - 1), maxBlockMs);
          failures.blockUntil = Date.now() + penaltyMs;
          failures.count += 1;
          failures.lastAttempt = Date.now();

          memory.set(memoryKey, failures);

          const retryAfter = Math.round(penaltyMs / 1000);
          reply.header("Retry-After", retryAfter);
          reply.status(429).send({
            code: 429,
            error: "Too Many Requests",
            message: `Too many failed login attempts. Retry in ${retryAfter} seconds`,
            retryAfter,
          });
          return;
        }

        // Reset if enough time has passed
        if (timeSinceLastAttempt >= 5 * 60 * 1000) {
          failures = { count: 0, lastAttempt: 0 };
          memory.set(memoryKey, failures);
        }
      }
    } catch (error) {
      // If penalty system fails, log error but don't block the request
      (request.log as any).error({
        message: "Login failure penalty system error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };
}

/**
 * Reset login failure counter on successful login
 */
async function resetLoginFailureCounter(request: FastifyRequest): Promise<void> {
  try {
    const redisClient = await getRedisClient(request.server);
    const ip = ipKey(request);
    const userKey = makeUserKey(request);
    const failureKey = `login_failures:${crypto.createHash("sha256").update(`${ip}:${userKey}`).digest("hex").substring(0, 16)}`;

    if (redisClient) {
      await redisClient.del(failureKey);
    } else {
      // Fallback to in-memory storage
      const memoryKey = `memory_${failureKey}`;
      if ((global as any).__rateLimitMemory) {
        (global as any).__rateLimitMemory.delete(memoryKey);
      }
    }
  } catch (error) {
    // Log error but don't fail the request
    (request.log as any).error({
      message: "Failed to reset login failure counter",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

/**
 * Register the rate limiting security plugin
 */
export async function rateLimitPlugin(fastify: FastifyInstance) {
  // Register Redis if URL is provided
  if (env.RATE_LIMIT_REDIS_URL) {
    try {
      await fastify.register(redis, {
        url: env.RATE_LIMIT_REDIS_URL,
        lazyConnect: true,
      });
      (fastify.log as any).info({
        message: "Redis connected for rate limiting",
      });
    } catch (error) {
      (fastify.log as any).warn({
        message: "Failed to connect to Redis, using in-memory fallback",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  // Note: Global rate-limit registration is handled centrally in app.ts with { global: false }.
  // This security plugin focuses on Redis wiring and helper decorators only.

  // Decorate Fastify with rate limiting helpers
  fastify.decorate("ipKey", ipKey);
  fastify.decorate("makeUserKey", makeUserKey);
  fastify.decorate("comboKey", comboKey);
  fastify.decorate("rateLimitFor", rateLimitFor);
  fastify.decorate("buildRateLimitOptions", buildRateLimitOptions);
  fastify.decorate("loginFailurePenaltyPreHandler", loginFailurePenaltyPreHandler);
  fastify.decorate("resetLoginFailureCounter", resetLoginFailureCounter);
}

// Extend FastifyInstance type to include our decorators
declare module "fastify" {
  interface FastifyInstance {
    ipKey(request: FastifyRequest): string;
    makeUserKey(request: FastifyRequest): string;
    comboKey(request: FastifyRequest): string;
    rateLimitFor(routeId: string, options?: RateLimitOptions): any;
    buildRateLimitOptions(
      routeId: string,
      opts?: Partial<FastifyRateLimitOptions> & {
        keyMode?: "combo" | "ip";
        max?: number;
        timeWindow?: string;
      }
    ): { rateLimit: FastifyRateLimitOptions };
    loginFailurePenaltyPreHandler(
      routeId: string
    ): (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
    resetLoginFailureCounter(request: FastifyRequest): Promise<void>;
  }
}

export default rateLimitPlugin;
