<template>
  <div class="oauth-section">
    <button
      type="button"
      @click="handleOAuthLogin('google')"
      :disabled="isLoading"
      class="oauth-button google-button"
    >
      <svg class="oauth-icon" viewBox="0 0 24 24">
        <path
          fill="#4285F4"
          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        />
        <path
          fill="#34A853"
          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        />
        <path
          fill="#FBBC05"
          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        />
        <path
          fill="#EA4335"
          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        />
      </svg>
      {{ $t("auth.register.continueWithGoogle") }}
    </button>

    <button
      type="button"
      @click="handleOAuthLogin('facebook')"
      :disabled="isLoading"
      class="oauth-button facebook-button"
    >
      <svg class="oauth-icon" fill="#1877F2" viewBox="0 0 24 24">
        <path
          d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"
        />
      </svg>
      {{ $t("auth.register.continueWithFacebook") }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";

interface Props {
  isLoading: boolean;
}

defineProps<Props>();

const emit = defineEmits<{
  "oauth-login": [provider: "google" | "facebook"];
}>();

useI18n();

const handleOAuthLogin = (provider: "google" | "facebook") => {
  emit("oauth-login", provider);
};
</script>

<style scoped>
/* OAuth Section */
.oauth-section {
  @apply space-y-3;
}

.oauth-button {
  @apply flex w-full items-center justify-center gap-3 px-4 py-3;
  @apply rounded-xl border-2 font-medium transition-all duration-200;
  @apply focus:outline-none focus:ring-4 focus:ring-offset-2;
  @apply disabled:cursor-not-allowed disabled:opacity-50;
}

.google-button {
  @apply border-gray-300 bg-white text-gray-700;
  @apply hover:border-gray-400 hover:bg-gray-50;
  @apply focus:ring-gray-500/20;
  @apply dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300;
  @apply dark:hover:border-gray-500 dark:hover:bg-gray-700;
}

.facebook-button {
  @apply border-blue-600 bg-blue-600 text-white;
  @apply hover:border-blue-700 hover:bg-blue-700;
  @apply focus:ring-blue-500/20;
}

.oauth-icon {
  @apply h-5 w-5;
}
</style>
