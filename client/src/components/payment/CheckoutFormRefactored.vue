<template>
  <div class="checkout-form">
    <div class="mx-auto max-w-2xl">
      <!-- Header -->
      <CheckoutHeader />

      <!-- Order Summary -->
      <OrderSummary
        :selected-plan="selectedPlan"
        :billing-cycle="billingCycle"
        :price-info="priceInfo"
        @toggle-billing-cycle="toggleBillingCycle"
      />

      <!-- Billing Information -->
      <form @submit.prevent="handleSubmit" class="checkout-form-content">
        <BillingForm
          v-model="billingForm"
          :errors="errors"
        />

        <!-- Payment Method -->
        <PaymentMethodSelector
          v-model="selectedPaymentMethod"
          :currency="paymentStore.currentCurrency"
        />

        <!-- Submit Button -->
        <div class="form-actions">
          <button
            type="submit"
            :disabled="isProcessing || !isFormValid"
            class="submit-button"
            :class="{ 'submit-button--loading': isProcessing }"
          >
            <LoadingSpinner
              v-if="isProcessing"
              size="sm"
              color="white"
              class="mr-2"
            />
            {{ isProcessing ? $t("checkout.processing") : $t("checkout.completeOrder") }}
          </button>
        </div>
      </form>
    </div>

    <!-- Checkout Summary Sidebar -->
    <div class="checkout-sidebar">
      <CheckoutSummary
        :selected-plan="selectedPlan"
        :billing-cycle="billingCycle"
        :price-info="priceInfo"
        :is-processing="isProcessing"
        :is-form-valid="isFormValid"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from "vue";
import { useRoute } from "vue-router";
import { useI18n } from "vue-i18n";
import { usePaymentStore } from "@/stores/payment";
import { useCheckoutForm } from "@/composables/useCheckoutForm";
import CheckoutHeader from "./CheckoutHeader.vue";
import OrderSummary from "./OrderSummary.vue";
import BillingForm from "./BillingForm.vue";
import PaymentMethodSelector from "./PaymentMethodSelector.vue";
import CheckoutSummary from "./CheckoutSummary.vue";
import LoadingSpinner from "@/components/ui/LoadingSpinner.vue";
import type { PlanPricing } from "@/stores/payment";

const route = useRoute();
const { t } = useI18n();
const paymentStore = usePaymentStore();

// Get selected plan from route params
const selectedPlan = computed((): PlanPricing => {
  const planId = route.params.planId as string;
  const plan = paymentStore.pricing.find(p => p.planId === planId);
  
  if (!plan) {
    throw new Error(`Plan ${planId} not found`);
  }
  
  return plan;
});

// Get pricing info for selected plan and billing cycle
const priceInfo = computed(() => {
  return paymentStore.getPlanPricing(selectedPlan.value.planId, billingCycle.value);
});

// Use checkout form composable
const {
  billingForm,
  selectedPaymentMethod,
  billingCycle,
  isProcessing,
  errors,
  isFormValid,
  processPayment,
  toggleBillingCycle,
  clearErrors,
} = useCheckoutForm();

// Handle form submission
const handleSubmit = async () => {
  await processPayment(selectedPlan.value);
};

// Initialize payment store
onMounted(async () => {
  try {
    await paymentStore.initialize();
  } catch (error) {
    console.error("Failed to initialize payment store:", error);
  }
});
</script>

<style scoped>
.checkout-form {
  @apply min-h-screen bg-gray-50 py-8 dark:bg-gray-900;
}

.checkout-form-content {
  @apply space-y-8;
}

.form-actions {
  @apply pt-6;
}

.submit-button {
  @apply w-full rounded-md bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-gray-400 dark:focus:ring-offset-gray-800;
}

.submit-button--loading {
  @apply cursor-wait;
}

.checkout-sidebar {
  @apply fixed right-0 top-0 h-full w-80 bg-white shadow-lg dark:bg-gray-800;
}

@media (max-width: 1024px) {
  .checkout-sidebar {
    @apply relative w-full shadow-none;
  }
}
</style>
