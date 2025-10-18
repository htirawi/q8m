import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { httpClient, getErrorMessage as extractErrorMessage } from "@/utils/httpClient";
import { useAuthStore } from "./auth";
import { useToast } from "@/composables/useToast";
import type {
  Challenge,
  ChallengeStats,
  CreateChallengeData,
  SubmitChallengeData,
  Pagination,
} from "@shared/types/challenges";

// Re-export types for use in other modules
export type {
  Challenge,
  ChallengeStats,
  CreateChallengeData,
  SubmitChallengeData,
  Pagination,
} from "@shared/types/challenges";

// Helper to extract error message
function getErrorMessage(error: unknown, defaultMessage: string): string {
  return extractErrorMessage(error) || defaultMessage;
}

export const useChallengesStore = defineStore("challenges", () => {
  const authStore = useAuthStore();
  const toast = useToast();

  // State
  const challenges = ref<Challenge[]>([]);
  const challengeDetails = ref<Challenge | null>(null);
  const stats = ref<ChallengeStats>({
    total: 0,
    totalChallenges: 0,
    won: 0,
    wins: 0,
    lost: 0,
    losses: 0,
    ties: 0,
    winRate: 0,
    averageScore: 0,
    bestScore: 0,
  });
  const loading = ref(false);
  const error = ref<string | null>(null);
  const pagination = ref<Pagination>({
    page: 1,
    limit: 20,
    total: 0,
    hasMore: false,
  });

  // Computed
  const pendingChallenges = computed(() => challenges.value.filter((c) => c.status === "pending"));

  const activeChallenges = computed(() =>
    challenges.value.filter((c) => c.status === "in-progress")
  );

  const completedChallenges = computed(() =>
    challenges.value.filter((c) => c.status === "completed")
  );

  const receivedChallenges = computed(() => {
    const userId = authStore.user?._id;
    return pendingChallenges.value.filter((c) => {
      if (!c.challengedUserId) return false;
      const challengedId =
        typeof c.challengedUserId === "string" ? c.challengedUserId : c.challengedUserId._id;
      return challengedId === userId;
    });
  });

  const sentChallenges = computed(() => {
    const userId = authStore.user?._id;
    return pendingChallenges.value.filter((c) => {
      const challengerId = typeof c.challengerId === "string" ? c.challengerId : c.challengerId._id;
      return challengerId === userId;
    });
  });

  const winRate = computed(() => {
    if (stats.value.totalChallenges === 0) return 0;
    return (stats.value.wins / stats.value.totalChallenges) * 100;
  });

  // API Base URL
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

  /**
   * Get all challenges
   */
  const getChallenges = async (
    status?: string,
    page: number = 1,
    limit: number = 20
  ): Promise<void> => {
    try {
      loading.value = true;
      error.value = null;

      const params = new URLSearchParams();
      if (status) params.append("status", status);
      params.append("page", page.toString());
      params.append("limit", limit.toString());

      const url = `${API_URL}/api/v1/challenges?${params.toString()}`;
      const data = await httpClient.get<{
        success: boolean;
        challenges: Challenge[];
        pagination: Pagination;
      }>(url, { requireAuth: true });

      if (data.success) {
        if (page === 1) {
          challenges.value = data.challenges;
        } else {
          challenges.value.push(...data.challenges);
        }
        pagination.value = data.pagination;
      }
    } catch (err: unknown) {
      error.value = getErrorMessage(err, "Failed to load challenges");
      toast.error("Error", error.value);
      console.error("Error fetching challenges:", err);
    } finally {
      loading.value = false;
    }
  };

  /**
   * Get challenge details
   */
  const getChallengeDetails = async (challengeId: string): Promise<Challenge | null> => {
    try {
      loading.value = true;
      error.value = null;

      const data = await httpClient.get<{ success: boolean; challenge: Challenge }>(
        `${API_URL}/api/v1/challenges/${challengeId}`,
        { requireAuth: true }
      );

      if (data.success) {
        challengeDetails.value = data.challenge;
        return data.challenge;
      }

      return null;
    } catch (err: unknown) {
      error.value = getErrorMessage(err, "Failed to load challenge details");
      toast.error("Error", error.value);
      console.error("Error fetching challenge details:", err);
      return null;
    } finally {
      loading.value = false;
    }
  };

  /**
   * Create a challenge
   */
  const createChallenge = async (data: CreateChallengeData): Promise<boolean> => {
    try {
      loading.value = true;
      error.value = null;

      const result = await httpClient.post<{ success: boolean; challenge: Challenge }>(
        `${API_URL}/api/v1/challenges`,
        data,
        { requireAuth: true }
      );

      if (result.success) {
        toast.success("Challenge sent successfully!");
        // Add to challenges list
        challenges.value.unshift(result.challenge);
        return true;
      }

      return false;
    } catch (err: unknown) {
      error.value = getErrorMessage(err, "Failed to create challenge");
      toast.error("Error", error.value);
      console.error("Error creating challenge:", err);
      return false;
    } finally {
      loading.value = false;
    }
  };

  /**
   * Accept a challenge
   */
  const acceptChallenge = async (challengeId: string): Promise<boolean> => {
    try {
      loading.value = true;
      error.value = null;

      const result = await httpClient.put<{ success: boolean; challenge: Challenge }>(
        `${API_URL}/api/v1/challenges/${challengeId}/accept`,
        {},
        { requireAuth: true }
      );

      if (result.success) {
        toast.success("Challenge accepted!");

        // Update challenge in list
        const index = challenges.value.findIndex((c) => c._id === challengeId);
        if (index !== -1) {
          challenges.value[index] = result.challenge;
        }

        return true;
      }

      return false;
    } catch (err: unknown) {
      error.value = getErrorMessage(err, "Failed to accept challenge");
      toast.error("Error", error.value);
      console.error("Error accepting challenge:", err);
      return false;
    } finally {
      loading.value = false;
    }
  };

  /**
   * Reject a challenge
   */
  const rejectChallenge = async (challengeId: string): Promise<boolean> => {
    try {
      loading.value = true;
      error.value = null;

      const result = await httpClient.put<{ success: boolean }>(
        `${API_URL}/api/v1/challenges/${challengeId}/reject`,
        {},
        { requireAuth: true }
      );

      if (result.success) {
        toast.success("Challenge rejected");

        // Remove from challenges list
        challenges.value = challenges.value.filter((c) => c._id !== challengeId);

        return true;
      }

      return false;
    } catch (err: unknown) {
      error.value = getErrorMessage(err, "Failed to reject challenge");
      toast.error("Error", error.value);
      console.error("Error rejecting challenge:", err);
      return false;
    } finally {
      loading.value = false;
    }
  };

  /**
   * Submit challenge results
   */
  const submitChallengeResults = async (
    challengeId: string,
    data: SubmitChallengeData
  ): Promise<boolean> => {
    try {
      loading.value = true;
      error.value = null;

      const result = await httpClient.post<{ success: boolean; challenge: Challenge }>(
        `${API_URL}/api/v1/challenges/${challengeId}/submit`,
        data,
        { requireAuth: true }
      );

      if (result.success) {
        const { challenge } = result;

        // Check if challenge is completed
        if (challenge.status === "completed") {
          const userId = authStore.user?._id;
          const isWinner = challenge.winnerId === userId;
          const { isTie } = challenge;

          if (isTie) {
            toast.success("It's a tie! Great job!");
          } else if (isWinner) {
            toast.success("Congratulations! You won the challenge!");
          } else {
            toast.info("Challenge completed. Better luck next time!");
          }
        } else {
          toast.success("Results submitted! Waiting for opponent...");
        }

        // Update challenge in list
        const index = challenges.value.findIndex((c) => c._id === challengeId);
        if (index !== -1) {
          challenges.value[index] = challenge;
        }

        return true;
      }

      return false;
    } catch (err: unknown) {
      error.value = getErrorMessage(err, "Failed to submit results");
      toast.error("Error", error.value);
      console.error("Error submitting results:", err);
      return false;
    } finally {
      loading.value = false;
    }
  };

  /**
   * Get challenge stats
   */
  const getChallengeStats = async (): Promise<void> => {
    try {
      loading.value = true;
      error.value = null;

      const result = await httpClient.get<{ success: boolean; stats: ChallengeStats }>(
        `${API_URL}/api/v1/challenges/history/stats`,
        { requireAuth: true }
      );

      if (result.success) {
        stats.value = result.stats;
      }
    } catch (err: unknown) {
      error.value = getErrorMessage(err, "Failed to load stats");
      console.error("Error fetching stats:", err);
    } finally {
      loading.value = false;
    }
  };

  /**
   * Load more challenges
   */
  const loadMoreChallenges = async (status?: string): Promise<void> => {
    if (!pagination.value.hasMore || loading.value) return;

    const nextPage = pagination.value.page + 1;
    await getChallenges(status, nextPage, pagination.value.limit);
  };

  /**
   * Refresh challenges
   */
  const refreshChallenges = async (status?: string): Promise<void> => {
    await getChallenges(status, 1, pagination.value.limit);
  };

  /**
   * Clear challenge details
   */
  const clearChallengeDetails = (): void => {
    challengeDetails.value = null;
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

    // Actions
    getChallenges,
    getChallengeDetails,
    createChallenge,
    acceptChallenge,
    rejectChallenge,
    submitChallengeResults,
    getChallengeStats,
    loadMoreChallenges,
    refreshChallenges,
    clearChallengeDetails,
  };
});
