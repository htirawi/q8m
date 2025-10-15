/**
 * Analytics Types
 * Shared types for analytics and tracking functionality
 */

import type { PlanTier } from './plan';

export type DeviceType = 'mobile' | 'tablet' | 'desktop';
export type Locale = 'en' | 'ar';

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

// Enhanced Analytics Event Types for Conversion Tracking
interface BaseEventProperties {
  plan: PlanTier;
  locale: Locale;
  rtl: boolean;
  device: DeviceType;
  sessionId: string;
}

export interface ModeChooserViewedEvent extends BaseEventProperties {
  event: 'mode_chooser_viewed';
  difficulty?: string;
}

export interface StudyStartedEvent extends BaseEventProperties {
  event: 'study_started';
  difficulty: 'easy' | 'medium' | 'hard';
  practiceMode: 'sequential' | 'random' | 'bookmarked';
}

export interface StudyGateShownEvent extends BaseEventProperties {
  event: 'study_gate_shown';
  reason: 'difficulty_locked' | 'daily_limit';
  difficulty: string;
  suggestedPlan: PlanTier;
}

export interface ConvertOpenedEvent extends BaseEventProperties {
  event: 'convert_opened';
  source: 'study_gate' | 'quiz_gate' | 'pricing_page';
  suggestedPlan: PlanTier;
}

export interface CheckoutCompletedEvent extends BaseEventProperties {
  event: 'checkout_completed';
  targetPlan: PlanTier;
  billingCycle: 'monthly' | 'annual';
  price: number;
}
