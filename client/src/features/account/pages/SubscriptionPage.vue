<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { usePaymentStore } from "@/stores/payment";
import { useI18n } from "vue-i18n";
import CurrentPlanCard from "@/features/account/components/CurrentPlanCard.vue";
import SubscriptionActions from "@/features/account/components/SubscriptionActions.vue";
import BillingHistorySection from "@/features/account/components/BillingHistorySection.vue";
import CancelSubscriptionModal from "@/features/account/components/CancelSubscriptionModal.vue";

const router = useRouter();
const { t } = useI18n();
const paymentStore = usePaymentStore();

// State
const showCancelModal = ref(false);

// Computed
const canUpgrade = computed(() => {
  const currentPlan = paymentStore.subscription?.planType;
  const planHierarchy = ["JUNIOR", "INTERMEDIATE", "SENIOR", "BUNDLE"];
  const currentIndex = planHierarchy.indexOf(currentPlan || "JUNIOR");
  return currentIndex < planHierarchy.length - 1;
});

const currentEntitlements = computed(() => {
  return paymentStore.userEntitlements?.entitlements || ["JUNIOR"];
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
  router.push("/subscribe");
};

const goToQuizzes = () => {
  router.push("/quiz");
};

const refreshBillingHistory = async () => {
  try {
    await paymentStore.fetchPurchaseHistory();
  } catch (error) {
    console.error("Failed to refresh billing history:", error);
  }
};

const handleCancelConfirm = async (reason: string) => {
  try {
    await paymentStore.cancelSubscription(reason);
    showCancelModal.value = false;
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

<template>
  <div class="subscription-view">
    <div class="subscription-container">
      <!-- Header -->
      <div class="subscription-header">
        <h1 class="subscription-title">{{ $t("subscription.title") }}</h1>
        <p class="subscription-subtitle">{{ $t("subscription.subtitle") }}</p>
      </div>

      <!-- Loading State -->
      <div v-if="paymentStore.isLoading" class="loading-container">
        <div class="loading-spinner">
          <div class="h-12 w-12 animate-spin rounded-full border-b-2 border-indigo-600"></div>
          <p class="mt-4 text-gray-600 dark:text-gray-300">{{ $t("common.loading") }}</p>
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
          <h2 class="no-subscription-title">{{ $t("subscription.noSubscription.title") }}</h2>
          <p class="no-subscription-message">{{ $t("subscription.noSubscription.message") }}</p>
          <button @click="goToPricing" class="btn-primary">
            {{ $t("subscription.noSubscription.choosePlan") }}
          </button>
        </div>
      </div>

      <!-- Subscription Details -->
      <div v-else class="subscription-content">
        <!-- Current Plan Card -->
        <CurrentPlanCard
          :subscription="paymentStore.subscription"
          :entitlements="currentEntitlements"
          :features="planFeatures"
        />

        <!-- Action Buttons -->
        <SubscriptionActions
          :can-upgrade="canUpgrade"
          :is-active="paymentStore.subscription.isActive"
          @upgrade="goToPricing"
          @cancel="showCancelModal = true"
          @start-quizzes="goToQuizzes"
        />

        <!-- Billing History -->
        <BillingHistorySection
          :purchases="paymentStore.purchases"
          @refresh="refreshBillingHistory"
        />
      </div>

      <!-- Cancel Subscription Modal -->
      <CancelSubscriptionModal
        :show="showCancelModal"
        :reasons="cancelReasons"
        :is-loading="paymentStore.isLoading"
        @close="showCancelModal = false"
        @confirm="handleCancelConfirm"
      />
    </div>
  </div>
</template>

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

/* Button */
.btn-primary {
  @apply inline-flex items-center justify-center rounded-lg border border-transparent bg-indigo-600 px-6 py-3 text-base font-medium text-white transition-colors duration-200 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2;
}
</style>
