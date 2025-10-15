<template>
  <div class="rounded-lg bg-white p-8 shadow-sm dark:bg-gray-800">
    <div class="mb-6">
      <h2 class="mb-4 text-2xl font-bold text-gray-900 dark:text-white">
        {{ questionText }}
      </h2>

      <!-- Question Metadata -->
      <div class="flex flex-wrap gap-2">
        <!-- Difficulty Badge -->
        <span
          class="inline-flex items-center rounded px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide"
          :class="levelBadgeClass"
        >
          {{ t(`level.${level}.label`) }}
        </span>

        <!-- Question Type Badge -->
        <span class="inline-flex items-center rounded bg-purple-100 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide text-purple-800 dark:bg-purple-900 dark:text-purple-200">
          {{ questionTypeBadge }}
        </span>

        <!-- Category Badge -->
        <span v-if="question.category" class="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-200">
          {{ question.category }}
        </span>

        <!-- Points Badge -->
        <span class="inline-flex items-center rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-semibold text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200">
          {{ question.points }}pt
        </span>
      </div>
    </div>

    <!-- Answer Options (Multiple Choice / True-False) -->
    <div v-if="question.type === 'multiple-choice' || question.type === 'true-false'" class="space-y-3">
      <button
        v-for="option in options"
        :key="option.id"
        type="button"
        :class="getOptionClass(option.id)"
        :disabled="hasAnswered"
        @click="selectOption(option.id)"
      >
        <div class="flex items-center">
          <div class="flex-1 text-left">{{ option.text }}</div>
          <div v-if="hasAnswered && isAnswerRevealed(option.id)" class="ml-4">
            <svg v-if="option.isCorrect" class="h-6 w-6 text-green-500" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
            </svg>
            <svg v-else-if="selectedAnswer === option.id" class="h-6 w-6 text-red-500" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
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
        :disabled="hasAnswered"
        class="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 focus:border-primary-500 focus:ring-2 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
        :placeholder="t('quiz.fillBlankPlaceholder')"
        @input="updateTextAnswer"
        @keyup.enter="$emit('submit')"
      />
    </div>

    <!-- Multiple Checkbox -->
    <div v-else-if="question.type === 'multiple-checkbox'" class="space-y-3">
      <label
        v-for="option in options"
        :key="option.id"
        :class="getCheckboxOptionClass(option.id)"
      >
        <input
          :checked="multipleAnswers.includes(option.id)"
          type="checkbox"
          :value="option.id"
          :disabled="hasAnswered"
          class="h-5 w-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
          @change="toggleMultipleAnswer(option.id)"
        />
        <span class="ml-3 flex-1">{{ option.text }}</span>
        <div v-if="hasAnswered && isAnswerRevealed(option.id)" class="ml-4">
          <svg v-if="option.isCorrect" class="h-6 w-6 text-green-500" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
          </svg>
        </div>
      </label>
    </div>

    <!-- Explanation (shown after answering) -->
    <div v-if="hasAnswered" class="mt-6 rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20">
      <h4 class="mb-2 font-semibold text-blue-900 dark:text-blue-200">
        {{ t('quiz.explanation') }}
      </h4>
      <div class="text-blue-800 dark:text-blue-300" v-html="explanation"></div>
    </div>

    <!-- Actions -->
    <div class="mt-6 flex justify-between">
      <button
        v-if="!hasAnswered"
        type="button"
        class="rounded-lg bg-primary-600 px-6 py-3 font-medium text-white hover:bg-primary-700"
        :disabled="!canSubmit"
        @click="$emit('submit')"
      >
        {{ t('quiz.submit') }}
      </button>

      <button
        v-else
        type="button"
        class="ml-auto rounded-lg bg-primary-600 px-6 py-3 font-medium text-white hover:bg-primary-700"
        @click="$emit('next')"
      >
        {{ isLastQuestion ? t('quiz.finish') : t('quiz.next') }} →
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import type { Question, QuizOption } from '@shared/types/quiz';

interface Props {
  question: Question;
  level: 'junior' | 'intermediate' | 'senior';
  locale: string;
  selectedAnswer: string | null;
  textAnswer: string;
  multipleAnswers: string[];
  hasAnswered: boolean;
  isLastQuestion: boolean;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  'update:selectedAnswer': [value: string | null];
  'update:textAnswer': [value: string];
  'update:multipleAnswers': [value: string[]];
  submit: [];
  next: [];
}>();

const { t } = useI18n();

const questionText = computed(() => {
  return props.question.content?.[props.locale as 'en' | 'ar']?.question ?? '';
});

const options = computed((): QuizOption[] => {
  return props.question.content?.[props.locale as 'en' | 'ar']?.options ?? [];
});

const explanation = computed(() => {
  return props.question.content?.[props.locale as 'en' | 'ar']?.explanation ?? '';
});

const questionTypeBadge = computed(() => {
  const types: Record<string, string> = {
    'multiple-choice': 'MULTIPLE CHOICE',
    'true-false': 'TRUE/FALSE',
    'fill-blank': 'FILL BLANK',
    'multiple-checkbox': 'SELECT ALL',
  };
  return types[props.question.type] || props.question.type.toUpperCase();
});

const levelBadgeClass = computed(() => {
  const classes = {
    junior: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    intermediate: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    senior: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  };
  return classes[props.level] || 'bg-gray-100 text-gray-800';
});

const canSubmit = computed(() => {
  if (props.hasAnswered) return false;

  const qType = props.question.type;
  if (qType === 'multiple-choice' || qType === 'true-false') {
    return props.selectedAnswer !== null;
  } else if (qType === 'fill-blank') {
    return props.textAnswer.trim().length > 0;
  } else if (qType === 'multiple-checkbox') {
    return props.multipleAnswers.length > 0;
  }

  return false;
});

const selectOption = (optionId: string) => {
  if (!props.hasAnswered) {
    emit('update:selectedAnswer', optionId);
  }
};

const updateTextAnswer = (event: Event) => {
  const target = event.target as HTMLInputElement;
  emit('update:textAnswer', target.value);
};

const toggleMultipleAnswer = (optionId: string) => {
  const newAnswers = props.multipleAnswers.includes(optionId)
    ? props.multipleAnswers.filter(id => id !== optionId)
    : [...props.multipleAnswers, optionId];
  emit('update:multipleAnswers', newAnswers);
};

const getOptionClass = (optionId: string) => {
  const baseClass = 'w-full rounded-lg border-2 px-6 py-4 text-left font-medium transition-all';

  if (!props.hasAnswered) {
    if (props.selectedAnswer === optionId) {
      return `${baseClass} border-primary-500 bg-primary-50 text-primary-900 dark:bg-primary-900/20 dark:text-primary-200`;
    }
    return `${baseClass} border-gray-200 bg-white hover:border-primary-300 hover:bg-primary-50 dark:border-gray-700 dark:bg-gray-800 dark:hover:border-primary-700`;
  }

  const option = options.value.find(o => o.id === optionId);

  if (option?.isCorrect) {
    return `${baseClass} border-green-500 bg-green-50 text-green-900 dark:bg-green-900/20 dark:text-green-200`;
  }

  if (props.selectedAnswer === optionId) {
    return `${baseClass} border-red-500 bg-red-50 text-red-900 dark:bg-red-900/20 dark:text-red-200`;
  }

  return `${baseClass} border-gray-200 bg-gray-50 text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400`;
};

const getCheckboxOptionClass = (optionId: string) => {
  const baseClass = 'flex w-full items-center rounded-lg border-2 px-6 py-4 font-medium transition-all';

  if (!props.hasAnswered) {
    return `${baseClass} border-gray-200 bg-white hover:border-primary-300 hover:bg-primary-50 dark:border-gray-700 dark:bg-gray-800`;
  }

  const option = options.value.find(o => o.id === optionId);

  if (option?.isCorrect) {
    return `${baseClass} border-green-500 bg-green-50 text-green-900 dark:bg-green-900/20 dark:text-green-200`;
  }

  return `${baseClass} border-gray-200 bg-gray-50 text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400`;
};

const isAnswerRevealed = (optionId: string) => {
  const option = options.value.find(o => o.id === optionId);
  return option?.isCorrect || props.selectedAnswer === optionId || props.multipleAnswers.includes(optionId);
};
</script>
