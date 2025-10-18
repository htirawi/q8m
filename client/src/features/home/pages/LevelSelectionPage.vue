<template>
    <div
        class="relative min-h-screen overflow-hidden bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <!-- Animated Background Elements -->
        <div class="pointer-events-none absolute inset-0 overflow-hidden">
            <div
                class="absolute -left-4 top-20 h-72 w-72 animate-blob rounded-full bg-purple-300 opacity-20 mix-blend-multiply blur-xl filter dark:bg-purple-600 dark:opacity-10">
            </div>
            <div
                class="animation-delay-2000 absolute -right-4 top-40 h-72 w-72 animate-blob rounded-full bg-yellow-300 opacity-20 mix-blend-multiply blur-xl filter dark:bg-yellow-600 dark:opacity-10">
            </div>
            <div
                class="animation-delay-4000 absolute -bottom-8 left-20 h-72 w-72 animate-blob rounded-full bg-pink-300 opacity-20 mix-blend-multiply blur-xl filter dark:bg-pink-600 dark:opacity-10">
            </div>
        </div>

        <div class="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
            <!-- Gamification Header Bar -->
            <div v-if="authStore.isAuthenticated" class="mb-8 flex items-center justify-between gap-4 flex-wrap">
                <div class="flex items-center gap-4">
                    <StreakDisplay variant="compact" @click="showStreakModal = true" />
                    <CoinBalance variant="compact" @click="showCoinsModal = true" />
                </div>
                <div class="flex items-center gap-3">
                    <button
                        type="button"
                        class="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 px-4 py-2 text-sm font-medium text-white shadow-lg transition-all hover:from-purple-700 hover:to-blue-700 hover:shadow-xl"
                        @click="goToLearningPaths"
                    >
                        <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                        </svg>
                        <span>Learning Paths</span>
                    </button>
                    <UserMenu />
                </div>
            </div>

            <!-- Streak Saver Warning (if applicable) -->
            <StreakSaver v-if="authStore.isAuthenticated" />

            <!-- Header -->
            <div class="mb-16 text-center">
                <div class="mb-6 inline-flex items-center justify-center">
                    <div
                        class="rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 p-4 shadow-lg shadow-blue-500/30 dark:shadow-blue-500/20">
                        <svg class="h-12 w-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                    </div>
                </div>
                <h1
                    class="mb-4 animate-fade-in-up bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-4xl font-extrabold leading-tight text-transparent dark:from-blue-400 dark:to-purple-400 md:text-6xl md:leading-tight">
                    {{ t('levelSelection.title') }}

                </h1>
                <p
                    class="animation-delay-200 mx-auto max-w-2xl animate-fade-in-up text-lg leading-relaxed text-gray-600 dark:text-gray-300 md:text-xl">
                    {{ t('levelSelection.subtitle') }}

                </p>
            </div>

            <!-- Level Selection -->
            <div class="mb-12">
                <h2
                    class="mb-10 text-center text-2xl font-bold text-gray-900 dark:text-white md:text-3xl">
                    {{ t('levelSelection.chooseLevel') }}

                </h2>
                <div class="grid grid-cols-1 gap-8 md:grid-cols-3">
                    <!-- Junior -->
                    <button type="button" :class="getLevelCardClass('junior')"
                        @click="handleLevelClick('junior')">
                        <div class="relative z-10">
                            <!-- Icon IBadge -->
                            <div class="mb-6 flex justify-center">
                                <div
                                    :class="getLevelIconClass('junior')">
                                    <svg class="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                            d="M13 10V3L4 14h7v7l9-11h-7z" />
                                    </svg>
                                </div>
                            </div>

                            <div class="text-center">
                                <h3 class="mb-2 text-2xl font-bold">{{ t('level.junior.label') }}

</h3>
                                <p :class="getLevelDescriptionClass('junior')" class="mb-6 min-h-[48px]">
                                    {{ t('level.junior.description') }}

                                </p>
                            </div>

                            <!-- Features List -->
                            <div class="mb-6 space-y-2 text-sm">
                                <div class="flex items-center gap-2" :class="selectedLevel === 'junior' && canUserAccessLevel('junior') ? 'text-white/90' : 'text-gray-600 dark:text-gray-400'">
                                    <svg class="h-4 w-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                        <path fill-rule="evenodd"
                                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                            clip-rule="evenodd" />
                                    </svg>
                                    <span>Entry-level challenges</span>
                                </div>
                                <div class="flex items-center gap-2" :class="selectedLevel === 'junior' && canUserAccessLevel('junior') ? 'text-white/90' : 'text-gray-600 dark:text-gray-400'">
                                    <svg class="h-4 w-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                        <path fill-rule="evenodd"
                                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                            clip-rule="evenodd" />
                                    </svg>
                                    <span>Perfect for beginners</span>
                                </div>
                                <div class="flex items-center gap-2" :class="selectedLevel === 'junior' && canUserAccessLevel('junior') ? 'text-white/90' : 'text-gray-600 dark:text-gray-400'">
                                    <svg class="h-4 w-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                        <path fill-rule="evenodd"
                                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                            clip-rule="evenodd" />
                                    </svg>
                                    <span>Fundamental concepts</span>
                                </div>
                            </div>

                            <div class="flex justify-center">
                                <span v-if="canUserAccessLevel('junior')"
                                    class="inline-flex items-center gap-2 rounded-full bg-green-100 px-4 py-1.5 text-xs font-semibold text-green-800 dark:bg-green-900 dark:text-green-200">
                                    <svg class="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                                        <path fill-rule="evenodd"
                                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                            clip-rule="evenodd" />
                                    </svg>
                                    {{ t('plans.access.available') }}

                                </span>
                                <div v-else class="flex flex-col items-center gap-2">
                                    <LockedBadge required-plan="free" />
                                    <span class="text-xs font-medium text-purple-600 dark:text-purple-400">Click to upgrade</span>
                                </div>
                            </div>
                        </div>
                        <div v-if="selectedLevel === 'junior' && canUserAccessLevel('junior')"
                            class="absolute right-6 top-6">
                            <div
                                class="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-lg animate-scale-in">
                                <svg class="h-6 w-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                    <path fill-rule="evenodd"
                                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                        clip-rule="evenodd" />
                                </svg>
                            </div>
                        </div>
                    </button>

                    <!-- Intermediate -->
                    <button type="button"
                        :class="getLevelCardClass('intermediate')" @click="handleLevelClick('intermediate')">
                        <div class="relative z-10">
                            <!-- Icon IBadge -->
                            <div class="mb-6 flex justify-center">
                                <div
                                    :class="getLevelIconClass('intermediate')">
                                    <svg class="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                    </svg>
                                </div>
                            </div>

                            <div class="text-center">
                                <h3 class="mb-2 text-2xl font-bold">{{ t('level.intermediate.label') }}

</h3>
                                <p :class="getLevelDescriptionClass('intermediate')" class="mb-6 min-h-[48px]">
                                    {{ t('level.intermediate.description') }}

                                </p>
                            </div>

                            <!-- Features List -->
                            <div class="mb-6 space-y-2 text-sm">
                                <div class="flex items-center gap-2" :class="selectedLevel === 'intermediate' && canUserAccessLevel('intermediate') ? 'text-white/90' : 'text-gray-600 dark:text-gray-400'">
                                    <svg class="h-4 w-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                        <path fill-rule="evenodd"
                                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                            clip-rule="evenodd" />
                                    </svg>
                                    <span>Moderate difficulty</span>
                                </div>
                                <div class="flex items-center gap-2" :class="selectedLevel === 'intermediate' && canUserAccessLevel('intermediate') ? 'text-white/90' : 'text-gray-600 dark:text-gray-400'">
                                    <svg class="h-4 w-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                        <path fill-rule="evenodd"
                                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                            clip-rule="evenodd" />
                                    </svg>
                                    <span>Advanced concepts</span>
                                </div>
                                <div class="flex items-center gap-2" :class="selectedLevel === 'intermediate' && canUserAccessLevel('intermediate') ? 'text-white/90' : 'text-gray-600 dark:text-gray-400'">
                                    <svg class="h-4 w-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                        <path fill-rule="evenodd"
                                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                            clip-rule="evenodd" />
                                    </svg>
                                    <span>Real-world scenarios</span>
                                </div>
                            </div>

                            <div class="flex justify-center">
                                <span v-if="canUserAccessLevel('intermediate')"
                                    class="inline-flex items-center gap-2 rounded-full bg-yellow-100 px-4 py-1.5 text-xs font-semibold text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                                    <svg class="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                                        <path fill-rule="evenodd"
                                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                            clip-rule="evenodd" />
                                    </svg>
                                    {{ t('plans.access.available') }}

                                </span>
                                <div v-else class="flex flex-col items-center gap-2">
                                    <LockedBadge required-plan="intermediate" />
                                    <span class="text-xs font-medium text-purple-600 dark:text-purple-400">Click to upgrade</span>
                                </div>
                            </div>
                        </div>
                        <div v-if="selectedLevel === 'intermediate' && canUserAccessLevel('intermediate')"
                            class="absolute right-6 top-6">
                            <div
                                class="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-lg animate-scale-in">
                                <svg class="h-6 w-6 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                                    <path fill-rule="evenodd"
                                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                        clip-rule="evenodd" />
                                </svg>
                            </div>
                        </div>
                    </button>

                    <!-- Senior -->
                    <button type="button" :class="getLevelCardClass('senior')"
                        @click="handleLevelClick('senior')">
                        <div class="relative z-10">
                            <!-- Icon IBadge -->
                            <div class="mb-6 flex justify-center">
                                <div
                                    :class="getLevelIconClass('senior')">
                                    <svg class="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                            d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                    </svg>
                                </div>
                            </div>

                            <div class="text-center">
                                <h3 class="mb-2 text-2xl font-bold">{{ t('level.senior.label') }}

</h3>
                                <p :class="getLevelDescriptionClass('senior')" class="mb-6 min-h-[48px]">
                                    {{ t('level.senior.description') }}

                                </p>
                            </div>

                            <!-- Features List -->
                            <div class="mb-6 space-y-2 text-sm">
                                <div class="flex items-center gap-2" :class="selectedLevel === 'senior' && canUserAccessLevel('senior') ? 'text-white/90' : 'text-gray-600 dark:text-gray-400'">
                                    <svg class="h-4 w-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                        <path fill-rule="evenodd"
                                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                            clip-rule="evenodd" />
                                    </svg>
                                    <span>Expert-level questions</span>
                                </div>
                                <div class="flex items-center gap-2" :class="selectedLevel === 'senior' && canUserAccessLevel('senior') ? 'text-white/90' : 'text-gray-600 dark:text-gray-400'">
                                    <svg class="h-4 w-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                        <path fill-rule="evenodd"
                                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                            clip-rule="evenodd" />
                                    </svg>
                                    <span>Complex architectures</span>
                                </div>
                                <div class="flex items-center gap-2" :class="selectedLevel === 'senior' && canUserAccessLevel('senior') ? 'text-white/90' : 'text-gray-600 dark:text-gray-400'">
                                    <svg class="h-4 w-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                        <path fill-rule="evenodd"
                                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                            clip-rule="evenodd" />
                                    </svg>
                                    <span>Industry expertise</span>
                                </div>
                            </div>

                            <div class="flex justify-center">
                                <span v-if="canUserAccessLevel('senior')"
                                    class="inline-flex items-center gap-2 rounded-full bg-red-100 px-4 py-1.5 text-xs font-semibold text-red-800 dark:bg-red-900 dark:text-red-200">
                                    <svg class="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                                        <path fill-rule="evenodd"
                                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                            clip-rule="evenodd" />
                                    </svg>
                                    {{ t('plans.access.available') }}

                                </span>
                                <div v-else class="flex flex-col items-center gap-2">
                                    <LockedBadge required-plan="advanced" />
                                    <span class="text-xs font-medium text-purple-600 dark:text-purple-400">Click to upgrade</span>
                                </div>
                            </div>
                        </div>
                        <div v-if="selectedLevel === 'senior' && canUserAccessLevel('senior')"
                            class="absolute right-6 top-6">
                            <div
                                class="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-lg animate-scale-in">
                                <svg class="h-6 w-6 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                                    <path fill-rule="evenodd"
                                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                        clip-rule="evenodd" />
                                </svg>
                            </div>
                        </div>
                    </button>
                </div>
            </div>

        </div>

        <!-- Detailed Modals -->
        <Teleport to="body">
            <!-- Streak Modal -->
            <div
                v-if="showStreakModal"
                class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
                @click.self="showStreakModal = false"
            >
                <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full p-6 relative max-h-[90vh] overflow-y-auto">
                    <button
                        @click="showStreakModal = false"
                        class="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                    >
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                    <StreakDisplay variant="detailed" />
                </div>
            </div>

            <!-- Coins Modal -->
            <div
                v-if="showCoinsModal"
                class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
                @click.self="showCoinsModal = false"
            >
                <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full p-6 relative max-h-[90vh] overflow-y-auto">
                    <button
                        @click="showCoinsModal = false"
                        class="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                    >
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                    <CoinBalance variant="detailed" />
                </div>
            </div>
        </Teleport>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";
import { usePlanStore } from "@/stores/plan";
import { useAuthStore } from "@/stores/auth";
import { usePreferencesStore } from "@/stores/preferences";
import { useStreak } from "@/composables/useStreak";
import LockedBadge from "@/components/paywall/LockedBadge.vue";
import StreakDisplay from "@/features/gamification/components/StreakDisplay.vue";
import CoinBalance from "@/features/gamification/components/CoinBalance.vue";
import StreakSaver from "@/features/gamification/components/StreakSaver.vue";
import UserMenu from "@/components/layout/UserMenu.vue";
import { canAccessLevel } from "@/types/plan/access";
import type { ExperienceLevel } from "@/types/plan/access";

const { t } = useI18n();
const router = useRouter();
const planStore = usePlanStore();
const authStore = useAuthStore();
const preferencesStore = usePreferencesStore();
const { fetchStreak, fetchCoins } = useStreak();

const selectedLevel = ref<ExperienceLevel | null>(null);
const showStreakModal = ref(false);
const showCoinsModal = ref(false);

// Fetch gamification data on mount
onMounted(async () => {
    if (authStore.isAuthenticated) {
        await Promise.all([
            fetchStreak(),
            fetchCoins(),
        ]);
    }

    // Pre-select last difficulty if available
    const lastDifficulty = preferencesStore.lastDifficulty;
    if (lastDifficulty) {
        const difficultyToLevelMap: Record<'easy' | 'medium' | 'hard', ExperienceLevel> = {
            easy: 'junior',
            medium: 'intermediate',
            hard: 'senior',
        };
        selectedLevel.value = difficultyToLevelMap[lastDifficulty];
    }
});

const locale = computed(() => (router.currentRoute.value.params.locale as string) || "en");

const canUserAccessLevel = (level: ExperienceLevel): boolean => {
    return canAccessLevel(planStore.planTier, level);
};

const handlelevelclick = async (level: ExperienceLevel) => {
    const canAccess = canUserAccessLevel(level);

    // If user can't access, redirect to pricing page
    if (!canAccess) {
        await router.push(`/${locale.value}/pricing`);
        return;
    }

    // If user can access, proceed with level selection
    await selectLevel(level);
};

const selectLevel = async (level: ExperienceLevel) => {
    selectedLevel.value = level;

    // Map level to difficulty
    const levelToDifficultyMap: Record<ExperienceLevel, 'easy' | 'medium' | 'hard'> = {
        junior: 'easy',
        intermediate: 'medium',
        senior: 'hard',
    };

    const difficulty = levelToDifficultyMap[level];

    // Save difficulty preference
    preferencesStore.setLastDifficulty(difficulty);

    // Navigate to mode chooser
    await router.push(`/${locale.value}/${difficulty}/choose`);
};

const getLevelCardClass = (level: ExperienceLevel) => {
    const isSelected = selectedLevel.value === level;
    const canAccess = canUserAccessLevel(level);

    const baseClass = "group relative overflow-hidden rounded-3xl border-2 p-8 text-left transition-all duration-500 transform cursor-pointer";

    if (!canAccess && authStore.isAuthenticated) {
        // Locked but clickable - shows it's interactive and will upgrade
        return `${baseClass}

 border-gray-300 bg-gradient-to-br from-gray-50 to-gray-100 opacity-90 hover:opacity-100; hover:border-purple-400; hover:shadow-xl; hover:scale-[1.01]; dark:border-gray-600; dark:from-gray-800/50; dark:to-gray-800/70; dark:hover:border-purple-500 backdrop-blur-sm`
    }

    if (isSelected) {
        return `${baseClass} scale-[1.02] border-transparent bg-gradient-to-br from-blue-500 via-purple-500 to-purple-600 text-white shadow-2xl shadow-purple-500/30 ring-4 ring-purple-500/20`;
    }

    return `${baseClass}

 border-gray-200 bg-white/80 backdrop-blur-sm hover:border-purple-400; hover:shadow-2xl; hover:scale-[1.02]; hover:-translate-y-1; dark:border-gray-700; dark:bg-gray-800/80; dark:hover:border-purple-500`;;

const getleveldescriptionclass = (level: ExperienceLevel) => {
    const isSelected = selectedLevel.value === level;
    const canAccess = canUserAccessLevel(level);

    if (isSelected && canAccess) {
        return "text-base text-white/90 leading-relaxed";
    }

    return "text-base text-gray-600 dark:text-gray-400 leading-relaxed";
};

const getleveliconclass = (level: ExperienceLevel) => {
    const isSelected = selectedLevel.value === level;
    const canAccess = canUserAccessLevel(level);

    const baseClass = "flex h-16 w-16 items-center justify-center rounded-2xl transition-all duration-300";

    if (isSelected && canAccess) {
        return `${baseClass} bg-white/20 text-white shadow-lg backdrop-blur-sm`;
    }

    const colorMap: Record<ExperienceLevel, string> = {
        junior: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400',
        intermediate: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400',
        senior: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400',
    };

    return `${baseClass} ${colorMap[level]}

 group-hover:scale-110; group-hover:shadow-lg`
};

const gotolearningpaths = () => {
    router.push(`/${locale.value}/paths`);
};
}
</script>
