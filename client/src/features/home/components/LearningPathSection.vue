<template>
  <section class="learning-path-section" aria-labelledby="learning-path-title">
    <div class="learning-path-container">
      <div class="learning-path-header">
        <h2 id="learning-path-title" class="learning-path-title">
          {{ $t("home.learningPath.title") }}
        </h2>
        <p class="learning-path-description">
          {{ $t("home.learningPath.description") }}
        </p>
      </div>

      <div class="learning-path-content">
        <div class="path-steps">
          <div
            v-for="(step, index) in learningSteps"
            :key="step.id"
            class="path-step"
            :class="{ 'path-step--active': index === 0 }"
          >
            <div class="step-number">
              <span class="number-text">{{ index + 1 }}</span>
            </div>
            <div class="step-content">
              <h3 class="step-title">{{ $t(step.titleKey) }}</h3>
              <p class="step-description">{{ $t(step.descriptionKey) }}</p>
              <div class="step-features">
                <div v-for="feature in step.features" :key="feature" class="step-feature">
                  <CheckIcon class="feature-icon" aria-hidden="true" />
                  <span>{{ $t(feature) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="path-visual">
          <div class="progress-visualization">
            <div class="progress-circle">
              <div class="progress-fill"></div>
              <div class="progress-text">
                <span class="progress-number">95%</span>
                <span class="progress-label">{{ $t("home.learningPath.successRate") }}</span>
              </div>
            </div>
            <div class="progress-stats">
              <div class="stat-item">
                <span class="stat-number">500+</span>
                <span class="stat-label">{{ $t("home.learningPath.stats.questions") }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-number">10+</span>
                <span class="stat-label">{{ $t("home.learningPath.stats.frameworks") }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-number">50+</span>
                <span class="stat-label">{{ $t("home.learningPath.stats.companies") }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { CheckIcon } from "@heroicons/vue/24/solid";

const learningSteps = computed(() => [
  {
    id: "assess",
    titleKey: "home.learningPath.steps.assess.title",
    descriptionKey: "home.learningPath.steps.assess.description",
    features: [
      "home.learningPath.steps.assess.features.skill",
      "home.learningPath.steps.assess.features.gap",
      "home.learningPath.steps.assess.features.plan",
    ],
  },
  {
    id: "learn",
    titleKey: "home.learningPath.steps.learn.title",
    descriptionKey: "home.learningPath.steps.learn.description",
    features: [
      "home.learningPath.steps.learn.features.patterns",
      "home.learningPath.steps.learn.features.practice",
      "home.learningPath.steps.learn.features.feedback",
    ],
  },
  {
    id: "master",
    titleKey: "home.learningPath.steps.master.title",
    descriptionKey: "home.learningPath.steps.master.description",
    features: [
      "home.learningPath.steps.master.features.interview",
      "home.learningPath.steps.master.features.confidence",
      "home.learningPath.steps.master.features.job",
    ],
  },
]);
</script>

<style scoped>
.learning-path-section {
  @apply bg-gradient-to-b from-white to-slate-50 py-20 dark:from-slate-900 dark:to-slate-800 md:py-32;
}

.learning-path-container {
  @apply container mx-auto px-4;
}

.learning-path-header {
  @apply mb-20 text-center;
}

.learning-path-title {
  @apply mb-6 text-4xl font-bold text-slate-900 dark:text-white md:text-5xl;
  background: linear-gradient(135deg, #1e293b 0%, #3b82f6 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.dark .learning-path-title {
  background: linear-gradient(135deg, #f8fafc 0%, #3b82f6 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.learning-path-description {
  @apply mx-auto max-w-3xl text-xl text-slate-600 dark:text-slate-300;
}

.learning-path-content {
  @apply grid grid-cols-1 gap-16 lg:grid-cols-2 lg:gap-20;
}

.path-steps {
  @apply space-y-8;
}

.path-step {
  @apply relative flex gap-6 rounded-2xl bg-white p-8 shadow-lg transition-all duration-300 hover:shadow-xl dark:bg-slate-800;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(248, 250, 252, 0.9) 100%);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(226, 232, 240, 0.8);
}

.dark .path-step {
  background: linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(51, 65, 85, 0.9) 100%);
  border: 1px solid rgba(71, 85, 105, 0.8);
}

.path-step--active {
  @apply shadow-xl ring-2 ring-primary-500;
}

.step-number {
  @apply flex h-12 w-12 items-center justify-center rounded-full bg-primary-100 font-bold text-primary-700 dark:bg-primary-900/30 dark:text-primary-300;
}

.step-content {
  @apply flex-1;
}

.step-title {
  @apply mb-3 text-2xl font-bold text-slate-900 dark:text-white;
}

.step-description {
  @apply mb-4 text-slate-600 dark:text-slate-300;
}

.step-features {
  @apply space-y-2;
}

.step-feature {
  @apply flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400;
}

.feature-icon {
  @apply h-4 w-4 text-green-500;
}

.path-visual {
  @apply flex items-center justify-center;
}

.progress-visualization {
  @apply text-center;
}

.progress-circle {
  @apply relative mx-auto mb-8 h-48 w-48;
}

.progress-fill {
  @apply absolute inset-0 rounded-full border-8 border-primary-200 dark:border-primary-800;
  background: conic-gradient(from 0deg, #3b82f6 0deg 342deg, #e2e8f0 342deg 360deg);
}

.progress-text {
  @apply absolute inset-0 flex flex-col items-center justify-center;
}

.progress-number {
  @apply text-3xl font-bold text-primary-600 dark:text-primary-400;
}

.progress-label {
  @apply text-sm text-slate-600 dark:text-slate-400;
}

.progress-stats {
  @apply grid grid-cols-3 gap-6;
}

.stat-item {
  @apply text-center;
}

.stat-number {
  @apply block text-2xl font-bold text-primary-600 dark:text-primary-400;
}

.stat-label {
  @apply text-sm text-slate-600 dark:text-slate-400;
}

/* Responsive adjustments */
@media (width <= 768px) {
  .learning-path-content {
    @apply gap-12;
  }

  .learning-path-title {
    @apply text-3xl;
  }

  .learning-path-description {
    @apply text-lg;
  }

  .path-step {
    @apply p-6;
  }

  .progress-circle {
    @apply h-32 w-32;
  }

  .progress-number {
    @apply text-2xl;
  }
}

/* Animation */
@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(40px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.path-step {
  animation: slideInUp 0.6s ease-out forwards;
}

.path-step:nth-child(1) {
  animation-delay: 0.1s;
}
.path-step:nth-child(2) {
  animation-delay: 0.2s;
}
.path-step:nth-child(3) {
  animation-delay: 0.3s;
}
</style>
