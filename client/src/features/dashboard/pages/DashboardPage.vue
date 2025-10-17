<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <div class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <!-- Header with Plan IBadge -->
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
          <UserMenu />
        </div>
      </div>

      <!-- Resume Section -->
      <div class="mb-8">
        <EmptyState
          variant="compact"
          icon="📚"
          :title="t('dashboard.resume.title', 'Continue Learning')"
          :description="t('dashboard.resume.noneAvailable', 'No incomplete quizzes or study sessions found. Start a new quiz to begin!')"
          :primary-action="t('dashboard.resume.startQuiz', 'Start New Quiz')"
          @primary-action="goToQuiz"
        />
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

      <!-- Recent Activity Section -->
      <div class="mt-8">
        <h2 class="mb-4 text-xl font-semibold text-gray-900 dark:text-white">
          {{ t('dashboard.recentActivity', 'Recent Activity') }}
        </h2>
        <EmptyState
          variant="default"
          icon="📊"
          :title="t('dashboard.noActivity.title', 'No Activity Yet')"
          :description="t('dashboard.noActivity.description', 'Your quiz history, study sessions, and achievements will appear here once you start learning.')"
          :primary-action="t('dashboard.noActivity.startLearning', 'Start Learning')"
          :secondary-action="t('dashboard.noActivity.viewProgress', 'View Progress')"
          @primary-action="goToQuiz"
          @secondary-action="goToProgress"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";
import { usePlanStore } from "@/stores/plan";
import EmptyState from "@/components/EmptyState.vue";
import UserMenu from "@/components/layout/UserMenu.vue";

const { t } = useI18n();
const router = useRouter();
const planStore = usePlanStore();

const planDisplayName = planStore.planDisplayName;

const goToBilling = () => {
  const locale = router.currentRoute.value.params.locale || "en";
  router.push(`/${locale}/account`);
};

const goToQuiz = () => {
  const locale = router.currentRoute.value.params.locale || "en";
  router.push(`/${locale}/select`);
};

const goToProgress = () => {
  const locale = router.currentRoute.value.params.locale || "en";
  router.push(`/${locale}/account`);
};
</script>
