/**
 * Analytics Composable
 * Type-safe analytics tracking with automatic metadata injection
 */

import { useI18n } from 'vue-i18n';
import { usePlanStore } from '@/stores/plan';
import type { DeviceType } from '@shared/types/analytics';

// Generate a unique session ID that persists for the session
let sessionId = '';
if (typeof window !== 'undefined') {
  sessionId = sessionStorage.getItem('analytics_session_id') || generateSessionId();
  sessionStorage.setItem('analytics_session_id', sessionId);
}

function generateSessionId(): string {
  // Use crypto.getRandomValues for cryptographically secure randomness
  const array = new Uint32Array(2);
  crypto.getRandomValues(array);
  return `${Date.now()}-${array[0].toString(36)}${array[1].toString(36)}`;
}

export function useAnalytics() {
  const { locale } = useI18n();
  const planStore = usePlanStore();

  /**
   * Get device type based on viewport width
   */
  const getDevice = (): DeviceType => {
    if (typeof window === 'undefined') return 'desktop';
    if (window.innerWidth < 768) return 'mobile';
    if (window.innerWidth < 1024) return 'tablet';
    return 'desktop';
  };

  /**
   * Get base properties that are automatically added to every event
   */
  const getBaseProperties = () => ({
    plan: planStore.planTier,
    locale: locale.value as 'en' | 'ar',
    rtl: locale.value === 'ar',
    device: getDevice(),
    sessionId,
    timestamp: Date.now(),
  });

  /**
   * Track an analytics event
   * @param event - Event name
   * @param properties - Event-specific properties
   */
  const track = (event: string, properties: Record<string, unknown> = {}) => {
    const payload = {
      ...getBaseProperties(),
      ...properties,
    };

    // Send to Google Analytics (production only)
    if (import.meta.env.PROD && typeof window !== 'undefined' && 'gtag' in window) {
      try {
        const {gtag} = (window as Window & { gtag?: (...args: unknown[]) => void });
        if (gtag) {
          gtag('event', event, payload);
        }
      } catch (error) {
        console.error('[Analytics] Failed to send event to GA:', error);
      }
    }

    // Console log in development
    if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.log(`[Analytics] ${event}`, payload);
    }

    // You can add more analytics providers here (Mixpanel, Amplitude, etc.)
  };

  /**
   * Track a page view
   * @param path - Page path
   * @param title - Page title
   */
  const trackPageView = (path: string, title?: string) => {
    track('page_view', {
      page_path: path,
      page_title: title,
    });
  };

  /**
   * Track a conversion event (checkout completed)
   */
  const trackConversion = (
    targetPlan: string,
    billingCycle: 'monthly' | 'annual',
    price: number,
    paymentMethod: string
  ) => {
    track('checkout_completed', {
      targetPlan,
      billingCycle,
      price,
      paymentMethod,
      value: price, // For GA conversion value
      currency: 'USD',
    });
  };

  /**
   * Track an error
   */
  const trackError = (errorMessage: string, errorContext?: Record<string, unknown>) => {
    track('error', {
      error_message: errorMessage,
      ...errorContext,
    });
  };

  return {
    track,
    trackPageView,
    trackConversion,
    trackError,
    sessionId,
  };
}
