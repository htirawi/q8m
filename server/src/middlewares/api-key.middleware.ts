/**
 * API Key Authentication Middleware
 *
 * Supports dual-key rotation with grace period:
 * - API_KEY_ACTIVE: Current active key
 * - API_KEY_NEXT: Next key during rotation period
 *
 * During rotation, both keys are accepted for a grace period to allow
 * clients to migrate without service disruption.
 */

import { pbkdf2Sync, timingSafeEqual } from "crypto";

import type { FastifyRequest, FastifyReply } from "fastify";

/**
 * API key metadata for tracking usage
 */
export interface ApiKeyMetadata {
  keyId: string;
  isActive: boolean;
  usageCount: number;
  lastUsed: Date;
  clientInfo?: {
    ip: string;
    userAgent?: string;
  };
}

/**
 * Global API key usage tracking (in production, use Redis)
 */
const apiKeyUsageStore = new Map<string, ApiKeyMetadata>();

/**
 * Hash an API key for secure comparison
 * ✅ SECURITY FIX (CodeQL #728): Use password-based key derivation with sufficient computational effort
 * SHA256 is not sufficient for API key hashing - using PBKDF2 with high iterations
 */
function hashApiKey(key: string): string {
  // Using PBKDF2 with 100,000 iterations for adequate computational effort
  // This prevents brute-force attacks on API keys
  const salt = "api-key-salt-q8m-platform"; // In production, use unique salt per key
  const iterations = 100000;
  const keylen = 32;
  const digest = "sha256";
  
  return pbkdf2Sync(key, salt, iterations, keylen, digest).toString("hex");
}

/**
 * Extract API key from request
 */
function extractApiKey(request: FastifyRequest): string | null {
  const { headers } = request;

  // Check Authorization header (Bearer scheme)
  const authHeader = headers.authorization || headers.Authorization;
  if (authHeader && typeof authHeader === "string") {
    const match = authHeader.match(/^Bearer\s+(.+)$/i);
    if (match?.[1]) {
      return match[1];
    }
  }

  // Check X-API-Key header
  const apiKeyHeader = headers["x-api-key"] || headers["X-API-Key"];
  if (apiKeyHeader && typeof apiKeyHeader === "string") {
    return apiKeyHeader;
  }

  return null;
}

/**
 * Validate API key with dual-key support
 * Note: Reads from process.env at runtime for testability
 */
function validateApiKey(providedKey: string): {
  valid: boolean;
  keyId?: string;
  isActive?: boolean;
  deprecationWarning?: string;
} {
  // Read from process.env at runtime (not cached env object) for testability
  const { API_KEY_ACTIVE, API_KEY_NEXT, API_KEY_ACTIVE_ID, API_KEY_NEXT_ID } = process.env;

  // Hash the provided key for secure comparison
  const providedKeyHash = hashApiKey(providedKey);

  // Check active key
  if (API_KEY_ACTIVE) {
    const activeKeyHash = hashApiKey(API_KEY_ACTIVE);
    if (timingSafeEqual(Buffer.from(providedKeyHash), Buffer.from(activeKeyHash))) {
      return {
        valid: true,
        keyId: API_KEY_ACTIVE_ID || "active",
        isActive: true,
      };
    }
  }

  // Check next key (during rotation grace period)
  if (API_KEY_NEXT) {
    const nextKeyHash = hashApiKey(API_KEY_NEXT);
    if (timingSafeEqual(Buffer.from(providedKeyHash), Buffer.from(nextKeyHash))) {
      return {
        valid: true,
        keyId: API_KEY_NEXT_ID || "next",
        isActive: false,
        deprecationWarning:
          "This API key is scheduled for deprecation. Please migrate to the new key.",
      };
    }
  }

  return { valid: false };
}

/**
 * Track API key usage
 */
function trackApiKeyUsage(keyId: string, request: FastifyRequest): void {
  const existing = apiKeyUsageStore.get(keyId);

  if (existing) {
    existing.usageCount += 1;
    existing.lastUsed = new Date();
    existing.clientInfo = {
      ip: request.ip || "unknown",
      userAgent: request.headers["user-agent"],
    };
  } else {
    apiKeyUsageStore.set(keyId, {
      keyId,
      isActive: true,
      usageCount: 1,
      lastUsed: new Date(),
      clientInfo: {
        ip: request.ip || "unknown",
        userAgent: request.headers["user-agent"],
      },
    });
  }
}

/**
 * Get API key usage statistics
 */
export function getApiKeyUsageStats(): Map<string, ApiKeyMetadata> {
  return new Map(apiKeyUsageStore);
}

/**
 * Reset API key usage statistics
 */
export function resetApiKeyUsageStats(): void {
  apiKeyUsageStore.clear();
}

/**
 * API Key Authentication Middleware
 *
 * Validates API key from Authorization header or X-API-Key header.
 * Supports dual-key rotation with automatic deprecation warnings.
 */
export async function apiKeyAuth(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  const apiKey = extractApiKey(request);

  if (!apiKey) {
    request.log.warn({
      event: "api_key_missing",
      ip: request.ip,
      url: request.url,
    });

    return reply.status(401).send({
      code: 401,
      error: "Unauthorized",
      message:
        "API key is required. Provide it via Authorization: Bearer <key> or X-API-Key header.",
    });
  }

  const validation = validateApiKey(apiKey);

  if (!validation.valid) {
    request.log.warn({
      event: "api_key_invalid",
      ip: request.ip,
      url: request.url,
      keyPrefix: apiKey.substring(0, 8),
    });

    return reply.status(401).send({
      code: 401,
      error: "Unauthorized",
      message: "Invalid API key",
    });
  }

  // Track usage
  if (validation.keyId) {
    trackApiKeyUsage(validation.keyId, request);
  }

  // Log successful authentication
  request.log.info({
    event: "api_key_authenticated",
    keyId: validation.keyId,
    isActive: validation.isActive,
    url: request.url,
  });

  // Add deprecation warning header if using next key
  if (validation.deprecationWarning) {
    reply.header("X-API-Key-Deprecation-Warning", validation.deprecationWarning);

    request.log.warn({
      event: "api_key_deprecated_usage",
      keyId: validation.keyId,
      ip: request.ip,
      url: request.url,
    });
  }

  // Attach API key metadata to request
  (request as FastifyRequest & { apiKeyId?: string }).apiKeyId = validation.keyId;
}

/**
 * Optional API key authentication (allows requests without API key)
 */
export async function optionalApiKeyAuth(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  const apiKey = extractApiKey(request);

  if (!apiKey) {
    // No API key provided, allow request to continue
    return;
  }

  // API key provided, validate it
  return apiKeyAuth(request, reply);
}

/**
 * Get API key rotation status
 * Note: Reads from process.env at runtime for testability
 */
export function getApiKeyRotationStatus(): {
  hasActiveKey: boolean;
  hasNextKey: boolean;
  gracePeriodDays: number;
  isRotationInProgress: boolean;
  metrics: {
    activeKeyUsage: number;
    nextKeyUsage: number;
  };
} {
  // Read from process.env at runtime (not cached env object) for testability
  const {
    API_KEY_ACTIVE,
    API_KEY_NEXT,
    API_KEY_ACTIVE_ID = "active",
    API_KEY_NEXT_ID = "next",
    API_KEY_ROTATION_GRACE_PERIOD_DAYS = "7",
  } = process.env;
  const gracePeriodDays = parseInt(API_KEY_ROTATION_GRACE_PERIOD_DAYS, 10);

  const activeKeyStats = apiKeyUsageStore.get(API_KEY_ACTIVE_ID);
  const nextKeyStats = apiKeyUsageStore.get(API_KEY_NEXT_ID);

  return {
    hasActiveKey: !!API_KEY_ACTIVE,
    hasNextKey: !!API_KEY_NEXT,
    gracePeriodDays,
    isRotationInProgress: !!(API_KEY_ACTIVE && API_KEY_NEXT),
    metrics: {
      activeKeyUsage: activeKeyStats?.usageCount || 0,
      nextKeyUsage: nextKeyStats?.usageCount || 0,
    },
  };
}

// Extend FastifyRequest type
declare module "fastify" {
  interface FastifyRequest {
    apiKeyId?: string;
  }
}
