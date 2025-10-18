<template>
  <div
    class="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900"
  >
    <div class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <!-- Header -->
      <div class="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 class="text-4xl font-bold text-gray-900 dark:text-white">
            {{ getGreeting() }}
          </h1>
          <p class="mt-2 text-lg text-gray-600 dark:text-gray-300">
            {{ getMotivationalMessage() }}
          </p>
        </div>
        <div class="flex items-center gap-3">
          <div
            class="rounded-xl bg-gradient-to-r from-purple-100 to-blue-100 px-6 py-3 dark:from-purple-900/30 dark:to-blue-900/30"
          >
            <div class="flex items-center gap-3">
              <div class="flex items-center gap-2">
                <div
                  class="h-3 w-3 rounded-full bg-gradient-to-r from-purple-500 to-blue-500"
                ></div>
                <span class="text-sm font-semibold text-gray-900 dark:text-white">
                  {{ planDisplayName }}
                </span>
              </div>
              <span
                class="rounded-full bg-gradient-to-r from-purple-600 to-blue-600 px-3 py-1 text-xs font-bold text-white shadow-lg"
              >
                {{ t("dashboard.vipChip") }}
              </span>
            </div>
          </div>
          <button
            type="button"
            class="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-lg transition-all hover:scale-105 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            @click="loadDashboardData"
          >
            🔄 Refresh
          </button>
          <button
            type="button"
            class="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-lg transition-all hover:scale-105 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
            @click="goToBilling"
          >
            {{ t("dashboard.manage") }}
          </button>
          <UserMenu />
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="isLoading" class="space-y-8">
        <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <div
            v-for="i in 4"
            :key="i"
            class="h-32 animate-pulse rounded-xl bg-gray-200 dark:bg-gray-700"
          ></div>
        </div>
        <div class="grid gap-6 lg:grid-cols-2">
          <div class="h-64 animate-pulse rounded-xl bg-gray-200 dark:bg-gray-700"></div>
          <div class="h-64 animate-pulse rounded-xl bg-gray-200 dark:bg-gray-700"></div>
        </div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="rounded-xl bg-red-50 p-8 text-center dark:bg-red-900/20">
        <div
          class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30"
        >
          <svg
            class="h-8 w-8 text-red-600 dark:text-red-400"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fill-rule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clip-rule="evenodd"
            />
          </svg>
        </div>
        <h3 class="mb-2 text-lg font-semibold text-red-900 dark:text-red-100">
          Failed to load dashboard data
        </h3>
        <p class="mb-4 text-red-700 dark:text-red-300">{{ error }}</p>
        <button
          @click="loadDashboardData"
          class="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
        >
          Try Again
        </button>
      </div>

      <!-- Main Dashboard Content -->
      <div v-else class="space-y-8">
        <!-- Key Metrics Row -->
        <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <!-- Total Quizzes -->
          <div
            class="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 p-6 text-white shadow-xl transition-all hover:scale-105 hover:shadow-2xl"
          >
            <div class="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-white/10"></div>
            <div class="relative">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm font-medium text-blue-100">Total Quizzes</p>
                  <p class="text-3xl font-bold">{{ dashboardStats.totalQuizzesCompleted }}</p>
                  <p class="text-xs text-blue-100">{{ getQuizTrend() }}</p>
                </div>
                <div class="rounded-full bg-white/20 p-3">
                  <svg class="h-6 w-6" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <!-- Average Score -->
          <div
            class="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-green-500 to-green-600 p-6 text-white shadow-xl transition-all hover:scale-105 hover:shadow-2xl"
          >
            <div class="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-white/10"></div>
            <div class="relative">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm font-medium text-green-100">Average Score</p>
                  <p class="text-3xl font-bold">{{ getAverageScoreDisplay() }}</p>
                  <p class="text-xs text-green-100">{{ getScoreTrend() }}</p>
                </div>
                <div class="rounded-full bg-white/20 p-3">
                  <svg class="h-6 w-6" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fill-rule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clip-rule="evenodd"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <!-- Current Streak -->
          <div
            class="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 p-6 text-white shadow-xl transition-all hover:scale-105 hover:shadow-2xl"
          >
            <div class="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-white/10"></div>
            <div class="relative">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm font-medium text-orange-100">Current Streak</p>
                  <p class="text-3xl font-bold">{{ dashboardStats.currentStreak }}</p>
                  <p class="text-xs text-orange-100">{{ getStreakTrend() }}</p>
                </div>
                <div class="rounded-full bg-white/20 p-3">
                  <svg class="h-6 w-6" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fill-rule="evenodd"
                      d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z"
                      clip-rule="evenodd"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <!-- Total XP -->
          <div
            class="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 p-6 text-white shadow-xl transition-all hover:scale-105 hover:shadow-2xl"
          >
            <div class="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-white/10"></div>
            <div class="relative">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm font-medium text-purple-100">Total XP</p>
                  <p class="text-3xl font-bold">{{ formatNumber(dashboardStats.totalXP) }}</p>
                  <p class="text-xs text-purple-100">{{ getXPTrend() }}</p>
                </div>
                <div class="rounded-full bg-white/20 p-3">
                  <svg class="h-6 w-6" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fill-rule="evenodd"
                      d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z"
                      clip-rule="evenodd"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Progress and Activity Row -->
        <div class="grid gap-6 lg:grid-cols-2">
          <!-- Learning Progress -->
          <div class="rounded-2xl bg-white p-6 shadow-xl dark:bg-gray-800">
            <div class="mb-6 flex items-center justify-between">
              <h3 class="text-xl font-bold text-gray-900 dark:text-white">Learning Progress</h3>
              <div class="rounded-full bg-purple-100 p-2 dark:bg-purple-900/30">
                <svg
                  class="h-5 w-5 text-purple-600 dark:text-purple-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fill-rule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.293l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z"
                    clip-rule="evenodd"
                  />
                </svg>
              </div>
            </div>

            <!-- Level Progress -->
            <div class="mb-6">
              <div class="mb-2 flex items-center justify-between">
                <span class="text-sm font-medium text-gray-600 dark:text-gray-400"
                  >Current Level</span
                >
                <span class="text-sm font-bold text-purple-600 dark:text-purple-400"
                  >Level {{ dashboardStats.currentLevel }}</span
                >
              </div>
              <div class="h-3 rounded-full bg-gray-200 dark:bg-gray-700">
                <div
                  class="h-3 rounded-full bg-gradient-to-r from-purple-500 to-blue-500"
                  :style="{ width: `${getLevelProgress()}%` }"
                ></div>
              </div>
              <p class="mt-2 text-xs text-gray-500 dark:text-gray-400">
                {{ getXPToNextLevel() }}

                XP to next level
              </p>
            </div>

            <!-- Study Time -->
            <div
              class="rounded-xl bg-gradient-to-r from-blue-50 to-purple-50 p-4 dark:from-blue-900/20 dark:to-purple-900/20"
            >
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Total Study Time
                  </p>
                  <p class="text-2xl font-bold text-gray-900 dark:text-white">
                    {{ formatStudyTime(dashboardStats.totalStudyTime) }}
                  </p>
                </div>
                <div class="rounded-full bg-blue-100 p-3 dark:bg-blue-900/30">
                  <svg
                    class="h-6 w-6 text-blue-600 dark:text-blue-400"
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
              </div>
            </div>
          </div>

          <!-- Recent Activity -->
          <div class="rounded-2xl bg-white p-6 shadow-xl dark:bg-gray-800">
            <div class="mb-6 flex items-center justify-between">
              <h3 class="text-xl font-bold text-gray-900 dark:text-white">Recent Activity</h3>
              <div class="rounded-full bg-green-100 p-2 dark:bg-green-900/30">
                <svg
                  class="h-5 w-5 text-green-600 dark:text-green-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fill-rule="evenodd"
                    d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                    clip-rule="evenodd"
                  />
                </svg>
              </div>
            </div>

            <div v-if="dashboardStats.recentActivity.length === 0" class="py-8 text-center">
              <div
                class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700"
              >
                <svg class="h-8 w-8 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fill-rule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                    clip-rule="evenodd"
                  />
                </svg>
              </div>
              <p class="text-sm text-gray-500 dark:text-gray-400">No recent activity</p>
              <p class="mt-1 text-xs text-gray-400 dark:text-gray-500">
                Complete your first quiz to see activity here
              </p>
            </div>

            <div v-else class="space-y-4">
              <div
                v-for="activity in dashboardStats.recentActivity.slice(0, 5)"
                :key="activity.id"
                class="flex items-center gap-3 rounded-lg bg-gray-50 p-3 dark:bg-gray-700"
              >
                <div class="rounded-full bg-purple-100 p-2 dark:bg-purple-900/30">
                  <svg
                    class="h-4 w-4 text-purple-600 dark:text-purple-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div class="flex-1">
                  <p class="text-sm font-medium text-gray-900 dark:text-white">
                    {{ activity.title }}
                  </p>
                  <p class="text-xs text-gray-500 dark:text-gray-400">
                    {{ formatTimeAgo(activity.timestamp) }}
                  </p>
                </div>
                <span class="text-xs font-semibold text-purple-600 dark:text-purple-400"
                  >+{{ activity.xp }}

                  XP</span
                >
              </div>
            </div>
          </div>
        </div>

        <!-- Quick Actions -->
        <div
          class="rounded-2xl bg-gradient-to-r from-purple-500 to-blue-600 p-8 text-white shadow-xl"
        >
          <div class="text-center">
            <h3 class="mb-2 text-2xl font-bold">Ready to continue learning?</h3>
            <p class="mb-6 text-purple-100">
              Choose your next challenge and keep building your skills
            </p>
            <div class="flex flex-col gap-4 sm:flex-row sm:justify-center">
              <button
                @click="goToQuiz"
                class="rounded-xl bg-white px-8 py-3 font-semibold text-purple-600 shadow-lg transition-all hover:scale-105 hover:shadow-xl"
              >
                Start New Quiz
              </button>
              <button
                @click="goToStudy"
                class="rounded-xl border-2 border-white px-8 py-3 font-semibold text-white transition-all hover:bg-white hover:text-purple-600"
              >
                Study Mode
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from "vue";
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";
import { usePlanStore } from "@/stores/plan";
import { useStreakStore } from "@/stores/streak";
import { useAuthStore } from "@/stores/auth";
import UserMenu from "@/components/layout/UserMenu.vue";

const { t } = useI18n();
const router = useRouter();
const planStore = usePlanStore();
const streakStore = useStreakStore();
const authStore = useAuthStore();

// Dashboard data
const dashboardStats = ref({
  totalQuizzesCompleted: 0,
  averageScore: 0,
  currentStreak: 0,
  totalXP: 0,
  currentLevel: 1,
  totalStudyTime: 0,
  recentActivity: [] as any[],
});

const isLoading = ref(true);
const error = ref<string | null>(null);

const planDisplayName = planStore.planDisplayName;

// Enhanced data loading with better error handling and debugging
const loadDashboardData = async () => {
  try {
    isLoading.value = true;
    error.value = null;

    // Load data from multiple endpoints in parallel with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    const [progressResponse, streakResponse, coinsResponse, quizResultsResponse] =
      await Promise.allSettled([
        fetch("/api/v1/progress", {
          credentials: "include",
          signal: controller.signal,
          headers: { Accept: "application/json" },
        }),
        fetch("/api/v1/gamification/streak", {
          credentials: "include",
          signal: controller.signal,
          headers: { Accept: "application/json" },
        }),
        fetch("/api/v1/gamification/coins", {
          credentials: "include",
          signal: controller.signal,
          headers: { Accept: "application/json" },
        }),
        fetch("/api/v1/quiz-results/history", {
          credentials: "include",
          signal: controller.signal,
          headers: { Accept: "application/json" },
        }),
      ]);

    clearTimeout(timeoutId);

    // Update streak and coins from streak store
    await streakStore.fetchStreak();
    await streakStore.fetchCoins();

    // Process responses
    let progressData = null;
    let quizData = null;

    if (progressResponse.status === "fulfilled" && progressResponse.value.ok) {
      progressData = await progressResponse.value.json();
      console.log("📊 Progress data loaded:", progressData);
    } else {
      console.warn("⚠️ Progress API failed:", progressResponse);
    }

    if (quizResultsResponse.status === "fulfilled" && quizResultsResponse.value.ok) {
      quizData = await quizResultsResponse.value.json();
      console.log("📈 Quiz data loaded:", quizData);
    } else {
      console.warn("⚠️ Quiz results API failed:", quizResultsResponse);
    }

    // Update dashboard stats with real data
    dashboardStats.value = {
      totalQuizzesCompleted: progressData?.progress?.quizzesTaken || 0,
      averageScore:
        progressData?.progress?.averageQuizScore || calculateAverageScore(quizData?.results || []),
      currentStreak:
        progressData?.progress?.streaks?.currentStreak || streakStore.streak.currentStreak || 0,
      totalXP: progressData?.progress?.xp || 0,
      currentLevel:
        progressData?.progress?.level ||
        Math.max(1, Math.floor((progressData?.progress?.xp || 0) / 100) + 1),
      totalStudyTime: progressData?.progress?.totalStudyTimeMinutes || 0,
      recentActivity: generateRecentActivity(quizData?.results || [], progressData),
    };

    console.log("🎯 Final dashboard stats:", dashboardStats.value);

    // If no data available, show helpful message
    if (dashboardStats.value.totalQuizzesCompleted === 0 && dashboardStats.value.totalXP === 0) {
      // User is likely new or not authenticated - this is normal
    }
  } catch (err) {
    // Provide helpful error messages
    if (err instanceof Error) {
      if (err.name === "AbortError") {
        error.value = "Request timed out. Please check your connection and try again.";
      } else if (err.message.includes("fetch")) {
        error.value = "Unable to connect to server. Please ensure the server is running.";
      } else {
        error.value = "Failed to load dashboard data. Please try again.";
      }
    } else {
      error.value = "An unexpected error occurred. Please try again.";
    }
  } finally {
    isLoading.value = false;
  }
};

// Helper functions for data processing
const calculateAverageScore = (results: any[]): number => {
  if (!results || results.length === 0) return 0;
  const totalScore = results.reduce((sum, result) => sum + (result.score || 0), 0);
  return Math.round(totalScore / results.length);
};

const generateRecentActivity = (quizResults: any[], progressData: any): any[] => {
  const activities = [];

  // Add recent quiz completions
  quizResults.slice(0, 3).forEach((result, index) => {
    activities.push({
      id: `quiz-${result._id || index}`,
      title: `Completed ${result.level || "Junior"} Quiz`,
      timestamp: new Date(result.createdAt || Date.now() - index * 86400000),
      xp: result.xpEarned || 10,
      type: "quiz",
    });
  });

  // Add study session if available
  if (progressData?.progress?.totalStudyTimeMinutes > 0) {
    activities.push({
      id: "study-session",
      title: "Study Session Completed",
      timestamp: new Date(Date.now() - 3600000), // 1 hour ago
      xp: Math.floor(progressData.progress.totalStudyTimeMinutes / 10),
      type: "study",
    });
  }

  return activities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
};

// UI Helper functions
const getGreeting = (): string => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
};

const getMotivationalMessage = (): string => {
  const messages = [
    "Continue your learning journey",
    "Keep building your skills",
    "Every quiz makes you stronger",
    "Learning never stops",
    "You're doing great!",
  ];
  return messages[Math.floor(Math.random() * messages.length)];
};

const getQuizTrend = (): string => {
  const count = dashboardStats.value.totalQuizzesCompleted;
  if (count === 0) return "Start your first quiz!";
  if (count === 1) return "Great start!";
  if (count < 5) return "Building momentum";
  return "Quiz master!";
};

const getAverageScoreDisplay = (): string => {
  if (dashboardStats.value.totalQuizzesCompleted === 0) {
    return "0%";
  }
  return `${dashboardStats.value.averageScore}%`;
};

const getScoreTrend = (): string => {
  const score = dashboardStats.value.averageScore;
  const quizCount = dashboardStats.value.totalQuizzesCompleted;

  if (quizCount === 0) return "Complete your first quiz!";
  if (score < 50) return "Room for improvement";
  if (score < 80) return "Good progress";
  return "Excellent work!";
};

const getStreakTrend = (): string => {
  const streak = dashboardStats.value.currentStreak;
  if (streak === 0) return "Start your streak";
  if (streak === 1) return "Great start!";
  if (streak < 7) return "Building habit";
  return "On fire!";
};

const getXPTrend = (): string => {
  const xp = dashboardStats.value.totalXP;
  if (xp === 0) return "Start earning XP";
  if (xp < 100) return "Getting started";
  if (xp < 500) return "Good progress";
  return "XP master!";
};

const formatNumber = (num: number): string => {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
  if (num >= 1000) return (num / 1000).toFixed(1) + "K";
  return num.toString();
};

const formatStudyTime = (minutes: number): string => {
  if (minutes === 0) return "0m";
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return remainingminutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
};

const formatTimeAgo = (date: Date): string => {
  const now = new Date();
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

  if (diffInMinutes < 1) return "Just now";
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;

  const diffInDays = Math.floor(diffInHours / 24);
  return `${diffInDays}d ago`;
};

const getLevelProgress = (): number => {
  const currentXP = dashboardStats.value.totalXP;
  const currentLevel = dashboardStats.value.currentLevel;
  const xpForCurrentLevel = (currentLevel - 1) * 100;
  const xpForNextLevel = currentLevel * 100;
  const progress = ((currentXP - xpForCurrentLevel) / (xpForNextLevel - xpForCurrentLevel)) * 100;
  return Math.min(100, Math.max(0, progress));
};

const getXPToNextLevel = (): number => {
  const currentXP = dashboardStats.value.totalXP;
  const currentLevel = dashboardStats.value.currentLevel;
  const xpForNextLevel = currentLevel * 100;
  return Math.max(0, xpForNextLevel - currentXP);
};

// Navigation functions
const goToQuiz = () => {
  router.push("/en/select");
};

const gotostudy = () => {
  router.push("/en/study/junior");
};

const gotobilling = () => {
  router.push("/en/pricing");
};

const gotoprogress = () => {
  router.push("/en/progress");
};

// Watch for route changes to refresh data when returning from study/quiz
watch(
  () => router.currentRoute.value.path,
  (newPath, oldPath) => {
    // If coming back from study or quiz mode, refresh dashboard data
    if (
      oldPath &&
      (oldPath.includes("/study") || oldPath.includes("/quiz")) &&
      newPath &&
      newPath.includes("/dashboard")
    ) {
      loadDashboardData();
    }
  },
  { immediate: false }
);

// Load dashboard data on mount
onMounted(() => {
  loadDashboardData();

  // Refresh data when window regains focus (user returns to tab)
  const handleFocus = () => {
    loadDashboardData();
  };
  window.addEventListener("focus", handleFocus);

  // Cleanup on unmount
  onUnmounted(() => {
    window.removeEventListener("focus", handleFocus);
  });
});
</script>

<style scoped>
/* Custom animations for the dashboard */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.group:hover .absolute {
  transform: scale(110%);
}

.animate-fade-in-up {
  animation: fadeInUp 0.6s ease-out;
}
</style>
