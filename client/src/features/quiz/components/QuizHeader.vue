<template>
  <div class="mb-6 sm:mb-8">
    <!-- Header -->
    <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div class="flex items-center gap-3 sm:gap-4">
        <button
          type="button"
          class="group inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white/80 px-4 py-2.5 text-sm font-medium text-gray-700 backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:border-purple-300 hover:bg-white hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-purple-500 focus:ring-offset-2 dark:border-gray-700 dark:bg-gray-800/80 dark:text-gray-300 dark:hover:border-purple-600 dark:hover:bg-gray-800 dark:focus:ring-purple-400"
          aria-label="Exit quiz"
          @click="$emit('exit')"
        >
          <svg class="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          {{ t('quiz.exit') }}
        </button>
        <div class="flex items-center gap-2">
          <span
            class="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold shadow-md backdrop-blur-sm transition-all duration-300 hover:scale-105"
            :class="levelBadgeClass"
          >
            <span class="text-base">{{ levelIcon }}</span>
            <span>{{ t(`level.${level}.label`) }}</span>
          </span>
        </div>
      </div>
      <div class="flex items-center gap-3 sm:gap-4">
        <!-- Countdown Timer -->
        <div
          ref="timerElement"
          class="flex items-center gap-2 rounded-xl border px-4 py-2.5 shadow-md backdrop-blur-sm transition-all duration-300 md:static md:transform-none"
          :class="[timerBgColor, timerBorderClass, isSticky ? 'fixed top-4 right-4 z-50 shadow-2xl' : '']"
        >
          <svg class="h-5 w-5 flex-shrink-0" :class="timerColor" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span class="text-xl font-bold tabular-nums" :class="timerColor">
            {{ timeFormatted }}
          </span>
        </div>
        <div class="flex items-center gap-2 rounded-xl border border-gray-200 bg-white/80 px-3 py-2 text-sm font-semibold text-gray-700 backdrop-blur-sm dark:border-gray-700 dark:bg-gray-800/80 dark:text-gray-300">
          <span class="text-purple-600 dark:text-purple-400">{{ currentIndex + 1 }}</span>
          <span class="text-gray-400">/</span>
          <span>{{ totalQuestions }}</span>
        </div>
      </div>
    </div>

    <!-- Time Warning Banner -->
    <div
      v-if="remainingTime <= 300 && remainingTime > 0"
      class="mt-4 animate-fade-in-up rounded-xl border border-yellow-200 bg-yellow-50/80 p-4 backdrop-blur-sm dark:border-yellow-800 dark:bg-yellow-900/20 sm:mt-5"
      role="alert"
    >
      <div class="flex items-start gap-3">
        <div class="flex-shrink-0 rounded-full bg-yellow-100 p-2 dark:bg-yellow-900/30">
          <svg class="h-5 w-5 text-yellow-600 dark:text-yellow-400" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
            <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
          </svg>
        </div>
        <div class="flex-1">
          <p class="text-sm font-semibold text-yellow-800 dark:text-yellow-200">
            {{ t('quiz.timeWarning', { minutes: Math.ceil(remainingTime / 60) }) }}
          </p>
          <p class="mt-1 text-xs text-yellow-700 dark:text-yellow-300">
            Hurry up! Complete the remaining questions before time runs out.
          </p>
        </div>
      </div>
    </div>

    <!-- Progress Bar -->
    <div class="mt-5 sm:mt-6">
      <div class="mb-2 flex items-center justify-between text-xs font-medium">
        <span class="text-gray-600 dark:text-gray-400">Progress</span>
        <span class="text-purple-600 dark:text-purple-400">{{ Math.round(progress) }}%</span>
      </div>
      <div class="h-2.5 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
        <div
          class="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-600 shadow-sm transition-all duration-500"
          :style="{ width: `${progress}%` }"
        ></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { IQuizHeaderProps as Props } from "@/types/components/quiz";
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';



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
    junior: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800',
    intermediate: 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-800',
    senior: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800',
  };
  return classes[props.level] || 'bg-gray-100 text-gray-800 border-gray-200';
});

const timerColor = computed(() => {
  const percentage = (props.remainingTime / props.quizDuration) * 100;
  if (percentage > 33) return 'text-green-600 dark:text-green-400';
  if (percentage > 10) return 'text-yellow-600 dark:text-yellow-400';
  return 'text-red-600 dark:text-red-400 animate-pulse';
});

const timerBgColor = computed(() => {
  const percentage = (props.remainingTime / props.quizDuration) * 100;
  if (percentage > 33) return 'bg-green-50/80 dark:bg-green-900/20';
  if (percentage > 10) return 'bg-yellow-50/80 dark:bg-yellow-900/20';
  return 'bg-red-50/80 dark:bg-red-900/20';
});

const timerBorderClass = computed(() => {
  const percentage = (props.remainingTime / props.quizDuration) * 100;
  if (percentage > 33) return 'border-green-200 dark:border-green-800';
  if (percentage > 10) return 'border-yellow-200 dark:border-yellow-800';
  return 'border-red-200 dark:border-red-800';
});

const timeFormatted = computed(() => {
  const mins = Math.floor(props.remainingTime / 60);
  const secs = props.remainingTime % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
});
</script>
