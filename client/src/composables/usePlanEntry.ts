/**
 * Plan Entry Composable
 * Handles pre-auth intent capture and routing for plan/mode entry points
 * Ensures unauthenticated users go through auth flow with preserved intent
 */

import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { trackEvent } from "@/utils/telemetry";
import { buildIntentRedirectUrl, type IntentMode } from "@/utils/planMapping";
import type { DifficultyLevel, ExperienceLevel } from "@/types/plan/access";

export function usePlanEntry() {
  const router = useRouter();
  const authStore = useAuthStore();

  /**
   * Handle entry point click for Study or Quiz mode
   * If unauthenticated: redirect to login with intent
   * If authenticated: navigate directly to target
   */
  const handlePlanEntryClick = async (
    mode: IntentMode,
    desired: DifficultyLevel | ExperienceLevel | "bundle",
    locale: string
  ): Promise<void> => {
    const authState = authStore.isAuthenticated ? "authenticated" : "unauthenticated";

    // Track entry click
    trackEvent("plan_entry_click", {
      mode,
      desired,
      authState,
      locale,
    });

    if (!authStore.isAuthenticated) {
      // Unauthenticated: build intent redirect URL and navigate to login
      const redirectUrl = buildIntentRedirectUrl(mode, desired, locale);

      // Track auth gate shown
      trackEvent("auth_gate_shown", {
        sourceRoute: router.currentRoute.value.fullPath,
        intent: `${mode}/${desired}`,
      });

      // Navigate to login with intent
      await router.push(redirectUrl);
      return;
    }

    // Authenticated: navigate directly to target
    const targetPath = `/${locale}/${mode}/${desired}`;
    await router.push(targetPath);
  };

  return {
    handlePlanEntryClick,
  };
}
