/**
 * Analytics Service - Comprehensive tracking for Q8M Platform
 * Supports multiple providers: Google Analytics, Custom API, Console (dev)
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-console */

import { ref, type Ref } from "vue";
import type { Router } from "vue-router";

// Event categories
export enum EventCategory {
  Navigation = "navigation",
  Authentication = "authentication",
  UserMenu = "user_menu",
  LevelSelection = "level_selection",
  Gamification = "gamification",
  Monetization = "monetization",
  Performance = "performance",
  Accessibility = "accessibility",
  Error = "error",
  Engagement = "engagement",
}

// Event actions
export enum EventAction {
  Click = "click",
  View = "view",
  Submit = "submit",
  Change = "change",
  Complete = "complete",
  Skip = "skip",
  Open = "open",
  Close = "close",
  Hover = "hover",
  Scroll = "scroll",
  Load = "load",
  Error = "error",
}

// Common event properties interface
export interface CommonEventProperties {
  timestamp?: number;
  session_id?: string;
  user_id?: string;
  locale?: string;
  viewport?: "mobile" | "tablet" | "desktop";
  browser?: string;
  os?: string;
  referrer?: string;
  page_path?: string;
  page_title?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
}

// User properties interface
export interface UserProperties {
  user_id: string;
  email_domain?: string;
  plan_tier?: "free" | "pro" | "team";
  account_age_days?: number;
  total_sessions?: number;
  preferred_locale?: "en" | "ar";
  preferred_difficulty?: "junior" | "intermediate" | "senior";
  courses_completed?: number;
  achievement_level?: number;
}

// Performance metrics interface
export interface PerformanceMetrics {
  lcp?: number; // Largest Contentful Paint
  fid?: number; // First Input Delay
  cls?: number; // Cumulative Layout Shift
  fcp?: number; // First Contentful Paint
  ttfb?: number; // Time to First Byte
  tti?: number; // Time to Interactive
}

// Event interface
export interface AnalyticsEvent {
  name: string;
  category?: EventCategory;
  action?: EventAction;
  label?: string;
  value?: number;
  properties?: Record<string, any>;
  user_properties?: Partial<UserProperties>;
}

// Analytics provider interface
export interface AnalyticsProvider {
  initialize(config: any): Promise<void>;
  track(event: AnalyticsEvent): void;
  identify(userId: string, properties?: Partial<UserProperties>): void;
  page(properties?: Record<string, any>): void;
  setUserProperties(properties: Partial<UserProperties>): void;
  reset(): void;
}

// Main Analytics Service
class AnalyticsService {
  private providers: Map<string, AnalyticsProvider> = new Map();
  private isInitialized = false;
  private eventQueue: AnalyticsEvent[] = [];
  private sessionId: string;
  private userId: Ref<string | null> = ref(null);
  private userProperties: Partial<UserProperties> = {};
  private commonProperties: CommonEventProperties = {};
  private debug = false;
  private batchTimer: number | null = null;
  private batchSize = 20;
  private batchInterval = 5000; // 5 seconds

  constructor() {
    this.sessionId = this.generateSessionId();
    this.initializeCommonProperties();
  }

  /**
   * Initialize analytics with configuration
   */
  async initialize(
    config: {
      providers?: Record<string, any>;
      debug?: boolean;
      batchSize?: number;
      batchInterval?: number;
    } = {}
  ) {
    this.debug = config.debug || import.meta.env.DEV;
    this.batchSize = config.batchSize || this.batchSize;
    this.batchInterval = config.batchInterval || this.batchInterval;

    // Initialize providers
    if (config.providers) {
      for (const [name, providerConfig] of Object.entries(config.providers)) {
        const provider = await this.createProvider(name, providerConfig);
        if (provider) {
          this.providers.set(name, provider);
        }
      }
    }

    // Always add console provider in debug mode
    if (this.debug) {
      this.providers.set("console", new ConsoleProvider());
    }

    this.isInitialized = true;

    // Process queued events
    this.flushEventQueue();

    // Start batch timer
    this.startBatchTimer();

    if (this.debug) {
      console.log("🎯 Analytics initialized", {
        providers: Array.from(this.providers.keys()),
        sessionId: this.sessionId,
      });
    }
  }

  /**
   * Track an event
   */
  track(
    eventName: string,
    properties?: Record<string, any>,
    options?: {
      category?: EventCategory;
      action?: EventAction;
      label?: string;
      value?: number;
    }
  ) {
    const event: AnalyticsEvent = {
      name: eventName,
      category: options?.category,
      action: options?.action,
      label: options?.label,
      value: options?.value,
      properties: {
        ...this.commonProperties,
        ...properties,
        timestamp: Date.now(),
        session_id: this.sessionId,
      },
    };

    if (this.userId.value) {
      event.properties!.user_id = this.userId.value;
    }

    // Add to queue
    this.eventQueue.push(event);

    // Process immediately if initialized, otherwise queue
    if (this.isInitialized) {
      this.processEvent(event);

      // Flush batch if size exceeded
      if (this.eventQueue.length >= this.batchSize) {
        this.flushBatch();
      }
    }
  }

  /**
   * Track page view
   */
  page(properties?: Record<string, any>) {
    const pageProperties = {
      ...this.commonProperties,
      ...properties,
      page_path: window.location.pathname,
      page_title: document.title,
      referrer: document.referrer,
    };

    this.providers.forEach((provider) => {
      provider.page(pageProperties);
    });

    this.track("page_view", pageProperties, {
      category: EventCategory.Navigation,
      action: EventAction.View,
    });
  }

  /**
   * Identify user
   */
  identify(userId: string, properties?: Partial<UserProperties>) {
    this.userId.value = userId;
    this.userProperties = { ...this.userProperties, ...properties };

    this.providers.forEach((provider) => {
      provider.identify(userId, this.userProperties);
    });

    if (this.debug) {
      console.log("👤 User identified", { userId, properties });
    }
  }

  /**
   * Set user properties
   */
  setUserProperties(properties: Partial<UserProperties>) {
    this.userProperties = { ...this.userProperties, ...properties };

    this.providers.forEach((provider) => {
      provider.setUserProperties(properties);
    });
  }

  /**
   * Track performance metrics
   */
  trackPerformance(metrics: PerformanceMetrics) {
    this.track(
      "performance_metric",
      {
        ...metrics,
        page_path: window.location.pathname,
      },
      {
        category: EventCategory.Performance,
        action: EventAction.Load,
      }
    );
  }

  /**
   * Track error
   */
  trackError(error: Error | string, context?: Record<string, any>) {
    const errorMessage = error instanceof Error ? error.message : error;
    const errorStack = error instanceof Error ? error.stack : undefined;

    this.track(
      "error_occurred",
      {
        error_message: errorMessage,
        error_stack: errorStack,
        ...context,
      },
      {
        category: EventCategory.Error,
        action: EventAction.Error,
      }
    );
  }

  /**
   * Track timing
   */
  trackTiming(category: string, variable: string, value: number, label?: string) {
    this.track("timing", {
      timing_category: category,
      timing_variable: variable,
      timing_value: value,
      timing_label: label,
    });
  }

  /**
   * Reset analytics (on logout)
   */
  reset() {
    this.userId.value = null;
    this.userProperties = {};
    this.sessionId = this.generateSessionId();

    this.providers.forEach((provider) => {
      provider.reset();
    });

    if (this.debug) {
      console.log("🔄 Analytics reset");
    }
  }

  /**
   * Setup router tracking
   */
  setupRouterTracking(router: Router) {
    router.afterEach((to, from) => {
      // Track page view
      this.page({
        page_path: to.path,
        page_name: to.name?.toString(),
        from_path: from.path,
        from_name: from.name?.toString(),
      });

      // Track navigation
      this.track(
        "navigation",
        {
          to: to.path,
          from: from.path,
          method: to.params.fromClick ? "click" : "programmatic",
        },
        {
          category: EventCategory.Navigation,
          action: EventAction.Change,
        }
      );
    });
  }

  // Private methods

  private async createProvider(name: string, config: any): Promise<AnalyticsProvider | null> {
    switch (name) {
      case "google":
        return new GoogleAnalyticsProvider(config);
      case "custom":
        return new CustomAPIProvider(config);
      case "console":
        return new ConsoleProvider();
      default:
        console.warn(`Unknown analytics provider: ${name}`);
        return null;
    }
  }

  private processEvent(event: AnalyticsEvent) {
    this.providers.forEach((provider) => {
      try {
        provider.track(event);
      } catch (error) {
        console.error(`Analytics provider error:`, error);
      }
    });
  }

  private flushEventQueue() {
    while (this.eventQueue.length > 0) {
      const event = this.eventQueue.shift();
      if (event) {
        this.processEvent(event);
      }
    }
  }

  private flushBatch() {
    if (this.eventQueue.length === 0) return;

    const batch = this.eventQueue.splice(0, this.batchSize);

    // Send batch to custom API if available
    const customProvider = this.providers.get("custom") as CustomAPIProvider;
    if (customProvider) {
      customProvider.sendBatch(batch);
    }

    if (this.debug) {
      console.log(`📊 Flushed ${batch.length} events`);
    }
  }

  private startBatchTimer() {
    if (this.batchTimer) {
      clearInterval(this.batchTimer);
    }

    this.batchTimer = window.setInterval(() => {
      this.flushBatch();
    }, this.batchInterval);
  }

  private generateSessionId(): string {
    // Use crypto.randomUUID() for secure random session ID
    if (typeof crypto !== "undefined" && crypto.randomUUID) {
      return `sess_${Date.now()}_${crypto.randomUUID()}`;
    }
    // Fallback for older browsers - use Web Crypto API
    if (typeof crypto !== "undefined" && crypto.getRandomValues) {
      const array = new Uint32Array(2);
      crypto.getRandomValues(array);
      return `sess_${Date.now()}_${(array[0] ?? 0).toString(36)}${(array[1] ?? 0).toString(36)}`;
    }
    // Last resort fallback (should rarely be needed in modern browsers)
    return `sess_${Date.now()}_${Date.now().toString(36)}`;
  }

  private initializeCommonProperties() {
    this.commonProperties = {
      locale: document.documentElement.lang || "en",
      viewport: this.getViewport(),
      browser: this.getBrowser(),
      os: this.getOS(),
      referrer: document.referrer,
      page_path: window.location.pathname,
      page_title: document.title,
    };

    // Parse UTM parameters
    const urlParams = new URLSearchParams(window.location.search);
    this.commonProperties.utm_source = urlParams.get("utm_source") || undefined;
    this.commonProperties.utm_medium = urlParams.get("utm_medium") || undefined;
    this.commonProperties.utm_campaign = urlParams.get("utm_campaign") || undefined;
  }

  private getViewport(): "mobile" | "tablet" | "desktop" {
    const width = window.innerWidth;
    if (width < 768) return "mobile";
    if (width < 1024) return "tablet";
    return "desktop";
  }

  private getBrowser(): string {
    const ua = navigator.userAgent;
    if (ua.includes("Chrome")) return "Chrome";
    if (ua.includes("Safari")) return "Safari";
    if (ua.includes("Firefox")) return "Firefox";
    if (ua.includes("Edge")) return "Edge";
    return "Other";
  }

  private getOS(): string {
    const ua = navigator.userAgent;
    if (ua.includes("Windows")) return "Windows";
    if (ua.includes("Mac")) return "macOS";
    if (ua.includes("Linux")) return "Linux";
    if (ua.includes("Android")) return "Android";
    if (ua.includes("iOS")) return "iOS";
    return "Other";
  }
}

// Provider implementations

class GoogleAnalyticsProvider implements AnalyticsProvider {
  private gtag: any;

  constructor(private config: { measurementId: string }) {}

  async initialize() {
    // Load gtag script if not already loaded
    if (!window.gtag) {
      const script = document.createElement("script");
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${this.config.measurementId}`;
      document.head.appendChild(script);

      await new Promise<void>((resolve) => {
        script.onload = () => resolve();
      });
    }

    // Initialize gtag
    window.dataLayer = window.dataLayer || [];
    this.gtag = function () {
      window.dataLayer.push(arguments);
    };
    this.gtag("js", new Date());
    this.gtag("config", this.config.measurementId);
  }

  track(event: AnalyticsEvent) {
    if (!this.gtag) return;

    this.gtag("event", event.name, {
      event_category: event.category,
      event_label: event.label,
      value: event.value,
      ...event.properties,
    });
  }

  identify(userId: string, properties?: Partial<UserProperties>) {
    if (!this.gtag) return;

    this.gtag("set", { user_id: userId });
    if (properties) {
      this.gtag("set", "user_properties", properties);
    }
  }

  page(properties?: Record<string, any>) {
    if (!this.gtag) return;

    this.gtag("event", "page_view", properties);
  }

  setUserProperties(properties: Partial<UserProperties>) {
    if (!this.gtag) return;

    this.gtag("set", "user_properties", properties);
  }

  reset() {
    // GA doesn't have a built-in reset, but we can clear the user_id
    if (this.gtag) {
      this.gtag("set", { user_id: null });
    }
  }
}

class CustomAPIProvider implements AnalyticsProvider {
  private queue: AnalyticsEvent[] = [];
  private flushTimer: number | null = null;

  constructor(private config: { endpoint: string; apiKey?: string }) {}

  async initialize() {
    // Custom initialization if needed
  }

  track(event: AnalyticsEvent) {
    this.queue.push(event);
    this.scheduleFlush();
  }

  identify(userId: string, properties?: Partial<UserProperties>) {
    this.track({
      name: "identify",
      properties: {
        user_id: userId,
        ...properties,
      },
    });
  }

  page(properties?: Record<string, any>) {
    this.track({
      name: "page_view",
      category: EventCategory.Navigation,
      properties,
    });
  }

  setUserProperties(properties: Partial<UserProperties>) {
    this.track({
      name: "user_properties_updated",
      properties,
    });
  }

  reset() {
    this.queue = [];
    if (this.flushTimer) {
      clearTimeout(this.flushTimer);
      this.flushTimer = null;
    }
  }

  async sendBatch(events: AnalyticsEvent[]) {
    if (events.length === 0) return;

    try {
      const response = await fetch(this.config.endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(this.config.apiKey && { "X-API-Key": this.config.apiKey }),
        },
        body: JSON.stringify({ events }),
      });

      if (!response.ok) {
        throw new Error(`Analytics API error: ${response.status}`);
      }
    } catch (error) {
      console.error("Failed to send analytics batch:", error);
      // Could implement retry logic here
    }
  }

  private scheduleFlush() {
    if (this.flushTimer) return;

    this.flushTimer = window.setTimeout(() => {
      this.flush();
      this.flushTimer = null;
    }, 1000);
  }

  private async flush() {
    if (this.queue.length === 0) return;

    const batch = [...this.queue];
    this.queue = [];
    await this.sendBatch(batch);
  }
}

class ConsoleProvider implements AnalyticsProvider {
  private groupColors = {
    [EventCategory.Navigation]: "#3B82F6",
    [EventCategory.Authentication]: "#10B981",
    [EventCategory.UserMenu]: "#8B5CF6",
    [EventCategory.LevelSelection]: "#F59E0B",
    [EventCategory.Gamification]: "#EC4899",
    [EventCategory.Monetization]: "#14B8A6",
    [EventCategory.Performance]: "#6366F1",
    [EventCategory.Accessibility]: "#84CC16",
    [EventCategory.Error]: "#EF4444",
    [EventCategory.Engagement]: "#06B6D4",
  };

  async initialize() {
    console.log("📊 Console Analytics Provider initialized");
  }

  track(event: AnalyticsEvent) {
    const color = event.category ? this.groupColors[event.category] : "#6B7280";

    console.groupCollapsed(`%c📊 ${event.name}`, `color: ${color}; font-weight: bold;`);

    if (event.category) console.log("Category:", event.category);
    if (event.action) console.log("Action:", event.action);
    if (event.label) console.log("Label:", event.label);
    if (event.value !== undefined) console.log("Value:", event.value);
    if (event.properties) console.table(event.properties);

    console.groupEnd();
  }

  identify(userId: string, properties?: Partial<UserProperties>) {
    console.log("%c👤 User Identified", "color: #10B981; font-weight: bold;", {
      userId,
      properties,
    });
  }

  page(properties?: Record<string, any>) {
    console.log("%c📄 Page View", "color: #3B82F6; font-weight: bold;", properties);
  }

  setUserProperties(properties: Partial<UserProperties>) {
    console.log("%c👤 User Properties Updated", "color: #8B5CF6; font-weight: bold;", properties);
  }

  reset() {
    console.log("%c🔄 Analytics Reset", "color: #EF4444; font-weight: bold;");
  }
}

// Export singleton instance
export const analytics = new AnalyticsService();

// Declare global types
declare global {
  interface Window {
    gtag: any;
    dataLayer: any[];
  }
}
