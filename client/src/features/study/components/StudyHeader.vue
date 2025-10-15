<template>
  <div class="mb-6 flex flex-wrap items-center justify-between gap-4">
    <div class="flex items-center gap-4">
      <button
        type="button"
        class="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
        @click="$emit('back')"
      >
        ← {{ t('study.backToSelection') }}
      </button>
      <div class="flex items-center gap-2">
        <span
          class="inline-flex items-center rounded-full px-3 py-1 text-sm font-medium"
          :class="difficultyBadgeClass"
        >
          {{ difficultyIcon }} {{ t(`difficulty.${difficulty}.label`) }}
        </span>
      </div>
    </div>

    <div class="flex items-center gap-4">
      <!-- Session Timer -->
      <div
        ref="timerElement"
        class="flex items-center gap-2 rounded-lg bg-blue-50 px-4 py-2 dark:bg-blue-900/20 md:static md:transform-none"
        :class="[isSticky ? 'fixed top-4 right-4 z-50 shadow-lg' : '']"
      >
        <svg class="h-5 w-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span class="text-lg font-semibold tabular-nums text-blue-600 dark:text-blue-400">
          {{ formattedTime }}
        </span>
        <div class="flex gap-1">
          <button
            v-if="!isPaused"
            type="button"
            class="rounded p-1 hover:bg-blue-100 dark:hover:bg-blue-800"
            @click="$emit('pause')"
            :title="t('study.pauseTimer')"
          >
            <svg class="h-4 w-4 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
            </svg>
          </button>
          <button
            v-else
            type="button"
            class="rounded p-1 hover:bg-blue-100 dark:hover:bg-blue-800"
            @click="$emit('resume')"
            :title="t('study.resumeTimer')"
          >
            <svg class="h-4 w-4 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clip-rule="evenodd" />
            </svg>
          </button>
          <button
            type="button"
            class="rounded p-1 hover:bg-blue-100 dark:hover:bg-blue-800"
            @click="$emit('reset')"
            :title="t('study.resetTimer')"
          >
            <svg class="h-4 w-4 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clip-rule="evenodd" />
            </svg>
          </button>
        </div>
      </div>

      <!-- Progress Counter -->
      <div class="text-sm text-gray-600 dark:text-gray-400">
        {{ currentIndex + 1 }} / {{ loadedCount }}
        <span v-if="totalAvailable > loadedCount" class="text-xs text-gray-500">
          ({{ totalAvailable }} total)
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';

interface Props {
  difficulty: 'easy' | 'medium' | 'hard';
  currentIndex: number;
  loadedCount: number;
  totalAvailable: number;
  sessionTime: number;
  isPaused: boolean;
  isSticky?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  isSticky: false,
});

defineEmits<{
  back: [];
  pause: [];
  resume: [];
  reset: [];
}>();

const { t } = useI18n();
const timerElement = ref<HTMLElement | null>(null);

const difficultyIcon = computed(() => {
  const icons = { easy: '🟢', medium: '🟡', hard: '🔴' };
  return icons[props.difficulty] || '⚪';
});

const difficultyBadgeClass = computed(() => {
  const classes = {
    easy: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    hard: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  };
  return classes[props.difficulty] || 'bg-gray-100 text-gray-800';
});

const formattedTime = computed(() => {
  const hours = Math.floor(props.sessionTime / 3600);
  const minutes = Math.floor((props.sessionTime % 3600) / 60);
  const seconds = props.sessionTime % 60;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
});
</script>
