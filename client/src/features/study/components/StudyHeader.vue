<template>
  <div class="mb-6">
    <!-- Back button, mode badge, and difficulty badge -->
    <div class="flex items-center justify-between gap-4">
      <button type="button"
        class="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
        @click="$emit('back')">
        ← {{ t('study.backToSelection') }}
      </button>
      <div class="flex items-center gap-3">
        <!-- Study Mode Badge -->
        <span
          class="inline-flex items-center gap-2 rounded-full border-2 border-blue-200 bg-blue-50 px-4 py-1.5 text-sm font-semibold text-blue-700 shadow-sm dark:border-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
          <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
          {{ t('mode.study') }}
        </span>
        <span class="inline-flex items-center rounded-full px-3 py-1 text-sm font-medium" :class="difficultyBadgeClass">
          {{ difficultyIcon }} {{ t(`difficulty.${difficulty}.label`) }}
        </span>
        <UserMenu />
      </div>
    </div>

    <!-- Simple progress bar -->
    <div class="mt-4 h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
      <div class="h-full rounded-full bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-500"
        :style="{ width: progressPercentage + '%' }"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { IStudyHeaderProps as Props } from "@/types/components/study";
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import UserMenu from '@/components/layout/UserMenu.vue';



const props = defineProps<Props>();

defineEmits<{
  back: [];
}>();

const { t } = useI18n();

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

const progressPercentage = computed(() => {
  if (props.loadedCount === 0) return 0;
  return Math.round(((props.currentIndex + 1) / props.loadedCount) * 100);
});
</script>
