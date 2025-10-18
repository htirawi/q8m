<script setup lang="ts">
import { useI18n } from "vue-i18n";
import type { BillingHistorySectionProps } from "../../../types/ui/component-props";

defineProps<BillingHistorySectionProps>();

const emit = defineEmits<{
  refresh: [];
}>();

useI18n();

// Methods
const handleRefresh = () => {
  emit("refresh");
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString();
};

const getStatusClass = (status: string) => {
  switch (status) {
    case "pending":
      return "text-yellow-600 dark:text-yellow-400";
    default:
      return "text-gray-600 dark:text-gray-400";
  }
};
</script>

<template>
  <div class="billing-history">
    <div class="history-header">
      <h3 class="history-title">{{ $t("subscription.billingHistory") }}</h3>
      <button @click="handleRefresh" class="refresh-button">
        <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
          />
        </svg>
        {{ $t("common.refresh") }}
      </button>
    </div>

    <div v-if="purchases.length === 0" class="no-history">
      <p class="no-history-text">{{ $t("subscription.noHistory") }}</p>
    </div>

    <div v-else class="history-list">
      <div v-for="purchase in purchases" :key="purchase._id" class="history-item">
        <div class="history-info">
          <h4 class="history-plan">{{ purchase.productId }}</h4>
          <p class="history-date">{{ formatDate(purchase.createdAt?.toString() ?? "") }}</p>
        </div>
        <div class="history-details">
          <span class="history-amount"
            >{{ purchase.amount?.displayAmount }} {{ purchase.amount?.displayCurrency }}
          </span>
          <span class="history-status" :class="getStatusClass(purchase.status)">
            {{ $t(`subscription.purchaseStatus.${purchase.status}`) }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Billing History */
.billing-history {
  @apply rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800;
}

.history-header {
  @apply mb-6 flex items-center justify-between;
}

.history-title {
  @apply text-lg font-semibold text-gray-900 dark:text-white;
}

.refresh-button {
  @apply inline-flex items-center gap-2 px-3 py-1 text-sm font-medium text-gray-600 transition-colors duration-200 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200;
}

.no-history {
  @apply py-8 text-center;
}

.no-history-text {
  @apply text-gray-500 dark:text-gray-400;
}

.history-list {
  @apply space-y-4;
}

.history-item {
  @apply flex items-center justify-between border-b border-gray-100 py-3 last:border-b-0 dark:border-gray-700;
}

.history-info {
  @apply flex-1;
}

.history-plan {
  @apply text-sm font-medium text-gray-900 dark:text-white;
}

.history-date {
  @apply text-xs text-gray-500 dark:text-gray-400;
}

.history-details {
  @apply flex flex-col items-end gap-1;
}

.history-amount {
  @apply text-sm font-semibold text-gray-900 dark:text-white;
}

.history-status {
  @apply text-xs font-medium;
}

/* Mobile Responsiveness */
@media (width <=640px) {
  .history-item {
    @apply flex-col items-start gap-2;
  }

  .history-details {
    @apply flex-row items-center gap-4;
  }
}

/* RTL Support */
[dir="rtl"] .history-item {
  @apply flex-row-reverse;
}

[dir="rtl"] .history-details {
  @apply items-start;
}
</style>
