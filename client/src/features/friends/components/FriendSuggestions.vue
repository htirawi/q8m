<script setup lang="ts">
import type {
  IFriendSuggestionsProps as Props,
  IFriendSuggestionsEmits as Emits,
} from "@/types/components/friends";
import { ref, computed, onMounted } from "vue";
import { useFriends } from "@/composables/useFriends";
import FriendshipButton from "./FriendshipButton.vue";

const props = withDefaults(defineProps<Props>(), {
  limit: 6,
  layout: "grid",
  showMutualFriends: true,
  autoLoad: true,
});

const emit = defineEmits<Emits>();

const {
  suggestions,
  loading,
  error,
  hasSuggestions,
  loadSuggestions,
  getUserAvatar,
  getAvatarColor,
  getLevelColor,
  getLevelBadge,
} = useFriends();

// State
const isInitialLoad = ref(true);

// Computed
const displayedSuggestions = computed(() => {
  return props.limit > 0 ? suggestions.value.slice(0, props.limit) : suggestions.value;
});

const hasMore = computed(() => {
  return suggestions.value.length > props.limit;
});

const showEmptyState = computed(() => {
  return !loading.value && !hasSuggestions.value && !isInitialLoad.value;
});

// Methods
const handleViewAll = () => {
  emit("view-all");
};

const handlesuggestionclick = (userId: string) => {
  emit("suggestion-clicked", userId);
};

const handleRefresh = async () => {
  isInitialLoad.value = false;
  await loadSuggestions();
};

// Lifecycle
onMounted(async () => {
  if (props.autoLoad && suggestions.value.length === 0) {
    await handleRefresh();
  } else {
    isInitialLoad.value = false;
  }
});
</script>

<template>
  <div class="friend-suggestions">
    <!-- Header -->
    <div class="mb-6 flex items-center justify-between">
      <div>
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white">People You May Know</h3>
        <p class="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Based on mutual friends and similar interests
        </p>
      </div>

      <button
        v-if="hasSuggestions"
        @click="handleRefresh"
        :disabled="loading"
        class="rounded-lg p-2 text-gray-600 transition-colors hover:bg-gray-100 hover:text-indigo-600 disabled:cursor-not-allowed disabled:opacity-50 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-indigo-400"
        title="Refresh suggestions"
      >
        <svg
          :class="['h-5 w-5', { 'animate-spin': loading }]"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
          />
        </svg>
      </button>
    </div>

    <!-- Error State -->
    <div
      v-if="error"
      class="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20"
    >
      <p class="text-red-700 dark:text-red-400">{{ error }}</p>
    </div>

    <!-- Loading State -->
    <div
      v-if="loading && isInitialLoad"
      :class="[
        'grid gap-4',
        layout === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1',
      ]"
    >
      <div
        v-for="i in limit"
        :key="i"
        class="animate-pulse rounded-lg bg-white p-4 dark:bg-gray-800"
      >
        <div class="flex flex-col items-center">
          <div class="mb-3 h-16 w-16 rounded-full bg-gray-300 dark:bg-gray-700"></div>
          <div class="mb-2 h-4 w-24 rounded bg-gray-300 dark:bg-gray-700"></div>
          <div class="mb-3 h-3 w-16 rounded bg-gray-300 dark:bg-gray-700"></div>
          <div class="h-8 w-full rounded bg-gray-300 dark:bg-gray-700"></div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else-if="showEmptyState" class="rounded-lg bg-gray-50 p-12 text-center dark:bg-gray-800">
      <div class="mb-4 text-6xl">🔍</div>
      <h3 class="mb-2 text-xl font-semibold text-gray-900 dark:text-white">
        No suggestions available
      </h3>
      <p class="mb-4 text-gray-600 dark:text-gray-400">
        We couldn't find any friend suggestions at the moment
      </p>
      <button
        @click="handleRefresh"
        class="rounded-lg bg-indigo-600 px-4 py-2 font-medium text-white transition-colors hover:bg-indigo-700"
      >
        Try Again
      </button>
    </div>

    <!-- Suggestions Grid/Carousel -->
    <div v-else>
      <div
        :class="[
          'grid gap-4',
          layout === 'grid'
            ? 'grid-cols-1; sm:grid-cols-2; lg:grid-cols-3'
            : 'grid-cols-1; md:grid-cols-2',
        ]"
      >
        <div
          v-for="suggestion in displayedSuggestions"
          :key="suggestion._id"
          class="rounded-lg border border-gray-200 bg-white p-4 transition-all hover:shadow-md dark:border-gray-700 dark:bg-gray-800"
        >
          <div class="flex flex-col items-center text-center">
            <!-- Avatar -->
            <button
              @click="handleSuggestionClick(suggestion._id)"
              class="mb-3 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <div
                v-if="getUserAvatar(suggestion).type === 'initials'"
                :class="[
                  getAvatarColor(suggestion.name),
                  'flex h-16 w-16 items-center justify-center rounded-full text-xl font-bold text-white',
                ]"
              >
                {{ getUserAvatar(suggestion).value }}
              </div>
              <img
                v-else
                :src="getUserAvatar(suggestion).value"
                :alt="suggestion.name"
                class="h-16 w-16 rounded-full object-cover"
              />
            </button>

            <!-- Info -->
            <div class="mb-3 w-full">
              <button
                @click="handleSuggestionClick(suggestion._id)"
                class="mb-1 w-full truncate font-semibold text-gray-900 transition-colors hover:text-indigo-600 dark:text-white dark:hover:text-indigo-400"
              >
                {{ suggestion.name }}
              </button>

              <div class="mb-2 flex items-center justify-center gap-2 text-sm">
                <span :class="getLevelColor(suggestion.level)">
                  {{ getLevelBadge(suggestion.level) }}
                </span>
                <span class="text-gray-600 dark:text-gray-400"> Level {{ suggestion.level }} </span>
              </div>

              <!-- Mutual Friends -->
              <div
                v-if="showMutualFriends && suggestion.mutualFriends && suggestion.mutualFriends > 0"
                class="text-xs text-indigo-600 dark:text-indigo-400"
              >
                {{ suggestion.mutualFriends }} mutual friend{{
                  suggestion.mutualFriends > 1 ? "s" : ""
                }}
              </div>
            </div>

            <!-- Action Button -->
            <div class="w-full">
              <FriendshipButton :user-id="suggestion._id" size="md" :show-icon="true" />
            </div>
          </div>
        </div>
      </div>

      <!-- View All Button -->
      <div v-if="hasMore" class="mt-6 text-center">
        <button
          @click="handleViewAll"
          class="rounded-lg bg-gray-200 px-6 py-2 font-medium text-gray-700 transition-colors hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
        >
          View All Suggestions
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.friend-suggestions {
  @apply w-full;
}
</style>
