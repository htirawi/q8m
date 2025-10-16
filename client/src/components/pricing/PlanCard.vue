<script setup lang="ts">
import type { IPlanCardProps as IProps, IPlanCardEmits as IEmits } from "@/types/components/pricing";
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import type { IPlanConfig } from '@/config/plans';
import type { BillingCycle, PlanId } from '@/types/pricing';





const props = withDefaults(defineProps<IProps>(), {
  featured: false,
  selected: false,
});

const emit = defineEmits<IEmits>();

const { t } = useI18n();

const currentPrice = computed(() => {
  return props.billing === 'monthly'
    ? props.plan.priceMonthly
    : props.plan.priceYearly;
});

const savingsPercent = computed(() => {
  if (props.billing !== 'annual' || props.plan.priceMonthly === 0) return 0;
  const monthlyCost = props.plan.priceMonthly * 12;
  const annualCost = props.plan.priceYearly;
  const savings = monthlyCost - annualCost;
  return Math.round((savings / monthlyCost) * 100);
});

const handleSelect = () => {
  emit('select', props.plan.id, props.billing);
};

defineOptions({
  name: 'PlanCard',
});
</script>

<template>
  <div
    class="plan-card"
    :class="{
      'plan-card--featured': featured || plan?.metadata?.featured,
      'plan-card--free': plan?.priceMonthly === 0,
      'plan-card--selected': selected,
    }"
    :data-testid="`plan-card-${plan.id}`"
  >
    <!-- IBadge -->
    <div v-if="plan.badge" class="plan-card-badge" :class="`plan-card-badge--${plan.badge.color}`">
      {{ t(plan.badge.textKey) }}
    </div>

    <!-- Header -->
    <div class="plan-card-header">
      <div class="plan-card-icon" :aria-hidden="true">
        {{ plan.visual.icon }}
      </div>
      <h3 class="plan-card-title">
        {{ t(plan.labelKey) }}
      </h3>
      <p class="plan-card-description">
        {{ t(plan.descriptionKey) }}
      </p>
    </div>

    <!-- Price -->
    <div class="plan-card-price-section">
      <div class="plan-card-price">
        <span class="plan-card-currency">$</span>
        <span class="plan-card-amount">{{ currentPrice }}</span>
      </div>
      <p class="plan-card-period">
        {{ billing === 'monthly' ? t('pricing.billing.perMonth') : t('pricing.billing.perYear') }}
      </p>
      <p v-if="savingsPercent > 0" class="plan-card-savings">
        {{ t('pricing.billing.savePercent', { percent: savingsPercent }) }}
      </p>
    </div>

    <!-- Features -->
    <ul class="plan-card-features" role="list">
      <li
        v-for="(benefitKey, idx) in plan.features.benefits"
        :key="idx"
        class="plan-card-feature"
      >
        <svg class="plan-card-check-icon" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
          <path
            fill-rule="evenodd"
            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
            clip-rule="evenodd"
          />
        </svg>
        <span>{{ t(benefitKey) }}</span>
      </li>
    </ul>

    <!-- CTA -->
    <button
      type="button"
      class="plan-card-cta"
      :class="{
        'plan-card-cta--primary': featured || plan?.metadata?.featured,
        'plan-card-cta--secondary': !featured && !plan?.metadata?.featured,
      }"
      @click="handleSelect"
      :data-testid="`plan-cta-${plan.id}`"
    >
      {{ t(plan.cta.labelKey) }}
    </button>
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
  @apply text-xs text-gray-600 dark:text-gray-400;
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
  @apply text-xs font-medium text-gray-600 dark:text-gray-400;
}

.plan-card-savings {
  @apply inline-block mt-1.5 px-2.5 py-1 rounded-full;
  @apply text-[10px] font-bold text-green-700 dark:text-green-300;
  @apply bg-green-100 dark:bg-green-900/30;
  @apply border border-green-300 dark:border-green-700;
}

.plan-card-features {
  @apply space-y-2.5 mb-5 flex-grow;
}

.plan-card-feature {
  @apply flex items-start gap-2 text-xs text-gray-700 dark:text-gray-300;
  @apply font-medium leading-tight;
}

.plan-card-check-icon {
  @apply w-4 h-4 text-green-500 flex-shrink-0 mt-0.5;
  @apply drop-shadow-sm;
}

.plan-card-cta {
  @apply w-full py-3 px-4 rounded-xl font-bold text-sm;
  @apply transition-all duration-200;
  @apply focus:outline-none focus:ring-4 focus:ring-offset-2;
  @apply transform hover:scale-[1.02] active:scale-[0.98];
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
@media (max-width: 1024px) {
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
