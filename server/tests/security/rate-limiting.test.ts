/**
 * Rate limiting tests
 */

import { test, expect, describe } from "vitest";
import { buildRateLimitOptions } from "../../src/security/rateLimit.js";

describe("Rate Limiting Integration", () => {
  test("auth routes should have rate limiting applied", async () => {
    // Test that buildRateLimitOptions creates valid configuration
    const loginOptions = buildRateLimitOptions("auth:login", { max: 20, timeWindow: "15m" });

    expect(loginOptions).toHaveProperty("rateLimit");
    expect(loginOptions.rateLimit.max).toBe(20);
    expect(loginOptions.rateLimit.timeWindow).toBe("15m");
    expect(loginOptions.rateLimit.hook).toBe("onRequest");
    expect(typeof loginOptions.rateLimit.keyGenerator).toBe("function");
    expect(typeof loginOptions.rateLimit.errorResponseBuilder).toBe("function");
  });

  test("rate limit error response should include retry-after", () => {
    const { buildRateLimitOptions } = require("../../src/security/rateLimit.js");
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
    const { buildRateLimitOptions } = require("../../src/security/rateLimit.js");

    const loginOptions = buildRateLimitOptions("auth:login", { max: 20, timeWindow: "15m" });
    const signupOptions = buildRateLimitOptions("auth:signup", { max: 10, timeWindow: "15m" });
    const refreshOptions = buildRateLimitOptions("auth:refresh", { max: 100, timeWindow: "15m" });

    expect(loginOptions.rateLimit.max).toBe(20);
    expect(signupOptions.rateLimit.max).toBe(10);
    expect(refreshOptions.rateLimit.max).toBe(100);
  });

  test("key generator should create different keys for different routes", () => {
    const { buildRateLimitOptions } = require("../../src/security/rateLimit.js");

    const loginOptions = buildRateLimitOptions("auth:login");
    const signupOptions = buildRateLimitOptions("auth:signup");

    const mockRequest = {
      ip: "127.0.0.1",
      body: { email: "test@example.com" },
      query: {},
      params: {},
    };

    const loginKey = loginOptions.rateLimit.keyGenerator(mockRequest);
    const signupKey = signupOptions.rateLimit.keyGenerator(mockRequest);

    expect(loginKey).not.toBe(signupKey);
    expect(loginKey).toContain("auth:login");
    expect(signupKey).toContain("auth:signup");
  });
});
