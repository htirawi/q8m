<template>
  <div class="space-y-6">
    <!-- Filters -->
    <div
      class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 border border-gray-200 dark:border-gray-700"
    >
      <div class="flex flex-wrap gap-4">
        <!-- Sort By -->
        <div class="flex-1 min-w-[200px]">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Sort By
          </label>
          <select
            v-model="sortBy"
            class="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          >
            <option value="date">Date</option>
            <option value="difficulty">Difficulty</option>
            <option value="score">Score</option>
          </select>
        </div>

        <!-- Filter by Difficulty -->
        <div class="flex-1 min-w-[200px]">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Difficulty
          </label>
          <select
            v-model="filterDifficulty"
            class="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          >
            <option value="">All</option>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>

        <!-- Filter by Framework -->
        <div class="flex-1 min-w-[200px]">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Framework
          </label>
          <select
            v-model="filterFramework"
            class="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          >
            <option value="">All</option>
            <option value="angular">Angular</option>
            <option value="react">React</option>
            <option value="nextjs">Next.js</option>
            <option value="redux">Redux</option>
            <option value="random">Random</option>
          </select>
        </div>

        <!-- Clear Filters -->
        <div class="flex items-end">
          <button
            @click="clearFilters"
            class="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-medium transition-colors"
          >
            Clear
          </button>
        </div>
      </div>
    </div>

    <!-- Challenge Cards -->
    <div v-if="filteredAndSortedChallenges.length > 0" class="space-y-4">
      <ChallengeCard
        v-for="challenge in filteredAndSortedChallenges"
        :key="challenge._id"
        :challenge="challenge"
        :loading="loadingChallengeId === challenge._id"
        @accept="handleAccept"
        @reject="handleReject"
        @start="handleStart"
        @view-details="handleViewDetails"
      />

      <!-- Load More Button -->
      <div v-if="pagination.hasMore" class="text-center pt-4">
        <button
          @click="$emit('load-more')"
          :disabled="loading"
          class="px-6 py-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white font-medium transition-colors"
        >
          {{ loading ? 'Loading...' : 'Load More' }}

        </button>
      </div>
    </div>

    <!-- Empty State -->
    <div
      v-else
      class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-12 text-center border border-gray-200 dark:border-gray-700"
    >
      <div class="text-6xl mb-4">🎮</div>
      <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-2">
        {{ emptyStateTitle }}

      </h3>
      <p class="text-gray-600 dark:text-gray-400 mb-6">
        {{ emptyStateMessage }}

      </p>
      <button
        v-if="showCreateButton"
        @click="$emit('create-challenge')"
        class="px-6 py-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium transition-colors"
      >
        Create Your First Challenge
      </button>
    </div>

    <!-- Loading State -->
    <div
      v-if="loading && challenges.length === 0"
      class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-12 text-center border border-gray-200 dark:border-gray-700"
    >
      <div class="animate-spin text-4xl mb-4">⏳</div>
      <p class="text-gray-600 dark:text-gray-400">Loading challenges...</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { IChallengeListProps as Props } from "@/types/components/challenges";
import { ref, computed } from 'vue';
import type { Challenge } from '@/stores/challenges';
import { useChallenges } from '@/composables/useChallenges';
import ChallengeCard from './ChallengeCard.vue';


const props = withDefaults(defineProps<Props>(), {
  loading: false,
  pagination: () => ({ page: 1, limit: 20, total: 0, hasMore: false }),
  emptyStateTitle: 'No challenges yet',
  emptyStateMessage: 'Challenge your friends to a quiz battle!',
  showCreateButton: true,
});

const emit = defineEmits<{
  accept: [;
  reject: [;
  start: [;
  'view-details': [challengeId: string];
  
  
}>();

const { sortChallenges, filterChallenges } = useChallenges();

const sortBy = ref<'date' | 'difficulty' | 'score'>('date');
const filterDifficulty = ref('');
const filterFramework = ref('');
const loadingChallengeId = ref<string | null>(null);

const filteredAndSortedChallenges = computed(() => {
  let result = [...props.challenges];

  // Apply filters
  const filters: any = {};
  if (filterDifficulty.value) filters.difficulty = filterDifficulty.value;
  if (filterFramework.value) filters.framework = filterFramework.value;

  if (Object.keys(filters).length > 0) {
    result = filterChallenges(result, filters);
  }

  // Apply sorting
  result = sortChallenges(result, sortBy.value);

  return result;
});

const clearfilters = () => {
  sortBy.value = 'date';
  filterDifficulty.value = '';
  filterFramework.value = '';
};

const handleaccept = async (challengeId: string) => {
  loadingChallengeId.value = challengeId;
  emit('accept', challengeId);
  setTimeout(() => {
    loadingChallengeId.value = null;
  }, 2000);
};

const handlereject = async (challengeId: string) => {
  loadingChallengeId.value = challengeId;
  emit('reject', challengeId);
  setTimeout(() => {
    loadingChallengeId.value = null;
  }, 2000);
};

const handlestart = (challengeId: string) => {
  emit('start', challengeId);
};

const handleviewdetails = (challengeId: string) => {
  emit('view-details', challengeId);
};
</script>
