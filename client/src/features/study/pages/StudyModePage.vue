<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <div class="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <!-- Loading State -->
      <div v-if="isLoading" class="flex min-h-[400px] items-center justify-center">
        <div class="text-center">
          <!-- Animated loader -->
          <div class="relative mb-6">
            <div class="h-16 w-16 rounded-full border-4 border-primary-200 dark:border-primary-900"></div>
            <div class="absolute left-0 top-0 h-16 w-16 animate-spin rounded-full border-4 border-transparent border-t-primary-600 dark:border-t-primary-400"></div>
          </div>
          <!-- Loading text with pulse animation -->
          <p class="animate-pulse text-lg font-medium text-gray-700 dark:text-gray-300">{{ t('study.loading') }}</p>
          <p class="mt-2 text-sm text-gray-500 dark:text-gray-500">Preparing your questions...</p>
        </div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="rounded-xl border border-red-200 bg-red-50 p-8 shadow-lg dark:border-red-800 dark:bg-red-900/20">
        <div class="flex flex-col items-center text-center">
          <!-- Error icon -->
          <div class="mb-4 rounded-full bg-red-100 p-3 dark:bg-red-900/50">
            <svg class="h-12 w-12 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 class="mb-2 text-xl font-bold text-red-900 dark:text-red-200">
            {{ t('study.error.title') }}
          </h3>
          <p class="mb-6 max-w-md text-red-700 dark:text-red-300">{{ error }}</p>
          <button
            type="button"
            class="rounded-lg bg-red-600 px-6 py-3 font-medium text-white shadow-sm transition-all duration-200 hover:bg-red-700 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            @click="() => loadQuestions(false)"
          >
            <span class="flex items-center gap-2">
              <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              {{ t('study.error.retry') }}
            </span>
          </button>
        </div>
      </div>

      <!-- Empty State - No Questions Available -->
      <div v-else-if="!isLoading && !error && allQuestions.length === 0">
        <EmptyState
          variant="default"
          icon="📚"
          :title="t('study.empty.title', 'No Questions Available')"
          :description="t('study.empty.description', 'There are no questions available for this difficulty and framework combination. Try selecting a different framework or difficulty level.')"
          :primary-action="t('study.empty.changeFramework', 'Change Framework')"
          :secondary-action="t('study.empty.goBack', 'Go Back')"
          @primary-action="changeFramework"
          @secondary-action="goBack"
        />
      </div>

      <!-- Empty State - No Results After Filtering -->
      <div v-else-if="!isLoading && !error && allQuestions.length > 0 && filteredQuestions.length === 0">
        <EmptyState
          variant="compact"
          icon="🔍"
          :title="t('study.emptyFiltered.title', 'No Questions Match Your Filters')"
          :description="t('study.emptyFiltered.description', 'Try adjusting your search query or filter settings to see more questions.')"
          :primary-action="t('study.emptyFiltered.clearFilters', 'Clear Filters')"
          @primary-action="clearFilters"
        />
      </div>

      <!-- Study Content -->
      <div v-else-if="currentQuestion">
        <StudyHeader
          :difficulty="difficulty"
          :current-index="currentIndex"
          :loaded-count="loadedCount"
          :total-available="totalAvailable"
          @back="goBack"
        />

        <StudyFilters
          v-model:search-query="searchQuery"
          v-model:question-type-filter="questionTypeFilter"
          v-model:answered-filter="answeredFilter"
          :practice-mode="practiceMode"
          :bookmark-count="bookmarkedQuestions.size"
          :filtered-count="filteredQuestions.length"
          :total-count="allQuestions.length"
          :progress="progress"
          @mode-change="setPracticeMode"
          @clear="clearFilters"
        />

        <StudyQuestion
          :question="currentQuestion"
          :locale="locale"
          v-model:selected-answer="selectedStudyAnswer"
          v-model:text-answer="studyTextAnswer"
          v-model:multiple-answers="studyMultipleAnswers"
          :show-answer="showAnswer"
          :is-bookmarked="isBookmarked"
          :can-go-previous="currentIndex > 0"
          :is-loading-more="isLoadingMore"
          :is-last-question="currentIndex >= loadedCount - 1"
          :has-more="hasMore"
          @reveal="revealAnswer"
          @previous="previousQuestion"
          @next="nextQuestion"
          @toggle-bookmark="toggleBookmark"
        />

        <StudyNavigation
          :current-index="currentIndex"
          :loaded-count="loadedCount"
          :total-available="totalAvailable"
          :has-more="hasMore"
          :is-loading-more="isLoadingMore"
          :session-time="sessionElapsedTime"
          :is-paused="isTimerPaused"
          @jump="jumpToQuestion"
          @load-more="loadMore"
          @previous="previousQuestion"
          @next="nextQuestion"
          @pause="pauseSessionTimer"
          @resume="resumeSessionTimer"
          @reset="resetSessionTimer"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from "vue";
import { useI18n } from "vue-i18n";
import { useRouter, useRoute } from "vue-router";
import type { Question } from "@shared/types/quiz";
import { useAnalytics } from "@/composables/useAnalytics";
import EmptyState from "@/components/EmptyState.vue";
import StudyHeader from "../components/StudyHeader.vue";
import StudyFilters from "../components/StudyFilters.vue";
import StudyQuestion from "../components/StudyQuestion.vue";
import StudyNavigation from "../components/StudyNavigation.vue";

const { t, locale } = useI18n();
const router = useRouter();
const route = useRoute();
const { track } = useAnalytics();

const difficulty = computed(() => route.params.difficulty as "easy" | "medium" | "hard");
const framework = computed(() => route.params.framework as string);

const allQuestions = ref<Question[]>([]);
const currentIndex = ref(0);
const showAnswer = ref(false);
const selectedStudyAnswer = ref<string | null>(null);
const studyTextAnswer = ref("");
const studyMultipleAnswers = ref<string[]>([]);
const bookmarkedQuestions = ref<Set<string>>(new Set());
const answeredQuestions = ref<Set<string>>(new Set());
const isLoading = ref(true);
const isLoadingMore = ref(false);
const error = ref<string | null>(null);
const totalAvailable = ref(0);
const hasMore = ref(false);
const currentOffset = ref(0);
const pageSize = 10;

// Search & Filter state
const searchQuery = ref('');
const questionTypeFilter = ref<'all' | Question['type']>('all');
const answeredFilter = ref<'all' | 'answered' | 'unanswered'>('all');

// Session timer
const sessionStartTime = ref(Date.now());
const sessionElapsedTime = ref(0);
const isTimerPaused = ref(false);
let sessionTimerInterval: ReturnType<typeof setInterval> | null = null;

// Practice modes
type PracticeMode = 'sequential' | 'random' | 'bookmarked';
const practiceMode = ref<PracticeMode>('sequential');

// Mobile optimizations
const isMobileTimerSticky = ref(false);
let touchStartX = 0;
let touchStartY = 0;
let touchEndX = 0;
let touchEndY = 0;

// Filtered questions based on search and filters
const filteredQuestions = computed(() => {
  let filtered = [...allQuestions.value];

  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase();
    filtered = filtered.filter(q => {
      const questionText = q.content?.[locale.value as 'en' | 'ar']?.question?.toLowerCase() || '';
      const category = q.category?.toLowerCase() || '';
      const tags = q.tags?.join(' ').toLowerCase() || '';
      return questionText.includes(query) || category.includes(query) || tags.includes(query);
    });
  }

  if (questionTypeFilter.value !== 'all') {
    filtered = filtered.filter(q => q.type === questionTypeFilter.value);
  }

  if (answeredFilter.value === 'answered') {
    filtered = filtered.filter(q => answeredQuestions.value.has(q._id));
  } else if (answeredFilter.value === 'unanswered') {
    filtered = filtered.filter(q => !answeredQuestions.value.has(q._id));
  }

  return filtered;
});

const questions = computed(() => filteredQuestions.value);
const currentQuestion = computed(() => questions.value[currentIndex.value]);
const loadedCount = computed(() => questions.value.length);
const progress = computed(() => ((currentIndex.value + 1) / loadedCount.value) * 100);
const isBookmarked = computed(() =>
  currentQuestion.value ? bookmarkedQuestions.value.has(currentQuestion.value._id) : false
);

const clearFilters = () => {
  searchQuery.value = '';
  questionTypeFilter.value = 'all';
  answeredFilter.value = 'all';
};

const setPracticeMode = (mode: PracticeMode) => {
  if (mode === 'bookmarked' && bookmarkedQuestions.value.size === 0) {
    return;
  }

  track('practice_mode_changed', {
    difficulty: difficulty.value,
    fromMode: practiceMode.value,
    toMode: mode,
    bookmarkCount: bookmarkedQuestions.value.size,
  });

  practiceMode.value = mode;
  currentIndex.value = 0;

  if (mode === 'bookmarked') {
    filterBookmarkedQuestions();
  } else if (mode === 'random') {
    shuffleQuestions();
  } else {
    loadQuestions();
  }
};

const filterBookmarkedQuestions = () => {
  const bookmarkedIds = Array.from(bookmarkedQuestions.value);
  allQuestions.value = allQuestions.value.filter(q => bookmarkedIds.includes(q._id));

  if (allQuestions.value.length === 0) {
    error.value = t('study.error.noBookmarks');
  }
};

const shuffleQuestions = () => {
  const shuffled = [...allQuestions.value];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = shuffled[i];
    const swapItem = shuffled[j];
    if (temp && swapItem) {
      shuffled[i] = swapItem;
      shuffled[j] = temp;
    }
  }
  allQuestions.value = shuffled;
};

const loadQuestions = async (append = false) => {
  if (append) {
    isLoadingMore.value = true;
  } else {
    isLoading.value = true;
    currentOffset.value = 0;
    allQuestions.value = [];
  }

  error.value = null;

  try {
    // Build query params
    const params = new URLSearchParams({
      difficulty: difficulty.value,
      limit: pageSize.toString(),
      offset: currentOffset.value.toString(),
    });

    // Add framework if not random
    if (framework.value && framework.value !== 'random') {
      params.append('framework', framework.value);
    }

    const response = await fetch(
      `/api/v1/questions?${params.toString()}`,
      {
        credentials: 'include',
      }
    );

    if (!response.ok) {
      if (response.status === 401) {
        // User not authenticated - redirect to login
        const currentLocale = route.params.locale || 'en';
        await router.push(`/${currentLocale}/login?redirect=${route.fullPath}`);
        return;
      }
      if (response.status === 403) {
        const errorData = await response.json();
        track('study_gate_shown', {
          reason: 'difficulty_locked',
          difficulty: difficulty.value,
          suggestedPlan: errorData.suggestedPlan || 'intermediate',
          requiredPlan: errorData.requiredPlan || 'intermediate',
        });
        throw new Error(errorData.message || 'Access denied: Upgrade your plan to access this difficulty');
      }
      throw new Error('Failed to load questions');
    }

    const data = await response.json();

    if (append) {
      allQuestions.value = [...allQuestions.value, ...(data.questions || [])];
    } else {
      allQuestions.value = data.questions || [];
    }

    totalAvailable.value = data.total || 0;
    hasMore.value = data.hasMore || false;
    currentOffset.value += (data.questions || []).length;

    if (allQuestions.value.length === 0 && !append) {
      error.value = t('study.error.noQuestions');
    }

    if (!append && allQuestions.value.length > 0) {
      track('study_started', {
        difficulty: difficulty.value,
        practiceMode: practiceMode.value,
        totalAvailable: totalAvailable.value,
      });
    }

    if (!append) {
      const savedBookmarks = localStorage.getItem(`bookmarks_${difficulty.value}`);
      if (savedBookmarks) {
        bookmarkedQuestions.value = new Set(JSON.parse(savedBookmarks));
      }

      const savedAnswered = localStorage.getItem(`answered_${difficulty.value}`);
      if (savedAnswered) {
        answeredQuestions.value = new Set(JSON.parse(savedAnswered));
      }
    }

    if (!append && practiceMode.value === 'random') {
      shuffleQuestions();
    } else if (!append && practiceMode.value === 'bookmarked') {
      filterBookmarkedQuestions();
    }
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : t('study.error.generic');
    error.value = errorMessage;

    track('error', {
      error_message: errorMessage,
      context: 'study_load_questions',
      difficulty: difficulty.value,
      append,
    });
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

  if (currentQuestion.value) {
    track('reveal_clicked', {
      difficulty: difficulty.value,
      questionId: currentQuestion.value._id,
      questionType: currentQuestion.value.type,
      hadSelectedAnswer: selectedStudyAnswer.value !== null || studyTextAnswer.value !== '' || studyMultipleAnswers.value.length > 0,
      timeOnQuestion: sessionElapsedTime.value,
    });

    const newAnswered = new Set(answeredQuestions.value);
    newAnswered.add(currentQuestion.value._id);
    answeredQuestions.value = newAnswered;
    localStorage.setItem(`answered_${difficulty.value}`, JSON.stringify([...newAnswered]));
  }
};

const nextQuestion = () => {
  if (currentIndex.value < loadedCount.value - 1) {
    currentIndex.value++;
    resetStudyState();

    if (hasMore.value && currentIndex.value >= loadedCount.value - 3 && !isLoadingMore.value) {
      loadMore();
    }
  } else if (hasMore.value) {
    loadMore();
  } else {
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
  saveSessionState();
  // Go back to framework selection page: /:locale/study/:difficulty
  router.push(`/${currentLocale}/study/${difficulty.value}`);
};

const changeFramework = () => {
  const currentLocale = route.params.locale || 'en';
  saveSessionState();
  // Navigate to framework selection page
  router.push(`/${currentLocale}/study/${difficulty.value}`);
};

// Session timer functions
const startSessionTimer = () => {
  if (sessionTimerInterval) return;

  sessionTimerInterval = setInterval(() => {
    if (!isTimerPaused.value) {
      sessionElapsedTime.value = Math.floor((Date.now() - sessionStartTime.value) / 1000);

      if (sessionElapsedTime.value % 10 === 0) {
        saveSessionState();
      }
    }
  }, 1000);
};

const pauseSessionTimer = () => {
  isTimerPaused.value = true;
  saveSessionState();
};

const resumeSessionTimer = () => {
  const pausedDuration = Date.now() - (sessionStartTime.value + sessionElapsedTime.value * 1000);
  sessionStartTime.value += pausedDuration;
  isTimerPaused.value = false;
  saveSessionState();
};

const resetSessionTimer = () => {
  sessionStartTime.value = Date.now();
  sessionElapsedTime.value = 0;
  isTimerPaused.value = false;
  saveSessionState();
};

const saveSessionState = () => {
  const sessionState = {
    startTime: sessionStartTime.value,
    elapsedTime: sessionElapsedTime.value,
    isPaused: isTimerPaused.value,
    difficulty: difficulty.value,
  };
  localStorage.setItem(`study_session_${difficulty.value}`, JSON.stringify(sessionState));
};

const loadSessionState = () => {
  const saved = localStorage.getItem(`study_session_${difficulty.value}`);
  if (saved) {
    try {
      const state = JSON.parse(saved);
      sessionStartTime.value = state.startTime;
      sessionElapsedTime.value = state.elapsedTime;
      isTimerPaused.value = state.isPaused;
    } catch (e) {
      console.error('Failed to load session state:', e);
    }
  }
};

// Mobile swipe gesture handlers
const handleTouchStart = (event: TouchEvent) => {
  const touch = event.changedTouches[0];
  if (touch) {
    touchStartX = touch.screenX;
    touchStartY = touch.screenY;
  }
};

const handleTouchEnd = (event: TouchEvent) => {
  const touch = event.changedTouches[0];
  if (touch) {
    touchEndX = touch.screenX;
    touchEndY = touch.screenY;
    handleSwipeGesture();
  }
};

const handleSwipeGesture = () => {
  const swipeThreshold = 50;
  const verticalSwipeThreshold = 100;

  const horizontalDiff = touchEndX - touchStartX;
  const verticalDiff = Math.abs(touchEndY - touchStartY);

  if (verticalDiff > verticalSwipeThreshold) {
    return;
  }

  if (!showAnswer.value) {
    return;
  }

  if (horizontalDiff > swipeThreshold && currentIndex.value > 0) {
    previousQuestion();
  }

  if (horizontalDiff < -swipeThreshold) {
    nextQuestion();
  }
};

const handleScroll = () => {
  if (window.innerWidth >= 768) {
    isMobileTimerSticky.value = false;
    return;
  }
  isMobileTimerSticky.value = window.scrollY > 100;
};

const handleKeyboard = (event: KeyboardEvent) => {
  if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
    return;
  }

  if (!currentQuestion.value) {
    return;
  }

  const key = event.key.toLowerCase();

  if (key === 'escape') {
    event.preventDefault();
    goBack();
    return;
  }

  if (key === ' ') {
    event.preventDefault();
    if (!showAnswer.value) {
      revealAnswer();
    } else {
      nextQuestion();
    }
    return;
  }

  if (key === 'arrowleft' && showAnswer.value && currentIndex.value > 0) {
    event.preventDefault();
    previousQuestion();
    return;
  }

  if (key === 'arrowright' && showAnswer.value) {
    event.preventDefault();
    nextQuestion();
    return;
  }

  if (key === 'b' && showAnswer.value) {
    event.preventDefault();
    toggleBookmark();
    return;
  }

  if (!showAnswer.value && (currentQuestion.value.type === 'multiple-choice' || currentQuestion.value.type === 'true-false')) {
    const options = currentQuestion.value.content?.[locale.value as 'en' | 'ar']?.options ?? [];
    const numKey = parseInt(key);

    if (!isNaN(numKey) && numKey >= 1 && numKey <= options.length) {
      event.preventDefault();
      const option = options[numKey - 1];
      if (option) {
        selectedStudyAnswer.value = option.id ?? (option as { _id?: string })._id ?? '';
      }
    }
  }
};

onMounted(() => {
  loadQuestions();
  loadSessionState();
  startSessionTimer();
  window.addEventListener('keydown', handleKeyboard);
  window.addEventListener('touchstart', handleTouchStart, { passive: true });
  window.addEventListener('touchend', handleTouchEnd, { passive: true });
  window.addEventListener('scroll', handleScroll, { passive: true });
});

onUnmounted(() => {
  if (sessionTimerInterval) {
    clearInterval(sessionTimerInterval);
    sessionTimerInterval = null;
  }
  saveSessionState();
  window.removeEventListener('keydown', handleKeyboard);
  window.removeEventListener('touchstart', handleTouchStart);
  window.removeEventListener('touchend', handleTouchEnd);
  window.removeEventListener('scroll', handleScroll);
});
</script>
