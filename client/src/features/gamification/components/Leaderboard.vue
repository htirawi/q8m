<template>
  <div class="leaderboard">
    <!-- Header with filters -->
    <div class="mb-6">
      <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-4">
        Leaderboard
      </h2>

      <div class="flex flex-wrap gap-3">
        <!-- Time period filter -->
        <div class="flex gap-2">
          <button
            v-for="period in timePeriods"
            :key="period.value"
            @click="selectedPeriod = period.value"
            class="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            :class="selectedPeriod === period.value ? 'bg-purple-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'"
          >
            {{ period.label }}

          </button>
        </div>

        <!-- Scope filter -->
        <div class="flex gap-2">
          <button
            v-for="scope in scopes"
            :key="scope.value"
            @click="selectedScope = scope.value"
            class="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            :class="selectedScope === scope.value ? 'bg-indigo-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'"
          >
            {{ scope.label }}

          </button>
        </div>
      </div>
    </div>

    <!-- Loading state -->
    <div v-if="loading" class="space-y-3">
      <div v-for="i in 10" :key="i" class="bg-gray-200 dark:bg-gray-800 rounded-lg h-16 animate-pulse"></div>
    </div>

    <!-- Empty state -->
    <div v-else-if="entries.length === 0" class="text-center py-12">
      <div class="text-6xl mb-4">🏆</div>
      <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">
        No leaderboard data
      </h3>
      <p class="text-gray-600 dark:text-gray-400">
        Be the first to earn XP and appear on the leaderboard!
      </p>
    </div>

    <!-- Leaderboard content -->
    <div v-else>
      <!-- Top 3 Podium -->
      <div v-if="entries.length >= 3" class="mb-8 grid grid-cols-3 gap-4 items-end">
        <!-- 2nd Place -->
        <div class="text-center pb-4">
          <div class="relative inline-block mb-3">
            <div class="w-16 h-16 rounded-full bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center text-2xl font-bold text-white shadow-lg">
              {{ entries[1]?.displayName.charAt(0).toUpperCase() }}

            </div>
            <div class="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-gray-400 text-white text-xs font-bold px-2 py-0.5 rounded-full">
              2nd
            </div>
          </div>
          <div class="font-semibold text-sm text-gray-900 dark:text-white truncate">
            {{ entries[1]?.displayName }}

          </div>
          <div class="text-xs text-gray-600 dark:text-gray-400">
            Level {{ entries[1]?.level }}

          </div>
          <div class="text-lg font-bold text-purple-600 dark:text-purple-400 mt-1">
            {{ formatNumber(entries[1]?.score) }}

          </div>
        </div>

        <!-- 1st Place (taller) -->
        <div class="text-center">
          <div class="relative inline-block mb-3">
            <div class="w-20 h-20 rounded-full bg-gradient-to-br from-yellow-300 to-yellow-500 flex items-center justify-center text-3xl font-bold text-white shadow-xl ring-4 ring-yellow-200 dark:ring-yellow-700">
              {{ entries[0]?.displayName.charAt(0).toUpperCase() }}

            </div>
            <div class="absolute -top-8 left-1/2 transform -translate-x-1/2 text-4xl animate-bounce-subtle">
              👑
            </div>
            <div class="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-yellow-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
              1st
            </div>
          </div>
          <div class="font-bold text-gray-900 dark:text-white truncate">
            {{ entries[0]?.displayName }}

          </div>
          <div class="text-xs text-gray-600 dark:text-gray-400">
            Level {{ entries[0]?.level }}

          </div>
          <div class="text-2xl font-bold text-yellow-600 dark:text-yellow-400 mt-1">
            {{ formatNumber(entries[0]?.score) }}

          </div>
        </div>

        <!-- 3rd Place -->
        <div class="text-center pb-8">
          <div class="relative inline-block mb-3">
            <div class="w-14 h-14 rounded-full bg-gradient-to-br from-amber-600 to-amber-700 flex items-center justify-center text-xl font-bold text-white shadow-lg">
              {{ entries[2]?.displayName.charAt(0).toUpperCase() }}

            </div>
            <div class="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-amber-700 text-white text-xs font-bold px-2 py-0.5 rounded-full">
              3rd
            </div>
          </div>
          <div class="font-semibold text-xs text-gray-900 dark:text-white truncate">
            {{ entries[2]?.displayName }}

          </div>
          <div class="text-xs text-gray-600 dark:text-gray-400">
            Level {{ entries[2]?.level }}

          </div>
          <div class="text-base font-bold text-amber-600 dark:text-amber-400 mt-1">
            {{ formatNumber(entries[2]?.score) }}

          </div>
        </div>
      </div>

      <!-- Remaining entries -->
      <div class="space-y-2">
        <div
          v-for="entry in remainingEntries"
          :key="entry.userId"
          class="flex items-center gap-4 p-4 rounded-lg transition-all"
          :class="[
            entry.userId === currentUserId ? 'bg-purple-50 dark:bg-purple-900/20 border-2 border-purple-500 shadow-md' : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700',
            'hover:shadow-lg'
          ]"
        >
          <!-- Rank -->
          <div class="w-8 text-center">
            <div class="text-lg font-bold text-gray-600 dark:text-gray-400">
              #{{ entry.rank }}

            </div>
          </div>

          <!-- Avatar -->
          <div class="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-indigo-500 flex items-center justify-center text-white font-bold shadow-md">
            {{ entry.displayName.charAt(0).toUpperCase() }}

          </div>

          <!-- User info -->
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2">
              <div class="font-semibold text-gray-900 dark:text-white truncate">
                {{ entry.displayName }}

              </div>
              <div v-if="entry.userId === currentUserId" class="text-xs bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 px-2 py-0.5 rounded-full font-medium">
                You
              </div>
            </div>
            <div class="flex items-center gap-3 text-xs text-gray-600 dark:text-gray-400">
              <span>Level {{ entry.level }}

</span>
              <span>•</span>
              <span>{{ entry.streak }}

-day streak</span>
              <span v-if="entry.badges.length > 0">•</span>
              <span v-if="entry.badges.length > 0">{{ entry.badges.length }}

 badges</span>
            </div>
          </div>

          <!-- Score -->
          <div class="text-right">
            <div class="text-xl font-bold text-purple-600 dark:text-purple-400">
              {{ formatNumber(entry.score) }}
            </div>
            <div class="text-xs text-gray-500 dark:text-gray-400">XP</div>
          </div>
        </div>
      </div>

      <!-- User's rank (if not in visible list) -->
      <div v-if="userRank && userRank.rank > entries.length" class="mt-6 p-4 bg-purple-50 dark:bg-purple-900/20 border-2 border-purple-500 rounded-lg">
        <div class="text-center mb-2">
          <div class="text-xs text-gray-600 dark:text-gray-400 mb-1">Your Rank</div>
          <div class="text-2xl font-bold text-purple-600 dark:text-purple-400">
            #{{ userRank.rank }}
          </div>
          <div class="text-sm text-gray-600 dark:text-gray-400">
            Top {{ userRank.percentile }}%
          </div>
        </div>
        <div class="text-center text-xs text-gray-500 dark:text-gray-400">
          {{ formatNumber(userRank.score) }} XP
        </div>
      </div>

      <!-- Last updated -->
      <div class="mt-6 text-center text-xs text-gray-500 dark:text-gray-400">
        Last updated {{ formatRelativeTime(lastUpdated) }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ILeaderboardEntry, IUserRank, ILeaderboardProps as Props } from "@/types/components/gamification";
import { ref, computed } from 'vue';







const props = withDefaults(defineProps<Props>(), {
  loading: false,
  lastUpdated: () => new Date(),
});

const emit = defineEmits<{
  periodChange: [period: string];
  scopeChange: [scope: string];
}>();

const selectedPeriod = ref('weekly');
const selectedScope = ref('global');

const timePeriods = [
  { value: 'weekly', label: 'This Week' },
  { value: 'monthly', label: 'This Month' },
  { value: 'all_time', label: 'All Time' },
];

const scopes = [
  { value: 'global', label: 'Global' },
  { value: 'plan_tier', label: 'My Tier' },
];

const remainingEntries = computed(() => {
  return props.entries.slice(3);
});

function formatNumber(num: number): string {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  return num.toString();
}

function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - new Date(date).getTime();
  const minutes = Math.floor(diff / 60000);

  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;

  const days = Math.floor(hours / 24);
  return `${days} day${days > 1 ? 's' : ''} ago`;
}

// Watch for changes and emit events
watch(() => selectedPeriod.value, (newVal) => {
  emit('periodChange', newVal);
});

watch(() => selectedScope.value, (newVal) => {
  emit('scopeChange', newVal);
});
</script>

<script lang="ts">
import { watch } from 'vue';
</script>

<style scoped>
@keyframes bounce-subtle {
  0%, 100% {
    transform: translateY(0);
  }

  50% {
    transform: translateY(-8px);
  }
}

.animate-bounce-subtle {
  animation: bounce-subtle 2s infinite;
}
</style>
