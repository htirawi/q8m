<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
    <div class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <!-- Header -->
      <div class="mb-12 text-center">
        <h1 class="mb-4 text-4xl font-bold text-gray-900 dark:text-white md:text-5xl">
          {{ t('quiz.selection.title') }}
        </h1>
        <p class="text-lg text-gray-600 dark:text-gray-400 md:text-xl">
          {{ t('quiz.selection.subtitle') }}
        </p>
      </div>

      <!-- Search & Filter Bar -->
      <div class="mb-8 flex flex-col gap-4 sm:flex-row">
        <!-- Search -->
        <div class="relative flex-1">
          <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            v-model="searchQuery"
            type="text"
            class="block w-full rounded-lg border border-gray-300 bg-white py-3 pl-10 pr-3 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400"
            :placeholder="t('quiz.selection.searchPlaceholder')"
          />
        </div>

        <!-- Difficulty Filter -->
        <select
          v-model="difficultyFilter"
          class="rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
        >
          <option value="all">{{ t('quiz.selection.allDifficulties') }}</option>
          <option value="junior">{{ t('level.junior.label') }}</option>
          <option value="intermediate">{{ t('level.intermediate.label') }}</option>
          <option value="senior">{{ t('level.senior.label') }}</option>
        </select>

        <!-- Sort Options -->
        <select
          v-model="sortBy"
          class="rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
        >
          <option value="default">{{ t('quiz.selection.sortDefault') }}</option>
          <option value="duration">{{ t('quiz.selection.sortDuration') }}</option>
          <option value="questions">{{ t('quiz.selection.sortQuestions') }}</option>
        </select>
      </div>

      <!-- Level Selection - Professional Cards -->
      <div class="mb-12">
        <h2 class="mb-8 text-center text-2xl font-bold text-gray-900 dark:text-white">
          {{ t('quiz.selection.chooseLevel') }}
        </h2>

        <!-- No Results Message -->
        <div v-if="filteredQuizzes.length === 0" class="py-16 text-center">
          <svg class="mx-auto h-16 w-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p class="mt-4 text-lg text-gray-600 dark:text-gray-400">
            {{ t('quiz.selection.noResults') }}
          </p>
        </div>

        <!-- Quiz Cards Grid -->
        <div v-else class="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div
            v-for="quiz in filteredQuizzes"
            :key="quiz.level"
            :class="[
              'group relative overflow-hidden rounded-2xl border-2 bg-white transition-all duration-300 dark:bg-gray-800',
              selectedLevel === quiz.level && canUserAccessLevel(quiz.level)
                ? `border-${getLevelColor(quiz.level)}-500 shadow-2xl ring-4 ring-${getLevelColor(quiz.level)}-200 dark:ring-${getLevelColor(quiz.level)}-900`
                : 'border-gray-200 hover:border-' + getLevelColor(quiz.level) + '-400 hover:shadow-xl dark:border-gray-700',
              !canUserAccessLevel(quiz.level) && authStore.isAuthenticated
                ? 'opacity-60 cursor-not-allowed'
                : 'cursor-pointer'
            ]"
            @click="selectLevel(quiz.level)"
          >
            <!-- Header with Badges -->
            <div :class="[
              'border-b border-gray-100 p-4 dark:border-gray-700',
              'bg-gradient-to-r',
              quiz.level === 'junior' ? 'from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20' :
              quiz.level === 'intermediate' ? 'from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20' :
              'from-red-50 to-purple-50 dark:from-red-900/20 dark:to-purple-900/20'
            ]">
              <div class="mb-2 flex items-center justify-between">
                <span :class="[
                  'inline-flex items-center rounded px-2 py-0.5 text-xs font-bold uppercase tracking-wide',
                  quiz.level === 'junior' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                  quiz.level === 'intermediate' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                  'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                ]">
                  {{ t(`level.${quiz.level}.label`) }}
                </span>
                <span v-if="canUserAccessLevel(quiz.level)" :class="[
                  quiz.level === 'junior' ? 'text-green-600 dark:text-green-400' :
                  quiz.level === 'intermediate' ? 'text-yellow-600 dark:text-yellow-400' :
                  'text-red-600 dark:text-red-400'
                ]">
                  <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                  </svg>
                </span>
                <LockedBadge
                  v-else-if="authStore.isAuthenticated"
                  :required-plan="quiz.level === 'junior' ? 'free' : quiz.level === 'intermediate' ? 'intermediate' : 'advanced'"
                />
              </div>
              <h3 class="text-lg font-bold text-gray-900 dark:text-white">
                {{ t(`quiz.metadata.${quiz.level}.title`) }}
              </h3>
            </div>

            <!-- Body -->
            <div class="p-6">
              <p class="mb-4 text-sm text-gray-600 dark:text-gray-400">
                {{ t(`quiz.metadata.${quiz.level}.description`) }}
              </p>

              <!-- Tested Skills -->
              <div class="mb-4">
                <h4 class="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  {{ t('quiz.metadata.testedSkills') }}
                </h4>
                <div class="flex flex-wrap gap-2">
                  <span
                    v-for="skill in quiz.skills"
                    :key="skill"
                    class="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                  >
                    {{ skill }}
                  </span>
                </div>
              </div>

              <!-- Metadata -->
              <div class="mb-4 flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
                <div class="flex items-center gap-1">
                  <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{{ t('quiz.metadata.duration', { minutes: quiz.duration }) }}</span>
                </div>
                <div class="flex items-center gap-1">
                  <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <span>{{ t('quiz.metadata.questions', { count: quiz.questions }) }}</span>
                </div>
              </div>

              <!-- CTA Button -->
              <button
                v-if="canUserAccessLevel(quiz.level)"
                type="button"
                :class="[
                  'w-full rounded-lg px-4 py-3 text-sm font-semibold text-white transition-all hover:shadow-lg',
                  'bg-gradient-to-r',
                  quiz.level === 'junior' ? 'from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700' :
                  quiz.level === 'intermediate' ? 'from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700' :
                  'from-red-600 to-purple-600 hover:from-red-700 hover:to-purple-700'
                ]"
                @click.stop="selectLevel(quiz.level)"
              >
                {{ t('quiz.metadata.startQuiz') }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Start Button -->
      <div class="text-center">
        <button
          type="button"
          :disabled="!selectedLevel || !canUserAccessLevel(selectedLevel)"
          class="group relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 px-12 py-4 text-lg font-bold text-white shadow-2xl transition-all duration-300 hover:scale-105 hover:shadow-3xl disabled:cursor-not-allowed disabled:opacity-50"
          @click="startQuiz"
        >
          <span class="relative z-10 flex items-center gap-3">
            <span>{{ t('quiz.selection.startQuiz') }}</span>
            <svg
              class="h-5 w-5 transition-transform group-hover:translate-x-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M13 7l5 5m0 0l-5 5m5-5H6"
              />
            </svg>
          </span>
          <div class="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 opacity-0 transition-opacity group-hover:opacity-100" />
        </button>
      </div>

      <!-- Features -->
      <div class="mt-16 grid grid-cols-1 gap-6 md:grid-cols-4">
        <div class="rounded-xl border border-gray-200 bg-white/50 p-6 backdrop-blur dark:border-gray-700 dark:bg-gray-800/50">
          <div class="mb-3 text-3xl">🔘</div>
          <h3 class="mb-2 font-semibold text-gray-900 dark:text-white">
            {{ t('quiz.features.multipleChoice.title') }}
          </h3>
          <p class="text-sm text-gray-600 dark:text-gray-400">
            {{ t('quiz.features.multipleChoice.description') }}
          </p>
        </div>

        <div class="rounded-xl border border-gray-200 bg-white/50 p-6 backdrop-blur dark:border-gray-700 dark:bg-gray-800/50">
          <div class="mb-3 text-3xl">✏️</div>
          <h3 class="mb-2 font-semibold text-gray-900 dark:text-white">
            {{ t('quiz.features.fillBlank.title') }}
          </h3>
          <p class="text-sm text-gray-600 dark:text-gray-400">
            {{ t('quiz.features.fillBlank.description') }}
          </p>
        </div>

        <div class="rounded-xl border border-gray-200 bg-white/50 p-6 backdrop-blur dark:border-gray-700 dark:bg-gray-800/50">
          <div class="mb-3 text-3xl">☑️</div>
          <h3 class="mb-2 font-semibold text-gray-900 dark:text-white">
            {{ t('quiz.features.multipleCheckbox.title') }}
          </h3>
          <p class="text-sm text-gray-600 dark:text-gray-400">
            {{ t('quiz.features.multipleCheckbox.description') }}
          </p>
        </div>

        <div class="rounded-xl border border-gray-200 bg-white/50 p-6 backdrop-blur dark:border-gray-700 dark:bg-gray-800/50">
          <div class="mb-3 text-3xl">✅</div>
          <h3 class="mb-2 font-semibold text-gray-900 dark:text-white">
            {{ t('quiz.features.trueFalse.title') }}
          </h3>
          <p class="text-sm text-gray-600 dark:text-gray-400">
            {{ t('quiz.features.trueFalse.description') }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";
import { usePlanStore } from "@/stores/plan";
import { useAuthStore } from "@/stores/auth";
import LockedBadge from "@/components/paywall/LockedBadge.vue";
import { canAccessLevel } from "@/types/plan/access";
import { usePlanEntry } from "@/composables/usePlanEntry";
import type { ExperienceLevel } from "@/types/plan/access";

const { t } = useI18n();
const router = useRouter();
const planStore = usePlanStore();
const authStore = useAuthStore();
const { handlePlanEntryClick } = usePlanEntry();

const selectedLevel = ref<ExperienceLevel | null>(null);

// Search & Filter state
const searchQuery = ref('');
const difficultyFilter = ref<'all' | ExperienceLevel>('all');
const sortBy = ref<'default' | 'duration' | 'questions'>('default');

const locale = computed(() => (router.currentRoute.value.params.locale as string) || "en");

// Quiz data structure
const quizzes = computed(() => [
  {
    level: 'junior' as ExperienceLevel,
    duration: 30,
    questions: 30,
    skills: ['Vue Basics', 'Components', 'Templates'],
  },
  {
    level: 'intermediate' as ExperienceLevel,
    duration: 45,
    questions: 40,
    skills: ['State Management', 'Composition API', 'Routing'],
  },
  {
    level: 'senior' as ExperienceLevel,
    duration: 60,
    questions: 50,
    skills: ['Architecture', 'Performance', 'System Design'],
  },
]);

// Filtered and sorted quizzes
const filteredQuizzes = computed(() => {
  let filtered = quizzes.value;

  // Apply difficulty filter
  if (difficultyFilter.value !== 'all') {
    filtered = filtered.filter(q => q.level === difficultyFilter.value);
  }

  // Apply search filter
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase();
    filtered = filtered.filter(q => {
      const levelLabel = t(`level.${q.level}.label`).toLowerCase();
      const skillsText = q.skills.join(' ').toLowerCase();
      return levelLabel.includes(query) || skillsText.includes(query);
    });
  }

  // Apply sorting
  if (sortBy.value === 'duration') {
    filtered = [...filtered].sort((a, b) => a.duration - b.duration);
  } else if (sortBy.value === 'questions') {
    filtered = [...filtered].sort((a, b) => a.questions - b.questions);
  }

  return filtered;
});

const canUserAccessLevel = (level: ExperienceLevel): boolean => {
  return canAccessLevel(planStore.planTier, level);
};

const selectLevel = (level: ExperienceLevel) => {
  if (canUserAccessLevel(level) || !authStore.isAuthenticated) {
    selectedLevel.value = level;
  }
};

const getLevelColor = (level: ExperienceLevel): string => {
  const colors: Record<ExperienceLevel, string> = {
    junior: 'green',
    intermediate: 'yellow',
    senior: 'red',
  };
  return colors[level];
};

const startQuiz = async () => {
  if (!selectedLevel.value) {
    return;
  }

  // Use plan entry handler for auth gating and intent preservation
  await handlePlanEntryClick("quiz", selectedLevel.value, locale.value);
};
</script>
