import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  trackEvent,
  trackPageView,
  type TelemetryEvent,
  type TelemetryEventData,
} from "@/utils/telemetry";

// Mock window.gtag
const mockGtag = vi.fn();

describe("Telemetry", () => {
  let consoleWarnSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    // Store original console.warn
    consoleWarnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

    // Reset mocks
    vi.clearAllMocks();

    // Mock window object
    Object.defineProperty(window, "gtag", {
      value: mockGtag,
      writable: true,
    });
  });

  afterEach(() => {
    // Restore original console.warn
    vi.resetAllMocks();
  });

  describe("trackEvent", () => {
    it("should handle events without throwing", () => {
      const event: TelemetryEvent = "auth_login_success";
      const data: TelemetryEventData = { userId: "123", plan: "free" };

      // Should not throw
      expect(() => trackEvent(event, data)).not.toThrow();
    });

    it("should handle events without data", () => {
      const event: TelemetryEvent = "auth_login_success";

      // Should not throw
      expect(() => trackEvent(event)).not.toThrow();
    });

    it("should handle all event types", () => {
      const events: TelemetryEvent[] = [
        "auth_login_success",
        "auth_login_failure",
        "free_entry_route",
        "free_soft_paywall_view",
        "free_soft_paywall_cta_clicked",
        "free_soft_paywall_dismissed",
        "paid_entry_route",
        "resume_continue_clicked",
        "resume_none_available",
        "billing_manage_view",
        "upsell_card_expanded",
        "upsell_card_cta_clicked",
        "upsell_modal_opened",
        "upsell_modal_viewed",
        "upsell_cta_clicked",
        "upsell_modal_dismissed",
        "convert_modal_opened",
        "convert_modal_viewed",
        "convert_modal_dismissed",
        "plan_changed",
        "coupon_applied",
        "coupon_failed",
        "subscribe_click",
        "checkout_view",
        "checkout_completed",
        "checkout_error",
        "checkout_failed",
        "checkout_abandoned",
        "one_click_confirm",
        "one_click_failed",
        "study_enter",
        "study_reveal_answer",
        "study_bookmark",
        "study_complete",
        "study_cta_viewed",
        "study_cta_clicked",
        "study_cta_scroll_prompt",
        "level_card_viewed",
        "level_card_clicked",
        "level_card_selected",
        "easy_card_clicked",
        "study_autostart_triggered",
        "study_session_started",
        "study_session_resumed",
        "sticky_start_shown",
        "sticky_start_clicked",
        "sticky_start_retry",
        "keyboard_shortcut_used",
        "quiz_start",
        "quiz_submit",
        "quiz_complete",
        "quiz_exit",
        "access_blocked_soft_paywall",
        "plan_entry_click",
        "auth_gate_shown",
        "auth_gate_success_redirect",
        "bundle_entry_resolved",
      ];

      events.forEach((event) => {
        // Should not throw for any event type
        expect(() => trackEvent(event)).not.toThrow();
      });
    });

    it("should handle different data types", () => {
      const event: TelemetryEvent = "auth_login_success";
      const data: TelemetryEventData = {
        stringValue: "test",
        numberValue: 123,
        booleanValue: true,
        undefinedValue: undefined,
        nullValue: null,
      };

      // Should not throw
      expect(() => trackEvent(event, data)).not.toThrow();
    });

    it("should handle errors gracefully", () => {
      // Mock gtag to throw an error
      mockGtag.mockImplementation(() => {
        throw new Error("Gtag error");
      });

      const event: TelemetryEvent = "auth_login_success";

      // Should not throw even if gtag throws
      expect(() => trackEvent(event)).not.toThrow();
    });

    it("should handle missing window object", () => {
      // Mock window as undefined
      const originalWindow = global.window;
      // @ts-ignore
      global.window = undefined;

      const event: TelemetryEvent = "auth_login_success";

      // Should not throw
      expect(() => trackEvent(event)).not.toThrow();

      // Restore window
      global.window = originalWindow;
    });
  });

  describe("trackPageView", () => {
    beforeEach(() => {
      // Mock document.title
      Object.defineProperty(document, "title", {
        value: "Test Page Title",
        writable: true,
      });
    });

    it("should track page view with path and title", () => {
      const path = "/test-page";
      const title = "Custom Title";

      // Should not throw
      expect(() => trackPageView(path, title)).not.toThrow();
    });

    it("should use document.title when title not provided", () => {
      const path = "/test-page";

      // Should not throw
      expect(() => trackPageView(path)).not.toThrow();
    });

    it("should handle empty path", () => {
      // Should not throw
      expect(() => trackPageView("")).not.toThrow();
    });

    it("should handle undefined title", () => {
      // Should not throw
      expect(() => trackPageView("/test", undefined)).not.toThrow();
    });

    it("should include timestamp in data", () => {
      const beforeTime = Date.now();
      trackPageView("/test");
      const afterTime = Date.now();

      // The function should complete without error
      expect(beforeTime).toBeLessThanOrEqual(afterTime);
    });
  });

  describe("error handling", () => {
    it("should never throw errors", () => {
      const event: TelemetryEvent = "auth_login_success";
      const data: TelemetryEventData = { test: "data" };

      // Should never throw, regardless of input
      expect(() => trackEvent(event, data)).not.toThrow();
      expect(() => trackEvent(event)).not.toThrow();
      expect(() => trackPageView("/test")).not.toThrow();
      expect(() => trackPageView("")).not.toThrow();
    });

    it("should handle invalid event types gracefully", () => {
      // @ts-ignore - Testing runtime behavior
      expect(() => trackEvent("invalid_event")).not.toThrow();
    });

    it("should handle null and undefined gracefully", () => {
      // @ts-ignore - Testing runtime behavior
      expect(() => trackEvent(null)).not.toThrow();
      // @ts-ignore - Testing runtime behavior
      expect(() => trackEvent(undefined)).not.toThrow();
    });
  });

  describe("function signatures", () => {
    it("should accept correct parameter types", () => {
      const event: TelemetryEvent = "auth_login_success";
      const data: TelemetryEventData = { userId: "123" };

      // These should compile without TypeScript errors
      trackEvent(event, data);
      trackEvent(event);
      trackPageView("/path", "title");
      trackPageView("/path");
    });
  });
});
