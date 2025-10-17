<template>
  <div
    class="cursor-pointer rounded-lg bg-white p-6 shadow-sm transition-shadow hover:shadow-md dark:bg-gray-800"
    @click="$emit('click')"
  >
    <!-- Header -->
    <div class="mb-4 flex items-start justify-between">
      <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
        {{ title }}
      </h3>
      <span
        v-if="path.isPremium"
        class="rounded-full bg-yellow-100 px-2 py-1 text-xs font-medium text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200"
      >
        Premium
      </span>
    </div>

    <!-- Description -->
    <p class="mb-4 line-clamp-2 text-sm text-gray-600 dark:text-gray-400">
      {{ description }}
    </p>

    <!-- Stats -->
    <div class="mb-4 flex flex-wrap gap-3 text-xs text-gray-600 dark:text-gray-400">
      <div class="flex items-center gap-1">
        <span>📚</span>
        <span>{{ path.totalQuestions }} Questions</span>
      </div>
      <div class="flex items-center gap-1">
        <span>⏱️</span>
        <span>{{ path.estimatedHours }}h</span>
      </div>
      <div class="flex items-center gap-1">
        <span>📊</span>
        <span class="capitalize">{{ path.difficulty }}</span>
      </div>
    </div>

    <!-- Tags -->
    <div v-if="path.frameworks.length > 0" class="flex flex-wrap gap-2">
      <span
        v-for="framework in path.frameworks.slice(0, 3)"
        :key="framework"
        class="rounded-full bg-primary-100 px-2 py-1 text-xs font-medium text-primary-800 dark:bg-primary-900/30 dark:text-primary-200"
      >
        {{ framework }}
      </span>
      <span
        v-if="path.frameworks.length > 3"
        class="rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600 dark:bg-gray-700 dark:text-gray-400"
      >
        +{{ path.frameworks.length - 3 }}
      </span>
    </div>

    <!-- Footer -->
    <div class="mt-4 flex items-center justify-between border-t border-gray-200 pt-4 dark:border-gray-700">
      <span class="text-xs text-gray-500 dark:text-gray-400">
        {{ path.enrollmentCount }} enrolled
      </span>
      <span
        v-if="path.rating"
        class="flex items-center gap-1 text-xs text-yellow-600 dark:text-yellow-400"
      >
        ⭐ {{ path.rating.toFixed(1) }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import type { ILearningPath } from '@shared/types/learning-paths';

interface Props {
  path: ILearningPath;
}

const props = defineProps<Props>();
defineEmits<{
  click: [];
}>();

const route = useRoute();

const locale = computed(() => (route.params.locale as string) || 'en');

const title = computed(() => {
  return props.path.title[locale.value === 'ar' ? 'ar' : 'en'];
});

const description = computed(() => {
  return props.path.description[locale.value === 'ar' ? 'ar' : 'en'];
});
</script>
