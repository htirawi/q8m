<template>
  <section class="faq-accordion" aria-labelledby="faq-title">
    <div class="faq-accordion-container">
      <div class="faq-accordion-header">
        <h2 id="faq-title" class="faq-accordion-title">
          {{ $t("pricing.faq.title") }}
        </h2>
        <p class="faq-accordion-description">
          {{ $t("pricing.faq.subtitle") }}
        </p>
      </div>

      <div class="faq-accordion-content">
        <div v-for="(faq, index) in faqs" :key="index" class="faq-accordion-item">
          <button
            @click="toggleFaq(index)"
            class="faq-accordion-button"
            :aria-expanded="openFaqs.includes(index)"
            :aria-controls="`faq-answer-${index}`"
            :id="`faq-question-${index}`"
          >
            <span class="faq-accordion-question">
              {{ $t(faq.questionKey) }}
            </span>
            <ChevronDownIcon
              class="faq-accordion-icon"
              :class="{ 'faq-accordion-icon--open': openFaqs.includes(index) }"
              aria-hidden="true"
            />
          </button>

          <div
            v-if="openFaqs.includes(index)"
            :id="`faq-answer-${index}`"
            class="faq-accordion-answer"
            :aria-labelledby="`faq-question-${index}`"
          >
            <p class="faq-accordion-answer-text">
              {{ $t(faq.answerKey) }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { ChevronDownIcon } from "@heroicons/vue/24/outline";
import { faqs } from "./pricing.config";

const openFaqs = ref<number[]>([]);

const toggleFaq = (index: number) => {
  const currentIndex = openFaqs.value.indexOf(index);
  if (currentIndex > -1) {
    openFaqs.value.splice(currentIndex, 1);
  } else {
    openFaqs.value.push(index);
  }
};

defineOptions({
  name: "FaqAccordion",
});
</script>

<style scoped>
.faq-accordion {
  @apply bg-gray-50 py-16 lg:py-24;
}

.faq-accordion-container {
  @apply mx-auto max-w-4xl px-4 sm:px-6 lg:px-8;
}

.faq-accordion-header {
  @apply text-center;
}

.faq-accordion-title {
  @apply text-3xl font-bold text-gray-900;
}

.faq-accordion-description {
  @apply mx-auto mt-4 max-w-2xl text-lg text-gray-600;
}

.faq-accordion-content {
  @apply mt-12 space-y-4;
}

.faq-accordion-item {
  @apply rounded-lg border border-gray-200 bg-white shadow-sm;
}

.faq-accordion-button {
  @apply flex w-full items-center justify-between px-6 py-4 text-left transition-colors duration-200;
  @apply hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500;
}

.faq-accordion-question {
  @apply text-lg font-medium text-gray-900;
}

.faq-accordion-icon {
  @apply h-5 w-5 text-gray-500 transition-transform duration-200;
}

.faq-accordion-icon--open {
  @apply rotate-180;
}

.faq-accordion-answer {
  @apply px-6 pb-4;
}

.faq-accordion-answer-text {
  @apply leading-relaxed text-gray-700;
}

/* RTL Support */
[dir="rtl"] .faq-accordion-button {
  @apply text-right;
}

[dir="rtl"] .faq-accordion-icon {
  @apply ml-4 mr-0;
}
</style>
