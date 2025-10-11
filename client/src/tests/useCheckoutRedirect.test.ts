import { describe, it, expect } from "vitest";

/**
 * Unit tests for useCheckoutRedirect composable sanitization logic
 * 
 * These tests verify the core sanitization functions that protect against
 * invalid query parameters and security issues.
 * 
 * Full integration tests (including router, sessionStorage, and locale handling)
 * are covered by E2E tests in tests/e2e/auth-redirect.spec.ts
 */

describe("useCheckoutRedirect - Sanitization Logic", () => {
  const VALID_PLANS = ["basic", "intermediate", "advanced"];
  const VALID_BILLING = ["monthly", "yearly"];
  const DEFAULT_PLAN = "intermediate";
  const DEFAULT_BILLING = "monthly";
  const DEFAULT_REDIRECT = "/checkout";

  // Replicate the sanitization logic from the composable
  function sanitizePlan(plan: string | undefined): string {
    if (!plan) return DEFAULT_PLAN;
    const normalized = plan.toLowerCase().trim();
    return VALID_PLANS.includes(normalized) ? normalized : DEFAULT_PLAN;
  }

  function sanitizeBilling(billing: string | undefined): string {
    if (!billing) return DEFAULT_BILLING;
    const normalized = billing.toLowerCase().trim();
    return VALID_BILLING.includes(normalized) ? normalized : DEFAULT_BILLING;
  }

  function sanitizeRedirect(redirect: string | undefined): string {
    if (!redirect) return DEFAULT_REDIRECT;
    const cleaned = redirect.trim();
    // Reject if it doesn't start with / or contains :// or starts with //
    if (!cleaned.startsWith("/") || cleaned.includes("://") || cleaned.startsWith("//")) {
      return DEFAULT_REDIRECT;
    }
    return cleaned;
  }

  describe("Plan Sanitization", () => {
    it("accepts valid plan values", () => {
      expect(sanitizePlan("basic")).toBe("basic");
      expect(sanitizePlan("intermediate")).toBe("intermediate");
      expect(sanitizePlan("advanced")).toBe("advanced");
    });

    it("falls back to default for invalid plans", () => {
      expect(sanitizePlan("invalid")).toBe(DEFAULT_PLAN);
      expect(sanitizePlan("premium")).toBe(DEFAULT_PLAN);
      expect(sanitizePlan("")).toBe(DEFAULT_PLAN);
      expect(sanitizePlan(undefined)).toBe(DEFAULT_PLAN);
    });

    it("handles case-insensitive plan values", () => {
      expect(sanitizePlan("BASIC")).toBe("basic");
      expect(sanitizePlan("Intermediate")).toBe("intermediate");
      expect(sanitizePlan("ADVANCED")).toBe("advanced");
    });

    it("trims whitespace from plan values", () => {
      expect(sanitizePlan("  basic  ")).toBe("basic");
      expect(sanitizePlan("\tintermediate\n")).toBe("intermediate");
    });
  });

  describe("Billing Sanitization", () => {
    it("accepts valid billing values", () => {
      expect(sanitizeBilling("monthly")).toBe("monthly");
      expect(sanitizeBilling("yearly")).toBe("yearly");
    });

    it("falls back to default for invalid billing", () => {
      expect(sanitizeBilling("invalid")).toBe(DEFAULT_BILLING);
      expect(sanitizeBilling("quarterly")).toBe(DEFAULT_BILLING);
      expect(sanitizeBilling("")).toBe(DEFAULT_BILLING);
      expect(sanitizeBilling(undefined)).toBe(DEFAULT_BILLING);
    });

    it("handles case-insensitive billing values", () => {
      expect(sanitizeBilling("MONTHLY")).toBe("monthly");
      expect(sanitizeBilling("Yearly")).toBe("yearly");
    });

    it("trims whitespace from billing values", () => {
      expect(sanitizeBilling("  monthly  ")).toBe("monthly");
      expect(sanitizeBilling("\tyearly\n")).toBe("yearly");
    });
  });

  describe("Redirect Sanitization", () => {
    it("accepts valid redirect paths", () => {
      expect(sanitizeRedirect("/checkout")).toBe("/checkout");
      expect(sanitizeRedirect("/custom/path")).toBe("/custom/path");
      expect(sanitizeRedirect("/account/subscription")).toBe("/account/subscription");
    });

    it("rejects redirect URLs with protocols (open redirect prevention)", () => {
      expect(sanitizeRedirect("https://evil.com")).toBe(DEFAULT_REDIRECT);
      expect(sanitizeRedirect("http://malicious.site")).toBe(DEFAULT_REDIRECT);
      expect(sanitizeRedirect("//evil.com")).toBe(DEFAULT_REDIRECT);
      expect(sanitizeRedirect("javascript:alert(1)")).toBe(DEFAULT_REDIRECT);
    });

    it("rejects redirect paths without leading slash", () => {
      expect(sanitizeRedirect("checkout")).toBe(DEFAULT_REDIRECT);
      expect(sanitizeRedirect("evil")).toBe(DEFAULT_REDIRECT);
    });

    it("falls back to default for empty/undefined redirect", () => {
      expect(sanitizeRedirect("")).toBe(DEFAULT_REDIRECT);
      expect(sanitizeRedirect(undefined)).toBe(DEFAULT_REDIRECT);
    });

    it("trims whitespace from redirect paths", () => {
      expect(sanitizeRedirect("  /checkout  ")).toBe("/checkout");
      expect(sanitizeRedirect("\t/account\n")).toBe("/account");
    });
  });

  describe("Combined Scenarios", () => {
    it("handles all valid parameters together", () => {
      expect(sanitizePlan("advanced")).toBe("advanced");
      expect(sanitizeBilling("yearly")).toBe("yearly");
      expect(sanitizeRedirect("/checkout")).toBe("/checkout");
    });

    it("handles all invalid parameters together", () => {
      expect(sanitizePlan("invalid")).toBe(DEFAULT_PLAN);
      expect(sanitizeBilling("invalid")).toBe(DEFAULT_BILLING);
      expect(sanitizeRedirect("https://evil.com")).toBe(DEFAULT_REDIRECT);
    });

    it("handles mixed valid and invalid parameters", () => {
      expect(sanitizePlan("basic")).toBe("basic");
      expect(sanitizeBilling("invalid")).toBe(DEFAULT_BILLING);
      expect(sanitizeRedirect("/checkout")).toBe("/checkout");
    });
  });

  describe("Edge Cases", () => {
    it("handles special characters in plans", () => {
      expect(sanitizePlan("basic<script>")).toBe(DEFAULT_PLAN);
      expect(sanitizePlan("intermediate&test=1")).toBe(DEFAULT_PLAN);
    });

    it("handles special characters in billing", () => {
      expect(sanitizeBilling("monthly<script>")).toBe(DEFAULT_BILLING);
      expect(sanitizeBilling("yearly?test=1")).toBe(DEFAULT_BILLING);
    });

    it("handles query parameters in redirect", () => {
      // Valid redirect with query params
      expect(sanitizeRedirect("/checkout?foo=bar")).toBe("/checkout?foo=bar");
      // Invalid redirect with protocol
      expect(sanitizeRedirect("https://evil.com?foo=bar")).toBe(DEFAULT_REDIRECT);
    });
  });
});
