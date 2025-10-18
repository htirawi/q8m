<template>
  <div
    class="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4 dark:from-gray-900 dark:via-indigo-950 dark:to-purple-950"
  >
    <div class="w-full max-w-4xl">
      <!-- Progress Bar -->
      <div class="mb-8">
        <div class="mb-2 flex items-center justify-between">
          <span class="text-sm font-medium text-gray-700 dark:text-gray-300">
            Step {{ currentStep }}

            of 4
          </span>
          <span class="text-sm font-medium text-gray-700 dark:text-gray-300">
            {{ Math.round(progress) }}% Complete
          </span>
        </div>
        <div class="h-2.5 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
          <div
            class="h-2.5 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-500 ease-out"
            :style="{ width: `${progress}%` }"
          />
        </div>
      </div>

      <!-- Main Card -->
      <div class="overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-gray-800">
        <!-- Header -->
        <div class="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6">
          <h1 class="mb-2 text-3xl font-bold text-white">
            {{ stepTitle }}
          </h1>
          <p class="text-blue-100">
            {{ stepDescription }}
          </p>
        </div>

        <!-- Content -->
        <div class="p-8">
          <!-- Step 1: Goal Selection -->
          <div v-if="currentStep === 1" class="space-y-4">
            <div
              v-for="goal in goalOptions"
              :key="goal.value"
              @click="selectGoal(goal.value)"
              class="group cursor-pointer rounded-xl border-2 p-6 transition-all duration-200 hover:scale-[1.02] hover:shadow-lg"
              :class="[
                preferences.goal === goal.value
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 hover:border-blue-300 dark:border-gray-700 dark:hover:border-blue-700',
              ]"
            >
              <div class="flex items-start gap-4">
                <div class="text-4xl">{{ goal.icon }}</div>
                <div class="flex-1">
                  <h3 class="mb-1 text-xl font-semibold text-gray-900 dark:text-white">
                    {{ goal.label }}
                  </h3>
                  <p class="text-gray-600 dark:text-gray-400">
                    {{ goal.description }}
                  </p>
                </div>
                <div v-if="preferences.goal === goal.value" class="text-blue-500">
                  <svg class="h-6 w-6" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fill-rule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clip-rule="evenodd"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <!-- Step 2: Experience Level -->
          <div v-if="currentStep === 2" class="space-y-4">
            <div
              v-for="level in experienceLevelOptions"
              :key="level.value"
              @click="selectExperienceLevel(level.value)"
              class="group cursor-pointer rounded-xl border-2 p-6 transition-all duration-200 hover:scale-[1.02] hover:shadow-lg"
              :class="[
                preferences.experienceLevel === level.value
                  ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                  : 'border-gray-200 hover:border-indigo-300 dark:border-gray-700 dark:hover:border-indigo-700',
              ]"
            >
              <div class="flex items-start gap-4">
                <div class="text-4xl">{{ level.icon }}</div>
                <div class="flex-1">
                  <h3 class="mb-1 text-xl font-semibold text-gray-900 dark:text-white">
                    {{ level.label }}
                  </h3>
                  <p class="text-gray-600 dark:text-gray-400">
                    {{ level.description }}
                  </p>
                </div>
                <div v-if="preferences.experienceLevel === level.value" class="text-indigo-500">
                  <svg class="h-6 w-6" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fill-rule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clip-rule="evenodd"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <!-- Step 3: Framework Selection -->
          <div v-if="currentStep === 3" class="space-y-4">
            <p class="mb-4 text-sm text-gray-600 dark:text-gray-400">
              Select all frameworks you want to learn (at least one)
            </p>
            <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div
                v-for="framework in frameworkOptions"
                :key="framework.value"
                @click="toggleFramework(framework.value)"
                class="group cursor-pointer rounded-xl border-2 p-4 transition-all duration-200 hover:scale-[1.02] hover:shadow-lg"
                :class="[
                  isFrameworkSelected(framework.value)
                    ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                    : 'border-gray-200 hover:border-purple-300 dark:border-gray-700 dark:hover:border-purple-700',
                ]"
              >
                <div class="flex items-center gap-3">
                  <div class="text-2xl">{{ framework.icon }}</div>
                  <div class="flex-1">
                    <h4 class="font-semibold text-gray-900 dark:text-white">
                      {{ framework.label }}
                    </h4>
                    <p class="text-xs text-gray-600 dark:text-gray-400">
                      {{ framework.description }}
                    </p>
                  </div>
                  <div v-if="isFrameworkSelected(framework.value)" class="text-purple-500">
                    <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fill-rule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clip-rule="evenodd"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Step 4: Study Preferences -->
          <div v-if="currentStep === 4" class="space-y-6">
            <p class="mb-4 text-sm text-gray-600 dark:text-gray-400">
              Help us personalize your learning experience (optional)
            </p>

            <!-- Daily Goal -->
            <div>
              <label class="mb-3 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Daily Study Goal
              </label>
              <div class="grid grid-cols-2 gap-3 md:grid-cols-4">
                <button
                  v-for="goal in dailyGoalOptions"
                  :key="goal.value"
                  type="button"
                  @click="studyPrefs.dailyGoal = goal.value"
                  class="rounded-lg border-2 p-4 transition-all duration-200 hover:scale-[1.02]"
                  :class="[
                    studyPrefs.dailyGoal === goal.value
                      ? 'border-green-500 bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                      : 'border-gray-200 text-gray-700 hover:border-green-300 dark:border-gray-700 dark:text-gray-300 dark:hover:border-green-700',
                  ]"
                >
                  <div class="text-xl font-bold">{{ goal.label }}</div>
                  <div class="mt-1 text-xs">{{ goal.description }}</div>
                </button>
              </div>
            </div>

            <!-- Available Days -->
            <div>
              <label class="mb-3 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Available Days per Week
              </label>
              <div class="flex items-center gap-4">
                <input
                  v-model.number="studyPrefs.availableDaysPerWeek"
                  type="range"
                  min="1"
                  max="7"
                  class="h-2 flex-1 cursor-pointer appearance-none rounded-lg bg-gray-200 dark:bg-gray-700"
                />
                <span
                  class="min-w-[3rem] text-center text-2xl font-bold text-indigo-600 dark:text-indigo-400"
                >
                  {{ studyPrefs.availableDaysPerWeek }}
                </span>
              </div>
            </div>

            <!-- Preferred Study Time -->
            <div>
              <label class="mb-3 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Preferred Study Time
              </label>
              <div class="grid grid-cols-2 gap-3 md:grid-cols-4">
                <button
                  v-for="time in studyTimeOptions"
                  :key="time.value"
                  type="button"
                  @click="
                    studyPrefs.preferredStudyTime = time.value as
                      | 'morning'
                      | 'afternoon'
                      | 'evening'
                      | 'night'
                  "
                  class="rounded-lg border-2 p-4 transition-all duration-200 hover:scale-[1.02]"
                  :class="[
                    studyPrefs.preferredStudyTime === time.value
                      ? 'border-orange-500 bg-orange-50 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400'
                      : 'border-gray-200 text-gray-700 hover:border-orange-300 dark:border-gray-700 dark:text-gray-300 dark:hover:border-orange-700',
                  ]"
                >
                  <div class="mb-1 text-2xl">{{ time.icon }}</div>
                  <div class="text-sm font-medium">{{ time.label }}</div>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer Actions -->
        <div
          class="border-t border-gray-200 bg-gray-50 px-8 py-6 dark:border-gray-700 dark:bg-gray-900/50"
        >
          <div class="flex items-center justify-between">
            <button
              v-if="canGoPrevious"
              @click="previousStep"
              class="rounded-lg px-6 py-3 font-medium text-gray-700 transition-colors duration-200 hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              ← Previous
            </button>
            <button
              v-else
              @click="skipOnboarding"
              class="rounded-lg px-6 py-3 font-medium text-gray-500 transition-colors duration-200 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
            >
              Skip for now
            </button>

            <button
              v-if="currentStep < 4"
              @click="nextStep"
              :disabled="!canGoNext"
              class="rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-3 font-semibold text-white shadow-lg transition-all duration-200 hover:scale-[1.02] hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
            >
              Continue →
            </button>
            <button
              v-else
              @click="complete"
              :disabled="isLoading"
              class="rounded-lg bg-gradient-to-r from-green-600 to-emerald-600 px-8 py-3 font-semibold text-white shadow-lg transition-all duration-200 hover:scale-[1.02] hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
            >
              <span v-if="!isLoading">Complete Setup ✨</span>
              <span v-else>Saving...</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Help Text -->
      <div class="mt-6 text-center">
        <p class="text-sm text-gray-600 dark:text-gray-400">
          You can always update these preferences later in your account settings
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import { useOnboarding } from "@/composables/useOnboarding";
import { useConfetti } from "@/composables/useConfetti";
import type { OnboardingGoal, ExperienceLevel, Framework } from "@shared/types/onboarding";

const router = useRouter();
const { celebrate } = useConfetti();

const {
  currentStep,
  preferences,
  progress,
  canGoNext,
  canGoPrevious,
  isLoading,
  goalOptions,
  experienceLevelOptions,
  frameworkOptions,
  studyTimeOptions,
  dailyGoalOptions,
  nextStep,
  previousStep,
  setGoal,
  setExperienceLevel,
  toggleFramework: toggleFrameworkInStore,
  setStudyPreferences,
  completeOnboarding,
  skipOnboarding: skipOnboardingInStore,
} = useOnboarding();

// Local state for step 4
const studyPrefs = ref<{
  dailyGoal: number;
  availableDaysPerWeek: number;
  preferredStudyTime: "morning" | "afternoon" | "evening" | "night";
}>({
  dailyGoal: 30,
  availableDaysPerWeek: 5,
  preferredStudyTime: "evening",
});

// Computed properties
const stepTitle = computed(() => {
  switch (currentStep.value) {
    case 1:
      return "What's your goal?";
    case 2:
      return "What's your experience level?";
    case 3:
      return "Which frameworks interest you?";
    case 4:
      return "Customize your learning";
    default:
      return "";
  }
});

const stepDescription = computed(() => {
  switch (currentStep.value) {
    case 1:
      return "Help us understand what you want to achieve";
    case 2:
      return "Tell us about your development experience";
    case 3:
      return "Select the technologies you want to master";
    case 4:
      return "Set your study schedule and preferences";
    default:
      return "";
  }
});

// Methods
function selectGoal(goal: OnboardingGoal) {
  setGoal(goal);
}

function selectExperienceLevel(level: experiencelevel) {
  setExperienceLevel(level);
}

function toggleFramework(framework: framework) {
  toggleFrameworkInStore(framework);
}

function isFrameworkSelected(framework: Framework): boolean {
  return preferences.value.frameworks?.includes(framework) || false;
}

async function complete() {
  // Set study preferences before completing
  setStudyPreferences(studyPrefs.value);

  const success = await completeOnboarding();
  if (success) {
    // Celebrate with confetti!
    celebrate();

    // Wait a moment for the celebration, then redirect
    setTimeout(() => {
      router.push("/");
    }, 1500);
  }
}

async function skipOnboarding() {
  skipOnboardingInStore();
  router.push("/");
}
</script>

<style scoped>
/* Custom slider styles */
input[type="range"]::-webkit-slider-thumb {
  appearance: none;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  cursor: pointer;
  box-shadow: 0 2px 4px rgb(0, 0, 0, 0.2);
}

input[type="range"]::-moz-range-thumb {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  cursor: pointer;
  box-shadow: 0 2px 4px rgb(0, 0, 0, 0.2);
  border: none;
}

/* Smooth animations */
.transition-all {
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 200ms;
}
</style>
