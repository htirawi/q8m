<script setup lang="ts">
import { CheckIcon, XMarkIcon } from '@heroicons/vue/24/solid';

defineOptions({
  name: 'CompetitorComparison',
});
</script>

<template>
  <section class="competitor-comparison" aria-labelledby="competitor-title">
    <div class="competitor-comparison__container">
      <div class="competitor-comparison__header">
        <h2 id="competitor-title" class="competitor-comparison__title">
          {{ $t('pricing.competitors.title') }}

        </h2>
        <p class="competitor-comparison__subtitle">
          {{ $t('pricing.competitors.subtitle') }}

        </p>
      </div>

      <div class="competitor-comparison__table-wrapper">
        <table class="competitor-comparison__table" role="table">
          <thead>
            <tr>
              <th class="competitor-comparison__header-cell competitor-comparison__header-cell--feature">
                {{ $t('pricing.competitors.features.frontendFocus') }}

              </th>
              <th class="competitor-comparison__header-cell competitor-comparison__header-cell--highlight">
                <div class="competitor-comparison__brand">
                  <span class="competitor-comparison__brand-name">q8m</span>
                  <span class="competitor-comparison__brand-badge">Recommended</span>
                </div>
              </th>
              <th class="competitor-comparison__header-cell">{{ $t('pricing.competitors.leetcode.name') }}

</th>
              <th class="competitor-comparison__header-cell">{{ $t('pricing.competitors.algoexpert.name') }}

</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td class="competitor-comparison__cell competitor-comparison__cell--label">
                {{ $t('pricing.competitors.features.frontendFocus') }}

              </td>
              <td class="competitor-comparison__cell competitor-comparison__cell--highlight">
                <CheckIcon class="competitor-comparison__check" aria-hidden="true" />
                <span class="competitor-comparison__text">{{ $t('pricing.competitors.q8m.frontendFocus') }}

</span>
              </td>
              <td class="competitor-comparison__cell">
                <XMarkIcon class="competitor-comparison__x" aria-hidden="true" />
                <span class="competitor-comparison__text">{{ $t('pricing.competitors.leetcode.frontendFocus') }}

</span>
              </td>
              <td class="competitor-comparison__cell">
                <XMarkIcon class="competitor-comparison__x" aria-hidden="true" />
                <span class="competitor-comparison__text">{{ $t('pricing.competitors.algoexpert.frontendFocus') }}

</span>
              </td>
            </tr>

            <tr>
              <td class="competitor-comparison__cell competitor-comparison__cell--label">
                {{ $t('pricing.competitors.features.mockInterviews') }}

              </td>
              <td class="competitor-comparison__cell competitor-comparison__cell--highlight">
                <CheckIcon class="competitor-comparison__check" aria-hidden="true" />
                <span class="competitor-comparison__text">{{ $t('pricing.competitors.q8m.mockInterviews') }}

</span>
              </td>
              <td class="competitor-comparison__cell">
                <XMarkIcon class="competitor-comparison__x" aria-hidden="true" />
                <span class="competitor-comparison__text">{{ $t('pricing.competitors.leetcode.mockInterviews') }}

</span>
              </td>
              <td class="competitor-comparison__cell">
                <XMarkIcon class="competitor-comparison__x" aria-hidden="true" />
                <span class="competitor-comparison__text">{{ $t('pricing.competitors.algoexpert.mockInterviews') }}

</span>
              </td>
            </tr>

            <tr>
              <td class="competitor-comparison__cell competitor-comparison__cell--label">
                {{ $t('pricing.competitors.features.liveSupport') }}

              </td>
              <td class="competitor-comparison__cell competitor-comparison__cell--highlight">
                <CheckIcon class="competitor-comparison__check" aria-hidden="true" />
                <span class="competitor-comparison__text">{{ $t('pricing.competitors.q8m.liveSupport') }}

</span>
              </td>
              <td class="competitor-comparison__cell">
                <span class="competitor-comparison__text">{{ $t('pricing.competitors.leetcode.liveSupport') }}

</span>
              </td>
              <td class="competitor-comparison__cell">
                <span class="competitor-comparison__text">{{ $t('pricing.competitors.algoexpert.liveSupport') }}

</span>
              </td>
            </tr>

            <tr>
              <td class="competitor-comparison__cell competitor-comparison__cell--label">
                {{ $t('pricing.competitors.features.price') }}

              </td>
              <td class="competitor-comparison__cell competitor-comparison__cell--highlight">
                <span class="competitor-comparison__price">{{ $t('pricing.competitors.q8m.price') }}

</span>
              </td>
              <td class="competitor-comparison__cell">
                <span class="competitor-comparison__price">{{ $t('pricing.competitors.leetcode.price') }}

</span>
              </td>
              <td class="competitor-comparison__cell">
                <span class="competitor-comparison__price">{{ $t('pricing.competitors.algoexpert.price') }}

</span>
              </td>
            </tr>

            <tr>
              <td class="competitor-comparison__cell competitor-comparison__cell--label">
                {{ $t('pricing.competitors.features.moneyBack') }}

              </td>
              <td class="competitor-comparison__cell competitor-comparison__cell--highlight">
                <CheckIcon class="competitor-comparison__check" aria-hidden="true" />
                <span class="competitor-comparison__text">{{ $t('pricing.competitors.q8m.moneyBack') }}

</span>
              </td>
              <td class="competitor-comparison__cell">
                <XMarkIcon class="competitor-comparison__x" aria-hidden="true" />
                <span class="competitor-comparison__text">{{ $t('pricing.competitors.leetcode.moneyBack') }}

</span>
              </td>
              <td class="competitor-comparison__cell">
                <XMarkIcon class="competitor-comparison__x" aria-hidden="true" />
                <span class="competitor-comparison__text">{{ $t('pricing.competitors.algoexpert.moneyBack') }}

</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </section>
</template>

<style scoped>
.competitor-comparison {
  @apply py-16 lg:py-20;
  @apply bg-white dark:bg-gray-900;
}

.competitor-comparison__container {
  @apply mx-auto max-w-7xl px-4 sm:px-6 lg:px-8;
}

.competitor-comparison__header {
  @apply text-center mb-12;
}

.competitor-comparison__title {
  @apply text-3xl font-bold text-gray-900 dark:text-white;
  @apply sm:text-4xl lg:text-5xl;
  @apply mb-4;

  letter-spacing: -0.02em;
}

.competitor-comparison__subtitle {
  @apply text-lg text-gray-600 dark:text-gray-300;
  @apply max-w-2xl mx-auto;
}

.competitor-comparison__table-wrapper {
  @apply overflow-x-auto rounded-2xl;
  @apply shadow-2xl;
}

.competitor-comparison__table {
  @apply w-full border-collapse;
  @apply bg-white dark:bg-gray-800;
}

.competitor-comparison__header-cell {
  @apply px-6 py-5;
  @apply text-center text-sm font-bold;
  @apply bg-gray-50 dark:bg-gray-900;
  @apply text-gray-900 dark:text-white;
  @apply border-b-2 border-gray-200 dark:border-gray-700;
}

.competitor-comparison__header-cell--feature {
  @apply text-left;
  @apply w-1/4;
}

.competitor-comparison__header-cell--highlight {
  @apply bg-gradient-to-b from-blue-50 to-purple-50;
  @apply dark:from-blue-900/20 dark:to-purple-900/20;
  @apply border-x-2 border-blue-500 dark:border-blue-400;
}

.competitor-comparison__brand {
  @apply flex flex-col items-center gap-2;
}

.competitor-comparison__brand-name {
  @apply text-xl font-extrabold;
  @apply text-transparent bg-clip-text;
  @apply bg-gradient-to-r from-blue-600 to-purple-600;
}

.competitor-comparison__brand-badge {
  @apply px-3 py-1 rounded-full;
  @apply text-[10px] font-bold uppercase;
  @apply bg-gradient-to-r from-green-500 to-emerald-600;
  @apply text-white;
  @apply shadow-lg;
}

.competitor-comparison__cell {
  @apply px-6 py-4;
  @apply text-center;
  @apply border-b border-gray-100 dark:border-gray-800;
}

.competitor-comparison__cell--label {
  @apply text-left font-semibold;
  @apply text-gray-900 dark:text-white;
}

.competitor-comparison__cell--highlight {
  @apply bg-blue-50/50 dark:bg-blue-900/10;
  @apply border-x-2 border-blue-200 dark:border-blue-800;
}

.competitor-comparison__check {
  @apply w-6 h-6 text-green-500;
  @apply inline-block mr-2;
}

.competitor-comparison__x {
  @apply w-6 h-6 text-red-400;
  @apply inline-block mr-2;
}

.competitor-comparison__text {
  @apply text-sm text-gray-700 dark:text-gray-300;
}

.competitor-comparison__price {
  @apply text-base font-bold text-gray-900 dark:text-white;
}

/* RTL Support */
[dir='rtl'] .competitor-comparison__header-cell--feature,
[dir='rtl'] .competitor-comparison__cell--label {
  @apply text-right;
}

[dir='rtl'] .competitor-comparison__check,
[dir='rtl'] .competitor-comparison__x {
  @apply mr-0 ml-2;
}

/* Responsive */
@media (width <= 768px) {
  .competitor-comparison__table {
    @apply text-xs;
  }

  .competitor-comparison__header-cell,
  .competitor-comparison__cell {
    @apply px-3 py-3;
  }

  .competitor-comparison__brand-name {
    @apply text-base;
  }
}
</style>
