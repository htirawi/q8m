<template>
  <div class="login-page">
    <!-- Background with gradient -->
    <div class="login-background">
      <div class="background-pattern"></div>
      <div class="background-gradient"></div>
    </div>

    <!-- Main Content -->
    <div class="login-container">
      <!-- Header Section -->
      <div class="login-header">
        <div class="logo-section">
          <div class="logo-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
          </div>
          <h1 class="logo-text">q8m</h1>
        </div>

        <div class="welcome-section">
          <h2 class="welcome-title">
            {{ $t("auth.login.welcomeBack") }}
          </h2>
          <p class="welcome-subtitle">
            {{ $t("auth.login.subtitle") }}
          </p>
        </div>
      </div>

      <!-- Form Section -->
      <div class="login-form-container">
        <div class="form-card">
          <LoginForm
            @oauth-login="handleOAuthLogin"
            @login-success="handleLoginSuccess"
            @show-register="handleShowRegister"
            @show-forgot-password="handleShowForgotPassword"
          />
        </div>
      </div>

      <!-- Footer Section -->
      <div class="login-footer">
        <div class="trust-indicators">
          <div class="trust-item">
            <svg
              class="trust-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path d="M9 12l2 2 4-4" />
              <path d="M21 12c-1 0-3-1-3-3s2-3 3-3 3 1 3 3-2 3-3 3" />
              <path d="M3 12c1 0 3-1 3-3s-2-3-3-3-3 1-3 3 2 3 3 3" />
            </svg>
            <span class="trust-text">{{ $t("auth.login.secure") }}</span>
          </div>
          <div class="trust-item">
            <svg
              class="trust-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
            </svg>
            <span class="trust-text">{{ $t("auth.login.fast") }}</span>
          </div>
          <div class="trust-item">
            <svg
              class="trust-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            <span class="trust-text">{{ $t("auth.login.support") }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from "vue-router";
import { useCheckoutRedirect } from "@/composables/useCheckoutRedirect";
import { useToast } from "@/composables/useToast";
import LoginForm from "@/components/auth/LoginForm.vue";

const router = useRouter();
const { checkoutUrl, clearParams } = useCheckoutRedirect();
const { authSuccess } = useToast();

function handleOAuthLogin(provider: "google") {
  // Redirect to OAuth endpoint on the backend
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";
  const oauthUrl = `${apiBaseUrl}/auth/${provider}`;

  // Store the current route (with query params) to redirect back after OAuth
  sessionStorage.setItem("oauth_redirect", window.location.pathname + window.location.search);

  // Redirect to OAuth provider
  window.location.href = oauthUrl;
}

async function handleLoginSuccess() {
  // Show success toast
  authSuccess("login");

  // Navigate to checkout with preserved params
  await router.replace(checkoutUrl.value);

  // Clear stored params after successful redirect
  clearParams();
}

function handleShowRegister() {
  // Navigate to register page while preserving query params
  const { query } = router.currentRoute.value;
  router.push({
    name: "register",
    query,
  });
}

function handleShowForgotPassword() {
  // Navigate to forgot password page
  router.push({
    name: "forgot-password",
  });
}
</script>

<style scoped>
/* Main Layout */
.login-page {
  @apply relative min-h-screen overflow-hidden;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

/* Background Elements */
.login-background {
  @apply absolute inset-0;
}

.background-pattern {
  @apply absolute inset-0 opacity-10;
  background-image:
    radial-gradient(circle at 25% 25%, rgba(255, 255, 255, 0.2) 0%, transparent 50%),
    radial-gradient(circle at 75% 75%, rgba(255, 255, 255, 0.1) 0%, transparent 50%);
}

.background-gradient {
  @apply absolute inset-0;
  background: linear-gradient(
    135deg,
    rgba(102, 126, 234, 0.8) 0%,
    rgba(118, 75, 162, 0.8) 50%,
    rgba(59, 130, 246, 0.8) 100%
  );
}

/* Main Container */
.login-container {
  @apply relative z-10 flex min-h-screen flex-col;
  @apply px-4 py-8 sm:px-6 lg:px-8;
}

/* Header Section */
.login-header {
  @apply mb-8 text-center;
}

.logo-section {
  @apply mb-6 flex items-center justify-center gap-3;
}

.logo-icon {
  @apply h-12 w-12 rounded-xl bg-white/20 backdrop-blur-sm;
  @apply flex items-center justify-center text-white;
  @apply shadow-lg;
}

.logo-icon svg {
  @apply h-6 w-6;
}

.logo-text {
  @apply text-3xl font-bold text-white;
  @apply drop-shadow-lg;
}

.welcome-section {
  @apply mx-auto max-w-2xl;
}

.welcome-title {
  @apply mb-4 text-4xl font-bold text-white;
  @apply drop-shadow-lg;
  @apply sm:text-5xl;
}

.welcome-subtitle {
  @apply text-xl leading-relaxed text-white/90;
  @apply drop-shadow-md;
  @apply sm:text-2xl;
}

/* Form Container */
.login-form-container {
  @apply flex flex-1 items-center justify-center;
  @apply mx-auto w-full max-w-md;
}

.form-card {
  @apply w-full rounded-2xl bg-white/95 backdrop-blur-sm;
  @apply border border-white/20 shadow-2xl;
  @apply p-8;
  @apply dark:border-slate-700/50 dark:bg-slate-900/95;
}

/* Footer Section */
.login-footer {
  @apply mt-8;
}

.trust-indicators {
  @apply flex flex-wrap justify-center gap-6;
  @apply text-white/80;
}

.trust-item {
  @apply flex items-center gap-2;
  @apply text-sm font-medium;
}

.trust-icon {
  @apply h-5 w-5;
}

.trust-text {
  @apply drop-shadow-sm;
}

/* Responsive Design */
@media (max-width: 640px) {
  .welcome-title {
    @apply text-3xl;
  }

  .welcome-subtitle {
    @apply text-lg;
  }

  .form-card {
    @apply p-6;
  }

  .trust-indicators {
    @apply gap-4;
  }
}

/* Dark Mode Adjustments */
@media (prefers-color-scheme: dark) {
  .login-page {
    background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
  }

  .background-gradient {
    background: linear-gradient(
      135deg,
      rgba(30, 41, 59, 0.9) 0%,
      rgba(51, 65, 85, 0.9) 50%,
      rgba(59, 130, 246, 0.8) 100%
    );
  }
}

/* Animation */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.login-header,
.login-form-container,
.login-footer {
  animation: fadeInUp 0.6s ease-out;
}

.login-form-container {
  animation-delay: 0.2s;
}

.login-footer {
  animation-delay: 0.4s;
}
</style>
