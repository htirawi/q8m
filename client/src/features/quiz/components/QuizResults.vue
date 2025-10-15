<template>
  <div class="space-y-6">
    <div class="rounded-lg bg-white p-8 shadow-sm dark:bg-gray-800">
      <div class="mb-6 text-center">
        <div class="mb-4 text-6xl">
          {{ resultEmoji }}
        </div>
        <h2 class="mb-2 text-3xl font-bold text-gray-900 dark:text-white">
          {{ t('quiz.results.title') }}
        </h2>
        <p class="text-lg text-gray-600 dark:text-gray-400">
          {{ t(`level.${level}.label`) }} {{ t('quiz.results.levelQuiz') }}
        </p>
      </div>

      <div class="grid gap-4 md:grid-cols-3">
        <div class="rounded-lg bg-blue-50 p-6 text-center dark:bg-blue-900/20">
          <div class="mb-2 text-3xl font-bold text-blue-900 dark:text-blue-200">
            {{ score.correct }}/{{ score.total }}
          </div>
          <div class="text-sm text-blue-700 dark:text-blue-300">
            {{ t('quiz.results.correctAnswers') }}
          </div>
        </div>

        <div class="rounded-lg bg-green-50 p-6 text-center dark:bg-green-900/20">
          <div class="mb-2 text-3xl font-bold text-green-900 dark:text-green-200">
            {{ score.percentage }}%
          </div>
          <div class="text-sm text-green-700 dark:text-green-300">
            {{ t('quiz.results.accuracy') }}
          </div>
        </div>

        <div class="rounded-lg bg-purple-50 p-6 text-center dark:bg-purple-900/20">
          <div class="mb-2 text-3xl font-bold text-purple-900 dark:text-purple-200">
            {{ timeFormatted }}
          </div>
          <div class="text-sm text-purple-700 dark:text-purple-300">
            {{ t('quiz.results.timeSpent') }}
          </div>
        </div>
      </div>

      <div class="mt-8 flex flex-wrap justify-center gap-4">
        <button
          type="button"
          class="rounded-lg bg-primary-600 px-6 py-3 font-medium text-white hover:bg-primary-700"
          @click="$emit('retry')"
        >
          {{ t('quiz.results.tryAgain') }}
        </button>
        <button
          type="button"
          class="rounded-lg border border-gray-300 bg-white px-6 py-3 font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
          @click="$emit('exit')"
        >
          {{ t('quiz.results.backToSelection') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

interface Props {
  level: 'junior' | 'intermediate' | 'senior';
  score: {
    correct: number;
    total: number;
    percentage: number;
    timeSpent: number;
  };
}

const props = defineProps<Props>();

defineEmits<{
  retry: [];
  exit: [];
}>();

const { t } = useI18n();

const resultEmoji = computed(() => {
  if (props.score.percentage >= 90) return '🏆';
  if (props.score.percentage >= 80) return '🎉';
  if (props.score.percentage >= 70) return '👍';
  if (props.score.percentage >= 60) return '👌';
  return '📚';
});

const timeFormatted = computed(() => {
  const mins = Math.floor(props.score.timeSpent / 60);
  const secs = props.score.timeSpent % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
});
</script>
