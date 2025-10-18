<template>
  <div v-if="hasError" class="error-boundary">
    <div class="error-boundary__container">
      <div class="error-boundary__icon">
        <svg class="h-16 w-16 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
      </div>

      <h2 class="error-boundary__title">{{ title }}</h2>
      <p class="error-boundary__message">{{ message }}</p>

      <div v-if="showDetails && errorDetails" class="error-boundary__details">
        <details>
          <summary
            class="cursor-pointer text-sm font-medium text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
          >
            {{ $t("common.showDetails") }}
          </summary>
          <pre
            class="mt-2 overflow-auto rounded-lg bg-gray-100 p-4 text-xs text-gray-800 dark:bg-gray-800 dark:text-gray-200"
            >{{ errorDetails }}

</pre
          >
        </details>
      </div>

      <div class="error-boundary__actions">
        <button
          v-if="showRetry"
          @click="handleRetry"
          class="btn btn--primary"
          :disabled="isRetrying"
        >
          <span v-if="isRetrying"
            >{{ $t("common.retrying") }}

            ...</span
          >
          <span v-else>{{ retryText || $t("common.retry") }} </span>
        </button>

        <button v-if="showGoBack" @click="handleGoBack" class="btn btn--secondary">
          {{ goBackText || $t("common.goBack") }}
        </button>

        <button v-if="showReload" @click="handleReload" class="btn btn--secondary">
          {{ reloadText || $t("common.refresh") }}
        </button>
      </div>
    </div>
  </div>
  <slot v-else></slot>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { parseError, getUserFriendlyMessage, logError } from "@/utils/errorHandler";

interface props {
  error?: Error | unknown;
  title?: string;
  message?: string;
  context?: string;
  showRetry?: boolean;
  showGoBack?: boolean;
  showReload?: boolean;
  showDetails?: boolean;
  retryText?: string;
  goBackText?: string;
  reloadText?: string;
}

interface emits {
  (e: "retry"): void;
  (e: "reset"): void;
}

const props = withDefaults(defineProps<Props>(), {
  showRetry: true,
  showGoBack: true,
  showReload: false,
  showDetails: false,
});

const emit = defineEmits<Emits>();

const router = useRouter();
const { t } = useI18n();

const isRetrying = ref(false);

const hasError = computed(() => !!props.error);

const errorDetails = computed(() => {
  if (!props.error) return null;
  const parsed = parseError(props.error);
  return JSON.stringify(parsed, null, 2);
});

const displayTitle = computed(() => {
  return props.title || t("errors.somethingWentWrong");
});

const displayMessage = computed(() => {
  if (props.message) return props.message;
  if (props.error) return getUserFriendlyMessage(props.error, props.context);
  return t("errors.defaultMessage");
});

const handleRetry = async () => {
  isRetrying.value = true;
  try {
    emit("retry");
    // Wait a bit to show the loading state
    await new Promise((resolve) => setTimeout(resolve, 300));
  } finally {
    isRetrying.value = false;
  }
};

const handlegoback = () => {
  router.back();
  emit("reset");
};

const handlereload = () => {
  window.location.reload();
};

// Log error for debugging
if (props.error) {
  logError(props.error, props.context);
}
</script>

<style scoped>
.error-boundary {
  @apply flex min-h-[400px] items-center justify-center p-4;
}

.error-boundary__container {
  @apply w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-2xl dark:bg-gray-800;
  @apply border-2 border-red-200 dark:border-red-900;
}

.error-boundary__icon {
  @apply mb-6 flex justify-center;
}

.error-boundary__title {
  @apply mb-4 text-2xl font-bold text-gray-900 dark:text-white;
}

.error-boundary__message {
  @apply mb-6 leading-relaxed text-gray-600 dark:text-gray-300;
}

.error-boundary__details {
  @apply mb-6 text-left;
}

.error-boundary__actions {
  @apply flex flex-col justify-center gap-3 sm:flex-row;
}

.btn {
  @apply rounded-lg px-6 py-3 font-medium transition-all duration-200;
  @apply focus:outline-none focus:ring-2 focus:ring-offset-2;
  @apply disabled:cursor-not-allowed disabled:opacity-50;
}

.btn--primary {
  @apply bg-red-600 text-white hover:bg-red-700;
  @apply focus:ring-red-500;
  @apply shadow-lg hover:shadow-xl;
}

.btn--secondary {
  @apply bg-gray-200 text-gray-700 hover:bg-gray-300;
  @apply dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600;
  @apply focus:ring-gray-500;
}
</style>
