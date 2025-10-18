/**
 * useSelectData Composable
 * Fetches and manages select page data (level options, user stats, progress)
 */

import { ref, computed } from "vue";
import { useI18n } from "vue-i18n";
import { usePaymentStore } from "@/stores/payment";
import type { ISelectOption, IUserStats, IRecentBadge } from "@/types/select";
import { analytics } from "@/services/analytics";

interface ILevelProgressCache {
  [key: string]: number;
}

export function useSelectData() {
  const { t } = useI18n();
  const paymentStore = usePaymentStore();

  const isLoading = ref(false);
  const error = ref<string | null>(null);
  const levelProgressCache = ref<ILevelProgressCache>({});
  const userStats = ref<IUserStats>({
    streak: 0,
    coins: 0,
    level: 1,
    progress: 0,
  });
  const coinTrend = ref(0);
  const recentBadges = ref<IRecentBadge[]>([]);

  const lockedLevels = computed(() => ({
    intermediate: !paymentStore.hasContentAccess("INTERMEDIATE"),
    senior: !paymentStore.hasContentAccess("SENIOR"),
    junior: false,
    custom: false,
  }));

  const getUserProgressForLevel = (level: string): number => {
    if (lockedLevels.value[level as keyof typeof lockedLevels.value]) {
      return 0;
    }
    return levelProgressCache.value[level] ?? 0;
  };

  const levelOptions = computed<ISelectOption[]>(() => [
    {
      id: "junior",
      titleKey: "levels.junior.title",
      subtitleKey: "levels.junior.subtitle",
      descriptionKey: "levels.junior.description",
      durationKey: "levels.junior.duration",
      difficulty: "junior",
      isLocked: lockedLevels.value.junior,
      progress: getUserProgressForLevel("junior"),
    },
    {
      id: "intermediate",
      titleKey: "levels.intermediate.title",
      subtitleKey: "levels.intermediate.subtitle",
      descriptionKey: "levels.intermediate.description",
      durationKey: "levels.intermediate.duration",
      difficulty: "intermediate",
      isLocked: lockedLevels.value.intermediate,
      requiredPlan: "pro",
      badge: lockedLevels.value.intermediate
        ? { textKey: "levels.badgePro", variant: "warning" as const }
        : undefined,
      progress: getUserProgressForLevel("intermediate"),
    },
    {
      id: "senior",
      titleKey: "levels.senior.title",
      subtitleKey: "levels.senior.subtitle",
      descriptionKey: "levels.senior.description",
      durationKey: "levels.senior.duration",
      difficulty: "senior",
      isLocked: lockedLevels.value.senior,
      requiredPlan: "pro",
      badge: lockedLevels.value.senior
        ? { textKey: "levels.badgePro", variant: "warning" as const }
        : undefined,
      progress: getUserProgressForLevel("senior"),
    },
    {
      id: "custom",
      titleKey: "levels.custom.title",
      subtitleKey: "levels.custom.subtitle",
      descriptionKey: "levels.custom.description",
      durationKey: "levels.custom.duration",
      difficulty: "custom",
      isLocked: lockedLevels.value.custom,
      badge: { textKey: "levels.badgeNew", variant: "success" as const },
      progress: getUserProgressForLevel("custom"),
    },
  ]);

  const loadUserStats = async (): Promise<void> => {
    try {
      const [progressResponse, streakResponse] = await Promise.all([
        fetch("/api/v1/progress", { credentials: "include" }),
        fetch("/api/v1/gamification/streak", { credentials: "include" }),
      ]);

      let progressData = null;
      if (progressResponse.ok) {
        progressData = await progressResponse.json();
      }

      let streakData = null;
      if (streakResponse.ok) {
        streakData = await streakResponse.json();
      }

      userStats.value = {
        streak: streakData?.currentStreak ?? 0,
        coins: streakData?.coins?.total ?? 0,
        level:
          progressData?.progress?.level ??
          Math.max(1, Math.floor((streakData?.currentStreak ?? 0) / 7) + 1),
        progress:
          progressData?.progress?.xp ??
          Math.min(100, ((streakData?.currentStreak ?? 0) % 7) * 14.28),
      };

      if (progressData?.progress?.levelProgress) {
        levelProgressCache.value = progressData.progress.levelProgress;
      } else {
        levelProgressCache.value = {
          junior: 0,
          intermediate: 0,
          senior: 0,
          custom: 0,
        };
      }

      // Load coin trend
      try {
        const coinsResponse = await fetch("/api/v1/gamification/coins", {
          credentials: "include",
        });
        if (coinsResponse.ok) {
          const coinsData = await coinsResponse.json();
          coinTrend.value =
            coinsData.total > 0 ? Math.min(25, Math.floor(coinsData.total / 100)) : 0;
        } else {
          coinTrend.value = 0;
        }
      } catch {
        coinTrend.value = 0;
      }

      // Load recent badges
      try {
        const badgesResponse = await fetch("/api/v1/gamification/badges/earned", {
          credentials: "include",
        });
        if (badgesResponse.ok) {
          const badgesData = await badgesResponse.json();
          recentBadges.value = badgesData.badges
            .slice(0, 3)
            .map((badge: { _id: string; name: string; icon: string }) => ({
              id: badge._id,
              name: badge.name,
              emoji: badge.icon,
            }));
        } else {
          recentBadges.value = [];
        }
      } catch {
        recentBadges.value = [];
      }
    } catch (err) {
      userStats.value = {
        streak: 0,
        coins: 0,
        level: 1,
        progress: 0,
      };
      coinTrend.value = 0;
      recentBadges.value = [];

      analytics.trackError(err as Error, {
        context: "useSelectData_loadUserStats",
      });
    }
  };

  const loadData = async (): Promise<void> => {
    isLoading.value = true;
    error.value = null;

    try {
      await loadUserStats();
    } catch (err) {
      error.value = t("errors.defaultMessage");
      analytics.trackError(err as Error, {
        context: "useSelectData_loadData",
      });
    } finally {
      isLoading.value = false;
    }
  };

  const retryLoad = async (): Promise<void> => {
    await loadData();
  };

  return {
    isLoading,
    error,
    levelOptions,
    userStats,
    coinTrend,
    recentBadges,
    loadData,
    retryLoad,
  };
}
