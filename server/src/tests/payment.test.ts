/**
 * Payment System Tests
 *
 * Comprehensive tests for payment processing, webhooks, and entitlements
 */

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { FastifyInstance } from "fastify";
import { buildApp } from "../app.js";
import { mockPaymentService } from "../services/mock-payment.service.js";
import { entitlementService } from "../services/entitlement.service.js";
import { User } from "../models/User.js";
import { Purchase } from "../models/Purchase.js";
import { Subscription } from "../models/Subscription.js";

describe("Payment System", () => {
  let app: FastifyInstance;
  let testUser: any;
  let authToken: string;

  beforeEach(async () => {
    // Build test app
    app = await buildApp();
    await app.ready();

    // Enable mock payments
    mockPaymentService.setEnabled(true);
    mockPaymentService.clearMockPayments();

    // Create test user
    testUser = await User.create({
      email: "test@example.com",
      password: "TestPassword123!",
      name: "Test User",
      isEmailVerified: true,
      isActive: true,
      entitlements: ["JUNIOR"],
    });

    // Get auth token
    const loginResponse = await app.inject({
      method: "POST",
      url: "/api/auth/login",
      payload: {
        email: "test@example.com",
        password: "TestPassword123!",
      },
    });

    const loginData = JSON.parse(loginResponse.body);
    authToken = loginData.token;
  });

  afterEach(async () => {
    // Clean up test data
    await User.deleteMany({});
    await Purchase.deleteMany({});
    await Subscription.deleteMany({});
    mockPaymentService.clearMockPayments();
    entitlementService.clearAllCache();
    await app.close();
  });

  describe("Payment Creation", () => {
    it("should create a payment successfully", async () => {
      const response = await app.inject({
        method: "POST",
        url: "/api/payments/create",
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
        payload: {
          planType: "INTERMEDIATE",
          currency: "USD",
          billingCycle: "monthly",
          billingAddress: {
            street: "123 Test St",
            city: "Test City",
            state: "TS",
            postalCode: "12345",
            country: "US",
          },
        },
      });

      expect(response.statusCode).toBe(200);
      const data = JSON.parse(response.body);
      expect(data.success).toBe(true);
      expect(data.paymentGateway).toBeDefined();
      expect(data.paymentId).toBeDefined();
      expect(data.purchaseId).toBeDefined();
    });

    it("should reject payment for invalid plan", async () => {
      const response = await app.inject({
        method: "POST",
        url: "/api/payments/create",
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
        payload: {
          planType: "INVALID",
          currency: "USD",
          billingCycle: "monthly",
        },
      });

      expect(response.statusCode).toBe(400);
      const data = JSON.parse(response.body);
      expect(data.success).toBe(false);
    });

    it("should reject payment for unsupported currency", async () => {
      const response = await app.inject({
        method: "POST",
        url: "/api/payments/create",
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
        payload: {
          planType: "INTERMEDIATE",
          currency: "EUR", // Not supported
          billingCycle: "monthly",
        },
      });

      expect(response.statusCode).toBe(400);
      const data = JSON.parse(response.body);
      expect(data.success).toBe(false);
    });
  });

  describe("Payment Verification", () => {
    it("should verify payment successfully", async () => {
      // Create a payment first
      const createResponse = await app.inject({
        method: "POST",
        url: "/api/payments/create",
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
        payload: {
          planType: "INTERMEDIATE",
          currency: "USD",
          billingCycle: "monthly",
        },
      });

      const createData = JSON.parse(createResponse.body);
      const paymentId = createData.paymentId;

      // Wait for auto-completion (mock payments auto-complete after 2 seconds)
      await new Promise((resolve) => setTimeout(resolve, 2500));

      // Verify payment
      const verifyResponse = await app.inject({
        method: "POST",
        url: `/api/payments/callback/mock`,
        payload: {
          paymentId,
        },
      });

      expect(verifyResponse.statusCode).toBe(200);
      const verifyData = JSON.parse(verifyResponse.body);
      expect(verifyData.success).toBe(true);
    });

    it("should handle payment verification failure", async () => {
      const response = await app.inject({
        method: "POST",
        url: `/api/payments/callback/mock`,
        payload: {
          paymentId: "non-existent-payment-id",
        },
      });

      expect(response.statusCode).toBe(500);
      const data = JSON.parse(response.body);
      expect(data.success).toBe(false);
    });
  });

  describe("Webhook Processing", () => {
    it("should process payment completion webhook", async () => {
      // Create a payment
      const createResponse = await app.inject({
        method: "POST",
        url: "/api/payments/create",
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
        payload: {
          planType: "INTERMEDIATE",
          currency: "USD",
          billingCycle: "monthly",
        },
      });

      const createData = JSON.parse(createResponse.body);
      const paymentId = createData.paymentId;

      // Send completion webhook
      const webhookResponse = await app.inject({
        method: "POST",
        url: "/api/payments/webhooks/mock",
        payload: {
          id: paymentId,
          event: "payment.completed",
          data: {
            amount: 1999,
            currency: "USD",
            status: "completed",
          },
        },
      });

      expect(webhookResponse.statusCode).toBe(200);
      const webhookData = JSON.parse(webhookResponse.body);
      expect(webhookData.success).toBe(true);

      // Verify purchase was completed
      const purchase = await Purchase.findOne({ gatewayPaymentId: paymentId });
      expect(purchase?.status).toBe("completed");

      // Verify subscription was created
      const subscription = await Subscription.findOne({ userId: testUser._id });
      expect(subscription).toBeDefined();
      expect(subscription?.status).toBe("active");

      // Verify entitlements were updated
      const updatedUser = await User.findById(testUser._id);
      expect(updatedUser?.entitlements).toContain("INTERMEDIATE");
    });

    it("should process payment failure webhook", async () => {
      // Create a payment
      const createResponse = await app.inject({
        method: "POST",
        url: "/api/payments/create",
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
        payload: {
          planType: "INTERMEDIATE",
          currency: "USD",
          billingCycle: "monthly",
        },
      });

      const createData = JSON.parse(createResponse.body);
      const paymentId = createData.paymentId;

      // Send failure webhook
      const webhookResponse = await app.inject({
        method: "POST",
        url: "/api/payments/webhooks/mock",
        payload: {
          id: paymentId,
          event: "payment.failed",
          data: {
            amount: 1999,
            currency: "USD",
            status: "failed",
            error: "Insufficient funds",
          },
        },
      });

      expect(webhookResponse.statusCode).toBe(200);

      // Verify purchase was marked as failed
      const purchase = await Purchase.findOne({ gatewayPaymentId: paymentId });
      expect(purchase?.status).toBe("failed");
    });
  });

  describe("Subscription Management", () => {
    beforeEach(async () => {
      // Create a completed purchase and subscription
      const purchase = await Purchase.create({
        userId: testUser._id,
        planType: "INTERMEDIATE",
        gateway: "mock",
        amount: 1999,
        currency: "USD",
        billingCycle: "monthly",
        gatewayPaymentId: "test-payment-id",
        status: "completed",
        metadata: {
          testMode: true,
        },
      });

      await Subscription.create({
        userId: testUser._id,
        purchaseId: purchase._id,
        planType: "INTERMEDIATE",
        status: "active",
        billingCycle: "monthly",
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      });

      await entitlementService.updateUserEntitlements(testUser._id, "INTERMEDIATE");
    });

    it("should get user subscription", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/api/payments/subscription",
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      expect(response.statusCode).toBe(200);
      const data = JSON.parse(response.body);
      expect(data.success).toBe(true);
      expect(data.subscription).toBeDefined();
      expect(data.subscription.planType).toBe("INTERMEDIATE");
      expect(data.subscription.status).toBe("active");
    });

    it("should cancel subscription", async () => {
      const response = await app.inject({
        method: "POST",
        url: "/api/payments/subscription/cancel",
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
        payload: {
          reason: "user_request",
        },
      });

      expect(response.statusCode).toBe(200);
      const data = JSON.parse(response.body);
      expect(data.success).toBe(true);

      // Verify subscription was cancelled
      const subscription = await Subscription.findOne({ userId: testUser._id });
      expect(subscription?.status).toBe("cancelled");
    });

    it("should get purchase history", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/api/payments/history",
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      expect(response.statusCode).toBe(200);
      const data = JSON.parse(response.body);
      expect(data.success).toBe(true);
      expect(data.purchases).toBeDefined();
      expect(Array.isArray(data.purchases)).toBe(true);
    });
  });

  describe("Entitlement System", () => {
    it("should check user entitlements", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/api/entitlements/me/entitlements",
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      expect(response.statusCode).toBe(200);
      const data = JSON.parse(response.body);
      expect(data.success).toBe(true);
      expect(data.entitlements).toBeDefined();
      expect(data.entitlements.entitlements).toContain("JUNIOR");
    });

    it("should check specific entitlement", async () => {
      const response = await app.inject({
        method: "POST",
        url: "/api/entitlements/check",
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
        payload: {
          requiredEntitlement: "JUNIOR",
        },
      });

      expect(response.statusCode).toBe(200);
      const data = JSON.parse(response.body);
      expect(data.success).toBe(true);
      expect(data.hasAccess).toBe(true);
    });

    it("should deny access to higher tier content", async () => {
      const response = await app.inject({
        method: "POST",
        url: "/api/entitlements/check",
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
        payload: {
          requiredEntitlement: "SENIOR",
        },
      });

      expect(response.statusCode).toBe(200);
      const data = JSON.parse(response.body);
      expect(data.success).toBe(true);
      expect(data.hasAccess).toBe(false);
      expect(data.upgradeRequired).toBe("Senior");
    });

    it("should check content access", async () => {
      const response = await app.inject({
        method: "POST",
        url: "/api/entitlements/check-content",
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
        payload: {
          contentLevel: "JUNIOR",
        },
      });

      expect(response.statusCode).toBe(200);
      const data = JSON.parse(response.body);
      expect(data.success).toBe(true);
      expect(data.hasAccess).toBe(true);
    });
  });

  describe("Download System", () => {
    it("should generate signed download URL", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/api/downloads/generate/intro-guides/sample-guide.pdf",
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      expect(response.statusCode).toBe(200);
      const data = JSON.parse(response.body);
      expect(data.success).toBe(true);
      expect(data.downloadUrl).toBeDefined();
      expect(data.expiresAt).toBeDefined();
      expect(data.category).toBe("intro-guides");
      expect(data.requiredLevel).toBe("JUNIOR");
    });

    it("should deny access to restricted content", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/api/downloads/generate/senior-guides/advanced-guide.pdf",
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      expect(response.statusCode).toBe(403);
      const data = JSON.parse(response.body);
      expect(data.success).toBe(false);
      expect(data.upgradeRequired).toBeDefined();
    });

    it("should list available categories", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/api/downloads/categories",
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      expect(response.statusCode).toBe(200);
      const data = JSON.parse(response.body);
      expect(data.success).toBe(true);
      expect(data.categories).toBeDefined();
      expect(Array.isArray(data.categories)).toBe(true);
      expect(data.userLevel).toBe("JUNIOR");
    });
  });

  describe("Payment Gateway Status", () => {
    it("should get gateway status", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/api/payments/gateways/status",
      });

      expect(response.statusCode).toBe(200);
      const data = JSON.parse(response.body);
      expect(data.success).toBe(true);
      expect(data.gateways).toBeDefined();
      expect(data.gateways.paypal).toBeDefined();
      expect(data.gateways.aps).toBeDefined();
      expect(data.gateways.hyperpay).toBeDefined();
    });
  });

  describe("Currency Exchange", () => {
    it("should get currency rates", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/api/payments/currencies/rates",
      });

      expect(response.statusCode).toBe(200);
      const data = JSON.parse(response.body);
      expect(data.success).toBe(true);
      expect(data.supportedCurrencies).toBeDefined();
      expect(data.supportedCurrencies).toContain("USD");
      expect(data.supportedCurrencies).toContain("JOD");
      expect(data.supportedCurrencies).toContain("SAR");
    });
  });
});
