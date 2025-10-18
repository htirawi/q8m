<template>
  <div class="recent-activity">
    <div class="recent-activity__header">
      <h3 class="recent-activity__title">{{ $t("dashboard.recentActivity") }}</h3>
      <button v-if="activities.length > displayLimit" class="recent-activity__toggle" @click="showAll = !showAll">
        {{ showAll ? $t('common.showLess') : $t('common.showAll')$t }}
      </button>
    </div>

    <TransitionGroup name="activity-list" tag="div" class="recent-activity__list">
      <div v-for="activity in displayedActivities" :key="activity.id" class="activity-item"
        @click="handleActivityClick(activity)">
        <div class="activity-item__icon" :class="`activity-item__icon--${activity.type}`">
          <span v-if="activity.icon">{{ activity.icon }} </span>
          <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 6v6l4 2" />
          </svg>
        </div>

        <div class="activity-item__content">
          <h4 class="activity-item__title">{{ activity.title ?? "" }}</h4>
          <p v-if="activity.description" class="activity-item__description">
            {{ activity.description ?? "" }}
          </p>
          <time class="activity-item__time" :datetime="activity.timestamp">
            {{ formatTime(activity.timestamp) }}
          </time>
        </div>

        <div v-if="activity.progress !== undefined" class="activity-item__progress">
          <div class="activity-item__progress-bar">
            <div class="activity-item__progress-fill" :style="{ width: `${activity.progress}%` }"></div>
          </div>
          <span class="activity-item__progress-text">{{ activity.progress }}%</span>
        </div>

        <button v-if="activity.actionable" class="activity-item__action" @click.stop="handleAction(activity)">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </button>
      </div>
    </TransitionGroup>

    <div v-if="activities.length === 0" class="recent-activity__empty">
      <div class="recent-activity__empty-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path d="M12 2v6m0 4v8m0-16a4 4 0 110 8 4 4 0 010-8z" />
        </svg>
      </div>
      <p class="recent-activity__empty-text">{{ $t("dashboard.noRecentActivity") }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";
import type { IActivity } from "@/types/components/common";

interface Props {
  activities: IActivity[];
  displayLimit?: number;
}

const props = withDefaults(defineProps<Props>(), {
  displayLimit: 5,
});

const emit = defineEmits<{
  "action-click": [activity: IActivity];
}>();

const { t, locale } = useI18n();
const router = useRouter();

const showAll = ref(false);

const displayedActivities = computed(() => {
  if (showAll.value) {
    return props.activities;
  }
  return props.activities.slice(0, props.displayLimit);
});

const formatTime = (timestamp: Date | string): string => {
  const date = typeof timestamp === "string" ? new Date(timestamp) : timestamp;
  const now = new Date();
  const diff = now.getTime() - date.getTime();

  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return t("time.justNow");
  if (minutes < 60) return t("time.minutesAgo", { count: minutes });
  if (hours < 24) return t("time.hoursAgo", { count: hours });
  if (days < 7) return t("time.daysAgo", { count: days });

  // Format as date for older activities
  return date.toLocaleDateString(locale.value, {
    month: "short",
    day: "numeric",
    year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
  });
};

const handleActivityClick = (activity: IActivity) => {
  emit("activity-click", activity);

  if (activity.actionUrl) {
    router.push(activity.actionUrl);
  }
};

const handleAction = (activity: IActivity) => {
  emit("action-click", activity);
};
</script>

<style scoped>
/* Container */
.recent-activity {
  @apply rounded-xl bg-white shadow-sm dark:bg-gray-800;
  @apply border border-gray-200 dark:border-gray-700;
  @apply p-6;
}

/* Header */
.recent-activity__header {
  @apply mb-4 flex items-center justify-between;
}

.recent-activity__title {
  @apply text-lg font-semibold text-gray-900 dark:text-white;
}

.recent-activity__toggle {
  @apply text-sm font-medium text-primary hover:text-primary-700;
  @apply transition-colors duration-fast;
}

/* Activity list */
.recent-activity__list {
  @apply space-y-3;
}

/* Activity item */
.activity-item {
  @apply flex items-start gap-3 rounded-lg p-3;
  @apply hover:bg-gray-50 dark:hover:bg-gray-700/30;
  @apply cursor-pointer transition-colors duration-fast;
  @apply border border-transparent hover:border-gray-200 dark:hover:border-gray-600;
}

/* Activity icon */
.activity-item__icon {
  @apply h-10 w-10 flex-shrink-0 rounded-lg;
  @apply flex items-center justify-center;
  @apply text-lg;
}

.activity-item__icon svg {
  @apply h-5 w-5;
}

.activity-item__icon--completion {
  @apply bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400;
}

.activity-item__icon--achievement {
  @apply bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400;
}

.activity-item__icon--progress {
  @apply bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400;
}

.activity-item__icon--unlock {
  @apply bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400;
}

.activity-item__icon--milestone {
  @apply bg-primary-100 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400;
}

/* Content */
.activity-item__content {
  @apply min-w-0 flex-1;
}

.activity-item__title {
  @apply text-sm font-medium text-gray-900 dark:text-white;
  @apply truncate;
}

.activity-item__description {
  @apply mt-0.5 text-xs text-gray-600 dark:text-gray-400;
  @apply line-clamp-2;
}

.activity-item__time {
  @apply mt-1 text-xs text-gray-500 dark:text-gray-500;
}

/* Progress */
.activity-item__progress {
  @apply flex-shrink-0;
}

.activity-item__progress-bar {
  @apply h-1.5 w-20 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700;
  @apply mb-1;
}

.activity-item__progress-fill {
  @apply h-full bg-gradient-to-r from-primary to-secondary;
  @apply transition-[width] duration-moderate;
}

.activity-item__progress-text {
  @apply text-xs font-medium text-gray-600 dark:text-gray-400;
}

/* Action button */
.activity-item__action {
  @apply h-6 w-6 flex-shrink-0 rounded;
  @apply text-gray-400 hover:text-gray-600 dark:hover:text-gray-300;
  @apply hover:bg-gray-100 dark:hover:bg-gray-700;
  @apply transition-all duration-fast;
}

.activity-item__action svg {
  @apply h-full w-full;
}

/* Empty state */
.recent-activity__empty {
  @apply py-8 text-center;
}

.recent-activity__empty-icon {
  @apply mx-auto mb-3 h-12 w-12;
  @apply text-gray-400 dark:text-gray-600;
}

.recent-activity__empty-icon svg {
  @apply h-full w-full;
}

.recent-activity__empty-text {
  @apply text-sm text-gray-600 dark:text-gray-400;
}

/* List transition */
.activity-list-enter-active,
.activity-list-leave-active {
  @apply transition-all duration-fast;
}

.activity-list-enter-from {
  @apply translate-x-4 opacity-0;
}

.activity-list-leave-to {
  @apply -translate-x-4 opacity-0;
}

.activity-list-move {
  @apply transition-transform duration-fast;
}

/* Utilities */
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
