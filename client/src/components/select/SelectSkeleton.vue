<template>
    <div class="select-skeleton" aria-busy="true" aria-label="Loading...">
        <div class="select-skeleton__container">
            <!-- Header skeleton -->
            <div class="skeleton-header">
                <div class="skeleton-title"></div>
                <div class="skeleton-subtitle"></div>
            </div>

            <!-- Grid skeleton -->
            <div class="skeleton-grid">
                <div v-for="i in 4" :key="i" class="skeleton-card">
                    <div class="skeleton-card__badge"></div>
                    <div class="skeleton-card__icon"></div>
                    <div class="skeleton-card__title"></div>
                    <div class="skeleton-card__subtitle"></div>
                    <div class="skeleton-card__description-line"></div>
                    <div class="skeleton-card__description-line skeleton-card__description-line--short"></div>
                    <div class="skeleton-card__meta"></div>
                    <div class="skeleton-card__cta"></div>
                </div>
            </div>

            <!-- Footer skeleton -->
            <div class="skeleton-footer">
                <div class="skeleton-btn"></div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
// Skeleton loader matching the final layout to prevent CLS
</script>

<style scoped>
.select-skeleton {
    @apply min-h-screen relative overflow-hidden;

    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.select-skeleton__container {
    @apply max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12;
}

/* Base skeleton styles */
.skeleton-base {
    @apply bg-white/20 backdrop-blur-sm rounded-lg;

    animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

/* Header skeleton */
.skeleton-header {
    @apply text-center mb-20 py-12;
}

.skeleton-title {
    @apply skeleton-base h-16 w-96 max-w-full mx-auto mb-6;
    @apply rounded-2xl;
}

.skeleton-subtitle {
    @apply skeleton-base h-8 w-[600px] max-w-full mx-auto;
    @apply rounded-xl;
}

/* Grid skeleton */
.skeleton-grid {
    @apply grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 mb-16;
}

.skeleton-card {
    @apply relative bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20;
    @apply flex flex-col gap-4;

    box-shadow: 0 10px 30px -5px rgb(0, 0, 0, 0.3);
}

.skeleton-card__badge {
    @apply skeleton-base absolute top-4 right-4 h-6 w-16;
    @apply rounded-full;
}

.skeleton-card__icon {
    @apply skeleton-base h-12 w-12 rounded-lg;
}

.skeleton-card__title {
    @apply skeleton-base h-8 w-32 rounded-lg;
}

.skeleton-card__subtitle {
    @apply skeleton-base h-4 w-24 rounded;
}

.skeleton-card__description-line {
    @apply skeleton-base h-4 w-full rounded;
}

.skeleton-card__description-line--short {
    @apply w-3/4;
}

.skeleton-card__meta {
    @apply skeleton-base h-5 w-28 rounded;
}

.skeleton-card__cta {
    @apply skeleton-base h-12 w-full rounded-xl mt-2;
}

/* Footer skeleton */
.skeleton-footer {
    @apply flex justify-center;
}

.skeleton-btn {
    @apply skeleton-base h-16 w-56 rounded-2xl;
}

/* Pulse animation */
@keyframes pulse {
    0%,
    100% {
        opacity: 1;
    }

    50% {
        opacity: 0.5;
    }
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
    .skeleton-base {
        animation: none !important;
    }
}
</style>
