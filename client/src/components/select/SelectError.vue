<template>
  <div class="select-error" role="alert" aria-live="assertive">
    <div class="select-error__container">
      <!-- Icon -->
      <div class="select-error__icon" aria-hidden="true">
        <svg class="error-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <circle cx="12" cy="12" r="10" stroke-width="2" />
          <path d="M12 8v4m0 4h.01" stroke-width="2" stroke-linecap="round" />
        </svg>
      </div>

      <!-- Content -->
      <div class="select-error__content">
        <h3 class="select-error__title">{{ $t("errors.somethingWentWrong") }}</h3>
        <p class="select-error__message">
          {{ message || $t("errors.defaultMessage") }}
        </p>
      </div>

      <!-- Actions -->
      <div class="select-error__actions">
        <button type="button" class="retry-btn" :disabled="isRetrying" @click="handleRetry">
          <svg v-if="isRetrying" class="spinner" viewBox="0 0 24 24" aria-hidden="true">
            <circle
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              stroke-width="4"
              fill="none"
              opacity="0.25"
            />
            <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <span v-if="!isRetrying">{{ $t("common.retry") }} </span>
          <span v-else>{{ $t("common.retrying") }} </span>
        </button>

        <button v-if="dismissible" type="button" class="dismiss-btn" @click="handleDismiss">
          {{ $t("select.dismiss") }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";

interface ISelectErrorProps {
  /** Error message to display */
  message?: string;

  /** Whether the error can be dismissed */
  dismissible?: boolean;
}

interface ISelectErrorEmits {
  (e: "retry"): void;
  (e: "dismiss"): void;
}

withDefaults(defineProps<ISelectErrorProps>(), {
  message: "",
  dismissible: false,
});

const emit = defineEmits<ISelectErrorEmits>();

const isRetrying = ref(false);

const handleRetry = async (): Promise<void> => {
  isRetrying.value = true;
  emit("retry");

  // Reset after a delay to allow the retry to complete
  setTimeout(() => {
    isRetrying.value = false;
  }, 2000);
};

const handleDismiss = (): void => {
  emit("dismiss");
};
</script>

<style scoped>
.select-error {
  @apply w-full px-4 py-8;
}

.select-error__container {
  @apply mx-auto max-w-2xl;
  @apply rounded-2xl border border-red-400/30 bg-red-500/20 p-8 backdrop-blur-md;
  @apply flex flex-col items-center gap-6 md:flex-row;

  animation:
    shake 0.5s ease-out,
    fade-in 0.3s ease-out;
}

.select-error__icon {
  @apply flex-shrink-0;
}

.error-icon {
  @apply h-12 w-12 text-red-400;
}

.select-error__content {
  @apply flex-1 text-center md:text-left;
}

.select-error__title {
  @apply mb-2 text-xl font-bold text-white;
}

.select-error__message {
  @apply text-base leading-relaxed text-white/80;
}

.select-error__actions {
  @apply flex flex-shrink-0 gap-3;
}

.retry-btn {
  @apply rounded-xl bg-white px-6 py-3 text-sm font-bold text-red-600;
  @apply transition-all duration-200;
  @apply hover:scale-105 hover:bg-white/90;
  @apply focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent;
  @apply disabled:cursor-not-allowed disabled:opacity-50;
  @apply flex items-center gap-2;
}

.dismiss-btn {
  @apply rounded-xl border border-white/30 bg-white/20 px-6 py-3 text-sm font-bold text-white;
  @apply transition-all duration-200;
  @apply hover:bg-white/30;
  @apply focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent;
}

.spinner {
  @apply h-4 w-4 animate-spin;
}

@keyframes fade-in {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}

@keyframes shake {
  0%,
  100% {
    transform: translateX(0);
  }

  10%,
  30%,
  50%,
  70%,
  90% {
    transform: translateX(-4px);
  }

  20%,
  40%,
  60%,
  80% {
    transform: translateX(4px);
  }
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  .select-error__container {
    animation: fade-in 0.3s ease-out !important;
  }
}
</style>
