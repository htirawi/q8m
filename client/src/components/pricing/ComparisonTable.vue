<script setup lang="ts">
import { CheckIcon } from "@heroicons/vue/24/outline";

import type { ComparisonRow } from "@/components/pricing/pricing.config";
import { comparisonRows, plans } from "@/components/pricing/pricing.config";

const getCellValue = (row: ComparisonRow, planId: string): boolean | string => {
  switch (planId) {
    case "junior":
      return row.junior;
    case "intermediate":
      return row.intermediate;
    case "senior":
      return row.senior;
    case "bundle":
      return row.bundle;
    default:
      return false;
  }
};

defineOptions({
  name: "ComparisonTable",
});
</script>

<template>
  <section class="comparison-table" aria-labelledby="comparison-title">
    <div class="comparison-table-container">
      <div class="comparison-table-header">
        <h2 id="comparison-title" class="comparison-table-title">
          {{ $t("pricing.comparison.title") }}
        </h2>
        <p class="comparison-table-description">
          {{ $t("pricing.comparison.description") }}
        </p>
      </div>

      <div class="comparison-table-content">
        <!-- Desktop Table -->
        <div class="comparison-table-desktop hidden lg:block">
          <table class="comparison-table-table" role="table">
            <thead>
              <tr class="comparison-table-header-row">
                <th class="comparison-table-feature-header">
                  {{ $t("pricing.comparison.features") }}
                </th>
                <th
                  v-for="plan in plans"
                  :key="plan.id"
                  class="comparison-table-plan-header"
                  :class="{
                    'comparison-table-plan-header--popular': plan.popular,
                    'comparison-table-plan-header--recommended': plan.recommended,
                  }"
                >
                  <div class="comparison-table-plan-header-content">
                    <span class="comparison-table-plan-name">
                      {{ $t(plan.titleKey) }}
                    </span>
                    <span v-if="plan.badgeKey" class="comparison-table-plan-badge">
                      {{ $t(plan.badgeKey) }}
                    </span>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in comparisonRows" :key="row.featureKey" class="comparison-table-row">
                <td class="comparison-table-feature-cell">
                  {{ $t(row.featureKey) }}
                </td>
                <td v-for="plan in plans" :key="plan.id" class="comparison-table-plan-cell">
                  <div class="comparison-table-cell-content">
                    <CheckIcon
                      v-if="getCellValue(row, plan.id) === true"
                      class="comparison-table-check"
                      aria-hidden="true"
                    />
                    <span
                      v-else-if="getCellValue(row, plan.id) === false"
                      class="comparison-table-dash"
                      aria-hidden="true"
                    >
                      —
                    </span>
                    <span v-else class="comparison-table-text">
                      {{ getCellValue(row, plan.id) }}
                    </span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Mobile Cards -->
        <div class="comparison-table-mobile lg:hidden">
          <div
            v-for="row in comparisonRows"
            :key="row.featureKey"
            class="comparison-table-mobile-card"
          >
            <h3 class="comparison-table-mobile-feature">
              {{ $t(row.featureKey) }}
            </h3>
            <div class="comparison-table-mobile-plans">
              <div v-for="plan in plans" :key="plan.id" class="comparison-table-mobile-plan">
                <span class="comparison-table-mobile-plan-name">
                  {{ $t(plan.titleKey) }}
                </span>
                <div class="comparison-table-mobile-plan-value">
                  <CheckIcon
                    v-if="getCellValue(row, plan.id) === true"
                    class="comparison-table-mobile-check"
                    aria-hidden="true"
                  />
                  <span
                    v-else-if="getCellValue(row, plan.id) === false"
                    class="comparison-table-mobile-dash"
                    aria-hidden="true"
                  >
                    —
                  </span>
                  <span v-else class="comparison-table-mobile-text">
                    {{ getCellValue(row, plan.id) }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.comparison-table {
  @apply bg-white py-16 lg:py-24;
}

.comparison-table-container {
  @apply mx-auto max-w-7xl px-4 sm:px-6 lg:px-8;
}

.comparison-table-header {
  @apply text-center;
}

.comparison-table-title {
  @apply text-3xl font-bold text-gray-900;
}

.comparison-table-description {
  @apply mx-auto mt-4 max-w-2xl text-lg text-gray-600;
}

.comparison-table-content {
  @apply mt-12;
}

/* Desktop Table */
.comparison-table-table {
  @apply w-full border-collapse rounded-lg border border-gray-200;
}

.comparison-table-header-row {
  @apply bg-gray-50;
}

.comparison-table-feature-header {
  @apply px-6 py-4 text-left text-sm font-medium text-gray-900;
}

.comparison-table-plan-header {
  @apply px-6 py-4 text-center text-sm font-medium text-gray-900;
}

.comparison-table-plan-header--popular {
  @apply bg-blue-50;
}

.comparison-table-plan-header--recommended {
  @apply bg-purple-50;
}

.comparison-table-plan-header-content {
  @apply flex flex-col items-center gap-2;
}

.comparison-table-plan-name {
  @apply font-semibold;
}

.comparison-table-plan-badge {
  @apply rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800;
}

.comparison-table-row {
  @apply border-t border-gray-200;
}

.comparison-table-row:nth-child(even) {
  @apply bg-gray-50;
}

.comparison-table-feature-cell {
  @apply px-6 py-4 text-sm font-medium text-gray-900;
}

.comparison-table-plan-cell {
  @apply px-6 py-4 text-center;
}

.comparison-table-cell-content {
  @apply flex justify-center;
}

.comparison-table-check {
  @apply h-5 w-5 text-green-500;
}

.comparison-table-dash {
  @apply text-gray-400;
}

.comparison-table-text {
  @apply text-sm text-gray-700;
}

/* Mobile Cards */
.comparison-table-mobile-card {
  @apply mb-4 rounded-lg border border-gray-200 bg-white p-6;
}

.comparison-table-mobile-feature {
  @apply mb-4 text-lg font-semibold text-gray-900;
}

.comparison-table-mobile-plans {
  @apply space-y-3;
}

.comparison-table-mobile-plan {
  @apply flex items-center justify-between;
}

.comparison-table-mobile-plan-name {
  @apply text-sm font-medium text-gray-700;
}

.comparison-table-mobile-plan-value {
  @apply flex items-center;
}

.comparison-table-mobile-check {
  @apply h-5 w-5 text-green-500;
}

.comparison-table-mobile-dash {
  @apply text-gray-400;
}

.comparison-table-mobile-text {
  @apply text-sm text-gray-700;
}

/* RTL Support */
[dir="rtl"] .comparison-table-feature-header {
  @apply text-right;
}

[dir="rtl"] .comparison-table-feature-cell {
  @apply text-right;
}
</style>
