/**
 * Quiz Results Composable
 * Handles quiz submission, history, analytics, and retry functionality
 */

import { ref } from "vue";
import { handleApiResponse, getErrorMessage } from "@/utils/apiHelpers";
import type { ExperienceLevel } from "@shared/types/plan";
import type {
  IQuizStats,
  ICategoryPerformance,
  IDifficultyPerformance,
} from "@shared/types/quiz-result";

export interface IQuizAnswer {
  questionId: string;
  userAnswer: string | string[];
  correctAnswer: string | string[];
  isCorrect: boolean;
  timeSpentSeconds: number;
  difficultyLevel: "easy" | "medium" | "hard";
  category: string;
  tags: string[];
  points: number;
  pointsEarned: number;
}

export interface ISubmitQuizPayload {
  quizType: "practice" | "exam" | "retry_wrong" | "review";
  level: ExperienceLevel;
  framework?: "vue" | "react" | "angular" | "nextjs";
  answers: IQuizAnswer[];
  startTime: string;
  endTime: string;
  originalQuizId?: string;
}

export interface ISubmitQuizResponse {
  success: boolean;
  quizResultId: string;
  score: number;
  xpEarned: number;
  xpBreakdown?: Record<string, number>;
  badgesEarned: string[];
  leveledUp?: boolean;
  newLevel?: number;
  weakCategories: string[];
  strongCategories?: string[];
  categoryPerformance?: ICategoryPerformance[];
  difficultyPerformance?: IDifficultyPerformance[];
  streakMaintained: boolean;
}

export interface IQuizResult {
  id: string;
  userId: string;
  quizType: string;
  level: ExperienceLevel;
  framework?: string;
  score: number;
  correctAnswers: number;
  incorrectAnswers: number;
  totalQuestions: number;
  startTime: Date;
  endTime: Date;
  totalTimeSeconds: number;
  xpEarned: number;
  badgesEarned: string[];
  weakCategories: string[];
  createdAt: Date;
}

export interface IWeakArea {
  category: string;
  accuracy: number;
  questionsAttempted: number;
  questionsCorrect: number;
  lastAttemptDate: Date;
}

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
      const response = await fetch("/api/quiz/results/submit", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await handleApiResponse<ISubmitQuizResponse>(response);
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

      const response = await fetch(`/api/quiz/results/history?${params.toString()}`, {
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await handleApiResponse<{
        results: IQuizResult[];
        count: number;
        limit: number;
        offset: number;
      }>(response);

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

      const response = await fetch(`/api/quiz/results/stats?${params.toString()}`, {
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await handleApiResponse<{ stats: IQuizStats }>(response);
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

      const response = await fetch(`/api/quiz/results/weak-areas?${params.toString()}`, {
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await handleApiResponse<{ weakAreas: IWeakArea[]; count: number }>(
        response
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
      const response = await fetch(`/api/quiz/results/${quizId}/wrong-questions`, {
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await handleApiResponse<{ questionIds: string[]; count: number }>(
        response
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
      const response = await fetch(`/api/quiz/results/${quizId}`, {
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await handleApiResponse<{ result: IQuizResult }>(response);
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
