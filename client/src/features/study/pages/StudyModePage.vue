<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <div class="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <!-- Loading State -->
      <div v-if="isLoading" class="flex min-h-[400px] items-center justify-center">
        <div class="text-center">
          <div class="mb-4 inline-block h-12 w-12 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600"></div>
          <p class="text-gray-600 dark:text-gray-400">{{ t('study.loading') }}</p>
        </div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="rounded-lg bg-red-50 p-6 dark:bg-red-900/20">
        <h3 class="mb-2 text-lg font-semibold text-red-900 dark:text-red-200">
          {{ t('study.error.title') }}
        </h3>
        <p class="text-red-700 dark:text-red-300">{{ error }}</p>
        <button
          type="button"
          class="mt-4 rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700"
          @click="loadQuestions"
        >
          {{ t('study.error.retry') }}
        </button>
      </div>

      <!-- Study Content -->
      <div v-else-if="currentQuestion">
        <!-- Header -->
        <div class="mb-6 flex items-center justify-between">
          <div class="flex items-center gap-4">
            <button
              type="button"
              class="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
              @click="goBack"
            >
              ← {{ t('study.backToSelection') }}
            </button>
            <div class="flex items-center gap-2">
              <span
                class="inline-flex items-center rounded-full px-3 py-1 text-sm font-medium"
                :class="getDifficultyBadgeClass(difficulty)"
              >
                {{ getDifficultyIcon(difficulty) }} {{ t(`difficulty.${difficulty}.label`) }}
              </span>
            </div>
          </div>
          <div class="text-sm text-gray-600 dark:text-gray-400">
            {{ currentIndex + 1 }} / {{ totalQuestions }}
          </div>
        </div>

        <!-- Progress Bar -->
        <div class="mb-6 h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
          <div
            class="h-full bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-300"
            :style="{ width: `${progress}%` }"
          ></div>
        </div>

        <!-- Question Card -->
        <div class="rounded-lg bg-white p-8 shadow-sm dark:bg-gray-800">
          <div class="mb-6">
            <h2 class="mb-4 text-2xl font-bold text-gray-900 dark:text-white">
              {{ getCurrentQuestionText() }}
            </h2>
            
            <!-- Question Metadata -->
            <div class="flex flex-wrap gap-2">
              <span v-if="currentQuestion.category" class="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                {{ currentQuestion.category }}
              </span>
              <span v-for="tag in currentQuestion.tags" :key="tag" class="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                {{ tag }}
              </span>
            </div>
          </div>

          <!-- Answer Section -->
          <div v-if="showAnswer" class="mb-6 rounded-lg bg-green-50 p-6 dark:bg-green-900/20">
            <h3 class="mb-2 flex items-center gap-2 font-semibold text-green-900 dark:text-green-200">
              <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
              </svg>
              {{ t('study.answer') }}
            </h3>
            <div class="text-green-800 dark:text-green-300" v-html="getCurrentExplanation()"></div>
          </div>

          <!-- Actions -->
          <div class="flex flex-wrap gap-3">
            <button
              v-if="!showAnswer"
              type="button"
              class="rounded-lg bg-primary-600 px-6 py-3 font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
              @click="revealAnswer"
            >
              {{ t('study.revealAnswer') }}
            </button>

            <template v-else>
              <button
                type="button"
                class="rounded-lg bg-gray-200 px-6 py-3 font-medium text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                :disabled="currentIndex === 0"
                @click="previousQuestion"
              >
                ← {{ t('study.previous') }}
              </button>

              <button
                type="button"
                class="rounded-lg bg-primary-600 px-6 py-3 font-medium text-white hover:bg-primary-700"
                @click="nextQuestion"
              >
                {{ currentIndex < totalQuestions - 1 ? t('study.next') : t('study.finish') }} →
              </button>

              <button
                type="button"
                class="rounded-lg border border-gray-300 px-6 py-3 font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                @click="toggleBookmark"
              >
                {{ isBookmarked ? '🔖' : '📑' }} {{ isBookmarked ? t('study.bookmarked') : t('study.bookmark') }}
              </button>
            </template>
          </div>
        </div>

        <!-- Navigation -->
        <div class="mt-6 rounded-lg bg-white p-6 shadow-sm dark:bg-gray-800">
          <h3 class="mb-4 font-semibold text-gray-900 dark:text-white">
            {{ t('study.quickNavigation') }}
          </h3>
          <div class="grid grid-cols-10 gap-2 sm:grid-cols-15 md:grid-cols-20">
            <button
              v-for="(q, idx) in questions"
              :key="q._id"
              type="button"
              :class="getQuestionNavClass(idx)"
              @click="jumpToQuestion(idx)"
            >
              {{ idx + 1 }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import { useRouter, useRoute } from "vue-router";
import type { Question } from "@shared/types/quiz";

const { t, locale } = useI18n();
const router = useRouter();
const route = useRoute();

const difficulty = computed(() => route.params.difficulty as "easy" | "medium" | "hard");

const questions = ref<Question[]>([]);
const currentIndex = ref(0);
const showAnswer = ref(false);
const bookmarkedQuestions = ref<Set<string>>(new Set());
const isLoading = ref(true);
const error = ref<string | null>(null);

const currentQuestion = computed(() => questions.value[currentIndex.value]);
const totalQuestions = computed(() => questions.value.length);
const progress = computed(() => ((currentIndex.value + 1) / totalQuestions.value) * 100);
const isBookmarked = computed(() => 
  currentQuestion.value ? bookmarkedQuestions.value.has(currentQuestion.value._id) : false
);

const getDifficultyIcon = (diff: string) => {
  const icons = { easy: '🟢', medium: '🟡', hard: '🔴' };
  return icons[diff as keyof typeof icons] || '⚪';
};

const getDifficultyBadgeClass = (diff: string) => {
  const classes = {
    easy: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    hard: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  };
  return classes[diff as keyof typeof classes] || 'bg-gray-100 text-gray-800';
};

const getCurrentQuestionText = () => {
  if (!currentQuestion.value) return '';
  return currentQuestion.value.content?.[locale.value as 'en' | 'ar']?.question ?? '';
};

const getCurrentExplanation = () => {
  if (!currentQuestion.value) return '';
  return currentQuestion.value.content?.[locale.value as 'en' | 'ar']?.explanation ?? '';
};

const getQuestionNavClass = (idx: number) => {
  const baseClass = 'h-10 w-10 rounded text-sm font-medium transition-colors';
  
  if (idx === currentIndex.value) {
    return `${baseClass} bg-primary-600 text-white`;
  }
  
  return `${baseClass} bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600`;
};

const loadQuestions = async () => {
  isLoading.value = true;
  error.value = null;
  
  try {
    // TODO: Replace with actual API call
    // For now, using mock data
    const response = await fetch(`/api/questions?difficulty=${difficulty.value}`, {
      credentials: 'include',
    });
    
    if (!response.ok) {
      throw new Error('Failed to load questions');
    }
    
    const data = await response.json();
    questions.value = data.questions || [];
    
    if (questions.value.length === 0) {
      error.value = t('study.error.noQuestions');
    }
    
    // Load bookmarks from localStorage
    const savedBookmarks = localStorage.getItem(`bookmarks_${difficulty.value}`);
    if (savedBookmarks) {
      bookmarkedQuestions.value = new Set(JSON.parse(savedBookmarks));
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : t('study.error.generic');
  } finally {
    isLoading.value = false;
  }
};

const revealAnswer = () => {
  showAnswer.value = true;
};

const nextQuestion = () => {
  if (currentIndex.value < totalQuestions.value - 1) {
    currentIndex.value++;
    showAnswer.value = false;
  } else {
    // Finished study session
    goBack();
  }
};

const previousQuestion = () => {
  if (currentIndex.value > 0) {
    currentIndex.value--;
    showAnswer.value = false;
  }
};

const jumpToQuestion = (idx: number) => {
  currentIndex.value = idx;
  showAnswer.value = false;
};

const toggleBookmark = () => {
  if (!currentQuestion.value) return;
  
  const id = currentQuestion.value._id;
  const newBookmarks = new Set(bookmarkedQuestions.value);
  
  if (newBookmarks.has(id)) {
    newBookmarks.delete(id);
  } else {
    newBookmarks.add(id);
  }
  
  bookmarkedQuestions.value = newBookmarks;
  localStorage.setItem(`bookmarks_${difficulty.value}`, JSON.stringify([...newBookmarks]));
};

const goBack = () => {
  const currentLocale = route.params.locale || 'en';
  router.push(`/${currentLocale}/study`);
};

onMounted(() => {
  loadQuestions();
});
</script>

