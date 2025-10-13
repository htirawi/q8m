<template>
  <section
    class="faq-section"
    data-testid="faq-section"
    aria-labelledby="faq-title"
  >
    <div class="faq-section__container">
      <!-- Section header -->
      <div class="faq-section__header">
        <h2 id="faq-title" class="faq-section__title">
          {{ t('home.faq.title') }}
        </h2>
        <p class="faq-section__subtitle">
          {{ t('home.faq.subtitle') }}
        </p>
      </div>

      <!-- FAQ accordion -->
      <div class="faq-section__accordion" role="list">
        <div
          v-for="(item, index) in faqItems"
          :key="item.id"
          class="faq-item"
          :data-testid="`faq-item-${item.id}`"
          role="listitem"
        >
          <button
            type="button"
            class="faq-item__question"
            :aria-expanded="expandedItems.has(item.id)"
            :aria-controls="`faq-answer-${item.id}`"
            @click="toggleItem(item.id, index)"
            :data-testid="`faq-question-${item.id}`"
          >
            <span class="faq-item__question-text">
              {{ t(item.questionKey) }}
            </span>
            <svg
              class="faq-item__icon"
              :class="{ 'faq-item__icon--expanded': expandedItems.has(item.id) }"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>

          <Transition name="faq-slide">
            <div
              v-if="expandedItems.has(item.id)"
              :id="`faq-answer-${item.id}`"
              class="faq-item__answer"
              :data-testid="`faq-answer-${item.id}`"
            >
              <p class="faq-item__answer-text">
                {{ t(item.answerKey) }}
              </p>
            </div>
          </Transition>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useHomepageAnalytics } from '@/composables/useHomepageAnalytics';
import type { IFaqItem } from '@/types/homepage';

const { t } = useI18n();
const { trackFaqInteraction } = useHomepageAnalytics();

const expandedItems = ref<Set<string>>(new Set());

// FAQ items
const faqItems = computed<IFaqItem[]>(() => [
  {
    id: 'no-credit-card',
    questionKey: 'home.faq.noCreditCard.question',
    answerKey: 'home.faq.noCreditCard.answer',
  },
  {
    id: 'cancel-anytime',
    questionKey: 'home.faq.cancelAnytime.question',
    answerKey: 'home.faq.cancelAnytime.answer',
  },
  {
    id: 'after-trial',
    questionKey: 'home.faq.afterTrial.question',
    answerKey: 'home.faq.afterTrial.answer',
  },
  {
    id: 'refund-policy',
    questionKey: 'home.faq.refundPolicy.question',
    answerKey: 'home.faq.refundPolicy.answer',
  },
  {
    id: 'which-plan',
    questionKey: 'home.faq.whichPlan.question',
    answerKey: 'home.faq.whichPlan.answer',
  },
  {
    id: 'student-discount',
    questionKey: 'home.faq.studentDiscount.question',
    answerKey: 'home.faq.studentDiscount.answer',
  },
]);

/**
 * Toggle FAQ item expanded state
 */
const toggleItem = (itemId: string, index: number): void => {
  const isExpanded = expandedItems.value.has(itemId);

  if (isExpanded) {
    expandedItems.value.delete(itemId);
    trackFaqInteraction({
      action: 'collapse',
      questionId: itemId,
      questionIndex: index,
    });
  } else {
    expandedItems.value.add(itemId);
    trackFaqInteraction({
      action: 'expand',
      questionId: itemId,
      questionIndex: index,
    });
  }
};

defineOptions({
  name: 'FaqSection',
});
</script>

<style scoped>
.faq-section {
  @apply py-16 bg-gray-50 dark:bg-gray-800;
  @apply lg:py-24;
}

.faq-section__container {
  @apply mx-auto max-w-3xl px-4 sm:px-6 lg:px-8;
}

.faq-section__header {
  @apply text-center mb-12;
}

.faq-section__title {
  @apply text-3xl font-bold text-gray-900 dark:text-white mb-4;
  @apply sm:text-4xl;
  letter-spacing: -0.02em;
}

.faq-section__subtitle {
  @apply text-lg text-gray-600 dark:text-gray-400;
}

.faq-section__accordion {
  @apply space-y-4;
}

/* FAQ item */
.faq-item {
  @apply rounded-lg border border-gray-200 dark:border-gray-700;
  @apply bg-white dark:bg-gray-900;
  @apply overflow-hidden;
  @apply transition-all duration-200;
  @apply hover:border-gray-300 dark:hover:border-gray-600;
  @apply hover:shadow-md;
}

.faq-item__question {
  @apply w-full px-6 py-4;
  @apply flex items-start justify-between gap-4;
  @apply text-left;
  @apply transition-colors duration-200;
  @apply hover:bg-gray-50 dark:hover:bg-gray-800;
  @apply focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500;
}

.faq-item__question-text {
  @apply flex-1 text-lg font-medium text-gray-900 dark:text-white;
}

.faq-item__icon {
  @apply w-6 h-6 text-gray-600 dark:text-gray-400;
  @apply flex-shrink-0;
  @apply transition-transform duration-300;
}

.faq-item__icon--expanded {
  @apply rotate-180;
}

.faq-item__answer {
  @apply px-6 pb-4;
}

.faq-item__answer-text {
  @apply text-base text-gray-600 dark:text-gray-400;
  @apply leading-relaxed;
}

/* Slide transition for answer */
.faq-slide-enter-active,
.faq-slide-leave-active {
  transition: max-height 0.3s ease-out, opacity 0.3s ease-out;
  max-height: 500px;
}

.faq-slide-enter-from,
.faq-slide-leave-to {
  max-height: 0;
  opacity: 0;
}

/* RTL support */
[dir='rtl'] .faq-item__question {
  @apply text-right;
}

[dir='rtl'] .faq-item__question {
  @apply flex-row-reverse;
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  .faq-item,
  .faq-item__icon,
  .faq-slide-enter-active,
  .faq-slide-leave-active {
    transition: none;
  }

  .faq-item__icon--expanded {
    @apply rotate-0;
  }
}

/* Focus styles for keyboard navigation */
.faq-item__question:focus-visible {
  @apply outline-2 outline-blue-500 outline-offset-2;
}
</style>
