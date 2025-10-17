/**
 * Subscription Model Tests
 * Tests for Subscription model CRUD operations, status transitions, and billing logic
 */

import { describe, it, expect, beforeEach } from "vitest";
import { Subscription } from "../../models/Subscription";
import { User } from "../../models/User";
import { Purchase } from "../../models/Purchase";
import { Types } from "mongoose";

describe("Subscription Model", () => {
  let testUser: any;
  let testPurchase: any;

  beforeEach(async () => {
    await Subscription.deleteMany({});
    await Purchase.deleteMany({});
    await User.deleteMany({});

    // Create test user
    testUser = await User.create({
      email: "sub-test@example.com",
      name: "Subscription Test User",
      password: "Password123!",
    });

    // Create test purchase with all required fields
    testPurchase = await Purchase.create({
      userId: testUser._id,
      orderId: "order-test-123",
      paymentId: "pay-test-123",
      paymentGateway: "paypal",
      amount: {
        currency: "USD",
        value: "29.99",
      },
      status: "completed",
      items: [
        {
          type: "INTERMEDIATE",
          name: "Intermediate Plan - Monthly",
          price: {
            currency: "USD",
            value: "29.99",
          },
        },
      ],
      customer: {
        email: testUser.email,
        name: testUser.name,
      },
    });
  });

  describe("Subscription Creation", () => {
    it("should create subscription with required fields", async () => {
      const subData = {
        userId: testUser._id,
        purchaseId: testPurchase._id,
        planType: "INTERMEDIATE" as const,
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        billingCycle: "monthly" as const,
        price: {
          currency: "USD",
          amount: "29.99",
        },
        entitlements: ["JUNIOR", "INTERMEDIATE"],
      };

      const subscription = await Subscription.create(subData);

      expect(subscription.userId.toString()).toBe(testUser._id.toString());
      expect(subscription.planType).toBe("INTERMEDIATE");
      expect(subscription.status).toBe("pending"); // Default status
      expect(subscription.billingCycle).toBe("monthly");
      expect(subscription.cancelAtPeriodEnd).toBe(false); // Default
    });

    it("should fail without required userId", async () => {
      const subData = {
        purchaseId: testPurchase._id,
        planType: "INTERMEDIATE",
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        billingCycle: "monthly",
        price: { currency: "USD", amount: "29.99" },
        entitlements: ["INTERMEDIATE"],
      };

      await expect(Subscription.create(subData)).rejects.toThrow();
    });

    it("should fail without required purchaseId", async () => {
      const subData = {
        userId: testUser._id,
        planType: "INTERMEDIATE",
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        billingCycle: "monthly",
        price: { currency: "USD", amount: "29.99" },
        entitlements: ["INTERMEDIATE"],
      };

      await expect(Subscription.create(subData)).rejects.toThrow();
    });

    it("should set default values correctly", async () => {
      const subscription = await Subscription.create({
        userId: testUser._id,
        purchaseId: testPurchase._id,
        planType: "SENIOR",
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        billingCycle: "yearly",
        price: { currency: "USD", amount: "199.99" },
        entitlements: ["JUNIOR", "INTERMEDIATE", "SENIOR"],
      });

      expect(subscription.status).toBe("pending");
      expect(subscription.cancelAtPeriodEnd).toBe(false);
      expect(subscription.price.currency).toBe("USD");
    });
  });

  describe("Subscription Status", () => {
    it("should support active status", async () => {
      const subscription = await Subscription.create({
        userId: testUser._id,
        purchaseId: testPurchase._id,
        planType: "INTERMEDIATE",
        status: "active",
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        billingCycle: "monthly",
        price: { currency: "USD", amount: "29.99" },
        entitlements: ["INTERMEDIATE"],
      });

      expect(subscription.status).toBe("active");
    });

    it("should support cancelled status with reason", async () => {
      const subscription = await Subscription.create({
        userId: testUser._id,
        purchaseId: testPurchase._id,
        planType: "INTERMEDIATE",
        status: "cancelled",
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        billingCycle: "monthly",
        price: { currency: "USD", amount: "29.99" },
        entitlements: ["INTERMEDIATE"],
        cancelledAt: new Date(),
        cancelReason: "user_request",
      });

      expect(subscription.status).toBe("cancelled");
      expect(subscription.cancelReason).toBe("user_request");
      expect(subscription.cancelledAt).toBeDefined();
    });

    it("should support expired status", async () => {
      const subscription = await Subscription.create({
        userId: testUser._id,
        purchaseId: testPurchase._id,
        planType: "SENIOR",
        status: "expired",
        currentPeriodStart: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
        currentPeriodEnd: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        billingCycle: "monthly",
        price: { currency: "USD", amount: "49.99" },
        entitlements: ["SENIOR"],
      });

      expect(subscription.status).toBe("expired");
    });
  });

  describe("Billing Cycles", () => {
    it("should support monthly billing", async () => {
      const subscription = await Subscription.create({
        userId: testUser._id,
        purchaseId: testPurchase._id,
        planType: "INTERMEDIATE",
        status: "active",
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        billingCycle: "monthly",
        price: { currency: "USD", amount: "29.99" },
        entitlements: ["INTERMEDIATE"],
      });

      expect(subscription.billingCycle).toBe("monthly");
    });

    it("should support yearly billing with discount", async () => {
      const subscription = await Subscription.create({
        userId: testUser._id,
        purchaseId: testPurchase._id,
        planType: "SENIOR",
        status: "active",
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        billingCycle: "yearly",
        price: { currency: "USD", amount: "199.99" },
        entitlements: ["SENIOR"],
      });

      expect(subscription.billingCycle).toBe("yearly");
    });
  });

  describe("Plan Types", () => {
    it("should support INTERMEDIATE plan", async () => {
      const subscription = await Subscription.create({
        userId: testUser._id,
        purchaseId: testPurchase._id,
        planType: "INTERMEDIATE",
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        billingCycle: "monthly",
        price: { currency: "USD", amount: "29.99" },
        entitlements: ["JUNIOR", "INTERMEDIATE"],
      });

      expect(subscription.planType).toBe("INTERMEDIATE");
      expect(subscription.entitlements).toContain("INTERMEDIATE");
    });

    it("should support SENIOR plan", async () => {
      const subscription = await Subscription.create({
        userId: testUser._id,
        purchaseId: testPurchase._id,
        planType: "SENIOR",
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        billingCycle: "monthly",
        price: { currency: "USD", amount: "49.99" },
        entitlements: ["JUNIOR", "INTERMEDIATE", "SENIOR"],
      });

      expect(subscription.planType).toBe("SENIOR");
      expect(subscription.entitlements).toContain("SENIOR");
    });

    it("should support BUNDLE plan", async () => {
      const subscription = await Subscription.create({
        userId: testUser._id,
        purchaseId: testPurchase._id,
        planType: "BUNDLE",
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        billingCycle: "monthly",
        price: { currency: "USD", amount: "79.99" },
        entitlements: ["JUNIOR", "INTERMEDIATE", "SENIOR", "BUNDLE"],
      });

      expect(subscription.planType).toBe("BUNDLE");
      expect(subscription.entitlements).toContain("BUNDLE");
    });
  });

  describe("Trial Periods", () => {
    it("should support trial subscriptions", async () => {
      const trialStart = new Date();
      const trialEnd = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

      const subscription = await Subscription.create({
        userId: testUser._id,
        purchaseId: testPurchase._id,
        planType: "INTERMEDIATE",
        status: "active",
        currentPeriodStart: trialStart,
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        billingCycle: "monthly",
        price: { currency: "USD", amount: "29.99" },
        entitlements: ["INTERMEDIATE"],
        trialStart,
        trialEnd,
      });

      expect(subscription.trialStart).toBeDefined();
      expect(subscription.trialEnd).toBeDefined();
    });
  });

  describe("Currency Support", () => {
    it("should support USD currency", async () => {
      const subscription = await Subscription.create({
        userId: testUser._id,
        purchaseId: testPurchase._id,
        planType: "INTERMEDIATE",
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        billingCycle: "monthly",
        price: { currency: "USD", amount: "29.99" },
        entitlements: ["INTERMEDIATE"],
      });

      expect(subscription.price.currency).toBe("USD");
    });

    it("should support JOD currency", async () => {
      const subscription = await Subscription.create({
        userId: testUser._id,
        purchaseId: testPurchase._id,
        planType: "INTERMEDIATE",
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        billingCycle: "monthly",
        price: { currency: "JOD", amount: "21.25" },
        entitlements: ["INTERMEDIATE"],
      });

      expect(subscription.price.currency).toBe("JOD");
    });

    it("should support SAR currency", async () => {
      const subscription = await Subscription.create({
        userId: testUser._id,
        purchaseId: testPurchase._id,
        planType: "INTERMEDIATE",
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        billingCycle: "monthly",
        price: { currency: "SAR", amount: "112.47" },
        entitlements: ["INTERMEDIATE"],
      });

      expect(subscription.price.currency).toBe("SAR");
    });
  });

  describe("Subscription Updates", () => {
    it("should update subscription status", async () => {
      const subscription = await Subscription.create({
        userId: testUser._id,
        purchaseId: testPurchase._id,
        planType: "INTERMEDIATE",
        status: "pending",
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        billingCycle: "monthly",
        price: { currency: "USD", amount: "29.99" },
        entitlements: ["INTERMEDIATE"],
      });

      subscription.status = "active";
      await subscription.save();

      const updated = await Subscription.findById(subscription._id);
      expect(updated?.status).toBe("active");
    });

    it("should mark for cancellation at period end", async () => {
      const subscription = await Subscription.create({
        userId: testUser._id,
        purchaseId: testPurchase._id,
        planType: "INTERMEDIATE",
        status: "active",
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        billingCycle: "monthly",
        price: { currency: "USD", amount: "29.99" },
        entitlements: ["INTERMEDIATE"],
      });

      subscription.cancelAtPeriodEnd = true;
      subscription.cancelledAt = new Date();
      subscription.cancelReason = "user_request";
      await subscription.save();

      const updated = await Subscription.findById(subscription._id);
      expect(updated?.cancelAtPeriodEnd).toBe(true);
      expect(updated?.cancelReason).toBe("user_request");
    });

    it("should update period dates on renewal", async () => {
      const subscription = await Subscription.create({
        userId: testUser._id,
        purchaseId: testPurchase._id,
        planType: "INTERMEDIATE",
        status: "active",
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        billingCycle: "monthly",
        price: { currency: "USD", amount: "29.99" },
        entitlements: ["INTERMEDIATE"],
      });

      const newStart = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      const newEnd = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000);

      subscription.currentPeriodStart = newStart;
      subscription.currentPeriodEnd = newEnd;
      await subscription.save();

      const updated = await Subscription.findById(subscription._id);
      expect(updated?.currentPeriodStart.getTime()).toBe(newStart.getTime());
      expect(updated?.currentPeriodEnd.getTime()).toBe(newEnd.getTime());
    });
  });

  describe("Subscription Queries", () => {
    beforeEach(async () => {
      // Create separate purchases for each subscription
      const purchase1 = await Purchase.create({
        userId: testUser._id,
        orderId: "order-query-1",
        paymentId: "pay-query-1",
        paymentGateway: "paypal",
        amount: { currency: "USD", value: "29.99" },
        status: "completed",
        items: [{ type: "INTERMEDIATE", name: "Intermediate Monthly", price: { currency: "USD", value: "29.99" } }],
        customer: { email: testUser.email, name: testUser.name },
      });

      const purchase2 = await Purchase.create({
        userId: testUser._id,
        orderId: "order-query-2",
        paymentId: "pay-query-2",
        paymentGateway: "paypal",
        amount: { currency: "USD", value: "49.99" },
        status: "completed",
        items: [{ type: "SENIOR", name: "Senior Monthly", price: { currency: "USD", value: "49.99" } }],
        customer: { email: testUser.email, name: testUser.name },
      });

      await Subscription.create([
        {
          userId: testUser._id,
          purchaseId: purchase1._id,
          planType: "INTERMEDIATE",
          status: "active",
          currentPeriodStart: new Date(),
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          billingCycle: "monthly",
          price: { currency: "USD", amount: "29.99" },
          entitlements: ["INTERMEDIATE"],
        },
        {
          userId: testUser._id,
          purchaseId: purchase2._id,
          planType: "SENIOR",
          status: "cancelled",
          currentPeriodStart: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
          currentPeriodEnd: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          billingCycle: "monthly",
          price: { currency: "USD", amount: "49.99" },
          entitlements: ["SENIOR"],
        },
      ]);
    });

    it("should find subscriptions by userId", async () => {
      const subscriptions = await Subscription.find({ userId: testUser._id });
      expect(subscriptions).toHaveLength(2);
    });

    it("should find active subscriptions only", async () => {
      const activeSubscriptions = await Subscription.find({ status: "active" });
      expect(activeSubscriptions).toHaveLength(1);
      expect(activeSubscriptions[0].status).toBe("active");
    });

    it("should find subscriptions by plan type", async () => {
      const intermediateSubs = await Subscription.find({ planType: "INTERMEDIATE" });
      expect(intermediateSubs).toHaveLength(1);
    });

    it("should find subscriptions by billing cycle", async () => {
      const monthlySubs = await Subscription.find({ billingCycle: "monthly" });
      expect(monthlySubs).toHaveLength(2);
    });
  });

  describe("Entitlements", () => {
    it("should store multiple entitlements", async () => {
      const subscription = await Subscription.create({
        userId: testUser._id,
        purchaseId: testPurchase._id,
        planType: "BUNDLE",
        status: "active",
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        billingCycle: "monthly",
        price: { currency: "USD", amount: "79.99" },
        entitlements: ["JUNIOR", "INTERMEDIATE", "SENIOR", "BUNDLE"],
      });

      expect(subscription.entitlements).toHaveLength(4);
      expect(subscription.entitlements).toContain("JUNIOR");
      expect(subscription.entitlements).toContain("BUNDLE");
    });
  });

  describe("Metadata", () => {
    it("should store optional metadata", async () => {
      const subscription = await Subscription.create({
        userId: testUser._id,
        purchaseId: testPurchase._id,
        planType: "INTERMEDIATE",
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        billingCycle: "monthly",
        price: { currency: "SAR", amount: "112.47" },
        entitlements: ["INTERMEDIATE"],
        metadata: {
          originalPurchaseCurrency: "USD",
          fxRateUsed: 3.75,
          promotionCode: "SAVE20",
          affiliateId: "aff-123",
        },
      });

      expect(subscription.metadata?.originalPurchaseCurrency).toBe("USD");
      expect(subscription.metadata?.fxRateUsed).toBe(3.75);
      expect(subscription.metadata?.promotionCode).toBe("SAVE20");
    });
  });

  describe("Subscription Deletion", () => {
    it("should delete subscription", async () => {
      const subscription = await Subscription.create({
        userId: testUser._id,
        purchaseId: testPurchase._id,
        planType: "INTERMEDIATE",
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        billingCycle: "monthly",
        price: { currency: "USD", amount: "29.99" },
        entitlements: ["INTERMEDIATE"],
      });

      await Subscription.deleteOne({ _id: subscription._id });
      const deleted = await Subscription.findById(subscription._id);
      expect(deleted).toBeNull();
    });
  });
});

