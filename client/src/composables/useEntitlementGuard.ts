/**
 * Entitlement Guard Composable
 *
 * Provides utilities for checking user entitlements and protecting routes
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
/* TODO: Legacy patterns - Replace 'any' types with proper typing and remove unused vars in next PR */

import { computed, ref } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { usePaymentStore } from "@/stores/payment";
import { useAuthStore } from "@/stores/auth";

export interface EntitlementGuardOptions {
  requiredEntitlement?: string;
  requiredContentLevel?: string;
  redirectTo?: string;
  showUpgradeModal?: boolean;
}

export function useEntitlementGuard(options: EntitlementGuardOptions = {}) {
  const router = useRouter();
  const { t } = useI18n();
  const paymentStore = usePaymentStore();
  const authStore = useAuthStore();

  const isChecking = ref(false);
  const accessDenied = ref(false);
  const upgradeRequired = ref<string | null>(null);

  // Check if user has required entitlement
  const hasRequiredEntitlement = computed(() => {
    if (!authStore.isAuthenticated) return false;
    if (!paymentStore.userEntitlements?.isActive) return false;

    if (options.requiredEntitlement) {
      return paymentStore.userEntitlements.entitlements.includes(options.requiredEntitlement);
    }

    if (options.requiredContentLevel) {
      return paymentStore.hasContentAccess(options.requiredContentLevel);
    }

    return true;
  });

  // Check access and handle redirects
  const checkAccess = async (): Promise<boolean> => {
    if (!authStore.isAuthenticated) {
      await router.push("/auth/login");
      return false;
    }

    isChecking.value = true;
    accessDenied.value = false;
    upgradeRequired.value = null;

    try {
      // Check entitlement if specified
      if (options.requiredEntitlement) {
        const entitlementCheck = await paymentStore.checkEntitlement(options.requiredEntitlement);

        if (!entitlementCheck.hasAccess) {
          accessDenied.value = true;
          upgradeRequired.value = entitlementCheck.upgradeRequired || null;

          if (options.redirectTo) {
            await router.push(options.redirectTo);
          } else if (options.showUpgradeModal) {
            // Show upgrade modal instead of redirecting
            return false;
          } else {
            await router.push("/subscribe");
          }
          return false;
        }
      }

      // Check content access if specified
      if (options.requiredContentLevel) {
        const contentCheck = await paymentStore.checkContentAccess(options.requiredContentLevel);

        if (!contentCheck.hasAccess) {
          accessDenied.value = true;
          upgradeRequired.value = contentCheck.upgradeRequired || null;

          if (options.redirectTo) {
            await router.push(options.redirectTo);
          } else if (options.showUpgradeModal) {
            // Show upgrade modal instead of redirecting
            return false;
          } else {
            await router.push("/subscribe");
          }
          return false;
        }
      }

      return true;
    } catch (error) {
      console.error("Entitlement check failed:", error);
      accessDenied.value = true;
      return false;
    } finally {
      isChecking.value = false;
    }
  };

  // Quick access check without async operations
  const hasQuickAccess = computed(() => {
    if (!authStore.isAuthenticated) return false;
    if (!paymentStore.userEntitlements?.isActive) return false;

    if (options.requiredEntitlement) {
      return paymentStore.userEntitlements.entitlements.includes(options.requiredEntitlement);
    }

    if (options.requiredContentLevel) {
      return paymentStore.hasContentAccess(options.requiredContentLevel);
    }

    return true;
  });

  // Get user's current level
  const userLevel = computed(() => {
    return paymentStore.userLevel;
  });

  // Get available entitlements
  const availableEntitlements = computed(() => {
    return paymentStore.userEntitlements?.entitlements || [];
  });

  // Check if user needs upgrade for specific content
  const needsUpgradeFor = (contentLevel: string) => {
    return paymentStore.needsUpgrade(contentLevel);
  };

  // Get upgrade message
  const getUpgradeMessage = (contentLevel: string) => {
    const levelNames = {
      JUNIOR: t("plans.junior.name"),
      INTERMEDIATE: t("plans.intermediate.name"),
      SENIOR: t("plans.senior.name"),
      BUNDLE: t("plans.bundle.name"),
    };

    const requiredLevel = levelNames[contentLevel as keyof typeof levelNames] || contentLevel;
    return t("entitlements.upgradeRequired", { level: requiredLevel });
  };

  // Redirect to pricing with upgrade context
  const redirectToPricing = (upgradeLevel?: string) => {
    const query = upgradeLevel ? { upgrade: upgradeLevel } : {};
    router.push({ path: "/subscribe", query });
  };

  // Redirect to checkout for specific plan
  const redirectToCheckout = (planType: string) => {
    router.push({ path: "/checkout", query: { plan: planType } });
  };

  return {
    // State
    isChecking,
    accessDenied,
    upgradeRequired,

    // Computed
    hasRequiredEntitlement,
    hasQuickAccess,
    userLevel,
    availableEntitlements,

    // Methods
    checkAccess,
    needsUpgradeFor,
    getUpgradeMessage,
    redirectToPricing,
    redirectToCheckout,
  };
}

// Higher-order function for route guards
export function createEntitlementGuard(options: EntitlementGuardOptions) {
  return async (to: any, from: any, next: any) => {
    const guard = useEntitlementGuard(options);
    const hasAccess = await guard.checkAccess();

    if (hasAccess) {
      next();
    } else {
      // Access denied - guard will handle redirect
      next(false);
    }
  };
}

// Composable for content access checking
export function useContentAccess() {
  const paymentStore = usePaymentStore();
  const authStore = useAuthStore();

  const canAccessContent = (contentLevel: string) => {
    if (!authStore.isAuthenticated) return false;
    return paymentStore.hasContentAccess(contentLevel);
  };

  const getContentAccessLevel = (category: string) => {
    const categoryLevels: Record<string, string> = {
      "intro-guides": "JUNIOR",
      "basic-tutorials": "JUNIOR",
      "community-resources": "JUNIOR",
      "advanced-tutorials": "INTERMEDIATE",
      "project-templates": "INTERMEDIATE",
      "coding-challenges": "INTERMEDIATE",
      "best-practices": "INTERMEDIATE",
      "senior-guides": "SENIOR",
      "architecture-patterns": "SENIOR",
      "performance-optimization": "SENIOR",
      "security-best-practices": "SENIOR",
      "interview-preparation": "SENIOR",
      "exclusive-content": "BUNDLE",
      "mentorship-sessions": "BUNDLE",
      "early-access": "BUNDLE",
      "premium-resources": "BUNDLE",
    };

    return categoryLevels[category] || "JUNIOR";
  };

  const canAccessCategory = (category: string) => {
    const requiredLevel = getContentAccessLevel(category);
    return canAccessContent(requiredLevel);
  };

  const getCategoryAccessMessage = (category: string) => {
    const requiredLevel = getContentAccessLevel(category);
    const { t } = useI18n();

    if (canAccessContent(requiredLevel)) {
      return null; // No message needed, user has access
    }

    const levelNames = {
      JUNIOR: t("plans.junior.name"),
      INTERMEDIATE: t("plans.intermediate.name"),
      SENIOR: t("plans.senior.name"),
      BUNDLE: t("plans.bundle.name"),
    };

    const requiredLevelName = levelNames[requiredLevel as keyof typeof levelNames] || requiredLevel;
    return t("entitlements.categoryAccessRequired", {
      category: category.replace(/-/g, " "),
      level: requiredLevelName,
    });
  };

  return {
    canAccessContent,
    getContentAccessLevel,
    canAccessCategory,
    getCategoryAccessMessage,
  };
}
