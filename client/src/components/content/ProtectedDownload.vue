<template>
  <div class="protected-download">
    <!-- Download Button -->
    <button
      @click="handleDownload"
      :disabled="isLoading || !hasAccess"
      class="download-btn"
      :class="{
        'btn-primary': hasAccess,
        'btn-disabled': !hasAccess || isLoading,
      }"
    >
      <svg
        v-if="!isLoading"
        class="mr-2 h-5 w-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
        />
      </svg>

      <div v-if="isLoading" class="loading-spinner">
        <div class="h-5 w-5 animate-spin rounded-full border-b-2 border-white"></div>
      </div>

      <span>{{ buttonText }}</span>
    </button>

    <!-- Access Denied Overlay -->
    <div v-if="!hasAccess && !isLoading" class="access-overlay">
      <ContentAccessGuard
        :category="category"
        :required-content-level="requiredLevel"
        :show-preview="false"
        :show-plan-comparison="false"
        :custom-title="$t('downloads.accessRequired')"
        :custom-description="$t('downloads.upgradeToDownload', { filename })"
      />
    </div>

    <!-- Download Info -->
    <div v-if="downloadInfo && hasAccess" class="download-info">
      <div class="info-item">
        <span class="info-label">{{ $t("downloads.fileSize") }} </span>
        <span class="info-value">{{ fileSize }} </span>
      </div>
      <div class="info-item">
        <span class="info-label">{{ $t("downloads.format") }} </span>
        <span class="info-value">{{ fileFormat }} </span>
      </div>
      <div class="info-item">
        <span class="info-label">{{ $t("downloads.requiredLevel") }} </span>
        <span class="info-value">{{ requiredLevel }}</span>
      </div>
    </div>

    <!-- Download Progress -->
    <div v-if="downloadProgress > 0" class="download-progress">
      <div class="progress-bar">
        <div class="progress-fill" :style="{ width: `${downloadProgress}%` }"></div>
      </div>
      <p class="progress-text">{{ $t("downloads.downloading") }}... {{ downloadProgress }}%</p>
    </div>

    <!-- Error Message -->
    <div v-if="error" class="error-message">
      <div class="error-icon">
        <svg class="h-5 w-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
          />
        </svg>
      </div>
      <p class="error-text">{{ error }}</p>
      <button @click="retryDownload" class="retry-btn">
        {{ $t("common.retry") }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import { usePaymentStore } from "@/stores/payment";
import { useContentAccess } from "@/composables/useEntitlementGuard";
import ContentAccessGuard from "@/components/content/ContentAccessGuard.vue";

interface Props {
  category: string;
  filename: string;
  fileSize?: string;
  fileFormat?: string;
  buttonText?: string;
  expiresIn?: number; // seconds, default 1 hour
}

const props = withDefaults(defineProps<Props>(), {
  fileSize: "N/A",
  fileFormat: "PDF",
  expiresIn: 3600,
});

const { t } = useI18n();
const paymentStore = usePaymentStore();
const contentAccess = useContentAccess();

// State
const isLoading = ref(false);
const error = ref<string | null>(null);
const downloadProgress = ref(0);
const downloadInfo = ref<any>(null);

// Computed
const hasAccess = computed(() => {
  return contentAccess.canAccessCategory(props.category);
});

const requiredLevel = computed(() => {
  return contentAccess.getContentAccessLevel(props.category);
});

const buttonText = computed(() => {
  if (isLoading.value) return t("downloads.downloading");
  if (!hasAccess.value) return t("downloads.upgradeRequired");
  return props.buttonText || t("downloads.downloadFile");
});

// Methods
const handleDownload = async () => {
  if (!hasAccess.value) return;
  try {
    isLoading.value = true;
    error.value = null;
    downloadProgress.value = 0;

    // Generate signed download URL
    const downloadUrl = await paymentStore.generateDownloadUrl(
      props.category,
      props.filename,
      props.expiresIn
    );

    downloadInfo.value = downloadUrl;

    // Simulate download progress
    const progressInterval = setInterval(() => {
      if (downloadProgress.value < 90) {
        downloadProgress.value += Math.random() * 10;
      }
    }, 200);

    // Download the file
    await paymentStore.downloadFile(downloadUrl.downloadUrl, props.filename);

    // Complete progress
    clearInterval(progressInterval);
    downloadProgress.value = 100;

    // Reset progress after a delay
    setTimeout(() => {
      downloadProgress.value = 0;
    }, 2000);
  } catch (err) {
    error.value = err instanceof Error ? err.message : t("downloads.downloadFailed");
    downloadProgress.value = 0;
  } finally {
    isLoading.value = false;
  }
};

const retrydownload = () => {
  error.value = null;
  handleDownload();
};

// Lifecycle
onMounted(() => {
  // Check if file exists and get metadata
  // This would typically call an API to get file metadata
});
</script>

<style scoped>
.protected-download {
  @apply relative w-full;
}

/* Download Button */
.download-btn {
  @apply inline-flex items-center justify-center rounded-lg px-6 py-3 text-base font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2;
}

.btn-primary {
  @apply border border-transparent bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500;
}

.btn-disabled {
  @apply cursor-not-allowed border border-gray-300 bg-gray-100 text-gray-400 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-500;
}

/* Loading Spinner */
.loading-spinner {
  @apply mr-2;
}

/* Access Overlay */
.access-overlay {
  @apply absolute inset-0 z-10 flex items-center justify-center rounded-lg bg-white bg-opacity-95 backdrop-blur-sm dark:bg-gray-800 dark:bg-opacity-95;
}

/* Download Info */
.download-info {
  @apply mt-4 grid grid-cols-1 gap-2 rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800;
}

.info-item {
  @apply flex items-center justify-between text-sm;
}

.info-label {
  @apply font-medium text-gray-600 dark:text-gray-300;
}

.info-value {
  @apply text-gray-900 dark:text-white;
}

/* Download Progress */
.download-progress {
  @apply mt-4;
}

.progress-bar {
  @apply h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700;
}

.progress-fill {
  @apply h-full bg-indigo-600 transition-all duration-300 ease-out;
}

.progress-text {
  @apply mt-2 text-center text-sm text-gray-600 dark:text-gray-300;
}

/* Error Message */
.error-message {
  @apply mt-4 rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20;
}

.error-icon {
  @apply mb-2 flex items-center justify-center;
}

.error-text {
  @apply mb-3 text-center text-sm text-red-700 dark:text-red-300;
}

.retry-btn {
  @apply mx-auto block rounded-lg border border-red-300 bg-white px-4 py-2 text-sm font-medium text-red-700 transition-colors duration-200 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:border-red-700 dark:bg-gray-800 dark:text-red-300 dark:hover:bg-gray-700;
}

/* RTL Support */
[dir="rtl"] .download-btn {
  @apply flex-row-reverse;
}

[dir="rtl"] .loading-spinner {
  @apply ml-2 mr-0;
}

[dir="rtl"] .info-item {
  @apply flex-row-reverse;
}
</style>
