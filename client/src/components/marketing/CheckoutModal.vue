<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useCheckout } from '@/composables/useCheckout';
import { useAnalytics } from '@/composables/useAnalytics';
import type { PlanId, BillingCycle } from '@/types/pricing';

interface IProps {
  show: boolean;
  planId?: PlanId;
  billing?: BillingCycle;
}

interface IEmits {
  (e: 'close'): void;
  (e: 'success', subscriptionId: string): void;
}

const props = withDefaults(defineProps<IProps>(), {
  billing: 'annual',
});

const emit = defineEmits<IEmits>();

const { t } = useI18n();
const {
  selectPlan,
  startCheckout,
  confirmOneClick,
  currentStep,
  selectedPlan,
  selectedCycle,
  errorMessage,
  isProcessing,
  hasSavedPayment,
  savedPaymentMethods,
} = useCheckout();

const { trackGenericEvent } = useAnalytics();

// Local state
const useNewPaymentMethod = ref(false);

// Computed
const formattedPrice = computed(() => {
  if (!selectedPlan.value) return '$0';
  const price = selectedCycle.value === 'monthly'
    ? selectedPlan.value.price
    : Math.round(selectedPlan.value.price * 12 * (1 - (selectedPlan.value.discountPercent || 0) / 100));
  return `$${price}`;
});

const billingLabel = computed(() => {
  return selectedCycle.value === 'monthly'
    ? t('pricing.billing.perMonth')
    : t('pricing.billing.perYear');
});

// Methods
const handleClose = () => {
  trackGenericEvent('checkout_abandoned', {
    plan: selectedPlan.value?.tier,
    billing: selectedCycle.value,
    step: currentStep.value,
  });
  emit('close');
};

const handleCheckout = async () => {
  if (!selectedPlan.value) return;

  if (hasSavedPayment.value && !useNewPaymentMethod.value) {
    await confirmOneClick();
  } else {
    await startCheckout('checkout_modal');
  }

  if (currentStep.value === 'success') {
    emit('success', 'placeholder-subscription-id');
  }
};

// Watch props to pre-select plan
watch(() => [props.planId, props.billing], ([planId, billing]) => {
  if (planId && billing) {
    selectPlan(planId as any, billing as BillingCycle);
  }
}, { immediate: true });

// Track modal opened
watch(() => props.show, (isOpen) => {
  if (isOpen) {
    trackGenericEvent('checkout_opened', {
      plan: props.planId,
      billing: props.billing,
      method: 'modal',
      hasAuth: true, // TODO: Get from auth store
      hasSavedPayment: hasSavedPayment.value,
    });
  }
});

defineOptions({
  name: 'CheckoutModal',
});
</script>

<template>
  <Teleport to="body">
    <Transition name="modal-fade">
      <div
        v-if="show"
        class="checkout-modal-overlay"
        @click.self="handleClose"
        role="dialog"
        aria-modal="true"
        :aria-label="t('plans.checkout.title')"
      >
        <div class="checkout-modal">
          <!-- Close button -->
          <button
            type="button"
            class="checkout-modal__close"
            @click="handleClose"
            :aria-label="t('a11y.closeModal')"
          >
            <svg
              class="checkout-modal__close-icon"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>

          <!-- Header -->
          <div class="checkout-modal__header">
            <h2 class="checkout-modal__title">
              {{ selectedPlan ? t(selectedPlan.tier) : t('pricing.plans.title') }}
            </h2>
            <p class="checkout-modal__price">
              <span class="checkout-modal__price-amount">{{ formattedPrice }}</span>
              <span class="checkout-modal__price-period">{{ billingLabel }}</span>
            </p>
          </div>

          <!-- Content -->
          <div class="checkout-modal__content">
            <!-- Error message -->
            <div v-if="errorMessage" class="checkout-modal__error" role="alert">
              <svg
                class="checkout-modal__error-icon"
                fill="currentColor"
                viewBox="0 0 20 20"
                aria-hidden="true"
              >
                <path
                  fill-rule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clip-rule="evenodd"
                />
              </svg>
              <span>{{ errorMessage }}</span>
            </div>

            <!-- Payment method selection -->
            <div v-if="currentStep === 'plan_selection' || currentStep === 'checkout'" class="checkout-modal__payment">
              <!-- Saved payment method -->
              <div v-if="hasSavedPayment && savedPaymentMethods.length > 0" class="checkout-modal__saved-payment">
                <label class="checkout-modal__payment-option">
                  <input
                    type="radio"
                    name="payment-method"
                    :checked="!useNewPaymentMethod"
                    @change="useNewPaymentMethod = false"
                    class="checkout-modal__radio"
                  />
                  <div class="checkout-modal__payment-details">
                    <span class="checkout-modal__payment-label">
                      {{ t('pricing.payment.savedCard') }}
                    </span>
                    <span class="checkout-modal__payment-info">
                      •••• {{ savedPaymentMethods[0]?.last4 }}
                    </span>
                  </div>
                </label>
              </div>

              <!-- New payment method -->
              <div class="checkout-modal__new-payment">
                <label class="checkout-modal__payment-option">
                  <input
                    type="radio"
                    name="payment-method"
                    :checked="useNewPaymentMethod || !hasSavedPayment"
                    @change="useNewPaymentMethod = true"
                    class="checkout-modal__radio"
                  />
                  <span class="checkout-modal__payment-label">
                    {{ t('pricing.payment.newCard') }}
                  </span>
                </label>
              </div>

              <!-- Payment provider placeholder (Stripe/PayPal/etc.) -->
              <div v-if="useNewPaymentMethod || !hasSavedPayment" class="checkout-modal__provider">
                <p class="checkout-modal__provider-note">
                  {{ t('pricing.payment.providerNote') }}
                </p>
                <!-- Placeholder for payment provider SDK integration -->
                <div class="checkout-modal__provider-iframe">
                  [Payment Provider Iframe/Widget Placeholder]
                </div>
              </div>
            </div>

            <!-- Processing state -->
            <div v-if="currentStep === 'processing'" class="checkout-modal__processing">
              <div class="checkout-modal__spinner" aria-live="polite" aria-busy="true">
                <svg
                  class="checkout-modal__spinner-icon"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <circle
                    class="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    stroke-width="4"
                  ></circle>
                  <path
                    class="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
              </div>
              <p class="checkout-modal__processing-text">
                {{ t('pricing.payment.processing') }}
              </p>
            </div>
          </div>

          <!-- Footer -->
          <div class="checkout-modal__footer">
            <!-- CTA -->
            <button
              type="button"
              class="checkout-modal__cta"
              @click="handleCheckout"
              :disabled="isProcessing"
              data-testid="checkout-modal-cta"
            >
              {{ isProcessing ? t('pricing.payment.processing') : t('pricing.payment.confirmSubscribe', { amount: formattedPrice }) }}
            </button>

            <!-- Reassurance -->
            <div class="checkout-modal__reassurance">
              <span class="checkout-modal__reassurance-item">
                {{ t('pricing.reassurance.cancelAnytime') }}
              </span>
              <span class="checkout-modal__reassurance-separator">•</span>
              <span class="checkout-modal__reassurance-item">
                {{ t('pricing.reassurance.securePayments') }}
              </span>
              <span class="checkout-modal__reassurance-separator">•</span>
              <span class="checkout-modal__reassurance-item">
                {{ t('pricing.reassurance.noHiddenFees') }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
/* Overlay */
.checkout-modal-overlay {
  @apply fixed inset-0 z-50;
  @apply bg-black bg-opacity-50 backdrop-blur-sm;
  @apply flex items-center justify-center;
  @apply p-4;
}

/* Modal container */
.checkout-modal {
  @apply relative bg-white dark:bg-gray-800;
  @apply rounded-2xl shadow-2xl;
  @apply w-full max-w-md;
  @apply max-h-[90vh] overflow-y-auto;
}

/* Close button */
.checkout-modal__close {
  @apply absolute top-4 right-4 z-10;
  @apply w-10 h-10 rounded-full;
  @apply bg-gray-100 dark:bg-gray-700;
  @apply text-gray-600 dark:text-gray-300;
  @apply hover:bg-gray-200 dark:hover:bg-gray-600;
  @apply focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2;
  @apply transition-colors duration-200;
}

.checkout-modal__close-icon {
  @apply w-5 h-5 mx-auto;
}

/* Header */
.checkout-modal__header {
  @apply px-6 pt-8 pb-6 text-center;
  @apply border-b border-gray-200 dark:border-gray-700;
}

.checkout-modal__title {
  @apply text-2xl font-bold text-gray-900 dark:text-white mb-3;
}

.checkout-modal__price {
  @apply flex items-baseline justify-center gap-2;
}

.checkout-modal__price-amount {
  @apply text-4xl font-bold text-blue-600 dark:text-blue-400;
}

.checkout-modal__price-period {
  @apply text-sm text-gray-600 dark:text-gray-400;
}

/* Content */
.checkout-modal__content {
  @apply px-6 py-6;
}

/* Error */
.checkout-modal__error {
  @apply flex items-start gap-3 p-4 mb-6;
  @apply bg-red-50 dark:bg-red-900/20;
  @apply border border-red-200 dark:border-red-800;
  @apply rounded-lg;
  @apply text-red-700 dark:text-red-400;
  @apply text-sm;
}

.checkout-modal__error-icon {
  @apply w-5 h-5 flex-shrink-0 mt-0.5;
}

/* Payment */
.checkout-modal__payment {
  @apply space-y-4;
}

.checkout-modal__payment-option {
  @apply flex items-start gap-3 p-4;
  @apply border-2 border-gray-200 dark:border-gray-700;
  @apply rounded-lg cursor-pointer;
  @apply hover:border-blue-300 dark:hover:border-blue-600;
  @apply transition-colors duration-200;
}

.checkout-modal__radio {
  @apply w-5 h-5 mt-0.5;
  @apply text-blue-600 focus:ring-blue-500;
}

.checkout-modal__payment-details {
  @apply flex flex-col gap-1;
}

.checkout-modal__payment-label {
  @apply font-semibold text-gray-900 dark:text-white;
}

.checkout-modal__payment-info {
  @apply text-sm text-gray-600 dark:text-gray-400;
}

.checkout-modal__provider {
  @apply mt-4 space-y-4;
}

.checkout-modal__provider-note {
  @apply text-sm text-gray-600 dark:text-gray-400 text-center;
}

.checkout-modal__provider-iframe {
  @apply p-8 bg-gray-50 dark:bg-gray-700 rounded-lg;
  @apply text-center text-gray-500 dark:text-gray-400;
  @apply min-h-[200px] flex items-center justify-center;
}

/* Processing */
.checkout-modal__processing {
  @apply flex flex-col items-center justify-center py-12;
}

.checkout-modal__spinner {
  @apply mb-4;
}

.checkout-modal__spinner-icon {
  @apply w-12 h-12 animate-spin text-blue-600;
}

.checkout-modal__processing-text {
  @apply text-gray-600 dark:text-gray-400;
}

/* Footer */
.checkout-modal__footer {
  @apply px-6 pb-6;
}

.checkout-modal__cta {
  @apply w-full py-4 px-6 rounded-lg;
  @apply bg-gradient-to-r from-blue-600 to-purple-600;
  @apply text-white font-semibold text-lg;
  @apply hover:from-blue-700 hover:to-purple-700;
  @apply focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2;
  @apply disabled:opacity-50 disabled:cursor-not-allowed;
  @apply transition-all duration-200;
  @apply shadow-md hover:shadow-lg;
}

.checkout-modal__reassurance {
  @apply mt-4 text-center;
  @apply text-xs text-gray-500 dark:text-gray-400;
  @apply flex items-center justify-center flex-wrap gap-2;
}

.checkout-modal__reassurance-separator {
  @apply text-gray-400;
}

/* RTL Support */
[dir='rtl'] .checkout-modal__close {
  @apply right-auto left-4;
}

[dir='rtl'] .checkout-modal__error {
  @apply flex-row-reverse;
}

[dir='rtl'] .checkout-modal__payment-option {
  @apply flex-row-reverse text-right;
}

[dir='rtl'] .checkout-modal__reassurance {
  @apply flex-row-reverse;
}

/* Transitions */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.3s ease;
}

.modal-fade-enter-active .checkout-modal,
.modal-fade-leave-active .checkout-modal {
  transition: transform 0.3s ease, opacity 0.3s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

.modal-fade-enter-from .checkout-modal {
  transform: scale(0.95) translateY(20px);
  opacity: 0;
}

.modal-fade-leave-to .checkout-modal {
  transform: scale(0.95) translateY(20px);
  opacity: 0;
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  .modal-fade-enter-active,
  .modal-fade-leave-active,
  .modal-fade-enter-active .checkout-modal,
  .modal-fade-leave-active .checkout-modal {
    transition: none;
  }

  .checkout-modal__spinner-icon {
    animation: none;
  }
}
</style>
