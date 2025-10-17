<template>
  <div class="relative min-h-screen overflow-hidden bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
    <!-- Animated Background Elements -->
    <div class="pointer-events-none absolute inset-0 overflow-hidden">
      <div class="absolute -left-4 top-20 h-72 w-72 animate-blob rounded-full bg-blue-300 opacity-20 mix-blend-multiply blur-xl filter dark:bg-blue-600 dark:opacity-10"></div>
      <div class="animation-delay-2000 absolute right-4 top-40 h-72 w-72 animate-blob rounded-full bg-purple-300 opacity-20 mix-blend-multiply blur-xl filter dark:bg-purple-600 dark:opacity-10"></div>
      <div class="animation-delay-4000 absolute -bottom-8 left-1/3 h-72 w-72 animate-blob rounded-full bg-pink-300 opacity-20 mix-blend-multiply blur-xl filter dark:bg-pink-600 dark:opacity-10"></div>
    </div>

    <div class="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <!-- Header -->
      <div class="mb-10 text-center">
        <div class="mb-6 flex items-center justify-between">
          <button
            type="button"
            class="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white/80 px-5 py-2.5 text-sm font-medium text-gray-700 backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:border-purple-300 hover:bg-white hover:shadow-lg dark:border-gray-700 dark:bg-gray-800/80 dark:text-gray-300 dark:hover:border-purple-600 dark:hover:bg-gray-800"
            @click="goBack"
          >
            <svg class="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            {{ t('modeChooser.backToLevels') }}
          </button>
          <UserMenu v-if="authStore.isAuthenticated" />
        </div>

        <div class="mb-4 flex items-center justify-center">
          <div class="animate-fade-in-up rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 p-3 shadow-xl shadow-purple-500/30 dark:shadow-purple-500/20">
            <svg class="h-10 w-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
        </div>

        <h1 class="mb-3 animate-fade-in-up bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-3xl font-extrabold leading-tight text-transparent dark:from-blue-400 dark:to-purple-400 md:text-4xl md:leading-tight">
          {{ t('modeChooser.title') }}
        </h1>
        <p class="animation-delay-200 mx-auto max-w-2xl animate-fade-in-up text-base leading-relaxed text-gray-600 dark:text-gray-300">
          {{ t('modeChooser.subtitle', { difficulty: t(`difficulty.${difficulty}.label`) }) }}
        </p>

        <!-- Difficulty IBadge -->
        <div class="animation-delay-200 mt-5 animate-fade-in-up">
          <span
            class="inline-flex items-center gap-2 rounded-full px-5 py-2 text-sm font-semibold shadow-md backdrop-blur-sm transition-all duration-300 hover:scale-105"
            :class="getDifficultyBadgeClass(difficulty)"
          >
            <span class="text-base">{{ getDifficultyIcon(difficulty) }}</span>
            <span>{{ t(`difficulty.${difficulty}.label`) }}</span>
          </span>
        </div>
      </div>

      <!-- Mode Selection Cards -->
      <div class="mb-10 grid grid-cols-1 gap-6 md:grid-cols-2 lg:gap-8">
        <!-- Study Mode Card -->
        <ModeCard
          mode="study"
          :difficulty="difficulty"
          :icon="'📚'"
          :title="t('modeChooser.studyMode.title')"
          :description="t('modeChooser.studyMode.description')"
          :features="studyFeatures"
          :cta="t('modeChooser.studyMode.cta')"
          :gradient="'from-blue-600 to-cyan-600'"
          :hover-gradient="'from-blue-100 to-cyan-100'"
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
          :gradient="'from-purple-600 to-pink-600'"
          :hover-gradient="'from-purple-100 to-pink-100'"
          @select="handleModeSelect('quiz')"
        />
      </div>

      <!-- Comparison Table -->
      <div class="animate-fade-in-up rounded-3xl border-2 border-gray-200 bg-white/90 p-8 shadow-xl backdrop-blur-sm dark:border-gray-700 dark:bg-gray-800/90 md:p-10">
        <div class="mb-8 text-center">
          <h2 class="mb-2 text-3xl font-bold text-gray-900 dark:text-white">
            {{ t('modeChooser.comparison.title') }}
          </h2>
          <p class="text-base text-gray-600 dark:text-gray-400">Compare features side by side</p>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="border-b-2 border-gray-200 dark:border-gray-700">
                <th class="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  {{ t('modeChooser.comparison.feature') }}
                </th>
                <th class="px-6 py-4 text-center">
                  <div class="inline-flex flex-col items-center gap-2">
                    <div class="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-2xl shadow-md">
                      📚
                    </div>
                    <span class="text-sm font-semibold text-gray-900 dark:text-white">{{ t('modeChooser.studyMode.title') }}</span>
                  </div>
                </th>
                <th class="px-6 py-4 text-center">
                  <div class="inline-flex flex-col items-center gap-2">
                    <div class="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-2xl shadow-md">
                      🎯
                    </div>
                    <span class="text-sm font-semibold text-gray-900 dark:text-white">{{ t('modeChooser.quizMode.title') }}</span>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
              <tr v-for="comparison in comparisonFeatures" :key="comparison.key" class="transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50">
                <td class="px-6 py-5 text-sm font-medium text-gray-900 dark:text-white">
                  {{ t(`modeChooser.comparison.features.${comparison.key}`) }}
                </td>
                <td class="px-6 py-5 text-center">
                  <span v-if="comparison.study" class="inline-flex h-8 w-8 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400">
                    <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                    </svg>
                  </span>
                  <span v-else class="inline-flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-400 dark:bg-gray-700 dark:text-gray-600">
                    <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
                    </svg>
                  </span>
                </td>
                <td class="px-6 py-5 text-center">
                  <span v-if="comparison.quiz" class="inline-flex h-8 w-8 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400">
                    <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                    </svg>
                  </span>
                  <span v-else class="inline-flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-400 dark:bg-gray-700 dark:text-gray-600">
                    <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
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
import { useAuthStore } from '@/stores/auth';
import { usePreferencesStore } from '@/stores/preferences';
import ModeCard from '@/components/study/ModeCard.vue';
import UserMenu from '@/components/layout/UserMenu.vue';
import type { DifficultyLevel } from '@/types/plan/access';

const { t } = useI18n();
const router = useRouter();
const route = useRoute();
const { track } = useAnalytics();
const authStore = useAuthStore();
const preferencesStore = usePreferencesStore();

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

const handleModeSelect = async (mode: 'study' | 'quiz') => {
  // Check if user is authenticated
  if (!authStore.isAuthenticated) {
    // Redirect to login with return URL
    const returnUrl = mode === 'study'
      ? `/${locale.value}/study/${difficulty.value}`
      : `/${locale.value}/quiz/${difficultyToLevelMap[difficulty.value]}`;

    track('auth_required', {
      mode,
      difficulty: difficulty.value,
      source: 'mode_chooser_page',
      redirectTo: 'login',
    });

    await router.push(`/${locale.value}/login?redirect=${encodeURIComponent(returnUrl)}`);
    return;
  }

  // Track analytics
  track('mode_selected', {
    mode,
    difficulty: difficulty.value,
    source: 'mode_chooser_page',
  });

  // Save user preferences
  preferencesStore.setLastMode(mode);
  preferencesStore.setLastDifficulty(difficulty.value);

  // Navigate to the appropriate page
  if (mode === 'study') {
    // Study mode: Navigate to framework selection page
    router.push(`/${locale.value}/study/${difficulty.value}`);
  } else {
    // Quiz mode: Map difficulty to quiz level and navigate directly
    const level = difficultyToLevelMap[difficulty.value];
    router.push(`/${locale.value}/quiz/${level}`);
  }
};

// Helper map for difficulty to level conversion
const difficultyToLevelMap: Record<DifficultyLevel, 'junior' | 'intermediate' | 'senior'> = {
  easy: 'junior',
  medium: 'intermediate',
  hard: 'senior',
};

const goBack = () => {
  router.push(`/${locale.value}/select`);
};
</script>
