<template>
  <div class="xp-display">
    <!-- Compact view (for header) -->
    <div v-if="variant === 'compact'" class="compact-view">
      <button
        @click="$emit('click')"
        class="flex items-center gap-3 rounded-lg bg-gradient-to-r from-purple-500 to-indigo-600 px-4 py-2 text-white shadow-md transition-all hover:from-purple-600 hover:to-indigo-700 hover:shadow-lg"
      >
        <div class="flex items-center gap-2">
          <span class="text-2xl">⭐</span>
          <div class="text-left">
            <div class="text-xs opacity-80">Level {{ level }}</div>
            <div class="text-sm font-bold">{{ levelTitle }}</div>
          </div>
        </div>
        <div class="h-8 w-px bg-white/30"></div>
        <div class="text-right">
          <div class="text-xs opacity-80">XP</div>
          <div class="text-sm font-bold">{{ formatNumber(xp) }}</div>
        </div>
      </button>
    </div>

    <!-- Card view (for dashboard) -->
    <div v-else-if="variant === 'card'" class="card-view">
      <div
        class="rounded-xl border-2 border-purple-300 bg-gradient-to-br from-purple-50 to-indigo-50 p-6 shadow-lg dark:border-purple-700 dark:from-purple-900/20 dark:to-indigo-900/20"
      >
        <!-- Header -->
        <div class="mb-4 flex items-center justify-between">
          <h3 class="flex items-center gap-2 text-lg font-bold text-gray-900 dark:text-white">
            <span class="text-3xl">⭐</span>
            Level & XP
          </h3>
        </div>

        <!-- Level Display -->
        <div class="mb-6 text-center">
          <div
            class="mb-2 bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-5xl font-bold text-transparent"
          >
            {{ level }}
          </div>
          <div class="mb-1 text-xl font-semibold text-gray-900 dark:text-white">
            {{ levelTitle }}
          </div>
          <div class="text-sm text-gray-600 dark:text-gray-400">
            {{ formatNumber(xp) }}

            Total XP
          </div>
        </div>

        <!-- Progress to next level -->
        <div class="mb-4">
          <div class="mb-2 flex justify-between text-xs text-gray-600 dark:text-gray-400">
            <span>Level {{ level }} </span>
            <span>Level {{ level + 1 }}</span>
          </div>
          <div class="h-3 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
            <div
              class="relative h-3 overflow-hidden rounded-full bg-gradient-to-r from-purple-500 to-indigo-600 transition-all duration-500"
              :style="{ width: `${levelProgress}%` }"
            >
              <div class="absolute inset-0 animate-pulse bg-white/20"></div>
            </div>
          </div>
          <div class="mt-2 text-center text-xs text-gray-600 dark:text-gray-400">
            {{ formatNumber(xpToNextLevel) }}

            XP to next level
          </div>
        </div>

        <!-- Stats -->
        <div class="grid grid-cols-2 gap-4">
          <div class="rounded-lg bg-white/50 p-3 text-center dark:bg-gray-800/50">
            <div class="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {{ levelProgress }}%
            </div>
            <div class="text-xs text-gray-600 dark:text-gray-400">Progress</div>
          </div>
          <div class="rounded-lg bg-white/50 p-3 text-center dark:bg-gray-800/50">
            <div class="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
              {{ formatNumber(xpToNextLevel) }}
            </div>
            <div class="text-xs text-gray-600 dark:text-gray-400">XP Needed</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Detailed view (for modal) -->
    <div v-else class="detailed-view">
      <div class="space-y-6">
        <!-- Hero Section -->
        <div class="text-center">
          <div class="mb-4 text-6xl">⭐</div>
          <h2 class="mb-2 text-3xl font-bold text-gray-900 dark:text-white">
            Level {{ level }} - {{ levelTitle }}
          </h2>
          <p class="text-gray-600 dark:text-gray-400">
            {{ formatNumber(xp) }}

            Total XP Earned
          </p>
        </div>

        <!-- Progress Bar -->
        <div>
          <div class="mb-2 flex justify-between text-sm text-gray-600 dark:text-gray-400">
            <span>Level {{ level }} </span>
            <span>{{ levelProgress }}% Complete</span>
            <span>Level {{ level + 1 }}</span>
          </div>
          <div class="h-4 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
            <div
              class="relative h-4 overflow-hidden rounded-full bg-gradient-to-r from-purple-500 via-indigo-500 to-purple-600 transition-all duration-500"
              :style="{ width: `${levelProgress}%` }"
            >
              <div
                class="absolute inset-0 animate-shimmer bg-gradient-to-r from-transparent via-white/20 to-transparent"
              ></div>
            </div>
          </div>
          <div class="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            <strong>{{ formatNumber(xpToNextLevel) }} XP</strong> needed to reach
            {{ nextLevelTitle }}
          </div>
        </div>

        <!-- Stats Grid -->
        <div class="grid grid-cols-3 gap-4">
          <div
            class="rounded-lg border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-purple-100 p-4 text-center dark:border-purple-800 dark:from-purple-900/20 dark:to-purple-900/30"
          >
            <div class="text-3xl font-bold text-purple-600 dark:text-purple-400">
              {{ level }}
            </div>
            <div class="mt-1 text-sm text-gray-600 dark:text-gray-400">Current Level</div>
          </div>
          <div
            class="rounded-lg border-2 border-indigo-200 bg-gradient-to-br from-indigo-50 to-indigo-100 p-4 text-center dark:border-indigo-800 dark:from-indigo-900/20 dark:to-indigo-900/30"
          >
            <div class="text-3xl font-bold text-indigo-600 dark:text-indigo-400">
              {{ formatNumber(xp) }}
            </div>
            <div class="mt-1 text-sm text-gray-600 dark:text-gray-400">Total XP</div>
          </div>
          <div
            class="rounded-lg border-2 border-pink-200 bg-gradient-to-br from-pink-50 to-pink-100 p-4 text-center dark:border-pink-800 dark:from-pink-900/20 dark:to-pink-900/30"
          >
            <div class="text-3xl font-bold text-pink-600 dark:text-pink-400">
              {{ levelProgress }}%
            </div>
            <div class="mt-1 text-sm text-gray-600 dark:text-gray-400">Progress</div>
          </div>
        </div>

        <!-- Level Titles -->
        <div>
          <h3 class="mb-3 text-lg font-semibold text-gray-900 dark:text-white">
            Level Progression
          </h3>
          <div class="space-y-2">
            <div
              v-for="levelInfo in levelTitles"
              :key="levelInfo.min"
              class="flex items-center gap-3 rounded-lg p-3"
              :class="
                level >= levelInfo.min && level <= levelInfo.max
                  ? 'border-2 border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                  : 'bg-gray-50 dark:bg-gray-800'
              "
            >
              <div
                class="flex h-10 w-10 items-center justify-center rounded-full"
                :class="
                  level >= levelInfo.min && level <= levelInfo.max
                    ? 'bg-purple-500 text-white'
                    : 'bg-gray-300 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                "
              >
                <span v-if="level >= levelInfo.min && level <= levelInfo.max">⭐</span>
                <span v-else-if="level > levelInfo.max">✓</span>
                <span v-else>{{ levelInfo.min }} </span>
              </div>
              <div class="flex-1">
                <div class="font-semibold text-gray-900 dark:text-white">
                  {{ levelInfo.title }}
                </div>
                <div class="text-xs text-gray-500 dark:text-gray-400">
                  Levels {{ levelInfo.min }}-{{ levelInfo.max }}
                </div>
              </div>
              <div
                v-if="level >= levelInfo.min && level <= levelInfo.max"
                class="font-bold text-purple-600 dark:text-purple-400"
              >
                Current
              </div>
              <div v-else-if="level > levelInfo.max" class="text-green-600 dark:text-green-400">
                <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fill-rule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clip-rule="evenodd"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <!-- XP Earning Guide -->
        <div>
          <h3 class="mb-3 text-lg font-semibold text-gray-900 dark:text-white">Ways to Earn XP</h3>
          <div class="space-y-2">
            <div
              class="flex items-center justify-between rounded-lg bg-gray-50 p-3 dark:bg-gray-800"
            >
              <div class="flex items-center gap-3">
                <span class="text-2xl">📚</span>
                <span class="text-sm text-gray-900 dark:text-white">Study correct (first try)</span>
              </div>
              <span class="font-bold text-purple-600 dark:text-purple-400">+20 XP</span>
            </div>
            <div
              class="flex items-center justify-between rounded-lg bg-gray-50 p-3 dark:bg-gray-800"
            >
              <div class="flex items-center gap-3">
                <span class="text-2xl">✅</span>
                <span class="text-sm text-gray-900 dark:text-white">Complete quiz</span>
              </div>
              <span class="font-bold text-purple-600 dark:text-purple-400">+25 XP</span>
            </div>
            <div
              class="flex items-center justify-between rounded-lg bg-gray-50 p-3 dark:bg-gray-800"
            >
              <div class="flex items-center gap-3">
                <span class="text-2xl">🎯</span>
                <span class="text-sm text-gray-900 dark:text-white">Perfect quiz score</span>
              </div>
              <span class="font-bold text-purple-600 dark:text-purple-400">+100 XP</span>
            </div>
            <div
              class="flex items-center justify-between rounded-lg bg-gray-50 p-3 dark:bg-gray-800"
            >
              <div class="flex items-center gap-3">
                <span class="text-2xl">🔥</span>
                <span class="text-sm text-gray-900 dark:text-white">7-day streak</span>
              </div>
              <span class="font-bold text-purple-600 dark:text-purple-400">+150 XP</span>
            </div>
            <div
              class="flex items-center justify-between rounded-lg bg-gray-50 p-3 dark:bg-gray-800"
            >
              <div class="flex items-center gap-3">
                <span class="text-2xl">🏆</span>
                <span class="text-sm text-gray-900 dark:text-white">30-day streak</span>
              </div>
              <span class="font-bold text-purple-600 dark:text-purple-400">+1,000 XP</span>
            </div>
            <div
              class="flex items-center justify-between rounded-lg bg-gray-50 p-3 dark:bg-gray-800"
            >
              <div class="flex items-center gap-3">
                <span class="text-2xl">🎖️</span>
                <span class="text-sm text-gray-900 dark:text-white">Earn badges</span>
              </div>
              <span class="font-bold text-purple-600 dark:text-purple-400">Varies</span>
            </div>
          </div>
        </div>

        <!-- Pro Tip -->
        <div
          class="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20"
        >
          <div class="flex items-start gap-3">
            <span class="text-2xl">💡</span>
            <div>
              <div class="mb-1 font-semibold text-blue-900 dark:text-blue-100">Pro Tip</div>
              <div class="text-sm text-blue-800 dark:text-blue-200">
                Complete quizzes with high scores and maintain your daily streak to level up faster!
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { IXPDisplayProps as Props } from "@/types/components/gamification";

const props = withDefaults(defineProps<Props>(), {
  variant: "card",
});

defineEmits<{
  click: [];
}>();

const nextLevelTitle = computed(() => {
  return getLevelTitleForLevel(props.level + 1);
});

const levelTitles = [
  { min: 1, max: 5, title: "Beginner" },
  { min: 6, max: 10, title: "Learner" },
  { min: 11, max: 20, title: "Apprentice" },
  { min: 21, max: 30, title: "Practitioner" },
  { min: 31, max: 40, title: "Skilled" },
  { min: 41, max: 50, title: "Expert" },
  { min: 51, max: 75, title: "Master" },
  { min: 76, max: 100, title: "Grandmaster" },
  { min: 101, max: Infinity, title: "Legend" },
];

function getLevelTitleForLevel(level: number): string {
  const titleObj = levelTitles.find((t) => level >= t.min && level <= t.max);
  return titleObj ? titleObj.title : "Legend";
  titleObjtitleObj.title;
}

function formatNumber(num: number): string {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  return num.toString();
}
</script>

<script lang="ts">
import { computed } from "vue";
</script>

<style scoped>
/* Shimmer animation for progress bar */
@keyframes shimmer {
  0% {
    transform: translateX(-100%);
  }

  100% {
    transform: translateX(100%);
  }
}

.animate-shimmer {
  animation: shimmer 2s infinite;
}

.xp-display {
  user-select: none;
}
</style>
