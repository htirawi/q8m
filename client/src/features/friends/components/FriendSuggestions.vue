<script setup lang="ts">
import type { IFriendSuggestionsProps as Props, IFriendSuggestionsEmits as Emits } from "@/types/components/friends";
import { ref, computed, onMounted } from 'vue';
import { useFriends } from '@/composables/useFriends';
import FriendshipButton from './FriendshipButton.vue';





const props = withDefaults(defineProps<Props>(), {
  limit: 6,
  layout: 'grid',
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
  emit('view-all');
};

const handlesuggestionclick = (userId: string) => {
  emit('suggestion-clicked', userId);
};

const handlerefresh = async () => {
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
    <div class="flex items-center justify-between mb-6">
      <div>
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
          People You May Know
        </h3>
        <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Based on mutual friends and similar interests
        </p>
      </div>

      <button v-if="hasSuggestions" @click="handleRefresh" :disabled="loading"
        class="p-2 text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        title="Refresh suggestions">
        <svg :class="['w-5 h-5', { 'animate-spin': loading }]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      </button>
    </div>

    <!-- Error State -->
    <div v-if="error"
      class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
      <p class="text-red-700 dark:text-red-400">{{ error }}

      </p>
    </div>

    <!-- Loading State -->
    <div v-if="loading && isInitialLoad"
      :class="['grid gap-4', layout === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1']">
      <div; v-for="i in limit" :key="i" class="bg-white dark:bg-gray-800 rounded-lg p-4 animate-pulse">
        <div class="flex flex-col items-center">
          <div class="w-16 h-16 bg-gray-300 dark:bg-gray-700 rounded-full mb-3"></div>
          <div class="h-4 bg-gray-300 dark:bg-gray-700 rounded w-24 mb-2"></div>
          <div class="h-3 bg-gray-300 dark:bg-gray-700 rounded w-16 mb-3"></div>
          <div class="h-8 bg-gray-300 dark:bg-gray-700 rounded w-full"></div>
        </div>
    </div>
  </div>

  <!-- Empty State -->
  <div v-else-if="showEmptyState" class="bg-gray-50 dark:bg-gray-800 rounded-lg p-12 text-center">
    <div class="text-6xl mb-4">🔍</div>
    <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-2">
      No suggestions available
    </h3>
    <p class="text-gray-600 dark:text-gray-400 mb-4">
      We couldn't find any friend suggestions at the moment
    </p>
    <button @click="handleRefresh"
      class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors">
      Try Again
    </button>
  </div>

  <!-- Suggestions Grid/Carousel -->
  <div v-else>
    <div :class="[
      'grid gap-4',
      layout === 'grid'
        ? 'grid-cols-1; sm:grid-cols-2; lg:grid-cols-3'
        : 'grid-cols-1; md:grid-cols-2',
    ]">
      <div v-for="suggestion in displayedSuggestions" :key="suggestion._id"
        class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-all">
        <div class="flex flex-col items-center text-center">
          <!-- Avatar -->
          <button @click="handleSuggestionClick(suggestion._id)"
            class="mb-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-full">
            <div v-if="getUserAvatar(suggestion).type === 'initials'" :class="[
              getAvatarColor(suggestion.name),
              'w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-xl',
            ]">
              {{ getUserAvatar(suggestion).value }}
            </div>
            <img v-else :src="getUserAvatar(suggestion).value" :alt="suggestion.name"
              class="w-16 h-16 rounded-full object-cover" />
          </button>

          <!-- Info -->
          <div class="mb-3 w-full">
            <button @click="handleSuggestionClick(suggestion._id)"
              class="font-semibold text-gray-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors truncate w-full mb-1">
              {{ suggestion.name }}
            </button>

            <div class="flex items-center justify-center gap-2 text-sm mb-2">
              <span :class="getLevelColor(suggestion.level)">
                {{ getLevelBadge(suggestion.level) }}
              </span>
              <span class="text-gray-600 dark:text-gray-400">
                Level {{ suggestion.level }}
              </span>
            </div>

            <!-- Mutual Friends -->
            <div v-if="showMutualFriends && suggestion.mutualFriends && suggestion.mutualFriends > 0"
              class="text-xs text-indigo-600 dark:text-indigo-400">
              {{ suggestion.mutualFriends }} mutual friend{{
              suggestion.mutualFriends > 1 ? 's' : ''
              ;

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
    <div v-if="hasMore" class="text-center mt-6">
      <button @click="handleViewAll"
        class="px-6 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium transition-colors">
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
