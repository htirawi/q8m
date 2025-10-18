/**
 * Friends Component Props & Types
 */

export interface IFriendCardProps {
  friend: Record<string, unknown>;
  showActions?: boolean;
  compact?: boolean;
  badge?: string | boolean;
}

export interface IFriendCardEmits {
  (e: "remove", friendId: string): void;
  (e: "challenge", friendId: string): void;
}

export interface IFriendListProps {
  friends: Record<string, unknown>[];
  loading?: boolean;
  showSearch?: boolean;
  showFilters?: boolean;
  initialSort?: string;
}

export interface IFriendListEmits {
  (e: "remove", friendId: string): void;
  (e: "loadMore"): void;
  (e: "view-friend", friendId: string): void;
}

export interface IFriendRequestsProps {
  requests: Record<string, unknown>[];
  initialTab?: "received" | "sent";
  showCounts?: boolean;
}

export interface IFriendRequestsEmits {
  (e: "accept", requestId: string): void;
  (e: "reject", requestId: string): void;
}

export interface IFriendSuggestionsProps {
  suggestions: Record<string, unknown>[];
  loading?: boolean;
  limit?: number;
  layout?: "grid" | "list";
  autoLoad?: boolean;
  showMutualFriends?: boolean;
}

export interface IFriendSuggestionsEmits {
  (e: "sendRequest", userId: string): void;
  (e: "loadMore"): void;
  (e: "suggestion-clicked", suggestion: unknown): void;
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
