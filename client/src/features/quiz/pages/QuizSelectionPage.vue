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

      <!-- Level Selection -->
      <div class="mb-12">
        <h2 class="mb-8 text-center text-2xl font-bold text-gray-900 dark:text-white">
          {{ t('quiz.selection.chooseLevel') }}
        </h2>
        <div class="grid grid-cols-1 gap-6 md:grid-cols-3">
          <!-- Junior -->
          <button
            type="button"
            :disabled="!canUserAccessLevel('junior')"
            :class="getLevelCardClass('junior')"
            @click="selectLevel('junior')"
          >
            <div class="relative z-10">
              <div class="mb-4 flex items-center gap-3">
                <span class="text-3xl">🟢</span>
                <h3 class="text-xl font-bold">{{ t('level.junior.label') }}</h3>
              </div>
              <p :class="getLevelDescriptionClass('junior')">
                {{ t('level.junior.description') }}
              </p>
              <div class="mt-2 text-sm">
                <p :class="getLevelDescriptionClass('junior')">
                  {{ t('level.junior.questionCount', { count: 30 }) }}
                </p>
              </div>
              <div class="mt-4">
                <span v-if="canUserAccessLevel('junior')" class="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900 dark:text-green-200">
                  {{ t('plans.access.available') }}
                </span>
                <LockedBadge v-else required-plan="free" />
              </div>
            </div>
            <div
              v-if="selectedLevel === 'junior' && canUserAccessLevel('junior')"
              class="absolute right-4 top-4"
            >
              <div class="flex h-8 w-8 items-center justify-center rounded-full bg-white/20">
                <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fill-rule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clip-rule="evenodd"
                  />
                </svg>
              </div>
            </div>
          </button>

          <!-- Intermediate -->
          <button
            type="button"
            :disabled="!canUserAccessLevel('intermediate')"
            :class="getLevelCardClass('intermediate')"
            @click="selectLevel('intermediate')"
          >
            <div class="relative z-10">
              <div class="mb-4 flex items-center gap-3">
                <span class="text-3xl">🟡</span>
                <h3 class="text-xl font-bold">{{ t('level.intermediate.label') }}</h3>
              </div>
              <p :class="getLevelDescriptionClass('intermediate')">
                {{ t('level.intermediate.description') }}
              </p>
              <div class="mt-2 text-sm">
                <p :class="getLevelDescriptionClass('intermediate')">
                  {{ t('level.intermediate.questionCount', { count: 40 }) }}
                </p>
              </div>
              <div class="mt-4">
                <span v-if="canUserAccessLevel('intermediate')" class="inline-flex items-center rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                  {{ t('plans.access.available') }}
                </span>
                <LockedBadge v-else required-plan="intermediate" />
              </div>
            </div>
            <div
              v-if="selectedLevel === 'intermediate' && canUserAccessLevel('intermediate')"
              class="absolute right-4 top-4"
            >
              <div class="flex h-8 w-8 items-center justify-center rounded-full bg-white/20">
                <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fill-rule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clip-rule="evenodd"
                  />
                </svg>
              </div>
            </div>
          </button>

          <!-- Senior -->
          <button
            type="button"
            :disabled="!canUserAccessLevel('senior')"
            :class="getLevelCardClass('senior')"
            @click="selectLevel('senior')"
          >
            <div class="relative z-10">
              <div class="mb-4 flex items-center gap-3">
                <span class="text-3xl">🔴</span>
                <h3 class="text-xl font-bold">{{ t('level.senior.label') }}</h3>
              </div>
              <p :class="getLevelDescriptionClass('senior')">
                {{ t('level.senior.description') }}
              </p>
              <div class="mt-2 text-sm">
                <p :class="getLevelDescriptionClass('senior')">
                  {{ t('level.senior.questionCount', { count: 50 }) }}
                </p>
              </div>
              <div class="mt-4">
                <span v-if="canUserAccessLevel('senior')" class="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800 dark:bg-red-900 dark:text-red-200">
                  {{ t('plans.access.available') }}
                </span>
                <LockedBadge v-else required-plan="advanced" />
              </div>
            </div>
            <div
              v-if="selectedLevel === 'senior' && canUserAccessLevel('senior')"
              class="absolute right-4 top-4"
            >
              <div class="flex h-8 w-8 items-center justify-center rounded-full bg-white/20">
                <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fill-rule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clip-rule="evenodd"
                  />
                </svg>
              </div>
            </div>
          </button>
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
import { isBundlePlan } from "@/utils/planMapping";
import { usePlanEntry } from "@/composables/usePlanEntry";
import type { ExperienceLevel } from "@/types/plan/access";

const { t } = useI18n();
const router = useRouter();
const planStore = usePlanStore();
const authStore = useAuthStore();
const { handlePlanEntryClick } = usePlanEntry();

const selectedLevel = ref<ExperienceLevel | null>(null);

const locale = computed(() => (router.currentRoute.value.params.locale as string) || "en");

// Get accessible levels for current plan (for Bundle visibility)
// Check if user has Bundle plan (Pro tier with Intermediate+Senior visibility)
const hasBundle = computed(() => isBundlePlan(planStore.planTier));

const canUserAccessLevel = (level: ExperienceLevel): boolean => {
  return canAccessLevel(planStore.planTier, level);
};

const selectLevel = (level: ExperienceLevel) => {
  if (canUserAccessLevel(level) || !authStore.isAuthenticated) {
    selectedLevel.value = level;
  }
};

const getLevelCardClass = (level: ExperienceLevel) => {
  const isSelected = selectedLevel.value === level;
  const canAccess = canUserAccessLevel(level);
  const isPrimaryForBundle = hasBundle.value && (level === "intermediate" || level === "senior");

  const baseClass = "group relative overflow-hidden rounded-2xl border-2 p-6 text-left transition-all duration-300";

  if (!canAccess && authStore.isAuthenticated) {
    return `${baseClass} cursor-not-allowed opacity-60 border-gray-300 bg-gray-100 dark:border-gray-600 dark:bg-gray-700`;
  }

  if (isSelected) {
    return `${baseClass} scale-105 border-blue-500 bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-2xl`;
  }

  // Highlight Bundle cards with special border
  if (isPrimaryForBundle) {
    return `${baseClass} cursor-pointer border-purple-300 bg-white hover:border-purple-500 hover:shadow-xl dark:border-purple-700 dark:bg-gray-800 dark:hover:border-purple-500`;
  }

  return `${baseClass} cursor-pointer border-gray-200 bg-white hover:border-blue-400 hover:shadow-xl dark:border-gray-700 dark:bg-gray-800 dark:hover:border-blue-600`;
};

const getLevelDescriptionClass = (level: ExperienceLevel) => {
  const isSelected = selectedLevel.value === level;
  const canAccess = canUserAccessLevel(level);

  if (isSelected && canAccess) {
    return "text-sm text-white/90";
  }

  return "text-sm text-gray-600 dark:text-gray-400";
};

const startQuiz = async () => {
  if (!selectedLevel.value) {
    return;
  }

  // Use plan entry handler for auth gating and intent preservation
  await handlePlanEntryClick("quiz", selectedLevel.value, locale.value);
};
</script>
