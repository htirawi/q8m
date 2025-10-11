/**
 * Entitlement Service Types
 *
 * Type definitions for entitlement service operations
 */

export interface EntitlementCheck {
  hasAccess: boolean;
  reason?: string;
  upgradeRequired?: string;
  subscriptionExpired?: boolean;
  trialExpired?: boolean;
}

export interface EntitlementCheckResult {
  hasAccess: boolean;
  reason?: string;
  upgradeRequired?: string;
  trialExpired?: boolean;
  subscriptionExpired?: boolean;
  currentEntitlements?: string[];
  requiredEntitlement?: string;
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

export interface ContentAccessCheck {
  hasAccess: boolean;
  reason?: string;
  upgradeRequired?: string;
  currentLevel?: string;
  requiredLevel?: string;
}

export interface TrialInfo {
  active: boolean;
  expiresAt?: Date;
  daysRemaining?: number;
  expired: boolean;
}

export interface SubscriptionInfo {
  active: boolean;
  plan?: string;
  expiresAt?: Date;
  daysRemaining?: number;
  expired: boolean;
  renewable: boolean;
}
