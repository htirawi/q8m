<template>
  <section class="hero-section" aria-labelledby="hero-title">
    <div class="hero-container">
      <div class="hero-content">
        <h1 id="hero-title" class="hero-title">
          {{ $t("home.hero.title") }}

        </h1>
        <p class="hero-description">
          {{ $t("home.hero.description") }}
        </p>
        <div class="hero-actions">
          <Button variant="primary" size="lg" :to="{ name: 'register' }" class="hero-cta">
            {{ $t("home.hero.cta") }}
          </Button>
          <Button variant="secondary" size="lg" :to="{ name: 'pricing' }" class="hero-secondary">
            {{ $t("home.hero.pricing") }}

          </Button>
        </div>
        <div class="hero-stats">
          <div class="stat-item">
            <span class="stat-number">500+</span>
            <span class="stat-label">{{ $t("home.hero.stats.questions") }}

</span>
          </div>
          <div class="stat-item">
            <span class="stat-number">10+</span>
            <span class="stat-label">{{ $t("home.hero.stats.frameworks") }}

</span>
          </div>
          <div class="stat-item">
            <span class="stat-number">95%</span>
            <span class="stat-label">{{ $t("home.hero.stats.success") }}

</span>
          </div>
        </div>
      </div>
      <div class="hero-visual">
        <div class="hero-image-container">
          <div class="hero-placeholder">
            <div class="placeholder-content">
              <div class="placeholder-icon">📊</div>
              <p class="placeholder-text">{{ $t("home.hero.placeholder") }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import Button from "@/components/ui/Button.vue";
</script>

<style scoped>
.hero-section {
  @apply bg-gradient-to-br from-primary-50 to-blue-50 py-16 dark:from-gray-900 dark:to-gray-800 md:py-24;
}

.hero-container {
  @apply container mx-auto grid grid-cols-1 items-center gap-12 px-4 lg:grid-cols-2;
}

.hero-content {
  @apply space-y-8;
}

.hero-title {
  @apply text-4xl font-bold leading-tight text-gray-900 dark:text-white md:text-5xl lg:text-6xl;
}

.hero-description {
  @apply max-w-2xl text-lg leading-relaxed text-gray-600 dark:text-gray-300 md:text-xl;
}

.hero-actions {
  @apply flex flex-col gap-4 sm:flex-row;
}

.hero-cta {
  @apply min-h-[44px] px-8;
}

.hero-secondary {
  @apply min-h-[44px] px-8;
}

.hero-stats {
  @apply grid grid-cols-3 gap-8 border-t border-gray-200 pt-8 dark:border-gray-700;
}

.stat-item {
  @apply text-center;
}

.stat-number {
  @apply block text-2xl font-bold text-primary-600 dark:text-primary-400 md:text-3xl;
}

.stat-label {
  @apply mt-1 block text-sm text-gray-600 dark:text-gray-400;
}

.hero-visual {
  @apply relative;
}

.hero-image-container {
  @apply relative overflow-hidden rounded-lg shadow-2xl;
}

.hero-placeholder {
  @apply flex h-96 w-full items-center justify-center rounded-lg bg-gradient-to-br from-primary-100 to-blue-100 dark:from-gray-800 dark:to-gray-700;
}

.placeholder-content {
  @apply space-y-4 text-center;
}

.placeholder-icon {
  @apply text-6xl;
}

.placeholder-text {
  @apply text-lg font-medium text-gray-600 dark:text-gray-300;
}

/* Focus styles */
.hero-cta:focus,
.hero-secondary:focus {
  @apply outline-none ring-2 ring-primary-500 ring-offset-2 dark:ring-offset-gray-800;
}

/* Responsive adjustments */
@media (width <= 768px) {
  .hero-stats {
    @apply gap-4;
  }

  .stat-number {
    @apply text-xl;
  }
}
</style>
