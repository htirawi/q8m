<template>
  <div class="achievement-timeline">
    <!-- Header -->
    <div v-if="showHeader" class="mb-6">
      <h2 class="mb-2 text-2xl font-bold text-gray-900 dark:text-white">
        IAchievement History
      </h2>
      <p class="text-sm text-gray-600 dark:text-gray-400">
        Your journey of learning and progress
      </p>
    </div>

    <!-- Filters -->
    <div v-if="showFilters" class="mb-6 flex flex-wrap gap-2">
      <button
        @click="selectedFilter = 'all'"
        class="rounded-lg px-4 py-2 text-sm font-medium transition-colors"
        :class="selectedFilter === 'all' ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'"
      >
        All
      </button>
      <button
        @click="selectedFilter = 'badges'"
        class="rounded-lg px-4 py-2 text-sm font-medium transition-colors"
        :class="selectedFilter === 'badges' ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'"
      >
        Badges
      </button>
      <button
        @click="selectedFilter = 'levels'"
        class="rounded-lg px-4 py-2 text-sm font-medium transition-colors"
        :class="selectedFilter === 'levels' ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'"
      >
        Level Ups
      </button>
      <button
        @click="selectedFilter === 'milestones'"
        class="rounded-lg px-4 py-2 text-sm font-medium transition-colors"
        :class="selectedFilter === 'milestones' ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'"
      >
        Milestones
      </button>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="space-y-4">
      <div v-for="i in 5" :key="i" class="flex gap-4">
        <div class="h-12 w-12 animate-pulse rounded-full bg-gray-200 dark:bg-gray-700"></div>
        <div class="flex-1 space-y-2">
          <div class="h-4 w-3/4 animate-pulse rounded bg-gray-200 dark:bg-gray-700"></div>
          <div class="h-3 w-1/2 animate-pulse rounded bg-gray-200 dark:bg-gray-700"></div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else-if="filteredAchievements.length === 0" class="py-12 text-center">
      <div class="mb-4 text-6xl">🎯</div>
      <h3 class="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
        No achievements yet
      </h3>
      <p class="text-gray-600 dark:text-gray-400">
        Start learning to earn badges and level up!
      </p>
    </div>

    <!-- Timeline -->
    <div v-else class="relative space-y-6">
      <!-- Timeline Line -->
      <div class="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-purple-500 via-indigo-500 to-purple-500 dark:from-purple-600 dark:via-indigo-600 dark:to-purple-600"></div>

      <!-- IAchievement Items -->
      <TransitionGroup name="timeline-item">
        <div
          v-for="achievement in paginatedAchievements"
          :key="achievement.id"
          class="relative flex gap-4"
        >
          <!-- Icon Circle -->
          <div class="relative z-10 flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full shadow-lg"
            :class="getIconClass(achievement.type)">
            <span class="text-2xl">{{ achievement.icon }}

</span>

            <!-- Pulse Animation for Recent -->
            <div v-if="isRecent(achievement.date)" class="absolute inset-0 animate-ping rounded-full" :class="getPulseClass(achievement.type)"></div>
          </div>

          <!-- Content Card -->
          <div
            class="group flex-1 cursor-pointer overflow-hidden rounded-xl border-2 transition-all hover:shadow-lg"
            :class="getCardClass(achievement.type)"
            @click="$emit('achievement-click', achievement)"
          >
            <div class="p-4">
              <!-- Header -->
              <div class="mb-2 flex items-start justify-between">
                <div>
                  <h4 class="font-bold text-gray-900 dark:text-white">
                    {{ achievement.title }}

                  </h4>
                  <p class="text-sm text-gray-600 dark:text-gray-400">
                    {{ achievement.description }}

                  </p>
                </div>
                <span
                  v-if="achievement.xp"
                  class="ml-2 flex-shrink-0 rounded-full bg-purple-100 px-2 py-1 text-xs font-bold text-purple-700 dark:bg-purple-900/40 dark:text-purple-300"
                >
                  +{{ achievement.xp }}

 XP
                </span>
              </div>

              <!-- Meta Info -->
              <div class="flex flex-wrap items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                <span class="flex items-center gap-1">
                  <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {{ formatDate(achievement.date) }}

                </span>

                <span v-if="achievement.rarity" class="flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold" :class="getRarityClass(achievement.rarity)">
                  {{ achievement.rarity }}

                </span>

                <span v-if="achievement.category" class="capitalize">
                  {{ achievement.category }}

                </span>
              </div>

              <!-- Additional Details (if expandable) -->
              <div v-if="achievement.details" class="mt-3 rounded-lg bg-gray-50 p-3 text-sm text-gray-700 dark:bg-gray-800/50 dark:text-gray-300">
                {{ achievement.details }}

              </div>
            </div>

            <!-- Hover Indicator -->
            <div class="h-1 bg-gradient-to-r from-transparent via-purple-500 to-transparent opacity-0 transition-opacity group-hover:opacity-100"></div>
          </div>
        </div>
      </TransitionGroup>

      <!-- Load More -->
      <div v-if="hasMore" class="flex justify-center pt-6">
        <button
          @click="loadMore"
          class="rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-3 font-semibold text-white shadow-lg transition-all hover:scale-105 hover:shadow-xl"
        >
          Load More
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { IAchievement, IAchievementTimelineProps as Props } from "@/types/components/gamification";
import { ref, computed } from 'vue';





const props = withDefaults(defineProps<Props>(), {
  loading: false,
  showHeader: true,
  showFilters: true,
  itemsPerPage: 10,
});

const emit = defineemits<{
  'achievement-click': [achievement: IAchievement];
  
}>();

const selectedFilter = ref<'all' | 'badges' | 'levels' | 'milestones'>('all');
const currentPage = ref(1);

const filteredAchievements = computed(() => {
  let filtered = props.achievements;

  if (selectedFilter.value === 'badges') {
    filtered = filtered.filter(a => a.type === 'badge');
  } else if (selectedFilter.value === 'levels') {
    filtered = filtered.filter(a => a.type === 'level');
  } else if (selectedFilter.value === 'milestones') {
    filtered = filtered.filter(a => a.type === 'milestone' || a.type === 'streak');
  }

  // Sort by date descending (most recent first)
  return filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
});

const paginatedAchievements = computed(() => {
  return filteredAchievements.value.slice(0, currentPage.value * props.itemsPerPage);
});

const hasMore = computed(() => {
  return paginatedAchievements.value.length < filteredAchievements.value.length;
});

function getIconClass(type: string): string {
  const classes = {
    badge: 'bg-gradient-to-br from-yellow-400 to-orange-500',
    level: 'bg-gradient-to-br from-purple-500 to-indigo-600',
    milestone: 'bg-gradient-to-br from-pink-500 to-rose-600',
    streak: 'bg-gradient-to-br from-orange-500 to-red-600',
  };
  return classes[type as keyof typeof classes] || classes.badge;
}

function getPulseClass(type: string): string {
  const classes = {
    badge: 'bg-yellow-400 opacity-75',
    level: 'bg-purple-500 opacity-75',
    milestone: 'bg-pink-500 opacity-75',
    streak: 'bg-orange-500 opacity-75',
  };
  return classes[type as keyof typeof classes] || classes.badge;
}

function getCardClass(type: string): string {
  const classes = {
    badge: 'border-yellow-200 bg-yellow-50/50 hover:border-yellow-300 dark:border-yellow-800 dark:bg-yellow-900/10 dark:hover:border-yellow-700',
    level: 'border-purple-200 bg-purple-50/50 hover:border-purple-300 dark:border-purple-800 dark:bg-purple-900/10 dark:hover:border-purple-700',
    milestone: 'border-pink-200 bg-pink-50/50 hover:border-pink-300 dark:border-pink-800 dark:bg-pink-900/10 dark:hover:border-pink-700',
    streak: 'border-orange-200 bg-orange-50/50 hover:border-orange-300 dark:border-orange-800 dark:bg-orange-900/10 dark:hover:border-orange-700',
  };
  return classes[type as keyof typeof classes] || classes.badge;
}

function getRarityClass(rarity: string): string {
  const classes = {
    common: 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
    rare: 'bg-blue-200 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
    epic: 'bg-purple-200 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
    legendary: 'bg-orange-200 text-orange-700 dark:bg-orange-900 dark:text-orange-300',
  };
  return classes[rarity as keyof typeof classes] || classes.common;
}

function formatDate(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - new Date(date).getTime();
  const minutes = Math.floor(diff / 60000);

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;

  return new Date(date).toLocaleDateString();
}

function isRecent(date: Date): boolean {
  const now = new Date();
  const diff = now.getTime() - new Date(date).getTime();
  const hours = diff / (1000 * 60 * 60);
  return hours < 24; // Recent if within last 24 hours
}

function loadMore() {
  currentPage.value++;
  emit('load-more');
}

</script>

<style scoped>
/* Timeline item transitions */
.timeline-item-enter-active {
  animation: timelineSlideIn 0.5s ease-out;
}

.timeline-item-leave-active {
  animation: timelineSlideOut 0.3s ease-in;
}

@keyframes timelineSlideIn {
  from {
    opacity: 0;
    transform: translateX(-30px);
  }

  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes timelineSlideOut {
  from {
    opacity: 1;
    transform: translateX(0);
  }

  to {
    opacity: 0;
    transform: translateX(30px);
  }
}
</style>
