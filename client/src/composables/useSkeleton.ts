import { ref, computed, onMounted, type Ref } from 'vue';

export interface SkeletonOptions {
  /** Minimum duration to show skeleton (in ms) */
  minDuration?: number;
  /** Whether to show skeleton immediately */
  immediate?: boolean;
  /** Delay before showing skeleton (in ms) - prevents flash for fast loads */
  delay?: number;
  /** Auto-hide skeleton after timeout (in ms) */
  timeout?: number;
}

export interface UseSkeletonReturn {
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

/**
 * Composable for managing skeleton loading states with smart timing
 *
 * @example
 * ```ts
 * const { showSkeleton, startLoading, finishLoading } = useSkeleton({
 *   minDuration: 500,
 *   delay: 200
 * });
 *
 * // In your data fetching
 * startLoading();
 * const data = await fetchData();
 * await finishLoading(); // Will ensure minimum duration
 * ```
 */
export function useSkeleton(options: SkeletonOptions = {}): UseSkeletonReturn {
  const {
    minDuration = 500,
    immediate = false,
    delay = 200,
    timeout = 10000
  } = options;

  const isLoading = ref(false);
  const isContentReady = ref(false);
  const showSkeleton = ref(false);

  let loadStartTime = 0;
  let delayTimer: number | null = null;
  let timeoutTimer: number | null = null;

  /**
   * Start showing skeleton with optional delay
   */
  const startLoading = () => {
    if (isLoading.value) return;

    isLoading.value = true;
    isContentReady.value = false;
    loadStartTime = Date.now();

    // Clear any existing timers
    if (delayTimer) {
      clearTimeout(delayTimer);
      delayTimer = null;
    }
    if (timeoutTimer) {
      clearTimeout(timeoutTimer);
      timeoutTimer = null;
    }

    // Show skeleton after delay (prevents flash for fast loads)
    if (delay > 0) {
      delayTimer = window.setTimeout(() => {
        if (isLoading.value) {
          showSkeleton.value = true;
        }
      }, delay);
    } else {
      showSkeleton.value = true;
    }

    // Auto-hide after timeout to prevent infinite loading
    if (timeout > 0) {
      timeoutTimer = window.setTimeout(() => {
        console.warn('Skeleton timeout reached, force hiding');
        forceHide();
      }, timeout);
    }
  };

  /**
   * Mark content as loaded and hide skeleton
   * Ensures minimum duration for better UX
   */
  const finishLoading = async (): Promise<void> => {
    if (!isLoading.value) return;

    isContentReady.value = true;

    // Calculate how long skeleton has been shown
    const elapsedTime = Date.now() - loadStartTime;
    const remainingTime = Math.max(0, minDuration - elapsedTime);

    // If skeleton was shown, ensure minimum duration
    if (showSkeleton.value && remainingTime > 0) {
      await new Promise(resolve => setTimeout(resolve, remainingTime));
    }

    // Hide skeleton
    isLoading.value = false;
    showSkeleton.value = false;

    // Clear timers
    if (delayTimer) {
      clearTimeout(delayTimer);
      delayTimer = null;
    }
    if (timeoutTimer) {
      clearTimeout(timeoutTimer);
      timeoutTimer = null;
    }
  };

  /**
   * Force hide skeleton immediately
   */
  const forceHide = () => {
    isLoading.value = false;
    showSkeleton.value = false;
    isContentReady.value = true;

    if (delayTimer) {
      clearTimeout(delayTimer);
      delayTimer = null;
    }
    if (timeoutTimer) {
      clearTimeout(timeoutTimer);
      timeoutTimer = null;
    }
  };

  /**
   * Reset skeleton state
   */
  const reset = () => {
    isLoading.value = false;
    showSkeleton.value = false;
    isContentReady.value = false;
    loadStartTime = 0;

    if (delayTimer) {
      clearTimeout(delayTimer);
      delayTimer = null;
    }
    if (timeoutTimer) {
      clearTimeout(timeoutTimer);
      timeoutTimer = null;
    }
  };

  // Start loading immediately if specified
  onMounted(() => {
    if (immediate) {
      startLoading();
    }
  });

  return {
    isLoading: computed(() => isLoading.value),
    isContentReady: computed(() => isContentReady.value),
    showSkeleton: computed(() => showSkeleton.value),
    startLoading,
    finishLoading,
    forceHide,
    reset
  };
}

/**
 * Helper to create a skeleton loader for async data
 *
 * @example
 * ```ts
 * const { data, showSkeleton } = await withSkeleton(
 *   () => fetchUserData(),
 *   { minDuration: 300 }
 * );
 * ```
 */
export async function withSkeleton<T>(
  asyncFn: () => Promise<T>,
  options: SkeletonOptions = {}
): Promise<{ data: T; skeleton: UseSkeletonReturn }> {
  const skeleton = useSkeleton(options);

  skeleton.startLoading();

  try {
    const data = await asyncFn();
    await skeleton.finishLoading();
    return { data, skeleton };
  } catch (error) {
    skeleton.forceHide();
    throw error;
  }
}