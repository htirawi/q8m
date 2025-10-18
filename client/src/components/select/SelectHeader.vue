<template>
    <header class="select-header">
        <div class="select-header__container">
            <!-- Optional breadcrumb -->
            <nav v-if="showBreadcrumb" class="select-header__breadcrumb" aria-label="Breadcrumb">
                <ol class="breadcrumb-list">
                    <li class="breadcrumb-item">
                        <router-link :to="`/${locale}/dashboard`" class="breadcrumb-link">
                            {{ $t('navigation.dashboard') }}

                        </router-link>
                    </li>
                    <li class="breadcrumb-separator" aria-hidden="true">/</li>
                    <li class="breadcrumb-item breadcrumb-item--current" aria-current="page">
                        {{ $t('select.breadcrumb') }}

                    </li>
                </ol>
            </nav>

            <!-- Main heading -->
            <h1 class="select-header__title">
                {{ $t('select.title') }}

            </h1>

            <!-- Subtitle -->
            <p class="select-header__subtitle">
                {{ subtitle }}

            </p>
        </div>
    </header>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

interface iselectheaderprops {
    /** Whether to show breadcrumb navigation */
    showBreadcrumb?: boolean;

    /** User's current streak (for personalized subtitle) */
    streak?: number;
}

const props = withDefaults(defineProps<ISelectHeaderProps>(), {
    showBreadcrumb: false,
    streak: 0,
});

const { t, locale } = useI18n();

const subtitle = computed(() => {
    if (props.streak > 0) {
        return t('select.subtitleWithStreak', { streak: props.streak });
    }
    return t('select.subtitle');
});
</script>

<style scoped>
.select-header {
    @apply w-full py-12 px-4;
}

.select-header__container {
    @apply max-w-4xl mx-auto text-center;
}

/* Breadcrumb */
.select-header__breadcrumb {
    @apply mb-8;
}

.breadcrumb-list {
    @apply flex items-center justify-center gap-2 text-sm;
}

.breadcrumb-item {
    @apply text-white/80;
}

.breadcrumb-item--current {
    @apply text-white font-medium;
}

.breadcrumb-link {
    @apply text-white/70 hover:text-white transition-colors duration-200;
    @apply focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent;
    @apply rounded px-2 py-1;
}

.breadcrumb-separator {
    @apply text-white/50;
}

/* Title */
.select-header__title {
    @apply text-5xl md:text-6xl font-extrabold text-white mb-6;

    letter-spacing: -0.03em;
    line-height: 1.1;
    text-shadow: 0 2px 4px rgb(0, 0, 0, 0.1), 0 4px 12px rgb(0, 0, 0, 0.15),
        0 8px 24px rgb(0, 0, 0, 0.2);
    animation: fade-in-up 0.6s ease-out;
}

/* Subtitle */
.select-header__subtitle {
    @apply text-xl md:text-2xl text-white/90 max-w-3xl mx-auto font-medium leading-relaxed;

    text-shadow: 0 2px 8px rgb(0, 0, 0, 0.15);
    animation: fade-in-up 0.6s ease-out 0.1s backwards;
}

/* Animations */
@keyframes fade-in-up {
    from {
        opacity: 0;
        transform: translateY(20px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
    .select-header__title,
    .select-header__subtitle {
        animation: none !important;
    }
}
</style>
