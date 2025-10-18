<template>
  <div class="rounded-2xl bg-white p-6 shadow-lg dark:bg-gray-800">
    <div class="mb-6 flex items-center justify-between">
      <h2 class="text-2xl font-bold text-gray-900 dark:text-white">
        {{ t("recommendations.title") }}
      </h2>
      <button
        type="button"
        class="rounded-lg bg-blue-50 px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/30"
        @click="refreshRecommendations"
      >
        <svg class="mr-1 inline h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
          />
        </svg>
        {{ t("recommendations.refresh") }}
      </button>
    </div>

    <!-- Personalized Message -->
    <div
      v-if="personalizedMessage"
      class="mb-6 rounded-lg bg-gradient-to-r from-blue-50 to-purple-50 p-4 dark:from-blue-900/20 dark:to-purple-900/20"
    >
      <div class="flex items-start gap-3">
        <svg
          class="mt-1 h-6 w-6 flex-shrink-0 text-blue-600 dark:text-blue-400"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z"
          />
        </svg>
        <div>
          <h3 class="font-semibold text-blue-900 dark:text-blue-200">
            {{ personalizedMessage.title ?? "" }}
          </h3>
          <p class="mt-1 text-sm text-blue-700 dark:text-blue-300">
            {{ personalizedMessage.message ?? "" }}
          </p>
        </div>
      </div>
    </div>

    <!-- Recommended Quizzes -->
    <div v-if="recommendedQuizzes.length > 0" class="mb-6">
      <h3 class="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
        {{ t("recommendations.recommendedQuizzes") }}
      </h3>
      <div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div
          v-for="quiz in recommendedQuizzes"
          :key="quiz.id"
          class="rounded-lg border-2 border-gray-200 bg-white p-4 transition-all hover:border-blue-400 hover:shadow-md dark:border-gray-700 dark:bg-gray-800 dark:hover:border-blue-600"
        >
          <div class="mb-2 flex items-center justify-between">
            <span
              class="inline-flex items-center rounded px-2 py-1 text-xs font-semibold"
              :class="getLevelBadgeClass(quiz.level ?? 0)"
            >
              {{ t(`level.${quiz.level}.label`) }}
            </span>
            <span
              class="inline-flex items-center rounded-full px-2 py-1 text-xs font-semibold"
              :class="getRecommendationBadgeClass(quiz.reason)"
            >
              {{ t(`recommendations.reasons.${quiz.reason}`) }}
            </span>
          </div>
          <h4 class="mb-2 font-semibold text-gray-900 dark:text-white">
            {{ quiz.title ?? "" }}
          </h4>
          <p class="mb-3 text-sm text-gray-600 dark:text-gray-400">
            {{ quiz.description ?? "" }}
          </p>
          <button
            type="button"
            class="w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            @click="startQuiz(quiz.level ?? 0)"
          >
            {{ t("recommendations.startQuiz") }}
          </button>
        </div>
      </div>
    </div>

    <!-- Study Topics -->
    <div v-if="studyTopics.length > 0" class="mb-6">
      <h3 class="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
        {{ t("recommendations.studyTopics") }}
      </h3>
      <div class="space-y-3">
        <div
          v-for="topic in studyTopics"
          :key="topic.id"
          class="rounded-lg border-l-4 bg-gray-50 p-4 dark:bg-gray-700/50"
          :class="getPriorityBorderClass(topic.priority)"
        >
          <div class="flex items-start justify-between">
            <div class="flex-1">
              <div class="flex items-center gap-2">
                <h4 class="font-semibold text-gray-900 dark:text-white">
                  {{ topic.title ?? "" }}
                </h4>
                <span
                  class="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold"
                  :class="getPriorityBadgeClass(topic.priority)"
                >
                  {{ t(`recommendations.priority.${topic.priority}`) }}
                </span>
              </div>
              <p class="mt-1 text-sm text-gray-600 dark:text-gray-400">
                {{ topic.reason }}
              </p>
              <div class="mt-2 text-xs text-gray-500 dark:text-gray-500">
                {{ t("recommendations.accuracy") }}: {{ topic.currentAccuracy }}% →
                {{ t("recommendations.target") }}: {{ topic.targetAccuracy }}%
              </div>
            </div>
            <button
              type="button"
              class="ml-4 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
              @click="startStudying(topic.difficulty)"
            >
              {{ t("recommendations.study") }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Learning Path -->
    <div v-if="learningPath" class="mb-6">
      <h3 class="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
        {{ t("recommendations.learningPath") }}
      </h3>
      <div class="relative">
        <div class="absolute left-4 top-0 h-full w-0.5 bg-gray-200 dark:bg-gray-700"></div>
        <div class="space-y-6">
          <div v-for="(step, index) in learningPath.steps" :key="index" class="relative flex gap-4">
            <div
              class="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border-2"
              :class="[
                step.completed
                  ? 'border-green-500 bg-green-500 text-white'
                  : step.current
                    ? 'border-blue-500 bg-blue-500 text-white'
                    : 'border-gray-300 bg-white text-gray-400 dark:border-gray-600 dark:bg-gray-800',
              ]"
            >
              <svg v-if="step.completed" class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fill-rule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clip-rule="evenodd"
                />
              </svg>
              <span v-else class="text-sm font-semibold">{{ index + 1 }} </span>
            </div>
            <div class="flex-1 pb-6">
              <div class="flex items-center justify-between">
                <h4 class="font-semibold text-gray-900 dark:text-white">
                  {{ step.title ?? "" }}
                </h4>
                <span
                  v-if="step.current"
                  class="text-xs font-medium text-blue-600 dark:text-blue-400"
                >
                  {{ t("recommendations.current") }}
                </span>
              </div>
              <p class="mt-1 text-sm text-gray-600 dark:text-gray-400">
                {{ step.description ?? "" }}
              </p>
              <button
                v-if="step.current"
                type="button"
                class="mt-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                @click="startLearningStep(step)"
              >
                {{ t("recommendations.continue") }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Quick Tips -->
    <div v-if="quickTips.length > 0">
      <h3 class="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
        {{ t("recommendations.quickTips") }}
      </h3>
      <div class="grid grid-cols-1 gap-3 md:grid-cols-2">
        <div
          v-for="tip in quickTips"
          :key="tip.id"
          class="rounded-lg bg-yellow-50 p-4 dark:bg-yellow-900/20"
        >
          <div class="flex items-start gap-3">
            <svg
              class="mt-0.5 h-5 w-5 flex-shrink-0 text-yellow-600 dark:text-yellow-400"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1h4v1a2 2 0 11-4 0zM12 14c.015-.34.208-.646.477-.859a4 4 0 10-4.954 0c.27.213.462.519.476.859h4.002z"
              />
            </svg>
            <div>
              <h4 class="text-sm font-semibold text-yellow-900 dark:text-yellow-200">
                {{ tip.title ?? "" }}
              </h4>
              <p class="mt-1 text-xs text-yellow-700 dark:text-yellow-300">
                {{ tip.tip }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type {
  ILearningStep,
  ILearningPath,
  IQuickTip,
} from "../../types/components/recommendations";
import { ref, computed, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";
import type {
  QuizAttempt,
  RecommendedQuiz,
  StudyTopic,
  LevelStatsMap,
} from "../../types/quiz-analytics";

const { t } = useI18n();
const router = useRouter();

const history = ref<QuizAttempt[]>([]);
const recommendedQuizzes = ref<RecommendedQuiz[]>([]);
const studyTopics = ref<StudyTopic[]>([]);
const learningPath = ref<ILearningPath | null>(null);
const quickTips = ref<IQuickTip[]>([]);

const personalizedMessage = computed(() => {
  if (history.value.length === 0) {
    return {
      title: t("recommendations.welcomeTitle"),
      message: t("recommendations.welcomeMessage"),
    };
  }

  const recentAttempts = history.value.slice(0, 5);
  const avgScore = recentAttempts.reduce((sum, a) => sum + a.score, 0) / recentAttempts.length;

  if (avgScore >= 85) {
    return {
      title: t("recommendations.excellentTitle"),
      message: t("recommendations.excellentMessage"),
    };
  } else if (avgScore >= 70) {
    return {
      title: t("recommendations.goodTitle"),
      message: t("recommendations.goodMessage"),
    };
  } else {
    return {
      title: t("recommendations.keepGoingTitle"),
      message: t("recommendations.keepGoingMessage"),
    };
  }
});

const getLevelBadgeClass = (level: string) => {
  const classes = {
    junior: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    intermediate: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
    senior: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  };
  return classes[level as keyof typeof classes] || "bg-gray-100 text-gray-800";
};

const getRecommendationBadgeClass = (reason: string) => {
  const classes = {
    weak_area: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
    next_level: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
    practice: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
    new: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
  };
  return classes[reason as keyof typeof classes] || "bg-gray-100 text-gray-700";
};

const getPriorityBadgeClass = (priority: string) => {
  const classes = {
    high: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
    medium: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300",
    low: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
  };
  return classes[priority as keyof typeof classes] || "bg-gray-100 text-gray-700";
};

const getPriorityBorderClass = (priority: string) => {
  const classes = {
    high: "border-red-500",
    medium: "border-yellow-500",
    low: "border-green-500",
  };
  return classes[priority as keyof typeof classes] || "border-gray-500";
};

const generateRecommendations = () => {
  if (history.value.length === 0) {
    // New user recommendations
    recommendedQuizzes.value = [
      {
        id: "1",
        level: "junior",
        title: t("quiz.metadata.junior.title"),
        description: t("quiz.metadata.junior.description"),
        reason: "new",
      },
    ];

    studyTopics.value = [
      {
        id: "1",
        title: "Vue.js Fundamentals",
        difficulty: "easy",
        reason: t("recommendations.newUserReason"),
        priority: "high",
        currentAccuracy: 0,
        targetAccuracy: 70,
      },
    ];

    quickTips.value = [
      {
        id: "1",
        title: t("recommendations.tips.startEasy"),
        description: t("recommendations.tips.startEasyDesc"),
        tip: t("recommendations.tips.startEasyDesc"),
      },
      {
        id: "2",
        title: t("recommendations.tips.consistency"),
        description: t("recommendations.tips.consistencyDesc"),
        tip: t("recommendations.tips.consistencyDesc"),
      },
    ];

    return;
  }

  // Analyze performance by level
  const levelStats: LevelStatsMap = {
    junior: { attempts: 0, avgScore: 0, scores: [] },
    intermediate: { attempts: 0, avgScore: 0, scores: [] },
    senior: { attempts: 0, avgScore: 0, scores: [] },
  };

  history.value.forEach((attempt) => {
    const stats = levelStats[attempt.level];
    if (stats) {
      stats.attempts++;
      stats.scores.push(attempt.score);
    }
  });

  // Calculate averages
  Object.keys(levelStats).forEach((level) => {
    const stats = levelStats[level as keyof LevelStatsMap];
    if (stats && stats.attempts > 0) {
      stats.avgScore = stats.scores.reduce((sum, s) => sum + s, 0) / stats.attempts;
    }
  });

  // Generate quiz recommendations
  const quizRecs: RecommendedQuiz[] = [];

  // If struggling with a level, recommend practice
  Object.entries(levelStats).forEach(([level, stats]) => {
    if (stats && stats.attempts > 0 && stats.avgScore < 70) {
      quizRecs.push({
        id: `practice_${level}`,
        level: level as "junior" | "intermediate" | "senior",
        title: `${t(`level.${level}.label`)} ${t("recommendations.practiceQuiz")}`,
        description: t("recommendations.practiceDesc", { score: Math.round(stats.avgScore) }),
        reason: "weak_area",
      });
    }
  });

  // Recommend next level if doing well
  const juniorStats = levelStats.junior;
  const intermediateStats = levelStats.intermediate;
  const seniorStats = levelStats.senior;

  if (
    juniorStats &&
    intermediateStats &&
    juniorStats.avgScore >= 80 &&
    intermediateStats.attempts === 0
  ) {
    quizRecs.push({
      id: "next_intermediate",
      level: "intermediate",
      title: t("quiz.metadata.intermediate.title"),
      description: t("recommendations.readyForNext"),
      reason: "next_level",
    });
  }

  if (
    intermediateStats &&
    seniorStats &&
    intermediateStats.avgScore >= 80 &&
    seniorStats.attempts === 0
  ) {
    quizRecs.push({
      id: "next_senior",
      level: "senior",
      title: t("quiz.metadata.senior.title"),
      description: t("recommendations.readyForNext"),
      reason: "next_level",
    });
  }

  recommendedQuizzes.value = quizRecs.slice(0, 3);

  // Generate study topic recommendations
  const topics: StudyTopic[] = [];

  if (juniorStats && juniorStats.avgScore < 60 && juniorStats.attempts > 0) {
    topics.push({
      id: "fundamentals",
      title: "Frontend Fundamentals",
      difficulty: "easy",
      reason: t("recommendations.fundamentalsReason"),
      priority: "high",
      currentAccuracy: Math.round(juniorStats.avgScore),
      targetAccuracy: 70,
    });
  }

  if (intermediateStats && intermediateStats.avgScore > 0 && intermediateStats.avgScore < 70) {
    topics.push({
      id: "patterns",
      title: "Design Patterns & Best Practices",
      difficulty: "medium",
      reason: t("recommendations.patternsReason"),
      priority: "medium",
      currentAccuracy: Math.round(intermediateStats.avgScore),
      targetAccuracy: 80,
    });
  }

  studyTopics.value = topics;

  // Generate learning path
  learningPath.value = {
    name: t("recommendations.path.name") || "Your Learning Path",
    steps: [
      {
        id: "step1",
        title: t("recommendations.path.step1"),
        description: t("recommendations.path.step1Desc"),
        completed: juniorStats ? juniorStats.avgScore >= 70 : false,
        current: !juniorStats || juniorStats.avgScore < 70,
        action: "junior_quiz",
      },
      {
        id: "step2",
        title: t("recommendations.path.step2"),
        description: t("recommendations.path.step2Desc"),
        completed: intermediateStats ? intermediateStats.avgScore >= 70 : false,
        current:
          juniorStats && intermediateStats
            ? juniorStats.avgScore >= 70 && intermediateStats.avgScore < 70
            : false,
        action: "intermediate_quiz",
      },
      {
        id: "step3",
        title: t("recommendations.path.step3"),
        description: t("recommendations.path.step3Desc"),
        completed: seniorStats ? seniorStats.avgScore >= 70 : false,
        current:
          intermediateStats && seniorStats
            ? intermediateStats.avgScore >= 70 && seniorStats.avgScore < 70
            : false,
        action: "senior_quiz",
      },
    ],
  };

  // Quick tips based on performance
  const tips: IQuickTip[] = [];

  const recentScores = history.value.slice(0, 3).map((h) => h.score);
  const avgRecentScore = recentScores.reduce((sum, s) => sum + s, 0) / recentScores.length;

  if (avgRecentScore < 70) {
    tips.push({
      id: "tip1",
      title: t("recommendations.tips.reviewWrong"),
      description: t("recommendations.tips.reviewWrongDesc"),
      tip: t("recommendations.tips.reviewWrongDesc"),
    });
  }

  if (history.value.length < 5) {
    tips.push({
      id: "tip2",
      title: t("recommendations.tips.takeMore"),
      description: t("recommendations.tips.takeMoreDesc"),
      tip: t("recommendations.tips.takeMoreDesc"),
    });
  }

  quickTips.value = tips;
};

const refreshRecommendations = () => {
  loadHistory();
  generateRecommendations();
};

const loadHistory = () => {
  try {
    const historyData = localStorage.getItem("quiz_history");
    if (historyData) {
      history.value = JSON.parse(historyData);
    }
  } catch (error) {
    console.error("Failed to load quiz history:", error);
  }
};

const startQuiz = (level: string) => {
  router.push(`/en/quiz/${level}`);
};

const startStudying = (difficulty: string) => {
  router.push(`/en/study/${difficulty}`);
};

const startLearningStep = (step: ILearningStep) => {
  if (step.action && step.action.includes("quiz")) {
    const level = step.action.replace("_quiz", "");
    startQuiz(level);
  }
};

onMounted(() => {
  loadHistory();
  generateRecommendations();
});
</script>
