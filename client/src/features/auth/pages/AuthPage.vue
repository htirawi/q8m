<template>
  <div class="auth-page">
    <!-- Skip to main content for accessibility -->
    <a
      href="#main-content"
      class="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-blue-600 focus:px-4 focus:py-2 focus:text-white"
    >
      {{ $t("a11y.skipToMain") }}
    </a>

    <!-- Main Content -->
    <main id="main-content" class="auth-content">
      <div class="auth-container">
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
            {{ $t(`auth.${mode}.${mode === 'login' ? 'welcomeBack' : 'title'}`) }}
          </h2>
          <p class="subtitle">
            {{ $t(`auth.${mode}.subtitle`) }}
          </p>
        </div>

        <!-- Form Container -->
        <div class="form-section">
          <!-- Dynamic Form Component based on mode -->
          <LoginForm
            v-if="mode === 'login'"
            @oauth-login="handleOAuthLogin"
            @login-success="handleLoginSuccess"
            @show-register="handleShowRegister"
            @show-forgot-password="handleShowForgotPassword"
          />
          <RegisterForm
            v-else-if="mode === 'register'"
            @oauth-login="handleOAuthLogin"
            @registration-success="handleRegistrationSuccess"
          />
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useCheckoutRedirect } from "@/composables/useCheckoutRedirect";
import { useToast } from "@/composables/useToast";
import LoginForm from "@/components/auth/LoginForm.vue";
import RegisterForm from "@/components/auth/RegisterForm.vue";

const route = useRoute();

// Determine mode from route name
const mode = computed(() => {
  return route.name === "login" ? "login" : "register";
});
const router = useRouter();
const { checkoutUrl, clearParams } = useCheckoutRedirect();
const { authSuccess, info } = useToast();

// OAuth Login Handler
function handleOAuthLogin(provider: "google") {
  // Redirect to OAuth endpoint on the backend
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";
  const oauthUrl = `${apiBaseUrl}/auth/${provider}`;

  // Store the current route (with query params) to redirect back after OAuth
  sessionStorage.setItem("oauth_redirect", window.location.pathname + window.location.search);

  // Redirect to OAuth provider
  window.location.href = oauthUrl;
}

// Login Success Handler
async function handleLoginSuccess() {
  // Show success toast
  authSuccess("login");
  
  // Navigate to checkout with preserved params
  await router.replace(checkoutUrl.value);
  
  // Clear stored params after successful redirect
  clearParams();
}

// Registration Success Handler
function handleRegistrationSuccess(_email: string) {
  // Show success toast
  authSuccess("signup");
  
  // Show info toast for email verification
  info("Check your email", "Please check your inbox and click the verification link to complete registration.");

  // Navigate to login page while preserving query params
  const { query } = route;
  router.replace({ 
    name: "login", 
    query 
  });
  
  // Don't clear params yet - they'll be needed after login
}

// Navigation Handlers
function handleShowRegister() {
  // Navigate to register page while preserving query params
  const { query } = route;
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
/* Page Layout - Clean white background like in screenshot */
.auth-page {
  @apply min-h-screen bg-white;
  @apply dark:bg-gray-900;
}

/* Main Content - Centered layout */
.auth-content {
  @apply flex min-h-screen items-center justify-center px-4 py-12;
}

.auth-container {
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

  .auth-container {
    @apply max-w-sm;
  }
}
</style>
