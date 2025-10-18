/**
 * Recommendations Component Props & Types
 */

export interface IRecommendation {
  id: string;
  type: string;
  title: string;
  description?: string;
  priority?: "high" | "medium" | "low";
  category?: string;
  difficulty?: string;
  estimatedTime?: number;
  actionUrl?: string;
  [key: string]: unknown;
}

export interface IRecommendationsProps {
  items: IRecommendation[];
  showRefresh?: boolean;
}

export interface ILearningStep {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  current?: boolean;
  locked?: boolean;
  action?: string;
}

export interface ILearningPath {
  name: string;
  steps: ILearningStep[];
}

export interface IQuickTip {
  id: string;
  title: string;
  description: string;
  tip?: string; // Alias for description or additional tip text
  icon?: string;
  category?: string;
}
