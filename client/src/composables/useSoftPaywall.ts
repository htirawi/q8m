import { ref } from "vue";
import type { PlanTier } from "@shared/types/plan";

/**
 * Soft Paywall State Management
 * Manages the visibility and state of the soft paywall modal
 */

const isVisible = ref(false);
const targetRoute = ref("");
const suggestedPlan = ref<PlanTier>("intermediate");

export function useSoftPaywall() {
  const show = (route: string, plan: PlanTier = "intermediate") => {
    targetRoute.value = route;
    suggestedPlan.value = plan;
    isVisible.value = true;
  };

  const hide = () => {
    isVisible.value = false;
  };

  return {
    isVisible,
    targetRoute,
    suggestedPlan,
    show,
    hide,
  };
}
