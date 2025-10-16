<script setup lang="ts">
import type { IUserSearchProps as Props } from "@/types/components/friends";
import { ref, computed, watch } from 'vue';
import { useFriends } from '@/composables/useFriends';
import { useDebounceFn } from '@vueuse/core';
import FriendshipButton from './FriendshipButton.vue';



const props = withDefaults(defineProps<Props>(), {
  placeholder: 'Search users by name or email...',
  autoFocus: false,
  showSuggestions: true,
});

const {
  searchResults,
  suggestions,
  loading,
  error,
  pagination,
  search,
  clearSearch,
  loadSuggestions,
  loadMoreSearch,
  getUserAvatar,
  getAvatarColor,
  getLevelColor,
  getLevelBadge,
  validateSearchQuery,
} = useFriends();

// State
const searchQuery = ref('');
const hasSearched = ref(false);
const validationError = ref<string | null>(null);

// Computed
const showResults = computed(() => hasSearched.value && searchQuery.value.length >= 2);
const showEmptyState = computed(
  () => showResults.value && !loading.value && searchResults.value.length === 0
);
const showSuggestionsSection = computed(
  () =>
    props.showSuggestions &&
    !hasSearched.value &&
    !searchQuery.value &&
    suggestions.value.length > 0
);

// Debounced search function
const debouncedSearch = useDebounceFn(async (query: string) => {
  if (!query || query.trim().length === 0) {
    clearSearch();
    hasSearched.value = false;
    validationError.value = null;
    return;
  }

  const validation = validateSearchQuery(query);
  if (!validation.valid) {
    validationError.value = validation.error || null;
    return;
  }

  validationError.value = null;
  hasSearched.value = true;
  await search(query);
}, 500);

// Watch search query
watch(searchQuery, (newQuery) => {
  debouncedSearch(newQuery);
});

// Methods
const handleClear = () => {
  searchQuery.value = '';
  clearSearch();
  hasSearched.value = false;
  validationError.value = null;
};

const handleLoadMore = async () => {
  if (searchQuery.value) {
    await loadMoreSearch(searchQuery.value);
  }
};

// Load suggestions on mount
if (props.showSuggestions) {
  loadSuggestions();
}
</script>

<template>
  <div class="user-search">
    <!-- Search Input -->
    <div class="mb-6">
      <div class="relative">
        <input
          v-model="searchQuery"
          type="text"
          :placeholder="placeholder"
          :autofocus="autoFocus"
          class="w-full px-4 py-3 pl-12 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
          :class="{
            'border-red-300 dark:border-red-600': validationError,
          }"
        />
        <svg
          class="absolute left-4 top-3.5 w-5 h-5 text-gray-400"
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

        <!-- Clear Button -->
        <button
          v-if="searchQuery"
          @click="handleClear"
          class="absolute right-4 top-3.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        <!-- Loading Spinner -->
        <div
          v-if="loading"
          class="absolute right-12 top-3.5"
        >
          <svg
            class="animate-spin h-5 w-5 text-indigo-600"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              class="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              stroke-width="4"
            ></circle>
            <path
              class="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        </div>
      </div>

      <!-- Validation Error -->
      <div v-if="validationError" class="mt-2 text-sm text-red-600 dark:text-red-400">
        {{ validationError }}
      </div>

      <!-- Search Hint -->
      <div
        v-if="!searchQuery && !validationError"
        class="mt-2 text-sm text-gray-500 dark:text-gray-400"
      >
        Type at least 2 characters to search
      </div>
    </div>

    <!-- Error State -->
    <div
      v-if="error"
      class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6"
    >
      <p class="text-red-700 dark:text-red-400">{{ error }}</p>
    </div>

    <!-- Search Results -->
    <div v-if="showResults">
      <!-- Results Header -->
      <div class="mb-4">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
          Search Results
          <span v-if="pagination.total > 0" class="text-sm font-normal text-gray-500 ml-2">
            ({{ pagination.total }} found)
          </span>
        </h3>
      </div>

      <!-- Empty State -->
      <div
        v-if="showEmptyState"
        class="bg-gray-50 dark:bg-gray-800 rounded-lg p-12 text-center"
      >
        <div class="text-6xl mb-4">🔍</div>
        <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          No users found
        </h3>
        <p class="text-gray-600 dark:text-gray-400">
          Try searching with a different name or email
        </p>
      </div>

      <!-- Results List -->
      <div v-else class="space-y-4">
        <div
          v-for="user in searchResults"
          :key="user._id"
          class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-all"
        >
          <div class="flex items-center gap-4">
            <!-- Avatar -->
            <div class="flex-shrink-0">
              <div
                v-if="getUserAvatar(user).type === 'initials'"
                :class="[
                  getAvatarColor(user.name),
                  'w-12 h-12 rounded-full flex items-center justify-center text-white font-bold',
                ]"
              >
                {{ getUserAvatar(user).value }}
              </div>
              <img
                v-else
                :src="getUserAvatar(user).value"
                :alt="user.name"
                class="w-12 h-12 rounded-full object-cover"
              />
            </div>

            <!-- Info -->
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 mb-1">
                <h3 class="font-semibold text-gray-900 dark:text-white truncate">
                  {{ user.name }}
                </h3>
                <span :class="['text-sm', getLevelColor(user.level)]">
                  {{ getLevelBadge(user.level) }}
                </span>
              </div>
              <div class="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <span>Level {{ user.level }}</span>
                <span>•</span>
                <span>{{ user.xp.toLocaleString() }} XP</span>
              </div>
              <div
                v-if="user.mutualFriends && user.mutualFriends > 0"
                class="text-xs text-indigo-600 dark:text-indigo-400 mt-1"
              >
                {{ user.mutualFriends }} mutual friend{{
                  user.mutualFriends > 1 ? 's' : ''
                }}
              </div>
            </div>

            <!-- Friendship Button -->
            <div class="flex-shrink-0">
              <FriendshipButton :user-id="user._id" size="md" :show-icon="true" />
            </div>
          </div>
        </div>

        <!-- Load More Button -->
        <div v-if="pagination.hasMore" class="text-center pt-4">
          <button
            @click="handleLoadMore"
            :disabled="loading"
            class="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors"
          >
            <span v-if="loading">Loading...</span>
            <span v-else>Load More</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Suggestions Section (when not searching) -->
    <div v-else-if="showSuggestionsSection">
      <div class="mb-4">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
          People You May Know
        </h3>
        <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Based on mutual friends and similar interests
        </p>
      </div>

      <div class="space-y-4">
        <div
          v-for="suggestion in suggestions"
          :key="suggestion._id"
          class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-all"
        >
          <div class="flex items-center gap-4">
            <!-- Avatar -->
            <div class="flex-shrink-0">
              <div
                v-if="getUserAvatar(suggestion).type === 'initials'"
                :class="[
                  getAvatarColor(suggestion.name),
                  'w-12 h-12 rounded-full flex items-center justify-center text-white font-bold',
                ]"
              >
                {{ getUserAvatar(suggestion).value }}
              </div>
              <img
                v-else
                :src="getUserAvatar(suggestion).value"
                :alt="suggestion.name"
                class="w-12 h-12 rounded-full object-cover"
              />
            </div>

            <!-- Info -->
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 mb-1">
                <h3 class="font-semibold text-gray-900 dark:text-white truncate">
                  {{ suggestion.name }}
                </h3>
                <span :class="['text-sm', getLevelColor(suggestion.level)]">
                  {{ getLevelBadge(suggestion.level) }}
                </span>
              </div>
              <div class="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <span>Level {{ suggestion.level }}</span>
                <span>•</span>
                <span>{{ suggestion.xp.toLocaleString() }} XP</span>
              </div>
              <div
                v-if="suggestion.mutualFriends && suggestion.mutualFriends > 0"
                class="text-xs text-indigo-600 dark:text-indigo-400 mt-1"
              >
                {{ suggestion.mutualFriends }} mutual friend{{
                  suggestion.mutualFriends > 1 ? 's' : ''
                }}
              </div>
            </div>

            <!-- Friendship Button -->
            <div class="flex-shrink-0">
              <FriendshipButton :user-id="suggestion._id" size="md" :show-icon="true" />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Initial Empty State -->
    <div
      v-else-if="!searchQuery"
      class="bg-gray-50 dark:bg-gray-800 rounded-lg p-12 text-center"
    >
      <div class="text-6xl mb-4">👋</div>
      <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-2">
        Find Friends
      </h3>
      <p class="text-gray-600 dark:text-gray-400">
        Search for users by name or email to connect with them
      </p>
    </div>
  </div>
</template>

<style scoped>
.user-search {
  @apply w-full;
}
</style>
