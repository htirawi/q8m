/**
 * Quiz Component Props & Types
 */

export interface IQuizHeaderProps {
  currentQuestionIndex: number;
  totalQuestions: number;
  timeRemaining?: number;
  score?: number;
}

export interface IQuizQuestionProps {
  question: Record<string, unknown>;
  currentIndex: number;
  totalQuestions: number;
  selectedAnswer?: string | string[];
}

export interface IQuizResultsProps {
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  timeSpent: number;
  xpEarned?: number;
  badgesEarned?: Record<string, unknown>[];
}

