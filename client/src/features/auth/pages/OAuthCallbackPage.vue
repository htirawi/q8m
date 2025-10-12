<script setup lang="ts">
import { ref, onMounted } from "vue";

import { useRouter, useRoute } from "vue-router";

import { useAuthStore } from "@/stores/auth";
import { useAuthRedirect } from "@/composables/useAuthRedirect";

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();
const { getCurrentLocale } = useAuthRedirect();

const isLoading = ref(true);
const error = ref<string | null>(null);

onMounted(async () => {
  try {
    // Get query parameters
    const { success, error: errorParam, provider: _provider } = route.query;

    if (errorParam) {
      // Handle error from OAuth provider
      error.value = errorParam as string;
      isLoading.value = false;
      return;
    }

    if (success === "true") {
      // OAuth was successful, set dummy tokens and fetch user data
      authStore.setTokens({
        accessToken: "cookie-based",
        refreshToken: "cookie-based",
        expiresIn: 15 * 60,
      });

      await authStore.getCurrentUser();

      // Get the redirect path from session storage or default to quiz with locale
      const locale = getCurrentLocale();
      const defaultRedirect = `/${locale}/quiz`;
      const redirectPath = sessionStorage.getItem("oauth_redirect") || defaultRedirect;
      sessionStorage.removeItem("oauth_redirect");

      // Redirect to the original page or quiz selection
      setTimeout(() => {
        router.push(redirectPath);
      }, 1500);
    } else {
      error.value = "Authentication failed. Please try again.";
      isLoading.value = false;
    }
  } catch (err) {
    console.error("OAuth callback error:", err);
    error.value = "An unexpected error occurred. Please try again.";
    isLoading.value = false;
  }
});

function handleRetry() {
  // Redirect back to register page with locale
  const locale = getCurrentLocale();
  router.push({
    name: "register",
    params: { locale },
  });
}
</script>

<template>
  <div class="oauth-callback-page">
    <div class="callback-container">
      <div v-if="isLoading" class="loading-state">
        <div class="spinner"></div>
        <h2 class="loading-title">{{ $t("auth.oauth.processing") }}</h2>
        <p class="loading-subtitle">{{ $t("auth.oauth.pleaseWait") }}</p>
      </div>

      <div v-else-if="error" class="error-state">
        <div class="error-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="15" y1="9" x2="9" y2="15" />
            <line x1="9" y1="9" x2="15" y2="15" />
          </svg>
        </div>
        <h2 class="error-title">{{ $t("auth.oauth.error") }}</h2>
        <p class="error-message">{{ error }}</p>
        <button @click="handleRetry" class="retry-button">
          {{ $t("auth.oauth.tryAgain") }}
        </button>
      </div>

      <div v-else class="success-state">
        <div class="success-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10" />
            <path d="M9 12l2 2 4-4" />
          </svg>
        </div>
        <h2 class="success-title">{{ $t("auth.oauth.success") }}</h2>
        <p class="success-message">{{ $t("auth.oauth.redirecting") }}</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Main Layout */
.oauth-callback-page {
  @apply relative min-h-screen flex items-center justify-center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

/* Container */
.callback-container {
  @apply max-w-md w-full mx-auto px-4;
}

/* Loading State */
.loading-state {
  @apply text-center bg-white/95 backdrop-blur-sm rounded-2xl p-12;
  @apply border border-white/20 shadow-2xl;
  @apply dark:bg-slate-900/95 dark:border-slate-700/50;
}

.spinner {
  @apply mx-auto mb-6 w-16 h-16 border-4 border-primary-200 border-t-primary-600;
  @apply rounded-full animate-spin;
}

.loading-title {
  @apply text-2xl font-bold text-gray-900 mb-2;
  @apply dark:text-white;
}

.loading-subtitle {
  @apply text-gray-600;
  @apply dark:text-gray-400;
}

/* Error State */
.error-state {
  @apply text-center bg-white/95 backdrop-blur-sm rounded-2xl p-12;
  @apply border border-white/20 shadow-2xl;
  @apply dark:bg-slate-900/95 dark:border-slate-700/50;
}

.error-icon {
  @apply mx-auto mb-6 w-16 h-16 text-red-500;
}

.error-icon svg {
  @apply w-full h-full;
}

.error-title {
  @apply text-2xl font-bold text-gray-900 mb-2;
  @apply dark:text-white;
}

.error-message {
  @apply text-gray-600 mb-6;
  @apply dark:text-gray-400;
}

.retry-button {
  @apply px-6 py-3 bg-primary-600 text-white font-medium rounded-xl;
  @apply hover:bg-primary-700 focus:outline-none focus:ring-4 focus:ring-primary-500/20;
  @apply transition-all duration-200;
}

/* Success State */
.success-state {
  @apply text-center bg-white/95 backdrop-blur-sm rounded-2xl p-12;
  @apply border border-white/20 shadow-2xl;
  @apply dark:bg-slate-900/95 dark:border-slate-700/50;
}

.success-icon {
  @apply mx-auto mb-6 w-16 h-16 text-green-500;
}

.success-icon svg {
  @apply w-full h-full;
}

.success-title {
  @apply text-2xl font-bold text-gray-900 mb-2;
  @apply dark:text-white;
}

.success-message {
  @apply text-gray-600;
  @apply dark:text-gray-400;
}

/* Animation */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.callback-container > div {
  animation: fadeIn 0.4s ease-out;
}
</style>
