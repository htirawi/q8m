<template>
  <div class="checkout-summary">
    <div class="summary-section">
      <h3 class="summary-title">{{ $t("checkout.orderSummary") }}

</h3>

      <div class="summary-items">
        <div class="summary-item">
          <span class="item-label">{{ selectedPlan.name }}

</span>
          <span class="item-value">{{ displayPrice }}

</span>
        </div>

        <div v-if="billingCycle === 'yearly'" class="summary-item">
          <span class="item-label">{{ $t("checkout.yearlyDiscount") }}

</span>
          <span class="item-value discount">{{ $t("checkout.savePercent", { percent: 17 }) }}

</span>
        </div>

        <div class="summary-item">
          <span class="item-label">{{ $t("checkout.billingCycle") }}

</span>
          <span class="item-value">{{ billingCycleText }}

</span>
        </div>
      </div>

      <div class="summary-divider" />

      <div class="summary-total">
        <span class="total-label">{{ $t("checkout.total") }}

</span>
        <span class="total-value">{{ displayPrice }}</span>
      </div>
    </div>

    <div class="checkout-actions">
      <button
        type="submit"
        :disabled="isProcessing || !isFormValid"
        class="checkout-button"
        :class="{ 'checkout-button--loading': isProcessing }"
      >
        <LoadingSpinner v-if="isProcessing" size="sm" color="white" class="mr-2" />
        {{ isProcessing ? $t("checkout.processing") : $t("checkout.completeOrder")$t }}

      </button>

      <p class="security-note">
        <ShieldCheckIcon class="mr-1 inline h-4 w-4" />
        {{ $t("checkout.securePayment") }}

      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { ShieldCheckIcon } from "@heroicons/vue/24/outline";
import LoadingSpinner from "@/components/ui/LoadingSpinner.vue";
import type { PlanPricing, PricingInfo } from "@/stores/payment";

interface props {
  selectedPlan: PlanPricing;
  billingCycle: "monthly" | "yearly";
  priceInfo?: PricingInfo;
  isProcessing: boolean;
  isFormValid: boolean;
}

const props = defineProps<Props>();

const { t } = useI18n();

const displayPrice = computed(() => {
  if (!props.priceInfo) return "N/A";
  return props.priceInfo.formatted;
});

const billingCycleText = computed(() => {
  return props.billingCycle === "monthly" ? t("checkout.perMonth") : t("checkout.perYear");
});
</script>

<style scoped>
.checkout-summary {
  @apply sticky top-8 rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800;
}

.summary-section {
  @apply mb-6;
}

.summary-title {
  @apply mb-4 text-lg font-semibold text-gray-900 dark:text-white;
}

.summary-items {
  @apply space-y-3;
}

.summary-item {
  @apply flex justify-between text-sm;
}

.item-label {
  @apply text-gray-600 dark:text-gray-300;
}

.item-value {
  @apply font-medium text-gray-900 dark:text-white;
}

.item-value.discount {
  @apply text-green-600 dark:text-green-400;
}

.summary-divider {
  @apply my-4 border-t border-gray-200 dark:border-gray-700;
}

.summary-total {
  @apply flex justify-between text-lg font-semibold;
}

.total-label {
  @apply text-gray-900 dark:text-white;
}

.total-value {
  @apply text-gray-900 dark:text-white;
}

.checkout-actions {
  @apply space-y-4;
}

.checkout-button {
  @apply w-full rounded-md bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-gray-400 dark:focus:ring-offset-gray-800;
}

.checkout-button--loading {
  @apply cursor-wait;
}

.security-note {
  @apply flex items-center justify-center text-xs text-gray-500 dark:text-gray-400;
}
</style>
