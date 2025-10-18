<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <div class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white">
          {{ t("plans.free?.landingTitle") }}
        </h1>
        <p class="mt-2 text-lg text-gray-600 dark:text-gray-300">
          {{ t("plans.free?.landingSubtitle") }}
        </p>
      </div>

      <!-- CTA Card -->
      <div class="mb-8 rounded-lg bg-white p-6 shadow-sm dark:bg-gray-800">
        <div class="flex items-center justify-between">
          <div>
            <h2 class="text-xl font-semibold text-gray-900 dark:text-white">
              {{ t("plans.free?.startQuizzes") }}
            </h2>
            <p class="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Practice with easy-level questions to build your foundation
            </p>
          </div>
          <button
            type="button"
            class="rounded-lg bg-primary-600 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
            @click="goToEasyQuizzes"
          >
            {{ t("plans.free?.startQuizzes") }}
          </button>
        </div>
      </div>

      <!-- Content Grid -->
      <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <!-- Study Topics -->
        <div class="rounded-lg bg-white p-6 shadow-sm dark:bg-gray-800">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">JavaScript Basics</h3>
          <p class="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Master the fundamentals of JavaScript
          </p>
          <div class="mt-4">
            <span
              class="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900 dark:text-green-200"
            >
              Free
            </span>
          </div>
        </div>

        <div class="rounded-lg bg-white p-6 shadow-sm dark:bg-gray-800">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">HTML & CSS</h3>
          <p class="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Build solid foundation in web markup and styling
          </p>
          <div class="mt-4">
            <span
              class="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900 dark:text-green-200"
            >
              Free
            </span>
          </div>
        </div>

        <div class="rounded-lg bg-white p-6 shadow-sm dark:bg-gray-800">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Basic Algorithms</h3>
          <p class="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Learn fundamental programming patterns
          </p>
          <div class="mt-4">
            <span
              class="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900 dark:text-green-200"
            >
              Free
            </span>
          </div>
        </div>
      </div>

      <!-- Upsell Section -->
      <div class="mt-8">
        <InlineUpsellCard
          :title="t('paywall.title')"
          :subtitle="t('paywall.description', { plan: t('plans.names.intermediate') })"
          :benefits="[
            t('paywall.features.feature1', { plan: t('plans.names.intermediate') }),
            t('paywall.features.feature2'),
            t('paywall.features.feature3'),
          ]"
          :cta-text="t('paywall.cta.seePlans')"
          target-plan="intermediate"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";
import InlineUpsellCard from "../../../components/paywall/InlineUpsellCard.vue";

const { t } = useI18n();
const router = useRouter();

const goToEasyQuizzes = () => {
  const locale = router.currentRoute.value.params.locale || "en";
  router.push(`/${locale}/quizzes/easy`);
};
</script>
