/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-console */
import type { App } from 'vue';
import type { Router } from 'vue-router';
import { analytics, EventCategory, EventAction } from '@/services/analytics';

export interface AnalyticsPluginOptions {
  debug?: boolean;
  googleAnalyticsId?: string;
  customApiEndpoint?: string;
  customApiKey?: string;
  router?: Router;
  autoTrackPageViews?: boolean;
  autoTrackPerformance?: boolean;
  batchSize?: number;
  batchInterval?: number;
}

/**
 * Vue Analytics Plugin
 * Provides global analytics tracking throughout the application
 */
export default {
  install(app: App, options: AnalyticsPluginOptions = {}) {
    // Initialize analytics service
    const initializeAnalytics = async () => {
      const providers: Record<string, any> = {};

      // Add Google Analytics provider if ID provided
      if (options.googleAnalyticsId) {
        providers.google = {
          measurementId: options.googleAnalyticsId
        };
      }

      // Add custom API provider if endpoint provided
      if (options.customApiEndpoint) {
        providers.custom = {
          endpoint: options.customApiEndpoint,
          apiKey: options.customApiKey
        };
      }

      await analytics.initialize({
        providers,
        debug: options.debug,
        batchSize: options.batchSize,
        batchInterval: options.batchInterval
      });

      // Setup router tracking if router provided
      if (options.router && options.autoTrackPageViews !== false) {
        analytics.setupRouterTracking(options.router);
      }

      // Setup performance tracking
      if (options.autoTrackPerformance !== false) {
        setupPerformanceTracking();
      }

      // Track initial page load
      analytics.page();
    };

    // Initialize analytics
    initializeAnalytics().catch(console.error);

    // Provide analytics via inject
    app.provide('analytics', analytics);

    // Add global properties
    app.config.globalProperties.$analytics = analytics;
    app.config.globalProperties.$track = analytics.track.bind(analytics);

    // Add convenient tracking methods
    app.config.globalProperties.$trackClick = (
      elementName: string,
      properties?: Record<string, any>
    ) => {
      analytics.track(`${elementName}_clicked`, properties, {
        category: EventCategory.Engagement,
        action: EventAction.Click
      });
    };

    app.config.globalProperties.$trackView = (
      viewName: string,
      properties?: Record<string, any>
    ) => {
      analytics.track(`${viewName}_viewed`, properties, {
        category: EventCategory.Navigation,
        action: EventAction.View
      });
    };

    app.config.globalProperties.$trackError = (
      error: Error | string,
      context?: Record<string, any>
    ) => {
      analytics.trackError(error, context);
    };

    // Add directive for click tracking
    app.directive('track-click', {
      mounted(el: HTMLElement, binding) {
        const eventName = binding.arg || 'element_clicked';
        const properties = binding.value || {};

        el.addEventListener('click', () => {
          analytics.track(eventName, {
            ...properties,
            element_tag: el.tagName.toLowerCase(),
            element_text: el.textContent?.trim().substring(0, 50),
            element_classes: el.className
          }, {
            category: EventCategory.Engagement,
            action: EventAction.Click
          });
        });
      }
    });

    // Add directive for visibility tracking
    app.directive('track-view', {
      mounted(el: HTMLElement, binding) {
        const eventName = binding.arg || 'element_viewed';
        const properties = binding.value || {};
        let hasBeenVisible = false;

        const observer = new IntersectionObserver(
          (entries) => {
            entries.forEach(entry => {
              if (entry.isIntersecting && !hasBeenVisible) {
                hasBeenVisible = true;
                analytics.track(eventName, {
                  ...properties,
                  element_tag: el.tagName.toLowerCase(),
                  viewport_percentage: Math.round(entry.intersectionRatio * 100)
                }, {
                  category: EventCategory.Engagement,
                  action: EventAction.View
                });
              }
            });
          },
          {
            threshold: 0.5 // Trigger when 50% visible
          }
        );

        observer.observe(el);

        // Cleanup on unmount
        (el as any)._visibilityObserver = observer;
      },
      unmounted(el: HTMLElement) {
        const observer = (el as any)._visibilityObserver;
        if (observer) {
          observer.disconnect();
          delete (el as any)._visibilityObserver;
        }
      }
    });
  }
};

/**
 * Setup automatic performance tracking
 */
function setupPerformanceTracking() {
  // Track Web Vitals
  if ('PerformanceObserver' in window) {
    // Track Largest Contentful Paint (LCP)
    try {
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1] as any;
        analytics.trackPerformance({
          lcp: Math.round(lastEntry.renderTime || lastEntry.loadTime)
        });
      });
      lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });
    } catch (e) {
      // LCP observer not supported
    }

    // Track First Input Delay (FID)
    try {
      const fidObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const firstEntry = entries[0] as any;
        analytics.trackPerformance({
          fid: Math.round(firstEntry.processingStart - firstEntry.startTime)
        });
      });
      fidObserver.observe({ type: 'first-input', buffered: true });
    } catch (e) {
      // FID observer not supported
    }

    // Track Cumulative Layout Shift (CLS)
    let clsValue = 0;
    let clsEntries: any[] = [];

    try {
      const clsObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries() as any[]) {
          if (!entry.hadRecentInput) {
            const firstSessionEntry = clsEntries[0];
            const lastSessionEntry = clsEntries[clsEntries.length - 1];

            if (
              entry.startTime - lastSessionEntry?.endTime < 1000 &&
              entry.startTime - firstSessionEntry?.startTime < 5000
            ) {
              clsValue += entry.value;
              clsEntries.push(entry);
            } else {
              clsValue = entry.value;
              clsEntries = [entry];
            }
          }
        }

        // Report CLS when it stabilizes
        if (clsEntries.length > 0) {
          analytics.trackPerformance({
            cls: Math.round(clsValue * 1000) / 1000
          });
        }
      });
      clsObserver.observe({ type: 'layout-shift', buffered: true });
    } catch (e) {
      // CLS observer not supported
    }
  }

  // Track page load performance
  window.addEventListener('load', () => {
    setTimeout(() => {
      const perfData = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      if (perfData) {
        analytics.trackPerformance({
          ttfb: Math.round(perfData.responseStart - perfData.requestStart),
          fcp: Math.round(perfData.responseStart),
          tti: Math.round(perfData.domInteractive - perfData.fetchStart)
        });

        // Track page load timing
        analytics.trackTiming(
          'page',
          'load',
          Math.round(perfData.loadEventEnd - perfData.fetchStart),
          window.location.pathname
        );
      }
    }, 0);
  });

  // Track errors
  window.addEventListener('error', (event) => {
    analytics.trackError(event.error || event.message, {
      filename: event.filename,
      line: event.lineno,
      column: event.colno,
      type: 'uncaught_error'
    });
  });

  window.addEventListener('unhandledrejection', (event) => {
    analytics.trackError(event.reason, {
      type: 'unhandled_rejection',
      promise: event.promise?.toString()
    });
  });
}

// Export types for use in components
export { analytics, EventCategory, EventAction };

// TypeScript module augmentation
declare module '@vue/runtime-core' {
  export interface ComponentCustomProperties {
    $analytics: typeof analytics;
    $track: typeof analytics.track;
    $trackClick: (elementName: string, properties?: Record<string, any>) => void;
    $trackView: (viewName: string, properties?: Record<string, any>) => void;
    $trackError: (error: Error | string, context?: Record<string, any>) => void;
  }
}