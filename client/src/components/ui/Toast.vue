<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from "vue";

import type { ToastInternalProps } from "@/types/ui/internal";

const props = withDefaults(defineProps<ToastInternalProps>(), {
  type: "info",
  dismissible: true,
  duration: 5000,
  persistent: false,
});

const emit = defineEmits<{
  dismiss: [];
  "update:isVisible": [value: boolean];
}>();

// State
const isVisible = ref(true);
let timeoutId: number | null = null;
timeoutId;

// Computed properties
const toastClasses = computed(() => {
  const baseClasses = ["toast"];

  const typeClasses = {
    success: "toast--success",
    error: "toast--error",
    warning: "toast--warning",
    info: "toast--info",
  };

  return [...baseClasses, typeClasses[props.type]].join(" ");
});

const ariaLive = computed(() => {
  return props.type === "error" ? "assertive" : "polite";
});

// Methods
const handleDismiss = () => {
  isVisible.value = false;
  emit("dismiss");
  emit("update:isVisible", false);
};

const handleEnter = () => {
  if (!props.persistent && props.duration > 0) {
    timeoutId = window.setTimeout(() => {
      handleDismiss();
    }, props.duration);
  }
};

const handleLeave = () => {
  if (timeoutId) {
    clearTimeout(timeoutId);
    timeoutId = null;
  }
};

// Lifecycle
onMounted(() => {
  handleEnter();
});

// Cleanup
onUnmounted(() => {
  if (timeoutId) {
    clearTimeout(timeoutId);
  }
});
</script>

<template>
  <Transition name="toast" @enter="handleEnter" @leave="handleLeave">
    <div
      v-if="isVisible"
      :id="id"
      class="toast"
      :class="toastClasses"
      role="alert"
      :aria-live="ariaLive"
      :aria-atomic="true"
    >
      <div class="toast-content">
        <div v-if="icon" class="toast-icon" aria-hidden="true">
          <component :is="icon" class="h-5 w-5" />
        </div>
        <div class="toast-message">
          <slot>
            {{ message }}
          </slot>
        </div>
        <button
          v-if="dismissible"
          type="button"
          class="toast-close"
          :aria-label="$t('a11y.dismissNotification')"
          @click="handleDismiss"
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
    </div>
  </Transition>
</template>

<style scoped>
.toast {
  @apply pointer-events-auto w-full max-w-sm overflow-hidden rounded-lg bg-white shadow-lg ring-1 ring-black ring-opacity-5 dark:bg-gray-800;
}

.toast-content {
  @apply flex items-start space-x-3 p-4;
}

.toast-icon {
  @apply mt-0.5 flex-shrink-0;
}

.toast-message {
  @apply flex-1 text-sm text-gray-900 dark:text-gray-100;
}

.toast-close {
  @apply flex min-h-[44px] min-w-[44px] flex-shrink-0 items-center justify-center rounded-md p-1 text-gray-400 transition-colors duration-200 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-300;
}

/* Type variants */
.toast--success .toast-icon {
  @apply text-green-500;
}

.toast--error .toast-icon {
  @apply text-red-500;
}

.toast--warning .toast-icon {
  @apply text-yellow-500;
}

.toast--info .toast-icon {
  @apply text-blue-500;
}

/* Focus styles */
.toast-close:focus {
  @apply outline-none ring-2 ring-primary-500 ring-offset-2 dark:ring-offset-gray-800;
}

/* Transitions */
.toast-enter-active {
  transition: all 0.3s ease;
}

.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(100%);
}
</style>
