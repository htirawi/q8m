<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
    <div class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <!-- Header -->
      <div class="mb-12 text-center">
        <h1 class="mb-4 text-4xl font-bold text-gray-900 dark:text-white md:text-5xl">
          {{ t('study.selection.title') }}
        </h1>
        <p class="text-lg text-gray-600 dark:text-gray-400 md:text-xl">
          {{ t('study.selection.subtitle') }}
        </p>
      </div>

      <!-- Difficulty Selection -->
      <div ref="difficultySelectionRef" class="mb-12">
        <h2 class="mb-8 text-center text-2xl font-bold text-gray-900 dark:text-white">
          {{ t('study.selection.chooseDifficulty') }}
        </h2>
        <div class="grid grid-cols-1 gap-6 md:grid-cols-3">
          <!-- Easy -->
          <LevelCard
            difficulty="easy"
            :is-locked="!canUserAccessDifficulty('easy') && authStore.isAuthenticated"
            :is-selected="selectedDifficulty === 'easy'"
            :is-current-plan="isUserCurrentPlan('easy')"
            :features="easyFeatures"
            :auto-start-enabled="isAutoStartEnabled"
            required-plan="free"
            @select="handleDifficultySelect"
            @auto-start="handleAutoStart"
            @unlock-click="handleUnlockClick"
          />

          <!-- Medium -->
          <LevelCard
            difficulty="medium"
            :is-locked="!canUserAccessDifficulty('medium') && authStore.isAuthenticated"
            :is-selected="selectedDifficulty === 'medium'"
            :is-current-plan="isUserCurrentPlan('medium')"
            :features="mediumFeatures"
            required-plan="intermediate"
            @select="handleDifficultySelect"
            @unlock-click="handleUnlockClick"
          />

          <!-- Hard -->
          <LevelCard
            difficulty="hard"
            :is-locked="!canUserAccessDifficulty('hard') && authStore.isAuthenticated"
            :is-selected="selectedDifficulty === 'hard'"
            :is-current-plan="isUserCurrentPlan('hard')"
            :features="hardFeatures"
            required-plan="advanced"
            @select="handleDifficultySelect"
            @unlock-click="handleUnlockClick"
          />
        </div>
      </div>

      <!-- Start Button (Visible when auto-start is disabled or no selection) -->
      <StartStudyingCta
        v-if="!isAutoStartEnabled || selectedDifficulty !== 'easy'"
        :selected-difficulty="selectedDifficulty"
        :disabled="selectedDifficulty !== null && !canUserAccessDifficulty(selectedDifficulty)"
        scroll-target-selector="#difficulty-selection"
        @click="startStudy"
      />

      <!-- Features -->
      <div class="mt-16 grid grid-cols-1 gap-6 md:grid-cols-3">
        <div class="rounded-xl border border-gray-200 bg-white/50 p-6 backdrop-blur dark:border-gray-700 dark:bg-gray-800/50">
          <div class="mb-3 text-3xl">📚</div>
          <h3 class="mb-2 font-semibold text-gray-900 dark:text-white">
            {{ t('study.features.selfPaced.title') }}
          </h3>
          <p class="text-sm text-gray-600 dark:text-gray-400">
            {{ t('study.features.selfPaced.description') }}
          </p>
        </div>

        <div class="rounded-xl border border-gray-200 bg-white/50 p-6 backdrop-blur dark:border-gray-700 dark:bg-gray-800/50">
          <div class="mb-3 text-3xl">💡</div>
          <h3 class="mb-2 font-semibold text-gray-900 dark:text-white">
            {{ t('study.features.detailedExplanations.title') }}
          </h3>
          <p class="text-sm text-gray-600 dark:text-gray-400">
            {{ t('study.features.detailedExplanations.description') }}
          </p>
        </div>

        <div class="rounded-xl border border-gray-200 bg-white/50 p-6 backdrop-blur dark:border-gray-700 dark:bg-gray-800/50">
          <div class="mb-3 text-3xl">🔖</div>
          <h3 class="mb-2 font-semibold text-gray-900 dark:text-white">
            {{ t('study.features.bookmarks.title') }}
          </h3>
          <p class="text-sm text-gray-600 dark:text-gray-400">
            {{ t('study.features.bookmarks.description') }}
          </p>
        </div>
      </div>
    </div>

    <!-- Sticky Start Bar (secondary affordance when auto-start is off) -->
    <StickyStartBar
      :is-visible="!isAutoStartEnabled && selectedDifficulty === 'easy'"
      :selected-difficulty="selectedDifficulty"
      :state="loadingState"
      :error-message="errorMessage"
      :has-last-session="hasLastSession"
      @start="handleStickyStart"
      @retry="handleStickyRetry"
    />

    <!-- Convert Modal -->
    <PlanConversionModal
      v-if="upsellModalContext"
      :is-visible="isUpsellModalVisible"
      :difficulty="upsellModalContext.difficulty"
      :required-plan="upsellModalContext.requiredPlan"
      @dismiss="handleUpsellDismiss"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from "vue";
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";
import { usePlanStore } from "@/stores/plan";
import { useAuthStore } from "@/stores/auth";
import { useUpsell } from "@/composables/useUpsell";
import { useStudy } from "@/composables/useStudy";
import { useAnalytics } from "@/composables/useAnalytics";
import { canAccessDifficulty } from "@/types/plan/access";
import { usePlanEntry } from "@/composables/usePlanEntry";
import LevelCard from "@/components/study/LevelCard.vue";
import StartStudyingCta from "@/components/study/StartStudyingCta.vue";
import StickyStartBar from "@/components/study/StickyStartBar.vue";
import PlanConversionModal from "@/components/marketing/PlanConversionModal.vue";
import type { DifficultyLevel } from "@/types/plan/access";
import type { PlanTier } from "@shared/types/plan";

const { t } = useI18n();
const router = useRouter();
const planStore = usePlanStore();
const authStore = useAuthStore();
const { handlePlanEntryClick } = usePlanEntry();
const { isModalVisible: isUpsellModalVisible, modalContext: upsellModalContext, openUpsellModal, closeUpsellModal } = useUpsell();
const { track } = useAnalytics();

// Study composable with auto-start logic
const {
  loadingState,
  errorMessage,
  isAutoStartEnabled,
  hasLastSession,
  startEasySession,
  resumeLastSession,
  retry,
} = useStudy();

const selectedDifficulty = ref<DifficultyLevel | null>(null);
const difficultySelectionRef = ref<HTMLDivElement>();

const locale = computed(() => (router.currentRoute.value.params.locale as string) || "en");

const canUserAccessDifficulty = (difficulty: DifficultyLevel): boolean => {
  return canAccessDifficulty(planStore.planTier, difficulty);
};

// Determine if a difficulty level represents the user's current plan tier
// Mapping: free → easy, intermediate → medium, advanced → hard, pro/bundle → medium + hard
const isUserCurrentPlan = (difficulty: DifficultyLevel): boolean => {
  const currentTier = planStore.planTier;

  // Bundle/Pro plan includes both Intermediate (medium) and Senior (hard)
  if (currentTier === 'pro') {
    return difficulty === 'medium' || difficulty === 'hard';
  }

  // For other plans, map to specific difficulty
  const tierToDifficultyMap: Record<Exclude<PlanTier, 'pro'>, DifficultyLevel> = {
    free: 'easy',
    intermediate: 'medium',
    advanced: 'hard',
  };

  return tierToDifficultyMap[currentTier] === difficulty;
};

// Features for each difficulty level (shown on locked cards)
const easyFeatures = computed(() => [
  t('study.levelCard.features.easy.feature1'),
  t('study.levelCard.features.easy.feature2'),
  t('study.levelCard.features.easy.feature3'),
]);

const mediumFeatures = computed(() => [
  t('study.levelCard.features.medium.feature1'),
  t('study.levelCard.features.medium.feature2'),
  t('study.levelCard.features.medium.feature3'),
  t('study.levelCard.features.medium.feature4'),
]);

const hardFeatures = computed(() => [
  t('study.levelCard.features.hard.feature1'),
  t('study.levelCard.features.hard.feature2'),
  t('study.levelCard.features.hard.feature3'),
  t('study.levelCard.features.hard.feature4'),
  t('study.levelCard.features.hard.feature5'),
]);

/**
 * Handle auto-start for Easy difficulty (one-click flow)
 */
const handleAutoStart = async (difficulty: DifficultyLevel) => {
  if (difficulty !== 'easy') {
    // Only Easy supports auto-start
    return;
  }

  try {
    if (hasLastSession.value) {
      await resumeLastSession(locale.value);
    } else {
      await startEasySession(locale.value);
    }
  } catch (error) {
    // Error handled by useStudy composable
    console.error('Auto-start failed:', error);
  }
};

/**
 * Handle traditional selection (Medium/Hard or Easy with auto-start disabled)
 */
const handleDifficultySelect = (difficulty: DifficultyLevel) => {
  if (canUserAccessDifficulty(difficulty) || !authStore.isAuthenticated) {
    selectedDifficulty.value = difficulty;
  }
};

/**
 * Handle unlock click for locked difficulties (Medium/Hard)
 */
const handleUnlockClick = (difficulty: DifficultyLevel, requiredPlan: PlanTier) => {
  // Open upsell modal
  openUpsellModal(difficulty, requiredPlan, 'level_card');
};

/**
 * Handle upsell modal dismiss
 */
const handleUpsellDismiss = () => {
  closeUpsellModal();
};

/**
 * Start study session (from CTA or sticky bar)
 */
const startStudy = async (difficulty: DifficultyLevel | null) => {
  if (!difficulty) {
    return;
  }

  // Use plan entry handler for auth gating and intent preservation
  await handlePlanEntryClick("study", difficulty, locale.value);
};

/**
 * Handle sticky bar start click
 */
const handleStickyStart = async () => {
  if (selectedDifficulty.value) {
    await startStudy(selectedDifficulty.value);
  } else {
    // Default to Easy
    await startEasySession(locale.value);
  }
};

/**
 * Handle sticky bar retry
 */
const handleStickyRetry = async () => {
  await retry(locale.value);
};

/**
 * Handle keyboard shortcut 'S' for start/resume
 */
const handleKeyboardShortcut = (event: KeyboardEvent) => {
  // Check if 'S' or 's' key is pressed (without modifiers except shift)
  if (
    (event.key === 'S' || event.key === 's') &&
    !event.ctrlKey &&
    !event.metaKey &&
    !event.altKey
  ) {
    // Don't trigger if user is typing in an input/textarea
    const target = event.target as HTMLElement;
    if (
      target.tagName === 'INPUT' ||
      target.tagName === 'TEXTAREA' ||
      target.isContentEditable
    ) {
      return;
    }

    // Prevent default behavior
    event.preventDefault();

    // Track event
    track('keyboard_shortcut_used', {
      key: 'S',
      action: 'start_resume_study',
    });

    // Trigger start/resume
    if (isAutoStartEnabled.value && canUserAccessDifficulty('easy')) {
      handleAutoStart('easy');
    } else if (selectedDifficulty.value) {
      startStudy(selectedDifficulty.value);
    } else {
      // Default to Easy
      handleAutoStart('easy');
    }
  }
};

// Lifecycle hooks
onMounted(() => {
  // Register keyboard shortcut
  window.addEventListener('keydown', handleKeyboardShortcut);
});

onUnmounted(() => {
  // Cleanup keyboard shortcut
  window.removeEventListener('keydown', handleKeyboardShortcut);
});
</script>

