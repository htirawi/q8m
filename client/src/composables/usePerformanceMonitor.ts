/**
 * Performance Monitor Composable
 * Tracks app performance and identifies issues
 */

import { ref, onMounted } from "vue";

export interface PerformanceMetrics {
  loadTime: number;
  routeChanges: number;
  memoryUsage: number;
  sessionTimeoutActive: boolean;
}

export function usePerformanceMonitor() {
  const metrics = ref<PerformanceMetrics>({
    loadTime: 0,
    routeChanges: 0,
    memoryUsage: 0,
    sessionTimeoutActive: false,
  });

  const startTime = performance.now();

  onMounted(() => {
    // Track load time
    metrics.value.loadTime = performance.now() - startTime;

    // Track memory usage
    if ("memory" in performance) {
      const {memory} = (performance as unknown as { memory: { usedJSHeapSize: number } });
      metrics.value.memoryUsage = memory.usedJSHeapSize / 1024 / 1024; // MB
    }

    // Track route changes
    const router = window.__VUE_ROUTER__;
    if (router) {
      router.afterEach(() => {
        metrics.value.routeChanges++;
      });
    }

    // Log performance metrics (development only)
    if (import.meta.env.DEV) {
      console.warn("🚀 Performance Metrics:", {
        loadTime: `${metrics.value.loadTime.toFixed(2)}ms`,
        memoryUsage: `${metrics.value.memoryUsage.toFixed(2)}MB`,
        routeChanges: metrics.value.routeChanges,
      });
    }
  });

  return {
    metrics,
  };
}
