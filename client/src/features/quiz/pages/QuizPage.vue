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
      <QuizResults
        v-else-if="showResults"
        :level="level"
        :score="score"
        @retry="retryQuiz"
        @exit="goBack"
      />

      <!-- Quiz Content -->
      <div v-else-if="currentQuestion">
        <QuizHeader
          :level="level"
          :current-index="currentIndex"
          :total-questions="totalQuestions"
          :remaining-time="remainingTime"
          :quiz-duration="quizDuration"
          :is-sticky="isMobileTimerSticky"
          @exit="confirmExit"
        />

        <QuizQuestion
          :question="currentQuestion"
          :level="level"
          :locale="locale"
          v-model:selected-answer="selectedAnswer"
          v-model:text-answer="textAnswer"
          v-model:multiple-answers="multipleAnswers"
          :has-answered="hasAnswered"
          :is-last-question="currentIndex >= totalQuestions - 1"
          @submit="submitAnswer"
          @next="nextQuestion"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from "vue";
import { useI18n } from "vue-i18n";
import { useRouter, useRoute } from "vue-router";
import type { Question } from "@shared/types/quiz";
import QuizResults from "../components/QuizResults.vue";
import QuizHeader from "../components/QuizHeader.vue";
import QuizQuestion from "../components/QuizQuestion.vue";

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

// Mobile optimizations
const isMobileTimerSticky = ref(false);
let touchStartX = 0;
let touchStartY = 0;
let touchEndX = 0;
let touchEndY = 0;

// Countdown timer (30 minutes default)
const quizDuration = ref(30 * 60); // 30 minutes in seconds
const remainingTime = ref(quizDuration.value);
const elapsedTime = ref(0);
let timerInterval: ReturnType<typeof setInterval> | null = null;

const currentQuestion = computed(() => questions.value[currentIndex.value]);
const totalQuestions = computed(() => questions.value.length);

const score = computed(() => {
  const correct = Object.values(userAnswers.value).filter(a => a.isCorrect).length;
  const total = Object.keys(userAnswers.value).length;
  const percentage = total > 0 ? Math.round((correct / total) * 100) : 0;
  const timeSpent = Math.floor((Date.now() - startTime.value) / 1000);

  return { correct, total, percentage, timeSpent };
});

const submitAnswer = () => {
  if (!currentQuestion.value) return;

  const timeSpent = Math.floor((Date.now() - questionStartTime.value) / 1000);
  let answer: string | string[];
  let isCorrect = false;

  const qType = currentQuestion.value.type;
  const options = currentQuestion.value.content?.[locale.value as 'en' | 'ar']?.options ?? [];

  if (qType === 'multiple-choice' || qType === 'true-false') {
    if (!selectedAnswer.value) return;
    answer = selectedAnswer.value;
    const selectedOption = options.find(o => o.id === answer);
    isCorrect = selectedOption?.isCorrect ?? false;
  } else if (qType === 'fill-blank') {
    answer = textAnswer.value.trim();
    if (!answer) return;
    const correctOption = options.find(o => o.isCorrect);
    isCorrect = correctOption?.text.toLowerCase() === answer.toLowerCase();
  } else {
    if (multipleAnswers.value.length === 0) return;
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

const saveQuizHistory = () => {
  try {
    const quizResult = {
      id: `quiz_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      level: level.value,
      score: score.value.percentage,
      correct: score.value.correct,
      total: score.value.total,
      timeSpent: score.value.timeSpent,
      timestamp: Date.now(),
      date: new Date().toISOString(),
      answers: userAnswers.value,
    };

    const historyKey = 'quiz_history';
    const existingHistory = localStorage.getItem(historyKey);
    const history = existingHistory ? JSON.parse(existingHistory) : [];
    history.unshift(quizResult);
    localStorage.setItem(historyKey, JSON.stringify(history.slice(0, 50)));

    const activitiesKey = 'recent_activities';
    const existingActivities = localStorage.getItem(activitiesKey);
    const activities = existingActivities ? JSON.parse(existingActivities) : [];
    activities.unshift({
      id: quizResult.id,
      type: 'quiz',
      title: `${t(`level.${level.value}.label`)} Quiz - ${score.value.percentage}%`,
      timestamp: Date.now(),
      score: score.value.percentage,
    });
    localStorage.setItem(activitiesKey, JSON.stringify(activities.slice(0, 10)));

    updateStreak();
  } catch (error) {
    console.error('Failed to save quiz history:', error);
  }
};

const updateStreak = () => {
  try {
    const streakKey = 'learning_streak';
    const streakData = localStorage.getItem(streakKey);
    const streak = streakData ? JSON.parse(streakData) : {
      currentStreak: 0,
      bestStreak: 0,
      lastActivityDate: null,
    };

    const today = new Date().toDateString();
    const lastDate = streak.lastActivityDate ? new Date(streak.lastActivityDate).toDateString() : null;

    if (lastDate !== today) {
      if (lastDate === new Date(Date.now() - 86400000).toDateString()) {
        streak.currentStreak += 1;
      } else if (lastDate !== today) {
        streak.currentStreak = 1;
      }

      if (streak.currentStreak > streak.bestStreak) {
        streak.bestStreak = streak.currentStreak;
      }

      streak.lastActivityDate = new Date().toISOString();
      localStorage.setItem(streakKey, JSON.stringify(streak));

      const statsKey = 'progress_stats';
      const stats = localStorage.getItem(statsKey);
      const progressStats = stats ? JSON.parse(stats) : {};
      progressStats.currentStreak = streak.currentStreak;
      progressStats.bestStreak = streak.bestStreak;
      localStorage.setItem(statsKey, JSON.stringify(progressStats));
    }
  } catch (error) {
    console.error('Failed to update streak:', error);
  }
};

const finishQuiz = () => {
  showResults.value = true;
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
  saveQuizHistory();
};

const retryQuiz = () => {
  showResults.value = false;
  currentIndex.value = 0;
  userAnswers.value = {};
  startTime.value = Date.now();
  remainingTime.value = quizDuration.value;
  elapsedTime.value = 0;
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
    remainingTime.value = Math.max(0, quizDuration.value - elapsedTime.value);

    if (remainingTime.value === 0) {
      handleTimeUp();
    }
  }, 1000);
};

const handleTimeUp = () => {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }

  if (!hasAnswered.value && currentQuestion.value) {
    userAnswers.value[currentIndex.value] = {
      answer: '',
      isCorrect: false,
      timeSpent: Math.floor((Date.now() - questionStartTime.value) / 1000)
    };
  }

  finishQuiz();
};

const loadQuiz = async () => {
  isLoading.value = true;
  error.value = null;

  try {
    const response = await fetch(`/api/questions/quiz/questions?level=${level.value}&limit=10`, {
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

// Mobile swipe gesture handlers
const handleTouchStart = (event: TouchEvent) => {
  const touch = event.changedTouches[0];
  if (touch) {
    touchStartX = touch.screenX;
    touchStartY = touch.screenY;
  }
};

const handleTouchEnd = (event: TouchEvent) => {
  const touch = event.changedTouches[0];
  if (touch) {
    touchEndX = touch.screenX;
    touchEndY = touch.screenY;
    handleSwipeGesture();
  }
};

const handleSwipeGesture = () => {
  const swipeThreshold = 50;
  const verticalSwipeThreshold = 100;

  const horizontalDiff = touchEndX - touchStartX;
  const verticalDiff = Math.abs(touchEndY - touchStartY);

  if (verticalDiff > verticalSwipeThreshold) {
    return;
  }

  if (horizontalDiff < -swipeThreshold && hasAnswered.value) {
    nextQuestion();
  }
};

const handleScroll = () => {
  if (window.innerWidth >= 768) {
    isMobileTimerSticky.value = false;
    return;
  }
  isMobileTimerSticky.value = window.scrollY > 100;
};

const handleKeyboard = (event: KeyboardEvent) => {
  if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
    return;
  }

  const key = event.key.toLowerCase();

  if (key === 'escape') {
    event.preventDefault();
    if (!showResults.value) {
      confirmExit();
    }
    return;
  }

  if (showResults.value || !currentQuestion.value) {
    return;
  }

  const qType = currentQuestion.value.type;

  if (key === ' ') {
    event.preventDefault();
    if (!hasAnswered.value) {
      submitAnswer();
    } else if (hasAnswered.value) {
      nextQuestion();
    }
    return;
  }

  if (key === 'enter') {
    event.preventDefault();
    if (!hasAnswered.value) {
      submitAnswer();
    }
    return;
  }

  if (key === 'arrowright' && hasAnswered.value) {
    event.preventDefault();
    nextQuestion();
    return;
  }

  if (!hasAnswered.value && (qType === 'multiple-choice' || qType === 'true-false')) {
    const options = currentQuestion.value.content?.[locale.value as 'en' | 'ar']?.options ?? [];
    const numKey = parseInt(key);

    if (!isNaN(numKey) && numKey >= 1 && numKey <= options.length) {
      event.preventDefault();
      const option = options[numKey - 1];
      if (option) {
        selectedAnswer.value = option.id;
      }
    }
  }
};

onMounted(() => {
  loadQuiz();
  window.addEventListener('keydown', handleKeyboard);
  window.addEventListener('touchstart', handleTouchStart, { passive: true });
  window.addEventListener('touchend', handleTouchEnd, { passive: true });
  window.addEventListener('scroll', handleScroll, { passive: true });
});

onUnmounted(() => {
  if (timerInterval) {
    clearInterval(timerInterval);
  }
  window.removeEventListener('keydown', handleKeyboard);
  window.removeEventListener('touchstart', handleTouchStart);
  window.removeEventListener('touchend', handleTouchEnd);
  window.removeEventListener('scroll', handleScroll);
});
</script>
