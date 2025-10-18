<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <div class="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <!-- Loading State -->
      <div v-if="store.loading" class="flex justify-center py-12">
        <div
          class="h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent"
        ></div>
      </div>

      <!-- Learning Interface -->
      <div v-else-if="store.currentPath && store.currentEnrollment" class="space-y-6">
        <!-- Header with Progress -->
        <div class="rounded-lg bg-white p-6 shadow-sm dark:bg-gray-800">
          <div class="mb-4">
            <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
              {{ currentTitle }}
            </h1>
            <p class="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Module {{ currentModuleNumber }} of {{ store.currentPath.modules?.length ?? 0 }}
            </p>
          </div>

          <!-- Progress Bar -->
          <div class="space-y-2">
            <div class="flex justify-between text-sm text-gray-600 dark:text-gray-400">
              <span>Overall Progress</span>
              <span>{{ store.currentEnrollment?.progress }}%</span>
            </div>
            <div class="h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
              <div
                class="h-full bg-primary-600 transition-all duration-300"
                :style="{ width: `${store.currentEnrollment.progress}%` }"
              ></div>
            </div>
          </div>
        </div>

        <!-- Current Module -->
        <div v-if="currentModule" class="rounded-lg bg-white p-6 shadow-sm dark:bg-gray-800">
          <h2 class="mb-2 text-xl font-bold text-gray-900 dark:text-white">
            {{ currentModuleTitle }}
          </h2>
          <p class="mb-6 text-gray-600 dark:text-gray-300">
            {{ currentModuleDescription }}
          </p>

          <div class="mb-6 flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
            <span
              >⏱️ {{ currentModule.estimatedMinutes }}

              minutes</span
            >
            <span
              >📝 {{ currentModuleProgress?.totalQuestions || 0 }}

              questions</span
            >
          </div>

          <!-- Actions -->
          <div class="flex gap-3">
            <button
              type="button"
              class="flex-1 rounded-lg bg-primary-600 px-6 py-3 font-medium text-white hover:bg-primary-700"
              @click="startModule"
            >
              {{ currentModuleProgress?.isCompleted ? "Review Module" : "Start Module" }}
            </button>
            <button
              v-if="currentModuleProgress?.isCompleted"
              type="button"
              class="rounded-lg border border-gray-300 px-6 py-3 font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
              @click="nextModule"
            >
              Next Module
            </button>
          </div>
        </div>

        <!-- Module List -->
        <div class="rounded-lg bg-white p-6 shadow-sm dark:bg-gray-800">
          <h3 class="mb-4 font-semibold text-gray-900 dark:text-white">All Modules</h3>
          <ModuleList
            :modules="store.currentPath.modules"
            :module-progress="store.currentEnrollment.moduleProgress"
            :is-enrolled="true"
            :current-module-id="store.currentEnrollment.currentModuleId"
            @module-click="selectModule"
          />
        </div>

        <!-- Certificate Section -->
        <div
          v-if="store.currentEnrollment.certificateIssued"
          class="rounded-lg bg-gradient-to-r from-yellow-400 to-orange-500 p-6 text-white shadow-sm"
        >
          <div class="flex items-center justify-between">
            <div>
              <h3 class="text-xl font-bold">Congratulations!</h3>
              <p class="mt-1">You've completed this learning path</p>
            </div>
            <button
              type="button"
              class="rounded-lg bg-white px-6 py-3 font-medium text-orange-600 hover:bg-gray-100"
              @click="viewCertificate"
            >
              View Certificate
            </button>
          </div>
        </div>
      </div>

      <!-- Not Enrolled State -->
      <div v-else class="py-12 text-center">
        <p class="mb-4 text-gray-600 dark:text-gray-400">You are not enrolled in this path</p>
        <button
          type="button"
          class="rounded-lg bg-primary-600 px-6 py-3 font-medium text-white hover:bg-primary-700"
          @click="goBack"
        >
          View Path Details
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useLearningPathsStore } from "../../../stores/learning-paths";
import ModuleList from "../components/ModuleList.vue";
import type { IModule } from "@shared/types/learning-paths";

const router = useRouter();
const route = useRoute();
const store = useLearningPathsStore();

const currentModule = ref<IModule | null>(null);

const currentTitle = computed(() => {
  const locale = (route.params.locale as string) || "en";
  return store.currentPath?.title[locale === "ar" ? "ar" : "en"] || "";
});

const currentModuleNumber = computed(() => {
  if (!currentModule.value || !store.currentPath) return 0;
  return currentModule.value.order;
});

const currentModuleTitle = computed(() => {
  const locale = (route.params.locale as string) || "en";
  return currentModule.value?.title[locale === "ar" ? "ar" : "en"] || "";
});

const currentModuleDescription = computed(() => {
  const locale = (route.params.locale as string) || "en";
  return currentModule.value?.description[locale === "ar" ? "ar" : "en"] || "";
});

const currentModuleProgress = computed(() => {
  if (!currentModule.value || !store.currentEnrollment) return null;
  return store.currentEnrollment.moduleProgress.find(
    (mp) => mp.moduleId === currentModule.value!.moduleId
  );
});

const selectModule = (moduleId: string) => {
  if (!store.currentPath) return;
  currentModule.value = store.currentPath.modules.find((m) => m.moduleId === moduleId) || null;
};

const nextModule = () => {
  if (!store.currentPath || !currentModule.value) return;
  const currentIndex = store.currentPath.modules.findIndex(
    (m) => m.moduleId === currentModule.value!.moduleId
  );
  if (currentIndex < store.currentPath.modules.length - 1) {
    currentModule.value = store.currentPath.modules[currentIndex + 1] || null;
  }
};

const startModule = () => {
  // Navigate to study mode with module questions
  const locale = route.params.locale || "en";
  router.push({
    path: `/${locale}/study`,
    query: { module: currentModule.value?.moduleId },
  });
};

const viewCertificate = () => {
  const locale = route.params.locale || "en";
  router.push(`/${locale}/paths/${route.params.slug}/certificate`);
};

const goBack = () => {
  const locale = route.params.locale || "en";
  router.push(`/${locale}/paths/${route.params.slug}`);
};

onMounted(async () => {
  const slug = route.params.slug as string;
  await store.fetchPathBySlug(slug);

  if (store.currentPath && store.currentEnrollment) {
    // Set current module to the one user is on
    if (store.currentEnrollment.currentModuleId) {
      currentModule.value =
        store.currentPath.modules.find(
          (m) => m.moduleId === store.currentEnrollment!.currentModuleId
        ) || store.currentPath.modules[0] || null;
    } else {
      currentModule.value = store.currentPath.modules[0] || null;
    }
  }
});
</script>
