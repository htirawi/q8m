<template>
  <div class="checkout-form">
    <div class="mx-auto max-w-2xl">
      <!-- Header -->
      <div class="checkout-header">
        <h2 class="text-2xl font-bold text-gray-900 dark:text-white">
          {{ $t("checkout.title") }}

        </h2>
        <p class="text-gray-600 dark:text-gray-300">
          {{ $t("checkout.subtitle") }}

        </p>
      </div>

      <!-- Order Summary -->
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
            <span
              class="toggle-label"
              :class="{ 'toggle-label--active': billingCycle === 'monthly' }"
            >
              {{ $t("checkout.monthly") }}
            </span>
            <button
              @click="toggleBillingCycle"
              class="toggle-switch"
              :class="{ 'toggle-switch--active': billingCycle === 'yearly' }"
            >
              <span
                class="toggle-thumb"
                :class="{ 'toggle-thumb--active': billingCycle === 'yearly' }"
              />
            </button>
            <span
              class="toggle-label"
              :class="{ 'toggle-label--active': billingCycle === 'yearly' }"
            >
              {{ $t("checkout.yearly") }}

            </span>
          </div>
          <p v-if="billingCycle === 'yearly'" class="discount-note">
            {{ $t("checkout.savePercent", { percent: 17 }) }}

          </p>
        </div>
      </div>

      <!-- Billing Information -->
      <form @submit.prevent="handleSubmit" class="checkout-form-content">
        <div class="form-section">
          <h3 class="section-title">{{ $t("checkout.billingInformation") }}

</h3>

          <div class="form-grid">
            <!-- Name -->
            <div class="form-group">
              <label for="name" class="form-label"> {{ $t("checkout.fullName") }} * </label>
              <input
                id="name"
                v-model="billingForm.name"
                type="text"
                required
                class="form-input"
                :class="{ 'form-input--error': errors.name }"
                :placeholder="$t('checkout.namePlaceholder')"
              />
              <p v-if="errors.name" class="form-error">{{ errors.name }}

</p>
            </div>

            <!-- Email -->
            <div class="form-group">
              <label for="email" class="form-label"> {{ $t("checkout.email") }} * </label>
              <input
                id="email"
                v-model="billingForm.email"
                type="email"
                required
                class="form-input"
                :class="{ 'form-input--error': errors.email }"
                :placeholder="$t('checkout.emailPlaceholder')"
              />
              <p v-if="errors.email" class="form-error">{{ errors.email }}

</p>
            </div>

            <!-- Street Address -->
            <div class="form-group form-group--full">
              <label for="street" class="form-label"> {{ $t("checkout.streetAddress") }} * </label>
              <input
                id="street"
                v-model="billingForm.street"
                type="text"
                required
                class="form-input"
                :class="{ 'form-input--error': errors.street }"
                :placeholder="$t('checkout.streetPlaceholder')"
              />
              <p v-if="errors.street" class="form-error">{{ errors.street }}

</p>
            </div>

            <!-- City -->
            <div class="form-group">
              <label for="city" class="form-label"> {{ $t("checkout.city") }} * </label>
              <input
                id="city"
                v-model="billingForm.city"
                type="text"
                required
                class="form-input"
                :class="{ 'form-input--error': errors.city }"
                :placeholder="$t('checkout.cityPlaceholder')"
              />
              <p v-if="errors.city" class="form-error">{{ errors.city }}

</p>
            </div>

            <!-- State -->
            <div class="form-group">
              <label for="state" class="form-label"> {{ $t("checkout.state") }} * </label>
              <input
                id="state"
                v-model="billingForm.state"
                type="text"
                required
                class="form-input"
                :class="{ 'form-input--error': errors.state }"
                :placeholder="$t('checkout.statePlaceholder')"
              />
              <p v-if="errors.state" class="form-error">{{ errors.state }}

</p>
            </div>

            <!-- Postal Code -->
            <div class="form-group">
              <label for="postalCode" class="form-label"> {{ $t("checkout.postalCode") }} * </label>
              <input
                id="postalCode"
                v-model="billingForm.postalCode"
                type="text"
                required
                class="form-input"
                :class="{ 'form-input--error': errors.postalCode }"
                :placeholder="$t('checkout.postalCodePlaceholder')"
              />
              <p v-if="errors.postalCode" class="form-error">{{ errors.postalCode }}

</p>
            </div>

            <!-- Country -->
            <div class="form-group">
              <label for="country" class="form-label"> {{ $t("checkout.country") }} * </label>
              <select
                id="country"
                v-model="billingForm.country"
                required
                class="form-input"
                :class="{ 'form-input--error': errors.country }"
              >
                <option value="">{{ $t("checkout.selectCountry") }}

</option>
                <option v-for="country in countries" :key="country.code" :value="country.code">
                  {{ country.name }}

                </option>
              </select>
              <p v-if="errors.country" class="form-error">{{ errors.country }}

</p>
            </div>
          </div>
        </div>

        <!-- Payment Method Selection -->
        <div class="form-section">
          <h3 class="section-title">{{ $t("checkout.paymentMethod") }}</h3>

          <div class="payment-methods">
            <div
              v-for="method in availablePaymentMethods"
              :key="method.id"
              @click="selectPaymentMethod(method.id)"
              class="payment-method"
              :class="{ 'payment-method--selected': selectedPaymentMethod === method.id }"
            >
              <div class="payment-method-content">
                <img :src="method.icon" :alt="method.name" class="payment-icon" />
                <div class="payment-info">
                  <h4 class="payment-name">{{ method.name }}

</h4>
                  <p class="payment-description">{{ method.description }}

</p>
                </div>
                <div class="payment-radio">
                  <input
                    type="radio"
                    :id="method.id"
                    :value="method.id"
                    v-model="selectedPaymentMethod"
                    class="radio-input"
                  />
                  <span class="radio-custom"></span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Terms and Conditions -->
        <div class="terms-section">
          <label class="terms-checkbox">
            <input v-model="acceptedTerms" type="checkbox" required class="checkbox-input" />
            <span class="checkbox-custom"></span>
            <span class="terms-text">
              {{ $t("checkout.agreeToTerms") }}

              <a href="/terms" target="_blank" class="terms-link">
                {{ $t("checkout.termsOfService") }}

              </a>
              {{ $t("checkout.and") }}

              <a href="/privacy" target="_blank" class="terms-link">
                {{ $t("checkout.privacyPolicy") }}

              </a>
            </span>
          </label>
        </div>

        <!-- Submit Button -->
        <div class="submit-section">
          <button
            type="submit"
            :disabled="!isFormValid || paymentStore.isLoading"
            class="submit-button"
          >
            <span v-if="paymentStore.isLoading" class="flex items-center justify-center">
              <div class="mr-2 h-5 w-5 animate-spin rounded-full border-b-2 border-white"></div>
              {{ $t("checkout.processing") }}

            </span>
            <span v-else> {{ $t("checkout.completePurchase") }} {{ displayPrice }}

 </span>
          </button>

          <p class="security-note">
            {{ $t("checkout.securityNote") }}

          </p>
        </div>

        <!-- Loading State -->
        <LoadingState
          v-if="isProcessing"
          type="inline"
          :text="$t('checkout.processing')"
          :description="$t('checkout.processingDescription')"
        />

        <!-- Error Display -->
        <div v-else-if="error || paymentStore.error" class="error-message">
          {{ error || paymentStore.error }}

        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive, onMounted } from "vue";
import { useRouter } from "vue-router";
import { usePaymentStore } from "@/stores/payment";
import { useAuthStore } from "@/stores/auth";
import { useI18n } from "vue-i18n";
import { useErrorHandler } from "@/composables/useErrorHandler";
import { useToast } from "@/composables/useToast";
import LoadingState from "@/components/ui/LoadingState.vue";
import type { PlanPricing } from "@/stores/payment";

const router = useRouter();
const { t } = useI18n();
const paymentStore = usePaymentStore();
const authStore = useAuthStore();
const errorHandler = useErrorHandler();
const toast = useToast();

// Props
interface Props {
  selectedPlan: PlanPricing;
}

const props = defineProps<Props>();

// State
const billingCycle = ref<"monthly" | "yearly">("monthly");
const selectedPaymentMethod = ref<string>("");
const acceptedTerms = ref(false);

const billingForm = reactive({
  name: "",
  email: "",
  street: "",
  city: "",
  state: "",
  postalCode: "",
  country: "",
});

const errors = reactive({
  name: "",
  email: "",
  street: "",
  city: "",
  state: "",
  postalCode: "",
  country: "",
});

// Computed
const priceInfo = computed(() => {
  const currency = paymentStore.currentCurrency;
  return props.selectedPlan.pricing[currency];
});

const displayPrice = computed(() => {
  if (!priceInfo.value) return "Free";

  if (billingCycle.value === "yearly" && props.selectedPlan.planId !== "JUNIOR") {
    const monthlyPrice = priceInfo.value.amount;
    const yearlyPrice = monthlyPrice * 12 * 0.83; // 17% discount
    return paymentStore.formatCurrency(yearlyPrice, priceInfo.value.currency);
  }

  return priceInfo.value.formatted;
});

const pricePeriod = computed(() => {
  if (props.selectedPlan.planId === "JUNIOR") return "";
  return billingCycle.value === "yearly" ? "/year" : "/month";
});

const isFormValid = computed(() => {
  return (
    billingForm.name &&
    billingForm.email &&
    billingForm.street &&
    billingForm.city &&
    billingForm.state &&
    billingForm.postalCode &&
    billingForm.country &&
    selectedPaymentMethod.value &&
    acceptedTerms.value
  );
});

const availablePaymentMethods = computed(() => {
  const currency = paymentStore.currentCurrency;
  const methods = [];

  // PayPal is available for all currencies
  methods.push({
    id: "paypal",
    name: "PayPal",
    description: t("checkout.paypalDescription"),
    icon: "/icons/paypal.svg",
  });

  // APS is preferred for SAR and JOD
  if (["SAR", "JOD"].includes(currency)) {
    methods.push({
      id: "aps",
      name: "APS",
      description: t("checkout.apsDescription"),
      icon: "/icons/aps.svg",
    });
  }

  return methods;
});

const countries = computed(() => [
  { code: "US", name: "United States" },
  { code: "JO", name: "Jordan" },
  { code: "SA", name: "Saudi Arabia" },
  { code: "AE", name: "United Arab Emirates" },
  { code: "KW", name: "Kuwait" },
  { code: "QA", name: "Qatar" },
  { code: "BH", name: "Bahrain" },
  { code: "OM", name: "Oman" },
  { code: "EG", name: "Egypt" },
  { code: "LB", name: "Lebanon" },
  { code: "SY", name: "Syria" },
  { code: "IQ", name: "Iraq" },
  { code: "YE", name: "Yemen" },
]);

// Methods
const toggleBillingCycle = () => {
  billingCycle.value = billingCycle.value === "monthly" ? "yearly" : "monthly";billingCycle.value
};

const selectpaymentmethod = (methodId: string) => {
  selectedPaymentMethod.value = methodId;
};

const validateform = () => {
  // Clear previous errors
  Object.keys(errors).forEach((key) => {
    errors[key as keyof typeof errors] = "";
  });

  let isValid = true;

  // Validate required fields
  if (!billingForm.name.trim()) {
    errors.name = t("checkout.errors.nameRequired");
    isValid = false;
  }

  if (!billingForm.email.trim()) {
    errors.email = t("checkout.errors.emailRequired");
  } else if (!/\S+@\S+\.\S+/.test(billingForm.email)) {
    errors.email = t("checkout.errors.emailInvalid");
    isValid = false;
  }

  if (!billingForm.street.trim()) {
    errors.street = t("checkout.errors.streetRequired");
    isValid = false;
  }

  if (!billingForm.city.trim()) {
    errors.city = t("checkout.errors.cityRequired");
    isValid = false;
  }

  if (!billingForm.state.trim()) {
    errors.state = t("checkout.errors.stateRequired");
    isValid = false;
  }

  if (!billingForm.postalCode.trim()) {
    errors.postalCode = t("checkout.errors.postalCodeRequired");
    isValid = false;
  }

  if (!billingForm.country) {
    errors.country = t("checkout.errors.countryRequired");
    isValid = false;
  }

  return isValid;
};

const handlesubmit = async () => {
  if (!validateForm()) {
    return;
  }

  isProcessing.value = true;
  error.value = null;

  try {
    const paymentrequest = {
      planType: props.selectedPlan.planId as "INTERMEDIATE" | "SENIOR" | "BUNDLE",
      currency: paymentStore.currentCurrency,
      billingCycle: billingCycle.value,
      billingAddress: {
        street: billingForm.street,
        city: billingForm.city,
        state: billingForm.state,
        postalCode: billingForm.postalCode,
        country: billingForm.country,
      },
    };

    const response = await paymentStore.createPayment(paymentRequest);

    if (response.success) {
      // Handle different payment gateways
      switch (response.paymentGateway) {
        case "paypal":
          // Redirect to PayPal Checkout
          if (response.checkoutUrl) {
            window.location.href = response.checkoutUrl;
          }

 else {
            const error = new Error("PayPal checkout URL not received");
            error.name = "PAYMENT_GATEWAY_ERROR";
            throw error;
          }
          break;

        case "aps":
          // Redirect to APS payment page
          if (response.checkoutUrl) {
            window.location.href = response.checkoutUrl;
          }

 else {
            const error = new Error("APS checkout URL not received");
            error.name = "PAYMENT_GATEWAY_ERROR";
            throw error;
          }
          break;

        case "hyperpay":
          // Redirect to HyperPay payment page
          if (response.checkoutUrl) {
            window.location.href = response.checkoutUrl;
          }

 else {
            const error = new Error("HyperPay checkout URL not received");
            error.name = "PAYMENT_GATEWAY_ERROR";
            throw error;
          }
          break;

        default:
          const error = new Error(`Unsupported payment gateway: ${response.paymentGateway}`);
          error.name = "PAYMENT_GATEWAY_ERROR";
          throw error;
      }
    }

 else {
      const error = new Error("Payment creation failed");
      error.name = "PAYMENT_FAILED";
      throw error;
    }
  } catch (err) {
    const errorState = errorHandler.handlePaymentError(err);
    error.value = errorState.message;
    console.error("Checkout error:", err);
  }

 finally {
    isProcessing.value = false;
  }
};

// Lifecycle
onMounted(() => {
  // Pre-fill user information if available
  if (authStore.user) {
    billingForm.name = authStore.user.name;
    billingForm.email = authStore.user.email;
  }

  // Set default payment method
  if (availablePaymentMethods.value.length > 0) {
    selectedPaymentMethod.value = availablePaymentMethods.value[0].id;
  }
});
</script>

<style scoped>
.checkout-form {
  @apply mx-auto max-w-4xl p-6;
}

.checkout-header {
  @apply mb-8 text-center;
}

.order-summary {
  @apply mb-8 rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800;
}

.summary-title {
  @apply mb-4 text-lg font-semibold text-gray-900 dark:text-white;
}

.plan-details {
  @apply mb-4 flex items-center justify-between;
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
  @apply flex items-baseline justify-end gap-1;
}

.price-amount {
  @apply text-2xl font-bold text-gray-900 dark:text-white;
}

.price-period {
  @apply text-gray-600 dark:text-gray-300;
}

.price-note {
  @apply mt-1 text-xs text-gray-500 dark:text-gray-400;
}

.billing-toggle {
  @apply border-t border-gray-200 pt-4 dark:border-gray-700;
}

.toggle-container {
  @apply flex items-center justify-center gap-3;
}

.toggle-label {
  @apply text-sm font-medium text-gray-600 transition-colors duration-200 dark:text-gray-400;
}

.toggle-label--active {
  @apply text-indigo-600 dark:text-indigo-400;
}

.toggle-switch {
  @apply relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200 transition-colors duration-200 dark:bg-gray-600;
}

.toggle-switch--active {
  @apply bg-indigo-600;
}

.toggle-thumb {
  @apply inline-block h-4 w-4 translate-x-1 transform rounded-full bg-white transition-transform duration-200;
}

.toggle-thumb--active {
  @apply translate-x-6;
}

.discount-note {
  @apply mt-2 text-center text-sm text-green-600 dark:text-green-400;
}

.checkout-form-content {
  @apply space-y-8;
}

.form-section {
  @apply rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800;
}

.section-title {
  @apply mb-6 text-lg font-semibold text-gray-900 dark:text-white;
}

.form-grid {
  @apply grid grid-cols-1 gap-6 md:grid-cols-2;
}

.form-group {
  @apply space-y-2;
}

.form-group--full {
  @apply md:col-span-2;
}

.form-label {
  @apply block text-sm font-medium text-gray-700 dark:text-gray-300;
}

.form-input {
  @apply w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm transition-colors duration-200 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white;
}

.form-input--error {
  @apply border-red-500 focus:border-red-500 focus:ring-red-500;
}

.form-error {
  @apply text-sm text-red-600 dark:text-red-400;
}

.payment-methods {
  @apply space-y-4;
}

.payment-method {
  @apply cursor-pointer rounded-lg border border-gray-300 p-4 transition-all duration-200 hover:border-indigo-500 dark:border-gray-600 dark:hover:border-indigo-400;
}

.payment-method--selected {
  @apply border-indigo-500 ring-2 ring-indigo-500 ring-opacity-20 dark:border-indigo-400;
}

.payment-method-content {
  @apply flex items-center gap-4;
}

.payment-icon {
  @apply h-8 w-8 object-contain;
}

.payment-info {
  @apply flex-1;
}

.payment-name {
  @apply font-medium text-gray-900 dark:text-white;
}

.payment-description {
  @apply text-sm text-gray-600 dark:text-gray-300;
}

.payment-radio {
  @apply relative;
}

.radio-input {
  @apply sr-only;
}

.radio-custom {
  @apply block h-5 w-5 rounded-full border-2 border-gray-300 dark:border-gray-600;
}

.payment-method--selected .radio-custom {
  @apply border-indigo-500 bg-indigo-500;
}

.payment-method--selected .radio-custom::after {
  @apply absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 transform rounded-full bg-white;

  content: "";
}

.terms-section {
  @apply flex items-start gap-3;
}

.terms-checkbox {
  @apply flex cursor-pointer items-start gap-3;
}

.checkbox-input {
  @apply sr-only;
}

.checkbox-custom {
  @apply mt-0.5 block h-5 w-5 rounded border-2 border-gray-300 dark:border-gray-600;
}

.checkbox-input:checked + .checkbox-custom {
  @apply border-indigo-500 bg-indigo-500;
}

.checkbox-input:checked + .checkbox-custom::after {
  @apply absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 transform rounded bg-white;

  content: "✓";
}

.terms-text {
  @apply text-sm text-gray-600 dark:text-gray-300;
}

.terms-link {
  @apply text-indigo-600 hover:underline dark:text-indigo-400;
}

.submit-section {
  @apply space-y-4 text-center;
}

.submit-button {
  @apply w-full rounded-lg bg-indigo-600 px-6 py-3 font-medium text-white transition-colors duration-200 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50;
}

.security-note {
  @apply text-xs text-gray-500 dark:text-gray-400;
}

.error-message {
  @apply rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-600 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400;
}

/* Mobile responsiveness */
@media (width <= 768px) {
  .plan-details {
    @apply flex-col items-start gap-4;
  }

  .plan-pricing {
    @apply w-full text-left;
  }

  .price-container {
    @apply justify-start;
  }

  .form-grid {
    @apply grid-cols-1;
  }
}

/* RTL Support */
[dir="rtl"] .plan-pricing {
  @apply text-left;
}

[dir="rtl"] .price-container {
  @apply justify-start;
}

[dir="rtl"] .payment-method-content {
  @apply flex-row-reverse;
}

[dir="rtl"] .payment-info {
  @apply text-right;
}

[dir="rtl"] .terms-section {
  @apply flex-row-reverse;
}

[dir="rtl"] .submit-section {
  @apply text-right;
}
</style>
