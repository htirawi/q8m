<script setup lang="ts">
import type { IDiscussionListProps as Props } from "../../../types/components/discussions";
import { ref, computed, onMounted, watch } from "vue";
import { useDiscussions } from "../../../composables/useDiscussions";
import { useAuthStore } from "../../../stores/auth";
import DiscussionItem from "./DiscussionItem.vue";
import DiscussionForm from "./DiscussionForm.vue";

const props = withDefaults(defineProps<Props>(), {
  showForm: true,
});

const authStore = useAuthStore();
const {
  discussions,
  loading,
  error,
  discussionCount: _discussionCount,
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
const sortType = ref<"newest" | "oldest" | "popular" | "replies">("newest");
const filterType = ref<"all" | "pinned" | "bestAnswer" | "hasReplies">("all");
const searchQuery = ref("");

// Computed
const filteredDiscussions = computed(() => {
  let result = discussions.value;

  // Apply filter
  if (filterType.value === "pinned") {
    result = filterBy(result, { isPinned: true });
  } else if (filterType.value === "bestAnswer") {
    result = filterBy(result, { isBestAnswer: true });
  } else if (filterType.value === "hasReplies") {
    result = filterBy(result, { hasReplies: true });
  }

  // Apply search
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    result = result.filter(
      (d) => d.content.toLowerCase().includes(query) || d.userId.name.toLowerCase().includes(query)
    );
  }

  // Apply sort
  return sortBy(result, sortType.value);
});

const showEmptyState = computed(() => !loading.value && discussions.value.length === 0);

const showFilteredEmptyState = computed(
  () => !loading.value && discussions.value.length > 0 && filteredDiscussions.value.length === 0
);

// Methods
const handleCreateDiscussion = async (content: string) => {
  await createDiscussion(props.questionId, content);
};

const handleLoadMore = async () => {
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
      <div class="mb-4 flex items-center justify-between">
        <h2 class="text-2xl font-bold text-gray-900 dark:text-white">
          Discussion
          <span class="ml-2 text-sm font-normal text-gray-500"> ({{ totalDiscussions }}) </span>
        </h2>
      </div>

      <!-- Create Discussion Form -->
      <DiscussionForm
        v-if="showForm && authStore.isAuthenticated"
        :question-id="questionId"
        @submit="handleCreateDiscussion"
        placeholder="Start a discussion about this question..."
      />

      <div
        v-else-if="showForm && !authStore.isAuthenticated"
        class="rounded-lg bg-gray-50 p-4 text-center dark:bg-gray-800"
      >
        <p class="text-gray-600 dark:text-gray-400">
          Please
          <router-link
            to="/login"
            class="font-medium text-indigo-600 hover:underline dark:text-indigo-400"
          >
            login
          </router-link>
          to join the discussion
        </p>
      </div>
    </div>

    <!-- Filters & Sort -->
    <div v-if="discussions.length > 0" class="mb-6 flex flex-col gap-4 sm:flex-row">
      <!-- Search -->
      <div class="flex-1">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search discussions..."
          class="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-transparent focus:ring-2 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
        />
      </div>

      <!-- Filter -->
      <select
        v-model="filterType"
        class="rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-transparent focus:ring-2 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
      >
        <option value="all">All Discussions</option>
        <option value="pinned">Pinned</option>
        <option value="bestAnswer">Best Answers</option>
        <option value="hasReplies">With Replies</option>
      </select>

      <!-- Sort -->
      <select
        v-model="sortType"
        class="rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-transparent focus:ring-2 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
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
      class="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20"
    >
      <p class="text-red-700 dark:text-red-400">{{ error }}</p>
    </div>

    <!-- Loading State -->
    <div v-if="loading && discussions.length === 0" class="space-y-4">
      <div v-for="i in 3" :key="i" class="animate-pulse rounded-lg bg-white p-6 dark:bg-gray-800">
        <div class="flex items-start gap-4">
          <div class="h-10 w-10 rounded-full bg-gray-300 dark:bg-gray-700"></div>
          <div class="flex-1 space-y-3">
            <div class="h-4 w-1/4 rounded bg-gray-300 dark:bg-gray-700"></div>
            <div class="h-4 w-3/4 rounded bg-gray-300 dark:bg-gray-700"></div>
            <div class="h-4 w-1/2 rounded bg-gray-300 dark:bg-gray-700"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else-if="showEmptyState" class="rounded-lg bg-gray-50 p-12 text-center dark:bg-gray-800">
      <div class="mb-4 text-6xl">💬</div>
      <h3 class="mb-2 text-xl font-semibold text-gray-900 dark:text-white">No discussions yet</h3>
      <p class="text-gray-600 dark:text-gray-400">
        Be the first to start a discussion about this question!
      </p>
    </div>

    <!-- Filtered Empty State -->
    <div
      v-else-if="showFilteredEmptyState"
      class="rounded-lg bg-gray-50 p-12 text-center dark:bg-gray-800"
    >
      <div class="mb-4 text-6xl">🔍</div>
      <h3 class="mb-2 text-xl font-semibold text-gray-900 dark:text-white">No results found</h3>
      <p class="text-gray-600 dark:text-gray-400">Try adjusting your filters or search query</p>
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
      <div v-if="hasMore" class="pt-4 text-center">
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
        v-else-if="discussions.length > 5"
        class="py-4 text-center text-sm text-gray-500 dark:text-gray-400"
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
