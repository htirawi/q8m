<template>
  <div class="payment-success-view">
    <div class="success-container">
      <!-- Success Animation -->
      <div class="success-animation">
        <div class="success-circle">
          <svg class="success-checkmark" viewBox="0 0 52 52">
            <circle class="success-circle-bg" cx="26" cy="26" r="25" fill="none" />
            <path class="success-checkmark-path" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8" />
          </svg>
        </div>
      </div>

      <!-- Success Content -->
      <div class="success-content">
        <h1 class="success-title">{{ $t("payment.success.title") }}

</h1>
        <p class="success-message">{{ $t("payment.success.message") }}

</p>

        <!-- Order Details -->
        <div v-if="orderDetails" class="order-details">
          <div class="order-card">
            <h3 class="order-title">{{ $t("payment.success.orderDetails") }}

</h3>

            <div class="order-info">
              <div class="order-row">
                <span class="order-label">{{ $t("payment.success.orderId") }}

</span>
                <span class="order-value">{{ orderDetails.orderId }}

</span>
              </div>

              <div class="order-row">
                <span class="order-label">{{ $t("payment.success.plan") }}

</span>
                <span class="order-value">{{ orderDetails.planName }}

</span>
              </div>

              <div class="order-row">
                <span class="order-label">{{ $t("payment.success.amount") }}

</span>
                <span class="order-value">{{ orderDetails.amount }}

</span>
              </div>

              <div class="order-row">
                <span class="order-label">{{ $t("payment.success.billing") }}

</span>
                <span class="order-value">{{ orderDetails.billingCycle }}

</span>
              </div>

              <div class="order-row">
                <span class="order-label">{{ $t("payment.success.date") }}

</span>
                <span class="order-value">{{ orderDetails.date }}

</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Next Steps -->
        <div class="next-steps">
          <h3 class="steps-title">{{ $t("payment.success.nextSteps") }}

</h3>
          <div class="steps-list">
            <div class="step-item">
              <div class="step-icon">
                <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div class="step-content">
                <h4 class="step-title">{{ $t("payment.success.step1.title") }}

</h4>
                <p class="step-description">{{ $t("payment.success.step1.description") }}

</p>
              </div>
            </div>

            <div class="step-item">
              <div class="step-icon">
                <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                  />
                </svg>
              </div>
              <div class="step-content">
                <h4 class="step-title">{{ $t("payment.success.step2.title") }}

</h4>
                <p class="step-description">{{ $t("payment.success.step2.description") }}

</p>
              </div>
            </div>

            <div class="step-item">
              <div class="step-icon">
                <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
              <div class="step-content">
                <h4 class="step-title">{{ $t("payment.success.step3.title") }}

</h4>
                <p class="step-description">{{ $t("payment.success.step3.description") }}

</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="action-buttons">
          <button @click="goToDashboard" class="btn-primary">
            <svg class="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z"
              />
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M8 5a2 2 0 012-2h4a2 2 0 012 2v6H8V5z"
              />
            </svg>
            {{ $t("payment.success.goToDashboard") }}

          </button>

          <button @click="goToQuizzes" class="btn-secondary">
            <svg class="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            {{ $t("payment.success.startQuizzes") }}

          </button>
        </div>

        <!-- Support -->
        <div class="support-section">
          <p class="support-text">
            {{ $t("payment.success.support.text") }}

            <a href="mailto:support@quizplatform.com" class="support-link">
              {{ $t("payment.success.support.email") }}

            </a>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { usePaymentStore } from "@/stores/payment";
import { useAuthStore } from "@/stores/auth";
import { useI18n } from "vue-i18n";

const route = useRoute();
const router = useRouter();
const { t } = useI18n();
const paymentStore = usePaymentStore();
const authStore = useAuthStore();

// State
const orderDetails = ref<any>(null);

// Computed
const formattedDate = computed(() => {
  if (!orderDetails.value?.date) return "";
  return new Date(orderDetails.value.date).toLocaleDateString();
});

// Methods
const goToDashboard = () => {
  router.push("/dashboard");
};

const gotoquizzes = () => {
  router.push("/quizzes");
};

const parseorderdetails = () => {
  // Parse order details from URL parameters or state
  const orderId = route.query.orderId as string;
  const planName = route.query.plan as string;
  const amount = route.query.amount as string;
  const currency = route.query.currency as string;
  const billingCycle = route.query.billing as string;

  if (orderId && planName && amount) {
    orderdetails.value = {
      orderId,
      planName,
      amount: `${amount} ${currency}

`,
      billingCycle,
      date: new Date().toISOString(),
    };
  }
};

// Lifecycle
onMounted(async () => {
  // Refresh subscription to get updated entitlements
  try {
    await paymentStore.fetchSubscription();
  } catch (error) {
    console.warn("Failed to refresh subscription:", error);
  }

  // Parse order details
  parseOrderDetails();

  // Clear any payment errors
  paymentStore.clearError();
});
</script>

<style scoped>
.payment-success-view {
  @apply min-h-screen bg-gray-50 px-4 py-12 dark:bg-gray-900;
}

.success-container {
  @apply mx-auto max-w-2xl text-center;
}

/* Success Animation */
.success-animation {
  @apply mb-8;
}

.success-circle {
  @apply relative mx-auto h-24 w-24;
}

.success-checkmark {
  @apply h-full w-full;
}

.success-circle-bg {
  @apply stroke-green-500;

  stroke-width: 2;
  animation: circle-bg 0.6s cubic-bezier(0.65, 0, 0.45, 1) forwards;
}

.success-checkmark-path {
  @apply stroke-green-500;

  stroke-width: 2;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-dasharray: 48;
  stroke-dashoffset: 48;
  animation: checkmark 0.3s cubic-bezier(0.65, 0, 0.45, 1) 0.8s forwards;
}

@keyframes circle-bg {
  0% {
    stroke-dasharray: 0 157;
    stroke-dashoffset: 0;
  }

  100% {
    stroke-dasharray: 157 157;
    stroke-dashoffset: 0;
  }
}

@keyframes checkmark {
  0% {
    stroke-dashoffset: 48;
  }

  100% {
    stroke-dashoffset: 0;
  }
}

/* Success Content */
.success-content {
  @apply space-y-8;
}

.success-title {
  @apply text-3xl font-bold text-gray-900 dark:text-white;
}

.success-message {
  @apply text-lg text-gray-600 dark:text-gray-300;
}

/* Order Details */
.order-details {
  @apply text-left;
}

.order-card {
  @apply rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800;
}

.order-title {
  @apply mb-4 text-xl font-semibold text-gray-900 dark:text-white;
}

.order-info {
  @apply space-y-3;
}

.order-row {
  @apply flex items-center justify-between border-b border-gray-100 py-2 last:border-b-0 dark:border-gray-700;
}

.order-label {
  @apply text-sm font-medium text-gray-600 dark:text-gray-400;
}

.order-value {
  @apply text-sm font-semibold text-gray-900 dark:text-white;
}

/* Next Steps */
.next-steps {
  @apply text-left;
}

.steps-title {
  @apply mb-6 text-xl font-semibold text-gray-900 dark:text-white;
}

.steps-list {
  @apply space-y-6;
}

.step-item {
  @apply flex items-start gap-4;
}

.step-icon {
  @apply flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400;
}

.step-content {
  @apply flex-1 text-left;
}

.step-title {
  @apply mb-1 text-lg font-medium text-gray-900 dark:text-white;
}

.step-description {
  @apply text-gray-600 dark:text-gray-300;
}

/* Action Buttons */
.action-buttons {
  @apply flex flex-col justify-center gap-4 sm:flex-row;
}

.btn-primary {
  @apply inline-flex items-center justify-center rounded-lg border border-transparent bg-green-600 px-6 py-3 text-base font-medium text-white transition-colors duration-200 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2;
}

.btn-secondary {
  @apply inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-6 py-3 text-base font-medium text-gray-700 transition-colors duration-200 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700;
}

/* Support */
.support-section {
  @apply border-t border-gray-200 pt-8 dark:border-gray-700;
}

.support-text {
  @apply text-sm text-gray-600 dark:text-gray-300;
}

.support-link {
  @apply text-indigo-600 transition-colors duration-200 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300;
}

/* Mobile Responsiveness */
@media (width <= 640px) {
  .order-row {
    @apply flex-col items-start gap-1;
  }

  .action-buttons {
    @apply flex-col;
  }
}

/* RTL Support */
[dir="rtl"] .order-row {
  @apply flex-row-reverse;
}

[dir="rtl"] .step-item {
  @apply flex-row-reverse;
}

[dir="rtl"] .step-content {
  @apply text-right;
}

[dir="rtl"] .support-text {
  @apply text-right;
}
</style>
