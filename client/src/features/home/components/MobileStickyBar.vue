<template>
  <Transition name="slide-up">
    <div
      v-if="showStickyBar"
      class="mobile-sticky-bar"
      role="region"
      aria-label="Mobile call to action"
      data-testid="mobile-sticky-bar"
    >
      <div class="mobile-sticky-bar__container">
        <!-- Message -->
        <div class="mobile-sticky-bar__message">
          <span class="mobile-sticky-bar__text">
            {{ t("home.mobileStickyBar.message") }}
          </span>
        </div>

        <!-- Actions -->
        <div class="mobile-sticky-bar__actions">
          <!-- CTA button -->
          <button
            type="button"
            class="mobile-sticky-bar__cta"
            @click="handleCTAClick"
            :aria-label="t('home.mobileStickyBar.ctaAriaLabel')"
            data-testid="mobile-sticky-cta"
          >
            {{ t("home.mobileStickyBar.cta") }}
          </button>

          <!-- Dismiss button -->
          <button
            type="button"
            class="mobile-sticky-bar__dismiss"
            @click="handleDismiss"
            :aria-label="t('home.mobileStickyBar.dismissAriaLabel')"
            data-testid="mobile-sticky-dismiss"
          >
            <svg
              class="mobile-sticky-bar__dismiss-icon"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import type { IMobileStickyBarEmits as Emits } from "@/types/components/home";
import { ref, computed, onMounted, onUnmounted } from "vue";
import { useI18n } from "vue-i18n";
import { useRouter, useRoute } from "vue-router";
import { useScrollTracking } from "@/composables/useScrollTracking";
import { useHomepageAnalytics } from "@/composables/useHomepageAnalytics";

const emit = defineEmits<Emits>();

const { t, locale } = useI18n();
const router = useRouter();
const route = useRoute();
const { scrollY } = useScrollTracking({ trackingEnabled: false });
const { trackCTAClick } = useHomepageAnalytics();

const DISMISS_STORAGE_KEY = "q8m_mobile_sticky_dismissed";
const DISMISS_DURATION = 24 * 60 * 60 * 1000; // 24 hours
const SCROLL_TRIGGER_THRESHOLD = 800; // Show after scrolling 800px

const hasDismissed = ref<boolean>(false);

const currentLocale = computed(() => (route.params.locale as string) || locale.value);

// Show sticky bar when scrolled past threshold and not dismissed
const showStickyBar = computed(() => {
  return scrollY.value > SCROLL_TRIGGER_THRESHOLD && !hasDismissed.value;
});

/**
 * Check if user has dismissed the bar within the last 24 hours
 */
const checkDismissalStatus = (): void => {
  if (typeof localStorage === "undefined") {
    return;
  }

  const dismissedAt = localStorage.getItem(DISMISS_STORAGE_KEY);
  if (!dismissedAt) {
    return;
  }

  const dismissedTimestamp = parseInt(dismissedAt, 10);
  const now = Date.now();

  if (now - dismissedTimestamp < DISMISS_DURATION) {
    hasDismissed.value = true;
  } else {
    // Dismissal expired, remove from storage
    localStorage.removeItem(DISMISS_STORAGE_KEY);
  }
};

/**
 * Handle CTA button click
 */
const handleCTAClick = (): void => {
  trackCTAClick({
    ctaType: "primary",
    ctaText: t("home.mobileStickyBar.cta"),
    ctaLocation: "hero", // Sticky bar is conceptually part of hero CTA
    destinationUrl: "/register",
  });

  emit("cta-click");

  // Navigate to signup
  router.push({
    name: "register",
    params: { locale: currentLocale.value },
    query: { source: "mobile_sticky_bar" },
  });
};

/**
 * Handle dismiss button click
 */
const handleDismiss = (): void => {
  hasDismissed.value = true;

  if (typeof localStorage !== "undefined") {
    localStorage.setItem(DISMISS_STORAGE_KEY, Date.now().toString());
  }

  emit("dismiss");

  // Track dismissal
  trackCTAClick({
    ctaType: "tertiary",
    ctaText: "dismiss",
    ctaLocation: "hero",
    destinationUrl: "",
  });
};

// Lifecycle
onMounted(() => {
  checkDismissalStatus();
});

onUnmounted(() => {
  // Cleanup if needed
});

defineOptions({
  name: "MobileStickyBar",
});
</script>

<style scoped>
.mobile-sticky-bar {
  @apply fixed bottom-0 left-0 right-0 z-50;
  @apply bg-white dark:bg-gray-900;
  @apply border-t-2 border-gray-200 dark:border-gray-700;
  @apply shadow-2xl;
  @apply md:hidden; /* Only show on mobile */
}

.mobile-sticky-bar__container {
  @apply px-4 py-3;
  @apply flex items-center justify-between gap-3;
}

.mobile-sticky-bar__message {
  @apply flex-1;
}

.mobile-sticky-bar__text {
  @apply text-sm font-medium text-gray-900 dark:text-white;
  @apply line-clamp-2;
}

.mobile-sticky-bar__actions {
  @apply flex items-center gap-2;
}

.mobile-sticky-bar__cta {
  @apply rounded-lg px-4 py-2;
  @apply bg-gradient-to-r from-blue-600 to-purple-600;
  @apply text-sm font-bold text-white;
  @apply shadow-lg;
  @apply hover:from-blue-700 hover:to-purple-700;
  @apply focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2;
  @apply transition-all duration-200;
  @apply whitespace-nowrap;
}

.mobile-sticky-bar__dismiss {
  @apply rounded-lg p-2;
  @apply text-gray-600 dark:text-gray-400;
  @apply hover:bg-gray-100 dark:hover:bg-gray-800;
  @apply focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2;
  @apply transition-colors duration-200;
}

.mobile-sticky-bar__dismiss-icon {
  @apply h-5 w-5;
}

/* Slide-up transition */
.slide-up-enter-active,
.slide-up-leave-active {
  transition:
    transform 0.3s ease-out,
    opacity 0.3s ease-out;
}

.slide-up-enter-from {
  transform: translateY(100%);
  opacity: 0;
}

.slide-up-leave-to {
  transform: translateY(100%);
  opacity: 0;
}

/* RTL support */
[dir="rtl"] .mobile-sticky-bar__container {
  @apply flex-row-reverse;
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  .slide-up-enter-active,
  .slide-up-leave-active {
    transition: none;
  }

  .mobile-sticky-bar__cta {
    @apply transition-none;
  }
}

/* Small screens */
@media (width <= 360px) {
  .mobile-sticky-bar__text {
    @apply text-xs;
  }

  .mobile-sticky-bar__cta {
    @apply px-3 py-1.5 text-xs;
  }
}
</style>
