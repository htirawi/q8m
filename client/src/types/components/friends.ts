/**
 * Friends Component Props & Types
 */

import type { Friend, FriendRequest } from '@shared/types/friends';

export interface IFriendCardProps {
  friend: Friend;
  showActions?: boolean;
  compact?: boolean;
  badge?: string | boolean;
}

export interface IFriendCardEmits {
  (e: "remove", friendId: string): void;
  (e: "challenge", friendId: string): void;
  (e: "unfriend", friendId: string): void;
  (e: "block", friendId: string): void;
  (e: "view", friendId: string): void;
}

export interface IFriendListProps {
  friends?: Friend[];
  loading?: boolean;
  showSearch?: boolean;
  showFilters?: boolean;
  initialSort?: "name" | "level" | "recent";
}

export interface IFriendListEmits {
  (e: "remove", friendId: string): void;
  (e: "loadMore"): void;
  (e: "view-friend", friendId: string): void;
}

export interface IFriendRequestsProps {
  requests?: FriendRequest[];
  initialTab?: "received" | "sent";
  showCounts?: boolean;
}

export interface IFriendRequestsEmits {
  (e: "accept", requestId: string): void;
  (e: "reject", requestId: string): void;
  (e: "request-accepted", requestId: string): void;
  (e: "request-rejected", requestId: string): void;
  (e: "request-cancelled", requestId: string): void;
}

export interface IFriendSuggestionsProps {
  suggestions?: Friend[];
  loading?: boolean;
  limit?: number;
  layout?: "grid" | "list";
  autoLoad?: boolean;
  showMutualFriends?: boolean;
}

export interface IFriendSuggestionsEmits {
  (e: "sendRequest", userId: string): void;
  (e: "loadMore"): void;
  (e: "suggestion-clicked", suggestion: Friend): void;
  (e: "view-all"): void;
}

export interface IFriendshipButtonProps {
  userId: string;
  status?: "none" | "pending" | "friends" | "blocked";
  size?: "sm" | "md" | "lg";
  showIcon?: boolean;
}

export interface IUserSearchProps {
  placeholder?: string;
  showSuggestions?: boolean;
  autoFocus?: boolean;
}
