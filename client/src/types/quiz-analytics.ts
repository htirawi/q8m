/**
 * Quiz Analytics and Progress Tracking Types
 */

export interface QuizAttempt {
  id: string;
  level: "junior" | "intermediate" | "senior";
  score: number;
  correct: number;
  total: number;
  timeSpent: number;
  timestamp: number;
  date?: string;
  answers: Record<number, QuizAnswerRecord>;
}

export interface QuizAnswerRecord {
  answer: string | string[];
  isCorrect: boolean;
  timeSpent: number;
}

export interface LevelStats {
  name: "junior" | "intermediate" | "senior";
  attempts: number;
  average: number;
}

export interface CategoryStats {
  category: string;
  correctCount: number;
  totalCount: number;
  accuracy: number;
}

export interface AnalyticsStats {
  totalAttempts: number;
  averageScore: number;
  bestScore: number;
  improvement: number;
}

// Progress Dashboard Types
export interface ProgressStats {
  completionPercentage: number;
  questionsAnswered: number;
  totalQuestions: number;
  totalTimeSpent: number;
  currentStreak: number;
  bestStreak: number;
}

export interface DifficultyProgress {
  level: "easy" | "medium" | "hard";
  label: string;
  answered: number;
  total: number;
  percentage: number;
  color: string;
}

export interface RecentActivity {
  id: string;
  type: "quiz" | "study" | "achievement";
  title: string;
  timestamp: number;
  score?: number;
}

// Smart Recommendations Types
export interface RecommendedQuiz {
  id: string;
  level: "junior" | "intermediate" | "senior";
  title: string;
  description: string;
  reason: "weak_area" | "next_level" | "practice" | "new";
}

export interface StudyTopic {
  id: string;
  title: string;
  difficulty: "easy" | "medium" | "hard";
  reason: string;
  priority: "high" | "medium" | "low";
  currentAccuracy: number;
  targetAccuracy: number;
}

export interface LearningPathStep {
  id: number;
  title: string;
  description: string;
  completed: boolean;
  current: boolean;
}

export interface LevelStatsMap {
  junior?: {
    attempts: number;
    avgScore: number;
    scores: number[];
  };
  intermediate?: {
    attempts: number;
    avgScore: number;
    scores: number[];
  };
  senior?: {
    attempts: number;
    avgScore: number;
    scores: number[];
  };
}

export interface LearningStreak {
  currentStreak: number;
  bestStreak: number;
  lastActivityDate: string | null;
}
