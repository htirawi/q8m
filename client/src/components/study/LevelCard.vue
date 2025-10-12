<template>
  <button
    type="button"
    :class="cardClasses"
    :disabled="isLocked && !canClickLocked"
    :aria-label="ariaLabel"
    :aria-pressed="isSelected"
    @click="handleClick"
  >
    <!-- Current Plan Badge (shown for user's active subscription) -->
    <div
      v-if="isCurrentPlan && !isLocked"
      class="absolute top-4 right-4 z-10"
      aria-label="Your current plan"
    >
      <div class="flex h-8 w-8 items-center justify-center rounded-full bg-green-500 shadow-lg">
        <svg class="h-5 w-5 text-white" fill="currentColor" viewBox="0 0 20 20">
          <path
            fill-rule="evenodd"
            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
            clip-rule="evenodd"
          />
        </svg>
      </div>
    </div>

    <!-- Selection indicator (shown when user selects a difficulty for this session) -->
    <div
      v-else-if="isSelected && !isLocked"
      class="absolute top-4 right-4 z-10"
      aria-hidden="true"
    >
      <div class="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
        <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
          <path
            fill-rule="evenodd"
            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
            clip-rule="evenodd"
          />
        </svg>
      </div>
    </div>

    <!-- Card content -->
    <div class="relative z-10">
      <!-- Icon and title -->
      <div class="mb-4 flex items-center gap-3">
        <span class="text-3xl" :aria-label="difficultyIconLabel">{{ icon }}</span>
        <h3 class="text-xl font-bold">{{ title }}</h3>
      </div>

      <!-- Description -->
      <p :class="descriptionClasses">
        {{ description }}
      </p>

      <!-- Status badge -->
      <div class="mt-4">
        <!-- Current Plan Badge -->
        <span
          v-if="!isLocked && isCurrentPlan"
          class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
        >
          {{ t('study.levelCard.currentPlan') }}
        </span>
        <!-- Available Badge -->
        <span
          v-else-if="!isLocked"
          class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium"
          :class="availableBadgeClass"
        >
          {{ t('plans.access.available') }}
        </span>
        <!-- Locked Badge -->
        <LockedBadge v-else :required-plan="requiredPlan" />
      </div>

      <!-- Features list (visible for locked cards) -->
      <div v-if="isLocked && features.length > 0" class="mt-4 space-y-2">
        <div
          v-for="(feature, idx) in features"
          :key="idx"
          class="flex items-start gap-2 text-left text-sm"
          :class="featureTextClass"
        >
          <svg
            class="mt-0.5 h-4 w-4 flex-shrink-0"
            :class="featureIconClass"
            fill="currentColor"
            viewBox="0 0 20 20"
            aria-hidden="true"
          >
            <path
              fill-rule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clip-rule="evenodd"
            />
          </svg>
          <span>{{ feature }}</span>
        </div>

        <!-- Upgrade button for locked cards -->
        <div class="mt-4">
          <span
            class="inline-flex items-center gap-1 rounded-lg bg-primary-100 px-3 py-1.5 text-xs font-medium text-primary-700 dark:bg-primary-900/30 dark:text-primary-400"
          >
            <svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            {{ t('study.levelCard.clickToUnlock') }}
          </span>
        </div>
      </div>
    </div>
  </button>
</template>

<script setup lang="ts">
import { computed, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import { useAnalytics } from "@/composables/useAnalytics";
import LockedBadge from "@/components/paywall/LockedBadge.vue";
import type { DifficultyLevel } from "@/types/plan/access";
import type { PlanTier } from "@shared/types/plan";

interface Props {
  difficulty: DifficultyLevel;
  isLocked: boolean;
  isSelected: boolean;
  isCurrentPlan?: boolean; // User's active subscription plan
  features?: string[];
  requiredPlan?: PlanTier;
  canClickLocked?: boolean;
  autoStartEnabled?: boolean; // Enable one-click start for Easy
}

interface Emits {
  (e: "select", difficulty: DifficultyLevel): void;
  (e: "unlock-click", difficulty: DifficultyLevel, requiredPlan: PlanTier): void;
  (e: "auto-start", difficulty: DifficultyLevel): void; // New: for instant Easy start
}

const props = withDefaults(defineProps<Props>(), {
  features: () => [],
  requiredPlan: "intermediate",
  canClickLocked: true,
  isCurrentPlan: false,
  autoStartEnabled: false,
});

const emit = defineEmits<Emits>();

const { t } = useI18n();
const { trackStudyEvent } = useAnalytics();

const iconMap: Record<DifficultyLevel, string> = {
  easy: '🟢',
  medium: '🟡',
  hard: '🔴',
};

const icon = computed(() => iconMap[props.difficulty]);

const difficultyIconLabel = computed(() => t(`difficulty.${props.difficulty}.label`));

const title = computed(() => t(`difficulty.${props.difficulty}.label`));

const description = computed(() => t(`difficulty.${props.difficulty}.description`));

const ariaLabel = computed(() => {
  if (props.isLocked) {
    return t('study.levelCard.ariaLabelLocked', {
      difficulty: title.value,
      plan: t(`plans.names.${props.requiredPlan}`),
    });
  }
  return t('study.levelCard.ariaLabelUnlocked', {
    difficulty: title.value,
    selected: props.isSelected ? t('common.selected') : t('common.notSelected'),
  });
});

const cardClasses = computed(() => {
  const baseClass = "group relative overflow-hidden rounded-2xl border-2 p-6 text-left transition-all duration-300";

  if (props.isLocked) {
    // Locked card - still clickable if canClickLocked is true
    if (props.canClickLocked) {
      return `${baseClass} cursor-pointer border-primary-300 bg-gradient-to-br from-primary-50 to-purple-50 hover:border-primary-500 hover:shadow-xl hover:scale-[1.02] dark:border-primary-700/50 dark:from-primary-900/20 dark:to-purple-900/20 dark:hover:border-primary-500`;
    }
    return `${baseClass} cursor-not-allowed opacity-60 border-gray-300 bg-gray-100 dark:border-gray-600 dark:bg-gray-700`;
  }

  // Current plan - highlight with bold gradient and green accent
  if (props.isCurrentPlan) {
    return `${baseClass} cursor-pointer scale-105 border-green-500 bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-2xl hover:shadow-green-500/20 hover:scale-[1.07]`;
  }

  // Selected card for this session
  if (props.isSelected) {
    return `${baseClass} scale-105 border-blue-500 bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-2xl`;
  }

  // Default unselected card (available but not selected) - with subtle gradient
  return `${baseClass} cursor-pointer border-gray-200 bg-gradient-to-br from-blue-50 to-purple-50 hover:border-blue-400 hover:shadow-xl hover:scale-[1.02] dark:border-gray-700 dark:bg-gradient-to-br dark:from-gray-800 dark:to-gray-800 dark:hover:border-blue-600`;
});

const descriptionClasses = computed(() => {
  if ((props.isSelected || props.isCurrentPlan) && !props.isLocked) {
    return "text-sm text-white/90";
  }
  return "text-sm text-gray-600 dark:text-gray-400";
});

const availableBadgeClass = computed(() => {
  const colorMap: Record<DifficultyLevel, string> = {
    easy: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    hard: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  };
  return colorMap[props.difficulty];
});

const featureTextClass = computed(() => {
  if (props.isLocked) {
    return "text-gray-700 dark:text-gray-300";
  }
  return "text-gray-600 dark:text-gray-400";
});

const featureIconClass = computed(() => {
  if (props.isLocked) {
    return "text-primary-500 dark:text-primary-400";
  }
  return "text-gray-400";
});

const handleClick = () => {
  if (props.isLocked) {
    if (props.canClickLocked) {
      trackStudyEvent('level_card_clicked', {
        difficulty: props.difficulty,
        isLocked: true,
        requiredPlan: props.requiredPlan,
      });
      emit('unlock-click', props.difficulty, props.requiredPlan);
    }
  } else {
    // Check if auto-start is enabled for Easy difficulty
    const shouldAutoStart = props.autoStartEnabled && props.difficulty === 'easy';

    if (shouldAutoStart) {
      // One-click start: emit auto-start event
      trackStudyEvent('level_card_selected', {
        difficulty: props.difficulty,
      });
      emit('auto-start', props.difficulty);
    } else {
      // Traditional flow: emit select event
      trackStudyEvent('level_card_selected', {
        difficulty: props.difficulty,
      });
      emit('select', props.difficulty);
    }
  }
};

onMounted(() => {
  // Track card view
  trackStudyEvent('level_card_viewed', {
    difficulty: props.difficulty,
    isLocked: props.isLocked,
    requiredPlan: props.isLocked ? props.requiredPlan : undefined,
  });
});
</script>

<style scoped>
/* Entrance animation */
@media (prefers-reduced-motion: no-preference) {
  button {
    animation: slideInUp 0.4s ease-out backwards;
  }

  button:nth-child(1) {
    animation-delay: 0.1s;
  }

  button:nth-child(2) {
    animation-delay: 0.2s;
  }

  button:nth-child(3) {
    animation-delay: 0.3s;
  }
}

@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Focus styles */
button:focus-visible {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}
</style>
