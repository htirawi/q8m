<template>
  <div class="relative min-h-screen overflow-hidden bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
    <!-- Animated Background Blobs -->
    <div class="pointer-events-none absolute inset-0 overflow-hidden">
      <div class="absolute -left-4 top-20 h-72 w-72 animate-blob rounded-full bg-blue-300 opacity-20 mix-blend-multiply blur-xl filter dark:bg-blue-600 dark:opacity-10"></div>
      <div class="animation-delay-2000 absolute right-4 top-40 h-72 w-72 animate-blob rounded-full bg-purple-300 opacity-20 mix-blend-multiply blur-xl filter dark:bg-purple-600 dark:opacity-10"></div>
      <div class="animation-delay-4000 absolute -bottom-8 left-1/3 h-72 w-72 animate-blob rounded-full bg-pink-300 opacity-20 mix-blend-multiply blur-xl filter dark:bg-pink-600 dark:opacity-10"></div>
    </div>

    <div class="relative mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-12">
      <!-- Back Button -->
      <div class="mb-8 animate-fade-in-up">
        <button
          type="button"
          class="group inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white/80 px-4 py-2.5 text-sm font-medium text-gray-700 backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:border-purple-300 hover:bg-white hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-purple-500 focus:ring-offset-2 dark:border-gray-700 dark:bg-gray-800/80 dark:text-gray-300 dark:hover:border-purple-600 dark:hover:bg-gray-800 dark:focus:ring-purple-400"
          aria-label="Go back to mode selection"
          @click="goBack"
        >
          <svg class="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Modes
        </button>
      </div>

      <!-- Header Section -->
      <div class="animation-delay-200 mb-12 animate-fade-in-up text-center">
        <!-- Main Title -->
        <div class="mb-6">
          <h1 class="mb-3 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-3xl font-extrabold leading-tight text-transparent dark:from-blue-400 dark:via-purple-400 dark:to-pink-400 sm:text-4xl md:text-5xl md:leading-tight lg:text-6xl" role="heading" aria-level="1">
            Choose Your Framework
          </h1>
          <p class="mx-auto max-w-2xl px-2 text-sm leading-relaxed text-gray-600 dark:text-gray-300 sm:px-0 sm:text-base md:text-lg" role="status" aria-live="polite">
            Master
            <span class="font-bold text-purple-600 dark:text-purple-400">{{ totalQuestions > 0 ? totalQuestions + '+' : '' }}</span>
            {{ getDifficultyLabel(difficulty) }} questions across top JavaScript frameworks
          </p>
        </div>

        <!-- Difficulty IBadge -->
        <div class="mb-8 flex justify-center">
          <div
            class="inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-semibold shadow-lg backdrop-blur-sm transition-all duration-300 hover:scale-105"
            :class="getDifficultyBadgeClass(difficulty)"
          >
            <span class="text-lg">{{ getDifficultyIcon(difficulty) }}</span>
            <span>{{ getDifficultyLabel(difficulty) }} Level</span>
          </div>
        </div>

        <!-- Feature Pills -->
        <div class="flex flex-wrap items-center justify-center gap-2 px-2 sm:gap-3 sm:px-0">
          <div class="flex items-center gap-1.5 rounded-full border border-green-200 bg-green-50/80 px-3 py-1.5 text-xs font-medium text-green-700 backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:shadow-md dark:border-green-800 dark:bg-green-900/20 dark:text-green-300 sm:gap-2 sm:px-4 sm:py-2 sm:text-sm">
            <svg class="h-3.5 w-3.5 flex-shrink-0 sm:h-4 sm:w-4" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
            </svg>
            <span class="whitespace-nowrap">Self-Paced</span>
          </div>
          <div class="flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50/80 px-3 py-1.5 text-xs font-medium text-blue-700 backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:shadow-md dark:border-blue-800 dark:bg-blue-900/20 dark:text-blue-300 sm:gap-2 sm:px-4 sm:py-2 sm:text-sm">
            <svg class="h-3.5 w-3.5 flex-shrink-0 sm:h-4 sm:w-4" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
              <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
            </svg>
            <span class="whitespace-nowrap">Progress</span>
          </div>
          <div class="flex items-center gap-1.5 rounded-full border border-purple-200 bg-purple-50/80 px-3 py-1.5 text-xs font-medium text-purple-700 backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:shadow-md dark:border-purple-800 dark:bg-purple-900/20 dark:text-purple-300 sm:gap-2 sm:px-4 sm:py-2 sm:text-sm">
            <svg class="h-3.5 w-3.5 flex-shrink-0 sm:h-4 sm:w-4" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
              <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
            </svg>
            <span class="whitespace-nowrap">Bookmarks</span>
          </div>
          <div class="flex items-center gap-1.5 rounded-full border border-orange-200 bg-orange-50/80 px-3 py-1.5 text-xs font-medium text-orange-700 backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:shadow-md dark:border-orange-800 dark:bg-orange-900/20 dark:text-orange-300 sm:gap-2 sm:px-4 sm:py-2 sm:text-sm">
            <svg class="h-3.5 w-3.5 flex-shrink-0 sm:h-4 sm:w-4" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
              <path fill-rule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clip-rule="evenodd" />
            </svg>
            <span class="whitespace-nowrap">Instant Answers</span>
          </div>
        </div>
      </div>

      <!-- Loading State with Skeleton -->
      <div v-if="isLoading" class="animation-delay-400 animate-fade-in-up">
        <div class="mb-6 text-center">
          <p class="text-sm font-medium text-gray-500 dark:text-gray-400">
            Loading frameworks...
          </p>
        </div>

        <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          <!-- Skeleton Cards -->
          <div v-for="i in 5" :key="i" class="animate-pulse">
            <div class="flex h-full flex-col rounded-2xl border-2 border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
              <!-- Icon Skeleton -->
              <div class="mb-4 flex justify-center">
                <div class="h-20 w-20 rounded-2xl bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600"></div>
              </div>

              <!-- Title Skeleton -->
              <div class="mb-3 flex justify-center">
                <div class="h-7 w-24 rounded-lg bg-gray-200 dark:bg-gray-700"></div>
              </div>

              <!-- Count Skeleton -->
              <div class="mb-4 flex flex-col items-center gap-2">
                <div class="h-9 w-16 rounded-lg bg-gray-200 dark:bg-gray-700"></div>
                <div class="h-4 w-32 rounded-md bg-gray-100 dark:bg-gray-800"></div>
              </div>

              <!-- Button Skeleton -->
              <div class="mt-auto flex justify-center">
                <div class="h-12 w-40 rounded-xl bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Framework Cards Grid -->
      <div v-else class="animation-delay-400 animate-fade-in-up">
        <div class="mb-6 text-center">
          <p class="text-sm font-medium text-gray-500 dark:text-gray-400">
            Select a framework to begin your learning journey
          </p>
        </div>

        <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5" role="region" aria-label="Framework selection cards">
          <!-- Dynamic Framework Cards from Database -->
          <FrameworkCard
            v-for="rule in frameworkAccessRules"
            :key="rule.framework"
            :framework="rule.framework"
            :count="frameworkCounts[rule.framework as keyof typeof frameworkCounts] || 0"
            :icon="rule.metadata.icon"
            :title="rule.displayName"
            :color="rule.metadata.color as 'red' | 'black' | 'blue' | 'purple' | 'gray' | 'gradient'"
            :difficulty="difficulty"
            :is-locked="rule.isLocked"
            :required-plan="rule.requiredPlanTier"
            @select="selectFramework"
          />
        </div>
      </div>

      <!-- Help Text -->
      <div class="animation-delay-600 mt-8 animate-fade-in-up text-center sm:mt-12">
        <div class="mx-auto max-w-2xl rounded-2xl border border-gray-200 bg-white/60 p-4 backdrop-blur-sm dark:border-gray-700 dark:bg-gray-800/60 sm:p-6">
          <div class="mb-2 flex justify-center sm:mb-3">
            <div class="rounded-full bg-blue-100 p-2.5 dark:bg-blue-900/30 sm:p-3">
              <svg class="h-5 w-5 text-blue-600 dark:text-blue-400 sm:h-6 sm:w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <h3 class="mb-1.5 text-base font-semibold text-gray-900 dark:text-white sm:mb-2 sm:text-lg">
            Not sure which framework to choose?
          </h3>
          <p class="text-xs text-gray-600 dark:text-gray-400 sm:text-sm">
            Select <span class="font-semibold text-purple-600 dark:text-purple-400">Random Mix</span> to practice questions from all frameworks. You can switch anytime!
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { IFrameworkAccessRule } from "@/types/components/pages";
import { ref, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAnalytics } from '@/composables/useAnalytics';
import { useAuthStore } from '@/stores/auth';
import FrameworkCard from '@/components/study/FrameworkCard.vue';
import type { DifficultyLevel } from '@/types/plan/access';

const router = useRouter();
const route = useRoute();
const { track } = useAnalytics();
const authStore = useAuthStore();

const difficulty = computed(() => route.params.difficulty as DifficultyLevel);
const locale = computed(() => (route.params.locale as string) || 'en');

const isLoading = ref(true);

// Framework question counts (fetched from API)
const frameworkCounts = ref({
  angular: 0,
  nextjs: 0,
  react: 0,
  redux: 0,
  vue: 0,
  random: 0,
});

// Framework access rules from database
const frameworkAccessRules = ref<IFrameworkAccessRule[]>([]);

// Fallback frameworks if database is empty or API fails
const getFallbackFrameworks = (): IFrameworkAccessRule[] => {
  const userPlan = authStore.user?.subscription?.plan?.tier || 'free';

  const defaultFrameworks = [
    {
      framework: 'angular',
      displayName: 'Angular',
      description: 'Requires Intermediate plan or higher',
      requiredPlanTier: 'Intermediate',
      isLocked: userPlan === 'free',
      metadata: { icon: '🅰️', color: 'red', order: 1 },
    },
    {
      framework: 'nextjs',
      displayName: 'Next.js',
      description: 'Requires Advanced plan or higher',
      requiredPlanTier: 'Advanced',
      isLocked: userPlan === 'free' || userPlan === 'intermediate',
      metadata: { icon: '▲', color: 'black', order: 2 },
    },
    {
      framework: 'react',
      displayName: 'React',
      description: 'Available to all users',
      requiredPlanTier: 'Free',
      isLocked: false,
      metadata: { icon: '⚛️', color: 'blue', order: 3 },
    },
    {
      framework: 'redux',
      displayName: 'Redux',
      description: 'Requires Advanced plan or higher',
      requiredPlanTier: 'Advanced',
      isLocked: userPlan === 'free' || userPlan === 'intermediate',
      metadata: { icon: '🔄', color: 'purple', order: 4 },
    },
    {
      framework: 'vue',
      displayName: 'Vue',
      description: 'Requires Pro plan',
      requiredPlanTier: 'Pro',
      isLocked: userPlan !== 'pro',
      metadata: { icon: '💚', color: 'gray', order: 5 },
    },
    {
      framework: 'random',
      displayName: 'Random Mix',
      description: 'Available to all users',
      requiredPlanTier: 'Free',
      isLocked: false,
      metadata: { icon: '🎲', color: 'gradient', order: 6 },
    },
  ];

  return defaultFrameworks as IFrameworkAccessRule[];
};

const totalQuestions = computed(() => {
  return Object.values(frameworkCounts.value).reduce((sum, count) => sum + count, 0);
});

const getDifficultyLabel = (diff: DifficultyLevel) => {
  const labels = {
    easy: 'Junior',
    medium: 'Intermediate',
    hard: 'Senior',
  };
  return labels[diff] || 'Junior';
};

const getDifficultyIcon = (diff: DifficultyLevel) => {
  const icons = { easy: '🟢', medium: '🟡', hard: '🔴' };
  return icons[diff] || '🟢';
};

const getDifficultyBadgeClass = (diff: DifficultyLevel) => {
  const classes = {
    easy: 'bg-green-100 text-green-800 border border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800',
    medium: 'bg-yellow-100 text-yellow-800 border border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-800',
    hard: 'bg-red-100 text-red-800 border border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800',
  };
  return classes[diff] || classes.easy;
};

const selectFramework = (framework: string) => {
  track('framework_selected', {
    framework,
    difficulty: difficulty.value,
    source: 'framework_selection_page',
    totalQuestionsAvailable: frameworkCounts.value[framework as keyof typeof frameworkCounts.value],
  });

  // Navigate to study mode with framework
  router.push(`/${locale.value}/study/${difficulty.value}/${framework}`);
};

const goBack = () => {
  track('back_to_mode_chooser', {
    from: 'framework_selection',
    difficulty: difficulty.value,
  });

  // Go back to mode chooser
  router.push(`/${locale.value}/${difficulty.value}/choose`);
};

onMounted(async () => {
  // Check authentication first
  if (!authStore.isAuthenticated) {
    // Redirect to login with return URL
    const returnUrl = `/${locale.value}/study/${difficulty.value}`;
    track('auth_required', {
      source: 'framework_selection_page',
      redirectTo: 'login',
    });
    router.push(`/${locale.value}/login?redirect=${encodeURIComponent(returnUrl)}`);
    return;
  }

  // Track page view
  track('framework_selection_viewed', {
    difficulty: difficulty.value,
    totalFrameworks: Object.keys(frameworkCounts.value).length,
  });

  try {
    isLoading.value = true;

    // Fetch framework access rules and counts in parallel
    const [accessResponse, countsResponse] = await Promise.all([
      fetch('/api/v1/questions/framework-access', {
        credentials: 'include',
      }),
      fetch(`/api/v1/questions/framework-counts?difficulty=${difficulty.value}`, {
        credentials: 'include',
      }),
    ]);

    // Process framework access rules
    if (accessResponse.ok) {
      const accessData = await accessResponse.json();
      if (accessData.frameworks && accessData.frameworks.length > 0) {
        frameworkAccessRules.value = accessData.frameworks;
      } else {
        console.warn('No framework access rules found, using fallback');
        // Fallback to default frameworks if database is empty
        frameworkAccessRules.value = getFallbackFrameworks();
      }
    } else if (accessResponse.status === 401) {
      // Unauthorized - redirect to login
      const returnUrl = `/${locale.value}/study/${difficulty.value}`;
      router.push(`/${locale.value}/login?redirect=${encodeURIComponent(returnUrl)}`);
      return;
    } else {
      console.error('Failed to fetch framework access rules:', accessResponse.statusText);
      // Use fallback frameworks on API error
      frameworkAccessRules.value = getFallbackFrameworks();
    }

    // Process framework counts
    if (countsResponse.ok) {
      const countsData = await countsResponse.json();
      if (countsData.counts) {
        frameworkCounts.value = {
          angular: countsData.counts.angular || 0,
          nextjs: countsData.counts.nextjs || 0,
          react: countsData.counts.react || 0,
          redux: countsData.counts.redux || 0,
          vue: countsData.counts.vue || 0,
          random: countsData.counts.random || 0,
        };
      }
    } else {
      console.error('Failed to fetch framework counts:', countsResponse.statusText);
    }
  } catch (error) {
    console.error('Failed to fetch framework data:', error);
    // Use fallback on any error
    frameworkAccessRules.value = getFallbackFrameworks();
  } finally {
    isLoading.value = false;
  }
});
</script>
