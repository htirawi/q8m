import { computed } from 'vue';
import { useFriendsStore } from '@/stores/friends';
import type { Friend, FriendStatus } from '@/stores/friends';

/**
 * Composable for managing friends and friend requests
 * Provides methods for friend management, search, and suggestions
 */
export const useFriends = () => {
  const store = useFriendsStore();

  // State
  const friends = computed(() => store.friends);
  const receivedRequests = computed(() => store.receivedRequests);
  const sentRequests = computed(() => store.sentRequests);
  const blockedUsers = computed(() => store.blockedUsers);
  const searchResults = computed(() => store.searchResults);
  const suggestions = computed(() => store.suggestions);
  const loading = computed(() => store.loading);
  const error = computed(() => store.error);
  const pagination = computed(() => store.pagination);

  // Computed
  const friendCount = computed(() => store.friendCount);
  const receivedRequestsCount = computed(() => store.receivedRequestsCount);
  const sentRequestsCount = computed(() => store.sentRequestsCount);
  const hasReceivedRequests = computed(() => store.receivedRequestsCount > 0);
  const hasSentRequests = computed(() => store.sentRequestsCount > 0);
  const hasFriends = computed(() => store.friendCount > 0);

  /**
   * Load friends list
   */
  const loadFriends = async (page: number = 1, limit: number = 20): Promise<void> => {
    await store.getFriends(page, limit);
  };

  /**
   * Load received friend requests
   */
  const loadReceivedRequests = async (): Promise<void> => {
    await store.getReceivedRequests();
  };

  /**
   * Load sent friend requests
   */
  const loadSentRequests = async (): Promise<void> => {
    await store.getSentRequests();
  };

  /**
   * Send friend request
   */
  const sendRequest = async (userId: string): Promise<boolean> => {
    return await store.sendFriendRequest(userId);
  };

  /**
   * Accept friend request
   */
  const acceptRequest = async (userId: string): Promise<boolean> => {
    return await store.acceptFriendRequest(userId);
  };

  /**
   * Reject friend request
   */
  const rejectRequest = async (userId: string): Promise<boolean> => {
    return await store.rejectFriendRequest(userId);
  };

  /**
   * Cancel sent friend request
   */
  const cancelRequest = async (userId: string): Promise<boolean> => {
    return await store.cancelFriendRequest(userId);
  };

  /**
   * Remove friend
   */
  const unfriend = async (userId: string): Promise<boolean> => {
    return await store.removeFriend(userId);
  };

  /**
   * Block user
   */
  const block = async (userId: string): Promise<boolean> => {
    return await store.blockUser(userId);
  };

  /**
   * Unblock user
   */
  const unblock = async (userId: string): Promise<boolean> => {
    return await store.unblockUser(userId);
  };

  /**
   * Load blocked users
   */
  const loadBlockedUsers = async (): Promise<void> => {
    await store.getBlockedUsers();
  };

  /**
   * Search users
   */
  const search = async (query: string, page: number = 1): Promise<void> => {
    if (!query || query.trim().length === 0) {
      store.clearSearch();
      return;
    }
    await store.searchUsers(query, page);
  };

  /**
   * Load friend suggestions
   */
  const loadSuggestions = async (limit: number = 10): Promise<void> => {
    await store.getFriendSuggestions(limit);
  };

  /**
   * Get friendship status with a user
   */
  const getFriendshipStatus = async (userId: string): Promise<FriendStatus | null> => {
    return await store.getFriendshipStatus(userId);
  };

  /**
   * Clear search results
   */
  const clearSearch = (): void => {
    store.clearSearch();
  };

  /**
   * Load more friends
   */
  const loadMore = async (): Promise<void> => {
    await store.loadMoreFriends();
  };

  /**
   * Load more search results
   */
  const loadMoreSearch = async (query: string): Promise<void> => {
    await store.loadMoreSearch(query);
  };

  /**
   * Check if user is a friend
   */
  const isFriend = (userId: string): boolean => {
    return friends.value.some((f) => f._id === userId);
  };

  /**
   * Check if request is sent to user
   */
  const isRequestSent = (userId: string): boolean => {
    return sentRequests.value.some((r) => r._id === userId);
  };

  /**
   * Check if request is received from user
   */
  const isRequestReceived = (userId: string): boolean => {
    return receivedRequests.value.some((r) => r._id === userId);
  };

  /**
   * Check if user is blocked
   */
  const isBlocked = (userId: string): boolean => {
    return blockedUsers.value.some((u) => u._id === userId);
  };

  /**
   * Get friend by ID
   */
  const getFriendById = (userId: string): Friend | undefined => {
    return friends.value.find((f) => f._id === userId);
  };

  /**
   * Get level color for display
   */
  const getLevelColor = (level: number): string => {
    if (level >= 40) return 'text-purple-500'; // Legend
    if (level >= 30) return 'text-yellow-500'; // Master
    if (level >= 20) return 'text-blue-500'; // Expert
    if (level >= 10) return 'text-green-500'; // Apprentice
    return 'text-gray-500'; // Novice
  };

  /**
   * Get level badge emoji
   */
  const getLevelBadge = (level: number): string => {
    if (level >= 40) return '👑';
    if (level >= 30) return '⭐';
    if (level >= 20) return '🎯';
    if (level >= 10) return '🔰';
    return '🌱';
  };

  /**
   * Get level title
   */
  const getLevelTitle = (level: number): string => {
    if (level >= 40) return 'Legend';
    if (level >= 30) return 'Master';
    if (level >= 20) return 'Expert';
    if (level >= 10) return 'Apprentice';
    return 'Novice';
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

    if (diffSec < 60) return 'just now';
    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffHr < 24) return `${diffHr}h ago`;
    if (diffDay < 7) return `${diffDay}d ago`;
    if (diffDay < 30) return `${Math.floor(diffDay / 7)}w ago`;
    if (diffDay < 365) return `${Math.floor(diffDay / 30)}mo ago`;
    return `${Math.floor(diffDay / 365)}y ago`;
  };

  /**
   * Sort friends by different criteria
   */
  const sortFriends = (
    friendsList: Friend[],
    sortBy: 'name' | 'level' | 'recent'
  ): Friend[] => {
    const sorted = [...friendsList];

    switch (sortBy) {
      case 'name':
        return sorted.sort((a, b) => a.name.localeCompare(b.name));
      case 'level':
        return sorted.sort((a, b) => b.level - a.level);
      case 'recent':
        return sorted.sort((a, b) => {
          const dateA = a.friendSince ? new Date(a.friendSince).getTime() : 0;
          const dateB = b.friendSince ? new Date(b.friendSince).getTime() : 0;
          return dateB - dateA;
        });
      default:
        return sorted;
    }
  };

  /**
   * Filter friends by criteria
   */
  const filterFriends = (
    friendsList: Friend[],
    filter: {
      minLevel?: number;
      maxLevel?: number;
      searchTerm?: string;
    }
  ): Friend[] => {
    return friendsList.filter((friend) => {
      if (filter.minLevel !== undefined && friend.level < filter.minLevel) {
        return false;
      }
      if (filter.maxLevel !== undefined && friend.level > filter.maxLevel) {
        return false;
      }
      if (filter.searchTerm) {
        const term = filter.searchTerm.toLowerCase();
        return (
          friend.name.toLowerCase().includes(term) ||
          friend.email.toLowerCase().includes(term)
        );
      }
      return true;
    });
  };

  /**
   * Get friend statistics
   */
  const getStats = () => {
    return {
      totalFriends: friendCount.value,
      receivedRequests: receivedRequestsCount.value,
      sentRequests: sentRequestsCount.value,
      blocked: blockedUsers.value.length,
      suggestions: suggestions.value.length,
    };
  };

  /**
   * Get friendship action label
   */
  const getActionLabel = (status: FriendStatus): string => {
    if (status.status === 'none') return 'Add Friend';
    if (status.status === 'pending') {
      if (status.canAccept) return 'Accept Request';
      if (status.canCancel) return 'Cancel Request';
    }
    if (status.status === 'friends') return 'Remove Friend';
    if (status.status === 'blocked') {
      if (status.canUnblock) return 'Unblock';
      return 'Blocked';
    }
    return 'Unknown';
  };

  /**
   * Get friendship action color
   */
  const getActionColor = (status: FriendStatus): string => {
    if (status.status === 'none') return 'bg-indigo-600 hover:bg-indigo-700';
    if (status.status === 'pending') {
      if (status.canAccept) return 'bg-green-600 hover:bg-green-700';
      if (status.canCancel) return 'bg-gray-600 hover:bg-gray-700';
    }
    if (status.status === 'friends') return 'bg-red-600 hover:bg-red-700';
    if (status.status === 'blocked') return 'bg-gray-400 cursor-not-allowed';
    return 'bg-gray-600';
  };

  /**
   * Validate search query
   */
  const validateSearchQuery = (query: string): { valid: boolean; error?: string } => {
    if (!query || query.trim().length === 0) {
      return { valid: false, error: 'Search query is required' };
    }
    if (query.length < 2) {
      return { valid: false, error: 'Search query must be at least 2 characters' };
    }
    if (query.length > 100) {
      return { valid: false, error: 'Search query must be less than 100 characters' };
    }
    return { valid: true };
  };

  /**
   * Get user avatar URL or initials
   */
  const getUserAvatar = (friend: Friend): { type: 'image' | 'initials'; value: string } => {
    if (friend.avatar) {
      return { type: 'image', value: friend.avatar };
    }
    const initials = friend.name
      .split(' ')
      .map((n) => n.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
    return { type: 'initials', value: initials };
  };

  /**
   * Get avatar background color (deterministic based on name)
   */
  const getAvatarColor = (name: string): string => {
    const colors = [
      'bg-red-500',
      'bg-orange-500',
      'bg-yellow-500',
      'bg-green-500',
      'bg-blue-500',
      'bg-indigo-500',
      'bg-purple-500',
      'bg-pink-500',
    ];

    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }

    const index = Math.abs(hash) % colors.length;
    return colors[index];
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
    hasReceivedRequests,
    hasSentRequests,
    hasFriends,

    // Actions
    loadFriends,
    loadReceivedRequests,
    loadSentRequests,
    sendRequest,
    acceptRequest,
    rejectRequest,
    cancelRequest,
    unfriend,
    block,
    unblock,
    loadBlockedUsers,
    search,
    loadSuggestions,
    getFriendshipStatus,
    clearSearch,
    loadMore,
    loadMoreSearch,

    // Helpers
    isFriend,
    isRequestSent,
    isRequestReceived,
    isBlocked,
    getFriendById,
    getLevelColor,
    getLevelBadge,
    getLevelTitle,
    formatDate,
    sortFriends,
    filterFriends,
    getStats,
    getActionLabel,
    getActionColor,
    validateSearchQuery,
    getUserAvatar,
    getAvatarColor,
  };
};

