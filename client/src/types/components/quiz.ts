/**
 * Quiz Component Props & Types
 */

export interface IQuizHeaderProps {
  level: string;
  currentIndex: number;
  totalQuestions: number;
  remainingTime: number;
  quizDuration: number;
  isSticky?: boolean;
}

export interface IQuizQuestionProps {
  question: Record<string, unknown>;
  level: string;
  locale: string;
  selectedAnswer?: string | string[];
  textAnswer?: string;
  multipleAnswers?: string[];
  hasAnswered?: boolean;
  isLastQuestion?: boolean;
  userAnswerResult?: {
    isCorrect: boolean;
    correctAnswer: string | string[];
    explanation: string;
    points: number;
  };
}

export interface IQuizResultsProps {
  level: string;
  score: {
    correct: number;
    total: number;
    percentage: number;
    timeSpent: number;
  };
  totalQuestions: number;
  correctAnswers: number;
  timeSpent: number;
  xpEarned?: number;
  badgesEarned?: Record<string, unknown>[];
  quizResultData?: Record<string, unknown>;
}
