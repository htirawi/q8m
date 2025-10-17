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
  color: "red" | "black" | "blue" | "purple" | "gray" | "gradient";
  difficulty: DifficultyLevel;
  progressPercent?: number;
  isLocked?: boolean;
  requiredPlan?: string;
}

export interface ILevelCardProps {
  level: DifficultyLevel;
  title: string;
  description: string;
  questionCount: number;
  estimatedTime: string;
  requiredPlan?: PlanTier;
  locked?: boolean;
  recommended?: boolean;
}

export interface ILevelCardEmits {
  (e: "select", level: DifficultyLevel): void;
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
  showAnimation?: boolean;
}

export interface IStartStudyingCtaEmits {
  (e: "start"): void;
}

export interface IStickyStartBarProps {
  framework?: string;
  level?: DifficultyLevel;
  visible?: boolean;
}

export interface IStickyStartBarEmits {
  (e: "start"): void;
  (e: "close"): void;
}

export interface IStudyHeaderProps {
  currentIndex: number;
  totalQuestions: number;
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
  sessionTime: number;
  isPaused: boolean;
  loadedCount: number;
  totalAvailable: number;
  hasMore?: boolean;
  isLoadingMore?: boolean;
}

export interface IStudyQuestionProps {
  question: Record<string, unknown>;
  currentIndex: number;
  totalQuestions: number;
  showAnswer: boolean;
  locale: string;
  selectedAnswer: unknown;
  textAnswer?: string;
  multipleAnswers?: string[];
  isBookmarked?: boolean;
  canGoPrevious?: boolean;
  isLoadingMore?: boolean;
  isLastQuestion?: boolean;
  hasMore?: boolean;
}
