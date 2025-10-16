/**
 * UI Component Props & Types
 */

export interface IAnimatedCounterProps {
  value: number;
  duration?: number;
  decimals?: number;
}

export interface IEmptyStateProps {
  icon?: string;
  title: string;
  message?: string;
  actionText?: string;
  actionLink?: string;
}

export interface ISkeletonLoaderProps {
  width?: string;
  height?: string;
  rounded?: boolean;
  variant?: "rect" | "circle" | "text";
}

export interface IFormDividerProps {
  text?: string;
}

