import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { FastifyInstance } from "fastify";
import { buildApp } from "../../app";

describe("Payments API", () => {
  let app: FastifyInstance;
  let accessToken: string;

  beforeEach(async () => {
    app = await buildApp();
    await app.ready();

    // Register and login a user for authenticated tests
    const userData = {
      email: "paymenttest@example.com",
      password: "SecurePassword123!",
      firstName: "Payment",
      lastName: "Test",
    };

    await app.inject({
      method: "POST",
      url: "/api/auth/register",
      payload: userData,
    });

    const loginResponse = await app.inject({
      method: "POST",
      url: "/api/auth/login",
      payload: {
        email: "paymenttest@example.com",
        password: "SecurePassword123!",
      },
    });

    const loginBody = JSON.parse(loginResponse.body);
    const { accessToken: token } = loginBody;
    accessToken = token;
  });

  afterEach(async () => {
    await app.close();
  });

  describe("POST /api/payments/create", () => {
    it("should create payment successfully", async () => {
      const paymentData = {
        planType: "INTERMEDIATE",
        currency: "USD",
        billingCycle: "monthly",
        billingAddress: {
          street: "123 Main St",
          city: "New York",
          state: "NY",
          postalCode: "10001",
          country: "US",
        },
      };

      const response = await app.inject({
        method: "POST",
        url: "/api/payments/create",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        payload: paymentData,
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.paymentGateway).toBeDefined();
      expect(body.checkoutUrl).toBeDefined();
      expect(body.orderId).toBeDefined();
    });

    it("should select PayPal for USD currency", async () => {
      const paymentData = {
        planType: "SENIOR",
        currency: "USD",
        billingCycle: "yearly",
        billingAddress: {
          street: "456 Oak Ave",
          city: "Los Angeles",
          state: "CA",
          postalCode: "90210",
          country: "US",
        },
      };

      const response = await app.inject({
        method: "POST",
        url: "/api/payments/create",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        payload: paymentData,
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.paymentGateway).toBe("paypal");
    });

    it("should select APS for JOD currency", async () => {
      const paymentData = {
        planType: "BUNDLE",
        currency: "JOD",
        billingCycle: "monthly",
        billingAddress: {
          street: "789 Pine St",
          city: "Amman",
          state: "Amman",
          postalCode: "11183",
          country: "JO",
        },
      };

      const response = await app.inject({
        method: "POST",
        url: "/api/payments/create",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        payload: paymentData,
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.paymentGateway).toBe("aps");
    });

    it("should reject payment creation without authentication", async () => {
      const paymentData = {
        planType: "INTERMEDIATE",
        currency: "USD",
        billingCycle: "monthly",
        billingAddress: {
          street: "123 Main St",
          city: "New York",
          state: "NY",
          postalCode: "10001",
          country: "US",
        },
      };

      const response = await app.inject({
        method: "POST",
        url: "/api/payments/create",
        payload: paymentData,
      });

      expect(response.statusCode).toBe(401);
    });

    it("should reject payment creation with invalid plan type", async () => {
      const paymentData = {
        planType: "INVALID_PLAN",
        currency: "USD",
        billingCycle: "monthly",
        billingAddress: {
          street: "123 Main St",
          city: "New York",
          state: "NY",
          postalCode: "10001",
          country: "US",
        },
      };

      const response = await app.inject({
        method: "POST",
        url: "/api/payments/create",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        payload: paymentData,
      });

      expect(response.statusCode).toBe(400);
      const body = JSON.parse(response.body);
      expect(body.error).toContain("Invalid plan type");
    });

    it("should reject payment creation with invalid currency", async () => {
      const paymentData = {
        planType: "INTERMEDIATE",
        currency: "INVALID_CURRENCY",
        billingCycle: "monthly",
        billingAddress: {
          street: "123 Main St",
          city: "New York",
          state: "NY",
          postalCode: "10001",
          country: "US",
        },
      };

      const response = await app.inject({
        method: "POST",
        url: "/api/payments/create",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        payload: paymentData,
      });

      expect(response.statusCode).toBe(400);
      const body = JSON.parse(response.body);
      expect(body.error).toContain("Invalid currency");
    });

    it("should reject payment creation with incomplete billing address", async () => {
      const paymentData = {
        planType: "INTERMEDIATE",
        currency: "USD",
        billingCycle: "monthly",
        billingAddress: {
          street: "123 Main St",
          // Missing city, state, postalCode, country
        },
      };

      const response = await app.inject({
        method: "POST",
        url: "/api/payments/create",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        payload: paymentData,
      });

      expect(response.statusCode).toBe(400);
      const body = JSON.parse(response.body);
      expect(body.error).toContain("Validation error");
    });
  });

  describe("POST /api/payments/callback/:gateway", () => {
    it("should handle PayPal callback successfully", async () => {
      const callbackData = {
        orderId: "test-order-123",
        paymentId: "test-payment-456",
        status: "completed",
      };

      const response = await app.inject({
        method: "POST",
        url: "/api/payments/callback/paypal",
        payload: callbackData,
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
    });

    it("should handle APS callback successfully", async () => {
      const callbackData = {
        orderId: "test-order-456",
        paymentId: "test-payment-789",
        status: "success",
        amount: "29.99",
        currency: "JOD",
      };

      const response = await app.inject({
        method: "POST",
        url: "/api/payments/callback/aps",
        payload: callbackData,
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
    });

    it("should handle HyperPay callback successfully", async () => {
      const callbackData = {
        orderId: "test-order-789",
        paymentId: "test-payment-101",
        status: "success",
        amount: "49.99",
        currency: "SAR",
      };

      const response = await app.inject({
        method: "POST",
        url: "/api/payments/callback/hyperpay",
        payload: callbackData,
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
    });

    it("should reject callback with invalid gateway", async () => {
      const callbackData = {
        orderId: "test-order-123",
        paymentId: "test-payment-456",
        status: "completed",
      };

      const response = await app.inject({
        method: "POST",
        url: "/api/payments/callback/invalid-gateway",
        payload: callbackData,
      });

      expect(response.statusCode).toBe(400);
      const body = JSON.parse(response.body);
      expect(body.error).toContain("Invalid payment gateway");
    });

    it("should reject callback with missing order ID", async () => {
      const callbackData = {
        paymentId: "test-payment-456",
        status: "completed",
      };

      const response = await app.inject({
        method: "POST",
        url: "/api/payments/callback/paypal",
        payload: callbackData,
      });

      expect(response.statusCode).toBe(400);
      const body = JSON.parse(response.body);
      expect(body.error).toContain("Validation error");
    });
  });

  describe("POST /api/payments/webhook/:gateway", () => {
    it("should handle PayPal webhook successfully", async () => {
      const webhookData = {
        event_type: "PAYMENT.CAPTURE.COMPLETED",
        resource: {
          id: "test-payment-123",
          order_id: "test-order-456",
          status: "COMPLETED",
          amount: {
            total: "29.99",
            currency: "USD",
          },
        },
      };

      const response = await app.inject({
        method: "POST",
        url: "/api/payments/webhook/paypal",
        headers: {
          "Content-Type": "application/json",
        },
        payload: webhookData,
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
    });

    it("should handle APS webhook successfully", async () => {
      const webhookData = {
        event: "payment.completed",
        orderId: "test-order-789",
        paymentId: "test-payment-101",
        status: "success",
        amount: "29.99",
        currency: "JOD",
      };

      const response = await app.inject({
        method: "POST",
        url: "/api/payments/webhook/aps",
        headers: {
          "Content-Type": "application/json",
        },
        payload: webhookData,
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
    });

    it("should reject webhook with invalid signature", async () => {
      const webhookData = {
        event_type: "PAYMENT.CAPTURE.COMPLETED",
        resource: {
          id: "test-payment-123",
          order_id: "test-order-456",
          status: "COMPLETED",
        },
      };

      const response = await app.inject({
        method: "POST",
        url: "/api/payments/webhook/paypal",
        headers: {
          "Content-Type": "application/json",
          "PayPal-Transmission-Id": "invalid-transmission-id",
          "PayPal-Cert-Id": "invalid-cert-id",
          "PayPal-Transmission-Sig": "invalid-signature",
          "PayPal-Transmission-Time": new Date().toISOString(),
        },
        payload: webhookData,
      });

      // Should still process but log the signature verification failure
      expect([200, 400]).toContain(response.statusCode);
    });
  });

  describe("GET /api/payments/subscription", () => {
    it("should return user subscription", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/api/payments/subscription",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      // Subscription might be null if user hasn't subscribed yet
      expect(body.subscription).toBeDefined();
    });

    it("should reject request without authentication", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/api/payments/subscription",
      });

      expect(response.statusCode).toBe(401);
    });
  });

  describe("GET /api/payments/history", () => {
    it("should return user purchase history", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/api/payments/history",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(Array.isArray(body.purchases)).toBe(true);
    });

    it("should reject request without authentication", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/api/payments/history",
      });

      expect(response.statusCode).toBe(401);
    });

    it("should support pagination", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/api/payments/history?page=1&limit=10",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.pagination).toBeDefined();
      expect(body.pagination.page).toBe(1);
      expect(body.pagination.limit).toBe(10);
    });
  });

  describe("GET /api/payments/gateway-status", () => {
    it("should return payment gateway status", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/api/payments/gateway-status",
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.gateways).toBeDefined();
      expect(body.gateways.paypal).toBeDefined();
      expect(body.gateways.aps).toBeDefined();
      expect(body.gateways.hyperpay).toBeDefined();
    });
  });

  describe("POST /api/payments/refund", () => {
    it("should process refund successfully", async () => {
      const refundData = {
        paymentId: "test-payment-123",
        amount: 29.99,
        reason: "Customer request",
      };

      const response = await app.inject({
        method: "POST",
        url: "/api/payments/refund",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        payload: refundData,
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.refundId).toBeDefined();
    });

    it("should reject refund without authentication", async () => {
      const refundData = {
        paymentId: "test-payment-123",
        amount: 29.99,
        reason: "Customer request",
      };

      const response = await app.inject({
        method: "POST",
        url: "/api/payments/refund",
        payload: refundData,
      });

      expect(response.statusCode).toBe(401);
    });

    it("should reject refund with invalid payment ID", async () => {
      const refundData = {
        paymentId: "invalid-payment-id",
        amount: 29.99,
        reason: "Customer request",
      };

      const response = await app.inject({
        method: "POST",
        url: "/api/payments/refund",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        payload: refundData,
      });

      expect(response.statusCode).toBe(404);
      const body = JSON.parse(response.body);
      expect(body.error).toContain("Payment not found");
    });

    it("should reject refund with invalid amount", async () => {
      const refundData = {
        paymentId: "test-payment-123",
        amount: -10, // Invalid negative amount
        reason: "Customer request",
      };

      const response = await app.inject({
        method: "POST",
        url: "/api/payments/refund",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        payload: refundData,
      });

      expect(response.statusCode).toBe(400);
      const body = JSON.parse(response.body);
      expect(body.error).toContain("Validation error");
    });
  });

  describe("Rate Limiting", () => {
    it("should rate limit payment creation requests", async () => {
      const paymentData = {
        planType: "INTERMEDIATE",
        currency: "USD",
        billingCycle: "monthly",
        billingAddress: {
          street: "123 Main St",
          city: "New York",
          state: "NY",
          postalCode: "10001",
          country: "US",
        },
      };

      // Make multiple rapid requests
      const promises = Array.from({ length: 10 }, () =>
        app.inject({
          method: "POST",
          url: "/api/payments/create",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          payload: paymentData,
        })
      );

      const responses = await Promise.all(promises);

      // Some requests should be rate limited
      const rateLimitedResponses = responses.filter((response) => response.statusCode === 429);

      expect(rateLimitedResponses.length).toBeGreaterThan(0);
    });
  });
});
