/**
 * Log injection prevention tests
 */

import { test, expect, describe } from "vitest";
import { logPaymentEvent, logAuthEvent, logError } from "@server/security/logging.js";

describe("Log Injection Prevention", () => {
  test("logPaymentEvent should create structured logs", () => {
    const mockLogger = {
      info: (data: unknown) => {
        expect(data).toHaveProperty("event", "payment_completed");
        expect(data).toHaveProperty("timestamp");
        expect(data).toHaveProperty("amount", 100);
        expect(data).toHaveProperty("currency", "USD");
        expect(data).toHaveProperty("ref", "PAY-123");
      },
    };

    logPaymentEvent(mockLogger, "payment_completed", {
      amount: 100,
      currency: "USD",
      ref: "PAY-123",
    });
  });

  test("logAuthEvent should sanitize user input", () => {
    const mockLogger = {
      info: (data: unknown) => {
        expect(data).toHaveProperty("event", "login_attempt");
        expect(data).toHaveProperty("email", "test@example.com");
        expect(data).toHaveProperty("ip", "127.0.0.1");
        // Should not contain control characters
        expect(JSON.stringify(data)).not.toContain("\n");
        expect(JSON.stringify(data)).not.toContain("\r");
        expect(JSON.stringify(data)).not.toContain("\t");
      },
    };

    logAuthEvent(mockLogger, "login_attempt", {
      email: "test@example.com",
      ip: "127.0.0.1",
      userAgent: "Mozilla/5.0\n\r\t",
    });
  });

  test("logError should structure error information", () => {
    const mockLogger = {
      error: (data: unknown) => {
        expect(data).toHaveProperty("event", "error");
        expect(data).toHaveProperty("timestamp");
        expect(data).toHaveProperty("error");
        expect((data as any).error).toHaveProperty("name", "ValidationError");
        expect((data as any).error).toHaveProperty("message", "Invalid input");
        expect((data as any).error).toHaveProperty("stack");
      },
    };

    const error = new Error("Invalid input");
    error.name = "ValidationError";

    logError(mockLogger, error, {
      route: "/api/auth/login",
      method: "POST",
    });
  });

  test("payment service logs should be structured", () => {
    // Test that payment services use structured logging
    const mockLogger = {
      info: (data: unknown) => {
        expect(data).toHaveProperty("event");
        expect(data).toHaveProperty("timestamp");
        expect(data).toHaveProperty("service");

        // Should not contain raw user input that could cause log injection
        const dataStr = JSON.stringify(data);
        expect(dataStr).not.toContain("\n");
        expect(dataStr).not.toContain("\r");
        expect(dataStr).not.toContain("\t");
      },
    };

    // Simulate APS service logging
    logPaymentEvent(mockLogger, "aps_webhook_unhandled", {
      event: "payment.completed\n\r\t",
      service: "aps",
    });

    // Simulate HyperPay service logging
    logPaymentEvent(mockLogger, "hyperpay_webhook_received", {
      event: "payment.authorized",
      paymentId: "PAY-123\n\r\t",
      service: "hyperpay",
    });

    // Simulate PayPal service logging
    logPaymentEvent(mockLogger, "paypal_webhook_unhandled", {
      eventType: "PAYMENT.SALE.COMPLETED\n\r\t",
      service: "paypal",
    });
  });

  test("sensitive data should be masked in logs", () => {
    const { maskEmail, maskSensitive } = require("@server/security/logging.js");

    const email = "john.doe@example.com";
    const maskedEmail = maskEmail(email);

    expect(maskedEmail).toBe("******oe@*******.com");
    expect(maskedEmail).not.toContain("john");
    expect(maskedEmail).not.toContain("doe");

    const cardNumber = "4111111111111111";
    const maskedCard = maskSensitive(cardNumber, 4);

    expect(maskedCard).toBe("************1111");
    expect(maskedCard).not.toContain("4111");
  });
});
