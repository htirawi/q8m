export type OnboardingGoal =
  | 'get-job'
  | 'learn-framework'
  | 'interview-prep'
  | 'skill-improvement'
  | 'certification';

export type ExperienceLevel = 'junior' | 'intermediate' | 'senior';

export type Framework =
  | 'react'
  | 'vue'
  | 'angular'
  | 'nextjs'
  | 'redux'
  | 'typescript'
  | 'javascript'
  | 'node'
  | 'express';

export interface OnboardingPreferences {
  goal: OnboardingGoal;
  experienceLevel: ExperienceLevel;
  frameworks: Framework[];
  dailyGoal?: number; // minutes per day
  availableDaysPerWeek?: number;
  preferredStudyTime?: 'morning' | 'afternoon' | 'evening' | 'night';
  completedAt?: Date;
}

export interface OnboardingStep {
  step: number;
  title: string;
  description: string;
  isCompleted: boolean;
}

export interface OnboardingState {
  currentStep: number;
  totalSteps: number;
  preferences: Partial<OnboardingPreferences>;
  isCompleted: boolean;
  startedAt?: Date;
  completedAt?: Date;
}
