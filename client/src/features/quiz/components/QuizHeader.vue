<template>
  <div class="mb-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-4">
        <button
          type="button"
          class="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
          @click="$emit('exit')"
        >
          ← {{ t('quiz.exit') }}
        </button>
        <div class="flex items-center gap-2">
          <span
            class="inline-flex items-center rounded-full px-3 py-1 text-sm font-medium"
            :class="levelBadgeClass"
          >
            {{ levelIcon }} {{ t(`level.${level}.label`) }}
          </span>
        </div>
      </div>
      <div class="flex items-center gap-4">
        <!-- Countdown Timer -->
        <div
          ref="timerElement"
          class="flex items-center gap-2 rounded-lg px-4 py-2 transition-colors md:static md:transform-none"
          :class="[timerBgColor, isSticky ? 'fixed top-4 right-4 z-50 shadow-lg' : '']"
        >
          <svg class="h-5 w-5" :class="timerColor" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span class="text-xl font-bold tabular-nums" :class="timerColor">
            {{ timeFormatted }}
          </span>
        </div>
        <div class="text-sm text-gray-600 dark:text-gray-400">
          {{ currentIndex + 1 }} / {{ totalQuestions }}
        </div>
      </div>
    </div>

    <!-- Time Warning Banner -->
    <div
      v-if="remainingTime <= 300 && remainingTime > 0"
      class="mt-4 rounded-lg border-l-4 border-yellow-500 bg-yellow-50 p-4 dark:bg-yellow-900/20"
      role="alert"
    >
      <div class="flex items-center">
        <svg class="mr-3 h-5 w-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
        </svg>
        <p class="text-sm font-medium text-yellow-800 dark:text-yellow-200">
          {{ t('quiz.timeWarning', { minutes: Math.ceil(remainingTime / 60) }) }}
        </p>
      </div>
    </div>

    <!-- Progress Bar -->
    <div class="mt-6 h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
      <div
        class="h-full bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-300"
        :style="{ width: `${progress}%` }"
      ></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';

interface Props {
  level: 'junior' | 'intermediate' | 'senior';
  currentIndex: number;
  totalQuestions: number;
  remainingTime: number;
  quizDuration: number;
  isSticky?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  isSticky: false,
});

defineEmits<{
  exit: [];
}>();

const { t } = useI18n();
const timerElement = ref<HTMLElement | null>(null);

const progress = computed(() => ((props.currentIndex + 1) / props.totalQuestions) * 100);

const levelIcon = computed(() => {
  const icons = { junior: '🟢', intermediate: '🟡', senior: '🔴' };
  return icons[props.level] || '⚪';
});

const levelBadgeClass = computed(() => {
  const classes = {
    junior: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    intermediate: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    senior: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  };
  return classes[props.level] || 'bg-gray-100 text-gray-800';
});

const timerColor = computed(() => {
  const percentage = (props.remainingTime / props.quizDuration) * 100;
  if (percentage > 33) return 'text-green-600 dark:text-green-400';
  if (percentage > 10) return 'text-yellow-600 dark:text-yellow-400';
  return 'text-red-600 dark:text-red-400 animate-pulse';
});

const timerBgColor = computed(() => {
  const percentage = (props.remainingTime / props.quizDuration) * 100;
  if (percentage > 33) return 'bg-green-50 dark:bg-green-900/20';
  if (percentage > 10) return 'bg-yellow-50 dark:bg-yellow-900/20';
  return 'bg-red-50 dark:bg-red-900/20';
});

const timeFormatted = computed(() => {
  const mins = Math.floor(props.remainingTime / 60);
  const secs = props.remainingTime % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
});
</script>
