<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useI18n } from "vue-i18n";
import { usePlans } from "@/composables/usePlans";
import { usePricingRoute } from "@/composables/usePricingRoute";
import { useAnalytics } from "@/composables/useAnalytics";
import { useCheckout } from "@/composables/useCheckout";
import PlanCard from "@/components/pricing/PlanCard.vue";
import PaymentCheckoutModal from "@/components/marketing/PaymentCheckoutModal.vue";
import type { BillingCycle, PlanId } from "@/types/pricing";

const router = useRouter();
const route = useRoute();
const { t } = useI18n();
const { pricingPlans } = usePlans();
const { resolvedPlan, redirectToCanonical } = usePricingRoute();
const { track } = useAnalytics();
const { selectPlan: selectCheckoutPlan } = useCheckout();

const billingCycle = ref<BillingCycle>("monthly");
const selectedPlan = ref<PlanId | null>(null);
const showCheckoutModal = ref(false);
const checkoutPlanId = ref<PlanId | undefined>(undefined);
const checkoutBilling = ref<BillingCycle>("monthly");

// Computed
const currentLocale = computed(() => (route.params.locale as string) || "en");

const savingsPercent = computed(() => {
  // Calculate average savings across paid plans
  const paidPlans = pricingPlans.value.filter((p) => p.priceMonthly > 0);
  if (paidPlans.length === 0) return 0;

  const totalSavings = paidPlans.reduce((sum, plan) => {
    const monthlyCost = plan.priceMonthly * 12;
    const savings = monthlyCost - plan.priceYearly;
    return sum + (savings / monthlyCost) * 100;
  }, 0);

  return Math.round(totalSavings / paidPlans.length);
});

// Methods
const toggleBilling = (cycle: BillingCycle) => {
  const previousCycle = billingCycle.value;
  billingCycle.value = cycle;

  track("billing_cycle_toggled", {
    from: previousCycle,
    to: cycle,
  });
};

const handlePlanSelect = (planId: PlanId, billing: BillingCycle) => {
  selectedPlan.value = planId;

  track("plan_card_clicked", {
    plan: planId,
    billing,
    source: "pricing_page",
    locale: currentLocale.value,
    rtl: currentLocale.value === "ar",
  });

  if (planId === "junior") {
    // Free plan - go directly to registration
    router.push({
      path: `/${currentLocale.value}/auth/register`,
    });
  } else {
    // Paid plans - open embedded checkout modal
    checkoutPlanId.value = planId;
    checkoutBilling.value = billing;

    // Convert PlanId to PlanTier for checkout
    const plan = pricingPlans.value.find((p) => p.id === planId);
    if (plan) {
      // Pre-select plan in checkout composable using the backend tier
      selectCheckoutPlan(plan.tier, billing);

      // Show modal
      showCheckoutModal.value = true;
    }
  }
};

const handleCheckoutClose = () => {
  showCheckoutModal.value = false;

  track("checkout_modal_closed", {
    plan: checkoutPlanId.value,
    billing: checkoutBilling.value,
  });
};

const handleCheckoutSuccess = (subscriptionId: string) => {
  showCheckoutModal.value = false;

  track("checkout_completed_modal", {
    plan: checkoutPlanId.value,
    billing: checkoutBilling.value,
    subscriptionId,
  });

  // Redirect to success page
  router.push({
    path: `/${currentLocale.value}/subscribe/success`,
    query: { subscription: subscriptionId },
  });
};

// Lifecycle
onMounted(() => {
  // Redirect legacy URLs
  redirectToCanonical();

  // Pre-select from query params
  if (resolvedPlan.value) {
    selectedPlan.value = resolvedPlan.value.planId;
    billingCycle.value = resolvedPlan.value.billing;
  }
});

defineOptions({
  name: "PricingCards",
});
</script>

<template>
  <div class="pricing-cards">
    <!-- Billing toggle -->
    <div class="pricing-cards__toggle-section">
      <div class="pricing-cards__toggle-wrapper">
        <button
          type="button"
          class="pricing-cards__toggle-btn"
          :class="{ 'pricing-cards__toggle-btn--active': billingCycle === 'monthly' }"
          @click="toggleBilling('monthly')"
          data-testid="toggle-monthly"
          :aria-pressed="billingCycle === 'monthly'"
        >
          {{ t("pricing.billing?.monthly") }}
        </button>

        <button
          type="button"
          class="pricing-cards__toggle-btn"
          :class="{ 'pricing-cards__toggle-btn--active': billingCycle === 'annual' }"
          @click="toggleBilling('annual')"
          data-testid="toggle-annual"
          :aria-pressed="billingCycle === 'annual'"
        >
          {{ t("pricing.billing?.yearly") }}

          <span v-if="savingsPercent > 0" class="pricing-cards__toggle-badge">
            {{ t("pricing.billing?.savePercent", { percent: savingsPercent }) }}
          </span>
        </button>
      </div>

      <!-- Savings message -->
      <p v-if="billingCycle === 'annual'" class="pricing-cards__savings-message">
        {{ t("pricing.billing?.savingsMessage") }}
      </p>
    </div>

    <!-- Cards grid -->
    <div class="pricing-cards__grid" :class="{ 'pricing-cards__grid--rtl': $i18n.locale === 'ar' }">
      <PlanCard
        v-for="plan in pricingPlans"
        :key="plan.id"
        :plan="plan"
        :billing="billingCycle"
        :featured="plan.metadata.featured"
        :selected="selectedPlan === plan.id"
        :show-social-proof="plan.id === 'intermediate'"
        @select="handlePlanSelect"
      />
    </div>

    <!-- Social Proof Banner -->
    <div class="pricing-cards__social-proof">
      <div class="pricing-cards__social-proof-content">
        <div class="pricing-cards__social-proof-stats">
          <div class="pricing-cards__social-proof-stat">
            <span class="pricing-cards__social-proof-number">2,500+</span>
            <span class="pricing-cards__social-proof-label"
              >{{
                t("pricing.socialProof?.recentPurchases", {
                  count: "2,500",
                })
              }}
            </span>
          </div>
          <div class="pricing-cards__social-proof-stat">
            <span class="pricing-cards__social-proof-number">150+</span>
            <span class="pricing-cards__social-proof-label"
              >{{ t("pricing.socialProof?.liveCounter", { count: "150" }) }}
            </span>
          </div>
          <div class="pricing-cards__social-proof-stat">
            <span class="pricing-cards__social-proof-number">4.9★</span>
            <span class="pricing-cards__social-proof-label"
              >{{
                t("pricing.socialProof?.rating", {
                  rating: "4.9",
                  count: "500",
                })
              }}
            </span>
          </div>
        </div>
        <div class="pricing-cards__social-proof-badges">
          <div class="pricing-cards__social-proof-badge">
            <svg class="pricing-cards__social-proof-icon" fill="currentColor" viewBox="0 0 20 20">
              <path
                fill-rule="evenodd"
                d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                clip-rule="evenodd"
              />
            </svg>
            <span>{{ t("pricing.trust?.secure") }} </span>
          </div>
          <div class="pricing-cards__social-proof-badge">
            <svg class="pricing-cards__social-proof-icon" fill="currentColor" viewBox="0 0 20 20">
              <path
                fill-rule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clip-rule="evenodd"
              />
            </svg>
            <span>{{ t("pricing.trust?.moneyBack") }} </span>
          </div>
          <div class="pricing-cards__social-proof-badge">
            <svg class="pricing-cards__social-proof-icon" fill="currentColor" viewBox="0 0 20 20">
              <path
                fill-rule="evenodd"
                d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                clip-rule="evenodd"
              />
            </svg>
            <span>{{ t("pricing.trust?.cancel") }} </span>
          </div>
        </div>
      </div>
      <div class="pricing-cards__social-proof-content">
        <svg
          class="pricing-cards__social-proof-icon"
          fill="currentColor"
          viewBox="0 0 20 20"
          aria-hidden="true"
        >
          <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
        </svg>
        <span class="pricing-cards__social-proof-text">
          {{ t("pricing.socialProof?.trust") }}
        </span>
      </div>
    </div>

    <!-- Trust badges -->
    <div class="pricing-cards__trust-section">
      <div class="pricing-cards__trust-items">
        <div class="pricing-cards__trust-item">
          <svg
            class="pricing-cards__trust-icon"
            fill="currentColor"
            viewBox="0 0 20 20"
            aria-hidden="true"
          >
            <path
              fill-rule="evenodd"
              d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clip-rule="evenodd"
            />
          </svg>
          <span>{{ t("pricing.trust?.secure") }} </span>
        </div>
        <div class="pricing-cards__trust-item">
          <svg
            class="pricing-cards__trust-icon"
            fill="currentColor"
            viewBox="0 0 20 20"
            aria-hidden="true"
          >
            <path
              d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z"
            />
            <path
              fill-rule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z"
              clip-rule="evenodd"
            />
          </svg>
          <span>{{ t("pricing.trust?.moneyBack") }} </span>
        </div>
        <div class="pricing-cards__trust-item">
          <svg
            class="pricing-cards__trust-icon"
            fill="currentColor"
            viewBox="0 0 20 20"
            aria-hidden="true"
          >
            <path
              fill-rule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 100-2 1 1 0 000 2zm7-1a1 1 0 11-2 0 1 1 0 012 0zm-.464 5.535a1 1 0 10-1.415-1.414 3 3 0 01-4.242 0 1 1 0 00-1.415 1.414 5 5 0 007.072 0z"
              clip-rule="evenodd"
            />
          </svg>
          <span>{{ t("pricing.trust?.cancel") }} </span>
        </div>
      </div>
    </div>

    <!-- Checkout Modal -->
    <PaymentCheckoutModal
      :show="showCheckoutModal"
      :plan-id="checkoutPlanId"
      :billing="checkoutBilling"
      @close="handleCheckoutClose"
      @success="handleCheckoutSuccess"
    />
  </div>
</template>

<style scoped>
.pricing-cards {
  @apply w-full;
}

.pricing-cards__grid {
  @apply mb-12 grid grid-cols-1 gap-6;
  @apply sm:grid-cols-2;
  @apply lg:grid-cols-4;
}

.pricing-cards__grid--rtl {
  direction: rtl;
}

/* Billing toggle section */
.pricing-cards__toggle-section {
  @apply mb-10 text-center;
}

.pricing-cards__toggle-wrapper {
  @apply inline-flex items-center gap-2 rounded-2xl p-2;
  @apply bg-gradient-to-r from-gray-100 to-gray-50 dark:from-gray-800 dark:to-gray-900;
  @apply shadow-lg shadow-gray-200/50 dark:shadow-gray-900/50;
  @apply border border-gray-200 dark:border-gray-700;
}

.pricing-cards__toggle-btn {
  @apply rounded-xl px-8 py-4 text-base font-bold;
  @apply text-gray-600 dark:text-gray-400;
  @apply transition-all duration-300;
  @apply hover:text-gray-900 dark:hover:text-white;
  @apply focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:ring-offset-2;
  @apply flex items-center gap-2;
  @apply min-w-[160px] justify-center;
}

.pricing-cards__toggle-btn--active {
  @apply bg-gradient-to-r from-blue-600 to-purple-600;
  @apply text-white;
  @apply shadow-xl shadow-blue-500/30;
  @apply scale-105;
}

.pricing-cards__toggle-badge {
  @apply rounded-full px-2.5 py-1 text-[10px];
  @apply bg-green-400 dark:bg-green-500;
  @apply text-white;
  @apply font-extrabold uppercase tracking-wider;
  @apply shadow-sm;
  @apply animate-pulse;
}

.pricing-cards__savings-message {
  @apply mt-6 text-base font-bold text-green-600 dark:text-green-400;
  @apply animate-fade-in;
  @apply flex items-center justify-center gap-2;
}

.pricing-cards__savings-message::before {
  content: "🎉";

  @apply text-xl;
}

/* Cards grid - optimized for 3 paid plans */
.pricing-cards__grid {
  @apply grid grid-cols-1 gap-6;
  @apply md:grid-cols-3;
  @apply lg:gap-8;
  @apply xl:gap-10;
  @apply mb-10;
  @apply items-stretch;
}

/* For exactly 3 items, use optimal spacing */
.pricing-cards__grid > * {
  @apply mx-auto w-full max-w-lg;
  @apply md:max-w-none;
}

/* Social Proof Banner */
.pricing-cards__social-proof {
  @apply mb-4 mt-8;
  @apply flex justify-center;
}

.pricing-cards__social-proof-content {
  @apply inline-flex items-center gap-2;
  @apply rounded-full px-6 py-3;
  @apply bg-gradient-to-r from-green-50 to-emerald-50;
  @apply dark:from-green-900/20 dark:to-emerald-900/20;
  @apply border-2 border-green-200 dark:border-green-800;
  @apply shadow-lg;
}

.pricing-cards__social-proof-icon {
  @apply h-5 w-5 text-green-600 dark:text-green-400;
}

.pricing-cards__social-proof-text {
  @apply text-sm font-semibold text-green-700 dark:text-green-300;
}

.pricing-cards__social-proof-stats {
  @apply flex items-center gap-8;
}

.pricing-cards__social-proof-stat {
  @apply text-center;
}

.pricing-cards__social-proof-number {
  @apply block text-lg font-bold text-gray-900 dark:text-white;
}

.pricing-cards__social-proof-label {
  @apply block text-xs text-gray-600 dark:text-gray-400;
}

.pricing-cards__social-proof-badges {
  @apply flex items-center gap-4;
}

.pricing-cards__social-proof-badge {
  @apply flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400;
}

/* Trust section */
.pricing-cards__trust-section {
  @apply border-t-2 border-gray-200 pt-8 dark:border-gray-700;
  @apply bg-gray-50 dark:bg-gray-900/50;
  @apply -mx-4 rounded-lg px-4 py-6;
}

.pricing-cards__trust-items {
  @apply flex flex-wrap items-center justify-center gap-8;
  @apply lg:gap-16;
}

.pricing-cards__trust-item {
  @apply flex items-center gap-3;
  @apply text-sm font-medium text-gray-700 dark:text-gray-300;
  @apply transition-colors hover:text-green-600 dark:hover:text-green-400;
}

.pricing-cards__trust-icon {
  @apply h-6 w-6 text-green-500;
  @apply drop-shadow-sm;
}

/* Animations */
@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(-4px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in {
  animation: fade-in 0.3s ease-out;
}

/* RTL Support */
[dir="rtl"] .pricing-cards__toggle-wrapper {
  @apply flex-row-reverse;
}

[dir="rtl"] .pricing-cards__toggle-btn {
  @apply flex-row-reverse;
}

[dir="rtl"] .pricing-cards__trust-item {
  @apply flex-row-reverse;
}

/* Responsive */
@media (width <= 768px) {
  .pricing-cards__grid {
    @apply gap-6;
  }

  .pricing-cards__grid > * {
    @apply max-w-xl;
  }

  .pricing-cards__trust-section {
    @apply -mx-0 px-0;
  }
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  .pricing-cards__toggle-btn,
  .animate-fade-in {
    @apply transition-none;

    animation: none;
  }
}
</style>
