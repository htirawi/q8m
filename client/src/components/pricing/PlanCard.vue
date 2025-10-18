<script setup lang="ts">
import type { IPlanCardProps as IProps, IPlanCardEmits as IEmits } from "@/types/components/pricing";
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import type { IPlanConfig } from '@/config/plans';
import type { BillingCycle, PlanId } from '@/types/pricing';





const props = withDefaults(defineProps<IProps>(), {
  featured: false,
  selected: false,
});

const emit = defineEmits<IEmits>();

const { t } = useI18n();

const showROICalculator = ref(false);

const currentPrice = computed(() => {
  if (!props.plan) return 0;
  return props.billing === 'monthly'
    ? (props.plan.priceMonthly ?? 0)
    : (props.plan.priceYearly ?? 0);
});

const savingsPercent = computed(() => {
  if (!props.plan || props.billing !== 'annual' || (props.plan.priceMonthly ?? 0) === 0) return 0;
  const monthlyCost = (props.plan.priceMonthly ?? 0) * 12;
  const annualCost = props.plan.priceYearly ?? 0;
  const savings = monthlyCost - annualCost;
  return Math.round((savings / monthlyCost) * 100);
});

const handleselect = () => {
  emit('select', props.plan?.id, props.billing);
};

defineOptions({
  name: 'PlanCard',
});
</script>

<template>
  <div class="plan-card" :class="{
    'plan-card--featured': featured || plan?.metadata?.featured,
    'plan-card--free': plan?.priceMonthly === 0,
    'plan-card--selected': selected,
    'plan-card--rtl': $i18n.locale === 'ar'
  }" :data-testid="`plan-card-${plan?.id}`">
    <!-- IBadge -->
    <div v-if="plan?.badge" class="plan-card-badge" :class="`plan-card-badge--${plan?.badge.color}`">
      {{ plan?.badge?.textKey ? t(plan.badge.textKey) : '' }}

    </div>

    <!-- Header -->
    <div class="plan-card-header">
      <div class="plan-card-icon" :aria-hidden="true">
        {{ plan?.visual.icon }}

      </div>
      <h3 class="plan-card-title">
        {{ plan?.labelKey ? t(plan.labelKey) : '' }}
      </h3>
      <p class="plan-card-description">
        {{ plan?.descriptionKey ? t(plan.descriptionKey) : '' }}
      </p>
    </div>

    <!-- Price -->
    <div class="plan-card-price-section">
      <div class="plan-card-price">
        <span class="plan-card-currency" :class="{ 'plan-card-currency--rtl': $i18n.locale === 'ar' }">$</span>
        <span class="plan-card-amount">{{ currentPrice }}

        </span>
      </div>
      <p class="plan-card-period">
        {{ billing === 'monthly' ? t('pricing.billing.perMonth') : t('pricing.billing.perYear') }}
      </p>
      <p v-if="savingsPercent > 0" class="plan-card-savings">
        {{ t('pricing.billing.savePercent', { percent: savingsPercent }) }}
      </p>

      <!-- ROI Calculator for paid plans -->
      <div v-if="currentPrice > 0" class="plan-card-roi" :class="{ 'plan-card-roi--rtl': $i18n.locale === 'ar' }">
        <button type="button" class="plan-card-roi-button"
          :class="{ 'plan-card-roi-button--rtl': $i18n.locale === 'ar' }"
          @click="showROICalculator = !showROICalculator">
          <svg class="plan-card-roi-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <span>{{ t('pricing.roi.calculator') }}</span>
        </button>
      </div>

      <!-- Social proof for featured plans -->
      <div v-if="featured || plan?.metadata?.featured" class="plan-card-social-proof">
        <div class="plan-card-social-proof-stats">
          <div class="plan-card-social-proof-stat">
            <span class="plan-card-social-proof-label">{{ t('pricing.socialProof.recentPurchases', { count: '2,500' })
              }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Features -->
    <ul class="plan-card-features" :class="{ 'plan-card-features--rtl': $i18n.locale === 'ar' }" role="list">
      <li v-for="(benefitKey, idx) in plan?.features.benefits" :key="idx" class="plan-card-feature">
        <!-- LTR: icon first, then text -->
        <template v-if="$i18n.locale !== 'ar'">
          <svg class="plan-card-check-icon" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
            <path fill-rule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clip-rule="evenodd" />
          </svg>
          <span>{{ t(benefitKey) }}</span>
        </template>
        <!-- RTL: text first, then icon -->
        <template v-else>
          <span>{{ t(benefitKey) }}</span>
          <svg class="plan-card-check-icon" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
            <path fill-rule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clip-rule="evenodd" />
          </svg>
        </template>
      </li>
    </ul>

    <!-- CTA -->
    <div class="plan-card-cta-section">
      <button type="button" class="plan-card-cta" :class="{
        'plan-card-cta--primary': featured || plan?.metadata?.featured,
        'plan-card-cta--secondary': !featured && !plan?.metadata?.featured,
      }" @click="handleSelect" :data-testid="`plan-cta-${plan?.id}`">
        {{ plan?.cta?.labelKey ? t(plan.cta.labelKey) : '' }}
      </button>

      <!-- Trust indicators -->
      <div v-if="plan?.reassurance?.items?.length" class="plan-card-trust-indicators"
        :class="{ 'plan-card-trust-indicators--rtl': $i18n.locale === 'ar' }">
        <div v-for="(item, idx) in plan.reassurance.items.slice(0, 2)" :key="idx" class="plan-card-trust-item"
          :class="{ 'plan-card-trust-item--rtl': $i18n.locale === 'ar' }">
          <svg class="plan-card-trust-icon" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
            <path fill-rule="evenodd"
              d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
              clip-rule="evenodd" />
          </svg>
          <span class="plan-card-trust-text">{{ t(item) }}</span>
        </div>
      </div>

      <!-- Urgency indicator for featured plans -->
      <div v-if="featured || plan?.metadata?.featured" class="plan-card-urgency"
        :class="{ 'plan-card-urgency--rtl': $i18n.locale === 'ar' }">
        <div class="plan-card-urgency-badge" :class="{ 'plan-card-urgency-badge--rtl': $i18n.locale === 'ar' }">
          <svg class="plan-card-urgency-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{{ t('pricing.urgency.limitedTime') }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.plan-card {
  @apply relative rounded-2xl border border-gray-200 dark:border-gray-700;
  @apply bg-white dark:bg-gray-800;
  @apply p-6 transition-all duration-300;
  @apply shadow-md hover:shadow-2xl;
  @apply flex flex-col;
  @apply hover:-translate-y-1;
  @apply h-full;
}

.plan-card--rtl {
  @apply text-right;
}

.plan-card--featured {
  @apply border-2 border-blue-500 dark:border-blue-400;
  @apply bg-gradient-to-b from-blue-50/50 via-white to-white;
  @apply dark:from-blue-900/10 dark:via-gray-800 dark:to-gray-800;
  @apply shadow-2xl shadow-blue-500/20;
  @apply lg:scale-105;
  @apply lg:-my-4;
  @apply ring-2 ring-blue-500/20 dark:ring-blue-400/20;
}

.plan-card--featured:hover {
  @apply shadow-blue-500/30;
  @apply ring-blue-500/30 dark:ring-blue-400/30;
}

.plan-card--selected {
  @apply ring-4 ring-blue-500 ring-offset-2;
  @apply border-blue-600 dark:border-blue-400;
  @apply shadow-2xl;
}

.plan-card--free {
  @apply opacity-90;
}

.plan-card-badge {
  @apply absolute -top-3 left-1/2 -translate-x-1/2;
  @apply px-4 py-1.5 rounded-full;
  @apply text-white text-[10px] font-bold uppercase tracking-wider;
  @apply shadow-lg;
  @apply animate-pulse;
}

.plan-card-badge--blue {
  @apply bg-gradient-to-r from-blue-600 via-blue-500 to-purple-600;
  @apply shadow-blue-500/50;
}

.plan-card-badge--gold {
  @apply bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600;
  @apply shadow-orange-500/50;
}

.plan-card-header {
  @apply text-center mb-5;
}

.plan-card-icon {
  @apply text-4xl mb-2;
  @apply drop-shadow-lg;
}

.plan-card-title {
  @apply text-xl font-bold text-gray-900 dark:text-white mb-2;
  @apply tracking-tight;
}

.plan-card-description {
  @apply text-xs text-gray-700 dark:text-gray-300;
  @apply leading-relaxed;
}

.plan-card-price-section {
  @apply text-center mb-5 pb-5 border-b border-gray-100 dark:border-gray-700;
}

.plan-card-price {
  @apply flex items-baseline justify-center mb-1;
}

.plan-card-currency {
  @apply text-2xl font-bold text-gray-900 dark:text-white mr-1;
  @apply align-top;
}

.plan-card-currency--rtl {
  @apply mr-0 ml-1;
}

.plan-card-amount {
  @apply text-5xl font-extrabold text-gray-900 dark:text-white;
  @apply tracking-tight;

  background: linear-gradient(135deg, currentColor 0%, currentColor 100%);
  -webkit-background-clip: text;
  background-clip: text;
}

.plan-card--featured .plan-card-amount {
  @apply text-transparent;

  background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
  -webkit-background-clip: text;
  background-clip: text;
}

.plan-card-period {
  @apply text-xs font-medium text-gray-700 dark:text-gray-300;
}

.plan-card-savings {
  @apply inline-block mt-1.5 px-2.5 py-1 rounded-full;
  @apply text-[10px] font-bold text-green-700 dark:text-green-300;
  @apply bg-green-100 dark:bg-green-900/30;
  @apply border border-green-300 dark:border-green-700;
}

.plan-card-roi {
  @apply mt-3 flex;
}

.plan-card-roi--rtl {
  @apply justify-end;
}

.plan-card-roi-button {
  @apply flex items-center gap-2 px-3 py-1.5 rounded-lg;
  @apply text-xs font-medium text-blue-600 dark:text-blue-400;
  @apply bg-blue-50 dark:bg-blue-900/20;
  @apply border border-blue-200 dark:border-blue-800;
  @apply hover:bg-blue-100 dark:hover:bg-blue-900/30;
  @apply transition-all duration-200;
}

.plan-card-roi-button--rtl {
  @apply justify-end;
}

.plan-card-roi-icon {
  @apply w-3 h-3;
}

.plan-card-social-proof {
  @apply mt-3 pt-3 border-t border-gray-100 dark:border-gray-700;
}

.plan-card-social-proof-text {
  @apply text-xs text-gray-600 dark:text-gray-400;
  @apply font-medium;
}

.plan-card-urgency {
  @apply mt-3 flex;
}

.plan-card-urgency--rtl {
  @apply justify-end;
}

.plan-card-urgency-badge {
  @apply flex items-center gap-2 px-3 py-1.5 rounded-lg;
  @apply text-xs font-medium text-orange-600 dark:text-orange-400;
  @apply bg-orange-50 dark:bg-orange-900/20;
  @apply border border-orange-200 dark:border-orange-800;
  @apply animate-pulse;
}

.plan-card-urgency-badge--rtl {
  @apply justify-end;
}

.plan-card-urgency-icon {
  @apply w-3 h-3;
}

.plan-card-features {
  @apply space-y-2.5 mb-5 flex-grow;
}

.plan-card-features--rtl {
  @apply text-right self-end;
}

.plan-card-feature {
  @apply flex items-start gap-2 text-xs text-gray-800 dark:text-gray-200;
  @apply font-medium leading-tight;
}


.plan-card-check-icon {
  @apply w-4 h-4 text-green-500 flex-shrink-0 mt-0.5;
  @apply drop-shadow-sm;
}

.plan-card-cta-section {
  @apply space-y-3;
}

.plan-card-cta {
  @apply w-full py-3 px-4 rounded-xl font-bold text-sm;
  @apply transition-all duration-200;
  @apply focus:outline-none focus:ring-4 focus:ring-offset-2;
  @apply transform hover:scale-[1.02] active:scale-[0.98];
}

.plan-card-trust-indicators {
  @apply space-y-2 flex flex-col;
}

.plan-card-trust-indicators--rtl {
  @apply items-end;
}

.plan-card-trust-item {
  @apply flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400;
}

.plan-card-trust-item--rtl {
  @apply justify-end;
}

.plan-card-trust-icon {
  @apply w-3 h-3 text-green-500 flex-shrink-0;
}

.plan-card-cta--primary {
  @apply bg-gradient-to-r from-blue-600 via-blue-500 to-purple-600;
  @apply text-white;
  @apply hover:from-blue-700 hover:via-blue-600 hover:to-purple-700;
  @apply focus:ring-blue-500;
  @apply shadow-lg shadow-blue-500/50 hover:shadow-xl hover:shadow-blue-500/60;
}

.plan-card-cta--secondary {
  @apply bg-gray-900 dark:bg-gray-700;
  @apply text-white;
  @apply hover:bg-gray-800 dark:hover:bg-gray-600;
  @apply focus:ring-gray-500;
  @apply shadow-md hover:shadow-lg;
}

/* RTL Support */
[dir='rtl'] .plan-card-price {
  @apply flex-row-reverse;
}

[dir='rtl'] .plan-card-feature {
  @apply flex-row-reverse text-right;
}

[dir='rtl'] .plan-card-currency {
  @apply mr-0 ml-1;
}

/* Responsive */
@media (width <=1024px) {
  .plan-card--featured {
    @apply scale-100;
    @apply my-0;
  }
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  .plan-card {
    @apply transition-none hover:translate-y-0;
  }

  .plan-card--featured {
    @apply scale-100;
  }

  .plan-card-cta {
    @apply hover:scale-100 active:scale-100;
  }

  .plan-card-badge {
    @apply animate-none;
  }
}
</style>
