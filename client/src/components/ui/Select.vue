<template>
  <div class="select-wrapper">
    <label v-if="label" :for="selectId" :class="labelClasses">
      {{ label }}
      <span v-if="required" class="text-error-500 ml-1" aria-label="required">*</span>
    </label>

    <div class="select-container">
      <select
        :id="selectId"
        ref="selectRef"
        :value="modelValue"
        :disabled="disabled"
        :required="required"
        :aria-describedby="helpTextId"
        :aria-invalid="hasError"
        :class="selectClasses"
        @change="handleChange"
        @blur="handleBlur"
        @focus="handleFocus"
      >
        <option v-if="placeholder" value="" disabled selected>
          {{ placeholder }}
        </option>

        <optgroup v-for="group in groupedOptions" :key="group.label" :label="group.label">
          <option
            v-for="option in group.options"
            :key="option.value"
            :value="option.value"
            :disabled="option.disabled"
          >
            {{ option.label }}
          </option>
        </optgroup>
      </select>

      <div class="select-icon">
        <ChevronDownIcon class="text-secondary-400 h-4 w-4" />
      </div>
    </div>

    <div v-if="helpText || hasError" class="select-help">
      <p v-if="helpText && !hasError" :id="helpTextId" :class="helpTextClasses">
        {{ helpText }}
      </p>

      <p v-if="hasError" :id="helpTextId" :class="errorTextClasses" role="alert" aria-live="polite">
        {{ errorMessage }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, useId } from "vue";
import { useI18n } from "vue-i18n";
import { ChevronDownIcon } from "@heroicons/vue/24/outline";

interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

interface SelectGroup {
  label: string;
  options: SelectOption[];
}

interface Props {
  modelValue?: string | number;
  options?: SelectOption[];
  groups?: SelectGroup[];
  label?: string;
  placeholder?: string;
  helpText?: string;
  disabled?: boolean;
  required?: boolean;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "filled";
  errorMessage?: string;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: "",
  options: () => [],
  groups: () => [],
  label: "",
  placeholder: "",
  helpText: "",
  disabled: false,
  required: false,
  size: "md",
  variant: "default",
  errorMessage: "",
});

const emit = defineEmits<{
  "update:modelValue": [value: string | number];
  focus: [event: FocusEvent];
  blur: [event: FocusEvent];
  change: [value: string | number, event: Event];
}>();

const { t } = useI18n();
const selectRef = ref<HTMLSelectElement>();

// Generate unique IDs
const selectId = useId();
const helpTextId = useId();

const hasError = computed(() => !!props.errorMessage);

const groupedOptions = computed(() => {
  if (props.groups.length > 0) {
    return props.groups;
  }

  // If no groups provided, create a single group from options
  if (props.options.length > 0) {
    return [{ label: "", options: props.options }];
  }

  return [];
});

const selectClasses = computed(() => {
  const baseClasses = [
    "block",
    "w-full",
    "border",
    "transition-colors",
    "duration-200",
    "focus:outline-none",
    "focus:ring-2",
    "focus:ring-offset-0",
    "disabled:opacity-50",
    "disabled:cursor-not-allowed",
    "disabled:bg-secondary-50",
    "disabled:text-secondary-500",
    "appearance-none",
    "cursor-pointer",
    "pr-10",
  ];

  // Size classes
  const sizeClasses = {
    sm: ["text-sm", "px-3", "py-2", "h-8"],
    md: ["text-base", "px-4", "py-3", "h-10"],
    lg: ["text-lg", "px-4", "py-4", "h-12"],
  };

  // Variant classes
  const variantClasses = {
    default: [
      "bg-white",
      "border-secondary-300",
      "rounded-lg",
      "focus:border-primary-500",
      "focus:ring-primary-500",
      "dark:bg-secondary-900",
      "dark:border-secondary-600",
      "dark:text-white",
    ],
    filled: [
      "bg-secondary-50",
      "border-transparent",
      "rounded-lg",
      "focus:bg-white",
      "focus:border-primary-500",
      "focus:ring-primary-500",
      "dark:bg-secondary-800",
      "dark:focus:bg-secondary-900",
      "dark:text-white",
    ],
  };

  // State classes
  const stateClasses = [];

  if (hasError.value) {
    stateClasses.push(
      "border-error-300",
      "focus:border-error-500",
      "focus:ring-error-500",
      "dark:border-error-600"
    );
  }

  return [
    ...baseClasses,
    ...sizeClasses[props.size],
    ...variantClasses[props.variant],
    ...stateClasses,
  ].join(" ");
});

const labelClasses = computed(() => {
  const baseClasses = [
    "block",
    "text-sm",
    "font-medium",
    "mb-2",
    "text-secondary-700",
    "dark:text-secondary-300",
  ];

  if (hasError.value) {
    baseClasses.push("text-error-700", "dark:text-error-400");
  }

  return baseClasses.join(" ");
});

const helpTextClasses = computed(() => [
  "text-sm",
  "text-secondary-500",
  "dark:text-secondary-400",
]);

const errorTextClasses = computed(() => ["text-sm", "text-error-600", "dark:text-error-400"]);

const handleChange = (event: Event) => {
  const target = event.target as HTMLSelectElement;
  const value = target.value;
  emit("update:modelValue", value);
  emit("change", value, event);
};

const handleFocus = (event: FocusEvent) => {
  emit("focus", event);
};

const handleBlur = (event: FocusEvent) => {
  emit("blur", event);
};

// Expose methods for parent components
defineExpose({
  focus: () => selectRef.value?.focus(),
  blur: () => selectRef.value?.blur(),
});
</script>

<style scoped>
.select-wrapper {
  @apply w-full;
}

.select-container {
  @apply relative;
}

.select-icon {
  @apply pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 transform;
}

.select-help {
  @apply mt-2;
}

/* RTL support */
[dir="rtl"] .select-icon {
  @apply left-3 right-auto;
}

[dir="rtl"] .pr-10 {
  @apply pl-10 pr-0;
}

[dir="rtl"] .ml-1 {
  @apply ml-0 mr-1;
}

/* Mobile optimizations */
@media (max-width: 768px) {
  .h-8 {
    min-height: 44px; /* WCAG AA recommendation for touch targets */
  }

  .h-10 {
    min-height: 44px;
  }

  .h-12 {
    min-height: 48px;
  }
}

/* Custom select styling for better appearance */
select {
  background-image: none; /* Remove default arrow */
}

/* Focus styles for better accessibility */
select:focus {
  outline: 2px solid transparent;
  outline-offset: 2px;
}
</style>
