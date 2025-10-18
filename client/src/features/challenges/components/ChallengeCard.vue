<template>
  <div
    class="rounded-lg border border-gray-200 bg-white p-6 shadow-md transition-shadow hover:shadow-lg dark:border-gray-700 dark:bg-gray-800"
  >
    <!-- Header -->
    <div class="mb-4 flex items-start justify-between">
      <div class="flex items-center gap-3">
        <!-- Opponent Avatar -->
        <div
          v-if="opponent"
          :class="[
            'flex h-12 w-12 items-center justify-center rounded-full font-semibold text-white',
            getAvatarColor(opponent.name || ''),
          ]"
        >
          <img
            v-if="opponent.avatar"
            :src="opponent.avatar"
            :alt="opponent.name"
            class="h-full w-full rounded-full object-cover"
          />
          <span v-else>{{ getInitials(opponent.name || "U") }} </span>
        </div>

        <!-- Opponent Info -->
        <div>
          <div class="flex items-center gap-2">
            <h3 class="font-semibold text-gray-900 dark:text-white">
              {{ isChallenger(challenge) ? "Challenge to" : "Challenge from" }}
              {{ opponent?.name || "Unknown" }}
            </h3>
            <span :class="getLevelColor(opponentLevel)">
              {{ getLevelBadge(opponentLevel) }}
            </span>
          </div>
          <p class="text-sm text-gray-500 dark:text-gray-400">
            {{ formatDate(challenge.createdAt as Date) }}
          </p>
        </div>
      </div>

      <!-- Status IBadge -->
      <div
        :class="[
          'flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium',
          getStatusColor(challenge.status),
        ]"
      >
        <span>{{ getStatusBadge(challenge.status) }} </span>
        <span class="capitalize">{{ challenge.status }} </span>
      </div>
    </div>

    <!-- Challenge Details -->
    <div class="mb-4 grid grid-cols-2 gap-4 md:grid-cols-4">
      <!-- Difficulty -->
      <div class="flex items-center gap-2">
        <span class="text-sm text-gray-500 dark:text-gray-400">Difficulty:</span>
        <span
          :class="[
            'rounded px-2 py-1 text-xs font-medium',
            getDifficultyColor(String(challenge.difficulty)),
          ]"
        >
          {{ getDifficultyBadge(String(challenge.difficulty)) }}
          <span class="capitalize">{{ challenge.difficulty }} </span>
        </span>
      </div>

      <!-- Framework -->
      <div class="flex items-center gap-2" v-if="challenge.framework">
        <span class="text-sm text-gray-500 dark:text-gray-400">Framework:</span>
        <span class="text-sm font-medium text-gray-900 dark:text-white">
          {{ getFrameworkBadge(String(challenge.framework)) }}
          <span class="capitalize">{{ challenge.framework }} </span>
        </span>
      </div>

      <!-- Questions -->
      <div class="flex items-center gap-2">
        <span class="text-sm text-gray-500 dark:text-gray-400">Questions:</span>
        <span class="text-sm font-medium text-gray-900 dark:text-white">
          {{ challenge.questionCount ?? 0 }}
        </span>
      </div>

      <!-- Time Limit -->
      <div class="flex items-center gap-2">
        <span class="text-sm text-gray-500 dark:text-gray-400">Time:</span>
        <span class="text-sm font-medium text-gray-900 dark:text-white">
          {{ formatTime(challenge.timeLimit ?? 0) }}
        </span>
      </div>
    </div>

    <!-- Message -->
    <div v-if="challenge.message" class="mb-4">
      <div class="rounded-lg border-l-4 border-indigo-500 bg-gray-50 p-3 dark:bg-gray-900">
        <p class="text-sm italic text-gray-700 dark:text-gray-300">
          "{{ challenge.message || "" }}"
        </p>
      </div>
    </div>

    <!-- Scores (for completed challenges) -->
    <div v-if="challenge.status === 'completed'" class="mb-4">
      <div class="grid grid-cols-2 gap-4">
        <!-- Your Score -->
        <div class="rounded-lg bg-gray-50 p-3 dark:bg-gray-900">
          <p class="mb-1 text-xs text-gray-500 dark:text-gray-400">Your Score</p>
          <p class="text-2xl font-bold text-gray-900 dark:text-white">
            {{ formatScore(getUserScore(challenge)) }}
          </p>
          <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Time:
            {{
              formatTime(
                isChallenger(challenge) ? challenge.challengerTime : challenge.challengedTime
              )
            }}
          </p>
        </div>

        <!-- Opponent Score -->
        <div class="rounded-lg bg-gray-50 p-3 dark:bg-gray-900">
          <p class="mb-1 text-xs text-gray-500 dark:text-gray-400">Opponent Score</p>
          <p class="text-2xl font-bold text-gray-900 dark:text-white">
            {{ formatScore(getOpponentScore(challenge)) }}
          </p>
          <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Time:
            {{
              formatTime(
                isChallenger(challenge) ? challenge.challengedTime : challenge.challengerTime
              )
            }}
          </p>
        </div>
      </div>

      <!-- Result Message -->
      <div :class="['mt-3 text-center text-lg font-semibold', getResultColor(challenge)]">
        {{ getResultMessage(challenge) }}
      </div>
    </div>

    <!-- Expiration Warning -->
    <div
      v-if="
        (challenge.status === 'pending' || challenge.status === 'in-progress') &&
        !isExpired(challenge)
      "
      class="mb-4"
    >
      <div class="flex items-center gap-2 rounded-lg bg-yellow-50 p-3 dark:bg-yellow-900/20">
        <span class="text-yellow-600 dark:text-yellow-400">⏰</span>
        <p class="text-sm text-yellow-700 dark:text-yellow-300">
          Expires in {{ getTimeRemaining(challenge) }}
        </p>
      </div>
    </div>

    <!-- Action Buttons -->
    <div class="flex gap-2">
      <!-- Accept Button (for received pending challenges) -->
      <button
        v-if="challenge.status === 'pending' && !isChallenger(challenge)"
        @click="$emit('accept', String(challenge._id || ''))"
        :disabled="loading"
        class="flex-1 rounded-lg bg-green-600 px-4 py-2 font-medium text-white transition-colors hover:bg-green-700 disabled:bg-gray-400"
      >
        {{ loading ? "Loading..." : "Accept Challenge" }}
      </button>

      <!-- Reject Button (for received pending challenges) -->
      <button
        v-if="challenge.status === 'pending' && !isChallenger(challenge)"
        @click="$emit('reject', String(challenge._id || ''))"
        :disabled="loading"
        class="flex-1 rounded-lg bg-red-600 px-4 py-2 font-medium text-white transition-colors hover:bg-red-700 disabled:bg-gray-400"
      >
        {{ loading ? "Loading..." : "Reject" }}
      </button>

      <!-- Start Button (for in-progress challenges) -->
      <button
        v-if="challenge.status === 'in-progress' && !hasUserSubmitted(challenge)"
        @click="$emit('start', String(challenge._id || ''))"
        :disabled="loading"
        class="flex-1 rounded-lg bg-indigo-600 px-4 py-2 font-medium text-white transition-colors hover:bg-indigo-700 disabled:bg-gray-400"
      >
        {{ loading ? "Loading..." : "Start Challenge" }}
      </button>

      <!-- Waiting Message (for in-progress challenges where user has submitted) -->
      <div
        v-if="challenge.status === 'in-progress' && hasUserSubmitted(challenge)"
        class="flex-1 rounded-lg bg-gray-100 px-4 py-2 text-center font-medium text-gray-700 dark:bg-gray-700 dark:text-gray-300"
      >
        ⏳ Waiting for opponent...
      </div>

      <!-- View Details Button -->
      <button
        @click="$emit('view-details', String(challenge._id || ''))"
        class="rounded-lg bg-gray-200 px-4 py-2 font-medium text-gray-900 transition-colors hover:bg-gray-300 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
      >
        View Details
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { IChallengeCardProps as Props } from "../../../types/components/challenges";
import { computed } from "vue";
import type { Challenge } from "../../../stores/challenges";
import { useChallenges } from "../../../composables/useChallenges";

const props = withDefaults(defineProps<Props>(), {
  loading: false,
});

defineEmits<{
  accept: [challengeId: string];
  reject: [challengeId: string];
  start: [challengeId: string];
  "view-details": [challengeId: string];
}>();

const {
  isChallenger,
  hasUserSubmitted,
  getOpponent,
  getUserScore,
  getOpponentScore,
  getDifficultyColor,
  getDifficultyBadge,
  getStatusColor,
  getStatusBadge,
  getFrameworkBadge,
  formatTime,
  formatScore,
  getResultMessage,
  getResultColor,
  isExpired,
  getTimeRemaining,
  formatDate,
  getLevelColor,
  getLevelBadge,
} = useChallenges();

const opponent = computed(() => getOpponent(props.challenge as Challenge));
const opponentLevel = computed(() => opponent.value?.gamification?.level || 1);

const getInitials = (name: string): string => {
  return name
    .split(" ")
    .map((n) => n.charAt(0))
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

const getAvatarColor = (name: string): string => {
  const colors = [
    "bg-red-500",
    "bg-orange-500",
    "bg-yellow-500",
    "bg-green-500",
    "bg-blue-500",
    "bg-indigo-500",
    "bg-purple-500",
    "bg-pink-500",
  ];

  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }

  const index = Math.abs(hash) % colors.length;
  return colors[index] ?? "bg-gray-500";
};
</script>
