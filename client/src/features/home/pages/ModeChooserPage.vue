<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
    <div class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <!-- Header -->
      <div class="mb-12 text-center">
        <button
          type="button"
          class="mb-6 inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
          @click="goBack"
        >
          <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          {{ t('modeChooser.backToLevels') }}
        </button>

        <div class="mb-4 flex items-center justify-center gap-3">
          <div class="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 text-3xl shadow-lg">
            {{ getDifficultyIcon(difficulty) }}
          </div>
        </div>

        <h1 class="mb-4 text-4xl font-bold text-gray-900 dark:text-white md:text-5xl">
          {{ t('modeChooser.title') }}
        </h1>
        <p class="text-lg text-gray-600 dark:text-gray-400 md:text-xl">
          {{ t('modeChooser.subtitle', { difficulty: t(`difficulty.${difficulty}.label`) }) }}
        </p>

        <!-- Difficulty Badge -->
        <div class="mt-6 inline-flex items-center gap-2">
          <span
            class="inline-flex items-center rounded-full px-4 py-2 text-sm font-medium"
            :class="getDifficultyBadgeClass(difficulty)"
          >
            {{ getDifficultyIcon(difficulty) }} {{ t(`difficulty.${difficulty}.label`) }}
          </span>
        </div>
      </div>

      <!-- Mode Selection Cards -->
      <div class="mb-12 grid grid-cols-1 gap-8 md:grid-cols-2">
        <!-- Study Mode Card -->
        <ModeCard
          mode="study"
          :difficulty="difficulty"
          :icon="'📚'"
          :title="t('modeChooser.studyMode.title')"
          :description="t('modeChooser.studyMode.description')"
          :features="studyFeatures"
          :cta="t('modeChooser.studyMode.cta')"
          :gradient="'from-blue-500 to-cyan-500'"
          :hover-gradient="'from-blue-50 to-cyan-50'"
          @select="handleModeSelect('study')"
        />

        <!-- Quiz Mode Card -->
        <ModeCard
          mode="quiz"
          :difficulty="difficulty"
          :icon="'🎯'"
          :title="t('modeChooser.quizMode.title')"
          :description="t('modeChooser.quizMode.description')"
          :features="quizFeatures"
          :cta="t('modeChooser.quizMode.cta')"
          :gradient="'from-purple-500 to-pink-500'"
          :hover-gradient="'from-purple-50 to-pink-50'"
          @select="handleModeSelect('quiz')"
        />
      </div>

      <!-- Comparison Table (Optional) -->
      <div class="rounded-2xl border border-gray-200 bg-white/80 p-8 backdrop-blur dark:border-gray-700 dark:bg-gray-800/80">
        <h2 class="mb-6 text-center text-2xl font-bold text-gray-900 dark:text-white">
          {{ t('modeChooser.comparison.title') }}
        </h2>

        <div class="overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="border-b border-gray-200 dark:border-gray-700">
                <th class="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                  {{ t('modeChooser.comparison.feature') }}
                </th>
                <th class="px-4 py-3 text-center text-sm font-medium text-gray-900 dark:text-white">
                  📚 {{ t('modeChooser.studyMode.title') }}
                </th>
                <th class="px-4 py-3 text-center text-sm font-medium text-gray-900 dark:text-white">
                  🎯 {{ t('modeChooser.quizMode.title') }}
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
              <tr v-for="comparison in comparisonFeatures" :key="comparison.key">
                <td class="px-4 py-4 text-sm text-gray-900 dark:text-white">
                  {{ t(`modeChooser.comparison.features.${comparison.key}`) }}
                </td>
                <td class="px-4 py-4 text-center">
                  <span v-if="comparison.study" class="text-green-600 dark:text-green-400">
                    <svg class="mx-auto h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                    </svg>
                  </span>
                  <span v-else class="text-gray-300 dark:text-gray-600">
                    <svg class="mx-auto h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
                    </svg>
                  </span>
                </td>
                <td class="px-4 py-4 text-center">
                  <span v-if="comparison.quiz" class="text-green-600 dark:text-green-400">
                    <svg class="mx-auto h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                    </svg>
                  </span>
                  <span v-else class="text-gray-300 dark:text-gray-600">
                    <svg class="mx-auto h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
                    </svg>
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter, useRoute } from 'vue-router';
import { useAnalytics } from '@/composables/useAnalytics';
import ModeCard from '@/components/study/ModeCard.vue';
import type { DifficultyLevel } from '@/types/plan/access';

const { t } = useI18n();
const router = useRouter();
const route = useRoute();
const { track } = useAnalytics();

const difficulty = computed(() => route.params.difficulty as DifficultyLevel);
const locale = computed(() => (route.params.locale as string) || 'en');

// Study mode features
const studyFeatures = computed(() => [
  t('modeChooser.studyMode.features.feature1'),
  t('modeChooser.studyMode.features.feature2'),
  t('modeChooser.studyMode.features.feature3'),
  t('modeChooser.studyMode.features.feature4'),
]);

// Quiz mode features
const quizFeatures = computed(() => [
  t('modeChooser.quizMode.features.feature1'),
  t('modeChooser.quizMode.features.feature2'),
  t('modeChooser.quizMode.features.feature3'),
  t('modeChooser.quizMode.features.feature4'),
]);

// Comparison table data
const comparisonFeatures = [
  { key: 'selfPaced', study: true, quiz: false },
  { key: 'timed', study: false, quiz: true },
  { key: 'revealAnswers', study: true, quiz: false },
  { key: 'immediateFeedback', study: false, quiz: true },
  { key: 'scoring', study: false, quiz: true },
  { key: 'bookmarks', study: true, quiz: false },
  { key: 'analytics', study: true, quiz: true },
];

const getDifficultyIcon = (diff: DifficultyLevel) => {
  const icons = { easy: '🟢', medium: '🟡', hard: '🔴' };
  return icons[diff] || '⚪';
};

const getDifficultyBadgeClass = (diff: DifficultyLevel) => {
  const classes = {
    easy: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    hard: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  };
  return classes[diff] || 'bg-gray-100 text-gray-800';
};

const handleModeSelect = (mode: 'study' | 'quiz') => {
  // Track analytics
  track('mode_selected', {
    mode,
    difficulty: difficulty.value,
    source: 'mode_chooser_page',
  });

  // Navigate to the appropriate page
  if (mode === 'study') {
    router.push(`/${locale.value}/study/${difficulty.value}`);
  } else {
    // Map difficulty to quiz level (easy->junior, medium->intermediate, hard->senior)
    const difficultyToLevelMap: Record<DifficultyLevel, 'junior' | 'intermediate' | 'senior'> = {
      easy: 'junior',
      medium: 'intermediate',
      hard: 'senior',
    };
    const level = difficultyToLevelMap[difficulty.value];
    router.push(`/${locale.value}/quiz/${level}`);
  }
};

const goBack = () => {
  router.push(`/${locale.value}/select`);
};
</script>
