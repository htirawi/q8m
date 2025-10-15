/**
 * Homepage Analytics Composable
 * Specialized analytics helpers for homepage tracking
 *
 * Features:
 * - Section view tracking with Intersection Observer
 * - CTA click tracking with context
 * - Pricing interaction tracking
 * - FAQ interaction tracking
 * - Social proof interaction tracking
 * - Automatic cleanup on unmount
 *
 * Usage:
 * ```typescript
 * const {
 *   trackSectionView,
 *   trackCTAClick,
 *   trackPricingInteraction,
 *   setupSectionObserver
 * } = useHomepageAnalytics();
 *
 * onMounted(() => {
 *   setupSectionObserver();
 * });
 * ```
 */

import { ref, onUnmounted } from "vue";
import { useAnalytics } from "@/composables/useAnalytics";
import type { HomepageSection } from "@/types/homepage";
import type {
  ISectionViewEvent,
  ICTAClickEvent,
  IPricingInteractionEvent,
  IFaqInteractionEvent,
  ISocialProofInteractionEvent,
} from "@/types/analytics";

export interface IHomepageAnalyticsResult {
  trackSectionView: (section: HomepageSection, viewDuration?: number) => void;
  trackCTAClick: (event: ICTAClickEvent) => void;
  trackPricingInteraction: (event: IPricingInteractionEvent) => void;
  trackFaqInteraction: (event: IFaqInteractionEvent) => void;
  trackSocialProofInteraction: (event: ISocialProofInteractionEvent) => void;
  setupSectionObserver: () => IntersectionObserver | null;
  cleanupObserver: () => void;
}

/**
 * Homepage analytics composable
 */
export function useHomepageAnalytics(): IHomepageAnalyticsResult {
  const { track } = useAnalytics();

  const viewedSections = ref<Set<HomepageSection>>(new Set());
  const sectionStartTimes = ref<Map<HomepageSection, number>>(new Map());
  let observer: IntersectionObserver | null = null;

  /**
   * Track section view event
   */
  const trackSectionView = (section: HomepageSection, viewDuration?: number): void => {
    if (viewedSections.value.has(section)) {
      return;
    }

    viewedSections.value.add(section);

    const event: ISectionViewEvent = {
      section,
      viewDuration,
      scrollPosition: window.scrollY,
    };

    track("section_view", event);
  };

  /**
   * Track CTA click event
   */
  const trackCTAClick = (event: ICTAClickEvent): void => {
    track("cta_click", event);
  };

  /**
   * Track pricing interaction event
   */
  const trackPricingInteraction = (event: IPricingInteractionEvent): void => {
    track("pricing_interaction", event);
  };

  /**
   * Track FAQ interaction event
   */
  const trackFaqInteraction = (event: IFaqInteractionEvent): void => {
    track("faq_interaction", event);
  };

  /**
   * Track social proof interaction event
   */
  const trackSocialProofInteraction = (event: ISocialProofInteractionEvent): void => {
    track("social_proof_interaction", event);
  };

  /**
   * Setup Intersection Observer for section tracking
   * Tracks when sections become visible (50% threshold)
   */
  const setupSectionObserver = (): IntersectionObserver | null => {
    if (typeof window === "undefined" || typeof IntersectionObserver === "undefined") {
      return null;
    }

    // Clean up existing observer if any
    cleanupObserver();

    observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const section = entry.target.getAttribute("data-section") as HomepageSection;

            if (section && !viewedSections.value.has(section)) {
              // Record start time for duration calculation
              if (!sectionStartTimes.value.has(section)) {
                sectionStartTimes.value.set(section, Date.now());
              }

              // Track section view
              trackSectionView(section);
            }
          } else {
            // Calculate view duration when section leaves viewport
            const section = entry.target.getAttribute("data-section") as HomepageSection;
            if (section && sectionStartTimes.value.has(section)) {
              const startTime = sectionStartTimes.value.get(section);
              if (startTime) {
                const viewDuration = Date.now() - startTime;
                // Track with duration (optional enhancement)
                track("section_view_duration", {
                  section,
                  viewDuration,
                });
                sectionStartTimes.value.delete(section);
              }
            }
          }
        });
      },
      {
        threshold: 0.5, // Trigger when 50% of section is visible
        rootMargin: "0px",
      }
    );

    // Observe all sections with data-section attribute
    const sections = document.querySelectorAll("[data-section]");
    sections.forEach((section) => {
      observer?.observe(section);
    });

    return observer;
  };

  /**
   * Cleanup Intersection Observer
   */
  const cleanupObserver = (): void => {
    if (observer) {
      observer.disconnect();
      observer = null;
    }
  };

  // Cleanup on unmount
  onUnmounted(() => {
    cleanupObserver();
  });

  return {
    trackSectionView,
    trackCTAClick,
    trackPricingInteraction,
    trackFaqInteraction,
    trackSocialProofInteraction,
    setupSectionObserver,
    cleanupObserver,
  };
}
