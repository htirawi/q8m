<template>
  <div class="level-selection-page">
    <!-- Loading skeleton -->
    <Transition name="fade" mode="out-in">
      <SelectSkeleton v-if="isLoading && !error" />

      <!-- Error state -->
      <div v-else-if="error" class="level-selection-page__error">
        <SelectError :message="error" :dismissible="false" @retry="handleRetry" />
      </div>

      <!-- Main content -->
      <div v-else class="level-selection-page__content">
        <!-- Hero section with stats -->
        <HeroSection :greeting="personalizedGreeting" :subtitle="subtitle" :userName="userName" :stats="userStats"
          :showStats="true" :animateEntrance="true" :coinTrend="coinTrend"
          :currentDifficulty="(selectedId as 'junior' | 'intermediate' | 'senior' | undefined)"
          :recentBadges="recentBadges" @fab-click="handleQuickStart" />

        <!-- Main content area -->
        <div class="level-selection-page__main">
          <!-- Section header -->
          <SelectHeader :streak="userStats.streak" />

          <!-- Level cards grid -->
          <SelectGrid v-if="levelOptions.length > 0">
            <SelectCard v-for="option in levelOptions" :key="option.id" :option="option"
              :is-selected="isSelected(option.id)" @select="handleSelect" />
          </SelectGrid>

          <!-- Empty state (if no options available - edge case) -->
          <SelectEmpty v-else @reset="handleReset" />

          <!-- Footer with CTA -->
          <SelectFooter :has-selection="hasSelection" :is-navigating="isNavigating" :can-skip="canSkip"
            @continue="handleContinue" @skip="handleSkip" @help="handleHelp" />
        </div>
      </div>
    </Transition>

    <!-- Help Modal -->
    <SelectHelpModal v-model="showHelpModal" />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useAuthStore } from '@/stores/auth';
import { useSelection } from '@/composables/useSelection';
import { useSelectData } from '@/composables/useSelectData';
import { analytics, EventCategory, EventAction } from '@/services/analytics';

// Components
import HeroSection from '@/components/level-selection/HeroSection.vue';
import SelectHeader from '@/components/select/SelectHeader.vue';
import SelectGrid from '@/components/select/SelectGrid.vue';
import SelectCard from '@/components/select/SelectCard.vue';
import SelectFooter from '@/components/select/SelectFooter.vue';
import SelectEmpty from '@/components/select/SelectEmpty.vue';
import SelectError from '@/components/select/SelectError.vue';
import SelectSkeleton from '@/components/select/SelectSkeleton.vue';
import SelectHelpModal from '@/components/select/SelectHelpModal.vue';

const router = useRouter();
const { t, locale } = useI18n();
const authStore = useAuthStore();

// Composables
const { selectedId, isNavigating, hasSelection, isSelected, select, setNavigating } = useSelection();
const { isLoading, error, levelOptions, userStats, coinTrend, recentBadges, loadData, retryLoad } =
  useSelectData();

// State
const showHelpModal = ref(false);

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
    return t('levels.subtitleWithStreak', { streak: userStats.value.streak });
  }
  return t('levels.subtitleDefault');
});

const canSkip = computed(() => userStats.value.level > 1);

// Methods
const handleSelect = (id: string): void => {
  select(id, levelOptions.value);

  analytics.track(
    'level_selected',
    {
      level: id,
    },
    {
      category: EventCategory.LevelSelection,
      action: EventAction.Click,
    }
  );
};

const handleContinue = async (): Promise<void> => {
  if (!hasSelection.value || isNavigating.value) return;

  setNavigating(true);

  analytics.track(
    'level_selection_continue',
    {
      selected_level: selectedId.value,
    },
    {
      category: EventCategory.LevelSelection,
      action: EventAction.Complete,
    }
  );

  // Navigate to mode chooser
  router.push(`/${locale.value}/${selectedId.value}/choose`);
};

const handleSkip = (): void => {
  analytics.track(
    'level_selection_skipped',
    {},
    {
      category: EventCategory.LevelSelection,
      action: EventAction.Skip,
    }
  );

  router.push(`/${locale.value}/dashboard`);
};

const handleQuickStart = (): void => {
  const lastLevel = localStorage.getItem('user_pref_preferredDifficulty') ?? 'junior';
  select(lastLevel, levelOptions.value);
  handleContinue();
};

const handleReset = (): void => {
  // Future: reset filters when filter feature is addedFuture
};

const handleRetry = async (): Promise<void> => {
  await retryLoad();
};

const handleHelp = (): void => {
  showHelpModal.value = true;

  analytics.track(
    'select_help_clicked',
    {},
    {
      category: EventCategory.Engagement,
      action: EventAction.Click,
    }
  );
};

// Lifecycle
onMounted(async () => {
  await loadData();

  analytics.page({
    page_name: 'level_selection',
    user_authenticated: true,
  });

  // Restore last selection from localStorage
  const lastSelection = localStorage.getItem('user_pref_preferredDifficulty');
  if (lastSelection) {
    select(lastSelection, levelOptions.value);
  }
});
</script>

<style scoped>
.level-selection-page {
  @apply min-h-screen relative overflow-hidden;

  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.level-selection-page::before {
  content: '';

  @apply absolute inset-0 opacity-10;

  background-image: radial-gradient(at 20% 30%, rgb(255, 255, 255, 0.3) 0, transparent 50%),
    radial-gradient(at 80% 70%, rgb(255, 255, 255, 0.2) 0, transparent 50%),
    radial-gradient(at 40% 80%, rgb(255, 255, 255, 0.15) 0, transparent 50%);
}

.level-selection-page__content {
  @apply w-full relative z-10;
}

.level-selection-page__error {
  @apply w-full relative z-10 py-20;
}

.level-selection-page__main {
  @apply max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12;
  @apply backdrop-blur-sm;
}

/* Fade transition */
.fade-enter-active,
.fade-leave-active {
  @apply transition-opacity duration-300;
}

.fade-enter-from,
.fade-leave-to {
  @apply opacity-0;
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  .fade-enter-active,
  .fade-leave-active {
    transition: none !important;
  }
}
</style>
