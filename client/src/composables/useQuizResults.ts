/**
 * Quiz Results Composable
 * Handles quiz submission, history, analytics, and retry functionality
 */

import { ref } from "vue";
import { httpClient, getErrorMessage } from "@/utils/httpClient";
import { API_ENDPOINTS } from "@/config/api";
import type { ExperienceLevel } from "@shared/types/plan";
import type { ISubmitQuizPayload, ISubmitQuizResponse, IQuizResult, IWeakArea } from '@shared/types/composables';
import type {
  IQuizStats,
} from "@shared/types/quiz-result";
export function useQuizResults() {
  const isLoading = ref(false);
  const error = ref<string | null>(null);
  const quizHistory = ref<IQuizResult[]>([]);
  const quizStats = ref<IQuizStats | null>(null);
  const weakAreas = ref<IWeakArea[]>([]);
  const wrongQuestions = ref<string[]>([]);

  /**
   * Submit quiz results
   */
  async function submitQuiz(
    payload: ISubmitQuizPayload
  ): Promise<ISubmitQuizResponse | null> {
    isLoading.value = true;
    error.value = null;

    try {
      const data = await httpClient.post<ISubmitQuizResponse>(
        API_ENDPOINTS.quizResults.submit(),
        payload
      );
      return data;
    } catch (err) {
      error.value = getErrorMessage(err, "Failed to submit quiz");
      return null;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Get quiz history
   */
  async function getHistory(options: {
    level?: ExperienceLevel;
    limit?: number;
    offset?: number;
  } = {}): Promise<IQuizResult[] | null> {
    isLoading.value = true;
    error.value = null;

    try {
      const params = new URLSearchParams();
      if (options.level) params.append("level", options.level);
      if (options.limit) params.append("limit", String(options.limit));
      if (options.offset) params.append("offset", String(options.offset));

      const data = await httpClient.get<{
        results: IQuizResult[];
        count: number;
        limit: number;
        offset: number;
      }>(API_ENDPOINTS.quizResults.history(params));

      quizHistory.value = data.results;
      return data.results;
    } catch (err) {
      error.value = getErrorMessage(err, "Failed to fetch quiz history");
      return null;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Get quiz statistics
   */
  async function getStats(options: { level?: ExperienceLevel } = {}): Promise<IQuizStats | null> {
    isLoading.value = true;
    error.value = null;

    try {
      const params = new URLSearchParams();
      if (options.level) params.append("level", options.level);

      const data = await httpClient.get<{ stats: IQuizStats }>(
        API_ENDPOINTS.quizResults.stats(params)
      );
      quizStats.value = data.stats;
      return data.stats;
    } catch (err) {
      error.value = getErrorMessage(err, "Failed to fetch quiz statistics");
      return null;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Get weak areas
   */
  async function getWeakAreas(options: {
    level?: ExperienceLevel;
  } = {}): Promise<IWeakArea[] | null> {
    isLoading.value = true;
    error.value = null;

    try {
      const params = new URLSearchParams();
      if (options.level) params.append("level", options.level);

      const data = await httpClient.get<{ weakAreas: IWeakArea[]; count: number }>(
        API_ENDPOINTS.quizResults.weakAreas(params)
      );

      weakAreas.value = data.weakAreas;
      return data.weakAreas;
    } catch (err) {
      error.value = getErrorMessage(err, "Failed to fetch weak areas");
      return null;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Get wrong questions from a quiz for retry
   */
  async function getWrongQuestions(quizId: string): Promise<string[] | null> {
    isLoading.value = true;
    error.value = null;

    try {
      const data = await httpClient.get<{ questionIds: string[]; count: number }>(
        API_ENDPOINTS.quizResults.wrongQuestions(quizId)
      );

      wrongQuestions.value = data.questionIds;
      return data.questionIds;
    } catch (err) {
      error.value = getErrorMessage(err, "Failed to fetch wrong questions");
      return null;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Get specific quiz result details
   */
  async function getQuizResult(quizId: string): Promise<IQuizResult | null> {
    isLoading.value = true;
    error.value = null;

    try {
      const data = await httpClient.get<{ result: IQuizResult }>(
        API_ENDPOINTS.quizResults.byId(quizId)
      );
      return data.result;
    } catch (err) {
      error.value = getErrorMessage(err, "Failed to fetch quiz result");
      return null;
    } finally {
      isLoading.value = false;
    }
  }

  return {
    // State
    isLoading,
    error,
    quizHistory,
    quizStats,
    weakAreas,
    wrongQuestions,

    // Methods
    submitQuiz,
    getHistory,
    getStats,
    getWeakAreas,
    getWrongQuestions,
    getQuizResult,
  };
}
