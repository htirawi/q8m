/**
 * Intrusion Detection Tests
 * Tests for suspicious activity monitoring and alerting
 */

import { describe, test, expect, beforeEach, vi } from "vitest";
import {
  intrusionDetectionService,
  type IntrusionEvent,
  type AlertHandler,
} from "@services/intrusion-detection.service.js";
import type { FastifyRequest } from "fastify";

// Mock alert handler
const mockAlertHandler = vi.fn<[IntrusionEvent], void>();

// Mock request
function createMockRequest(overrides: Partial<FastifyRequest> = {}): FastifyRequest {
  return {
    ip: "192.168.1.100",
    url: "/api/v1/auth/login",
    headers: {
      "user-agent": "Mozilla/5.0",
    },
    body: {},
    ...overrides,
  } as FastifyRequest;
}

beforeEach(() => {
  // Reset detection store to clear all state
  intrusionDetectionService.resetStore();

  // Clear existing alert handlers
  intrusionDetectionService.clearAlertHandlers();

  // Reset alert handler
  mockAlertHandler.mockClear();

  // Reset service configuration
  intrusionDetectionService.updateConfig({
    maxFailedLoginsPerIp: 10,
    maxFailedLoginsPerUser: 5,
    failedLoginWindowMinutes: 15,
    max401PerRoute: 20,
    max403PerRoute: 10,
    max5xxPerRoute: 50,
    errorSpikeWindowMinutes: 5,
    maxRateLimitBreachesPerIp: 5,
    rateLimitBreachWindowMinutes: 15,
    maxWebhookFailuresPerIp: 10,
    webhookFailureWindowMinutes: 15,
    alertCooldownMinutes: 60,
    enableAlerts: true,
    enableAutoBlock: false,
  });

  // Register mock alert handler
  intrusionDetectionService.registerAlertHandler(mockAlertHandler as AlertHandler);
});

describe("Failed Login Detection", () => {
  test("should detect excessive failed logins from same IP", async () => {
    const ip = "192.168.1.100";

    // Simulate 10 failed logins
    for (let i = 0; i < 10; i++) {
      await intrusionDetectionService.detectFailedLogin(ip);
    }

    // Should trigger alert
    expect(mockAlertHandler).toHaveBeenCalled();
    const call = mockAlertHandler.mock.calls[0]?.[0];
    expect(call?.signal).toBe("excessive_failed_logins");
    expect(call?.severity).toBe("high");
    expect(call?.ip).toBe(ip);
  });

  test("should not trigger alert below threshold", async () => {
    const ip = "192.168.1.100";

    // Simulate 5 failed logins (below threshold of 10)
    for (let i = 0; i < 5; i++) {
      await intrusionDetectionService.detectFailedLogin(ip);
    }

    // Should not trigger alert
    expect(mockAlertHandler).not.toHaveBeenCalled();
  });

  test("should track user ID with failed logins", async () => {
    const ip = "192.168.1.100";
    const userId = "user-123";

    for (let i = 0; i < 10; i++) {
      await intrusionDetectionService.detectFailedLogin(ip, userId, "Chrome/90.0");
    }

    expect(mockAlertHandler).toHaveBeenCalled();
    const call = mockAlertHandler.mock.calls[0]?.[0];
    expect(call?.userId).toBe(userId);
    expect(call?.userAgent).toBe("Chrome/90.0");
  });
});

describe("HTTP Error Spike Detection", () => {
  test("should detect 401 error spike", async () => {
    const request = createMockRequest();
    const route = "/api/v1/auth/login";

    // Simulate 20 401 errors
    for (let i = 0; i < 20; i++) {
      await intrusionDetectionService.detectHttpError(request, 401, route);
    }

    expect(mockAlertHandler).toHaveBeenCalled();
    const call = mockAlertHandler.mock.calls[0]?.[0];
    expect(call?.signal).toBe("auth_spike_401");
    expect(call?.severity).toBe("medium");
    expect(call?.route).toBe(route);
  });

  test("should detect 403 error spike", async () => {
    const request = createMockRequest();
    const route = "/api/v1/admin/users";

    // Simulate 10 403 errors
    for (let i = 0; i < 10; i++) {
      await intrusionDetectionService.detectHttpError(request, 403, route);
    }

    expect(mockAlertHandler).toHaveBeenCalled();
    const call = mockAlertHandler.mock.calls[0]?.[0];
    expect(call?.signal).toBe("auth_spike_403");
    expect(call?.severity).toBe("medium");
  });

  test("should detect 5xx error spike", async () => {
    const request = createMockRequest();
    const route = "/api/v1/payments/create";

    // Simulate 50 500 errors
    for (let i = 0; i < 50; i++) {
      await intrusionDetectionService.detectHttpError(request, 500, route);
    }

    expect(mockAlertHandler).toHaveBeenCalled();
    const call = mockAlertHandler.mock.calls[0]?.[0];
    expect(call?.signal).toBe("server_error_spike_5xx");
    expect(call?.severity).toBe("high");
    expect(call?.metadata?.statusCode).toBe(500);
  });

  test("should not trigger alert for different status codes", async () => {
    const request = createMockRequest();
    const route = "/api/v1/test";

    // Simulate various 2xx and 3xx responses
    for (let i = 0; i < 100; i++) {
      await intrusionDetectionService.detectHttpError(request, 200, route);
    }

    expect(mockAlertHandler).not.toHaveBeenCalled();
  });
});

describe("Path Traversal Detection", () => {
  test("should detect path traversal attempts", async () => {
    const paths = [
      "/api/../../../etc/passwd",
      "/api/%2e%2e%2f%2e%2e%2fetc/passwd",
      "/files/..%2f..%2fsecret",
    ];

    // Use different IPs to bypass cooldown
    for (let i = 0; i < paths.length; i++) {
      const request = createMockRequest({
        url: paths[i],
        ip: `192.168.1.${100 + i}`,
      });
      await intrusionDetectionService.detectSuspiciousPath(request);
    }

    expect(mockAlertHandler).toHaveBeenCalledTimes(3);
    const calls = mockAlertHandler.mock.calls;
    calls.forEach((call) => {
      expect(call[0].signal).toBe("path_traversal_attempt");
      expect(call[0].severity).toBe("critical");
    });
  });

  test("should detect admin path probing", async () => {
    const suspiciousPaths = [
      "/wp-admin/login.php",
      "/.env",
      "/.git/config",
      "/phpmyadmin",
      "/admin/login",
    ];

    // Use different IPs to bypass cooldown
    for (let i = 0; i < suspiciousPaths.length; i++) {
      const request = createMockRequest({
        url: suspiciousPaths[i],
        ip: `192.168.2.${100 + i}`,
      });
      await intrusionDetectionService.detectSuspiciousPath(request);
    }

    expect(mockAlertHandler).toHaveBeenCalledTimes(5);
    const calls = mockAlertHandler.mock.calls;
    calls.forEach((call) => {
      expect(call[0].signal).toBe("admin_path_probe");
      expect(call[0].severity).toBe("medium");
    });
  });

  test("should not trigger alert for legitimate paths", async () => {
    const legitimatePaths = [
      "/api/v1/auth/login",
      "/api/v1/questions",
      "/api/v1/admin/dashboard", // Admin path but via API
    ];

    for (const url of legitimatePaths) {
      const request = createMockRequest({ url });
      await intrusionDetectionService.detectSuspiciousPath(request);
    }

    expect(mockAlertHandler).not.toHaveBeenCalled();
  });
});

describe("Rate Limit Breach Detection", () => {
  test("should detect excessive rate limit breaches", async () => {
    const ip = "192.168.1.100";
    const request = createMockRequest({ ip });
    const route = "/api/v1/auth/login";

    // Simulate 5 rate limit breaches
    for (let i = 0; i < 5; i++) {
      await intrusionDetectionService.detectRateLimitBreach(request, route);
    }

    expect(mockAlertHandler).toHaveBeenCalled();
    const call = mockAlertHandler.mock.calls[0]?.[0];
    expect(call?.signal).toBe("rate_limit_breach");
    expect(call?.severity).toBe("high");
  });
});

describe("Webhook Failure Detection", () => {
  test("should detect excessive webhook signature failures", async () => {
    const ip = "203.0.113.42";
    const gateway = "paypal";

    // Simulate 10 webhook failures
    for (let i = 0; i < 10; i++) {
      await intrusionDetectionService.detectWebhookFailure(ip, gateway, "PayPal-Webhook/1.0");
    }

    expect(mockAlertHandler).toHaveBeenCalled();
    const call = mockAlertHandler.mock.calls[0]?.[0];
    expect(call?.signal).toBe("webhook_signature_failure");
    expect(call?.severity).toBe("high");
    expect(call?.metadata?.gateway).toBe(gateway);
  });
});

describe("Suspicious User Agent Detection", () => {
  test("should detect security scanner user agents", async () => {
    const scanners = [
      "sqlmap/1.0",
      "Nikto/2.1.6",
      "Nmap Scripting Engine",
      "Burp Suite Professional",
      "Metasploit",
    ];

    // Use different IPs to bypass cooldown
    for (let i = 0; i < scanners.length; i++) {
      const request = createMockRequest({
        ip: `192.168.3.${100 + i}`,
        headers: { "user-agent": scanners[i] },
      });
      await intrusionDetectionService.detectSuspiciousUserAgent(request);
    }

    expect(mockAlertHandler).toHaveBeenCalledTimes(5);
    const calls = mockAlertHandler.mock.calls;
    calls.forEach((call) => {
      expect(call[0].signal).toBe("suspicious_user_agent");
      expect(call[0].severity).toBe("high");
    });
  });

  test("should not trigger alert for legitimate user agents", async () => {
    const legitimateUserAgents = [
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      "curl/7.68.0",
      "PostmanRuntime/7.26.8",
    ];

    for (const userAgent of legitimateUserAgents) {
      const request = createMockRequest({
        headers: { "user-agent": userAgent },
      });
      await intrusionDetectionService.detectSuspiciousUserAgent(request);
    }

    expect(mockAlertHandler).not.toHaveBeenCalled();
  });
});

describe("SQL Injection Detection", () => {
  test("should detect SQL injection in URL", async () => {
    const sqlUrls = [
      "/api/users?id=1 OR 1=1",
      "/api/search?q='; DROP TABLE users;--",
      "/api/query?filter=1 UNION SELECT * FROM passwords",
    ];

    // Use different IPs to bypass cooldown
    for (let i = 0; i < sqlUrls.length; i++) {
      const request = createMockRequest({
        url: sqlUrls[i],
        ip: `192.168.4.${100 + i}`,
      });
      await intrusionDetectionService.detectSqlInjection(request);
    }

    expect(mockAlertHandler).toHaveBeenCalledTimes(3);
    const calls = mockAlertHandler.mock.calls;
    calls.forEach((call) => {
      expect(call[0].signal).toBe("sql_injection_attempt");
      expect(call[0].severity).toBe("critical");
    });
  });

  test("should detect SQL injection in body", async () => {
    const request = createMockRequest({
      body: {
        email: "test@example.com' OR '1'='1",
        query: "SELECT * FROM users WHERE id = 1; DROP TABLE users;",
      },
    });

    await intrusionDetectionService.detectSqlInjection(request);

    expect(mockAlertHandler).toHaveBeenCalled();
    const call = mockAlertHandler.mock.calls[0]?.[0];
    expect(call?.signal).toBe("sql_injection_attempt");
  });
});

describe("XSS Detection", () => {
  test("should detect XSS attempts in URL", async () => {
    const xssUrls = [
      "/api/search?q=<script>alert(1)</script>",
      "/api/profile?name=<img src=x onerror=alert(1)>",
      "/api/redirect?url=javascript:alert(1)",
    ];

    // Use different IPs to bypass cooldown
    for (let i = 0; i < xssUrls.length; i++) {
      const request = createMockRequest({
        url: xssUrls[i],
        ip: `192.168.5.${100 + i}`,
      });
      await intrusionDetectionService.detectXssAttempt(request);
    }

    expect(mockAlertHandler).toHaveBeenCalledTimes(3);
    const calls = mockAlertHandler.mock.calls;
    calls.forEach((call) => {
      expect(call[0].signal).toBe("xss_attempt");
      expect(call[0].severity).toBe("high");
    });
  });

  test("should detect XSS attempts in body", async () => {
    const request = createMockRequest({
      body: {
        comment: "<script>alert('XSS')</script>",
        description: "<iframe src='evil.com'></iframe>",
      },
    });

    await intrusionDetectionService.detectXssAttempt(request);

    expect(mockAlertHandler).toHaveBeenCalled();
    const call = mockAlertHandler.mock.calls[0]?.[0];
    expect(call?.signal).toBe("xss_attempt");
  });
});

describe("Alert Cooldown", () => {
  test("should not send duplicate alerts within cooldown period", async () => {
    const ip = "192.168.1.100";

    // First alert should go through
    for (let i = 0; i < 10; i++) {
      await intrusionDetectionService.detectFailedLogin(ip);
    }

    expect(mockAlertHandler).toHaveBeenCalledTimes(1);

    // Second batch should not trigger alert (same IP, cooldown active)
    mockAlertHandler.mockClear();
    for (let i = 0; i < 10; i++) {
      await intrusionDetectionService.detectFailedLogin(ip);
    }

    expect(mockAlertHandler).not.toHaveBeenCalled();
  });

  test("should send alert after cooldown expires", async () => {
    // Set very short cooldown for testing
    intrusionDetectionService.updateConfig({
      alertCooldownMinutes: 0.001, // ~60ms
    });

    const ip = "192.168.1.100";

    // First alert
    for (let i = 0; i < 10; i++) {
      await intrusionDetectionService.detectFailedLogin(ip);
    }

    expect(mockAlertHandler).toHaveBeenCalledTimes(1);

    // Wait for cooldown to expire
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Second alert should go through
    mockAlertHandler.mockClear();
    for (let i = 0; i < 10; i++) {
      await intrusionDetectionService.detectFailedLogin(ip);
    }

    expect(mockAlertHandler).toHaveBeenCalledTimes(1);
  });
});

describe("Configuration", () => {
  test("should get current configuration", () => {
    const config = intrusionDetectionService.getConfig();

    expect(config).toHaveProperty("maxFailedLoginsPerIp");
    expect(config).toHaveProperty("max401PerRoute");
    expect(config).toHaveProperty("enableAlerts");
  });

  test("should update configuration", () => {
    intrusionDetectionService.updateConfig({
      maxFailedLoginsPerIp: 20,
      enableAlerts: false,
    });

    const config = intrusionDetectionService.getConfig();

    expect(config.maxFailedLoginsPerIp).toBe(20);
    expect(config.enableAlerts).toBe(false);
  });

  test("should disable alerts when configured", async () => {
    intrusionDetectionService.updateConfig({
      enableAlerts: false,
    });

    const ip = "192.168.1.100";

    for (let i = 0; i < 10; i++) {
      await intrusionDetectionService.detectFailedLogin(ip);
    }

    // Should not send alert when disabled
    expect(mockAlertHandler).not.toHaveBeenCalled();
  });
});

describe("Alert Event Structure", () => {
  test("should include all required fields in alert event", async () => {
    const ip = "192.168.1.100";

    for (let i = 0; i < 10; i++) {
      await intrusionDetectionService.detectFailedLogin(ip, "user-123", "Chrome/90.0");
    }

    expect(mockAlertHandler).toHaveBeenCalled();
    const event = mockAlertHandler.mock.calls[0]?.[0];

    expect(event).toHaveProperty("signal");
    expect(event).toHaveProperty("severity");
    expect(event).toHaveProperty("timestamp");
    expect(event).toHaveProperty("ip");
    expect(event).toHaveProperty("userId");
    expect(event).toHaveProperty("userAgent");
    expect(event).toHaveProperty("metadata");

    expect(event?.timestamp).toBeInstanceOf(Date);
  });
});

describe("Multiple Signal Types", () => {
  test("should handle multiple different signals", async () => {
    const ip = "192.168.1.100";

    // Failed logins
    for (let i = 0; i < 10; i++) {
      await intrusionDetectionService.detectFailedLogin(ip);
    }

    // Rate limit breaches
    const request = createMockRequest({ ip });
    for (let i = 0; i < 5; i++) {
      await intrusionDetectionService.detectRateLimitBreach(request, "/api/test");
    }

    // Path traversal
    const traversalRequest = createMockRequest({
      ip,
      url: "/api/../../../etc/passwd",
    });
    await intrusionDetectionService.detectSuspiciousPath(traversalRequest);

    // Should have multiple alerts
    expect(mockAlertHandler.mock.calls.length).toBeGreaterThanOrEqual(3);

    // Verify different signal types
    const signals = mockAlertHandler.mock.calls.map((call) => call[0].signal);
    expect(signals).toContain("excessive_failed_logins");
    expect(signals).toContain("rate_limit_breach");
    expect(signals).toContain("path_traversal_attempt");
  });
});

describe("Severity Levels", () => {
  test("should assign critical severity to path traversal", async () => {
    const request = createMockRequest({
      url: "/api/../../../etc/passwd",
    });

    await intrusionDetectionService.detectSuspiciousPath(request);

    expect(mockAlertHandler).toHaveBeenCalled();
    const call = mockAlertHandler.mock.calls[0]?.[0];
    expect(call?.severity).toBe("critical");
  });

  test("should assign high severity to failed logins", async () => {
    for (let i = 0; i < 10; i++) {
      await intrusionDetectionService.detectFailedLogin("192.168.1.100");
    }

    expect(mockAlertHandler).toHaveBeenCalled();
    const call = mockAlertHandler.mock.calls[0]?.[0];
    expect(call?.severity).toBe("high");
  });

  test("should assign medium severity to admin probes", async () => {
    const request = createMockRequest({
      url: "/wp-admin",
    });

    await intrusionDetectionService.detectSuspiciousPath(request);

    expect(mockAlertHandler).toHaveBeenCalled();
    const call = mockAlertHandler.mock.calls[0]?.[0];
    expect(call?.severity).toBe("medium");
  });
});

describe("Edge Cases", () => {
  test("should handle missing IP address", async () => {
    const request = createMockRequest({ ip: undefined });

    await intrusionDetectionService.detectHttpError(request, 401, "/api/test");

    // Should not throw error
    expect(mockAlertHandler).not.toThrow();
  });

  test("should handle missing user agent", async () => {
    const request = createMockRequest({
      headers: {},
    });

    await intrusionDetectionService.detectFailedLogin("192.168.1.100", undefined, undefined);

    // Should not throw error
    expect(true).toBe(true);
  });

  test("should handle empty body", async () => {
    const request = createMockRequest({
      body: undefined,
    });

    await intrusionDetectionService.detectSqlInjection(request);
    await intrusionDetectionService.detectXssAttempt(request);

    // Should not throw error
    expect(true).toBe(true);
  });
});
