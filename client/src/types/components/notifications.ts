/**
 * Notification Component Props & Types
 */

export interface INotificationPreferences {
  enabled: boolean;
  email: boolean;
  push: boolean;
  sms?: boolean;
  frequency?: "instant" | "daily" | "weekly" | "realtime";
  types?: {
    achievements?: boolean;
    streaks?: boolean;
    challenges?: boolean;
    social?: boolean;
  };
  // Direct property access (flattened for convenience)
  streak?: boolean;
  content?: boolean;
  challenges?: boolean;
  achievements?: boolean;
  subscription?: boolean;
  // Quiet hours
  quietHoursEnabled?: boolean;
  quietHoursStart?: string;
  quietHoursEnd?: string;
}

export interface INotificationPromptProps {
  show?: boolean;
  title?: string;
  description?: string;
  showBenefits?: boolean;
  variant?: "card" | "modal" | "banner";
  dismissible?: boolean;
  autoDismissDelay?: number;
}
