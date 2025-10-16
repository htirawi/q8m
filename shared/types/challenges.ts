/**
 * Challenge and Competition Types
 * Shared types for user challenges and competitive features
 */

/**
 * User info in challenge context
 */
export interface ChallengeUser {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  gamification?: {
    level: number;
  };
}

/**
 * Answer details for a challenge question
 */
export interface ChallengeAnswer {
  questionId: string;
  answer: string | string[];
  correct: boolean;
  timeSpent: number;
}

/**
 * Challenge statistics for a user
 */
export interface ChallengeStats {
  total: number;
  totalChallenges: number;
  won: number;
  wins: number;
  lost: number;
  losses: number;
  ties: number;
  winRate: number;
  averageScore: number;
  bestScore: number;
}

/**
 * Main challenge entity
 */
export interface Challenge {
  _id: string;
  challengerId: ChallengeUser;
  opponentId: ChallengeUser;
  challengedUserId?: ChallengeUser; // Backward compatibility alias for opponentId
  framework: string;
  level: string;
  difficulty: string;
  numberOfQuestions: number;
  questionCount?: number; // Backward compatibility alias
  timeLimit?: number;
  message?: string;
  challengerAnswers?: ChallengeAnswer[];
  opponentAnswers?: ChallengeAnswer[];
  challengerScore?: number;
  opponentScore?: number;
  challengedScore?: number; // Backward compatibility alias for opponentScore
  challengerTime?: number;
  challengedTime?: number;
  winnerId?: string;
  isTie?: boolean;
  status: 'pending' | 'in-progress' | 'completed' | 'expired';
  expiresAt: Date;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * DTO for creating a new challenge
 */
export interface CreateChallengeData {
  opponentId: string;
  challengedUserId?: string; // Backward compatibility alias
  framework: string;
  level: string;
  difficulty: string;
  numberOfQuestions: number;
  questionCount?: number; // Backward compatibility alias
  timeLimit?: number;
  message?: string;
}

/**
 * DTO for submitting challenge results
 */
export interface SubmitChallengeData {
  answers: ChallengeAnswer[];
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
