<script setup lang="ts">
import { computed, ref } from "vue";

import { EyeIcon, EyeSlashIcon } from "@heroicons/vue/24/outline";
import { useI18n } from "vue-i18n";

import LoadingSpinner from "../../../components/ui/LoadingSpinner.vue";
import PasswordStrengthIndicator from "../../../features/auth/components/PasswordStrengthIndicator.vue";
import type { ProfileStepProps } from "../../../types/ui/component-props";

const props = defineProps<ProfileStepProps>();

defineEmits<{
  "update:name": [value: string];
  "update:password": [value: string];
  "update:acceptTerms": [value: boolean];
  back: [];
}>();

useI18n();

const showPassword = ref(false);

const isValid = computed(() => {
  return props.name && props.password && props.password.length >= 8 && props.acceptTerms;
});
</script>

<template>
  <div class="form-step">
    <div class="step-indicator">
      <div class="step-number">2</div>
      <span class="step-text">{{ $t("auth.register?.completeProfile") }} </span>
    </div>

    <div class="form-group">
      <label for="name" class="form-label">
        {{ $t("auth.fields?.name") }}
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
        {{ $t("auth.fields?.password") }}
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
          :aria-label="
            showPassword ? $t('auth.fields.hidePassword') : $t('auth.fields.showPassword')
          "
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
          {{ $t("auth.register?.agreeToTerms") }}

          <a href="/terms" target="_blank" class="terms-link">
            {{ $t("auth.register?.termsOfService") }}
          </a>
          {{ $t("auth.register?.and") }}

          <a href="/privacy" target="_blank" class="terms-link">
            {{ $t("auth.register?.privacyPolicy") }}
          </a>
        </span>
      </label>
      <p v-if="termsError" class="form-error">{{ termsError }}</p>
    </div>

    <div class="form-actions">
      <button type="button" @click="$emit('back')" class="form-button-secondary">
        {{ $t("auth.register?.back") }}
      </button>
      <button type="submit" :disabled="!isValid || isLoading" class="form-button">
        <span v-if="isLoading" class="button-content">
          <LoadingSpinner size="sm" color="white" />
          {{ $t("auth.register?.creating") }}
        </span>
        <span v-else class="button-content">
          {{ $t("auth.register?.createAccount") }}
        </span>
      </button>
    </div>
  </div>
</template>

<style scoped>
/* Component-specific animations - shared keyframes are in main.css */
.form-step {
  animation: fadeIn 0.3s ease-out;
}

.form-group {
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

/* Component-specific styles not in shared forms.css */
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

.password-input-container {
  @apply relative;
}

.password-input {
  @apply pr-12;
}

.toggle-icon {
  @apply h-5 w-5;
}

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

.form-actions {
  @apply flex gap-4;
}

.button-content {
  @apply flex items-center justify-center gap-3;
}

/* Override Tailwind's space utility that adds unwanted spacing */
.form-group > :not([hidden]) ~ :not([hidden]) {
  margin-top: 0 !important;
}

/* Responsive Design */
@media (width <= 640px) {
  .form-actions {
    @apply flex-col;
  }

  .form-input {
    @apply text-sm;
  }

  .form-button-secondary {
    @apply order-2;
  }

  .form-button {
    @apply order-1;
  }
}
</style>
