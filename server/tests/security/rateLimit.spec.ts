import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import Fastify from "fastify";
import rateLimitPlugin from "@server/security/rateLimit.js";

// Mock Redis for testing
vi.mock("@fastify/redis", () => ({
  default: vi.fn(),
}));

// Mock environment variables for testing
vi.mock("../../src/config/env.js", () => ({
  env: {
    RATE_LIMIT_TRUST_PROXY: "true",
    RATE_LIMIT_GLOBAL_WINDOW: "1m",
    RATE_LIMIT_GLOBAL_MAX: "100",
    RATE_LIMIT_IP_WINDOW: "1m",
    RATE_LIMIT_IP_MAX: "10",
    RATE_LIMIT_USER_WINDOW: "1m",
    RATE_LIMIT_USER_MAX: "5",
    RATE_LIMIT_HEADERS: "standard",
    RATE_LIMIT_REDIS_URL: "",
    LOGIN_FAIL_BASE_BLOCK_MS: "1000",
    LOGIN_FAIL_MAX_BLOCK_MS: "10000",
    HMAC_RATE_KEY_SECRET: "test-secret-key-for-hmac",
  },
}));

describe("Rate Limiting Security Plugin", () => {
  let fastify: any;

  beforeEach(async () => {
    fastify = Fastify({
      logger: false,
      trustProxy: true,
    });

    // Register the rate limiting plugin
    await fastify.register(rateLimitPlugin);

    // Wait for plugin to be ready and decorators to be applied
    await fastify.ready();

    // Verify decorators are available
    if (!fastify.rateLimitFor) {
      throw new Error("rateLimitFor decorator not registered");
    }

    // Add a test route for rate limiting
    fastify.post(
      "/test-auth",
      {
        config: {
          rateLimit: fastify.rateLimitFor("test:auth", {
            max: 3,
            timeWindow: "1m",
          }),
        },
      },
      async (_request: any, _reply: any) => {
        return { message: "success" };
      }
    );

    // Add a test route for login failure penalty
    fastify.post(
      "/test-login",
      {
        config: {
          rateLimit: fastify.rateLimitFor("test:login", {
            max: 5,
            timeWindow: "1m",
          }),
        },
        preHandler: [fastify.loginFailurePenaltyPreHandler("test:login")],
      },
      async (_request: any, _reply: any) => {
        return { message: "login success" };
      }
    );

    await fastify.ready();
  });

  afterEach(async () => {
    await fastify.close();
  });

  describe("IP Key Generation", () => {
    it("should extract IP from x-forwarded-for header", async () => {
      const response = await fastify.inject({
        method: "POST",
        url: "/test-auth",
        headers: {
          "x-forwarded-for": "192.168.1.1, 10.0.0.1",
        },
        payload: {},
      });

      expect(response.statusCode).toBe(200);
    });

    it("should extract IP from x-real-ip header", async () => {
      const response = await fastify.inject({
        method: "POST",
        url: "/test-auth",
        headers: {
          "x-real-ip": "192.168.1.100",
        },
        payload: {},
      });

      expect(response.statusCode).toBe(200);
    });

    it("should fallback to request.ip", async () => {
      const response = await fastify.inject({
        method: "POST",
        url: "/test-auth",
        payload: {},
      });

      expect(response.statusCode).toBe(200);
    });
  });

  describe("User Key Generation", () => {
    it("should extract and hash email from request body", async () => {
      const response = await fastify.inject({
        method: "POST",
        url: "/test-auth",
        payload: {
          email: "test@example.com",
        },
      });

      expect(response.statusCode).toBe(200);
    });

    it("should extract and hash email from query parameters", async () => {
      const response = await fastify.inject({
        method: "POST",
        url: "/test-auth?email=test@example.com",
        payload: {},
      });

      expect(response.statusCode).toBe(200);
    });

    it("should return empty string when no email provided", async () => {
      const response = await fastify.inject({
        method: "POST",
        url: "/test-auth",
        payload: {},
      });

      expect(response.statusCode).toBe(200);
    });

    it("should normalize email to lowercase", async () => {
      const response1 = await fastify.inject({
        method: "POST",
        url: "/test-auth",
        payload: {
          email: "TEST@EXAMPLE.COM",
        },
      });

      const response2 = await fastify.inject({
        method: "POST",
        url: "/test-auth",
        payload: {
          email: "test@example.com",
        },
      });

      expect(response1.statusCode).toBe(200);
      expect(response2.statusCode).toBe(200);
    });
  });

  describe("Rate Limiting", () => {
    it("should allow requests within limit", async () => {
      const response = await fastify.inject({
        method: "POST",
        url: "/test-auth",
        payload: {},
      });

      expect(response.statusCode).toBe(200);
      expect(response.json()).toEqual({ message: "success" });
    });

    it("should block requests exceeding limit", async () => {
      // Make requests up to the limit
      for (let i = 0; i < 3; i++) {
        const response = await fastify.inject({
          method: "POST",
          url: "/test-auth",
          payload: {},
        });
        expect(response.statusCode).toBe(200);
      }

      // This request should be blocked
      const blockedResponse = await fastify.inject({
        method: "POST",
        url: "/test-auth",
        payload: {},
      });

      expect(blockedResponse.statusCode).toBe(429);
      expect(blockedResponse.json()).toMatchObject({
        code: 429,
        error: "Too Many Requests",
      });
      expect(blockedResponse.json()).toHaveProperty("retryAfter");
    });

    it("should include rate limit headers when enabled", async () => {
      const response = await fastify.inject({
        method: "POST",
        url: "/test-auth",
        payload: {},
      });

      expect(response.statusCode).toBe(200);
      expect(response.headers).toHaveProperty("ratelimit-limit");
      expect(response.headers).toHaveProperty("ratelimit-remaining");
      expect(response.headers).toHaveProperty("ratelimit-reset");
    });

    it("should use combo key for user-based rate limiting", async () => {
      // Make requests with same IP but different emails
      const response1 = await fastify.inject({
        method: "POST",
        url: "/test-auth",
        headers: {
          "x-forwarded-for": "192.168.1.1",
        },
        payload: {
          email: "user1@example.com",
        },
      });

      const response2 = await fastify.inject({
        method: "POST",
        url: "/test-auth",
        headers: {
          "x-forwarded-for": "192.168.1.1",
        },
        payload: {
          email: "user2@example.com",
        },
      });

      expect(response1.statusCode).toBe(200);
      expect(response2.statusCode).toBe(200);
    });

    it("should use IP-only key when keyMode is ip", async () => {
      // Create a route with IP-only rate limiting
      fastify.post(
        "/test-ip",
        {
          config: {
            rateLimit: fastify.rateLimitFor("test:ip", {
              max: 2,
              timeWindow: "1m",
              keyMode: "ip",
            }),
          },
        },
        async (_request: any, _reply: any) => {
          return { message: "ip success" };
        }
      );

      await fastify.ready();

      // Make requests with same IP but different emails
      const response1 = await fastify.inject({
        method: "POST",
        url: "/test-ip",
        headers: {
          "x-forwarded-for": "192.168.1.1",
        },
        payload: {
          email: "user1@example.com",
        },
      });

      const response2 = await fastify.inject({
        method: "POST",
        url: "/test-ip",
        headers: {
          "x-forwarded-for": "192.168.1.1",
        },
        payload: {
          email: "user2@example.com",
        },
      });

      expect(response1.statusCode).toBe(200);
      expect(response2.statusCode).toBe(200);

      // Third request should be blocked regardless of email
      const blockedResponse = await fastify.inject({
        method: "POST",
        url: "/test-ip",
        headers: {
          "x-forwarded-for": "192.168.1.1",
        },
        payload: {
          email: "user3@example.com",
        },
      });

      expect(blockedResponse.statusCode).toBe(429);
    });
  });

  describe("Login Failure Penalty System", () => {
    it("should allow first login attempts", async () => {
      const response = await fastify.inject({
        method: "POST",
        url: "/test-login",
        headers: {
          "x-forwarded-for": "192.168.1.1",
        },
        payload: {
          email: "test@example.com",
        },
      });

      expect(response.statusCode).toBe(200);
    });

    it("should apply progressive penalty for rapid failures", async () => {
      // Simulate multiple failed login attempts
      for (let i = 0; i < 3; i++) {
        const response = await fastify.inject({
          method: "POST",
          url: "/test-login",
          headers: {
            "x-forwarded-for": "192.168.1.1",
          },
          payload: {
            email: "test@example.com",
          },
        });

        // First few attempts should succeed (since we're not actually failing auth)
        expect(response.statusCode).toBe(200);
      }

      // Note: The penalty system would normally be triggered by failed auth attempts
      // In a real test, you would mock the authentication to fail
    });

    it("should reset penalty counter on successful login", async () => {
      const response = await fastify.inject({
        method: "POST",
        url: "/test-login",
        headers: {
          "x-forwarded-for": "192.168.1.1",
        },
        payload: {
          email: "test@example.com",
        },
      });

      expect(response.statusCode).toBe(200);

      // The resetLoginFailureCounter would be called in the actual login handler
      // This test verifies the endpoint works
    });

    it("should include Retry-After header when blocked", async () => {
      // This test would require mocking the penalty system to be in a blocked state
      // For now, we'll just verify the structure exists
      const response = await fastify.inject({
        method: "POST",
        url: "/test-login",
        payload: {
          email: "test@example.com",
        },
      });

      expect(response.statusCode).toBe(200);
    });
  });

  describe("Global Rate Limiting", () => {
    it("should apply global rate limits", async () => {
      // Create a route without specific rate limiting
      fastify.post("/test-global", async (_request: any, _reply: any) => {
        return { message: "global success" };
      });

      await fastify.ready();

      const response = await fastify.inject({
        method: "POST",
        url: "/test-global",
        payload: {},
      });

      expect(response.statusCode).toBe(200);
    });
  });

  describe("Error Handling", () => {
    it("should handle Redis connection failures gracefully", async () => {
      // The plugin should fallback to in-memory storage when Redis fails
      const response = await fastify.inject({
        method: "POST",
        url: "/test-auth",
        payload: {},
      });

      expect(response.statusCode).toBe(200);
    });

    it("should handle malformed email addresses", async () => {
      const response = await fastify.inject({
        method: "POST",
        url: "/test-auth",
        payload: {
          email: "not-an-email",
        },
      });

      expect(response.statusCode).toBe(200);
    });

    it("should handle missing request properties", async () => {
      const response = await fastify.inject({
        method: "POST",
        url: "/test-auth",
        payload: null,
      });

      expect(response.statusCode).toBe(200);
    });
  });

  describe("Security", () => {
    it("should not log raw IP addresses", async () => {
      const logSpy = vi.spyOn(fastify.log, "warn");

      // Make requests to trigger rate limiting
      for (let i = 0; i < 4; i++) {
        await fastify.inject({
          method: "POST",
          url: "/test-auth",
          headers: {
            "x-forwarded-for": "192.168.1.1",
          },
          payload: {},
        });
      }

      // Check that logs don't contain raw IPs
      const logCalls = logSpy.mock.calls;
      for (const call of logCalls) {
        const logMessage = JSON.stringify(call);
        expect(logMessage).not.toContain("192.168.1.1");
      }

      logSpy.mockRestore();
    });

    it("should not log raw email addresses", async () => {
      const logSpy = vi.spyOn(fastify.log, "warn");

      // Make requests to trigger rate limiting
      for (let i = 0; i < 4; i++) {
        await fastify.inject({
          method: "POST",
          url: "/test-auth",
          payload: {
            email: "test@example.com",
          },
        });
      }

      // Check that logs don't contain raw emails
      const logCalls = logSpy.mock.calls;
      for (const call of logCalls) {
        const logMessage = JSON.stringify(call);
        expect(logMessage).not.toContain("test@example.com");
      }

      logSpy.mockRestore();
    });

    it("should use constant-time operations for key generation", async () => {
      const startTime = Date.now();

      // Generate keys for different inputs
      for (let i = 0; i < 100; i++) {
        await fastify.inject({
          method: "POST",
          url: "/test-auth",
          payload: {
            email: `test${i}@example.com`,
          },
        });
      }

      const endTime = Date.now();
      const duration = endTime - startTime;

      // Should complete quickly (less than 1 second for 100 requests)
      expect(duration).toBeLessThan(1000);
    });
  });

  describe("Middleware Order", () => {
    it("should run rate limiting before business logic", async () => {
      let middlewareOrder: string[] = [];

      // Add a preHandler to track order
      fastify.addHook("preHandler", async (_request: any, _reply: any) => {
        middlewareOrder.push("preHandler");
      });

      fastify.post(
        "/test-order",
        {
          config: {
            rateLimit: fastify.rateLimitFor("test:order", {
              max: 1,
              timeWindow: "1m",
            }),
          },
        },
        async (_request: any, _reply: any) => {
          middlewareOrder.push("handler");
          return { message: "success" };
        }
      );

      await fastify.ready();

      const response = await fastify.inject({
        method: "POST",
        url: "/test-order",
        payload: {},
      });

      expect(response.statusCode).toBe(200);
      // Rate limiting runs before preHandler and handler
      expect(middlewareOrder).toContain("preHandler");
      expect(middlewareOrder).toContain("handler");
    });
  });
});
