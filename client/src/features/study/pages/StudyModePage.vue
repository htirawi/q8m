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
          @click="() => loadQuestions(false)"
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
            {{ currentIndex + 1 }} / {{ loadedCount }}
            <span v-if="totalAvailable > loadedCount" class="text-xs text-gray-500">
              ({{ totalAvailable }} total)
            </span>
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

          <!-- Interactive Answer Options (Study Mode) -->
          <div v-if="!showAnswer && hasInteractiveOptions && currentQuestion && currentQuestion.type !== 'fill-blank'" class="mb-6">
            <h3 class="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
              {{ t('study.selectAnswer') }}
            </h3>
            
            <!-- Multiple Choice Options -->
            <div v-if="currentQuestion && currentQuestion.type === 'multiple-choice'" class="space-y-3">
              <button
                v-for="option in getCurrentOptions()"
                :key="option.id"
                type="button"
                :class="getStudyOptionClass(option.id)"
                @click="selectStudyAnswer(option.id)"
              >
                <div class="flex items-center">
                  <div class="flex-1 text-left">{{ option.text }}</div>
                  <div v-if="selectedStudyAnswer === option.id" class="ml-4">
                    <svg class="h-5 w-5 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                    </svg>
                  </div>
                </div>
              </button>
            </div>

            <!-- True/False Options -->
            <div v-else-if="currentQuestion && currentQuestion.type === 'true-false'" class="space-y-3">
              <button
                v-for="option in getCurrentOptions()"
                :key="option.id"
                type="button"
                :class="getStudyOptionClass(option.id)"
                @click="selectStudyAnswer(option.id)"
              >
                <div class="flex items-center">
                  <div class="flex-1 text-left">{{ option.text }}</div>
                  <div v-if="selectedStudyAnswer === option.id" class="ml-4">
                    <svg class="h-5 w-5 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                    </svg>
                  </div>
                </div>
              </button>
            </div>

            <!-- Fill in the Blank -->
            <div v-else-if="currentQuestion && (currentQuestion.type as string) === 'fill-blank'" class="space-y-4">
              <input
                v-model="studyTextAnswer"
                type="text"
                class="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 focus:border-primary-500 focus:ring-2 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                :placeholder="t('study.fillBlankPlaceholder')"
              />
            </div>

            <!-- Multiple Checkbox -->
            <div v-else-if="currentQuestion && currentQuestion.type === 'multiple-checkbox'" class="space-y-3">
              <label
                v-for="option in getCurrentOptions()"
                :key="option.id"
                :class="getStudyCheckboxClass(option.id)"
              >
                <input
                  v-model="studyMultipleAnswers"
                  type="checkbox"
                  :value="option.id"
                  class="h-5 w-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <span class="ml-3 flex-1">{{ option.text }}</span>
              </label>
            </div>
          </div>

          <!-- Fill-in-blank Input (Study Mode) -->
          <div v-if="!showAnswer && currentQuestion && (currentQuestion.type as string) === 'fill-blank'" class="mb-6">
            <h3 class="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
              {{ t('study.typeAnswer') }}
            </h3>
            <input
              v-model="studyTextAnswer"
              type="text"
              class="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 focus:border-primary-500 focus:ring-2 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              :placeholder="t('study.fillBlankPlaceholder')"
            />
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
                :disabled="isLoadingMore"
                @click="nextQuestion"
              >
                <span v-if="isLoadingMore">
                  <svg class="inline h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {{ t('study.loading') }}
                </span>
                <span v-else>
                  {{ currentIndex < loadedCount - 1 ? t('study.next') : hasMore ? t('study.loadMore') : t('study.finish') }} →
                </span>
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
          <div class="mb-4 flex items-center justify-between">
            <h3 class="font-semibold text-gray-900 dark:text-white">
              {{ t('study.quickNavigation') }}
            </h3>
            <span class="text-sm text-gray-600 dark:text-gray-400">
              {{ loadedCount }} / {{ totalAvailable }} loaded
            </span>
          </div>
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
          
          <!-- Load More Button -->
          <button
            v-if="hasMore"
            type="button"
            class="mt-4 w-full rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 px-4 py-3 text-sm font-medium text-gray-700 hover:border-primary-500 hover:bg-primary-50 hover:text-primary-700 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:border-primary-400 dark:hover:bg-primary-900/20 dark:hover:text-primary-400"
            :disabled="isLoadingMore"
            @click="loadMore"
          >
            <span v-if="isLoadingMore" class="flex items-center justify-center gap-2">
              <svg class="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {{ t('study.loading') }}
            </span>
            <span v-else>
              {{ t('study.loadMore') }} ({{ totalAvailable - loadedCount }} {{ t('study.remaining') }})
            </span>
          </button>
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
const selectedStudyAnswer = ref<string | null>(null);
const studyTextAnswer = ref("");
const studyMultipleAnswers = ref<string[]>([]);
const bookmarkedQuestions = ref<Set<string>>(new Set());
const isLoading = ref(true);
const isLoadingMore = ref(false);
const error = ref<string | null>(null);
const totalAvailable = ref(0); // Total in DB
const hasMore = ref(false);
const currentOffset = ref(0);
const pageSize = 10; // Load 10 at a time

const currentQuestion = computed(() => questions.value[currentIndex.value]);
const loadedCount = computed(() => questions.value.length);
const progress = computed(() => ((currentIndex.value + 1) / loadedCount.value) * 100);

// Study mode specific computed properties
const hasInteractiveOptions = computed(() => {
  if (!currentQuestion.value) return false;
  return currentQuestion.value.type === 'multiple-choice' || 
         currentQuestion.value.type === 'true-false' ||
         currentQuestion.value.type === 'fill-blank' ||
         currentQuestion.value.type === 'multiple-checkbox';
});
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

const getCurrentOptions = () => {
  if (!currentQuestion.value) return [];
  
  const options = currentQuestion.value.content?.[locale.value as 'en' | 'ar']?.options;
  if (!options || !Array.isArray(options)) return [];
  
  return options.map((option: any) => ({
    id: option.id || option._id || `option_${Math.random()}`,
    text: option.text || option,
    isCorrect: option.isCorrect || false
  }));
};

const getQuestionNavClass = (idx: number) => {
  const baseClass = 'h-10 w-10 rounded text-sm font-medium transition-colors';
  
  if (idx === currentIndex.value) {
    return `${baseClass} bg-primary-600 text-white`;
  }
  
  return `${baseClass} bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600`;
};

const loadQuestions = async (append = false) => {
  if (append) {
    isLoadingMore.value = true;
  } else {
    isLoading.value = true;
    currentOffset.value = 0;
    questions.value = [];
  }
  
  error.value = null;
  
  try {
    const response = await fetch(
      `/api/questions?difficulty=${difficulty.value}&limit=${pageSize}&offset=${currentOffset.value}`,
      {
        credentials: 'include',
      }
    );
    
    if (!response.ok) {
      throw new Error('Failed to load questions');
    }
    
    const data = await response.json();
    
    if (append) {
      questions.value = [...questions.value, ...(data.questions || [])];
    } else {
      questions.value = data.questions || [];
    }
    
    totalAvailable.value = data.total || 0;
    hasMore.value = data.hasMore || false;
    currentOffset.value += (data.questions || []).length;
    
    if (questions.value.length === 0 && !append) {
      error.value = t('study.error.noQuestions');
    }
    
    // Load bookmarks from localStorage
    if (!append) {
      const savedBookmarks = localStorage.getItem(`bookmarks_${difficulty.value}`);
      if (savedBookmarks) {
        bookmarkedQuestions.value = new Set(JSON.parse(savedBookmarks));
      }
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : t('study.error.generic');
  } finally {
    isLoading.value = false;
    isLoadingMore.value = false;
  }
};

const loadMore = () => {
  if (!hasMore.value || isLoadingMore.value) return;
  loadQuestions(true);
};

const revealAnswer = () => {
  showAnswer.value = true;
};

const nextQuestion = () => {
  if (currentIndex.value < loadedCount.value - 1) {
    currentIndex.value++;
    resetStudyState();
    
    // Auto-load more when approaching end
    if (hasMore.value && currentIndex.value >= loadedCount.value - 3 && !isLoadingMore.value) {
      loadMore();
    }
  } else if (hasMore.value) {
    // Load more questions
    loadMore();
  } else {
    // Finished study session
    goBack();
  }
};

const previousQuestion = () => {
  if (currentIndex.value > 0) {
    currentIndex.value--;
    resetStudyState();
  }
};

const jumpToQuestion = (idx: number) => {
  currentIndex.value = idx;
  resetStudyState();
};

// Study mode interactive functions
const selectStudyAnswer = (optionId: string) => {
  selectedStudyAnswer.value = optionId;
};

const getStudyOptionClass = (optionId: string) => {
  const baseClass = "w-full rounded-lg border p-4 text-left transition-all hover:shadow-md";
  const isSelected = selectedStudyAnswer.value === optionId;
  
  if (isSelected) {
    return `${baseClass} border-primary-500 bg-primary-50 text-primary-900 dark:bg-primary-900/20 dark:text-primary-200`;
  }
  
  return `${baseClass} border-gray-200 bg-white text-gray-900 hover:border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white`;
};

const getStudyCheckboxClass = (optionId: string) => {
  const baseClass = "flex cursor-pointer items-center rounded-lg border p-4 transition-all hover:shadow-md";
  const isSelected = studyMultipleAnswers.value.includes(optionId);
  
  if (isSelected) {
    return `${baseClass} border-primary-500 bg-primary-50 dark:bg-primary-900/20`;
  }
  
  return `${baseClass} border-gray-200 bg-white hover:border-gray-300 dark:border-gray-600 dark:bg-gray-700`;
};

const resetStudyState = () => {
  showAnswer.value = false;
  selectedStudyAnswer.value = null;
  studyTextAnswer.value = "";
  studyMultipleAnswers.value = [];
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

