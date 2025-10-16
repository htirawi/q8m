<template>
  <div class="mt-6 space-y-6">
    <!-- Previous/Next Navigation with Timer -->
    <div class="rounded-lg bg-white p-4 shadow-sm dark:bg-gray-800">
      <div class="flex items-center justify-between gap-4">
        <!-- Previous Button -->
        <button
          type="button"
          :disabled="currentIndex === 0"
          :class="[
            'flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors',
            currentIndex === 0
              ? 'cursor-not-allowed bg-gray-100 text-gray-400 dark:bg-gray-700 dark:text-gray-500'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600',
          ]"
          @click="$emit('previous')"
        >
          <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
          {{ t('study.previous') }}
        </button>

        <!-- Session Timer (Center) -->
        <div class="flex flex-col items-center gap-1">
          <span class="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
            {{ t('study.studyTime') }}
          </span>
          <div class="text-xl font-semibold tabular-nums text-gray-700 dark:text-gray-300">
            {{ formatTime(sessionTime) }}
          </div>
          <div class="flex items-center gap-2">
            <button
              type="button"
              :title="isPaused ? t('study.resume') : t('study.pause')"
              class="rounded p-1 text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-200"
              @click="isPaused ? $emit('resume') : $emit('pause')"
            >
              <svg v-if="isPaused" class="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
              </svg>
              <svg v-else class="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M5.75 3a.75.75 0 00-.75.75v12.5c0 .414.336.75.75.75h1.5a.75.75 0 00.75-.75V3.75A.75.75 0 007.25 3h-1.5zM12.75 3a.75.75 0 00-.75.75v12.5c0 .414.336.75.75.75h1.5a.75.75 0 00.75-.75V3.75a.75.75 0 00-.75-.75h-1.5z" />
              </svg>
            </button>
            <button
              type="button"
              :title="t('study.reset')"
              class="rounded p-1 text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-200"
              @click="$emit('reset')"
            >
              <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>
        </div>

        <!-- Next Button -->
        <button
          type="button"
          :disabled="currentIndex >= loadedCount - 1"
          :class="[
            'flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors',
            currentIndex >= loadedCount - 1
              ? 'cursor-not-allowed bg-gray-100 text-gray-400 dark:bg-gray-700 dark:text-gray-500'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600',
          ]"
          @click="$emit('next')"
        >
          {{ t('study.next') }}
          <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>

    <!-- Quick Navigation Grid -->
    <div class="rounded-lg bg-white p-6 shadow-sm dark:bg-gray-800">
      <div class="mb-4 flex items-center justify-between">
        <h3 class="font-semibold text-gray-900 dark:text-white">
          {{ t('study.quickNavigation') }}
        </h3>
        <span class="text-sm text-gray-600 dark:text-gray-400">
          {{ loadedCount }} / {{ totalAvailable }} loaded
        </span>
      </div>
      <div class="grid grid-cols-10 gap-2 sm:grid-cols-15 md:grid-cols-20">
        <button
          v-for="(_, idx) in loadedCount"
          :key="idx"
          type="button"
          :class="getNavButtonClass(idx)"
          @click="$emit('jump', idx)"
        >
          {{ idx + 1 }}
        </button>
      </div>

      <!-- Load More Button -->
      <button
        v-if="hasMore"
        type="button"
        class="mt-4 w-full rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 px-4 py-3 text-sm font-medium text-gray-700 hover:border-primary-500 hover:bg-primary-50 hover:text-primary-700 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:border-primary-400 dark:hover:bg-primary-900/20 dark:hover:text-primary-400"
        :disabled="isLoadingMore"
        @click="$emit('load-more')"
      >
        <span v-if="isLoadingMore" class="flex items-center justify-center gap-2">
          <svg class="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          {{ t('study.loading') }}
        </span>
        <span v-else>
          {{ t('study.loadMore') }} ({{ totalAvailable - loadedCount }} {{ t('study.remaining') }})
        </span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { IStudyNavigationProps as Props } from "@/types/components/study";
import { useI18n } from 'vue-i18n';



const props = defineProps<Props>();

defineEmits<{
  jump: [index: number];
  'load-more': [];
  previous: [];
  next: [];
  pause: [];
  resume: [];
  reset: [];
}>();

const { t } = useI18n();

const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const getNavButtonClass = (idx: number) => {
  const baseClass = 'h-10 w-10 rounded text-sm font-medium transition-colors';

  if (idx === props.currentIndex) {
    return `${baseClass} bg-primary-600 text-white`;
  }

  return `${baseClass} bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600`;
};
</script>
