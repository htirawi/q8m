<template>
  <div class="register-form">
    <div class="form-header">
      <h2 class="text-2xl font-bold text-gray-900 dark:text-gray-100">
        {{ $t("auth.register.title") }}

      </h2>
      <p class="mt-2 text-gray-600 dark:text-gray-400">
        {{ $t("auth.register.subtitle") }}

      </p>
    </div>

    <form @submit.prevent="handleSubmit" class="space-y-6">
      <!-- Name Field -->
      <div>
        <label for="name" class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
          {{ $t("auth.fields.name") }}
        </label>
        <input
          id="name"
          v-model="formData.name"
          type="text"
          autocomplete="name"
          required
          class="input w-full"
          :class="{ 'border-error-500 focus:border-error-500 focus:ring-error-500': errors.name }"
          :placeholder="$t('auth.fields.namePlaceholder')"
        />
        <p v-if="errors.name" class="form-error mt-1">{{ errors.name }}

</p>
      </div>

      <!-- Email Field -->
      <div>
        <label for="email" class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
          {{ $t("auth.fields.email") }}
        </label>
        <input
          id="email"
          v-model="formData.email"
          type="email"
          autocomplete="email"
          required
          class="input w-full"
          :class="{ 'border-error-500 focus:border-error-500 focus:ring-error-500': errors.email }"
          :placeholder="$t('auth.fields.emailPlaceholder')"
        />
        <p v-if="errors.email" class="form-error mt-1">{{ errors.email }}

</p>
      </div>

      <!-- Password Field -->
      <div>
        <label
          for="password"
          class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          {{ $t("auth.fields.password") }}
        </label>
        <div class="relative">
          <input
            id="password"
            v-model="formData.password"
            :type="showPassword ? 'text' : 'password'"
            autocomplete="new-password"
            required
            class="input w-full pr-10"
            :class="{
              'border-error-500 focus:border-error-500 focus:ring-error-500': errors.password,
            }"
            :placeholder="$t('auth.fields.passwordPlaceholder')"
          />
          <button
            type="button"
            @click="showPassword = !showPassword"
            class="absolute inset-y-0 right-0 flex items-center pr-3"
          >
            <EyeIcon v-if="!showPassword" class="h-5 w-5 text-gray-400 hover:text-gray-600" />
            <EyeSlashIcon v-else class="h-5 w-5 text-gray-400 hover:text-gray-600" />
          </button>
        </div>
        <p v-if="errors.password" class="form-error mt-1">{{ errors.password }}

</p>

        <!-- Password Strength Indicator -->
        <div v-if="formData.password" class="mt-2">
          <div class="flex space-x-1">
            <div
              v-for="level in 4"
              :key="level"
              class="h-1 flex-1 rounded"
              :class="getPasswordStrengthClass(level)"
            ></div>
          </div>
          <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
            {{ getPasswordStrengthText() }}

          </p>
        </div>
      </div>

      <!-- Confirm Password Field -->
      <div>
        <label
          for="confirmPassword"
          class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          {{ $t("auth.fields.confirmPassword") }}
        </label>
        <input
          id="confirmPassword"
          v-model="formData.confirmPassword"
          type="password"
          autocomplete="new-password"
          required
          class="input w-full"
          :class="{
            'border-error-500 focus:border-error-500 focus:ring-error-500': errors.confirmPassword,
          }"
          :placeholder="$t('auth.fields.confirmPasswordPlaceholder')"
        />
        <p v-if="errors.confirmPassword" class="form-error mt-1">{{ errors.confirmPassword }}

</p>
      </div>

      <!-- Terms and Conditions -->
      <div>
        <label class="flex items-start">
          <input
            v-model="formData.acceptTerms"
            type="checkbox"
            class="mt-1 h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
          />
          <span class="ml-2 text-sm text-gray-700 dark:text-gray-300">
            {{ $t("auth.register.agreeToTerms") }}

            <a
              href="/terms"
              target="_blank"
              class="text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300"
            >
              {{ $t("auth.register.termsOfService") }}

            </a>
            {{ $t("auth.register.and") }}

            <a
              href="/privacy"
              target="_blank"
              class="text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300"
            >
              {{ $t("auth.register.privacyPolicy") }}

            </a>
          </span>
        </label>
        <p v-if="errors.acceptTerms" class="form-error mt-1">{{ errors.acceptTerms }}</p>
      </div>

      <!-- Submit Button -->
      <button type="submit" :disabled="isLoading || !isFormValid" class="btn-primary w-full">
        <span v-if="isLoading" class="flex items-center justify-center">
          <svg
            class="-ml-1 mr-3 h-5 w-5 animate-spin text-white"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              class="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              stroke-width="4"
            ></circle>
            <path
              class="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          {{ $t("auth.register.creating") }}

        </span>
        <span v-else>{{ $t("auth.register.createAccount") }}

</span>
      </button>

      <!-- Error Message -->
      <div
        v-if="error"
        class="rounded-lg border border-error-200 bg-error-50 px-4 py-3 text-error-700 dark:border-error-800 dark:bg-error-900/20 dark:text-error-400"
      >
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
            {{ $t("auth.register.orContinueWith") }}

          </span>
        </div>
      </div>
    </div>

    <!-- OAuth Buttons -->
    <div class="mt-6 grid grid-cols-2 gap-3">
      <button
        type="button"
        @click="$emit('oauth-login', 'google')"
        :disabled="isLoading"
        class="btn-secondary flex w-full items-center justify-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
      >
        <svg class="mr-2 h-5 w-5" viewBox="0 0 24 24">
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
        {{ $t("auth.register.google") }}

      </button>

      <button
        type="button"
        @click="$emit('oauth-login', 'facebook')"
        :disabled="isLoading"
        class="btn-secondary flex w-full items-center justify-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
      >
        <svg class="mr-2 h-5 w-5" fill="#1877F2" viewBox="0 0 24 24">
          <path
            d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"
          />
        </svg>
        {{ $t("auth.register.facebook") }}

      </button>
    </div>

    <!-- Sign In Link -->
    <div class="mt-6 text-center">
      <p class="text-sm text-gray-600 dark:text-gray-400">
        {{ $t("auth.register.alreadyHaveAccount") }}

        <button
          type="button"
          @click="$emit('show-login')"
          class="font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300"
        >
          {{ $t("auth.register.signIn") }}

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

interface registerformdata {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  acceptTerms: boolean;
}

interface formerrors {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  acceptTerms?: string;
}

const { t } = useI18n();
const authStore = useAuthStore();

// Emits
defineEmits<{
  "oauth-login": [provider: "google" | "facebook"];
  "registration-success": [email: string];
}>();

// Reactive data
const formData = reactive<RegisterFormData>({
  name: "",
  email: "",
  password: "",
  confirmPassword: "",
  acceptTerms: false,
});

const errors = ref<FormErrors>({});
const showPassword = ref(false);

// Computed
const isLoading = computed(() => authStore.isLoading);
const error = computed(() => authStore.error);
const isFormValid = computed(() => {
  return (
    formData.name &&
    formData.email &&
    formData.password &&
    formData.confirmPassword &&
    formData.acceptTerms &&
    formData.email.includes("@") &&
    formData.password.length >= 8 &&
    formData.password === formData.confirmPassword
  );
});

// Methods
function calculatePasswordStrength(password: string): number {
  let score = 0;

  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  if (/[a-z]/.test(password)) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;

  return Math.min(score, 4);
}

function getPasswordStrengthClass(level: number): string {
  const strength = calculatePasswordStrength(formData.password);

  if (level <= strength) {
    if (strength <= 2) return "bg-error-500";
    if (strength <= 3) return "bg-warning-500";
    return "bg-success-500";
  }

  return "bg-gray-200 dark:bg-gray-600";
}

function getPasswordStrengthText(): string {
  const strength = calculatePasswordStrength(formData.password);

  switch (strength) {
    case 1:
      return t("auth.validation.passwordStrength.weak");
    case 4:
      return t("auth.validation.passwordStrength.strong");
    default:
      return "";
  }
}

function validateForm(): boolean {
  errors.value = {};

  if (!formData.name.trim()) {
    errors.value.name = t("auth.validation.nameRequired");
  } else if (formData.name.trim().length < 2) {
    errors.value.name = t("auth.validation.nameMinLength");
  }

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

  if (!formData.confirmPassword) {
    errors.value.confirmPassword = t("auth.validation.confirmPasswordRequired");
  } else if (formData.password !== formData.confirmPassword) {
    errors.value.confirmPassword = t("auth.validation.passwordsDoNotMatch");
  }

  if (!formData.acceptTerms) {
    errors.value.acceptTerms = t("auth.validation.acceptTermsRequired");
  }

  return Object.keys(errors.value).length === 0;
}

async function handleSubmit(): Promise<void> {
  if (!validateForm()) {
    return;
  }

  const success = await authStore.register({
    name: formData.name.trim(),
    email: formData.email,
    password: formData.password,
    acceptTerms: formData.acceptTerms,
  });

  if (success) {
    // Emit success event with email for verification
    emit("registration-success", formData.email);

    // Reset form
    formData.name = "";
    formData.email = "";
    formData.password = "";
    formData.confirmPassword = "";
    formData.acceptTerms = false;
    errors.value = {};
  }
}

// Fix emit usage
const emit = defineEmits<{
  "oauth-login": [provider: "google" | "facebook"];
  "registration-success": [email: string];
}>();

</script>

<style scoped>
.register-form {
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

/* Password strength indicator */
.password-strength {
  @apply transition-colors duration-200;
}
</style>
