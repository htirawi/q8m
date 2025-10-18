/**
 * Session Timeout Plugin
 * Global session timeout management for the application
 */

import { createApp } from "vue";
import SessionTimeoutWarning from "@/components/SessionTimeoutWarning.vue";
import { useSessionTimeout } from "@/composables/useSessionTimeout";

export interface SessionTimeoutPluginOptions {
  /** Timeout duration in milliseconds (default: 1 hour) */
  timeoutMs?: number;
  /** Warning time before logout in milliseconds (default: 5 minutes) */
  warningMs?: number;
  /** Whether to show warning dialog (default: true) */
  showWarning?: boolean;
  /** Whether to reset timeout on activity (default: true) */
  resetOnActivity?: boolean;
  /** Routes to exclude from timeout (default: ['/login', '/register']) */
  excludeRoutes?: string[];
}

export default {
  install(app: any, options: SessionTimeoutPluginOptions = {}) {
    const {
      timeoutMs = 60 * 60 * 1000, // 1 hour
      warningMs = 5 * 60 * 1000, // 5 minutes
      showWarning = true,
      resetOnActivity = true,
      excludeRoutes = ["/login", "/register", "/verify-email", "/reset-password"],
    } = options;

    // Only initialize session timeout for authenticated users
    const router = app.config.globalProperties.$router;
    const authStore = app.config.globalProperties.$authStore;

    if (!router || !authStore) {
      console.warn("Session timeout plugin requires router and authStore");
      return;
    }

    // Check if current route should be excluded
    const isExcludedRoute = () => {
      const currentPath = router.currentRoute.value.path;
      return excludeRoutes.some((route) => currentPath.includes(route));
    };

    // Only start timeout if user is authenticated and not on excluded routes
    if (authStore.isAuthenticated && !isExcludedRoute()) {
      // Use requestIdleCallback for better performance
      const initTimeout = () => {
        const { showWarningDialog, timeRemaining, extendSession, logout } = useSessionTimeout({
          timeoutMs,
          warningMs,
          showWarning,
          resetOnActivity,
        });

        // Create warning component instance
        const warningComponent = createApp(SessionTimeoutWarning, {
          showWarningDialog,
          timeRemaining,
          onExtend: extendSession,
          onLogout: logout,
        });

        // Mount warning component
        const warningElement = document.createElement("div");
        document.body.appendChild(warningElement);
        warningComponent.mount(warningElement);

        // Watch for route changes to restart timeout (debounced)
        let routeChangeTimeout: number | null = null;
        router.afterEach((to: any) => {
          if (routeChangeTimeout) {
            clearTimeout(routeChangeTimeout);
          }
          routeChangeTimeout = window.setTimeout(() => {
            if (
              authStore.isAuthenticated &&
              !excludeRoutes.some((route) => to.path.includes(route))
            ) {
              // Restart timeout on route change
              extendSession();
            }
          }, 100); // Debounce route changes
        });

        // Watch for authentication state changes
        authStore.$subscribe((mutation: any, state: any) => {
          if (!state.isAuthenticated) {
            // User logged out, cleanup
            warningComponent.unmount();
            document.body.removeChild(warningElement);
          }
        });
      };

      // Use requestIdleCallback for better performance
      if (window.requestIdleCallback) {
        window.requestIdleCallback(initTimeout);
      } else {
        setTimeout(initTimeout, 0);
      }
    }
  },
};
