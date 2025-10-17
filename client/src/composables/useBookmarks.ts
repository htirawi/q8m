import { ref, computed, readonly } from "vue";
import { useI18n } from "vue-i18n";

import type { Question } from "@shared/types/quiz";

export type BookmarkedQuestion = Question;

export function useBookmarks() {
  const { t } = useI18n();
  const isLoading = ref(false);
  const error = ref<string | null>(null);
  const bookmarkedQuestions = ref<Set<string>>(new Set());

  // Check if a question is bookmarked
  const isQuestionBookmarked = (questionId: string): boolean => {
    return bookmarkedQuestions.value.has(questionId);
  };

  // Toggle bookmark for a question
  const toggleBookmark = async (questionId: string): Promise<boolean> => {
    try {
      isLoading.value = true;
      error.value = null;

      const response = await fetch("/api/v1/questions/bookmark", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ questionId }),
      });

      if (!response.ok) {
        throw new Error(`Failed to toggle bookmark: ${response.statusText}`);
      }

      const data = await response.json();

      // Update local state
      if (data.isBookmarked) {
        bookmarkedQuestions.value.add(questionId);
      } else {
        bookmarkedQuestions.value.delete(questionId);
      }

      return data.isBookmarked;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : t("bookmarks.error.toggle");
      error.value = errorMessage;
      console.error("Bookmark toggle error:", err);
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  // Check bookmark status for a question
  const checkBookmarkStatus = async (questionId: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/v1/questions/bookmark/${questionId}`, {
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(`Failed to check bookmark status: ${response.statusText}`);
      }

      const data = await response.json();
      return data.isBookmarked;
    } catch (err) {
      console.error("Bookmark status check error:", err);
      return false;
    }
  };

  // Load all bookmarked questions
  const loadBookmarkedQuestions = async (filters?: {
    difficulty?: string;
    framework?: string;
  }): Promise<BookmarkedQuestion[]> => {
    try {
      isLoading.value = true;
      error.value = null;

      const params = new URLSearchParams();
      if (filters?.difficulty) {
        params.append("difficulty", filters.difficulty);
      }
      if (filters?.framework) {
        params.append("framework", filters.framework);
      }

      const response = await fetch(`/api/v1/questions/bookmarked?${params.toString()}`, {
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(`Failed to load bookmarked questions: ${response.statusText}`);
      }

      const data = await response.json();

      // Update local bookmark set
      bookmarkedQuestions.value.clear();
      data.questions.forEach((question: BookmarkedQuestion) => {
        bookmarkedQuestions.value.add(question._id);
      });

      return data.questions || [];
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : t("bookmarks.error.load");
      error.value = errorMessage;
      console.error("Load bookmarked questions error:", err);
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  // Load bookmark statuses for multiple questions
  const loadBookmarkStatuses = async (questionIds: string[]): Promise<Record<string, boolean>> => {
    if (questionIds.length === 0) return {};

    try {
      const response = await fetch("/api/v1/questions/bookmark/batch", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ questionIds }),
      });

      if (!response.ok) {
        throw new Error("Failed to load bookmark statuses");
      }

      const data = await response.json();
      const statusMap = data.statuses || {};

      // Update local bookmark set
      Object.entries(statusMap).forEach(([id, isBookmarked]) => {
        if (isBookmarked) {
          bookmarkedQuestions.value.add(id);
        } else {
          bookmarkedQuestions.value.delete(id);
        }
      });

      return statusMap;
    } catch (err) {
      console.error("Load bookmark statuses error:", err);
      return {};
    }
  };

  // Computed properties
  const bookmarkCount = computed(() => bookmarkedQuestions.value.size);
  const hasBookmarks = computed(() => bookmarkedQuestions.value.size > 0);

  return {
    // State
    isLoading: readonly(isLoading),
    error: readonly(error),
    bookmarkedQuestions: readonly(bookmarkedQuestions),

    // Computed
    bookmarkCount,
    hasBookmarks,

    // Methods
    isQuestionBookmarked,
    toggleBookmark,
    checkBookmarkStatus,
    loadBookmarkedQuestions,
    loadBookmarkStatuses,
  };
}
