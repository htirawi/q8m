<template>
  <div class="subscription-view">
    <div class="subscription-container">
      <!-- Header -->
      <div class="subscription-header">
        <h1 class="subscription-title">{{ $t("subscription.title") }}

</h1>
        <p class="subscription-subtitle">{{ $t("subscription.subtitle") }}

</p>
      </div>

      <!-- Loading State -->
      <div v-if="paymentStore.isLoading" class="loading-container">
        <div class="loading-spinner">
          <div class="h-12 w-12 animate-spin rounded-full border-b-2 border-indigo-600"></div>
          <p class="mt-4 text-gray-600 dark:text-gray-300">{{ $t("common.loading") }}

</p>
        </div>
      </div>

      <!-- No Subscription -->
      <div
        v-else-if="!paymentStore.subscription || !paymentStore.isSubscribed"
        class="no-subscription-container"
      >
        <div class="no-subscription-content">
          <div class="no-subscription-icon">
            <svg
              class="h-16 w-16 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <h2 class="no-subscription-title">{{ $t("subscription.noSubscription.title") }}

</h2>
          <p class="no-subscription-message">{{ $t("subscription.noSubscription.message") }}

</p>
          <button @click="goToPricing" class="btn-primary">
            {{ $t("subscription.noSubscription.choosePlan") }}

          </button>
        </div>
      </div>

      <!-- Subscription Details -->
      <div v-else class="subscription-content">
        <!-- Current Plan Card -->
        <div class="plan-card">
          <div class="plan-header">
            <div class="plan-info">
              <h2 class="plan-name">{{ paymentStore.subscription.planType }}

</h2>
              <div class="plan-badge" :class="statusBadgeClass">
                {{ $t(`subscription.status.${paymentStore.subscription.status}`) }}

              </div>
            </div>
            <div class="plan-price">
              <span class="price-amount">{{ paymentStore.subscription.price.amount }}

</span>
              <span class="price-currency">{{ paymentStore.subscription.price.currency }}

</span>
              <span class="price-period">{{
                $t(`subscription.billing.${paymentStore.subscription.billingCycle}`)
              }}

</span>
            </div>
          </div>

          <!-- Plan Features -->
          <div class="plan-features">
            <h3 class="features-title">{{ $t("subscription.features.title") }}

</h3>
            <ul class="features-list">
              <li v-for="feature in planFeatures" :key="feature" class="feature-item">
                <svg
                  class="h-5 w-5 text-green-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <span>{{ feature }}

</span>
              </li>
            </ul>
          </div>

          <!-- Current Entitlements -->
          <div class="entitlements-section">
            <h3 class="entitlements-title">{{ $t("subscription.entitlements.title") }}

</h3>
            <div class="entitlements-grid">
              <div
                v-for="entitlement in currentEntitlements"
                :key="entitlement"
                class="entitlement-badge"
                :class="getEntitlementBadgeClass(entitlement)"
              >
                <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span>{{ $t(`entitlements.${entitlement}`) }}

</span>
              </div>
            </div>
            <p class="entitlements-description">
              {{ $t("subscription.entitlements.description") }}

            </p>
          </div>

          <!-- Subscription Status -->
          <div class="subscription-status">
            <div class="status-item">
              <span class="status-label">{{ $t("subscription.status.label") }}

</span>
              <span class="status-value" :class="statusClass">
                {{ $t(`subscription.status.${paymentStore.subscription.status}`) }}

              </span>
            </div>

            <div v-if="paymentStore.subscription.isActive" class="status-item">
              <span class="status-label">{{ $t("subscription.nextBilling") }}

</span>
              <span class="status-value">{{ formattedNextBilling }}

</span>
            </div>

            <div v-if="paymentStore.subscription.isInTrial" class="status-item">
              <span class="status-label">{{ $t("subscription.trialRemaining") }}

</span>
              <span class="status-value text-blue-600 dark:text-blue-400">
                {{
                  $t("subscription.daysRemaining", {
                    days: paymentStore.subscription.daysRemaining,
                  })
                }}

              </span>
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="action-buttons">
          <button v-if="canUpgrade" @click="goToPricing" class="btn-primary">
            {{ $t("subscription.upgradePlan") }}

          </button>

          <button
            v-if="paymentStore.subscription.isActive"
            @click="showCancelModal = true"
            class="btn-danger"
          >
            {{ $t("subscription.cancelSubscription") }}

          </button>

          <button @click="goToQuizzes" class="btn-secondary">
            {{ $t("subscription.startQuizzes") }}

          </button>
        </div>

        <!-- Billing History -->
        <div class="billing-history">
          <div class="history-header">
            <h3 class="history-title">{{ $t("subscription.billingHistory") }}

</h3>
            <button @click="refreshBillingHistory" class="refresh-button">
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

          <div v-if="paymentStore.purchases.length === 0" class="no-history">
            <p class="no-history-text">{{ $t("subscription.noHistory") }}

</p>
          </div>

          <div v-else class="history-list">
            <div v-for="purchase in paymentStore.purchases" :key="purchase.id" class="history-item">
              <div class="history-info">
                <h4 class="history-plan">{{ purchase.items[0]?.name || purchase.id }}

</h4>
                <p class="history-date">{{ formatDate(purchase.createdAt) }}

</p>
              </div>
              <div class="history-details">
                <span class="history-amount"
                  >{{ purchase.amount.value }} {{ purchase.amount.currency }}

</span
                >
                <span class="history-status" :class="getStatusClass(purchase.status)">
                  {{ $t(`subscription.purchaseStatus.${purchase.status}`) }}

                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Cancel Subscription Modal -->
      <div v-if="showCancelModal" class="modal-overlay" @click="showCancelModal = false">
        <div class="modal-content" @click.stop>
          <div class="modal-header">
            <h3 class="modal-title">{{ $t("subscription.cancelConfirm") }}

</h3>
            <button @click="showCancelModal = false" class="modal-close">
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
            <p class="modal-message">{{ $t("subscription.cancelMessage") }}

</p>

            <div class="cancel-reasons">
              <label class="reason-label">{{ $t("subscription.cancelReason") }}

</label>
              <select v-model="cancelReason" class="reason-select">
                <option value="">{{ $t("subscription.selectReason") }}

</option>
                <option v-for="(reason, key) in cancelReasons" :key="key" :value="key">
                  {{ reason }}

                </option>
              </select>
            </div>
          </div>

          <div class="modal-footer">
            <button @click="showCancelModal = false" class="btn-secondary">
              {{ $t("common.cancel") }}

            </button>
            <button
              @click="cancelSubscription"
              :disabled="!cancelReason || paymentStore.isLoading"
              class="btn-danger"
            >
              <span v-if="paymentStore.isLoading" class="flex items-center">
                <div class="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-white"></div>
                {{ $t("common.processing") }}

              </span>
              <span v-else>{{ $t("subscription.confirmCancel") }}

</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { usePaymentStore } from "@/stores/payment";
import { useI18n } from "vue-i18n";

const router = useRouter();
const { t } = useI18n();
const paymentStore = usePaymentStore();

// State
const showCancelModal = ref(false);
const cancelReason = ref("");

// Computed
const statusClass = computed(() => {
  const status = paymentStore.subscription?.status;
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
  const status = paymentStore.subscription?.status;
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

const canUpgrade = computed(() => {
  const currentPlan = paymentStore.subscription?.planType;
  const planHierarchy = ["JUNIOR", "INTERMEDIATE", "SENIOR", "BUNDLE"];
  const currentIndex = planHierarchy.indexOf(currentPlan || "JUNIOR");
  return currentIndex < planHierarchy.length - 1;
});

// Get current entitlements
const currentEntitlements = computed(() => {
  return paymentStore.userEntitlements?.entitlements || ["JUNIOR"];
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

const formattedNextBilling = computed(() => {
  if (!paymentStore.subscription?.currentPeriodEnd) return "";
  return new Date(paymentStore.subscription.currentPeriodEnd).toLocaleDateString();
});

const planFeatures = computed(() => {
  const planType = paymentStore.subscription?.planType;
  const features: Record<string, string[]> = {
    JUNIOR: [
      t("subscription.features.junior.basic"),
      t("subscription.features.junior.community"),
      t("subscription.features.junior.limited"),
    ],
    INTERMEDIATE: [
      t("subscription.features.intermediate.advanced"),
      t("subscription.features.intermediate.priority"),
      t("subscription.features.intermediate.unlimited"),
      t("subscription.features.intermediate.guides"),
    ],
    SENIOR: [
      t("subscription.features.senior.premium"),
      t("subscription.features.senior.support"),
      t("subscription.features.senior.unlimited"),
      t("subscription.features.senior.guides"),
      t("subscription.features.senior.interviews"),
    ],
    BUNDLE: [
      t("subscription.features.bundle.all"),
      t("subscription.features.bundle.exclusive"),
      t("subscription.features.bundle.mentorship"),
      t("subscription.features.bundle.early"),
    ],
  };
  return features[planType || "JUNIOR"] || [];
});

const cancelReasons = computed(() => ({
  tooExpensive: t("subscription.cancelReasons.tooExpensive"),
  notUsing: t("subscription.cancelReasons.notUsing"),
  foundAlternative: t("subscription.cancelReasons.foundAlternative"),
  technicalIssues: t("subscription.cancelReasons.technicalIssues"),
  other: t("subscription.cancelReasons.other"),
}));

// Methods
const goToPricing = () => {
  router.push("/pricing");
};

const gotoquizzes = () => {
  router.push("/quiz");
};

const refreshbillinghistory = async () => {
  try {
    await paymentStore.fetchPurchaseHistory();
  } catch (error) {
    console.error("Failed to refresh billing history:", error);
  }
};

const formatdate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString();
};

const getstatusclass = (status: string) => {
  switch (status) {
    case "pending":
      return "text-yellow-600 dark:text-yellow-400";
    default:
      return "text-gray-600 dark:text-gray-400";
  }
};

const cancelsubscription = async () => {
  if (!cancelReason.value) return;
  try {
    await paymentStore.cancelSubscription(cancelReason.value);
    showCancelModal.value = false;
    cancelReason.value = "";
  } catch (error) {
    console.error("Failed to cancel subscription:", error);
  }
};

// Lifecycle
onMounted(async () => {
  try {
    await Promise.all([
      paymentStore.fetchSubscription(),
      paymentStore.fetchPurchaseHistory(),
      paymentStore.fetchUserEntitlements(),
    ]);
  } catch (error) {
    console.error("Failed to load subscription data:", error);
  }
});
</script>

<style scoped>
.subscription-view {
  @apply min-h-screen bg-gray-50 px-4 py-8 dark:bg-gray-900;
}

.subscription-container {
  @apply mx-auto max-w-4xl;
}

/* Header */
.subscription-header {
  @apply mb-8 text-center;
}

.subscription-title {
  @apply mb-2 text-3xl font-bold text-gray-900 dark:text-white;
}

.subscription-subtitle {
  @apply text-lg text-gray-600 dark:text-gray-300;
}

/* Loading State */
.loading-container {
  @apply flex items-center justify-center py-12;
}

.loading-spinner {
  @apply text-center;
}

/* No Subscription */
.no-subscription-container {
  @apply flex items-center justify-center py-12;
}

.no-subscription-content {
  @apply mx-auto max-w-md text-center;
}

.no-subscription-icon {
  @apply mb-6;
}

.no-subscription-title {
  @apply mb-4 text-2xl font-bold text-gray-900 dark:text-white;
}

.no-subscription-message {
  @apply mb-8 text-gray-600 dark:text-gray-300;
}

/* Subscription Content */
.subscription-content {
  @apply space-y-8;
}

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

/* Mobile Responsiveness */
@media (width <= 640px) {
  .plan-header {
    @apply flex-col items-start gap-4;
  }

  .plan-price {
    @apply w-full text-left;
  }

  .features-list {
    @apply grid-cols-1;
  }

  .action-buttons {
    @apply flex-col;
  }

  .history-item {
    @apply flex-col items-start gap-2;
  }

  .history-details {
    @apply flex-row items-center gap-4;
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

[dir="rtl"] .history-item {
  @apply flex-row-reverse;
}

[dir="rtl"] .history-details {
  @apply items-start;
}
</style>
