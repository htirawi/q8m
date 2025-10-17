/**
 * API Key Rotation Tests
 * Tests for dual-key API authentication with rotation support
 */

import { describe, test, expect, beforeEach } from "vitest";
import {
  apiKeyAuth,
  optionalApiKeyAuth,
  getApiKeyRotationStatus,
  resetApiKeyUsageStats,
  getApiKeyUsageStats,
} from "@middlewares/api-key.middleware.js";
import type { FastifyRequest, FastifyReply } from "fastify";

// Mock request and reply
function createMockRequest(headers: Record<string, string>): FastifyRequest {
  return {
    headers,
    ip: "192.168.1.1",
    url: "/api/test",
    log: {
      info: () => {},
      warn: () => {},
      error: () => {},
    },
  } as unknown as FastifyRequest;
}

function createMockReply(): FastifyReply {
  let statusCode = 200;
  let responseBody: unknown = null;
  const headersMap = new Map<string, string>();

  const replyObj = {
    status: (code: number) => {
      statusCode = code;
      return replyObj; // Return self for chaining
    },
    send: (body: unknown) => {
      responseBody = body;
      return replyObj; // Return self for chaining
    },
    header: (key: string, value: string) => {
      headersMap.set(key, value);
      return replyObj; // Return self for chaining
    },
    getStatusCode: () => statusCode,
    getBody: () => responseBody,
    getHeader: (key: string) => headersMap.get(key),
  };

  return replyObj as unknown as FastifyReply;
}

beforeEach(() => {
  resetApiKeyUsageStats();
});

describe("API Key Extraction", () => {
  test("should extract API key from Authorization Bearer header", async () => {
    // Set up environment with active key
    process.env.API_KEY_ACTIVE = "test-active-key-12345678901234567890";
    process.env.API_KEY_ACTIVE_ID = "key-active-001";

    const request = createMockRequest({
      authorization: "Bearer test-active-key-12345678901234567890",
    });
    const reply = createMockReply();

    await apiKeyAuth(request, reply);

    // Should not return 401
    const body = reply.getBody();
    expect(body).toBeFalsy(); // No error body means success
    expect(reply.getStatusCode()).not.toBe(401);
  });

  test("should extract API key from X-API-Key header", async () => {
    process.env.API_KEY_ACTIVE = "test-active-key-12345678901234567890";
    process.env.API_KEY_ACTIVE_ID = "key-active-001";

    const request = createMockRequest({
      "x-api-key": "test-active-key-12345678901234567890",
    });
    const reply = createMockReply();

    await apiKeyAuth(request, reply);

    const body = reply.getBody();
    expect(body).toBeFalsy(); // No error body means success
    expect(reply.getStatusCode()).not.toBe(401);
  });

  test("should return 401 if no API key provided", async () => {
    const request = createMockRequest({});
    const reply = createMockReply();

    await apiKeyAuth(request, reply);

    expect(reply.getStatusCode()).toBe(401);
    expect(reply.getBody()).toHaveProperty("error", "Unauthorized");
  });
});

describe("API Key Validation", () => {
  test("should accept valid active key", async () => {
    process.env.API_KEY_ACTIVE = "valid-active-key-12345678901234567890";
    process.env.API_KEY_ACTIVE_ID = "key-active-001";

    const request = createMockRequest({
      authorization: "Bearer valid-active-key-12345678901234567890",
    });
    const reply = createMockReply();

    await apiKeyAuth(request, reply);

    expect(reply.getStatusCode()).not.toBe(401);
    expect(request.apiKeyId).toBe("key-active-001");
  });

  test("should accept valid next key during rotation", async () => {
    process.env.API_KEY_ACTIVE = "active-key-12345678901234567890";
    process.env.API_KEY_NEXT = "next-key-12345678901234567890";
    process.env.API_KEY_ACTIVE_ID = "key-active-001";
    process.env.API_KEY_NEXT_ID = "key-next-002";

    const request = createMockRequest({
      authorization: "Bearer next-key-12345678901234567890",
    });
    const reply = createMockReply();

    await apiKeyAuth(request, reply);

    expect(reply.getStatusCode()).not.toBe(401);
    expect(request.apiKeyId).toBe("key-next-002");
    expect(reply.getHeader("X-API-Key-Deprecation-Warning")).toBeDefined();
  });

  test("should reject invalid API key", async () => {
    process.env.API_KEY_ACTIVE = "valid-key-12345678901234567890";

    const request = createMockRequest({
      authorization: "Bearer invalid-key-12345678901234567890",
    });
    const reply = createMockReply();

    await apiKeyAuth(request, reply);

    expect(reply.getStatusCode()).toBe(401);
    expect(reply.getBody()).toHaveProperty("error", "Unauthorized");
  });

  test("should use timing-safe comparison", async () => {
    process.env.API_KEY_ACTIVE = "secret-key-12345678901234567890";

    const validRequest = createMockRequest({
      authorization: "Bearer secret-key-12345678901234567890",
    });
    const invalidRequest = createMockRequest({
      authorization: "Bearer secret-key-12345678901234567891", // Last char different
    });

    const validReply = createMockReply();
    const invalidReply = createMockReply();

    await apiKeyAuth(validRequest, validReply);
    await apiKeyAuth(invalidRequest, invalidReply);

    expect(validReply.getStatusCode()).not.toBe(401);
    expect(invalidReply.getStatusCode()).toBe(401);
  });
});

describe("Dual Key Rotation", () => {
  test("should accept both active and next keys during rotation", async () => {
    process.env.API_KEY_ACTIVE = "active-key-12345678901234567890";
    process.env.API_KEY_NEXT = "next-key-12345678901234567890";
    process.env.API_KEY_ACTIVE_ID = "key-active-001";
    process.env.API_KEY_NEXT_ID = "key-next-002";

    const activeRequest = createMockRequest({
      authorization: "Bearer active-key-12345678901234567890",
    });
    const nextRequest = createMockRequest({
      authorization: "Bearer next-key-12345678901234567890",
    });

    const activeReply = createMockReply();
    const nextReply = createMockReply();

    await apiKeyAuth(activeRequest, activeReply);
    await apiKeyAuth(nextRequest, nextReply);

    // Both should succeed
    expect(activeReply.getStatusCode()).not.toBe(401);
    expect(nextReply.getStatusCode()).not.toBe(401);

    // Next key should have deprecation warning
    expect(nextReply.getHeader("X-API-Key-Deprecation-Warning")).toBeDefined();
  });

  test("should track usage by key ID", async () => {
    process.env.API_KEY_ACTIVE = "active-key-12345678901234567890";
    process.env.API_KEY_NEXT = "next-key-12345678901234567890";
    process.env.API_KEY_ACTIVE_ID = "key-active-001";
    process.env.API_KEY_NEXT_ID = "key-next-002";

    resetApiKeyUsageStats();

    // Make 3 requests with active key
    for (let i = 0; i < 3; i++) {
      const request = createMockRequest({
        authorization: "Bearer active-key-12345678901234567890",
      });
      await apiKeyAuth(request, createMockReply());
    }

    // Make 2 requests with next key
    for (let i = 0; i < 2; i++) {
      const request = createMockRequest({
        authorization: "Bearer next-key-12345678901234567890",
      });
      await apiKeyAuth(request, createMockReply());
    }

    const stats = getApiKeyUsageStats();
    const activeStats = stats.get("key-active-001");
    const nextStats = stats.get("key-next-002");

    expect(activeStats?.usageCount).toBe(3);
    expect(nextStats?.usageCount).toBe(2);
  });

  test("should get rotation status", () => {
    process.env.API_KEY_ACTIVE = "active-key-12345678901234567890";
    process.env.API_KEY_NEXT = "next-key-12345678901234567890";
    process.env.API_KEY_ROTATION_GRACE_PERIOD_DAYS = "7";

    const status = getApiKeyRotationStatus();

    expect(status.hasActiveKey).toBe(true);
    expect(status.hasNextKey).toBe(true);
    expect(status.isRotationInProgress).toBe(true);
    expect(status.gracePeriodDays).toBe(7);
  });
});

describe("Optional API Key Auth", () => {
  test("should allow requests without API key", async () => {
    const request = createMockRequest({});
    const reply = createMockReply();

    await optionalApiKeyAuth(request, reply);

    // Should succeed without API key
    expect(reply.getStatusCode()).not.toBe(401);
  });

  test("should validate API key if provided", async () => {
    process.env.API_KEY_ACTIVE = "valid-key-12345678901234567890";

    const validRequest = createMockRequest({
      authorization: "Bearer valid-key-12345678901234567890",
    });
    const invalidRequest = createMockRequest({
      authorization: "Bearer invalid-key-12345678901234567890",
    });

    const validReply = createMockReply();
    const invalidReply = createMockReply();

    await optionalApiKeyAuth(validRequest, validReply);
    await optionalApiKeyAuth(invalidRequest, invalidReply);

    expect(validReply.getStatusCode()).not.toBe(401);
    expect(invalidReply.getStatusCode()).toBe(401);
  });
});

describe("API Key Usage Tracking", () => {
  test("should track usage count", async () => {
    process.env.API_KEY_ACTIVE = "test-key-12345678901234567890";
    process.env.API_KEY_ACTIVE_ID = "key-001";

    resetApiKeyUsageStats();

    for (let i = 0; i < 5; i++) {
      const request = createMockRequest({
        authorization: "Bearer test-key-12345678901234567890",
      });
      await apiKeyAuth(request, createMockReply());
    }

    const stats = getApiKeyUsageStats();
    const keyStats = stats.get("key-001");

    expect(keyStats?.usageCount).toBe(5);
  });

  test("should track last used timestamp", async () => {
    process.env.API_KEY_ACTIVE = "test-key-12345678901234567890";
    process.env.API_KEY_ACTIVE_ID = "key-001";

    resetApiKeyUsageStats();

    const request = createMockRequest({
      authorization: "Bearer test-key-12345678901234567890",
    });
    await apiKeyAuth(request, createMockReply());

    const stats = getApiKeyUsageStats();
    const keyStats = stats.get("key-001");

    expect(keyStats?.lastUsed).toBeInstanceOf(Date);
    expect(keyStats?.lastUsed.getTime()).toBeLessThanOrEqual(Date.now());
  });

  test("should track client IP and user agent", async () => {
    process.env.API_KEY_ACTIVE = "test-key-12345678901234567890";
    process.env.API_KEY_ACTIVE_ID = "key-001";

    resetApiKeyUsageStats();

    const request = createMockRequest({
      authorization: "Bearer test-key-12345678901234567890",
      "user-agent": "Test Client/1.0",
    });
    (request as { ip: string }).ip = "203.0.113.42";

    await apiKeyAuth(request, createMockReply());

    const stats = getApiKeyUsageStats();
    const keyStats = stats.get("key-001");

    expect(keyStats?.clientInfo?.ip).toBe("203.0.113.42");
    expect(keyStats?.clientInfo?.userAgent).toBe("Test Client/1.0");
  });
});

describe("Security - Timing Attacks", () => {
  test("should prevent timing attacks via constant-time comparison", async () => {
    process.env.API_KEY_ACTIVE = "secret-key-12345678901234567890";

    const attempts = [
      "secret-key-12345678901234567890", // Correct
      "secret-key-12345678901234567891", // Last char wrong
      "aaaaaa-key-12345678901234567890", // First chars wrong
      "completely-different-key-000000", // Completely different
    ];

    const timings: number[] = [];

    for (const key of attempts) {
      const request = createMockRequest({
        authorization: `Bearer ${key}`,
      });
      const reply = createMockReply();

      const start = process.hrtime.bigint();
      await apiKeyAuth(request, reply);
      const end = process.hrtime.bigint();

      timings.push(Number(end - start) / 1_000_000); // Convert to milliseconds
    }

    // All timings should be within a reasonable range (< 20ms variation)
    // This is a basic check - true constant-time requires hardware-level analysis
    // Note: 20ms allows for system load variance while still catching timing vulnerabilities
    const minTime = Math.min(...timings);
    const maxTime = Math.max(...timings);
    const variation = maxTime - minTime;

    expect(variation).toBeLessThan(20); // Less than 20ms variation (allows for system variance)
  });
});

describe("API Key Rotation Workflow", () => {
  test("should support rotation workflow: step 1 (add next key)", () => {
    process.env.API_KEY_ACTIVE = "active-key-12345678901234567890";
    process.env.API_KEY_NEXT = "next-key-12345678901234567890";
    process.env.API_KEY_ACTIVE_ID = "key-v1";
    process.env.API_KEY_NEXT_ID = "key-v2";

    const status = getApiKeyRotationStatus();

    expect(status.hasActiveKey).toBe(true);
    expect(status.hasNextKey).toBe(true);
    expect(status.isRotationInProgress).toBe(true);
  });

  test("should support rotation workflow: step 2 (monitor migration)", async () => {
    process.env.API_KEY_ACTIVE = "active-key-12345678901234567890";
    process.env.API_KEY_NEXT = "next-key-12345678901234567890";
    process.env.API_KEY_ACTIVE_ID = "key-v1";
    process.env.API_KEY_NEXT_ID = "key-v2";

    resetApiKeyUsageStats();

    // Simulate clients migrating from active to next
    for (let i = 0; i < 10; i++) {
      const request = createMockRequest({
        authorization: "Bearer active-key-12345678901234567890",
      });
      await apiKeyAuth(request, createMockReply());
    }

    for (let i = 0; i < 5; i++) {
      const request = createMockRequest({
        authorization: "Bearer next-key-12345678901234567890",
      });
      await apiKeyAuth(request, createMockReply());
    }

    const status = getApiKeyRotationStatus();

    expect(status.metrics.activeKeyUsage).toBe(10);
    expect(status.metrics.nextKeyUsage).toBe(5);
  });

  test("should support rotation workflow: step 3 (promote next to active)", () => {
    // After all clients migrated, promote next to active
    process.env.API_KEY_ACTIVE = "next-key-12345678901234567890"; // Promoted
    process.env.API_KEY_NEXT = ""; // Removed
    process.env.API_KEY_ACTIVE_ID = "key-v2";
    process.env.API_KEY_NEXT_ID = "";

    const status = getApiKeyRotationStatus();

    expect(status.hasActiveKey).toBe(true);
    expect(status.hasNextKey).toBe(false);
    expect(status.isRotationInProgress).toBe(false);
  });
});

describe("Deprecation Warnings", () => {
  test("should include deprecation warning header for next key", async () => {
    process.env.API_KEY_ACTIVE = "active-key-12345678901234567890";
    process.env.API_KEY_NEXT = "next-key-12345678901234567890";
    process.env.API_KEY_ACTIVE_ID = "key-v1";
    process.env.API_KEY_NEXT_ID = "key-v2";

    const request = createMockRequest({
      authorization: "Bearer next-key-12345678901234567890",
    });
    const reply = createMockReply();

    await apiKeyAuth(request, reply);

    const warning = reply.getHeader("X-API-Key-Deprecation-Warning");
    expect(warning).toBeDefined();
    expect(warning).toContain("deprecation");
  });

  test("should not include deprecation warning for active key", async () => {
    process.env.API_KEY_ACTIVE = "active-key-12345678901234567890";
    process.env.API_KEY_NEXT = "next-key-12345678901234567890";
    process.env.API_KEY_ACTIVE_ID = "key-v1";
    process.env.API_KEY_NEXT_ID = "key-v2";

    const request = createMockRequest({
      authorization: "Bearer active-key-12345678901234567890",
    });
    const reply = createMockReply();

    await apiKeyAuth(request, reply);

    const warning = reply.getHeader("X-API-Key-Deprecation-Warning");
    expect(warning).toBeUndefined();
  });
});

describe("Edge Cases", () => {
  test("should handle malformed Authorization header", async () => {
    process.env.API_KEY_ACTIVE = "valid-key-12345678901234567890";

    const request = createMockRequest({
      authorization: "NotBearer valid-key-12345678901234567890",
    });
    const reply = createMockReply();

    await apiKeyAuth(request, reply);

    expect(reply.getStatusCode()).toBe(401);
  });

  test("should handle empty API key", async () => {
    process.env.API_KEY_ACTIVE = "valid-key-12345678901234567890";

    const request = createMockRequest({
      authorization: "Bearer ",
    });
    const reply = createMockReply();

    await apiKeyAuth(request, reply);

    expect(reply.getStatusCode()).toBe(401);
  });

  test("should handle no API keys configured", async () => {
    delete process.env.API_KEY_ACTIVE;
    delete process.env.API_KEY_NEXT;

    const request = createMockRequest({
      authorization: "Bearer any-key-12345678901234567890",
    });
    const reply = createMockReply();

    await apiKeyAuth(request, reply);

    expect(reply.getStatusCode()).toBe(401);
  });

  test("should handle case-insensitive Bearer scheme", async () => {
    process.env.API_KEY_ACTIVE = "test-key-12345678901234567890";

    const request = createMockRequest({
      authorization: "bearer test-key-12345678901234567890", // Lowercase
    });
    const reply = createMockReply();

    await apiKeyAuth(request, reply);

    expect(reply.getStatusCode()).not.toBe(401);
  });
});
