import { createRouter, createWebHistory } from "vue-router";
import type { RouteRecordRaw } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import i18n from "@/i18n";
import type { RouteMeta } from "@/types/router";
import { SUPPORTED_LOCALES, type SupportedLocale } from "@/types/router";

export { SUPPORTED_LOCALES, type SupportedLocale };

// Default locale
export const DEFAULT_LOCALE: SupportedLocale = "en";

// Helper function to create localized routes
const createLocalizedRoute = (
  path: string,
  component: RouteRecordRaw["component"],
  meta: RouteMeta,
  name?: string
): RouteRecordRaw => {
  return {
    path: `/:locale${path}`,
    ...(name ? { name } : {}),
    component,
    meta: {
      ...meta,
      locale: true,
    },
  } as RouteRecordRaw;
};

// Route definitions with lazy loading and chunk names
const routes: RouteRecordRaw[] = [
  // Redirect root to default locale
  {
    path: "/",
    redirect: () => `/${DEFAULT_LOCALE}`,
  },

  // Redirect old non-localized routes to default locale
  {
    path: "/subscribe",
    redirect: () => `/${DEFAULT_LOCALE}/subscribe`,
  },
  {
    path: "/login",
    redirect: () => `/${DEFAULT_LOCALE}/login`,
  },
  {
    path: "/register",
    redirect: () => `/${DEFAULT_LOCALE}/register`,
  },
  {
    path: "/quiz",
    redirect: () => `/${DEFAULT_LOCALE}/quiz`,
  },
  {
    path: "/account",
    redirect: () => `/${DEFAULT_LOCALE}/account`,
  },
  {
    path: "/admin",
    redirect: () => `/${DEFAULT_LOCALE}/admin`,
  },
  {
    path: "/privacy",
    redirect: () => `/${DEFAULT_LOCALE}/privacy`,
  },
  {
    path: "/terms",
    redirect: () => `/${DEFAULT_LOCALE}/terms`,
  },

  // Localized routes
  createLocalizedRoute(
    "",
    () =>
      import(
        /* webpackChunkName: "home" */
        "@/features/home/pages/HomePage.vue"
      ),
    {
      title: "q8m - Master Frontend Development Interviews",
      description:
        "Master frontend development with 500+ curated interview questions. Interactive learning, real-time feedback, and expert-level content.",
      layout: "default",
    },
    "home"
  ),
  createLocalizedRoute(
    "/subscribe",
    () =>
      import(
        /* webpackChunkName: "subscribe" */
        "@/features/pricing/pages/PricingPage.vue"
      ),
    {
      title: "Subscribe - q8m",
      description: "Choose the perfect plan for your frontend interview preparation journey",
      layout: "default",
    },
    "subscribe"
  ),
  createLocalizedRoute(
    "/login",
    () =>
      import(
        /* webpackChunkName: "auth" */
        "@/features/auth/pages/LoginPage.vue"
      ),
    {
      title: "Welcome - q8m",
      requiresGuest: true,
      layout: "auth",
    },
    "login"
  ),
  createLocalizedRoute(
    "/register",
    () =>
      import(
        /* webpackChunkName: "auth" */
        "@/features/auth/pages/RegisterPage.vue"
      ),
    {
      title: "Welcome - q8m",
      requiresGuest: true,
      layout: "auth",
    },
    "register"
  ),
  createLocalizedRoute(
    "/quiz",
    () =>
      import(
        /* webpackChunkName: "quiz" */
        "@/features/quiz/pages/QuizSelectionPage.vue"
      ),
    {
      title: "Quiz Selection - q8m",
      requiresAuth: true,
      layout: "default",
    },
    "quiz"
  ),
  createLocalizedRoute(
    "/quiz/:framework/:level",
    () =>
      import(
        /* webpackChunkName: "quiz" */
        "@/features/quiz/pages/QuizPage.vue"
      ),
    {
      title: "Quiz - q8m",
      requiresAuth: true,
      layout: "quiz",
    },
    "quiz-take"
  ),
  createLocalizedRoute(
    "/account",
    () =>
      import(
        /* webpackChunkName: "account" */
        "@/features/account/pages/AccountPage.vue"
      ),
    {
      title: "Account - q8m",
      requiresAuth: true,
      layout: "default",
    },
    "account"
  ),
  createLocalizedRoute(
    "/admin",
    () =>
      import(
        /* webpackChunkName: "admin" */
        "@/features/admin/pages/AdminDashboardPage.vue"
      ),
    {
      title: "Admin Dashboard - q8m",
      requiresAuth: true,
      requiresRole: "admin",
      layout: "default",
    },
    "admin"
  ),
  createLocalizedRoute(
    "/unauthorized",
    () =>
      import(
        /* webpackChunkName: "error" */
        "@/features/errors/pages/UnauthorizedPage.vue"
      ),
    {
      title: "Unauthorized - q8m",
      layout: "default",
    },
    "unauthorized"
  ),

  // Legal pages
  createLocalizedRoute(
    "/privacy",
    () =>
      import(
        /* webpackChunkName: "legal" */
        "@/features/legal/pages/PrivacyPage.vue"
      ),
    {
      title: "Privacy Policy - q8m",
      description: "Privacy Policy - q8m",
      layout: "default",
    },
    "privacy"
  ),
  createLocalizedRoute(
    "/terms",
    () =>
      import(
        /* webpackChunkName: "legal" */
        "@/features/legal/pages/TermsPage.vue"
      ),
    {
      title: "Terms of Service - q8m",
      description: "Terms of Service - q8m",
      layout: "default",
    },
    "terms"
  ),

  // Catch-all for localized routes (404)
  {
    path: "/:locale/:pathMatch(.*)*",
    name: "not-found",
    component: () =>
      import(
        /* webpackChunkName: "error" */
        "@/features/errors/pages/NotFoundPage.vue"
      ),
    meta: {
      title: "Page Not Found - q8m",
      layout: "default",
      locale: true,
    },
  },

  // Catch-all for non-localized routes
  {
    path: "/:pathMatch(.*)*",
    name: "not-found-root",
    component: () =>
      import(
        /* webpackChunkName: "error" */
        "@/features/errors/pages/NotFoundPage.vue"
      ),
    meta: {
      title: "Page Not Found - q8m",
      layout: "default",
    },
  },
];

// Create router instance
const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(_to, _from, savedPosition) {
    if (savedPosition) {
      return savedPosition;
    }
    return { top: 0 };
  },
});

// Helper function to get locale from route params
const getLocaleFromRoute = (to: { params: { locale?: string }; path: string }): SupportedLocale => {
  const { locale } = to.params;
  return locale && SUPPORTED_LOCALES.includes(locale as SupportedLocale)
    ? (locale as SupportedLocale)
    : DEFAULT_LOCALE;
};

// Router guards
router.beforeEach(async (to, _from, next) => {
  const authStore = useAuthStore();

  // Initialize auth state if not already done
  if (!authStore.isInitialized) {
    await authStore.initializeAuth();
  }

  // Handle locale detection and validation
  const { path } = to;
  const locale = getLocaleFromRoute(to);

  // Validate locale
  if (!SUPPORTED_LOCALES.includes(locale as SupportedLocale)) {
    // Redirect to default locale if invalid locale
    const pathWithoutLocale = path.replace(/^\/[a-z]{2}(\/|$)/, "/");
    next(`/${DEFAULT_LOCALE}${pathWithoutLocale === "/" ? "" : pathWithoutLocale}`);
    return;
  }

  // Set locale in i18n immediately
  if (typeof window !== "undefined") {
    // Setting locale from route

    // Force locale change
    i18n.global.locale.value = locale;

    // Update HTML attributes for RTL support
    const { documentElement } = document;
    documentElement.dir = locale === "ar" ? "rtl" : "ltr";
    documentElement.lang = locale;
    // HTML attributes updated for RTL support

    // Force a re-render by updating the i18n instance

    // Test Arabic translation for debugging
    if (locale === "ar") {
      // Force a re-render by triggering a reactive update
      setTimeout(() => {
        // Debug: Check if Arabic translation is working
        i18n.global.t("home.hero.title");
      }, 100);
    }
  }

  // Handle authentication for localized routes
  if (to.meta.locale) {
    // Check if route requires authentication
    if (to.meta.requiresAuth && !authStore.isAuthenticated) {
      next({
        name: "login",
        params: { locale },
        query: { redirect: to.fullPath },
      });
      return;
    }

    // Check if route requires guest (not authenticated)
    if (to.meta.requiresGuest && authStore.isAuthenticated) {
      // If visiting login page and there's a redirect param, go there
      if (to.name === "login" && to.query.signInSuccessUrl) {
        const redirectUrl = to.query.signInSuccessUrl as string;
        // Validate redirect URL (must be relative path)
        if (
          redirectUrl &&
          redirectUrl.startsWith("/") &&
          !redirectUrl.startsWith("//") &&
          !redirectUrl.includes("://") &&
          !redirectUrl.includes("@")
        ) {
          // Add locale if not present
          let finalUrl = redirectUrl;
          if (!redirectUrl.match(/^\/[a-z]{2}\//)) {
            finalUrl = redirectUrl === "/" ? `/${locale}` : `/${locale}${redirectUrl}`;
          }
          next(finalUrl);
          return;
        }
      }
      // Default: redirect to home
      next({
        name: "home",
        params: { locale },
      });
      return;
    }

    // Check if route requires specific role
    if (to.meta.requiresRole && !authStore.hasRole(to.meta.requiresRole as string)) {
      next({
        name: "unauthorized",
        params: { locale },
      });
      return;
    }
  }

  // Update page title
  if (to.meta.title) {
    document.title = to.meta.title as string;
  }

  next();
});

// After each route change
router.afterEach((to) => {
  // Update meta description
  if (to.meta.description) {
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute("content", to.meta.description as string);
    }
  }

  // Track page view for analytics
  if (import.meta.env.PROD && typeof window !== "undefined" && "gtag" in window) {
    const { gtag } = window as {
      gtag: (command: string, targetId: string, config: Record<string, string>) => void;
    };
    gtag("config", "GA_MEASUREMENT_ID", {
      page_path: to.fullPath,
    });
  }
});

export default router;
