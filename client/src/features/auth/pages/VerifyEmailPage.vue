<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";

import { useAuthRedirect } from "@/composables/useAuthRedirect";
import { API_ENDPOINTS } from "@/config/api";

const route = useRoute();
const router = useRouter();
const { getCurrentLocale } = useAuthRedirect();

const isVerifying = ref(true);
const isSuccess = ref(false);
const errorMessage = ref<string | null>(null);

onMounted(async () => {
  // Check for error from backend redirect
  const error = route.query.error as string | undefined;

  if (error === "invalid_token") {
    errorMessage.value = "Invalid or expired verification link";
    isVerifying.value = false;
    return;
  }

  try {
    // Call verification endpoint using secure session cookie
    // No token in URL - token is in httpOnly cookie set by backend
    const response = await fetch(API_ENDPOINTS.auth.verifyEmail(), {
      method: "POST",
      credentials: "include", // Send httpOnly cookies
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Email verification failed");
    }

    isSuccess.value = true;
    // Redirect to login after 3 seconds
    setTimeout(() => {
      const locale = getCurrentLocale();
      router.push({
        path: `/${locale}/login`,
        query: { verified: "true" },
      });
    }, 3000);
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : "Email verification failed";
  } finally {
    isVerifying.value = false;
  }
});

function handleGoToLogin() {
  const locale = getCurrentLocale();
  router.push({
    path: `/${locale}/login`,
  });
}

function handleResendVerification() {
  const locale = getCurrentLocale();
  router.push({
    path: `/${locale}/login`,
    query: { resend: "true" },
  });
}

</script>

<template>
  <div class="verify-email-page">
    <!-- Background with gradient -->
    <div class="verify-background">
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
    <div class="verify-container">
      <div class="verify-card">
        <!-- Verifying State -->
        <div v-if="isVerifying" class="state-content">
          <div class="spinner-container">
            <div class="spinner"></div>
          </div>
          <h2 class="state-title">{{ $t("auth.verify.verifying") }}

</h2>
          <p class="state-description">
            {{ $t("auth.verify.pleaseWait") }}

          </p>
        </div>

        <!-- Success State -->
        <div v-else-if="isSuccess" class="state-content">
          <div class="icon-container success">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              class="icon-check"
            >
              <path d="M20 6L9 17l-5-5" />
            </svg>
          </div>
          <h2 class="state-title success">{{ $t("auth.verify.success") }}

</h2>
          <p class="state-description">
            {{ $t("auth.verify.successMessage") }}

          </p>
          <p class="redirect-message">
            {{ $t("auth.verify.redirecting") }}

          </p>
        </div>

        <!-- Error State -->
        <div v-else class="state-content">
          <div class="icon-container error">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              class="icon-error"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="15" y1="9" x2="9" y2="15" />
              <line x1="9" y1="9" x2="15" y2="15" />
            </svg>
          </div>
          <h2 class="state-title error">{{ $t("auth.verify.error") }}

</h2>
          <p class="state-description error-text">
            {{ errorMessage }}

          </p>

          <div class="action-buttons">
            <button class="btn btn-primary" @click="handleGoToLogin">
              {{ $t("auth.verify.goToLogin") }}

            </button>
            <button class="btn btn-secondary" @click="handleResendVerification">
              {{ $t("auth.verify.resendEmail") }}

            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Main Layout */
.verify-email-page {
  @apply relative min-h-screen overflow-hidden;

  background: linear-gradient(135deg, #f8f9ff 0%, #f0f4ff 100%);
}

/* Background Elements */
.verify-background {
  @apply absolute inset-0;
}

.background-pattern {
  @apply absolute inset-0 opacity-30;

  background-image:
    radial-gradient(circle at 20% 20%, rgb(99, 102, 241, 0.08) 0%, transparent 50%),
    radial-gradient(circle at 80% 80%, rgb(139, 92, 246, 0.06) 0%, transparent 50%);
}

.background-gradient {
  @apply absolute inset-0;

  background: linear-gradient(
    135deg,
    rgb(248, 249, 255, 0.95) 0%,
    rgb(240, 244, 255, 0.95) 100%
  );
}

/* Brand Header */
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
.verify-container {
  @apply relative z-10 flex flex-col items-center justify-center;
  @apply px-4 pb-12 sm:px-6 lg:px-8;
  @apply max-w-7xl mx-auto;

  min-height: calc(100vh - 140px);
}

.verify-card {
  @apply w-full max-w-md rounded-2xl bg-white;
  @apply border border-gray-100;
  @apply p-10;

  box-shadow:
    0 0 0 1px rgb(0, 0, 0, 0.02),
    0 4px 6px -1px rgb(0, 0, 0, 0.04),
    0 10px 15px -3px rgb(0, 0, 0, 0.06),
    0 20px 25px -5px rgb(0, 0, 0, 0.04);
}

/* State Content */
.state-content {
  @apply flex flex-col items-center text-center;
}

.spinner-container {
  @apply mb-6;
}

.spinner {
  @apply h-16 w-16 rounded-full;

  border: 4px solid #e5e7eb;
  border-top-color: #6366f1;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.icon-container {
  @apply mb-6 h-20 w-20 rounded-full;
  @apply flex items-center justify-center;
}

.icon-container.success {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  box-shadow: 0 4px 14px rgb(16, 185, 129, 0.3);
}

.icon-container.error {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  box-shadow: 0 4px 14px rgb(239, 68, 68, 0.3);
}

.icon-check,
.icon-error {
  @apply h-10 w-10;

  color: white;
  stroke-width: 3;
}

.state-title {
  @apply mb-3 text-3xl font-bold;

  color: #1e293b;
}

.state-title.success {
  color: #059669;
}

.state-title.error {
  color: #dc2626;
}

.state-description {
  @apply text-base text-gray-600;
  @apply mb-6;
}

.error-text {
  color: #dc2626;
}

.redirect-message {
  @apply text-sm text-gray-500;
  @apply animate-pulse;
}

/* Action Buttons */
.action-buttons {
  @apply flex flex-col gap-3 w-full;
  @apply mt-4;
}

.btn {
  @apply w-full px-4 py-3 rounded-lg;
  @apply font-medium transition-all duration-200;
  @apply focus:outline-none focus:ring-2 focus:ring-offset-2;
}

.btn-primary {
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  color: white;
  box-shadow: 0 2px 8px rgb(99, 102, 241, 0.3);
}

.btn-primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgb(99, 102, 241, 0.4);
}

.btn-primary:focus {
  @apply ring-indigo-500;
}

.btn-secondary {
  @apply bg-white border-2 border-gray-200;

  color: #475569;
}

.btn-secondary:hover {
  @apply bg-gray-50 border-gray-300;
}

.btn-secondary:focus {
  @apply ring-gray-400;
}

/* Responsive Design */
@media (width <= 640px) {
  .verify-card {
    @apply p-6;
  }

  .state-title {
    @apply text-2xl;
  }

  .icon-container {
    @apply h-16 w-16;
  }

  .icon-check,
  .icon-error {
    @apply h-8 w-8;
  }
}

/* Dark Mode */
@media (prefers-color-scheme: dark) {
  .verify-email-page {
    background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
  }

  .background-pattern {
    @apply opacity-20;
  }

  .background-gradient {
    background: linear-gradient(
      135deg,
      rgb(30, 41, 59, 0.95) 0%,
      rgb(51, 65, 85, 0.95) 100%
    );
  }

  .verify-card {
    @apply bg-slate-800 border-slate-700;

    box-shadow:
      0 0 0 1px rgb(255, 255, 255, 0.08),
      0 4px 6px -1px rgb(0, 0, 0, 0.3),
      0 10px 15px -3px rgb(0, 0, 0, 0.4),
      0 20px 25px -5px rgb(0, 0, 0, 0.3);
  }

  .state-title {
    color: #f8fafc;
  }

  .state-description {
    color: #cbd5e1;
  }

  .btn-secondary {
    @apply bg-slate-700 border-slate-600;

    color: #e2e8f0;
  }

  .btn-secondary:hover {
    @apply bg-slate-600 border-slate-500;
  }

  .spinner {
    border-color: #475569;
    border-top-color: #818cf8;
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
.verify-card {
  animation: fadeInUp 0.6s ease-out;
}

.verify-card {
  animation-delay: 0.1s;
}
</style>
