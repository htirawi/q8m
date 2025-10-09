<template>
  <div class="form-step">
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
        :model-value="name"
        @input="$emit('update:name', ($event.target as HTMLInputElement).value)"
        type="text"
        autocomplete="name"
        required
        class="form-input"
        :class="{ 'form-input-error': nameError }"
        :placeholder="$t('auth.fields.namePlaceholder')"
      />
      <p v-if="nameError" class="form-error">{{ nameError }}</p>
    </div>

    <div class="form-group">
      <label for="password" class="form-label">
        {{ $t("auth.fields.password") }}
      </label>
      <div class="password-input-container">
        <input
          id="password"
          :model-value="password"
          @input="$emit('update:password', ($event.target as HTMLInputElement).value)"
          :type="showPassword ? 'text' : 'password'"
          autocomplete="new-password"
          required
          class="form-input password-input"
          :class="{ 'form-input-error': passwordError }"
          :placeholder="$t('auth.fields.passwordPlaceholder')"
        />
        <button
          type="button"
          @click="showPassword = !showPassword"
          class="password-toggle"
        >
          <EyeIcon v-if="!showPassword" class="toggle-icon" />
          <EyeSlashIcon v-else class="toggle-icon" />
        </button>
      </div>
      <p v-if="passwordError" class="form-error">{{ passwordError }}</p>

      <!-- Password Strength Indicator -->
      <PasswordStrengthIndicator :password="password" />
    </div>

    <!-- Terms and Conditions -->
    <div class="form-group">
      <label class="terms-checkbox">
        <input
          :checked="acceptTerms"
          @change="$emit('update:acceptTerms', ($event.target as HTMLInputElement).checked)"
          type="checkbox"
          class="checkbox-input"
        />
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
      <p v-if="termsError" class="form-error">{{ termsError }}</p>
    </div>

    <div class="form-actions">
      <button type="button" @click="$emit('back')" class="back-button">
        {{ $t("auth.register.back") }}
      </button>
      <button
        type="submit"
        :disabled="!isValid || isLoading"
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
          {{ $t("auth.register.creating") }}
        </span>
        <span v-else class="button-content">
          {{ $t("auth.register.createAccount") }}
        </span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { useI18n } from "vue-i18n";
import { EyeIcon, EyeSlashIcon } from "@heroicons/vue/24/outline";
import PasswordStrengthIndicator from "@/features/auth/components/PasswordStrengthIndicator.vue";

interface Props {
  name: string;
  password: string;
  acceptTerms: boolean;
  nameError?: string;
  passwordError?: string;
  termsError?: string;
  isLoading: boolean;
}

const props = defineProps<Props>();

defineEmits<{
  "update:name": [value: string];
  "update:password": [value: string];
  "update:acceptTerms": [value: boolean];
  back: [];
}>();

useI18n();

const showPassword = ref(false);

const isValid = computed(() => {
  return (
    props.name &&
    props.password &&
    props.password.length >= 8 &&
    props.acceptTerms
  );
});
</script>

<style scoped>
/* Form Step */
.form-step {
  @apply space-y-6;
  animation: fadeIn 0.3s ease-out;
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
  animation: fadeIn 0.3s ease-out;
}

.form-group:nth-child(2) {
  animation-delay: 0.1s;
}
.form-group:nth-child(3) {
  animation-delay: 0.2s;
}
.form-group:nth-child(4) {
  animation-delay: 0.3s;
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

.form-error {
  @apply text-sm font-medium text-red-600;
  @apply dark:text-red-400;
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
</style>
