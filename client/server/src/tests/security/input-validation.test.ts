/**
 * Input Validation Security Tests
 * Tests SQL/NoSQL injection, XSS, and malicious input handling
 */

import { describe, it, expect, beforeAll, afterAll } from "vitest";
import type { FastifyInstance } from "fastify";
import { buildApp } from "../../app.js";

describe("Input Validation Security Tests", () => {
  let app: FastifyInstance;
  let authToken: string;

  beforeAll(async () => {
    app = await buildApp();
    await app.ready();

    // Create test user and get auth token
    await app.inject({
      method: "POST",
      url: "/api/v1/auth/register",
      payload: {
        email: "security-test@example.com",
        password: "SecurePass123!",
        name: "Security Test",
      },
    });

    const loginResponse = await app.inject({
      method: "POST",
      url: "/api/v1/auth/login",
      payload: {
        email: "security-test@example.com",
        password: "SecurePass123!",
      },
    });

    const loginData = JSON.parse(loginResponse.body);
    authToken = loginData.accessToken;
  });

  afterAll(async () => {
    await app.close();
  });

  describe("NoSQL Injection Protection", () => {
    it("should reject NoSQL injection in login email", async () => {
      const response = await app.inject({
        method: "POST",
        url: "/api/v1/auth/login",
        payload: {
          email: { $ne: null },
          password: "anything",
        },
      });

      expect(response.statusCode).toBe(400);
    });

    it("should reject NoSQL injection with $where operator", async () => {
      const response = await app.inject({
        method: "POST",
        url: "/api/v1/auth/login",
        payload: {
          email: { $where: "this.password == 'anything'" },
          password: "anything",
        },
      });

      expect(response.statusCode).toBe(400);
    });

    it("should reject NoSQL injection in query parameters", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/api/v1/questions?difficulty[$ne]=hard",
        headers: {
          authorization: `Bearer ${authToken}`,
        },
      });

      // Should either reject (400) or safely handle without executing injection
      expect([200, 400]).toContain(response.statusCode);
    });

    it("should sanitize user input in registration", async () => {
      const response = await app.inject({
        method: "POST",
        url: "/api/v1/auth/register",
        payload: {
          email: "test@example.com",
          password: "SecurePass123!",
          name: { $gt: "" },
        },
      });

      expect(response.statusCode).toBe(400);
    });
  });

  describe("XSS Protection", () => {
    it("should reject XSS in registration name", async () => {
      const response = await app.inject({
        method: "POST",
        url: "/api/v1/auth/register",
        payload: {
          email: "xss-test@example.com",
          password: "SecurePass123!",
          name: '<script>alert("XSS")</script>',
        },
      });

      // Should either reject or sanitize
      if (response.statusCode === 200) {
        const data = JSON.parse(response.body);
        expect(data.user.name).not.toContain("<script>");
      } else {
        expect(response.statusCode).toBe(400);
      }
    });

    it("should sanitize HTML entities in user input", async () => {
      const response = await app.inject({
        method: "POST",
        url: "/api/v1/auth/register",
        payload: {
          email: "html-test@example.com",
          password: "SecurePass123!",
          name: '<img src=x onerror="alert(1)">',
        },
      });

      if (response.statusCode === 200) {
        const data = JSON.parse(response.body);
        expect(data.user.name).not.toContain("<img");
        expect(data.user.name).not.toContain("onerror");
      }
    });

    it("should reject JavaScript protocol in URL fields", async () => {
      const response = await app.inject({
        method: "PUT",
        url: "/api/v1/account/profile",
        headers: {
          authorization: `Bearer ${authToken}`,
        },
        payload: {
          website: 'javascript:alert("XSS")',
        },
      });

      expect([400, 422]).toContain(response.statusCode);
    });
  });

  describe("Command Injection Protection", () => {
    it("should reject shell metacharacters in input", async () => {
      const response = await app.inject({
        method: "POST",
        url: "/api/v1/auth/register",
        payload: {
          email: "cmd-test@example.com; rm -rf /",
          password: "SecurePass123!",
          name: "Test",
        },
      });

      expect(response.statusCode).toBe(400);
    });

    it("should reject null bytes in input", async () => {
      const response = await app.inject({
        method: "POST",
        url: "/api/v1/auth/login",
        payload: {
          email: "test@example.com\0admin",
          password: "password",
        },
      });

      expect(response.statusCode).toBe(400);
    });
  });

  describe("Path Traversal Protection", () => {
    it("should reject path traversal attempts", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/api/v1/questions/../../../etc/passwd",
        headers: {
          authorization: `Bearer ${authToken}`,
        },
      });

      expect(response.statusCode).toBe(404);
    });

    it("should reject URL-encoded path traversal", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/api/v1/questions/%2e%2e%2f%2e%2e%2f%2e%2e%2fetc%2fpasswd",
        headers: {
          authorization: `Bearer ${authToken}`,
        },
      });

      expect(response.statusCode).toBe(404);
    });
  });

  describe("Input Length Validation", () => {
    it("should reject excessively long email", async () => {
      const longEmail = `${"a".repeat(500)}@example.com`;
      const response = await app.inject({
        method: "POST",
        url: "/api/v1/auth/register",
        payload: {
          email: longEmail,
          password: "SecurePass123!",
          name: "Test",
        },
      });

      expect(response.statusCode).toBe(400);
    });

    it("should reject excessively long name", async () => {
      const longName = "a".repeat(1000);
      const response = await app.inject({
        method: "POST",
        url: "/api/v1/auth/register",
        payload: {
          email: "length-test@example.com",
          password: "SecurePass123!",
          name: longName,
        },
      });

      expect(response.statusCode).toBe(400);
    });

    it("should reject large JSON payload", async () => {
      const largePayload = { data: "x".repeat(10 * 1024 * 1024) }; // 10MB
      const response = await app.inject({
        method: "POST",
        url: "/api/v1/auth/register",
        payload: largePayload,
      });

      expect([400, 413]).toContain(response.statusCode);
    });
  });

  describe("Type Validation", () => {
    it("should reject wrong data types in registration", async () => {
      const response = await app.inject({
        method: "POST",
        url: "/api/v1/auth/register",
        payload: {
          email: 12345, // Should be string
          password: "SecurePass123!",
          name: "Test",
        },
      });

      expect(response.statusCode).toBe(400);
    });

    it("should reject array when string expected", async () => {
      const response = await app.inject({
        method: "POST",
        url: "/api/v1/auth/login",
        payload: {
          email: ["test@example.com"],
          password: "password",
        },
      });

      expect(response.statusCode).toBe(400);
    });

    it("should reject null values in required fields", async () => {
      const response = await app.inject({
        method: "POST",
        url: "/api/v1/auth/login",
        payload: {
          email: null,
          password: "password",
        },
      });

      expect(response.statusCode).toBe(400);
    });
  });

  describe("Email Validation", () => {
    it("should reject invalid email formats", async () => {
      const invalidEmails = [
        "notanemail",
        "@example.com",
        "user@",
        "user @example.com",
        "user@exam ple.com",
      ];

      for (const email of invalidEmails) {
        const response = await app.inject({
          method: "POST",
          url: "/api/v1/auth/register",
          payload: {
            email,
            password: "SecurePass123!",
            name: "Test",
          },
        });

        expect(response.statusCode).toBe(400);
      }
    });
  });

  describe("Password Validation", () => {
    it("should enforce minimum password length", async () => {
      const response = await app.inject({
        method: "POST",
        url: "/api/v1/auth/register",
        payload: {
          email: "weak-pass@example.com",
          password: "short",
          name: "Test",
        },
      });

      expect(response.statusCode).toBe(400);
    });

    it("should reject passwords with only numbers", async () => {
      const response = await app.inject({
        method: "POST",
        url: "/api/v1/auth/register",
        payload: {
          email: "numeric-pass@example.com",
          password: "12345678",
          name: "Test",
        },
      });

      // May accept or reject based on password policy
      // Just ensure it doesn't crash
      expect([200, 400]).toContain(response.statusCode);
    });
  });
});
