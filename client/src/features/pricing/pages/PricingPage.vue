<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { usePaymentStore } from "@/stores/payment";
import { useAuthStore } from "@/stores/auth";

// Components
import PricingHero from "@/components/pricing/PricingHero.vue";
import BillingToggle from "@/components/pricing/BillingToggle.vue";
import PlanCard from "@/components/pricing/PlanCard.vue";
import FeatureGrid from "@/components/pricing/FeatureGrid.vue";
import ComparisonTable from "@/components/pricing/ComparisonTable.vue";
import FaqAccordion from "@/components/pricing/FaqAccordion.vue";
import GuaranteePanel from "@/components/pricing/GuaranteePanel.vue";
import FinalCta from "@/components/pricing/FinalCta.vue";

// Config
import { plans } from "@/components/pricing/pricing.config";
import type { Plan, BillingCycle } from "@/components/pricing/pricing.config";

const router = useRouter();
const paymentStore = usePaymentStore();
const authStore = useAuthStore();

// State
const billingCycle = ref<BillingCycle>("monthly");

// Computed
const popularPlan = computed(() => {
  return plans.find((plan) => plan.popular) || plans[1]; // Fallback to intermediate
});

// Methods
const handlePlanSelection = async (plan: Plan) => {
  // Track analytics
  trackAnalytics("plan_selected", {
    plan_id: plan.id,
    billing_cycle: billingCycle.value,
    plan_tier: plan.tier,
  });

  if (plan.tier === "JUNIOR") {
    // Free plan - redirect to register
    if (!authStore.isAuthenticated) {
      router.push("/auth/register");
    } else {
      router.push("/dashboard");
    }
    return;
  }

  // Paid plans - check authentication
  if (!authStore.isAuthenticated) {
    router.push({
      name: "login",
      query: {
        plan: plan.id,
        billing: billingCycle.value,
        redirect: "/checkout",
      },
    });
    return;
  }

  try {
    const paymentRequest = {
      planType: plan.tier as "INTERMEDIATE" | "SENIOR" | "BUNDLE",
      currency: paymentStore.currentCurrency,
      billingCycle: billingCycle.value,
    };

    const response = await paymentStore.createPayment(paymentRequest);

    // Redirect to payment gateway
    window.location.href = response.checkoutUrl;
  } catch (error) {
    console.error("Failed to create payment:", error);
    // Handle error - could show notification
  }
};

const handleFinalCta = () => {
  trackAnalytics("final_cta_clicked", {
    billing_cycle: billingCycle.value,
  });

  router.push("/auth/register");
};

const handleStickyCta = () => {
  trackAnalytics("sticky_cta_clicked", {
    billing_cycle: billingCycle.value,
  });

  const plan = popularPlan.value;
  if (plan) {
    handlePlanSelection(plan);
  }
};

const getStickyPrice = () => {
  const plan = popularPlan.value;
  if (!plan) return "0";
  if (plan.priceMonthly === 0) return "0";

  const price = billingCycle.value === "yearly" ? plan.priceYearly : plan.priceMonthly;
  return price.toString();
};

const trackAnalytics = (event: string, properties: Record<string, any>) => {
  // Track with your analytics service
  console.log("Analytics:", event, properties);
};

// Lifecycle
onMounted(() => {
  // Track page view
  trackAnalytics("pricing_page_viewed", {
    billing_cycle: billingCycle.value,
  });
});

defineOptions({
  name: "PricingPage",
});
</script>

<template>
  <div class="pricing-page" role="main" aria-labelledby="pricing-page-title">
    <!-- Skip to main content for accessibility -->
    <a
      href="#main-content"
      class="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-blue-600 focus:px-4 focus:py-2 focus:text-white"
    >
      {{ $t("a11y.skipToMain") }}
    </a>

    <!-- Hero Section -->
    <PricingHero />

    <!-- Billing Toggle -->
    <div class="pricing-page-billing">
      <div class="pricing-page-billing-container">
        <BillingToggle v-model="billingCycle" />
      </div>
    </div>

    <!-- Plan Cards -->
    <section id="main-content" class="pricing-page-plans" aria-labelledby="plans-title">
      <div class="pricing-page-plans-container">
        <h2 id="plans-title" class="sr-only">
          {{ $t("pricing.plans.title") }}
        </h2>

        <div class="pricing-page-plans-grid">
          <PlanCard
            v-for="plan in plans"
            :key="plan.id"
            :plan="plan"
            :billing="billingCycle"
            @select-plan="handlePlanSelection"
          />
        </div>
      </div>
    </section>

    <!-- Feature Highlights -->
    <FeatureGrid />

    <!-- Comparison Table -->
    <ComparisonTable />

    <!-- FAQ Section -->
    <FaqAccordion />

    <!-- Guarantee Panel -->
    <GuaranteePanel />

    <!-- Final CTA -->
    <FinalCta @cta-click="handleFinalCta" />

    <!-- Sticky CTA for Mobile -->
    <div class="pricing-page-sticky-cta lg:hidden">
      <div class="pricing-page-sticky-content">
        <div class="pricing-page-sticky-text">
          <span class="pricing-page-sticky-title">
            {{ $t("pricing.sticky.title") }}
          </span>
          <span class="pricing-page-sticky-price">
            {{ $t("pricing.sticky.price", { price: getStickyPrice() }) }}
          </span>
        </div>
        <button @click="handleStickyCta" class="pricing-page-sticky-button">
          {{ $t("pricing.sticky.cta") }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.pricing-page {
  @apply min-h-screen bg-white;
}

.pricing-page-billing {
  @apply bg-white py-8;
}

.pricing-page-billing-container {
  @apply mx-auto max-w-7xl px-4 sm:px-6 lg:px-8;
}

.pricing-page-plans {
  @apply bg-white py-16 lg:py-24;
}

.pricing-page-plans-container {
  @apply mx-auto max-w-7xl px-4 sm:px-6 lg:px-8;
}

.pricing-page-plans-grid {
  @apply grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4;
}

.pricing-page-sticky-cta {
  @apply fixed bottom-0 left-0 right-0 z-50 border-t border-gray-200 bg-white shadow-lg;
}

.pricing-page-sticky-content {
  @apply flex items-center justify-between px-4 py-4;
}

.pricing-page-sticky-text {
  @apply flex flex-col;
}

.pricing-page-sticky-title {
  @apply text-sm font-medium text-gray-900;
}

.pricing-page-sticky-price {
  @apply text-lg font-bold text-blue-600;
}

.pricing-page-sticky-button {
  @apply rounded-lg bg-blue-600 px-6 py-3 font-medium text-white transition-colors duration-200;
  @apply hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2;
}

/* Screen reader only class */
.sr-only {
  @apply absolute -m-px h-px w-px overflow-hidden whitespace-nowrap border-0 p-0;
}

.focus\:not-sr-only:focus {
  @apply static m-0 h-auto w-auto overflow-visible whitespace-normal border p-2;
}

/* RTL Support */
[dir="rtl"] .pricing-page-sticky-content {
  @apply flex-row-reverse;
}

[dir="rtl"] .pricing-page-sticky-text {
  @apply text-right;
}
</style>
