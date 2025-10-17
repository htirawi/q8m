/**
 * Study Mode Composable
 * Manages study session lifecycle, auto-start preferences, and resume functionality
 *
 * Features:
 * - Auto-start preference (localStorage)
 * - Resume last session
 * - Start new session
 * - Loading states with brief skeleton
 */

import { ref } from 'vue';
import { useRouter } from 'vue-router';
import type { StudyLoadingState } from "@shared/types/composables";

// Re-export types for use in other modules
export type { StudyLoadingState, StudyFlowVariant } from "@shared/types/composables";

/**
 * Study composable hook
 */
export function useStudy() {
  const router = useRouter();

  const loadingState = ref<StudyLoadingState>('idle');
  const errorMessage = ref<string | null>(null);
  const isAutoStartEnabled = ref(false);
  const hasLastSession = ref(false);

  /**
   * Start easy study session
   */
  const startEasySession = async (locale: string) => {
    try {
      loadingState.value = 'loading';
      errorMessage.value = null;

      // Navigate to framework selection for easy difficulty
      await router.push(`/${locale}/study/easy`);
    } catch (error) {
      loadingState.value = 'error';
      errorMessage.value = error instanceof Error ? error.message : 'Failed to start session';
      throw error;
    } finally {
      if (loadingState.value === 'loading') {
        loadingState.value = 'idle';
      }
    }
  };

  /**
   * Resume last study session
   */
  const resumeLastSession = async (locale: string) => {
    // For now, just start a new session
    return startEasySession(locale);
  };

  /**
   * Retry after error
   */
  const retry = async (locale: string) => {
    return startEasySession(locale);
  };

  return {
    loadingState,
    errorMessage,
    isAutoStartEnabled,
    hasLastSession,
    startEasySession,
    resumeLastSession,
    retry,
  };
}
