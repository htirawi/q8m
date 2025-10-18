<template>
  <button
    type="button"
    class="group relative flex h-full min-h-[320px] flex-col overflow-hidden rounded-2xl border-2 bg-white p-6 text-center shadow-lg transition-all duration-500 focus:outline-none focus-visible:ring-4 focus-visible:ring-offset-2 dark:bg-gray-800 sm:min-h-[340px]"
    :class="[
      getBorderClass(props.color),
      getFocusRingClass(props.color),
      props.isLocked
        ? 'cursor-not-allowed opacity-75'
        : 'cursor-pointer hover:-translate-y-3 hover:scale-105 hover:shadow-2xl active:scale-100',
    ]"
    :aria-label="
      props.isLocked
        ? `${props.title} - Locked. Upgrade to ${props.requiredPlan} plan to access`
        : `Study ${props.title} ${getDifficultyLabel()} questions. Press Enter to select`
    "
    :tabindex="props.isLocked ? -1 : 0"
    :disabled="props.isLocked"
    @click="!props.isLocked && $emit('select', props.framework)"
    @keydown.enter="!props.isLocked && $emit('select', props.framework)"
    @keydown.space.prevent="!props.isLocked && $emit('select', props.framework)"
  >
    <!-- Animated Background Gradient -->
    <div
      class="absolute inset-0 -z-10 opacity-0 transition-opacity duration-500 group-hover:opacity-10"
      :class="getGradientClass(props.color)"
    ></div>

    <!-- Decorative Corner Accent -->
    <div
      class="absolute right-0 top-0 h-24 w-24 opacity-5 transition-opacity duration-500 group-hover:opacity-10"
    >
      <div class="h-full w-full rounded-bl-full" :class="getGradientClass(props.color)"></div>
    </div>

    <!-- Top Section: Icon & IBadge -->
    <div class="relative mb-4">
      <!-- Pulsing Background Effect (hidden for Angular and Vue) -->
      <div
        v-if="props.color !== 'red' && props.color !== 'green'"
        class="absolute left-1/2 top-1/2 h-20 w-20 -translate-x-1/2 -translate-y-1/2 animate-pulse rounded-full opacity-20 blur-xl transition-all duration-500 group-hover:h-24 group-hover:w-24"
        :class="getGradientClass(props.color)"
      ></div>

      <!-- Icon Container -->
      <div class="relative flex justify-center">
        <div
          class="flex h-20 w-20 items-center justify-center rounded-2xl transition-all duration-500 group-hover:rotate-6 group-hover:scale-110"
          :class="[
            getIconBgClass(props.color),
            props.color === 'red' || props.color === 'green'
              ? ''
              : 'shadow-xl group-hover:shadow-2xl',
          ]"
        >
          <img
            v-if="frameworkIconPath"
            :src="frameworkIconPath"
            :alt="`${props.title} logo`"
            class="h-12 w-12 object-contain"
            loading="eager"
          />
          <span v-else class="text-4xl" role="img" :aria-label="`${props.title} icon`"
            >{{ props.icon }}
          </span>
        </div>
      </div>
    </div>

    <!-- Framework Name -->
    <h3
      class="mb-3 text-xl font-bold transition-colors duration-300"
      :class="getTitleClass(props.color)"
    >
      {{ props.title ?? "" }}
    </h3>

    <!-- Question Count -->
    <div class="mb-4 flex-1">
      <div
        class="mb-1 text-3xl font-extrabold text-gray-900 transition-all duration-300 group-hover:scale-110 dark:text-white"
      >
        {{ props.questionCount }}
      </div>
      <div class="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
        {{ getDifficultyLabel() }}

        Questions
      </div>
    </div>

    <!-- Progress Bar (if user has started) -->
    <div v-if="(props.progressPercent ?? 0) > 0" class="mb-4">
      <div class="mb-1 flex items-center justify-between text-xs font-medium">
        <span class="text-gray-600 dark:text-gray-400">Progress</span>
        <span :class="getProgressTextClass(props.color)">{{ props.progressPercent }}%</span>
      </div>
      <div class="h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
        <div
          class="h-full transition-all duration-500"
          :class="getProgressBarClass(props.color)"
          :style="{ width: `${props.progressPercent}%` }"
        ></div>
      </div>
    </div>

    <!-- Lock Overlay (if locked) -->
    <div
      v-if="props.isLocked"
      class="absolute inset-0 z-10 flex flex-col items-center justify-center bg-gray-900/80 backdrop-blur-sm"
    >
      <div class="mb-4 rounded-full bg-gray-800 p-4">
        <svg
          class="h-10 w-10 text-yellow-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
          />
        </svg>
      </div>
      <div class="mb-2 text-sm font-bold text-white">Upgrade Required</div>
      <div class="mb-4 px-4 text-xs text-gray-300">
        {{ props.requiredPlan }}

        Plan or higher
      </div>
      <div
        class="rounded-lg bg-gradient-to-r from-yellow-500 to-orange-600 px-4 py-2 text-xs font-semibold text-white"
      >
        Upgrade Now
      </div>
    </div>

    <!-- Start Button with Arrow -->
    <div v-else class="relative mt-auto">
      <div
        class="flex items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-bold text-white shadow-lg transition-all duration-300 group-hover:scale-105 group-hover:shadow-xl"
        :class="getButtonClass(props.color)"
      >
        <span>Start Learning</span>
        <svg
          class="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2.5"
            d="M13 7l5 5m0 0l-5 5m5-5H6"
          />
        </svg>
      </div>
    </div>

    <!-- Shine Effect on Hover -->
    <div
      class="absolute inset-0 -z-10 translate-x-[-100%] bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-1000 group-hover:translate-x-[100%]"
    ></div>

    <!-- Keyboard Shortcut Hint (shown on focus) -->
    <div
      class="absolute -top-2 left-1/2 -translate-x-1/2 opacity-0 transition-opacity duration-300 group-focus-visible:opacity-100"
      role="tooltip"
    >
      <div
        class="rounded-lg bg-gray-900 px-2 py-1 text-xs font-medium text-white shadow-lg dark:bg-white dark:text-gray-900"
      >
        Press Enter or Space
      </div>
    </div>
  </button>
</template>

<script setup lang="ts">
import type { IFrameworkCardProps as Props } from "../../types/components/study";
import { computed } from "vue";
import { getFrameworkIcon } from "../../utils/frameworkIcons";

const props = withDefaults(defineProps<Props>(), {
  progressPercent: 0,
  isLocked: false,
  requiredPlan: "",
});

defineEmits<{
  select: [framework: string];
}>();

// Get professional icon path for the framework
const frameworkIconPath = computed(() => getFrameworkIcon(props.framework));

const getDifficultyLabel = () => {
  const labels: Record<string, string> = {
    easy: "Junior-Level",
    medium: "Intermediate",
    hard: "Senior-Level",
  };
  return labels[props.difficulty] || "Junior-Level";
};

const getGradientClass = (color: string) => {
  const classes: Record<string, string> = {
    red: "bg-gradient-to-br from-red-500 to-pink-600",
    black: "bg-gradient-to-br from-gray-700 to-gray-900",
    blue: "bg-gradient-to-br from-blue-500 to-cyan-600",
    purple: "bg-gradient-to-br from-purple-500 to-pink-600",
    gray: "bg-gradient-to-br from-gray-400 to-gray-600",
    green: "bg-gradient-to-br from-green-500 to-emerald-600",
    gradient: "bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-600",
  };
  return classes[color] || "bg-gradient-to-br from-blue-500 to-cyan-600";
};

const getIconBgClass = (color: string) => {
  const classes: Record<string, string> = {
    red: "bg-transparent", // Angular - no background, let the SVG show through;
    black: "bg-gradient-to-br from-gray-700 to-gray-900 text-white",
    blue: "bg-gradient-to-br from-blue-500 to-cyan-600 text-white",
    purple: "bg-gradient-to-br from-purple-500 to-pink-600 text-white",
    gray: "bg-gradient-to-br from-gray-400 to-gray-600 text-white",
    green: "bg-white", // Vue - white background for clean logo display;
    gradient: "bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-600 text-white",
  };
  return classes[color] || "bg-gradient-to-br from-blue-500 to-cyan-600 text-white";
};

const getTitleClass = (color: string) => {
  const classes: Record<string, string> = {
    red: "text-gray-900 dark:text-white group-hover:text-red-600 dark:group-hover:text-red-400",
    black: "text-gray-900 dark:text-white group-hover:text-gray-800 dark:group-hover:text-gray-300",
    blue: "text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400",
    purple:
      "text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400",
    gray: "text-gray-900 dark:text-white group-hover:text-gray-700 dark:group-hover:text-gray-400",
    green:
      "text-gray-900 dark:text-white group-hover:text-green-600 dark:group-hover:text-green-400",
    gradient:
      "text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400",
  };
  return (
    classes[color] ||
    "text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400"
  );
};

const getBorderClass = (color: string) => {
  const classes: Record<string, string> = {
    red: "border-gray-200 dark:border-gray-700 hover:border-red-400 dark:hover:border-red-500",
    black: "border-gray-200 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-500",
    blue: "border-gray-200 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-500",
    purple:
      "border-gray-200 dark:border-gray-700 hover:border-purple-400 dark:hover:border-purple-500",
    gray: "border-gray-200 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-500",
    green:
      "border-gray-200 dark:border-gray-700 hover:border-green-400 dark:hover:border-green-500",
    gradient:
      "border-gray-200 dark:border-gray-700 hover:border-purple-400 dark:hover:border-purple-500",
  };
  return (
    classes[color] ||
    "border-gray-200 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-500"
  );
};

const getFocusRingClass = (color: string) => {
  const classes: Record<string, string> = {
    red: "focus:ring-red-500",
    black: "focus:ring-gray-700",
    blue: "focus:ring-blue-500",
    purple: "focus:ring-purple-500",
    gray: "focus:ring-gray-500",
    green: "focus:ring-green-500",
    gradient: "focus:ring-purple-500",
  };
  return classes[color] || "focus:ring-blue-500";
};

const getButtonClass = (color: string) => {
  const classes: Record<string, string> = {
    red: "bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700",
    black: "bg-gradient-to-r from-gray-700 to-gray-900 hover:from-gray-800 hover:to-black",
    blue: "bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700",
    purple: "bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700",
    gray: "bg-gradient-to-r from-gray-500 to-gray-700 hover:from-gray-600 hover:to-gray-800",
    green:
      "bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700",
    gradient:
      "bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-600 hover:from-indigo-600 hover:via-purple-600 hover:to-pink-700",
  };
  return (
    classes[color] ||
    "bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700"
  );
};

const getProgressBarClass = (color: string) => {
  const classes: Record<string, string> = {
    red: "bg-gradient-to-r from-red-500 to-pink-600",
    black: "bg-gradient-to-r from-gray-700 to-gray-900",
    blue: "bg-gradient-to-r from-blue-500 to-cyan-600",
    purple: "bg-gradient-to-r from-purple-500 to-pink-600",
    gray: "bg-gradient-to-r from-gray-500 to-gray-700",
    green: "bg-gradient-to-r from-green-500 to-emerald-600",
    gradient: "bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-600",
  };
  return classes[color] || "bg-gradient-to-r from-blue-500 to-cyan-600";
};

const getProgressTextClass = (color: string) => {
  const classes: Record<string, string> = {
    red: "text-red-600 dark:text-red-400",
    black: "text-gray-800 dark:text-gray-300",
    blue: "text-blue-600 dark:text-blue-400",
    purple: "text-purple-600 dark:text-purple-400",
    gray: "text-gray-700 dark:text-gray-400",
    green: "text-green-600 dark:text-green-400",
    gradient: "text-purple-600 dark:text-purple-400",
  };
  return classes[color] || "text-blue-600 dark:text-blue-400";
};
</script>
