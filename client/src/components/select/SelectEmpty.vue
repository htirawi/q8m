<template>
    <div class="select-empty" role="status" aria-live="polite">
        <div class="select-empty__container">
            <!-- Icon/Illustration -->
            <div class="select-empty__icon" aria-hidden="true">
                <svg class="empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <circle cx="12" cy="12" r="10" stroke-width="1.5" />
                    <path d="M8 12h8" stroke-width="1.5" stroke-linecap="round" />
                </svg>
            </div>

            <!-- Message -->
            <h2 class="select-empty__title">{{ $t('select.emptyTitle') }}

</h2>
            <p class="select-empty__message">{{ $t('select.emptyMessage') }}

</p>

            <!-- Action -->
            <button type="button" class="select-empty__action" @click="handleReset">
                {{ $t('select.resetFilters') }}

            </button>
        </div>
    </div>
</template>

<script setup lang="ts">
interface ISelectEmptyEmits {
    (e: 'reset'): void;
}

const emit = defineEmits<ISelectEmptyEmits>();

const handleReset = (): void => {
    emit('reset');
};

</script>

<style scoped>
.select-empty {
    @apply w-full py-20 px-4;
}

.select-empty__container {
    @apply max-w-md mx-auto text-center;
    @apply bg-white/10 backdrop-blur-md rounded-2xl p-12 border border-white/20;

    animation: fade-in 0.6s ease-out;
}

.select-empty__icon {
    @apply mb-6 flex justify-center;
}

.empty-icon {
    @apply w-20 h-20 text-white/40;
}

.select-empty__title {
    @apply text-2xl font-bold text-white mb-4;
}

.select-empty__message {
    @apply text-base text-white/70 mb-8 leading-relaxed;
}

.select-empty__action {
    @apply px-8 py-3 rounded-xl bg-white text-purple-600 font-bold text-sm;
    @apply transition-all duration-200;
    @apply hover:bg-white/90 hover:scale-105;
    @apply focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent;
}

@keyframes fade-in {
    from {
        opacity: 0;
    }

    to {
        opacity: 1;
    }
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
    .select-empty__container {
        animation: none !important;
    }
}
</style>
