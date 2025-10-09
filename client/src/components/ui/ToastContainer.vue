<template>
  <div class="toast-container" aria-live="polite" aria-label="Notifications">
    <TransitionGroup name="toast-list" tag="div" class="toast-list">
      <Toast
        v-for="toast in toasts"
        :key="toast.id"
        :id="toast.id"
        :type="toast.type"
        :message="toast.message"
        :icon="toast.icon"
        :dismissible="toast.dismissible"
        :duration="toast.duration"
        :persistent="toast.persistent"
        @dismiss="removeToast(toast.id)"
      />
    </TransitionGroup>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import Toast from "@/components/ui/Toast.vue";
import type { Component } from "vue";

export interface ToastItem {
  id: string;
  type: "success" | "error" | "warning" | "info";
  message: string;
  icon?: Component;
  dismissible?: boolean;
  duration?: number;
  persistent?: boolean;
}

// State
const toasts = ref<ToastItem[]>([]);

// Methods
const addToast = (toast: Omit<ToastItem, "id">) => {
  const id = Math.random().toString(36).substr(2, 9);
  toasts.value.push({ ...toast, id });
};

const removeToast = (id: string) => {
  const index = toasts.value.findIndex((toast) => toast.id === id);
  if (index > -1) {
    toasts.value.splice(index, 1);
  }
};

const clearToasts = () => {
  toasts.value = [];
};

// Expose methods for global use
defineExpose({
  addToast,
  removeToast,
  clearToasts,
});
</script>

<style scoped>
.toast-container {
  @apply fixed right-4 top-4 z-50 space-y-2;
}

.toast-list {
  @apply space-y-2;
}

/* Transitions */
.toast-list-move,
.toast-list-enter-active,
.toast-list-leave-active {
  transition: all 0.3s ease;
}

.toast-list-enter-from,
.toast-list-leave-to {
  opacity: 0;
  transform: translateX(100%);
}

.toast-list-leave-active {
  position: absolute;
}
</style>
