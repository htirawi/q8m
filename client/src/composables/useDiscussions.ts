import { computed } from "vue";
import { useDiscussionsStore } from "@/stores/discussions";
import type { Discussion } from "@/stores/discussions";

/**
 * Composable for managing question discussions
 * Provides methods for CRUD operations, likes, reports, and moderation
 */
export const useDiscussions = () => {
  const store = useDiscussionsStore();

  // State
  const discussions = computed(() => store.currentQuestionDiscussions);
  const userDiscussions = computed(() => store.userDiscussions);
  const loading = computed(() => store.loading);
  const error = computed(() => store.error);
  const pagination = computed(() => store.pagination);

  // Computed
  const discussionCount = computed(() => store.discussionCount);
  const totalDiscussions = computed(() => store.totalDiscussions);
  const hasMore = computed(() => store.hasMoreDiscussions);
  const pinnedDiscussions = computed(() => store.pinnedDiscussions);
  const bestAnswers = computed(() => store.bestAnswers);

  /**
   * Load discussions for a question
   */
  const loadDiscussions = async (
    questionId: string,
    page: number = 1,
    limit: number = 20
  ): Promise<void> => {
    await store.getDiscussions(questionId, page, limit);
  };

  /**
   * Load more discussions (pagination)
   */
  const loadMore = async (questionId: string): Promise<void> => {
    await store.loadMoreDiscussions(questionId);
  };

  /**
   * Create a new top-level discussion
   */
  const createDiscussion = async (
    questionId: string,
    content: string
  ): Promise<Discussion | null> => {
    return await store.createDiscussion({ questionId, content });
  };

  /**
   * Create a reply to an existing discussion
   */
  const createReply = async (
    questionId: string,
    parentId: string,
    content: string
  ): Promise<Discussion | null> => {
    return await store.createDiscussion({ questionId, content, parentId });
  };

  /**
   * Edit a discussion
   */
  const editDiscussion = async (id: string, content: string): Promise<boolean> => {
    return await store.updateDiscussion(id, { content });
  };

  /**
   * Delete a discussion
   */
  const removeDiscussion = async (id: string): Promise<boolean> => {
    return await store.deleteDiscussion(id);
  };

  /**
   * Toggle like on a discussion
   */
  const likeDiscussion = async (id: string): Promise<boolean> => {
    return await store.toggleLike(id);
  };

  /**
   * Pin a discussion (admin only)
   */
  const pin = async (id: string): Promise<boolean> => {
    return await store.pinDiscussion(id);
  };

  /**
   * Mark as best answer
   */
  const setBestAnswer = async (id: string): Promise<boolean> => {
    return await store.markBestAnswer(id);
  };

  /**
   * Report a discussion
   */
  const report = async (id: string, reason: string): Promise<boolean> => {
    return await store.reportDiscussion(id, reason);
  };

  /**
   * Load discussions by a specific user
   */
  const loadUserDiscussions = async (
    userId: string,
    page: number = 1,
    limit: number = 20
  ): Promise<void> => {
    await store.getUserDiscussions(userId, page, limit);
  };

  /**
   * Clear current question discussions
   */
  const clear = (): void => {
    store.clearCurrentDiscussions();
  };

  /**
   * Clear user discussions
   */
  const clearUser = (): void => {
    store.clearUserDiscussions();
  };

  /**
   * Find a discussion by ID
   */
  const findById = (id: string): Discussion | null => {
    return store.findDiscussionById(id);
  };

  /**
   * Check if user is the author of a discussion
   */
  const isAuthor = (discussion: Discussion, userId?: string): boolean => {
    if (!userId) return false;
    return discussion.userId._id === userId;
  };

  /**
   * Check if user can edit a discussion
   */
  const canEdit = (discussion: Discussion, userId?: string, userRole?: string): boolean => {
    if (!userId) return false;
    return isAuthor(discussion, userId) || userRole === "admin";
  };

  /**
   * Check if user can delete a discussion
   */
  const canDelete = (discussion: Discussion, userId?: string, userRole?: string): boolean => {
    if (!userId) return false;
    return isAuthor(discussion, userId) || userRole === "admin";
  };

  /**
   * Check if user can pin a discussion
   */
  const canPin = (userRole?: string): boolean => {
    return userRole === "admin";
  };

  /**
   * Check if user can mark best answer
   */
  const canMarkBestAnswer = (
    questionCreatorId?: string,
    userId?: string,
    userRole?: string
  ): boolean => {
    if (!userId) return false;
    return questionCreatorId === userId || userRole === "admin";
  };

  /**
   * Get reply count for a discussion
   */
  const getReplyCount = (discussion: Discussion): number => {
    return discussion.replies?.length || 0;
  };

  /**
   * Format discussion date (relative time)
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
   * Get discussion statistics
   */
  const getStats = () => {
    return {
      total: totalDiscussions.value,
      pinned: pinnedDiscussions.value.length,
      bestAnswers: bestAnswers.value.length,
      loaded: discussionCount.value,
      hasMore: hasMore.value,
    };
  };

  /**
   * Sort discussions by different criteria
   */
  const sortBy = (
    discussions: Discussion[],
    sortType: "newest" | "oldest" | "popular" | "replies"
  ): Discussion[] => {
    const sorted = [...discussions];

    switch (sortType) {
      case "newest":
        return sorted.sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      case "oldest":
        return sorted.sort(
          (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
      case "popular":
        return sorted.sort((a, b) => b.likesCount - a.likesCount);
      case "replies":
        return sorted.sort((a, b) => getReplyCount(b) - getReplyCount(a));
      default:
        return sorted;
    }
  };

  /**
   * Filter discussions by criteria
   */
  const filterBy = (
    discussions: Discussion[],
    filter: {
      hasReplies?: boolean;
      isLiked?: boolean;
      isPinned?: boolean;
      isBestAnswer?: boolean;
      authorId?: string;
    }
  ): Discussion[] => {
    return discussions.filter((d) => {
      if (filter.hasReplies !== undefined) {
        const hasReplies = getReplyCount(d) > 0;
        if (filter.hasReplies !== hasReplies) return false;
      }
      if (filter.isLiked !== undefined && filter.isLiked !== d.likedByCurrentUser) {
        return false;
      }
      if (filter.isPinned !== undefined && filter.isPinned !== d.isPinned) {
        return false;
      }
      if (filter.isBestAnswer !== undefined && filter.isBestAnswer !== d.isBestAnswer) {
        return false;
      }
      if (filter.authorId !== undefined && filter.authorId !== d.userId._id) {
        return false;
      }
      return true;
    });
  };

  /**
   * Search discussions by content
   */
  const search = (discussions: Discussion[], query: string): Discussion[] => {
    const lowerQuery = query.toLowerCase();
    return discussions.filter(
      (d) =>
        d.content.toLowerCase().includes(lowerQuery) ||
        d.userId.name.toLowerCase().includes(lowerQuery)
    );
  };

  /**
   * Get discussion tree (with nested replies)
   */
  const getDiscussionTree = (discussion: Discussion) => {
    return {
      ...discussion,
      replyCount: getReplyCount(discussion),
      hasReplies: getReplyCount(discussion) > 0,
      replies: discussion.replies || [],
    };
  };

  /**
   * Validate discussion content
   */
  const validateContent = (content: string): { valid: boolean; error?: string } => {
    if (!content || content.trim().length === 0) {
      return { valid: false, error: "Content is required" };
    }
    if (content.length > 2000) {
      return { valid: false, error: "Content must be less than 2000 characters" };
    }
    return { valid: true };
  };

  /**
   * Get user level color based on gamification level
   */
  const getLevelColor = (level: number): string => {
    if (level >= 40) return "text-purple-500"; // Legend
    if (level >= 30) return "text-yellow-500"; // Master
    if (level >= 20) return "text-blue-500"; // Expert
    if (level >= 10) return "text-green-500"; // Apprentice
    return "text-gray-500"; // Novice
  };

  /**
   * Get user level badge
   */
  const getLevelBadge = (level: number): string => {
    if (level >= 40) return "👑"; // Legend
    if (level >= 30) return "⭐"; // Master
    if (level >= 20) return "🎯"; // Expert
    if (level >= 10) return "🔰"; // Apprentice
    return "🌱"; // Novice
  };

  return {
    // State
    discussions,
    userDiscussions,
    loading,
    error,
    pagination,

    // Computed
    discussionCount,
    totalDiscussions,
    hasMore,
    pinnedDiscussions,
    bestAnswers,

    // CRUD operations
    loadDiscussions,
    loadMore,
    createDiscussion,
    createReply,
    editDiscussion,
    removeDiscussion,
    clear,
    clearUser,

    // Interactions
    likeDiscussion,
    pin,
    setBestAnswer,
    report,

    // User discussions
    loadUserDiscussions,

    // Helpers
    findById,
    isAuthor,
    canEdit,
    canDelete,
    canPin,
    canMarkBestAnswer,
    getReplyCount,
    formatDate,
    getStats,
    sortBy,
    filterBy,
    search,
    getDiscussionTree,
    validateContent,
    getLevelColor,
    getLevelBadge,
  };
};
