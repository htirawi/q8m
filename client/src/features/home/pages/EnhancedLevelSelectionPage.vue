<template>
  <div class="level-selection-page">
    <!-- Loading skeleton -->
    <Transition name="fade" mode="out-in">
      <LevelSelectionSkeleton v-if="showSkeleton" />

      <!-- Main content -->
      <div v-else class="level-selection-page__content">
        <!-- Hero section with personalized greeting and stats -->
        <HeroSection
          :greeting="personalizedGreeting"
          :subtitle="subtitle"
          :userName="userName"
          :stats="userStats"
          :showStats="true"
          :animateEntrance="true"
          :coinTrend="coinTrend"
          :currentDifficulty="selectedLevel"
          :recentBadges="recentBadges"
          @fab-click="handleQuickStart"
        />

        <!-- Main content area -->
        <div class="level-selection-page__main">
          <!-- Section header -->
          <div class="section-header">
            <h2 class="section-header__title">{{ $t('levels.chooseYourPath') }}</h2>
            <p class="section-header__description">{{ $t('levels.selectDifficultyDescription') }}</p>
          </div>

          <!-- Level cards grid -->
          <div class="level-cards-grid">
            <LevelCard
              v-for="level in levelOptions"
              :key="level.id"
              v-bind="level"
              v-model="selectedLevelModel[level.id]"
              @select="handleLevelSelect"
              @click="trackCardInteraction"
            />
          </div>

          <!-- Action buttons -->
          <div class="action-buttons">
            <button
              class="btn btn--primary"
              :disabled="!hasSelection || isNavigating"
              @click="handleContinue"
            >
              <span v-if="!isNavigating">{{ $t('actions.continue') }}</span>
              <span v-else class="btn__loading">
                <svg class="btn__spinner" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none" opacity="0.25" />
                  <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                {{ $t('actions.loading') }}
              </span>
            </button>

            <button
              class="btn btn--secondary"
              @click="handleSkip"
              v-if="canSkip"
            >
              {{ $t('actions.skipForNow') }}
            </button>
          </div>

          <!-- Recent activity section -->
          <RecentActivity
            v-if="recentActivities.length > 0"
            :activities="recentActivities"
            class="recent-activity"
          />

          <!-- Recommendations -->
          <Recommendations
            v-if="recommendations.length > 0"
            :items="recommendations"
            class="recommendations"
          />
        </div>
      </div>
    </Transition>

    <!-- Confetti animation on milestone -->
    <Teleport to="body">
      <ConfettiCelebration
        v-if="showConfetti"
        @complete="showConfetti = false"
      />
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useAuthStore } from '@/stores/auth';
import { usePlanStore } from '@/stores/plan';
import { useSkeleton } from '@/composables/useSkeleton';
import { analytics, EventCategory, EventAction } from '@/services/analytics';
import type { ILevelCard } from '@/types/design-system';

// Components
import LevelSelectionSkeleton from '@/components/skeletons/LevelSelectionSkeleton.vue';
import HeroSection from '@/components/level-selection/HeroSection.vue';
import LevelCard from '@/components/level-selection/LevelCard.vue';
import RecentActivity from '@/components/dashboard/RecentActivity.vue';
import Recommendations from '@/components/dashboard/Recommendations.vue';
import ConfettiCelebration from '@/components/ui/ConfettiCelebration.vue';

const router = useRouter();
const { t, locale } = useI18n();
const authStore = useAuthStore();
const planStore = usePlanStore();

// Skeleton loading
const { showSkeleton, startLoading, finishLoading } = useSkeleton({
  minDuration: 800,
  delay: 200
});

// State
const selectedLevel = ref<string>('');
const selectedLevelModel = ref<Record<string, boolean>>({});
const isNavigating = ref(false);
const showConfetti = ref(false);
const userStats = ref({
  streak: 0,
  coins: 0,
  level: 1,
  progress: 0
});
const coinTrend = ref(0);
const recentBadges = ref<Array<{ id: string; name: string; emoji: string }>>([]);
const recentActivities = ref<Array<any>>([]);
const recommendations = ref<Array<any>>([]);

// Computed
const userName = computed(() => authStore.user?.name || authStore.user?.email?.split('@')[0] || 'Learner');

const personalizedGreeting = computed(() => {
  const name = userName.value;
  const hour = new Date().getHours();

  if (hour < 12) return t('greetings.morning', { name });
  if (hour < 17) return t('greetings.afternoon', { name });
  if (hour < 21) return t('greetings.evening', { name });
  return t('greetings.night', { name });
});

const subtitle = computed(() => {
  if (userStats.value.streak > 0) {
    return t('levels.subtitleWithStreak', { days: userStats.value.streak });
  }
  return t('levels.subtitleDefault');
});

const levelOptions = computed<ILevelCard[]>(() => [
  {
    id: 'junior',
    title: t('levels.junior.title'),
    subtitle: t('levels.junior.subtitle'),
    description: t('levels.junior.description'),
    duration: t('levels.junior.duration'),
    difficulty: 'junior',
    isLocked: false,
    isSelected: selectedLevel.value === 'junior',
    progress: getUserProgressForLevel('junior')
  },
  {
    id: 'intermediate',
    title: t('levels.intermediate.title'),
    subtitle: t('levels.intermediate.subtitle'),
    description: t('levels.intermediate.description'),
    duration: t('levels.intermediate.duration'),
    difficulty: 'intermediate',
    isLocked: !planStore.hasAccess('intermediate'),
    isSelected: selectedLevel.value === 'intermediate',
    requiredPlan: 'pro',
    badge: !planStore.hasAccess('intermediate') ? { text: 'PRO', variant: 'warning' } : undefined,
    progress: getUserProgressForLevel('intermediate')
  },
  {
    id: 'senior',
    title: t('levels.senior.title'),
    subtitle: t('levels.senior.subtitle'),
    description: t('levels.senior.description'),
    duration: t('levels.senior.duration'),
    difficulty: 'senior',
    isLocked: !planStore.hasAccess('senior'),
    isSelected: selectedLevel.value === 'senior',
    requiredPlan: 'pro',
    badge: !planStore.hasAccess('senior') ? { text: 'PRO', variant: 'warning' } : undefined,
    progress: getUserProgressForLevel('senior')
  },
  {
    id: 'custom',
    title: t('levels.custom.title'),
    subtitle: t('levels.custom.subtitle'),
    description: t('levels.custom.description'),
    duration: t('levels.custom.duration'),
    difficulty: 'custom',
    isLocked: false,
    isSelected: selectedLevel.value === 'custom',
    badge: { text: 'NEW', variant: 'success' }
  }
]);

const hasSelection = computed(() => selectedLevel.value !== '');
const canSkip = computed(() => userStats.value.level > 1); // Only show skip for returning users

// Methods
const handleLevelSelect = (difficulty: string) => {
  const level = levelOptions.value.find(l => l.difficulty === difficulty);
  if (level?.isLocked) return;

  // Clear other selections
  Object.keys(selectedLevelModel.value).forEach(key => {
    selectedLevelModel.value[key] = false;
  });

  // Set new selection
  selectedLevel.value = difficulty;
  selectedLevelModel.value[difficulty] = true;

  // Track selection
  analytics.track('level_selected', {
    level: difficulty,
    is_locked: level?.isLocked,
    has_progress: level?.progress ? level.progress > 0 : false
  }, {
    category: EventCategory.LevelSelection,
    action: EventAction.Click
  });

  // Save preference
  saveUserPreference('preferredDifficulty', difficulty);
};

const handleContinue = async () => {
  if (!hasSelection.value || isNavigating.value) return;

  isNavigating.value = true;

  // Track continue action
  analytics.track('level_selection_continue', {
    selected_level: selectedLevel.value,
    time_to_select: Date.now() - pageLoadTime
  }, {
    category: EventCategory.LevelSelection,
    action: EventAction.Complete
  });

  // Simulate API call to save selection
  await new Promise(resolve => setTimeout(resolve, 500));

  // Check for milestone and show confetti
  if (checkForMilestone()) {
    showConfetti.value = true;
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  // Navigate to mode chooser
  router.push(`/${locale.value}/${selectedLevel.value}/choose`);
};

const handleSkip = () => {
  analytics.track('level_selection_skipped', {
    had_previous_selection: !!selectedLevel.value
  }, {
    category: EventCategory.LevelSelection,
    action: EventAction.Skip
  });

  // Navigate to dashboard or default page
  router.push(`/${locale.value}/dashboard`);
};

const handleQuickStart = () => {
  // Use last selected level or default to junior
  const lastLevel = getUserPreference('preferredDifficulty') || 'junior';
  selectedLevel.value = lastLevel;
  handleContinue();
};

const trackCardInteraction = (event: MouseEvent) => {
  const target = event.currentTarget as HTMLElement;
  const difficulty = target.dataset.difficulty;

  analytics.track('level_card_interaction', {
    difficulty,
    interaction_type: event.type
  }, {
    category: EventCategory.Engagement,
    action: EventAction.Hover
  });
};

const getUserProgressForLevel = (level: string): number => {
  // Mock implementation - replace with actual API call
  const progress: Record<string, number> = {
    junior: 65,
    intermediate: 30,
    senior: 0
  };
  return progress[level] || 0;
};

const getUserPreference = (key: string): string | null => {
  return localStorage.getItem(`user_pref_${key}`);
};

const saveUserPreference = (key: string, value: string) => {
  localStorage.setItem(`user_pref_${key}`, value);
};

const checkForMilestone = (): boolean => {
  // Check if user reached a milestone (e.g., first senior level selection)
  return selectedLevel.value === 'senior' && getUserProgressForLevel('senior') === 0;
};

const loadUserData = async () => {
  startLoading();

  try {
    // Simulate API calls to load user data
    await Promise.all([
      loadUserStats(),
      loadRecentActivities(),
      loadRecommendations()
    ]);

    // Check for returning user and restore last selection
    const lastSelection = getUserPreference('preferredDifficulty');
    if (lastSelection) {
      selectedLevel.value = lastSelection;
      selectedLevelModel.value[lastSelection] = true;
    }
  } catch (error) {
    console.error('Failed to load user data:', error);
    analytics.trackError(error as Error, {
      context: 'level_selection_page_load'
    });
  } finally {
    await finishLoading();
  }
};

const loadUserStats = async () => {
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 300));
  userStats.value = {
    streak: 12,
    coins: 450,
    level: 3,
    progress: 65
  };
  coinTrend.value = 15; // 15% increase
  recentBadges.value = [
    { id: '1', name: 'Week Warrior', emoji: '🗓️' },
    { id: '2', name: 'Quick Learner', emoji: '⚡' },
    { id: '3', name: 'Problem Solver', emoji: '🧩' }
  ];
};

const loadRecentActivities = async () => {
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 200));
  recentActivities.value = [
    {
      id: '1',
      type: 'completion',
      title: 'Completed React Hooks Module',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      icon: '✅'
    },
    {
      id: '2',
      type: 'achievement',
      title: 'Earned "Consistent Learner" Badge',
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
      icon: '🏆'
    }
  ];
};

const loadRecommendations = async () => {
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 250));
  recommendations.value = [
    {
      id: '1',
      title: 'State Management Patterns',
      description: 'Continue where you left off',
      type: 'continue',
      progress: 60
    },
    {
      id: '2',
      title: 'Advanced TypeScript',
      description: 'Recommended based on your progress',
      type: 'recommended',
      isNew: true
    }
  ];
};

// Track page load time for analytics
const pageLoadTime = Date.now();

// Lifecycle
onMounted(() => {
  loadUserData();

  // Track page view
  analytics.page({
    page_name: 'level_selection',
    user_authenticated: true,
    plan_tier: planStore.planTier
  });
});

// Watch for selection changes to autosave
watch(selectedLevel, (newLevel) => {
  if (newLevel) {
    saveUserPreference('lastSelectedLevel', newLevel);
  }
});
</script>

<style scoped>
/* Container */
.level-selection-page {
  @apply min-h-screen bg-gray-50 dark:bg-gray-900;
}

.level-selection-page__content {
  @apply w-full;
}

/* Main content */
.level-selection-page__main {
  @apply max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12;
}

/* Section header */
.section-header {
  @apply text-center mb-12;
  animation: fade-in-up 0.6s ease-out;
}

.section-header__title {
  @apply text-3xl md:text-4xl font-bold;
  @apply bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300;
  @apply bg-clip-text text-transparent;
  @apply mb-4;
}

.section-header__description {
  @apply text-lg text-gray-600 dark:text-gray-400;
  @apply max-w-2xl mx-auto;
}

/* Level cards grid */
.level-cards-grid {
  @apply grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6;
  @apply mb-12;
}

/* Action buttons */
.action-buttons {
  @apply flex flex-col sm:flex-row items-center justify-center gap-4;
  @apply mb-16;
}

/* Button styles */
.btn {
  @apply relative px-8 py-3 rounded-xl font-semibold;
  @apply transition-all duration-fast ease-out;
  @apply focus:outline-none focus:ring-4 focus:ring-offset-2;
  @apply disabled:opacity-50 disabled:cursor-not-allowed;
  min-width: 160px;
}

.btn--primary {
  @apply bg-gradient-to-r from-primary-DEFAULT to-secondary-DEFAULT;
  @apply text-white shadow-lg;
  @apply hover:shadow-xl hover:scale-105;
  @apply focus:ring-primary-DEFAULT/50;
}

.btn--primary:not(:disabled):hover {
  background-size: 110% 110%;
}

.btn--secondary {
  @apply bg-white dark:bg-gray-800;
  @apply text-gray-700 dark:text-gray-300;
  @apply border border-gray-300 dark:border-gray-600;
  @apply hover:bg-gray-50 dark:hover:bg-gray-700;
  @apply focus:ring-gray-500/50;
}

/* Loading state */
.btn__loading {
  @apply flex items-center justify-center gap-2;
}

.btn__spinner {
  @apply w-5 h-5 animate-spin;
}

/* Recent activity section */
.recent-activity {
  @apply mt-16;
  animation: fade-in-up 0.8s ease-out 0.4s backwards;
}

/* Recommendations */
.recommendations {
  @apply mt-12;
  animation: fade-in-up 0.8s ease-out 0.6s backwards;
}

/* Animations */
@keyframes fade-in-up {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Fade transition */
.fade-enter-active,
.fade-leave-active {
  @apply transition-opacity duration-moderate;
}

.fade-enter-from,
.fade-leave-to {
  @apply opacity-0;
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  .section-header,
  .recent-activity,
  .recommendations {
    animation: none !important;
  }
}
</style>