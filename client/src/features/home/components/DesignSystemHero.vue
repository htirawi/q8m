<template>
  <div class="demo-hero">
    <div class="hero-container">
      <div class="hero-content">
        <div class="hero-badge">
          <div class="badge-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
          </div>
          <span class="badge-text">{{ $t("home.demo.badge") }}</span>
        </div>
        <h1 id="demo-title" class="hero-title">
          {{ $t("home.demo.title") }}
        </h1>
        <p class="hero-description">
          {{ $t("home.demo.description") }}
        </p>
        <div class="hero-stats">
          <div class="stat-item">
            <span class="stat-number">50+</span>
            <span class="stat-label">{{ $t("home.demo.stats.components") }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-number">100%</span>
            <span class="stat-label">{{ $t("home.demo.stats.accessible") }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-number">0.5s</span>
            <span class="stat-label">{{ $t("home.demo.stats.loadTime") }}</span>
          </div>
        </div>
      </div>
      <div class="hero-visual">
        <div class="floating-cards">
          <div class="floating-card card-1">
            <div class="card-header">
              <div class="card-dots">
                <span class="dot red"></span>
                <span class="dot yellow"></span>
                <span class="dot green"></span>
              </div>
              <span class="card-title">{{ $t("home.demo.cards.button") }}</span>
            </div>
            <div class="card-content">
              <div class="mini-button primary">Primary</div>
              <div class="mini-button secondary">Secondary</div>
            </div>
          </div>
          <div class="floating-card card-2">
            <div class="card-header">
              <div class="card-dots">
                <span class="dot red"></span>
                <span class="dot yellow"></span>
                <span class="dot green"></span>
              </div>
              <span class="card-title">{{ $t("home.demo.cards.form") }}</span>
            </div>
            <div class="card-content">
              <div class="mini-input"></div>
              <div class="mini-select"></div>
            </div>
          </div>
          <div class="floating-card card-3">
            <div class="card-header">
              <div class="card-dots">
                <span class="dot red"></span>
                <span class="dot yellow"></span>
                <span class="dot green"></span>
              </div>
              <span class="card-title">{{ $t("home.demo.cards.state") }}</span>
            </div>
            <div class="card-content">
              <div class="mini-spinner"></div>
              <div class="mini-success"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";

useI18n();
</script>

<style scoped>
.demo-hero {
  @apply bg-gradient-to-br from-slate-50 via-white to-blue-50 py-32 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900;
  position: relative;
  min-height: 100vh;
  display: flex;
  align-items: center;
}

.demo-hero::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background:
    radial-gradient(circle at 20% 80%, rgba(59, 130, 246, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 80% 20%, rgba(139, 92, 246, 0.1) 0%, transparent 50%),
    linear-gradient(135deg, rgba(255, 255, 255, 0.8) 0%, rgba(248, 250, 252, 0.4) 100%);
  pointer-events: none;
}

.hero-container {
  @apply container mx-auto px-4;
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4rem;
  align-items: center;
}

.hero-content {
  @apply space-y-8;
}

.hero-badge {
  @apply inline-flex items-center gap-3 rounded-full bg-gradient-to-r from-blue-100 to-purple-100 px-6 py-3 text-sm font-semibold text-blue-700 dark:from-blue-900/30 dark:to-purple-900/30 dark:text-blue-300;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(59, 130, 246, 0.2);
}

.badge-icon {
  @apply h-5 w-5 text-blue-600 dark:text-blue-400;
}

.hero-title {
  @apply text-6xl font-bold text-slate-900 dark:text-white md:text-7xl lg:text-8xl;
  background: linear-gradient(135deg, #1e293b 0%, #3b82f6 30%, #8b5cf6 70%, #ec4899 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  line-height: 1.1;
}

.dark .hero-title {
  background: linear-gradient(135deg, #f8fafc 0%, #3b82f6 30%, #8b5cf6 70%, #ec4899 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero-description {
  @apply text-xl leading-relaxed text-slate-600 dark:text-slate-300 md:text-2xl;
  max-width: 32rem;
}

.hero-stats {
  @apply flex gap-8;
}

.stat-item {
  @apply text-center;
}

.stat-number {
  @apply block text-3xl font-bold text-slate-900 dark:text-white md:text-4xl;
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.stat-label {
  @apply text-sm font-medium text-slate-500 dark:text-slate-400;
}

/* Floating Cards */
.hero-visual {
  @apply relative;
}

.floating-cards {
  @apply relative h-96;
}

.floating-card {
  @apply absolute rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-800;
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  animation: float 6s ease-in-out infinite;
}

.card-1 {
  top: 0;
  left: 0;
  width: 200px;
  animation-delay: 0s;
}

.card-2 {
  top: 80px;
  right: 0;
  width: 220px;
  animation-delay: 2s;
}

.card-3 {
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 180px;
  animation-delay: 4s;
}

.card-header {
  @apply mb-4 flex items-center justify-between;
}

.card-dots {
  @apply flex gap-1.5;
}

.dot {
  @apply h-2 w-2 rounded-full;
}

.dot.red {
  @apply bg-red-500;
}
.dot.yellow {
  @apply bg-yellow-500;
}
.dot.green {
  @apply bg-green-500;
}

.card-title {
  @apply text-sm font-semibold text-slate-700 dark:text-slate-300;
}

.card-content {
  @apply space-y-3;
}

.mini-button {
  @apply rounded-lg px-3 py-2 text-xs font-medium;
}

.mini-button.primary {
  @apply bg-blue-600 text-white;
}

.mini-button.secondary {
  @apply bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300;
}

.mini-input {
  @apply h-8 rounded-lg border border-slate-300 bg-slate-50 dark:border-slate-600 dark:bg-slate-700;
}

.mini-select {
  @apply h-8 rounded-lg bg-slate-600;
}

.mini-spinner {
  @apply h-6 w-6 animate-spin rounded-full border-2 border-blue-200 border-t-blue-600;
}

.mini-success {
  @apply h-6 w-6 rounded-full bg-green-500;
}

/* Animations */
@keyframes float {
  0%,
  100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-20px);
  }
}

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

.hero-content > * {
  animation: slideInUp 0.8s ease-out forwards;
}

.hero-badge {
  animation-delay: 0.1s;
}
.hero-title {
  animation-delay: 0.2s;
}
.hero-description {
  animation-delay: 0.3s;
}
.hero-stats {
  animation-delay: 0.4s;
}

/* Responsive */
@media (width <= 1024px) {
  .hero-container {
    @apply grid-cols-1 gap-8;
  }

  .hero-visual {
    @apply order-first;
  }

  .floating-cards {
    @apply h-80;
  }

  .card-1,
  .card-2,
  .card-3 {
    @apply relative bottom-auto left-auto right-auto top-auto transform-none;
    width: 100%;
    margin-bottom: 1rem;
  }
}

@media (width <= 768px) {
  .hero-title {
    @apply text-4xl md:text-5xl;
  }

  .hero-description {
    @apply text-lg md:text-xl;
  }

  .hero-stats {
    @apply flex-col gap-4;
  }
}
</style>
