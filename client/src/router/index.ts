import { createRouter, createWebHistory } from "vue-router";
import type { RouteRecordRaw } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { usePlanStore } from "@/stores/plan";
import { useSoftPaywall } from "@/composables/useSoftPaywall";
import i18n from "@/i18n";
import type { RouteMeta } from "@/types/router";
import { SUPPORTED_LOCALES, type SupportedLocale } from "@/types/router";
import { hasAccessLevel, type PlanTier } from "@shared/types/plan";

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
    "/auth/callback",
    () =>
      import(
        /* webpackChunkName: "auth" */
        "@/features/auth/pages/OAuthCallbackPage.vue"
      ),
    {
      title: "Authenticating - q8m",
      layout: "auth",
    },
    "oauth-callback"
  ),
  // Easy Study Guide (Free plan)
  createLocalizedRoute(
    "/guide/easy",
    () =>
      import(
        /* webpackChunkName: "guide-easy" */
        "@/features/guide/pages/EasyGuidePage.vue"
      ),
    {
      title: "Easy Study Guide - q8m",
      requiresAuth: true,
      access: "free",
      layout: "default",
    },
    "guide-easy"
  ),

  // Easy Quizzes (Free plan)
  createLocalizedRoute(
    "/quizzes/easy",
    () =>
      import(
        /* webpackChunkName: "quizzes-easy" */
        "@/features/quiz/pages/EasyQuizzesPage.vue"
      ),
    {
      title: "Easy Quizzes - q8m",
      requiresAuth: true,
      access: "free",
      layout: "default",
    },
    "quizzes-easy"
  ),

  // Dashboard (Paid plans)
  createLocalizedRoute(
    "/dashboard",
    () =>
      import(
        /* webpackChunkName: "dashboard" */
        "@/features/dashboard/pages/DashboardPage.vue"
      ),
    {
      title: "Dashboard - q8m",
      requiresAuth: true,
      access: "paid",
      layout: "default",
    },
    "dashboard"
  ),

  // Study Mode Selection
  createLocalizedRoute(
    "/study",
    () =>
      import(
        /* webpackChunkName: "study" */
        "@/features/study/pages/StudySelectionPage.vue"
      ),
    {
      title: "Study Mode - q8m",
      requiresAuth: true,
      access: "free",
      layout: "default",
    },
    "study"
  ),

  // Study Mode by Difficulty
  createLocalizedRoute(
    "/study/:difficulty",
    () =>
      import(
        /* webpackChunkName: "study" */
        "@/features/study/pages/StudyModePage.vue"
      ),
    {
      title: "Study - q8m",
      requiresAuth: true,
      layout: "default",
    },
    "study-practice"
  ),

  // Quiz Mode Selection
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
      access: "free",
      layout: "default",
    },
    "quiz"
  ),

  // Quiz Mode by Level
  createLocalizedRoute(
    "/quiz/:level",
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
  const planStore = usePlanStore();
  const { show: showPaywall } = useSoftPaywall();

  // Initialize auth state if not already done
  if (!authStore.isInitialized) {
    await authStore.initializeAuth();
  }

  // Initialize plan if authenticated and not loaded
  if (authStore.isAuthenticated && !planStore.currentPlan) {
    await planStore.fetchCurrentPlan();
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
        query: { signInSuccessUrl: to.fullPath },
      });
      return;
    }

    // Check if route requires guest (not authenticated)
    if (to.meta.requiresGuest && authStore.isAuthenticated) {
      // Don't use post-login routing here, just redirect to home
      // Post-login routing is handled after successful login action
      next({
        name: "home",
        params: { locale },
      });
      return;
    }

    // Check plan-based access control
    if (to.meta.access && authStore.isAuthenticated) {
      const requiredAccess = to.meta.access as string;
      const userTier = planStore.planTier;

      if (
        !hasAccessLevel(
          userTier,
          requiredAccess as "free" | "paid" | "paid:intermediate" | "paid:advanced" | "paid:pro"
        )
      ) {
        // User doesn't have access - show soft paywall
        // Determine suggested plan based on required access
        let suggestedPlan: PlanTier = "intermediate";
        if (requiredAccess.startsWith("paid:")) {
          suggestedPlan = requiredAccess.replace("paid:", "") as PlanTier;
        } else if (requiredAccess === "paid") {
          suggestedPlan = "intermediate";
        }

        // Show soft paywall (non-blocking)
        showPaywall(to.fullPath, suggestedPlan);

        // Allow navigation to proceed, but the paywall modal will be shown
        // This is the "soft" paywall - user sees the page but gets the upgrade prompt
        next();
        return;
      }
    }

    // Check study/quiz specific access (difficulty/level based)
    if (to.name === "study-practice" && to.params.difficulty) {
      const { canAccessStudyDifficulty, getRequiredStudyPlanTier, getSuggestedUpgradeTier } =
        await import("@/types/plan/access");
      const difficulty = to.params.difficulty as string;
      const userTier = planStore.planTier;

      if (
        !canAccessStudyDifficulty(userTier, difficulty as "easy" | "medium" | "hard")
      ) {
        const requiredTier = getRequiredStudyPlanTier(difficulty as "easy" | "medium" | "hard");
        const suggestedTier = getSuggestedUpgradeTier(requiredTier, userTier);
        showPaywall(to.fullPath, suggestedTier);
        next();
        return;
      }
    }

    if (to.name === "quiz-take" && to.params.level) {
      const { canAccessQuizLevel, getRequiredQuizPlanTier, getSuggestedUpgradeTier } =
        await import("@/types/plan/access");
      const level = to.params.level as string;
      const userTier = planStore.planTier;

      if (!canAccessQuizLevel(userTier, level as "junior" | "intermediate" | "senior")) {
        const requiredTier = getRequiredQuizPlanTier(level as "junior" | "intermediate" | "senior");
        const suggestedTier = getSuggestedUpgradeTier(requiredTier, userTier);
        showPaywall(to.fullPath, suggestedTier);
        next();
        return;
      }
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
