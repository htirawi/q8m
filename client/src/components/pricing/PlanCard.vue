<template>
  <div class="plan-card" :class="{
    'plan-card--popular': plan.popular,
    'plan-card--recommended': plan.recommended,
  }" :aria-labelledby="`plan-${plan.id}-title`">
    <!-- Popular/Recommended Badge -->
    <div v-if="plan.badgeKey" class="plan-card-badge" :class="{
      'plan-card-badge--popular': plan.popular,
      'plan-card-badge--recommended': plan.recommended,
    }">
      {{ $t(plan.badgeKey) }}
    </div>

    <div class="plan-card-content">
      <!-- Plan Header -->
      <div class="plan-card-header">
        <h3 :id="`plan-${plan.id}-title`" class="plan-card-title">
          {{ $t(plan.titleKey) }}
        </h3>

        <div class="plan-card-pricing">
          <div class="plan-card-price">
            <span class="plan-card-currency">{{ $t("common.currency") }}</span>
            <span class="plan-card-amount">{{ displayPrice }}</span>
          </div>
          <div class="plan-card-period">
            {{ displayPeriod }}
          </div>
          <div v-if="plan.guaranteeDays" class="plan-card-guarantee">
            {{ $t("pricing.guarantee.days", { days: plan.guaranteeDays }) }}
          </div>
        </div>
      </div>

      <!-- Plan Features -->
      <div class="plan-card-features">
        <ul class="plan-card-feature-list" role="list">
          <li v-for="featureKey in plan.featuresKeys" :key="featureKey" class="plan-card-feature-item">
            <CheckIcon class="plan-card-check-icon" aria-hidden="true" />
            <span>{{ $t(featureKey) }}</span>
          </li>
        </ul>
      </div>

      <!-- Plan CTA -->
      <div class="plan-card-footer">
        <button @click="handleCtaClick" class="plan-card-cta" :class="{
          'plan-card-cta--primary': plan.popular || plan.recommended,
          'plan-card-cta--secondary': !plan.popular && !plan.recommended,
        }" :aria-describedby="`plan-${plan.id}-title`">
          {{ $t(plan.ctaLabelKey) }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { CheckIcon } from "@heroicons/vue/24/outline";
import type { PlanCardProps, PlanCardEmits } from "@/types/ui/component-props";

const props = defineProps<PlanCardProps>();
const emit = defineEmits<PlanCardEmits>();
const { t } = useI18n();

const displayPrice = computed(() => {
  if (props.plan.priceMonthly === 0) {
    return "0";
  }

  const price = props.billing === "yearly" ? props.plan.priceYearly : props.plan.priceMonthly;
  return price.toString();
});

const displayPeriod = computed(() => {
  if (props.plan.priceMonthly === 0) {
    return "";
  }

  return props.billing === "yearly"
    ? `/${t("pricing.billing.year")}`
    : `/${t("pricing.billing.month")}`;
});

const handleCtaClick = () => {
  emit("select-plan", props.plan);
};

defineOptions({
  name: "PlanCard",
});
</script>

<style scoped>
.plan-card {
  @apply relative rounded-2xl border border-gray-200 bg-white p-8 shadow-sm transition-all duration-200 hover:shadow-lg;
}

.plan-card--popular {
  @apply border-2 border-blue-500 shadow-lg;
}

.plan-card--recommended {
  @apply border-2 border-purple-500 shadow-lg;
}

.plan-card-badge {
  @apply absolute -top-4 left-1/2 -translate-x-1/2 transform rounded-full px-4 py-1 text-sm font-medium text-white;
}

.plan-card-badge--popular {
  @apply bg-blue-500;
}

.plan-card-badge--recommended {
  @apply bg-purple-500;
}

.plan-card-content {
  @apply flex h-full flex-col;
}

.plan-card-header {
  @apply text-center;
}

.plan-card-title {
  @apply text-2xl font-bold text-gray-900;
}

.plan-card-pricing {
  @apply mt-4;
}

.plan-card-price {
  @apply flex items-baseline justify-center;
}

.plan-card-currency {
  @apply text-lg text-gray-600;
}

.plan-card-amount {
  @apply text-4xl font-bold text-gray-900;
}

.plan-card-period {
  @apply mt-1 text-lg text-gray-600;
}

.plan-card-guarantee {
  @apply mt-2 text-sm text-green-600;
}

.plan-card-features {
  @apply mt-8 flex-1;
}

.plan-card-feature-list {
  @apply space-y-4;
}

.plan-card-feature-item {
  @apply flex items-start gap-3;
}

.plan-card-check-icon {
  @apply mt-0.5 h-5 w-5 flex-shrink-0 text-green-500;
}

.plan-card-feature-item span {
  @apply text-gray-700;
}

.plan-card-footer {
  @apply mt-8;
}

.plan-card-cta {
  @apply w-full rounded-lg px-6 py-3 font-medium transition-colors duration-200;
}

.plan-card-cta--primary {
  @apply bg-blue-600 text-white hover:bg-blue-700;
}

.plan-card-cta--secondary {
  @apply bg-gray-900 text-white hover:bg-gray-800;
}

/* RTL Support */
[dir="rtl"] .plan-card-badge {
  @apply left-auto right-1/2 translate-x-1/2;
}

[dir="rtl"] .plan-card-feature-item {
  @apply flex-row-reverse;
}

[dir="rtl"] .plan-card-check-icon {
  @apply ml-3 mr-0;
}
</style>
