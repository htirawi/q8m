<template>
  <div class="card-list-skeleton">
    <div v-for="i in count" :key="i" class="card-list-skeleton-item">
      <!-- Image/Icon -->
      <div v-if="showImage" class="card-list-skeleton-image">
        <SkeletonLoader variant="rounded" width="100%" height="160px" />
      </div>

      <!-- Content -->
      <div class="card-list-skeleton-content">
        <!-- Title -->
        <SkeletonLoader variant="text" width="80%" height="20px" />

        <!-- Description -->
        <div class="card-list-skeleton-description">
          <SkeletonLoader variant="text" width="100%" height="14px" />
          <SkeletonLoader variant="text" width="90%" height="14px" />
          <SkeletonLoader variant="text" width="60%" height="14px" />
        </div>

        <!-- Meta -->
        <div v-if="showMeta" class="card-list-skeleton-meta">
          <SkeletonLoader variant="text" width="60px" height="12px" />
          <SkeletonLoader variant="text" width="60px" height="12px" />
          <SkeletonLoader variant="text" width="60px" height="12px" />
        </div>

        <!-- Actions -->
        <div v-if="showActions" class="card-list-skeleton-actions">
          <SkeletonLoader variant="rounded" width="100px" height="36px" />
          <SkeletonLoader variant="rounded" width="100px" height="36px" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ICardListSkeletonProps as Props } from "@/types/components/skeletons";
import SkeletonLoader from '@/components/SkeletonLoader.vue';



withDefaults(defineProps<Props>(), {
  count: 3,
  showImage: true,
  showMeta: true,
  showActions: true,
  columns: 3,
});
</script>

<style scoped>
.card-list-skeleton {
  @apply grid gap-6;
  @apply grid-cols-1;
  @apply md:grid-cols-2;
  @apply lg:grid-cols-3;
}

.card-list-skeleton-item {
  @apply bg-white dark:bg-gray-800;
  @apply rounded-xl shadow-md;
  @apply border border-gray-200 dark:border-gray-700;
  @apply overflow-hidden;
}

.card-list-skeleton-image {
  @apply w-full;
}

.card-list-skeleton-content {
  @apply p-6 space-y-4;
}

.card-list-skeleton-description {
  @apply space-y-2;
}

.card-list-skeleton-meta {
  @apply flex gap-4;
}

.card-list-skeleton-actions {
  @apply flex gap-3 pt-4;
  @apply border-t border-gray-200 dark:border-gray-700;
}

/* Responsive */
@media (width <= 768px) {
  .card-list-skeleton {
    @apply grid-cols-1;
  }
}
</style>
