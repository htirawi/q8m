/**
 * Challenges Component Props & Types
 */

export interface IChallengeCardProps {
  challenge: Record<string, unknown>;
  showActions?: boolean;
}

export interface IChallengeListProps {
  challenges: Record<string, unknown>[];
  loading?: boolean;
  emptyMessage?: string;
}

export interface ICreateChallengeModalProps {
  open: boolean;
  friendId?: string;
}
