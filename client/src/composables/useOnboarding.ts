import { computed } from "vue";
import { useOnboardingStore } from "@/stores/onboarding";
import type { OnboardingGoal, ExperienceLevel, Framework } from "@shared/types/onboarding";

export function useOnboarding() {
  const onboardingStore = useOnboardingStore();

  // Goal options with metadata
  const goalOptions = computed(() => [
    {
      value: "get-job" as OnboardingGoal,
      label: "Get a Job",
      description: "Land your dream developer role",
      icon: "💼",
    },
    {
      value: "learn-framework" as OnboardingGoal,
      label: "Learn New Framework",
      description: "Master a new technology",
      icon: "📚",
    },
    {
      value: "interview-prep" as OnboardingGoal,
      label: "Interview Preparation",
      description: "Ace your technical interviews",
      icon: "🎯",
    },
    {
      value: "skill-improvement" as OnboardingGoal,
      label: "Improve Skills",
      description: "Level up your expertise",
      icon: "⚡",
    },
    {
      value: "certification" as OnboardingGoal,
      label: "Get Certified",
      description: "Earn professional certificates",
      icon: "🏆",
    },
  ]);

  // Experience level options
  const experienceLevelOptions = computed(() => [
    {
      value: "junior" as ExperienceLevel,
      label: "Junior",
      description: "0-2 years of experience",
      icon: "🌱",
    },
    {
      value: "mid" as ExperienceLevel,
      label: "Mid-Level",
      description: "2-5 years of experience",
      icon: "🚀",
    },
    {
      value: "senior" as ExperienceLevel,
      label: "Senior",
      description: "5+ years of experience",
      icon: "⭐",
    },
  ]);

  // Framework options
  const frameworkOptions = computed(() => [
    {
      value: "react" as Framework,
      label: "React",
      description: "Popular UI library",
      icon: "⚛️",
      color: "#61DAFB",
    },
    {
      value: "vue" as Framework,
      label: "Vue.js",
      description: "Progressive framework",
      icon: "💚",
      color: "#42B883",
    },
    {
      value: "angular" as Framework,
      label: "Angular",
      description: "Full-featured framework",
      icon: "🅰️",
      color: "#DD0031",
    },
    {
      value: "nextjs" as Framework,
      label: "Next.js",
      description: "React framework",
      icon: "▲",
      color: "#000000",
    },
    {
      value: "redux" as Framework,
      label: "Redux",
      description: "State management",
      icon: "🔄",
      color: "#764ABC",
    },
    {
      value: "typescript" as Framework,
      label: "TypeScript",
      description: "Typed JavaScript",
      icon: "🔷",
      color: "#3178C6",
    },
    {
      value: "javascript" as Framework,
      label: "JavaScript",
      description: "Core language",
      icon: "📜",
      color: "#F7DF1E",
    },
    {
      value: "node" as Framework,
      label: "Node.js",
      description: "Backend runtime",
      icon: "🟢",
      color: "#339933",
    },
    {
      value: "express" as Framework,
      label: "Express",
      description: "Web framework",
      icon: "🚂",
      color: "#000000",
    },
  ]);

  // Study time options
  const studyTimeOptions = computed(() => [
    { value: "morning", label: "Morning (6 AM - 12 PM)", icon: "🌅" },
    { value: "afternoon", label: "Afternoon (12 PM - 6 PM)", icon: "☀️" },
    { value: "evening", label: "Evening (6 PM - 10 PM)", icon: "🌆" },
    { value: "night", label: "Night (10 PM - 2 AM)", icon: "🌙" },
  ]);

  // Daily goal options (in minutes)
  const dailyGoalOptions = computed(() => [
    { value: 15, label: "15 min", description: "Quick daily practice" },
    { value: 30, label: "30 min", description: "Steady progress" },
    { value: 60, label: "1 hour", description: "Dedicated learning" },
    { value: 120, label: "2 hours", description: "Intensive study" },
  ]);

  // Helper functions
  function getGoalLabel(goal: OnboardingGoal): string {
    return goalOptions.value.find((opt) => opt.value === goal)?.label || goal;
  }

  function getExperienceLevelLabel(level: ExperienceLevel): string {
    return experienceLevelOptions.value.find((opt) => opt.value === level)?.label || level;
  }

  function getFrameworkLabel(framework: Framework): string {
    return frameworkOptions.value.find((opt) => opt.value === framework)?.label || framework;
  }

  // Get recommended path based on preferences
  function getRecommendedPath() {
    const { goal, experienceLevel, frameworks } = onboardingStore.preferences;

    if (!goal || !experienceLevel || !frameworks || frameworks.length === 0) {
      return null;
    }

    // Build recommendation based on preferences
    const primaryFramework = frameworks[0];
    if (!primaryFramework) {
      return null;
    }
    const frameworkLabel = getFrameworkLabel(primaryFramework);

    let pathTitle = "";
    let pathDescription = "";

    if (goal === "get-job") {
      pathTitle = `${frameworkLabel} Developer Roadmap`;
      pathDescription = `Complete path to becoming a professional ${frameworkLabel} developer`;
    } else if (goal === "interview-prep") {
      pathTitle = `${frameworkLabel} Interview Mastery`;
      pathDescription = `Ace your ${frameworkLabel} technical interviews`;
    } else if (goal === "learn-framework") {
      pathTitle = `${frameworkLabel} Fundamentals to Advanced`;
      pathDescription = `Master ${frameworkLabel} from basics to expert level`;
    } else if (goal === "skill-improvement") {
      pathTitle = `Advanced ${frameworkLabel} Techniques`;
      pathDescription = `Level up your ${frameworkLabel} skills`;
    } else {
      pathTitle = `${frameworkLabel} Certification Prep`;
      pathDescription = `Prepare for ${frameworkLabel} certification`;
    }

    return {
      title: pathTitle,
      description: pathDescription,
      framework: primaryFramework,
      level: experienceLevel,
      estimatedWeeks: experienceLevel === "junior" ? 12 : experienceLevel === "intermediate" ? 8 : 6,
      questionsCount: 150,
    };
  }

  return {
    // Store state and actions
    ...onboardingStore,

    // Options
    goalOptions,
    experienceLevelOptions,
    frameworkOptions,
    studyTimeOptions,
    dailyGoalOptions,

    // Helpers
    getGoalLabel,
    getExperienceLevelLabel,
    getFrameworkLabel,
    getRecommendedPath,
  };
}
