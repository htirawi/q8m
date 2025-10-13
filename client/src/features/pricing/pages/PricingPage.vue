<script setup lang="ts">
import { onMounted } from "vue";

// Components
import PricingHero from "@/components/pricing/PricingHero.vue";
import PricingCards from "@/components/pricing/PricingCards.vue";
import FeatureGrid from "@/components/pricing/FeatureGrid.vue";
import ComparisonTable from "@/components/pricing/ComparisonTable.vue";
import FaqAccordion from "@/components/pricing/FaqAccordion.vue";
import GuaranteePanel from "@/components/pricing/GuaranteePanel.vue";
import FinalCta from "@/components/pricing/FinalCta.vue";

const trackAnalytics = (event: string, properties: Record<string, unknown>) => {
  // Track with your analytics service
  console.log("Analytics:", event, properties);
};

// Lifecycle
onMounted(() => {
  // Track page view
  trackAnalytics("pricing_page_viewed", {
    route: "subscribe",
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

    <!-- Pricing Cards Section (uses canonical registry) -->
    <section id="main-content" class="pricing-page-cards" aria-labelledby="plans-title">
      <div class="pricing-page-cards-container">
        <h2 id="plans-title" class="sr-only">
          {{ $t("pricing.plans.title") }}
        </h2>
        <PricingCards />
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
    <FinalCta />
  </div>
</template>

<style scoped>
.pricing-page {
  @apply min-h-screen bg-white dark:bg-gray-900;
}

.pricing-page-cards {
  @apply bg-white dark:bg-gray-900 py-16 lg:py-24;
}

.pricing-page-cards-container {
  @apply mx-auto max-w-7xl px-4 sm:px-6 lg:px-8;
}

/* Screen reader only class */
.sr-only {
  @apply absolute -m-px h-px w-px overflow-hidden whitespace-nowrap border-0 p-0;
}

.focus\:not-sr-only:focus {
  @apply static m-0 h-auto w-auto overflow-visible whitespace-normal border p-2;
}
</style>
