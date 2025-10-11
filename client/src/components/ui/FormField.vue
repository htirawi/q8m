<script setup lang="ts">
import { computed } from "vue";

import HelperText from "@/components/ui/HelperText.vue";

import type { FormFieldProps } from "@/types/ui/component-props";

const props = withDefaults(defineProps<FormFieldProps>(), {
  required: false,
});

// Computed properties
const hasError = computed(() => !!props.error);

const helperTextId = computed(() => {
  if (props.id) {
    return `${props.id}-helper`;
  }
  return undefined;
});
</script>

<template>
  <div class="form-field" :class="{ 'form-field--error': hasError }">
    <label v-if="label" :for="id" class="form-field-label" :class="{ 'form-field-label--required': required }">
      {{ label }}
    </label>

    <div class="form-field-input">
      <slot />
    </div>

    <HelperText v-if="error || helperText" :id="helperTextId" :error="error" class="form-field-helper">
      {{ error || helperText }}
    </HelperText>
  </div>
</template>

<style scoped>
.form-field {
  @apply space-y-2;
}

.form-field-label {
  @apply block text-sm font-medium text-gray-700 dark:text-gray-300;
}

.form-field-label--required::after {
  @apply ml-1 text-red-500;

  content: "*";
}

.form-field-input {
  @apply relative;
}

.form-field-helper {
  @apply mt-1;
}

/* Error state */
.form-field--error .form-field-label {
  @apply text-red-700 dark:text-red-400;
}
</style>
