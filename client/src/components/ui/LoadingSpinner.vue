<template>
  <div
    class="loading-spinner"
    :class="containerClasses"
    role="status"
    :aria-label="$t('common.loading')"
  >
    <div class="spinner" :class="spinnerClasses" :style="spinnerStyle" />
    <span v-if="showText" class="loading-text">{{ text || $t("common.loading") }}</span>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";

interface Props {
  size?: "sm" | "md" | "lg" | "xl";
  color?: "primary" | "secondary" | "white" | "gray";
  text?: string;
  showText?: boolean;
  centered?: boolean;
  fullScreen?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  size: "md",
  color: "primary",
  text: "",
  showText: false,
  centered: false,
  fullScreen: false,
});

const { t } = useI18n();

const containerClasses = computed(() => {
  const classes = ["loading-spinner"];

  if (props.centered) classes.push("centered");
  if (props.fullScreen) classes.push("full-screen");

  return classes.join(" ");
});

const spinnerClasses = computed(() => {
  return `spinner-${props.size} spinner-${props.color}`;
});

const spinnerStyle = computed(() => {
  const sizes = {
    sm: { width: "1rem", height: "1rem" },
    md: { width: "2rem", height: "2rem" },
    lg: { width: "3rem", height: "3rem" },
    xl: { width: "4rem", height: "4rem" },
  };

  return sizes[props.size];
});
</script>

<style scoped>
.loading-spinner {
  @apply inline-flex items-center gap-2;
}

.loading-spinner.centered {
  @apply justify-center;
}

.loading-spinner.full-screen {
  @apply fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm dark:bg-gray-900/80;
}

.spinner {
  @apply animate-spin rounded-full border-2 border-solid border-transparent;
  border-top-color: currentColor;
}

.spinner-sm {
  @apply h-4 w-4;
}

.spinner-md {
  @apply h-8 w-8;
}

.spinner-lg {
  @apply h-12 w-12;
}

.spinner-xl {
  @apply h-16 w-16;
}

.spinner-primary {
  @apply text-blue-600 dark:text-blue-400;
}

.spinner-secondary {
  @apply text-gray-600 dark:text-gray-400;
}

.spinner-white {
  @apply text-white;
}

.spinner-gray {
  @apply text-gray-500 dark:text-gray-400;
}

.loading-text {
  @apply text-sm font-medium text-gray-700 dark:text-gray-300;
}

/* RTL support */
[dir="rtl"] .loading-spinner {
  @apply flex-row-reverse;
}
</style>
