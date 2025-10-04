<template>
  <div class="checkout-view">
    <!-- Loading State -->
    <div v-if="paymentStore.isLoading && !selectedPlan" class="loading-container">
      <div class="loading-spinner">
        <div class="h-12 w-12 animate-spin rounded-full border-b-2 border-indigo-600"></div>
        <p class="mt-4 text-gray-600 dark:text-gray-300">{{ $t("common.loading") }}

</p>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-container">
      <div class="error-content">
        <div class="error-icon">
          <svg class="h-16 w-16 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
        </div>
        <h2 class="error-title">{{ $t("checkout.error.title") }}

</h2>
        <p class="error-message">{{ error }}

</p>
        <div class="error-actions">
          <button @click="goToPricing" class="btn-primary">
            {{ $t("checkout.error.backToPricing") }}

          </button>
          <button @click="retry" class="btn-secondary">
            {{ $t("common.retry") }}

          </button>
        </div>
      </div>
    </div>

    <!-- Checkout Form -->
    <div v-else-if="selectedPlan" class="checkout-container">
      <!-- Breadcrumb -->
      <nav class="breadcrumb" aria-label="Breadcrumb">
        <ol class="breadcrumb-list">
          <li class="breadcrumb-item">
            <router-link to="/pricing" class="breadcrumb-link">
              {{ $t("pricing.title") }}

            </router-link>
          </li>
          <li class="breadcrumb-separator" aria-hidden="true">
            <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fill-rule="evenodd"
                d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                clip-rule="evenodd"
              />
            </svg>
          </li>
          <li class="breadcrumb-item breadcrumb-item--current">
            {{ $t("checkout.title") }}

          </li>
        </ol>
      </nav>

      <!-- Checkout Form Component -->
      <CheckoutForm :selected-plan="selectedPlan" />

      <!-- Security Badges -->
      <div class="security-badges">
        <div class="security-badge">
          <svg class="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            />
          </svg>
          <span>{{ $t("checkout.security.ssl") }}

</span>
        </div>
        <div class="security-badge">
          <svg class="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
            />
          </svg>
          <span>{{ $t("checkout.security.pci") }}

</span>
        </div>
        <div class="security-badge">
          <svg
            class="h-6 w-6 text-purple-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M13 10V3L4 14h7v7l9-11h-7z"
            />
          </svg>
          <span>{{ $t("checkout.security.fast") }}

</span>
        </div>
      </div>
    </div>

    <!-- No Plan Selected -->
    <div v-else class="no-plan-container">
      <div class="no-plan-content">
        <div class="no-plan-icon">
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
        <h2 class="no-plan-title">{{ $t("checkout.noPlan.title") }}

</h2>
        <p class="no-plan-message">{{ $t("checkout.noPlan.message") }}

</p>
        <button @click="goToPricing" class="btn-primary">
          {{ $t("checkout.noPlan.selectPlan") }}

        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { usePaymentStore } from "@/stores/payment";
import { useAuthStore } from "@/stores/auth";
import { useI18n } from "vue-i18n";
import CheckoutForm from "@/components/payment/CheckoutForm.vue";
import type { PlanPricing } from "@/stores/payment";

const route = useRoute();
const router = useRouter();
const { t } = useI18n();
const paymentStore = usePaymentStore();
const authStore = useAuthStore();

// State
const error = ref<string | null>(null);

// Computed
const selectedPlan = computed(() => {
  const planId = route.query.plan as string;
  const plan = paymentStore.pricing.find((p) => p.planId === planId);
  return plan || null;
});

// Methods
const goToPricing = () => {
  router.push("/pricing");
};

const retry = async () => {
  error.value = null;
  try {
    await paymentStore.fetchPricing();
  } catch (err) {
    error.value = err instanceof Error ? err.message : t("common.error.unknown");errinstanceofErrorerr.message
  }
};

const initializecheckout = async () => {
  try {
    // Ensure user is authenticated
    if (!authStore.isAuthenticated) {
      router.push("/auth/login?redirect=/checkout");
      return;
    }

    // Check if plan is specified
    const planId = route.query.plan as string;
    if (!planId) {
      error.value = t("checkout.error.noPlan");
      return;
    }

    // Load pricing if not already loaded
    if (paymentStore.pricing.length === 0) {
      await paymentStore.fetchPricing();
    }

    // Verify plan exists
    const plan = paymentStore.pricing.find((p) => p.planId === planId);
    if (!plan) {
      error.value = t("checkout.error.invalidPlan");
      return;
    }

    // Clear any previous errors
    paymentStore.clearError();
  } catch (err) {
    error.value = err instanceof Error ? err.message : t("common.error.unknown");errinstanceofErrorerr.message
  }
};

// Watch for route changes
watch(
  () => route.query.plan,
  () => {
    initializeCheckout();
  },
  { immediate: false }
);

// Lifecycle
onMounted(async () => {
  await initializeCheckout();
});
</script>

<style scoped>
.checkout-view {
  @apply min-h-screen bg-gray-50 dark:bg-gray-900;
}

/* Loading State */
.loading-container {
  @apply flex min-h-screen items-center justify-center;
}

.loading-spinner {
  @apply text-center;
}

/* Error State */
.error-container {
  @apply flex min-h-screen items-center justify-center px-4;
}

.error-content {
  @apply mx-auto max-w-md text-center;
}

.error-icon {
  @apply mb-6;
}

.error-title {
  @apply mb-4 text-2xl font-bold text-gray-900 dark:text-white;
}

.error-message {
  @apply mb-8 text-gray-600 dark:text-gray-300;
}

.error-actions {
  @apply flex flex-col justify-center gap-4 sm:flex-row;
}

/* Checkout Container */
.checkout-container {
  @apply px-4 py-8;
}

/* Breadcrumb */
.breadcrumb {
  @apply mb-8;
}

.breadcrumb-list {
  @apply flex items-center space-x-2 text-sm;
}

.breadcrumb-item {
  @apply flex items-center;
}

.breadcrumb-link {
  @apply text-indigo-600 transition-colors duration-200 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300;
}

.breadcrumb-separator {
  @apply text-gray-400;
}

.breadcrumb-item--current {
  @apply text-gray-500 dark:text-gray-400;
}

/* Security Badges */
.security-badges {
  @apply mt-12 flex flex-wrap justify-center gap-6 border-t border-gray-200 pt-8 dark:border-gray-700;
}

.security-badge {
  @apply flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300;
}

/* No Plan State */
.no-plan-container {
  @apply flex min-h-screen items-center justify-center px-4;
}

.no-plan-content {
  @apply mx-auto max-w-md text-center;
}

.no-plan-icon {
  @apply mb-6;
}

.no-plan-title {
  @apply mb-4 text-2xl font-bold text-gray-900 dark:text-white;
}

.no-plan-message {
  @apply mb-8 text-gray-600 dark:text-gray-300;
}

/* Buttons */
.btn-primary {
  @apply inline-flex items-center rounded-lg border border-transparent bg-indigo-600 px-6 py-3 text-base font-medium text-white transition-colors duration-200 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50;
}

.btn-secondary {
  @apply inline-flex items-center rounded-lg border border-gray-300 bg-white px-6 py-3 text-base font-medium text-gray-700 transition-colors duration-200 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700;
}

/* Mobile Responsiveness */
@media (width <= 640px) {
  .security-badges {
    @apply flex-col items-center;
  }

  .error-actions {
    @apply flex-col;
  }
}

/* RTL Support */
[dir="rtl"] .breadcrumb-list {
  @apply flex-row-reverse space-x-reverse;
}

[dir="rtl"] .breadcrumb-separator {
  @apply rotate-180 transform;
}

[dir="rtl"] .security-badge {
  @apply flex-row-reverse;
}
</style>
