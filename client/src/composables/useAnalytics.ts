/**
 * Analytics Composable
 * Tracks content viewing, quiz interactions, and user events
 */

import { ref } from "vue";
import type { AnalyticsEvent, ContentAnalyticsData } from "@shared/types/analytics";

const events = ref<AnalyticsEvent[]>([]);
const isEnabled = ref(true);

/**
 * Generic event tracking
 */
function trackEvent(
  event: string,
  category: string,
  action: string,
  label?: string,
  value?: number,
  metadata?: Record<string, unknown>
) {
  if (!isEnabled.value) return;

  const analyticsEvent: AnalyticsEvent = {
    event,
    category,
    action,
    label,
    value,
    timestamp: new Date(),
    metadata,
  };

  events.value.push(analyticsEvent);

  // Log to console in development
  if (import.meta.env.DEV) {
    console.warn("[Analytics]", analyticsEvent);
  }

  // Send to analytics service (Google Analytics, Plausible, etc.)
  sendToAnalyticsProvider(analyticsEvent);
}

/**
 * Sends event to analytics provider
 */
function sendToAnalyticsProvider(event: AnalyticsEvent) {
  // Google Analytics 4
  if (typeof window !== "undefined" && (window as any).gtag) {
    (window as any).gtag("event", event.event, {
      event_category: event.category,
      event_label: event.label,
      value: event.value,
      ...event.metadata,
    });
  }

  // Plausible Analytics
  if (typeof window !== "undefined" && (window as any).plausible) {
    (window as any).plausible(event.event, {
      props: {
        category: event.category,
        action: event.action,
        label: event.label,
        ...event.metadata,
      },
    });
  }

  // Custom backend endpoint (optional)
  if (import.meta.env.VITE_ANALYTICS_ENDPOINT) {
    fetch(import.meta.env.VITE_ANALYTICS_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(event),
    }).catch(console.error);
  }
}

/**
 * Content Events
 */

/**
 * Tracks when a study item is viewed
 */
function trackStudyViewed(data: ContentAnalyticsData) {
  trackEvent(
    "content_study_viewed",
    "content",
    "study_viewed",
    `${data.framework}:${data.topic}`,
    undefined,
    {
      framework: data.framework,
      topic: data.topic,
      level: data.level,
      contentId: data.contentId,
    }
  );
}

/**
 * Tracks when a quiz is started
 */
function trackQuizViewed(data: ContentAnalyticsData) {
  trackEvent(
    "content_quiz_viewed",
    "content",
    "quiz_viewed",
    `${data.framework}:${data.topic}`,
    undefined,
    {
      framework: data.framework,
      topic: data.topic,
      level: data.level,
      contentId: data.contentId,
    }
  );
}

/**
 * Tracks when a question is answered
 */
function trackQuestionAnswered(
  data: ContentAnalyticsData & { isCorrect: boolean; timeSpent: number }
) {
  trackEvent(
    "content_question_answered",
    "content",
    "question_answered",
    `${data.framework}:${data.topic}`,
    data.timeSpent,
    {
      framework: data.framework,
      topic: data.topic,
      level: data.level,
      contentId: data.contentId,
      isCorrect: data.isCorrect,
      timeSpent: data.timeSpent,
    }
  );
}

/**
 * Tracks when an explanation is opened
 */
function trackExplanationOpened(data: ContentAnalyticsData) {
  trackEvent(
    "content_explanation_opened",
    "content",
    "explanation_opened",
    `${data.framework}:${data.topic}`,
    undefined,
    {
      framework: data.framework,
      topic: data.topic,
      level: data.level,
      contentId: data.contentId,
    }
  );
}

/**
 * Tracks quiz completion
 */
function trackQuizCompleted(
  data: ContentAnalyticsData & {
    score: number;
    totalQuestions: number;
    timeSpent: number;
  }
) {
  trackEvent(
    "content_quiz_completed",
    "content",
    "quiz_completed",
    `${data.framework}:${data.topic}`,
    data.score,
    {
      framework: data.framework,
      topic: data.topic,
      level: data.level,
      contentId: data.contentId,
      score: data.score,
      totalQuestions: data.totalQuestions,
      timeSpent: data.timeSpent,
      percentage: Math.round((data.score / data.totalQuestions) * 100),
    }
  );
}

/**
 * User Interaction Events
 */

/**
 * Tracks content bookmarking
 */
function trackContentBookmarked(data: ContentAnalyticsData & { action: "add" | "remove" }) {
  trackEvent(
    "content_bookmarked",
    "interaction",
    `bookmark_${data.action}`,
    `${data.framework}:${data.topic}`,
    undefined,
    {
      framework: data.framework,
      topic: data.topic,
      contentId: data.contentId,
      action: data.action,
    }
  );
}

/**
 * Tracks content sharing
 */
function trackContentShared(data: ContentAnalyticsData & { method: string }) {
  trackEvent(
    "content_shared",
    "interaction",
    "share",
    `${data.framework}:${data.topic}`,
    undefined,
    {
      framework: data.framework,
      topic: data.topic,
      contentId: data.contentId,
      method: data.method,
    }
  );
}

/**
 * Tracks framework selection
 */
function trackFrameworkSelected(framework: string) {
  trackEvent("framework_selected", "navigation", "select_framework", framework, undefined, {
    framework,
  });
}

/**
 * Tracks level/tier selection
 */
function trackLevelSelected(level: string) {
  trackEvent("level_selected", "navigation", "select_level", level, undefined, {
    level,
  });
}

/**
 * Page View Events
 */

/**
 * Tracks page views
 */
function trackPageView(path: string, title: string) {
  trackEvent("page_view", "navigation", "page_view", path, undefined, {
    path,
    title,
  });
}

/**
 * Utility Functions
 */

/**
 * Enables or disables analytics tracking
 */
function setAnalyticsEnabled(enabled: boolean) {
  isEnabled.value = enabled;
}

/**
 * Gets all tracked events (for debugging)
 */
function getEvents(): AnalyticsEvent[] {
  return events.value;
}

/**
 * Clears all tracked events
 */
function clearEvents() {
  events.value = [];
}

/**
 * Legacy method aliases for backward compatibility
 */

/**
 * Generic event tracking (legacy)
 * Simplified signature: trackGenericEvent(action, metadata?)
 */
function trackGenericEvent(action: string, metadata?: Record<string, unknown>) {
  trackEvent(action, "generic", action, undefined, undefined, metadata);
}

/**
 * Study event tracking (legacy)
 * Simplified signature: trackStudyEvent(action, metadata?)
 */
function trackStudyEvent(action: string, metadata?: Record<string, unknown>) {
  trackEvent(`study_${action}`, "study", action, undefined, undefined, metadata);
}

/**
 * useAnalytics Composable
 */
export function useAnalytics() {
  return {
    // Content Events
    trackStudyViewed,
    trackQuizViewed,
    trackQuestionAnswered,
    trackExplanationOpened,
    trackQuizCompleted,

    // User Interaction Events
    trackContentBookmarked,
    trackContentShared,
    trackFrameworkSelected,
    trackLevelSelected,

    // Page View Events
    trackPageView,

    // Generic Event Tracking
    trackEvent,

    // Legacy Compatibility
    trackGenericEvent,
    trackStudyEvent,

    // Utility
    setAnalyticsEnabled,
    getEvents,
    clearEvents,

    // State
    isEnabled,
    events,
  };
}
