<template>
  <div class="register-form">
    <!-- OAuth Buttons (Top) -->
    <div class="oauth-section">
      <button
        type="button"
        @click="$emit('oauth-login', 'google')"
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
        @click="$emit('oauth-login', 'facebook')"
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

    <!-- Divider -->
    <div class="form-divider">
      <div class="divider-line"></div>
      <span class="divider-text">{{ $t("auth.register.or") }}</span>
      <div class="divider-line"></div>
    </div>

    <!-- Progressive Form -->
    <form @submit.prevent="handleSubmit" class="progressive-form">
      <!-- Step 1: Email Only -->
      <div v-if="currentStep === 1" class="form-step">
        <div class="form-group">
          <label for="email" class="form-label">
            {{ $t("auth.fields.email") }}
          </label>
          <input
            id="email"
            v-model="formData.email"
            type="email"
            autocomplete="email"
            required
            class="form-input"
            :class="{ 'form-input-error': errors.email }"
            :placeholder="$t('auth.fields.emailPlaceholder')"
            @input="validateEmail"
          />
          <p v-if="errors.email" class="form-error">{{ errors.email }}</p>
        </div>

        <button
          type="button"
          @click="proceedToStep2"
          :disabled="!isEmailValid || isLoading"
          class="continue-button"
        >
          <span v-if="isLoading" class="button-content">
            <svg class="loading-spinner" viewBox="0 0 24 24">
              <circle
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                stroke-width="4"
                fill="none"
                opacity="0.25"
              />
              <path
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                fill="currentColor"
                opacity="0.75"
              />
            </svg>
            {{ $t("auth.register.processing") }}
          </span>
          <span v-else class="button-content">
            {{ $t("auth.register.continue") }}
          </span>
        </button>
      </div>

      <!-- Step 2: Additional Fields -->
      <div v-if="currentStep === 2" class="form-step">
        <div class="step-indicator">
          <div class="step-number">2</div>
          <span class="step-text">{{ $t("auth.register.completeProfile") }}</span>
        </div>

        <div class="form-group">
          <label for="name" class="form-label">
            {{ $t("auth.fields.name") }}
          </label>
          <input
            id="name"
            v-model="formData.name"
            type="text"
            autocomplete="name"
            required
            class="form-input"
            :class="{ 'form-input-error': errors.name }"
            :placeholder="$t('auth.fields.namePlaceholder')"
          />
          <p v-if="errors.name" class="form-error">{{ errors.name }}</p>
        </div>

        <div class="form-group">
          <label for="password" class="form-label">
            {{ $t("auth.fields.password") }}
          </label>
          <div class="password-input-container">
            <input
              id="password"
              v-model="formData.password"
              :type="showPassword ? 'text' : 'password'"
              autocomplete="new-password"
              required
              class="form-input password-input"
              :class="{ 'form-input-error': errors.password }"
              :placeholder="$t('auth.fields.passwordPlaceholder')"
            />
            <button type="button" @click="showPassword = !showPassword" class="password-toggle">
              <EyeIcon v-if="!showPassword" class="toggle-icon" />
              <EyeSlashIcon v-else class="toggle-icon" />
            </button>
          </div>
          <p v-if="errors.password" class="form-error">{{ errors.password }}</p>

          <!-- Password Strength Indicator -->
          <div v-if="formData.password" class="password-strength">
            <div class="strength-bars">
              <div
                v-for="level in 4"
                :key="level"
                class="strength-bar"
                :class="getPasswordStrengthClass(level)"
              ></div>
            </div>
            <span class="strength-text">{{ getPasswordStrengthText() }}</span>
          </div>
        </div>

        <!-- Terms and Conditions -->
        <div class="form-group">
          <label class="terms-checkbox">
            <input v-model="formData.acceptTerms" type="checkbox" class="checkbox-input" />
            <span class="checkbox-custom"></span>
            <span class="terms-text">
              {{ $t("auth.register.agreeToTerms") }}
              <a href="/terms" target="_blank" class="terms-link">
                {{ $t("auth.register.termsOfService") }}
              </a>
              {{ $t("auth.register.and") }}
              <a href="/privacy" target="_blank" class="terms-link">
                {{ $t("auth.register.privacyPolicy") }}
              </a>
            </span>
          </label>
          <p v-if="errors.acceptTerms" class="form-error">{{ errors.acceptTerms }}</p>
        </div>

        <div class="form-actions">
          <button type="button" @click="goBackToStep1" class="back-button">
            {{ $t("auth.register.back") }}
          </button>
          <button type="submit" :disabled="!isStep2Valid || isLoading" class="continue-button">
            <span v-if="isLoading" class="button-content">
              <svg class="loading-spinner" viewBox="0 0 24 24">
                <circle
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  stroke-width="4"
                  fill="none"
                  opacity="0.25"
                />
                <path
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  fill="currentColor"
                  opacity="0.75"
                />
              </svg>
              {{ $t("auth.register.creating") }}
            </span>
            <span v-else class="button-content">
              {{ $t("auth.register.createAccount") }}
            </span>
          </button>
        </div>
      </div>

      <!-- Error Message -->
      <div v-if="error" class="error-message">
        <svg
          class="error-icon"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="15" y1="9" x2="9" y2="15" />
          <line x1="9" y1="9" x2="15" y2="15" />
        </svg>
        {{ error }}
      </div>
    </form>

    <!-- Sign In Link -->
    <div class="signin-link">
      <p class="signin-text">
        {{ $t("auth.register.alreadyHaveAccount") }}
        <button type="button" @click="$emit('show-login', true)" class="signin-button">
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

interface RegisterFormData {
  email: string;
  name: string;
  password: string;
  acceptTerms: boolean;
}

interface FormErrors {
  email?: string;
  name?: string;
  password?: string;
  acceptTerms?: string;
}

const { t } = useI18n();
const authStore = useAuthStore();

// Emits
const emit = defineEmits<{
  "oauth-login": [provider: "google" | "facebook"];
  "registration-success": [email: string];
  "show-login": [show: boolean];
}>();

// Progressive form state
const currentStep = ref(1);

// Reactive data
const formData = reactive<RegisterFormData>({
  email: "",
  name: "",
  password: "",
  acceptTerms: false,
});

const errors = ref<FormErrors>({});
const showPassword = ref(false);

// Computed
const isLoading = computed(() => authStore.isLoading);
const error = computed(() => authStore.error);

const isEmailValid = computed(() => {
  return formData.email && /\S+@\S+\.\S+/.test(formData.email);
});

const isStep2Valid = computed(() => {
  return (
    formData.name && formData.password && formData.password.length >= 8 && formData.acceptTerms
  );
});

// Methods
function validateEmail() {
  errors.value.email = undefined;
  if (!formData.email) {
    errors.value.email = t("auth.validation.emailRequired");
  } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
    errors.value.email = t("auth.validation.emailInvalid");
  }
}

function proceedToStep2() {
  if (isEmailValid.value) {
    currentStep.value = 2;
    errors.value = {};
  }
}

function goBackToStep1() {
  currentStep.value = 1;
  errors.value = {};
}

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

  if (!formData.email) {
    errors.value.email = t("auth.validation.emailRequired");
  } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
    errors.value.email = t("auth.validation.emailInvalid");
  }

  if (!formData.name.trim()) {
    errors.value.name = t("auth.validation.nameRequired");
  } else if (formData.name.trim().length < 2) {
    errors.value.name = t("auth.validation.nameMinLength");
  }

  if (!formData.password) {
    errors.value.password = t("auth.validation.passwordRequired");
  } else if (formData.password.length < 8) {
    errors.value.password = t("auth.validation.passwordMinLength");
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
    confirmPassword: formData.password,
    acceptTerms: formData.acceptTerms,
  });

  if (success) {
    // Emit success event with email for verification
    emit("registration-success", formData.email);

    // Reset form
    formData.email = "";
    formData.name = "";
    formData.password = "";
    formData.acceptTerms = false;
    errors.value = {};
    currentStep.value = 1;
  }
}
</script>

<style scoped>
/* Form Container */
.register-form {
  @apply w-full space-y-6;
}

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

/* Form Divider */
.form-divider {
  @apply my-8 flex items-center gap-4;
}

.divider-line {
  @apply h-px flex-1 bg-gray-300;
  @apply dark:bg-gray-600;
}

.divider-text {
  @apply text-sm font-medium text-gray-500;
  @apply dark:text-gray-400;
}

/* Progressive Form */
.progressive-form {
  @apply space-y-6;
}

.form-step {
  @apply space-y-6;
}

.step-indicator {
  @apply mb-6 flex items-center gap-3;
}

.step-number {
  @apply flex h-8 w-8 items-center justify-center rounded-full;
  @apply bg-primary-600 text-sm font-bold text-white;
}

.step-text {
  @apply text-lg font-medium text-gray-900;
  @apply dark:text-white;
}

/* Form Fields */
.form-group {
  @apply space-y-2;
}

.form-label {
  @apply block text-sm font-medium text-gray-700;
  @apply dark:text-gray-300;
}

.form-input {
  @apply w-full rounded-xl border-2 border-gray-200 px-4 py-3;
  @apply bg-white text-gray-900 placeholder-gray-500;
  @apply focus:border-primary-500 focus:ring-4 focus:ring-primary-500/20;
  @apply transition-all duration-200 ease-in-out;
  @apply dark:border-gray-600 dark:bg-gray-800 dark:text-white;
  @apply dark:placeholder-gray-400 dark:focus:border-primary-400;
}

.form-input-error {
  @apply border-red-500 focus:border-red-500 focus:ring-red-500/20;
}

/* Password Input */
.password-input-container {
  @apply relative;
}

.password-input {
  @apply pr-12;
}

.password-toggle {
  @apply absolute right-3 top-1/2 -translate-y-1/2;
  @apply p-2 text-gray-500 hover:text-gray-700;
  @apply transition-colors duration-200;
  @apply dark:text-gray-400 dark:hover:text-gray-200;
}

.toggle-icon {
  @apply h-5 w-5;
}

/* Password Strength */
.password-strength {
  @apply mt-3 space-y-2;
}

.strength-bars {
  @apply flex gap-1;
}

.strength-bar {
  @apply h-2 flex-1 rounded-full transition-all duration-300;
  @apply bg-gray-200 dark:bg-gray-600;
}

.strength-bar.bg-error-500 {
  @apply bg-red-500;
}

.strength-bar.bg-warning-500 {
  @apply bg-yellow-500;
}

.strength-bar.bg-success-500 {
  @apply bg-green-500;
}

.strength-text {
  @apply text-xs font-medium text-gray-500;
  @apply dark:text-gray-400;
}

/* Terms Checkbox */
.terms-checkbox {
  @apply flex cursor-pointer items-start gap-3;
}

.checkbox-input {
  @apply sr-only;
}

.checkbox-custom {
  @apply h-5 w-5 rounded border-2 border-gray-300;
  @apply flex items-center justify-center;
  @apply transition-all duration-200;
  @apply dark:border-gray-600;
}

.checkbox-input:checked + .checkbox-custom {
  @apply border-primary-500 bg-primary-500;
}

.checkbox-input:checked + .checkbox-custom::after {
  content: "✓";
  @apply text-sm font-bold text-white;
}

.terms-text {
  @apply text-sm leading-relaxed text-gray-700;
  @apply dark:text-gray-300;
}

.terms-link {
  @apply font-medium text-primary-600 hover:text-primary-700;
  @apply transition-colors duration-200;
  @apply dark:text-primary-400 dark:hover:text-primary-300;
}

/* Buttons */
.continue-button {
  @apply w-full rounded-xl px-6 py-4 font-semibold;
  @apply bg-gradient-to-r from-primary-600 to-primary-700;
  @apply text-white shadow-lg hover:shadow-xl;
  @apply focus:outline-none focus:ring-4 focus:ring-primary-500/30;
  @apply transition-all duration-200 ease-in-out;
  @apply transform hover:-translate-y-0.5;
  @apply disabled:cursor-not-allowed disabled:opacity-50;
  @apply disabled:transform-none;
}

.back-button {
  @apply rounded-xl border-2 border-gray-300 px-6 py-3;
  @apply bg-white font-medium text-gray-700;
  @apply hover:border-gray-400 hover:bg-gray-50;
  @apply focus:outline-none focus:ring-4 focus:ring-gray-500/20;
  @apply transition-all duration-200 ease-in-out;
  @apply dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300;
  @apply dark:hover:border-gray-500 dark:hover:bg-gray-700;
}

.form-actions {
  @apply flex gap-4;
}

.button-content {
  @apply flex items-center justify-center gap-3;
}

.loading-spinner {
  @apply h-5 w-5 animate-spin;
}

/* Error Message */
.form-error {
  @apply text-sm font-medium text-red-600;
  @apply dark:text-red-400;
}

.error-message {
  @apply flex items-center gap-3 rounded-xl p-4;
  @apply border border-red-200 bg-red-50 text-red-700;
  @apply dark:border-red-800 dark:bg-red-900/20 dark:text-red-400;
}

.error-icon {
  @apply h-5 w-5 flex-shrink-0;
}

/* Sign In Link */
.signin-link {
  @apply mt-8 text-center;
}

.signin-text {
  @apply text-sm text-gray-600;
  @apply dark:text-gray-400;
}

.signin-button {
  @apply font-semibold text-primary-600 hover:text-primary-700;
  @apply transition-colors duration-200;
  @apply dark:text-primary-400 dark:hover:text-primary-300;
}

/* Responsive Design */
@media (max-width: 640px) {
  .form-actions {
    @apply flex-col;
  }

  .back-button {
    @apply order-2;
  }

  .continue-button {
    @apply order-1;
  }
}

/* Animation */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.form-step {
  animation: fadeIn 0.3s ease-out;
}

.form-group {
  animation: fadeIn 0.3s ease-out;
}

.form-group:nth-child(1) {
  animation-delay: 0.1s;
}
.form-group:nth-child(2) {
  animation-delay: 0.2s;
}
.form-group:nth-child(3) {
  animation-delay: 0.3s;
}
.form-group:nth-child(4) {
  animation-delay: 0.4s;
}
.form-group:nth-child(5) {
  animation-delay: 0.5s;
}
</style>
