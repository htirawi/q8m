import { computed } from "vue";
import { useChallengesStore } from "@/stores/challenges";
import type { Challenge, CreateChallengeData, SubmitChallengeData } from "@/stores/challenges";
import { useAuthStore } from "@/stores/auth";

/**
 * Composable for managing quiz challenges
 * Provides methods for creating, accepting, and completing challenges
 */
export const useChallenges = () => {
  const store = useChallengesStore();
  const authStore = useAuthStore();

  // State
  const challenges = computed(() => store.challenges);
  const challengeDetails = computed(() => store.challengeDetails);
  const stats = computed(() => store.stats);
  const loading = computed(() => store.loading);
  const error = computed(() => store.error);
  const pagination = computed(() => store.pagination);

  // Computed
  const pendingChallenges = computed(() => store.pendingChallenges);
  const activeChallenges = computed(() => store.activeChallenges);
  const completedChallenges = computed(() => store.completedChallenges);
  const receivedChallenges = computed(() => store.receivedChallenges);
  const sentChallenges = computed(() => store.sentChallenges);
  const winRate = computed(() => store.winRate);

  const hasPendingChallenges = computed(() => pendingChallenges.value.length > 0);
  const hasActiveChallenges = computed(() => activeChallenges.value.length > 0);
  const hasCompletedChallenges = computed(() => completedChallenges.value.length > 0);
  const hasChallenges = computed(() => challenges.value.length > 0);

  /**
   * Load all challenges
   */
  const loadChallenges = async (
    status?: string,
    page: number = 1,
    limit: number = 20
  ): Promise<void> => {
    await store.getChallenges(status, page, limit);
  };

  /**
   * Load challenge details
   */
  const loadChallengeDetails = async (challengeId: string): Promise<Challenge | null> => {
    return await store.getChallengeDetails(challengeId);
  };

  /**
   * Create a new challenge
   */
  const createChallenge = async (data: CreateChallengeData): Promise<boolean> => {
    return await store.createChallenge(data);
  };

  /**
   * Accept a challenge
   */
  const acceptChallenge = async (challengeId: string): Promise<boolean> => {
    return await store.acceptChallenge(challengeId);
  };

  /**
   * Reject a challenge
   */
  const rejectChallenge = async (challengeId: string): Promise<boolean> => {
    return await store.rejectChallenge(challengeId);
  };

  /**
   * Submit challenge results
   */
  const submitResults = async (
    challengeId: string,
    data: SubmitChallengeData
  ): Promise<boolean> => {
    return await store.submitChallengeResults(challengeId, data);
  };

  /**
   * Load challenge stats
   */
  const loadStats = async (): Promise<void> => {
    await store.getChallengeStats();
  };

  /**
   * Load more challenges
   */
  const loadMore = async (status?: string): Promise<void> => {
    await store.loadMoreChallenges(status);
  };

  /**
   * Refresh challenges
   */
  const refresh = async (status?: string): Promise<void> => {
    await store.refreshChallenges(status);
  };

  /**
   * Clear challenge details
   */
  const clearDetails = (): void => {
    store.clearChallengeDetails();
  };

  /**
   * Check if user is the challenger
   */
  const isChallenger = (challenge: Challenge): boolean => {
    const userId = authStore.user?._id;
    const challengerId =
      typeof challenge.challengerId === "string"
        ? challenge.challengerId
        : challenge.challengerId._id;
    return challengerId === userId;
  };

  /**
   * Check if user is the challenged user
   */
  const isChallenged = (challenge: Challenge): boolean => {
    const userId = authStore.user?._id;
    if (!challenge.challengedUserId) return false;
    const challengedUserId =
      typeof challenge.challengedUserId === "string"
        ? challenge.challengedUserId
        : challenge.challengedUserId._id;
    return challengedUserId === userId;
  };

  /**
   * Check if user has submitted results
   */
  const hasUserSubmitted = (challenge: Challenge): boolean => {
    if (isChallenger(challenge)) {
      return challenge.challengerScore !== undefined;
    }
    if (isChallenged(challenge)) {
      return challenge.challengedScore !== undefined;
    }
    return false;
  };

  /**
   * Check if user won the challenge
   */
  const isWinner = (challenge: Challenge): boolean => {
    const userId = authStore.user?._id;
    return challenge.winnerId === userId;
  };

  /**
   * Get opponent for a challenge
   */
  const getOpponent = (challenge: Challenge) => {
    return isChallenger(challenge) ? challenge.challengedUserId : challenge.challengerId;
  };

  /**
   * Get user's score for a challenge
   */
  const getUserScore = (challenge: Challenge): number | undefined => {
    return isChallenger(challenge) ? challenge.challengerScore : challenge.challengedScore;
  };

  /**
   * Get opponent's score for a challenge
   */
  const getOpponentScore = (challenge: Challenge): number | undefined => {
    return isChallenger(challenge) ? challenge.challengedScore : challenge.challengerScore;
  };

  /**
   * Get difficulty color class
   */
  const getDifficultyColor = (difficulty: string): string => {
    switch (difficulty) {
      case "easy":
        return "text-green-500 bg-green-500/10";
      case "medium":
        return "text-yellow-500 bg-yellow-500/10";
      case "hard":
        return "text-red-500 bg-red-500/10";
      default:
        return "text-gray-500 bg-gray-500/10";
    }
  };

  /**
   * Get difficulty badge emoji
   */
  const getDifficultyBadge = (difficulty: string): string => {
    switch (difficulty) {
      case "easy":
        return "🟢";
      case "medium":
        return "🟡";
      case "hard":
        return "🔴";
      default:
        return "⚪";
    }
  };

  /**
   * Get status color class
   */
  const getStatusColor = (status: string): string => {
    switch (status) {
      case "pending":
        return "text-yellow-500 bg-yellow-500/10";
      case "accepted":
        return "text-blue-500 bg-blue-500/10";
      case "completed":
        return "text-green-500 bg-green-500/10";
      case "rejected":
        return "text-red-500 bg-red-500/10";
      case "expired":
        return "text-gray-500 bg-gray-500/10";
      default:
        return "text-gray-500 bg-gray-500/10";
    }
  };

  /**
   * Get status badge emoji
   */
  const getStatusBadge = (status: string): string => {
    switch (status) {
      case "pending":
        return "⏳";
      case "accepted":
        return "🎮";
      case "completed":
        return "✅";
      case "rejected":
        return "❌";
      case "expired":
        return "⌛";
      default:
        return "❓";
    }
  };

  /**
   * Get framework badge emoji
   */
  const getFrameworkBadge = (framework?: string): string => {
    switch (framework) {
      case "angular":
        return "🅰️";
      case "react":
        return "⚛️";
      case "nextjs":
        return "▲";
      case "redux":
        return "🔄";
      case "random":
        return "🎲";
      default:
        return "📚";
    }
  };

  /**
   * Format time in seconds to readable string
   */
  const formatTime = (seconds?: number): string => {
    if (seconds === undefined) return "--";

    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    }
    if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    }
    return `${secs}s`;
  };

  /**
   * Format score with percentage
   */
  const formatScore = (score?: number): string => {
    if (score === undefined) return "--";
    return `${score.toFixed(1)}%`;
  };

  /**
   * Get result message for a challenge
   */
  const getResultMessage = (challenge: Challenge): string => {
    if (challenge.status !== "completed") return "";

    const userId = authStore.user?._id;

    if (challenge.isTie) {
      return "It's a tie! 🤝";
    }

    if (challenge.winnerId === userId) {
      return "You won! 🎉";
    }

    return "You lost 😔";
  };

  /**
   * Get result color class
   */
  const getResultColor = (challenge: Challenge): string => {
    if (challenge.status !== "completed") return "text-gray-500";

    const userId = authStore.user?._id;

    if (challenge.isTie) {
      return "text-yellow-500";
    }

    if (challenge.winnerId === userId) {
      return "text-green-500";
    }

    return "text-red-500";
  };

  /**
   * Check if challenge is expired
   */
  const isExpired = (challenge: Challenge): boolean => {
    const now = new Date();
    const expiresAt = new Date(challenge.expiresAt);
    return now > expiresAt && challenge.status !== "completed";
  };

  /**
   * Get time remaining for a challenge
   */
  const getTimeRemaining = (challenge: Challenge): string => {
    const now = new Date();
    const expiresAt = new Date(challenge.expiresAt);
    const diff = expiresAt.getTime() - now.getTime();

    if (diff <= 0) return "Expired";

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `${days}d ${hours % 24}h`;
    }

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }

    return `${minutes}m`;
  };

  /**
   * Format date to relative time
   */
  const formatDate = (date: Date): string => {
    const now = new Date();
    const diffMs = now.getTime() - new Date(date).getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHr = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHr / 24);

    if (diffSec < 60) return "just now";
    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffHr < 24) return `${diffHr}h ago`;
    if (diffDay < 7) return `${diffDay}d ago`;
    if (diffDay < 30) return `${Math.floor(diffDay / 7)}w ago`;
    if (diffDay < 365) return `${Math.floor(diffDay / 30)}mo ago`;
    return `${Math.floor(diffDay / 365)}y ago`;
  };

  /**
   * Get level color for display
   */
  const getLevelColor = (level: number): string => {
    if (level >= 40) return "text-purple-500";
    if (level >= 30) return "text-yellow-500";
    if (level >= 20) return "text-blue-500";
    if (level >= 10) return "text-green-500";
    return "text-gray-500";
  };

  /**
   * Get level badge emoji
   */
  const getLevelBadge = (level: number): string => {
    if (level >= 40) return "👑";
    if (level >= 30) return "⭐";
    if (level >= 20) return "🎯";
    if (level >= 10) return "🔰";
    return "🌱";
  };

  /**
   * Validate challenge creation data
   */
  const validateChallengeData = (data: CreateChallengeData): { valid: boolean; error?: string } => {
    if (!data.challengedUserId) {
      return { valid: false, error: "Opponent is required" };
    }

    if (!data.difficulty) {
      return { valid: false, error: "Difficulty is required" };
    }

    if (!data.questionCount || data.questionCount < 1 || data.questionCount > 20) {
      return { valid: false, error: "Question count must be between 1 and 20" };
    }

    if (!data.timeLimit || data.timeLimit < 60 || data.timeLimit > 3600) {
      return { valid: false, error: "Time limit must be between 1 and 60 minutes" };
    }

    if (data.message && data.message.length > 200) {
      return { valid: false, error: "Message must be less than 200 characters" };
    }

    return { valid: true };
  };

  /**
   * Sort challenges by different criteria
   */
  const sortChallenges = (
    challengesList: Challenge[],
    sortBy: "date" | "difficulty" | "score"
  ): Challenge[] => {
    const sorted = [...challengesList];
    const difficultyOrder: Record<string, number> = { easy: 1, medium: 2, hard: 3 };

    switch (sortBy) {
      case "date":
        return sorted.sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      case "difficulty":
        return sorted.sort((a, b) => (difficultyOrder[b.difficulty] ?? 0) - (difficultyOrder[a.difficulty] ?? 0));
      case "score":
        return sorted.sort((a, b) => {
          const scoreA = getUserScore(a) || 0;
          const scoreB = getUserScore(b) || 0;
          return scoreB - scoreA;
        });
      default:
        return sorted;
    }
  };

  /**
   * Filter challenges by criteria
   */
  const filterChallenges = (
    challengesList: Challenge[],
    filter: {
      difficulty?: string;
      framework?: string;
      status?: string;
    }
  ): Challenge[] => {
    return challengesList.filter((challenge) => {
      if (filter.difficulty && challenge.difficulty !== filter.difficulty) {
        return false;
      }
      if (filter.framework && challenge.framework !== filter.framework) {
        return false;
      }
      if (filter.status && challenge.status !== filter.status) {
        return false;
      }
      return true;
    });
  };

  /**
   * Get challenge statistics summary
   */
  const getStatsSummary = () => {
    return {
      total: stats.value.totalChallenges,
      wins: stats.value.wins,
      losses: stats.value.losses,
      ties: stats.value.ties,
      winRate: winRate.value,
      avgScore: stats.value.averageScore,
      bestScore: stats.value.bestScore,
    };
  };

  /**
   * Get performance rating based on win rate
   */
  const getPerformanceRating = (): string => {
    const rate = winRate.value;
    if (rate >= 80) return "Elite";
    if (rate >= 60) return "Advanced";
    if (rate >= 40) return "Intermediate";
    if (rate >= 20) return "Novice";
    return "Beginner";
  };

  /**
   * Get performance color
   */
  const getPerformanceColor = (): string => {
    const rate = winRate.value;
    if (rate >= 80) return "text-purple-500";
    if (rate >= 60) return "text-blue-500";
    if (rate >= 40) return "text-green-500";
    if (rate >= 20) return "text-yellow-500";
    return "text-gray-500";
  };

  /**
   * Calculate accuracy from answers
   */
  const calculateAccuracy = (
    answers: Array<{
      questionId: string;
      answer: string | string[];
      correct: boolean;
      timeSpent: number;
    }>
  ): number => {
    if (!answers || answers.length === 0) return 0;
    const correct = answers.filter((a) => a.correct).length;
    return (correct / answers.length) * 100;
  };

  return {
    // State
    challenges,
    challengeDetails,
    stats,
    loading,
    error,
    pagination,

    // Computed
    pendingChallenges,
    activeChallenges,
    completedChallenges,
    receivedChallenges,
    sentChallenges,
    winRate,
    hasPendingChallenges,
    hasActiveChallenges,
    hasCompletedChallenges,
    hasChallenges,

    // Actions
    loadChallenges,
    loadChallengeDetails,
    createChallenge,
    acceptChallenge,
    rejectChallenge,
    submitResults,
    loadStats,
    loadMore,
    refresh,
    clearDetails,

    // Helpers
    isChallenger,
    isChallenged,
    hasUserSubmitted,
    isWinner,
    getOpponent,
    getUserScore,
    getOpponentScore,
    getDifficultyColor,
    getDifficultyBadge,
    getStatusColor,
    getStatusBadge,
    getFrameworkBadge,
    formatTime,
    formatScore,
    getResultMessage,
    getResultColor,
    isExpired,
    getTimeRemaining,
    formatDate,
    getLevelColor,
    getLevelBadge,
    validateChallengeData,
    sortChallenges,
    filterChallenges,
    getStatsSummary,
    getPerformanceRating,
    getPerformanceColor,
    calculateAccuracy,
  };
};

export type UseChallengesReturn = ReturnType<typeof useChallenges>;
