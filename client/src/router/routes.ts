import type { RouteRecordRaw } from "vue-router";

export const routes: RouteRecordRaw[] = [
  {
    path: "/",
    name: "home",
    component: () => import("@/features/home/views/HomeView.vue"),
    meta: {
      title: "Quiz Platform - Professional Interview Preparation",
      description: "Master frontend development with 500+ curated interview questions",
    },
  },
  {
    path: "/en",
    redirect: "/",
  },
  {
    path: "/ar",
    redirect: "/",
  },
  {
    path: "/en/:pathMatch(.*)*",
    name: "en-catch-all",
    component: () => import("@/features/home/views/HomeView.vue"),
    meta: {
      locale: "en",
    },
  },
  {
    path: "/ar/:pathMatch(.*)*",
    name: "ar-catch-all",
    component: () => import("@/features/home/views/HomeView.vue"),
    meta: {
      locale: "ar",
    },
  },
  // Auth routes
  {
    path: "/login",
    name: "login",
    component: () => import("@/features/auth/views/LoginView.vue"),
    meta: {
      title: "Login - Quiz Platform",
      requiresGuest: true,
    },
  },
  {
    path: "/register",
    name: "register",
    component: () => import("@/features/auth/views/RegisterView.vue"),
    meta: {
      title: "Register - Quiz Platform",
      requiresGuest: true,
    },
  },
  {
    path: "/auth/callback",
    name: "oauth-callback",
    component: () => import("@/features/auth/pages/OAuthCallbackPage.vue"),
    meta: {
      title: "Authenticating - Quiz Platform",
    },
  },
  // Pricing routes
  {
    path: "/subscribe",
    name: "subscribe",
    component: () => import("@/features/pricing/views/PricingView.vue"),
    meta: {
      title: "Subscribe - Quiz Platform",
      description: "Choose the perfect plan for your frontend interview preparation journey",
    },
  },
  // Payment routes
  {
    path: "/checkout",
    name: "checkout",
    component: () => import("@/features/checkout/pages/CheckoutPage.vue"),
    meta: {
      title: "Checkout - Quiz Platform",
      requiresAuth: true,
    },
  },
  {
    path: "/payment/success",
    name: "payment-success",
    component: () => import("@/features/payment/pages/PaymentSuccessPage.vue"),
    meta: {
      title: "Payment Successful - Quiz Platform",
      requiresAuth: true,
    },
  },
  {
    path: "/payment/error",
    name: "payment-error",
    component: () => import("@/features/payment/pages/PaymentErrorPage.vue"),
    meta: {
      title: "Payment Failed - Quiz Platform",
    },
  },
  // Quiz routes
  {
    path: "/quiz",
    name: "quiz",
    component: () => import("@/features/quiz/views/QuizSelectionView.vue"),
    meta: {
      title: "Quiz Selection - Quiz Platform",
      requiresAuth: true,
    },
  },
  {
    path: "/quiz/:framework/:level",
    name: "quiz-take",
    component: () => import("@/features/quiz/views/QuizView.vue"),
    meta: {
      title: "Quiz - Quiz Platform",
      requiresAuth: true,
    },
  },
  // Account routes
  {
    path: "/account",
    name: "account",
    component: () => import("@/features/account/views/AccountView.vue"),
    meta: {
      title: "Account - Quiz Platform",
      requiresAuth: true,
    },
  },
  {
    path: "/subscription",
    name: "subscription",
    component: () => import("@/features/account/pages/SubscriptionPage.vue"),
    meta: {
      title: "Subscription - Quiz Platform",
      requiresAuth: true,
    },
  },
  // Admin routes
  {
    path: "/admin",
    name: "admin",
    component: () => import("@/features/admin/views/AdminDashboardView.vue"),
    meta: {
      title: "Admin Dashboard - Quiz Platform",
      requiresAuth: true,
      requiresRole: "admin",
    },
  },
  // Error routes
  {
    path: "/unauthorized",
    name: "unauthorized",
    component: () => import("@/features/errors/views/UnauthorizedView.vue"),
    meta: {
      title: "Unauthorized - Quiz Platform",
    },
  },
  {
    path: "/:pathMatch(.*)*",
    name: "not-found",
    component: () => import("@/features/errors/views/NotFoundView.vue"),
    meta: {
      title: "Page Not Found - Quiz Platform",
    },
  },
];
