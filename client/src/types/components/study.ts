/**
 * Study Component Props & Types
 */

import type { PlanTier, DifficultyLevel } from "@shared/types/plan";

export interface IFrameworkCardProps {
  framework: string;
  title: string;
  description: string;
  icon: string;
  questionCount: number;
  color: "red" | "black" | "blue" | "purple" | "gray" | "green" | "gradient";
  difficulty: DifficultyLevel;
  progressPercent?: number;
  isLocked?: boolean;
  requiredPlan?: string;
}

export interface ILevelCardProps {
  level?: DifficultyLevel; // Either level or difficulty must be provided
  difficulty?: DifficultyLevel; // Alias for level
  title?: string;
  description?: string;
  questionCount?: number;
  estimatedTime?: string;
  requiredPlan?: PlanTier;
  locked?: boolean;
  isLocked?: boolean; // Alias for locked
  isSelected?: boolean;
  recommended?: boolean;
  features?: string[];
  canClickLocked?: boolean;
  isCurrentPlan?: boolean;
  autoStartEnabled?: boolean;
}

export interface ILevelCardEmits {
  (e: "select", level?: DifficultyLevel): void;
  (e: "auto-start", level?: DifficultyLevel): void;
  (e: "unlock-click", difficulty?: DifficultyLevel, requiredPlan?: PlanTier): void;
}

export interface IModeCardProps {
  mode: "study" | "quiz";
  difficulty: DifficultyLevel;
  title: string;
  description: string;
  icon: string;
  features: string[];
  cta: string;
  gradient: string;
  hoverGradient: string;
  recommended?: boolean;
}

export interface IStartStudyingCtaProps {
  framework?: string;
  level?: DifficultyLevel;
  selectedDifficulty?: DifficultyLevel;
  showAnimation?: boolean;
  disabled?: boolean;
  scrollTargetSelector?: string;
}

export interface IStartStudyingCtaEmits {
  (e: "click", difficulty?: DifficultyLevel): void;
}

export interface IStickyStartBarProps {
  framework?: string;
  level?: DifficultyLevel;
  visible?: boolean;
  state?: string;
  hasLastSession?: boolean;
  selectedDifficulty?: string;
  errorMessage?: string;
}

export interface IStickyStartBarEmits {
  (e: "start", difficulty?: string): void;
  (e: "close"): void;
}

export interface IStudyHeaderProps {
  currentIndex: number;
  totalQuestions: number;
  loadedCount: number;
  difficulty: DifficultyLevel;
}

export interface IStudyFiltersProps {
  searchQuery: string;
  questionTypeFilter: string;
  answeredFilter: string;
  filteredCount: number;
  totalCount: number;
  practiceMode: string;
  bookmarkCount: number;
  progress: number;
  difficulty?: DifficultyLevel;
  category?: string;
  tags?: string[];
}

export interface IStudyNavigationProps {
  currentIndex: number;
  totalQuestions: number;
  answeredQuestions: Set<string>;
  markedQuestions: Set<string>;
  loadedCount: number;
  totalAvailable: number;
  hasMore?: boolean;
  isLoadingMore?: boolean;
}

export interface IStudyQuestionProps {
  question: {
    id: string;
    content: Record<string, string>;
    type: string;
    difficulty: string;
    category: string;
    tags: string[];
    options?: Array<{ id: string; text: string; isCorrect: boolean }>;
    explanation?: Record<string, string>;
  };
  currentIndex: number;
  totalQuestions: number;
  showAnswer: boolean;
  locale: string;
  selectedAnswer: string | string[] | null;
  textAnswer?: string;
  multipleAnswers?: string[];
  isBookmarked?: boolean;
  canGoPrevious?: boolean;
  isLoadingMore?: boolean;
  isLastQuestion?: boolean;
  hasMore?: boolean;
}
