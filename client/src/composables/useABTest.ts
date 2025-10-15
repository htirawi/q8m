/**
 * A/B Testing Composable
 * Manages A/B test variant assignment with localStorage persistence
 *
 * Features:
 * - Deterministic variant assignment (persists across sessions)
 * - Weighted distribution support
 * - Analytics tracking integration
 * - Custom storage key prefix
 *
 * Usage:
 * ```typescript
 * const { variant, trackAssignment } = useABTest({
 *   testId: 'homepage_hero_headline_v1',
 *   variants: ['control', 'variant_a', 'variant_b'],
 *   weights: [0.34, 0.33, 0.33]
 * });
 *
 * trackAssignment(); // Call once after variant is displayed
 * ```
 */

import { ref, computed, onMounted, type ComputedRef } from "vue";
import { useAnalytics } from "@/composables/useAnalytics";
import type { IABTestAssignmentEvent } from "@/types/analytics";

export interface IABTestConfig {
  testId: string;
  variants: string[];
  weights?: number[];
  storageKey?: string;
}

export interface IABTestResult {
  variant: ComputedRef<string>;
  trackAssignment: () => void;
  trackOutcome: (outcome: "conversion" | "bounce" | "continue", value?: number) => void;
}

/**
 * A/B test composable for variant assignment and tracking
 */
export function useABTest(config: IABTestConfig): IABTestResult {
  const { testId, variants, weights, storageKey } = config;

  if (variants.length === 0) {
    throw new Error("useABTest: variants array cannot be empty");
  }

  if (weights && weights.length !== variants.length) {
    throw new Error("useABTest: weights array must match variants array length");
  }

  if (weights) {
    const sum = weights.reduce((a, b) => a + b, 0);
    if (Math.abs(sum - 1.0) > 0.01) {
      throw new Error("useABTest: weights must sum to 1.0");
    }
  }

  const { track } = useAnalytics();

  const STORAGE_KEY_PREFIX = "q8m_ab_test_";
  const finalStorageKey = storageKey ?? `${STORAGE_KEY_PREFIX}${testId}`;

  const variant = ref<string>("control");
  const hasTrackedAssignment = ref<boolean>(false);

  /**
   * Get variant from localStorage or assign new one
   */
  const getVariant = (): string => {
    if (typeof localStorage === "undefined") {
      return variants[0] ?? "control";
    }

    const stored = localStorage.getItem(finalStorageKey);
    if (stored && variants.includes(stored)) {
      return stored;
    }

    const assignedVariant = assignVariant(variants, weights);
    localStorage.setItem(finalStorageKey, assignedVariant);
    return assignedVariant;
  };

  /**
   * Assign variant using weighted random distribution
   */
  const assignVariant = (variantList: string[], weightList?: number[]): string => {
    if (!weightList || weightList.length !== variantList.length) {
      // Equal distribution
      const randomIndex = Math.floor(Math.random() * variantList.length);
      return variantList[randomIndex] ?? "control";
    }

    // Weighted distribution
    const random = Math.random();
    let cumulativeWeight = 0;

    for (let i = 0; i < variantList.length; i++) {
      cumulativeWeight += weightList[i] ?? 0;
      if (random <= cumulativeWeight) {
        return variantList[i] ?? "control";
      }
    }

    return variantList[0] ?? "control";
  };

  /**
   * Track variant assignment event (call once when variant is displayed)
   */
  const trackAssignment = (): void => {
    if (hasTrackedAssignment.value) {
      return;
    }

    const event: IABTestAssignmentEvent = {
      testId,
      variant: variant.value,
      timestamp: Date.now(),
    };

    track("ab_test_assignment", event);
    hasTrackedAssignment.value = true;
  };

  /**
   * Track A/B test outcome (conversion, bounce, continue)
   */
  const trackOutcome = (
    outcome: "conversion" | "bounce" | "continue",
    value?: number
  ): void => {
    track("ab_test_outcome", {
      testId,
      variant: variant.value,
      outcome,
      value,
      timestamp: Date.now(),
    });
  };

  // Initialize variant on mount
  onMounted(() => {
    variant.value = getVariant();
  });

  return {
    variant: computed(() => variant.value),
    trackAssignment,
    trackOutcome,
  };
}
