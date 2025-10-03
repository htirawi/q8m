<template>
  <component
    :is="tag"
    :type="type"
    :disabled="disabled || loading"
    :class="buttonClasses"
    :aria-label="ariaLabel"
    :aria-disabled="disabled || loading"
    :aria-busy="loading"
    @click="handleClick"
  >
    <LoadingSpinner v-if="loading" :size="spinnerSize" :color="spinnerColor" :show-text="false" />

    <slot v-if="!loading" />

    <span v-if="loading && loadingText" class="ml-2">
      {{ loadingText }}
    </span>
  </component>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import LoadingSpinner from "./LoadingSpinner.vue";

interface Props {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger" | "success" | "warning";
  size?: "sm" | "md" | "lg" | "xl";
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  loading?: boolean;
  loadingText?: string;
  fullWidth?: boolean;
  rounded?: boolean;
  tag?: "button" | "a" | "router-link";
  href?: string;
  to?: string;
  ariaLabel?: string;
}

const props = withDefaults(defineProps<Props>(), {
  variant: "primary",
  size: "md",
  type: "button",
  disabled: false,
  loading: false,
  loadingText: "",
  fullWidth: false,
  rounded: false,
  tag: "button",
  ariaLabel: "",
});

const emit = defineEmits<{
  click: [event: MouseEvent];
}>();

const { t } = useI18n();

const buttonClasses = computed(() => {
  const baseClasses = [
    "inline-flex",
    "items-center",
    "justify-center",
    "font-medium",
    "transition-all",
    "duration-200",
    "focus:outline-none",
    "focus:ring-2",
    "focus:ring-offset-2",
    "disabled:opacity-50",
    "disabled:cursor-not-allowed",
    "disabled:pointer-events-none",
    "select-none",
    "touch-manipulation",
  ];

  // Size classes
  const sizeClasses = {
    sm: ["text-sm", "px-3", "py-2", "h-8", "min-h-8"],
    md: ["text-base", "px-4", "py-2", "h-10", "min-h-10"],
    lg: ["text-lg", "px-6", "py-3", "h-12", "min-h-12"],
    xl: ["text-xl", "px-8", "py-4", "h-14", "min-h-14"],
  };

  // Variant classes
  const variantClasses = {
    primary: [
      "bg-primary-600",
      "text-white",
      "border",
      "border-transparent",
      "hover:bg-primary-700",
      "focus:ring-primary-500",
      "active:bg-primary-800",
    ],
    secondary: [
      "bg-secondary-100",
      "text-secondary-900",
      "border",
      "border-secondary-300",
      "hover:bg-secondary-200",
      "focus:ring-secondary-500",
      "active:bg-secondary-300",
      "dark:bg-secondary-800",
      "dark:text-secondary-100",
      "dark:border-secondary-600",
      "dark:hover:bg-secondary-700",
      "dark:active:bg-secondary-600",
    ],
    outline: [
      "bg-transparent",
      "text-primary-600",
      "border",
      "border-primary-600",
      "hover:bg-primary-50",
      "focus:ring-primary-500",
      "active:bg-primary-100",
      "dark:text-primary-400",
      "dark:border-primary-400",
      "dark:hover:bg-primary-900/20",
      "dark:active:bg-primary-900/40",
    ],
    ghost: [
      "bg-transparent",
      "text-primary-600",
      "border",
      "border-transparent",
      "hover:bg-primary-50",
      "focus:ring-primary-500",
      "active:bg-primary-100",
      "dark:text-primary-400",
      "dark:hover:bg-primary-900/20",
      "dark:active:bg-primary-900/40",
    ],
    danger: [
      "bg-error-600",
      "text-white",
      "border",
      "border-transparent",
      "hover:bg-error-700",
      "focus:ring-error-500",
      "active:bg-error-800",
    ],
    success: [
      "bg-success-600",
      "text-white",
      "border",
      "border-transparent",
      "hover:bg-success-700",
      "focus:ring-success-500",
      "active:bg-success-800",
    ],
    warning: [
      "bg-warning-600",
      "text-white",
      "border",
      "border-transparent",
      "hover:bg-warning-700",
      "focus:ring-warning-500",
      "active:bg-warning-800",
    ],
  };

  // Additional classes
  const additionalClasses = [];

  if (props.fullWidth) {
    additionalClasses.push("w-full");
  }

  if (props.rounded) {
    additionalClasses.push("rounded-full");
  } else {
    additionalClasses.push("rounded-lg");
  }

  return [
    ...baseClasses,
    ...sizeClasses[props.size],
    ...variantClasses[props.variant],
    ...additionalClasses,
  ].join(" ");
});

const spinnerSize = computed(() => {
  const sizeMap = {
    sm: "sm",
    md: "sm",
    lg: "md",
    xl: "md",
  };
  return sizeMap[props.size];
});

const spinnerColor = computed(() => {
  if (
    props.variant === "primary" ||
    props.variant === "danger" ||
    props.variant === "success" ||
    props.variant === "warning"
  ) {
    return "white";
  }
  return "primary";
});

const handleClick = (event: MouseEvent) => {
  if (!props.disabled && !props.loading) {
    emit("click", event);
  }
};
</script>

<style scoped>
/* Additional styles for better touch targets on mobile */
@media (max-width: 768px) {
  .min-h-8 {
    min-height: 44px; /* WCAG AA recommendation for touch targets */
  }

  .min-h-10 {
    min-height: 44px;
  }

  .min-h-12 {
    min-height: 48px;
  }

  .min-h-14 {
    min-height: 52px;
  }
}

/* RTL support */
[dir="rtl"] .ml-2 {
  margin-left: 0;
  margin-right: 0.5rem;
}
</style>
