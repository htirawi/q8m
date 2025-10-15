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

import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import { usePlanEntry } from "@/composables/usePlanEntry";
import { useAnalytics } from "@/composables/useAnalytics";
import type { DifficultyLevel } from "@/types/plan/access";

const AUTOSTART_KEY = "q8m_study_autostart";
const LAST_SESSION_KEY = "q8m_study_last_session";
const AB_TEST_VARIANT_KEY = "q8m_study_ab_variant";

/**
 * Last session data stored in localStorage
 */
interface ILastSession {
  difficulty: DifficultyLevel;
  questionIndex: number;
  timestamp: number;
}

/**
 * Loading states for session start
 */
export type StudyLoadingState = "idle" | "loading" | "error";

/**
 * A/B test variants for study flow
 * - autostart: Default, immediate start on Easy click
 * - manual: Requires explicit Start button click (sticky bar)
 */
export type StudyFlowVariant = "autostart" | "manual";

export function useStudy() {
  const router = useRouter();
  const { handlePlanEntryClick } = usePlanEntry();
  const { track } = useAnalytics();

  const loadingState = ref<StudyLoadingState>("idle");
  const errorMessage = ref<string | null>(null);

  /**
   * Get auto-start preference from localStorage
   * Default: true (enabled)
   */
  const getAutoStart = (): boolean => {
    if (typeof localStorage === "undefined") {
      return true; // Default to enabled
    }

    const stored = localStorage.getItem(AUTOSTART_KEY);
    if (stored === null) {
      return true; // Default to enabled
    }

    return stored === "true";
  };

  /**
   * Set auto-start preference in localStorage
   */
  const setAutoStart = (enabled: boolean): void => {
    if (typeof localStorage === "undefined") {
      return;
    }

    localStorage.setItem(AUTOSTART_KEY, String(enabled));

    track("study_autostart_preference_changed", {
      enabled,
      variant: getABTestVariant(),
    });
  };

  /**
   * Get A/B test variant for this user
   * Assigns variant on first visit and persists in localStorage
   *
   * Distribution:
   * - 50% autostart (default, immediate navigation)
   * - 50% manual (requires explicit button click)
   */
  const getABTestVariant = (): StudyFlowVariant => {
    if (typeof localStorage === "undefined") {
      return "autostart"; // Default for SSR
    }

    // Check if user already has a variant assigned
    const stored = localStorage.getItem(AB_TEST_VARIANT_KEY);
    if (stored === "autostart" || stored === "manual") {
      return stored;
    }

    // Assign variant randomly (50/50 split)
    const variant: StudyFlowVariant = Math.random() < 0.5 ? "autostart" : "manual";
    localStorage.setItem(AB_TEST_VARIANT_KEY, variant);

    // Track variant assignment
    track("study_ab_test_assigned", {
      variant,
      timestamp: Date.now(),
    });

    return variant;
  };

  /**
   * Override A/B test variant (for testing or user preference)
   */
  const setABTestVariant = (variant: StudyFlowVariant): void => {
    if (typeof localStorage === "undefined") {
      return;
    }

    localStorage.setItem(AB_TEST_VARIANT_KEY, variant);

    track("study_ab_test_variant_overridden", {
      variant,
    });
  };

  /**
   * Get last session from localStorage (if exists and not stale)
   * Sessions are considered stale after 7 days
   */
  const getLastSession = (): ILastSession | null => {
    if (typeof localStorage === "undefined") {
      return null;
    }

    try {
      const stored = localStorage.getItem(LAST_SESSION_KEY);
      if (!stored) {
        return null;
      }

      const session: ILastSession = JSON.parse(stored);

      // Check if session is stale (7 days)
      const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000;
      const isStale = Date.now() - session.timestamp > SEVEN_DAYS;

      if (isStale) {
        localStorage.removeItem(LAST_SESSION_KEY);
        return null;
      }

      return session;
    } catch {
      // Invalid JSON or other error
      localStorage.removeItem(LAST_SESSION_KEY);
      return null;
    }
  };

  /**
   * Save current session to localStorage
   */
  const saveLastSession = (difficulty: DifficultyLevel, questionIndex: number): void => {
    if (typeof localStorage === "undefined") {
      return;
    }

    const session: ILastSession = {
      difficulty,
      questionIndex,
      timestamp: Date.now(),
    };

    localStorage.setItem(LAST_SESSION_KEY, JSON.stringify(session));
  };

  /**
   * Clear last session from localStorage
   */
  const clearLastSession = (): void => {
    if (typeof localStorage === "undefined") {
      return;
    }

    localStorage.removeItem(LAST_SESSION_KEY);
  };

  /**
   * Start a new Easy study session (immediate, no auth check here - handled by planEntry)
   * Shows brief loading skeleton (150-300ms) for smooth transition
   */
  const startEasySession = async (locale: string): Promise<void> => {
    loadingState.value = "loading";
    errorMessage.value = null;

    try {
      // Track event
      track("easy_card_clicked", {
        source: "study-page",
      });

      track("study_autostart_triggered", {
        autostart: getAutoStart(),
      });

      // Brief loading skeleton (minimum 150ms for perceived performance)
      const startTime = Date.now();
      const MIN_LOADING_TIME = 150;

      // Use plan entry handler (handles auth, intent preservation)
      await handlePlanEntryClick("study", "easy", locale);

      // Ensure minimum loading time for smooth transition
      const elapsed = Date.now() - startTime;
      if (elapsed < MIN_LOADING_TIME) {
        await new Promise((resolve) => setTimeout(resolve, MIN_LOADING_TIME - elapsed));
      }

      // Track success with A/B test variant
      track("study_session_started", {
        mode: "easy",
        resumed: false,
      });

      track("study_flow_conversion", {
        variant: getABTestVariant(),
        difficulty: "easy",
        resumed: false,
        success: true,
        durationMs: Date.now() - startTime,
      });

      loadingState.value = "idle";
    } catch (error) {
      loadingState.value = "error";
      errorMessage.value = error instanceof Error ? error.message : "Failed to start session";

      track("study_start_error", {
        reason: errorMessage.value,
        difficulty: "easy",
        variant: getABTestVariant(),
      });

      throw error;
    }
  };

  /**
   * Resume last study session
   */
  const resumeLastSession = async (locale: string): Promise<void> => {
    const lastSession = getLastSession();

    if (!lastSession) {
      // No session to resume, start fresh
      await startEasySession(locale);
      return;
    }

    loadingState.value = "loading";
    errorMessage.value = null;

    try {
      // Track event
      track("study_session_resumed", {
        difficulty: lastSession.difficulty,
        questionIndex: lastSession.questionIndex,
      });

      // Navigate to study page with question index
      // Note: Actual resume logic would need server-side session management
      // For now, just navigate to the study page
      await router.push({
        name: "study-practice",
        params: {
          locale,
          difficulty: lastSession.difficulty,
        },
        query: {
          index: String(lastSession.questionIndex),
        },
      });

      // Track success with A/B test variant
      track("study_session_started", {
        mode: lastSession.difficulty,
        resumed: true,
      });

      track("study_flow_conversion", {
        variant: getABTestVariant(),
        difficulty: lastSession.difficulty,
        resumed: true,
        success: true,
      });

      loadingState.value = "idle";
    } catch (error) {
      loadingState.value = "error";
      errorMessage.value = error instanceof Error ? error.message : "Failed to resume session";

      track("study_start_error", {
        reason: errorMessage.value,
        difficulty: lastSession.difficulty,
        resumed: true,
        variant: getABTestVariant(),
      });

      throw error;
    }
  };

  /**
   * Retry after error
   */
  const retry = async (locale: string): Promise<void> => {
    errorMessage.value = null;
    await startEasySession(locale);
  };

  // Computed properties
  const isAutoStartEnabled = computed(() => getAutoStart());
  const hasLastSession = computed(() => getLastSession() !== null);
  const lastSessionDifficulty = computed(() => getLastSession()?.difficulty ?? null);
  const abTestVariant = computed(() => getABTestVariant());

  return {
    // State
    loadingState,
    errorMessage,
    isAutoStartEnabled,
    hasLastSession,
    lastSessionDifficulty,
    abTestVariant,

    // Methods
    getAutoStart,
    setAutoStart,
    getLastSession,
    saveLastSession,
    clearLastSession,
    startEasySession,
    resumeLastSession,
    retry,
    getABTestVariant,
    setABTestVariant,
  };
}
