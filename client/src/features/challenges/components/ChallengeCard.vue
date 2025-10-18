<template>
  <div
    class="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow p-6 border border-gray-200 dark:border-gray-700"
  >
    <!-- Header -->
    <div class="flex items-start justify-between mb-4">
      <div class="flex items-center gap-3">
        <!-- Opponent Avatar -->
        <div
          :class="[
            'w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold',
            getAvatarColor(opponent.name),
          ]"
        >
          <img
            v-if="opponent.avatar"
            :src="opponent.avatar"
            :alt="opponent.name"
            class="w-full h-full rounded-full object-cover"
          />
          <span v-else>{{ getInitials(opponent.name) }}

</span>
        </div>

        <!-- Opponent Info -->
        <div>
          <div class="flex items-center gap-2">
            <h3 class="font-semibold text-gray-900 dark:text-white">
              {{ isChallenger(challenge) ? 'Challenge to' : 'Challenge from' }}
              {{ opponent.name }}

            </h3>
            <span :class="getLevelColor(opponentLevel)">
              {{ getLevelBadge(opponentLevel) }}

            </span>
          </div>
          <p class="text-sm text-gray-500 dark:text-gray-400">
            {{ formatDate(challenge.createdAt) }}

          </p>
        </div>
      </div>

      <!-- Status IBadge -->
      <div
        :class="[
          'px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1',
          getStatusColor(challenge.status),
        ]"
      >
        <span>{{ getStatusBadge(challenge.status) }}

</span>
        <span class="capitalize">{{ challenge.status }}

</span>
      </div>
    </div>

    <!-- Challenge Details -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
      <!-- Difficulty -->
      <div class="flex items-center gap-2">
        <span class="text-gray-500 dark:text-gray-400 text-sm">Difficulty:</span>
        <span
          :class="[
            'px-2 py-1 rounded text-xs font-medium',
            getDifficultyColor(challenge.difficulty),
          ]"
        >
          {{ getDifficultyBadge(challenge.difficulty) }}
          <span class="capitalize">{{ challenge.difficulty }}

</span>
        </span>
      </div>

      <!-- Framework -->
      <div class="flex items-center gap-2" v-if="challenge.framework">
        <span class="text-gray-500 dark:text-gray-400 text-sm">Framework:</span>
        <span class="font-medium text-gray-900 dark:text-white text-sm">
          {{ getFrameworkBadge(challenge.framework) }}
          <span class="capitalize">{{ challenge.framework }}

</span>
        </span>
      </div>

      <!-- Questions -->
      <div class="flex items-center gap-2">
        <span class="text-gray-500 dark:text-gray-400 text-sm">Questions:</span>
        <span class="font-medium text-gray-900 dark:text-white text-sm">
          {{ challenge.questionCount }}

        </span>
      </div>

      <!-- Time Limit -->
      <div class="flex items-center gap-2">
        <span class="text-gray-500 dark:text-gray-400 text-sm">Time:</span>
        <span class="font-medium text-gray-900 dark:text-white text-sm">
          {{ formatTime(challenge.timeLimit) }}
        </span>
      </div>
    </div>

    <!-- Message -->
    <div v-if="challenge.message" class="mb-4">
      <div class="bg-gray-50 dark:bg-gray-900 rounded-lg p-3 border-l-4 border-indigo-500">
        <p class="text-sm text-gray-700 dark:text-gray-300 italic">
          "{{ challenge.message }}"
        </p>
      </div>
    </div>

    <!-- Scores (for completed challenges) -->
    <div v-if="challenge.status === 'completed'" class="mb-4">
      <div class="grid grid-cols-2 gap-4">
        <!-- Your Score -->
        <div class="bg-gray-50 dark:bg-gray-900 rounded-lg p-3">
          <p class="text-xs text-gray-500 dark:text-gray-400 mb-1">Your Score</p>
          <p class="text-2xl font-bold text-gray-900 dark:text-white">
            {{ formatScore(getUserScore(challenge)) }}
          </p>
          <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Time: {{ formatTime(isChallenger(challenge) ? challenge.challengerTime : challenge.challengedTime) }}

          </p>
        </div>

        <!-- Opponent Score -->
        <div class="bg-gray-50 dark:bg-gray-900 rounded-lg p-3">
          <p class="text-xs text-gray-500 dark:text-gray-400 mb-1">Opponent Score</p>
          <p class="text-2xl font-bold text-gray-900 dark:text-white">
            {{ formatScore(getOpponentScore(challenge)) }}
          </p>
          <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Time: {{ formatTime(isChallenger(challenge) ? challenge.challengedTime : challenge.challengerTime) }}

          </p>
        </div>
      </div>

      <!-- Result Message -->
      <div :class="['mt-3 text-center font-semibold text-lg', getResultColor(challenge)]">
        {{ getResultMessage(challenge) }}

      </div>
    </div>

    <!-- Expiration Warning -->
    <div
      v-if="(challenge.status === 'pending' || challenge.status === 'in-progress') && !isExpired(challenge)"
      class="mb-4"
    >
      <div class="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-3 flex items-center gap-2">
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
        @click="$emit('accept', challenge._id)"
        :disabled="loading"
        class="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-lg transition-colors"
      >
        {{ loading ? 'Loading...' : 'Accept Challenge' }}

      </button>

      <!-- Reject Button (for received pending challenges) -->
      <button
        v-if="challenge.status === 'pending' && !isChallenger(challenge)"
        @click="$emit('reject', challenge._id)"
        :disabled="loading"
        class="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-lg transition-colors"
      >
        {{ loading ? 'Loading...' : 'Reject' }}

      </button>

      <!-- Start Button (for in-progress challenges) -->
      <button
        v-if="challenge.status === 'in-progress' && !hasUserSubmitted(challenge)"
        @click="$emit('start', challenge._id)"
        :disabled="loading"
        class="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-lg transition-colors"
      >
        {{ loading ? 'Loading...' : 'Start Challenge' }}

      </button>

      <!-- Waiting Message (for in-progress challenges where user has submitted) -->
      <div
        v-if="challenge.status === 'in-progress' && hasUserSubmitted(challenge)"
        class="flex-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium py-2 px-4 rounded-lg text-center"
      >
        ⏳ Waiting for opponent...
      </div>

      <!-- View Details Button -->
      <button
        @click="$emit('view-details', challenge._id)"
        class="bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-medium py-2 px-4 rounded-lg transition-colors"
      >
        View Details
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { IChallengeCardProps as Props } from "@/types/components/challenges";
import { computed } from 'vue';
import type { Challenge } from '@/stores/challenges';
import { useChallenges } from '@/composables/useChallenges';



const props = withDefaults(defineProps<Props>(), {
  loading: false,
});

defineEmits<{
  accept: [;
  reject: [;
  start: [;
  'view-details': [challengeId: string];
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

const opponent = computed(() => getOpponent(props.challenge));
const opponentLevel = computed(() => opponent.value.gamification?.level || 1);

const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map((n) => n.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

const getAvatarColor = (name: string): string => {
  const colors = [
    'bg-red-500',
    'bg-orange-500',
    'bg-yellow-500',
    'bg-green-500',
    'bg-blue-500',
    'bg-indigo-500',
    'bg-purple-500',
    'bg-pink-500',
  ];

  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }

  const index = Math.abs(hash) % colors.length;
  return colors[index];
};
</script>
