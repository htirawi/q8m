import { createRouter, createWebHistory } from "vue-router";
import type { RouteRecordRaw } from "vue-router";
import { useAuthStore } from "@/stores/auth";

// Route definitions with lazy loading and chunk names
const routes: RouteRecordRaw[] = [
  {
    path: "/",
    name: "home",
    component: () =>
      import(
        /* webpackChunkName: "home" */
        "@/features/home/pages/HomePage.vue"
      ),
    meta: {
      title: "q8m - Master Frontend Development Interviews",
      description:
        "Master frontend development with 500+ curated interview questions. Interactive learning, real-time feedback, and expert-level content.",
      layout: "default",
    },
  },
  {
    path: "/subscribe",
    name: "subscribe",
    component: () =>
      import(
        /* webpackChunkName: "subscribe" */
        "@/features/pricing/pages/PricingPage.vue"
      ),
    meta: {
      title: "Subscribe - q8m",
      description: "Choose the perfect plan for your frontend interview preparation journey",
      layout: "default",
    },
  },
  {
    path: "/login",
    name: "login",
    component: () =>
      import(
        /* webpackChunkName: "auth" */
        "@/features/auth/pages/LoginPage.vue"
      ),
    meta: {
      title: "Login - q8m",
      requiresGuest: true,
      layout: "auth",
    },
  },
  {
    path: "/register",
    name: "register",
    component: () =>
      import(
        /* webpackChunkName: "auth" */
        "@/features/auth/pages/RegisterPage.vue"
      ),
    meta: {
      title: "Register - q8m",
      requiresGuest: true,
      layout: "auth",
    },
  },
  {
    path: "/quiz",
    name: "quiz",
    component: () =>
      import(
        /* webpackChunkName: "quiz" */
        "@/features/quiz/pages/QuizSelectionPage.vue"
      ),
    meta: {
      title: "Quiz Selection - q8m",
      requiresAuth: true,
      layout: "default",
    },
  },
  {
    path: "/quiz/:framework/:level",
    name: "quiz-take",
    component: () =>
      import(
        /* webpackChunkName: "quiz" */
        "@/features/quiz/pages/QuizPage.vue"
      ),
    meta: {
      title: "Quiz - q8m",
      requiresAuth: true,
      layout: "quiz",
    },
  },
  {
    path: "/account",
    name: "account",
    component: () =>
      import(
        /* webpackChunkName: "account" */
        "@/features/account/pages/AccountPage.vue"
      ),
    meta: {
      title: "Account - q8m",
      requiresAuth: true,
      layout: "default",
    },
  },
  {
    path: "/admin",
    name: "admin",
    component: () =>
      import(
        /* webpackChunkName: "admin" */
        "@/features/admin/pages/AdminDashboardPage.vue"
      ),
    meta: {
      title: "Admin Dashboard - q8m",
      requiresAuth: true,
      requiresRole: "admin",
      layout: "default",
    },
  },
  {
    path: "/unauthorized",
    name: "unauthorized",
    component: () =>
      import(
        /* webpackChunkName: "error" */
        "@/features/errors/pages/UnauthorizedPage.vue"
      ),
    meta: {
      title: "Unauthorized - q8m",
      layout: "default",
    },
  },
  {
    path: "/:pathMatch(.*)*",
    name: "not-found",
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

// Router guards
router.beforeEach(async (to, _from, next) => {
  const authStore = useAuthStore();

  // Initialize auth state if not already done
  if (!authStore.isInitialized) {
    await authStore.initializeAuth();
  }

  // Check if route requires authentication
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next({
      name: "login",
      query: { redirect: to.fullPath },
    });
    return;
  }

  // Check if route requires guest (not authenticated)
  if (to.meta.requiresGuest && authStore.isAuthenticated) {
    next({ name: "home" });
    return;
  }

  // Check if route requires specific role
  if (to.meta.requiresRole && !authStore.hasRole(to.meta.requiresRole as string)) {
    next({ name: "unauthorized" });
    return;
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
    const gtag = (
      window as {
        gtag: (command: string, targetId: string, config: Record<string, string>) => void;
      }
    ).gtag;
    gtag("config", "GA_MEASUREMENT_ID", {
      page_path: to.fullPath,
    });
  }
});

export default router;
