<template>
  <div v-if="hasError" class="error-boundary">
    <div class="error-content">
      <div class="error-icon">
        <svg class="h-12 w-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
          />
        </svg>
      </div>

      <div class="error-details">
        <h2 class="error-title">{{ $t("errors.generic") }}</h2>
        <p class="error-message">
          {{ errorMessage || $t("errors.serverError.message") }}
        </p>

        <div v-if="showDetails && errorDetails" class="error-debug">
          <details class="error-debug-details">
            <summary class="error-debug-summary">
              {{ $t("common.technicalDetails") }}
            </summary>
            <pre class="error-debug-content">{{ errorDetails }}</pre>
          </details>
        </div>

        <div class="error-actions">
          <button type="button" class="error-action-button primary" @click="retry">
            {{ $t("common.retry") }}
          </button>

          <button type="button" class="error-action-button secondary" @click="reportError">
            {{ $t("common.reportError") }}
          </button>

          <button type="button" class="error-action-button secondary" @click="goHome">
            {{ $t("common.goHome") }}
          </button>
        </div>
      </div>
    </div>
  </div>

  <slot v-else />
</template>

<script setup lang="ts">
import { ref, onErrorCaptured, provide, inject, type Ref } from "vue";
import { useRouter } from "vue-router";
import { useErrorHandler } from "@/composables/useErrorHandler";
import { useToast } from "@/composables/useToast";

interface Props {
  fallback?: boolean;
  showDetails?: boolean;
  onRetry?: () => void;
}

const props = withDefaults(defineProps<Props>(), {
  fallback: true,
  showDetails: false,
});

const emit = defineEmits<{
  error: [error: Error, info: string];
  retry: [];
}>();

const router = useRouter();
const errorHandler = useErrorHandler();
const toast = useToast();

const hasError = ref(false);
const errorMessage = ref<string | null>(null);
const errorDetails = ref<string | null>(null);
const errorStack = ref<string | null>(null);

// Error boundary injection key
const ERROR_BOUNDARY_KEY = Symbol("error-boundary");

// Provide error boundary context to child components
provide(ERROR_BOUNDARY_KEY, {
  hasError,
  errorMessage,
  errorDetails,
  errorStack,
});

// Capture errors from child components
onErrorCaptured((error: Error, instance, info: string) => {
  console.error("Error caught by ErrorBoundary:", error, info);

  // Handle the error
  const errorState = errorHandler.handleError(error, {
    showToast: false, // Don't show toast for component errors
    logToConsole: true,
    showDetails: props.showDetails,
  });

  // Update local state
  hasError.value = true;
  errorMessage.value = errorState.message;
  errorDetails.value = props.showDetails ? JSON.stringify(errorState.details, null, 2) : null;
  errorStack.value = error.stack || null;

  // Emit error event
  emit("error", error, info);

  // Prevent error from propagating further
  return false;
});

const retry = () => {
  hasError.value = false;
  errorMessage.value = null;
  errorDetails.value = null;
  errorStack.value = null;

  if (props.onRetry) {
    props.onRetry();
  }

  emit("retry");
};

const reportError = () => {
  // TODO: Integrate with error reporting service (e.g., Sentry)
  const errorReport = {
    message: errorMessage.value,
    details: errorDetails.value,
    stack: errorStack.value,
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent,
    url: window.location.href,
  };

  console.error("Error report:", errorReport);

  toast.info(
    "Error Reported",
    "Thank you for reporting this error. Our team will investigate and fix it."
  );
};

const goHome = () => {
  router.push("/");
  retry();
};
</script>

<style scoped>
.error-boundary {
  @apply flex min-h-screen items-center justify-center bg-gray-50 px-4 py-8 dark:bg-gray-900;
}

.error-content {
  @apply w-full max-w-md rounded-lg bg-white p-6 shadow-lg dark:bg-gray-800;
}

.error-icon {
  @apply mb-4 flex justify-center;
}

.error-details {
  @apply text-center;
}

.error-title {
  @apply mb-2 text-xl font-semibold text-gray-900 dark:text-white;
}

.error-message {
  @apply mb-6 text-gray-600 dark:text-gray-400;
}

.error-debug {
  @apply mb-6;
}

.error-debug-details {
  @apply text-left;
}

.error-debug-summary {
  @apply cursor-pointer text-sm font-medium text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white;
}

.error-debug-content {
  @apply mt-2 overflow-auto rounded bg-gray-100 p-3 text-xs text-gray-800 dark:bg-gray-700 dark:text-gray-200;
  max-height: 200px;
}

.error-actions {
  @apply space-y-3;
}

.error-action-button {
  @apply w-full rounded-md px-4 py-2 font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2;
}

.error-action-button.primary {
  @apply bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500;
}

.error-action-button.secondary {
  @apply bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500 dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600;
}

/* RTL support */
[dir="rtl"] .error-debug {
  @apply text-right;
}
</style>
