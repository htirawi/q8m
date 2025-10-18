<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";

import LoadingSpinner from "@/components/ui/LoadingSpinner.vue";

import type { LoadingStateProps } from "@/types/ui/component-props";

const props = withDefaults(defineProps<LoadingStateProps>(), {
  type: "section",
  size: "md",
  color: "primary",
  text: "",
  description: "",
  showText: false,
  showProgress: false,
  progress: undefined,
  progressText: "",
  centered: true,
  fullHeight: false,
});

const { t } = useI18n();

const containerClasses = computed(() => {
  const classes = ["loading-state"];

  classes.push(`loading-state-${props.type}`);

  if (props.centered) classes.push("centered");
  if (props.fullHeight) classes.push("full-height");

  return classes.join(" ");
});

const spinnerSize = computed(() => {
  const sizeMap = {
    page: "lg",
    section: "md",
    inline: "sm",
    overlay: "lg",
  };

  return sizeMap[props.type];
});

const spinnerColor = computed(() => {
  const colorMap = {
    page: "primary",
    section: "primary",
    inline: "secondary",
    overlay: "white",
  };

  return colorMap[props.type];
});

const ariaLabel = computed(() => {
  if (props.text) return props.text;
  if (props.description) return props.description;
  return t("common.loading");
});
</script>

<template>
  <div class="loading-state" :class="containerClasses" role="status" :aria-label="ariaLabel">
    <div class="loading-content">
      <LoadingSpinner :size="spinnerSize as 'sm' | 'md' | 'lg'" :color="spinnerColor as 'primary' | 'white' | 'gray'" :text="text" :show-text="showText" />

      <div v-if="description" class="loading-description">
        {{ description }}
      </div>

      <div v-if="showProgress && progress !== undefined" class="loading-progress">
        <div class="progress-bar">
          <div class="progress-fill" :style="{ width: `${Math.min(100, Math.max(0, progress))}%` }" />
        </div>
        <div class="progress-text">{{ progressText }}

</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.loading-state {
  @apply flex items-center justify-center;
}

.loading-state-page {
  @apply min-h-screen bg-gray-50 dark:bg-gray-900;
}

.loading-state-section {
  @apply min-h-64 rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800;
}

.loading-state-inline {
  @apply py-4;
}

.loading-state-overlay {
  @apply fixed inset-0 z-50 bg-black/50 backdrop-blur-sm;
}

.loading-state.centered {
  @apply items-center justify-center;
}

.loading-state.full-height {
  @apply h-full;
}

.loading-content {
  @apply space-y-4 text-center;
}

.loading-description {
  @apply mx-auto max-w-md text-sm text-gray-600 dark:text-gray-400;
}

.loading-progress {
  @apply space-y-2;
}

.progress-bar {
  @apply h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700;
}

.progress-fill {
  @apply h-full rounded-full bg-blue-600 transition-all duration-300 ease-out dark:bg-blue-400;
}

.progress-text {
  @apply text-xs text-gray-500 dark:text-gray-400;
}

/* RTL support */
[dir="rtl"] .loading-content {
  @apply text-right;
}
</style>
