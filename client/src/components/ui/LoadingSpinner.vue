<script setup lang="ts">
import { computed } from "vue";

import type { LoadingSpinnerProps } from "../../types/ui/component-props";

const props = withDefaults(defineProps<LoadingSpinnerProps>(), {
  size: "md",
  color: "primary",
});

const spinnerClasses = computed(() => {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8",
  };

  const colorClasses = {
    primary: "text-primary-600 dark:text-primary-400",
    white: "text-white",
    gray: "text-gray-600 dark:text-gray-400",
  };

  return [sizeClasses[props.size], colorClasses[props.color]].join(" ");
});
</script>

<template>
  <div class="loading-spinner" :class="spinnerClasses" aria-hidden="true">
    <svg class="animate-spin" viewBox="0 0 24 24">
      <circle
        class="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        stroke-width="4"
        fill="none"
      />
      <path
        class="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  </div>
</template>

<style scoped>
.loading-spinner {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
</style>
