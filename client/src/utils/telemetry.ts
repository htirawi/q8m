/**
 * Telemetry Utility
 * Lightweight analytics event tracking
 * Fire-and-forget with no vendor lock-in
 */

export type TelemetryEvent =
  // Auth events
  | "auth_login_success"
  | "auth_login_failure"
  // Free plan events
  | "free_entry_route"
  | "free_soft_paywall_view"
  | "free_soft_paywall_cta_clicked"
  | "free_soft_paywall_dismissed"
  // Paid plan events
  | "paid_entry_route"
  | "resume_continue_clicked"
  | "resume_none_available"
  | "billing_manage_view"
  // Upsell events
  | "upsell_card_expanded"
  | "upsell_card_cta_clicked"
  | "upsell_modal_opened"
  | "upsell_modal_viewed"
  | "upsell_cta_clicked"
  | "upsell_modal_dismissed"
  // Convert modal events
  | "convert_modal_opened"
  | "convert_modal_viewed"
  | "convert_modal_dismissed"
  | "plan_changed"
  | "coupon_applied"
  | "coupon_failed"
  | "subscribe_click"
  | "checkout_view"
  | "checkout_completed"
  | "checkout_error"
  | "checkout_failed"
  | "checkout_abandoned"
  | "one_click_confirm"
  | "one_click_failed"
  // Study mode events
  | "study_enter"
  | "study_reveal_answer"
  | "study_bookmark"
  | "study_complete"
  | "study_cta_viewed"
  | "study_cta_clicked"
  | "study_cta_scroll_prompt"
  | "level_card_viewed"
  | "level_card_clicked"
  | "level_card_selected"
  // One-click start flow events
  | "easy_card_clicked"
  | "study_autostart_triggered"
  | "study_session_started"
  | "study_session_resumed"
  | "sticky_start_shown"
  | "sticky_start_clicked"
  | "sticky_start_retry"
  | "keyboard_shortcut_used"
  // Quiz mode events
  | "quiz_start"
  | "quiz_submit"
  | "quiz_complete"
  | "quiz_exit"
  // Access control events
  | "access_blocked_soft_paywall"
  // Plan entry and intent events
  | "plan_entry_click"
  | "auth_gate_shown"
  | "auth_gate_success_redirect"
  | "bundle_entry_resolved";

export interface TelemetryEventData {
  [key: string]: string | number | boolean | undefined | null;
}

/**
 * Track an analytics event
 * Non-blocking, fails silently
 */
export function trackEvent(event: TelemetryEvent, data?: TelemetryEventData): void {
  try {
    // In production, this would send to your analytics service
    // For now, we'll use console.warn in dev and gtag in prod if available
    if (import.meta.env.DEV) {
      console.warn(`[Telemetry] ${event}`, data);
    }

    // Try to send to Google Analytics if available
    if (
      import.meta.env.PROD &&
      typeof window !== "undefined" &&
      "gtag" in window
    ) {
      const { gtag } = window as {
        gtag: (
          command: string,
          eventName: string,
          eventParams?: Record<string, unknown>
        ) => void;
      };
      gtag("event", event, data);
    }

    // You can add other analytics providers here (e.g., Mixpanel, PostHog, etc.)
  } catch (error) {
    // Silently fail - never block user experience for analytics
    if (import.meta.env.DEV) {
      console.warn("[Telemetry] Failed to track event:", error);
    }
  }
}

/**
 * Track page view
 */
export function trackPageView(path: string, title?: string): void {
  trackEvent("free_entry_route" as TelemetryEvent, {
    path,
    title: title || document.title,
    timestamp: Date.now(),
  });
}
