<template>
  <div class="select-wrapper">
    <select :id="id" :value="modelValue" :disabled="disabled" :required="required" :aria-label="ariaLabel"
      :aria-describedby="ariaDescribedby" :aria-invalid="hasError" :aria-required="required" :class="selectClasses"
      @change="handleChange" @blur="handleBlur" @focus="handleFocus">
      <option v-if="placeholder" value="" disabled>
        {{ placeholder }}

      </option>
      <option v-for="option in options" :key="option.value" :value="option.value" :disabled="option.disabled">
        {{ option.label }}

      </option>
    </select>
    <div class="select-icon" aria-hidden="true">
      <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
      </svg>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { SelectProps, SelectOption } from "@/types/ui/component-props";

const props = withDefaults(defineProps<SelectProps>(), {
  disabled: false,
  required: false,
});

const emit = defineEmits<{
  "update:modelValue": [value: string | number];
  change: [event: Event];
  blur: [event: FocusEvent];
  focus: [event: FocusEvent];
}>();

// Computed properties
const hasError = computed(() => !!props.error);

const selectClasses = computed(() => {
  const baseClasses = [
    "block w-full rounded-md border px-3 py-2 pr-10 text-sm transition-colors duration-200 appearance-none",
    "focus:outline-none focus:ring-2 focus:ring-offset-2",
    "disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed",
    "min-h-[44px]", // WCAG AA minimum touch target
  ];

  if (hasError.value) {
    baseClasses.push(
      "border-red-300 text-red-900",
      "focus:border-red-500 focus:ring-red-500",
      "dark:border-red-600 dark:text-red-100"
    );
  } else {
    baseClasses.push(
      "border-gray-300 text-gray-900",
      "focus:border-primary-500 focus:ring-primary-500",
      "dark:border-gray-600 dark:text-gray-100 dark:bg-gray-800"
    );
  }

  return baseClasses.join(" ");
});

// Event handlers
const handleChange = (event: Event) => {
  const target = event.target as HTMLSelectElement;
  const value = target.value;
  emit("update:modelValue", value);
  emit("change", event);
};

const handleBlur = (event: FocusEvent) => {
  emit("blur", event);
};

const handleFocus = (event: FocusEvent) => {
  emit("focus", event);
};

</script>

<style scoped>
.select-wrapper {
  @apply relative;
}

.select-icon {
  @apply pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3;
}
</style>
