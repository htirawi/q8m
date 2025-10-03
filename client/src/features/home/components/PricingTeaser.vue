<template>
  <section class="pricing-teaser-section" aria-labelledby="pricing-title">
    <div class="pricing-teaser-container">
      <div class="pricing-teaser-header">
        <h2 id="pricing-title" class="pricing-teaser-title">
          {{ $t('home.pricing.title') }}
        </h2>
        <p class="pricing-teaser-description">
          {{ $t('home.pricing.description') }}
        </p>
      </div>
      
      <div class="pricing-teaser-grid">
        <Card
          v-for="plan in plans"
          :key="plan.id"
          class="pricing-card"
          :class="{ 'pricing-card--featured': plan.featured }"
          :aria-labelledby="`plan-${plan.id}-title`"
        >
          <template #header>
            <div class="pricing-card-header">
              <h3 :id="`plan-${plan.id}-title`" class="plan-title">
                {{ $t(plan.titleKey) }}
              </h3>
              <div class="plan-price">
                <span class="plan-currency">{{ $t('common.currency') }}</span>
                <span class="plan-amount">{{ plan.price }}</span>
                <span class="plan-period">{{ $t('common.perMonth') }}</span>
              </div>
            </div>
          </template>
          
          <div class="plan-features">
            <ul class="feature-list" role="list">
              <li
                v-for="feature in plan.features"
                :key="feature"
                class="feature-item"
              >
                <CheckIcon class="feature-check" aria-hidden="true" />
                <span>{{ $t(feature) }}</span>
              </li>
            </ul>
          </div>
          
          <template #footer>
            <Button
              :variant="plan.featured ? 'primary' : 'secondary'"
              size="lg"
              :to="{ name: 'pricing' }"
              class="plan-cta"
              :aria-describedby="`plan-${plan.id}-title`"
            >
              {{ $t('home.pricing.choosePlan') }}
            </Button>
          </template>
        </Card>
      </div>
      
      <div class="pricing-teaser-footer">
        <p class="pricing-note">
          {{ $t('home.pricing.note') }}
        </p>
        <Button
          variant="outline"
          size="lg"
          :to="{ name: 'pricing' }"
          class="pricing-link"
        >
          {{ $t('home.pricing.viewAllPlans') }}
        </Button>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import Card from '@/components/ui/Card.vue'
import Button from '@/components/ui/Button.vue'
import { CheckIcon } from '@heroicons/vue/24/solid'

const plans = computed(() => [
  {
    id: 'free',
    titleKey: 'home.pricing.plans.free.title',
    price: 0,
    featured: false,
    features: [
      'home.pricing.plans.free.features.basic',
      'home.pricing.plans.free.features.limited',
      'home.pricing.plans.free.features.community'
    ]
  },
  {
    id: 'pro',
    titleKey: 'home.pricing.plans.pro.title',
    price: 29,
    featured: true,
    features: [
      'home.pricing.plans.pro.features.unlimited',
      'home.pricing.plans.pro.features.analytics',
      'home.pricing.plans.pro.features.priority',
      'home.pricing.plans.pro.features.advanced'
    ]
  },
  {
    id: 'enterprise',
    titleKey: 'home.pricing.plans.enterprise.title',
    price: 99,
    featured: false,
    features: [
      'home.pricing.plans.enterprise.features.everything',
      'home.pricing.plans.enterprise.features.custom',
      'home.pricing.plans.enterprise.features.support',
      'home.pricing.plans.enterprise.features.team'
    ]
  }
])
</script>

<style scoped>
.pricing-teaser-section {
  @apply py-16 md:py-24 bg-gray-50 dark:bg-gray-800;
}

.pricing-teaser-container {
  @apply container mx-auto px-4;
}

.pricing-teaser-header {
  @apply text-center mb-16;
}

.pricing-teaser-title {
  @apply text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4;
}

.pricing-teaser-description {
  @apply text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto;
}

.pricing-teaser-grid {
  @apply grid grid-cols-1 md:grid-cols-3 gap-8 mb-12;
}

.pricing-card {
  @apply relative h-full transition-transform duration-200 hover:scale-105;
}

.pricing-card--featured {
  @apply ring-2 ring-primary-500 scale-105;
}

.pricing-card-header {
  @apply text-center mb-6;
}

.plan-title {
  @apply text-xl font-semibold text-gray-900 dark:text-white mb-4;
}

.plan-price {
  @apply flex items-baseline justify-center space-x-1;
}

.plan-currency {
  @apply text-lg text-gray-600 dark:text-gray-400;
}

.plan-amount {
  @apply text-4xl font-bold text-primary-600 dark:text-primary-400;
}

.plan-period {
  @apply text-sm text-gray-600 dark:text-gray-400;
}

.plan-features {
  @apply mb-8;
}

.feature-list {
  @apply space-y-3;
}

.feature-item {
  @apply flex items-center space-x-3;
}

.feature-check {
  @apply w-5 h-5 text-green-500 flex-shrink-0;
}

.plan-cta {
  @apply w-full min-h-[44px];
}

.pricing-teaser-footer {
  @apply text-center space-y-6;
}

.pricing-note {
  @apply text-gray-600 dark:text-gray-300;
}

.pricing-link {
  @apply min-h-[44px] px-8;
}

/* Focus styles */
.pricing-card:focus-within {
  @apply outline-none ring-2 ring-primary-500 ring-offset-2 dark:ring-offset-gray-800;
}

.plan-cta:focus,
.pricing-link:focus {
  @apply outline-none ring-2 ring-primary-500 ring-offset-2 dark:ring-offset-gray-800;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .pricing-teaser-grid {
    @apply gap-6;
  }
  
  .pricing-card {
    @apply hover:scale-100;
  }
  
  .pricing-card--featured {
    @apply scale-100;
  }
}
</style>
