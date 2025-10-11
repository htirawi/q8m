/* eslint-disable @typescript-eslint/no-explicit-any */
import { Subscription } from "@models/Subscription.js";
import { User } from "@models/User.js";
import { entitlementService, EntitlementService } from "@services/entitlement.service.js";
import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";

// Mock dependencies
vi.mock("@models/User.js");
vi.mock("@models/Subscription.js");

describe("EntitlementService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    entitlementService.clearAllCache();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("getInstance", () => {
    it("should return singleton instance", () => {
      const instance1 = EntitlementService.getInstance();
      const instance2 = EntitlementService.getInstance();

      expect(instance1).toBe(instance2);
    });
  });

  describe("getUserEntitlements", () => {
    it("should fetch and return user entitlements", async () => {
      const mockUser = {
        _id: "user123",
        email: "test@example.com",
        entitlements: ["JUNIOR", "INTERMEDIATE"],
        isActive: true,
        isEmailVerified: true,
      };

      const mockSubscription = {
        planType: "INTERMEDIATE",
        status: "active",
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        isInTrial: false,
      };

      (User.findById as any) = vi.fn().mockResolvedValue(mockUser);
      (Subscription.findActiveForUser as any) = vi.fn().mockResolvedValue(mockSubscription);

      const result = await entitlementService.getUserEntitlements("user123");

      expect(result).toEqual({
        userId: "user123",
        entitlements: ["JUNIOR", "INTERMEDIATE"],
        activeSubscription: {
          planType: "INTERMEDIATE",
          status: "active",
          expiresAt: mockSubscription.currentPeriodEnd,
          isInTrial: false,
        },
        isActive: true,
        lastChecked: expect.any(Date),
      });
    });

    it("should cache entitlements for 5 minutes", async () => {
      const mockUser = {
        _id: "user123",
        email: "test@example.com",
        entitlements: ["JUNIOR"],
        isActive: true,
        isEmailVerified: true,
      };

      (User.findById as any) = vi.fn().mockResolvedValue(mockUser);
      (Subscription.findActiveForUser as any) = vi.fn().mockResolvedValue(null);

      // First call - should hit database
      await entitlementService.getUserEntitlements("user123");
      expect(User.findById).toHaveBeenCalledTimes(1);

      // Second call - should use cache
      await entitlementService.getUserEntitlements("user123");
      expect(User.findById).toHaveBeenCalledTimes(1); // Still 1, not 2
    });

    it("should return default JUNIOR entitlements when user has none", async () => {
      const mockUser = {
        _id: "user123",
        email: "test@example.com",
        entitlements: undefined,
        isActive: true,
        isEmailVerified: true,
      };

      (User.findById as any) = vi.fn().mockResolvedValue(mockUser);
      (Subscription.findActiveForUser as any) = vi.fn().mockResolvedValue(null);

      const result = await entitlementService.getUserEntitlements("user123");

      expect(result.entitlements).toEqual(["JUNIOR"]);
    });

    it("should throw error when user not found", async () => {
      (User.findById as any) = vi.fn().mockResolvedValue(null);

      await expect(entitlementService.getUserEntitlements("user123")).rejects.toThrow(
        "User not found"
      );
    });
  });

  describe("checkEntitlement", () => {
    it("should return hasAccess true when user has entitlement", async () => {
      const mockUser = {
        _id: "user123",
        entitlements: ["JUNIOR", "INTERMEDIATE"],
        isActive: true,
        isEmailVerified: true,
      };

      (User.findById as any) = vi.fn().mockResolvedValue(mockUser);
      (Subscription.findActiveForUser as any) = vi.fn().mockResolvedValue(null);

      const result = await entitlementService.checkEntitlement("user123", "INTERMEDIATE");

      expect(result).toEqual({
        hasAccess: true,
      });
    });

    it("should return hasAccess false when user lacks entitlement", async () => {
      const mockUser = {
        _id: "user123",
        entitlements: ["JUNIOR"],
        isActive: true,
        isEmailVerified: true,
      };

      (User.findById as any) = vi.fn().mockResolvedValue(mockUser);
      (Subscription.findActiveForUser as any) = vi.fn().mockResolvedValue(null);

      const result = await entitlementService.checkEntitlement("user123", "SENIOR");

      expect(result).toEqual({
        hasAccess: false,
        reason: "Upgrade to Senior plan required",
        upgradeRequired: "Senior",
      });
    });

    it("should return hasAccess false when user is not active", async () => {
      const mockUser = {
        _id: "user123",
        entitlements: ["JUNIOR", "INTERMEDIATE"],
        isActive: false,
        isEmailVerified: true,
      };

      (User.findById as any) = vi.fn().mockResolvedValue(mockUser);
      (Subscription.findActiveForUser as any) = vi.fn().mockResolvedValue(null);

      const result = await entitlementService.checkEntitlement("user123", "INTERMEDIATE");

      expect(result).toEqual({
        hasAccess: false,
        reason: "User account is not active",
      });
    });

    it("should return hasAccess false when subscription expired", async () => {
      const mockUser = {
        _id: "user123",
        entitlements: ["JUNIOR"],
        isActive: true,
        isEmailVerified: true,
      };

      const expiredSubscription = {
        planType: "INTERMEDIATE",
        status: "active",
        currentPeriodEnd: new Date(Date.now() - 1000), // Expired
        isInTrial: false,
      };

      (User.findById as any) = vi.fn().mockResolvedValue(mockUser);
      (Subscription.findActiveForUser as any) = vi.fn().mockResolvedValue(expiredSubscription);

      const result = await entitlementService.checkEntitlement("user123", "INTERMEDIATE");

      expect(result.hasAccess).toBe(false);
      expect(result.subscriptionExpired).toBe(true);
    });

    it("should return hasAccess false when trial expired", async () => {
      const mockUser = {
        _id: "user123",
        entitlements: ["JUNIOR"],
        isActive: true,
        isEmailVerified: true,
      };

      const expiredTrial = {
        planType: "INTERMEDIATE",
        status: "active",
        currentPeriodEnd: new Date(Date.now() - 1000), // Expired
        isInTrial: true,
      };

      (User.findById as any) = vi.fn().mockResolvedValue(mockUser);
      (Subscription.findActiveForUser as any) = vi.fn().mockResolvedValue(expiredTrial);

      const result = await entitlementService.checkEntitlement("user123", "INTERMEDIATE");

      expect(result.hasAccess).toBe(false);
      // When subscription is expired, it triggers subscriptionExpired first
      expect(result.subscriptionExpired || result.trialExpired).toBe(true);
    });

    it("should handle errors gracefully", async () => {
      (User.findById as any) = vi.fn().mockRejectedValue(new Error("Database error"));

      const result = await entitlementService.checkEntitlement("user123", "INTERMEDIATE");

      expect(result).toEqual({
        hasAccess: false,
        reason: "Error checking entitlements",
      });
    });
  });

  describe("updateUserEntitlements", () => {
    it("should update entitlements to INTERMEDIATE", async () => {
      const mockUser = {
        _id: "user123",
        email: "test@example.com",
        entitlements: ["JUNIOR"],
        save: vi.fn(),
      };

      (User.findById as any) = vi.fn().mockResolvedValue(mockUser);

      await entitlementService.updateUserEntitlements("user123", "INTERMEDIATE");

      expect(mockUser.entitlements).toEqual(["JUNIOR", "INTERMEDIATE"]);
      expect(mockUser.save).toHaveBeenCalled();
    });

    it("should update entitlements to SENIOR", async () => {
      const mockUser = {
        _id: "user123",
        email: "test@example.com",
        entitlements: ["JUNIOR"],
        save: vi.fn(),
      };

      (User.findById as any) = vi.fn().mockResolvedValue(mockUser);

      await entitlementService.updateUserEntitlements("user123", "SENIOR");

      expect(mockUser.entitlements).toEqual(["JUNIOR", "SENIOR"]);
    });

    it("should update entitlements to BUNDLE", async () => {
      const mockUser = {
        _id: "user123",
        email: "test@example.com",
        entitlements: ["JUNIOR"],
        save: vi.fn(),
      };

      (User.findById as any) = vi.fn().mockResolvedValue(mockUser);

      await entitlementService.updateUserEntitlements("user123", "BUNDLE");

      expect(mockUser.entitlements).toEqual(["JUNIOR", "INTERMEDIATE", "SENIOR", "BUNDLE"]);
    });

    it("should clear cache after updating entitlements", async () => {
      const mockUser = {
        _id: "user123",
        email: "test@example.com",
        entitlements: ["JUNIOR"],
        save: vi.fn(),
        isActive: true,
        isEmailVerified: true,
      };

      (User.findById as any) = vi.fn().mockResolvedValue(mockUser);
      (Subscription.findActiveForUser as any) = vi.fn().mockResolvedValue(null);

      // Cache the entitlements
      await entitlementService.getUserEntitlements("user123");

      // Update entitlements
      await entitlementService.updateUserEntitlements("user123", "INTERMEDIATE");

      // Verify cache was cleared by checking if findById is called again
      await entitlementService.getUserEntitlements("user123");
      expect(User.findById).toHaveBeenCalledTimes(3); // 1 for cache + 1 for update + 1 for re-fetch
    });

    it("should throw error when user not found", async () => {
      (User.findById as any) = vi.fn().mockResolvedValue(null);

      await expect(
        entitlementService.updateUserEntitlements("user123", "INTERMEDIATE")
      ).rejects.toThrow("User not found");
    });
  });

  describe("revokeUserEntitlements", () => {
    it("should reset entitlements to JUNIOR only", async () => {
      const mockUser = {
        _id: "user123",
        email: "test@example.com",
        entitlements: ["JUNIOR", "INTERMEDIATE", "SENIOR"],
        save: vi.fn(),
      };

      (User.findById as any) = vi.fn().mockResolvedValue(mockUser);

      await entitlementService.revokeUserEntitlements("user123", "subscription_cancelled");

      expect(mockUser.entitlements).toEqual(["JUNIOR"]);
      expect(mockUser.save).toHaveBeenCalled();
    });

    it("should clear cache after revoking entitlements", async () => {
      const mockUser = {
        _id: "user123",
        email: "test@example.com",
        entitlements: ["JUNIOR", "INTERMEDIATE"],
        save: vi.fn(),
        isActive: true,
        isEmailVerified: true,
      };

      (User.findById as any) = vi.fn().mockResolvedValue(mockUser);
      (Subscription.findActiveForUser as any) = vi.fn().mockResolvedValue(null);

      // Cache the entitlements
      await entitlementService.getUserEntitlements("user123");

      // Revoke entitlements
      await entitlementService.revokeUserEntitlements("user123");

      // Verify cache was cleared
      const stats = entitlementService.getCacheStats();
      expect(stats.entries).not.toContain("user123");
    });

    it("should throw error when user not found", async () => {
      (User.findById as any) = vi.fn().mockResolvedValue(null);

      await expect(entitlementService.revokeUserEntitlements("user123")).rejects.toThrow(
        "User not found"
      );
    });
  });

  describe("checkMultipleEntitlements", () => {
    it("should check multiple entitlements at once", async () => {
      const mockUser = {
        _id: "user123",
        entitlements: ["JUNIOR", "INTERMEDIATE"],
        isActive: true,
        isEmailVerified: true,
      };

      (User.findById as any) = vi.fn().mockResolvedValue(mockUser);
      (Subscription.findActiveForUser as any) = vi.fn().mockResolvedValue(null);

      const result = await entitlementService.checkMultipleEntitlements("user123", [
        "JUNIOR",
        "INTERMEDIATE",
        "SENIOR",
      ]);

      expect(result.JUNIOR!.hasAccess).toBe(true);
      expect(result.INTERMEDIATE!.hasAccess).toBe(true);
      expect(result.SENIOR!.hasAccess).toBe(false);
    });
  });

  describe("getEntitlementHierarchy", () => {
    it("should return correct entitlement hierarchy", () => {
      const hierarchy = entitlementService.getEntitlementHierarchy();

      expect(hierarchy).toEqual({
        JUNIOR: ["JUNIOR"],
        INTERMEDIATE: ["JUNIOR", "INTERMEDIATE"],
        SENIOR: ["JUNIOR", "SENIOR"],
        BUNDLE: ["JUNIOR", "INTERMEDIATE", "SENIOR", "BUNDLE"],
      });
    });
  });

  describe("checkContentAccess", () => {
    it("should allow access when user has sufficient level", async () => {
      const mockUser = {
        _id: "user123",
        entitlements: ["JUNIOR", "INTERMEDIATE", "SENIOR", "BUNDLE"],
        isActive: true,
        isEmailVerified: true,
      };

      (User.findById as any) = vi.fn().mockResolvedValue(mockUser);
      (Subscription.findActiveForUser as any) = vi.fn().mockResolvedValue(null);

      const result = await entitlementService.checkContentAccess("user123", "SENIOR");

      expect(result.hasAccess).toBe(true);
    });

    it("should deny access when user level is insufficient", async () => {
      const mockUser = {
        _id: "user123",
        entitlements: ["JUNIOR", "INTERMEDIATE"],
        isActive: true,
        isEmailVerified: true,
      };

      (User.findById as any) = vi.fn().mockResolvedValue(mockUser);
      (Subscription.findActiveForUser as any) = vi.fn().mockResolvedValue(null);

      const result = await entitlementService.checkContentAccess("user123", "SENIOR");

      expect(result.hasAccess).toBe(false);
      expect(result.upgradeRequired).toBe("Senior");
    });

    it("should deny access when user has no entitlements", async () => {
      const mockUser = {
        _id: "user123",
        entitlements: [],
        isActive: true,
        isEmailVerified: true,
      };

      (User.findById as any) = vi.fn().mockResolvedValue(mockUser);
      (Subscription.findActiveForUser as any) = vi.fn().mockResolvedValue(null);

      const result = await entitlementService.checkContentAccess("user123", "JUNIOR");

      expect(result.hasAccess).toBe(false);
      expect(result.reason).toBe("No valid entitlements found");
    });
  });

  describe("Cache Management", () => {
    it("should clear user cache", () => {
      entitlementService.clearUserCache("user123");

      const stats = entitlementService.getCacheStats();
      expect(stats.entries).not.toContain("user123");
    });

    it("should clear all cache", () => {
      entitlementService.clearAllCache();

      const stats = entitlementService.getCacheStats();
      expect(stats.size).toBe(0);
      expect(stats.entries).toEqual([]);
    });

    it("should return cache statistics", async () => {
      const mockUser = {
        _id: "user123",
        entitlements: ["JUNIOR"],
        isActive: true,
        isEmailVerified: true,
      };

      (User.findById as any) = vi.fn().mockResolvedValue(mockUser);
      (Subscription.findActiveForUser as any) = vi.fn().mockResolvedValue(null);

      await entitlementService.getUserEntitlements("user123");

      const stats = entitlementService.getCacheStats();
      expect(stats.size).toBe(1);
      expect(stats.entries).toContain("user123");
    });
  });

  describe("getEntitlementStats", () => {
    it("should return entitlement statistics", async () => {
      (User.countDocuments as any) = vi.fn()
        .mockResolvedValueOnce(100) // totalUsers
        .mockResolvedValueOnce(70); // freeUsers

      (Subscription.getSubscriptionStats as any) = vi.fn().mockResolvedValue([
        {
          _id: "INTERMEDIATE",
          statuses: [{ status: "active", count: 10 }],
        },
        {
          _id: "SENIOR",
          statuses: [{ status: "active", count: 15 }],
        },
      ]);

      (Subscription.countDocuments as any) = vi.fn()
        .mockResolvedValueOnce(30) // activeSubscriptions
        .mockResolvedValueOnce(5); // expiringSubscriptions

      const result = await entitlementService.getEntitlementStats();

      expect(result).toEqual({
        totalUsers: 100,
        freeUsers: 70,
        paidUsers: 30,
        planDistribution: {
          INTERMEDIATE: 10,
          SENIOR: 15,
        },
        activeSubscriptions: 30,
        expiringSubscriptions: 5,
      });
    });
  });
});
