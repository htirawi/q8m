/**
 * Analytics Composable Tests
 * Tests for type-safe analytics tracking with automatic metadata injection
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { useAnalytics } from '@/composables/useAnalytics';
import { usePlanStore } from '@/stores/plan';
import { setActivePinia, createPinia } from 'pinia';

// Mock useI18n
vi.mock('vue-i18n', () => ({
  useI18n: () => ({
    locale: { value: 'en' },
  }),
}));

describe('useAnalytics', () => {
  beforeEach(() => {
    // Set up pinia for plan store
    setActivePinia(createPinia());

    // Mock window properties
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024,
    });

    // Clear console spies
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Session ID Generation', () => {
    it('should generate a session ID on first use', () => {
      const { sessionId } = useAnalytics();

      expect(sessionId).toBeTruthy();
      expect(typeof sessionId).toBe('string');
    });
  });

  describe('Device Detection', () => {
    it('should detect mobile device', () => {
      Object.defineProperty(window, 'innerWidth', { value: 500 });

      const { track } = useAnalytics();
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      track('test_event');

      expect(consoleSpy).toHaveBeenCalled();
      const logCall = consoleSpy.mock.calls[0];
      const payload = logCall[1];
      expect(payload.device).toBe('mobile');

      consoleSpy.mockRestore();
    });

    it('should detect tablet device', () => {
      Object.defineProperty(window, 'innerWidth', { value: 900 });

      const { track } = useAnalytics();
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      track('test_event');

      const logCall = consoleSpy.mock.calls[0];
      const payload = logCall[1];
      expect(payload.device).toBe('tablet');

      consoleSpy.mockRestore();
    });

    it('should detect desktop device', () => {
      Object.defineProperty(window, 'innerWidth', { value: 1920 });

      const { track } = useAnalytics();
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      track('test_event');

      const logCall = consoleSpy.mock.calls[0];
      const payload = logCall[1];
      expect(payload.device).toBe('desktop');

      consoleSpy.mockRestore();
    });
  });

  describe('Base Properties', () => {
    it('should include plan tier in base properties', () => {
      const { track } = useAnalytics();
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      track('test_event');

      const logCall = consoleSpy.mock.calls[0];
      const payload = logCall[1];
      expect(payload.plan).toBeDefined();
      expect(typeof payload.plan).toBe('string');

      consoleSpy.mockRestore();
    });

    it('should include locale in base properties', () => {
      const { track } = useAnalytics();
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      track('test_event');

      const logCall = consoleSpy.mock.calls[0];
      const payload = logCall[1];
      expect(payload.locale).toBe('en');

      consoleSpy.mockRestore();
    });

    it('should include RTL flag based on locale', () => {
      const { track } = useAnalytics();
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      track('test_event');

      const logCall = consoleSpy.mock.calls[0];
      const payload = logCall[1];
      expect(payload.rtl).toBe(false);

      consoleSpy.mockRestore();
    });

    it('should include timestamp in base properties', () => {
      const { track } = useAnalytics();
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      const before = Date.now();
      track('test_event');
      const after = Date.now();

      const logCall = consoleSpy.mock.calls[0];
      const payload = logCall[1];
      expect(payload.timestamp).toBeGreaterThanOrEqual(before);
      expect(payload.timestamp).toBeLessThanOrEqual(after);

      consoleSpy.mockRestore();
    });

    it('should include session ID in base properties', () => {
      const { track, sessionId } = useAnalytics();
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      track('test_event');

      const logCall = consoleSpy.mock.calls[0];
      const payload = logCall[1];
      expect(payload.sessionId).toBe(sessionId);

      consoleSpy.mockRestore();
    });
  });

  describe('track() Method', () => {
    it('should track events with custom properties', () => {
      const { track } = useAnalytics();
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      track('button_clicked', {
        buttonId: 'submit-btn',
        page: 'checkout',
      });

      const logCall = consoleSpy.mock.calls[0];
      const eventName = logCall[0];
      const payload = logCall[1];

      expect(eventName).toContain('button_clicked');
      expect(payload.buttonId).toBe('submit-btn');
      expect(payload.page).toBe('checkout');

      consoleSpy.mockRestore();
    });

    it('should merge custom properties with base properties', () => {
      const { track } = useAnalytics();
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      track('test_event', { customProp: 'value' });

      const logCall = consoleSpy.mock.calls[0];
      const payload = logCall[1];

      // Should have both base and custom properties
      expect(payload.customProp).toBe('value');
      expect(payload.plan).toBeDefined();
      expect(payload.locale).toBeDefined();
      expect(payload.device).toBeDefined();

      consoleSpy.mockRestore();
    });

    it('should log to console in development mode', () => {
      const originalEnv = import.meta.env.DEV;
      vi.stubGlobal('import', { meta: { env: { DEV: true } } });

      const { track } = useAnalytics();
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      track('test_event');

      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
      vi.stubGlobal('import', { meta: { env: { DEV: originalEnv } } });
    });
  });

  describe('trackPageView() Method', () => {
    it('should track page views with path and title', () => {
      const { trackPageView } = useAnalytics();
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      trackPageView('/study/easy', 'Study Mode - Easy');

      const logCall = consoleSpy.mock.calls[0];
      const payload = logCall[1];

      expect(payload.page_path).toBe('/study/easy');
      expect(payload.page_title).toBe('Study Mode - Easy');

      consoleSpy.mockRestore();
    });

    it('should track page views without title', () => {
      const { trackPageView } = useAnalytics();
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      trackPageView('/pricing');

      const logCall = consoleSpy.mock.calls[0];
      const payload = logCall[1];

      expect(payload.page_path).toBe('/pricing');
      expect(payload.page_title).toBeUndefined();

      consoleSpy.mockRestore();
    });
  });

  describe('trackConversion() Method', () => {
    it('should track conversion with all required fields', () => {
      const { trackConversion } = useAnalytics();
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      trackConversion('intermediate', 'annual', 144, 'paypal');

      const logCall = consoleSpy.mock.calls[0];
      const payload = logCall[1];

      expect(payload.targetPlan).toBe('intermediate');
      expect(payload.billingCycle).toBe('annual');
      expect(payload.price).toBe(144);
      expect(payload.paymentMethod).toBe('paypal');
      expect(payload.value).toBe(144);
      expect(payload.currency).toBe('USD');

      consoleSpy.mockRestore();
    });
  });

  describe('trackError() Method', () => {
    it('should track errors with message', () => {
      const { trackError } = useAnalytics();
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      trackError('Failed to load questions');

      const logCall = consoleSpy.mock.calls[0];
      const payload = logCall[1];

      expect(payload.error_message).toBe('Failed to load questions');

      consoleSpy.mockRestore();
    });

    it('should track errors with context', () => {
      const { trackError } = useAnalytics();
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      trackError('Network error', {
        statusCode: 500,
        endpoint: '/api/questions',
      });

      const logCall = consoleSpy.mock.calls[0];
      const payload = logCall[1];

      expect(payload.error_message).toBe('Network error');
      expect(payload.statusCode).toBe(500);
      expect(payload.endpoint).toBe('/api/questions');

      consoleSpy.mockRestore();
    });
  });

  describe('Type Safety', () => {
    it('should accept unknown types in properties', () => {
      const { track } = useAnalytics();
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      // Should not cause TypeScript errors
      track('test_event', {
        stringProp: 'value',
        numberProp: 123,
        booleanProp: true,
        arrayProp: [1, 2, 3],
        objectProp: { nested: 'value' },
      });

      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });
  });

  describe('Error Handling', () => {
    it('should not throw errors during tracking', () => {
      const { track } = useAnalytics();

      // Should not throw with valid input
      expect(() => track('test_event')).not.toThrow();
      expect(() => track('test_event', { prop: 'value' })).not.toThrow();
    });
  });
});
