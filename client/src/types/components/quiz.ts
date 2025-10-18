/**
 * Quiz Component Props & Types
 */

export interface IQuizAnswer {
  questionId: string;
  answer: string | string[];
  userAnswer?: string | string[];
  selectedAnswer?: string | string[];
  correctAnswer?: string | string[];
  correct?: boolean;
  isCorrect?: boolean;
  timeSpent?: number;
  timeSpentSeconds?: number;
  difficultyLevel?: "easy" | "medium" | "hard";
  category?: string;
  tags?: string[];
  points?: number;
  pointsEarned?: number;
}

export interface ISubmitQuizPayload {
  quizType: "practice" | "exam";
  level: "junior" | "intermediate" | "senior";
  answers: IQuizAnswer[];
  startTime: string;
  endTime: string;
}

export interface ISubmitQuizResponse {
  xpEarned?: number;
  badgesEarned?: string[] | Array<{ id: string; name: string; description: string; icon: string }>;
  leveledUp?: boolean;
  newLevel?: number;
  previousLevel?: number;
  weakCategories?: string[];
  strongCategories?: string[];
  level?: number;
  xp?: number;
  totalXP?: number;
  currentXP?: number;
  xpToNextLevel?: number;
  xpBreakdown?: Record<string, unknown>; // Detailed XP breakdown
  streak?: number;
  coins?: number;
  badges?: Array<{
    id: string;
    name: string;
    description: string;
    icon: string;
    rarity: string;
    earned: boolean;
    earnedAt?: Date;
  }>;
}

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
  quizResultData?: ISubmitQuizResponse | Record<string, unknown>;
}
