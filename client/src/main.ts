import { createApp } from "vue";
import { createPinia } from "pinia";
import { createI18n } from "vue-i18n";
import { createRouter, createWebHistory } from "vue-router";
import { createHead } from "@unhead/vue";

import App from "./App.vue";
import { routes } from "./router/routes";
import { useAuthStore } from "./stores/auth";

// Styles
import "./styles/tokens.css";
import "./styles/main.css";

// Locales
import en from "./locales/en.json";
import ar from "./locales/ar.json";

// Create Vue app
const app = createApp(App);

// Create Pinia store
const pinia = createPinia();
app.use(pinia);

// Create i18n instance
const i18n = createI18n({
  legacy: false,
  locale: "en",
  fallbackLocale: "en",
  messages: {
    en,
    ar,
  },
  numberFormats: {
    en: {
      currency: {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 2,
      },
    },
    ar: {
      currency: {
        style: "currency",
        currency: "JOD",
        minimumFractionDigits: 2,
      },
    },
  },
  datetimeFormats: {
    en: {
      short: {
        year: "numeric",
        month: "short",
        day: "numeric",
      },
      long: {
        year: "numeric",
        month: "long",
        day: "numeric",
        weekday: "long",
        hour: "numeric",
        minute: "numeric",
      },
    },
    ar: {
      short: {
        year: "numeric",
        month: "short",
        day: "numeric",
      },
      long: {
        year: "numeric",
        month: "long",
        day: "numeric",
        weekday: "long",
        hour: "numeric",
        minute: "numeric",
      },
    },
  },
});
app.use(i18n);

// Create router
const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition;
    }
    return { top: 0 };
  },
});

// Router guards
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore();

  // Check if route requires authentication
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next({ name: "login", query: { redirect: to.fullPath } });
    return;
  }

  // Check if route requires specific role
  if (to.meta.requiresRole && !authStore.hasRole(to.meta.requiresRole as string)) {
    next({ name: "unauthorized" });
    return;
  }

  next();
});

app.use(router);

// Create head manager for meta tags
const head = createHead();
app.use(head);

// Mount app
app.mount("#app");

// Export for testing
export { app, pinia, router, i18n };
