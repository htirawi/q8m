<template>
  <div class="rounded-xl bg-white p-6 shadow-lg transition-shadow duration-300 hover:shadow-xl dark:bg-gray-800 sm:p-8">
    <div class="mb-6">
      <!-- Question Metadata Header -->
      <div class="mb-4 flex flex-wrap items-center gap-3">
        <!-- Category IBadge -->
        <span v-if="question.category" :class="getCategoryBadgeClass(question.category)"
          class="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold shadow-sm transition-all duration-200 hover:scale-105">
          <svg class="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 20 20">
            <path
              d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
          </svg>
          {{ question.category }}
        </span>

        <!-- Difficulty Indicator -->
        <span v-if="question.difficulty" :class="getDifficultyBadgeClass(question.difficulty)"
          class="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold shadow-sm">
          <span class="flex gap-0.5">
            <span v-for="i in getDifficultyDots(question.difficulty)" :key="i"
              class="h-1.5 w-1.5 rounded-full bg-current"></span>
          </span>
          {{ question.difficulty.charAt(0).toUpperCase() + question.difficulty.slice(1) }}
        </span>

        <!-- Question Type IBadge -->
        <span
          class="inline-flex items-center gap-1.5 rounded-lg bg-purple-50 px-3 py-1.5 text-xs font-medium text-purple-700 dark:bg-purple-900/20 dark:text-purple-300">
          <svg class="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z"
              clip-rule="evenodd" />
          </svg>
          {{ getQuestionTypeLabel(question.type) }}
        </span>
      </div>

      <!-- Question Text -->
      <h2 class="mb-4 text-xl font-bold leading-tight text-gray-900 dark:text-white sm:text-2xl">
        {{ questionText }}
      </h2>

      <!-- Tags -->
      <div v-if="question.tags && question.tags.length > 0" class="flex flex-wrap gap-2">
        <span v-for="tag in question.tags" :key="tag"
          class="group inline-flex items-center gap-1 rounded-md bg-gradient-to-r from-gray-50 to-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700 transition-all duration-200 hover:from-gray-100 hover:to-gray-200 hover:shadow-sm dark:from-gray-700 dark:to-gray-600 dark:text-gray-300 dark:hover:from-gray-600 dark:hover:to-gray-500">
          <svg class="h-3 w-3 opacity-50 transition-opacity group-hover:opacity-100" fill="currentColor"
            viewBox="0 0 20 20">
            <path fill-rule="evenodd"
              d="M17.707 9.293a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-7-7A.997.997 0 012 10V5a3 3 0 013-3h5c.256 0 .512.098.707.293l7 7zM5 6a1 1 0 100-2 1 1 0 000 2z"
              clip-rule="evenodd" />
          </svg>
          {{ tag }}
        </span>
      </div>
    </div>

    <!-- Answer Section (Only for Quiz Mode questions) -->
    <div v-if="showAnswer && question.type !== 'open-ended'" ref="answerSection"
      class="mb-6 rounded-lg bg-green-50 p-6 dark:bg-green-900/20">
      <h3 class="mb-4 flex items-center gap-2 font-semibold text-green-900 dark:text-green-200">
        <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
            clip-rule="evenodd" />
        </svg>
        {{ t('study.answer') }}
      </h3>
      <MarkdownRenderer :content="explanation" />
    </div>

    <!-- Study Mode: Show explanation directly (no answer options) -->
    <div v-if="showAnswer && question.type === 'open-ended'" class="mb-6">
      <h3 class="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
        {{ t('study.explanation') }}
      </h3>
      <div class="prose prose-sm dark:prose-invert max-w-none">
        <MarkdownRenderer :content="explanation" />
      </div>
    </div>

    <!-- Quiz Mode: Interactive Answer Options (Only show AFTER reveal) -->
    <div v-else-if="showAnswer && hasInteractiveOptions && question.type !== 'open-ended'" class="mb-6">
      <h3 class="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
        {{ question.type === 'fill-blank' ? t('study.correctAnswer') : t('study.correctAnswer') }}
      </h3>

      <!-- Multiple Choice / True-False Options -->
      <div v-if="question.type === 'multiple-choice' || question.type === 'true-false'" class="space-y-3">
        <button v-for="option in options" :key="option.id" type="button" :class="getOptionClass(option.id)"
          @click="selectOption(option.id)">
          <div class="flex items-center">
            <div class="flex-1 text-left">{{ option.text }}</div>
            <div v-if="selectedAnswer === option.id" class="ml-4">
              <svg class="h-5 w-5 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clip-rule="evenodd" />
              </svg>
            </div>
          </div>
        </button>
      </div>

      <!-- Fill in the Blank -->
      <div v-else-if="question.type === 'fill-blank'" class="space-y-4">
        <input :value="textAnswer" type="text"
          class="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 focus:border-primary-500 focus:ring-2 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          :placeholder="t('study.fillBlankPlaceholder')" @input="updateTextAnswer" />
      </div>

      <!-- Multiple Checkbox -->
      <div v-else-if="question.type === 'multiple-checkbox'" class="space-y-3">
        <label v-for="option in options" :key="option.id" :class="getCheckboxClass(option.id)">
          <input :checked="multipleAnswers.includes(option.id)" type="checkbox" :value="option.id"
            class="h-5 w-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            @change="toggleCheckbox(option.id)" />
          <span class="ml-3 flex-1">{{ option.text }}</span>
        </label>
      </div>
    </div>

    <!-- Actions -->
    <div class="flex flex-wrap gap-3">
      <button v-if="!showAnswer" type="button"
        class="rounded-lg bg-primary-600 px-6 py-3 font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
        @click="$emit('reveal')">
        {{ t('study.revealAnswer') }}
      </button>

      <template v-else>
        <button type="button"
          class="rounded-lg bg-gray-200 px-6 py-3 font-medium text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
          :disabled="!props.canGoPrevious" @click="$emit('previous')">
          ← {{ t('study.previous') }}
        </button>

        <button type="button" class="rounded-lg bg-primary-600 px-6 py-3 font-medium text-white hover:bg-primary-700"
          :disabled="props.isLoadingMore" @click="$emit('next')">
          <span v-if="props.isLoadingMore">
            <svg class="inline h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
              </path>
            </svg>
            {{ t('study.loading') }}
          </span>
          <span v-else>
            {{ nextButtonText }} →
          </span>
        </button>

        <button type="button"
          class="rounded-lg border border-gray-300 px-6 py-3 font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
          @click="$emit('toggle-bookmark')">
          {{ props.isBookmarked ? '🔖' : '📑' }} {{ props.isBookmarked ? t('study.bookmarked') : t('study.bookmark') }}
        </button>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { IStudyQuestionProps as Props } from "@/types/components/study";
import { computed, ref, watch, nextTick } from 'vue';
import { useI18n } from 'vue-i18n';
import type { Question } from '@shared/types/quiz';
import MarkdownRenderer from '@/components/common/MarkdownRenderer.vue';

const answerSection = ref<HTMLDivElement | null>(null);



const props = defineProps<Props>();

const emit = defineEmits<{
  'update:selectedAnswer': [value: string | null];
  'update:textAnswer': [value: string];
  'update:multipleAnswers': [value: string[]];
  reveal: [];
  previous: [];
  next: [];
  'toggle-bookmark': [];
}>();

const { t } = useI18n();

const questionText = computed(() => {
  return props.question.content?.[props.locale as 'en' | 'ar']?.question ?? '';
});

const explanation = computed(() => {
  return props.question.content?.[props.locale as 'en' | 'ar']?.explanation ?? '';
});

const options = computed(() => {
  const opts = props.question.content?.[props.locale as 'en' | 'ar']?.options;
  if (!opts || !Array.isArray(opts)) return [];

  return opts.map((option: any) => ({
    id: option.id || option._id || `option_${Math.random()}`,
    text: option.text || option,
    isCorrect: option.isCorrect || false
  }));
});

const hasInteractiveOptions = computed(() => {
  return props.question.type === 'multiple-choice' ||
    props.question.type === 'true-false' ||
    props.question.type === 'fill-blank' ||
    props.question.type === 'multiple-checkbox';
});

const nextButtonText = computed(() => {
  if (props.isLastQuestion) {
    return props.hasMore ? t('study.loadMore') : t('study.finish');
  }
  return t('study.next');
});

const selectOption = (optionId: string) => {
  emit('update:selectedAnswer', optionId);
};

const updateTextAnswer = (event: Event) => {
  const target = event.target as HTMLInputElement;
  emit('update:textAnswer', target.value);
};

const toggleCheckbox = (optionId: string) => {
  const newAnswers = props.multipleAnswers.includes(optionId)
    ? props.multipleAnswers.filter(id => id !== optionId)
    : [...props.multipleAnswers, optionId];
  emit('update:multipleAnswers', newAnswers);
};

const getOptionClass = (optionId: string) => {
  const baseClass = "w-full rounded-lg border p-4 text-left transition-all hover:shadow-md";
  const isSelected = props.selectedAnswer === optionId;

  if (isSelected) {
    return `${baseClass} border-primary-500 bg-primary-50 text-primary-900 dark:bg-primary-900/20 dark:text-primary-200`;
  }

  return `${baseClass} border-gray-200 bg-white text-gray-900 hover:border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white`;
};

const getCheckboxClass = (optionId: string) => {
  const baseClass = "flex cursor-pointer items-center rounded-lg border p-4 transition-all hover:shadow-md";
  const isSelected = props.multipleAnswers.includes(optionId);

  if (isSelected) {
    return `${baseClass} border-primary-500 bg-primary-50 dark:bg-primary-900/20`;
  }

  return `${baseClass} border-gray-200 bg-white hover:border-gray-300 dark:border-gray-600 dark:bg-gray-700`;
};

// Category badge colors
const getCategoryBadgeClass = (category: string) => {
  const categoryColors: Record<string, string> = {
    'Components': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
    'State Management': 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
    'Routing': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
    'Forms': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
    'HTTP & API': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
    'Testing': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300',
    'Performance': 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
    'Security': 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300',
    'Architecture': 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300',
    'Hooks': 'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300',
    'Redux': 'bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-300',
    'Next.js': 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
  };

  return categoryColors[category] || 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
};

// Difficulty badge colors
const getDifficultyBadgeClass = (difficulty: string) => {
  const difficultyColors: Record<string, string> = {
    'easy': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    'medium': 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    'hard': 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  };

  return difficultyColors[difficulty] || difficultyColors.easy;
};

// Difficulty dots (visual indicator)
const getDifficultyDots = (difficulty: string) => {
  const dots: Record<string, number> = {
    'easy': 1,
    'medium': 2,
    'hard': 3,
  };

  return dots[difficulty] || 1;
};

// Question type labels
const getQuestionTypeLabel = (type: string) => {
  const labels: Record<string, string> = {
    'multiple-choice': 'Multiple Choice',
    'true-false': 'True/False',
    'fill-blank': 'Fill in the Blank',
    'multiple-checkbox': 'Multiple Select',
    'open-ended': 'Explanatory',
  };

  return labels[type] || 'Question';
};

// Auto-scroll to answer when revealed
watch(() => props.showAnswer, (newValue) => {
  if (newValue && answerSection.value) {
    nextTick(() => {
      answerSection.value?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    });
  }
});
</script>
