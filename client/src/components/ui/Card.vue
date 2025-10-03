<template>
  <component
    :is="tag"
    :class="cardClasses"
    :href="tag === 'a' ? href : undefined"
    :to="tag === 'router-link' ? to : undefined"
    @click="handleClick"
  >
    <!-- Header -->
    <div v-if="$slots.header || title || subtitle" class="card-header">
      <slot name="header">
        <div class="card-header-content">
          <h3 v-if="title" class="card-title">{{ title }}</h3>
          <p v-if="subtitle" class="card-subtitle">{{ subtitle }}</p>
        </div>
      </slot>
    </div>

    <!-- Body -->
    <div class="card-body">
      <slot />
    </div>

    <!-- Footer -->
    <div v-if="$slots.footer" class="card-footer">
      <slot name="footer" />
    </div>

    <!-- Loading overlay -->
    <div v-if="loading" class="card-loading">
      <LoadingSpinner size="md" color="primary" :text="loadingText || $t('common.loading')" />
    </div>
  </component>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import LoadingSpinner from "./LoadingSpinner.vue";

interface Props {
  title?: string;
  subtitle?: string;
  variant?: "default" | "elevated" | "outlined" | "filled";
  size?: "sm" | "md" | "lg";
  padding?: "none" | "sm" | "md" | "lg";
  loading?: boolean;
  loadingText?: string;
  clickable?: boolean;
  tag?: "div" | "article" | "section" | "a" | "router-link";
  href?: string;
  to?: string;
  disabled?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  title: "",
  subtitle: "",
  variant: "default",
  size: "md",
  padding: "md",
  loading: false,
  loadingText: "",
  clickable: false,
  tag: "div",
  href: "",
  to: "",
  disabled: false,
});

const emit = defineEmits<{
  click: [event: MouseEvent];
}>();

const { t } = useI18n();

const cardClasses = computed(() => {
  const baseClasses = ["card", "relative", "overflow-hidden", "transition-all", "duration-200"];

  // Variant classes
  const variantClasses = {
    default: [
      "bg-white",
      "border",
      "border-secondary-200",
      "shadow-sm",
      "dark:bg-secondary-800",
      "dark:border-secondary-700",
    ],
    elevated: ["bg-white", "border", "border-transparent", "shadow-lg", "dark:bg-secondary-800"],
    outlined: [
      "bg-transparent",
      "border-2",
      "border-secondary-300",
      "shadow-none",
      "dark:border-secondary-600",
    ],
    filled: [
      "bg-secondary-50",
      "border",
      "border-transparent",
      "shadow-none",
      "dark:bg-secondary-900",
    ],
  };

  // Size classes
  const sizeClasses = {
    sm: ["rounded-md"],
    md: ["rounded-lg"],
    lg: ["rounded-xl"],
  };

  // Interactive classes
  const interactiveClasses = [];

  if (props.clickable && !props.disabled) {
    interactiveClasses.push(
      "cursor-pointer",
      "hover:shadow-md",
      "hover:-translate-y-0.5",
      "active:translate-y-0",
      "focus:outline-none",
      "focus:ring-2",
      "focus:ring-primary-500",
      "focus:ring-offset-2"
    );
  }

  if (props.disabled) {
    interactiveClasses.push("opacity-50", "cursor-not-allowed", "pointer-events-none");
  }

  return [
    ...baseClasses,
    ...variantClasses[props.variant],
    ...sizeClasses[props.size],
    ...interactiveClasses,
  ].join(" ");
});

const handleClick = (event: MouseEvent) => {
  if (props.clickable && !props.disabled && !props.loading) {
    emit("click", event);
  }
};
</script>

<style scoped>
.card-header {
  @apply border-secondary-200 dark:border-secondary-700 border-b px-6 py-4;
}

.card-header-content {
  @apply space-y-1;
}

.card-title {
  @apply text-secondary-900 text-lg font-semibold dark:text-white;
}

.card-subtitle {
  @apply text-secondary-600 dark:text-secondary-400 text-sm;
}

.card-body {
  @apply flex-1;
}

.card-footer {
  @apply border-secondary-200 dark:border-secondary-700 border-t px-6 py-4;
}

.card-loading {
  @apply dark:bg-secondary-800/80 absolute inset-0 z-10 flex items-center justify-center bg-white/80 backdrop-blur-sm;
}

/* Padding variants */
.card-header[class*="p-"],
.card-body[class*="p-"],
.card-footer[class*="p-"] {
  /* Use default padding from component classes */
}

.card-header:not([class*="p-"]) {
  padding: var(--card-padding-md);
}

.card-body:not([class*="p-"]) {
  padding: var(--card-padding-md);
}

.card-footer:not([class*="p-"]) {
  padding: var(--card-padding-md);
}

/* Size-specific padding */
.card--sm .card-header:not([class*="p-"]),
.card--sm .card-body:not([class*="p-"]),
.card--sm .card-footer:not([class*="p-"]) {
  padding: var(--card-padding-sm);
}

.card--lg .card-header:not([class*="p-"]),
.card--lg .card-body:not([class*="p-"]),
.card--lg .card-footer:not([class*="p-"]) {
  padding: var(--card-padding-lg);
}

/* RTL support */
[dir="rtl"] .card-footer {
  @apply space-x-0 space-x-reverse;
}

/* Mobile optimizations */
@media (max-width: 640px) {
  .card-header,
  .card-body,
  .card-footer {
    @apply px-4 py-3;
  }

  .card-title {
    @apply text-base;
  }
}

/* Focus styles for clickable cards */
.card:focus {
  outline: 2px solid transparent;
  outline-offset: 2px;
}

/* Hover effects for elevated cards */
.card:hover {
  transition: all 0.2s ease-in-out;
}

/* Loading state */
.card[data-loading="true"] {
  @apply pointer-events-none;
}
</style>
