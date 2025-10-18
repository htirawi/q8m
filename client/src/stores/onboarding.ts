import { defineStore } from "pinia";
import { ref, computed } from "vue";
import type {
  OnboardingPreferences,
  OnboardingState,
  OnboardingGoal,
  ExperienceLevel,
  Framework,
} from "@shared/types/onboarding";
import { httpClient } from "@/utils/httpClient";
import { useAuthStore } from "./auth";

const TOTAL_STEPS = 4;

export const useOnboardingStore = defineStore("onboarding", () => {
  const authStore = useAuthStore();

  // State
  const currentStep = ref(1);
  const preferences = ref<Partial<OnboardingPreferences>>({
    frameworks: [],
  });
  const isCompleted = ref(false);
  const isLoading = ref(false);
  const startedAt = ref<Date | undefined>(undefined);

  // Computed
  const progress = computed(() => ((currentStep.value - 1) / TOTAL_STEPS) * 100);

  const canGoNext = computed(() => {
    switch (currentStep.value) {
      case 1: // Goal selection
        return !!preferences.value.goal;
      case 2: // Experience level
        return !!preferences.value.experienceLevel;
      case 3: // Framework selection
        return preferences.value.frameworks && preferences.value.frameworks.length > 0;
      case 4: // Study preferences (optional)
        return true; // Always allow skipping this step
      default:
        return false;
    }
  });

  const canGoPrevious = computed(() => currentStep.value > 1);

  const state = computed<OnboardingState>(() => ({
    currentStep: currentStep.value,
    totalSteps: TOTAL_STEPS,
    preferences: preferences.value,
    isCompleted: isCompleted.value,
    startedAt: startedAt.value,
  }));

  // Actions
  function startOnboarding() {
    currentStep.value = 1;
    preferences.value = { frameworks: [] };
    isCompleted.value = false;
    startedAt.value = new Date();
  }

  function nextStep() {
    if (canGoNext.value && currentStep.value < TOTAL_STEPS) {
      currentStep.value++;
    }
  }

  function previousStep() {
    if (canGoPrevious.value) {
      currentStep.value--;
    }
  }

  function goToStep(step: number) {
    if (step >= 1 && step <= TOTAL_STEPS) {
      currentStep.value = step;
    }
  }

  function setGoal(goal: OnboardingGoal) {
    preferences.value.goal = goal;
  }

  function setExperienceLevel(level: ExperienceLevel) {
    preferences.value.experienceLevel = level;
  }

  function toggleFramework(framework: Framework) {
    if (!preferences.value.frameworks) {
      preferences.value.frameworks = [];
    }

    const index = preferences.value.frameworks.indexOf(framework);
    if (index > -1) {
      preferences.value.frameworks.splice(index, 1);
    } else {
      preferences.value.frameworks.push(framework);
    }
  }

  function setStudyPreferences(prefs: {
    dailyGoal?: number;
    availableDaysPerWeek?: number;
    preferredStudyTime?: "morning" | "afternoon" | "evening" | "night";
  }) {
    preferences.value = {
      ...preferences.value,
      ...prefs,
    };
  }

  async function completeOnboarding(): Promise<boolean> {
    if (!canGoNext.value) {
      return false;
    }

    isLoading.value = true;
    try {
      const completePreferences: OnboardingPreferences = {
        goal: preferences.value.goal!,
        experienceLevel: preferences.value.experienceLevel!,
        frameworks: preferences.value.frameworks || [],
        dailyGoal: preferences.value.dailyGoal,
        availableDaysPerWeek: preferences.value.availableDaysPerWeek,
        preferredStudyTime: preferences.value.preferredStudyTime,
        completedAt: new Date(),
      };

      await httpClient.post(
        "/api/v1/users/onboarding",
        { preferences: completePreferences },
        { requireAuth: true, useBearer: true }
      );

      isCompleted.value = true;

      // Update user in auth store to reflect onboarding completion
      if (authStore.user) {
        authStore.setUser({
          ...authStore.user,
          onboarding: {
            isCompleted: true,
            preferences: completePreferences,
          },
        });
      }

      return true;
    } catch (error) {
      console.error("Failed to complete onboarding:", error);
      return false;
    } finally {
      isLoading.value = false;
    }
  }

  function skipOnboarding() {
    isCompleted.value = true;
  }

  function reset() {
    currentStep.value = 1;
    preferences.value = { frameworks: [] };
    isCompleted.value = false;
    startedAt.value = undefined;
  }

  return {
    // State
    currentStep,
    preferences,
    isCompleted,
    isLoading,
    startedAt,
    state,

    // Computed
    progress,
    canGoNext,
    canGoPrevious,

    // Actions
    startOnboarding,
    nextStep,
    previousStep,
    goToStep,
    setGoal,
    setExperienceLevel,
    toggleFramework,
    setStudyPreferences,
    completeOnboarding,
    skipOnboarding,
    reset,
  };
});
