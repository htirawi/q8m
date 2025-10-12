<template>
  <div class="text-center">
    <!-- Main CTA Button -->
    <button
      ref="ctaButtonRef"
      type="button"
      :disabled="disabled"
      class="group relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 px-12 py-4 text-lg font-bold text-white shadow-2xl transition-all duration-300 hover:scale-105 hover:shadow-3xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
      :aria-label="ariaLabel"
      @click="handleClick"
    >
      <span class="relative z-10 flex items-center gap-3">
        <span>{{ buttonText }}</span>
        <svg
          class="h-5 w-5 transition-transform group-hover:translate-x-1"
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

    <!-- Trust signals -->
    <div class="mt-4 flex flex-wrap items-center justify-center gap-4 text-sm text-gray-600 dark:text-gray-400">
      <div class="flex items-center gap-1.5">
        <svg class="h-4 w-4 text-primary-500" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
          <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
        </svg>
        <span>{{ t('study.cta.trust.users') }}</span>
      </div>
      <div class="flex items-center gap-1.5">
        <svg class="h-4 w-4 text-primary-500" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
          <path fill-rule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
        </svg>
        <span>{{ t('study.cta.trust.successRate') }}</span>
      </div>
    </div>

    <!-- Hidden reference element for scroll targeting -->
    <div ref="difficultyRef" class="sr-only" aria-hidden="true"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from "vue";
import { useI18n } from "vue-i18n";
import { useAnalytics } from "@/composables/useAnalytics";
import type { DifficultyLevel } from "@/types/plan/access";

interface Props {
  selectedDifficulty: DifficultyLevel | null;
  disabled?: boolean;
  scrollTargetSelector?: string;
}

interface Emits {
  (e: "click", difficulty: DifficultyLevel | null): void;
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
  scrollTargetSelector: undefined,
});

const emit = defineEmits<Emits>();

const { t } = useI18n();
const { trackStudyEvent } = useAnalytics();

const ctaButtonRef = ref<HTMLButtonElement>();
const difficultyRef = ref<HTMLDivElement>();
const hasTrackedView = ref(false);

const buttonText = computed(() => {
  if (props.selectedDifficulty) {
    return t('study.cta.startStudying');
  }
  return t('study.cta.chooseDifficultyFirst');
});

const ariaLabel = computed(() => {
  if (props.selectedDifficulty) {
    return t('study.cta.ariaLabelWithSelection', {
      difficulty: t(`difficulty.${props.selectedDifficulty}.label`),
    });
  }
  return t('study.cta.ariaLabelNoSelection');
});

const handleClick = () => {
  trackStudyEvent('study_cta_clicked', {
    hasSelection: !!props.selectedDifficulty,
    difficulty: props.selectedDifficulty ?? undefined,
    source: 'inline',
  });

  if (props.selectedDifficulty) {
    // Emit click event to parent
    emit('click', props.selectedDifficulty);
  } else {
    // Scroll to difficulty selection
    scrollToDifficultySelection();
  }
};

const scrollToDifficultySelection = () => {
  let targetElement: HTMLElement | null = null;

  // Try to find the target element using the selector
  if (props.scrollTargetSelector) {
    targetElement = document.querySelector(props.scrollTargetSelector);
  }

  if (targetElement) {
    trackStudyEvent('study_cta_scroll_prompt', {});

    // Smooth scroll to the difficulty selection
    targetElement.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
    });

    // Add a gentle shake animation to highlight the section
    targetElement.classList.add('animate-shake');
    setTimeout(() => {
      targetElement?.classList.remove('animate-shake');
    }, 600);
  }
};

// Track CTA view when it becomes visible
const handleIntersection: IntersectionObserverCallback = (entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting && !hasTrackedView.value) {
      trackStudyEvent('study_cta_viewed', {});
      hasTrackedView.value = true;
    }
  });
};

let observer: IntersectionObserver | null = null;

onMounted(() => {
  // Set up intersection observer to track when CTA becomes visible
  if (ctaButtonRef.value) {
    observer = new IntersectionObserver(handleIntersection, {
      threshold: 0.5,
    });
    observer.observe(ctaButtonRef.value);
  }
});

onUnmounted(() => {
  if (observer) {
    observer.disconnect();
  }
});
</script>

<style scoped>
/* Shake animation for scroll target highlight */
:global(.animate-shake) {
  animation: shake 0.6s ease-in-out;
}

@keyframes shake {
  0%, 100% {
    transform: translateX(0);
  }
  10%, 30%, 50%, 70%, 90% {
    transform: translateX(-4px);
  }
  20%, 40%, 60%, 80% {
    transform: translateX(4px);
  }
}

/* Focus-visible styles */
button:focus-visible {
  outline: 2px solid #3b82f6;
  outline-offset: 4px;
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  button,
  svg,
  :global(.animate-shake) {
    animation: none !important;
    transition: none !important;
  }
}
</style>
