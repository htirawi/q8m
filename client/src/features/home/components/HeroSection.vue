<template>
  <section class="hero-section" aria-labelledby="hero-title">
    <div class="hero-container">
      <div class="hero-content">
        <h1 id="hero-title" class="hero-title">
          {{ $t('home.hero.title') }}
        </h1>
        <p class="hero-description">
          {{ $t('home.hero.description') }}
        </p>
        <div class="hero-actions">
          <Button
            variant="primary"
            size="lg"
            :to="{ name: 'register' }"
            class="hero-cta"
          >
            {{ $t('home.hero.cta') }}
          </Button>
          <Button
            variant="secondary"
            size="lg"
            :to="{ name: 'pricing' }"
            class="hero-secondary"
          >
            {{ $t('home.hero.pricing') }}
          </Button>
        </div>
        <div class="hero-stats">
          <div class="stat-item">
            <span class="stat-number">500+</span>
            <span class="stat-label">{{ $t('home.hero.stats.questions') }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-number">10+</span>
            <span class="stat-label">{{ $t('home.hero.stats.frameworks') }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-number">95%</span>
            <span class="stat-label">{{ $t('home.hero.stats.success') }}</span>
          </div>
        </div>
      </div>
      <div class="hero-visual">
        <div class="hero-image-container">
          <div class="hero-placeholder">
            <div class="placeholder-content">
              <div class="placeholder-icon">📊</div>
              <p class="placeholder-text">{{ $t('home.hero.placeholder') }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import Button from '@/components/ui/Button.vue'
</script>

<style scoped>
.hero-section {
  @apply py-16 md:py-24 bg-gradient-to-br from-primary-50 to-blue-50 dark:from-gray-900 dark:to-gray-800;
}

.hero-container {
  @apply container mx-auto px-4 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center;
}

.hero-content {
  @apply space-y-8;
}

.hero-title {
  @apply text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white leading-tight;
}

.hero-description {
  @apply text-lg md:text-xl text-gray-600 dark:text-gray-300 leading-relaxed max-w-2xl;
}

.hero-actions {
  @apply flex flex-col sm:flex-row gap-4;
}

.hero-cta {
  @apply min-h-[44px] px-8;
}

.hero-secondary {
  @apply min-h-[44px] px-8;
}

.hero-stats {
  @apply grid grid-cols-3 gap-8 pt-8 border-t border-gray-200 dark:border-gray-700;
}

.stat-item {
  @apply text-center;
}

.stat-number {
  @apply block text-2xl md:text-3xl font-bold text-primary-600 dark:text-primary-400;
}

.stat-label {
  @apply block text-sm text-gray-600 dark:text-gray-400 mt-1;
}

.hero-visual {
  @apply relative;
}

.hero-image-container {
  @apply relative rounded-lg overflow-hidden shadow-2xl;
}

.hero-placeholder {
  @apply w-full h-96 bg-gradient-to-br from-primary-100 to-blue-100 dark:from-gray-800 dark:to-gray-700 rounded-lg flex items-center justify-center;
}

.placeholder-content {
  @apply text-center space-y-4;
}

.placeholder-icon {
  @apply text-6xl;
}

.placeholder-text {
  @apply text-lg text-gray-600 dark:text-gray-300 font-medium;
}

/* Focus styles */
.hero-cta:focus,
.hero-secondary:focus {
  @apply outline-none ring-2 ring-primary-500 ring-offset-2 dark:ring-offset-gray-800;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .hero-stats {
    @apply gap-4;
  }
  
  .stat-number {
    @apply text-xl;
  }
}
</style>
