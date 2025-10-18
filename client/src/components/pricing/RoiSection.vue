<script setup lang="ts">
import { ChartBarIcon, CurrencyDollarIcon, ClockIcon, StarIcon } from '@heroicons/vue/24/outline';

defineOptions({
  name: 'RoiSection',
});
</script>

<template>
  <section class="roi-section" aria-labelledby="roi-title">
    <div class="roi-section__container">
      <div class="roi-section__header">
        <h2 id="roi-title" class="roi-section__title">
          {{ $t('pricing.roi.title') }}

        </h2>
        <p class="roi-section__subtitle">
          {{ $t('pricing.roi.subtitle') }}

        </p>
      </div>

      <div class="roi-section__stats">
        <div class="roi-stat">
          <div class="roi-stat__icon roi-stat__icon--green">
            <CurrencyDollarIcon class="roi-stat__svg" aria-hidden="true" />
          </div>
          <div class="roi-stat__content">
            <span class="roi-stat__value">{{ $t('pricing.roi.stats.salaryIncrease.value') }}

</span>
            <span class="roi-stat__label">{{ $t('pricing.roi.stats.salaryIncrease.label') }}

</span>
          </div>
        </div>

        <div class="roi-stat">
          <div class="roi-stat__icon roi-stat__icon--blue">
            <ChartBarIcon class="roi-stat__svg" aria-hidden="true" />
          </div>
          <div class="roi-stat__content">
            <span class="roi-stat__value">{{ $t('pricing.roi.stats.jobOfferRate.value') }}

</span>
            <span class="roi-stat__label">{{ $t('pricing.roi.stats.jobOfferRate.label') }}

</span>
          </div>
        </div>

        <div class="roi-stat">
          <div class="roi-stat__icon roi-stat__icon--purple">
            <ClockIcon class="roi-stat__svg" aria-hidden="true" />
          </div>
          <div class="roi-stat__content">
            <span class="roi-stat__value">{{ $t('pricing.roi.stats.timeToOffer.value') }}

</span>
            <span class="roi-stat__label">{{ $t('pricing.roi.stats.timeToOffer.label') }}

</span>
          </div>
        </div>

        <div class="roi-stat">
          <div class="roi-stat__icon roi-stat__icon--orange">
            <StarIcon class="roi-stat__svg" aria-hidden="true" />
          </div>
          <div class="roi-stat__content">
            <span class="roi-stat__value">{{ $t('pricing.roi.stats.satisfaction.value') }}

</span>
            <span class="roi-stat__label">{{ $t('pricing.roi.stats.satisfaction.label') }}

</span>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.roi-section {
  @apply py-16 lg:py-20;
  @apply bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50;
  @apply dark:from-blue-900/20 dark:via-purple-900/20 dark:to-pink-900/20;
}

.roi-section__container {
  @apply mx-auto max-w-7xl px-4 sm:px-6 lg:px-8;
}

.roi-section__header {
  @apply text-center mb-12;
}

.roi-section__title {
  @apply text-3xl font-bold text-gray-900 dark:text-white;
  @apply sm:text-4xl lg:text-5xl;
  @apply mb-4;

  letter-spacing: -0.02em;
}

.roi-section__subtitle {
  @apply text-lg text-gray-600 dark:text-gray-300;
  @apply max-w-2xl mx-auto;
}

.roi-section__stats {
  @apply grid grid-cols-1 gap-6;
  @apply sm:grid-cols-2 lg:grid-cols-4;
}

.roi-stat {
  @apply bg-white dark:bg-gray-800;
  @apply rounded-2xl p-6;
  @apply border border-gray-100 dark:border-gray-700;
  @apply shadow-lg hover:shadow-2xl;
  @apply transition-all duration-300;
  @apply hover:-translate-y-1;
  @apply flex flex-col items-center text-center;
}

.roi-stat__icon {
  @apply w-16 h-16 rounded-2xl;
  @apply flex items-center justify-center;
  @apply mb-4;
  @apply shadow-lg;
}

.roi-stat__icon--green {
  @apply bg-gradient-to-br from-green-400 to-emerald-600;
}

.roi-stat__icon--blue {
  @apply bg-gradient-to-br from-blue-400 to-indigo-600;
}

.roi-stat__icon--purple {
  @apply bg-gradient-to-br from-purple-400 to-pink-600;
}

.roi-stat__icon--orange {
  @apply bg-gradient-to-br from-orange-400 to-red-600;
}

.roi-stat__svg {
  @apply w-8 h-8 text-white;
  @apply drop-shadow-md;
}

.roi-stat__content {
  @apply flex flex-col;
}

.roi-stat__value {
  @apply text-4xl font-extrabold text-gray-900 dark:text-white;
  @apply mb-2;

  letter-spacing: -0.03em;
}

.roi-stat__label {
  @apply text-sm font-medium text-gray-600 dark:text-gray-400;
  @apply leading-tight;
}

/* RTL Support */
[dir='rtl'] .roi-stat {
  @apply text-center;
}

/* Responsive */
@media (width <= 640px) {
  .roi-section__stats {
    @apply gap-4;
  }

  .roi-stat {
    @apply p-4;
  }

  .roi-stat__value {
    @apply text-3xl;
  }
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  .roi-stat {
    @apply transition-none hover:translate-y-0;
  }
}
</style>
