<script setup lang="ts">
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { DiscussionList } from '../components';

const route = useRoute();
const router = useRouter();

// Get question ID from route params or query
const questionId = computed(() => {
  return (route.params.questionId || route.query.questionId) as string;
});

// Get question creator ID if provided (for best answer marking)
const questionCreatorId = computed(() => {
  return route.query.creatorId as string | undefined;
});

// Redirect if no question ID
if (!questionId.value) {
  router.push('/');
}
</script>

<template>
  <div class="discussions-page min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Back Button -->
      <button
        @click="router.back()"
        class="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-6 transition-colors"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M15 19l-7-7 7-7"
          />
        </svg>
        <span class="font-medium">Back to Question</span>
      </button>

      <!-- Main Content -->
      <DiscussionList
        v-if="questionId"
        :question-id="questionId"
        :question-creator-id="questionCreatorId"
        :show-form="true"
      />

      <!-- Error State -->
      <div v-else class="bg-white dark:bg-gray-800 rounded-lg p-12 text-center">
        <div class="text-6xl mb-4">❌</div>
        <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Question Not Found
        </h2>
        <p class="text-gray-600 dark:text-gray-400 mb-6">
          The question you're looking for doesn't exist or has been removed.
        </p>
        <router-link
          to="/"
          class="inline-block px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors"
        >
          Go Home
        </router-link>
      </div>
    </div>
  </div>
</template>

<style scoped>
.discussions-page {
  @apply w-full;
}
</style>
