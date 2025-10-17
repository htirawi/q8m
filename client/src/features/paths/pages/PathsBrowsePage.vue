<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <div class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <!-- Header -->
      <div class="mb-8 flex items-start justify-between">
        <div>
          <h1 class="text-3xl font-bold text-gray-900 dark:text-white">
            Learning Paths
          </h1>
          <p class="mt-2 text-lg text-gray-600 dark:text-gray-300">
            Structured learning journeys to master web development
          </p>
        </div>
        <UserMenu />
      </div>

      <!-- Filters -->
      <div class="mb-6 flex flex-wrap gap-4">
        <select
          v-model="selectedCategory"
          class="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white"
          @change="applyFilters"
        >
          <option value="">All Categories</option>
          <option value="frontend">Frontend</option>
          <option value="backend">Backend</option>
          <option value="fullstack">Full Stack</option>
          <option value="interview">Interview Prep</option>
        </select>

        <select
          v-model="selectedDifficulty"
          class="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white"
          @change="applyFilters"
        >
          <option value="">All Levels</option>
          <option value="beginner">Beginner</option>
          <option value="intermediate">Intermediate</option>
          <option value="advanced">Advanced</option>
        </select>
      </div>

      <!-- Loading State -->
      <div v-if="store.loading" class="flex justify-center py-12">
        <div class="h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent"></div>
      </div>

      <!-- Paths Grid -->
      <div v-else-if="store.paths.length > 0" class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <PathCard
          v-for="path in store.paths"
          :key="path._id"
          :path="path"
          @click="goToPath(path.slug)"
        />
      </div>

      <!-- Empty State -->
      <div v-else class="text-center py-12">
        <p class="text-gray-600 dark:text-gray-400">No learning paths found</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useLearningPathsStore } from '@/stores/learning-paths';
import PathCard from '../components/PathCard.vue';
import UserMenu from '@/components/layout/UserMenu.vue';
import type { PathCategory, PathDifficulty } from '@shared/types/learning-paths';

const router = useRouter();
const store = useLearningPathsStore();

const selectedCategory = ref<PathCategory | ''>('');
const selectedDifficulty = ref<PathDifficulty | ''>('');

const applyFilters = async () => {
  const filters: {
    category?: PathCategory;
    difficulty?: PathDifficulty;
  } = {};

  if (selectedCategory.value) filters.category = selectedCategory.value as PathCategory;
  if (selectedDifficulty.value) filters.difficulty = selectedDifficulty.value as PathDifficulty;

  await store.fetchPaths(filters);
};

const goToPath = (slug: string) => {
  const locale = router.currentRoute.value.params.locale || 'en';
  router.push(`/${locale}/paths/${slug}`);
};

onMounted(async () => {
  await store.fetchPaths();
});
</script>
