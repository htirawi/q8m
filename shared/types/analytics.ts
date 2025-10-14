/**
 * Analytics Types
 * Shared types for analytics and tracking functionality
 */

export interface AnalyticsEvent {
  event: string;
  category: string;
  action: string;
  label?: string;
  value?: number;
  timestamp: Date;
  metadata?: Record<string, unknown>;
}

export interface ContentAnalyticsData {
  framework: string;
  topic: string;
  level?: string;
  contentId: string;
  contentType: "study" | "quiz";
}

export interface StudyAnalyticsData {
  framework: string;
  topic: string;
  level: string;
  questionId: string;
  timeSpent: number;
  difficulty: "easy" | "medium" | "hard";
  wasCorrect?: boolean;
}

export interface QuizAnalyticsData {
  quizId: string;
  framework: string;
  level: string;
  totalQuestions: number;
  correctAnswers: number;
  timeSpent: number;
  score: number;
  completed: boolean;
}

export interface UserBehaviorAnalyticsData {
  page: string;
  section?: string;
  action: string;
  element?: string;
  context?: Record<string, unknown>;
}

export type AnalyticsEventType =
  | "content_viewed"
  | "question_answered"
  | "quiz_completed"
  | "study_session_started"
  | "study_session_ended"
  | "plan_selected"
  | "checkout_initiated"
  | "payment_completed"
  | "user_behavior";
