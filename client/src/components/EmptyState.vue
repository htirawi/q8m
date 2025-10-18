<template>
  <div class="empty-state" :class="variant && `empty-state--${variant}`">
    <div class="empty-state-container">
      <!-- Icon/Image -->
      <div v-if="showIcon" class="empty-state-icon">
        <slot name="icon">
          <div class="empty-state-icon-default">
            {{ icon || defaultIcon }}
          </div>
        </slot>
      </div>

      <!-- Illustration (optional) -->
      <div v-if="illustration" class="empty-state-illustration">
        <img :src="illustration" :alt="title" />
      </div>

      <!-- Content -->
      <div class="empty-state-content">
        <h3 v-if="title" class="empty-state-title">
          {{ title }}
        </h3>
        <p v-if="description" class="empty-state-description">
          {{ description }}
        </p>

        <!-- Additional Content Slot -->
        <div v-if="$slots.content" class="empty-state-extra">
          <slot name="content" />
        </div>
      </div>

      <!-- Actions -->
      <div v-if="showActions" class="empty-state-actions">
        <slot name="actions">
          <button
            v-if="primaryAction"
            class="empty-state-btn empty-state-btn--primary"
            @click="$emit('primary-action')"
          >
            {{ primaryAction }}
          </button>
          <button
            v-if="secondaryAction"
            class="empty-state-btn empty-state-btn--secondary"
            @click="$emit('secondary-action')"
          >
            {{ secondaryAction }}
          </button>
        </slot>
      </div>

      <!-- Help Text -->
      <p v-if="helpText" class="empty-state-help">
        {{ helpText }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";

const props = withDefaults(
  defineProps<{
    icon?: string;
    title?: string;
    description?: string;
    illustration?: string;
    variant?: "default" | "compact" | "large" | "error" | "info";
    showIcon?: boolean;
    showActions?: boolean;
    primaryAction?: string;
    secondaryAction?: string;
    helpText?: string;
  }>(),
  {
    showIcon: true,
    showActions: true,
    variant: "default",
  }
);

defineEmits<{}>();

const defaultIcon = computed(() => {
  switch (props.variant) {
    case "error":
      return "⚠️";
    case "info":
      return "ℹ️";
    default:
      return "📭";
  }
});
</script>

<style scoped>
.empty-state {
  @apply flex items-center justify-center;
  @apply px-4 py-12;
  @apply min-h-[400px];
}

.empty-state-container {
  @apply flex flex-col items-center;
  @apply mx-auto max-w-md text-center;
}

/* Icon */
.empty-state-icon {
  @apply mb-6;
}

.empty-state-icon-default {
  @apply text-6xl;
  @apply animate-bounce-subtle;
}

.empty-state-illustration {
  @apply mb-8 h-64 w-64;
}

.empty-state-illustration img {
  @apply h-full w-full object-contain;
  @apply opacity-80;
}

/* Content */
.empty-state-content {
  @apply mb-6;
}

.empty-state-title {
  @apply text-2xl font-bold text-gray-900 dark:text-white;
  @apply mb-3;
}

.empty-state-description {
  @apply text-base text-gray-600 dark:text-gray-400;
  @apply leading-relaxed;
}

.empty-state-extra {
  @apply mt-4;
}

/* Actions */
.empty-state-actions {
  @apply flex flex-col gap-3 sm:flex-row;
  @apply items-center justify-center;
  @apply mb-4;
}

.empty-state-btn {
  @apply rounded-lg px-6 py-3 font-medium;
  @apply transition-all duration-200;
  @apply focus:outline-none focus:ring-4 focus:ring-offset-2;
  @apply min-w-[140px];
}

.empty-state-btn--primary {
  @apply bg-gradient-to-r from-blue-600 to-purple-600;
  @apply text-white;
  @apply hover:from-blue-700 hover:to-purple-700;
  @apply focus:ring-blue-500;
  @apply shadow-lg hover:shadow-xl;
  @apply transform hover:scale-105 active:scale-95;
}

.empty-state-btn--secondary {
  @apply bg-gray-200 dark:bg-gray-700;
  @apply text-gray-700 dark:text-gray-300;
  @apply hover:bg-gray-300 dark:hover:bg-gray-600;
  @apply focus:ring-gray-500;
}

/* Help Text */
.empty-state-help {
  @apply text-sm text-gray-500 dark:text-gray-500;
  @apply mt-2;
}

/* Variants */

/* Compact */
.empty-state--compact {
  @apply min-h-[300px] py-8;
}

.empty-state--compact .empty-state-icon-default {
  @apply text-4xl;
}

.empty-state--compact .empty-state-title {
  @apply text-xl;
}

.empty-state--compact .empty-state-description {
  @apply text-sm;
}

/* Large */
.empty-state--large {
  @apply min-h-[600px] py-20;
}

.empty-state--large .empty-state-icon-default {
  @apply text-8xl;
}

.empty-state--large .empty-state-title {
  @apply text-3xl;
}

.empty-state--large .empty-state-description {
  @apply text-lg;
}

/* Error */
.empty-state--error .empty-state-title {
  @apply text-red-700 dark:text-red-400;
}

.empty-state--error .empty-state-icon-default {
  @apply text-red-500;
}

/* Info */
.empty-state--info .empty-state-title {
  @apply text-blue-700 dark:text-blue-400;
}

.empty-state--info .empty-state-icon-default {
  @apply text-blue-500;
}

/* Animations */
@keyframes bounce-subtle {
  0%,
  100% {
    transform: translateY(0);
  }

  50% {
    transform: translateY(-10px);
  }
}

.animate-bounce-subtle {
  animation: bounce-subtle 3s ease-in-out infinite;
}

/* RTL Support */
[dir="rtl"] .empty-state-actions {
  @apply flex-row-reverse;
}

/* Responsive */
@media (width <= 640px) {
  .empty-state {
    @apply min-h-[300px] py-8;
  }

  .empty-state-icon-default {
    @apply text-5xl;
  }

  .empty-state-title {
    @apply text-xl;
  }

  .empty-state-actions {
    @apply flex-col;
  }

  .empty-state-btn {
    @apply w-full;
  }
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  .empty-state-icon-default {
    animation: none;
  }

  .empty-state-btn--primary {
    @apply hover:scale-100 active:scale-100;
  }
}
</style>
