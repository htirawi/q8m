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
  requiredPlan?: PlanTier;
  locked?: boolean;
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
}

export interface IStudyFiltersProps {
  difficulty?: DifficultyLevel;
  category?: string;
  tags?: string[];
}

export interface IStudyNavigationProps {
  currentIndex: number;
  totalQuestions: number;
  answeredQuestions: Set<number>;
  markedQuestions: Set<number>;
}

export interface IStudyQuestionProps {
  question: Record<string, unknown>;
  currentIndex: number;
  totalQuestions: number;
}

