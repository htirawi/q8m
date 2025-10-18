<template>
  <div class="rounded-2xl bg-white p-6 shadow-lg dark:bg-gray-800">
    <!-- Header -->
    <div class="mb-6 flex items-center justify-between">
      <h2 class="text-2xl font-bold text-gray-900 dark:text-white">
        {{ t("dashboard.progress?.title") }}
      </h2>
      <button
        type="button"
        class="rounded-lg bg-blue-50 px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/30"
        @click="refreshStats"
      >
        <svg class="mr-1 inline h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
          />
        </svg>
        {{ t("dashboard.progress?.refresh") }}
      </button>
    </div>

    <!-- Stats Grid -->
    <div class="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <!-- Overall Completion -->
      <div
        class="rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 p-4 dark:from-blue-900/20 dark:to-blue-800/20"
      >
        <div class="mb-2 flex items-center justify-between">
          <span class="text-sm font-medium text-blue-600 dark:text-blue-400">
            {{ t("dashboard.progress?.overallCompletion") }}
          </span>
          <svg
            class="h-5 w-5 text-blue-600 dark:text-blue-400"
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
        <div class="text-3xl font-bold text-blue-900 dark:text-blue-100">
          {{ stats.completionPercentage }}%
        </div>
        <div class="mt-2 h-2 w-full overflow-hidden rounded-full bg-blue-200 dark:bg-blue-900">
          <div
            class="h-full bg-blue-600 transition-all duration-500 dark:bg-blue-400"
            :style="{ width: `${stats.completionPercentage}%` }"
          ></div>
        </div>
      </div>

      <!-- Questions Answered -->
      <div
        class="rounded-lg bg-gradient-to-br from-green-50 to-green-100 p-4 dark:from-green-900/20 dark:to-green-800/20"
      >
        <div class="mb-2 flex items-center justify-between">
          <span class="text-sm font-medium text-green-600 dark:text-green-400">
            {{ t("dashboard.progress?.questionsAnswered") }}
          </span>
          <svg
            class="h-5 w-5 text-green-600 dark:text-green-400"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
            <path
              fill-rule="evenodd"
              d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z"
              clip-rule="evenodd"
            />
          </svg>
        </div>
        <div class="text-3xl font-bold text-green-900 dark:text-green-100">
          {{ stats.questionsAnswered }}
        </div>
        <div class="text-xs text-green-600 dark:text-green-400">
          {{ t("dashboard.progress?.outOf", { total: stats.totalQuestions }) }}
        </div>
      </div>

      <!-- Time Spent -->
      <div
        class="rounded-lg bg-gradient-to-br from-purple-50 to-purple-100 p-4 dark:from-purple-900/20 dark:to-purple-800/20"
      >
        <div class="mb-2 flex items-center justify-between">
          <span class="text-sm font-medium text-purple-600 dark:text-purple-400">
            {{ t("dashboard.progress?.timeSpent") }}
          </span>
          <svg
            class="h-5 w-5 text-purple-600 dark:text-purple-400"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fill-rule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
              clip-rule="evenodd"
            />
          </svg>
        </div>
        <div class="text-3xl font-bold text-purple-900 dark:text-purple-100">
          {{ formatTime(stats.totalTimeSpent) }}
        </div>
        <div class="text-xs text-purple-600 dark:text-purple-400">
          {{ t("dashboard.progress?.thisWeek") }}
        </div>
      </div>

      <!-- Current Streak -->
      <div
        class="rounded-lg bg-gradient-to-br from-orange-50 to-orange-100 p-4 dark:from-orange-900/20 dark:to-orange-800/20"
      >
        <div class="mb-2 flex items-center justify-between">
          <span class="text-sm font-medium text-orange-600 dark:text-orange-400">
            {{ t("dashboard.progress?.currentStreak") }}
          </span>
          <svg
            class="h-5 w-5 text-orange-600 dark:text-orange-400"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fill-rule="evenodd"
              d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z"
              clip-rule="evenodd"
            />
          </svg>
        </div>
        <div class="text-3xl font-bold text-orange-900 dark:text-orange-100">
          {{ stats.currentStreak }} {{ t("dashboard.progress?.days") }}
        </div>
        <div class="text-xs text-orange-600 dark:text-orange-400">
          {{ t("dashboard.progress?.bestStreak", { days: stats.bestStreak }) }}
        </div>
      </div>
    </div>

    <!-- Progress by Difficulty -->
    <div class="mb-6">
      <h3 class="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
        {{ t("dashboard.progress?.byDifficulty") }}
      </h3>
      <div class="space-y-4">
        <div v-for="difficulty in difficulties" :key="difficulty.level">
          <div class="mb-2 flex items-center justify-between">
            <div class="flex items-center gap-2">
              <span :class="getDifficultyClass(difficulty.level)">
                {{ getDifficultyIcon(difficulty.level) }}
              </span>
              <span class="font-medium text-gray-900 dark:text-white">
                {{ t(`difficulty.${difficulty.level}.label`) }}
              </span>
            </div>
            <span class="text-sm text-gray-600 dark:text-gray-400">
              {{ difficulty.answered }} / {{ difficulty.total ?? 0 }}
            </span>
          </div>
          <div class="h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
            <div
              :class="getDifficultyProgressClass(difficulty.level)"
              class="h-full transition-all duration-500"
              :style="{ width: `${(difficulty.answered / difficulty.total) * 100}%` }"
            ></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Recent Activity -->
    <div>
      <h3 class="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
        {{ t("dashboard.progress?.recentActivity") }}
      </h3>
      <div class="space-y-3">
        <div
          v-for="activity in recentActivities"
          :key="activity.id"
          class="flex items-center gap-3 rounded-lg bg-gray-50 p-3 dark:bg-gray-700/50"
        >
          <div :class="getActivityIconClass(activity.type)">
            <svg
              v-if="activity.type === 'quiz'"
              class="h-5 w-5"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
              <path
                fill-rule="evenodd"
                d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z"
                clip-rule="evenodd"
              />
            </svg>
            <svg v-else class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z"
              />
            </svg>
          </div>
          <div class="flex-1">
            <p class="text-sm font-medium text-gray-900 dark:text-white">
              {{ activity.title ?? "" }}
            </p>
            <p class="text-xs text-gray-500 dark:text-gray-400">
              {{ formatRelativeTime(activity.timestamp) }}
            </p>
          </div>
          <div v-if="activity.score !== undefined" class="text-right">
            <p class="text-sm font-semibold text-gray-900 dark:text-white">
              {{ activity.score ?? 0 }}%
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import type { ProgressStats, DifficultyProgress, RecentActivity } from "@/types/quiz-analytics";

const { t } = useI18n();

const stats = ref<ProgressStats>({
  completionPercentage: 0,
  questionsAnswered: 0,
  totalQuestions: 0,
  totalTimeSpent: 0,
  currentStreak: 0,
  bestStreak: 0,
});

const difficulties = ref<DifficultyProgress[]>([
  { level: "easy", label: "", answered: 0, total: 0, percentage: 0, color: "" },
  { level: "medium", label: "", answered: 0, total: 0, percentage: 0, color: "" },
  { level: "hard", label: "", answered: 0, total: 0, percentage: 0, color: "" },
]);

const recentActivities = ref<RecentActivity[]>([]);

const getDifficultyIcon = (level: string) => {
  const icons = { easy: "🟢", medium: "🟡", hard: "🔴" };
  return icons[level as keyof typeof icons] || "⚪";
};

const getDifficultyClass = (level: string) => {
  const classes = {
    easy: "text-green-600 dark:text-green-400",
    medium: "text-yellow-600 dark:text-yellow-400",
    hard: "text-red-600 dark:text-red-400",
  };
  return classes[level as keyof typeof classes] || "text-gray-600";
};

const getDifficultyProgressClass = (level: string) => {
  const classes = {
    easy: "bg-green-600 dark:bg-green-400",
    medium: "bg-yellow-600 dark:bg-yellow-400",
    hard: "bg-red-600 dark:bg-red-400",
  };
  return classes[level as keyof typeof classes] || "bg-gray-600";
};

const getActivityIconClass = (type: string) => {
  const baseClass = "flex h-10 w-10 items-center justify-center rounded-full";
  if (type === "quiz") {
    return `${baseClass}

 bg-blue-100 text-blue-600 dark:bg-blue-900/30; dark:text-blue-400`;
  }
  return `${baseClass}

 bg-purple-100 text-purple-600 dark:bg-purple-900/30; dark:text-purple-400`;
};

const formatTime = (seconds: number) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
};

const formatRelativeTime = (timestamp: number) => {
  const now = Date.now();
  const diff = now - timestamp;
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(hours / 24);

  if (days > 0) {
    return t("dashboard.progress.daysAgo", { count: days });
  }
  if (hours > 0) {
    return t("dashboard.progress.hoursAgo", { count: hours });
  }
  return t("dashboard.progress.justNow");
};

const loadProgressStats = () => {
  // Load from localStorage
  const savedStats = localStorage.getItem("progress_stats");
  if (savedStats) {
    try {
      const parsed = JSON.parse(savedStats);
      stats.value = { ...stats.value, ...parsed };
    } catch (e) {
      console.error("Failed to load progress stats:", e);
    }
  }

  // Load difficulty progress
  ["easy", "medium", "hard"].forEach((level, idx) => {
    const answered = localStorage.getItem(`answered_${level}`);
    if (answered) {
      try {
        const answerCount = JSON.parse(answered).length;
        const difficulty = difficulties.value[idx];
        if (difficulty) {
          difficulty.answered = answerCount;
        }
      } catch (e) {
        console.error(`Failed to load ${level} progress:`, e);
      }
    }
  });

  // Calculate totals and completion percentage
  const totalAnswered = difficulties.value.reduce((sum, d) => sum + d.answered, 0);
  const totalQuestions = difficulties.value.reduce((sum, d) => sum + d.total, 0);

  stats.value.questionsAnswered = totalAnswered;
  stats.value.totalQuestions = totalQuestions || 100; // Default to 100 if no data
  stats.value.completionPercentage =
    totalQuestions > 0 ? Math.round((totalAnswered / totalQuestions) * 100) : 0;

  // Load recent activities
  const activities = localStorage.getItem("recent_activities");
  if (activities) {
    try {
      recentActivities.value = JSON.parse(activities).slice(0, 5);
    } catch (e) {
      console.error("Failed to load recent activities:", e);
    }
  }

  // Load time spent
  ["easy", "medium", "hard"].forEach((level) => {
    const sessionState = localStorage.getItem(`study_session_${level}`);
    if (sessionState) {
      try {
        const state = JSON.parse(sessionState);
        stats.value.totalTimeSpent += state.elapsedTime || 0;
      } catch (e) {
        console.error(`Failed to load ${level} session:`, e);
      }
    }
  });
};

const refreshStats = () => {
  loadProgressStats();
};

onMounted(() => {
  loadProgressStats();

  // Set mock total questions (in production, fetch from API)
  difficulties.value = [
    {
      level: "easy",
      label: t("difficulty.easy.label"),
      answered: difficulties.value[0]?.answered || 0,
      total: 100,
      percentage: 0,
      color: "green",
    },
    {
      level: "medium",
      label: t("difficulty.medium.label"),
      answered: difficulties.value[1]?.answered || 0,
      total: 150,
      percentage: 0,
      color: "yellow",
    },
    {
      level: "hard",
      label: t("difficulty.hard.label"),
      answered: difficulties.value[2]?.answered || 0,
      total: 100,
      percentage: 0,
      color: "red",
    },
  ];

  // Calculate percentages
  difficulties.value.forEach((d) => {
    d.percentage = d.total > 0 ? Math.round((d.answered / d.total) * 100) : 0;
  });
});
</script>
