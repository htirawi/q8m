<template>
  <div class="mx-auto max-w-4xl">
    <!-- Clean Question Card -->
    <div
      class="rounded-2xl border border-gray-100 bg-white p-8 shadow-sm dark:border-gray-800 dark:bg-gray-900"
    >
      <!-- Question Text - Focus Point -->
      <div class="mb-8">
        <h1
          class="select-none text-2xl font-semibold leading-relaxed text-gray-900 dark:text-white"
          @contextmenu.prevent
          @selectstart.prevent
        >
          {{ questionText }}
        </h1>
      </div>

      <!-- Clean Question Metadata -->
      <div class="mb-8">
        <!-- Essential Info Only -->
        <div class="flex select-none items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
          <span class="inline-flex items-center gap-1.5">
            <div class="h-1.5 w-1.5 rounded-full" :class="levelDotClass"></div>
            {{ t(`level.${level}.label`) }}
          </span>
          <span class="text-gray-300 dark:text-gray-600">•</span>
          <span class="font-medium">{{ questionTypeBadge }} </span>
          <span class="text-gray-300 dark:text-gray-600">•</span>
          <span class="font-semibold text-gray-700 dark:text-gray-300"
            >{{ question.points }}

            point{{ question.points !==
            1 ? 's' : ''1 }}
          </span>
        </div>

        <!-- Single Category Tag (Clean) -->
        <div v-if="getPrimaryCategory" class="mt-3">
          <span
            class="inline-flex select-none items-center rounded-full bg-blue-50 px-3 py-1.5 text-sm font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
          >
            {{ getPrimaryCategory }}
          </span>
        </div>
      </div>

      <!-- Answer Options - Clean Design -->
      <div
        v-if="question.type === 'multiple-choice' || question.type === 'true-false'"
        class="space-y-3"
      >
        <button
          v-for="option in options"
          :key="option.id"
          type="button"
          :class="getOptionClass(option.id)"
          :disabled="hasAnswered"
          @click="selectOption(option.id)"
          @contextmenu.prevent
          @selectstart.prevent
        >
          <div class="flex items-center justify-between">
            <span class="select-none text-lg">{{ option.text }}</span>
            <div v-if="hasAnswered && isAnswerRevealed(option.id)" class="ml-4">
              <svg
                v-if="isCorrectOption(option.id)"
                class="h-5 w-5 text-green-600"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fill-rule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clip-rule="evenodd"
                />
              </svg>
              <svg
                v-else-if="selectedAnswer === option.id"
                class="h-5 w-5 text-red-600"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fill-rule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clip-rule="evenodd"
                />
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
          class="w-full rounded-xl border border-gray-200 bg-white px-6 py-4 text-lg text-gray-900 placeholder-gray-500 transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-400"
          :placeholder="t('quiz.fillBlankPlaceholder')"
          @input="updateTextAnswer"
          @keyup.enter="$emit('submit')"
          @contextmenu.prevent
          @selectstart.prevent
        />
      </div>

      <!-- Multiple Checkbox -->
      <div v-else-if="question.type === 'multiple-checkbox'" class="space-y-3">
        <label
          v-for="option in options"
          :key="option.id"
          :class="getCheckboxOptionClass(option.id)"
          @contextmenu.prevent
          @selectstart.prevent
        >
          <input
            :checked="multipleAnswers.includes(option.id)"
            type="checkbox"
            :value="option.id"
            :disabled="hasAnswered"
            class="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            @change="toggleMultipleAnswer(option.id)"
          />
          <span class="ml-4 select-none text-lg">{{ option.text }} </span>
          <div v-if="hasAnswered && isAnswerRevealed(option.id)" class="ml-auto">
            <svg
              v-if="isCorrectOption(option.id)"
              class="h-5 w-5 text-green-600"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fill-rule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clip-rule="evenodd"
              />
            </svg>
          </div>
        </label>
      </div>

      <!-- Explanation (Clean Design) -->
      <div
        v-if="hasAnswered"
        class="mt-8 select-none rounded-xl bg-blue-50 p-6 dark:bg-blue-900/20"
        @contextmenu.prevent
        @selectstart.prevent
      >
        <h3 class="mb-3 select-none text-lg font-semibold text-blue-900 dark:text-blue-200">
          {{ t("quiz.explanation") }}
        </h3>
        <div
          class="select-none leading-relaxed text-blue-800 dark:text-blue-300"
          v-html="explanation"
        ></div>
      </div>

      <!-- Action Button -->
      <div class="mt-8 flex justify-center">
        <button
          v-if="!hasAnswered"
          type="button"
          class="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-8 py-4 text-lg font-medium text-white shadow-sm transition-all hover:bg-blue-700 hover:shadow-md focus:outline-none focus:ring-4 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:opacity-50"
          :disabled="!canSubmit"
          @click="$emit('submit')"
        >
          {{ t("quiz.submit") }}
        </button>

        <button
          v-else
          type="button"
          class="inline-flex items-center gap-2 rounded-xl bg-gray-900 px-8 py-4 text-lg font-medium text-white shadow-sm transition-all hover:bg-gray-800 hover:shadow-md focus:outline-none focus:ring-4 focus:ring-gray-500/20 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100"
          @click="$emit('next')"
        >
          {{ isLastQuestion ? t("quiz.finish") : t("quiz.next") }}

          <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { IQuizQuestionProps as Props } from "@/types/components/quiz";
import { computed, onMounted, onUnmounted } from "vue";
import { useI18n } from "vue-i18n";
import type { Question, QuizOption } from "@shared/types/quiz";

const props = defineProps<Props>();

const emit = defineEmits<{
  "update:selectedAnswer": [value: string | null];
  "update:textAnswer": [value: string];
  "update:multipleAnswers": [value: string[]];
  submit: [];
  next: [];
}>();

const { t } = useI18n();

const questionText = computed(() => {
  return props.question.content?.[props.locale as "en" | "ar"]?.question ?? "";
});

const options = computed((): QuizOption[] => {
  return props.question.content?.[props.locale as "en" | "ar"]?.options ?? [];
});

const explanation = computed(() => {
  const userAnswer = props.userAnswerResult;
  if (userAnswer?.explanation) {
    return userAnswer.explanation;
  }
  return props.question.content?.[props.locale as "en" | "ar"]?.explanation ?? "";
});

const questionTypeBadge = computed(() => {
  const types: Record<string, string> = {
    "multiple-choice": "Multiple Choice",
    "true-false": "True/False",
    "fill-blank": "Fill in the Blank",
    "multiple-checkbox": "Select All That Apply",
  };
  return types[props.question.type] || props.question.type;
});

const getPrimaryCategory = computed(() => {
  // Priority: category > first tag > null
  if (props.question.category) {
    return props.question.category;
  }
  if (props.question.tags && props.question.tags.length > 0) {
    return props.question.tags[0];
  }
  return null;
});

const levelDotClass = computed(() => {
  const classes = {
    junior: "bg-green-500",
    intermediate: "bg-yellow-500",
    senior: "bg-red-500",
  };
  return classes[props.level] || "bg-gray-500";
});

const canSubmit = computed(() => {
  if (props.question.type === "multiple-choice" || props.question.type === "true-false") {
    return props.selectedAnswer !== null;
  } else if (props.question.type === "fill-blank") {
    return props.textAnswer?.trim().length > 0;
  } else if (props.question.type === "multiple-checkbox") {
    return props.multipleAnswers.length > 0;
  }
  return false;
});

const selectoption = (optionId: string) => {
  if (props.hasAnswered) return;
  emit("update:selectedAnswer", optionId);
};

const updatetextanswer = (event: Event) => {
  const target = event.target as HTMLInputElement;
  emit("update:textAnswer", target.value);
};

const togglemultipleanswer = (optionId: string) => {
  if (props.hasAnswered) return;
  const current = [...props.multipleAnswers];
  const index = current.indexOf(optionId);
  if (index > -1) {
    current.splice(index, 1);
  } else {
    current.push(optionId);
  }
  emit("update:multipleAnswers", current);
};

const getoptionclass = (optionId: string) => {
  const baseClass = "w-full rounded-xl border-2 px-6 py-4 text-left transition-all duration-200";

  if (!props.hasAnswered) {
    if (props.selectedAnswer === optionId) {
      return `${baseClass}

 border-blue-500 bg-blue-50 text-blue-900 dark:bg-blue-900/20; dark:text-blue-200`;
    }
    return `${baseClass}

 border-gray-200 bg-white text-gray-900 hover:border-gray-300; hover:bg-gray-50; dark:border-gray-700; dark:bg-gray-800; dark:text-gray-100; dark:hover:border-gray-600 dark:hover:bg-gray-700`;
  }

  if (isCorrectOption(optionId)) {
    return `${baseClass}

 border-green-500 bg-green-50 text-green-900 dark:bg-green-900/20; dark:text-green-200`;
  }

  if (props.selectedAnswer === optionId) {
    return `${baseClass}

 border-red-500 bg-red-50 text-red-900 dark:bg-red-900/20; dark:text-red-200`;
  }

  return `${baseClass}

 border-gray-200 bg-gray-50 text-gray-700 dark:border-gray-700; dark:bg-gray-800; dark:text-gray-300`;
};

const getcheckboxoptionclass = (optionId: string) => {
  const baseClass =
    "flex w-full items-center rounded-xl border-2 px-6 py-4 transition-all duration-200";

  if (!props.hasAnswered) {
    return `${baseClass}

 border-gray-200 bg-white text-gray-900 hover:border-gray-300; hover:bg-gray-50; dark:border-gray-700; dark:bg-gray-800; dark:text-gray-100; dark:hover:border-gray-600 dark:hover:bg-gray-700`;
  }

  if (isCorrectOption(optionId)) {
    return `${baseClass}

 border-green-500 bg-green-50 text-green-900 dark:bg-green-900/20; dark:text-green-200`;
  }

  return `${baseClass}

 border-gray-200 bg-gray-50 text-gray-700 dark:border-gray-700; dark:bg-gray-800; dark:text-gray-300`;
};

const isanswerrevealed = (optionId: string) => {
  const userAnswer = props.userAnswerResult;

  if (!props.hasAnswered || !userAnswer) {
    return false;
  }

  if (Array.isArray(userAnswer.correctAnswer)) {
    return userAnswer.correctAnswer.includes(optionId);
  } else {
    return userAnswer.correctAnswer === optionId;
  }
};

const iscorrectoption = (optionId: string) => {
  const userAnswer = props.userAnswerResult;
  if (!userAnswer) return false;

  if (Array.isArray(userAnswer.correctAnswer)) {
    return userAnswer.correctAnswer.includes(optionId);
  } else {
    return userAnswer.correctAnswer === optionId;
  }
};

// Anti-copy protection: Disable keyboard shortcuts
const handleKeyDown = (event: KeyboardEvent) => {
  const isCtrlOrCmd = event.ctrlKey || event.metaKey;

  if (
    isCtrlOrCmd &&
    (event.key === "c" ||
      event.key === "a" ||
      event.key === "x" ||
      event.key === "v" ||
      event.key === "s" ||
      event.key === "p" ||
      event.key === "u")
  ) {
    event.preventDefault();
    event.stopPropagation();
    return false;
  }

  if (event.key === "F12") {
    event.preventDefault();
    event.stopPropagation();
    return false;
  }
};

const handledragstart = (event: DragEvent) => {
  event.preventDefault();
  return false;
};

onMounted(() => {
  document.addEventListener("keydown", handleKeyDown, true);
  document.addEventListener("dragstart", handleDragStart, true);
  document.body.style.userSelect = "none";
  document.body.style.webkitUserSelect = "none";
  document.body.style.mozUserSelect = "none";
  document.body.style.msUserSelect = "none";
});

onUnmounted(() => {
  document.removeEventListener("keydown", handleKeyDown, true);
  document.removeEventListener("dragstart", handleDragStart, true);
  document.body.style.userSelect = "";
  document.body.style.webkitUserSelect = "";
  document.body.style.mozUserSelect = "";
  document.body.style.msUserSelect = "";
});
</script>
