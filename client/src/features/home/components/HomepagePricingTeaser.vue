<template>
  <section class="pricing-teaser" data-testid="pricing-teaser" aria-labelledby="pricing-title">
    <div class="pricing-teaser__container">
      <!-- Section header -->
      <div class="pricing-teaser__header">
        <h2 id="pricing-title" class="pricing-teaser__title">
          {{ t('home.pricing.title') }}

        </h2>
        <p class="pricing-teaser__subtitle">
          {{ t('home.pricing.subtitle') }}
        </p>
      </div>

      <!-- Billing cycle toggle -->
      <div class="pricing-teaser__toggle-wrapper">
        <button type="button" class="pricing-teaser__toggle-button"
          :class="{ 'pricing-teaser__toggle-button--active': billingCycle === 'monthly' }"
          @click="handleToggle('monthly')" data-testid="toggle-monthly">
          {{ t('home.pricing.monthly') }}
        </button>

        <button type="button" class="pricing-teaser__toggle-button"
          :class="{ 'pricing-teaser__toggle-button--active': billingCycle === 'annual' }"
          @click="handleToggle('annual')" data-testid="toggle-annual">
          {{ t('home.pricing.yearly') }}

        </button>
      </div>

      <!-- Savings message for annual -->
      <p v-if="billingCycle === 'annual'" class="pricing-teaser__savings-message">
        {{ t('home.pricing.savingsMessage') }}
      </p>

      <!-- Pricing cards -->
      <div class="pricing-teaser__cards" :class="{ 'pricing-teaser__cards--rtl': $i18n.locale === 'ar' }">
        <PlanCard v-for="plan in plans" :key="plan.id" :plan="plan" :billing="billingCycle"
          :featured="plan.badge?.textKey === 'plans.badges.mostPopular'" @select="handlePlanSelect" />
      </div>

      <!-- View all plans link -->
      <div class="pricing-teaser__footer">
        <router-link :to="{ name: 'pricing', params: { locale: currentLocale } }" class="pricing-teaser__view-all"
          @click="handleViewAllPlans">
          {{ t('home.pricing.viewAllPlans') }}

          <svg class="pricing-teaser__arrow" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </router-link>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter, useRoute } from 'vue-router';
import { useHomepageAnalytics } from '@/composables/useHomepageAnalytics';
import { getHomepagePlans } from '@/config/plans';
import type { IPlanConfig } from '@/config/plans';
import type { BillingCycle } from '@/types/pricing';
import PlanCard from '@/components/pricing/PlanCard.vue';

const { t, locale } = useI18n();
const router = useRouter();
const route = useRoute();
const { trackPricingInteraction } = useHomepageAnalytics();

const billingCycle = ref<BillingCycle>('monthly');
const currentLocale = computed(() => route.params.locale as string || locale.value);

// Get plans from canonical registry
const canonicalPlans = getHomepagePlans();

// Pricing plans (now using canonical registry)
const plans = computed(() => canonicalPlans);

// Computed
const currentPrice = (plan: IPlanConfig): number => {
  return billingCycle.value === 'monthly' ? plan.priceMonthly : plan.priceYearly; billingCycle.valueplan.priceMonthly
};

// Methods
const handleToggle = (cycle: BillingCycle): void => {
  billingCycle.value = cycle;

  trackPricingInteraction({
    action: 'toggle_cycle',
    billingCycle: cycle,
  });
};

const handlePlanSelect = (plan: IPlanConfig): void => {
  trackPricingInteraction({
    action: 'select_plan',
    planId: plan.id,
    billingCycle: billingCycle.value,
    priceDisplayed: currentPrice(plan),
  });

  // Navigate to signup/checkout
  if (plan.id === 'junior') {
    router.push({
      name: 'register',
      params: { locale: currentLocale.value },
    });
  }

  else {
    router.push({
      name: 'pricing',
      params: { locale: currentLocale.value },
      query: {
        plan: plan.id,
        billing: billingCycle.value,
      },
    });
  }
};

const handleViewAllPlans = (): void => {
  trackPricingInteraction({
    action: 'view_details',
    billingCycle: billingCycle.value,
  });
};

defineOptions({
  name: 'HomepagePricingTeaser',
});
</script>

<style scoped>
.pricing-teaser {
  @apply py-16 bg-white dark:bg-gray-900;
  @apply lg:py-24;
}

.pricing-teaser__container {
  @apply mx-auto max-w-7xl px-4 sm:px-6 lg:px-8;
}

.pricing-teaser__header {
  @apply text-center mb-8;
}

.pricing-teaser__title {
  @apply text-3xl font-bold text-gray-900 dark:text-white mb-4;
  @apply sm:text-4xl;

  letter-spacing: -0.02em;
}

.pricing-teaser__subtitle {
  @apply text-lg text-gray-600 dark:text-gray-400;
  @apply max-w-2xl mx-auto;
}

.pricing-teaser__toggle-wrapper {
  @apply flex items-center justify-center gap-4 mb-12;
}

.pricing-teaser__toggle-button {
  @apply px-6 py-2 text-sm font-medium rounded-lg;
  @apply text-gray-600 dark:text-gray-400;
  @apply transition-all duration-200;
  @apply hover:text-gray-900 dark:hover:text-white;
}

.pricing-teaser__toggle-button--active {
  @apply bg-gray-900 dark:bg-white;
  @apply text-white dark:text-gray-900;
}

.pricing-teaser__savings-message {
  @apply text-center text-sm text-green-600 dark:text-green-400 mb-6 mt-2;
  @apply font-medium;
}

.pricing-teaser__cards {
  @apply grid grid-cols-1 gap-6 mb-12;
  @apply sm:grid-cols-2;
  @apply lg:grid-cols-4;
  @apply lg:gap-5;
}

.pricing-teaser__cards--rtl {
  direction: rtl;
}

/* Pricing card */
.pricing-card {
  @apply relative rounded-2xl border-2 border-gray-200 dark:border-gray-700;
  @apply bg-white dark:bg-gray-800;
  @apply p-6 transition-all duration-300;
  @apply hover:border-gray-300 dark:hover:border-gray-600;
  @apply hover:shadow-xl;
  @apply lg:p-7;
}

.pricing-card--popular {
  @apply border-blue-500 dark:border-blue-400;
  @apply shadow-lg;
  @apply lg:scale-105;
  @apply lg:-my-4;
}

.pricing-card__badge {
  @apply absolute -top-4 left-1/2 -translate-x-1/2;
  @apply px-4 py-1 rounded-full;
  @apply bg-gradient-to-r from-blue-600 to-purple-600;
  @apply text-white text-sm font-bold;
  @apply shadow-lg;
}

.pricing-card__name {
  @apply text-lg font-bold text-gray-900 dark:text-white mb-3;
  @apply lg:text-xl lg:mb-4;
}

.pricing-card__price-wrapper {
  @apply flex items-baseline mb-3;
  @apply lg:mb-4;
}

.pricing-card__currency {
  @apply text-xl font-semibold text-gray-900 dark:text-white;
  @apply lg:text-2xl;
}

.pricing-card__currency--rtl {
  @apply mr-0 ml-2;
}

.pricing-card__price {
  @apply text-4xl font-bold text-gray-900 dark:text-white;
  @apply lg:text-5xl;
}

.pricing-card__period {
  @apply ml-2 text-xs text-gray-700 dark:text-gray-300;
  @apply lg:text-sm;
}

.pricing-card__description {
  @apply text-xs text-gray-700 dark:text-gray-300 mb-4;
  @apply min-h-[2.5rem];
  @apply lg:text-sm lg:mb-6 lg:min-h-[3rem];
}

.pricing-card__features {
  @apply space-y-2 mb-6;
  @apply lg:space-y-3 lg:mb-8;
}

.pricing-card__feature {
  @apply flex items-start gap-2;
  @apply text-xs text-gray-700 dark:text-gray-300;
  @apply lg:gap-3 lg:text-sm;
}

.pricing-card__feature--rtl {
  @apply flex-row-reverse gap-2;
  @apply lg:gap-3;
}

.pricing-card__feature-icon {
  @apply w-4 h-4 text-green-500 flex-shrink-0 mt-0.5;
  @apply lg:w-5 lg:h-5;
}

.pricing-card__cta {
  @apply w-full py-2.5 px-4 rounded-lg font-medium text-sm;
  @apply transition-all duration-200;
  @apply focus:outline-none focus:ring-2 focus:ring-offset-2;
  @apply lg:py-3 lg:px-6;
}

.pricing-card__cta--primary {
  @apply bg-gradient-to-r from-blue-600 to-purple-600;
  @apply text-white;
  @apply hover:from-blue-700 hover:to-purple-700;
  @apply focus:ring-blue-500;
  @apply shadow-lg hover:shadow-xl;
}

.pricing-card__cta--secondary {
  @apply bg-gray-100 dark:bg-gray-700;
  @apply text-gray-900 dark:text-white;
  @apply hover:bg-gray-200 dark:hover:bg-gray-600;
  @apply focus:ring-gray-500;
}

.pricing-teaser__footer {
  @apply text-center;
}

.pricing-teaser__view-all {
  @apply inline-flex items-center gap-2;
  @apply text-blue-600 dark:text-blue-400;
  @apply font-medium hover:underline;
}

.pricing-teaser__arrow {
  @apply w-4 h-4 transition-transform duration-200;
}

.pricing-teaser__view-all:hover .pricing-teaser__arrow {
  @apply translate-x-1;
}

/* RTL support */
[dir='rtl'] .pricing-card__price-wrapper {
  @apply flex-row-reverse;
}

[dir='rtl'] .pricing-card__feature {
  @apply flex-row-reverse;
}

[dir='rtl'] .pricing-teaser__view-all:hover .pricing-teaser__arrow {
  @apply -translate-x-1;
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {

  .pricing-card,
  .pricing-teaser__arrow {
    @apply transition-none;
  }

  .pricing-card--popular {
    @apply scale-100;
  }
}
</style>
