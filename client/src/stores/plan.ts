import { defineStore } from "pinia";
import { ref, computed } from "vue";
import type { Plan, PlanTier } from "@shared/types/plan";
import { useAuthStore } from "./auth";

/**
 * Plan Store
 * Manages user's subscription plan and access levels
 */
export const usePlanStore = defineStore("plan", () => {
  const authStore = useAuthStore();

  // State
  const currentPlan = ref<Plan | null>(null);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  // Computed properties
  const planTier = computed((): PlanTier => {
    // First check the plan store
    if (currentPlan.value?.tier) {
      return currentPlan.value.tier;
    }
    // Fall back to user's plan tier from auth store
    if (authStore.user?.planTier) {
      return authStore.user.planTier;
    }
    // Default to free
    return "free";
  });

  const isPaid = computed(() => {
    return planTier.value !== "free";
  });

  const isFree = computed(() => {
    return planTier.value === "free";
  });

  const isIntermediate = computed(() => {
    return planTier.value === "intermediate";
  });

  const isAdvanced = computed(() => {
    return planTier.value === "advanced";
  });

  const isPro = computed(() => {
    return planTier.value === "pro";
  });

  const planDisplayName = computed(() => {
    const names: Record<PlanTier, string> = {
      free: "Free",
      intermediate: "Intermediate",
      advanced: "Advanced",
      pro: "Pro",
    };
    return names[planTier.value];
  });

  // Actions
  async function fetchCurrentPlan(): Promise<void> {
    if (!authStore.isAuthenticated) {
      currentPlan.value = null;
      return;
    }

    isLoading.value = true;
    error.value = null;

    try {
      // Mock for dev
      if (import.meta.env.DEV && authStore.user?.email === "dev@example.com") {
        currentPlan.value = {
          id: "dev-plan-1",
          tier: "free",
          name: "free",
          displayName: "Free Plan",
          description: "Access to Easy content",
          features: ["Easy Study Guide", "Easy Quizzes", "Community Support"],
          isActive: true,
          startedAt: new Date(),
        };
        return;
      }

      const response = await fetch("/api/plans/current", {
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch plan");
      }

      const data = await response.json();
      currentPlan.value = data.plan;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch plan";
      error.value = errorMessage;
      // Default to free on error
      currentPlan.value = {
        id: "default-free",
        tier: "free",
        name: "free",
        displayName: "Free Plan",
        description: "Access to Easy content",
        features: [],
        isActive: true,
      };
    } finally {
      isLoading.value = false;
    }
  }

  function reset() {
    currentPlan.value = null;
    isLoading.value = false;
    error.value = null;
  }

  return {
    // State
    currentPlan,
    isLoading,
    error,

    // Computed
    planTier,
    isPaid,
    isFree,
    isIntermediate,
    isAdvanced,
    isPro,
    planDisplayName,

    // Actions
    fetchCurrentPlan,
    reset,
  };
});
