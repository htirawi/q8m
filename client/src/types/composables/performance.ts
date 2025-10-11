/**
 * Performance Composable Types
 */

export interface PerformanceMetrics {
  lcp: number | null; // Largest Contentful Paint
  fid: number | null; // First Input Delay
  cls: number | null; // Cumulative Layout Shift
  fcp: number | null; // First Contentful Paint
  ttfb: number | null; // Time to First Byte
}

export interface ResourceTiming {
  name: string;
  duration: number;
  size: number;
  type: string;
}
