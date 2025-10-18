<script setup lang="ts">
import type { IDiscussionListProps as Props } from "@/types/components/discussions";
import { ref, computed, onMounted, watch } from 'vue';
import { useDiscussions } from '@/composables/useDiscussions';
import { useAuthStore } from '@/stores/auth';
import DiscussionItem from './DiscussionItem.vue';
import DiscussionForm from './DiscussionForm.vue';



const props = withDefaults(defineProps<Props>(), {
  showForm: true,
});

const authStore = useAuthStore();
const {
  discussions,
  loading,
  error,
  discussionCount,
  totalDiscussions,
  hasMore,
  loadDiscussions,
  loadMore,
  createDiscussion,
  clear,
  sortBy,
  filterBy,
} = useDiscussions();

// State
const sortType = ref<'newest' | 'oldest' | 'popular' | 'replies'>('newest');
const filterType = ref<'all' | 'pinned' | 'bestAnswer' | 'hasReplies'>('all');
const searchQuery = ref('');

// Computed
const filteredDiscussions = computed(() => {
  let result = discussions.value;

  // Apply filter
  if (filterType.value === 'pinned') {
    result = filterBy(result, { isPinned: true });
  } else if (filterType.value === 'bestAnswer') {
    result = filterBy(result, { isBestAnswer: true });
  } else if (filterType.value === 'hasReplies') {
    result = filterBy(result, { hasReplies: true });
  }

  // Apply search
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    result = result.filter(
      (d) =>
        d.content.toLowerCase().includes(query) ||
        d.userId.name.toLowerCase().includes(query)
    );
  }

  // Apply sort
  return sortBy(result, sortType.value);
});

const showEmptyState = computed(
  () => !loading.value && discussions.value.length === 0
);

const showFilteredEmptyState = computed(
  () =>
    !loading.value &&
    discussions.value.length > 0 &&
    filteredDiscussions.value.length === 0
);

// Methods
const handleCreateDiscussion = async (content: string) => {
  await createDiscussion(props.questionId, content);
};

const handleloadmore = async () => {
  await loadMore(props.questionId);
};

// Lifecycle
onMounted(async () => {
  await loadDiscussions(props.questionId);
});

watch(
  () => props.questionId,
  async (newId) => {
    clear();
    await loadDiscussions(newId);
  }
);
</script>

<template>
  <div class="discussion-list">
    <!-- Header -->
    <div class="mb-6">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-2xl font-bold text-gray-900 dark:text-white">
          Discussion
          <span class="text-sm font-normal text-gray-500 ml-2">
            ({{ totalDiscussions }})
          </span>
        </h2>
      </div>

      <!-- Create Discussion Form -->
      <DiscussionForm
        v-if="showForm && authStore.isAuthenticated"
        @submit="handleCreateDiscussion"
        placeholder="Start a discussion about this question..."
      />

      <div
        v-else-if="showForm && !authStore.isAuthenticated"
        class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 text-center"
      >
        <p class="text-gray-600 dark:text-gray-400">
          Please
          <router-link
            to="/login"
            class="text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
          >
            login
          </router-link>
          to join the discussion
        </p>
      </div>
    </div>

    <!-- Filters & Sort -->
    <div
      v-if="discussions.length > 0"
      class="flex flex-col sm:flex-row gap-4 mb-6"
    >
      <!-- Search -->
      <div class="flex-1">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search discussions..."
          class="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        />
      </div>

      <!-- Filter -->
      <select
        v-model="filterType"
        class="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
      >
        <option value="all">All Discussions</option>
        <option value="pinned">Pinned</option>
        <option value="bestAnswer">Best Answers</option>
        <option value="hasReplies">With Replies</option>
      </select>

      <!-- Sort -->
      <select
        v-model="sortType"
        class="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
      >
        <option value="newest">Newest First</option>
        <option value="oldest">Oldest First</option>
        <option value="popular">Most Popular</option>
        <option value="replies">Most Replies</option>
      </select>
    </div>

    <!-- Error State -->
    <div
      v-if="error"
      class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6"
    >
      <p class="text-red-700 dark:text-red-400">{{ error }}

</p>
    </div>

    <!-- Loading State -->
    <div v-if="loading && discussions.length === 0" class="space-y-4">
      <div
        v-for="i in 3"
        :key="i"
        class="bg-white dark:bg-gray-800 rounded-lg p-6 animate-pulse"
      >
        <div class="flex items-start gap-4">
          <div class="w-10 h-10 bg-gray-300 dark:bg-gray-700 rounded-full"></div>
          <div class="flex-1 space-y-3">
            <div class="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/4"></div>
            <div class="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4"></div>
            <div class="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div
      v-else-if="showEmptyState"
      class="bg-gray-50 dark:bg-gray-800 rounded-lg p-12 text-center"
    >
      <div class="text-6xl mb-4">💬</div>
      <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-2">
        No discussions yet
      </h3>
      <p class="text-gray-600 dark:text-gray-400">
        Be the first to start a discussion about this question!
      </p>
    </div>

    <!-- Filtered Empty State -->
    <div
      v-else-if="showFilteredEmptyState"
      class="bg-gray-50 dark:bg-gray-800 rounded-lg p-12 text-center"
    >
      <div class="text-6xl mb-4">🔍</div>
      <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-2">
        No results found
      </h3>
      <p class="text-gray-600 dark:text-gray-400">
        Try adjusting your filters or search query
      </p>
    </div>

    <!-- Discussions List -->
    <div v-else class="space-y-4">
      <DiscussionItem
        v-for="discussion in filteredDiscussions"
        :key="discussion._id"
        :discussion="discussion"
        :question-id="questionId"
        :question-creator-id="questionCreatorId"
      />

      <!-- Load More Button -->
      <div v-if="hasMore" class="text-center pt-4">
        <button
          @click="handleLoadMore"
          :disabled="loading"
          class="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors"
        >
          <span v-if="loading">Loading...</span>
          <span v-else>Load More</span>
        </button>
      </div>

      <!-- End of List -->
      <div
        v-else-if="discussions.length > 5"
        class="text-center text-gray-500 dark:text-gray-400 text-sm py-4"
      >
        You've reached the end of the discussion
      </div>
    </div>
  </div>
</template>

<style scoped>
.discussion-list {
  @apply w-full;
}
</style>
