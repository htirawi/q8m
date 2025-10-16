import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { httpClient, getErrorMessage as extractErrorMessage } from "@/utils/httpClient";
import { useToast } from "@/composables/useToast";
import type { Friend, FriendRequest, FriendStatus, Pagination } from "@shared/types/friends";

// Re-export types for use in other modules
export type { Friend, FriendRequest, FriendStatus, Pagination } from "@shared/types/friends";

// Helper to extract error message
function getErrorMessage(error: unknown, defaultMessage: string): string {
  return extractErrorMessage(error) || defaultMessage;
}

export const useFriendsStore = defineStore("friends", () => {
  const toast = useToast();

  // State
  const friends = ref<Friend[]>([]);
  const receivedRequests = ref<FriendRequest[]>([]);
  const sentRequests = ref<FriendRequest[]>([]);
  const blockedUsers = ref<Friend[]>([]);
  const searchResults = ref<Friend[]>([]);
  const suggestions = ref<Friend[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const pagination = ref<Pagination>({
    page: 1,
    limit: 20,
    total: 0,
    hasMore: false,
  });

  // Computed
  const friendCount = computed(() => friends.value.length);
  const receivedRequestsCount = computed(() => receivedRequests.value.length);
  const sentRequestsCount = computed(() => sentRequests.value.length);

  // API Base URL
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

  /**
   * Get all friends
   */
  const getFriends = async (page: number = 1, limit: number = 20): Promise<void> => {
    try {
      loading.value = true;
      error.value = null;

      const params = new URLSearchParams();
      params.append("page", page.toString());
      params.append("limit", limit.toString());

      const data = await httpClient.get<{
        success: boolean;
        friends: Friend[];
        pagination: Pagination;
      }>(`${API_URL}/api/v1/friends?${params.toString()}`, { requireAuth: true });

      if (data.success) {
        if (page === 1) {
          friends.value = data.friends;
        } else {
          friends.value.push(...data.friends);
        }
        pagination.value = data.pagination;
      }
    } catch (err: unknown) {
      error.value = getErrorMessage(err, "Failed to load friends");
      toast.error("Error", error.value);
      console.error("Error fetching friends:", err);
    } finally {
      loading.value = false;
    }
  };

  /**
   * Get received friend requests
   */
  const getReceivedRequests = async (): Promise<void> => {
    try {
      loading.value = true;
      error.value = null;

      const data = await httpClient.get<{ success: boolean; requests: FriendRequest[] }>(
        `${API_URL}/api/v1/friends/requests/received`,
        { requireAuth: true }
      );

      if (data.success) {
        receivedRequests.value = data.requests;
      }
    } catch (err: unknown) {
      error.value = getErrorMessage(err, "Failed to load friend requests");
      toast.error("Error", error.value);
      console.error("Error fetching requests:", err);
    } finally {
      loading.value = false;
    }
  };

  /**
   * Get sent friend requests
   */
  const getSentRequests = async (): Promise<void> => {
    try {
      loading.value = true;
      error.value = null;

      const data = await httpClient.get<{ success: boolean; requests: FriendRequest[] }>(
        `${API_URL}/api/v1/friends/requests/sent`,
        { requireAuth: true }
      );

      if (data.success) {
        sentRequests.value = data.requests;
      }
    } catch (err: unknown) {
      error.value = getErrorMessage(err, "Failed to load sent requests");
      toast.error("Error", error.value);
      console.error("Error fetching sent requests:", err);
    } finally {
      loading.value = false;
    }
  };

  /**
   * Send friend request
   */
  const sendFriendRequest = async (friendId: string): Promise<boolean> => {
    try {
      loading.value = true;
      error.value = null;

      const data = await httpClient.post<{ success: boolean }>(
        `${API_URL}/api/v1/friends/request`,
        { friendId },
        { requireAuth: true }
      );

      if (data.success) {
        toast.success("Friend request sent");
        await getSentRequests(); // Refresh sent requests
        return true;
      }

      return false;
    } catch (err: unknown) {
      error.value = getErrorMessage(err, "Failed to send friend request");
      toast.error("Error", error.value);
      console.error("Error sending friend request:", err);
      return false;
    } finally {
      loading.value = false;
    }
  };

  /**
   * Accept friend request
   */
  const acceptFriendRequest = async (friendId: string): Promise<boolean> => {
    try {
      loading.value = true;
      error.value = null;

      const data = await httpClient.put<{ success: boolean }>(
        `${API_URL}/api/v1/friends/accept/${friendId}`,
        {},
        { requireAuth: true }
      );

      if (data.success) {
        // Remove from received requests
        receivedRequests.value = receivedRequests.value.filter((r) => r._id !== friendId);
        toast.success("Friend request accepted");
        await getFriends(); // Refresh friends list
        return true;
      }

      return false;
    } catch (err: unknown) {
      error.value = getErrorMessage(err, "Failed to accept friend request");
      toast.error("Error", error.value);
      console.error("Error accepting friend request:", err);
      return false;
    } finally {
      loading.value = false;
    }
  };

  /**
   * Reject friend request
   */
  const rejectFriendRequest = async (friendId: string): Promise<boolean> => {
    try {
      loading.value = true;
      error.value = null;

      const data = await httpClient.delete<{ success: boolean }>(
        `${API_URL}/api/v1/friends/reject/${friendId}`,
        { requireAuth: true }
      );

      if (data.success) {
        // Remove from received requests
        receivedRequests.value = receivedRequests.value.filter((r) => r._id !== friendId);
        toast.success("Friend request rejected");
        return true;
      }

      return false;
    } catch (err: unknown) {
      error.value = getErrorMessage(err, "Failed to reject friend request");
      toast.error("Error", error.value);
      console.error("Error rejecting friend request:", err);
      return false;
    } finally {
      loading.value = false;
    }
  };

  /**
   * Cancel sent friend request
   */
  const cancelFriendRequest = async (friendId: string): Promise<boolean> => {
    try {
      loading.value = true;
      error.value = null;

      const data = await httpClient.delete<{ success: boolean }>(
        `${API_URL}/api/v1/friends/reject/${friendId}`,
        { requireAuth: true }
      );

      if (data.success) {
        // Remove from sent requests
        sentRequests.value = sentRequests.value.filter((r) => r._id !== friendId);
        toast.success("Friend request cancelled");
        return true;
      }

      return false;
    } catch (err: unknown) {
      error.value = getErrorMessage(err, "Failed to cancel friend request");
      toast.error("Error", error.value);
      console.error("Error cancelling friend request:", err);
      return false;
    } finally {
      loading.value = false;
    }
  };

  /**
   * Remove friend
   */
  const removeFriend = async (friendId: string): Promise<boolean> => {
    try {
      loading.value = true;
      error.value = null;

      const data = await httpClient.delete<{ success: boolean }>(
        `${API_URL}/api/v1/friends/${friendId}`,
        { requireAuth: true }
      );

      if (data.success) {
        // Remove from friends list
        friends.value = friends.value.filter((f) => f._id !== friendId);
        toast.success("Friend removed");
        return true;
      }

      return false;
    } catch (err: unknown) {
      error.value = getErrorMessage(err, "Failed to remove friend");
      toast.error("Error", error.value);
      console.error("Error removing friend:", err);
      return false;
    } finally {
      loading.value = false;
    }
  };

  /**
   * Block user
   */
  const blockUser = async (friendId: string): Promise<boolean> => {
    try {
      loading.value = true;
      error.value = null;

      const data = await httpClient.post<{ success: boolean }>(
        `${API_URL}/api/v1/friends/block/${friendId}`,
        {},
        { requireAuth: true }
      );

      if (data.success) {
        // Remove from friends if present
        friends.value = friends.value.filter((f) => f._id !== friendId);
        toast.success("User blocked");
        await getBlockedUsers(); // Refresh blocked list
        return true;
      }

      return false;
    } catch (err: unknown) {
      error.value = getErrorMessage(err, "Failed to block user");
      toast.error("Error", error.value);
      console.error("Error blocking user:", err);
      return false;
    } finally {
      loading.value = false;
    }
  };

  /**
   * Unblock user
   */
  const unblockUser = async (friendId: string): Promise<boolean> => {
    try {
      loading.value = true;
      error.value = null;

      const data = await httpClient.delete<{ success: boolean }>(
        `${API_URL}/api/v1/friends/block/${friendId}`,
        { requireAuth: true }
      );

      if (data.success) {
        // Remove from blocked list
        blockedUsers.value = blockedUsers.value.filter((u) => u._id !== friendId);
        toast.success("User unblocked");
        return true;
      }

      return false;
    } catch (err: unknown) {
      error.value = getErrorMessage(err, "Failed to unblock user");
      toast.error("Error", error.value);
      console.error("Error unblocking user:", err);
      return false;
    } finally {
      loading.value = false;
    }
  };

  /**
   * Get blocked users
   */
  const getBlockedUsers = async (): Promise<void> => {
    try {
      loading.value = true;
      error.value = null;

      const data = await httpClient.get<{ success: boolean; blocked: Friend[] }>(
        `${API_URL}/api/v1/friends/blocked`,
        { requireAuth: true }
      );

      if (data.success) {
        blockedUsers.value = data.blocked;
      }
    } catch (err: unknown) {
      error.value = getErrorMessage(err, "Failed to load blocked users");
      toast.error("Error", error.value);
      console.error("Error fetching blocked users:", err);
    } finally {
      loading.value = false;
    }
  };

  /**
   * Search users
   */
  const searchUsers = async (
    query: string,
    page: number = 1,
    limit: number = 20
  ): Promise<void> => {
    try {
      loading.value = true;
      error.value = null;

      const params = new URLSearchParams();
      params.append("q", query);
      params.append("page", page.toString());
      params.append("limit", limit.toString());

      const data = await httpClient.get<{
        success: boolean;
        users: Friend[];
        pagination: Pagination;
      }>(`${API_URL}/api/v1/friends/search?${params.toString()}`, { requireAuth: true });

      if (data.success) {
        if (page === 1) {
          searchResults.value = data.users;
        } else {
          searchResults.value.push(...data.users);
        }
        pagination.value = data.pagination;
      }
    } catch (err: unknown) {
      error.value = getErrorMessage(err, "Failed to search users");
      toast.error("Error", error.value);
      console.error("Error searching users:", err);
    } finally {
      loading.value = false;
    }
  };

  /**
   * Get friend suggestions
   */
  const getFriendSuggestions = async (limit: number = 10): Promise<void> => {
    try {
      loading.value = true;
      error.value = null;

      const params = new URLSearchParams();
      params.append("limit", limit.toString());

      const data = await httpClient.get<{ success: boolean; suggestions: Friend[] }>(
        `${API_URL}/api/v1/friends/suggestions?${params.toString()}`,
        { requireAuth: true }
      );

      if (data.success) {
        suggestions.value = data.suggestions;
      }
    } catch (err: unknown) {
      error.value = getErrorMessage(err, "Failed to load suggestions");
      console.error("Error fetching suggestions:", err);
    } finally {
      loading.value = false;
    }
  };

  /**
   * Get friendship status with a specific user
   */
  const getFriendshipStatus = async (friendId: string): Promise<FriendStatus | null> => {
    try {
      const data = await httpClient.get<{ success: boolean } & FriendStatus>(
        `${API_URL}/api/v1/friends/status/${friendId}`,
        { requireAuth: true }
      );

      if (data.success) {
        return data;
      }

      return null;
    } catch (err: unknown) {
      console.error("Error fetching friendship status:", err);
      return null;
    }
  };

  /**
   * Clear search results
   */
  const clearSearch = (): void => {
    searchResults.value = [];
    pagination.value = {
      page: 1,
      limit: 20,
      total: 0,
      hasMore: false,
    };
  };

  /**
   * Load more friends
   */
  const loadMoreFriends = async (): Promise<void> => {
    if (!pagination.value.hasMore || loading.value) return;

    const nextPage = pagination.value.page + 1;
    await getFriends(nextPage, pagination.value.limit);
  };

  /**
   * Load more search results
   */
  const loadMoreSearch = async (query: string): Promise<void> => {
    if (!pagination.value.hasMore || loading.value) return;

    const nextPage = pagination.value.page + 1;
    await searchUsers(query, nextPage, pagination.value.limit);
  };

  return {
    // State
    friends,
    receivedRequests,
    sentRequests,
    blockedUsers,
    searchResults,
    suggestions,
    loading,
    error,
    pagination,

    // Computed
    friendCount,
    receivedRequestsCount,
    sentRequestsCount,

    // Actions
    getFriends,
    getReceivedRequests,
    getSentRequests,
    sendFriendRequest,
    acceptFriendRequest,
    rejectFriendRequest,
    cancelFriendRequest,
    removeFriend,
    blockUser,
    unblockUser,
    getBlockedUsers,
    searchUsers,
    getFriendSuggestions,
    getFriendshipStatus,
    clearSearch,
    loadMoreFriends,
    loadMoreSearch,
  };
});
