<template>
  <div class="order-summary">
    <h3 class="summary-title">{{ $t("checkout.orderSummary") }}

</h3>

    <div class="plan-details">
      <div class="plan-info">
        <h4 class="plan-name">{{ selectedPlan.name }}

</h4>
        <p class="plan-description">{{ selectedPlan.description }}

</p>
      </div>

      <div class="plan-pricing">
        <div class="price-container">
          <span class="price-amount">{{ displayPrice }}

</span>
          <span class="price-period">{{ pricePeriod }}

</span>
        </div>
        <p v-if="priceInfo?.isEstimated" class="price-note">
          {{ $t("checkout.estimatedPrice") }}
        </p>
      </div>
    </div>

    <!-- Billing Cycle Toggle -->
    <div v-if="selectedPlan.planId !== 'JUNIOR'" class="billing-toggle">
      <div class="toggle-container">
        <span class="toggle-label" :class="{ 'toggle-label--active': billingCycle === 'monthly' }">
          {{ $t("checkout.monthly") }}
        </span>
        <button
          @click="$emit('toggle-billing-cycle')"
          class="toggle-switch"
          :class="{ 'toggle-switch--active': billingCycle === 'yearly' }"
        >
          <span
            class="toggle-thumb"
            :class="{ 'toggle-thumb--active': billingCycle === 'yearly' }"
          />
        </button>
        <span class="toggle-label" :class="{ 'toggle-label--active': billingCycle === 'yearly' }">
          {{ $t("checkout.yearly") }}

        </span>
      </div>
      <p v-if="billingCycle === 'yearly'" class="discount-note">
        {{ $t("checkout.savePercent", { percent: 17 }) }}

      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import type { PlanPricing, PricingInfo } from "@/stores/payment";

interface props {
  selectedPlan: PlanPricing;
  billingCycle: "monthly" | "yearly";
  priceInfo?: PricingInfo;
}

const props = defineProps<Props>();

const emit = defineemits<{
  
}>();

const { t } = useI18n();

const displayPrice = computed(() => {
  if (!props.priceInfo) return "N/A";
  return props.priceInfo.formatted;
});

const pricePeriod = computed(() => {
  return props.billingCycle === "monthly" ? t("checkout.perMonth") : t("checkout.perYear");
});
</script>

<style scoped>
.order-summary {
  @apply mb-8 rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800;
}

.summary-title {
  @apply mb-4 text-lg font-semibold text-gray-900 dark:text-white;
}

.plan-details {
  @apply mb-6 flex items-center justify-between;
}

.plan-info {
  @apply flex-1;
}

.plan-name {
  @apply text-lg font-semibold text-gray-900 dark:text-white;
}

.plan-description {
  @apply text-sm text-gray-600 dark:text-gray-300;
}

.plan-pricing {
  @apply text-right;
}

.price-container {
  @apply flex items-baseline gap-1;
}

.price-amount {
  @apply text-2xl font-bold text-gray-900 dark:text-white;
}

.price-period {
  @apply text-sm text-gray-600 dark:text-gray-300;
}

.price-note {
  @apply mt-1 text-xs text-gray-500 dark:text-gray-400;
}

.billing-toggle {
  @apply border-t border-gray-200 pt-6 dark:border-gray-700;
}

.toggle-container {
  @apply flex items-center justify-center gap-3;
}

.toggle-label {
  @apply text-sm font-medium text-gray-600 transition-colors dark:text-gray-300;
}

.toggle-label--active {
  @apply text-gray-900 dark:text-white;
}

.toggle-switch {
  @apply relative h-6 w-11 rounded-full bg-gray-200 transition-colors dark:bg-gray-600;
}

.toggle-switch--active {
  @apply bg-blue-600;
}

.toggle-thumb {
  @apply absolute left-1 top-1 h-4 w-4 rounded-full bg-white transition-transform;
}

.toggle-thumb--active {
  @apply translate-x-5;
}

.discount-note {
  @apply mt-2 text-center text-sm text-green-600 dark:text-green-400;
}
</style>
