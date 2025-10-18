/**
 * Gamification Composable
 * Handles badges, leaderboards, XP tracking, and achievements
 */

import { ref } from "vue";
import { httpClient, getErrorMessage } from "@/utils/httpClient";
import { API_ENDPOINTS } from "@/config/api";
import type { IBadge, ILeaderboard, IStreakData } from "@shared/types/gamification";
import type { PlanTier } from "@shared/types/plan";
import type {
  IBadgeWithProgress,
  IXPInfo,
  IGamificationSummary,
  ILeaderboardRank,
} from "@shared/types/composables";

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
  async function getBadges(
    options: {
      category?: "study" | "quiz" | "streak" | "social" | "milestone";
      rarity?: "common" | "rare" | "epic" | "legendary";
    } = {}
  ): Promise<IBadgeWithProgress[] | null> {
    isLoading.value = true;
    error.value = null;

    try {
      const params = new URLSearchParams();
      if (options.category) params.append("category", options.category);
      if (options.rarity) params.append("rarity", options.rarity);

      const data = await httpClient.get<{
        badges: IBadgeWithProgress[];
        totalBadges: number;
        earnedCount: number;
      }>(API_ENDPOINTS.gamification.badges(params));

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
      const data = await httpClient.get<{ badges: IBadge[]; count: number }>(
        API_ENDPOINTS.gamification.badgesEarned()
      );
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
      const data = await httpClient.get<{ badges: IBadge[]; count: number }>(
        API_ENDPOINTS.gamification.badgesSecret()
      );
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

      const data = await httpClient.get<{
        leaderboard: ILeaderboard;
        userRank?: ILeaderboardRank;
      }>(API_ENDPOINTS.gamification.leaderboardByType(type, params));

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

      const data = await httpClient.get<ILeaderboardRank>(
        API_ENDPOINTS.gamification.leaderboardRank(type, params)
      );
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
      const data = await httpClient.get<IXPInfo>(API_ENDPOINTS.gamification.xp());
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
      const data = await httpClient.get<IGamificationSummary>(API_ENDPOINTS.gamification.summary());
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
      const data = await httpClient.get<IStreakData>(API_ENDPOINTS.gamification.streak());
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
