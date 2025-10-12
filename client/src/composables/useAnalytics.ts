/**
 * Analytics Composable
 * Provides type-safe analytics event tracking with automatic metadata injection
 *
 * Usage:
 * const { trackStudyEvent } = useAnalytics();
 * trackStudyEvent('study_cta_clicked', { hasSelection: true, difficulty: 'easy' });
 */

import { useRoute } from "vue-router";
import { useI18n } from "vue-i18n";
import { trackEvent, type TelemetryEvent } from "@/utils/telemetry";

/**
 * Study page specific analytics events
 * Note: locale, rtl, route, and timestamp are automatically injected by the composable
 */
export interface IStudyAnalyticsEvents {
  study_cta_viewed: Record<string, never>; // No additional data needed
  study_cta_clicked: {
    hasSelection: boolean;
    difficulty?: string;
    source?: 'inline' | 'sticky';
  };
  study_cta_scroll_prompt: Record<string, never>; // No additional data needed
  level_card_viewed: {
    difficulty: string;
    isLocked: boolean;
    requiredPlan?: string;
  };
  level_card_clicked: {
    difficulty: string;
    isLocked: boolean;
    requiredPlan?: string;
  };
  level_card_selected: {
    difficulty: string;
  };
  // One-click start events
  easy_card_clicked: {
    source: 'study-page' | 'dashboard';
  };
  study_autostart_triggered: {
    autostart: boolean;
  };
  study_session_started: {
    mode: string;
    resumed: boolean;
  };
  study_session_resumed: {
    difficulty: string;
    questionIndex: number;
  };
  sticky_start_shown: {
    reason: 'autostart_disabled' | 'slow_network' | 'preference';
  };
  sticky_start_clicked: {
    difficulty: string;
  };
  sticky_start_retry: {
    difficulty: string;
  };
  keyboard_shortcut_used: {
    key: string;
    action: string;
  };
  // Upsell events
  upsell_modal_opened: {
    difficulty: string;
    requiredPlan: string;
    source: 'level_card' | 'feature_gate';
  };
  upsell_modal_viewed: {
    difficulty: string;
    requiredPlan: string;
  };
  upsell_cta_clicked: {
    action: 'upgrade' | 'view_plans' | 'maybe_later';
    difficulty: string;
    requiredPlan: string;
  };
  upsell_modal_dismissed: {
    difficulty: string;
    requiredPlan: string;
    method: 'esc' | 'backdrop' | 'close_button' | 'maybe_later_button';
  };
}

/**
 * Common metadata injected into all events
 */
interface IEventMetadata {
  locale: string;
  rtl: boolean;
  route: string;
  timestamp: number;
  userAgent?: string;
}

export function useAnalytics() {
  const route = useRoute();
  const { locale } = useI18n();

  /**
   * Get common metadata for all events
   */
  const getMetadata = (): IEventMetadata => ({
    locale: locale.value,
    rtl: locale.value === 'ar',
    route: route.fullPath,
    timestamp: Date.now(),
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
  });

  /**
   * Track a study-specific analytics event
   */
  const trackStudyEvent = <K extends keyof IStudyAnalyticsEvents>(
    eventName: K,
    eventData: IStudyAnalyticsEvents[K]
  ): void => {
    const metadata = getMetadata();

    trackEvent(eventName, {
      ...eventData,
      ...metadata,
    });
  };

  /**
   * Track a generic analytics event (bypasses type checking)
   * Use trackStudyEvent for type-safe study events
   */
  const trackGenericEvent = (
    eventName: string,
    eventData: Record<string, unknown> = {}
  ): void => {
    const metadata = getMetadata();

    // Type assertion to bypass strict type checking for generic events
    trackEvent(eventName as unknown as TelemetryEvent, {
      ...eventData,
      ...metadata,
    });
  };

  return {
    trackStudyEvent,
    trackGenericEvent,
    getMetadata,
  };
}
