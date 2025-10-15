<template>
  <div class="rounded-lg bg-white p-8 shadow-sm dark:bg-gray-800">
    <div class="mb-6">
      <h2 class="mb-4 text-2xl font-bold text-gray-900 dark:text-white">
        {{ questionText }}
      </h2>

      <!-- Question Metadata -->
      <div class="flex flex-wrap gap-2">
        <span v-if="question.category" class="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-200">
          {{ question.category }}
        </span>
        <span v-for="tag in question.tags" :key="tag" class="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800 dark:bg-gray-700 dark:text-gray-300">
          {{ tag }}
        </span>
      </div>
    </div>

    <!-- Answer Section -->
    <div v-if="showAnswer" class="mb-6 rounded-lg bg-green-50 p-6 dark:bg-green-900/20">
      <h3 class="mb-2 flex items-center gap-2 font-semibold text-green-900 dark:text-green-200">
        <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
        </svg>
        {{ t('study.answer') }}
      </h3>
      <div class="text-green-800 dark:text-green-300" v-html="explanation"></div>
    </div>

    <!-- Interactive Answer Options (Study Mode) -->
    <div v-if="!showAnswer && hasInteractiveOptions" class="mb-6">
      <h3 class="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
        {{ question.type === 'fill-blank' ? t('study.typeAnswer') : t('study.selectAnswer') }}
      </h3>

      <!-- Multiple Choice / True-False Options -->
      <div v-if="question.type === 'multiple-choice' || question.type === 'true-false'" class="space-y-3">
        <button
          v-for="option in options"
          :key="option.id"
          type="button"
          :class="getOptionClass(option.id)"
          @click="selectOption(option.id)"
        >
          <div class="flex items-center">
            <div class="flex-1 text-left">{{ option.text }}</div>
            <div v-if="selectedAnswer === option.id" class="ml-4">
              <svg class="h-5 w-5 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
              </svg>
            </div>
          </div>
        </button>
      </div>

      <!-- Fill in the Blank -->
      <div v-else-if="question.type === 'fill-blank'" class="space-y-4">
        <input
          :value="textAnswer"
          type="text"
          class="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 focus:border-primary-500 focus:ring-2 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          :placeholder="t('study.fillBlankPlaceholder')"
          @input="updateTextAnswer"
        />
      </div>

      <!-- Multiple Checkbox -->
      <div v-else-if="question.type === 'multiple-checkbox'" class="space-y-3">
        <label
          v-for="option in options"
          :key="option.id"
          :class="getCheckboxClass(option.id)"
        >
          <input
            :checked="multipleAnswers.includes(option.id)"
            type="checkbox"
            :value="option.id"
            class="h-5 w-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            @change="toggleCheckbox(option.id)"
          />
          <span class="ml-3 flex-1">{{ option.text }}</span>
        </label>
      </div>
    </div>

    <!-- Actions -->
    <div class="flex flex-wrap gap-3">
      <button
        v-if="!showAnswer"
        type="button"
        class="rounded-lg bg-primary-600 px-6 py-3 font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
        @click="$emit('reveal')"
      >
        {{ t('study.revealAnswer') }}
      </button>

      <template v-else>
        <button
          type="button"
          class="rounded-lg bg-gray-200 px-6 py-3 font-medium text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
          :disabled="!canGoPrevious"
          @click="$emit('previous')"
        >
          ← {{ t('study.previous') }}
        </button>

        <button
          type="button"
          class="rounded-lg bg-primary-600 px-6 py-3 font-medium text-white hover:bg-primary-700"
          :disabled="isLoadingMore"
          @click="$emit('next')"
        >
          <span v-if="isLoadingMore">
            <svg class="inline h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            {{ t('study.loading') }}
          </span>
          <span v-else>
            {{ nextButtonText }} →
          </span>
        </button>

        <button
          type="button"
          class="rounded-lg border border-gray-300 px-6 py-3 font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
          @click="$emit('toggle-bookmark')"
        >
          {{ isBookmarked ? '🔖' : '📑' }} {{ isBookmarked ? t('study.bookmarked') : t('study.bookmark') }}
        </button>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import type { Question } from '@shared/types/quiz';

interface Props {
  question: Question;
  locale: string;
  showAnswer: boolean;
  selectedAnswer: string | null;
  textAnswer: string;
  multipleAnswers: string[];
  isBookmarked: boolean;
  canGoPrevious: boolean;
  isLoadingMore: boolean;
  isLastQuestion: boolean;
  hasMore: boolean;
}

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
</script>
