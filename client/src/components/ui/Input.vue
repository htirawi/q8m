<script setup lang="ts">
import { computed, toRefs } from "vue";

import type { InputProps } from "@/types/ui/component-props";

/**
 * Input Component
 * A form input component with error states, accessibility features, and dark mode support.
 * @emits update:modelValue - Emitted when input value changes
 * @emits input - Emitted on input event
 * @emits blur - Emitted when input loses focus
 * @emits focus - Emitted when input receives focus
 */

const props = withDefaults(defineProps<InputProps>(), {
  type: "text",
  disabled: false,
  readonly: false,
  required: false,
});

const emit = defineEmits<{
  "update:modelValue": [value: string | number];
  input: [event: Event];
  blur: [event: FocusEvent];
  focus: [event: FocusEvent];
}>();

const { error, type } = toRefs(props);

const hasError = computed(() => !!error.value);

const inputClasses = computed(() => {
  const baseClasses = [
    "block w-full rounded-md border px-3 py-2 text-sm transition-colors duration-200",
    "focus:outline-none focus:ring-2 focus:ring-offset-2",
    "disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed",
    "readonly:bg-gray-50 readonly:cursor-default",
    "min-h-[44px]",
  ];

  if (hasError.value) {
    baseClasses.push(
      "border-red-300 text-red-900 placeholder-red-300",
      "focus:border-red-500 focus:ring-red-500",
      "dark:border-red-600 dark:text-red-100 dark:placeholder-red-400"
    );
  } else {
    baseClasses.push(
      "border-gray-300 text-gray-900 placeholder-gray-400",
      "focus:border-primary-500 focus:ring-primary-500",
      "dark:border-gray-600 dark:text-gray-100 dark:placeholder-gray-500",
      "dark:bg-gray-800"
    );
  }

  return baseClasses.join(" ");
});

const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const value = type.value === "number" ? Number(target.value) : target.value;
  emit("update:modelValue", value);
  emit("input", event);
};

const handleBlur = (event: FocusEvent) => {
  emit("blur", event);
};

const handleFocus = (event: FocusEvent) => {
  emit("focus", event);
};
</script>

<template>
  <div class="input-wrapper">
    <input :id="id" :type="type" :value="modelValue" :placeholder="placeholder" :disabled="disabled"
      :readonly="readonly" :required="required" :aria-label="ariaLabel" :aria-describedby="ariaDescribedby"
      :aria-invalid="hasError" :aria-required="required" :class="inputClasses" @input="handleInput" @blur="handleBlur"
      @focus="handleFocus" />
  </div>
</template>

<style scoped>
.input-wrapper {
  @apply relative;
}
</style>
