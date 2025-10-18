import { computed } from "vue";
import { useStreakStore } from "@/stores/streak";
import { STREAK_MILESTONES, STREAK_SAVER_CONFIG } from "@shared/types/gamification";

export function useStreak() {
  const streakStore = useStreakStore();

  // Streak milestone helper
  const nextMilestone = computed(() => {
    const current = streakStore.streak.currentStreak;
    const next = STREAK_MILESTONES.find((m) => m > current);
    return next || STREAK_MILESTONES[STREAK_MILESTONES.length - 1];
  });

  const progressToNextMilestone = computed(() => {
    const current = streakStore.streak.currentStreak;
    const next = nextMilestone.value;
    const previous = STREAK_MILESTONES.find((m) => m <= current) || 0;
    const range = next - previous;
    const progress = current - previous;
    return Math.round((progress / range) * 100);
  });

  const daysUntilNextMilestone = computed(() => {
    return nextMilestone.value - streakStore.streak.currentStreak;
  });

  const achievedMilestones = computed(() => {
    return STREAK_MILESTONES.filter((m) => m <= streakStore.streak.currentStreak);
  });

  // Streak status helpers
  const streakStatusMessage = computed(() => {
    if (!streakStore.streak.lastActivityDate) {
      return "Start your streak today!";
    }

    const now = new Date();
    const lastActivity = new Date(streakStore.streak.lastActivityDate);
    const daysSince = Math.floor((now.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24));

    if (daysSince === 0) {
      return "Active today! Keep it going!";
    } else if (daysSince === 1) {
      return "Streak at risk! Complete an activity today.";
    } else {
      return "Streak lost. Start fresh!";
    }
  });

  const streakStatusColor = computed(() => {
    if (!streakStore.streak.lastActivityDate) {
      return "gray";
    }

    const now = new Date();
    const lastActivity = new Date(streakStore.streak.lastActivityDate);
    const daysSince = Math.floor((now.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24));

    if (daysSince === 0) {
      return "green";
    } else if (daysSince === 1) {
      return "orange";
    } else {
      return "red";
    }
  });

  const streakIcon = computed(() => {
    const current = streakStore.streak.currentStreak;

    if (current === 0) return "🌱";
    if (current < 7) return "🔥";
    if (current < 30) return "⚡";
    if (current < 90) return "💪";
    if (current < 180) return "🏆";
    if (current < 365) return "👑";
    return "🌟"; // 365+ days
  });

  // Freeze helpers
  const freezeCostInCoins = STREAK_SAVER_CONFIG.COST_IN_COINS;
  const freezeCostInXP = STREAK_SAVER_CONFIG.COST_IN_XP;
  const maxFreezesPerWeek = STREAK_SAVER_CONFIG.MAX_FREEZES_PER_WEEK;

  const canUseFreeFreeze = computed(() => {
    return (streakStore.streak.freezesAvailable ?? 0) > 0;
  });

  const canBuyFreezeWithCoins = computed(() => {
    return streakStore.coins.total >= freezeCostInCoins;
  });

  const freezesRemaining = computed(() => {
    return maxFreezesPerWeek - (streakStore.streak.freezesUsed ?? 0);
  });

  // Formatting helpers
  function formatStreakDuration(days: number): string {
    if (days === 0) return "No streak";
    if (days === 1) return "1 day";
    if (days < 7) return `${days} days`;
    if (days < 30) {
      const weeks = Math.floor(days / 7);
      return weeks === 1 ? "1 week" : `${weeks} weeks`;
    }
    if (days < 365) {
      const months = Math.floor(days / 30);
      return months === 1 ? "1 month" : `${months} months`;
    }
    const years = Math.floor(days / 365);
    const remainingDays = days % 365;
    if (remainingDays === 0) {
      return years === 1 ? "1 year" : `${years} years`;
    }
    return `${years}y ${remainingDays}d`;
  }

  function formatRelativeDate(date: Date | null): string {
    if (!date) return "Never";

    const now = new Date();
    const activity = new Date(date);
    const daysSince = Math.floor((now.getTime() - activity.getTime()) / (1000 * 60 * 60 * 24));

    if (daysSince === 0) return "Today";
    if (daysSince === 1) return "Yesterday";
    if (daysSince < 7) return `${daysSince} days ago`;
    if (daysSince < 30) {
      const weeks = Math.floor(daysSince / 7);
      return weeks === 1 ? "1 week ago" : `${weeks} weeks ago`;
    }
    if (daysSince < 365) {
      const months = Math.floor(daysSince / 30);
      return months === 1 ? "1 month ago" : `${months} months ago`;
    }
    return activity.toLocaleDateString();
  }

  // Milestone celebration message
  function getMilestoneMessage(milestone: number): string {
    const messages: Record<number, string> = {
      7: "🔥 One week streak! You're on fire!",
      14: "⚡ Two weeks! Unstoppable!",
      30: "🎉 30 days! You're a legend!",
      60: "💪 60 days! Incredible dedication!",
      90: "🏆 90 days! You're a champion!",
      180: "👑 Half a year! Absolutely amazing!",
      365: "🌟 One full year! You're a superstar!",
    };

    return messages[milestone] || `🎊 ${milestone} days! Keep it up!`;
  }

  // Check if a milestone was just reached
  function isNewMilestone(previousStreak: number, currentStreak: number): number | null {
    const milestoneReached = STREAK_MILESTONES.find(
      (m) => previousStreak < m && currentStreak >= m
    );
    return milestoneReached || null;
  }

  return {
    // Store state
    ...streakStore,

    // Computed
    nextMilestone,
    progressToNextMilestone,
    daysUntilNextMilestone,
    achievedMilestones,
    streakStatusMessage,
    streakStatusColor,
    streakIcon,
    canUseFreeFreeze,
    canBuyFreezeWithCoins,
    freezesRemaining,

    // Constants
    freezeCostInCoins,
    freezeCostInXP,
    maxFreezesPerWeek,
    milestones: STREAK_MILESTONES,

    // Helpers
    formatStreakDuration,
    formatRelativeDate,
    getMilestoneMessage,
    isNewMilestone,
  };
}
