<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from "vue";

import {
  ArrowPathIcon,
  ChartBarIcon,
  DocumentArrowDownIcon,
  ExclamationTriangleIcon,
  XMarkIcon,
} from "@heroicons/vue/24/outline";

import { usePerformance } from "@/composables/usePerformance";

const showMonitor = ref(false);
const performance = usePerformance();

const { metrics, resourceTimings, getPerformanceRecommendations, getMemoryUsage } = performance;

const recommendations = computed(() => getPerformanceRecommendations());

const memoryUsage = computed(() => getMemoryUsage());

const totalSize = computed(() => {
  return resourceTimings.value.reduce((total, resource) => total + resource.size, 0);
});

const slowResources = computed(() => {
  return resourceTimings.value.filter((resource) => resource.duration > 1000);
});

const largeResources = computed(() => {
  return resourceTimings.value.filter((resource) => resource.size > 100000);
});

const memoryPercentage = computed(() => {
  if (!memoryUsage.value) return 0;
  return (memoryUsage.value.usedJSHeapSize / memoryUsage.value.jsHeapSizeLimit) * 100;
});

const getMetricClass = (metric: string) => {
  const value = metrics.value[metric as keyof typeof metrics.value];
  if (value === null) return "metric-unknown";
  const thresholds: Record<string, number> = {
    lcp: 2500,
    fid: 100,
    cls: 0.1,
    fcp: 1800,
    ttfb: 600,
  };

  const threshold = thresholds[metric];
  if (!threshold) return "metric-warning";
  if (value <= threshold) return "metric-good";
  if (value <= threshold * 1.5) return "metric-warning";
  return "metric-poor";
};

const formatMetric = (value: number | null, decimals: number = 0): string => {
  if (value === null) return "N/A";

  if (decimals > 0) {
    return value.toFixed(decimals);
  }

  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}s`;
  }

  return `${Math.round(value)}ms`;
};

const formatBytes = (bytes: number): string => {
  if (bytes === 0) return "0 B";

  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
};

const toggleMonitor = () => {
  showMonitor.value = !showMonitor.value;
};

const refreshMetrics = () => {
  performance.analyzeResourceTimings();
};

const exportMetrics = () => {
  const exportData = {
    timestamp: new Date().toISOString(),
    metrics: metrics.value,
    resourceTimings: resourceTimings.value,
    recommendations: recommendations.value,
    memoryUsage: memoryUsage.value,
  };

  const blob = new Blob([JSON.stringify(exportData, null, 2)], {
    type: "application/json",
  });

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `performance-metrics-${Date.now()}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

// Keyboard shortcuts
const handleKeydown = (event: KeyboardEvent) => {
  if (event.ctrlKey && event.key === "m") {
    event.preventDefault();
    toggleMonitor();
  }
};

onMounted(() => {
  document.addEventListener("keydown", handleKeydown);
});

onUnmounted(() => {
  document.removeEventListener("keydown", handleKeydown);
});
</script>

<template>
  <div v-if="showMonitor" class="performance-monitor">
    <div class="monitor-header">
      <h3>Performance Monitor</h3>
      <button @click="toggleMonitor" class="close-btn" aria-label="Close monitor">
        <XMarkIcon class="h-4 w-4" />
      </button>
    </div>

    <div class="monitor-content">
      <!-- Core Web Vitals -->
      <div class="metrics-section">
        <h4>Core Web Vitals</h4>
        <div class="metrics-grid">
          <div class="metric-card" :class="getMetricClass('lcp')">
            <div class="metric-label">LCP</div>
            <div class="metric-value">
              {{ formatMetric(metrics.lcp) }}
            </div>
            <div class="metric-threshold">2.5s</div>
          </div>

          <div class="metric-card" :class="getMetricClass('fid')">
            <div class="metric-label">FID</div>
            <div class="metric-value">
              {{ formatMetric(metrics.fid) }}
            </div>
            <div class="metric-threshold">100ms</div>
          </div>

          <div class="metric-card" :class="getMetricClass('cls')">
            <div class="metric-label">CLS</div>
            <div class="metric-value">
              {{ formatMetric(metrics.cls, 3) }}
            </div>
            <div class="metric-threshold">0.1</div>
          </div>

          <div class="metric-card" :class="getMetricClass('fcp')">
            <div class="metric-label">FCP</div>
            <div class="metric-value">
              {{ formatMetric(metrics.fcp) }}
            </div>
            <div class="metric-threshold">1.8s</div>
          </div>

          <div class="metric-card" :class="getMetricClass('ttfb')">
            <div class="metric-label">TTFB</div>
            <div class="metric-value">
              {{ formatMetric(metrics.ttfb) }}
            </div>
            <div class="metric-threshold">600ms</div>
          </div>
        </div>
      </div>

      <!-- Resource Analysis -->
      <div class="metrics-section">
        <h4>Resource Analysis</h4>
        <div class="resource-stats">
          <div class="stat-item">
            <span class="stat-label">Total Resources:</span>
            <span class="stat-value">{{ resourceTimings.length ?? 0 }} </span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Total Size:</span>
            <span class="stat-value">{{ formatBytes(totalSize) }} </span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Slow Resources:</span>
            <span class="stat-value">{{ slowResources.length ?? 0 }} </span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Large Resources:</span>
            <span class="stat-value">{{ largeResources.length ?? 0 }} </span>
          </div>
        </div>
      </div>

      <!-- Performance Recommendations -->
      <div v-if="recommendations.length > 0" class="metrics-section">
        <h4>Recommendations</h4>
        <div class="recommendations">
          <div
            v-for="(recommendation, index) in recommendations"
            :key="index"
            class="recommendation-item"
          >
            <ExclamationTriangleIcon class="h-4 w-4 text-warning-500" />
            <span>{{ recommendation }} </span>
          </div>
        </div>
      </div>

      <!-- Memory Usage -->
      <div v-if="memoryUsage" class="metrics-section">
        <h4>Memory Usage</h4>
        <div class="memory-stats">
          <div class="stat-item">
            <span class="stat-label">Used:</span>
            <span class="stat-value">{{ formatBytes(memoryUsage.usedJSHeapSize) }} </span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Total:</span>
            <span class="stat-value">{{ formatBytes(memoryUsage.totalJSHeapSize) }} </span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Limit:</span>
            <span class="stat-value">{{ formatBytes(memoryUsage.jsHeapSizeLimit) }}</span>
          </div>
        </div>

        <div class="memory-bar">
          <div class="memory-fill" :style="{ width: memoryPercentage + '%' }"></div>
        </div>
      </div>
    </div>

    <div class="monitor-actions">
      <button @click="refreshMetrics" class="action-btn">
        <ArrowPathIcon class="h-4 w-4" />
        Refresh
      </button>
      <button @click="exportMetrics" class="action-btn">
        <DocumentArrowDownIcon class="h-4 w-4" />
        Export
      </button>
    </div>
  </div>

  <!-- Toggle Button -->
  <button
    v-else
    @click="toggleMonitor"
    class="monitor-toggle"
    aria-label="Open performance monitor"
  >
    <ChartBarIcon class="h-5 w-5" />
  </button>
</template>

<style scoped>
.performance-monitor {
  @apply fixed right-4 top-4 z-50 max-h-[80vh] w-96 max-w-full overflow-hidden rounded-lg border border-secondary-200 bg-white shadow-xl dark:border-secondary-700 dark:bg-secondary-800;
}

.monitor-header {
  @apply flex items-center justify-between border-b border-secondary-200 p-4 dark:border-secondary-700;
}

.monitor-header h3 {
  @apply text-lg font-semibold text-secondary-900 dark:text-white;
}

.close-btn {
  @apply rounded-md p-1 text-secondary-400 hover:bg-secondary-100 hover:text-secondary-600 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-secondary-500 dark:hover:bg-secondary-700 dark:hover:text-secondary-300;
  @apply flex min-h-[44px] min-w-[44px] items-center justify-center;
}

.monitor-content {
  @apply max-h-[60vh] overflow-y-auto p-4;
}

.metrics-section {
  @apply mb-6;
}

.metrics-section h4 {
  @apply mb-3 text-sm font-medium text-secondary-700 dark:text-secondary-300;
}

.metrics-grid {
  @apply grid grid-cols-2 gap-3;
}

.metric-card {
  @apply rounded-lg border p-3 text-center;
}

.metric-card.metric-good {
  @apply border-success-200 bg-success-50 dark:border-success-800 dark:bg-success-900/20;
}

.metric-card.metric-warning {
  @apply border-warning-200 bg-warning-50 dark:border-warning-800 dark:bg-warning-900/20;
}

.metric-card.metric-poor {
  @apply border-error-200 bg-error-50 dark:border-error-800 dark:bg-error-900/20;
}

.metric-card.metric-unknown {
  @apply border-secondary-200 bg-secondary-50 dark:border-secondary-600 dark:bg-secondary-700;
}

.metric-label {
  @apply text-xs font-medium uppercase tracking-wide text-secondary-600 dark:text-secondary-400;
}

.metric-value {
  @apply mt-1 text-lg font-bold text-secondary-900 dark:text-white;
}

.metric-threshold {
  @apply mt-1 text-xs text-secondary-500 dark:text-secondary-400;
}

.resource-stats {
  @apply grid grid-cols-2 gap-2;
}

.stat-item {
  @apply flex items-center justify-between rounded bg-secondary-50 p-2 dark:bg-secondary-700;
}

.stat-label {
  @apply text-sm text-secondary-600 dark:text-secondary-400;
}

.stat-value {
  @apply text-sm font-medium text-secondary-900 dark:text-white;
}

.recommendations {
  @apply space-y-2;
}

.recommendation-item {
  @apply flex items-start space-x-2 rounded border border-warning-200 bg-warning-50 p-2 dark:border-warning-800 dark:bg-warning-900/20;
}

.recommendation-item span {
  @apply text-sm text-warning-800 dark:text-warning-200;
}

.memory-stats {
  @apply mb-3 grid grid-cols-3 gap-2;
}

.memory-bar {
  @apply h-2 w-full overflow-hidden rounded-full bg-secondary-200 dark:bg-secondary-700;
}

.memory-fill {
  @apply h-full bg-primary-500 transition-all duration-300;
}

.monitor-actions {
  @apply flex space-x-2 border-t border-secondary-200 p-4 dark:border-secondary-700;
}

.action-btn {
  @apply flex items-center space-x-2 rounded-md px-3 py-2 text-sm font-medium text-primary-600 transition-colors hover:bg-primary-50 hover:text-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-primary-400 dark:hover:bg-primary-900/20 dark:hover:text-primary-300;
  @apply min-h-[44px];
}

.monitor-toggle {
  @apply fixed bottom-4 right-4 z-40 rounded-full bg-primary-600 p-3 text-white shadow-lg transition-colors hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2;
  @apply flex min-h-[44px] min-w-[44px] items-center justify-center;
}

/* Mobile optimizations */
@media (width <= 640px) {
  .performance-monitor {
    @apply left-2 right-2 top-2 w-auto;
  }

  .metrics-grid {
    @apply grid-cols-1;
  }

  .resource-stats {
    @apply grid-cols-1;
  }

  .memory-stats {
    @apply grid-cols-1;
  }
}

/* RTL support */
[dir="rtl"] .performance-monitor {
  @apply left-4 right-auto;
}

[dir="rtl"] .monitor-toggle {
  @apply left-4 right-auto;
}
</style>
