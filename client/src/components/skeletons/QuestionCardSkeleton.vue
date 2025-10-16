<template>
  <div class="question-card-skeleton">
    <div class="question-card-skeleton-container">
      <!-- Header -->
      <div class="question-card-skeleton-header">
        <SkeletonLoader variant="text" width="40%" height="20px" />
        <SkeletonLoader variant="circle" width="32px" height="32px" />
      </div>

      <!-- Question text -->
      <div class="question-card-skeleton-question">
        <SkeletonLoader variant="text" width="100%" height="16px" />
        <SkeletonLoader variant="text" width="90%" height="16px" />
        <SkeletonLoader variant="text" width="70%" height="16px" />
      </div>

      <!-- Code block (optional) -->
      <div v-if="showCode" class="question-card-skeleton-code">
        <SkeletonLoader variant="rounded" width="100%" height="120px" />
      </div>

      <!-- Options -->
      <div class="question-card-skeleton-options">
        <div v-for="i in 4" :key="i" class="question-card-skeleton-option">
          <SkeletonLoader variant="circle" width="20px" height="20px" />
          <SkeletonLoader variant="text" width="80%" height="14px" />
        </div>
      </div>

      <!-- Actions -->
      <div class="question-card-skeleton-actions">
        <SkeletonLoader variant="rounded" width="120px" height="40px" />
        <SkeletonLoader variant="rounded" width="120px" height="40px" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { IQuestionCardSkeletonProps as Props } from "@/types/components/skeletons";
import SkeletonLoader from '@/components/SkeletonLoader.vue';



withDefaults(defineProps<Props>(), {
  showCode: false,
});
</script>

<style scoped>
.question-card-skeleton {
  @apply bg-white dark:bg-gray-800;
  @apply rounded-2xl shadow-lg;
  @apply p-6;
  @apply border-2 border-gray-100 dark:border-gray-700;
}

.question-card-skeleton-container {
  @apply space-y-6;
}

.question-card-skeleton-header {
  @apply flex justify-between items-center;
}

.question-card-skeleton-question {
  @apply space-y-3;
}

.question-card-skeleton-code {
  @apply my-4;
}

.question-card-skeleton-options {
  @apply space-y-3;
}

.question-card-skeleton-option {
  @apply flex items-center gap-3;
  @apply p-3 rounded-lg;
  @apply border-2 border-gray-200 dark:border-gray-700;
}

.question-card-skeleton-actions {
  @apply flex gap-4 justify-center;
  @apply pt-4 border-t border-gray-200 dark:border-gray-700;
}
</style>
