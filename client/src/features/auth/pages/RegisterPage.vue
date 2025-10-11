<template>
  <div class="register-page">
    <!-- Skip to main content for accessibility -->
    <a
      href="#main-content"
      class="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-blue-600 focus:px-4 focus:py-2 focus:text-white"
    >
      {{ $t("a11y.skipToMain") }}
    </a>

    <!-- Header Section -->
    <div class="register-header">
      <div class="container">
        <div class="header-content">
          <!-- Logo -->
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

          <!-- Title and Subtitle -->
          <h2 class="register-title">
            {{ $t("auth.register.title") }}
          </h2>
          <p class="register-subtitle">
            {{ $t("auth.register.subtitle") }}
          </p>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <main id="main-content" class="register-content">
      <div class="container">
        <div class="register-form-container">
          <RegisterForm
            @oauth-login="handleOAuthLogin"
            @registration-success="handleRegistrationSuccess"
          />
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from "vue-router";
import { useToast } from "@/composables/useToast";
import RegisterForm from "@/components/auth/RegisterForm.vue";

const router = useRouter();
const { authSuccess, info } = useToast();

function handleOAuthLogin(provider: "google") {
  // Redirect to OAuth endpoint on the backend
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";
  const oauthUrl = `${apiBaseUrl}/auth/${provider}`;

  // Store the current route (with query params) to redirect back after OAuth
  sessionStorage.setItem("oauth_redirect", window.location.pathname + window.location.search);

  // Redirect to OAuth provider
  window.location.href = oauthUrl;
}

async function handleRegistrationSuccess(email: string) {
  // Show success toast
  authSuccess("signup");
  
  // Show email verification notice
  info(
    "Verify your email",
    `We've sent a verification link to ${email}. Please check your inbox.`
  );
  
  // Navigate to login page with preserved params
  // After email verification and login, they'll be redirected to checkout
  const { query } = router.currentRoute.value;
  await router.replace({
    name: "login",
    query,
  });
  
  // Don't clear params yet - they'll be needed after login
}
</script>

<style scoped>
/* Page Layout */
.register-page {
  @apply min-h-screen bg-gray-50;
  @apply dark:bg-gray-900;
}

.container {
  @apply mx-auto max-w-7xl px-4 sm:px-6 lg:px-8;
}

/* Header Section */
.register-header {
  @apply border-b border-gray-200 bg-white;
  @apply dark:border-gray-700 dark:bg-gray-800;
}

.header-content {
  @apply py-8 text-center;
}

.logo-section {
  @apply mb-6 flex items-center justify-center gap-3;
}

.logo-icon {
  @apply h-10 w-10 rounded-lg bg-primary-600;
  @apply flex items-center justify-center text-white;
  @apply shadow-sm;
}

.logo-icon svg {
  @apply h-5 w-5;
}

.logo-text {
  @apply text-2xl font-bold text-gray-900;
  @apply dark:text-white;
}

.register-title {
  @apply mb-4 text-3xl font-bold text-gray-900;
  @apply dark:text-white;
  @apply sm:text-4xl;
}

.register-subtitle {
  @apply text-lg text-gray-600;
  @apply dark:text-gray-400;
  @apply mx-auto max-w-2xl;
}

/* Main Content */
.register-content {
  @apply py-12;
}

.register-form-container {
  @apply mx-auto max-w-md;
}

/* Responsive Design */
@media (max-width: 640px) {
  .register-title {
    @apply text-2xl;
  }

  .register-subtitle {
    @apply text-base;
  }

  .header-content {
    @apply py-6;
  }
}
</style>
