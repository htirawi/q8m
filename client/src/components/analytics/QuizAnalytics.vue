<template>
  <div class="space-y-6">
    <!-- Stats Overview -->
    <div class="grid grid-cols-1 gap-4 md:grid-cols-4">
      <div
        class="rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 p-4 dark:from-blue-900/20 dark:to-blue-800/20"
      >
        <div class="mb-2 text-sm font-medium text-blue-600 dark:text-blue-400">
          {{ t("analytics.totalAttempts") }}
        </div>
        <div class="text-2xl font-bold text-blue-900 dark:text-blue-100">
          {{ stats.totalAttempts }}
        </div>
      </div>

      <div
        class="rounded-lg bg-gradient-to-br from-green-50 to-green-100 p-4 dark:from-green-900/20 dark:to-green-800/20"
      >
        <div class="mb-2 text-sm font-medium text-green-600 dark:text-green-400">
          {{ t("analytics.averageScore") }}
        </div>
        <div class="text-2xl font-bold text-green-900 dark:text-green-100">
          {{ stats.averageScore }}%
        </div>
      </div>

      <div
        class="rounded-lg bg-gradient-to-br from-purple-50 to-purple-100 p-4 dark:from-purple-900/20 dark:to-purple-800/20"
      >
        <div class="mb-2 text-sm font-medium text-purple-600 dark:text-purple-400">
          {{ t("analytics.bestScore") }}
        </div>
        <div class="text-2xl font-bold text-purple-900 dark:text-purple-100">
          {{ stats.bestScore }}%
        </div>
      </div>

      <div
        class="rounded-lg bg-gradient-to-br from-orange-50 to-orange-100 p-4 dark:from-orange-900/20 dark:to-orange-800/20"
      >
        <div class="mb-2 text-sm font-medium text-orange-600 dark:text-orange-400">
          {{ t("analytics.improvement") }}
        </div>
        <div
          class="flex items-center gap-1 text-2xl font-bold text-orange-900 dark:text-orange-100"
        >
          <svg
            v-if="stats.improvement > 0"
            class="h-6 w-6 text-green-600"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fill-rule="evenodd"
              d="M5.293 7.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L6.707 7.707a1 1 0 01-1.414 0z"
              clip-rule="evenodd"
            />
          </svg>
          <svg
            v-else-if="stats.improvement < 0"
            class="h-6 w-6 text-red-600"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fill-rule="evenodd"
              d="M14.707 12.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 14.586V3a1 1 0 012 0v11.586l2.293-2.293a1 1 0 011.414 0z"
              clip-rule="evenodd"
            />
          </svg>
          {{ Math.abs(stats.improvement) }}%
        </div>
      </div>
    </div>

    <!-- Score Trends -->
    <div class="rounded-2xl bg-white p-6 shadow-lg dark:bg-gray-800">
      <h3 class="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
        {{ t("analytics.scoreTrends") }}
      </h3>
      <div class="space-y-2">
        <div v-for="attempt in recentAttempts" :key="attempt.id" class="flex items-center gap-4">
          <div class="flex-shrink-0 text-sm text-gray-500 dark:text-gray-400">
            {{ formatDate(attempt.timestamp) }}
          </div>
          <div class="flex-shrink-0">
            <span
              class="inline-flex items-center rounded px-2 py-1 text-xs font-medium"
              :class="getLevelBadgeClass(attempt.level)"
            >
              {{ t(`level.${attempt.level}.label`) }}
            </span>
          </div>
          <div class="flex-1">
            <div class="h-6 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
              <div
                :class="getScoreBarClass(attempt.score)"
                class="flex h-full items-center justify-end px-2 text-xs font-semibold text-white transition-all duration-500"
                :style="{ width: `${attempt.score}%` }"
              >
                {{ attempt.score }}%
              </div>
            </div>
          </div>
          <div class="flex-shrink-0 text-sm text-gray-600 dark:text-gray-400">
            {{ attempt.correct }}/{{ attempt.total }}
          </div>
        </div>
      </div>
    </div>

    <!-- Performance by Level -->
    <div class="rounded-2xl bg-white p-6 shadow-lg dark:bg-gray-800">
      <h3 class="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
        {{ t("analytics.performanceByLevel") }}
      </h3>
      <div class="space-y-4">
        <div v-for="level in levels" :key="level.name">
          <div class="mb-2 flex items-center justify-between">
            <div class="flex items-center gap-2">
              <span :class="getLevelIconClass(level.name)">
                {{ getLevelIcon(level.name) }}
              </span>
              <span class="font-medium text-gray-900 dark:text-white">
                {{ t(`level.${level.name}.label`) }}
              </span>
            </div>
            <div class="flex items-center gap-4 text-sm">
              <span class="text-gray-600 dark:text-gray-400">
                {{ level.attempts }} {{ t("analytics.attempts") }}
              </span>
              <span class="font-semibold text-gray-900 dark:text-white">
                {{ level.average }}%
              </span>
            </div>
          </div>
          <div class="h-3 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
            <div
              :class="getLevelProgressClass(level.name)"
              class="h-full transition-all duration-500"
              :style="{ width: `${level.average}%` }"
            ></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Weak Areas -->
    <div v-if="weakAreas.length > 0" class="rounded-2xl bg-white p-6 shadow-lg dark:bg-gray-800">
      <h3 class="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
        {{ t("analytics.weakAreas") }}
      </h3>
      <div class="space-y-3">
        <div
          v-for="area in weakAreas"
          :key="area.category"
          class="flex items-center justify-between rounded-lg bg-red-50 p-4 dark:bg-red-900/20"
        >
          <div>
            <div class="font-medium text-red-900 dark:text-red-200">
              {{ area.category }}
            </div>
            <div class="text-sm text-red-600 dark:text-red-400">
              {{ area.correctCount }}/{{ area.totalCount }} {{ t("analytics.correct") }}
            </div>
          </div>
          <div class="text-2xl font-bold text-red-600 dark:text-red-400">{{ area.accuracy }}%</div>
        </div>
      </div>
      <p class="mt-4 text-sm text-gray-600 dark:text-gray-400">
        {{ t("analytics.weakAreasHint") }}
      </p>
    </div>

    <!-- Strong Areas -->
    <div v-if="strongAreas.length > 0" class="rounded-2xl bg-white p-6 shadow-lg dark:bg-gray-800">
      <h3 class="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
        {{ t("analytics.strongAreas") }}
      </h3>
      <div class="grid grid-cols-1 gap-3 md:grid-cols-2">
        <div
          v-for="area in strongAreas"
          :key="area.category"
          class="rounded-lg bg-green-50 p-4 dark:bg-green-900/20"
        >
          <div class="flex items-center justify-between">
            <div class="font-medium text-green-900 dark:text-green-200">
              {{ area.category }}
            </div>
            <svg
              class="h-5 w-5 text-green-600 dark:text-green-400"
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
          <div class="mt-1 text-sm text-green-600 dark:text-green-400">
            {{ area.accuracy }}% {{ t("analytics.accuracy") }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import type { QuizAttempt, LevelStats, CategoryStats } from "@/types/quiz-analytics";

const { t } = useI18n();

const history = ref<QuizAttempt[]>([]);

const stats = computed(() => {
  if (history.value.length === 0) {
    return {
      totalAttempts: 0,
      averageScore: 0,
      bestScore: 0,
      improvement: 0,
    };
  }

  const totalAttempts = history.value.length;
  const averageScore = Math.round(
    history.value.reduce((sum, h) => sum + h.score, 0) / totalAttempts
  );
  const bestScore = Math.max(...history.value.map((h) => h.score));

  // Calculate improvement (comparing recent 5 vs previous 5)
  let improvement = 0;
  if (totalAttempts >= 10) {
    const recent5 = history.value.slice(0, 5);
    const previous5 = history.value.slice(5, 10);
    const recentAvg = recent5.reduce((sum, h) => sum + h.score, 0) / 5;
    const previousAvg = previous5.reduce((sum, h) => sum + h.score, 0) / 5;
    improvement = Math.round(recentAvg - previousAvg);
  }

  return { totalAttempts, averageScore, bestScore, improvement };
});

const recentAttempts = computed(() => {
  return history.value.slice(0, 10);
});

const levels = computed<LevelStats[]>(() => {
  const levelGroups: Record<"junior" | "intermediate" | "senior", QuizAttempt[]> = {
    junior: [],
    intermediate: [],
    senior: [],
  };

  history.value.forEach((attempt) => {
    levelGroups[attempt.level]?.push(attempt);
  });

  return (["junior", "intermediate", "senior"] as const).map((level) => {
    const group = levelGroups[level];
    return {
      name: level,
      attempts: group.length,
      average:
        group.length > 0
          ? Math.round(group.reduce((sum, a) => sum + a.score, 0) / group.length)
          : 0,
    };
  });
});

const categoryStats = computed<CategoryStats[]>(() => {
  const categories: Record<string, { correct: number; total: number }> = {};

  history.value.forEach((attempt) => {
    Object.values(attempt.answers).forEach((answer) => {
      // Extract category from answer (this would need actual category data from questions)
      const category = "General"; // Placeholder - in production, fetch from question data

      if (!categories[category]) {
        categories[category] = { correct: 0, total: 0 };
      }

      categories[category].total += 1;
      if (answer.isCorrect) {
        categories[category].correct += 1;
      }
    });
  });

  return Object.entries(categories).map(([category, stats]) => ({
    category,
    correctCount: stats.correct,
    totalCount: stats.total,
    accuracy: Math.round((stats.correct / stats.total) * 100),
  }));
});

const weakAreas = computed(() => {
  return categoryStats.value
    .filter((c) => c.accuracy < 70 && c.totalCount >= 5)
    .sort((a, b) => a.accuracy - b.accuracy)
    .slice(0, 3);
});

const strongAreas = computed(() => {
  return categoryStats.value
    .filter((c) => c.accuracy >= 85 && c.totalCount >= 5)
    .sort((a, b) => b.accuracy - a.accuracy)
    .slice(0, 4);
});

const getlevelicon = (level: string) => {
  const icons = { junior: "🟢", intermediate: "🟡", senior: "🔴" };
  return icons[level as keyof typeof icons] || "⚪";
};

const getleveliconclass = (level: string) => {
  const classes = {
    junior: "text-green-600 dark:text-green-400",
    intermediate: "text-yellow-600 dark:text-yellow-400",
    senior: "text-red-600 dark:text-red-400",
  };
  return classes[level as keyof typeof classes] || "text-gray-600";
};

const getlevelbadgeclass = (level: string) => {
  const classes = {
    junior: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    intermediate: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
    senior: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  };
  return classes[level as keyof typeof classes] || "bg-gray-100 text-gray-800";
};

const getlevelprogressclass = (level: string) => {
  const classes = {
    junior: "bg-green-600 dark:bg-green-400",
    intermediate: "bg-yellow-600 dark:bg-yellow-400",
    senior: "bg-red-600 dark:bg-red-400",
  };
  return classes[level as keyof typeof classes] || "bg-gray-600";
};

const getscorebarclass = (score: number) => {
  if (score >= 90) return "bg-green-600";
  if (score >= 80) return "bg-blue-600";
  if (score >= 70) return "bg-yellow-600";
  if (score >= 60) return "bg-orange-600";
  return "bg-red-600";
};

const formatdate = (timestamp: number) => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return t("analytics.today");
  if (diffDays === 1) return t("analytics.yesterday");
  if (diffDays < 7) return t("analytics.daysAgo", { count: diffDays });

  return date.toLocaleDateString();
};

const loadhistory = () => {
  try {
    const historyData = localStorage.getItem("quiz_history");
    if (historyData) {
      history.value = JSON.parse(historyData);
    }
  } catch (error) {
    console.error("Failed to load quiz history:", error);
  }
};

onMounted(() => {
  loadHistory();
});
</script>
