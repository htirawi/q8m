<template>
  <div class="overflow-hidden rounded-lg border border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/50">
    <!-- Header (always visible) -->
    <button
      type="button"
      class="flex w-full items-center justify-between p-4 text-left transition-colors hover:bg-gray-100 dark:hover:bg-gray-700/50"
      :aria-expanded="isExpanded"
      :aria-controls="contentId"
      @click="toggleExpanded"
    >
      <div class="flex items-center gap-3">
        <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-100 dark:bg-primary-900/30">
          <svg
            class="h-5 w-5 text-primary-600 dark:text-primary-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
            />
          </svg>
        </div>
        <div>
          <h3 class="text-sm font-semibold text-gray-900 dark:text-white">
            {{ title }}
          </h3>
          <p class="text-xs text-gray-600 dark:text-gray-400">
            {{ subtitle }}
          </p>
        </div>
      </div>

      <!-- Expand icon -->
      <svg
        class="h-5 w-5 text-gray-400 transition-transform"
        :class="{ 'rotate-180': isExpanded }"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M19 9l-7 7-7-7"
        />
      </svg>
    </button>

    <!-- Expandable content -->
    <Transition name="expand">
      <div v-if="isExpanded" :id="contentId" class="border-t border-gray-200 p-4 dark:border-gray-700">
        <ul class="mb-4 space-y-2 text-sm text-gray-700 dark:text-gray-300">
          <li
            v-for="(benefit, index) in benefits"
            :key="index"
            class="flex items-start"
          >
            <svg
              class="mr-2 mt-0.5 h-4 w-4 flex-shrink-0 text-primary-500"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fill-rule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clip-rule="evenodd"
              />
            </svg>
            <span>{{ benefit }}</span>
          </li>
        </ul>

        <button
          type="button"
          class="w-full rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
          @click="handleUpgrade"
        >
          {{ ctaText }}
        </button>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { trackEvent } from "@/utils/telemetry";
import type { PlanTier } from "@shared/types/plan";

interface Props {
  title: string;
  subtitle: string;
  benefits: string[];
  ctaText: string;
  targetPlan: PlanTier;
}

const props = defineProps<Props>();

const router = useRouter();
const isExpanded = ref(false);
const contentId = `upsell-${Math.random().toString(36).substring(7)}`;

const toggleExpanded = () => {
  isExpanded.value = !isExpanded.value;

  if (isExpanded.value) {
    trackEvent("upsell_card_expanded", {
      targetPlan: props.targetPlan,
      title: props.title,
    });
  }
};

const handleUpgrade = () => {
  trackEvent("upsell_card_cta_clicked", {
    targetPlan: props.targetPlan,
    title: props.title,
  });

  const locale = router.currentRoute.value.params.locale || "en";
  router.push({
    path: `/${locale}/subscribe`,
    query: {
      intent: "upgrade",
      plan: props.targetPlan,
    },
  });
};
</script>

<style scoped>
.expand-enter-active,
.expand-leave-active {
  transition: all 0.3s ease;
  max-height: 500px;
  overflow: hidden;
}

.expand-enter-from,
.expand-leave-to {
  max-height: 0;
  opacity: 0;
}
</style>
