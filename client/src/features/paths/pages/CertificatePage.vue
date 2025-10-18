<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
    <div class="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
      <!-- Loading State -->
      <div v-if="loading" class="flex justify-center py-12">
        <div class="h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent"></div>
      </div>

      <!-- Certificate -->
      <div v-else-if="certificate" class="space-y-6">
        <!-- Certificate Card -->
        <div
          id="certificate"
          class="relative overflow-hidden rounded-lg bg-white p-12 shadow-lg dark:bg-gray-800"
        >
          <!-- Border Decoration -->
          <div class="absolute inset-0 border-8 border-double border-yellow-600/20 dark:border-yellow-400/20"></div>

          <!-- Content -->
          <div class="relative space-y-8 text-center">
            <!-- Header -->
            <div>
              <h1 class="text-4xl font-bold text-gray-900 dark:text-white">
                Certificate of Completion
              </h1>
              <p class="mt-2 text-gray-600 dark:text-gray-400">
                This is to certify that
              </p>
            </div>

            <!-- Recipient Name -->
            <div class="py-4">
              <p class="text-3xl font-bold text-primary-600 dark:text-primary-400">
                {{ certificate.userName }}

              </p>
            </div>

            <!-- Description -->
            <div class="space-y-2">
              <p class="text-gray-700 dark:text-gray-300">
                has successfully completed the learning path
              </p>
              <p class="text-2xl font-semibold text-gray-900 dark:text-white">
                {{ pathTitle }}

              </p>
            </div>

            <!-- Stats -->
            <div class="flex justify-center gap-8 pt-4">
              <div class="text-center">
                <p class="text-2xl font-bold text-gray-900 dark:text-white">
                  {{ certificate.moduleCount }}

                </p>
                <p class="text-sm text-gray-600 dark:text-gray-400">Modules</p>
              </div>
              <div class="text-center">
                <p class="text-2xl font-bold text-gray-900 dark:text-white">
                  {{ Math.round(certificate.totalTimeSpent / 60) }}

h
                </p>
                <p class="text-sm text-gray-600 dark:text-gray-400">Time Invested</p>
              </div>
              <div class="text-center">
                <p class="text-2xl font-bold text-gray-900 dark:text-white">
                  {{ certificate.finalScore }}%
                </p>
                <p class="text-sm text-gray-600 dark:text-gray-400">Score</p>
              </div>
            </div>

            <!-- Date & ID -->
            <div class="border-t border-gray-200 pt-6 dark:border-gray-700">
              <p class="text-sm text-gray-600 dark:text-gray-400">
                Completed on {{ formatDate(certificate.completedAt) }}
              </p>
              <p class="mt-1 text-xs text-gray-500 dark:text-gray-500">
                Certificate ID: {{ certificate.certificateId }}

              </p>
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex justify-center gap-4">
          <button
            type="button"
            class="rounded-lg border border-gray-300 bg-white px-6 py-3 font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
            @click="goBack"
          >
            Back to Path
          </button>
          <button
            type="button"
            class="rounded-lg bg-primary-600 px-6 py-3 font-medium text-white hover:bg-primary-700"
            @click="downloadCertificate"
          >
            Download Certificate
          </button>
        </div>
      </div>

      <!-- Error State -->
      <div v-else class="text-center py-12">
        <p class="text-gray-600 dark:text-gray-400">Certificate not found</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useLearningPathsStore } from '@/stores/learning-paths';
import type { ICertificate } from '@shared/types/learning-paths';

const router = useRouter();
const route = useRoute();
const store = useLearningPathsStore();

const loading = ref(true);
const certificate = ref<ICertificate | null>(null);

const locale = computed(() => (route.params.locale as string) || 'en');

const pathTitle = computed(() => {
  if (!certificate.value) return '';
  return certificate.value.pathTitle[locale.value === 'ar' ? 'ar' : 'en'];
});

const formatdate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

const goback = () => {
  router.push(`/${locale.value}/paths/${route.params.slug}`);
};

const downloadcertificate = () => {
  // Simple download using print functionality
  window.print();
};

onMounted(async () => {
  const pathId = store.currentPath?._id;
  if (pathId) {
    certificate.value = await store.getCertificate(pathId);
  }
  loading.value = false;
});
</script>

<style scoped>
@media print {
  button {
    display: none;
  }
}
</style>
