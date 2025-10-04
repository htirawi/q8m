/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, no-undef */
/* TODO: Legacy patterns - Replace 'any' types with proper typing and remove unused vars in next PR */
import { ref, onMounted, onUnmounted, readonly } from "vue";

interface PerformanceMetrics {
  lcp: number | null; // Largest Contentful Paint
  fid: number | null; // First Input Delay
  cls: number | null; // Cumulative Layout Shift
  fcp: number | null; // First Contentful Paint
  ttfb: number | null; // Time to First Byte
}

interface ResourceTiming {
  name: string;
  duration: number;
  size: number;
  type: string;
}

export function usePerformance() {
  const metrics = ref<PerformanceMetrics>({
    lcp: null,
    fid: null,
    cls: null,
    fcp: null,
    ttfb: null,
  });

  const resourceTimings = ref<ResourceTiming[]>([]);
  const isMonitoring = ref(false);

  // Web Vitals measurement
  const measureWebVitals = () => {
    if (typeof window === "undefined" || !("PerformanceObserver" in window)) {
      return;
    }

    // Largest Contentful Paint
    const lcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
      metrics.value.lcp = lastEntry.startTime;
    });
    lcpObserver.observe({ entryTypes: ["largest-contentful-paint"] });

    // First Input Delay
    const fidObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry: any) => {
        metrics.value.fid = entry.processingStart - entry.startTime;
      });
    });
    fidObserver.observe({ entryTypes: ["first-input"] });

    // Cumulative Layout Shift
    let clsValue = 0;
    const clsObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry: any) => {
        if (!entry.hadRecentInput) {
          clsValue += entry.value;
        }
      });
      metrics.value.cls = clsValue;
    });
    clsObserver.observe({ entryTypes: ["layout-shift"] });

    // First Contentful Paint
    const fcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry) => {
        if (entry.name === "first-contentful-paint") {
          metrics.value.fcp = entry.startTime;
        }
      });
    });
    fcpObserver.observe({ entryTypes: ["paint"] });

    // Time to First Byte
    const navigationEntry = performance.getEntriesByType(
      "navigation"
    )[0] as PerformanceNavigationTiming;
    if (navigationEntry) {
      metrics.value.ttfb = navigationEntry.responseStart - navigationEntry.requestStart;
    }
  };

  // Resource timing analysis
  const analyzeResourceTimings = () => {
    if (typeof window === "undefined") {
      return;
    }

    const resources = performance.getEntriesByType("resource") as PerformanceResourceTiming[];
    const resourceData: ResourceTiming[] = resources.map((resource) => ({
      name: resource.name,
      duration: resource.duration,
      size: resource.transferSize,
      type: getResourceType(resource.name),
    }));

    resourceTimings.value = resourceData;
  };

  const getResourceType = (url: string): string => {
    if (url.includes(".js")) return "script";
    if (url.includes(".css")) return "stylesheet";
    if (url.match(/\.(jpg|jpeg|png|gif|webp|svg)$/)) return "image";
    if (url.match(/\.(woff|woff2|ttf|eot)$/)) return "font";
    return "other";
  };

  // Performance budget checking
  const checkPerformanceBudget = () => {
    const budget = {
      lcp: 2500, // 2.5 seconds
      fid: 100, // 100ms
      cls: 0.1, // 0.1
      fcp: 1800, // 1.8 seconds
      ttfb: 600, // 600ms
    };

    const violations: string[] = [];

    if (metrics.value.lcp && metrics.value.lcp > budget.lcp) {
      violations.push(`LCP: ${metrics.value.lcp.toFixed(0)}ms (budget: ${budget.lcp}ms)`);
    }

    if (metrics.value.fid && metrics.value.fid > budget.fid) {
      violations.push(`FID: ${metrics.value.fid.toFixed(0)}ms (budget: ${budget.fid}ms)`);
    }

    if (metrics.value.cls && metrics.value.cls > budget.cls) {
      violations.push(`CLS: ${metrics.value.cls.toFixed(3)} (budget: ${budget.cls})`);
    }

    if (metrics.value.fcp && metrics.value.fcp > budget.fcp) {
      violations.push(`FCP: ${metrics.value.fcp.toFixed(0)}ms (budget: ${budget.fcp}ms)`);
    }

    if (metrics.value.ttfb && metrics.value.ttfb > budget.ttfb) {
      violations.push(`TTFB: ${metrics.value.ttfb.toFixed(0)}ms (budget: ${budget.ttfb}ms)`);
    }

    return violations;
  };

  // Preload critical resources
  const preloadResource = (href: string, as: string, crossorigin?: boolean) => {
    const link = document.createElement("link");
    link.rel = "preload";
    link.href = href;
    link.as = as;
    if (crossorigin) {
      link.crossOrigin = "anonymous";
    }
    document.head.appendChild(link);
  };

  // Preconnect to external domains
  const preconnectToDomain = (domain: string) => {
    const link = document.createElement("link");
    link.rel = "preconnect";
    link.href = domain;
    document.head.appendChild(link);
  };

  // Image optimization
  const optimizeImage = (src: string, width?: number, height?: number): string => {
    // In a real implementation, you might use a service like Cloudinary or ImageKit
    // For now, we'll return the original src
    return src;
  };

  // Lazy loading utility
  const createIntersectionObserver = (
    callback: IntersectionObserverCallback,
    options?: IntersectionObserverInit
  ) => {
    if (typeof window === "undefined" || !("IntersectionObserver" in window)) {
      return null;
    }

    const defaultOptions: IntersectionObserverInit = {
      rootMargin: "50px",
      threshold: 0.1,
      ...options,
    };

    return new IntersectionObserver(callback, defaultOptions);
  };

  // Bundle size analysis
  const analyzeBundleSize = () => {
    if (typeof window === "undefined") {
      return null;
    }

    const scripts = Array.from(document.querySelectorAll("script[src]")) as HTMLScriptElement[];
    const stylesheets = Array.from(
      document.querySelectorAll('link[rel="stylesheet"]')
    ) as HTMLLinkElement[];

    const bundleInfo = {
      scripts: scripts.map((script) => ({
        src: script.src,
        async: script.async,
        defer: script.defer,
      })),
      stylesheets: stylesheets.map((link) => ({
        href: link.href,
        media: link.media,
      })),
    };

    return bundleInfo;
  };

  // Memory usage monitoring
  const getMemoryUsage = () => {
    if (typeof window === "undefined" || !("memory" in performance)) {
      return null;
    }

    const {memory} = (performance as any);
    return {
      usedJSHeapSize: memory.usedJSHeapSize,
      totalJSHeapSize: memory.totalJSHeapSize,
      jsHeapSizeLimit: memory.jsHeapSizeLimit,
    };
  };

  // Start monitoring
  const startMonitoring = () => {
    if (isMonitoring.value) {
      return;
    }

    isMonitoring.value = true;
    measureWebVitals();

    // Analyze resources after page load
    window.addEventListener("load", () => {
      setTimeout(() => {
        analyzeResourceTimings();
      }, 1000);
    });
  };

  // Stop monitoring
  const stopMonitoring = () => {
    isMonitoring.value = false;
  };

  // Performance recommendations
  const getPerformanceRecommendations = () => {
    const recommendations: string[] = [];
    const violations = checkPerformanceBudget();

    if (violations.length > 0) {
      recommendations.push(`Performance budget violations: ${violations.join(", ")}`);
    }

    // Check for large resources
    const largeResources = resourceTimings.value.filter((resource) => resource.size > 100000); // 100KB
    if (largeResources.length > 0) {
      recommendations.push(
        `Large resources detected: ${largeResources.map((r) => r.name).join(", ")}`
      );
    }

    // Check for slow resources
    const slowResources = resourceTimings.value.filter((resource) => resource.duration > 1000); // 1s
    if (slowResources.length > 0) {
      recommendations.push(
        `Slow resources detected: ${slowResources.map((r) => r.name).join(", ")}`
      );
    }

    // Check for too many resources
    if (resourceTimings.value.length > 50) {
      recommendations.push("Too many resources loaded. Consider bundling or lazy loading.");
    }

    return recommendations;
  };

  // Auto-start monitoring on mount
  onMounted(() => {
    startMonitoring();
  });

  // Cleanup on unmount
  onUnmounted(() => {
    stopMonitoring();
  });

  return {
    metrics: readonly(metrics),
    resourceTimings: readonly(resourceTimings),
    isMonitoring: readonly(isMonitoring),
    startMonitoring,
    stopMonitoring,
    measureWebVitals,
    analyzeResourceTimings,
    checkPerformanceBudget,
    preloadResource,
    preconnectToDomain,
    optimizeImage,
    createIntersectionObserver,
    analyzeBundleSize,
    getMemoryUsage,
    getPerformanceRecommendations,
  };
}
