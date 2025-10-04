import { createApp } from "vue";
import { createHead } from "@unhead/vue";

import App from "./App.vue";
import router from "./router";
import pinia from "./store";
import i18n from "./i18n";
import { DEFAULT_LOCALE, SUPPORTED_LOCALES, type SupportedLocale } from "./router";

// Styles
import "./styles/main.css";
import "./assets/styles/tokens.css";
import "./assets/styles/globals.css";

// Create Vue app
const app = createApp(App);

// Register plugins
app.use(pinia);
app.use(router);
app.use(i18n);

// Create head manager for meta tags
const head = createHead();
app.use(head);

// Standalone locale initialization function (doesn't use Vue composables)
function initializeLocaleFromUrl() {
  const currentRoute = router.currentRoute.value;
  const urlLocale = (currentRoute.params.locale as SupportedLocale) || DEFAULT_LOCALE;

  console.log("Initializing locale:", urlLocale);
  console.log("Current i18n locale:", i18n.global.locale.value);

  // Set i18n locale
  if (i18n.global.locale.value !== urlLocale) {
    console.log("Setting i18n locale from", i18n.global.locale.value, "to", urlLocale);
    i18n.global.locale.value = urlLocale;
    console.log("i18n locale set to:", i18n.global.locale.value);
  }

  // Update HTML attributes
  document.documentElement.dir = urlLocale === "ar" ? "rtl" : "ltr";
  document.documentElement.lang = urlLocale;
  console.log("HTML attributes set:", {
    dir: document.documentElement.dir,
    lang: document.documentElement.lang,
  });
}

// Initialize locale after router is ready
router.isReady().then(() => {
  console.log("Router is ready");
  console.log("Current route:", router.currentRoute.value.path);
  console.log("Route params:", router.currentRoute.value.params);
  console.log("Current i18n locale:", i18n.global.locale.value);

  // Set default locale if not in URL
  if (!router.currentRoute.value.params.locale) {
    const currentPath = router.currentRoute.value.path;
    console.log("No locale in URL, current path:", currentPath);
    if (currentPath === "/" || (!currentPath.startsWith("/en") && !currentPath.startsWith("/ar"))) {
      console.log("Redirecting to default locale:", DEFAULT_LOCALE);
      router.replace(`/${DEFAULT_LOCALE}${currentPath === "/" ? "" : currentPath}`);
    }
  }

  // Initialize locale from URL after potential redirect
  setTimeout(() => {
    console.log("Initializing locale after timeout");
    initializeLocaleFromUrl();
  }, 0);
});

// Mount app
app.mount("#app");

// Export for testing
export { app, pinia, router, i18n };
