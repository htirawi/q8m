<template>
    <div
        class="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            <!-- Header -->
            <div class="mb-12 text-center">
                <h1 class="mb-4 text-4xl font-bold text-gray-900 dark:text-white md:text-5xl">
                    {{ t('levelSelection.title') }}
                </h1>
                <p class="text-lg text-gray-600 dark:text-gray-400 md:text-xl">
                    {{ t('levelSelection.subtitle') }}
                </p>
            </div>

            <!-- Level Selection -->
            <div class="mb-12">
                <h2 class="mb-8 text-center text-2xl font-bold text-gray-900 dark:text-white">
                    {{ t('levelSelection.chooseLevel') }}
                </h2>
                <div class="grid grid-cols-1 gap-6 md:grid-cols-3">
                    <!-- Junior -->
                    <button type="button" :disabled="!canUserAccessLevel('junior')" :class="getLevelCardClass('junior')"
                        @click="selectLevel('junior')">
                        <div class="relative z-10">
                            <div class="mb-4 flex items-center gap-3">
                                <span class="text-3xl">🟢</span>
                                <h3 class="text-xl font-bold">{{ t('level.junior.label') }}</h3>
                            </div>
                            <p :class="getLevelDescriptionClass('junior')">
                                {{ t('level.junior.description') }}
                            </p>
                            <div class="mt-4">
                                <span v-if="canUserAccessLevel('junior')"
                                    class="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900 dark:text-green-200">
                                    {{ t('plans.access.available') }}
                                </span>
                                <LockedBadge v-else required-plan="free" />
                            </div>
                        </div>
                        <div v-if="selectedLevel === 'junior' && canUserAccessLevel('junior')"
                            class="absolute right-4 top-4">
                            <div class="flex h-8 w-8 items-center justify-center rounded-full bg-white/20">
                                <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                                    <path fill-rule="evenodd"
                                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                        clip-rule="evenodd" />
                                </svg>
                            </div>
                        </div>
                    </button>

                    <!-- Intermediate -->
                    <button type="button" :disabled="!canUserAccessLevel('intermediate')"
                        :class="getLevelCardClass('intermediate')" @click="selectLevel('intermediate')">
                        <div class="relative z-10">
                            <div class="mb-4 flex items-center gap-3">
                                <span class="text-3xl">🟡</span>
                                <h3 class="text-xl font-bold">{{ t('level.intermediate.label') }}</h3>
                            </div>
                            <p :class="getLevelDescriptionClass('intermediate')">
                                {{ t('level.intermediate.description') }}
                            </p>
                            <div class="mt-4">
                                <span v-if="canUserAccessLevel('intermediate')"
                                    class="inline-flex items-center rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                                    {{ t('plans.access.available') }}
                                </span>
                                <LockedBadge v-else required-plan="intermediate" />
                            </div>
                        </div>
                        <div v-if="selectedLevel === 'intermediate' && canUserAccessLevel('intermediate')"
                            class="absolute right-4 top-4">
                            <div class="flex h-8 w-8 items-center justify-center rounded-full bg-white/20">
                                <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                                    <path fill-rule="evenodd"
                                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                        clip-rule="evenodd" />
                                </svg>
                            </div>
                        </div>
                    </button>

                    <!-- Senior -->
                    <button type="button" :disabled="!canUserAccessLevel('senior')" :class="getLevelCardClass('senior')"
                        @click="selectLevel('senior')">
                        <div class="relative z-10">
                            <div class="mb-4 flex items-center gap-3">
                                <span class="text-3xl">🔴</span>
                                <h3 class="text-xl font-bold">{{ t('level.senior.label') }}</h3>
                            </div>
                            <p :class="getLevelDescriptionClass('senior')">
                                {{ t('level.senior.description') }}
                            </p>
                            <div class="mt-4">
                                <span v-if="canUserAccessLevel('senior')"
                                    class="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800 dark:bg-red-900 dark:text-red-200">
                                    {{ t('plans.access.available') }}
                                </span>
                                <LockedBadge v-else required-plan="advanced" />
                            </div>
                        </div>
                        <div v-if="selectedLevel === 'senior' && canUserAccessLevel('senior')"
                            class="absolute right-4 top-4">
                            <div class="flex h-8 w-8 items-center justify-center rounded-full bg-white/20">
                                <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                                    <path fill-rule="evenodd"
                                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                        clip-rule="evenodd" />
                                </svg>
                            </div>
                        </div>
                    </button>
                </div>
            </div>

            <!-- Mode Selection (shown when level is selected) -->
            <div v-if="selectedLevel && canUserAccessLevel(selectedLevel)" class="mx-auto max-w-4xl">
                <h2 class="mb-6 text-center text-2xl font-bold text-gray-900 dark:text-white">
                    {{ t('levelSelection.chooseMode') }}
                </h2>
                <div class="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <!-- Study Mode -->
                    <button type="button"
                        class="group relative overflow-hidden rounded-2xl border-2 border-blue-200 bg-white p-8 text-left transition-all duration-300 hover:scale-105 hover:border-blue-500 hover:shadow-2xl dark:border-blue-800 dark:bg-gray-800 dark:hover:border-blue-600"
                        @click="startMode('study')">
                        <div class="mb-4 text-5xl">📚</div>
                        <h3 class="mb-3 text-2xl font-bold text-gray-900 dark:text-white">
                            {{ t('levelSelection.studyMode.title') }}
                        </h3>
                        <p class="mb-4 text-gray-600 dark:text-gray-400">
                            {{ t('levelSelection.studyMode.description') }}
                        </p>
                        <ul class="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                            <li class="flex items-center gap-2">
                                <svg class="h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                    <path fill-rule="evenodd"
                                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                        clip-rule="evenodd" />
                                </svg>
                                {{ t('levelSelection.studyMode.feature1') }}
                            </li>
                            <li class="flex items-center gap-2">
                                <svg class="h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                    <path fill-rule="evenodd"
                                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                        clip-rule="evenodd" />
                                </svg>
                                {{ t('levelSelection.studyMode.feature2') }}
                            </li>
                            <li class="flex items-center gap-2">
                                <svg class="h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                    <path fill-rule="evenodd"
                                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                        clip-rule="evenodd" />
                                </svg>
                                {{ t('levelSelection.studyMode.feature3') }}
                            </li>
                        </ul>
                    </button>

                    <!-- Quiz Mode -->
                    <button type="button"
                        class="group relative overflow-hidden rounded-2xl border-2 border-purple-200 bg-white p-8 text-left transition-all duration-300 hover:scale-105 hover:border-purple-500 hover:shadow-2xl dark:border-purple-800 dark:bg-gray-800 dark:hover:border-purple-600"
                        @click="startMode('quiz')">
                        <div class="mb-4 text-5xl">🎯</div>
                        <h3 class="mb-3 text-2xl font-bold text-gray-900 dark:text-white">
                            {{ t('levelSelection.quizMode.title') }}
                        </h3>
                        <p class="mb-4 text-gray-600 dark:text-gray-400">
                            {{ t('levelSelection.quizMode.description') }}
                        </p>
                        <ul class="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                            <li class="flex items-center gap-2">
                                <svg class="h-5 w-5 text-purple-500" fill="currentColor" viewBox="0 0 20 20">
                                    <path fill-rule="evenodd"
                                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                        clip-rule="evenodd" />
                                </svg>
                                {{ t('levelSelection.quizMode.feature1') }}
                            </li>
                            <li class="flex items-center gap-2">
                                <svg class="h-5 w-5 text-purple-500" fill="currentColor" viewBox="0 0 20 20">
                                    <path fill-rule="evenodd"
                                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                        clip-rule="evenodd" />
                                </svg>
                                {{ t('levelSelection.quizMode.feature2') }}
                            </li>
                            <li class="flex items-center gap-2">
                                <svg class="h-5 w-5 text-purple-500" fill="currentColor" viewBox="0 0 20 20">
                                    <path fill-rule="evenodd"
                                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                        clip-rule="evenodd" />
                                </svg>
                                {{ t('levelSelection.quizMode.feature3') }}
                            </li>
                        </ul>
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";
import { usePlanStore } from "@/stores/plan";
import { useAuthStore } from "@/stores/auth";
import LockedBadge from "@/components/paywall/LockedBadge.vue";
import { canAccessLevel } from "@/types/plan/access";
import type { ExperienceLevel } from "@/types/plan/access";

const { t } = useI18n();
const router = useRouter();
const planStore = usePlanStore();
const authStore = useAuthStore();

const selectedLevel = ref<ExperienceLevel | null>(null);

const locale = computed(() => (router.currentRoute.value.params.locale as string) || "en");

const canUserAccessLevel = (level: ExperienceLevel): boolean => {
    return canAccessLevel(planStore.planTier, level);
};

const selectLevel = (level: ExperienceLevel) => {
    if (canUserAccessLevel(level) || !authStore.isAuthenticated) {
        selectedLevel.value = level;
    }
};

const getLevelCardClass = (level: ExperienceLevel) => {
    const isSelected = selectedLevel.value === level;
    const canAccess = canUserAccessLevel(level);

    const baseClass = "group relative overflow-hidden rounded-2xl border-2 p-6 text-left transition-all duration-300";

    if (!canAccess && authStore.isAuthenticated) {
        return `${baseClass} cursor-not-allowed opacity-60 border-gray-300 bg-gray-100 dark:border-gray-600 dark:bg-gray-700`;
    }

    if (isSelected) {
        return `${baseClass} scale-105 border-blue-500 bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-2xl`;
    }

    return `${baseClass} cursor-pointer border-gray-200 bg-white hover:border-blue-400 hover:shadow-xl dark:border-gray-700 dark:bg-gray-800 dark:hover:border-blue-600`;
};

const getLevelDescriptionClass = (level: ExperienceLevel) => {
    const isSelected = selectedLevel.value === level;
    const canAccess = canUserAccessLevel(level);

    if (isSelected && canAccess) {
        return "text-sm text-white/90";
    }

    return "text-sm text-gray-600 dark:text-gray-400";
};

const startMode = async (mode: 'study' | 'quiz') => {
    if (!selectedLevel.value) {
        return;
    }

    // Map level to difficulty for study mode or keep level for quiz mode
    const levelToDifficultyMap: Record<ExperienceLevel, 'easy' | 'medium' | 'hard'> = {
        junior: 'easy',
        intermediate: 'medium',
        senior: 'hard',
    };

    if (mode === 'study') {
        const difficulty = levelToDifficultyMap[selectedLevel.value];
        await router.push(`/${locale.value}/study/${difficulty}`);
    } else {
        await router.push(`/${locale.value}/quiz/${selectedLevel.value}`);
    }
};
</script>
