<template>
  <div class="recommendations">
    <div class="recommendations__header">
      <h3 class="recommendations__title">{{ $t("dashboard.recommendations") }}</h3>
      <button v-if="showRefresh" class="recommendations__refresh" :disabled="isRefreshing" @click="handleRefresh">
        <svg class="recommendations__refresh-icon" :class="{ 'animate-spin': isRefreshing }" viewBox="0 0 24 24"
          fill="none" stroke="currentColor">
          <path d="M1 4v6h6M23 20v-6h-6M20.49 9A9 9 0 005.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 013.51 15" />
        </svg>
        <span class="recommendations__refresh-text">{{ $t("common.refresh") }}</span>
      </button>
    </div>

    <div class="recommendations__grid">
      <div v-for="(item, index) in items" :key="item.id" class="recommendation-card" :class="{
        'recommendation-card--new': item.isNew,
        'recommendation-card--featured': item.isFeatured,
      }" :style="{ '--animation-delay': `${index * 100}ms` }" @click="handleItemClick(item)">
        <!-- Badge -->
        <div v-if="item.isNew" class="recommendation-card__badge recommendation-card__badge--new">
          {{ $t("common.new") }}
        </div>
        <div v-else-if="item.isFeatured" class="recommendation-card__badge recommendation-card__badge--featured">
          {{ $t("common.featured") }}
        </div>

        <!-- Icon/Thumbnail -->
        <div class="recommendation-card__visual">
          <img v-if="item.thumbnail" :src="item.thumbnail" :alt="item.title" class="recommendation-card__thumbnail" />
          <div v-else class="recommendation-card__icon" :class="`recommendation-card__icon--${item.type}`">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path v-if="item.type === 'course'"
                d="M12 14l9-5-9-5-9 5 9 5z M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
              <path v-else-if="item.type === 'practice'" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              <path v-else-if="item.type === 'challenge'" d="M13 10V3L4 14h7v7l9-11h-7z" />
              <path v-else
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
        </div>

        <!-- Content -->
        <div class="recommendation-card__content">
          <h4 class="recommendation-card__title">{{ item.title ?? "" }}</h4>
          <p class="recommendation-card__description">{{ item.description ?? "" }}</p>

          <!-- Metadata -->
          <div class="recommendation-card__meta">
            <span v-if="item.duration" class="recommendation-card__meta-item">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 6v6l4 2" />
              </svg>
              {{ item.duration }}
            </span>
            <span v-if="item.difficulty" class="recommendation-card__meta-item">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path
                  d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
              {{ $t(`difficulty.${item.difficulty}`) }}
            </span>
          </div>

          <!-- Progress (if continue type) -->
          <div v-if="item.type === 'continue' && item.progress !== undefined" class="recommendation-card__progress">
            <div class="recommendation-card__progress-bar">
              <div class="recommendation-card__progress-fill" :style="{ width: `${item.progress}%` }"></div>
            </div>
            <span class="recommendation-card__progress-text">{{ item.progress }}% {{ $t("common.complete") }}
            </span>
          </div>
        </div>

        <!-- Action -->
        <button class="recommendation-card__action">
          <span v-if="item.type === 'continue'">{{ $t("actions.continue") }} </span>
          <span v-else-if="item.type === 'practice'">{{ $t("actions.practice") }} </span>
          <span v-else-if="item.type === 'challenge'">{{ $t("actions.start") }} </span>
          <span v-else>{{ $t("actions.learn") }} </span>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>

    <!-- Empty state -->
    <div v-if="items.length === 0" class="recommendations__empty">
      <div class="recommendations__empty-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path
            d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      </div>
      <p class="recommendations__empty-text">{{ $t("dashboard.noRecommendations") }}</p>
      <button class="recommendations__empty-button" @click="$emit('explore')">
        {{ $t("actions.exploreContent") }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";

export interface recommendation {
  id: string;
  type: "continue" | "recommended" | "practice" | "challenge" | "course";
  title: string;
  description: string;
  thumbnail?: string;
  duration?: string;
  difficulty?: "junior" | "intermediate" | "senior";
  progress?: number;
  isNew?: boolean;
  isFeatured?: boolean;
  actionUrl?: string;
  metadata?: Record<string, any>;
}

interface Recommendation {
  id: string;
  type: string;
  title: string;
  description?: string;
  priority?: "high" | "medium" | "low";
  category?: string;
  difficulty?: string;
  estimatedTime?: number;
  [key: string]: unknown;
}

interface Props {
  items: Recommendation[];
  showRefresh?: boolean;
}

const _props = withDefaults(defineProps<Props>(), {
  showRefresh: true,
});

const emit = defineEmits<{
  "item-click": [item: IRecommendation];
}>();

const router = useRouter();

const isRefreshing = ref(false);

const handleItemClick = (item: IRecommendation) => {
  emit("item-click", item);

  if (item.actionUrl) {
    router.push(item.actionUrl);
  }
};

const handleRefresh = async () => {
  isRefreshing.value = true;
  emit("refresh");

  // Simulate refresh delay
  setTimeout(() => {
    isRefreshing.value = false;
  }, 1000);
};
</script>

<style scoped>
/* Container */
.recommendations {
  @apply rounded-xl bg-white shadow-sm dark:bg-gray-800;
  @apply border border-gray-200 dark:border-gray-700;
  @apply p-6;
}

/* Header */
.recommendations__header {
  @apply mb-6 flex items-center justify-between;
}

.recommendations__title {
  @apply text-lg font-semibold text-gray-900 dark:text-white;
}

.recommendations__refresh {
  @apply flex items-center gap-2;
  @apply rounded-lg px-3 py-1.5;
  @apply text-sm font-medium text-gray-600 dark:text-gray-400;
  @apply hover:bg-gray-100 dark:hover:bg-gray-700;
  @apply transition-colors duration-fast;
  @apply disabled:cursor-not-allowed disabled:opacity-50;
}

.recommendations__refresh-icon {
  @apply h-4 w-4;
}

.recommendations__refresh-text {
  @apply hidden sm:inline;
}

/* Grid */
.recommendations__grid {
  @apply grid grid-cols-1 gap-4 md:grid-cols-2;
}

/* Recommendation card */
.recommendation-card {
  @apply relative overflow-hidden;
  @apply rounded-lg bg-gray-50 dark:bg-gray-900/50;
  @apply border border-gray-200 dark:border-gray-700;
  @apply p-4;
  @apply hover:border-primary-300 dark:hover:border-primary-700;
  @apply hover:shadow-md;
  @apply cursor-pointer transition-all duration-fast;
  @apply flex gap-4;

  animation: fade-in-up 0.6s ease-out var(--animation-delay, 0ms) backwards;
}

.recommendation-card--new {
  @apply border-green-200 dark:border-green-800;
  @apply bg-gradient-to-br from-green-50/50 to-transparent dark:from-green-900/20;
}

.recommendation-card--featured {
  @apply border-primary-200 dark:border-primary-800;
  @apply bg-gradient-to-br from-primary-50/50 to-transparent dark:from-primary-900/20;
}

/* Badge */
.recommendation-card__badge {
  @apply absolute right-2 top-2;
  @apply rounded-full px-2 py-0.5;
  @apply text-xs font-bold uppercase tracking-wider;
}

.recommendation-card__badge--new {
  @apply bg-green-500 text-white;
}

.recommendation-card__badge--featured {
  @apply bg-primary text-white;
}

/* Visual */
.recommendation-card__visual {
  @apply flex-shrink-0;
}

.recommendation-card__thumbnail {
  @apply h-20 w-20 rounded-lg object-cover;
}

.recommendation-card__icon {
  @apply h-20 w-20 rounded-lg;
  @apply flex items-center justify-center;
}

.recommendation-card__icon svg {
  @apply h-10 w-10;
}

.recommendation-card__icon--course {
  @apply bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400;
}

.recommendation-card__icon--practice {
  @apply bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400;
}

.recommendation-card__icon--challenge {
  @apply bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400;
}

.recommendation-card__icon--continue,
.recommendation-card__icon--recommended {
  @apply bg-primary-100 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400;
}

/* Content */
.recommendation-card__content {
  @apply min-w-0 flex-1;
}

.recommendation-card__title {
  @apply text-base font-semibold text-gray-900 dark:text-white;
  @apply mb-1 line-clamp-1;
}

.recommendation-card__description {
  @apply text-sm text-gray-600 dark:text-gray-400;
  @apply mb-2 line-clamp-2;
}

/* Metadata */
.recommendation-card__meta {
  @apply flex items-center gap-3;
  @apply text-xs text-gray-500 dark:text-gray-500;
}

.recommendation-card__meta-item {
  @apply flex items-center gap-1;
}

.recommendation-card__meta-item svg {
  @apply h-3 w-3;
}

/* Progress */
.recommendation-card__progress {
  @apply mt-3;
}

.recommendation-card__progress-bar {
  @apply h-1.5 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700;
}

.recommendation-card__progress-fill {
  @apply h-full bg-gradient-to-r from-primary to-secondary;
  @apply transition-[width] duration-moderate;
}

.recommendation-card__progress-text {
  @apply mt-1 text-xs text-gray-600 dark:text-gray-400;
}

/* Action button */
.recommendation-card__action {
  @apply absolute bottom-4 right-4;
  @apply flex items-center gap-1;
  @apply rounded-lg px-3 py-1.5;
  @apply bg-white dark:bg-gray-800;
  @apply text-xs font-medium text-primary-600 dark:text-primary-400;
  @apply border border-primary-200 dark:border-primary-800;
  @apply hover:bg-primary-50 dark:hover:bg-primary-900/30;
  @apply transition-all duration-fast;
}

.recommendation-card__action svg {
  @apply h-3 w-3;
}

.recommendation-card:hover .recommendation-card__action {
  @apply scale-105 shadow-sm;
}

/* Empty state */
.recommendations__empty {
  @apply py-12 text-center;
}

.recommendations__empty-icon {
  @apply mx-auto mb-4 h-16 w-16;
  @apply text-gray-400 dark:text-gray-600;
}

.recommendations__empty-icon svg {
  @apply h-full w-full;
}

.recommendations__empty-text {
  @apply mb-4 text-gray-600 dark:text-gray-400;
}

.recommendations__empty-button {
  @apply rounded-lg px-4 py-2;
  @apply bg-primary text-white;
  @apply hover:bg-primary-700;
  @apply transition-colors duration-fast;
}

/* Animation */
@keyframes fade-in-up {
  from {
    opacity: 0;
    transform: translateY(20px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Utilities */
.line-clamp-1 {
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
