<template>
  <div class="register-page">
    <!-- Main Content - Clean white background like in screenshot -->
    <main class="register-main">
      <div class="register-container">
        <!-- Logo Section -->
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
        <div class="title-section">
          <h2 class="main-title">
            {{ $t("auth.register.title") }}
          </h2>
          <p class="subtitle">
            {{ $t("auth.register.subtitle") }}
          </p>
        </div>

        <!-- Form Section -->
        <div class="form-section">
          <RegisterForm
            @oauth-login="handleOAuthLogin"
            @registration-success="handleRegistrationSuccess"
            @show-login="handleShowLogin"
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
  // Store the current route (with query params) to redirect back after OAuth
  sessionStorage.setItem("oauth_redirect", window.location.pathname + window.location.search);

  // Redirect to OAuth endpoint on the backend
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";
  const oauthUrl = `${apiBaseUrl}/auth/${provider}`;
  window.location.href = oauthUrl;
}

function handleRegistrationSuccess(_email: string) {
  authSuccess("signup");
  info("Check your email", "Please check your inbox and click the verification link to complete registration.");

  // Navigate to login page while preserving query params
  const { query } = router.currentRoute.value;
  router.replace({
    name: "login",
    query,
  });

  // Don't clear params yet - they'll be needed after login
}

function handleShowLogin() {
  // Navigate to login page while preserving query params
  const { query } = router.currentRoute.value;
  router.push({
    name: "login",
    query,
  });
}
</script>

<style scoped>
/* Main Layout - Clean white background like in screenshot */
.register-page {
  @apply min-h-screen bg-white;
  @apply dark:bg-gray-900;
}

/* Main Content - Centered layout */
.register-main {
  @apply flex min-h-screen items-center justify-center px-4 py-12;
}

.register-container {
  @apply w-full max-w-md space-y-8;
}

/* Logo Section - Centered with proper spacing */
.logo-section {
  @apply flex items-center justify-center gap-3;
}

.logo-icon {
  @apply h-10 w-10 rounded-lg bg-blue-600;
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

/* Title Section - Professional typography */
.title-section {
  @apply text-center;
}

.main-title {
  @apply text-2xl font-bold text-gray-900;
  @apply dark:text-white;
  @apply sm:text-3xl;
  @apply mb-4;
}

.subtitle {
  @apply text-base text-gray-600;
  @apply dark:text-gray-400;
  @apply leading-relaxed;
}

/* Form Section */
.form-section {
  @apply space-y-6;
}

/* Responsive Design */
@media (max-width: 640px) {
  .main-title {
    @apply text-xl;
  }

  .subtitle {
    @apply text-sm;
  }

  .register-container {
    @apply max-w-sm;
  }
}
</style>
