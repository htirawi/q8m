/**
 * Rate limiting tests
 */

import { test, expect, describe } from "vitest";
import { buildRateLimitOptions } from "@server/security/rateLimit.js";

describe("Rate Limiting Integration", () => {
  test("auth routes should have rate limiting applied", async () => {
    // Test that buildRateLimitOptions creates valid configuration
    const loginOptions = buildRateLimitOptions("auth:login", { max: 20, timeWindow: "15m" });

    expect(loginOptions).toHaveProperty("rateLimit");
    expect((loginOptions.rateLimit as any).max).toBe(20);
    expect((loginOptions.rateLimit as any).timeWindow).toBe("15m");
    expect((loginOptions.rateLimit as any).hook).toBe("onRequest");
    expect(typeof (loginOptions.rateLimit as any).keyGenerator).toBe("function");
    expect(typeof (loginOptions.rateLimit as any).errorResponseBuilder).toBe("function");
  });

  test("rate limit error response should include retry-after", () => {
    const options = buildRateLimitOptions("test:route");

    const mockRequest = { ip: "127.0.0.1" };
    const mockContext = { ttl: 30000, max: 20 }; // 30 seconds

    const errorResponse = options.rateLimit.errorResponseBuilder(mockRequest, mockContext);

    expect(errorResponse).toHaveProperty("code", 429);
    expect(errorResponse).toHaveProperty("error", "Too Many Requests");
    expect(errorResponse).toHaveProperty("retryAfter", 30);
    expect(errorResponse.message).toContain("Rate limit exceeded");
  });

  test("different routes should have different rate limits", () => {
    const loginOptions = buildRateLimitOptions("auth:login", { max: 20, timeWindow: "15m" });
    const signupOptions = buildRateLimitOptions("auth:signup", { max: 10, timeWindow: "15m" });
    const refreshOptions = buildRateLimitOptions("auth:refresh", { max: 100, timeWindow: "15m" });

    expect(loginOptions.rateLimit.max).toBe(20);
    expect(signupOptions.rateLimit.max).toBe(10);
    expect(refreshOptions.rateLimit.max).toBe(100);
  });

  test("key generator should create consistent keys based on request data", () => {
    const loginOptions = buildRateLimitOptions("auth:login");

    const mockRequest1 = {
      ip: "127.0.0.1",
      headers: {},
      body: { email: "test@example.com" },
      query: {},
      params: {},
    };

    const mockRequest2 = {
      ip: "192.168.1.1",
      headers: {},
      body: { email: "test@example.com" },
      query: {},
      params: {},
    };

    const key1 = loginOptions.rateLimit.keyGenerator(mockRequest1 as any);
    const key2 = loginOptions.rateLimit.keyGenerator(mockRequest2 as any);

    // Different IPs should produce different keys
    expect(key1).not.toBe(key2);

    // Same request should produce same key
    const key3 = loginOptions.rateLimit.keyGenerator(mockRequest1 as any);
    expect(key1).toBe(key3);
  });
});
