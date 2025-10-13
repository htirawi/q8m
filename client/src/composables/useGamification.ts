/**
 * Gamification Composable
 * Handles badges, leaderboards, XP tracking, and achievements
 */

import { ref } from "vue";
import { handleApiResponse, getErrorMessage } from "@/utils/apiHelpers";
import type { IBadge, ILeaderboard, IStreakData } from "@shared/types/gamification";
import type { PlanTier } from "@shared/types/plan";

export interface IBadgeWithProgress extends IBadge {
  earned: boolean;
  earnedAt?: Date;
  progress: number;
}

export interface IXPInfo {
  xp: number;
  level: number;
  levelTitle: string;
  xpToNextLevel: number;
  levelProgress: number;
}

export interface IGamificationSummary {
  xp: number;
  level: number;
  levelTitle: string;
  xpToNextLevel: number;
  xpProgress: number;
  totalBadges: number;
  rareBadges: number;
  currentStreak: number;
  longestStreak: number;
  leaderboardRank?: number;
  leaderboardPercentile?: number;
}

export interface ILeaderboardRank {
  rank: number;
  score: number;
  totalEntries: number;
  percentile: number;
}

export function useGamification() {
  const isLoading = ref(false);
  const error = ref<string | null>(null);
  const badges = ref<IBadgeWithProgress[]>([]);
  const earnedBadges = ref<IBadge[]>([]);
  const secretBadges = ref<IBadge[]>([]);
  const leaderboard = ref<ILeaderboard | null>(null);
  const userRank = ref<ILeaderboardRank | null>(null);
  const xpInfo = ref<IXPInfo | null>(null);
  const summary = ref<IGamificationSummary | null>(null);
  const streak = ref<IStreakData | null>(null);

  /**
   * Get all badges with user progress
   */
  async function getBadges(options: {
    category?: "study" | "quiz" | "streak" | "social" | "milestone";
    rarity?: "common" | "rare" | "epic" | "legendary";
  } = {}): Promise<IBadgeWithProgress[] | null> {
    isLoading.value = true;
    error.value = null;

    try {
      const params = new URLSearchParams();
      if (options.category) params.append("category", options.category);
      if (options.rarity) params.append("rarity", options.rarity);

      const response = await fetch(`/api/gamification/badges?${params.toString()}`, {
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await handleApiResponse<{
        badges: IBadgeWithProgress[];
        totalBadges: number;
        earnedCount: number;
      }>(response);

      badges.value = data.badges;
      return data.badges;
    } catch (err) {
      error.value = getErrorMessage(err, "Failed to fetch badges");
      return null;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Get badges earned by current user
   */
  async function getEarnedBadges(): Promise<IBadge[] | null> {
    isLoading.value = true;
    error.value = null;

    try {
      const response = await fetch("/api/gamification/badges/earned", {
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await handleApiResponse<{ badges: IBadge[]; count: number }>(response);
      earnedBadges.value = data.badges;
      return data.badges;
    } catch (err) {
      error.value = getErrorMessage(err, "Failed to fetch earned badges");
      return null;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Get secret badges unlocked by user
   */
  async function getSecretBadges(): Promise<IBadge[] | null> {
    isLoading.value = true;
    error.value = null;

    try {
      const response = await fetch("/api/gamification/badges/secret", {
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await handleApiResponse<{ badges: IBadge[]; count: number }>(response);
      secretBadges.value = data.badges;
      return data.badges;
    } catch (err) {
      error.value = getErrorMessage(err, "Failed to fetch secret badges");
      return null;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Get leaderboard rankings
   */
  async function getLeaderboard(
    type: "weekly" | "monthly" | "all_time",
    options: {
      scope?: "global" | "plan_tier";
      planTier?: PlanTier;
    } = {}
  ): Promise<ILeaderboard | null> {
    isLoading.value = true;
    error.value = null;

    try {
      const params = new URLSearchParams();
      if (options.scope) params.append("scope", options.scope);
      if (options.planTier) params.append("planTier", options.planTier);

      const response = await fetch(
        `/api/gamification/leaderboard/${type}?${params.toString()}`,
        {
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data = await handleApiResponse<{
        leaderboard: ILeaderboard;
        userRank?: ILeaderboardRank;
      }>(response);

      leaderboard.value = data.leaderboard;
      userRank.value = data.userRank || null;
      return data.leaderboard;
    } catch (err) {
      error.value = getErrorMessage(err, "Failed to fetch leaderboard");
      return null;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Get current user's leaderboard rank
   */
  async function getUserRank(
    type: "weekly" | "monthly" | "all_time",
    options: {
      scope?: "global" | "plan_tier";
      planTier?: PlanTier;
    } = {}
  ): Promise<ILeaderboardRank | null> {
    isLoading.value = true;
    error.value = null;

    try {
      const params = new URLSearchParams();
      if (options.scope) params.append("scope", options.scope);
      if (options.planTier) params.append("planTier", options.planTier);

      const response = await fetch(
        `/api/gamification/leaderboard/${type}/rank?${params.toString()}`,
        {
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data = await handleApiResponse<ILeaderboardRank>(response);
      userRank.value = data;
      return data;
    } catch (err) {
      error.value = getErrorMessage(err, "Failed to fetch user rank");
      return null;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Get XP and level information
   */
  async function getXP(): Promise<IXPInfo | null> {
    isLoading.value = true;
    error.value = null;

    try {
      const response = await fetch("/api/gamification/xp", {
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await handleApiResponse<IXPInfo>(response);
      xpInfo.value = data;
      return data;
    } catch (err) {
      error.value = getErrorMessage(err, "Failed to fetch XP information");
      return null;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Get complete gamification summary
   */
  async function getSummary(): Promise<IGamificationSummary | null> {
    isLoading.value = true;
    error.value = null;

    try {
      const response = await fetch("/api/gamification/summary", {
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await handleApiResponse<IGamificationSummary>(response);
      summary.value = data;
      return data;
    } catch (err) {
      error.value = getErrorMessage(err, "Failed to fetch gamification summary");
      return null;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Get streak information
   */
  async function getStreak(): Promise<IStreakData | null> {
    isLoading.value = true;
    error.value = null;

    try {
      const response = await fetch("/api/gamification/streak", {
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await handleApiResponse<IStreakData>(response);
      streak.value = data;
      return data;
    } catch (err) {
      error.value = getErrorMessage(err, "Failed to fetch streak information");
      return null;
    } finally {
      isLoading.value = false;
    }
  }

  return {
    // State
    isLoading,
    error,
    badges,
    earnedBadges,
    secretBadges,
    leaderboard,
    userRank,
    xpInfo,
    summary,
    streak,

    // Methods
    getBadges,
    getEarnedBadges,
    getSecretBadges,
    getLeaderboard,
    getUserRank,
    getXP,
    getSummary,
    getStreak,
  };
}
