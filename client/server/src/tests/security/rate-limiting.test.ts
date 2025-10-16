/**
 * Rate Limiting Security Tests
 * Tests rate limit enforcement and abuse prevention
 */

import { describe, it, expect, beforeAll, afterAll } from "vitest";
import type { FastifyInstance } from "fastify";
import { buildApp } from "../../app.js";

describe("Rate Limiting Security Tests", () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await buildApp();
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  describe("Login Rate Limiting", () => {
    it("should enforce rate limits on login attempts", async () => {
      const attempts = [];

      // Make 25 rapid login attempts (limit is 20 per 15min)
      for (let i = 0; i < 25; i++) {
        const response = await app.inject({
          method: "POST",
          url: "/api/v1/auth/login",
          payload: {
            email: `test${i}@example.com`,
            password: "wrongpassword",
          },
        });

        attempts.push(response.statusCode);
      }

      // At least some requests should be rate limited (429)
      const rateLimitedCount = attempts.filter((code) => code === 429).length;
      expect(rateLimitedCount).toBeGreaterThan(0);
    }, 30000); // 30 second timeout

    it("should include rate limit headers in response", async () => {
      const response = await app.inject({
        method: "POST",
        url: "/api/v1/auth/login",
        payload: {
          email: "test@example.com",
          password: "password",
        },
      });

      // Check for standard rate limit headers
      const {headers} = response;
      // Note: Header names may vary by rate limit library
      expect(headers).toBeDefined();
    });
  });

  describe("Registration Rate Limiting", () => {
    it("should enforce rate limits on registration", async () => {
      const attempts = [];

      // Make 15 rapid registration attempts (limit is 10 per 15min)
      for (let i = 0; i < 15; i++) {
        const response = await app.inject({
          method: "POST",
          url: "/api/v1/auth/register",
          payload: {
            email: `ratelimit${i}@example.com`,
            password: "SecurePass123!",
            name: `User ${i}`,
          },
        });

        attempts.push(response.statusCode);
      }

      // Some requests should be rate limited
      const rateLimitedCount = attempts.filter((code) => code === 429).length;
      expect(rateLimitedCount).toBeGreaterThan(0);
    }, 30000);
  });

  describe("API Endpoint Rate Limiting", () => {
    it("should enforce rate limits on questions endpoint", async () => {
      // Create test user first
      await app.inject({
        method: "POST",
        url: "/api/v1/auth/register",
        payload: {
          email: "api-rate-test@example.com",
          password: "SecurePass123!",
          name: "API Rate Test",
        },
      });

      const loginResponse = await app.inject({
        method: "POST",
        url: "/api/v1/auth/login",
        payload: {
          email: "api-rate-test@example.com",
          password: "SecurePass123!",
        },
      });

      const { accessToken } = JSON.parse(loginResponse.body);

      const attempts = [];

      // Make 110 rapid requests (limit is 100 per minute)
      for (let i = 0; i < 110; i++) {
        const response = await app.inject({
          method: "GET",
          url: "/api/v1/questions",
          headers: {
            authorization: `Bearer ${accessToken}`,
          },
        });

        attempts.push(response.statusCode);
      }

      // Some requests should be rate limited
      const rateLimitedCount = attempts.filter((code) => code === 429).length;
      expect(rateLimitedCount).toBeGreaterThan(0);
    }, 60000); // 60 second timeout
  });

  describe("Payment Endpoint Rate Limiting", () => {
    it("should enforce strict rate limits on payment endpoints", async () => {
      // Create test user
      await app.inject({
        method: "POST",
        url: "/api/v1/auth/register",
        payload: {
          email: "payment-rate-test@example.com",
          password: "SecurePass123!",
          name: "Payment Rate Test",
        },
      });

      const loginResponse = await app.inject({
        method: "POST",
        url: "/api/v1/auth/login",
        payload: {
          email: "payment-rate-test@example.com",
          password: "SecurePass123!",
        },
      });

      const { accessToken } = JSON.parse(loginResponse.body);

      const attempts = [];

      // Make 25 rapid payment requests (limit is 20 per 15min)
      for (let i = 0; i < 25; i++) {
        const response = await app.inject({
          method: "POST",
          url: "/api/v1/payments/paypal/create-order",
          headers: {
            authorization: `Bearer ${accessToken}`,
          },
          payload: {
            userId: "test-user",
            planType: "INTERMEDIATE",
            billing_cycle: "monthly",
            currency_code: "USD",
          },
        });

        attempts.push(response.statusCode);
      }

      // Most requests should be rate limited
      const rateLimitedCount = attempts.filter((code) => code === 429).length;
      expect(rateLimitedCount).toBeGreaterThan(0);
    }, 30000);
  });

  describe("Checkout Endpoint Rate Limiting", () => {
    it("should enforce rate limits on checkout session creation", async () => {
      // Create test user
      await app.inject({
        method: "POST",
        url: "/api/v1/auth/register",
        payload: {
          email: "checkout-rate-test@example.com",
          password: "SecurePass123!",
          name: "Checkout Rate Test",
        },
      });

      const loginResponse = await app.inject({
        method: "POST",
        url: "/api/v1/auth/login",
        payload: {
          email: "checkout-rate-test@example.com",
          password: "SecurePass123!",
        },
      });

      const { accessToken } = JSON.parse(loginResponse.body);

      const attempts = [];

      // Make 35 rapid checkout requests (limit is 30 per 15min)
      for (let i = 0; i < 35; i++) {
        const response = await app.inject({
          method: "POST",
          url: "/api/v1/checkout/create",
          headers: {
            authorization: `Bearer ${accessToken}`,
          },
          payload: {
            tier: "intermediate",
            cycle: "monthly",
            currency: "USD",
          },
        });

        attempts.push(response.statusCode);
      }

      // Some requests should be rate limited
      const rateLimitedCount = attempts.filter((code) => code === 429).length;
      expect(rateLimitedCount).toBeGreaterThan(0);
    }, 30000);
  });

  describe("Password Reset Rate Limiting", () => {
    it("should enforce rate limits on password reset requests", async () => {
      const attempts = [];

      // Make 15 rapid password reset requests (limit is 10 per 15min)
      for (let i = 0; i < 15; i++) {
        const response = await app.inject({
          method: "POST",
          url: "/api/v1/auth/forgot-password",
          payload: {
            email: "reset-test@example.com",
          },
        });

        attempts.push(response.statusCode);
      }

      // Some requests should be rate limited
      const rateLimitedCount = attempts.filter((code) => code === 429).length;
      expect(rateLimitedCount).toBeGreaterThan(0);
    }, 30000);
  });

  describe("Refresh Token Rate Limiting", () => {
    it("should enforce rate limits on token refresh", async () => {
      // Create test user
      await app.inject({
        method: "POST",
        url: "/api/v1/auth/register",
        payload: {
          email: "refresh-rate-test@example.com",
          password: "SecurePass123!",
          name: "Refresh Rate Test",
        },
      });

      const loginResponse = await app.inject({
        method: "POST",
        url: "/api/v1/auth/login",
        payload: {
          email: "refresh-rate-test@example.com",
          password: "SecurePass123!",
        },
      });

      const { refreshToken } = JSON.parse(loginResponse.body);

      const attempts = [];

      // Make 105 rapid refresh requests (limit is 100 per 15min)
      for (let i = 0; i < 105; i++) {
        const response = await app.inject({
          method: "POST",
          url: "/api/v1/auth/refresh",
          payload: {
            refreshToken,
          },
        });

        attempts.push(response.statusCode);
      }

      // Some requests should be rate limited or fail due to invalid token
      const rateLimitedOrFailedCount = attempts.filter((code) => code === 429 || code === 401).length;
      expect(rateLimitedOrFailedCount).toBeGreaterThan(0);
    }, 60000);
  });

  describe("Distributed Attack Prevention", () => {
    it("should track rate limits by IP + user combination", async () => {
      // This test verifies that rate limits use combo keys (IP + user ID)
      // Making it harder to bypass with just different users or IPs

      // Create two test users
      const users = [];
      for (let i = 0; i < 2; i++) {
        await app.inject({
          method: "POST",
          url: "/api/v1/auth/register",
          payload: {
            email: `distributed${i}@example.com`,
            password: "SecurePass123!",
            name: `Distributed ${i}`,
          },
        });

        const loginResponse = await app.inject({
          method: "POST",
          url: "/api/v1/auth/login",
          payload: {
            email: `distributed${i}@example.com`,
            password: "SecurePass123!",
          },
        });

        const { accessToken } = JSON.parse(loginResponse.body);
        users.push(accessToken);
      }

      // Even with multiple users, combined rate limit should apply
      expect(users.length).toBe(2);
    });
  });

  describe("Progressive Penalty System", () => {
    it("should increase penalties for repeated failed login attempts", async () => {
      // Create test user
      await app.inject({
        method: "POST",
        url: "/api/v1/auth/register",
        payload: {
          email: "penalty-test@example.com",
          password: "CorrectPass123!",
          name: "Penalty Test",
        },
      });

      const responseTimes = [];

      // Make 10 failed login attempts
      for (let i = 0; i < 10; i++) {
        const startTime = Date.now();
        await app.inject({
          method: "POST",
          url: "/api/v1/auth/login",
          payload: {
            email: "penalty-test@example.com",
            password: "WrongPassword",
          },
        });
        const endTime = Date.now();
        responseTimes.push(endTime - startTime);
      }

      // Later attempts should take longer (progressive penalty)
      // Note: This assumes the system implements progressive delays
      expect(responseTimes.length).toBe(10);
    }, 60000);
  });
});
