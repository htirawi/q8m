<template>
  <button
    type="button"
    class="group relative flex h-full flex-col overflow-hidden rounded-3xl border-2 border-gray-200 bg-white/90 p-10 text-left backdrop-blur-sm transition-all duration-500 hover:-translate-y-2 hover:scale-[1.02] hover:shadow-2xl focus:outline-none focus:ring-4 focus:ring-offset-2 dark:border-gray-700 dark:bg-gray-800/90"
    :class="[hoverBorderClass, focusRingClass]"
    @click="$emit('select')"
  >
    <!-- Decorative Corner Accent -->
    <div
      class="absolute right-0 top-0 h-32 w-32 opacity-10 transition-opacity duration-500 group-hover:opacity-20"
    >
      <div class="h-full w-full rounded-bl-full bg-gradient-to-r" :class="gradient"></div>
    </div>

    <!-- Icon -->
    <div class="relative mb-7 flex justify-center">
      <div
        class="absolute h-24 w-24 animate-pulse rounded-full bg-gradient-to-r opacity-20 blur-xl"
        :class="gradient"
      ></div>
      <div
        class="relative flex h-24 w-24 items-center justify-center rounded-2xl bg-gradient-to-r text-white shadow-xl transition-all duration-500 group-hover:rotate-6 group-hover:scale-110 group-hover:shadow-2xl"
        :class="gradient"
      >
        <span class="text-5xl" role="img" :aria-label="`${mode} mode icon`">{{ icon }} </span>
      </div>
    </div>

    <!-- Content -->
    <div class="relative flex-1">
      <h2
        class="mb-4 text-center text-3xl font-extrabold text-gray-900 transition-all duration-300 dark:text-white"
        :class="titleHoverClass"
      >
        {{ title }}
      </h2>

      <p class="mb-8 text-center text-base leading-relaxed text-gray-600 dark:text-gray-400">
        {{ description }}
      </p>

      <!-- Features List -->
      <div class="mb-8 space-y-4">
        <div
          v-for="(feature, index) in features"
          :key="index"
          class="flex items-start gap-3 text-sm text-gray-700 transition-all duration-300 dark:text-gray-300"
        >
          <div
            class="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30"
          >
            <svg
              class="h-4 w-4 text-green-600 dark:text-green-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="3"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <span class="leading-relaxed">{{ feature }} </span>
        </div>
      </div>
    </div>

    <!-- CTA Button -->
    <div class="relative mt-auto">
      <div
        class="flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-gradient-to-r px-8 py-4 text-lg font-bold text-white shadow-xl transition-all duration-300 group-hover:scale-105 group-hover:border-white/40 group-hover:shadow-2xl group-hover:brightness-110"
        :class="gradient"
      >
        <span>{{ cta }} </span>
        <svg
          class="h-5 w-5 transition-transform duration-300 group-hover:translate-x-2"
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

    <!-- Hover Gradient Overlay -->
    <div
      class="absolute inset-0 -z-10 rounded-3xl bg-gradient-to-br opacity-0 transition-opacity duration-500 group-hover:opacity-5 dark:opacity-0 dark:group-hover:opacity-10"
      :class="hoverGradient"
    />

    <!-- Shine Effect on Hover -->
    <div
      class="absolute inset-0 -z-10 translate-x-[-100%] rounded-3xl bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-1000 group-hover:translate-x-[100%]"
    ></div>
  </button>
</template>

<script setup lang="ts">
import type { IModeCardProps as Props } from "@/types/components/study";
import { computed } from "vue";

const props = defineProps<Props>();

defineEmits<{
  select: [];
}>();

const hoverBorderClass = computed(() => {
  if (props.mode === "study") {
    return "hover:border-blue-400 hover:shadow-blue-500/20 dark:hover:border-blue-500";
  }
  return "hover:border-purple-400 hover:shadow-purple-500/20 dark:hover:border-purple-500";
});

const titleHoverClass = computed(() => {
  if (props.mode === "study") {
    return "group-hover:text-blue-600 dark:group-hover:text-blue-400";
  }
  return "group-hover:text-purple-600 dark:group-hover:text-purple-400";
});

const focusRingClass = computed(() => {
  if (props.mode === "study") {
    return "focus:ring-blue-500";
  }
  return "focus:ring-purple-500";
});
</script>
