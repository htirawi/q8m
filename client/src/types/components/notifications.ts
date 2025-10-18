/**
 * Notification Component Props & Types
 */

export interface INotificationPreferences {
  enabled: boolean;
  email: boolean;
  push: boolean;
  sms?: boolean;
  frequency?: "instant" | "daily" | "weekly";
  types?: {
    achievements?: boolean;
    streaks?: boolean;
    challenges?: boolean;
    social?: boolean;
  };
}

export interface INotificationPromptProps {
  show?: boolean;
  title?: string;
  description?: string;
  showBenefits?: boolean;
  variant?: "default" | "minimal" | "feature";
}
