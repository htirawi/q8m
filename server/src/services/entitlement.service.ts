import { User } from "../models/User.js";
import { Subscription } from "../models/Subscription.js";
import { Purchase } from "../models/Purchase.js";

export interface EntitlementCheck {
  hasAccess: boolean;
  reason?: string;
  upgradeRequired?: string;
  subscriptionExpired?: boolean;
  trialExpired?: boolean;
}

export interface UserEntitlements {
  userId: string;
  entitlements: string[];
  activeSubscription: {
    planType: string;
    status: string;
    expiresAt: Date;
    isInTrial: boolean;
  } | null;
  isActive: boolean;
  lastChecked: Date;
}

export class EntitlementService {
  private static instance: EntitlementService;
  private cache = new Map<string, { data: UserEntitlements; expires: number }>();
  private cacheTTL = 5 * 60 * 1000; // 5 minutes

  private constructor() {}

  static getInstance(): EntitlementService {
    if (!EntitlementService.instance) {
      EntitlementService.instance = new EntitlementService();
    }
    return EntitlementService.instance;
  }

  /**
   * Check if user has access to a specific entitlement
   */
  async checkEntitlement(userId: string, requiredEntitlement: string): Promise<EntitlementCheck> {
    try {
      const userEntitlements = await this.getUserEntitlements(userId);

      if (!userEntitlements.isActive) {
        return {
          hasAccess: false,
          reason: "User account is not active",
        };
      }

      // Check if user has the required entitlement
      if (userEntitlements.entitlements.includes(requiredEntitlement)) {
        return { hasAccess: true };
      }

      // Check subscription status if user doesn't have entitlement
      if (userEntitlements.activeSubscription) {
        const subscription = userEntitlements.activeSubscription;

        if (subscription.status !== "active") {
          return {
            hasAccess: false,
            reason: "Subscription is not active",
            subscriptionExpired: true,
          };
        }

        if (subscription.expiresAt < new Date()) {
          return {
            hasAccess: false,
            reason: "Subscription has expired",
            subscriptionExpired: true,
          };
        }

        if (subscription.isInTrial && subscription.expiresAt < new Date()) {
          return {
            hasAccess: false,
            reason: "Trial period has expired",
            trialExpired: true,
          };
        }
      }

      // Determine upgrade required
      const upgradeRequired = this.getRequiredUpgrade(requiredEntitlement);

      return {
        hasAccess: false,
        reason: `Upgrade to ${upgradeRequired} plan required`,
        upgradeRequired,
      };
    } catch (error) {
      console.error("Entitlement check error:", error);
      return {
        hasAccess: false,
        reason: "Error checking entitlements",
      };
    }
  }

  /**
   * Get user's current entitlements with caching
   */
  async getUserEntitlements(userId: string): Promise<UserEntitlements> {
    // Check cache first
    const cached = this.cache.get(userId);
    if (cached && cached.expires > Date.now()) {
      return cached.data;
    }

    try {
      // Fetch user from database
      const user = await User.findById(userId);
      if (!user) {
        throw new Error("User not found");
      }

      // Get active subscription
      const activeSubscription = await Subscription.findActiveForUser(userId);

      // Build entitlements object
      const entitlements: UserEntitlements = {
        userId,
        entitlements: user.entitlements || ["JUNIOR"],
        activeSubscription: activeSubscription
          ? {
              planType: activeSubscription.planType,
              status: activeSubscription.status,
              expiresAt: activeSubscription.currentPeriodEnd,
              isInTrial: activeSubscription.isInTrial,
            }
          : null,
        isActive: user.isActive && user.isEmailVerified,
        lastChecked: new Date(),
      };

      // Cache the result
      this.cache.set(userId, {
        data: entitlements,
        expires: Date.now() + this.cacheTTL,
      });

      return entitlements;
    } catch (error) {
      console.error("Error fetching user entitlements:", error);
      throw error;
    }
  }

  /**
   * Update user entitlements after successful payment
   */
  async updateUserEntitlements(
    userId: string,
    planType: "INTERMEDIATE" | "SENIOR" | "BUNDLE"
  ): Promise<void> {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error("User not found");
      }

      // Update entitlements based on plan type
      let newEntitlements: string[] = ["JUNIOR"]; // Everyone gets JUNIOR access

      switch (planType) {
        case "INTERMEDIATE":
          newEntitlements = ["JUNIOR", "INTERMEDIATE"];
          break;
        case "SENIOR":
          newEntitlements = ["JUNIOR", "SENIOR"];
          break;
        case "BUNDLE":
          newEntitlements = ["JUNIOR", "INTERMEDIATE", "SENIOR", "BUNDLE"];
          break;
      }

      user.entitlements = newEntitlements;
      await user.save();

      // Clear cache for this user
      this.cache.delete(userId);

      console.log(`Updated entitlements for user ${user.email}: ${newEntitlements.join(", ")}`);
    } catch (error) {
      console.error("Error updating user entitlements:", error);
      throw error;
    }
  }

  /**
   * Revoke user entitlements (for cancelled subscriptions)
   */
  async revokeUserEntitlements(
    userId: string,
    reason: string = "subscription_cancelled"
  ): Promise<void> {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error("User not found");
      }

      // Reset to JUNIOR entitlements only
      user.entitlements = ["JUNIOR"];
      await user.save();

      // Clear cache for this user
      this.cache.delete(userId);

      console.log(`Revoked entitlements for user ${user.email}. Reason: ${reason}`);
    } catch (error) {
      console.error("Error revoking user entitlements:", error);
      throw error;
    }
  }

  /**
   * Get required upgrade for accessing specific content
   */
  private getRequiredUpgrade(requiredEntitlement: string): string {
    switch (requiredEntitlement) {
      case "INTERMEDIATE":
        return "Intermediate";
      case "SENIOR":
        return "Senior";
      case "BUNDLE":
        return "Bundle";
      default:
        return "Premium";
    }
  }

  /**
   * Check multiple entitlements at once
   */
  async checkMultipleEntitlements(
    userId: string,
    requiredEntitlements: string[]
  ): Promise<Record<string, EntitlementCheck>> {
    const results: Record<string, EntitlementCheck> = {};

    for (const entitlement of requiredEntitlements) {
      results[entitlement] = await this.checkEntitlement(userId, entitlement);
    }

    return results;
  }

  /**
   * Get entitlement hierarchy
   */
  getEntitlementHierarchy(): Record<string, string[]> {
    return {
      JUNIOR: ["JUNIOR"],
      INTERMEDIATE: ["JUNIOR", "INTERMEDIATE"],
      SENIOR: ["JUNIOR", "SENIOR"],
      BUNDLE: ["JUNIOR", "INTERMEDIATE", "SENIOR", "BUNDLE"],
    };
  }

  /**
   * Check if user can access content based on minimum required level
   */
  async checkContentAccess(
    userId: string,
    contentLevel: "JUNIOR" | "INTERMEDIATE" | "SENIOR" | "BUNDLE"
  ): Promise<EntitlementCheck> {
    const userEntitlements = await this.getUserEntitlements(userId);

    if (!userEntitlements.isActive) {
      return {
        hasAccess: false,
        reason: "User account is not active",
      };
    }

    // Check if user has sufficient level access
    const hierarchy = this.getEntitlementHierarchy();
    const userLevel = this.getHighestUserLevel(userEntitlements.entitlements);

    if (!userLevel) {
      return {
        hasAccess: false,
        reason: "No valid entitlements found",
      };
    }

    // Check if user level includes the required content level
    const userLevelEntitlements = hierarchy[userLevel] || [];

    if (userLevelEntitlements.includes(contentLevel)) {
      return { hasAccess: true };
    }

    return {
      hasAccess: false,
      reason: `Upgrade to ${this.getRequiredUpgrade(contentLevel)} plan required`,
      upgradeRequired: this.getRequiredUpgrade(contentLevel),
    };
  }

  /**
   * Get the highest level of entitlements a user has
   */
  private getHighestUserLevel(entitlements: string[]): string | null {
    const levels = ["BUNDLE", "SENIOR", "INTERMEDIATE", "JUNIOR"];

    for (const level of levels) {
      if (entitlements.includes(level)) {
        return level;
      }
    }

    return null;
  }

  /**
   * Get users with expiring subscriptions
   */
  async getExpiringSubscriptions(days: number = 7): Promise<
    Array<{
      userId: string;
      userEmail: string;
      subscription: any;
      daysRemaining: number;
    }>
  > {
    try {
      const expiringSubscriptions = await Subscription.findExpiringSoon(days);

      return expiringSubscriptions.map((sub) => ({
        userId: sub.userId.toString(),
        userEmail: sub.userId.email,
        subscription: sub,
        daysRemaining: sub.daysRemaining,
      }));
    } catch (error) {
      console.error("Error fetching expiring subscriptions:", error);
      return [];
    }
  }

  /**
   * Get entitlement statistics
   */
  async getEntitlementStats(): Promise<{
    totalUsers: number;
    freeUsers: number;
    paidUsers: number;
    planDistribution: Record<string, number>;
    activeSubscriptions: number;
    expiringSubscriptions: number;
  }> {
    try {
      // Get total user count
      const totalUsers = await User.countDocuments({ isActive: true });

      // Get free vs paid users
      const freeUsers = await User.countDocuments({
        isActive: true,
        entitlements: { $eq: ["JUNIOR"] },
      });
      const paidUsers = totalUsers - freeUsers;

      // Get subscription statistics
      const subscriptionStats = await Subscription.getSubscriptionStats();

      // Get plan distribution
      const planDistribution: Record<string, number> = {};
      subscriptionStats.forEach((stat: any) => {
        const activeCount = stat.statuses.find((s: any) => s.status === "active")?.count || 0;
        planDistribution[stat._id] = activeCount;
      });

      // Get active and expiring subscriptions
      const activeSubscriptions = await Subscription.countDocuments({ status: "active" });
      const expiringSubscriptions = await Subscription.countDocuments({
        status: "active",
        currentPeriodEnd: { $lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) },
      });

      return {
        totalUsers,
        freeUsers,
        paidUsers,
        planDistribution,
        activeSubscriptions,
        expiringSubscriptions,
      };
    } catch (error) {
      console.error("Error getting entitlement stats:", error);
      throw error;
    }
  }

  /**
   * Clear entitlement cache for a user
   */
  clearUserCache(userId: string): void {
    this.cache.delete(userId);
  }

  /**
   * Clear all entitlement cache
   */
  clearAllCache(): void {
    this.cache.clear();
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): {
    size: number;
    entries: string[];
  } {
    return {
      size: this.cache.size,
      entries: Array.from(this.cache.keys()),
    };
  }
}

// Export singleton instance
export const entitlementService = EntitlementService.getInstance();
