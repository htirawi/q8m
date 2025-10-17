/**
 * Learning Paths Types
 * Shared types for learning path system
 */

export type PathCategory =
  | 'frontend'
  | 'backend'
  | 'fullstack'
  | 'interview'
  | 'framework-specific'
  | 'role-based';

export type PathDifficulty = 'beginner' | 'intermediate' | 'advanced' | 'mixed';

export type EnrollmentStatus = 'in-progress' | 'completed' | 'abandoned';

export interface ILocalizedText {
  en: string;
  ar: string;
}

export interface IModule {
  moduleId: string;
  title: ILocalizedText;
  description: ILocalizedText;
  order: number;
  estimatedMinutes: number;
  questionIds: string[];
  prerequisites: string[];
  isLocked: boolean;
}

export interface ILearningPath {
  _id: string;
  title: ILocalizedText;
  description: ILocalizedText;
  slug: string;
  category: PathCategory;
  difficulty: PathDifficulty;
  frameworks: string[];
  modules: IModule[];
  totalQuestions: number;
  estimatedHours: number;
  prerequisites: string[];
  tags: string[];
  thumbnail?: string;
  isPremium: boolean;
  isPublished: boolean;
  enrollmentCount: number;
  completionCount: number;
  rating?: number;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IModuleProgress {
  moduleId: string;
  isCompleted: boolean;
  completedAt?: Date;
  questionsCompleted: number;
  totalQuestions: number;
  score?: number;
}

export interface IPathEnrollment {
  _id: string;
  userId: string;
  pathId: string;
  status: EnrollmentStatus;
  progress: number;
  moduleProgress: IModuleProgress[];
  currentModuleId?: string;
  startedAt: Date;
  completedAt?: Date;
  lastActivityAt: Date;
  totalTimeSpent: number;
  certificateIssued: boolean;
  certificateId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICertificate {
  certificateId: string;
  userId: string;
  userName: string;
  pathId: string;
  pathTitle: ILocalizedText;
  completedAt: Date;
  totalTimeSpent: number;
  finalScore: number;
  moduleCount: number;
}

export interface IPathStats {
  totalPaths: number;
  enrolledPaths: number;
  completedPaths: number;
  inProgressPaths: number;
  totalTimeSpent: number;
  certificatesEarned: number;
}

export interface IEnrollmentWithPath extends IPathEnrollment {
  path: ILearningPath;
}

export interface IPathWithEnrollment extends ILearningPath {
  enrollment?: IPathEnrollment;
  isEnrolled: boolean;
  canEnroll: boolean;
}
