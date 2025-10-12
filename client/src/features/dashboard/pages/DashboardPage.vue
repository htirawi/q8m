<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <div class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <!-- Header with Plan Badge -->
      <div class="mb-8 flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold text-gray-900 dark:text-white">
            {{ t('dashboard.welcome') }}
          </h1>
          <p class="mt-2 text-lg text-gray-600 dark:text-gray-300">
            Continue your learning journey
          </p>
        </div>
        <div class="flex items-center gap-3">
          <div class="rounded-lg bg-primary-100 px-4 py-2 dark:bg-primary-900/30">
            <div class="flex items-center gap-2">
              <span class="text-sm font-medium text-primary-900 dark:text-primary-100">
                {{ t('dashboard.yourPlan') }}: {{ planDisplayName }}
              </span>
              <span class="rounded-full bg-primary-600 px-2 py-0.5 text-xs font-medium text-white">
                {{ t('dashboard.vipChip') }}
              </span>
            </div>
          </div>
          <button
            type="button"
            class="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700 dark:focus:ring-offset-gray-900"
            @click="goToBilling"
          >
            {{ t('dashboard.manage') }}
          </button>
        </div>
      </div>

      <!-- Resume Section -->
      <div class="mb-8 rounded-lg bg-white p-6 shadow-sm dark:bg-gray-800">
        <h2 class="text-xl font-semibold text-gray-900 dark:text-white">
          {{ t('dashboard.resume.title') }}
        </h2>
        <p class="mt-2 text-sm text-gray-600 dark:text-gray-400">
          {{ t('dashboard.resume.noneAvailable') }}
        </p>
      </div>

      <!-- Stats Grid -->
      <div class="grid gap-6 md:grid-cols-3">
        <div class="rounded-lg bg-white p-6 shadow-sm dark:bg-gray-800">
          <h3 class="text-sm font-medium text-gray-600 dark:text-gray-400">
            Total Quizzes Completed
          </h3>
          <p class="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
            0
          </p>
        </div>

        <div class="rounded-lg bg-white p-6 shadow-sm dark:bg-gray-800">
          <h3 class="text-sm font-medium text-gray-600 dark:text-gray-400">
            Average Score
          </h3>
          <p class="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
            -
          </p>
        </div>

        <div class="rounded-lg bg-white p-6 shadow-sm dark:bg-gray-800">
          <h3 class="text-sm font-medium text-gray-600 dark:text-gray-400">
            Current Streak
          </h3>
          <p class="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
            0 days
          </p>
        </div>
      </div>

      <!-- Placeholder for future dashboard features -->
      <div class="mt-8 text-center text-gray-500 dark:text-gray-400">
        <p>Dashboard features coming soon...</p>
        <p class="mt-2 text-sm">This is a scaffold for paid plan dashboard</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";
import { usePlanStore } from "@/stores/plan";

const { t } = useI18n();
const router = useRouter();
const planStore = usePlanStore();

const planDisplayName = planStore.planDisplayName;

const goToBilling = () => {
  const locale = router.currentRoute.value.params.locale || "en";
  router.push(`/${locale}/account`);
};
</script>
