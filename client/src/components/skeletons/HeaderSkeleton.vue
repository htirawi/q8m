<template>
  <header class="header-skeleton">
    <div class="header-skeleton__container">
      <!-- Logo -->
      <div class="header-skeleton__logo">
        <div class="skeleton skeleton-logo"></div>
      </div>

      <!-- Navigation -->
      <nav class="header-skeleton__nav">
        <div v-for="i in 4" :key="i" class="skeleton skeleton-nav-item"></div>
      </nav>

      <!-- User Section -->
      <div class="header-skeleton__user">
        <!-- Notification Bell -->
        <div class="skeleton skeleton-icon-button"></div>

        <!-- Plan Badge -->
        <div class="skeleton skeleton-plan-badge"></div>

        <!-- User Avatar -->
        <div class="skeleton skeleton-avatar"></div>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
// Pure skeleton component
</script>

<style scoped>
/* Container */
.header-skeleton {
  @apply w-full border-b border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900;
  @apply sticky top-0 z-40;

  height: 64px;
}

.header-skeleton__container {
  @apply mx-auto h-full max-w-7xl px-4;
  @apply flex items-center justify-between;
}

/* Base skeleton */
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

/* Logo */
.header-skeleton__logo {
  @apply flex-shrink-0;
}

.skeleton-logo {
  @apply h-8 w-20 rounded-lg;
}

/* Navigation */
.header-skeleton__nav {
  @apply hidden items-center gap-6 md:flex;
}

.skeleton-nav-item {
  @apply h-5 w-16 rounded;

  opacity: 0.8;
}

.skeleton-nav-item:nth-child(2) {
  @apply w-20;

  animation-delay: 100ms;
}

.skeleton-nav-item:nth-child(3) {
  @apply w-14;

  animation-delay: 200ms;
}

.skeleton-nav-item:nth-child(4) {
  @apply w-24;

  animation-delay: 300ms;
}

/* User Section */
.header-skeleton__user {
  @apply flex items-center gap-3;
}

.skeleton-icon-button {
  @apply h-9 w-9 rounded-lg;

  animation-delay: 400ms;
}

.skeleton-plan-badge {
  @apply hidden h-6 w-16 rounded-full md:block;

  animation-delay: 500ms;
  opacity: 0.7;
}

.skeleton-avatar {
  @apply h-9 w-9 rounded-full;
  @apply ring-2 ring-gray-100 dark:ring-gray-800;

  animation-delay: 600ms;
}

/* Mobile adjustments */
@media (width <= 768px) {
  .header-skeleton__nav {
    @apply hidden;
  }

  .header-skeleton__user {
    @apply gap-2;
  }

  .skeleton-plan-badge {
    @apply hidden;
  }
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  .skeleton {
    animation: none !important;
  }
}

/* RTL support */
[dir="rtl"] .header-skeleton__container {
  @apply flex-row-reverse;
}

[dir="rtl"] .header-skeleton__nav {
  @apply flex-row-reverse;
}

[dir="rtl"] .header-skeleton__user {
  @apply flex-row-reverse;
}
</style>
