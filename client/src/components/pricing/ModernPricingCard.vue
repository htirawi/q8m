<script setup lang="ts">
import type { IModernPricingCardProps } from "@/types/components/pricing";
import { ref, computed } from "vue";
import { CheckIcon } from "@heroicons/vue/24/solid";
import type { BillingCycle } from "@/components/pricing/pricing.config";

const props = withDefaults(defineProps<IModernPricingCardProps>(), {
  currency: "USD",
  popular: false,
});

const emit = defineEmits<{
  "select-paypal": [planId: string, billingCycle: BillingCycle];
}>();

// State
const isPayPalLoading = ref(false);

// Computed
const displayPrice = computed(() => {
  return props.billingCycle === "annual" ? props.priceYearly : props.priceMonthly;
});

const billingText = computed(() => {
  return props.billingCycle === "annual" ? "billed annually" : "billed monthly";
});

const savingsText = computed(() => {
  if (props.billingCycle === "annual" && props.priceMonthly > 0) {
    const monthlyTotal = props.priceMonthly * 12;
    const yearlyTotal = props.priceYearly;
    const savings = monthlyTotal - yearlyTotal;
    const monthsSaved = Math.round(savings / props.priceMonthly);
    return `Save ${monthsSaved}+ months`;
  }
  return null;
});

// Methods
const handleCreditCardClick = () => {
  emit("select-credit-card", props.planId, props.billingCycle);
};

const handlePayPalClick = async () => {
  isPayPalLoading.value = true;
  try {
    emit("select-paypal", props.planId, props.billingCycle);
  } finally {
    // Keep loading state until PayPal SDK handles it
    setTimeout(() => {
      isPayPalLoading.value = false;
    }, 1000);
  }
};

defineOptions({
  name: "ModernPricingCard",
});
</script>

<template>
  <div class="modern-pricing-card" :class="{ 'modern-pricing-card--popular': popular }">
    <!-- Popular IBadge -->
    <div v-if="popular" class="modern-pricing-card__badge">Most Popular</div>

    <!-- Plan Header -->
    <div class="modern-pricing-card__header">
      <h3 class="modern-pricing-card__title">{{ planName }}</h3>

      <!-- Price Display -->
      <div class="modern-pricing-card__price-section">
        <div class="modern-pricing-card__price">
          <span class="modern-pricing-card__currency">$</span>
          <span class="modern-pricing-card__amount">{{ displayPrice }} </span>
        </div>
        <p class="modern-pricing-card__billing">{{ billingText }}</p>
        <p v-if="savingsText" class="modern-pricing-card__savings">
          {{ savingsText }}
        </p>
      </div>
    </div>

    <!-- Payment Buttons -->
    <div class="modern-pricing-card__payment-buttons">
      <!-- Credit Card Button -->
      <button
        type="button"
        class="modern-pricing-card__button modern-pricing-card__button--credit"
        @click="handleCreditCardClick"
      >
        <svg
          class="modern-pricing-card__button-icon"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
          />
        </svg>
        <span>Debit or Credit Card</span>
      </button>

      <!-- PayPal Button -->
      <button
        type="button"
        class="modern-pricing-card__button modern-pricing-card__button--paypal"
        :disabled="isPayPalLoading"
        @click="handlePayPalClick"
      >
        <svg
          v-if="isPayPalLoading"
          class="modern-pricing-card__spinner"
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
        <span v-else class="modern-pricing-card__paypal-logo">
          Pay<span class="modern-pricing-card__paypal-pal">Pal</span>
        </span>
        <span v-if="!isPayPalLoading">Subscribe</span>
      </button>
    </div>

    <!-- Features List -->
    <ul class="modern-pricing-card__features" role="list">
      <li v-for="(feature, index) in features" :key="index" class="modern-pricing-card__feature">
        <CheckIcon class="modern-pricing-card__check-icon" aria-hidden="true" />
        <span>{{ feature }} </span>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.modern-pricing-card {
  @apply relative w-full max-w-md rounded-3xl bg-white p-10 shadow-xl;
  @apply border border-gray-100;
  @apply transition-all duration-300 hover:shadow-2xl;
}

.modern-pricing-card--popular {
  @apply border-2 border-blue-500;
  @apply ring-4 ring-blue-100;
}

.modern-pricing-card__badge {
  @apply absolute -top-4 left-1/2 -translate-x-1/2;
  @apply rounded-full bg-gradient-to-r from-blue-500 to-purple-600;
  @apply px-6 py-2 text-sm font-semibold text-white shadow-lg;
}

/* Header */
.modern-pricing-card__header {
  @apply mb-8 text-center;
}

.modern-pricing-card__title {
  @apply mb-6 text-2xl font-bold text-gray-900;

  letter-spacing: -0.02em;
}

/* Price Section */
.modern-pricing-card__price-section {
  @apply flex flex-col items-center;
}

.modern-pricing-card__price {
  @apply flex items-baseline justify-center;
}

.modern-pricing-card__currency {
  @apply mr-1 text-4xl font-bold text-gray-900;
}

.modern-pricing-card__amount {
  @apply text-6xl font-bold text-gray-900;

  letter-spacing: -0.03em;
}

.modern-pricing-card__billing {
  @apply mt-2 text-base text-gray-600;
}

.modern-pricing-card__savings {
  @apply mt-1 text-sm font-medium text-green-600;
}

/* Payment Buttons */
.modern-pricing-card__payment-buttons {
  @apply mt-8 flex flex-col gap-3;
}

.modern-pricing-card__button {
  @apply flex w-full items-center justify-center gap-3;
  @apply rounded-xl px-6 py-4 font-semibold;
  @apply transition-all duration-200;
  @apply focus:outline-none focus:ring-4;
  @apply disabled:cursor-not-allowed disabled:opacity-60;
}

.modern-pricing-card__button-icon {
  @apply h-6 w-6;
}

.modern-pricing-card__button--credit {
  @apply bg-gray-900 text-white;
  @apply hover:bg-gray-800;
  @apply focus:ring-gray-300;
}

.modern-pricing-card__button--paypal {
  @apply bg-[#FFC439] text-[#003087];
  @apply hover:bg-[#FFD966];
  @apply focus:ring-yellow-300;
}

.modern-pricing-card__paypal-logo {
  @apply text-lg font-bold;
}

.modern-pricing-card__paypal-pal {
  @apply text-[#009CDE];
}

.modern-pricing-card__spinner {
  @apply h-5 w-5 animate-spin;
}

/* Features List */
.modern-pricing-card__features {
  @apply mt-8 space-y-4;
}

.modern-pricing-card__feature {
  @apply flex items-start gap-3 text-left;
}

.modern-pricing-card__check-icon {
  @apply mt-0.5 h-6 w-6 flex-shrink-0 rounded-full;
  @apply bg-teal-500 p-1 text-white;
}

.modern-pricing-card__feature span {
  @apply text-base font-medium text-gray-700;
}

/* RTL Support */
[dir="rtl"] .modern-pricing-card__badge {
  @apply left-auto right-1/2 translate-x-1/2;
}

[dir="rtl"] .modern-pricing-card__currency {
  @apply ml-1 mr-0;
}

[dir="rtl"] .modern-pricing-card__feature {
  @apply flex-row-reverse text-right;
}

[dir="rtl"] .modern-pricing-card__button {
  @apply flex-row-reverse;
}

/* Dark Mode Support */
@media (prefers-color-scheme: dark) {
  .modern-pricing-card {
    @apply border-slate-700 bg-slate-800;
  }

  .modern-pricing-card__title,
  .modern-pricing-card__currency,
  .modern-pricing-card__amount {
    @apply text-white;
  }

  .modern-pricing-card__billing {
    @apply text-slate-300;
  }

  .modern-pricing-card__feature span {
    @apply text-slate-200;
  }

  .modern-pricing-card__button--credit {
    @apply bg-slate-700 hover:bg-slate-600;
  }
}
</style>
