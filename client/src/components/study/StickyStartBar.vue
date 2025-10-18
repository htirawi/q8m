<template>
  <Transition name="slide-up" @before-enter="handleBeforeEnter" @after-enter="handleAfterEnter">
    <div
      v-if="isVisible"
      class="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-200 bg-white/95 shadow-2xl backdrop-blur-sm dark:border-gray-700 dark:bg-gray-900/95"
      role="region"
      aria-label="Study session start control"
      data-testid="sticky-start-bar"
    >
      <div class="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        <div class="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <!-- Left: Status/Info -->
          <div class="flex items-center gap-3">
            <!-- Loading state -->
            <div
              v-if="state === 'loading'"
              class="flex items-center gap-3 text-gray-700 dark:text-gray-300"
            >
              <div
                class="h-5 w-5 animate-spin rounded-full border-2 border-blue-600 border-t-transparent"
                aria-hidden="true"
              />
              <span class="text-sm font-medium">{{ t("study.sticky.loading") }} </span>
            </div>

            <!-- Error state -->
            <div
              v-else-if="state === 'error'"
              class="flex items-center gap-3 text-red-700 dark:text-red-400"
            >
              <svg
                class="h-5 w-5 flex-shrink-0"
                fill="currentColor"
                viewBox="0 0 20 20"
                aria-hidden="true"
              >
                <path
                  fill-rule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clip-rule="evenodd"
                />
              </svg>
              <span class="text-sm font-medium"
                >{{ errorMessage || t("study.sticky.error") }}
              </span>
            </div>

            <!-- Idle state - show trust signals -->
            <div v-else class="flex items-center gap-3">
              <div class="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <svg
                  class="h-4 w-4 text-green-500"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  aria-hidden="true"
                >
                  <path
                    fill-rule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clip-rule="evenodd"
                  />
                </svg>
                <span class="font-medium">{{ trustMessage }} </span>
              </div>
            </div>
          </div>

          <!-- Right: Actions -->
          <div class="flex items-center gap-3">
            <!-- Retry button (error state only) -->
            <button
              v-if="state === 'error'"
              type="button"
              class="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
              :aria-label="t('study.sticky.retryAriaLabel')"
              data-testid="sticky-retry-button"
              @click="handleRetry"
            >
              {{ t("study.sticky.retry") }}
            </button>

            <!-- Start button -->
            <button
              ref="startButtonRef"
              type="button"
              :disabled="state === 'loading'"
              class="group relative overflow-hidden rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-2 text-sm font-bold text-white shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
              :aria-label="startButtonAriaLabel"
              data-testid="sticky-start-button"
              @click="handleStart"
            >
              <span class="relative z-10 flex items-center gap-2">
                <span>{{ startButtonText }} </span>
                <svg
                  v-if="state !== 'loading'"
                  class="h-4 w-4 transition-transform group-hover:translate-x-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                  />
                </svg>
              </span>
              <div
                class="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 opacity-0 transition-opacity group-hover:opacity-100"
                aria-hidden="true"
              />
            </button>
          </div>
        </div>

        <!-- Keyboard hint (only show on first render) -->
        <div
          v-if="showKeyboardHint && state === 'idle'"
          class="mt-2 text-center text-xs text-gray-500 dark:text-gray-400"
          data-testid="keyboard-hint"
        >
          {{ t("study.sticky.keyboardHint") }}
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import type {
  IStickyStartBarProps as Props,
  IStickyStartBarEmits as Emits,
} from "@/types/components/study";
import { ref, computed, onMounted, onUnmounted } from "vue";
import { useI18n } from "vue-i18n";
import { useAnalytics } from "@/composables/useAnalytics";
import type { StudyLoadingState } from "@/composables/useStudy";
import type { DifficultyLevel } from "@/types/plan/access";

const props = withDefaults(defineProps<Props>(), {
  errorMessage: null,
  hasLastSession: false,
});

const emit = defineEmits<Emits>();

const { t } = useI18n();
const { track } = useAnalytics();

const startButtonRef = ref<HTMLButtonElement>();
const showKeyboardHint = ref(false);
const hasTrackedView = ref(false);

// Computed
const startButtonText = computed(() => {
  if (props.state === "loading") {
    return t("study.sticky.starting");
  }

  if (props.hasLastSession) {
    return t("study.sticky.resume");
  }

  return t("study.sticky.start");
});

const startButtonAriaLabel = computed(() => {
  if (props.selectedDifficulty) {
    return t("study.sticky.startAriaLabel", {
      difficulty: t(`difficulty.${props.selectedDifficulty}.label`),
    });
  }
  return t("study.sticky.startAriaLabelGeneric");
});

const trustMessage = computed(() => {
  if (props.hasLastSession) {
    return t("study.sticky.trustResume");
  }

  return t("study.sticky.trustNew");
});

// Methods
const handleStart = () => {
  track("sticky_start_clicked", {
    difficulty: props.selectedDifficulty ?? "easy",
  });

  emit("start", props.selectedDifficulty);
};

const handleRetry = () => {
  track("sticky_start_retry", {
    difficulty: props.selectedDifficulty ?? "easy",
  });

  emit("retry");
};

const handleBeforeEnter = () => {
  // Animation hook
};

const handleAfterEnter = () => {
  // Track view once after animation completes
  if (!hasTrackedView.value) {
    track("sticky_start_shown", {
      reason: "autostart_disabled",
    });
    hasTrackedView.value = true;
  }

  // Show keyboard hint for 5 seconds
  showKeyboardHint.value = true;
  setTimeout(() => {
    showKeyboardHint.value = false;
  }, 5000);

  // Focus the start button for keyboard accessibility
  setTimeout(() => {
    startButtonRef.value?.focus();
  }, 100);
};

// Lifecycle
onMounted(() => {
  // Additional setup if needed
});

onUnmounted(() => {
  // Cleanup if needed
});
</script>

<style scoped>
/* Slide-up transition for sticky bar */
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

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .slide-up-enter-active,
  .slide-up-leave-active,
  button,
  svg {
    animation: none !important;
    transition: none !important;
  }
}

/* Focus styles for keyboard navigation */
button:focus-visible {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}
</style>
