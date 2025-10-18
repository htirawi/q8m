<script setup lang="ts">
import { ref, computed } from "vue";

import { useI18n } from "vue-i18n";

import LoadingSpinner from "../../../components/ui/LoadingSpinner.vue";
import { useFormValidation } from "../../../composables/useFormValidation";
import type { EmailStepProps } from "../../../types/ui/component-props";

const props = defineProps<EmailStepProps>();

const emit = defineEmits<{
  "update:email": [value: string];
  continue: [];
}>();

useI18n();
const { validateEmail } = useFormValidation();

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
  const emailError = validateEmail(props.email);
  if (emailError) {
    error.value = emailError;
  }
};

const handleContinue = () => {
  if (isValid.value) {
    emit("continue");
  }
};
</script>

<template>
  <div class="form-step">
    <div class="form-group">
      <label for="email" class="form-label">
        {{ $t("auth.fields?.email") }}
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
      class="form-button"
    >
      <span v-if="isLoading" class="button-content">
        <LoadingSpinner size="sm" color="white" />
        {{ $t("auth.register?.processing") }}
      </span>
      <span v-else class="button-content">
        {{ $t("auth.register?.continue") }}
      </span>
    </button>
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

/* Override Tailwind's space utility that adds unwanted spacing */
.form-group > :not([hidden]) ~ :not([hidden]) {
  margin-top: 0 !important;
}

.button-content {
  @apply flex items-center justify-center gap-3;
}
</style>
