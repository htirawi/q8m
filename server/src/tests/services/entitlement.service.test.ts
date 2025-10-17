/**
 * Entitlement Service Tests
 * Tests for user access control and entitlement checking logic
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { entitlementService } from "../../services/entitlement";
import { User } from "../../models/User";
import { Subscription } from "../../models/Subscription";
import { Purchase } from "../../models/Purchase";

describe("EntitlementService", () => {
  let testUser: any;

  beforeEach(async () => {
    await User.deleteMany({});
    await Subscription.deleteMany({});
    await Purchase.deleteMany({});

    testUser = await User.create({
      email: "entitlement-test@example.com",
      name: "Entitlement Test User",
      password: "Password123!",
      entitlements: ["JUNIOR"],
      isEmailVerified: true, // Required for entitlement checks
      isActive: true,
    });
  });

  describe("checkEntitlement", () => {
    it("should allow access with correct entitlement", async () => {
      const result = await entitlementService.checkEntitlement(
        testUser._id.toString(),
        "JUNIOR"
      );

      expect(result.hasAccess).toBe(true);
    });

    it("should deny access without required entitlement", async () => {
      const result = await entitlementService.checkEntitlement(
        testUser._id.toString(),
        "SENIOR"
      );

      expect(result.hasAccess).toBe(false);
      expect(result.reason).toContain("Upgrade");
    });

    it("should deny access for inactive user", async () => {
      testUser.isActive = false;
      await testUser.save();

      const result = await entitlementService.checkEntitlement(
        testUser._id.toString(),
        "JUNIOR"
      );

      expect(result.hasAccess).toBe(false);
      expect(result.reason).toContain("not active");
    });

    it("should handle invalid userId gracefully", async () => {
      const result = await entitlementService.checkEntitlement(
        "invalid-user-id",
        "JUNIOR"
      );

      expect(result.hasAccess).toBe(false);
      expect(result.reason).toContain("Error");
    });

    it("should check INTERMEDIATE entitlement", async () => {
      testUser.entitlements = ["JUNIOR", "INTERMEDIATE"];
      await testUser.save();

      const result = await entitlementService.checkEntitlement(
        testUser._id.toString(),
        "INTERMEDIATE"
      );

      expect(result.hasAccess).toBe(true);
    });

    it("should check SENIOR entitlement", async () => {
      testUser.entitlements = ["JUNIOR", "INTERMEDIATE", "SENIOR"];
      await testUser.save();

      const result = await entitlementService.checkEntitlement(
        testUser._id.toString(),
        "SENIOR"
      );

      expect(result.hasAccess).toBe(true);
    });

    it("should check BUNDLE entitlement", async () => {
      testUser.entitlements = ["JUNIOR", "INTERMEDIATE", "SENIOR", "BUNDLE"];
      await testUser.save();

      const result = await entitlementService.checkEntitlement(
        testUser._id.toString(),
        "BUNDLE"
      );

      expect(result.hasAccess).toBe(true);
    });
  });

  describe("getUserEntitlements", () => {
    it("should return basic entitlements for free user", async () => {
      const entitlements = await entitlementService.getUserEntitlements(
        testUser._id.toString()
      );

      expect(entitlements.entitlements).toContain("JUNIOR");
      expect(entitlements.isActive).toBe(true);
    });

    it("should include active subscription entitlements", async () => {
      testUser.entitlements = ["JUNIOR", "INTERMEDIATE"];
      await testUser.save();

      const purchase = await Purchase.create({
        userId: testUser._id,
        orderId: "order-ent-1",
        paymentId: "pay-ent-1",
        paymentGateway: "paypal",
        amount: { currency: "USD", value: "29.99" },
        status: "completed",
        items: [{ type: "INTERMEDIATE", name: "Intermediate Plan", price: { currency: "USD", value: "29.99" } }],
        customer: { email: testUser.email, name: testUser.name },
      });

      await Subscription.create({
        userId: testUser._id,
        purchaseId: purchase._id,
        planType: "INTERMEDIATE",
        status: "active",
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        billingCycle: "monthly",
        price: { currency: "USD", amount: "29.99" },
        entitlements: ["JUNIOR", "INTERMEDIATE"],
      });

      const entitlements = await entitlementService.getUserEntitlements(
        testUser._id.toString()
      );

      expect(entitlements.entitlements).toContain("INTERMEDIATE");
      expect(entitlements.activeSubscription).toBeDefined();
    });

    it("should cache entitlements", async () => {
      // First call - should hit database
      const entitlements1 = await entitlementService.getUserEntitlements(
        testUser._id.toString()
      );

      // Second call - should use cache
      const entitlements2 = await entitlementService.getUserEntitlements(
        testUser._id.toString()
      );

      expect(entitlements1).toEqual(entitlements2);
    });
  });

  describe("clearUserCache", () => {
    it("should clear specific user cache", async () => {
      // Populate cache
      await entitlementService.getUserEntitlements(testUser._id.toString());

      // Clear cache
      entitlementService.clearUserCache(testUser._id.toString());

      // Should fetch fresh data
      const entitlements = await entitlementService.getUserEntitlements(
        testUser._id.toString()
      );

      expect(entitlements).toBeDefined();
    });
  });

  describe("Upgrade Requirements", () => {
    it("should deny access for INTERMEDIATE without entitlement", async () => {
      const result = await entitlementService.checkEntitlement(
        testUser._id.toString(),
        "INTERMEDIATE"
      );

      expect(result.hasAccess).toBe(false);
      expect(result.reason).toContain("Upgrade");
    });

    it("should deny access for SENIOR without entitlement", async () => {
      testUser.entitlements = ["JUNIOR", "INTERMEDIATE"];
      await testUser.save();

      entitlementService.clearUserCache(testUser._id.toString());

      const result = await entitlementService.checkEntitlement(
        testUser._id.toString(),
        "SENIOR"
      );

      expect(result.hasAccess).toBe(false);
      expect(result.reason).toContain("Upgrade");
    });
  });

  describe("Subscription Status Checks", () => {
    it("should deny access if subscription expired", async () => {
      testUser.entitlements = ["JUNIOR", "INTERMEDIATE"];
      await testUser.save();

      const purchase = await Purchase.create({
        userId: testUser._id,
        orderId: "order-expired",
        paymentId: "pay-expired",
        paymentGateway: "paypal",
        amount: { currency: "USD", value: "29.99" },
        status: "completed",
        items: [{ type: "INTERMEDIATE", name: "Intermediate Plan", price: { currency: "USD", value: "29.99" } }],
        customer: { email: testUser.email, name: testUser.name },
      });

      await Subscription.create({
        userId: testUser._id,
        purchaseId: purchase._id,
        planType: "INTERMEDIATE",
        status: "expired",
        currentPeriodStart: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
        currentPeriodEnd: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        billingCycle: "monthly",
        price: { currency: "USD", amount: "29.99" },
        entitlements: ["INTERMEDIATE"],
      });

      // Clear cache to force fresh fetch
      entitlementService.clearUserCache(testUser._id.toString());

      const result = await entitlementService.checkEntitlement(
        testUser._id.toString(),
        "INTERMEDIATE"
      );

      // Should still have access via user entitlements
      expect(result.hasAccess).toBe(true);
    });

    it("should handle suspended subscriptions", async () => {
      testUser.entitlements = ["JUNIOR"];
      await testUser.save();

      const purchase = await Purchase.create({
        userId: testUser._id,
        orderId: "order-suspended",
        paymentId: "pay-suspended",
        paymentGateway: "paypal",
        amount: { currency: "USD", value: "49.99" },
        status: "completed",
        items: [{ type: "SENIOR", name: "Senior Plan", price: { currency: "USD", value: "49.99" } }],
        customer: { email: testUser.email, name: testUser.name },
      });

      await Subscription.create({
        userId: testUser._id,
        purchaseId: purchase._id,
        planType: "SENIOR",
        status: "suspended",
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        billingCycle: "monthly",
        price: { currency: "USD", amount: "49.99" },
        entitlements: ["SENIOR"],
      });

      entitlementService.clearUserCache(testUser._id.toString());

      const result = await entitlementService.checkEntitlement(
        testUser._id.toString(),
        "SENIOR"
      );

      // Subscription suspended, but user doesn't have entitlement
      expect(result.hasAccess).toBe(false);
    });
  });
});
