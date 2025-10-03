<template>
  <div class="form-field" :class="fieldClasses">
    <label v-if="label" :for="fieldId" :class="labelClasses">
      {{ label }}
      <span v-if="required" class="text-error-500 ml-1" aria-label="required">*</span>
      <span v-if="optional" class="text-secondary-500 ml-1" aria-label="optional">
        ({{ $t("common.optional") }})
      </span>
    </label>

    <div class="form-field-content">
      <slot :id="fieldId" :aria-describedby="helpTextId" :aria-invalid="hasError" />
    </div>

    <div v-if="helpText || hasError || hint" class="form-field-help">
      <p v-if="hint && !hasError" :id="helpTextId" :class="hintClasses">
        {{ hint }}
      </p>

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
import { computed, useId } from "vue";
import { useI18n } from "vue-i18n";

interface Props {
  label?: string;
  helpText?: string;
  hint?: string;
  required?: boolean;
  optional?: boolean;
  disabled?: boolean;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "inline" | "horizontal";
  errorMessage?: string;
  fullWidth?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  label: "",
  helpText: "",
  hint: "",
  required: false,
  optional: false,
  disabled: false,
  size: "md",
  variant: "default",
  errorMessage: "",
  fullWidth: true,
});

const { t } = useI18n();

// Generate unique IDs
const fieldId = useId();
const helpTextId = useId();

const hasError = computed(() => !!props.errorMessage);

const fieldClasses = computed(() => {
  const baseClasses = ["form-field"];

  if (props.fullWidth) {
    baseClasses.push("w-full");
  }

  if (props.variant === "horizontal") {
    baseClasses.push("form-field--horizontal");
  } else if (props.variant === "inline") {
    baseClasses.push("form-field--inline");
  }

  return baseClasses.join(" ");
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

  if (props.disabled) {
    baseClasses.push("opacity-50", "cursor-not-allowed");
  }

  if (hasError.value) {
    baseClasses.push("text-error-700", "dark:text-error-400");
  }

  if (props.variant === "horizontal") {
    baseClasses.push("form-field__label--horizontal");
  } else if (props.variant === "inline") {
    baseClasses.push("form-field__label--inline");
  }

  return baseClasses.join(" ");
});

const helpTextClasses = computed(() => [
  "text-sm",
  "text-secondary-500",
  "dark:text-secondary-400",
]);

const hintClasses = computed(() => ["text-sm", "text-secondary-400", "dark:text-secondary-500"]);

const errorTextClasses = computed(() => ["text-sm", "text-error-600", "dark:text-error-400"]);
</script>

<style scoped>
.form-field {
  @apply block;
}

.form-field-content {
  @apply w-full;
}

.form-field-help {
  @apply mt-2;
}

/* Horizontal variant */
.form-field--horizontal {
  @apply flex items-start space-x-4;
}

.form-field--horizontal .form-field-content {
  @apply flex-1;
}

.form-field--horizontal .form-field-help {
  @apply ml-0 mt-2;
}

.form-field__label--horizontal {
  @apply mb-0 mt-2 min-w-0 flex-shrink-0;
  width: 200px; /* Fixed width for horizontal labels */
}

/* Inline variant */
.form-field--inline {
  @apply flex items-center space-x-3;
}

.form-field--inline .form-field__label--inline {
  @apply mb-0 min-w-0 flex-shrink-0;
  width: 120px; /* Fixed width for inline labels */
}

.form-field--inline .form-field-content {
  @apply flex-1;
}

.form-field--inline .form-field-help {
  @apply ml-0 mt-1;
}

/* RTL support */
[dir="rtl"] .form-field--horizontal {
  @apply space-x-0 space-x-reverse;
}

[dir="rtl"] .form-field--inline {
  @apply space-x-0 space-x-reverse;
}

[dir="rtl"] .ml-1 {
  @apply ml-0 mr-1;
}

/* Responsive behavior */
@media (max-width: 640px) {
  .form-field--horizontal {
    @apply flex-col space-x-0 space-y-2;
  }

  .form-field__label--horizontal {
    @apply mt-0 w-full;
  }

  .form-field--inline {
    @apply flex-col space-x-0 space-y-2;
  }

  .form-field__label--inline {
    @apply w-full;
  }
}
</style>
