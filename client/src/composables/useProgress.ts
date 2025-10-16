/**
 * Progress Tracking Composable
 * Handles user progress, mastery tracking, and study sessions
 */

import { ref } from "vue";
import { httpClient, getErrorMessage } from "@/utils/httpClient";
import { API_ENDPOINTS } from "@/config/api";
import type { Question } from "@shared/types/quiz";
import type {
  IProgressWithMastery,
  IProgressStats,
  IUpdateQuestionProgressPayload,
  IUpdateQuestionProgressResponse,
  ICompleteSessionPayload,
  ICompleteSessionResponse,
} from "@shared/types/composables";

export function useProgress() {
  const isLoading = ref(false);
  const error = ref<string | null>(null);
  const progress = ref<IProgressWithMastery | null>(null);
  const stats = ref<IProgressStats | null>(null);

  /**
   * Get user progress with mastery stats
   */
  async function getProgress(): Promise<IProgressWithMastery | null> {
    isLoading.value = true;
    error.value = null;

    try {
      const data = await httpClient.get<{ progress: IProgressWithMastery }>(
        API_ENDPOINTS.progress.get()
      );
      progress.value = data.progress;
      return data.progress;
    } catch (err) {
      error.value = getErrorMessage(err, "Failed to fetch progress");
      return null;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Update progress for a specific question after answering
   */
  async function updateQuestionProgress(
    questionId: string,
    payload: IUpdateQuestionProgressPayload
  ): Promise<IUpdateQuestionProgressResponse | null> {
    isLoading.value = true;
    error.value = null;

    try {
      const data = await httpClient.post<IUpdateQuestionProgressResponse>(
        API_ENDPOINTS.progress.question(questionId),
        payload
      );
      return data;
    } catch (err) {
      error.value = getErrorMessage(err, "Failed to update question progress");
      return null;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Get next question(s) using adaptive algorithm
   */
  async function getNextQuestions(
    options: {
      difficulty?: "easy" | "medium" | "hard";
      category?: string;
      count?: number;
    } = {}
  ): Promise<Question[] | null> {
    isLoading.value = true;
    error.value = null;

    try {
      const params = new URLSearchParams();
      if (options.difficulty) params.append("difficulty", options.difficulty);
      if (options.category) params.append("category", options.category);
      if (options.count) params.append("count", String(options.count));

      const data = await httpClient.get<{ questions: Question[]; count: number }>(
        API_ENDPOINTS.progress.nextQuestion(params)
      );
      return data.questions;
    } catch (err) {
      error.value = getErrorMessage(err, "Failed to get next questions");
      return null;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Complete study session and calculate rewards
   */
  async function completeSession(
    payload: ICompleteSessionPayload
  ): Promise<ICompleteSessionResponse | null> {
    isLoading.value = true;
    error.value = null;

    try {
      const data = await httpClient.post<ICompleteSessionResponse>(
        API_ENDPOINTS.progress.sessionComplete(),
        payload
      );
      return data;
    } catch (err) {
      error.value = getErrorMessage(err, "Failed to complete session");
      return null;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Get detailed study statistics
   */
  async function getStats(): Promise<IProgressStats | null> {
    isLoading.value = true;
    error.value = null;

    try {
      const data = await httpClient.get<{ stats: IProgressStats }>(API_ENDPOINTS.progress.stats());
      stats.value = data.stats;
      return data.stats;
    } catch (err) {
      error.value = getErrorMessage(err, "Failed to fetch statistics");
      return null;
    } finally {
      isLoading.value = false;
    }
  }

  return {
    // State
    isLoading,
    error,
    progress,
    stats,

    // Methods
    getProgress,
    updateQuestionProgress,
    getNextQuestions,
    completeSession,
    getStats,
  };
}
