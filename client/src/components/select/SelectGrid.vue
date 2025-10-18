<template>
  <div class="select-grid">
    <slot />
  </div>
</template>

<script setup lang="ts">
// Simple grid wrapper component for responsive card layout
</script>

<style scoped>
.select-grid {
  @apply grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-8 lg:grid-cols-4;
  @apply w-full;

  animation: fade-in 0.6s ease-out 0.2s backwards;
}

@keyframes fade-in {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  .select-grid {
    animation: none !important;
  }
}
</style>
