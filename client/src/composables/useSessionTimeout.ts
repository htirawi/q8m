/**
 * Session Timeout Composable
 * Handles automatic logout after period of inactivity
 */

import { ref, onMounted, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { useI18n } from "vue-i18n";

export interface SessionTimeoutOptions {
  /** Timeout duration in milliseconds (default: 1 hour) */
  timeoutMs?: number;
  /** Warning time before logout in milliseconds (default: 5 minutes) */
  warningMs?: number;
  /** Whether to show warning dialog (default: true) */
  showWarning?: boolean;
  /** Whether to reset timeout on activity (default: true) */
  resetOnActivity?: boolean;
}

export function useSessionTimeout(options: SessionTimeoutOptions = {}) {
  const {
    timeoutMs = 60 * 60 * 1000, // 1 hour
    warningMs = 5 * 60 * 1000, // 5 minutes
    showWarning = true,
    resetOnActivity = true,
  } = options;

  const router = useRouter();
  const authStore = useAuthStore();
  const { t } = useI18n();

  // State
  const isActive = ref(true);
  const lastActivity = ref(Date.now());
  const timeoutId = ref<number | null>(null);
  const warningTimeoutId = ref<number | null>(null);
  const showWarningDialog = ref(false);
  const timeRemaining = ref(0);

  // Activity tracking
  const activityEvents = [
    "mousedown",
    "mousemove",
    "keypress",
    "scroll",
    "touchstart",
    "click",
  ] as const;

  const resetTimeout = () => {
    if (!resetOnActivity) return;

    lastActivity.value = Date.now();
    isActive.value = true;

    // Clear existing timeouts
    if (timeoutId.value) {
      clearTimeout(timeoutId.value);
      timeoutId.value = null;
    }
    if (warningTimeoutId.value) {
      clearTimeout(warningTimeoutId.value);
      warningTimeoutId.value = null;
    }

    // Hide warning dialog
    showWarningDialog.value = false;

    // Set new timeouts (debounced to prevent excessive calls)
    if (resetTimeout.debounceTimer) {
      clearTimeout(resetTimeout.debounceTimer);
    }
    resetTimeout.debounceTimer = window.setTimeout(() => {
      setTimeouts();
    }, 100); // Debounce timeout resets
  };

  // Add debounce timer property
  (resetTimeout as any).debounceTimer = null;

  const setTimeouts = () => {
    // Set warning timeout
    if (showWarning) {
      warningTimeoutId.value = window.setTimeout(() => {
        showWarningDialog.value = true;
        timeRemaining.value = timeoutMs - warningMs;

        // Start countdown
        const countdownInterval = setInterval(() => {
          timeRemaining.value -= 1000;
          if (timeRemaining.value <= 0) {
            clearInterval(countdownInterval);
            logout();
          }
        }, 1000);
      }, timeoutMs - warningMs);
    }

    // Set logout timeout
    timeoutId.value = window.setTimeout(() => {
      logout();
    }, timeoutMs);
  };

  const logout = async () => {
    try {
      // Clear all timeouts
      if (timeoutId.value) {
        clearTimeout(timeoutId.value);
        timeoutId.value = null;
      }
      if (warningTimeoutId.value) {
        clearTimeout(warningTimeoutId.value);
        warningTimeoutId.value = null;
      }

      // Hide warning dialog
      showWarningDialog.value = false;

      // Logout user
      await authStore.logout();

      // Redirect to login
      router.push("/login");

      // Show notification
      console.log("🔒 Session expired due to inactivity");
    } catch (error) {
      console.error("Failed to logout on session timeout:", error);
    }
  };

  const extendSession = () => {
    showWarningDialog.value = false;
    resetTimeout();
  };

  const addActivityListeners = () => {
    activityEvents.forEach((event) => {
      document.addEventListener(event, resetTimeout, { passive: true });
    });
  };

  const removeActivityListeners = () => {
    activityEvents.forEach((event) => {
      document.removeEventListener(event, resetTimeout);
    });
  };

  // Lifecycle
  onMounted(() => {
    addActivityListeners();
    setTimeouts();
  });

  onUnmounted(() => {
    removeActivityListeners();

    if (timeoutId.value) {
      clearTimeout(timeoutId.value);
    }
    if (warningTimeoutId.value) {
      clearTimeout(warningTimeoutId.value);
    }
  });

  return {
    // State
    isActive,
    lastActivity,
    showWarningDialog,
    timeRemaining,

    // Methods
    resetTimeout,
    extendSession,
    logout,
  };
}
