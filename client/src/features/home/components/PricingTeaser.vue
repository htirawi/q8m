<script setup lang="ts">
import { computed } from "vue";

import { CheckIcon } from "@heroicons/vue/24/solid";

import Button from "@/components/ui/Button.vue";
import Card from "@/components/ui/Card.vue";

const plans = computed(() => [
  {
    id: "free",
    titleKey: "home.pricing.plans.free.title",
    price: 0,
    featured: false,
    features: [
      "home.pricing.plans.free.features.basic",
      "home.pricing.plans.free.features.limited",
      "home.pricing.plans.free.features.community",
    ],
  },
  {
    id: "pro",
    titleKey: "home.pricing.plans.pro.title",
    price: 29,
    featured: true,
    features: [
      "home.pricing.plans.pro.features.unlimited",
      "home.pricing.plans.pro.features.analytics",
      "home.pricing.plans.pro.features.priority",
      "home.pricing.plans.pro.features.advanced",
    ],
  },
  {
    id: "enterprise",
    titleKey: "home.pricing.plans.enterprise.title",
    price: 99,
    featured: false,
    features: [
      "home.pricing.plans.enterprise.features.everything",
      "home.pricing.plans.enterprise.features.custom",
      "home.pricing.plans.enterprise.features.support",
      "home.pricing.plans.enterprise.features.team",
    ],
  },
]);
</script>

<template>
  <section class="pricing-teaser-section" aria-labelledby="pricing-title">
    <div class="pricing-teaser-container">
      <div class="pricing-teaser-header">
        <h2 id="pricing-title" class="pricing-teaser-title">
          {{ $t("home.pricing.title") }}
        </h2>
        <p class="pricing-teaser-description">
          {{ $t("home.pricing.description") }}
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
                <span class="plan-currency">{{ $t("common.currency") }} </span>
                <span class="plan-amount">{{ plan.price }} </span>
                <span class="plan-period">{{ $t("common.perMonth") }} </span>
              </div>
            </div>
          </template>

          <div class="plan-features">
            <ul class="feature-list" role="list">
              <li v-for="feature in plan.features" :key="feature" class="feature-item">
                <CheckIcon class="feature-check" aria-hidden="true" />
                <span>{{ $t(feature) }}</span>
              </li>
            </ul>
          </div>

          <template #footer>
            <Button
              :variant="plan.featured ? 'primary' : 'secondary'"
              size="lg"
              :to="{ name: 'subscribe' }"
              class="plan-cta"
              :aria-describedby="`plan-${plan.id}-title`"
            >
              {{ $t("home.pricing.choosePlan") }}
            </Button>
          </template>
        </Card>
      </div>

      <div class="pricing-teaser-footer">
        <p class="pricing-note">
          {{ $t("home.pricing.note") }}
        </p>
        <Button variant="outline" size="lg" :to="{ name: 'subscribe' }" class="pricing-link">
          {{ $t("home.pricing.viewAllPlans") }}
        </Button>
      </div>
    </div>
  </section>
</template>

<style scoped>
.pricing-teaser-section {
  @apply bg-gradient-to-b from-slate-50 to-white py-20 dark:from-slate-800 dark:to-slate-900 md:py-32;
}

.pricing-teaser-container {
  @apply container mx-auto px-4;
}

.pricing-teaser-header {
  @apply mb-20 text-center;
}

.pricing-teaser-title {
  @apply mb-6 text-4xl font-bold text-slate-900 dark:text-white md:text-5xl;
  background: linear-gradient(135deg, #1e293b 0%, #3b82f6 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.dark .pricing-teaser-title {
  background: linear-gradient(135deg, #f8fafc 0%, #3b82f6 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.pricing-teaser-description {
  @apply mx-auto max-w-3xl text-xl text-slate-600 dark:text-slate-300;
}

.pricing-teaser-grid {
  @apply mb-16 grid grid-cols-1 gap-8 md:grid-cols-3;
}

.pricing-card {
  @apply relative h-full transition-all duration-300 hover:scale-105 hover:shadow-xl;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(248, 250, 252, 0.9) 100%);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(226, 232, 240, 0.8);
  border-radius: 20px;
  padding: 2rem;
}

.dark .pricing-card {
  background: linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(51, 65, 85, 0.9) 100%);
  border: 1px solid rgba(71, 85, 105, 0.8);
}

.pricing-card--featured {
  @apply scale-105 shadow-2xl ring-2 ring-primary-500;
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.05) 0%, rgba(99, 102, 241, 0.05) 100%);
  border: 2px solid rgba(59, 130, 246, 0.3);
}

.dark .pricing-card--featured {
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(99, 102, 241, 0.1) 100%);
}

.pricing-card-header {
  @apply mb-8 text-center;
}

.plan-title {
  @apply mb-6 text-2xl font-bold text-slate-900 dark:text-white;
}

.plan-price {
  @apply flex items-baseline justify-center space-x-1;
}

.plan-currency {
  @apply text-xl text-slate-600 dark:text-slate-400;
}

.plan-amount {
  @apply text-5xl font-bold text-primary-600 dark:text-primary-400;
}

.plan-period {
  @apply text-lg text-slate-600 dark:text-slate-400;
}

.plan-features {
  @apply mb-8;
}

.feature-list {
  @apply space-y-4;
}

.feature-item {
  @apply flex items-center space-x-3;
}

.feature-check {
  @apply h-6 w-6 flex-shrink-0 text-green-500;
}

.plan-cta {
  @apply min-h-[52px] w-full text-lg font-semibold;
}

.pricing-teaser-footer {
  @apply space-y-8 text-center;
}

.pricing-note {
  @apply text-lg text-slate-600 dark:text-slate-300;
}

.pricing-link {
  @apply min-h-[52px] px-8 text-lg font-semibold;
}

/* Focus styles */
.pricing-card:focus-within {
  @apply outline-none ring-2 ring-primary-500 ring-offset-2 dark:ring-offset-slate-800;
}

.plan-cta:focus,
.pricing-link:focus {
  @apply outline-none ring-2 ring-primary-500 ring-offset-2 dark:ring-offset-slate-800;
}

/* Responsive adjustments */
@media (width <= 768px) {
  .pricing-teaser-grid {
    @apply gap-6;
  }

  .pricing-card {
    @apply hover:scale-100;
  }

  .pricing-card--featured {
    @apply scale-100;
  }

  .pricing-teaser-title {
    @apply text-3xl;
  }

  .pricing-teaser-description {
    @apply text-lg;
  }
}

/* Animation */
@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(40px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.pricing-card {
  animation: slideInUp 0.6s ease-out forwards;
}

.pricing-card:nth-child(1) {
  animation-delay: 0.1s;
}
.pricing-card:nth-child(2) {
  animation-delay: 0.2s;
}
.pricing-card:nth-child(3) {
  animation-delay: 0.3s;
}
</style>
