<template>
  <div class="form-step">
    <div class="form-group">
      <label for="email" class="form-label">
        {{ $t("auth.fields.email") }}
      </label>
      <input
        id="email"
        :model-value="email"
        @input="handleInput"
        @blur="handleBlur"
        type="email"
        autocomplete="email"
        required
        class="form-input"
        :class="{ 'form-input-error': error }"
        :placeholder="$t('auth.fields.emailPlaceholder')"
      />
      <p v-if="error" class="form-error">{{ error }}</p>
    </div>

    <button
      type="button"
      @click="handleContinue"
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
        {{ $t("auth.register.processing") }}
      </span>
      <span v-else class="button-content">
        {{ $t("auth.register.continue") }}
      </span>
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { useI18n } from "vue-i18n";

interface Props {
  email: string;
  isLoading: boolean;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  "update:email": [value: string];
  continue: [];
}>();

const { t } = useI18n();

const error = ref<string>();

const isValid = computed(() => {
  return props.email && /\S+@\S+\.\S+/.test(props.email);
});

const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement;
  emit("update:email", target.value);
  error.value = undefined;
};

const handleBlur = () => {
  if (!props.email) {
    error.value = t("auth.validation.emailRequired");
  } else if (!/\S+@\S+\.\S+/.test(props.email)) {
    error.value = t("auth.validation.emailInvalid");
  }
};

const handleContinue = () => {
  if (isValid.value) {
    emit("continue");
  }
};
</script>

<style scoped>
/* Form Step */
.form-step {
  @apply space-y-6;
  animation: fadeIn 0.3s ease-out;
}

/* Form Fields */
.form-group {
  @apply space-y-2;
  animation: fadeIn 0.3s ease-out;
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

/* Button */
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

.button-content {
  @apply flex items-center justify-center gap-3;
}

.loading-spinner {
  @apply h-5 w-5 animate-spin;
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
