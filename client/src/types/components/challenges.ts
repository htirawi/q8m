/**
 * Challenges Component Props & Types
 */

// Import and re-export Challenge type from shared for consistency
import type { Challenge } from "@shared/types/challenges";
export type { Challenge } from "@shared/types/challenges";

export interface IChallengeCardProps {
  challenge: Challenge;
  showActions?: boolean;
  loading?: boolean;
}

export interface IChallengeListProps {
  challenges: Challenge[];
  loading?: boolean;
  emptyMessage?: string;
  emptyStateMessage?: string; // Alias for emptyMessage
  emptyStateTitle?: string;
  showCreateButton?: boolean;
  pagination?: { currentPage: number; totalPages: number; pageSize: number; hasMore?: boolean };
}

export interface ICreateChallengeModalProps {
  open: boolean;
  isOpen?: boolean; // Alias for open
  friendId?: string;
  friends?: Array<{ id: string; name: string; avatar?: string }>;
  loading?: boolean;
}
