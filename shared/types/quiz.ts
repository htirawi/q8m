export interface QuizOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

export interface Question {
  _id: string;
  id: number; // legacy ID
  framework: string; // 'angular', 'react', 'nextjs', 'redux'
  level: "junior" | "intermediate" | "senior";
  type: "multiple-choice" | "fill-blank" | "true-false" | "multiple-checkbox";
  category?: string;
  difficulty: "easy" | "medium" | "hard";
  tags: string[];
  points: number;

  // Multilingual content
  content: {
    en: {
      question: string;
      options?: QuizOption[];
      explanation: string;
    };
    ar: {
      question: string;
      options?: QuizOption[];
      explanation: string;
    };
  };

  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface QuizSession {
  id: string;
  userId: string;
  framework: string;
  level: string;
  questions: Question[];
  currentQuestionIndex: number;
  answers: Record<string, string | string[]>;
  startTime: Date;
  endTime?: Date;
  timeLimit?: number; // in minutes
  isCompleted: boolean;
  score?: number;
  totalQuestions: number;
}

export interface QuizResult {
  id: string;
  userId: string;
  sessionId: string;
  framework: string;
  level: string;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  incorrectAnswers: number;
  skippedAnswers: number;
  timeSpent: number; // in seconds
  completedAt: Date;
  answers: Record<
    string,
    {
      questionId: string;
      userAnswer: string | string[];
      correctAnswer: string | string[];
      isCorrect: boolean;
      timeSpent: number;
    }
  >;
}

export interface QuizStats {
  totalQuizzes: number;
  averageScore: number;
  bestScore: number;
  totalTimeSpent: number;
  frameworks: Record<
    string,
    {
      totalQuizzes: number;
      averageScore: number;
      bestScore: number;
    }
  >;
  levels: Record<
    string,
    {
      totalQuizzes: number;
      averageScore: number;
      bestScore: number;
    }
  >;
  recentQuizzes: QuizResult[];
}

export interface QuizConfig {
  framework: string;
  level: string;
  questionCount: number;
  timeLimit?: number;
  shuffleQuestions: boolean;
  shuffleOptions: boolean;
  showExplanation: boolean;
  allowReview: boolean;
}

export interface QuizAttempt {
  questionId: string;
  userAnswer: string | string[];
  timeSpent: number;
  isCorrect: boolean;
  submittedAt: Date;
}

export interface QuizProgress {
  sessionId: string;
  currentQuestion: number;
  totalQuestions: number;
  timeRemaining: number;
  completedQuestions: number;
  correctAnswers: number;
  incorrectAnswers: number;
  skippedQuestions: number;
}
