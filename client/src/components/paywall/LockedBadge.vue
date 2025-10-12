<template>
  <div
    class="inline-flex items-center gap-1.5 rounded-md bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-300"
    :title="tooltipText"
  >
    <svg
      class="h-3.5 w-3.5"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
      />
    </svg>
    <span>{{ label }}</span>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import type { PlanTier } from "@shared/types/plan";

interface Props {
  requiredPlan?: PlanTier;
}

const props = withDefaults(defineProps<Props>(), {
  requiredPlan: "intermediate",
});

const { t } = useI18n();

const label = computed(() => {
  const planNames: Record<PlanTier, string> = {
    free: t("plans.names.free"),
    intermediate: t("plans.names.intermediate"),
    advanced: t("plans.names.advanced"),
    pro: t("plans.names.pro"),
  };
  return planNames[props.requiredPlan];
});

const tooltipText = computed(() => {
  return t("paywall.locked.tooltip", { plan: label.value });
});
</script>
