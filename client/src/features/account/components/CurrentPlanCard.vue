<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import type { CurrentPlanCardProps } from "@/types/ui/component-props";

const props = defineProps<CurrentPlanCardProps>();
useI18n();

// Computed
const statusClass = computed(() => {
  const status = props.subscription?.status;
  switch (status) {
    case "active":
      return "text-green-600 dark:text-green-400";
    case "trial":
      return "text-blue-600 dark:text-blue-400";
    case "cancelled":
      return "text-red-600 dark:text-red-400";
    case "expired":
      return "text-gray-600 dark:text-gray-400";
    default:
      return "text-gray-600 dark:text-gray-400";
  }
});

const statusBadgeClass = computed(() => {
  const status = props.subscription?.status;
  switch (status) {
    case "active":
      return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400";
    case "trial":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400";
    case "cancelled":
      return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400";
    case "expired":
      return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400";
  }
});

const formattedNextBilling = computed(() => {
  if (!props.subscription?.currentPeriodEnd) return "";
  return new Date(props.subscription.currentPeriodEnd).toLocaleDateString();
});

// Get entitlement badge class
const getEntitlementBadgeClass = (entitlement: string) => {
  const classes = {
    JUNIOR: "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400",
    INTERMEDIATE: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400",
    SENIOR: "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400",
    BUNDLE: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400",
  };
  return (
    classes[entitlement as keyof typeof classes] ||
    "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400"
  );
};
</script>

<template>
  <div class="plan-card">
    <div class="plan-header">
      <div class="plan-info">
        <h2 class="plan-name">{{ subscription.planType }}</h2>
        <div class="plan-badge" :class="statusBadgeClass">
          {{ $t(`subscription.status.${subscription.status}`) }}
        </div>
      </div>
      <div class="plan-price">
        <span class="price-amount">{{ subscription.price.amount }} </span>
        <span class="price-currency">{{ subscription.price.currency }} </span>
        <span class="price-period">{{ $t(`subscription.billing.${subscription.billingCycle}`) }}
        </span>
      </div>
    </div>

    <!-- Plan Features -->
    <div class="plan-features">
      <h3 class="features-title">{{ $t("subscription.features.title") }}</h3>
      <ul class="features-list">
        <li v-for="feature in features" :key="feature" class="feature-item">
          <svg class="h-5 w-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
          <span>{{ feature }} </span>
        </li>
      </ul>
    </div>

    <!-- Current Entitlements -->
    <div class="entitlements-section">
      <h3 class="entitlements-title">{{ $t("subscription.entitlements.title") }}</h3>
      <div class="entitlements-grid">
        <div v-for="entitlement in entitlements" :key="entitlement" class="entitlement-badge"
          :class="getEntitlementBadgeClass(entitlement)">
          <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{{ $t(`entitlements.${entitlement}`) }} </span>
        </div>
      </div>
      <p class="entitlements-description">
        {{ $t("subscription.entitlements.description") }}
      </p>
    </div>

    <!-- Subscription Status -->
    <div class="subscription-status">
      <div class="status-item">
        <span class="status-label">{{ $t("subscription.status.label") }} </span>
        <span class="status-value" :class="statusClass">
          {{ $t(`subscription.status.${subscription.status}`) }}
        </span>
      </div>

      <div v-if="subscription.isActive" class="status-item">
        <span class="status-label">{{ $t("subscription.nextBilling") }} </span>
        <span class="status-value">{{ formattedNextBilling }} </span>
      </div>

      <div v-if="subscription.isInTrial" class="status-item">
        <span class="status-label">{{ $t("subscription.trialRemaining") }} </span>
        <span class="status-value text-blue-600 dark:text-blue-400">
          {{
            $t("subscription.daysRemaining", {
              days: subscription.daysRemaining,
            })
          }}
        </span>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Plan Card */
.plan-card {
  @apply rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800;
}

.plan-header {
  @apply mb-6 flex items-center justify-between;
}

.plan-info {
  @apply flex items-center gap-4;
}

.plan-name {
  @apply text-2xl font-bold text-gray-900 dark:text-white;
}

.plan-badge {
  @apply rounded-full px-3 py-1 text-sm font-medium;
}

.plan-price {
  @apply text-right;
}

.price-amount {
  @apply text-3xl font-bold text-gray-900 dark:text-white;
}

.price-currency {
  @apply ml-1 text-lg text-gray-600 dark:text-gray-300;
}

.price-period {
  @apply block text-sm text-gray-500 dark:text-gray-400;
}

/* Plan Features */
.plan-features {
  @apply mb-6;
}

.features-title {
  @apply mb-4 text-lg font-semibold text-gray-900 dark:text-white;
}

.features-list {
  @apply grid grid-cols-1 gap-3 md:grid-cols-2;
}

.feature-item {
  @apply flex items-center gap-3;
}

/* Entitlements Section */
.entitlements-section {
  @apply mb-6;
}

.entitlements-title {
  @apply mb-4 text-lg font-semibold text-gray-900 dark:text-white;
}

.entitlements-grid {
  @apply mb-3 flex flex-wrap gap-2;
}

.entitlement-badge {
  @apply flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium;
}

.entitlements-description {
  @apply text-sm text-gray-600 dark:text-gray-400;
}

/* Subscription Status */
.subscription-status {
  @apply space-y-3 border-t border-gray-200 pt-6 dark:border-gray-700;
}

.status-item {
  @apply flex items-center justify-between;
}

.status-label {
  @apply text-sm font-medium text-gray-600 dark:text-gray-400;
}

.status-value {
  @apply text-sm font-semibold;
}

/* Mobile Responsiveness */
@media (width <=640px) {
  .plan-header {
    @apply flex-col items-start gap-4;
  }

  .plan-price {
    @apply w-full text-left;
  }

  .features-list {
    @apply grid-cols-1;
  }
}

/* RTL Support */
[dir="rtl"] .plan-header {
  @apply flex-row-reverse;
}

[dir="rtl"] .plan-price {
  @apply text-left;
}

[dir="rtl"] .status-item {
  @apply flex-row-reverse;
}
</style>
