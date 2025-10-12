<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <div class="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <!-- Loading State -->
      <div v-if="isLoading" class="flex min-h-[400px] items-center justify-center">
        <div class="text-center">
          <div class="mb-4 inline-block h-12 w-12 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600"></div>
          <p class="text-gray-600 dark:text-gray-400">{{ t('quiz.loading') }}</p>
        </div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="rounded-lg bg-red-50 p-6 dark:bg-red-900/20">
        <h3 class="mb-2 text-lg font-semibold text-red-900 dark:text-red-200">
          {{ t('quiz.error.title') }}
        </h3>
        <p class="text-red-700 dark:text-red-300">{{ error }}</p>
        <button
          type="button"
          class="mt-4 rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700"
          @click="loadQuiz"
        >
          {{ t('quiz.error.retry') }}
        </button>
      </div>

      <!-- Results Screen -->
      <div v-else-if="showResults" class="space-y-6">
        <div class="rounded-lg bg-white p-8 shadow-sm dark:bg-gray-800">
          <div class="mb-6 text-center">
            <div class="mb-4 text-6xl">
              {{ getResultEmoji() }}
            </div>
            <h2 class="mb-2 text-3xl font-bold text-gray-900 dark:text-white">
              {{ t('quiz.results.title') }}
            </h2>
            <p class="text-lg text-gray-600 dark:text-gray-400">
              {{ t(`level.${level}.label`) }} {{ t('quiz.results.levelQuiz') }}
            </p>
          </div>

          <div class="grid gap-4 md:grid-cols-3">
            <div class="rounded-lg bg-blue-50 p-6 text-center dark:bg-blue-900/20">
              <div class="mb-2 text-3xl font-bold text-blue-900 dark:text-blue-200">
                {{ score.correct }}/{{ score.total }}
              </div>
              <div class="text-sm text-blue-700 dark:text-blue-300">
                {{ t('quiz.results.correctAnswers') }}
              </div>
            </div>

            <div class="rounded-lg bg-green-50 p-6 text-center dark:bg-green-900/20">
              <div class="mb-2 text-3xl font-bold text-green-900 dark:text-green-200">
                {{ score.percentage }}%
              </div>
              <div class="text-sm text-green-700 dark:text-green-300">
                {{ t('quiz.results.accuracy') }}
              </div>
            </div>

            <div class="rounded-lg bg-purple-50 p-6 text-center dark:bg-purple-900/20">
              <div class="mb-2 text-3xl font-bold text-purple-900 dark:text-purple-200">
                {{ formatTime(score.timeSpent) }}
              </div>
              <div class="text-sm text-purple-700 dark:text-purple-300">
                {{ t('quiz.results.timeSpent') }}
              </div>
            </div>
          </div>

          <div class="mt-8 flex flex-wrap justify-center gap-4">
            <button
              type="button"
              class="rounded-lg bg-primary-600 px-6 py-3 font-medium text-white hover:bg-primary-700"
              @click="retryQuiz"
            >
              {{ t('quiz.results.tryAgain') }}
            </button>
            <button
              type="button"
              class="rounded-lg border border-gray-300 bg-white px-6 py-3 font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
              @click="goBack"
            >
              {{ t('quiz.results.backToSelection') }}
            </button>
          </div>
        </div>
      </div>

      <!-- Quiz Content -->
      <div v-else-if="currentQuestion">
        <!-- Header -->
        <div class="mb-6">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-4">
              <button
                type="button"
                class="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                @click="confirmExit"
              >
                ← {{ t('quiz.exit') }}
              </button>
              <div class="flex items-center gap-2">
                <span
                  class="inline-flex items-center rounded-full px-3 py-1 text-sm font-medium"
                  :class="getLevelBadgeClass(level)"
                >
                  {{ getLevelIcon(level) }} {{ t(`level.${level}.label`) }}
                </span>
              </div>
            </div>
            <div class="flex items-center gap-4">
              <div class="flex items-center gap-2 text-lg font-semibold">
                <svg class="h-5 w-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span class="text-gray-700 dark:text-gray-300">
                  {{ formatTime(elapsedTime) }}
                </span>
              </div>
              <div class="text-sm text-gray-600 dark:text-gray-400">
                {{ currentIndex + 1 }} / {{ totalQuestions }}
              </div>
            </div>
          </div>
        </div>

        <!-- Progress Bar -->
        <div class="mb-6 h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
          <div
            class="h-full bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-300"
            :style="{ width: `${progress}%` }"
          ></div>
        </div>

        <!-- Question Card -->
        <div class="rounded-lg bg-white p-8 shadow-sm dark:bg-gray-800">
          <div class="mb-6">
            <h2 class="mb-4 text-2xl font-bold text-gray-900 dark:text-white">
              {{ getCurrentQuestionText() }}
            </h2>
            
            <!-- Question Metadata -->
            <div class="flex flex-wrap gap-2">
              <span v-if="currentQuestion.category" class="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                {{ currentQuestion.category }}
              </span>
              <span class="inline-flex items-center rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-medium text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                {{ currentQuestion.points }} {{ t('quiz.points') }}
              </span>
            </div>
          </div>

          <!-- Answer Options (Multiple Choice / True-False) -->
          <div v-if="currentQuestion.type === 'multiple-choice' || currentQuestion.type === 'true-false'" class="space-y-3">
            <button
              v-for="option in getCurrentOptions()"
              :key="option.id"
              type="button"
              :class="getOptionClass(option.id)"
              :disabled="hasAnswered"
              @click="selectAnswer(option.id)"
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
          <div v-else-if="currentQuestion.type === 'fill-blank'" class="space-y-4">
            <input
              v-model="textAnswer"
              type="text"
              :disabled="hasAnswered"
              class="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 focus:border-primary-500 focus:ring-2 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              :placeholder="t('quiz.fillBlankPlaceholder')"
              @keyup.enter="submitAnswer"
            />
          </div>

          <!-- Multiple Checkbox -->
          <div v-else-if="currentQuestion.type === 'multiple-checkbox'" class="space-y-3">
            <label
              v-for="option in getCurrentOptions()"
              :key="option.id"
              :class="getCheckboxOptionClass(option.id)"
            >
              <input
                v-model="multipleAnswers"
                type="checkbox"
                :value="option.id"
                :disabled="hasAnswered"
                class="h-5 w-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
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
            <div class="text-blue-800 dark:text-blue-300" v-html="getCurrentExplanation()"></div>
          </div>

          <!-- Actions -->
          <div class="mt-6 flex justify-between">
            <button
              v-if="!hasAnswered"
              type="button"
              class="rounded-lg bg-primary-600 px-6 py-3 font-medium text-white hover:bg-primary-700"
              :disabled="!canSubmit"
              @click="submitAnswer"
            >
              {{ t('quiz.submit') }}
            </button>
            
            <button
              v-else
              type="button"
              class="ml-auto rounded-lg bg-primary-600 px-6 py-3 font-medium text-white hover:bg-primary-700"
              @click="nextQuestion"
            >
              {{ currentIndex < totalQuestions - 1 ? t('quiz.next') : t('quiz.finish') }} →
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from "vue";
import { useI18n } from "vue-i18n";
import { useRouter, useRoute } from "vue-router";
import type { Question, QuizOption } from "@shared/types/quiz";

const { t, locale } = useI18n();
const router = useRouter();
const route = useRoute();

const level = computed(() => route.params.level as "junior" | "intermediate" | "senior");

const questions = ref<Question[]>([]);
const currentIndex = ref(0);
const selectedAnswer = ref<string | null>(null);
const textAnswer = ref("");
const multipleAnswers = ref<string[]>([]);
const hasAnswered = ref(false);
const userAnswers = ref<Record<number, { answer: string | string[]; isCorrect: boolean; timeSpent: number }>>({});

const isLoading = ref(true);
const error = ref<string | null>(null);
const showResults = ref(false);

const startTime = ref(Date.now());
const questionStartTime = ref(Date.now());
const elapsedTime = ref(0);
let timerInterval: ReturnType<typeof setInterval> | null = null;

const currentQuestion = computed(() => questions.value[currentIndex.value]);
const totalQuestions = computed(() => questions.value.length);
const progress = computed(() => ((currentIndex.value + 1) / totalQuestions.value) * 100);

const canSubmit = computed(() => {
  if (hasAnswered.value) return false;
  
  const qType = currentQuestion.value?.type;
  if (qType === 'multiple-choice' || qType === 'true-false') {
    return selectedAnswer.value !== null;
  } else if (qType === 'fill-blank') {
    return textAnswer.value.trim().length > 0;
  } else if (qType === 'multiple-checkbox') {
    return multipleAnswers.value.length > 0;
  }
  
  return false;
});

const score = computed(() => {
  const correct = Object.values(userAnswers.value).filter(a => a.isCorrect).length;
  const total = Object.keys(userAnswers.value).length;
  const percentage = total > 0 ? Math.round((correct / total) * 100) : 0;
  const timeSpent = Math.floor((Date.now() - startTime.value) / 1000);
  
  return { correct, total, percentage, timeSpent };
});

const getLevelIcon = (lvl: string) => {
  const icons = { junior: '🟢', intermediate: '🟡', senior: '🔴' };
  return icons[lvl as keyof typeof icons] || '⚪';
};

const getLevelBadgeClass = (lvl: string) => {
  const classes = {
    junior: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    intermediate: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    senior: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  };
  return classes[lvl as keyof typeof classes] || 'bg-gray-100 text-gray-800';
};

const getCurrentQuestionText = () => {
  if (!currentQuestion.value) return '';
  return currentQuestion.value.content?.[locale.value as 'en' | 'ar']?.question ?? '';
};

const getCurrentOptions = (): QuizOption[] => {
  if (!currentQuestion.value) return [];
  return currentQuestion.value.content?.[locale.value as 'en' | 'ar']?.options ?? [];
};

const getCurrentExplanation = () => {
  if (!currentQuestion.value) return '';
  return currentQuestion.value.content?.[locale.value as 'en' | 'ar']?.explanation ?? '';
};

const getOptionClass = (optionId: string) => {
  const baseClass = 'w-full rounded-lg border-2 px-6 py-4 text-left font-medium transition-all';
  
  if (!hasAnswered.value) {
    if (selectedAnswer.value === optionId) {
      return `${baseClass} border-primary-500 bg-primary-50 text-primary-900 dark:bg-primary-900/20 dark:text-primary-200`;
    }
    return `${baseClass} border-gray-200 bg-white hover:border-primary-300 hover:bg-primary-50 dark:border-gray-700 dark:bg-gray-800 dark:hover:border-primary-700`;
  }
  
  const options = getCurrentOptions();
  const option = options.find(o => o.id === optionId);
  
  if (option?.isCorrect) {
    return `${baseClass} border-green-500 bg-green-50 text-green-900 dark:bg-green-900/20 dark:text-green-200`;
  }
  
  if (selectedAnswer.value === optionId) {
    return `${baseClass} border-red-500 bg-red-50 text-red-900 dark:bg-red-900/20 dark:text-red-200`;
  }
  
  return `${baseClass} border-gray-200 bg-gray-50 text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400`;
};

const getCheckboxOptionClass = (optionId: string) => {
  const baseClass = 'flex w-full items-center rounded-lg border-2 px-6 py-4 font-medium transition-all';
  
  if (!hasAnswered.value) {
    return `${baseClass} border-gray-200 bg-white hover:border-primary-300 hover:bg-primary-50 dark:border-gray-700 dark:bg-gray-800`;
  }
  
  const options = getCurrentOptions();
  const option = options.find(o => o.id === optionId);
  
  if (option?.isCorrect) {
    return `${baseClass} border-green-500 bg-green-50 text-green-900 dark:bg-green-900/20 dark:text-green-200`;
  }
  
  return `${baseClass} border-gray-200 bg-gray-50 text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400`;
};

const isAnswerRevealed = (optionId: string) => {
  const options = getCurrentOptions();
  const option = options.find(o => o.id === optionId);
  return option?.isCorrect || selectedAnswer.value === optionId || multipleAnswers.value.includes(optionId);
};

const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const selectAnswer = (optionId: string) => {
  if (!hasAnswered.value) {
    selectedAnswer.value = optionId;
  }
};

const submitAnswer = () => {
  if (!canSubmit.value || !currentQuestion.value) return;
  
  const timeSpent = Math.floor((Date.now() - questionStartTime.value) / 1000);
  let answer: string | string[];
  let isCorrect = false;
  
  const qType = currentQuestion.value.type;
  const options = getCurrentOptions();
  
  if (qType === 'multiple-choice' || qType === 'true-false') {
    answer = selectedAnswer.value!;
    const selectedOption = options.find(o => o.id === answer);
    isCorrect = selectedOption?.isCorrect ?? false;
  } else if (qType === 'fill-blank') {
    answer = textAnswer.value.trim();
    // Check against correct answers (simplified)
    const correctOption = options.find(o => o.isCorrect);
    isCorrect = correctOption?.text.toLowerCase() === answer.toLowerCase();
  } else {
    answer = multipleAnswers.value;
    const correctIds = options.filter(o => o.isCorrect).map(o => o.id).sort();
    const selectedIds = [...answer].sort();
    isCorrect = JSON.stringify(correctIds) === JSON.stringify(selectedIds);
  }
  
  userAnswers.value[currentIndex.value] = { answer, isCorrect, timeSpent };
  hasAnswered.value = true;
};

const nextQuestion = () => {
  if (currentIndex.value < totalQuestions.value - 1) {
    currentIndex.value++;
    resetQuestionState();
  } else {
    finishQuiz();
  }
};

const resetQuestionState = () => {
  selectedAnswer.value = null;
  textAnswer.value = "";
  multipleAnswers.value = [];
  hasAnswered.value = false;
  questionStartTime.value = Date.now();
};

const finishQuiz = () => {
  showResults.value = true;
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
};

const getResultEmoji = () => {
  if (score.value.percentage >= 90) return '🏆';
  if (score.value.percentage >= 80) return '🎉';
  if (score.value.percentage >= 70) return '👍';
  if (score.value.percentage >= 60) return '👌';
  return '📚';
};

const retryQuiz = () => {
  showResults.value = false;
  currentIndex.value = 0;
  userAnswers.value = {};
  startTime.value = Date.now();
  resetQuestionState();
  startTimer();
};

const confirmExit = () => {
  if (confirm(t('quiz.confirmExit'))) {
    goBack();
  }
};

const goBack = () => {
  const currentLocale = route.params.locale || 'en';
  router.push(`/${currentLocale}/quiz`);
};

const startTimer = () => {
  if (timerInterval) clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    elapsedTime.value = Math.floor((Date.now() - startTime.value) / 1000);
  }, 1000);
};

const loadQuiz = async () => {
  isLoading.value = true;
  error.value = null;
  
  try {
    // TODO: Replace with actual API call
    const response = await fetch(`/api/quiz/questions?level=${level.value}`, {
      credentials: 'include',
    });
    
    if (!response.ok) {
      throw new Error('Failed to load quiz');
    }
    
    const data = await response.json();
    questions.value = data.questions || [];
    
    if (questions.value.length === 0) {
      error.value = t('quiz.error.noQuestions');
    }
    
    startTimer();
  } catch (err) {
    error.value = err instanceof Error ? err.message : t('quiz.error.generic');
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  loadQuiz();
});

onUnmounted(() => {
  if (timerInterval) {
    clearInterval(timerInterval);
  }
});
</script>
