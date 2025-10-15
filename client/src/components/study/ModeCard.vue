<template>
  <button
    type="button"
    class="group relative overflow-hidden rounded-3xl border-2 border-gray-200 bg-white p-8 text-left transition-all duration-300 hover:scale-105 hover:shadow-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:border-gray-700 dark:bg-gray-800"
    :class="hoverBorderClass"
    @click="$emit('select')"
  >
    <!-- Icon -->
    <div class="mb-6 flex justify-center transition-transform duration-300 group-hover:scale-110">
      <div
        class="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-r text-white shadow-lg"
        :class="gradient"
      >
        <span class="text-4xl" role="img" :aria-label="`${mode} mode icon`">{{ icon }}</span>
      </div>
    </div>

    <!-- Content -->
    <h2
      class="mb-3 text-2xl font-bold text-gray-900 transition-colors dark:text-white"
      :class="titleHoverClass"
    >
      {{ title }}
    </h2>

    <p class="mb-6 text-base text-gray-600 dark:text-gray-400">
      {{ description }}
    </p>

    <!-- Features List -->
    <div class="mb-8 space-y-3">
      <div
        v-for="(feature, index) in features"
        :key="index"
        class="flex items-start gap-3 text-sm text-gray-700 dark:text-gray-300"
      >
        <svg
          class="mt-0.5 h-5 w-5 flex-shrink-0 text-green-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M5 13l4 4L19 7"
          />
        </svg>
        <span>{{ feature }}</span>
      </div>
    </div>

    <!-- CTA Button -->
    <div class="mt-auto">
      <div
        class="flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r px-6 py-3 text-base font-semibold text-white shadow-md transition-all duration-300 group-hover:scale-105 group-hover:shadow-lg"
        :class="gradient"
      >
        <span>{{ cta }}</span>
        <svg
          class="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M9 5l7 7-7 7"
          />
        </svg>
      </div>
    </div>

    <!-- Hover Gradient Overlay -->
    <div
      class="absolute inset-0 -z-10 rounded-3xl bg-gradient-to-br opacity-0 transition-opacity duration-300 group-hover:opacity-100 dark:opacity-0 dark:group-hover:opacity-20"
      :class="hoverGradient"
    />

    <!-- Focus Ring -->
    <div class="pointer-events-none absolute inset-0 rounded-3xl ring-2 ring-transparent transition-all group-focus-visible:ring-blue-500" />
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { DifficultyLevel } from '@/types/plan/access';

interface Props {
  mode: 'study' | 'quiz';
  difficulty: DifficultyLevel;
  icon: string;
  title: string;
  description: string;
  features: string[];
  cta: string;
  gradient: string;
  hoverGradient: string;
}

const props = defineProps<Props>();

defineEmits<{
  select: [];
}>();

const hoverBorderClass = computed(() => {
  if (props.mode === 'study') {
    return 'hover:border-blue-400 dark:hover:border-blue-600';
  }
  return 'hover:border-purple-400 dark:hover:border-purple-600';
});

const titleHoverClass = computed(() => {
  if (props.mode === 'study') {
    return 'group-hover:text-blue-600 dark:group-hover:text-blue-400';
  }
  return 'group-hover:text-purple-600 dark:group-hover:text-purple-400';
});
</script>
