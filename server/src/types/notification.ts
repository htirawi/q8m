/**
 * Notification Service Types
 */

/**
 * Notification payload structure
 */
export interface NotificationPayload {
  title: string;
  body: string;
  type?: string;
  icon?: string;
  image?: string;
  badge?: string;
  data?: Record<string, unknown>;
  click_action?: string;
  clickAction?: string;
  tag?: string;
}

/**
 * Notification metadata (platform and user agent info)
 */
export interface NotificationMetadata {
  platform: "web" | "ios" | "android";
  userAgent: string;
}

/**
 * Result of notification send operation
 */
export interface SendResult {
  success: boolean;
  successCount: number;
  failureCount: number;
  errors?: Array<{
    token: string;
    error: string;
  }>;
}
