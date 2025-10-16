/**
 * Upsell Composable
 * Manages upsell modal state and tracking for locked features
 *
 * Usage:
 * const { isModalVisible, openUpsellModal, closeUpsellModal, modalContext } = useUpsell();
 * openUpsellModal('medium', 'intermediate', 'level_card');
 */

import { ref } from "vue";
import { useAnalytics } from "./useAnalytics";
import type { DifficultyLevel } from "@/types/plan/access";
import type { PlanTier } from "@shared/types/plan";
import type { IUpsellModalContext } from '@shared/types/composables';


export function useUpsell() {
  const { track } = useAnalytics();

  const isModalVisible = ref(false);
  const modalContext = ref<IUpsellModalContext | null>(null);

  /**
   * Open the upsell modal with context
   */
  const openUpsellModal = (
    difficulty: DifficultyLevel,
    requiredPlan: PlanTier,
    source: IUpsellModalContext['source'] = 'level_card'
  ): void => {
    modalContext.value = {
      difficulty,
      requiredPlan,
      source,
    };

    isModalVisible.value = true;

    // Track modal opened event
    track('upsell_modal_opened', {
      difficulty,
      requiredPlan,
      source,
    });
  };

  /**
   * Close the upsell modal with optional dismiss method tracking
   */
  const closeUpsellModal = (
    method: 'esc' | 'backdrop' | 'close_button' | 'maybe_later_button' = 'close_button'
  ): void => {
    if (modalContext.value) {
      track('upsell_modal_dismissed', {
        difficulty: modalContext.value.difficulty,
        requiredPlan: modalContext.value.requiredPlan,
        method,
      });
    }

    isModalVisible.value = false;
    modalContext.value = null;
  };

  return {
    isModalVisible,
    modalContext,
    openUpsellModal,
    closeUpsellModal,
  };
}
