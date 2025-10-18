<script setup lang="ts">
import type {
  IFriendListProps as Props,
  IFriendListEmits as Emits,
} from "@/types/components/friends";
import { ref, computed, onMounted } from "vue";
import { useFriends } from "@/composables/useFriends";
import FriendCard from "./FriendCard.vue";

const props = withDefaults(defineProps<Props>(), {
  showSearch: true,
  showFilters: true,
  initialSort: "recent",
});

const emit = defineEmits<Emits>();

const {
  friends,
  loading,
  error,
  pagination,
  hasFriends,
  loadFriends,
  loadMore,
  unfriend,
  block,
  sortFriends,
  filterFriends,
} = useFriends();

// State
const searchQuery = ref("");
const sortBy = ref<"name" | "level" | "recent">(props.initialSort);
const filterLevel = ref<"all" | "novice" | "apprentice" | "expert" | "master" | "legend">("all");
const showUnfriendConfirm = ref<string | null>(null);
const showBlockConfirm = ref<string | null>(null);

// Computed
const filteredAndSortedFriends = computed(() => {
  let result = friends.value;

  // Apply search
  if (searchQuery.value) {
    result = filterFriends(result, { searchTerm: searchQuery.value });
  }

  // Apply level filter
  if (filterLevel.value !== "all") {
    const levelRanges = {
      novice: { min: 0, max: 9 },
      apprentice: { min: 10, max: 19 },
      expert: { min: 20, max: 29 },
      master: { min: 30, max: 39 },
      legend: { min: 40, max: 100 },
    };
    const range = levelRanges[filterLevel.value];
    result = filterFriends(result, { minLevel: range.min, maxLevel: range.max });
  }

  // Apply sort
  return sortFriends(result, sortBy.value);
});

const showEmptyState = computed(() => !loading.value && friends.value.length === 0);

const showFilteredEmptyState = computed(
  () => !loading.value && friends.value.length > 0 && filteredAndSortedFriends.value.length === 0
);

// Methods
const handleUnfriend = async (userId: string) => {
  if (showUnfriendConfirm.value !== userId) {
    showUnfriendConfirm.value = userId;
    return;
  }

  const success = await unfriend(userId);
  if (success) {
    showUnfriendConfirm.value = null;
  }
};

const handleBlock = async (userId: string) => {
  if (showBlockConfirm.value !== userId) {
    showBlockConfirm.value = userId;
    return;
  }

  const success = await block(userId);
  if (success) {
    showBlockConfirm.value = null;
  }
};

const handleView = (userId: string) => {
  emit("view-friend", userId);
};

const handleLoadMore = async () => {
  await loadMore();
};

const clearFilters = () => {
  searchQuery.value = "";
  filterLevel.value = "all";
  sortBy.value = props.initialSort;
};

// Lifecycle
onMounted(async () => {
  if (!hasFriends.value) {
    await loadFriends();
  }
});
</script>

<template>
  <div class="friend-list">
    <!-- Header with Search and Filters -->
    <div v-if="showSearch || showFilters" class="mb-6">
      <!-- Search -->
      <div v-if="showSearch" class="mb-4">
        <div class="relative">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search friends by name or email..."
            class="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 pl-10 text-gray-900 focus:border-transparent focus:ring-2 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
          />
          <svg
            class="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <button
            v-if="searchQuery"
            @click="searchQuery = ''"
            class="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      </div>

      <!-- Filters and Sort -->
      <div v-if="showFilters" class="flex flex-col gap-4 sm:flex-row">
        <!-- Level Filter -->
        <select
          v-model="filterLevel"
          class="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-transparent focus:ring-2 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
        >
          <option value="all">All Levels</option>
          <option value="novice">🌱 Novice (0-9)</option>
          <option value="apprentice">🔰 Apprentice (10-19)</option>
          <option value="expert">🎯 Expert (20-29)</option>
          <option value="master">⭐ Master (30-39)</option>
          <option value="legend">👑 Legend (40+)</option>
        </select>

        <!-- Sort -->
        <select
          v-model="sortBy"
          class="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-transparent focus:ring-2 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
        >
          <option value="recent">Recently Added</option>
          <option value="name">Name (A-Z)</option>
          <option value="level">Level (High to Low)</option>
        </select>

        <!-- Clear Filters -->
        <button
          v-if="searchQuery || filterLevel !== 'all' || sortBy !== initialSort"
          @click="clearFilters"
          class="whitespace-nowrap rounded-lg bg-gray-200 px-4 py-2 font-medium text-gray-700 transition-colors hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
        >
          Clear Filters
        </button>
      </div>
    </div>

    <!-- Error State -->
    <div
      v-if="error"
      class="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20"
    >
      <p class="text-red-700 dark:text-red-400">{{ error }}</p>
    </div>

    <!-- Loading State -->
    <div v-if="loading && friends.length === 0" class="space-y-4">
      <div v-for="i in 5" :key="i" class="animate-pulse rounded-lg bg-white p-4 dark:bg-gray-800">
        <div class="flex items-center gap-4">
          <div class="h-12 w-12 rounded-full bg-gray-300 dark:bg-gray-700"></div>
          <div class="flex-1 space-y-2">
            <div class="h-4 w-1/4 rounded bg-gray-300 dark:bg-gray-700"></div>
            <div class="h-3 w-1/2 rounded bg-gray-300 dark:bg-gray-700"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State (No Friends) -->
    <div v-else-if="showEmptyState" class="rounded-lg bg-gray-50 p-12 text-center dark:bg-gray-800">
      <div class="mb-4 text-6xl">👥</div>
      <h3 class="mb-2 text-xl font-semibold text-gray-900 dark:text-white">No friends yet</h3>
      <p class="mb-6 text-gray-600 dark:text-gray-400">
        Start building your network by searching for users and sending friend requests!
      </p>
      <button
        @click="$emit('view-friend', 'search')"
        class="rounded-lg bg-indigo-600 px-6 py-3 font-medium text-white transition-colors hover:bg-indigo-700"
      >
        Find Friends
      </button>
    </div>

    <!-- Filtered Empty State -->
    <div
      v-else-if="showFilteredEmptyState"
      class="rounded-lg bg-gray-50 p-12 text-center dark:bg-gray-800"
    >
      <div class="mb-4 text-6xl">🔍</div>
      <h3 class="mb-2 text-xl font-semibold text-gray-900 dark:text-white">
        No friends match your filters
      </h3>
      <p class="mb-6 text-gray-600 dark:text-gray-400">Try adjusting your search or filters</p>
      <button
        @click="clearFilters"
        class="rounded-lg bg-gray-200 px-6 py-3 font-medium text-gray-700 transition-colors hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
      >
        Clear Filters
      </button>
    </div>

    <!-- Friends List -->
    <div v-else class="space-y-4">
      <FriendCard
        v-for="friend in filteredAndSortedFriends"
        :key="friend._id"
        :friend="friend"
        :show-actions="true"
        @unfriend="handleUnfriend"
        @block="handleBlock"
        @view="handleView"
      />

      <!-- Load More Button -->
      <div v-if="pagination.hasMore" class="pt-4 text-center">
        <button
          @click="handleLoadMore"
          :disabled="loading"
          class="rounded-lg bg-indigo-600 px-6 py-2 font-medium text-white transition-colors hover:bg-indigo-700 disabled:bg-gray-400"
        >
          <span v-if="loading">Loading...</span>
          <span v-else>Load More</span>
        </button>
      </div>

      <!-- End of List -->
      <div
        v-else-if="filteredAndSortedFriends.length > 5"
        class="py-4 text-center text-sm text-gray-500 dark:text-gray-400"
      >
        You've reached the end of your friends list
      </div>
    </div>
  </div>
</template>

<style scoped>
.friend-list {
  @apply w-full;
}
</style>
