<template>
  <footer class="select-footer">
    <div class="select-footer__actions">
      <!-- Primary CTA -->
      <button
        type="button"
        class="select-footer__btn select-footer__btn--primary"
        :disabled="!hasSelection || isNavigating"
        :aria-label="$t('select.continueAriaLabel')"
        @click="handleContinue"
      >
        <span v-if="!isNavigating">{{ $t("select.continue") }} </span>
        <span v-else class="loading-state">
          <svg class="spinner" viewBox="0 0 24 24" aria-hidden="true">
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
          {{ $t("select.loading") }}
        </span>
      </button>

      <!-- Secondary action (optional) -->
      <button
        v-if="canSkip"
        type="button"
        class="select-footer__btn select-footer__btn--secondary"
        :aria-label="$t('select.skipAriaLabel')"
        @click="handleSkip"
      >
        {{ $t("select.skip") }}
      </button>
    </div>

    <!-- Help link -->
    <div v-if="showHelp" class="select-footer__help">
      <button type="button" class="help-link" @click="handleHelp">
        {{ $t("select.helpLink") }}
      </button>
    </div>
  </footer>
</template>

<script setup lang="ts">
interface ISelectFooterProps {
  /** Whether a valid selection has been made */
  hasSelection: boolean;

  /** Whether navigation is in progress */
  isNavigating: boolean;

  /** Whether to show the skip button */
  canSkip?: boolean;

  /** Whether to show the help link */
  showHelp?: boolean;
}

interface ISelectFooterEmits {
  (e: "continue"): void;
  (e: "skip"): void;
  (e: "help"): void;
}

withDefaults(defineProps<ISelectFooterProps>(), {
  canSkip: false,
  showHelp: true,
});

const emit = defineEmits<ISelectFooterEmits>();

const handleContinue = (): void => {
  emit("continue");
};

const handleSkip = (): void => {
  emit("skip");
};

const handleHelp = (): void => {
  emit("help");
};
</script>

<style scoped>
.select-footer {
  @apply mb-8 mt-12 flex flex-col items-center gap-6;

  animation: fade-in-up 0.6s ease-out 0.4s backwards;
}

.select-footer__actions {
  @apply flex flex-col items-center justify-center gap-4 sm:flex-row;
}

/* Buttons */
.select-footer__btn {
  @apply relative rounded-2xl px-12 py-5 text-lg font-extrabold;
  @apply transition-all duration-300 ease-out;
  @apply focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent;
  @apply disabled:cursor-not-allowed disabled:opacity-50;

  min-width: 220px;
  letter-spacing: -0.01em;
}

.select-footer__btn--primary {
  @apply text-purple-600;

  background: linear-gradient(135deg, rgb(255, 255, 255, 1) 0%, rgb(255, 255, 255, 0.95) 100%);
  backdrop-filter: blur(20px) saturate(180%);
  box-shadow:
    0 20px 50px -10px rgb(0, 0, 0, 0.4),
    0 0 0 1px rgb(255, 255, 255, 0.2),
    inset 0 1px 0 0 rgb(255, 255, 255, 0.8),
    inset 0 -1px 0 0 rgb(0, 0, 0, 0.05);

  @apply focus-visible:ring-white/50;
}

.select-footer__btn--primary:not(:disabled):hover {
  transform: scale(1.06) translateY(-2px);
  box-shadow:
    0 30px 70px -12px rgb(0, 0, 0, 0.5),
    0 0 0 2px rgb(255, 255, 255, 0.3),
    inset 0 2px 0 0 rgb(255, 255, 255, 1),
    inset 0 -2px 0 0 rgb(0, 0, 0, 0.08),
    0 0 40px rgb(255, 255, 255, 0.4);
}

.select-footer__btn--primary:not(:disabled):active {
  transform: scale(1.03) translateY(-1px);
}

.select-footer__btn--secondary {
  @apply text-white;

  background: linear-gradient(135deg, rgb(255, 255, 255, 0.15) 0%, rgb(255, 255, 255, 0.1) 100%);
  backdrop-filter: blur(16px) saturate(150%);
  border: 2px solid rgb(255, 255, 255, 0.25);
  box-shadow:
    0 12px 35px -8px rgb(0, 0, 0, 0.3),
    inset 0 1px 0 0 rgb(255, 255, 255, 0.2);

  @apply focus-visible:ring-white/30;
}

.select-footer__btn--secondary:not(:disabled):hover {
  background: linear-gradient(135deg, rgb(255, 255, 255, 0.25) 0%, rgb(255, 255, 255, 0.18) 100%);
  border-color: rgb(255, 255, 255, 0.35);
  transform: scale(1.04) translateY(-1px);
  box-shadow:
    0 16px 45px -8px rgb(0, 0, 0, 0.4),
    inset 0 1px 0 0 rgb(255, 255, 255, 0.3);
}

/* Loading state */
.loading-state {
  @apply flex items-center justify-center gap-2;
}

.spinner {
  @apply h-5 w-5 animate-spin;
}

/* Help link */
.select-footer__help {
  @apply mt-4;
}

.help-link {
  @apply text-sm font-medium text-white/80 underline underline-offset-4 hover:text-white;
  @apply transition-colors duration-200;
  @apply focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent;
  @apply rounded px-2 py-1;
}

/* Animations */
@keyframes fade-in-up {
  from {
    opacity: 0;
    transform: translateY(20px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  .select-footer {
    animation: none !important;
  }
}
</style>
