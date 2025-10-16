/**
 * Recommendations Component Props & Types
 */

export interface ILearningStep {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  locked?: boolean;
}

export interface ILearningPath {
  name: string;
  steps: ILearningStep[];
}

export interface IQuickTip {
  id: string;
  title: string;
  description: string;
  icon?: string;
  category?: string;
}

