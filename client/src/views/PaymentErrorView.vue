<template>
  <div class="payment-error-view">
    <div class="error-container">
      <!-- Error Animation -->
      <div class="error-animation">
        <div class="error-circle">
          <svg class="error-icon" viewBox="0 0 52 52">
            <circle class="error-circle-bg" cx="26" cy="26" r="25" fill="none" />
            <path class="error-cross" fill="none" d="M16 16l20 20M36 16L16 36" />
          </svg>
        </div>
      </div>

      <!-- Error Content -->
      <div class="error-content">
        <h1 class="error-title">{{ $t("payment.error.title") }}

</h1>
        <p class="error-message">{{ errorMessage }}

</p>

        <!-- Error Details -->
        <div v-if="errorDetails" class="error-details">
          <div class="error-card">
            <h3 class="error-details-title">{{ $t("payment.error.details") }}

</h3>

            <div class="error-info">
              <div class="error-row">
                <span class="error-label">{{ $t("payment.error.errorCode") }}

</span>
                <span class="error-value">{{ errorDetails.errorCode }}

</span>
              </div>

              <div v-if="errorDetails.orderId" class="error-row">
                <span class="error-label">{{ $t("payment.error.orderId") }}

</span>
                <span class="error-value">{{ errorDetails.orderId }}

</span>
              </div>

              <div v-if="errorDetails.plan" class="error-row">
                <span class="error-label">{{ $t("payment.error.plan") }}

</span>
                <span class="error-value">{{ errorDetails.plan }}

</span>
              </div>

              <div class="error-row">
                <span class="error-label">{{ $t("payment.error.timestamp") }}

</span>
                <span class="error-value">{{ formattedTimestamp }}

</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Common Solutions -->
        <div class="solutions-section">
          <h3 class="solutions-title">{{ $t("payment.error.solutions.title") }}

</h3>
          <div class="solutions-list">
            <div class="solution-item">
              <div class="solution-icon">
                <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                  />
                </svg>
              </div>
              <div class="solution-content">
                <h4 class="solution-title">{{ $t("payment.error.solutions.card.title") }}

</h4>
                <p class="solution-description">
                  {{ $t("payment.error.solutions.card.description") }}

                </p>
              </div>
            </div>

            <div class="solution-item">
              <div class="solution-icon">
                <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <div class="solution-content">
                <h4 class="solution-title">{{ $t("payment.error.solutions.billing.title") }}

</h4>
                <p class="solution-description">
                  {{ $t("payment.error.solutions.billing.description") }}

                </p>
              </div>
            </div>

            <div class="solution-item">
              <div class="solution-icon">
                <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M12 2.25a9.75 9.75 0 100 19.5 9.75 9.75 0 000-19.5z"
                  />
                </svg>
              </div>
              <div class="solution-content">
                <h4 class="solution-title">{{ $t("payment.error.solutions.network.title") }}

</h4>
                <p class="solution-description">
                  {{ $t("payment.error.solutions.network.description") }}

                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="action-buttons">
          <button @click="retryPayment" class="btn-primary">
            <svg class="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            {{ $t("payment.error.retryPayment") }}

          </button>

          <button @click="goToPricing" class="btn-secondary">
            <svg class="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            {{ $t("payment.error.backToPricing") }}

          </button>
        </div>

        <!-- Support -->
        <div class="support-section">
          <div class="support-card">
            <div class="support-icon">
              <svg class="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M12 2.25a9.75 9.75 0 100 19.5 9.75 9.75 0 000-19.5z"
                />
              </svg>
            </div>
            <div class="support-content">
              <h3 class="support-title">{{ $t("payment.error.support.title") }}

</h3>
              <p class="support-description">{{ $t("payment.error.support.description") }}

</p>
              <div class="support-actions">
                <a href="mailto:support@quizplatform.com" class="support-link">
                  <svg class="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                  {{ $t("payment.error.support.email") }}

                </a>
                <a href="/contact" class="support-link">
                  <svg class="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    />
                  </svg>
                  {{ $t("payment.error.support.chat") }}

                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { usePaymentStore } from "@/stores/payment";
import { useI18n } from "vue-i18n";

const route = useRoute();
const router = useRouter();
const { t } = useI18n();
const paymentStore = usePaymentStore();

// State
const errorDetails = ref<any>(null);

// Computed
const errorMessage = computed(() => {
  const errorCode = route.query.error as string;
  const message = route.query.message as string;

  if (message) return message;

  // Default messages based on error codes
  const errorMessages: Record<string, string> = {
    PAYMENT_DECLINED: t("payment.error.messages.declined"),
    INSUFFICIENT_FUNDS: t("payment.error.messages.insufficientFunds"),
    CARD_EXPIRED: t("payment.error.messages.cardExpired"),
    INVALID_CARD: t("payment.error.messages.invalidCard"),
    NETWORK_ERROR: t("payment.error.messages.networkError"),
    TIMEOUT: t("payment.error.messages.timeout"),
    CANCELLED: t("payment.error.messages.cancelled"),
  };

  return errorMessages[errorCode] || t("payment.error.messages.default");
});

const formattedTimestamp = computed(() => {
  if (!errorDetails.value?.timestamp) return new Date().toLocaleString();
  return new Date(errorDetails.value.timestamp).toLocaleString();
});

// Methods
const retryPayment = () => {
  const plan = route.query.plan as string;
  if (plan) {
    router.push(`/checkout?plan=${plan}`);
  }

 else {
    router.push("/pricing");
  }
};

const gotopricing = () => {
  router.push("/pricing");
};

const parseerrordetails = () => {
  const errorCode = route.query.error as string;
  const orderId = route.query.orderId as string;
  const plan = route.query.plan as string;

  if (errorCode) {
    errordetails.value = {
      errorCode,
      orderId,
      plan,
      timestamp: new Date().toISOString(),
    };
  }
};

// Lifecycle
onMounted(() => {
  parseErrorDetails();
  paymentStore.clearError();
});
</script>

<style scoped>
.payment-error-view {
  @apply min-h-screen bg-gray-50 px-4 py-12 dark:bg-gray-900;
}

.error-container {
  @apply mx-auto max-w-2xl text-center;
}

/* Error Animation */
.error-animation {
  @apply mb-8;
}

.error-circle {
  @apply relative mx-auto h-24 w-24;
}

.error-icon {
  @apply h-full w-full;
}

.error-circle-bg {
  @apply stroke-red-500;

  stroke-width: 2;
  animation: circle-bg 0.6s cubic-bezier(0.65, 0, 0.45, 1) forwards;
}

.error-cross {
  @apply stroke-red-500;

  stroke-width: 2;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-dasharray: 20;
  stroke-dashoffset: 20;
  animation: cross 0.3s cubic-bezier(0.65, 0, 0.45, 1) 0.8s forwards;
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

@keyframes cross {
  0% {
    stroke-dashoffset: 20;
  }

  100% {
    stroke-dashoffset: 0;
  }
}

/* Error Content */
.error-content {
  @apply space-y-8;
}

.error-title {
  @apply text-3xl font-bold text-gray-900 dark:text-white;
}

.error-message {
  @apply text-lg text-gray-600 dark:text-gray-300;
}

/* Error Details */
.error-details {
  @apply text-left;
}

.error-card {
  @apply rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800;
}

.error-details-title {
  @apply mb-4 text-xl font-semibold text-gray-900 dark:text-white;
}

.error-info {
  @apply space-y-3;
}

.error-row {
  @apply flex items-center justify-between border-b border-gray-100 py-2 last:border-b-0 dark:border-gray-700;
}

.error-label {
  @apply text-sm font-medium text-gray-600 dark:text-gray-400;
}

.error-value {
  @apply text-sm font-semibold text-gray-900 dark:text-white;
}

/* Solutions */
.solutions-section {
  @apply text-left;
}

.solutions-title {
  @apply mb-6 text-xl font-semibold text-gray-900 dark:text-white;
}

.solutions-list {
  @apply space-y-6;
}

.solution-item {
  @apply flex items-start gap-4;
}

.solution-icon {
  @apply flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400;
}

.solution-content {
  @apply flex-1 text-left;
}

.solution-title {
  @apply mb-1 text-lg font-medium text-gray-900 dark:text-white;
}

.solution-description {
  @apply text-gray-600 dark:text-gray-300;
}

/* Action Buttons */
.action-buttons {
  @apply flex flex-col justify-center gap-4 sm:flex-row;
}

.btn-primary {
  @apply inline-flex items-center justify-center rounded-lg border border-transparent bg-red-600 px-6 py-3 text-base font-medium text-white transition-colors duration-200 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2;
}

.btn-secondary {
  @apply inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-6 py-3 text-base font-medium text-gray-700 transition-colors duration-200 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700;
}

/* Support */
.support-section {
  @apply border-t border-gray-200 pt-8 dark:border-gray-700;
}

.support-card {
  @apply flex items-start gap-4 rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800;
}

.support-icon {
  @apply flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-indigo-100 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400;
}

.support-content {
  @apply flex-1 text-left;
}

.support-title {
  @apply mb-2 text-lg font-semibold text-gray-900 dark:text-white;
}

.support-description {
  @apply mb-4 text-gray-600 dark:text-gray-300;
}

.support-actions {
  @apply flex flex-col gap-4 sm:flex-row;
}

.support-link {
  @apply inline-flex items-center text-indigo-600 transition-colors duration-200 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300;
}

/* Mobile Responsiveness */
@media (width <= 640px) {
  .error-row {
    @apply flex-col items-start gap-1;
  }

  .action-buttons {
    @apply flex-col;
  }

  .support-card {
    @apply flex-col text-center;
  }

  .support-actions {
    @apply flex-col;
  }
}

/* RTL Support */
[dir="rtl"] .error-row {
  @apply flex-row-reverse;
}

[dir="rtl"] .solution-item {
  @apply flex-row-reverse;
}

[dir="rtl"] .solution-content {
  @apply text-right;
}

[dir="rtl"] .support-card {
  @apply flex-row-reverse;
}

[dir="rtl"] .support-content {
  @apply text-right;
}
</style>
