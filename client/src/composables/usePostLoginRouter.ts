import { useRouter, useRoute } from "vue-router";
import { usePlanStore } from "@/stores/plan";
import { useAuthStore } from "@/stores/auth";
import { useAuthRedirect } from "./useAuthRedirect";
import { useToast } from "./useToast";
import { useI18n } from "vue-i18n";
import { trackEvent } from "@/utils/telemetry";
import type { PlanTier } from "@shared/types/plan";
import { getStudyTargetFor, decodeIntentFromUrl, resolvePostLoginTarget } from "@/utils/planMapping";

/**
 * Post-Login Router Handler
 * Single source of truth for where users land after successful login
 * Uses canonical plan mapping: Free→Easy, Intermediate→Medium, Advanced→Hard, Pro(Bundle)→Medium+Hard
 */
export function usePostLoginRouter() {
  const router = useRouter();
  const route = useRoute();
  const planStore = usePlanStore();
  const authStore = useAuthStore();
  const { buildLocalizedRedirectUrl, isValidRedirectUrl, getCurrentLocale } = useAuthRedirect();
  const { success: showSuccessToast } = useToast();
  const { t } = useI18n();

  /**
   * Get the default landing page for a given plan tier
   * Uses canonical mapping from planMapping.ts
   */
  const getDefaultLandingPage = (tier: PlanTier): string => {
    const locale = getCurrentLocale();
    // Use canonical mapping: Free→Easy, Intermediate→Medium, Advanced→Hard, Pro→Medium
    return getStudyTargetFor(tier, locale);
  };

  /**
   * Check if a route is accessible under the current plan
   * Returns true if accessible, false otherwise
   */
  const isRouteAccessible = async (path: string): Promise<boolean> => {
    try {
      const resolved = router.resolve(path);
      const requiredAccess = resolved.meta.access as string | undefined;

      if (!requiredAccess || requiredAccess === "free") {
        return true; // Free routes are always accessible
      }

      const tier = planStore.planTier;

      if (requiredAccess === "paid") {
        return tier !== "free";
      }

      // Specific tier requirements (e.g., "paid:advanced")
      if (requiredAccess.startsWith("paid:")) {
        const requiredTier = requiredAccess.replace("paid:", "") as PlanTier;
        const tierHierarchy: Record<PlanTier, number> = {
          free: 0,
          intermediate: 1,
          advanced: 2,
          pro: 3,
        };
        return tierHierarchy[tier] >= tierHierarchy[requiredTier];
      }

      return true;
    } catch {
      return false;
    }
  };

  /**
   * Main post-login routing decision function
   * Called after successful authentication
   * Handles intent decoding and Bundle-specific routing
   */
  const routeAfterLogin = async (): Promise<void> => {
    // Ensure plan is loaded
    await planStore.fetchCurrentPlan();

    const tier = planStore.planTier;
    const locale = getCurrentLocale();
    const userId = authStore.user?.id;

    // Track login success
    trackEvent("auth_login_success", {
      userId,
      plan: tier,
      locale,
    });

    // Check for redirect parameter with encoded intent
    const redirectParam = route.query.signInSuccessUrl as string | undefined;

    if (redirectParam && isValidRedirectUrl(redirectParam)) {
      // Decode intent from redirect URL
      const intent = decodeIntentFromUrl(redirectParam);

      // Resolve target based on plan and intent
      const targetPath = resolvePostLoginTarget(tier, intent, locale);

      // Track intent-based redirect
      if (intent) {
        trackEvent("auth_gate_success_redirect", {
          planResolved: tier,
          toRoute: targetPath,
          mode: intent.mode,
          desired: intent.desired,
        });

        // Track Bundle-specific entry
        if (intent.desired === "bundle" && tier === "pro") {
          trackEvent("bundle_entry_resolved", {
            mode: intent.mode,
            toRoute: targetPath,
          });
        }
      }

      // Navigate to resolved target (guards will handle access control)
      const localizedPath = buildLocalizedRedirectUrl(targetPath);
      await router.replace(localizedPath);
      return;
    }

    // No redirect param - route by plan policy
    const defaultPath = getDefaultLandingPage(tier);

    if (tier === "free") {
      // Free plan: land on Easy Study with welcome toast
      trackEvent("free_entry_route", {
        fromRoute: route.path,
        toRoute: defaultPath,
      });

      await router.replace(defaultPath);

      // Show welcome toast after navigation
      setTimeout(() => {
        showSuccessToast("", t("plans.free.welcomeBack"));
      }, 300);
    } else {
      // Paid plan: route to mapped target
      trackEvent("paid_entry_route", {
        plan: tier,
        toRoute: defaultPath,
      });

      await router.replace(defaultPath);
    }
  };

  return {
    routeAfterLogin,
    getDefaultLandingPage,
    isRouteAccessible,
  };
}
