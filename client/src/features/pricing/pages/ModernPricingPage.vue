<script setup lang="ts">
import PricingCards from "@/components/pricing/PricingCards.vue";
import PricingTestimonials from "@/components/pricing/PricingTestimonials.vue";
import RoiSection from "@/components/pricing/RoiSection.vue";
import CompetitorComparison from "@/components/pricing/CompetitorComparison.vue";
import ComparisonTable from "@/components/pricing/ComparisonTable.vue";
import FaqAccordion from "@/components/pricing/FaqAccordion.vue";
import GuaranteePanel from "@/components/pricing/GuaranteePanel.vue";
import FinalCta from "@/components/pricing/FinalCta.vue";
import { onMounted } from "vue";
import { useAnalytics } from "@/composables/useAnalytics";
import { useRoute } from "vue-router";

const route = useRoute();
const { track } = useAnalytics();

// Track page view
onMounted(() => {
  track("pricing_viewed", {
    source: (route.query.source as string) || "direct",
    locale: (route.params.locale as string) || "en",
    rtl: (route.params.locale as string) === "ar",
    device: window.innerWidth < 768 ? "mobile" : "desktop",
  });
});

defineOptions({
  name: "ModernPricingPage",
});
</script>

<template>
  <div class="modern-pricing-page" role="main" aria-labelledby="pricing-page-title">
    <!-- Skip to main content for accessibility -->
    <a
      href="#main-content"
      class="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-blue-600 focus:px-4 focus:py-2 focus:text-white"
    >
      {{ $t("a11y.skipToMain") }}
    </a>

    <!-- Header Section -->
    <div class="modern-pricing-page__header">
      <div class="modern-pricing-page__container">
        <h1 id="pricing-page-title" class="modern-pricing-page__title">
          {{ $t("pricing.hero.title") }}
        </h1>
        <p class="modern-pricing-page__subtitle">
          {{ $t("pricing.hero.subtitle") }}
        </p>
        <!-- Trust badge -->
        <p class="modern-pricing-page__trust">
          {{ $t("pricing.hero.trustedBy") }}
        </p>
      </div>
    </div>

    <!-- Pricing Cards Component (includes billing toggle + trust badges) -->
    <section
      id="main-content"
      class="modern-pricing-page__cards-section"
      aria-labelledby="plans-title"
    >
      <div class="modern-pricing-page__container">
        <h2 id="plans-title" class="sr-only">
          {{ $t("pricing.plans.title") }}
        </h2>
        <PricingCards />
      </div>
    </section>

    <!-- Testimonials - Right after pricing cards -->
    <PricingTestimonials />

    <!-- ROI Section - Show value proposition -->
    <RoiSection />

    <!-- Competitor Comparison -->
    <CompetitorComparison />

    <!-- Detailed Comparison Table -->
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
.modern-pricing-page {
  @apply min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900;
  @apply py-8 md:py-12;
}

/* Screen reader only class */
.sr-only {
  @apply absolute -m-px h-px w-px overflow-hidden whitespace-nowrap border-0 p-0;
}

.focus\:not-sr-only:focus {
  @apply static m-0 h-auto w-auto overflow-visible whitespace-normal border p-2;
}

/* Header */
.modern-pricing-page__header {
  @apply mb-12 text-center;
}

.modern-pricing-page__container {
  @apply mx-auto max-w-7xl px-4 sm:px-6 lg:px-8;
}

.modern-pricing-page__title {
  @apply mb-4 text-3xl font-bold text-gray-900 dark:text-white;
  @apply sm:text-4xl lg:text-5xl;

  letter-spacing: -0.02em;
}

.modern-pricing-page__subtitle {
  @apply text-base text-gray-600 dark:text-gray-300;
  @apply sm:text-lg lg:text-xl;
  @apply mx-auto max-w-3xl;
}

.modern-pricing-page__trust {
  @apply mt-4 text-sm text-gray-500 dark:text-gray-400;
  @apply font-medium;
}

/* Cards Section */
.modern-pricing-page__cards-section {
  @apply mb-16 lg:mb-24;
}

/* Section */
.modern-pricing-page__section {
  @apply py-12 lg:py-16;
  @apply border-t border-gray-200 dark:border-gray-700;
}

.modern-pricing-page__section--cta {
  @apply bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20;
  @apply border-t-2 border-blue-200 dark:border-blue-800;
}

.modern-pricing-page__section-title {
  @apply text-center text-2xl font-bold text-gray-900 dark:text-white;
  @apply sm:text-3xl lg:text-4xl;
  @apply mb-3;

  letter-spacing: -0.02em;
}

.modern-pricing-page__section-subtitle {
  @apply text-center text-base text-gray-600 dark:text-gray-300;
  @apply sm:text-lg;
  @apply mb-8 lg:mb-12;
  @apply mx-auto max-w-2xl;
}

/* Responsive */
@media (width <= 640px) {
  .modern-pricing-page__title {
    @apply text-3xl;
  }

  .modern-pricing-page__subtitle {
    @apply text-base;
  }

  .modern-pricing-page__section-title {
    @apply text-2xl;
  }

  .modern-pricing-page__section {
    @apply py-10;
  }
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  .modern-pricing-page {
    @apply transition-none;
  }
}
</style>
