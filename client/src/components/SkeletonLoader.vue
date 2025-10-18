<template>
  <div class="skeleton" :class="skeletonClass" :style="skeletonStyle" :aria-busy="true" :aria-live="'polite'">
    <!-- Shimmer effect overlay -->
    <div v-if="animated" class="skeleton-shimmer" />
  </div>
</template>

<script setup lang="ts">
import type { ISkeletonLoaderProps as Props } from "@/types/components/ui";
import { computed } from 'vue';



const props = withDefaults(defineProps<Props>(), {
  variant: 'text',
  animated: true,
});

const skeletonClass = computed(() => {
  const classes = ['skeleton-base'];

  // Variant classes
  switch (props.variant) {
    case 'text':
      classes.push('skeleton-text');
      break;
    case 'circle':
      classes.push('skeleton-circle');
      break;
    case 'rectangular':
      classes.push('skeleton-rectangular');
      break;
    case 'rounded':
      classes.push('skeleton-rounded');
      break;
    case 'card':
      classes.push('skeleton-card');
      break;
    case 'avatar':
      classes.push('skeleton-avatar');
      break;
  }

  if (props.customClass) {
    classes.push(props.customClass);
  }

  return classes.join(' ');
});

const skeletonStyle = computed(() => {
  const style: Record<string, string> = {};

  if (props.width) {
    style.width = typeof props.width === 'number' ? `${props.width}px` : props.width;
  }

  if (props.height) {
    style.height = typeof props.height === 'number' ? `${props.height}px` : props.height;
  }

  return style;
});
</script>

<style scoped>
.skeleton {
  @apply relative overflow-hidden;
  @apply bg-gray-200 dark:bg-gray-700;
}

.skeleton-base {
  @apply inline-block;
}

/* Variants */
.skeleton-text {
  @apply h-4 rounded;
  @apply w-full;
}

.skeleton-circle {
  @apply rounded-full;
  @apply w-12 h-12;
}

.skeleton-rectangular {
  @apply rounded-none;
  @apply w-full h-32;
}

.skeleton-rounded {
  @apply rounded-lg;
  @apply w-full h-32;
}

.skeleton-card {
  @apply rounded-xl;
  @apply w-full h-64;
}

.skeleton-avatar {
  @apply rounded-full;
  @apply w-10 h-10;
}

/* Shimmer animation */
.skeleton-shimmer {
  @apply absolute inset-0;
  @apply bg-gradient-to-r from-transparent via-white/20 to-transparent;

  animation: shimmer 2s infinite;
}

@keyframes shimmer {
  0% {
    transform: translateX(-100%);
  }

  100% {
    transform: translateX(100%);
  }
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  .skeleton-shimmer {
    animation: none;
  }
}
</style>
