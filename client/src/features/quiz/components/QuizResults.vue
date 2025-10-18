<template>
  <div class="animate-fade-in-up space-y-6">
    <div
      class="overflow-hidden rounded-3xl border-2 border-gray-200 bg-white/90 shadow-2xl backdrop-blur-sm dark:border-gray-700 dark:bg-gray-800/90">
      <!-- Celebration Header -->
      <div
        class="relative overflow-hidden bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-8 text-center dark:from-gray-800 dark:via-gray-700 dark:to-gray-800 sm:p-10">
        <!-- Decorative Elements -->
        <div class="pointer-events-none absolute inset-0 overflow-hidden">
          <div
            class="absolute -left-4 -top-4 h-32 w-32 animate-blob rounded-full bg-blue-300 opacity-20 mix-blend-multiply blur-xl filter dark:bg-blue-600">
          </div>
          <div
            class="animation-delay-2000 absolute -right-4 -bottom-4 h-32 w-32 animate-blob rounded-full bg-purple-300 opacity-20 mix-blend-multiply blur-xl filter dark:bg-purple-600">
          </div>
        </div>

        <div class="relative">
          <!-- Animated Emoji -->
          <div class="mb-6 inline-block animate-bounce-slow text-7xl sm:text-8xl">
            {{ resultEmoji }}

          </div>

          <!-- Title -->
          <h2
            class="mb-3 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-4xl font-extrabold text-transparent dark:from-blue-400 dark:via-purple-400 dark:to-pink-400 sm:text-5xl">
            {{ t('quiz.results.title') }}

          </h2>

          <!-- Subtitle with IBadge -->
          <div class="flex items-center justify-center gap-2">
            <span
              class="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold shadow-md backdrop-blur-sm"
              :class="levelBadgeClass">
              <span class="text-base">{{ levelIcon }}

</span>
              <span>{{ t(`level.${level}.label`) }} {{ t('quiz.results.levelQuiz') }}

</span>
            </span>
          </div>

          <!-- Performance Message -->
          <p class="mt-4 text-sm font-medium text-gray-600 dark:text-gray-400">
            {{ performanceMessage }}

          </p>
        </div>
      </div>

      <!-- Stats Grid -->
      <div class="grid gap-4 p-6 sm:grid-cols-3 sm:p-8">
        <!-- Correct Answers -->
        <div
          class="group relative overflow-hidden rounded-2xl border-2 border-blue-200 bg-blue-50/80 p-6 text-center backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:shadow-lg dark:border-blue-800 dark:bg-blue-900/20">
          <div class="mb-3 flex justify-center">
            <div class="rounded-full bg-blue-100 p-3 dark:bg-blue-900/30">
              <svg class="h-6 w-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor"
                viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div class="mb-2 text-4xl font-extrabold text-blue-900 dark:text-blue-200">
            {{ score.correct }}<span class="text-2xl text-blue-600 dark:text-blue-400">/{{ score.total }}

</span>
          </div>
          <div class="text-xs font-semibold uppercase tracking-wide text-blue-700 dark:text-blue-300">
            {{ t('quiz.results.correctAnswers') }}

          </div>
        </div>

        <!-- Accuracy Percentage -->
        <div
          class="group relative overflow-hidden rounded-2xl border-2 border-green-200 bg-green-50/80 p-6 text-center backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:shadow-lg dark:border-green-800 dark:bg-green-900/20">
          <div class="mb-3 flex justify-center">
            <div class="rounded-full bg-green-100 p-3 dark:bg-green-900/30">
              <svg class="h-6 w-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor"
                viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
          </div>
          <div class="mb-2 text-4xl font-extrabold text-green-900 dark:text-green-200">
            {{ score.percentage }}

<span class="text-2xl">%</span>
          </div>
          <div class="text-xs font-semibold uppercase tracking-wide text-green-700 dark:text-green-300">
            {{ t('quiz.results.accuracy') }}

          </div>
        </div>

        <!-- Time Spent -->
        <div
          class="group relative overflow-hidden rounded-2xl border-2 border-purple-200 bg-purple-50/80 p-6 text-center backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:shadow-lg dark:border-purple-800 dark:bg-purple-900/20">
          <div class="mb-3 flex justify-center">
            <div class="rounded-full bg-purple-100 p-3 dark:bg-purple-900/30">
              <svg class="h-6 w-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor"
                viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div class="mb-2 text-4xl font-extrabold tabular-nums text-purple-900 dark:text-purple-200">
            {{ timeFormatted }}

          </div>
          <div class="text-xs font-semibold uppercase tracking-wide text-purple-700 dark:text-purple-300">
            {{ t('quiz.results.timeSpent') }}

          </div>
        </div>
      </div>

      <!-- Gamification Rewards (if available) -->
      <div v-if="hasGamificationData && quizResultData"
        class="border-t border-gray-200 px-6 py-6 dark:border-gray-700 sm:px-8">
        <h3 class="mb-4 text-center text-lg font-bold text-gray-900 dark:text-white">
          🎉 {{ t('quiz.results.rewards') || 'Rewards Earned' }}

        </h3>

        <div class="space-y-3">
          <!-- XP Earned -->
          <div
            class="rounded-xl border-2 border-purple-200 bg-purple-50/80 backdrop-blur-sm dark:border-purple-800 dark:bg-purple-900/20">
            <div class="flex items-center justify-between p-4">
              <div class="flex items-center gap-3">
                <div class="rounded-full bg-purple-100 p-2 dark:bg-purple-900/30">
                  <span class="text-2xl">⭐</span>
                </div>
                <div>
                  <div class="text-sm font-medium text-purple-900 dark:text-purple-100">
                    {{ t('quiz.results.xpEarned') || 'Experience Points' }}

                  </div>
                  <div class="text-xs text-purple-700 dark:text-purple-300">
                    {{ t('quiz.results.keepLearning') || 'Keep learning to level up!' }}
                  </div>
                </div>
              </div>
              <div class="flex items-center gap-3">
                <div class="text-2xl font-black text-purple-600 dark:text-purple-400">
                  +
                  <AnimatedCounter :value="quizResultData?.xpEarned || 0" :duration="1500" :delay="300"
                    :format="(value) => Math.round(value).toString()" />
                </div>
                <button v-if="hasXPBreakdown" @click="showXPBreakdown = true"
                  class="rounded-lg bg-purple-100 px-3 py-1.5 text-xs font-semibold text-purple-700 transition-colors hover:bg-purple-200 dark:bg-purple-900/40 dark:text-purple-300 dark:hover:bg-purple-900/60">
                  Details
                </button>
              </div>
            </div>

            <!-- Compact XP Breakdown (if available) -->
            <div v-if="hasXPBreakdown && !showXPBreakdown"
              class="border-t border-purple-200 px-4 py-3 dark:border-purple-800">
              <XPBreakdown :breakdown="quizResultData!.xpBreakdown!" variant="compact" :show-tips="false" />
            </div>
          </div>

          <!-- Badges Earned -->
          <div v-if="quizResultData?.badgesEarned && quizResultData.badgesEarned.length > 0"
            class="rounded-xl border-2 border-yellow-200 bg-yellow-50/80 p-4 backdrop-blur-sm dark:border-yellow-800 dark:bg-yellow-900/20">
            <div class="mb-2 flex items-center gap-2">
              <span class="text-2xl">🏆</span>
              <div class="text-sm font-semibold text-yellow-900 dark:text-yellow-100">
                {{ t('quiz.results.newBadges') || 'New Badges Unlocked!' }}

              </div>
            </div>
            <div class="flex flex-wrap gap-2">
              <span v-for="badge in quizResultData?.badgesEarned || []" :key="badge"
                class="inline-flex items-center rounded-full bg-yellow-100 px-3 py-1 text-xs font-medium text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300">
                {{ badge }}

              </span>
            </div>
          </div>

          <!-- Streak Maintained -->
          <div
            class="flex items-center gap-2 rounded-xl border-2 border-orange-200 bg-orange-50/80 p-4 backdrop-blur-sm dark:border-orange-800 dark:bg-orange-900/20">
            <span class="text-2xl">🔥</span>
            <div class="text-sm font-medium text-orange-900 dark:text-orange-100">
              {{ t('quiz.results.streakMaintained') || 'Daily streak maintained!' }}

            </div>
          </div>

          <!-- Strong Categories -->
          <div v-if="quizResultData?.strongCategories && quizResultData.strongCategories.length > 0"
            class="rounded-xl border-2 border-green-200 bg-green-50/80 p-4 backdrop-blur-sm dark:border-green-800 dark:bg-green-900/20">
            <div class="mb-2 flex items-center gap-2">
              <span class="text-xl">💪</span>
              <div class="text-sm font-semibold text-green-900 dark:text-green-100">
                {{ t('quiz.results.strongCategories') || 'Strong Categories' }}

              </div>
            </div>
            <div class="flex flex-wrap gap-2">
              <span v-for="category in quizResultData?.strongCategories || []" :key="category"
                class="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-800 dark:bg-green-900/40 dark:text-green-300">
                {{ category }}

              </span>
            </div>
          </div>

          <!-- Weak Categories -->
          <div v-if="quizResultData?.weakCategories && quizResultData.weakCategories.length > 0"
            class="rounded-xl border-2 border-blue-200 bg-blue-50/80 p-4 backdrop-blur-sm dark:border-blue-800 dark:bg-blue-900/20">
            <div class="mb-2 flex items-center gap-2">
              <span class="text-xl">📚</span>
              <div class="text-sm font-semibold text-blue-900 dark:text-blue-100">
                {{ t('quiz.results.needsPractice') || 'Areas for Improvement' }}

              </div>
            </div>
            <div class="flex flex-wrap gap-2">
              <span v-for="category in quizResultData?.weakCategories || []" :key="category"
                class="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800 dark:bg-blue-900/40 dark:text-blue-300">
                {{ category }}

              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="border-t border-gray-200 bg-gray-50/50 p-6 dark:border-gray-700 dark:bg-gray-800/50 sm:p-8">
        <div class="flex flex-col justify-center gap-3 sm:flex-row sm:gap-4">
          <button type="button"
            class="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 via-purple-500 to-pink-600 px-8 py-3.5 font-semibold text-white shadow-lg transition-all duration-300 hover:scale-105 hover:from-blue-600 hover:via-purple-600 hover:to-pink-700 hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-purple-500 focus:ring-offset-2"
            @click="$emit('retry')">
            <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            {{ t('quiz.results.tryAgain') }}

          </button>
          <button type="button"
            class="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-gray-200 bg-white/80 px-8 py-3.5 font-semibold text-gray-700 backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:border-purple-300 hover:bg-white hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-purple-500 focus:ring-offset-2 dark:border-gray-700 dark:bg-gray-800/80 dark:text-gray-300 dark:hover:border-purple-600 dark:hover:bg-gray-800"
            @click="$emit('exit')">
            <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            {{ t('quiz.results.backToSelection') }}

          </button>
        </div>
      </div>
    </div>

    <!-- XP Breakdown Modal -->
    <Teleport to="body">
      <div v-if="showXPBreakdown && hasXPBreakdown"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
        @click="showXPBreakdown = false">
        <div
          class="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border-2 border-gray-200 bg-white shadow-2xl dark:border-gray-700 dark:bg-gray-800"
          @click.stop>
          <div
            class="sticky top-0 z-10 flex items-center justify-between border-b border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
            <h3 class="text-xl font-bold text-gray-900 dark:text-white">XP Breakdown</h3>
            <button @click="showXPBreakdown = false"
              class="rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-200">
              <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div class="p-6">
            <XPBreakdown :breakdown="quizResultData!.xpBreakdown!" variant="card" :show-tips="true" />
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import XPBreakdown from '@/features/gamification/components/XPBreakdown.vue';
import AnimatedCounter from '@/components/AnimatedCounter.vue';
import type { IQuizResultsProps as Props } from "@/types/components/quiz";

const props = defineProps<Props>();

defineEmits<{
  retry: [];
  exit: [];
}>();

const { t } = useI18n();

const showXPBreakdown = ref(false);

const hasGamificationData = computed(() => props.quizResultData !== null && props.quizResultData !== undefined);

const hasXPBreakdown = computed(() => {
  return hasGamificationData.value && props.quizResultData?.xpBreakdown && Object.keys(props.quizResultData.xpBreakdown).length > 0;
});

const levelIcon = computed(() => {
  const icons = { junior: '🟢', intermediate: '🟡', senior: '🔴' };
  return icons[props.level] || '⚪';
});

const levelBadgeClass = computed(() => {
  const classes = {
    junior: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800',
    intermediate: 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-800',
    senior: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800',
  };
  return classes[props.level] || 'bg-gray-100 text-gray-800 border-gray-200';
});

const resultEmoji = computed(() => {
  if (props.score.percentage >= 90) return '🏆';
  if (props.score.percentage >= 80) return '🎉';
  if (props.score.percentage >= 70) return '👍';
  if (props.score.percentage >= 60) return '👌';
  return '📚';
});

const performanceMessage = computed(() => {
  if (props.score.percentage >= 90) return 'Outstanding performance! You\'re a quiz master!';
  if (props.score.percentage >= 80) return 'Excellent work! You really know your stuff!';
  if (props.score.percentage >= 70) return 'Great job! You\'re on the right track!';
  if (props.score.percentage >= 60) return 'Good effort! Keep practicing to improve!';
  return 'Keep learning! Practice makes perfect!';
});

const timeFormatted = computed(() => {
  const mins = Math.floor(props.score.timeSpent / 60);
  const secs = props.score.timeSpent % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
});
</script>
