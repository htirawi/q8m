import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { usePerformance } from "@/composables/usePerformance";

// Mock PerformanceObserver
const mockPerformanceObserver = vi.fn();
const mockObserve = vi.fn();
const mockDisconnect = vi.fn();

mockPerformanceObserver.mockImplementation((callback) => ({
  observe: mockObserve,
  disconnect: mockDisconnect,
  callback,
}));

global.PerformanceObserver = mockPerformanceObserver as any;

// Mock performance API
const mockPerformance = {
  getEntriesByType: vi.fn(),
  memory: {
    usedJSHeapSize: 1000000,
    totalJSHeapSize: 2000000,
    jsHeapSizeLimit: 4000000,
  },
};

Object.defineProperty(global, "performance", {
  value: mockPerformance,
  writable: true,
});

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
})) as any;

describe("usePerformance Composable", () => {
  let performance: ReturnType<typeof usePerformance>;

  beforeEach(() => {
    performance = usePerformance();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("Initial State", () => {
    it("should have correct initial state", () => {
      expect(performance.metrics.value.lcp).toBe(null);
      expect(performance.metrics.value.fid).toBe(null);
      expect(performance.metrics.value.cls).toBe(null);
      expect(performance.metrics.value.fcp).toBe(null);
      expect(performance.metrics.value.ttfb).toBe(null);
      expect(performance.resourceTimings.value).toEqual([]);
      expect(performance.isMonitoring.value).toBe(false);
    });
  });

  describe("Web Vitals Measurement", () => {
    it("should measure LCP correctly", () => {
      const mockCallback = mockPerformanceObserver.mock.calls[0][0];
      const mockEntries = [
        { startTime: 1500 },
        { startTime: 2000 },
        { startTime: 1800 }, // Last entry should be used
      ];

      mockCallback({ getEntries: () => mockEntries });
      expect(performance.metrics.value.lcp).toBe(1800);
    });

    it("should measure FID correctly", () => {
      const mockCallback = mockPerformanceObserver.mock.calls[1][0]; // FID observer
      const mockEntries = [
        {
          startTime: 1000,
          processingStart: 1100, // 100ms delay
        },
      ];

      mockCallback({ getEntries: () => mockEntries });
      expect(performance.metrics.value.fid).toBe(100);
    });

    it("should measure CLS correctly", () => {
      const mockCallback = mockPerformanceObserver.mock.calls[2][0]; // CLS observer
      const mockEntries = [
        { value: 0.05, hadRecentInput: false },
        { value: 0.03, hadRecentInput: false },
        { value: 0.02, hadRecentInput: true }, // Should be ignored
      ];

      mockCallback({ getEntries: () => mockEntries });
      expect(performance.metrics.value.cls).toBe(0.08); // 0.05 + 0.03
    });

    it("should measure FCP correctly", () => {
      const mockCallback = mockPerformanceObserver.mock.calls[3][0]; // FCP observer
      const mockEntries = [
        { name: "first-contentful-paint", startTime: 1200 },
        { name: "first-paint", startTime: 1000 }, // Should be ignored
      ];

      mockCallback({ getEntries: () => mockEntries });
      expect(performance.metrics.value.fcp).toBe(1200);
    });

    it("should measure TTFB correctly", () => {
      const mockNavigationEntry = {
        responseStart: 800,
        requestStart: 200,
      };

      mockPerformance.getEntriesByType.mockReturnValue([mockNavigationEntry]);
      performance.measureWebVitals();

      expect(performance.metrics.value.ttfb).toBe(600); // 800 - 200
    });
  });

  describe("Resource Timing Analysis", () => {
    it("should analyze resource timings correctly", () => {
      const mockResources = [
        {
          name: "https://example.com/app.js",
          duration: 500,
          transferSize: 100000,
        },
        {
          name: "https://example.com/styles.css",
          duration: 200,
          transferSize: 50000,
        },
        {
          name: "https://example.com/image.png",
          duration: 300,
          transferSize: 200000,
        },
      ];

      mockPerformance.getEntriesByType.mockReturnValue(mockResources);
      performance.analyzeResourceTimings();

      const resourceTimings = performance.resourceTimings.value;
      expect(resourceTimings).toHaveLength(3);
      expect(resourceTimings[0]).toEqual({
        name: "https://example.com/app.js",
        duration: 500,
        size: 100000,
        type: "script",
      });
      expect(resourceTimings[1]).toEqual({
        name: "https://example.com/styles.css",
        duration: 200,
        size: 50000,
        type: "stylesheet",
      });
      expect(resourceTimings[2]).toEqual({
        name: "https://example.com/image.png",
        duration: 300,
        size: 200000,
        type: "image",
      });
    });

    it("should classify resource types correctly", () => {
      const testCases = [
        { url: "app.js", expectedType: "script" },
        { url: "styles.css", expectedType: "stylesheet" },
        { url: "image.jpg", expectedType: "image" },
        { url: "font.woff2", expectedType: "font" },
        { url: "data.json", expectedType: "other" },
      ];

      testCases.forEach(({ url, expectedType }) => {
        const mockResources = [
          {
            name: `https://example.com/${url}`,
            duration: 100,
            transferSize: 1000,
          },
        ];

        mockPerformance.getEntriesByType.mockReturnValue(mockResources);
        performance.analyzeResourceTimings();

        const resourceTiming = performance.resourceTimings.value[0];
        expect(resourceTiming.type).toBe(expectedType);
      });
    });
  });

  describe("Performance Budget Checking", () => {
    it("should check performance budget correctly", () => {
      // Set metrics that violate budget
      performance.metrics.value = {
        lcp: 3000, // Over 2.5s
        fid: 150, // Over 100ms
        cls: 0.15, // Over 0.1
        fcp: 2000, // Over 1.8s
        ttfb: 800, // Over 600ms
      };

      const violations = performance.checkPerformanceBudget();
      expect(violations).toHaveLength(5);
      expect(violations[0]).toContain("LCP: 3000ms");
      expect(violations[1]).toContain("FID: 150ms");
      expect(violations[2]).toContain("CLS: 0.150");
      expect(violations[3]).toContain("FCP: 2000ms");
      expect(violations[4]).toContain("TTFB: 800ms");
    });

    it("should pass performance budget when metrics are good", () => {
      // Set metrics within budget
      performance.metrics.value = {
        lcp: 2000, // Under 2.5s
        fid: 50, // Under 100ms
        cls: 0.05, // Under 0.1
        fcp: 1500, // Under 1.8s
        ttfb: 400, // Under 600ms
      };

      const violations = performance.checkPerformanceBudget();
      expect(violations).toHaveLength(0);
    });
  });

  describe("Resource Preloading", () => {
    it("should preload resources correctly", () => {
      const mockLink = {
        rel: "",
        href: "",
        as: "",
        crossOrigin: "",
      };

      const mockCreateElement = vi.fn(() => mockLink);
      const mockAppendChild = vi.fn();
      global.document.createElement = mockCreateElement as any;
      global.document.head = { appendChild: mockAppendChild } as any;

      performance.preloadResource("https://example.com/app.js", "script", true);

      expect(mockCreateElement).toHaveBeenCalledWith("link");
      expect(mockLink.rel).toBe("preload");
      expect(mockLink.href).toBe("https://example.com/app.js");
      expect(mockLink.as).toBe("script");
      expect(mockLink.crossOrigin).toBe("anonymous");
      expect(mockAppendChild).toHaveBeenCalledWith(mockLink);
    });

    it("should preconnect to domains correctly", () => {
      const mockLink = {
        rel: "",
        href: "",
      };

      const mockCreateElement = vi.fn(() => mockLink);
      const mockAppendChild = vi.fn();
      global.document.createElement = mockCreateElement as any;
      global.document.head = { appendChild: mockAppendChild } as any;

      performance.preconnectToDomain("https://fonts.googleapis.com");

      expect(mockCreateElement).toHaveBeenCalledWith("link");
      expect(mockLink.rel).toBe("preconnect");
      expect(mockLink.href).toBe("https://fonts.googleapis.com");
      expect(mockAppendChild).toHaveBeenCalledWith(mockLink);
    });
  });

  describe("Intersection Observer", () => {
    it("should create intersection observer with correct options", () => {
      const mockCallback = vi.fn();
      const options = { rootMargin: "100px", threshold: 0.5 };

      performance.createIntersectionObserver(mockCallback, options);

      expect(global.IntersectionObserver).toHaveBeenCalledWith(mockCallback, {
        rootMargin: "100px",
        threshold: 0.5,
      });
    });

    it("should use default options when none provided", () => {
      const mockCallback = vi.fn();

      performance.createIntersectionObserver(mockCallback);

      expect(global.IntersectionObserver).toHaveBeenCalledWith(mockCallback, {
        rootMargin: "50px",
        threshold: 0.1,
      });
    });

    it("should return null when IntersectionObserver is not supported", () => {
      const originalIntersectionObserver = global.IntersectionObserver;
      delete (global as any).IntersectionObserver;

      const observer = performance.createIntersectionObserver(vi.fn());

      expect(observer).toBe(null);

      global.IntersectionObserver = originalIntersectionObserver;
    });
  });

  describe("Bundle Size Analysis", () => {
    it("should analyze bundle size correctly", () => {
      const mockScripts = [
        { src: "https://example.com/app.js", async: true, defer: false },
        { src: "https://example.com/vendor.js", async: false, defer: true },
      ];

      const mockStylesheets = [
        { href: "https://example.com/styles.css", media: "all" },
        { href: "https://example.com/print.css", media: "print" },
      ];

      const mockQuerySelectorAll = vi.fn((selector) => {
        if (selector === "script[src]") return mockScripts;
        if (selector === 'link[rel="stylesheet"]') return mockStylesheets;
        return [];
      });

      global.document.querySelectorAll = mockQuerySelectorAll as any;

      const bundleInfo = performance.analyzeBundleSize();

      expect(bundleInfo).toEqual({
        scripts: [
          { src: "https://example.com/app.js", async: true, defer: false },
          { src: "https://example.com/vendor.js", async: false, defer: true },
        ],
        stylesheets: [
          { href: "https://example.com/styles.css", media: "all" },
          { href: "https://example.com/print.css", media: "print" },
        ],
      });
    });

    it("should return null when document is not available", () => {
      const originalDocument = global.document;
      delete (global as any).document;

      const bundleInfo = performance.analyzeBundleSize();

      expect(bundleInfo).toBe(null);

      global.document = originalDocument;
    });
  });

  describe("Memory Usage", () => {
    it("should get memory usage correctly", () => {
      const memoryUsage = performance.getMemoryUsage();

      expect(memoryUsage).toEqual({
        usedJSHeapSize: 1000000,
        totalJSHeapSize: 2000000,
        jsHeapSizeLimit: 4000000,
      });
    });

    it("should return null when memory API is not available", () => {
      const originalPerformance = global.performance;
      delete (global as any).performance;

      const memoryUsage = performance.getMemoryUsage();

      expect(memoryUsage).toBe(null);

      global.performance = originalPerformance;
    });
  });

  describe("Performance Recommendations", () => {
    it("should generate performance recommendations", () => {
      // Set up metrics with violations
      performance.metrics.value = {
        lcp: 3000,
        fid: 150,
        cls: 0.15,
        fcp: 2000,
        ttfb: 800,
      };

      // Set up resource timings with issues
      performance.resourceTimings.value = [
        { name: "large-file.js", duration: 2000, size: 500000, type: "script" },
        { name: "slow-resource.css", duration: 1500, size: 50000, type: "stylesheet" },
      ];

      const recommendations = performance.getPerformanceRecommendations();

      expect(recommendations).toHaveLength(3);
      expect(recommendations[0]).toContain("Performance budget violations");
      expect(recommendations[1]).toContain("Large resources detected");
      expect(recommendations[2]).toContain("Slow resources detected");
    });

    it("should recommend bundling when too many resources", () => {
      // Create many resources
      performance.resourceTimings.value = Array.from({ length: 60 }, (_, i) => ({
        name: `resource-${i}.js`,
        duration: 100,
        size: 1000,
        type: "script",
      }));

      const recommendations = performance.getPerformanceRecommendations();

      expect(recommendations).toContain(
        "Too many resources loaded. Consider bundling or lazy loading."
      );
    });

    it("should return empty array when no issues", () => {
      // Set good metrics
      performance.metrics.value = {
        lcp: 2000,
        fid: 50,
        cls: 0.05,
        fcp: 1500,
        ttfb: 400,
      };

      // Set good resource timings
      performance.resourceTimings.value = [
        { name: "small-file.js", duration: 100, size: 10000, type: "script" },
      ];

      const recommendations = performance.getPerformanceRecommendations();

      expect(recommendations).toEqual([]);
    });
  });

  describe("Monitoring Control", () => {
    it("should start monitoring correctly", () => {
      const mockAddEventListener = vi.fn();
      global.window = { addEventListener: mockAddEventListener } as any;

      performance.startMonitoring();

      expect(performance.isMonitoring.value).toBe(true);
      expect(mockObserve).toHaveBeenCalledTimes(4); // LCP, FID, CLS, FCP observers
      expect(mockAddEventListener).toHaveBeenCalledWith("load", expect.any(Function));
    });

    it("should stop monitoring correctly", () => {
      performance.stopMonitoring();

      expect(performance.isMonitoring.value).toBe(false);
      expect(mockDisconnect).toHaveBeenCalled();
    });

    it("should not start monitoring twice", () => {
      performance.startMonitoring();
      const initialCallCount = mockObserve.mock.calls.length;

      performance.startMonitoring();
      expect(mockObserve.mock.calls.length).toBe(initialCallCount);
    });
  });
});
