/**
 * Friends and Social Connection Types
 * Shared types for friendship and social features
 */

/**
 * Friend entity with user details
 */
export interface Friend {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  level?: number; // Direct level access for backward compatibility
  xp?: number; // Direct XP access for backward compatibility
  friendSince?: Date;
  mutualFriends?: number;
  gamification?: {
    level: number;
    totalXP: number;
    streak: number;
    xp?: number;
    xpToNextLevel?: number;
  };
}

/**
 * Friend request entity (extends Friend with request metadata)
 */
export interface FriendRequest extends Friend {
  requestedAt: Date;
  sentAt?: Date; // Backward compatibility alias
  status: 'pending' | 'accepted' | 'rejected' | 'blocked';
}

/**
 * Friendship status and permissions
 */
export interface FriendStatus {
  areFriends: boolean;
  isPending: boolean;
  canSendRequest: boolean;
  canAccept?: boolean;
  canCancel?: boolean;
  canUnblock?: boolean;
  canUnfriend?: boolean;
  status?: 'friends' | 'pending' | 'blocked' | 'none';
  requestDirection?: 'sent' | 'received';
}

/**
 * Pagination metadata
 */
export interface Pagination {
  page: number;
  limit: number;
  total: number;
  hasMore: boolean;
}
