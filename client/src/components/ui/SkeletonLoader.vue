<template>
  <div
    class="skeleton-loader"
    :class="[
      `skeleton-loader--${variant}`,
      customClass
    ]"
    :style="customStyle"
    role="status"
    aria-live="polite"
    :aria-label="ariaLabel || $t('a11y.loading')"
  >
    <span class="sr-only">{{ loadingText }}</span>
    <div class="skeleton-loader__shimmer"></div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

export interface SkeletonLoaderProps {
  variant?: 'text' | 'heading' | 'paragraph' | 'avatar' | 'card' | 'button' | 'image' | 'custom';
  width?: string | number;
  height?: string | number;
  rounded?: boolean;
  animated?: boolean;
  customClass?: string;
  ariaLabel?: string;
  lines?: number; // For paragraph variant
  delay?: number; // Animation delay in ms
}

const props = withDefaults(defineProps<SkeletonLoaderProps>(), {
  variant: 'text',
  animated: true,
  rounded: false,
  lines: 3,
  delay: 0
});

const { t } = useI18n();

const loadingText = computed(() => {
  const variantTexts: Record<string, string> = {
    text: t('skeleton.loadingText'),
    heading: t('skeleton.loadingHeading'),
    paragraph: t('skeleton.loadingParagraph'),
    avatar: t('skeleton.loadingAvatar'),
    card: t('skeleton.loadingCard'),
    button: t('skeleton.loadingButton'),
    image: t('skeleton.loadingImage'),
    custom: t('skeleton.loading')
  };
  return variantTexts[props.variant] || t('skeleton.loading');
});

const customStyle = computed(() => {
  const styles: Record<string, any> = {};

  if (props.width) {
    styles.width = typeof props.width === 'number' ? `${props.width}px` : props.width;
  }

  if (props.height) {
    styles.height = typeof props.height === 'number' ? `${props.height}px` : props.height;
  }

  if (props.delay) {
    styles.animationDelay = `${props.delay}ms`;
  }

  return styles;
});
</script>

<style scoped>
/* Base skeleton loader */
.skeleton-loader {
  @apply relative overflow-hidden bg-gray-200 dark:bg-gray-700;
  @apply rounded-md;
  background: linear-gradient(
    90deg,
    var(--color-gray-200) 0%,
    var(--color-gray-100) 50%,
    var(--color-gray-200) 100%
  );
  background-size: 200% 100%;
}

/* Dark mode gradient */
.dark .skeleton-loader {
  background: linear-gradient(
    90deg,
    var(--color-gray-700) 0%,
    var(--color-gray-600) 50%,
    var(--color-gray-700) 100%
  );
}

/* Shimmer animation */
.skeleton-loader__shimmer {
  @apply absolute inset-0;
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(255, 255, 255, 0.3) 50%,
    transparent 100%
  );
  animation: skeleton-shimmer 1.5s ease-in-out infinite;
  transform: translateX(-100%);
}

.dark .skeleton-loader__shimmer {
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(255, 255, 255, 0.1) 50%,
    transparent 100%
  );
}

@keyframes skeleton-shimmer {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}

/* Variant: Text */
.skeleton-loader--text {
  @apply h-4 w-full;
  max-width: 100%;
}

/* Variant: Heading */
.skeleton-loader--heading {
  @apply h-8 w-3/4;
  @apply rounded-lg;
}

/* Variant: Paragraph */
.skeleton-loader--paragraph {
  @apply space-y-2;
}

.skeleton-loader--paragraph::before,
.skeleton-loader--paragraph::after {
  content: '';
  @apply block h-4 bg-gray-200 dark:bg-gray-700 rounded;
  background: inherit;
}

.skeleton-loader--paragraph::before {
  @apply w-full mb-2;
}

.skeleton-loader--paragraph::after {
  @apply w-4/5;
}

/* Variant: Avatar */
.skeleton-loader--avatar {
  @apply h-10 w-10 rounded-full;
  @apply ring-2 ring-gray-100 dark:ring-gray-800;
}

/* Variant: Card */
.skeleton-loader--card {
  @apply h-64 w-full rounded-xl;
  @apply shadow-sm;
}

/* Variant: Button */
.skeleton-loader--button {
  @apply h-10 w-24 rounded-lg;
}

/* Variant: Image */
.skeleton-loader--image {
  @apply h-48 w-full rounded-lg;
  @apply bg-gradient-to-br from-gray-200 to-gray-300;
  @apply dark:from-gray-700 dark:to-gray-800;
}

/* Rounded modifier */
.skeleton-loader[rounded] {
  @apply rounded-full;
}

/* Disable animation on reduced motion */
@media (prefers-reduced-motion: reduce) {
  .skeleton-loader__shimmer {
    animation: none;
  }
}

/* Screen reader only text */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
</style>