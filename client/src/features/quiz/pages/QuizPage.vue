<template>
  <div
    class="relative min-h-screen overflow-hidden bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
    <!-- Animated Background Blobs -->
    <div class="pointer-events-none absolute inset-0 overflow-hidden">
      <div
        class="absolute -left-4 top-20 h-72 w-72 animate-blob rounded-full bg-blue-300 opacity-20 mix-blend-multiply blur-xl filter dark:bg-blue-600 dark:opacity-10">
      </div>
      <div
        class="animation-delay-2000 absolute right-4 top-40 h-72 w-72 animate-blob rounded-full bg-purple-300 opacity-20 mix-blend-multiply blur-xl filter dark:bg-purple-600 dark:opacity-10">
      </div>
      <div
        class="animation-delay-4000 absolute -bottom-8 left-1/3 h-72 w-72 animate-blob rounded-full bg-pink-300 opacity-20 mix-blend-multiply blur-xl filter dark:bg-pink-600 dark:opacity-10">
      </div>
    </div>

    <div class="relative mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <!-- Loading State -->
      <div v-if="isLoading" class="flex min-h-[500px] items-center justify-center">
        <div class="text-center">
          <div
            class="mb-6 inline-block h-16 w-16 animate-spin rounded-full border-4 border-purple-200 border-t-purple-600 dark:border-purple-800 dark:border-t-purple-400">
          </div>
          <p class="text-lg font-medium text-gray-700 dark:text-gray-300">
            {{ t("quiz.loading") }}
          </p>
          <p class="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Preparing your quiz questions...
          </p>
        </div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="flex min-h-[500px] items-center justify-center">
        <div
          class="mx-auto max-w-md rounded-2xl border-2 border-red-200 bg-white/80 p-8 text-center backdrop-blur-sm dark:border-red-800 dark:bg-gray-800/80">
          <!-- Error Icon -->
          <div class="mb-4 flex justify-center">
            <div class="rounded-full bg-red-100 p-4 dark:bg-red-900/30">
              <svg class="h-12 w-12 text-red-600 dark:text-red-400" fill="none" stroke="currentColor"
                viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
          </div>

          <h3 class="mb-3 text-2xl font-bold text-gray-900 dark:text-white">
            {{ t("quiz.error?.title") }}
          </h3>
          <p class="mb-6 text-sm leading-relaxed text-gray-600 dark:text-gray-400">{{ error }}</p>

          <button type="button"
            class="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-red-500 to-pink-600 px-6 py-3 font-semibold text-white shadow-lg transition-all duration-300 hover:scale-105 hover:from-red-600 hover:to-pink-700 hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-red-500 focus:ring-offset-2"
            @click="loadQuiz">
            <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            {{ t("quiz.error?.retry") }}
          </button>
        </div>
      </div>

      <!-- Results Screen -->
      <QuizResults v-else-if="showResults" :level="level" :score="score" :total-questions="score.total"
        :correct-answers="score.correct" :time-spent="score.timeSpent" :quiz-result-data="quizResultData ?? undefined"
        @retry="retryQuiz" @exit="goBack" />

      <!-- Quiz Content -->
      <div v-else-if="currentQuestion">
        <QuizHeader :level="level" :current-index="currentIndex" :total-questions="totalQuestions"
          :remaining-time="remainingTime" :quiz-duration="quizDuration" :is-sticky="isMobileTimerSticky"
          @exit="confirmExit" />

        <QuizQuestion :question="currentQuestion" :level="level" :locale="locale"
          v-model:selected-answer="selectedAnswer ?? undefined" v-model:text-answer="textAnswer"
          v-model:multiple-answers="multipleAnswers" :has-answered="hasAnswered"
          :is-last-question="currentIndex >= totalQuestions - 1" :user-answer-result="userAnswers[currentIndex] ? {
            isCorrect: userAnswers[currentIndex]!.isCorrect,
            correctAnswer: userAnswers[currentIndex]!.correctAnswer ?? '',
            explanation: userAnswers[currentIndex]!.explanation ?? '',
            points: userAnswers[currentIndex]!.points ?? 0
          } : undefined"
          @submit="submitAnswer" @next="nextQuestion" />
      </div>
    </div>

    <!-- Level Up Celebration Modal -->
    <LevelUpCelebration v-if="showLevelUpModal && levelUpData" :show="showLevelUpModal"
      :new-level="levelUpData.newLevel" :previous-level="levelUpData.previousLevel"
      :level-title="getLevelTitle(levelUpData.newLevel)" :xp-earned="levelUpData.xpEarned" :rewards="[]"
      :shareable="true" @close="showLevelUpModal = false" />

    <!-- IBadge Unlock Notifications -->
    <BadgeUnlockNotification ref="badgeNotificationRef" position="top-right" :duration="5000" :max-visible="3" />

    <!-- Resume Quiz Modal -->
    <Teleport to="body">
      <div v-if="showResumeModal"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
        @click.self="dismissResume">
        <div class="mx-4 w-full max-w-md animate-fade-in-up rounded-2xl bg-white p-8 shadow-2xl dark:bg-gray-800">
          <!-- Icon -->
          <div class="mb-6 flex justify-center">
            <div class="rounded-full bg-blue-100 p-4 dark:bg-blue-900/30">
              <svg class="h-12 w-12 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor"
                viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>

          <!-- Content -->
          <h3 class="mb-3 text-center text-2xl font-bold text-gray-900 dark:text-white">
            {{ t("quiz.resume?.title", "Resume Quiz?") }}
          </h3>
          <p class="mb-6 text-center text-gray-600 dark:text-gray-400">
            {{
              t(
                "quiz.resume?.message",
                "You have an incomplete quiz. Would you like to continue where you left off?"
              )
            }}
          </p>

          <!-- Quiz Info -->
          <div v-if="preferencesStore.incompleteQuiz" class="mb-6 rounded-lg bg-gray-50 p-4 dark:bg-gray-700/50">
            <div class="flex items-center justify-between text-sm">
              <span class="text-gray-600 dark:text-gray-400">{{ t("quiz.resume?.progress", "Progress:") }}
              </span>
              <span class="font-semibold text-gray-900 dark:text-white">
                {{ (preferencesStore.incompleteQuiz?.currentQuestionIndex ?? 0) + 1 }}

                / {{ preferencesStore.incompleteQuiz?.totalQuestions }}
              </span>
            </div>
            <div class="mt-2 flex items-center justify-between text-sm">
              <span class="text-gray-600 dark:text-gray-400">{{ t("quiz.resume?.answered", "Answered:") }}
              </span>
              <span class="font-semibold text-gray-900 dark:text-white">
                {{ preferencesStore.incompleteQuiz.answers?.length ?? 0 }}
                {{ t("quiz.resume?.questions", "questions") }}
              </span>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex flex-col gap-3 sm:flex-row">
            <button type="button"
              class="flex-1 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-3 font-semibold text-white shadow-lg transition-all duration-300 hover:scale-105 hover:from-blue-700 hover:to-purple-700 hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-offset-2"
              @click="resumeQuiz">
              {{ t("quiz.resume?.continue", "Continue Quiz") }}
            </button>
            <button type="button"
              class="flex-1 rounded-xl border-2 border-gray-300 bg-white px-6 py-3 font-semibold text-gray-700 transition-all duration-300 hover:border-gray-400 hover:bg-gray-50 focus:outline-none focus:ring-4 focus:ring-gray-500 focus:ring-offset-2 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:border-gray-500 dark:hover:bg-gray-600"
              @click="dismissResume">
              {{ t("quiz.resume?.startNew", "Start New") }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from "vue";
import { useI18n } from "vue-i18n";
import { useRouter, useRoute } from "vue-router";
import type { Question } from "@shared/types/quiz";
import type {
  IQuizAnswer,
  ISubmitQuizResponse,
} from "../../../types/components/quiz";
import { useAuthStore } from "../../../stores/auth";
import { usePreferencesStore } from "../../../stores/preferences";
import { useQuizResults } from "../../../composables/useQuizResults";
import { useStreakStore } from "../../../stores/streak";
import QuizResults from "../components/QuizResults.vue";
import QuizHeader from "../components/QuizHeader.vue";
import QuizQuestion from "../components/QuizQuestion.vue";
import LevelUpCelebration from "../../../features/gamification/components/LevelUpCelebration.vue";
import BadgeUnlockNotification from "../../../features/gamification/components/BadgeUnlockNotification.vue";

const { t, locale } = useI18n();
const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();
const preferencesStore = usePreferencesStore();
const { submitQuiz } = useQuizResults();
const streakStore = useStreakStore();

const level = computed(() => route.params.level as "junior" | "intermediate" | "senior");

// Gamification state
const quizResultData = ref<ISubmitQuizResponse | null>(null);

const showLevelUpModal = ref(false);
const levelUpData = ref<{
  newLevel: number;
  previousLevel: number;
  xpEarned: number;
} | null>(null);

const badgeNotificationRef = ref<InstanceType<typeof BadgeUnlockNotification> | null>(null);

const questions = ref<Question[]>([]);
const currentIndex = ref(0);
const selectedAnswer = ref<string | string[] | null>(null);
const textAnswer = ref("");
const multipleAnswers = ref<string[]>([]);
const hasAnswered = ref(false);
const userAnswers = ref<
  Record<
    number,
    {
      answer: string | string[];
      isCorrect: boolean;
      correctAnswer?: string | string[];
      timeSpent: number;
      explanation?: string;
      points?: number;
    }
  >
>({});

const isLoading = ref(true);
const error = ref<string | null>(null);
const showResults = ref(false);
const showResumeModal = ref(false);

const startTime = ref(Date.now());
const questionStartTime = ref(Date.now());

// Mobile optimizations
const isMobileTimerSticky = ref(false);
let touchStartX = 0;
let touchStartY = 0;
let touchEndX = 0;
let touchEndY = 0;

// Countdown timer (10 seconds for testing)
const quizDuration = ref(10); // 10 seconds for testing
const remainingTime = ref(quizDuration.value);
const elapsedTime = ref(0);
let timerInterval: ReturnType<typeof setInterval> | null = null;
timerInterval;

const currentQuestion = computed(() => questions.value[currentIndex.value]);
const totalQuestions = computed(() => questions.value.length);

const score = computed(() => {
  const correct = Object.values(userAnswers.value).filter((a) => a.isCorrect).length;
  const total = Object.keys(userAnswers.value).length;
  const percentage = total > 0 ? Math.round((correct / total) * 100) : 0;
  const timeSpent = Math.floor((Date.now() - startTime.value) / 1000);

  return { correct, total, percentage, timeSpent };
});

const submitAnswer = async () => {
  if (!currentQuestion.value) return;
  const timeSpent = Math.floor((Date.now() - questionStartTime.value) / 1000);
  let answer: string | string[];

  const qType = currentQuestion.value.type;

  if (qType === "multiple-choice" || qType === "true-false") {
    if (!selectedAnswer.value) return;
    answer = selectedAnswer.value;
  } else if (qType === "fill-blank") {
    answer = textAnswer.value.trim();
    if (!answer) return;
  } else {
    if (multipleAnswers.value.length === 0) return;
    answer = multipleAnswers.value;
  }

  try {
    // Call server API to validate answer
    const response = await fetch("/api/v1/questions/submit", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        questionId: currentQuestion.value._id,
        answer: answer,
        timeSpent: timeSpent,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to validate answer");
    }

    const result = await response.json();

    // Store the validated result
    userAnswers.value[currentIndex.value] = {
      answer,
      isCorrect: result.isCorrect,
      timeSpent,
      correctAnswer: result.correctAnswer,
      explanation: result.explanation,
      points: result.points,
    };

    hasAnswered.value = true;

    // Save progress after each answer
    saveQuizProgress();
  } catch (error) {
    console.error("Failed to validate answer:", error);
    // Fallback: mark as incorrect but still proceed
    userAnswers.value[currentIndex.value] = {
      answer,
      isCorrect: false,
      timeSpent,
      correctAnswer: "",
      explanation: "Unable to validate answer",
      points: 0,
    };
    hasAnswered.value = true;
    saveQuizProgress();
  }
};

const saveQuizProgress = () => {
  // Don't save if quiz is finished or no questions loaded
  if (showResults.value || questions.value.length === 0) return;

  const answers = Object.entries(userAnswers.value).map(([index, answer]) => ({
    questionId: questions.value[parseInt(index)]?._id || `temp_${index}`,
    answer: answer.answer,
    selectedAnswer: Array.isArray(answer.answer) ? answer.answer.join(",") : String(answer.answer),
    isCorrect: answer.isCorrect,
  }));

  preferencesStore.saveIncompleteQuiz({
    framework: "general", // Could be enhanced to track specific framework
    level: level.value,
    difficulty: level.value,
    mode: "quiz",
    questions: questions.value.map(q => q._id || ''),
    currentIndex: currentIndex.value,
    currentQuestionIndex: currentIndex.value,
    totalQuestions: totalQuestions.value,
    answers,
    startedAt: new Date(startTime.value),
    lastUpdatedAt: new Date(),
  });
};

const checkForIncompleteQuiz = () => {
  if (preferencesStore.hasIncompleteQuiz()) {
    const incomplete = preferencesStore.incompleteQuiz;

    // Check if it matches current quiz (same level/difficulty)
    if (incomplete?.difficulty === level.value && incomplete?.mode === "quiz") {
      showResumeModal.value = true;
    }
  }
};

const resumeQuiz = () => {
  const incomplete = preferencesStore.incompleteQuiz;
  if (!incomplete) return;

  // Restore quiz state
  currentIndex.value = incomplete.currentQuestionIndex ?? 0;

  // Restore answers
  const restoredAnswers: Record<
    number,
    { answer: string | string[]; isCorrect: boolean; timeSpent: number }
  > = {};
  incomplete.answers.forEach((answer, index) => {
    const selectedAnswer = answer.selectedAnswer ?? '';
    restoredAnswers[index] = {
      answer: selectedAnswer.includes(",")
        ? selectedAnswer.split(",")
        : selectedAnswer,
      isCorrect: answer.isCorrect ?? false,
      timeSpent: 0, // We don't track individual time in saved state
    };
  });

  userAnswers.value = restoredAnswers;
  showResumeModal.value = false;
  startTimer();
};

const dismissResume = () => {
  preferencesStore.clearIncompleteQuiz();
  showResumeModal.value = false;

  // Start the timer for new quiz
  startTimer();
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
    const quizresult = {
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

    const historyKey = `quiz_history_${level.value}`;
    const existingHistory = localStorage.getItem(historyKey);
    const history = existingHistory ? JSON.parse(existingHistory) : [];
    history.unshift(quizresult);
    localStorage.setItem(historyKey, JSON.stringify(history.slice(0, 50)));

    const activitiesKey = "recent_activities";
    const existingActivities = localStorage.getItem(activitiesKey);
    const activities = existingActivities ? JSON.parse(existingActivities) : [];
    activities.unshift({
      id: quizresult.id,
      type: "quiz",
      title: `${t(`level.${level.value}.label`)} Quiz - ${score.value.percentage}%`,
      timestamp: Date.now(),
      score: score.value.percentage,
    });
    localStorage.setItem(activitiesKey, JSON.stringify(activities.slice(0, 10)));

    updateStreak();
  } catch (error) {
    console.error("Failed to save quiz history:", error);
  }
};

const updateStreak = () => {
  try {
    const streakKey = "learning_streak";
    const streakData = localStorage.getItem(streakKey);
    const streak = streakData
      ? JSON.parse(streakData)
      : {
        currentStreak: 0,
        bestStreak: 0,
        lastActivityDate: null,
      };

    const today = new Date().toDateString();
    const lastDate = streak.lastActivityDate
      ? new Date(streak.lastActivityDate).toDateString()
      : null;

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

      const statsKey = "progress_stats";
      const stats = localStorage.getItem(statsKey);
      const progressStats = stats ? JSON.parse(stats) : {};
      progressStats.currentStreak = streak.currentStreak;
      progressStats.bestStreak = streak.bestStreak;
      localStorage.setItem(statsKey, JSON.stringify(progressStats));
    }
  } catch (error) {
    console.error("Failed to update streak:", error);
  }
};

const finishQuiz = async () => {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }

  // Clear incomplete quiz since we're finishing
  preferencesStore.clearIncompleteQuiz();

  // Save locally first (fallback)
  saveQuizHistory();

  // Submit to server if authenticated
  if (authStore.isAuthenticated) {
    try {
      const endTime = new Date().toISOString();
      const answers: IQuizAnswer[] = questions.value.map((question, index) => {
        const userAnswer = userAnswers.value[index];
        const qType = question.type;
        const options = question.content?.[locale.value as "en" | "ar"]?.options ?? [];

        // Get correct answer
        let correctAnswer: string | string[];
        if (qType === "multiple-checkbox") {
          correctAnswer = options.filter((o) => o.isCorrect).map((o) => o.id);
        } else {
          const correctOption = options.find((o) => o.isCorrect);
          correctAnswer = correctOption?.id || correctOption?.text || "";
        }

        // Map difficulty
        const difficultyMap: Record<string, "easy" | "medium" | "hard"> = {
          junior: "easy",
          intermediate: "medium",
          senior: "hard",
        };

        const answerValue = userAnswer?.answer || "";

        return {
          questionId: question._id || `temp_${index}`,
          answer: answerValue,
          userAnswer: answerValue,
          correctAnswer,
          isCorrect: userAnswer?.isCorrect || false,
          timeSpent: userAnswer?.timeSpent || 0,
          timeSpentSeconds: userAnswer?.timeSpent || 0,
          difficultyLevel: difficultyMap[level.value] || "medium",
          category: question.category || "general",
          tags: question.tags || [],
          points: 10,
          pointsEarned: userAnswer?.isCorrect ? 10 : 0,
        };
      });

      const payload = {
        quizType: "practice" as const,
        level: level.value,
        answers,
        startTime: new Date(startTime.value).toISOString(),
        endTime,
      };

      const result = await submitQuiz(payload);

      if (result) {
        quizResultData.value = result;

        // Update streak store
        await streakStore.fetchStreak();

        // Show badge notifications if badges were earned
        if (result.badgesEarned && result.badgesEarned.length > 0 && badgeNotificationRef.value) {
          const badgeObjects = result.badgesEarned.map((badge) => {
            const badgeName = typeof badge === "string" ? badge : badge.name;
            return {
              id: `badge_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
              name: badgeName,
              description: getBadgeDescription(badgeName),
              icon: getBadgeIcon(badgeName),
              rarity: getBadgeRarity(badgeName),
              xpReward: getBadgeXP(badgeName),
              shareable: true,
            };
          });

          // Show badges with slight delay after quiz results
          setTimeout(() => {
            badgeNotificationRef.value?.showBadges(badgeObjects);
          }, 500);
        }

        // Show level-up celebration if leveled up
        if (result.leveledUp && result.newLevel) {
          const currentLevel = authStore.user?.gamification?.level || 1;
          levelUpData.value = {
            newLevel: result.newLevel,
            previousLevel: currentLevel,
            xpEarned: result.xpEarned ?? 0,
          };
          // Delay level-up modal to show after badge notifications
          setTimeout(
            () => {
              showLevelUpModal.value = true;
            },
            result.badgesEarned && result.badgesEarned.length > 0 ? 2000 : 500
          );

          // Update auth store with new level
          if (authStore.user && authStore.user.gamification) {
            authStore.user.gamification = {
              ...authStore.user.gamification,
              level: result.newLevel,
              totalXP: result.totalXP ?? authStore.user.gamification.totalXP,
              currentXP: result.currentXP ?? authStore.user.gamification.currentXP,
              xpToNextLevel: result.xpToNextLevel ?? authStore.user.gamification.xpToNextLevel,
              streak: result.streak ?? authStore.user.gamification.streak,
              coins: result.coins ?? authStore.user.gamification.coins,
              badges: result.badges ?? authStore.user.gamification.badges,
            };
          }
        }
      }
    } catch (error) {
      console.error("Failed to submit quiz to server:", error);
      // Continue to show results even if server submission fails
    }
  }

  showResults.value = true;
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
  if (confirm(t("quiz.confirmExit"))) {
    goBack();
  }
};

const goBack = () => {
  const currentLocale = route.params.locale || "en";
  // Map quiz level back to difficulty for mode chooser: /:locale/:difficulty/choose
  const levelToDifficulty = {
    junior: "easy",
    intermediate: "medium",
    senior: "hard",
  } as const;
  const difficulty = levelToDifficulty[level.value];
  router.push(`/${currentLocale}/${difficulty}/choose`);
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

  // Mark all unanswered questions as incorrect when timer expires
  questions.value.forEach((_question, index) => {
    if (!userAnswers.value[index]) {
      userAnswers.value[index] = {
        answer: "",
        isCorrect: false,
        timeSpent: 0, // No time spent on unanswered questions
      };
    }
  });

  // Mark current question if not answered
  if (!hasAnswered.value && currentQuestion.value) {
    userAnswers.value[currentIndex.value] = {
      answer: "",
      isCorrect: false,
      timeSpent: Math.floor((Date.now() - questionStartTime.value) / 1000),
    };
  }

  finishQuiz();
};

const loadQuiz = async () => {
  isLoading.value = true;
  error.value = null;

  try {
    const response = await fetch(`/api/v1/questions/quiz/questions?level=${level.value}&limit=10`, {
      credentials: "include",
    });

    if (!response.ok) {
      if (response.status === 401) {
        // User not authenticated - redirect to login
        const currentLocale = route.params.locale || "en";
        await router.push(`/${currentLocale}/login?redirect=${route.fullPath}`);
        return;
      }
      if (response.status === 403) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || "Access denied: Upgrade your plan to access this level"
        );
      }
      throw new Error("Failed to load quiz");
    }

    const data = await response.json();
    questions.value = data.questions || [];

    if (questions.value.length === 0) {
      error.value = t("quiz.error.noQuestions");
      return;
    }

    // Check for incomplete quiz before starting timer
    checkForIncompleteQuiz();

    // Only start timer if not resuming
    if (!showResumeModal.value) {
      startTimer();
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : t("quiz.error.generic");
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

const getLevelTitle = (level: number): string => {
  const levelTitles = [
    { min: 1, max: 5, title: "Beginner" },
    { min: 6, max: 10, title: "Learner" },
    { min: 11, max: 20, title: "Apprentice" },
    { min: 21, max: 30, title: "Practitioner" },
    { min: 31, max: 40, title: "Skilled" },
    { min: 41, max: 50, title: "Expert" },
    { min: 51, max: 75, title: "Master" },
    { min: 76, max: 100, title: "Grandmaster" },
    { min: 101, max: Infinity, title: "Legend" },
  ];

  const titleObj = levelTitles.find((t) => level >= t.min && level <= t.max);
  return titleObj ? titleObj.title : "Legend";
};

// IBadge helper functions
const getBadgeDescription = (badgeName: string): string => {
  const descriptions: Record<string, string> = {
    "First Steps": "Complete your first quiz",
    "Perfect Score": "Get 100% on a quiz",
    "Speed Demon": "Complete a quiz in under 5 minutes",
    "Week Warrior": "Maintain a 7-day streak",
    "Study Master": "Complete 50 study sessions",
    "Quiz Champion": "Complete 100 quizzes",
    Dedication: "Maintain a 30-day streak",
  };
  return descriptions[badgeName] || "IAchievement unlocked!";
};

const getBadgeIcon = (badgeName: string): string => {
  const icons: Record<string, string> = {
    "First Steps": "🎯",
    "Perfect Score": "💯",
    "Speed Demon": "⚡",
    "Week Warrior": "🔥",
    "Study Master": "📚",
    "Quiz Champion": "🏆",
    Dedication: "💎",
  };
  return icons[badgeName] || "🎖️";
};

const getBadgeRarity = (badgeName: string): "common" | "rare" | "epic" | "legendary" => {
  const rarities: Record<string, "common" | "rare" | "epic" | "legendary"> = {
    "First Steps": "common",
    "Perfect Score": "epic",
    "Speed Demon": "rare",
    "Week Warrior": "rare",
    "Study Master": "rare",
    "Quiz Champion": "epic",
    Dedication: "legendary",
  };
  return rarities[badgeName] || "common";
};

const getBadgeXP = (badgeName: string): number => {
  const xpRewards: Record<string, number> = {
    "First Steps": 50,
    "Perfect Score": 200,
    "Speed Demon": 100,
    "Week Warrior": 150,
    "Study Master": 100,
    "Quiz Champion": 300,
    Dedication: 1000,
  };
  return xpRewards[badgeName] || 50;
};

const handleKeyboard = (event: KeyboardEvent) => {
  if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
    return;
  }

  const key = event.key.toLowerCase();

  if (key === "escape") {
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

  if (key === " ") {
    event.preventDefault();
    if (!hasAnswered.value) {
      submitAnswer();
    } else if (hasAnswered.value) {
      nextQuestion();
    }
    return;
  }

  if (key === "enter") {
    event.preventDefault();
    if (!hasAnswered.value) {
      submitAnswer();
    }
    return;
  }

  if (key === "arrowright" && hasAnswered.value) {
    event.preventDefault();
    nextQuestion();
    return;
  }

  if (!hasAnswered.value && (qType === "multiple-choice" || qType === "true-false")) {
    const options = currentQuestion.value.content?.[locale.value as "en" | "ar"]?.options ?? [];
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
  window.addEventListener("keydown", handleKeyboard);
  window.addEventListener("touchstart", handleTouchStart, { passive: true });
  window.addEventListener("touchend", handleTouchEnd, { passive: true });
  window.addEventListener("scroll", handleScroll, { passive: true });
});

onUnmounted(() => {
  if (timerInterval) {
    clearInterval(timerInterval);
  }
  window.removeEventListener("keydown", handleKeyboard);
  window.removeEventListener("touchstart", handleTouchStart);
  window.removeEventListener("touchend", handleTouchEnd);
  window.removeEventListener("scroll", handleScroll);
});
</script>
