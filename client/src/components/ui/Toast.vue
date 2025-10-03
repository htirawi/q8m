<template>
  <div class="toast" :class="toastClasses" role="alert" aria-live="assertive" aria-atomic="true">
    <div class="toast-content">
      <div class="toast-icon">
        <component :is="iconComponent" class="h-5 w-5" />
      </div>

      <div class="toast-body">
        <h4 class="toast-title">{{ toast.title }}</h4>
        <p class="toast-message">{{ toast.message }}</p>

        <div v-if="toast.action" class="toast-actions">
          <button type="button" class="toast-action-button" @click="$emit('action', toast)">
            {{ toast.action.label }}
          </button>
        </div>
      </div>

      <button
        type="button"
        class="toast-close"
        :aria-label="$t('common.close')"
        @click="$emit('close', toast.id)"
      >
        <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
    </div>

    <!-- Progress bar for auto-dismiss toasts -->
    <div
      v-if="!toast.persistent && toast.duration"
      class="toast-progress"
      :style="{ animationDuration: `${toast.duration}ms` }"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, defineAsyncComponent } from "vue";
import { useI18n } from "vue-i18n";
import type { Toast } from "@/composables/useToast";

interface Props {
  toast: Toast;
}

const props = defineProps<Props>();

defineEmits<{
  close: [id: string];
  action: [toast: Toast];
}>();

const { t } = useI18n();

const toastClasses = computed(() => {
  const baseClasses = "relative overflow-hidden rounded-lg border p-4 shadow-lg backdrop-blur-sm";

  const typeClasses = {
    success:
      "bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-400",
    error:
      "bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400",
    warning:
      "bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-900/20 dark:border-yellow-800 dark:text-yellow-400",
    info: "bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-400",
  };

  return `${baseClasses} ${typeClasses[props.toast.type]}`;
});

const iconComponent = computed(() => {
  const icons = {
    success: defineAsyncComponent(() => import("@heroicons/vue/24/outline/CheckCircleIcon")),
    error: defineAsyncComponent(() => import("@heroicons/vue/24/outline/XCircleIcon")),
    warning: defineAsyncComponent(
      () => import("@heroicons/vue/24/outline/ExclamationTriangleIcon")
    ),
    info: defineAsyncComponent(() => import("@heroicons/vue/24/outline/InformationCircleIcon")),
  };

  return icons[props.toast.type];
});
</script>

<style scoped>
.toast-content {
  @apply flex items-start gap-3;
}

.toast-icon {
  @apply mt-0.5 flex-shrink-0;
}

.toast-body {
  @apply min-w-0 flex-1;
}

.toast-title {
  @apply text-sm font-semibold leading-5;
}

.toast-message {
  @apply mt-1 text-sm leading-5 opacity-90;
}

.toast-actions {
  @apply mt-2;
}

.toast-action-button {
  @apply text-sm font-medium underline hover:no-underline focus:underline focus:outline-none;
}

.toast-close {
  @apply flex-shrink-0 rounded-md p-1 hover:bg-black/5 focus:outline-none focus:ring-2 focus:ring-current focus:ring-offset-2 dark:hover:bg-white/5;
}

.toast-progress {
  @apply absolute bottom-0 left-0 h-1 bg-current opacity-30;
  animation: progress linear forwards;
}

@keyframes progress {
  from {
    width: 100%;
  }
  to {
    width: 0%;
  }
}

/* RTL support */
[dir="rtl"] .toast-content {
  @apply flex-row-reverse;
}

[dir="rtl"] .toast-progress {
  @apply left-auto right-0;
}
</style>
