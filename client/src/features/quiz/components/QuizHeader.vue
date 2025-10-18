<template>
  <div class="mb-8">
    <!-- Minimalist Professional Header -->
    <div
      class="flex items-center justify-between border-b border-gray-100 pb-4 dark:border-gray-800"
    >
      <!-- Left: Subtle Exit -->
      <button
        type="button"
        class="group flex items-center gap-2 text-sm text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        aria-label="Exit quiz"
        @click="$emit('exit')"
      >
        <svg
          class="h-4 w-4 transition-transform group-hover:-translate-x-0.5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M10 19l-7-7m0 0l7-7m-7 7h18"
          />
        </svg>
        {{ t("quiz.exit") }}
      </button>

      <!-- Center: Clean Progress Indicator -->
      <div class="flex items-center gap-6">
        <!-- Minimal Timer Only -->
        <div class="flex items-center gap-2 font-mono text-sm" :class="timerTextClass">
          {{ timeFormatted }}
        </div>
      </div>

      <!-- Right: User Menu -->
      <div class="flex-shrink-0">
        <UserMenu />
      </div>
    </div>

    <!-- Elegant Progress Bar -->
    <div class="mt-6">
      <div class="mb-3 flex items-center justify-between text-sm">
        <span class="text-gray-600 dark:text-gray-400"
          >Question {{ currentIndex + 1 }} of {{ totalQuestions }}
        </span>
        <span class="font-semibold text-gray-900 dark:text-gray-100"
          >{{ Math.round(progress) }}%</span
        >
      </div>
      <div class="h-1 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
        <div
          class="h-full bg-gradient-to-r from-blue-600 to-purple-600 transition-all duration-500 ease-out"
          :style="{ width: `${progress}%` }"
        ></div>
      </div>
    </div>

    <!-- Time Warning Banner (Only when critical) -->
    <div
      v-if="remainingTime <= 300 && remainingTime > 0"
      class="mt-4 animate-fade-in-up rounded-lg border border-orange-200 bg-orange-50 p-4 dark:border-orange-800 dark:bg-orange-900/20"
      role="alert"
    >
      <div class="flex items-start gap-3">
        <div class="flex-shrink-0 rounded-full bg-orange-100 p-1.5 dark:bg-orange-900/30">
          <svg
            class="h-4 w-4 text-orange-600 dark:text-orange-400"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fill-rule="evenodd"
              d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
              clip-rule="evenodd"
            />
          </svg>
        </div>
        <div class="flex-1">
          <p class="text-sm font-medium text-orange-800 dark:text-orange-200">
            {{
              t("quiz.timeWarning", {
                minutes: Math.ceil(remainingTime / 60),
                minutesText: minutesText,
              })
            }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { IQuizHeaderProps as Props } from "@/types/components/quiz";
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import UserMenu from "@/components/layout/UserMenu.vue";

const props = withDefaults(defineProps<Props>(), {
  isSticky: false,
});

defineEmits<{
  exit: [];
}>();

const { t, locale } = useI18n();

const progress = computed(() => ((props.currentIndex + 1) / props.totalQuestions) * 100);

const _levelDotClass = computed(() => {
  const classes = {
    junior: "bg-green-500",
    intermediate: "bg-yellow-500",
    senior: "bg-red-500",
  };
  return classes[props.level] || "bg-gray-500";
});

const timerTextClass = computed(() => {
  // For testing with 10-second timer: red when 10 seconds or less remaining
  if (props.remainingTime <= 10) return "text-red-600 dark:text-red-400 animate-pulse";
  if (props.remainingTime <= 30) return "text-orange-600 dark:text-orange-400";
  return "text-gray-700 dark:text-gray-200";
});

const timeFormatted = computed(() => {
  const mins = Math.floor(props.remainingTime / 60);
  const secs = props.remainingTime % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
});

const minutesText = computed(() => {
  const minutes = Math.ceil(props.remainingTime / 60);
  if (locale.value === "ar") {
    return minutes === 1 ? "دقيقة" : "دقائق";
  } else {
    return minutes === 1 ? "minute" : "minutes";
  }
});
</script>
