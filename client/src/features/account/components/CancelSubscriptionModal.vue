<script setup lang="ts">
import { ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import type { CancelSubscriptionModalProps } from "@/types/ui/component-props";

const props = defineProps<CancelSubscriptionModalProps>();

const emit = defineEmits<{
  close: [];
  confirm: [reason: string];
}>();

useI18n();

// State
const selectedReason = ref("");

// Methods
const handleClose = () => {
  selectedReason.value = "";
  emit("close");
};

const handleconfirm = () => {
  if (!selectedReason.value) return;
  emit("confirm", selectedReason.value);
};

// Watch for modal close to reset reason
watch(
  () => props.show,
  (newValue) => {
    if (!newValue) {
      selectedReason.value = "";
    }
  }
);
</script>

<template>
  <div v-if="show" class="modal-overlay" @click="handleClose">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h3 class="modal-title">{{ $t("subscription.cancelConfirm") }}</h3>
        <button @click="handleClose" class="modal-close">
          <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      <div class="modal-body">
        <p class="modal-message">{{ $t("subscription.cancelMessage") }}</p>

        <div class="cancel-reasons">
          <label class="reason-label">{{ $t("subscription.cancelReason") }} </label>
          <select v-model="selectedReason" class="reason-select">
            <option value="">{{ $t("subscription.selectReason") }}</option>
            <option v-for="(reason, key) in reasons" :key="key" :value="key">
              {{ reason }}
            </option>
          </select>
        </div>
      </div>

      <div class="modal-footer">
        <button @click="handleClose" class="btn-secondary">
          {{ $t("common.cancel") }}
        </button>
        <button @click="handleConfirm" :disabled="!selectedReason || isLoading" class="btn-danger">
          <span v-if="isLoading" class="flex items-center">
            <div class="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-white"></div>
            {{ $t("common.processing") }}
          </span>
          <span v-else>{{ $t("subscription.confirmCancel") }} </span>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Modal */
.modal-overlay {
  @apply fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4;
}

.modal-content {
  @apply w-full max-w-md rounded-lg bg-white shadow-xl dark:bg-gray-800;
}

.modal-header {
  @apply flex items-center justify-between border-b border-gray-200 p-6 dark:border-gray-700;
}

.modal-title {
  @apply text-lg font-semibold text-gray-900 dark:text-white;
}

.modal-close {
  @apply text-gray-400 transition-colors duration-200 hover:text-gray-600 dark:hover:text-gray-200;
}

.modal-body {
  @apply space-y-4 p-6;
}

.modal-message {
  @apply text-gray-600 dark:text-gray-300;
}

.cancel-reasons {
  @apply space-y-2;
}

.reason-label {
  @apply block text-sm font-medium text-gray-700 dark:text-gray-300;
}

.reason-select {
  @apply w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white;
}

.modal-footer {
  @apply flex gap-3 border-t border-gray-200 p-6 dark:border-gray-700;
}

.btn-secondary {
  @apply inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-6 py-3 text-base font-medium text-gray-700 transition-colors duration-200 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700;
}

.btn-danger {
  @apply inline-flex items-center justify-center rounded-lg border border-transparent bg-red-600 px-6 py-3 text-base font-medium text-white transition-colors duration-200 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50;
}
</style>
