<template>
  <div class="input-wrapper">
    <label v-if="label" :for="inputId" :class="labelClasses">
      {{ label }}
      <span v-if="required" class="text-error-500 ml-1" aria-label="required">*</span>
    </label>

    <div class="input-container">
      <div v-if="$slots.prefix || prefixIcon" class="input-prefix">
        <slot name="prefix">
          <component v-if="prefixIcon" :is="prefixIcon" class="text-secondary-400 h-4 w-4" />
        </slot>
      </div>

      <input
        :id="inputId"
        ref="inputRef"
        :type="type"
        :value="modelValue"
        :placeholder="placeholder"
        :disabled="disabled"
        :readonly="readonly"
        :required="required"
        :autocomplete="autocomplete"
        :aria-describedby="helpTextId"
        :aria-invalid="hasError"
        :class="inputClasses"
        @input="handleInput"
        @blur="handleBlur"
        @focus="handleFocus"
        @keydown="handleKeydown"
      />

      <div v-if="$slots.suffix || suffixIcon || showPasswordToggle" class="input-suffix">
        <button
          v-if="showPasswordToggle"
          type="button"
          :class="passwordToggleClasses"
          :aria-label="showPassword ? t('common.hidePassword') : t('common.showPassword')"
          @click="togglePasswordVisibility"
        >
          <component :is="showPassword ? EyeSlashIcon : EyeIcon" class="h-4 w-4" />
        </button>

        <slot name="suffix">
          <component v-if="suffixIcon" :is="suffixIcon" class="text-secondary-400 h-4 w-4" />
        </slot>
      </div>
    </div>

    <div v-if="helpText || hasError" class="input-help">
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
import { ref, computed, nextTick, useId } from "vue";
import { useI18n } from "vue-i18n";
import { EyeIcon, EyeSlashIcon } from "@heroicons/vue/24/outline";

interface Props {
  modelValue?: string | number;
  type?: "text" | "email" | "password" | "number" | "tel" | "url" | "search";
  label?: string;
  placeholder?: string;
  helpText?: string;
  disabled?: boolean;
  readonly?: boolean;
  required?: boolean;
  autocomplete?: string;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "filled" | "flushed";
  errorMessage?: string;
  prefixIcon?: any;
  suffixIcon?: any;
  showPasswordToggle?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: "",
  type: "text",
  label: "",
  placeholder: "",
  helpText: "",
  disabled: false,
  readonly: false,
  required: false,
  autocomplete: "off",
  size: "md",
  variant: "default",
  errorMessage: "",
  showPasswordToggle: false,
});

const emit = defineEmits<{
  "update:modelValue": [value: string | number];
  focus: [event: FocusEvent];
  blur: [event: FocusEvent];
  keydown: [event: KeyboardEvent];
}>();

const { t } = useI18n();
const inputRef = ref<HTMLInputElement>();
const showPassword = ref(false);
const isFocused = ref(false);

// Generate unique IDs
const inputId = useId();
const helpTextId = useId();

const hasError = computed(() => !!props.errorMessage);

const inputClasses = computed(() => {
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
    "read-only:bg-secondary-50",
    "read-only:cursor-default",
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
    flushed: [
      "bg-transparent",
      "border-0",
      "border-b-2",
      "border-secondary-300",
      "rounded-none",
      "px-0",
      "focus:border-primary-500",
      "focus:ring-0",
      "dark:border-secondary-600",
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

  // Prefix/suffix padding
  const paddingClasses = [];
  if (props.prefixIcon || props.$slots.prefix) {
    paddingClasses.push("pl-10");
  }
  if (props.suffixIcon || props.$slots.suffix || props.showPasswordToggle) {
    paddingClasses.push("pr-10");
  }

  return [
    ...baseClasses,
    ...sizeClasses[props.size],
    ...variantClasses[props.variant],
    ...stateClasses,
    ...paddingClasses,
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

const passwordToggleClasses = computed(() => [
  "p-1",
  "rounded-md",
  "text-secondary-400",
  "hover:text-secondary-600",
  "focus:outline-none",
  "focus:ring-2",
  "focus:ring-primary-500",
  "focus:ring-offset-1",
  "transition-colors",
  "duration-200",
  "dark:text-secondary-500",
  "dark:hover:text-secondary-300",
]);

const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const value = props.type === "number" ? Number(target.value) : target.value;
  emit("update:modelValue", value);
};

const handleFocus = (event: FocusEvent) => {
  isFocused.value = true;
  emit("focus", event);
};

const handleBlur = (event: FocusEvent) => {
  isFocused.value = false;
  emit("blur", event);
};

const handleKeydown = (event: KeyboardEvent) => {
  emit("keydown", event);
};

const togglePasswordVisibility = () => {
  showPassword.value = !showPassword.value;
  nextTick(() => {
    if (inputRef.value) {
      inputRef.value.focus();
    }
  });
};

// Computed type for password visibility
const computedType = computed(() => {
  if (props.type === "password" && showPassword.value) {
    return "text";
  }
  return props.type;
});

// Expose methods for parent components
defineExpose({
  focus: () => inputRef.value?.focus(),
  blur: () => inputRef.value?.blur(),
  select: () => inputRef.value?.select(),
});
</script>

<style scoped>
.input-wrapper {
  @apply w-full;
}

.input-container {
  @apply relative;
}

.input-prefix {
  @apply pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 transform;
}

.input-suffix {
  @apply absolute right-3 top-1/2 -translate-y-1/2 transform;
}

.input-help {
  @apply mt-2;
}

/* RTL support */
[dir="rtl"] .input-prefix {
  @apply left-auto right-3;
}

[dir="rtl"] .input-suffix {
  @apply left-3 right-auto;
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
</style>
