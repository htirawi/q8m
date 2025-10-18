<script setup lang="ts">
import type { IHeroSectionProps as Props } from "@/types/components/home";
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { useRouter, useRoute } from "vue-router";
import { useHomepageAnalytics } from "@/composables/useHomepageAnalytics";
import { BoltIcon, FlagIcon, CheckCircleIcon, RocketLaunchIcon } from "@heroicons/vue/24/solid";

const props = withDefaults(defineProps<Props>(), {
  headlineVariant: "control",
});

const { locale, t } = useI18n();
const router = useRouter();
const route = useRoute();
const { trackCTAClick } = useHomepageAnalytics();

const currentLocale = computed(() => (route.params.locale as string) || locale.value);

// Headline text based on A/B test variant
const headlineText = computed(() => {
  const variant = props.headlineVariant ?? "control";
  const key = `home.hero.headline.${variant}`;
  return t(key);
});

// Handle primary CTA click
const handlePrimaryCTA = (): void => {
  trackCTAClick({
    ctaType: "primary",
    ctaText: t("home.hero.cta.primary"),
    ctaLocation: "hero",
    destinationUrl: "/register",
    variant: props.headlineVariant,
  });

  router.push({
    name: "register",
    params: { locale: currentLocale.value },
    query: { source: "hero", trial: "7-day" },
  });
};

// Handle secondary CTA click (view all plans)
const handleSecondaryCTA = (): void => {
  trackCTAClick({
    ctaType: "secondary",
    ctaText: t("home.hero.cta.secondary"),
    ctaLocation: "hero",
    destinationUrl: "/pricing",
    variant: props.headlineVariant,
  });

  router.push({
    name: "pricing",
    params: { locale: currentLocale.value },
    query: { source: "hero" },
  });
};
</script>

<template>
  <section class="hero-section" aria-labelledby="hero-title">
    <div class="hero-container">
      <div class="hero-content">
        <!-- IBadge -->
        <div class="hero-badge">
          <RocketLaunchIcon class="badge-icon" aria-hidden="true" />
          <span class="badge-text">{{ $t("home.hero.badge") }}</span>
        </div>

        <h1 id="hero-title" :class="['hero-title', { 'font-arabic': locale === 'ar' }]">
          {{ headlineText }}
        </h1>
        <p :class="['hero-description', { 'font-arabic-sans': locale === 'ar' }]">
          {{ $t("home.hero.description") }}
        </p>

        <!-- Tech Stack Badges -->
        <div class="tech-stack">
          <span class="tech-badge">{{ $t("home.hero.techStack.react") }} </span>
          <span class="tech-badge">{{ $t("home.hero.techStack.vue") }} </span>
          <span class="tech-badge">{{ $t("home.hero.techStack.angular") }} </span>
          <span class="tech-badge">{{ $t("home.hero.techStack.nextjs") }} </span>
          <span class="tech-badge">{{ $t("home.hero.techStack.typescript") }} </span>
        </div>

        <div class="hero-actions">
          <!-- Primary CTA (single, prominent) -->
          <button
            type="button"
            class="hero-cta-primary"
            @click="handlePrimaryCTA"
            :aria-label="t('home.hero.cta.primaryAriaLabel')"
          >
            {{ $t("home.hero.cta.primary") }}

            <svg
              class="hero-cta-icon"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M13 7l5 5m0 0l-5 5m5-5H6"
              />
            </svg>
          </button>

          <!-- Secondary CTA (text link, low visual weight) -->
          <button
            type="button"
            class="hero-cta-secondary"
            @click="handleSecondaryCTA"
            :aria-label="t('home.hero.cta.secondaryAriaLabel')"
          >
            {{ $t("home.hero.cta.secondary") }}
          </button>
        </div>

        <!-- Reassurance bullets -->
        <ul class="hero-reassurance" role="list">
          <li class="hero-reassurance__item">
            <svg
              class="hero-reassurance__icon"
              fill="currentColor"
              viewBox="0 0 20 20"
              aria-hidden="true"
            >
              <path
                fill-rule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clip-rule="evenodd"
              />
            </svg>
            <span>{{ $t("home.hero.reassurance.noCard") }} </span>
          </li>
          <li class="hero-reassurance__item">
            <svg
              class="hero-reassurance__icon"
              fill="currentColor"
              viewBox="0 0 20 20"
              aria-hidden="true"
            >
              <path
                fill-rule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clip-rule="evenodd"
              />
            </svg>
            <span>{{ $t("home.hero.reassurance.fullAccess") }} </span>
          </li>
          <li class="hero-reassurance__item">
            <svg
              class="hero-reassurance__icon"
              fill="currentColor"
              viewBox="0 0 20 20"
              aria-hidden="true"
            >
              <path
                fill-rule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clip-rule="evenodd"
              />
            </svg>
            <span>{{ $t("home.hero.reassurance.cancelAnytime") }} </span>
          </li>
        </ul>

        <div class="hero-stats">
          <div class="stat-item">
            <span class="stat-number">500+</span>
            <span class="stat-label">{{ $t("home.hero.stats.questions") }} </span>
          </div>
          <div class="stat-item">
            <span class="stat-number">10+</span>
            <span class="stat-label">{{ $t("home.hero.stats.frameworks") }} </span>
          </div>
          <div class="stat-item">
            <span class="stat-number">95%</span>
            <span class="stat-label">{{ $t("home.hero.stats.success") }} </span>
          </div>
        </div>
      </div>

      <div class="hero-visual">
        <div class="hero-image-container">
          <div class="dashboard-preview">
            <div class="dashboard-header">
              <div class="dashboard-dots">
                <div class="dot red"></div>
                <div class="dot yellow"></div>
                <div class="dot green"></div>
              </div>
              <div class="dashboard-title">{{ $t("home.hero.dashboard.title") }}</div>
            </div>
            <div class="dashboard-content">
              <div class="quiz-card">
                <div class="quiz-icon quiz-icon--blue">
                  <BoltIcon class="quiz-icon__svg" aria-hidden="true" />
                </div>
                <div class="quiz-info">
                  <h4>{{ $t("home.hero.dashboard.quiz1.title") }}</h4>
                  <p>{{ $t("home.hero.dashboard.quiz1.details") }}</p>
                </div>
                <div class="quiz-progress">
                  <div class="progress-bar">
                    <div class="progress-fill"></div>
                  </div>
                  <span class="progress-text">85%</span>
                </div>
              </div>
              <div class="quiz-card">
                <div class="quiz-icon quiz-icon--purple">
                  <FlagIcon class="quiz-icon__svg" aria-hidden="true" />
                </div>
                <div class="quiz-info">
                  <h4>{{ $t("home.hero.dashboard.quiz2.title") }}</h4>
                  <p>{{ $t("home.hero.dashboard.quiz2.details") }}</p>
                </div>
                <div class="quiz-progress">
                  <div class="progress-bar">
                    <div class="progress-fill progress-fill--60"></div>
                  </div>
                  <span class="progress-text">60%</span>
                </div>
              </div>
              <div class="quiz-card">
                <div class="quiz-icon quiz-icon--green">
                  <CheckCircleIcon class="quiz-icon__svg" aria-hidden="true" />
                </div>
                <div class="quiz-info">
                  <h4>{{ $t("home.hero.dashboard.quiz3.title") }}</h4>
                  <p>{{ $t("home.hero.dashboard.quiz3.details") }}</p>
                </div>
                <div class="quiz-progress">
                  <div class="progress-bar">
                    <div class="progress-fill progress-fill--100"></div>
                  </div>
                  <span class="progress-text">100%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.hero-section {
  @apply bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-20 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 md:py-32;

  position: relative;
  overflow: hidden;
}

.hero-section::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background:
    radial-gradient(circle at 20% 80%, rgb(59, 130, 246, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 80% 20%, rgb(99, 102, 241, 0.1) 0%, transparent 50%);
  pointer-events: none;
}

.hero-container {
  @apply container mx-auto grid grid-cols-1 items-center gap-16 px-4 lg:grid-cols-2 lg:gap-20;

  position: relative;
  z-index: 1;
}

.hero-content {
  @apply space-y-8;
}

.hero-badge {
  @apply inline-flex items-center gap-2;
}

.badge-icon {
  @apply h-4 w-4 text-primary-600 dark:text-primary-400;
}

.badge-text {
  @apply rounded-full bg-primary-100 px-4 py-2 text-sm font-medium text-primary-700 dark:bg-primary-900/30 dark:text-primary-300;
}

.hero-title {
  @apply text-5xl font-bold leading-tight text-slate-900 dark:text-white md:text-6xl lg:text-7xl;

  background: linear-gradient(135deg, #1e293b 0%, #3b82f6 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.dark .hero-title {
  background: linear-gradient(135deg, #f8fafc 0%, #3b82f6 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* Arabic font styling for hero title */
.hero-title.font-arabic {
  font-family: "Aref Ruqaa Ink", ui-serif, Georgia, Cambria, "Times New Roman", Times, serif;
  font-weight: 700;
  letter-spacing: 0.02em;
}

/* Arabic font styling for hero description */
.hero-description.font-arabic-sans {
  font-family:
    "Playpen Sans Arabic",
    ui-sans-serif,
    system-ui,
    -apple-system,
    BlinkMacSystemFont,
    "Segoe UI",
    Roboto,
    "Helvetica Neue",
    Arial,
    "Noto Sans Arabic",
    sans-serif;
  font-weight: 400;
  line-height: 1.6;
}

.hero-description {
  @apply max-w-2xl text-xl leading-relaxed text-slate-600 dark:text-slate-300 md:text-2xl;
}

.tech-stack {
  @apply flex flex-wrap gap-3;
}

.tech-badge {
  @apply rounded-lg bg-white/80 px-4 py-2 text-sm font-medium text-slate-700 shadow-sm ring-1 ring-slate-200 dark:bg-slate-800/80 dark:text-slate-300 dark:ring-slate-700;
}

/* Hero Actions & Buttons */
.hero-actions {
  @apply flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-6;
}

.hero-cta-primary {
  @apply inline-flex items-center justify-center gap-2;
  @apply rounded-lg px-8 py-4;
  @apply text-lg font-bold text-white;
  @apply bg-gradient-to-r from-blue-600 to-purple-600;
  @apply hover:from-blue-700 hover:to-purple-700;
  @apply focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2;
  @apply shadow-xl transition-all duration-300 hover:shadow-2xl;
  @apply transform hover:scale-105;
}

.hero-cta-icon {
  @apply h-5 w-5 transition-transform duration-200;
}

.hero-cta-primary:hover .hero-cta-icon {
  @apply translate-x-1;
}

.hero-cta-secondary {
  @apply inline-flex items-center;
  @apply px-4 py-2;
  @apply text-base font-medium text-blue-600 dark:text-blue-400;
  @apply hover:text-blue-800 dark:hover:text-blue-300;
  @apply hover:underline;
  @apply focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2;
  @apply transition-colors duration-200;
}

.hero-reassurance {
  @apply flex flex-col gap-2 sm:flex-row sm:gap-6;
  @apply text-sm text-slate-600 dark:text-slate-400;
}

.hero-reassurance__item {
  @apply flex items-center gap-2;
}

.hero-reassurance__icon {
  @apply h-5 w-5 flex-shrink-0 text-green-500;
}

.hero-stats {
  @apply grid grid-cols-3 gap-8 border-t border-slate-200 pt-8 dark:border-slate-700;
}

.stat-item {
  @apply text-center;
}

.stat-number {
  @apply block text-3xl font-bold text-primary-600 dark:text-primary-400 md:text-4xl;
}

.stat-label {
  @apply mt-2 block text-sm font-medium text-slate-600 dark:text-slate-400;
}

.hero-visual {
  @apply relative;
}

.hero-image-container {
  @apply relative overflow-hidden rounded-2xl shadow-2xl;
}

.dashboard-preview {
  @apply bg-white dark:bg-slate-800;

  border-radius: 16px;
  box-shadow: 0 25px 50px -12px rgb(0, 0, 0, 0.25);
}

.dashboard-header {
  @apply flex items-center justify-between border-b border-slate-200 px-6 py-4 dark:border-slate-700;
}

.dashboard-dots {
  @apply flex gap-2;
}

.dot {
  @apply h-3 w-3 rounded-full;
}

.dot.red {
  @apply bg-red-400;
}

.dot.yellow {
  @apply bg-yellow-400;
}

.dot.green {
  @apply bg-green-400;
}

.dashboard-title {
  @apply text-sm font-medium text-slate-600 dark:text-slate-300;
}

.dashboard-content {
  @apply space-y-4 p-6;
}

.quiz-card {
  @apply flex items-center gap-4 rounded-lg border border-slate-200 p-4 dark:border-slate-700;
}

.quiz-icon {
  @apply flex h-10 w-10 items-center justify-center rounded-lg;
}

.quiz-icon--blue {
  @apply bg-blue-100 dark:bg-blue-900/30;
}

.quiz-icon--purple {
  @apply bg-purple-100 dark:bg-purple-900/30;
}

.quiz-icon--green {
  @apply bg-green-100 dark:bg-green-900/30;
}

.quiz-icon__svg {
  @apply h-6 w-6;
}

.quiz-icon--blue .quiz-icon__svg {
  @apply text-blue-600 dark:text-blue-400;
}

.quiz-icon--purple .quiz-icon__svg {
  @apply text-purple-600 dark:text-purple-400;
}

.quiz-icon--green .quiz-icon__svg {
  @apply text-green-600 dark:text-green-400;
}

.quiz-info {
  @apply flex-1;
}

.quiz-info h4 {
  @apply text-sm font-semibold text-slate-900 dark:text-white;
}

.quiz-info p {
  @apply text-xs text-slate-500 dark:text-slate-400;
}

.quiz-progress {
  @apply flex items-center gap-2;
}

.progress-bar {
  @apply h-2 w-16 rounded-full bg-slate-200 dark:bg-slate-700;
}

.progress-fill {
  @apply h-2 rounded-full bg-primary-500 transition-all duration-1000;

  width: 85%;
}

.progress-fill--60 {
  width: 60%;
}

.progress-fill--100 {
  width: 100%;
}

.progress-text {
  @apply text-xs font-medium text-slate-600 dark:text-slate-400;
}

/* Focus styles for keyboard navigation */
.hero-cta-primary:focus-visible,
.hero-cta-secondary:focus-visible {
  @apply outline-2 outline-offset-2 outline-blue-500;
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .hero-cta-primary,
  .hero-cta-icon {
    @apply transform-none transition-none;
  }

  .hero-cta-primary:hover {
    @apply scale-100;
  }

  .hero-cta-primary:hover .hero-cta-icon {
    @apply translate-x-0;
  }
}

/* Responsive adjustments */
@media (width <= 768px) {
  .hero-stats {
    @apply gap-4;
  }

  .stat-number {
    @apply text-2xl;
  }

  .hero-title {
    @apply text-4xl;
  }

  .hero-description {
    @apply text-lg;
  }
}

/* Animation */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.hero-content > * {
  animation: fadeInUp 0.6s ease-out forwards;
}

.hero-content > *:nth-child(1) {
  animation-delay: 0.1s;
}

.hero-content > *:nth-child(2) {
  animation-delay: 0.2s;
}

.hero-content > *:nth-child(3) {
  animation-delay: 0.3s;
}

.hero-content > *:nth-child(4) {
  animation-delay: 0.4s;
}

.hero-content > *:nth-child(5) {
  animation-delay: 0.5s;
}

.hero-content > *:nth-child(6) {
  animation-delay: 0.6s;
}
</style>
