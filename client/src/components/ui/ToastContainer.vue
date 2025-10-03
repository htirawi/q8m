<template>
  <Teleport to="body">
    <div
      v-if="toasts.length > 0"
      class="toast-container"
      role="alert"
      aria-live="polite"
      aria-atomic="true"
    >
      <TransitionGroup name="toast" tag="div" class="toast-list">
        <Toast
          v-for="toast in toasts"
          :key="toast.id"
          :toast="toast"
          @close="removeToast"
          @action="handleAction"
        />
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { useToast, type Toast } from "@/composables/useToast";

const { toasts, removeToast } = useToast();

const handleAction = (toast: Toast) => {
  if (toast.action?.handler) {
    toast.action.handler();
  }
  removeToast(toast.id);
};
</script>

<style scoped>
.toast-container {
  @apply fixed right-4 top-4 z-50 space-y-2;
  max-width: 400px;
}

.toast-list {
  @apply space-y-2;
}

/* Toast animations */
.toast-enter-active,
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

.toast-move {
  transition: transform 0.3s ease;
}

/* RTL support */
[dir="rtl"] .toast-container {
  @apply left-4 right-auto;
}

[dir="rtl"] .toast-enter-from,
[dir="rtl"] .toast-leave-to {
  transform: translateX(-100%);
}
</style>
