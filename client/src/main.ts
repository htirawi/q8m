import { createApp } from "vue";
import { createPinia } from "pinia";
import { createHead } from "@unhead/vue";

import App from "@/App.vue";
import router from "@/router";
import i18n from "@/i18n";
import { DEFAULT_LOCALE, type SupportedLocale } from "@/router";

// Create Pinia store
const pinia = createPinia();

// Styles
import "@/styles/main.css";
import "@/assets/styles/tokens.css";
import "@/assets/styles/design-system.css";
import "@/assets/styles/globals.css";

// Create Vue app
const app = createApp(App);

// Register plugins
app.use(pinia);
app.use(router);
app.use(i18n);

// Create head manager for meta tags
const head = createHead();
app.use(head);

// Session timeout plugin (only in production or when explicitly enabled)
// Load synchronously to prevent multiple refreshes
if (import.meta.env.PROD || import.meta.env.VITE_ENABLE_SESSION_TIMEOUT === "true") {
  // Import synchronously to prevent async loading issues
  import("@/plugins/sessionTimeout").then((sessionTimeoutPlugin) => {
    // Only initialize after app is fully mounted
    setTimeout(() => {
      app.use(sessionTimeoutPlugin.default, {
        timeoutMs: 60 * 60 * 1000, // 1 hour
        warningMs: 5 * 60 * 1000, // 5 minutes warning
        showWarning: true,
        resetOnActivity: true,
        excludeRoutes: [
          "/login",
          "/register",
          "/verify-email",
          "/reset-password",
          "/forgot-password",
        ],
      });
    }, 100); // Small delay to ensure app is mounted
  });
}

// Standalone locale initialization function (doesn't use Vue composables)
function initializeLocaleFromUrl() {
  const { currentRoute } = router;
  const { params } = currentRoute.value;
  const urlLocale = (params.locale as SupportedLocale) || DEFAULT_LOCALE;

  // Debug: Initializing locale from URL

  // Set i18n locale
  if (i18n.global.locale.value !== urlLocale) {
    i18n.global.locale.value = urlLocale;
  }

  // Update HTML attributes
  const { documentElement } = document;
  documentElement.dir = urlLocale === "ar" ? "rtl" : "ltr";
  documentElement.lang = urlLocale;
  // HTML attributes updated for locale
}

// Initialize locale after router is ready
router.isReady().then(() => {
  const { path, params } = router.currentRoute.value;

  // Set default locale if not in URL
  if (!params.locale) {
    const currentPath = path;
    if (currentPath === "/" || (!currentPath.startsWith("/en") && !currentPath.startsWith("/ar"))) {
      router.replace(`/${DEFAULT_LOCALE}${currentPath === "/" ? "" : currentPath}`);
    }
  }

  // Initialize locale from URL after potential redirect
  setTimeout(() => {
    // Initialize locale after router setup
    initializeLocaleFromUrl();
  }, 0);
});

// Mount app
app.mount("#app");

// Export for testing
export { app, pinia, router, i18n };
