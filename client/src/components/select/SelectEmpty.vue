<template>
  <div class="select-empty" role="status" aria-live="polite">
    <div class="select-empty__container">
      <!-- Icon/Illustration -->
      <div class="select-empty__icon" aria-hidden="true">
        <svg class="empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <circle cx="12" cy="12" r="10" stroke-width="1.5" />
          <path d="M8 12h8" stroke-width="1.5" stroke-linecap="round" />
        </svg>
      </div>

      <!-- Message -->
      <h2 class="select-empty__title">{{ $t("select.emptyTitle") }}</h2>
      <p class="select-empty__message">{{ $t("select.emptyMessage") }}</p>

      <!-- Action -->
      <button type="button" class="select-empty__action" @click="handleReset">
        {{ $t("select.resetFilters") }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
interface ISelectEmptyEmits {
  (e: "reset"): void;
}

const emit = defineEmits<ISelectEmptyEmits>();

const handleReset = (): void => {
  emit("reset");
};
</script>

<style scoped>
.select-empty {
  @apply w-full px-4 py-20;
}

.select-empty__container {
  @apply mx-auto max-w-md text-center;
  @apply rounded-2xl border border-white/20 bg-white/10 p-12 backdrop-blur-md;

  animation: fade-in 0.6s ease-out;
}

.select-empty__icon {
  @apply mb-6 flex justify-center;
}

.empty-icon {
  @apply h-20 w-20 text-white/40;
}

.select-empty__title {
  @apply mb-4 text-2xl font-bold text-white;
}

.select-empty__message {
  @apply mb-8 text-base leading-relaxed text-white/70;
}

.select-empty__action {
  @apply rounded-xl bg-white px-8 py-3 text-sm font-bold text-purple-600;
  @apply transition-all duration-200;
  @apply hover:scale-105 hover:bg-white/90;
  @apply focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent;
}

@keyframes fade-in {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  .select-empty__container {
    animation: none !important;
  }
}
</style>
