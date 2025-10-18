<template>
  <section class="faq-section" aria-labelledby="faq-title">
    <div class="faq-section__container">
      <SectionHeader title-key="home.faq.title" subtitle-key="home.faq.subtitle" />

      <!-- Enhanced FAQ Features -->
      <div class="faq-section__features">
        <!-- Search Bar -->
        <div class="faq-section__search">
          <div class="faq-section__search-wrapper">
            <svg class="faq-section__search-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input v-model="searchQuery" type="text" :placeholder="t('home.faq.search.placeholder')"
              class="faq-section__search-input" @input="handleSearch" />
            <button v-if="searchQuery" type="button" class="faq-section__search-clear" @click="clearSearch"
              :aria-label="t('home.faq.search.clear')">
              <svg class="faq-section__clear-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <!-- Category Filter -->
        <div class="faq-section__categories">
          <button v-for="category in categories" :key="category.id" type="button" class="faq-section__category"
            :class="{ 'faq-section__category--active': selectedCategory === category.id }"
            @click="selectCategory(category.id)">
            <svg class="faq-section__category-icon" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{{ t(category.labelKey) }}

            </span>
            <span class="faq-section__category-count">{{ getCategoryCount(category.id) }}

            </span>
          </button>
        </div>

        <!-- Quick Stats -->
        <div class="faq-section__stats">
          <div class="faq-section__stat">
            <span class="faq-section__stat-number">{{ filteredFaqs.length }}

            </span>
            <span class="faq-section__stat-label">{{ t('home.faq.stats.questions') }}

            </span>
          </div>
          <div class="faq-section__stat">
            <span class="faq-section__stat-number">{{ openFaqIds.size }}

            </span>
            <span class="faq-section__stat-label">{{ t('home.faq.stats.open') }}</span>
          </div>
        </div>
      </div>

      <!-- Enhanced Accordion -->
      <div class="faq-section__accordion">
        <FaqItem v-for="(faq, index) in filteredFaqs" :key="faq.id" :faq="faq" :is-open="openFaqIds.has(faq.id)"
          :index="index" @toggle="handleToggle" />

        <!-- No Results State -->
        <div v-if="filteredFaqs.length === 0" class="faq-section__no-results">
          <svg class="faq-section__no-results-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.47-.881-6.08-2.33M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <h3 class="faq-section__no-results-title">{{ t('home.faq.noResults.title') }}

          </h3>
          <p class="faq-section__no-results-description">{{ t('home.faq.noResults.description') }}

          </p>
          <button type="button" class="faq-section__no-results-cta" @click="clearSearch">
            {{ t('home.faq.noResults.cta') }}

          </button>
        </div>
      </div>

      <!-- Support CTA -->
      <div class="faq-section__support">
        <div class="faq-section__support-content">
          <h3 class="faq-section__support-title">{{ t('home.faq.support.title') }}

          </h3>
          <p class="faq-section__support-description">{{ t('home.faq.support.description') }}

          </p>
          <div class="faq-section__support-actions">
            <button type="button" class="faq-section__support-button faq-section__support-button--primary">
              <svg class="faq-section__support-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              {{ t('home.faq.support.chat') }}

            </button>
            <button type="button" class="faq-section__support-button faq-section__support-button--secondary">
              <svg class="faq-section__support-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              {{ t('home.faq.support.email') }}

            </button>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { IFaqSectionProps as Props } from '@/types/components/home';
import { ref, computed, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { HOMEPAGE_FAQS } from '@/data/home';
import { useHomepageAnalytics } from '@/composables/useHomepageAnalytics';
import SectionHeader from '@/components/ui/SectionHeader.vue';
import FaqItem from '@/components/ui/FaqItem.vue';

const props = withDefaults(defineProps<Props>(), {
  faqs: () => HOMEPAGE_FAQS,
});

const { t } = useI18n();
const { trackFaqInteraction } = useHomepageAnalytics();

const openFaqIds = ref<Set<string>>(new Set());
const searchQuery = ref('');
const selectedCategory = ref<string | null>(null);

// FAQ Categories
const categories = [
  { id: 'all', labelKey: 'home.faq.categories.all' },
  { id: 'billing', labelKey: 'home.faq.categories.billing' },
  { id: 'features', labelKey: 'home.faq.categories.features' },
  { id: 'support', labelKey: 'home.faq.categories.support' },
];

// Enhanced FAQ data with categories
const enhancedFaqs = computed(() => {
  return props.faqs.map((faq, index) => ({
    ...faq,
    category: getFaqCategory(faq.id, index),
  }));
});

// Filter FAQs based on search and category
const filteredFaqs = computed(() => {
  let filtered = enhancedFaqs.value;

  // Filter by category
  if (selectedCategory.value && selectedCategory.value !== 'all') {
    filtered = filtered.filter(faq => faq.category === selectedCategory.value);
  }

  // Filter by search query
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase();
    filtered = filtered.filter(faq => {
      const question = t(faq.qKey).toLowerCase();
      const answer = t(faq.aKey).toLowerCase();
      return question.includes(query) || answer.includes(query);
    });
  }

  return filtered;
});

const getFaqCategory = (faqId: string, index: number): string => {
  // Map FAQ IDs to categories
  const categoryMap: Record<string, string> = {
    'faq-3': 'features',
    'faq-6': 'support'
  };
  return categoryMap[faqId] || 'features';
};

const getCategoryCount = (categoryId: string): number => {
  if (categoryId === 'all') return props.faqs.length;
  return enhancedFaqs.value.filter(faq => faq.category === categoryId).length;
};

const handleToggle = (faqId: string): void => {
  const isOpen = openFaqIds.value.has(faqId);
  if (isOpen) {
    openFaqIds.value.delete(faqId);
  }

  else {
    openFaqIds.value.add(faqId);
  }

  const faq = props.faqs.find((f) => f.id === faqId);
  if (faq) {
    trackFaqInteraction({
      action: isOpen ? 'collapse' : 'expand',
      questionId: faqId,
      question: t(faq.qKey),
    });
  }
};

const handleSearch = (): void => {
  // Auto-open first result if searching
  if (searchQuery.value.trim() && filteredFaqs.value.length > 0) {
    openFaqIds.value.add(filteredFaqs.value[0].id);
  }
};

const clearSearch = (): void => {
  searchQuery.value = '';
  selectedCategory.value = null;
};

const selectCategory = (categoryId: string): void => {
  selectedCategory.value = categoryId;
  // Auto-open first result when filtering
  if (filteredFaqs.value.length > 0) {
    openFaqIds.value.add(filteredFaqs.value[0].id);
  }
};

// Watch for search changes to track analytics
watch(searchQuery, (newQuery) => {
  if (newQuery.trim()) {
    trackFaqInteraction({
      action: 'search',
      questionId: 'search',
      question: newQuery,
    });
  }
});
</script>

<style scoped>
.faq-section {
  @apply bg-gradient-to-br from-gray-50 via-white to-blue-50/30 py-16 dark:from-slate-800 dark:via-slate-900 dark:to-blue-900/20 md:py-24;
}

.faq-section__container {
  @apply container mx-auto max-w-4xl px-6 md:px-8;
}

/* Enhanced FAQ Features */
.faq-section__features {
  @apply mb-12 space-y-6;
}

/* FAQ Accordion */
.faq-section__accordion {
  @apply bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-gray-200 dark:border-slate-700 overflow-hidden;
}

/* Search Bar */
.faq-section__search {
  @apply w-full max-w-2xl mx-auto;
}

.faq-section__search-wrapper {
  @apply relative flex items-center;
}

.faq-section__search-icon {
  @apply absolute left-4 w-5 h-5 text-gray-400 z-10;
}

.faq-section__search-input {
  @apply w-full pl-12 pr-12 py-4 rounded-2xl border-2 border-gray-200 dark:border-gray-700;
  @apply bg-white dark:bg-slate-800 text-gray-900 dark:text-white;
  @apply placeholder-gray-500 dark:placeholder-gray-400;
  @apply focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 focus:outline-none;
  @apply transition-all duration-300;
  @apply shadow-lg shadow-gray-200/50 dark:shadow-gray-900/50;
}

.faq-section__search-clear {
  @apply absolute right-4 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700;
  @apply transition-colors duration-200;
}

.faq-section__clear-icon {
  @apply w-4 h-4 text-gray-400;
}

/* Category Filter */
.faq-section__categories {
  @apply flex flex-wrap justify-center gap-3;
}

.faq-section__category {
  @apply flex items-center gap-2 px-4 py-2 rounded-full;
  @apply text-sm font-medium text-gray-600 dark:text-gray-300;
  @apply bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700;
  @apply hover:bg-gray-50 dark:hover:bg-slate-700;
  @apply transition-all duration-200;
  @apply shadow-sm hover:shadow-md;
}

.faq-section__category--active {
  @apply bg-gradient-to-r from-blue-600 to-purple-600;
  @apply text-white border-transparent;
  @apply shadow-lg shadow-blue-500/30;
}

.faq-section__category-icon {
  @apply w-4 h-4;
}

.faq-section__category-count {
  @apply px-2 py-0.5 text-xs rounded-full;
  @apply bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300;
}

.faq-section__category--active .faq-section__category-count {
  @apply bg-white/20 text-white;
}

/* Quick Stats */
.faq-section__stats {
  @apply flex justify-center gap-8;
}

.faq-section__stat {
  @apply text-center;
}

.faq-section__stat-number {
  @apply block text-2xl font-bold text-blue-600 dark:text-blue-400;
}

.faq-section__stat-label {
  @apply text-sm text-gray-600 dark:text-gray-400;
}

/* Enhanced Accordion */
.faq-section__accordion {
  @apply divide-y divide-slate-200 rounded-3xl border-2 border-slate-200 bg-white dark:divide-slate-700 dark:border-slate-700 dark:bg-slate-900;
  @apply shadow-2xl shadow-gray-200/50 dark:shadow-gray-900/50;
  @apply overflow-hidden;
}

/* No Results State */
.faq-section__no-results {
  @apply text-center py-12 px-6;
}

.faq-section__no-results-icon {
  @apply w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4;
}

.faq-section__no-results-title {
  @apply text-xl font-bold text-gray-900 dark:text-white mb-2;
}

.faq-section__no-results-description {
  @apply text-gray-600 dark:text-gray-400 mb-6;
}

.faq-section__no-results-cta {
  @apply px-6 py-3 rounded-xl font-medium;
  @apply bg-blue-600 text-white;
  @apply hover:bg-blue-700 transition-colors duration-200;
}

/* Support CTA */
.faq-section__support {
  @apply mt-16 p-8 rounded-3xl;
  @apply bg-gradient-to-r from-blue-600 to-purple-600;
  @apply shadow-2xl shadow-blue-500/30;
}

.faq-section__support-content {
  @apply text-center text-white;
}

.faq-section__support-title {
  @apply text-2xl font-bold mb-3;
}

.faq-section__support-description {
  @apply text-blue-100 mb-8 max-w-2xl mx-auto;
}

.faq-section__support-actions {
  @apply flex flex-col sm:flex-row gap-4 justify-center;
}

.faq-section__support-button {
  @apply flex items-center gap-3 px-6 py-3 rounded-xl font-medium;
  @apply transition-all duration-200;
  @apply focus:outline-none focus:ring-4 focus:ring-white/20;
}

.faq-section__support-button--primary {
  @apply bg-white text-blue-600;
  @apply hover:bg-gray-100 shadow-lg;
}

.faq-section__support-button--secondary {
  @apply bg-white/10 text-white border-2 border-white/30;
  @apply hover:bg-white/20 hover:border-white/50;
}

.faq-section__support-icon {
  @apply w-5 h-5;
}

/* Responsive Design */
@media (width <=640px) {
  .faq-section__categories {
    @apply justify-start overflow-x-auto pb-2;
  }

  .faq-section__category {
    @apply flex-shrink-0;
  }

  .faq-section__support-actions {
    @apply flex-col;
  }
}
</style>
