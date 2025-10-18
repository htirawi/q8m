<script setup lang="ts">
import type { IFormDividerProps } from "@/types/components/ui";

/**
 * FormDivider Component
 * Displays a horizontal divider with centered text (e.g., "Or continue with")
 * Commonly used in auth forms to separate primary and secondary actions.
 */



withDefaults(defineProps<IFormDividerProps>(), {
  text: "",
});
</script>

<template>
  <div class="form-divider">
    <div class="form-divider-line" />
    <span v-if="text" class="form-divider-text">
      {{ text }}

    </span>
    <span v-else class="form-divider-text">
      <slot />
    </span>
    <div class="form-divider-line" />
  </div>
</template>

<style scoped>
.form-divider {
  @apply relative flex items-center;
}

.form-divider-line {
  @apply flex-1 border-t border-gray-300 dark:border-gray-600;
}

.form-divider-text {
  @apply px-4 text-sm text-gray-500 dark:text-gray-400;
}
</style>
