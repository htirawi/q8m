/**
 * UI Component Props & Types
 */

import type { Ref } from "vue";

export interface IAnimatedCounterProps {
  value: number;
  duration?: number;
  delay?: number;
  decimals?: number;
  format?: (value: number) => string;
  easingFunction?: (t: number) => number;
}

export interface IEmptyStateProps {
  icon?: string;
  title?: string;
  description?: string;
  illustration?: string;
  variant?: "default" | "compact" | "large" | "error" | "info";
  showIcon?: boolean;
  showActions?: boolean;
  primaryAction?: string;
  secondaryAction?: string;
  helpText?: string;
}

/**
 * Enhanced Skeleton Loader Props
 */
export type SkeletonVariant = "text" | "heading" | "paragraph" | "avatar" | "card" | "button" | "image" | "custom" | "circle" | "rectangular" | "rounded";

export interface ISkeletonLoaderProps {
  variant?: SkeletonVariant;
  width?: string | number;
  height?: string | number;
  rounded?: boolean;
  animated?: boolean;
  customClass?: string;
  ariaLabel?: string;
  lines?: number; // For paragraph variant
  delay?: number; // Animation delay in ms
}

/**
 * Skeleton Loading Options for composable
 */
export interface ISkeletonOptions {
  /** Minimum duration to show skeleton (in ms) */
  minDuration?: number;
  /** Whether to show skeleton immediately */
  immediate?: boolean;
  /** Delay before showing skeleton (in ms) - prevents flash for fast loads */
  delay?: number;
  /** Auto-hide skeleton after timeout (in ms) */
  timeout?: number;
}

/**
 * Skeleton Loading composable return type
 */
export interface IUseSkeletonReturn {
  /** Whether skeleton is currently shown */
  isLoading: Ref<boolean>;
  /** Whether the actual content has loaded */
  isContentReady: Ref<boolean>;
  /** Whether to show skeleton (considers delay and min duration) */
  showSkeleton: Ref<boolean>;
  /** Start showing skeleton */
  startLoading: () => void;
  /** Mark content as loaded */
  finishLoading: () => Promise<void>;
  /** Force hide skeleton immediately */
  forceHide: () => void;
  /** Reset skeleton state */
  reset: () => void;
}

export interface IFormDividerProps {
  text?: string;
}
