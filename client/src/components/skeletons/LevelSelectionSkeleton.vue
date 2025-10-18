<template>
  <div class="level-selection-skeleton">
    <!-- Header Skeleton -->
    <div class="skeleton-header">
      <div class="skeleton-header__greeting">
        <div class="skeleton skeleton-heading skeleton-heading--large"></div>
        <div class="skeleton skeleton-text skeleton-text--subtitle"></div>
      </div>
      <div class="skeleton-header__stats">
        <div class="skeleton skeleton-badge"></div>
        <div class="skeleton skeleton-badge"></div>
      </div>
    </div>

    <!-- Level Cards Grid Skeleton -->
    <div class="skeleton-grid">
      <div v-for="i in 4" :key="i" class="skeleton-card" :style="{ '--delay': `${i * 100}ms` }">
        <div class="skeleton-card__icon">
          <div class="skeleton skeleton-icon"></div>
        </div>
        <div class="skeleton-card__content">
          <div class="skeleton skeleton-text skeleton-text--title"></div>
          <div class="skeleton skeleton-text skeleton-text--subtitle"></div>
          <div class="skeleton-card__description">
            <div class="skeleton skeleton-text"></div>
            <div class="skeleton skeleton-text skeleton-text--short"></div>
          </div>
        </div>
        <div class="skeleton-card__footer">
          <div class="skeleton skeleton-text skeleton-text--small"></div>
        </div>
      </div>
    </div>

    <!-- Recent Activity Skeleton -->
    <div class="skeleton-activity">
      <div class="skeleton skeleton-heading skeleton-heading--small"></div>
      <div class="skeleton-activity__list">
        <div v-for="i in 2" :key="i" class="skeleton-activity__item">
          <div class="skeleton skeleton-dot"></div>
          <div class="skeleton skeleton-text skeleton-text--medium"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// This is a pure skeleton component, no logic needed
</script>

<style scoped>
/* Container */
.level-selection-skeleton {
  @apply w-full max-w-7xl mx-auto px-4 py-8 space-y-8;

  animation: fadeIn 0.3s ease-out;
}

/* Base skeleton element */
.skeleton {
  @apply relative overflow-hidden;

  background: linear-gradient(
    90deg,
    var(--color-gray-200) 0%,
    var(--color-gray-100) 50%,
    var(--color-gray-200) 100%
  );
  background-size: 200% 100%;
  animation: skeleton-wave 1.5s ease-in-out infinite;
  animation-delay: var(--delay, 0ms);
  border-radius: var(--radius-md);
}

.dark .skeleton {
  background: linear-gradient(
    90deg,
    var(--color-gray-800) 0%,
    var(--color-gray-700) 50%,
    var(--color-gray-800) 100%
  );
}

@keyframes skeleton-wave {
  0% {
    background-position: 200% 0;
  }

  100% {
    background-position: -200% 0;
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Header Section */
.skeleton-header {
  @apply flex justify-between items-start mb-8;
}

.skeleton-header__greeting {
  @apply space-y-3 flex-1;
}

.skeleton-heading--large {
  @apply h-10 w-64;
}

.skeleton-text--subtitle {
  @apply h-6 w-48 opacity-70;
}

.skeleton-header__stats {
  @apply flex gap-4;
}

.skeleton-badge {
  @apply h-8 w-24 rounded-full;
}

/* Grid */
.skeleton-grid {
  @apply grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6;
}

/* Card */
.skeleton-card {
  @apply p-6 rounded-xl border border-gray-200 dark:border-gray-700;
  @apply bg-white dark:bg-gray-800 space-y-4;
  @apply transition-all duration-300;

  min-height: 280px;
}

.skeleton-card__icon {
  @apply flex justify-center mb-4;
}

.skeleton-icon {
  @apply h-16 w-16 rounded-lg;
}

.skeleton-card__content {
  @apply space-y-3;
}

.skeleton-text--title {
  @apply h-7 w-32 mx-auto;
}

.skeleton-text--subtitle {
  @apply h-5 w-24 mx-auto opacity-60;
}

.skeleton-card__description {
  @apply space-y-2 mt-4;
}

.skeleton-text {
  @apply h-4 w-full;
}

.skeleton-text--short {
  @apply w-3/4;
}

.skeleton-card__footer {
  @apply mt-4 pt-4 border-t border-gray-100 dark:border-gray-700;
}

.skeleton-text--small {
  @apply h-3 w-28 mx-auto;
}

/* Recent Activity */
.skeleton-activity {
  @apply mt-12 p-6 rounded-xl bg-gray-50 dark:bg-gray-800/50;
}

.skeleton-heading--small {
  @apply h-6 w-32 mb-4;
}

.skeleton-activity__list {
  @apply space-y-3;
}

.skeleton-activity__item {
  @apply flex items-center gap-3;
}

.skeleton-dot {
  @apply h-2 w-2 rounded-full flex-shrink-0;
}

.skeleton-text--medium {
  @apply h-4 w-64;
}

/* Staggered animation */
.skeleton-card:nth-child(1) {
  animation-delay: 0ms;
}

.skeleton-card:nth-child(2) {
  animation-delay: 100ms;
}

.skeleton-card:nth-child(3) {
  animation-delay: 200ms;
}

.skeleton-card:nth-child(4) {
  animation-delay: 300ms;
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  .skeleton,
  .skeleton-card,
  .level-selection-skeleton {
    animation: none !important;
  }
}

/* Mobile responsiveness */
@media (width <= 768px) {
  .skeleton-header {
    @apply flex-col space-y-4;
  }

  .skeleton-header__stats {
    @apply w-full justify-start;
  }

  .skeleton-grid {
    @apply grid-cols-1;
  }

  .skeleton-card {
    @apply max-w-md mx-auto w-full;
  }
}
</style>