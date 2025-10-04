<template>
  <div :class="cardClasses" :aria-labelledby="ariaLabelledby" :aria-describedby="ariaDescribedby">
    <header v-if="$slots.header" class="card-header">
      <slot name="header" />
    </header>

    <div class="card-content">
      <slot />
    </div>

    <footer v-if="$slots.footer" class="card-footer">
      <slot name="footer" />
    </footer>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";

export interface CardProps {
  variant?: "default" | "elevated" | "outlined";
  padding?: "none" | "sm" | "md" | "lg";
  ariaLabelledby?: string;
  ariaDescribedby?: string;
}

const props = withDefaults(defineProps<CardProps>(), {
  variant: "default",
  padding: "md",
});

const cardClasses = computed(() => {
  const baseClasses = ["card"];

  // Variant classes
  const variantClasses = {
    default: "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700",
    elevated: "bg-white dark:bg-gray-800 shadow-lg",
    outlined: "bg-transparent border-2 border-gray-300 dark:border-gray-600",
  };

  // Padding classes
  const paddingClasses = {
    none: "",
    sm: "p-4",
    md: "p-6",
    lg: "p-8",
  };

  return [...baseClasses, variantClasses[props.variant], paddingClasses[props.padding]].join(" ");
});
</script>

<style scoped>
.card {
  @apply rounded-lg transition-shadow duration-200;
}

.card-header {
  @apply mb-4 border-b border-gray-200 pb-4 dark:border-gray-700;
}

.card-content {
  @apply space-y-4;
}

.card-footer {
  @apply mt-4 border-t border-gray-200 pt-4 dark:border-gray-700;
}

/* Focus styles for interactive cards */
.card:focus-within {
  @apply outline-none ring-2 ring-primary-500 ring-offset-2 dark:ring-offset-gray-800;
}
</style>
