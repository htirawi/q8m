<template>
  <div class="login-form">
    <div class="form-header">
      <h2 class="text-2xl font-bold text-gray-900 dark:text-gray-100">
        {{ $t("auth.login.title") }}

      </h2>
      <p class="mt-2 text-gray-600 dark:text-gray-400">
        {{ $t("auth.login.subtitle") }}

      </p>
    </div>

    <form @submit.prevent="handleSubmit" class="space-y-6">
      <!-- Email Field -->
      <div>
        <label for="email" class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
          {{ $t("auth.fields.email") }}
        </label>
        <input id="email" v-model="formData.email" type="email" autocomplete="email" required class="input w-full"
          :class="{ 'border-error-500 focus:border-error-500 focus:ring-error-500': errors.email }"
          :placeholder="$t('auth.fields.emailPlaceholder')" />
        <p v-if="errors.email" class="form-error mt-1">{{ errors.email }}

        </p>
      </div>

      <!-- Password Field -->
      <div>
        <label for="password" class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
          {{ $t("auth.fields.password") }}
        </label>
        <div class="relative">
          <input id="password" v-model="formData.password" :type="showPassword ? 'text' : 'password'"
            autocomplete="current-password" required class="input w-full pr-10" :class="{
              'border-error-500 focus:border-error-500 focus:ring-error-500': errors.password,
            }" :placeholder="$t('auth.fields.passwordPlaceholder')" />
          <button type="button" @click="showPassword = !showPassword"
            class="absolute inset-y-0 right-0 flex items-center pr-3">
            <EyeIcon v-if="!showPassword" class="h-5 w-5 text-gray-400 hover:text-gray-600" />
            <EyeSlashIcon v-else class="h-5 w-5 text-gray-400 hover:text-gray-600" />
          </button>
        </div>
        <p v-if="errors.password" class="form-error mt-1">{{ errors.password }}

        </p>
      </div>

      <!-- Remember Me & Forgot Password -->
      <div class="flex items-center justify-between">
        <label class="flex items-center">
          <input v-model="formData.rememberMe" type="checkbox"
            class="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
          <span class="ml-2 text-sm text-gray-700 dark:text-gray-300">
            {{ $t("auth.login.rememberMe") }}

          </span>
        </label>

        <button type="button" @click="$emit('show-forgot-password')"
          class="text-sm text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300">
          {{ $t("auth.login.forgotPassword") }}
        </button>
      </div>

      <!-- Submit Button -->
      <button type="submit" :disabled="isLoading || !isFormValid" class="btn-primary w-full">
        <span v-if="isLoading" class="flex items-center justify-center">
          <svg class="-ml-1 mr-3 h-5 w-5 animate-spin text-white" xmlns="http://www.w3.org/2000/svg" fill="none"
            viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
            </path>
          </svg>
          {{ $t("auth.login.signingIn") }}

        </span>
        <span v-else>{{ $t("auth.login.signIn") }}

        </span>
      </button>

      <!-- Error Message -->
      <div v-if="error"
        class="rounded-lg border border-error-200 bg-error-50 px-4 py-3 text-error-700 dark:border-error-800 dark:bg-error-900/20 dark:text-error-400">
        {{ error }}

      </div>
    </form>

    <!-- Divider -->
    <div class="mt-6">
      <div class="relative">
        <div class="absolute inset-0 flex items-center">
          <div class="w-full border-t border-gray-300 dark:border-gray-600" />
        </div>
        <div class="relative flex justify-center text-sm">
          <span class="bg-white px-2 text-gray-500 dark:bg-gray-900 dark:text-gray-400">
            {{ $t("auth.login.orContinueWith") }}

          </span>
        </div>
      </div>
    </div>

    <!-- OAuth Buttons -->
    <div class="mt-6">
      <button type="button" @click="$emit('oauth-login', 'google')" :disabled="isLoading"
        class="btn-secondary flex w-full items-center justify-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700">
        <svg class="mr-2 h-5 w-5" viewBox="0 0 24 24">
          <path fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
          <path fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
          <path fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
          <path fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
        </svg>
        {{ $t("auth.login.google") }}

      </button>
    </div>

    <!-- Sign Up Link -->
    <div class="mt-6 text-center">
      <p class="text-sm text-gray-600 dark:text-gray-400">
        {{ $t("auth.login.noAccount") }}

        <button type="button" @click="$emit('show-register')"
          class="font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300">
          {{ $t("auth.login.signUp") }}

        </button>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive } from "vue";
import { useI18n } from "vue-i18n";
import { EyeIcon, EyeSlashIcon } from "@heroicons/vue/24/outline";
import { useAuthStore } from "@/stores/auth";
import type { LoginFormData, FormErrors } from "@/types/ui/component-props";

const { t } = useI18n();
const authStore = useAuthStore();

// Emits
defineEmits<{
  "oauth-login": [provider: "google"];
}>();

// Reactive data
const formData = reactive<LoginFormData>({
  email: "",
  password: "",
  rememberMe: false,
});

const errors = ref<FormErrors>({});
const showPassword = ref(false);

// Computed
const isLoading = computed(() => authStore.isLoading);
const error = computed(() => authStore.error);
const isFormValid = computed(() => {
  return (
    formData.email &&
    formData.password &&
    formData.email.includes("@") &&
    formData.password.length >= 8
  );
});

// Methods
function validateForm(): boolean {
  errors.value = {};

  if (!formData.email) {
    errors.value.email = t("auth.validation.emailRequired");
  } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
    errors.value.email = t("auth.validation.emailInvalid");
  }

  if (!formData.password) {
    errors.value.password = t("auth.validation.passwordRequired");
  } else if (formData.password.length < 8) {
    errors.value.password = t("auth.validation.passwordMinLength");
  }

  return Object.keys(errors.value).length === 0;
}

async function handleSubmit(): Promise<void> {
  if (!validateForm()) {
    return;
  }

  const success = await authStore.login({
    email: formData.email,
    password: formData.password,
  });

  if (success) {
    // Reset form
    formData.email = "";
    formData.password = "";
    formData.rememberMe = false;
    errors.value = {};
  }
}

</script>

<style scoped>
.login-form {
  @apply mx-auto max-w-md;
}

.form-header {
  @apply mb-8 text-center;
}

/* Custom checkbox styles */
input[type="checkbox"] {
  @apply rounded border-gray-300 text-primary-600 shadow-sm focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50;
}

/* Focus styles for better accessibility */
input:focus,
button:focus {
  @apply outline-none ring-2 ring-primary-500 ring-offset-2;
}

/* Loading state */
button:disabled {
  @apply cursor-not-allowed opacity-50;
}
</style>
