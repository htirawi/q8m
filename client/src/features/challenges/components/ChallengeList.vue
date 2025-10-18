<template>
  <div class="space-y-6">
    <!-- Filters -->
    <div
      class="rounded-lg border border-gray-200 bg-white p-4 shadow-md dark:border-gray-700 dark:bg-gray-800"
    >
      <div class="flex flex-wrap gap-4">
        <!-- Sort By -->
        <div class="min-w-[200px] flex-1">
          <label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Sort By
          </label>
          <select
            v-model="sortBy"
            class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-transparent focus:ring-2 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          >
            <option value="date">Date</option>
            <option value="difficulty">Difficulty</option>
            <option value="score">Score</option>
          </select>
        </div>

        <!-- Filter by Difficulty -->
        <div class="min-w-[200px] flex-1">
          <label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Difficulty
          </label>
          <select
            v-model="filterDifficulty"
            class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-transparent focus:ring-2 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          >
            <option value="">All</option>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>

        <!-- Filter by Framework -->
        <div class="min-w-[200px] flex-1">
          <label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Framework
          </label>
          <select
            v-model="filterFramework"
            class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-transparent focus:ring-2 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
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
            class="rounded-lg bg-gray-200 px-4 py-2 font-medium text-gray-900 transition-colors hover:bg-gray-300 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
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
      <div v-if="pagination.hasMore" class="pt-4 text-center">
        <button
          @click="$emit('load-more')"
          :disabled="loading"
          class="rounded-lg bg-indigo-600 px-6 py-3 font-medium text-white transition-colors hover:bg-indigo-700 disabled:bg-gray-400"
        >
          {{ loading ? "Loading..." : "Load More" }}
        </button>
      </div>
    </div>

    <!-- Empty State -->
    <div
      v-else
      class="rounded-lg border border-gray-200 bg-white p-12 text-center shadow-md dark:border-gray-700 dark:bg-gray-800"
    >
      <div class="mb-4 text-6xl">🎮</div>
      <h3 class="mb-2 text-xl font-semibold text-gray-900 dark:text-white">
        {{ emptyStateTitle }}
      </h3>
      <p class="mb-6 text-gray-600 dark:text-gray-400">
        {{ emptyStateMessage }}
      </p>
      <button
        v-if="showCreateButton"
        @click="$emit('create-challenge')"
        class="rounded-lg bg-indigo-600 px-6 py-3 font-medium text-white transition-colors hover:bg-indigo-700"
      >
        Create Your First Challenge
      </button>
    </div>

    <!-- Loading State -->
    <div
      v-if="loading && challenges.length === 0"
      class="rounded-lg border border-gray-200 bg-white p-12 text-center shadow-md dark:border-gray-700 dark:bg-gray-800"
    >
      <div class="mb-4 animate-spin text-4xl">⏳</div>
      <p class="text-gray-600 dark:text-gray-400">Loading challenges...</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { useChallenges } from "@/composables/useChallenges";
import ChallengeCard from "./ChallengeCard.vue";

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  pagination: () => ({ page: 1, limit: 20, total: 0, hasMore: false }),
  emptyStateTitle: "No challenges yet",
  emptyStateMessage: "Challenge your friends to a quiz battle!",
  showCreateButton: true,
});

const emit = defineEmits<{
  accept: [challengeId: string];
  reject: [challengeId: string];
  start: [challengeId: string];
  "view-details": [challengeId: string];
}>();

const { sortChallenges, filterChallenges } = useChallenges();

const sortBy = ref<"date" | "difficulty" | "score">("date");
const filterDifficulty = ref("");
const filterFramework = ref("");
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

const clearFilters = () => {
  sortBy.value = "date";
  filterDifficulty.value = "";
  filterFramework.value = "";
};

const handleAccept = async (challengeId: string) => {
  loadingChallengeId.value = challengeId;
  emit("accept", challengeId);
  setTimeout(() => {
    loadingChallengeId.value = null;
  }, 2000);
};

const handleReject = async (challengeId: string) => {
  loadingChallengeId.value = challengeId;
  emit("reject", challengeId);
  setTimeout(() => {
    loadingChallengeId.value = null;
  }, 2000);
};

const handleStart = (challengeId: string) => {
  emit("start", challengeId);
};

const handleViewDetails = (challengeId: string) => {
  emit("view-details", challengeId);
};
</script>
