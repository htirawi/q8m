<script setup lang="ts">
import { useI18n } from "vue-i18n";
import type { SubscriptionActionsProps } from "@/types/ui/component-props";

defineProps<SubscriptionActionsProps>();

const emit = defineemits<{
  upgrade: [];
  cancel: [];
  startQuizzes: [];
}>();

useI18n();

// Methods
const handleUpgrade = () => {
  emit("upgrade");
};

const handlecancel = () => {
  emit("cancel");
};

const handlestartquizzes = () => {
  emit("startQuizzes");
};

</script>

<template>
  <div class="action-buttons">
    <button v-if="canUpgrade" @click="handleUpgrade" class="btn-primary">
      {{ $t("subscription.upgradePlan") }}

    </button>

    <button v-if="isActive" @click="handleCancel" class="btn-danger">
      {{ $t("subscription.cancelSubscription") }}

    </button>

    <button @click="handleStartQuizzes" class="btn-secondary">
      {{ $t("subscription.startQuizzes") }}

    </button>
  </div>
</template>

<style scoped>
/* Action Buttons */
.action-buttons {
  @apply flex flex-col justify-center gap-4 sm:flex-row;
}

.btn-primary {
  @apply inline-flex items-center justify-center rounded-lg border border-transparent bg-indigo-600 px-6 py-3 text-base font-medium text-white transition-colors duration-200 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2;
}

.btn-secondary {
  @apply inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-6 py-3 text-base font-medium text-gray-700 transition-colors duration-200 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700;
}

.btn-danger {
  @apply inline-flex items-center justify-center rounded-lg border border-transparent bg-red-600 px-6 py-3 text-base font-medium text-white transition-colors duration-200 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2;
}

/* Mobile Responsiveness */
@media (width <=640px) {
  .action-buttons {
    @apply flex-col;
  }
}
</style>
