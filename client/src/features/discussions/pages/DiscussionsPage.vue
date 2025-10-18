<script setup lang="ts">
import { computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { DiscussionList } from "../components";

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
  router.push("/");
}
</script>

<template>
  <div class="discussions-page min-h-screen bg-gray-50 py-8 dark:bg-gray-900">
    <div class="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
      <!-- Back Button -->
      <button
        @click="router.back()"
        class="mb-6 flex items-center gap-2 text-gray-600 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
      >
        <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
        :discussions="[]"
        :question-creator-id="questionCreatorId"
        :show-form="true"
      />

      <!-- Error State -->
      <div v-else class="rounded-lg bg-white p-12 text-center dark:bg-gray-800">
        <div class="mb-4 text-6xl">❌</div>
        <h2 class="mb-2 text-2xl font-bold text-gray-900 dark:text-white">Question Not Found</h2>
        <p class="mb-6 text-gray-600 dark:text-gray-400">
          The question you're looking for doesn't exist or has been removed.
        </p>
        <router-link
          to="/"
          class="inline-block rounded-lg bg-indigo-600 px-6 py-3 font-medium text-white transition-colors hover:bg-indigo-700"
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
