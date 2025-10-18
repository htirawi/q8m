<script setup lang="ts">
import type { IFaqItemProps as Props, IFaqItemEmits as Emits } from "@/types/components/home";
import { useI18n } from "vue-i18n";
import { ref, computed } from "vue";

const props = withDefaults(defineProps<Props>(), {
  isOpen: false,
});

const emit = defineEmits<Emits>();

const { t } = useI18n();

const internalIsOpen = ref(props.isOpen);

const contentId = computed(() => `faq-answer-${props.faq.id}`);
const buttonId = computed(() => `faq-button-${props.faq.id}`);

const toggleOpen = (): void => {
  internalIsOpen.value = !internalIsOpen.value;
  emit("toggle", props.faq.id);
};

const handleKeydown = (event: KeyboardEvent): void => {
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    toggleOpen();
  }
};
</script>

<template>
  <div class="faq-item" :data-faq-id="faq.id">
    <button
      :id="buttonId"
      type="button"
      class="faq-item__button"
      :aria-expanded="internalIsOpen"
      :aria-controls="contentId"
      @click="toggleOpen"
      @keydown="handleKeydown"
    >
      <span class="faq-item__question">
        {{ t(faq.qKey) }}
      </span>
      <svg
        :class="['faq-item__icon', { 'faq-item__icon--open': internalIsOpen }]"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
      </svg>
    </button>

    <div
      v-show="internalIsOpen"
      :id="contentId"
      class="faq-item__answer"
      role="region"
      :aria-labelledby="buttonId"
    >
      <p class="faq-item__answer-text">
        {{ t(faq.aKey) }}
      </p>
    </div>
  </div>
</template>

<style scoped>
.faq-item {
  @apply border-b border-gray-200 last:border-b-0 dark:border-slate-700;
}

.faq-item__button {
  @apply flex w-full items-center justify-between gap-4 px-6 py-6 text-left;
  @apply hover:bg-gray-50/80 dark:hover:bg-slate-800/30;
  @apply hover:text-blue-600 dark:hover:text-blue-400;
  @apply transition-all duration-300 ease-in-out;
  @apply focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:ring-offset-2;
  @apply dark:focus:ring-offset-slate-800;
}

.faq-item__question {
  @apply flex-1 text-lg font-semibold text-slate-900 dark:text-white;
}

.faq-item__icon {
  @apply h-6 w-6 flex-shrink-0 transform text-slate-500 transition-all duration-300 dark:text-slate-400;
  @apply hover:text-blue-600 dark:hover:text-blue-400;
}

.faq-item__icon--open {
  @apply rotate-180 text-blue-600 dark:text-blue-400;
}

.faq-item__answer {
  @apply overflow-hidden px-6 pb-6;
  animation: slideDown 0.3s ease-out;
}

.faq-item__answer-text {
  @apply text-base leading-relaxed text-slate-600 dark:text-slate-300;
  @apply bg-gray-50/50 dark:bg-slate-800/30;
  @apply rounded-xl p-5;
  @apply border-l-4 border-blue-500;
  @apply shadow-sm;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  .faq-item__icon,
  .faq-item__answer {
    @apply transition-none;

    animation: none;
  }
}

/* RTL Support */
[dir="rtl"] .faq-item__button {
  @apply text-right;
}
</style>
