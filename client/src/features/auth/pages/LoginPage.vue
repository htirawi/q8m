<script setup lang="ts">
import { useRouter, useRoute } from "vue-router";

import AuthenticationForm from "@/components/auth/AuthenticationForm.vue";
import { useAuthRedirect } from "@/composables/useAuthRedirect";
import { usePostLoginRouter } from "@/composables/usePostLoginRouter";

const router = useRouter();
const route = useRoute();
const { getCurrentLocale } = useAuthRedirect();
const { routeAfterLogin } = usePostLoginRouter();

function handleOAuthLogin(provider: "google") {
  // Redirect to OAuth endpoint on the backend
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";
  const oauthUrl = `${apiBaseUrl}/auth/${provider}`;

  // Store the intended redirect URL (from signInSuccessUrl query param) or default to study
  const signInSuccessUrl = route.query.signInSuccessUrl as string | undefined;
  const locale = getCurrentLocale();
  const redirectPath = signInSuccessUrl || `/${locale}/study/easy`;
  sessionStorage.setItem("oauth_redirect", redirectPath);

  // Redirect to OAuth provider
  window.location.href = oauthUrl;
}

async function handleLoginSuccess() {
  // Use plan-based post-login routing
  await routeAfterLogin();
}

function handleRegistrationSuccess(_email: string) {
  // After successful registration, redirect to login page with success message
  // No sensitive data stored or exposed in URL
  const locale = getCurrentLocale();
  router.push({
    path: `/${locale}/login`,
    query: { registered: "true" },
  });
}
</script>

<template>
  <div class="login-page">
    <!-- Background with gradient -->
    <div class="login-background">
      <div class="background-pattern"></div>
      <div class="background-gradient"></div>
    </div>

    <!-- Top Brand Header -->
    <div class="brand-header">
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
    </div>

    <!-- Main Content -->
    <div class="login-container">
      <!-- Welcome Section -->
      <div class="welcome-section">
        <h2 class="welcome-title">
          {{ $t("auth.unified.title") }}
        </h2>
        <p class="welcome-subtitle">
          {{ $t("auth.unified.subtitle") }}
        </p>
      </div>

      <!-- Form Section -->
      <div class="login-form-container">
        <div class="form-card">
          <AuthenticationForm
            @oauth-login="handleOAuthLogin"
            @login-success="handleLoginSuccess"
            @registration-success="handleRegistrationSuccess"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Main Layout */
.login-page {
  @apply relative min-h-screen overflow-hidden;
  background: linear-gradient(135deg, #f8f9ff 0%, #f0f4ff 100%);
}

/* Background Elements */
.login-background {
  @apply absolute inset-0;
}

.background-pattern {
  @apply absolute inset-0 opacity-30;
  background-image:
    radial-gradient(circle at 20% 20%, rgba(99, 102, 241, 0.08) 0%, transparent 50%),
    radial-gradient(circle at 80% 80%, rgba(139, 92, 246, 0.06) 0%, transparent 50%);
}

.background-gradient {
  @apply absolute inset-0;
  background: linear-gradient(
    135deg,
    rgba(248, 249, 255, 0.95) 0%,
    rgba(240, 244, 255, 0.95) 100%
  );
}

/* Brand Header at Top */
.brand-header {
  @apply relative z-10 pt-8 pb-6;
  @apply px-4 sm:px-6 lg:px-8;
}

.logo-section {
  @apply flex items-center justify-center gap-3;
  @apply max-w-7xl mx-auto;
}

.logo-icon {
  @apply h-11 w-11 rounded-xl;
  @apply flex items-center justify-center;
  @apply shadow-sm;
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  color: white;
}

.logo-icon svg {
  @apply h-6 w-6;
}

.logo-text {
  @apply text-3xl font-bold;
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* Main Container */
.login-container {
  @apply relative z-10 flex flex-col items-center justify-center;
  @apply px-4 pb-12 sm:px-6 lg:px-8;
  @apply max-w-7xl mx-auto;
  min-height: calc(100vh - 140px);
}

.welcome-section {
  @apply mb-8 text-center;
  @apply mx-auto max-w-2xl;
}

.welcome-title {
  @apply mb-3 text-4xl font-bold;
  @apply sm:text-5xl;
  color: #1e293b;
  font-weight: 700;
  letter-spacing: -0.02em;
}

.welcome-subtitle {
  @apply text-lg leading-relaxed;
  @apply sm:text-xl;
  color: #64748b;
  font-weight: 400;
}

/* Form Container */
.login-form-container {
  @apply mx-auto w-full max-w-md;
}

.form-card {
  @apply w-full rounded-2xl bg-white;
  @apply border border-gray-100;
  @apply p-10;
  box-shadow:
    0 0 0 1px rgba(0, 0, 0, 0.02),
    0 4px 6px -1px rgba(0, 0, 0, 0.04),
    0 10px 15px -3px rgba(0, 0, 0, 0.06),
    0 20px 25px -5px rgba(0, 0, 0, 0.04);
}

/* Responsive Design */
@media (max-width: 640px) {
  .welcome-title {
    @apply text-3xl;
  }

  .welcome-subtitle {
    @apply text-base;
  }

  .form-card {
    @apply p-6;
  }
}

/* Dark Mode Adjustments */
@media (prefers-color-scheme: dark) {
  .login-page {
    background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
  }

  .background-pattern {
    @apply opacity-20;
  }

  .background-gradient {
    background: linear-gradient(
      135deg,
      rgba(30, 41, 59, 0.95) 0%,
      rgba(51, 65, 85, 0.95) 100%
    );
  }

  .welcome-title {
    color: #f8fafc;
  }

  .welcome-subtitle {
    color: #cbd5e1;
  }

  .form-card {
    @apply bg-slate-800 border-slate-700;
    box-shadow:
      0 0 0 1px rgba(255, 255, 255, 0.08),
      0 4px 6px -1px rgba(0, 0, 0, 0.3),
      0 10px 15px -3px rgba(0, 0, 0, 0.4),
      0 20px 25px -5px rgba(0, 0, 0, 0.3);
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

.brand-header,
.welcome-section,
.login-form-container {
  animation: fadeInUp 0.6s ease-out;
}

.welcome-section {
  animation-delay: 0.1s;
}

.login-form-container {
  animation-delay: 0.2s;
}
</style>
