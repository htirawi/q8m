<script setup lang="ts">
import { useI18n } from "vue-i18n";

import Button from "@/components/ui/Button.vue";

const { locale } = useI18n();
</script>

<template>
  <section class="hero-section" aria-labelledby="hero-title">
    <div class="hero-container">
      <div class="hero-content">
        <!-- Badge -->
        <div class="hero-badge">
          <span class="badge-text">{{ $t("home.hero.badge") }}</span>
        </div>

        <h1 id="hero-title" :class="['hero-title', { 'font-arabic': locale === 'ar' }]">
          {{ $t("home.hero.title") }}
        </h1>
        <p :class="['hero-description', { 'font-arabic-sans': locale === 'ar' }]">
          {{ $t("home.hero.description") }}
        </p>

        <!-- Tech Stack Badges -->
        <div class="tech-stack">
          <span class="tech-badge">{{ $t("home.hero.techStack.react") }}</span>
          <span class="tech-badge">{{ $t("home.hero.techStack.vue") }}</span>
          <span class="tech-badge">{{ $t("home.hero.techStack.angular") }}</span>
          <span class="tech-badge">{{ $t("home.hero.techStack.nextjs") }}</span>
          <span class="tech-badge">{{ $t("home.hero.techStack.typescript") }}</span>
        </div>

        <div class="hero-actions">
          <Button variant="primary" size="lg" :to="{ name: 'subscribe' }" class="hero-cta">
            {{ $t("home.hero.cta") }}
          </Button>
          <Button variant="outline" size="lg" :to="{ name: 'register' }" class="hero-secondary">
            {{ $t("home.hero.register") }}
          </Button>
        </div>

        <div class="hero-stats">
          <div class="stat-item">
            <span class="stat-number">500+</span>
            <span class="stat-label">{{ $t("home.hero.stats.questions") }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-number">10+</span>
            <span class="stat-label">{{ $t("home.hero.stats.frameworks") }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-number">95%</span>
            <span class="stat-label">{{ $t("home.hero.stats.success") }}</span>
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
                <div class="quiz-icon">⚡</div>
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
                <div class="quiz-icon">🎯</div>
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
                <div class="quiz-icon">🚀</div>
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
    radial-gradient(circle at 20% 80%, rgba(59, 130, 246, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 80% 20%, rgba(99, 102, 241, 0.1) 0%, transparent 50%);
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
  @apply inline-flex items-center;
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
  @apply flex flex-col gap-4 sm:flex-row sm:gap-6;
}

.hero-cta {
  @apply relative min-h-[52px] overflow-hidden px-8 text-lg font-semibold;
  @apply bg-gradient-to-r from-primary-600 to-primary-700;
  @apply hover:from-primary-700 hover:to-primary-800;
  @apply focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2;
  @apply shadow-lg transition-all duration-300 hover:shadow-xl;
  @apply transform hover:-translate-y-0.5;
}

.hero-secondary {
  @apply relative min-h-[52px] px-8 text-lg font-semibold;
  @apply border-2 border-primary-600 bg-white text-primary-700;
  @apply hover:border-primary-600 hover:bg-primary-600 hover:text-white;
  @apply focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2;
  @apply shadow-md transition-all duration-200 ease-in-out hover:shadow-lg;
  @apply transform hover:-translate-y-0.5;
  @apply dark:border-primary-400 dark:bg-slate-800 dark:text-primary-300;
  @apply dark:hover:border-primary-600 dark:hover:bg-primary-600 dark:hover:text-white;
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
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
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
  @apply text-2xl;
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

/* Focus styles */
.hero-cta:focus,
.hero-secondary:focus {
  @apply outline-none ring-2 ring-primary-500 ring-offset-2 dark:ring-offset-slate-800;
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
