import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { httpClient, getErrorMessage } from "@/utils/httpClient";
import { useAuthStore } from "./auth";
import { useToast } from "@/composables/useToast";

export interface Discussion {
  _id: string;
  questionId: string;
  userId: {
    _id: string;
    name: string;
    avatar?: string;
    gamification?: {
      level: number;
    };
  };
  content: string;
  parentId?: string;
  likes: string[];
  likesCount: number;
  likedByCurrentUser: boolean;
  isEdited: boolean;
  editedAt?: Date;
  isPinned: boolean;
  isBestAnswer: boolean;
  isReported: boolean;
  reportCount: number;
  createdAt: Date;
  updatedAt: Date;
  replies?: Discussion[];
}

export interface CreateDiscussionDto {
  questionId: string;
  content: string;
  parentId?: string;
}

export interface UpdateDiscussionDto {
  content: string;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  hasMore: boolean;
}

export const useDiscussionsStore = defineStore("discussions", () => {
  const authStore = useAuthStore();
  const toast = useToast();

  // State
  const discussions = ref<Discussion[]>([]);
  const currentQuestionDiscussions = ref<Discussion[]>([]);
  const userDiscussions = ref<Discussion[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const pagination = ref<Pagination>({
    page: 1,
    limit: 20,
    total: 0,
    hasMore: false,
  });

  // Computed
  const discussionCount = computed(() => currentQuestionDiscussions.value.length);
  const totalDiscussions = computed(() => pagination.value.total);
  const hasMoreDiscussions = computed(() => pagination.value.hasMore);
  const pinnedDiscussions = computed(() =>
    currentQuestionDiscussions.value.filter((d) => d.isPinned)
  );
  const bestAnswers = computed(() =>
    currentQuestionDiscussions.value.filter((d) => d.isBestAnswer)
  );

  // API Base URL
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

  /**
   * Get discussions for a specific question
   */
  const getDiscussions = async (
    questionId: string,
    page: number = 1,
    limit: number = 20
  ): Promise<void> => {
    try {
      loading.value = true;
      error.value = null;

      const response = await axios.get(`${API_URL}/api/v1/discussions/${questionId}`, {
        params: { page, limit },
        headers: authStore.token ? { Authorization: `Bearer ${authStore.token}` } : undefined,
      });

      if (response.data.success) {
        if (page === 1) {
          currentQuestionDiscussions.value = response.data.discussions;
        } else {
          currentQuestionDiscussions.value.push(...response.data.discussions);
        }
        pagination.value = response.data.pagination;
      }
    } catch (err: unknown) {
      error.value = getErrorMessage(err, "Failed to load discussions");
      toast.error(error.value);
      console.error("Error fetching discussions:", err);
    } finally {
      loading.value = false;
    }
  };

  /**
   * Create a new discussion or reply
   */
  const createDiscussion = async (data: CreateDiscussionDto): Promise<Discussion | null> => {
    try {
      loading.value = true;
      error.value = null;

      const response = await axios.post(`${API_URL}/api/v1/discussions`, data, {
        headers: {
          Authorization: `Bearer ${authStore.token}`,
        },
      });

      if (response.data.success) {
        const newDiscussion = response.data.discussion;

        // If it's a top-level discussion, add to the list
        if (!data.parentId) {
          currentQuestionDiscussions.value.unshift(newDiscussion);
          pagination.value.total += 1;
        } else {
          // If it's a reply, add to parent's replies
          const parent = findDiscussionById(data.parentId);
          if (parent) {
            if (!parent.replies) {
              parent.replies = [];
            }
            parent.replies.push(newDiscussion);
          }
        }

        toast.success(
          data.parentId ? "Reply posted successfully" : "Discussion created successfully"
        );
        return newDiscussion;
      }

      return null;
    } catch (err: unknown) {
      error.value = getErrorMessage(err, "Failed to create discussion");
      toast.error(error.value);
      console.error("Error creating discussion:", err);
      return null;
    } finally {
      loading.value = false;
    }
  };

  /**
   * Update a discussion
   */
  const updateDiscussion = async (id: string, data: UpdateDiscussionDto): Promise<boolean> => {
    try {
      loading.value = true;
      error.value = null;

      const response = await axios.put(`${API_URL}/api/v1/discussions/${id}`, data, {
        headers: {
          Authorization: `Bearer ${authStore.token}`,
        },
      });

      if (response.data.success) {
        const updated = response.data.discussion;
        updateDiscussionInList(id, updated);
        toast.success("Discussion updated successfully");
        return true;
      }

      return false;
    } catch (err: unknown) {
      error.value = getErrorMessage(err, "Failed to update discussion");
      toast.error(error.value);
      console.error("Error updating discussion:", err);
      return false;
    } finally {
      loading.value = false;
    }
  };

  /**
   * Delete a discussion
   */
  const deleteDiscussion = async (id: string): Promise<boolean> => {
    try {
      loading.value = true;
      error.value = null;

      const response = await axios.delete(`${API_URL}/api/v1/discussions/${id}`, {
        headers: {
          Authorization: `Bearer ${authStore.token}`,
        },
      });

      if (response.data.success) {
        removeDiscussionFromList(id);
        toast.success("Discussion deleted successfully");
        return true;
      }

      return false;
    } catch (err: unknown) {
      error.value = getErrorMessage(err, "Failed to delete discussion");
      toast.error(error.value);
      console.error("Error deleting discussion:", err);
      return false;
    } finally {
      loading.value = false;
    }
  };

  /**
   * Toggle like on a discussion
   */
  const toggleLike = async (id: string): Promise<boolean> => {
    try {
      const response = await axios.post(
        `${API_URL}/api/v1/discussions/${id}/like`,
        {},
        {
          headers: {
            Authorization: `Bearer ${authStore.token}`,
          },
        }
      );

      if (response.data.success) {
        // Update discussion in list
        const discussion = findDiscussionById(id);
        if (discussion) {
          discussion.likesCount = response.data.likesCount;
          discussion.likedByCurrentUser = response.data.likedByCurrentUser;
        }
        return true;
      }

      return false;
    } catch (err: unknown) {
      error.value = getErrorMessage(err, "Failed to toggle like");
      toast.error(error.value);
      console.error("Error toggling like:", err);
      return false;
    }
  };

  /**
   * Pin a discussion (admin only)
   */
  const pinDiscussion = async (id: string): Promise<boolean> => {
    try {
      loading.value = true;
      error.value = null;

      const response = await axios.post(
        `${API_URL}/api/v1/discussions/${id}/pin`,
        {},
        {
          headers: {
            Authorization: `Bearer ${authStore.token}`,
          },
        }
      );

      if (response.data.success) {
        const discussion = findDiscussionById(id);
        if (discussion) {
          discussion.isPinned = response.data.isPinned;
        }
        // Re-sort discussions (pinned first)
        sortDiscussions();
        toast.success(response.data.isPinned ? "Discussion pinned" : "Discussion unpinned");
        return true;
      }

      return false;
    } catch (err: unknown) {
      error.value = getErrorMessage(err, "Failed to pin discussion");
      toast.error(error.value);
      console.error("Error pinning discussion:", err);
      return false;
    } finally {
      loading.value = false;
    }
  };

  /**
   * Mark discussion as best answer
   */
  const markBestAnswer = async (id: string): Promise<boolean> => {
    try {
      loading.value = true;
      error.value = null;

      const response = await axios.post(
        `${API_URL}/api/v1/discussions/${id}/best-answer`,
        {},
        {
          headers: {
            Authorization: `Bearer ${authStore.token}`,
          },
        }
      );

      if (response.data.success) {
        // Unmark all other best answers in current question
        currentQuestionDiscussions.value.forEach((d) => {
          d.isBestAnswer = false;
          d.replies?.forEach((r) => (r.isBestAnswer = false));
        });

        // Mark this one as best answer
        const discussion = findDiscussionById(id);
        if (discussion) {
          discussion.isBestAnswer = response.data.isBestAnswer;
        }

        // Re-sort discussions (best answer at top)
        sortDiscussions();
        toast.success(
          response.data.isBestAnswer ? "Marked as best answer" : "Removed best answer mark"
        );
        return true;
      }

      return false;
    } catch (err: unknown) {
      error.value = getErrorMessage(err, "Failed to mark best answer");
      toast.error(error.value);
      console.error("Error marking best answer:", err);
      return false;
    } finally {
      loading.value = false;
    }
  };

  /**
   * Report a discussion
   */
  const reportDiscussion = async (id: string, reason: string): Promise<boolean> => {
    try {
      loading.value = true;
      error.value = null;

      const response = await axios.post(
        `${API_URL}/api/v1/discussions/${id}/report`,
        { reason },
        {
          headers: {
            Authorization: `Bearer ${authStore.token}`,
          },
        }
      );

      if (response.data.success) {
        const discussion = findDiscussionById(id);
        if (discussion) {
          discussion.reportCount = response.data.reportCount;
          discussion.isReported = response.data.isReported;
        }
        toast.success("Discussion reported successfully");
        return true;
      }

      return false;
    } catch (err: unknown) {
      error.value = getErrorMessage(err, "Failed to report discussion");
      toast.error(error.value);
      console.error("Error reporting discussion:", err);
      return false;
    } finally {
      loading.value = false;
    }
  };

  /**
   * Get discussions by a specific user
   */
  const getUserDiscussions = async (
    userId: string,
    page: number = 1,
    limit: number = 20
  ): Promise<void> => {
    try {
      loading.value = true;
      error.value = null;

      const response = await axios.get(`${API_URL}/api/v1/discussions/user/${userId}`, {
        params: { page, limit },
      });

      if (response.data.success) {
        if (page === 1) {
          userDiscussions.value = response.data.discussions;
        } else {
          userDiscussions.value.push(...response.data.discussions);
        }
        pagination.value = response.data.pagination;
      }
    } catch (err: unknown) {
      error.value = getErrorMessage(err, "Failed to load user discussions");
      toast.error(error.value);
      console.error("Error fetching user discussions:", err);
    } finally {
      loading.value = false;
    }
  };

  /**
   * Load more discussions (pagination)
   */
  const loadMoreDiscussions = async (questionId: string): Promise<void> => {
    if (!hasMoreDiscussions.value || loading.value) return;

    const nextPage = pagination.value.page + 1;
    await getDiscussions(questionId, nextPage, pagination.value.limit);
  };

  /**
   * Clear current question discussions
   */
  const clearCurrentDiscussions = (): void => {
    currentQuestionDiscussions.value = [];
    pagination.value = {
      page: 1,
      limit: 20,
      total: 0,
      hasMore: false,
    };
  };

  /**
   * Clear user discussions
   */
  const clearUserDiscussions = (): void => {
    userDiscussions.value = [];
  };

  /**
   * Find discussion by ID (searches in current discussions and replies)
   */
  const findDiscussionById = (id: string): Discussion | null => {
    for (const discussion of currentQuestionDiscussions.value) {
      if (discussion._id === id) return discussion;

      if (discussion.replies) {
        const reply = discussion.replies.find((r) => r._id === id);
        if (reply) return reply;
      }
    }
    return null;
  };

  /**
   * Update discussion in list
   */
  const updateDiscussionInList = (id: string, updated: Discussion): void => {
    const index = currentQuestionDiscussions.value.findIndex((d) => d._id === id);
    if (index !== -1) {
      currentQuestionDiscussions.value[index] = {
        ...currentQuestionDiscussions.value[index],
        ...updated,
      };
    } else {
      // Check in replies
      for (const discussion of currentQuestionDiscussions.value) {
        if (discussion.replies) {
          const replyIndex = discussion.replies.findIndex((r) => r._id === id);
          if (replyIndex !== -1) {
            discussion.replies[replyIndex] = {
              ...discussion.replies[replyIndex],
              ...updated,
            };
            break;
          }
        }
      }
    }
  };

  /**
   * Remove discussion from list
   */
  const removeDiscussionFromList = (id: string): void => {
    const index = currentQuestionDiscussions.value.findIndex((d) => d._id === id);
    if (index !== -1) {
      currentQuestionDiscussions.value.splice(index, 1);
      pagination.value.total -= 1;
    } else {
      // Check in replies
      for (const discussion of currentQuestionDiscussions.value) {
        if (discussion.replies) {
          const replyIndex = discussion.replies.findIndex((r) => r._id === id);
          if (replyIndex !== -1) {
            discussion.replies.splice(replyIndex, 1);
            break;
          }
        }
      }
    }
  };

  /**
   * Sort discussions (pinned first, then best answer, then by date)
   */
  const sortDiscussions = (): void => {
    currentQuestionDiscussions.value.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      if (a.isBestAnswer && !b.isBestAnswer) return -1;
      if (!a.isBestAnswer && b.isBestAnswer) return 1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  };

  return {
    // State
    discussions,
    currentQuestionDiscussions,
    userDiscussions,
    loading,
    error,
    pagination,

    // Computed
    discussionCount,
    totalDiscussions,
    hasMoreDiscussions,
    pinnedDiscussions,
    bestAnswers,

    // Actions
    getDiscussions,
    createDiscussion,
    updateDiscussion,
    deleteDiscussion,
    toggleLike,
    pinDiscussion,
    markBestAnswer,
    reportDiscussion,
    getUserDiscussions,
    loadMoreDiscussions,
    clearCurrentDiscussions,
    clearUserDiscussions,
    findDiscussionById,
  };
});
