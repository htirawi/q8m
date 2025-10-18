<script setup lang="ts">
import type { IHomeHowItWorksProps as Props } from "@/types/components/home";
import { useI18n } from "vue-i18n";
import { HOMEPAGE_STEPS } from "@/data/home";
import SectionHeader from "@/components/ui/SectionHeader.vue";

const _props = withDefaults(defineProps<Props>(), {
  steps: () => HOMEPAGE_STEPS,
});

const { t } = useI18n();
</script>

<template>
  <section class="how-it-works-section" aria-labelledby="how-it-works-title">
    <div class="how-it-works-container">
      <SectionHeader title-key="home.howItWorks.title" subtitle-key="home.howItWorks.subtitle" />

      <div class="how-it-works-steps">
        <article
          v-for="(step, index) in steps"
          :key="step.id"
          class="how-it-works-step"
          :data-step="step.stepNumber"
        >
          <!-- Step number badge -->
          <div class="step-number">
            <span class="step-number__text">{{ step.stepNumber }} </span>
          </div>

          <!-- Step icon -->
          <div class="step-icon">
            <component :is="step.icon" class="step-icon__svg" aria-hidden="true" />
          </div>

          <!-- Step content -->
          <div class="step-content">
            <h3 class="step-title">
              {{ t(step.titleKey) }}
            </h3>
            <p class="step-description">
              {{ t(step.descriptionKey) }}
            </p>
          </div>

          <!-- Connector arrow (not on last step) -->
          <div v-if="index < steps.length - 1" class="step-connector" aria-hidden="true">
            <svg
              class="step-connector__arrow"
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
          </div>
        </article>
      </div>
    </div>
  </section>
</template>

<style scoped>
.how-it-works-section {
  @apply bg-white py-16 dark:bg-slate-800 md:py-24;
}

.how-it-works-container {
  @apply container mx-auto px-4;
}

.how-it-works-steps {
  @apply relative grid grid-cols-1 gap-8 md:grid-cols-3 md:gap-12;
}

.how-it-works-step {
  @apply relative flex flex-col items-center text-center;
}

/* Step number badge */
.step-number {
  @apply mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-primary-500 to-purple-500 shadow-lg;
}

.step-number__text {
  @apply text-xl font-bold text-white;
}

/* Step icon */
.step-icon {
  @apply mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-100 to-purple-100 dark:from-primary-900/40 dark:to-purple-900/40;
}

.step-icon__svg {
  @apply h-12 w-12 text-primary-600 dark:text-primary-400;
}

/* Step content */
.step-content {
  @apply space-y-3;
}

.step-title {
  @apply text-xl font-bold text-slate-900 dark:text-white md:text-2xl;
}

.step-description {
  @apply text-base leading-relaxed text-slate-600 dark:text-slate-300;
}

/* Connector arrow (desktop only) */
.step-connector {
  @apply absolute left-full top-1/3 hidden -translate-y-1/2 md:block;
  @apply w-12 text-primary-400 dark:text-primary-600;
}

.step-connector__arrow {
  @apply h-8 w-8;
}

/* RTL Support - flip arrows */
[dir="rtl"] .step-connector {
  @apply left-auto right-full;
}

[dir="rtl"] .step-connector__arrow {
  @apply rotate-180;
}

/* Animation on scroll (optional) */
.how-it-works-step {
  animation: fadeInUp 0.6s ease-out forwards;
  opacity: 0;
}

.how-it-works-step:nth-child(1) {
  animation-delay: 0.1s;
}

.how-it-works-step:nth-child(2) {
  animation-delay: 0.2s;
}

.how-it-works-step:nth-child(3) {
  animation-delay: 0.3s;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  .how-it-works-step {
    animation: none;
    opacity: 1;
    transform: none;
  }
}
</style>
