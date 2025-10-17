/**
 * Rate Limit Profiles Tests
 * Tests for centralized rate limiting configuration and profile application
 */

import { describe, test, expect } from "vitest";
import {
  RATE_LIMIT_PROFILES,
  SENSITIVE_ENDPOINTS,
  createRateLimitOptions,
  adminRateLimits,
  webhookRateLimits,
  paymentRateLimits,
  isRateLimitExempt,
} from "@server/security/rate-limit-profiles.js";

describe("Rate Limit Profiles", () => {
  test("should define all required profiles", () => {
    expect(RATE_LIMIT_PROFILES).toHaveProperty("strict");
    expect(RATE_LIMIT_PROFILES).toHaveProperty("moderate");
    expect(RATE_LIMIT_PROFILES).toHaveProperty("generous");
    expect(RATE_LIMIT_PROFILES).toHaveProperty("webhook");
    expect(RATE_LIMIT_PROFILES).toHaveProperty("admin");
  });

  test("strict profile should have lowest limits", () => {
    expect(RATE_LIMIT_PROFILES.strict.max).toBeLessThanOrEqual(5);
    expect(RATE_LIMIT_PROFILES.strict.keyMode).toBe("combo");
  });

  test("moderate profile should have middle limits", () => {
    expect(RATE_LIMIT_PROFILES.moderate.max).toBeGreaterThan(RATE_LIMIT_PROFILES.strict.max);
    expect(RATE_LIMIT_PROFILES.moderate.max).toBeLessThan(RATE_LIMIT_PROFILES.generous.max);
  });

  test("generous profile should have highest limits", () => {
    expect(RATE_LIMIT_PROFILES.generous.max).toBeGreaterThanOrEqual(100);
    expect(RATE_LIMIT_PROFILES.generous.keyMode).toBe("ip");
  });

  test("webhook profile should use IP-based limiting", () => {
    expect(RATE_LIMIT_PROFILES.webhook.keyMode).toBe("ip");
    expect(RATE_LIMIT_PROFILES.webhook.max).toBeGreaterThanOrEqual(100);
  });

  test("admin profile should use combo limiting", () => {
    expect(RATE_LIMIT_PROFILES.admin.keyMode).toBe("combo");
    expect(RATE_LIMIT_PROFILES.admin.max).toBeLessThanOrEqual(30);
  });
});

describe("Sensitive Endpoints Classification", () => {
  test("should classify auth endpoints correctly", () => {
    expect(SENSITIVE_ENDPOINTS.auth.login.profile).toBe("strict");
    expect(SENSITIVE_ENDPOINTS.auth.register.profile).toBe("strict");
    expect(SENSITIVE_ENDPOINTS.auth.forgotPassword.profile).toBe("strict");
    expect(SENSITIVE_ENDPOINTS.auth.refresh.profile).toBe("generous");
  });

  test("should classify admin endpoints correctly", () => {
    expect(SENSITIVE_ENDPOINTS.admin.userRoleUpdate.profile).toBe("admin");
    expect(SENSITIVE_ENDPOINTS.admin.questionCreate.profile).toBe("admin");
    expect(SENSITIVE_ENDPOINTS.admin.dataExport.profile).toBe("strict");
  });

  test("should classify webhook endpoints correctly", () => {
    expect(SENSITIVE_ENDPOINTS.webhooks.paypal.profile).toBe("webhook");
    expect(SENSITIVE_ENDPOINTS.webhooks.aps.profile).toBe("webhook");
    expect(SENSITIVE_ENDPOINTS.webhooks.hyperpay.profile).toBe("webhook");
  });

  test("should classify payment endpoints correctly", () => {
    expect(SENSITIVE_ENDPOINTS.payments.create.profile).toBe("moderate");
    expect(SENSITIVE_ENDPOINTS.payments.callback.profile).toBe("moderate");
    expect(SENSITIVE_ENDPOINTS.payments.refund.profile).toBe("strict");
  });
});

describe("createRateLimitOptions", () => {
  test("should create valid rate limit options for strict profile", () => {
    const options = createRateLimitOptions("strict", "test:strict");

    expect(options).toHaveProperty("rateLimit");
    expect(options.rateLimit.max).toBe(5);
    expect(options.rateLimit.timeWindow).toBe("15m");
    expect(options.rateLimit.hook).toBe("onRequest");
    expect(typeof options.rateLimit.keyGenerator).toBe("function");
  });

  test("should create valid rate limit options for moderate profile", () => {
    const options = createRateLimitOptions("moderate", "test:moderate");

    expect(options.rateLimit.max).toBe(30);
    expect(options.rateLimit.timeWindow).toBe("15m");
  });

  test("should create valid rate limit options for generous profile", () => {
    const options = createRateLimitOptions("generous", "test:generous");

    expect(options.rateLimit.max).toBe(100);
    expect(options.rateLimit.timeWindow).toBe("15m");
  });

  test("should apply overrides correctly", () => {
    const options = createRateLimitOptions("strict", "test:override", {
      max: 10,
      timeWindow: "10m",
    });

    expect(options.rateLimit.max).toBe(10);
    expect(options.rateLimit.timeWindow).toBe("10m");
  });

  test("should include error response builder", () => {
    const options = createRateLimitOptions("strict", "test:route");

    const mockRequest = {} as any;
    const mockContext = { ttl: 30000, max: 5 };

    const errorResponse = options.rateLimit.errorResponseBuilder(mockRequest, mockContext);

    expect(errorResponse).toHaveProperty("code", 429);
    expect(errorResponse).toHaveProperty("error", "Too Many Requests");
    expect(errorResponse).toHaveProperty("retryAfter");
    expect(errorResponse.message).toContain("test:route");
  });

  test("should include onExceeding callback", () => {
    const options = createRateLimitOptions("strict", "test:route");

    expect(typeof options.rateLimit.onExceeding).toBe("function");
  });

  test("should include onExceeded callback", () => {
    const options = createRateLimitOptions("strict", "test:route");

    expect(typeof options.rateLimit.onExceeded).toBe("function");
  });
});

describe("Helper Functions", () => {
  test("adminRateLimits should provide valid configs", () => {
    const userManagement = adminRateLimits.userManagement();
    const contentManagement = adminRateLimits.contentManagement();
    const dataExport = adminRateLimits.dataExport();
    const analytics = adminRateLimits.analytics();

    expect(userManagement).toHaveProperty("rateLimit");
    expect(contentManagement).toHaveProperty("rateLimit");
    expect(dataExport).toHaveProperty("rateLimit");
    expect(analytics).toHaveProperty("rateLimit");

    // Data export should be strictest
    expect(dataExport.rateLimit.max).toBeLessThanOrEqual(5);
  });

  test("webhookRateLimits should provide valid configs", () => {
    const paypal = webhookRateLimits.paypal();
    const aps = webhookRateLimits.aps();
    const hyperpay = webhookRateLimits.hyperpay();

    expect(paypal).toHaveProperty("rateLimit");
    expect(aps).toHaveProperty("rateLimit");
    expect(hyperpay).toHaveProperty("rateLimit");

    // All webhooks should have generous limits
    expect(paypal.rateLimit.max).toBeGreaterThanOrEqual(100);
    expect(aps.rateLimit.max).toBeGreaterThanOrEqual(100);
    expect(hyperpay.rateLimit.max).toBeGreaterThanOrEqual(100);
  });

  test("paymentRateLimits should provide valid configs", () => {
    const create = paymentRateLimits.create();
    const callback = paymentRateLimits.callback();
    const refund = paymentRateLimits.refund();

    expect(create).toHaveProperty("rateLimit");
    expect(callback).toHaveProperty("rateLimit");
    expect(refund).toHaveProperty("rateLimit");

    // Refund should be strictest
    expect(refund.rateLimit.max).toBeLessThanOrEqual(5);
  });

  test("isRateLimitExempt should correctly identify exempt paths", () => {
    expect(isRateLimitExempt("/health")).toBe(true);
    expect(isRateLimitExempt("/api/health")).toBe(true);
    expect(isRateLimitExempt("/api/v1/health")).toBe(true);

    expect(isRateLimitExempt("/api/auth/login")).toBe(false);
    expect(isRateLimitExempt("/api/admin/users")).toBe(false);
    expect(isRateLimitExempt("/api/payments/create")).toBe(false);
  });
});

describe("Rate Limit Configuration Consistency", () => {
  test("all profiles should have required properties", () => {
    Object.values(RATE_LIMIT_PROFILES).forEach((profile) => {
      expect(profile).toHaveProperty("max");
      expect(profile).toHaveProperty("timeWindow");
      expect(profile).toHaveProperty("keyMode");
      expect(profile).toHaveProperty("description");

      expect(typeof profile.max).toBe("number");
      expect(typeof profile.timeWindow).toBe("string");
      expect(["ip", "combo"]).toContain(profile.keyMode);
      expect(typeof profile.description).toBe("string");
    });
  });

  test("all time windows should be valid", () => {
    Object.values(RATE_LIMIT_PROFILES).forEach((profile) => {
      // Should match format like "15m", "1h", "1d"
      expect(profile.timeWindow).toMatch(/^\d+[mhd]$/);
    });
  });

  test("max values should be reasonable", () => {
    Object.values(RATE_LIMIT_PROFILES).forEach((profile) => {
      expect(profile.max).toBeGreaterThan(0);
      expect(profile.max).toBeLessThanOrEqual(1000);
    });
  });
});

describe("Rate Limit Profiles - Edge Cases", () => {
  test("should handle profile with all overrides", () => {
    const options = createRateLimitOptions("strict", "test:all-overrides", {
      max: 50,
      timeWindow: "5m",
      keyMode: "ip",
    });

    expect(options.rateLimit.max).toBe(50);
    expect(options.rateLimit.timeWindow).toBe("5m");
  });

  test("should handle different route IDs", () => {
    const options1 = createRateLimitOptions("strict", "route:one");
    const options2 = createRateLimitOptions("strict", "route:two");

    const mockContext = { ttl: 30000, max: 5 };
    const error1 = options1.rateLimit.errorResponseBuilder({} as any, mockContext);
    const error2 = options2.rateLimit.errorResponseBuilder({} as any, mockContext);

    expect(error1.message).toContain("route:one");
    expect(error2.message).toContain("route:two");
  });
});
