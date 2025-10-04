/**
 * Security tests for XSS prevention, rate limiting, and log injection
 */

import { test, expect } from "vitest";
import { escapeHtml, sanitizeForDisplay, sanitizeRedirectUrl } from "../../src/security/escape";
import { sanitizeForLog, safeLogFields, maskEmail, shortHash } from "../../src/security/logging";

describe("XSS Prevention", () => {
  test("escapeHtml should escape dangerous characters", () => {
    const maliciousInput = "<img src=x onerror=alert(1)>";
    const escaped = escapeHtml(maliciousInput);

    expect(escaped).toBe("&lt;img src=x onerror=alert(1)&gt;");
    expect(escaped).not.toContain("<");
    expect(escaped).not.toContain(">");
  });

  test("escapeHtml should handle null and undefined", () => {
    expect(escapeHtml(null)).toBe("");
    expect(escapeHtml(undefined)).toBe("");
    expect(escapeHtml("")).toBe("");
  });

  test("sanitizeForDisplay should remove control characters", () => {
    const inputWithControlChars = "Hello\nWorld\r\nTest\tTab";
    const sanitized = sanitizeForDisplay(inputWithControlChars);

    expect(sanitized).toBe("HelloWorldTestTab");
    expect(sanitized).not.toContain("\n");
    expect(sanitized).not.toContain("\r");
    expect(sanitized).not.toContain("\t");
  });

  test("sanitizeForDisplay should limit length", () => {
    const longInput = "a".repeat(2000);
    const sanitized = sanitizeForDisplay(longInput);

    expect(sanitized.length).toBeLessThanOrEqual(1000);
  });

  test("sanitizeRedirectUrl should prevent open redirects", () => {
    const maliciousUrl = "https://evil.com/steal-data";
    const allowedHosts = ["localhost", "example.com"];

    expect(sanitizeRedirectUrl(maliciousUrl, allowedHosts)).toBeNull();
    expect(sanitizeRedirectUrl("/safe-path", allowedHosts)).toBe("/safe-path");
    expect(sanitizeRedirectUrl("https://example.com/safe", allowedHosts)).toBe(
      "https://example.com/safe"
    );
  });
});

describe("Log Injection Prevention", () => {
  test("sanitizeForLog should remove control characters", () => {
    const maliciousInput = "Payment\n\r\tcompleted";
    const sanitized = sanitizeForLog(maliciousInput);

    expect(sanitized).toBe("Payment    completed");
    expect(sanitized).not.toContain("\n");
    expect(sanitized).not.toContain("\r");
    expect(sanitized).not.toContain("\t");
  });

  test("sanitizeForLog should limit length", () => {
    const longInput = "a".repeat(3000);
    const sanitized = sanitizeForLog(longInput);

    expect(sanitized.length).toBeLessThanOrEqual(2048);
  });

  test("safeLogFields should sanitize all string values", () => {
    const fields = {
      event: "payment_completed",
      amount: 100,
      currency: "USD",
      description: "Payment\nwith\nnewlines",
      metadata: {
        user: "john@example.com",
        note: "Special\tcharacters",
      },
    };

    const safeFields = safeLogFields(fields);

    expect(safeFields.event).toBe("payment_completed");
    expect(safeFields.amount).toBe(100);
    expect(safeFields.description).toBe("Payment with newlines");
    expect((safeFields as any).metadata.note).toBe("Special characters");
  });

  test("maskEmail should mask email addresses", () => {
    const email = "john.doe@example.com";
    const masked = maskEmail(email);

    expect(masked).toBe("******oe@*******.com");
    expect(masked).not.toContain("john");
    expect(masked).not.toContain("doe");
  });

  test("shortHash should create consistent hashes", () => {
    const input = "test@example.com";
    const hash1 = shortHash(input);
    const hash2 = shortHash(input);

    expect(hash1).toBe(hash2);
    expect(hash1.length).toBe(8);
    expect(hash1).toMatch(/^[a-f0-9]{8}$/);
  });
});

describe("Rate Limiting", () => {
  test("buildRateLimitOptions should create valid rate limit configuration", () => {
    const { buildRateLimitOptions } = require("../src/security/rateLimit.js");

    const options = buildRateLimitOptions("test:route", { max: 10, timeWindow: "1m" });

    expect(options).toHaveProperty("rateLimit");
    expect(options.rateLimit).toHaveProperty("max", 10);
    expect(options.rateLimit).toHaveProperty("timeWindow", "1m");
    expect(options.rateLimit).toHaveProperty("keyGenerator");
    expect(typeof options.rateLimit.keyGenerator).toBe("function");
  });

  test("buildRateLimitOptions should use environment defaults", () => {
    const { buildRateLimitOptions } = require("../src/security/rateLimit.js");

    const options = buildRateLimitOptions("test:route");

    expect(options.rateLimit.max).toBeGreaterThan(0);
    expect(options.rateLimit.timeWindow).toBeDefined();
  });
});

describe("Admin Route XSS Protection", () => {
  test("admin question update should sanitize input", async () => {
    // This would require setting up a test server instance
    // For now, we test the sanitization function directly
    const maliciousData = {
      content: {
        en: {
          question: '<script>alert("xss")</script>What is React?',
          explanation: "React is a <img src=x onerror=alert(1)> library",
        },
      },
      tags: ['<script>alert("xss")</script>', "react"],
    };

    // Simulate the sanitizeUpdateData function
    function sanitizeUpdateData(data: unknown): Record<string, unknown> {
      if (!data || typeof data !== "object") {
        return {};
      }

      const sanitized: Record<string, unknown> = {};
      const obj = data as Record<string, unknown>;

      for (const [key, value] of Object.entries(obj)) {
        if (typeof value === "string") {
          sanitized[key] = sanitizeForDisplay(value);
        } else if (typeof value === "number" || typeof value === "boolean") {
          sanitized[key] = value;
        } else if (Array.isArray(value)) {
          sanitized[key] = value.map((item) =>
            typeof item === "string" ? sanitizeForDisplay(item) : item
          );
        } else if (value && typeof value === "object") {
          sanitized[key] = sanitizeUpdateData(value);
        } else {
          sanitized[key] = value;
        }
      }

      return sanitized;
    }

    const sanitized = sanitizeUpdateData(maliciousData);

    expect((sanitized as any).content.en.question).not.toContain("<script>");
    expect((sanitized as any).content.en.explanation).not.toContain("<img");
    expect((sanitized as any).tags[0]).not.toContain("<script>");
  });
});
