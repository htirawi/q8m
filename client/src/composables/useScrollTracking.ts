/**
 * Scroll Tracking Composable
 * Tracks scroll depth and fires analytics events at milestones
 *
 * Features:
 * - Milestone tracking (25%, 50%, 75%, 100%)
 * - Time to milestone measurement
 * - Debounced scroll listener for performance
 * - Automatic cleanup on unmount
 *
 * Usage:
 * ```typescript
 * const { scrollDepth, scrollY } = useScrollTracking({
 *   milestones: [25, 50, 75, 100],
 *   debounceMs: 100
 * });
 * ```
 */

import { ref, onMounted, onUnmounted } from "vue";
import { useAnalytics } from "@/composables/useAnalytics";
import type { IScrollDepthEvent } from "@/types/analytics";
import type { IScrollTrackingConfig, IScrollTrackingResult } from '@shared/types/composables';



/**
 * Scroll tracking composable for analytics
 */
export function useScrollTracking(
  config: IScrollTrackingConfig = {}
): IScrollTrackingResult {
  const {
    milestones = [25, 50, 75, 100],
    debounceMs = 100,
    trackingEnabled = true,
  } = config;

  const { track } = useAnalytics();

  const scrollDepth = ref<number>(0);
  const scrollY = ref<number>(0);
  const reachedMilestones = ref<Set<number>>(new Set());
  const startTime = ref<number>(Date.now());

  let debounceTimeout: ReturnType<typeof setTimeout> | null = null;

  /**
   * Calculate scroll depth as percentage (0-100)
   */
  const calculateScrollDepth = (): number => {
    if (typeof window === "undefined") {
      return 0;
    }

    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;
    const scrollTop = window.scrollY;
    const scrollableHeight = documentHeight - windowHeight;

    if (scrollableHeight <= 0) {
      return 100;
    }

    return Math.round((scrollTop / scrollableHeight) * 100);
  };

  /**
   * Track scroll depth milestone
   */
  const trackMilestone = (milestone: number): void => {
    if (reachedMilestones.value.has(milestone)) {
      return;
    }

    reachedMilestones.value.add(milestone);

    const event: IScrollDepthEvent = {
      depth: scrollDepth.value,
      milestone: milestone as 25 | 50 | 75 | 100,
      timeToMilestone: Date.now() - startTime.value,
    };

    track("scroll_depth", event);
  };

  /**
   * Handle scroll event with debouncing
   */
  const handleScroll = (): void => {
    if (debounceTimeout) {
      clearTimeout(debounceTimeout);
    }

    debounceTimeout = setTimeout(() => {
      scrollY.value = window.scrollY;
      scrollDepth.value = calculateScrollDepth();

      if (trackingEnabled) {
        // Check each milestone
        for (const milestone of milestones) {
          if (scrollDepth.value >= milestone && !reachedMilestones.value.has(milestone)) {
            trackMilestone(milestone);
          }
        }
      }
    }, debounceMs);
  };

  /**
   * Check if a specific milestone has been reached
   */
  const hasReachedMilestone = (milestone: number): boolean => {
    return reachedMilestones.value.has(milestone);
  };

  // Lifecycle hooks
  onMounted(() => {
    if (typeof window === "undefined") {
      return;
    }

    // Initial calculation
    scrollY.value = window.scrollY;
    scrollDepth.value = calculateScrollDepth();

    // Add scroll listener
    window.addEventListener("scroll", handleScroll, { passive: true });
  });

  onUnmounted(() => {
    if (typeof window === "undefined") {
      return;
    }

    // Remove scroll listener
    window.removeEventListener("scroll", handleScroll);

    // Clear debounce timeout
    if (debounceTimeout) {
      clearTimeout(debounceTimeout);
    }
  });

  return {
    scrollDepth,
    scrollY,
    hasReachedMilestone,
  };
}
