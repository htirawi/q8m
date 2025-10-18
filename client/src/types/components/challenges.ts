/**
 * Challenges Component Props & Types
 */

export interface Challenge {
  id: string;
  opponent?: {
    id: string;
    name: string;
    avatar?: string;
  };
  status: string;
  difficulty: string;
  category?: string;
  topic?: string;
  questionCount?: number;
  startedAt?: Date | string;
  completedAt?: Date | string;
  score?: number;
  opponentScore?: number;
  timeLimit?: number;
  [key: string]: unknown; // Allow additional properties
}

export interface IChallengeCardProps {
  challenge: Challenge | Record<string, unknown>;
  showActions?: boolean;
  loading?: boolean;
}

export interface IChallengeListProps {
  challenges: Record<string, unknown>[];
  loading?: boolean;
  emptyMessage?: string;
  emptyStateTitle?: string;
  showCreateButton?: boolean;
  pagination?: { currentPage: number; totalPages: number; pageSize: number };
}

export interface ICreateChallengeModalProps {
  open: boolean;
  friendId?: string;
  loading?: boolean;
}
