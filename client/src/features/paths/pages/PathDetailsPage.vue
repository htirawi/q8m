<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <div class="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <!-- Loading State -->
      <div v-if="store.loading" class="flex justify-center py-12">
        <div class="h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent"></div>
      </div>

      <!-- Path Details -->
      <div v-else-if="store.currentPath" class="space-y-6">
        <!-- Header -->
        <div class="rounded-lg bg-white p-6 shadow-sm dark:bg-gray-800">
          <div class="mb-4 flex items-start justify-between">
            <div>
              <h1 class="text-3xl font-bold text-gray-900 dark:text-white">
                {{ currentTitle }}
              </h1>
              <p class="mt-2 text-gray-600 dark:text-gray-300">
                {{ currentDescription }}
              </p>
            </div>
            <span
              v-if="store.currentPath.isPremium"
              class="rounded-full bg-yellow-100 px-3 py-1 text-sm font-medium text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200"
            >
              Premium
            </span>
          </div>

          <!-- Stats -->
          <div class="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
            <div class="flex items-center gap-1">
              <span>📚</span>
              <span>{{ store.currentPath.totalQuestions }} Questions</span>
            </div>
            <div class="flex items-center gap-1">
              <span>⏱️</span>
              <span>{{ store.currentPath.estimatedHours }} Hours</span>
            </div>
            <div class="flex items-center gap-1">
              <span>📊</span>
              <span class="capitalize">{{ store.currentPath.difficulty }}</span>
            </div>
            <div class="flex items-center gap-1">
              <span>👥</span>
              <span>{{ store.currentPath.enrollmentCount }} Enrolled</span>
            </div>
          </div>

          <!-- Enroll Button -->
          <div class="mt-6">
            <button
              v-if="!store.isEnrolledInCurrentPath"
              type="button"
              class="w-full rounded-lg bg-primary-600 px-6 py-3 font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
              @click="enrollInPath"
            >
              Enroll Now
            </button>
            <div v-else class="space-y-3">
              <div class="rounded-lg bg-green-100 p-3 dark:bg-green-900/30">
                <p class="text-center text-sm font-medium text-green-800 dark:text-green-200">
                  You are enrolled • {{ store.currentPathProgress }}% Complete
                </p>
              </div>
              <button
                type="button"
                class="w-full rounded-lg bg-primary-600 px-6 py-3 font-medium text-white hover:bg-primary-700"
                @click="continueLearning"
              >
                Continue Learning
              </button>
            </div>
          </div>
        </div>

        <!-- Modules -->
        <div class="rounded-lg bg-white p-6 shadow-sm dark:bg-gray-800">
          <h2 class="mb-4 text-xl font-bold text-gray-900 dark:text-white">
            Learning Modules
          </h2>
          <ModuleList
            :modules="store.currentPath.modules"
            :module-progress="store.currentEnrollment?.moduleProgress || []"
            :is-enrolled="store.isEnrolledInCurrentPath"
          />
        </div>
      </div>

      <!-- Error State -->
      <div v-else class="text-center py-12">
        <p class="text-gray-600 dark:text-gray-400">Learning path not found</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useLearningPathsStore } from '@/stores/learning-paths';
import { useAuthStore } from '@/stores/auth';
import ModuleList from '../components/ModuleList.vue';

const router = useRouter();
const route = useRoute();
const store = useLearningPathsStore();
const authStore = useAuthStore();

const currentTitle = computed(() => {
  const locale = route.params.locale as string || 'en';
  return store.currentPath?.title[locale === 'ar' ? 'ar' : 'en'] || '';
});

const currentDescription = computed(() => {
  const locale = route.params.locale as string || 'en';
  return store.currentPath?.description[locale === 'ar' ? 'ar' : 'en'] || '';
});

const enrollInPath = async () => {
  if (!authStore.isAuthenticated) {
    const locale = route.params.locale || 'en';
    router.push(`/${locale}/login`);
    return;
  }

  if (store.currentPath) {
    const success = await store.enrollInPath(store.currentPath._id);
    if (success) {
      // Refresh path details to get enrollment
      await store.fetchPathBySlug(route.params.slug as string);
    }
  }
};

const continueLearning = () => {
  const locale = route.params.locale || 'en';
  router.push(`/${locale}/paths/${route.params.slug}/learn`);
};

onMounted(async () => {
  const slug = route.params.slug as string;
  await store.fetchPathBySlug(slug);
});
</script>
