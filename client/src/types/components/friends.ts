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
}

export interface IFriendListEmits {
  (e: "remove", friendId: string): void;
  (e: "loadMore"): void;
}

export interface IFriendRequestsProps {
  requests: Record<string, unknown>[];
}

export interface IFriendRequestsEmits {
  (e: "accept", requestId: string): void;
  (e: "reject", requestId: string): void;
}

export interface IFriendSuggestionsProps {
  suggestions: Record<string, unknown>[];
  loading?: boolean;
}

export interface IFriendSuggestionsEmits {
  (e: "sendRequest", userId: string): void;
  (e: "loadMore"): void;
}

export interface IFriendshipButtonProps {
  userId: string;
  status?: "none" | "pending" | "friends" | "blocked";
}

export interface IUserSearchProps {
  placeholder?: string;
}
