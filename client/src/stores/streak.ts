import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { httpClient } from "@/utils/httpClient";
import type { IStreakData, ICoinBalance } from "@shared/types/gamification";

export const useStreakStore = defineStore("streak", () => {
  // State
  const streak = ref<IStreakData>({
    currentStreak: 0,
    longestStreak: 0,
    lastActivityDate: null,
    streakStartDate: null,
    freezesUsed: 0,
    freezesAvailable: 2,
  });

  const coins = ref<ICoinBalance>({
    total: 0,
    earned: 0,
    spent: 0,
  });

  const isLoading = ref(false);
  const error = ref<string | null>(null);

  // Computed
  const hasActiveStreak = computed(() => {
    if (!streak.value.lastActivityDate) return false;
    const now = new Date();
    const lastActivity = new Date(streak.value.lastActivityDate);
    const daysSince = Math.floor((now.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24));
    return daysSince <= 1;
  });

  const isStreakInDanger = computed(() => {
    if (!streak.value.lastActivityDate) return false;
    const now = new Date();
    const lastActivity = new Date(streak.value.lastActivityDate);
    const daysSince = Math.floor((now.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24));
    return daysSince === 1; // Missed yesterday but can still save
  });

  const canUseFreeze = computed(() => {
    return (streak.value.freezesAvailable ?? 0) > 0;
  });

  const canBuyFreeze = computed(() => {
    const COST_IN_COINS = 100;
    return coins.value.total >= COST_IN_COINS;
  });

  // Actions
  async function fetchStreak() {
    isLoading.value = true;
    error.value = null;

    try {
      const response = await httpClient.get<IStreakData>("/api/v1/gamification/streak");
      streak.value = {
        currentStreak: response.currentStreak,
        longestStreak: response.longestStreak,
        lastActivityDate: response.lastActivityDate,
        streakStartDate: response.streakStartDate,
        freezesUsed: response.freezesUsed ?? 0,
        freezesAvailable: response.freezesAvailable ?? 2,
      };
      return true;
    } catch (err: unknown) {
      error.value = (err as Error).message || "Failed to fetch streak data";
      return false;
    } finally {
      isLoading.value = false;
    }
  }

  async function fetchCoins() {
    try {
      const response = await httpClient.get<ICoinBalance>("/api/v1/gamification/coins");
      coins.value = response;
      return true;
    } catch (err: unknown) {
      error.value = (err as Error).message || "Failed to fetch coin balance";
      return false;
    }
  }

  async function useStreakFreeze(
    useCoins = true,
    useXP = false
  ): Promise<{
    success: boolean;
    message?: string;
    costType?: "free" | "coins" | "xp";
    cost?: number;
  }> {
    isLoading.value = true;
    error.value = null;

    try {
      const response = await httpClient.post<{
        success: boolean;
        message: string;
        streak: IStreakData;
        coins?: ICoinBalance;
        xp?: number;
        costType: "free" | "coins" | "xp";
        cost?: number;
      }>("/api/v1/gamification/streak/freeze", {
        useCoins,
        useXP,
      });

      if (response.success) {
        // Update local state
        streak.value = {
          currentStreak: response.streak.currentStreak,
          longestStreak: response.streak.longestStreak,
          lastActivityDate: response.streak.lastActivityDate,
          streakStartDate: response.streak.streakStartDate,
          freezesUsed: response.streak.freezesUsed ?? 0,
          freezesAvailable: response.streak.freezesAvailable ?? 2,
        };

        if (response.coins) {
          coins.value = response.coins;
        }

        return {
          success: true,
          message: response.message,
          costType: response.costType,
          cost: response.cost,
        };
      }

      return {
        success: false,
        message: response.message,
      };
    } catch (err: unknown) {
      const errorMessage = (err as Error).message || "Failed to use streak freeze";
      error.value = errorMessage;
      return {
        success: false,
        message: errorMessage,
      };
    } finally {
      isLoading.value = false;
    }
  }

  async function updateActivityDate() {
    const now = new Date();

    // Check if already updated today
    if (streak.value.lastActivityDate) {
      const lastActivity = new Date(streak.value.lastActivityDate);
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const lastActivityDate = new Date(
        lastActivity.getFullYear(),
        lastActivity.getMonth(),
        lastActivity.getDate()
      );

      if (today.getTime() === lastActivityDate.getTime()) {
        // Already updated today
        return true;
      }
    }

    // Update streak (this would typically be done by the backend when user completes a quiz or study session)
    await fetchStreak();
    return true;
  }

  function reset() {
    streak.value = {
      currentStreak: 0,
      longestStreak: 0,
      lastActivityDate: null,
      streakStartDate: null,
      freezesUsed: 0,
      freezesAvailable: 2,
    };
    coins.value = {
      total: 0,
      earned: 0,
      spent: 0,
    };
    error.value = null;
  }

  return {
    // State
    streak,
    coins,
    isLoading,
    error,

    // Computed
    hasActiveStreak,
    isStreakInDanger,
    canUseFreeze,
    canBuyFreeze,

    // Actions
    fetchStreak,
    fetchCoins,
    useStreakFreeze,
    updateActivityDate,
    reset,
  };
});
