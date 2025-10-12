<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import ModernPricingCard from "@/components/pricing/ModernPricingCard.vue";
import type { BillingCycle } from "@/components/pricing/pricing.config";

const router = useRouter();
const authStore = useAuthStore();

// State
const billingCycle = ref<BillingCycle>("monthly");
const isProcessingPayment = ref(false);

// Toggle billing cycle
const toggleBillingCycle = () => {
  billingCycle.value = billingCycle.value === "monthly" ? "yearly" : "monthly";
};

// Sample pricing data (replace with your actual pricing tiers)
const pricingPlans = [
  {
    id: "intermediate",
    name: "Intermediate Plan",
    priceMonthly: 18,
    priceYearly: 180, // 2 months free
    features: [
      "300+ Advanced Questions",
      "All Question Types",
      "Detailed Explanations",
      "Performance Analytics",
      "Bookmarks & Notes",
      "Priority Support",
      "Mobile Access",
      "Progress Tracking",
      "Certificate of Completion",
    ],
    popular: true,
  },
  {
    id: "senior",
    name: "Senior Plan",
    priceMonthly: 29,
    priceYearly: 290,
    features: [
      "500+ Expert Questions",
      "System Design Questions",
      "Mock Interviews",
      "Advanced Analytics",
      "Custom Study Plans",
      "Expert Reviews",
      "Priority Support",
      "1-on-1 Mentoring Sessions",
      "Resume Review",
    ],
    popular: false,
  },
];

// Methods
const handleCreditCardPayment = async (planId: string, cycle: BillingCycle) => {
  console.log("Credit card payment selected:", { planId, cycle });

  // Check authentication
  if (!authStore.isAuthenticated) {
    router.push({
      name: "login",
      query: {
        plan: planId,
        billing: cycle,
        redirect: "/checkout",
      },
    });
    return;
  }

  // Redirect to checkout page with credit card form
  router.push({
    name: "checkout",
    query: {
      plan: planId,
      billing: cycle,
      method: "card",
    },
  });
};

const handlePayPalPayment = async (planId: string, cycle: BillingCycle) => {
  console.log("PayPal payment selected:", { planId, cycle });

  // Check authentication
  if (!authStore.isAuthenticated) {
    router.push({
      name: "login",
      query: {
        plan: planId,
        billing: cycle,
        redirect: "/checkout",
        method: "paypal",
      },
    });
    return;
  }

  isProcessingPayment.value = true;

  try {
    // Create PayPal order
    const response = await fetch("/api/payments/paypal/create-order", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        planType: planId.toUpperCase(),
        currency: "USD",
        billingCycle: cycle,
      }),
    });

    const data = await response.json();

    if (data.success && data.orderID) {
      // Redirect to PayPal for approval
      window.location.href = `https://www.sandbox.paypal.com/checkoutnow?token=${data.orderID}`;
    } else {
      throw new Error(data.error || "Failed to create PayPal order");
    }
  } catch (error) {
    console.error("PayPal payment error:", error);
    alert("Failed to initiate PayPal payment. Please try again.");
  } finally {
    isProcessingPayment.value = false;
  }
};

defineOptions({
  name: "ModernPricingPage",
});
</script>

<template>
  <div class="modern-pricing-page">
    <!-- Header Section -->
    <div class="modern-pricing-page__header">
      <div class="modern-pricing-page__container">
        <h1 class="modern-pricing-page__title">
          Choose Your Perfect Plan
        </h1>
        <p class="modern-pricing-page__subtitle">
          Unlock advanced features and accelerate your learning
        </p>
      </div>
    </div>

    <!-- Billing Toggle -->
    <div class="modern-pricing-page__toggle-section">
      <div class="modern-pricing-page__container">
        <div class="modern-pricing-page__toggle-wrapper">
          <!-- Monthly/Annual Toggle -->
          <button
            type="button"
            class="modern-pricing-page__toggle"
            :class="{ 'modern-pricing-page__toggle--active': billingCycle === 'monthly' }"
            @click="billingCycle = 'monthly'"
          >
            MONTHLY BILLING
          </button>

          <!-- Toggle Switch -->
          <div
            class="modern-pricing-page__switch"
            role="switch"
            :aria-checked="billingCycle === 'yearly'"
            tabindex="0"
            @click="toggleBillingCycle"
            @keydown.space.prevent="toggleBillingCycle"
            @keydown.enter.prevent="toggleBillingCycle"
          >
            <div
              class="modern-pricing-page__switch-thumb"
              :class="{ 'modern-pricing-page__switch-thumb--yearly': billingCycle === 'yearly' }"
            ></div>
          </div>

          <button
            type="button"
            class="modern-pricing-page__toggle"
            :class="{ 'modern-pricing-page__toggle--active': billingCycle === 'yearly' }"
            @click="billingCycle = 'yearly'"
          >
            ANNUAL BILLING
          </button>
        </div>

        <!-- Savings Message -->
        <p v-if="billingCycle === 'yearly'" class="modern-pricing-page__savings-message">
          Choose <strong>annual billing</strong> and get <strong>over 2 months free</strong> every year.
        </p>
      </div>
    </div>

    <!-- Pricing Cards -->
    <div class="modern-pricing-page__cards-section">
      <div class="modern-pricing-page__container">
        <div class="modern-pricing-page__cards-grid">
          <ModernPricingCard
            v-for="plan in pricingPlans"
            :key="plan.id"
            :plan-id="plan.id"
            :plan-name="plan.name"
            :price-monthly="plan.priceMonthly"
            :price-yearly="plan.priceYearly"
            :billing-cycle="billingCycle"
            :features="plan.features"
            :popular="plan.popular"
            @select-credit-card="handleCreditCardPayment"
            @select-paypal="handlePayPalPayment"
          />
        </div>
      </div>
    </div>

    <!-- Loading Overlay -->
    <div v-if="isProcessingPayment" class="modern-pricing-page__loading-overlay">
      <div class="modern-pricing-page__loading-spinner">
        <svg
          class="modern-pricing-page__spinner"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
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
        <p class="modern-pricing-page__loading-text">
          Redirecting to PayPal...
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.modern-pricing-page {
  @apply min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50;
  @apply py-16;
}

/* Header */
.modern-pricing-page__header {
  @apply mb-12 text-center;
}

.modern-pricing-page__container {
  @apply mx-auto max-w-7xl px-4 sm:px-6 lg:px-8;
}

.modern-pricing-page__title {
  @apply mb-4 text-4xl font-bold text-gray-900;
  @apply sm:text-5xl;
  letter-spacing: -0.02em;
}

.modern-pricing-page__subtitle {
  @apply text-xl text-gray-600;
}

/* Billing Toggle */
.modern-pricing-page__toggle-section {
  @apply mb-16;
}

.modern-pricing-page__toggle-wrapper {
  @apply flex items-center justify-center gap-4;
  @apply mb-4;
}

.modern-pricing-page__toggle {
  @apply px-6 py-2 text-sm font-bold tracking-wider;
  @apply text-gray-600 transition-colors duration-200;
  @apply hover:text-gray-900;
}

.modern-pricing-page__toggle--active {
  @apply text-gray-900;
}

.modern-pricing-page__switch {
  @apply relative inline-flex h-10 w-20 cursor-pointer items-center;
  @apply rounded-full bg-gray-900 transition-colors duration-300;
  @apply focus:outline-none focus:ring-4 focus:ring-blue-300;
}

.modern-pricing-page__switch-thumb {
  @apply h-8 w-8 transform rounded-full bg-white shadow-lg;
  @apply transition-transform duration-300 ease-in-out;
  @apply ml-1;
}

.modern-pricing-page__switch-thumb--yearly {
  @apply translate-x-10;
}

.modern-pricing-page__savings-message {
  @apply text-center text-base text-gray-700;
}

.modern-pricing-page__savings-message strong {
  @apply font-bold text-gray-900;
}

/* Cards Grid */
.modern-pricing-page__cards-section {
  @apply mb-16;
}

.modern-pricing-page__cards-grid {
  @apply grid grid-cols-1 gap-8;
  @apply lg:grid-cols-2;
  @apply items-start justify-center;
}

/* Loading Overlay */
.modern-pricing-page__loading-overlay {
  @apply fixed inset-0 z-50 flex items-center justify-center;
  @apply bg-black bg-opacity-50 backdrop-blur-sm;
}

.modern-pricing-page__loading-spinner {
  @apply flex flex-col items-center gap-4;
  @apply rounded-2xl bg-white p-8 shadow-2xl;
}

.modern-pricing-page__spinner {
  @apply h-12 w-12 animate-spin text-blue-600;
}

.modern-pricing-page__loading-text {
  @apply text-lg font-medium text-gray-900;
}

/* RTL Support */
[dir="rtl"] .modern-pricing-page__toggle-wrapper {
  @apply flex-row-reverse;
}

[dir="rtl"] .modern-pricing-page__switch-thumb {
  @apply ml-0 mr-1;
}

[dir="rtl"] .modern-pricing-page__switch-thumb--yearly {
  @apply -translate-x-10;
}

/* Responsive */
@media (max-width: 1024px) {
  .modern-pricing-page__cards-grid {
    @apply max-w-2xl mx-auto;
  }
}

@media (max-width: 640px) {
  .modern-pricing-page__title {
    @apply text-3xl;
  }

  .modern-pricing-page__subtitle {
    @apply text-lg;
  }

  .modern-pricing-page__toggle {
    @apply px-3 py-1 text-xs;
  }
}
</style>
