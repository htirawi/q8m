<template>
  <div class="rounded-lg border border-gray-200 dark:border-gray-700">
    <table class="w-full text-sm">
      <thead class="bg-gray-50 dark:bg-gray-900">
        <tr>
          <th class="px-4 py-3 text-left font-medium text-gray-900 dark:text-white">
            {{ t("convert.comparison.feature") }}
          </th>
          <th class="px-4 py-3 text-center font-medium text-gray-500 dark:text-gray-400">
            {{ t("plans.names.free") }}
          </th>
          <th
            class="bg-gradient-to-r from-primary-500 to-purple-500 px-4 py-3 text-center font-medium text-white dark:text-white"
          >
            {{ targetPlanName }}
          </th>
        </tr>
      </thead>
      <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
        <tr
          v-for="(feature, idx) in comparisonFeatures"
          :key="idx"
          class="hover:bg-gray-50 dark:hover:bg-gray-800/50"
        >
          <td class="px-4 py-3 text-gray-700 dark:text-gray-300">
            {{ feature.label }}
          </td>
          <td class="bg-gray-50/50 px-4 py-3 dark:bg-gray-900/50">
            <div class="flex justify-center">
              <svg
                v-if="feature.free"
                class="h-5 w-5 text-primary-500"
                fill="currentColor"
                viewBox="0 0 20 20"
                aria-label="Included"
              >
                <path
                  fill-rule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clip-rule="evenodd"
                />
              </svg>
              <span v-else class="text-gray-400 dark:text-gray-600" aria-label="Not included"
                >—</span
              >
            </div>
          </td>
          <td class="bg-primary-50/30 px-4 py-3 dark:bg-primary-900/10">
            <div class="flex justify-center">
              <svg
                v-if="feature.target"
                class="h-5 w-5 text-primary-600 dark:text-primary-400"
                fill="currentColor"
                viewBox="0 0 20 20"
                aria-label="Included"
              >
                <path
                  fill-rule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clip-rule="evenodd"
                />
              </svg>
              <span v-else class="text-gray-400 dark:text-gray-600" aria-label="Not included"
                >—</span
              >
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import type {
  IPlanComparisonCardProps as Props,
  IComparisonFeature,
} from "@/types/components/marketing";
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import type { PlanTier } from "@shared/types/plan";

const props = defineProps<Props>();

const { t } = useI18n();

const targetPlanName = computed(() => {
  const names: Record<PlanTier, string> = {
    free: t("plans.names.free"),
    intermediate: t("plans.names.intermediate"),
    advanced: t("plans.names.advanced"),
    pro: t("plans.names.pro"),
  };
  return names[props.targetPlan];
});

const comparisonFeatures = computed((): IComparisonFeature[] => {
  return [
    {
      label: t("convert.comparison.features.basicQuestions"),
      free: true,
      target: true,
    },
    {
      label: t("convert.comparison.features.advancedQuestions"),
      free: false,
      target: true,
    },
    {
      label: t("convert.comparison.features.detailedExplanations"),
      free: false,
      target: true,
    },
    {
      label: t("convert.comparison.features.progressAnalytics"),
      free: false,
      target: true,
    },
    {
      label: t("convert.comparison.features.prioritySupport"),
      free: false,
      target: props.targetPlan === "advanced" || props.targetPlan === "pro",
    },
  ];
});
</script>
