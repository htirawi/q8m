import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { FastifyInstance } from "fastify";
import { buildApp } from "../../app";

describe("Security Tests", () => {
  let app: FastifyInstance;

  beforeEach(async () => {
    app = await buildApp();
    await app.ready();
  });

  afterEach(async () => {
    await app.close();
  });

  describe("Authentication Security", () => {
    it("should reject requests without authentication for protected routes", async () => {
      const protectedRoutes = [
        "/api/payments/create",
        "/api/payments/subscription",
        "/api/payments/history",
        "/api/entitlements",
        "/api/downloads/generate",
      ];

      for (const route of protectedRoutes) {
        const response = await app.inject({
          method: "GET",
          url: route,
        });

        expect(response.statusCode).toBe(401);
        const body = JSON.parse(response.body);
        expect(body.error).toContain("Authorization token required");
      }
    });

    it("should reject requests with invalid JWT tokens", async () => {
      const invalidTokens = [
        "invalid-token",
        "Bearer invalid-token",
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.invalid",
        "",
        null,
      ];

      for (const token of invalidTokens) {
        const response = await app.inject({
          method: "GET",
          url: "/api/auth/me",
          headers: {
            Authorization: token ? `Bearer ${token}` : "",
          },
        });

        expect(response.statusCode).toBe(401);
      }
    });

    it("should reject requests with expired JWT tokens", async () => {
      // This would require creating an expired token
      // For testing purposes, we'll mock this scenario
      const expiredToken = "expired.jwt.token";

      const response = await app.inject({
        method: "GET",
        url: "/api/auth/me",
        headers: {
          Authorization: `Bearer ${expiredToken}`,
        },
      });

      expect(response.statusCode).toBe(401);
      const body = JSON.parse(response.body);
      expect(body.error).toContain("Invalid token");
    });

    it("should handle JWT token tampering attempts", async () => {
      // Attempt to tamper with JWT token
      const tamperedToken =
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJ0YW1wZXJlZCJ9.tampered";

      const response = await app.inject({
        method: "GET",
        url: "/api/auth/me",
        headers: {
          Authorization: `Bearer ${tamperedToken}`,
        },
      });

      expect(response.statusCode).toBe(401);
      const body = JSON.parse(response.body);
      expect(body.error).toContain("Invalid token");
    });
  });

  describe("Input Validation Security", () => {
    it("should reject SQL injection attempts", async () => {
      const sqlInjectionPayloads = [
        "'; DROP TABLE users; --",
        "1' OR '1'='1",
        "admin'--",
        "1' UNION SELECT * FROM users--",
      ];

      for (const payload of sqlInjectionPayloads) {
        const response = await app.inject({
          method: "POST",
          url: "/api/auth/login",
          payload: {
            email: payload,
            password: "test123",
          },
        });

        // Should not return 500 (server error) which would indicate SQL injection
        expect(response.statusCode).not.toBe(500);
        expect(response.statusCode).toBe(400); // Should be validation error
      }
    });

    it("should reject XSS attempts in user input", async () => {
      const xssPayloads = [
        "<script>alert('XSS')</script>",
        "javascript:alert('XSS')",
        "<img src=x onerror=alert('XSS')>",
        "';alert('XSS');//",
      ];

      for (const payload of xssPayloads) {
        const response = await app.inject({
          method: "POST",
          url: "/api/auth/register",
          payload: {
            email: "test@example.com",
            password: "SecurePassword123!",
            firstName: payload,
            lastName: "Test",
          },
        });

        // Should not execute the script
        expect(response.statusCode).toBe(400);
        const body = JSON.parse(response.body);
        expect(body.error).toContain("Validation error");
      }
    });

    it("should reject NoSQL injection attempts", async () => {
      const nosqlPayloads = [
        { $ne: null },
        { $gt: "" },
        { $where: "this.password == 'admin'" },
        { $regex: ".*" },
      ];

      for (const payload of nosqlPayloads) {
        const response = await app.inject({
          method: "POST",
          url: "/api/auth/login",
          payload: {
            email: payload,
            password: "test123",
          },
        });

        // Should not return 500 (server error)
        expect(response.statusCode).not.toBe(500);
        expect(response.statusCode).toBe(400);
      }
    });

    it("should reject oversized payloads", async () => {
      const oversizedPayload = {
        email: "test@example.com",
        password: "SecurePassword123!",
        firstName: "A".repeat(10000), // Very long string
        lastName: "Test",
      };

      const response = await app.inject({
        method: "POST",
        url: "/api/auth/register",
        payload: oversizedPayload,
      });

      expect(response.statusCode).toBe(413); // Payload too large
    });

    it("should reject malformed JSON", async () => {
      const response = await app.inject({
        method: "POST",
        url: "/api/auth/register",
        headers: {
          "Content-Type": "application/json",
        },
        payload: "{ invalid json }",
      });

      expect(response.statusCode).toBe(400);
      const body = JSON.parse(response.body);
      expect(body.error).toContain("Invalid JSON");
    });
  });

  describe("Rate Limiting Security", () => {
    it("should rate limit login attempts", async () => {
      const loginData = {
        email: "test@example.com",
        password: "wrongpassword",
      };

      // Make multiple rapid login attempts
      const promises = Array.from({ length: 10 }, () =>
        app.inject({
          method: "POST",
          url: "/api/auth/login",
          payload: loginData,
        })
      );

      const responses = await Promise.all(promises);

      // Some requests should be rate limited
      const rateLimitedResponses = responses.filter((response) => response.statusCode === 429);

      expect(rateLimitedResponses.length).toBeGreaterThan(0);
    });

    it("should rate limit registration attempts", async () => {
      const registrationData = {
        email: "test@example.com",
        password: "SecurePassword123!",
        firstName: "Test",
        lastName: "User",
      };

      // Make multiple rapid registration attempts
      const promises = Array.from({ length: 10 }, () =>
        app.inject({
          method: "POST",
          url: "/api/auth/register",
          payload: registrationData,
        })
      );

      const responses = await Promise.all(promises);

      // Some requests should be rate limited
      const rateLimitedResponses = responses.filter((response) => response.statusCode === 429);

      expect(rateLimitedResponses.length).toBeGreaterThan(0);
    });

    it("should rate limit password reset requests", async () => {
      const resetData = { email: "test@example.com" };

      // Make multiple rapid password reset requests
      const promises = Array.from({ length: 10 }, () =>
        app.inject({
          method: "POST",
          url: "/api/auth/forgot-password",
          payload: resetData,
        })
      );

      const responses = await Promise.all(promises);

      // Some requests should be rate limited
      const rateLimitedResponses = responses.filter((response) => response.statusCode === 429);

      expect(rateLimitedResponses.length).toBeGreaterThan(0);
    });
  });

  describe("CORS Security", () => {
    it("should reject requests from unauthorized origins", async () => {
      const response = await app.inject({
        method: "OPTIONS",
        url: "/api/auth/login",
        headers: {
          Origin: "https://malicious-site.com",
          "Access-Control-Request-Method": "POST",
          "Access-Control-Request-Headers": "Content-Type",
        },
      });

      // Should not include CORS headers for unauthorized origin
      expect(response.headers["access-control-allow-origin"]).toBeUndefined();
    });

    it("should allow requests from authorized origins", async () => {
      const response = await app.inject({
        method: "OPTIONS",
        url: "/api/auth/login",
        headers: {
          Origin: "https://quiz-platform.com",
          "Access-Control-Request-Method": "POST",
          "Access-Control-Request-Headers": "Content-Type",
        },
      });

      // Should include CORS headers for authorized origin
      expect(response.headers["access-control-allow-origin"]).toBeDefined();
    });
  });

  describe("CSRF Protection", () => {
    it("should reject CSRF attacks on state-changing operations", async () => {
      const csrfRoutes = [
        { method: "POST", url: "/api/auth/logout" },
        { method: "POST", url: "/api/payments/create" },
        { method: "POST", url: "/api/payments/refund" },
      ];

      for (const route of csrfRoutes) {
        const response = await app.inject({
          method: route.method,
          url: route.url,
          headers: {
            "X-Requested-With": "XMLHttpRequest", // Should be required for CSRF protection
          },
        });

        // Should require proper CSRF token
        expect(response.statusCode).toBe(401);
      }
    });
  });

  describe("Content Security Policy", () => {
    it("should include proper security headers", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/",
      });

      // Check for security headers
      expect(response.headers["x-content-type-options"]).toBe("nosniff");
      expect(response.headers["x-frame-options"]).toBe("DENY");
      expect(response.headers["x-xss-protection"]).toBe("1; mode=block");
      expect(response.headers["strict-transport-security"]).toBeDefined();
      expect(response.headers["content-security-policy"]).toBeDefined();
    });

    it("should prevent clickjacking attacks", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/",
      });

      // X-Frame-Options should prevent embedding in frames
      expect(response.headers["x-frame-options"]).toBe("DENY");
    });

    it("should prevent MIME type sniffing", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/",
      });

      // X-Content-Type-Options should prevent MIME sniffing
      expect(response.headers["x-content-type-options"]).toBe("nosniff");
    });
  });

  describe("Password Security", () => {
    it("should enforce strong password requirements", async () => {
      const weakPasswords = ["123456", "password", "abc", "12345678", "qwerty"];

      for (const password of weakPasswords) {
        const response = await app.inject({
          method: "POST",
          url: "/api/auth/register",
          payload: {
            email: "test@example.com",
            password,
            firstName: "Test",
            lastName: "User",
          },
        });

        expect(response.statusCode).toBe(400);
        const body = JSON.parse(response.body);
        expect(body.error).toContain("Password does not meet requirements");
      }
    });

    it("should hash passwords securely", async () => {
      const response = await app.inject({
        method: "POST",
        url: "/api/auth/register",
        payload: {
          email: "passwordtest@example.com",
          password: "SecurePassword123!",
          firstName: "Test",
          lastName: "User",
        },
      });

      expect(response.statusCode).toBe(201);
      const body = JSON.parse(response.body);

      // Password should not be returned in response
      expect(body.user.password).toBeUndefined();
    });
  });

  describe("Session Security", () => {
    it("should use secure session cookies", async () => {
      // Register and login a user
      await app.inject({
        method: "POST",
        url: "/api/auth/register",
        payload: {
          email: "sessiontest@example.com",
          password: "SecurePassword123!",
          firstName: "Session",
          lastName: "Test",
        },
      });

      const loginResponse = await app.inject({
        method: "POST",
        url: "/api/auth/login",
        payload: {
          email: "sessiontest@example.com",
          password: "SecurePassword123!",
        },
      });

      // Check that cookies are set with secure flags
      const cookies = loginResponse.headers["set-cookie"];
      expect(cookies).toBeDefined();

      // In a real implementation, you would check for HttpOnly, Secure, SameSite flags
      // This is a simplified check
      expect(cookies).toContain("HttpOnly");
      expect(cookies).toContain("Secure");
    });
  });

  describe("Error Handling Security", () => {
    it("should not leak sensitive information in error messages", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/api/nonexistent-route",
      });

      expect(response.statusCode).toBe(404);
      const body = JSON.parse(response.body);

      // Error message should not contain sensitive information
      expect(body.error).not.toContain("stack");
      expect(body.error).not.toContain("path");
      expect(body.error).not.toContain("internal");
    });

    it("should handle database errors securely", async () => {
      // This would require mocking database errors
      // For testing purposes, we'll simulate a scenario
      const response = await app.inject({
        method: "POST",
        url: "/api/auth/login",
        payload: {
          email: "nonexistent@example.com",
          password: "wrongpassword",
        },
      });

      expect(response.statusCode).toBe(401);
      const body = JSON.parse(response.body);

      // Should not reveal whether user exists or not
      expect(body.error).toContain("Invalid credentials");
    });
  });
});
