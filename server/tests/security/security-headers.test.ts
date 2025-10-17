/**
 * Security Headers Integration Tests
 * Tests for comprehensive security header configuration
 */

import { describe, test, expect, beforeAll, afterAll } from "vitest";
import { buildApp } from "@server/app.js";
import type { FastifyInstance } from "fastify";

let app: FastifyInstance;

beforeAll(async () => {
  app = await buildApp();
  await app.ready();
});

afterAll(async () => {
  await app.close();
});

describe("Security Headers", () => {
  test("should include X-Content-Type-Options: nosniff", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/health",
    });

    expect(response.headers["x-content-type-options"]).toBe("nosniff");
  });

  test("should include Referrer-Policy", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/health",
    });

    // Helmet defaults to "no-referrer" which is more secure
    expect(response.headers["referrer-policy"]).toBe("no-referrer");
  });

  test("should include Permissions-Policy (custom middleware)", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/health",
    });

    // Custom Permissions-Policy middleware
    const permissionsPolicy = response.headers["permissions-policy"];
    expect(permissionsPolicy).toBeDefined();
    expect(permissionsPolicy).toContain("camera=()");
    expect(permissionsPolicy).toContain("microphone=()");
    expect(permissionsPolicy).toContain("geolocation=()");
  });

  test("should include Content-Security-Policy", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/health",
    });

    const csp = response.headers["content-security-policy"];
    expect(csp).toBeDefined();
    expect(csp).toContain("default-src 'self'");
    expect(csp).toContain("frame-ancestors 'none'");
  });

  test("should include X-XSS-Protection", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/health",
    });

    expect(response.headers["x-xss-protection"]).toBe("0");
  });

  test("should include X-Frame-Options", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/health",
    });

    // Helmet sets this by default or through CSP frame-ancestors
    expect(
      response.headers["x-frame-options"] ||
        response.headers["content-security-policy"]?.includes("frame-ancestors")
    ).toBeTruthy();
  });

  test("should include Cross-Origin-Opener-Policy", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/health",
    });

    expect(response.headers["cross-origin-opener-policy"]).toBe("same-origin-allow-popups");
  });

  test("should not include Cross-Origin-Embedder-Policy", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/health",
    });

    // Disabled for PayPal compatibility
    expect(response.headers["cross-origin-embedder-policy"]).toBeUndefined();
  });
});

describe("HSTS (Production Only)", () => {
  test("should include Strict-Transport-Security (buildApp always sets it for testing)", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/health",
    });

    const hsts = response.headers["strict-transport-security"];

    // Note: buildApp() in test mode sets HSTS for consistency testing
    // In production, HSTS is configured via env.NODE_ENV === "production"
    expect(hsts).toBeDefined();
    expect(hsts).toContain("max-age=31536000");
    expect(hsts).toContain("includeSubDomains");
  });
});

describe("CSP PayPal Integration", () => {
  test("should allow PayPal domains in script-src", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/health",
    });

    const csp = response.headers["content-security-policy"];
    expect(csp).toContain("https://www.paypal.com");
    expect(csp).toContain("https://www.sandbox.paypal.com");
  });

  test("should allow PayPal in frame-src", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/health",
    });

    const csp = response.headers["content-security-policy"];
    expect(csp).toContain("frame-src");
    expect(csp).toContain("https://www.paypal.com");
  });

  test("should allow PayPal API in connect-src", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/health",
    });

    const csp = response.headers["content-security-policy"];
    expect(csp).toContain("connect-src");
    expect(csp).toContain("https://api.paypal.com");
    expect(csp).toContain("https://api.sandbox.paypal.com");
  });
});

describe("Security Headers on Different Endpoints", () => {
  test("should include security headers on API endpoints", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/api/v1/pricing",
    });

    expect(response.headers["x-content-type-options"]).toBe("nosniff");
    expect(response.headers["referrer-policy"]).toBe("no-referrer");
    expect(response.headers["content-security-policy"]).toBeDefined();
  });

  test("should include security headers on error responses", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/api/v1/nonexistent",
    });

    expect(response.statusCode).toBe(404);
    expect(response.headers["x-content-type-options"]).toBe("nosniff");
    expect(response.headers["referrer-policy"]).toBe("no-referrer");
  });

  test("should include security headers on auth endpoints", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/api/v1/auth/login",
      payload: {
        email: "test@example.com",
        password: "wrongpassword",
      },
    });

    expect(response.headers["x-content-type-options"]).toBe("nosniff");
    expect(response.headers["referrer-policy"]).toBe("no-referrer");
    expect(response.headers["content-security-policy"]).toBeDefined();
  });
});

describe("Permissions Policy Features", () => {
  test("should block camera access", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/health",
    });

    const permissionsPolicy = response.headers["permissions-policy"];
    expect(permissionsPolicy).toContain("camera=()");
  });

  test("should block microphone access", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/health",
    });

    const permissionsPolicy = response.headers["permissions-policy"];
    expect(permissionsPolicy).toContain("microphone=()");
  });

  test("should block geolocation access", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/health",
    });

    const permissionsPolicy = response.headers["permissions-policy"];
    expect(permissionsPolicy).toContain("geolocation=()");
  });

  test("should allow payment for PayPal", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/health",
    });

    const permissionsPolicy = response.headers["permissions-policy"];
    expect(permissionsPolicy).toContain("payment=(self)");
  });

  test("should allow fullscreen for app", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/health",
    });

    const permissionsPolicy = response.headers["permissions-policy"];
    expect(permissionsPolicy).toContain("fullscreen=(self)");
  });
});

describe("CSP Directives", () => {
  test("should set default-src to self", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/health",
    });

    const csp = response.headers["content-security-policy"];
    expect(csp).toContain("default-src 'self'");
  });

  test("should set frame-ancestors to none", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/health",
    });

    const csp = response.headers["content-security-policy"];
    expect(csp).toContain("frame-ancestors 'none'");
  });

  test("should allow data: URIs in img-src", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/health",
    });

    const csp = response.headers["content-security-policy"];
    expect(csp).toContain("img-src");
    expect(csp).toContain("data:");
  });

  test("should allow unsafe-inline in style-src (for Tailwind)", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/health",
    });

    const csp = response.headers["content-security-policy"];
    expect(csp).toContain("style-src");
    expect(csp).toContain("'unsafe-inline'");
  });
});

describe("Security Header Consistency", () => {
  test("should apply headers consistently across all routes", async () => {
    const routes = ["/health", "/api/v1/pricing"];

    for (const route of routes) {
      const response = await app.inject({
        method: "GET",
        url: route,
      });

      expect(response.headers["x-content-type-options"]).toBe("nosniff");
      expect(response.headers["referrer-policy"]).toBe("no-referrer");
      expect(response.headers["content-security-policy"]).toBeDefined();
      expect(response.headers["permissions-policy"]).toBeDefined();
    }
  });
});
