<template>
  <div class="streak-display">
    <!-- Compact view (for header) -->
    <div v-if="props.variant === 'compact'" class="compact-view">
      <button
        @click="$emit('click')"
        class="flex items-center gap-2 rounded-lg px-3 py-2 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
        :class="statusColorClass"
      >
        <span class="text-2xl">{{ streakIcon }} </span>
        <div class="text-left">
          <div class="text-sm font-bold text-gray-900 dark:text-white">
            {{ streak.currentStreak }} day{{ streak.currentStreak !== 1 ? "s" : "" }}
          </div>
          <div class="text-xs text-gray-500 dark:text-gray-400">
            {{ streakStatusMessage }}
          </div>
        </div>
      </button>
    </div>

    <!-- Card view (for dashboard) -->
    <div v-else-if="props.variant === 'card'" class="card-view">
      <div
        class="rounded-xl border-2 bg-white p-6 shadow-lg dark:bg-gray-800"
        :class="borderColorClass"
      >
        <!-- Header -->
        <div class="mb-4 flex items-center justify-between">
          <h3 class="flex items-center gap-2 text-lg font-bold text-gray-900 dark:text-white">
            <span class="text-3xl">{{ streakIcon }} </span>
            Streak
          </h3>
          <div
            v-if="isStreakInDanger"
            class="flex items-center gap-1 text-orange-600 dark:text-orange-400"
          >
            <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fill-rule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clip-rule="evenodd"
              />
            </svg>
            <span class="text-sm font-medium">At Risk</span>
          </div>
        </div>

        <!-- Current Streak -->
        <div class="mb-6 text-center">
          <div
            class="bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-5xl font-bold text-transparent"
          >
            {{ streak.currentStreak }}
          </div>
          <div class="mt-1 text-sm text-gray-600 dark:text-gray-400">
            {{ formatStreakDuration(streak.currentStreak) }}
          </div>
        </div>

        <!-- Progress to next milestone -->
        <div class="mb-6">
          <div class="mb-2 flex justify-between text-xs text-gray-600 dark:text-gray-400">
            <span
              >Next: {{ nextMilestone }}

              days</span
            >
            <span>{{ daysUntilNextMilestone }} to go</span>
          </div>
          <div class="h-2.5 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
            <div
              class="h-2.5 rounded-full bg-gradient-to-r from-orange-500 to-red-500 transition-all duration-500"
              :style="{ width: `${progressToNextMilestone}%` }"
            />
          </div>
        </div>

        <!-- Stats Grid -->
        <div class="mb-4 grid grid-cols-2 gap-4">
          <div class="rounded-lg bg-gray-50 p-3 text-center dark:bg-gray-900">
            <div class="text-2xl font-bold text-gray-900 dark:text-white">
              {{ streak.longestStreak }}
            </div>
            <div class="text-xs text-gray-600 dark:text-gray-400">Longest Streak</div>
          </div>
          <div class="rounded-lg bg-gray-50 p-3 text-center dark:bg-gray-900">
            <div class="text-2xl font-bold text-gray-900 dark:text-white">
              {{ achievedMilestones.length ?? 0 }}
            </div>
            <div class="text-xs text-gray-600 dark:text-gray-400">Milestones Hit</div>
          </div>
        </div>

        <!-- Last Activity -->
        <div class="text-center text-xs text-gray-500 dark:text-gray-400">
          Last activity: {{ formatRelativeDate(streak.lastActivityDate) }}
        </div>

        <!-- Streak Saver Info -->
        <div
          v-if="isStreakInDanger && canUseFreeFreeze"
          class="mt-4 rounded-lg border border-orange-200 bg-orange-50 p-3 dark:border-orange-800 dark:bg-orange-900/20"
        >
          <div class="flex items-center gap-2 text-sm text-orange-800 dark:text-orange-200">
            <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fill-rule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clip-rule="evenodd"
              />
            </svg>
            <span
              >You have {{ streak.freezesAvailable }} free freeze{{
                streak.freezesAvailable !== 1 ? "s" : ""
              }}

              available!</span
            >
          </div>
        </div>
      </div>
    </div>

    <!-- Detailed view (for modal) -->
    <div v-else class="detailed-view">
      <div class="space-y-6">
        <!-- Hero Section -->
        <div class="text-center">
          <div class="mb-4 text-6xl">{{ streakIcon }}</div>
          <h2 class="mb-2 text-3xl font-bold text-gray-900 dark:text-white">
            {{ streak.currentStreak }}

            Day Streak
          </h2>
          <p class="text-gray-600 dark:text-gray-400">
            {{ streakStatusMessage }}
          </p>
        </div>

        <!-- Stats -->
        <div class="grid grid-cols-3 gap-4">
          <div class="rounded-lg bg-gray-50 p-4 text-center dark:bg-gray-800">
            <div class="text-3xl font-bold text-orange-500">
              {{ streak.currentStreak }}
            </div>
            <div class="mt-1 text-sm text-gray-600 dark:text-gray-400">Current</div>
          </div>
          <div class="rounded-lg bg-gray-50 p-4 text-center dark:bg-gray-800">
            <div class="text-3xl font-bold text-red-500">
              {{ streak.longestStreak }}
            </div>
            <div class="mt-1 text-sm text-gray-600 dark:text-gray-400">Longest</div>
          </div>
          <div class="rounded-lg bg-gray-50 p-4 text-center dark:bg-gray-800">
            <div class="text-3xl font-bold text-purple-500">
              {{ achievedMilestones.length ?? 0 }}
            </div>
            <div class="mt-1 text-sm text-gray-600 dark:text-gray-400">Milestones</div>
          </div>
        </div>

        <!-- Milestones -->
        <div>
          <h3 class="mb-3 text-lg font-semibold text-gray-900 dark:text-white">Milestones</h3>
          <div class="space-y-2">
            <div
              v-for="milestone in milestones"
              :key="milestone"
              class="flex items-center gap-3 rounded-lg p-3"
              :class="
                achievedMilestones.includes(milestone)
                  ? 'bg-green-50 dark:bg-green-900/20'
                  : 'bg-gray-50 dark:bg-gray-800'
              "
            >
              <div
                class="flex h-8 w-8 items-center justify-center rounded-full"
                :class="
                  achievedMilestones.includes(milestone)
                    ? 'bg-green-500'
                    : 'bg-gray-300 dark:bg-gray-700'
                "
              >
                <svg
                  v-if="achievedMilestones.includes(milestone)"
                  class="h-5 w-5 text-white"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fill-rule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clip-rule="evenodd"
                  />
                </svg>
                <span v-else class="text-xs text-gray-600 dark:text-gray-400"
                  >{{ milestone }}
                </span>
              </div>
              <div class="flex-1">
                <div class="font-medium text-gray-900 dark:text-white">
                  {{ milestone }}

                  Days
                </div>
                <div class="text-xs text-gray-500 dark:text-gray-400">
                  {{ getMilestoneMessage(milestone) }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Streak Freeze Info -->
        <div
          class="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20"
        >
          <h4 class="mb-2 font-semibold text-blue-900 dark:text-blue-100">Streak Saver</h4>
          <p class="mb-3 text-sm text-blue-800 dark:text-blue-200">
            Missed a day? Use a streak freeze to keep your streak alive!
          </p>
          <div class="flex items-center justify-between text-sm">
            <span class="text-blue-700 dark:text-blue-300">Free freezes:</span>
            <span class="font-bold text-blue-900 dark:text-blue-100">
              {{ streak.freezesAvailable }}

              / 2
            </span>
          </div>
          <div class="mt-1 flex items-center justify-between text-sm">
            <span class="text-blue-700 dark:text-blue-300">Used this week:</span>
            <span class="font-bold text-blue-900 dark:text-blue-100">
              {{ streak.freezesUsed }}

              / 2
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { IStreakDisplayProps as Props } from "../../../types/components/gamification";
import { computed } from "vue";
import { useStreak } from "../../../composables/useStreak";

const props = withDefaults(defineProps<Props>(), {
  variant: "card",
});

defineEmits<{
  click: [];
}>();

const {
  streak,
  streakIcon,
  streakStatusMessage,
  streakStatusColor,
  isStreakInDanger,
  nextMilestone,
  progressToNextMilestone,
  daysUntilNextMilestone,
  achievedMilestones,
  canUseFreeFreeze,
  formatStreakDuration,
  formatRelativeDate,
  getMilestoneMessage,
  milestones,
} = useStreak();

const statusColorClass = computed(() => {
  const color = streakStatusColor.value;
  if (color === "green") return "border-green-500";
  if (color === "orange") return "border-orange-500";
  if (color === "red") return "border-red-500";
  return "border-gray-300 dark:border-gray-600";
});

const borderColorClass = computed(() => {
  const color = streakStatusColor.value;
  if (color === "green") return "border-green-500";
  if (color === "orange") return "border-orange-500";
  if (color === "red") return "border-red-500";
  return "border-gray-200 dark:border-gray-700";
});
</script>

<style scoped>
.streak-display {
  user-select: none;
}
</style>
