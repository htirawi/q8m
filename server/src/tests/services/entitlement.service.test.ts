/**
 * Entitlement Service Tests
 * Comprehensive tests for user entitlement checking and access control
 */

import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { Types } from "mongoose";
import { EntitlementService } from "../../services/entitlement.service.js";
import { User } from "../../models/User.js";
import { Subscription } from "../../models/Subscription.js";

// Mock the models
vi.mock("../../models/User.js", () => ({
  User: {
    findById: vi.fn(),
  },
}));

vi.mock("../../models/Subscription.js", () => ({
  Subscription: {
    findOne: vi.fn(),
  },
}));

describe("EntitlementService", () => {
  let entitlementService: EntitlementService;
  let mockUser: any;
  let mockSubscription: any;
  const testUserId = new Types.ObjectId().toString();

  beforeEach(() => {
    entitlementService = EntitlementService.getInstance();

    // Reset mocks
    vi.clearAllMocks();

    // Clear cache
    (entitlementService as any).cache.clear();

    // Mock user data
    mockUser = {
      _id: testUserId,
      email: "test@example.com",
      isActive: true,
      isEmailVerified: true,
      entitlements: ["JUNIOR"],
      subscriptions: [],
    };

    // Mock subscription data
    mockSubscription = {
      _id: new Types.ObjectId(),
      userId: testUserId,
      planId: "intermediate",
      status: "active",
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      cancelAtPeriodEnd: false,
    };
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("getInstance", () => {
    it("should return the same instance (singleton)", () => {
      const instance1 = EntitlementService.getInstance();
      const instance2 = EntitlementService.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe("getUserEntitlements", () => {
    it("should return user entitlements for active user", async () => {
      vi.mocked(User.findById).mockResolvedValue(mockUser);
      vi.mocked(Subscription.findOne).mockResolvedValue(mockSubscription);

      const result = await entitlementService.getUserEntitlements(testUserId);

      expect(result).toMatchObject({
        isActive: true,
        entitlements: ["JUNIOR"],
        hasActiveSubscription: true,
        activeSubscription: expect.objectContaining({
          status: "active",
          planId: "intermediate",
        }),
      });
    });

    it("should return inactive status for inactive user", async () => {
      const inactiveUser = { ...mockUser, isActive: false };
      vi.mocked(User.findById).mockResolvedValue(inactiveUser);
      vi.mocked(Subscription.findOne).mockResolvedValue(null);

      const result = await entitlementService.getUserEntitlements(testUserId);

      expect(result).toMatchObject({
        isActive: false,
        entitlements: ["JUNIOR"],
        hasActiveSubscription: false,
        activeSubscription: null,
      });
    });

    it("should return null subscription for user without subscription", async () => {
      vi.mocked(User.findById).mockResolvedValue(mockUser);
      vi.mocked(Subscription.findOne).mockResolvedValue(null);

      const result = await entitlementService.getUserEntitlements(testUserId);

      expect(result).toMatchObject({
        isActive: true,
        entitlements: ["JUNIOR"],
        hasActiveSubscription: false,
        activeSubscription: null,
      });
    });

    it("should return null for non-existent user", async () => {
      vi.mocked(User.findById).mockResolvedValue(null);
      vi.mocked(Subscription.findOne).mockResolvedValue(null);

      const result = await entitlementService.getUserEntitlements(testUserId);

      expect(result).toBeNull();
    });

    it("should use cache for repeated calls", async () => {
      vi.mocked(User.findById).mockResolvedValue(mockUser);
      vi.mocked(Subscription.findOne).mockResolvedValue(mockSubscription);

      // First call
      await entitlementService.getUserEntitlements(testUserId);

      // Second call should use cache
      await entitlementService.getUserEntitlements(testUserId);

      // User.findById should only be called once due to caching
      expect(vi.mocked(User.findById)).toHaveBeenCalledTimes(1);
    });
  });

  describe("checkEntitlement", () => {
    beforeEach(() => {
      vi.mocked(User.findById).mockResolvedValue(mockUser);
      vi.mocked(Subscription.findOne).mockResolvedValue(mockSubscription);
    });

    it("should grant access when user has required entitlement", async () => {
      const result = await entitlementService.checkEntitlement(testUserId, "JUNIOR");

      expect(result).toEqual({ hasAccess: true });
    });

    it("should deny access when user lacks required entitlement", async () => {
      const result = await entitlementService.checkEntitlement(testUserId, "SENIOR");

      expect(result).toMatchObject({
        hasAccess: false,
        reason: expect.stringContaining("Upgrade to"),
        upgradeRequired: expect.any(String),
      });
    });

    it("should deny access for inactive user", async () => {
      const inactiveUser = { ...mockUser, isActive: false };
      vi.mocked(User.findById).mockResolvedValue(inactiveUser);

      const result = await entitlementService.checkEntitlement(testUserId, "JUNIOR");

      expect(result).toMatchObject({
        hasAccess: false,
        reason: "User account is not active",
      });
    });

    it("should handle expired subscription", async () => {
      const expiredSubscription = {
        ...mockSubscription,
        status: "canceled",
      };
      vi.mocked(Subscription.findOne).mockResolvedValue(expiredSubscription);

      const result = await entitlementService.checkEntitlement(testUserId, "INTERMEDIATE");

      expect(result).toMatchObject({
        hasAccess: false,
        reason: "Subscription is not active",
        subscriptionExpired: true,
      });
    });

    it("should handle trial users", async () => {
      const trialSubscription = {
        ...mockSubscription,
        status: "trialing",
        trialEnd: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      };
      vi.mocked(Subscription.findOne).mockResolvedValue(trialSubscription);

      const result = await entitlementService.checkEntitlement(testUserId, "INTERMEDIATE");

      expect(result).toMatchObject({
        hasAccess: false,
        reason: expect.stringContaining("trial"),
        trialExpired: false,
      });
    });
  });

  describe("checkContentAccess", () => {
    beforeEach(() => {
      vi.mocked(User.findById).mockResolvedValue(mockUser);
      vi.mocked(Subscription.findOne).mockResolvedValue(mockSubscription);
    });

    it("should grant access to JUNIOR content for JUNIOR user", async () => {
      const result = await entitlementService.checkContentAccess(testUserId, "JUNIOR");

      expect(result).toEqual({ hasAccess: true });
    });

    it("should deny access to INTERMEDIATE content for JUNIOR user", async () => {
      const result = await entitlementService.checkContentAccess(testUserId, "INTERMEDIATE");

      expect(result).toMatchObject({
        hasAccess: false,
        reason: expect.stringContaining("Upgrade to"),
        upgradeRequired: expect.any(String),
      });
    });

    it("should grant access to all levels for BUNDLE user", async () => {
      const bundleUser = { ...mockUser, entitlements: ["BUNDLE"] };
      vi.mocked(User.findById).mockResolvedValue(bundleUser);

      const levels = ["JUNIOR", "INTERMEDIATE", "SENIOR", "BUNDLE"];

      for (const level of levels) {
        const result = await entitlementService.checkContentAccess(testUserId, level);
        expect(result).toEqual({ hasAccess: true });
      }
    });
  });

  describe("getEntitlementHierarchy", () => {
    it("should return correct hierarchy", () => {
      const hierarchy = entitlementService.getEntitlementHierarchy();

      expect(hierarchy).toEqual({
        BUNDLE: ["JUNIOR", "INTERMEDIATE", "SENIOR", "BUNDLE"],
        SENIOR: ["JUNIOR", "INTERMEDIATE", "SENIOR"],
        INTERMEDIATE: ["JUNIOR", "INTERMEDIATE"],
        JUNIOR: ["JUNIOR"],
      });
    });
  });

  describe("getHighestUserLevel", () => {
    it("should return highest level from entitlements", () => {
      const userWithMultipleLevels = { ...mockUser, entitlements: ["JUNIOR", "INTERMEDIATE"] };
      vi.mocked(User.findById).mockResolvedValue(userWithMultipleLevels);

      // Access private method through any cast for testing
      const result = (entitlementService as any).getHighestUserLevel(["JUNIOR", "INTERMEDIATE"]);
      expect(result).toBe("INTERMEDIATE");
    });

    it("should return BUNDLE as highest level", () => {
      const result = (entitlementService as any).getHighestUserLevel(["BUNDLE"]);
      expect(result).toBe("BUNDLE");
    });

    it("should return null for invalid entitlements", () => {
      const result = (entitlementService as any).getHighestUserLevel(["INVALID"]);
      expect(result).toBeNull();
    });
  });

  describe("cache management", () => {
    it("should cache results and respect TTL", async () => {
      vi.mocked(User.findById).mockResolvedValue(mockUser);
      vi.mocked(Subscription.findOne).mockResolvedValue(mockSubscription);

      // First call
      await entitlementService.getUserEntitlements(testUserId);

      // Verify cache is populated
      const cache = (entitlementService as any).cache;
      expect(cache.has(testUserId)).toBe(true);

      // Second call should use cache
      await entitlementService.getUserEntitlements(testUserId);
      expect(vi.mocked(User.findById)).toHaveBeenCalledTimes(1);
    });

    it("should invalidate expired cache entries", async () => {
      vi.mocked(User.findById).mockResolvedValue(mockUser);
      vi.mocked(Subscription.findOne).mockResolvedValue(mockSubscription);

      // Set cache with expired TTL
      const cache = (entitlementService as any).cache;
      cache.set(testUserId, {
        data: {
          isActive: true,
          entitlements: ["JUNIOR"],
          hasActiveSubscription: false,
          activeSubscription: null,
        },
        expires: Date.now() - 1000, // Expired 1 second ago
      });

      // Call should bypass cache and fetch fresh data
      await entitlementService.getUserEntitlements(testUserId);
      expect(vi.mocked(User.findById)).toHaveBeenCalledTimes(1);
    });
  });

  describe("error handling", () => {
    it("should handle database errors gracefully", async () => {
      vi.mocked(User.findById).mockRejectedValue(new Error("Database connection failed"));

      await expect(entitlementService.getUserEntitlements(testUserId)).rejects.toThrow(
        "Database connection failed"
      );
    });

    it("should handle subscription query errors", async () => {
      vi.mocked(User.findById).mockResolvedValue(mockUser);
      vi.mocked(Subscription.findOne).mockRejectedValue(new Error("Subscription query failed"));

      await expect(entitlementService.getUserEntitlements(testUserId)).rejects.toThrow(
        "Subscription query failed"
      );
    });
  });
});
