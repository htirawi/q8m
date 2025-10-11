<template>
  <div class="content-access-guard">
    <!-- Content accessible to user -->
    <div v-if="hasAccess" class="content-wrapper">
      <slot />
    </div>

    <!-- Access denied - show upgrade prompt -->
    <div v-else-if="!isChecking" class="access-denied">
      <div class="access-denied-content">
        <!-- Lock Icon -->
        <div class="lock-icon">
          <svg class="h-16 w-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>

        <!-- Access Denied Message -->
        <div class="access-message">
          <h3 class="access-title">{{ accessTitle }}</h3>
          <p class="access-description">{{ accessDescription }}</p>
        </div>

        <!-- Upgrade Options -->
        <div class="upgrade-options">
          <button @click="goToPricing" class="btn-primary">
            <svg class="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
            {{ $t("entitlements.upgradeNow") }}
          </button>

          <button v-if="showPreview" @click="showPreviewContent = true" class="btn-secondary">
            <svg class="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            {{ $t("entitlements.previewContent") }}
          </button>
        </div>

        <!-- Plan Comparison -->
        <div v-if="showPlanComparison" class="plan-comparison">
          <h4 class="comparison-title">{{ $t("entitlements.choosePlan") }}</h4>
          <div class="plan-grid">
            <div v-for="plan in availablePlans" :key="plan.planId" class="plan-card"
              :class="{ 'plan-recommended': plan.recommended }">
              <div class="plan-header">
                <h5 class="plan-name">{{ plan.name }}</h5>
                <div class="plan-price">
                  <span class="price-amount">{{ formatPrice(plan) }} </span>
                  <span class="price-period">{{ $t("billing.monthly") }}
                  </span>
                </div>
              </div>
              <div class="plan-features">
                <ul class="feature-list">
                  <li v-for="feature in plan.features" :key="feature" class="feature-item">
                    <svg class="h-4 w-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                    </svg>
                    <span>{{ feature }} </span>
                  </li>
                </ul>
              </div>
              <button @click="selectPlan(plan)" class="plan-select-btn">
                {{ $t("entitlements.selectPlan") }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-else class="loading-state">
      <div class="loading-spinner">
        <div class="h-8 w-8 animate-spin rounded-full border-b-2 border-indigo-600"></div>
      </div>
      <p class="loading-text">{{ $t("entitlements.checkingAccess") }}</p>
    </div>

    <!-- Preview Modal -->
    <div v-if="showPreviewContent" class="preview-modal-overlay" @click="showPreviewContent = false">
      <div class="preview-modal" @click.stop>
        <div class="preview-header">
          <h3 class="preview-title">{{ $t("entitlements.contentPreview") }}</h3>
          <button @click="showPreviewContent = false" class="preview-close">
            <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div class="preview-content">
          <slot name="preview" />
        </div>
        <div class="preview-footer">
          <button @click="goToPricing" class="btn-primary">
            {{ $t("entitlements.upgradeToAccess") }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { usePaymentStore } from "@/stores/payment";
import { useEntitlementGuard, useContentAccess } from "@/composables/useEntitlementGuard";
import type { PlanPricing } from "@/types/domain/payment";
import type { ContentAccessGuardProps } from "@/types/ui/component-props";

const props = withDefaults(defineProps<ContentAccessGuardProps>(), {
  showPreview: false,
  showPlanComparison: true,
});

const router = useRouter();
const { t } = useI18n();
const paymentStore = usePaymentStore();

// State
const showPreviewContent = ref(false);

// Use entitlement guard
const guard = useEntitlementGuard({
  requiredEntitlement: props.requiredEntitlement,
  requiredContentLevel: props.requiredContentLevel,
  showUpgradeModal: true,
});

// Use content access
const contentAccess = useContentAccess();

// Computed
const hasAccess = computed(() => {
  if (props.category) {
    return contentAccess.canAccessCategory(props.category);
  }
  return guard.hasQuickAccess.value;
});

const isChecking = computed(() => guard.isChecking.value);

const accessTitle = computed(() => {
  if (props.customTitle) return props.customTitle;

  if (props.category) {
    const requiredLevel = contentAccess.getContentAccessLevel(props.category);
    return t("entitlements.categoryAccessTitle", {
      category: props.category.replace(/-/g, " "),
      level: requiredLevel,
    });
  }

  if (props.requiredEntitlement) {
    return t("entitlements.entitlementRequired", { entitlement: props.requiredEntitlement });
  }

  return t("entitlements.accessDenied");
});

const accessDescription = computed(() => {
  if (props.customDescription) return props.customDescription;

  if (props.category) {
    return (
      contentAccess.getCategoryAccessMessage(props.category) || t("entitlements.upgradeRequired")
    );
  }

  if (props.requiredEntitlement) {
    return guard.getUpgradeMessage(props.requiredEntitlement);
  }

  return t("entitlements.upgradeDescription");
});

const availablePlans = computed(() => {
  const plans = paymentStore.pricing.filter(
    (plan) => plan.planId !== "JUNIOR" // Don't show free plan
  );

  // Sort by hierarchy
  const hierarchy = ["INTERMEDIATE", "SENIOR", "BUNDLE"];
  return plans.sort((a, b) => {
    const aIndex = hierarchy.indexOf(a.planId);
    const bIndex = hierarchy.indexOf(b.planId);
    return aIndex - bIndex;
  });
});

// Methods
const goToPricing = () => {
  const query = props.requiredContentLevel ? { upgrade: props.requiredContentLevel } : {};
  router.push({ path: "/subscribe", query });
};

const selectPlan = (plan: PlanPricing) => {
  router.push({ path: "/checkout", query: { plan: plan.planId } });
};

const formatPrice = (plan: PlanPricing, _billingCycle: string = "monthly") => {
  const pricing = plan.pricing[paymentStore.currentCurrency];
  return pricing ? paymentStore.formatCurrency(pricing.amount, pricing.currency) : "N/A";
};

// Lifecycle
onMounted(async () => {
  // Check access on mount
  await guard.checkAccess();
});
</script>

<style scoped>
.content-access-guard {
  @apply w-full;
}

.content-wrapper {
  @apply w-full;
}

/* Access Denied */
.access-denied {
  @apply flex min-h-96 items-center justify-center p-8;
}

.access-denied-content {
  @apply mx-auto max-w-2xl text-center;
}

.lock-icon {
  @apply mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800;
}

.access-message {
  @apply mb-8;
}

.access-title {
  @apply mb-4 text-2xl font-bold text-gray-900 dark:text-white;
}

.access-description {
  @apply text-lg text-gray-600 dark:text-gray-300;
}

/* Upgrade Options */
.upgrade-options {
  @apply mb-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center;
}

.btn-primary {
  @apply inline-flex items-center rounded-lg border border-transparent bg-indigo-600 px-6 py-3 text-base font-medium text-white transition-colors duration-200 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2;
}

.btn-secondary {
  @apply inline-flex items-center rounded-lg border border-gray-300 bg-white px-6 py-3 text-base font-medium text-gray-700 transition-colors duration-200 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700;
}

/* Plan Comparison */
.plan-comparison {
  @apply mt-8;
}

.comparison-title {
  @apply mb-6 text-xl font-semibold text-gray-900 dark:text-white;
}

.plan-grid {
  @apply grid gap-6 md:grid-cols-3;
}

.plan-card {
  @apply rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800;
}

.plan-recommended {
  @apply border-indigo-500 ring-2 ring-indigo-500;
}

.plan-header {
  @apply mb-4 text-center;
}

.plan-name {
  @apply mb-2 text-lg font-semibold text-gray-900 dark:text-white;
}

.plan-price {
  @apply flex flex-col items-center;
}

.price-amount {
  @apply text-2xl font-bold text-indigo-600 dark:text-indigo-400;
}

.price-period {
  @apply text-sm text-gray-500 dark:text-gray-400;
}

.plan-features {
  @apply mb-6;
}

.feature-list {
  @apply space-y-2;
}

.feature-item {
  @apply flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300;
}

.plan-select-btn {
  @apply w-full rounded-lg border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors duration-200 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2;
}

/* Loading State */
.loading-state {
  @apply flex min-h-96 flex-col items-center justify-center p-8;
}

.loading-spinner {
  @apply mb-4;
}

.loading-text {
  @apply text-gray-600 dark:text-gray-300;
}

/* Preview Modal */
.preview-modal-overlay {
  @apply fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4;
}

.preview-modal {
  @apply max-h-96 w-full max-w-2xl rounded-lg bg-white p-6 dark:bg-gray-800;
}

.preview-header {
  @apply mb-4 flex items-center justify-between;
}

.preview-title {
  @apply text-lg font-semibold text-gray-900 dark:text-white;
}

.preview-close {
  @apply rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-300;
}

.preview-content {
  @apply mb-6 max-h-64 overflow-y-auto text-gray-600 dark:text-gray-300;
}

.preview-footer {
  @apply flex justify-end;
}

/* RTL Support */
[dir="rtl"] .upgrade-options {
  @apply sm:flex-row-reverse;
}

[dir="rtl"] .feature-item {
  @apply gap-reverse flex-row-reverse;
}

[dir="rtl"] .preview-header {
  @apply flex-row-reverse;
}
</style>
