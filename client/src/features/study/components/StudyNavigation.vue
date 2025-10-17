<template>
  <div class="mt-6 space-y-6">
    <!-- Previous/Next Navigation (Study Mode - No Timer) -->
    <div class="rounded-lg bg-white p-4 shadow-sm dark:bg-gray-800">
      <div class="flex items-center justify-center gap-4">
        <!-- Previous Button -->
        <button type="button" :disabled="currentIndex === 0" :class="[
          'flex items-center gap-2 rounded-lg px-6 py-3 text-sm font-medium transition-all duration-200',
          currentIndex === 0
            ? 'cursor-not-allowed bg-gray-100 text-gray-400 dark:bg-gray-700 dark:text-gray-500'
            : 'bg-primary-600 text-white hover:bg-primary-700 hover:shadow-md dark:bg-primary-500 dark:hover:bg-primary-600',
        ]" @click="$emit('previous')">
          <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
          {{ t('study.previous') }}
        </button>

        <!-- Next Button -->
        <button type="button" :disabled="currentIndex >= loadedCount - 1" :class="[
          'flex items-center gap-2 rounded-lg px-6 py-3 text-sm font-medium transition-all duration-200',
          currentIndex >= loadedCount - 1
            ? 'cursor-not-allowed bg-gray-100 text-gray-400 dark:bg-gray-700 dark:text-gray-500'
            : 'bg-primary-600 text-white hover:bg-primary-700 hover:shadow-md dark:bg-primary-500 dark:hover:bg-primary-600',
        ]" @click="$emit('next')">
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
        <button v-for="(_, idx) in loadedCount" :key="idx" type="button" :class="getNavButtonClass(idx)"
          @click="$emit('jump', idx)">
          {{ idx + 1 }}
        </button>
      </div>

      <!-- Load More Button -->
      <button v-if="hasMore" type="button"
        class="mt-4 w-full rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 px-4 py-3 text-sm font-medium text-gray-700 hover:border-primary-500 hover:bg-primary-50 hover:text-primary-700 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:border-primary-400 dark:hover:bg-primary-900/20 dark:hover:text-primary-400"
        :disabled="isLoadingMore" @click="$emit('load-more')">
        <span v-if="isLoadingMore" class="flex items-center justify-center gap-2">
          <svg class="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
            </path>
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
}>();

const { t } = useI18n();

const getNavButtonClass = (idx: number) => {
  const baseClass = 'h-10 w-10 rounded text-sm font-medium transition-colors';

  if (idx === props.currentIndex) {
    return `${baseClass} bg-primary-600 text-white`;
  }

  return `${baseClass} bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600`;
};
</script>
