<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <div class="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <!-- Loading State -->
      <div v-if="isLoading" class="flex min-h-[400px] items-center justify-center">
        <div class="text-center">
          <!-- Animated loader -->
          <div class="relative mb-6">
            <div class="h-16 w-16 rounded-full border-4 border-primary-200 dark:border-primary-900"></div>
            <div
              class="absolute left-0 top-0 h-16 w-16 animate-spin rounded-full border-4 border-transparent border-t-primary-600 dark:border-t-primary-400">
            </div>
          </div>
          <!-- Loading text with pulse animation -->
          <p class="animate-pulse text-lg font-medium text-gray-700 dark:text-gray-300">{{ t('study.loading') }}

</p>
          <p class="mt-2 text-sm text-gray-500 dark:text-gray-500">Preparing your questions...</p>
        </div>
      </div>

      <!-- Error State -->
      <div v-else-if="error"
        class="rounded-xl border border-red-200 bg-red-50 p-8 shadow-lg dark:border-red-800 dark:bg-red-900/20">
        <div class="flex flex-col items-center text-center">
          <!-- Error icon -->
          <div class="mb-4 rounded-full bg-red-100 p-3 dark:bg-red-900/50">
            <svg class="h-12 w-12 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 class="mb-2 text-xl font-bold text-red-900 dark:text-red-200">
            {{ t('study.error.title') }}

          </h3>
          <p class="mb-6 max-w-md text-red-700 dark:text-red-300">{{ error }}

</p>
          <button type="button"
            class="rounded-lg bg-red-600 px-6 py-3 font-medium text-white shadow-sm transition-all duration-200 hover:bg-red-700 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            @click="() => loadQuestions(false)">
            <span class="flex items-center gap-2">
              <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              {{ t('study.error.retry') }}

            </span>
          </button>
        </div>
      </div>

      <!-- Empty State - No Questions Available -->
      <div v-else-if="!isLoading && !error && allQuestions.length === 0">
        <EmptyState variant="default" icon="📚" :title="t('study.empty.title', 'No Questions Available')"
          :description="t('study.empty.description', 'There are no questions available for this difficulty and framework combination. Try selecting a different framework or difficulty level.')"
          :primary-action="t('study.empty.changeFramework', 'Change Framework')"
          :secondary-action="t('study.empty.goBack', 'Go Back')" @primary-action="changeFramework"
          @secondary-action="goBack" />
      </div>

      <!-- Empty State - No Results After Filtering -->
      <div v-else-if="!isLoading && !error && allQuestions.length > 0 && filteredQuestions.length === 0">
        <EmptyState variant="compact" icon="🔍"
          :title="t('study.emptyFiltered.title', 'No Questions Match Your Filters')"
          :description="t('study.emptyFiltered.description', 'Try adjusting your search query or filter settings to see more questions.')"
          :primary-action="t('study.emptyFiltered.clearFilters', 'Clear Filters')" @primary-action="clearFilters" />
      </div>

      <!-- Study Content -->
      <div v-else-if="currentQuestion">
        <StudyHeader :difficulty="difficulty" :current-index="currentIndex" :total-questions="questions.length"
          :loaded-count="questions.length" @back="goBack" />

        <!-- Study Time Indicator -->
        <div class="mb-4 rounded-lg bg-blue-50 px-4 py-3 dark:bg-blue-900/20">
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-2">
              <div class="h-2 w-2 rounded-full bg-blue-500 animate-pulse"></div>
              <span class="text-sm font-medium text-blue-700 dark:text-blue-300">
                {{ t('study.sessionTime', 'Study Session') }}

              </span>
            </div>
            <div class="text-sm font-semibold text-blue-800 dark:text-blue-200">
              {{ Math.floor(currentSessionDurationSeconds / 60) }}:{{ String(currentSessionDurationSeconds %
                60).padStart(2, '0') }}

            </div>
          </div>
          <div class="mt-1 text-xs text-blue-600 dark:text-blue-400">
            {{ t('study.sessionTimeDescription', 'Time spent studying will be added to your total study time') }}

          </div>
        </div>

        <StudyFilters v-model:search-query="searchQuery" v-model:question-type-filter="questionTypeFilter"
          v-model:answered-filter="answeredFilter" :practice-mode="practiceMode" :bookmark-count="bookmarkCount"
          :filtered-count="filteredQuestions.length" :total-count="getDisplayTotal()" :progress="progress"
          @mode-change="setPracticeMode" @clear="clearFilters" />

        <StudyQuestion :question="currentQuestion" :current-index="currentIndex" :total-questions="questions.length"
          :show-answer="showAnswer" :locale="locale" :selected-answer="selectedStudyAnswer"
          :text-answer="studyTextAnswer" :multiple-answers="studyMultipleAnswers" :is-bookmarked="isBookmarked"
          :can-go-previous="currentIndex > 0" :is-loading-more="isLoadingMore"
          :is-last-question="currentIndex >= questions.length - 1" :has-more="hasMore" @reveal="revealAnswer"
          @previous="previousQuestion" @next="nextQuestion" @toggle-bookmark="toggleBookmark"
          @update:selected-answer="onAnswerSelected" @update:text-answer="onTextAnswerChanged"
          @update:multiple-answers="onMultipleAnswersChanged" />

        <StudyNavigation :current-index="currentIndex" :total-questions="questions.length"
          :answered-questions="answeredQuestions" :marked-questions="new Set(bookmarkedQuestions)"
          :loaded-count="allQuestions.length" :total-available="getDisplayTotal()" :has-more="hasMore"
          :is-loading-more="isLoadingMore" @jump="jumpToQuestion" @load-more="loadMore" @previous="previousQuestion"
          @next="nextQuestion" />
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
import { useBookmarks } from "@/composables/useBookmarks";
import EmptyState from "@/components/EmptyState.vue";
import StudyHeader from "../components/StudyHeader.vue";
import StudyFilters from "../components/StudyFilters.vue";
import StudyQuestion from "../components/StudyQuestion.vue";
import StudyNavigation from "../components/StudyNavigation.vue";

const { t, locale } = useI18n();
const router = useRouter();
const route = useRoute();
const { track } = useAnalytics();

const {
  bookmarkedQuestions,
  bookmarkCount,
  hasBookmarks,
  isQuestionBookmarked,
  toggleBookmark: toggleBookmarkAPI,
  loadBookmarkedQuestions: loadBookmarksFromAPI,
  loadBookmarkStatuses
} = useBookmarks();

const difficulty = computed(() => route.params.difficulty as "easy" | "medium" | "hard");
const framework = computed(() => route.params.framework as string);

const allQuestions = ref<Question[]>([]);
const originalQuestions = ref<Question[]>([]); // Store original questions for filtering
const originalTotalAvailable = ref(0); // Store original total from API for sequential mode
const currentIndex = ref(0);
const showAnswer = ref(false);
const selectedStudyAnswer = ref<string | null>(null);
const studyTextAnswer = ref("");
const studyMultipleAnswers = ref<string[]>([]);
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
const isExplicitlyLeaving = ref(false);
const lastActiveTime = ref(Date.now()); // Track when user was last active in this framework
let sessionTimerInterval: ReturnType<typeof setInterval> | null = null;TrackwhenuserwaslastactiveinthisframeworkletsessionTimerInterval

// Current session duration in minutes - reactive timer
const currentSessionDuration = ref(0);

// Current session duration in seconds for more precise display
const currentSessionDurationSeconds = ref(0);

// Update timer display every second
const updateSessionDisplay = () => {
  if (isTimerPaused.value) {
    currentSessionDuration.value = Math.floor(sessionElapsedTime.value / 60);
    currentSessionDurationSeconds.value = sessionElapsedTime.value;
  }

 else {
    const totalSeconds = Math.floor((Date.now() - sessionStartTime.value) / 1000);
    currentSessionDuration.value = Math.floor(totalSeconds / 60);
    currentSessionDurationSeconds.value = totalSeconds;
  }
};

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
  currentQuestion.value ? isQuestionBookmarked(currentQuestion.value._id) : false
);

const clearfilters = () => {
  searchQuery.value = '';
  questionTypeFilter.value = 'all';
  answeredFilter.value = 'all';
};

const getdisplaytotal = () => {
  // For bookmarked mode, show bookmark count
  if (practiceMode.value === 'bookmarked') {
    return bookmarkCount.value;
  }
  // For other modes, show total available
  return totalAvailable.value;
};

const getLevelFromDifficulty = (diff: string): string => {
  const levelMap: Record<string, string> = {
    easy: 'junior',
    medium: 'intermediate',
    hard: 'senior'
  };
  return levelMap[diff] || 'junior';
};

const setpracticemode = async (mode: PracticeMode) => {
  // Always allow switching to bookmarked mode, even if no bookmarks yet
  // (user might have bookmarked questions in other modes)
  if (mode === 'bookmarked' && !hasBookmarks.value) {
    // Try to load bookmarks from API first
    try {
      await loadBookmarksFromAPI({
        difficulty: difficulty.value,
        framework: framework.value
      });
      if (!hasBookmarks.value) {
        return; // No bookmarks at all
      }
    } catch (err) {
      console.error('Failed to load bookmarks:', err);
      return;
    }
  }

  track('practice_mode_changed', {
    difficulty: difficulty.value,
    fromMode: practiceMode.value,
    toMode: mode,
    bookmarkCount: bookmarkCount.value,
  });

  practiceMode.value = mode;
  currentIndex.value = 0;

  if (mode === 'bookmarked') {
    // Load bookmarked questions from API
    await loadBookmarkedQuestions();
  } else if (mode === 'random') {
    shuffleQuestions();
  }

 else {
    // Sequential mode - reset to original questions and restore original total
    allQuestions.value = [...originalQuestions.value];
    // Restore the original totalAvailable value for sequential mode
    // This ensures the Quick Navigation shows correct counts when switching back from bookmarked mode
    totalAvailable.value = originalTotalAvailable.value;
  }
};

const loadbookmarkedquestions = async () => {
  if (bookmarkCount.value === 0) {
    error.value = t('study.error.noBookmarks');
    return;
  }

  try {
    isLoading.value = true;
    error.value = null;
    currentOffset.value = 0;

    // Use the new bookmark API
    const questions = await loadBookmarksFromAPI({
      difficulty: difficulty.value,
      framework: framework.value
    });

    // Only update allQuestions, DO NOT overwrite originalQuestions
    // originalQuestions should always contain the full dataset
    allQuestions.value = questions || [];
    // For bookmarked mode, totalAvailable should be the number of bookmarked questions
    totalAvailable.value = questions.length;
    hasMore.value = false; // No pagination for bookmarked questions
    currentOffset.value = questions.length;

    if (allQuestions.value.length === 0) {
      error.value = t('study.error.noBookmarks');
    }
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : t('study.error.generic');errorMessageerrinstanceofErrorerr.message
    error.value = errorMessage;

    track('error', {
      error_message: errorMessage,
      context: 'study_load_bookmarked_questions',
      difficulty: difficulty.value,
    });
  }

 finally {
    isLoading.value = false;
  }
};

const shufflequestions = () => {
  // Use originalQuestions if available, otherwise use allQuestions
  const questionsToShuffle = originalQuestions.value.length > 0 ? originalQuestions.value : allQuestions.value;UseoriginalQuestionsifavailable,otherwiseuseallQuestionsconstquestionsToShuffleoriginalQuestions.value.length0originalQuestions.value
  const shuffled = [...questionsToShuffle];

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

const loadquestions = async (append = false) => {
  if (append) {
    isLoadingMore.value = true;
  }

 else {
    isLoading.value = true;
    currentOffset.value = 0;
    allQuestions.value = [];
  }

  error.value = null;

  try {
    // Build query params
    const params = new URLSearchParams({
      difficulty: difficulty.value,
      level: getLevelFromDifficulty(difficulty.value), // Add level mapping
      mode: 'study', // Explicitly request Study Mode questions
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
      originalQuestions.value = [...originalQuestions.value, ...(data.questions || [])];
    }

 else {
      allQuestions.value = data.questions || [];
      originalQuestions.value = data.questions || [];
    }

    totalAvailable.value = data.total || 0;
    // Store the original total for sequential mode restoration
    if (!append) {
      originalTotalAvailable.value = data.total || 0;
    }
    hasMore.value = data.hasMore || false;

    if (append) {
      // For append, update offset to current total loaded
      currentOffset.value = allQuestions.value.length;
    }

 else {
      // For initial load, offset should be the number of questions loaded
      currentOffset.value = (data.questions || []).length;
    }

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
      // Load bookmark statuses for all questions
      const questionIds = data.questions?.map((q: Question) => q._id) || [];
      if (questionIds.length > 0) {
        await loadBookmarkStatuses(questionIds);
      }

      const savedAnswered = localStorage.getItem(`answered_${difficulty.value}`);
      if (savedAnswered) {
        answeredQuestions.value = new Set(JSON.parse(savedAnswered));
      }
    }

    if (!append && practiceMode.value === 'random') {
      shuffleQuestions();
    } else if (!append && practiceMode.value === 'bookmarked') {
      // Load bookmarked questions from API instead of filtering locally
      loadBookmarkedQuestions();
    }
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : t('study.error.generic');errorMessageerrinstanceofErrorerr.message
    error.value = errorMessage;

    track('error', {
      error_message: errorMessage,
      context: 'study_load_questions',
      difficulty: difficulty.value,
      append,
    });
  }

 finally {
    isLoading.value = false;
    isLoadingMore.value = false;
  }
};

const loadmore = () => {
  if (!hasMore.value || isLoadingMore.value) return;
  loadQuestions(true);
};

const revealanswer = async () => {
  if (!currentQuestion.value) return;
  const questionId = currentQuestion.value._id;
  try {
    // For Study Mode questions (open-ended), explanation is already available
    if (currentQuestion.value.type === 'open-ended') {
      // Just show the answer - no API call needed
      showAnswer.value = true;

      track('study_reveal_clicked', {
        difficulty: difficulty.value,
        questionId: currentQuestion.value._id,
        questionType: currentQuestion.value.type,
        hadSelectedAnswer: false, // Study Mode questions don't have user selections
        timeOnQuestion: sessionElapsedTime.value,
      });

      const newAnswered = new Set(answeredQuestions.value);
      newAnswered.add(currentQuestion.value._id);
      answeredQuestions.value = newAnswered;
      localStorage.setItem(`answered_${difficulty.value}`, JSON.stringify([...newAnswered]));
      return;
    }

    // For Quiz Mode questions, call API to get the answer
    const response = await fetch(`/api/v1/questions/${questionId}/reveal`, {
      method: 'POST',
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Failed to reveal answer');
    }

    const data = await response.json();

    // Update the current question with the revealed answer and explanation
    const updatedQuestions = [...allQuestions.value];
    const questionIndex = updatedQuestions.findIndex(q => q._id === questionId);

    if (questionIndex !== -1) {
      const question = updatedQuestions[questionIndex];

      // Add the explanation to the question
      if (question && question.content) {
        question.content.en = {
          ...question.content.en,
          explanation: data.explanation.en,
        };

        if (question.content.ar && data.explanation.ar) {
          question.content.ar = {
            ...question.content.ar,
            explanation: data.explanation.ar,
          };
        }

        // Mark correct answers in options
        if (question.content.en.options && data.correctAnswers) {
          question.content.en.options = question.content.en.options.map((opt: any) => ({
            ...opt,
            isCorrect: data.correctAnswers.includes(opt.id),
          }));
        }

        allQuestions.value = updatedQuestions;
      }
    }

    // Now show the answer
    showAnswer.value = true;

    track('study_reveal_clicked', {
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
  } catch (err) {
    console.error('Failed to reveal answer:', err);
    error.value = t('study.error.revealFailed');
  }
};

const nextQuestion = () => {
  lastActiveTime.value = Date.now(); // Update activity time
  if (currentIndex.value < questions.value.length - 1) {
    currentIndex.value++;
    resetStudyState();

    // Load more questions when approaching the end of loaded questions
    if (hasMore.value && currentIndex.value >= allQuestions.value.length - 3 && !isLoadingMore.value) {
      loadMore();
    }
  } else if (hasMore.value) {
    loadMore();
  } else {
    goBack();
  }
};

const previousQuestion = () => {
  lastActiveTime.value = Date.now(); // Update activity time
  if (currentIndex.value > 0) {
    currentIndex.value--;
    resetStudyState();
  }
};

const jumpToQuestion = (idx: number) => {
  lastActiveTime.value = Date.now(); // Update activity time
  currentIndex.value = idx;
  resetStudyState();
};

const resetStudyState = () => {
  showAnswer.value = false;
  selectedStudyAnswer.value = null;
  studyTextAnswer.value = "";
  studyMultipleAnswers.value = [];
};

const toggleBookmark = async () => {
  if (!currentQuestion.value) return;

  lastActiveTime.value = Date.now(); // Update activity time

  const id = currentQuestion.value._id;

  try {
    // Use the new bookmark API
    await toggleBookmarkAPI(id);

    // If we're in bookmarked mode, refresh the questions list to reflect the changes
    if (practiceMode.value === 'bookmarked') {
      // If we removed a bookmark and no bookmarks remain, show error
      if (bookmarkCount.value === 0) {
        error.value = t('study.error.noBookmarks');
        allQuestions.value = [];
        return;
      }

      // Store current question ID to maintain position after reload
      const currentQuestionId = currentQuestion.value._id;

      // Reload bookmarked questions to reflect the changes
      await loadBookmarkedQuestions();

      // Try to find the same question in the new list and set index
      const newIndex = allQuestions.value.findIndex(q => q._id === currentQuestionId);
      if (newIndex !== -1) {
        currentIndex.value = newIndex;
      } else {
        // If current question was removed, go to the first question
        currentIndex.value = 0;
      }
    }
  } catch (err) {
    console.error('Failed to toggle bookmark:', err);
    error.value = t('study.error.generic');
  }
};

// Answer activity tracking
const onAnswerSelected = (value: string | null) => {
  lastActiveTime.value = Date.now(); // Update activity time
  selectedStudyAnswer.value = value;
};

const onTextAnswerChanged = (value: string) => {
  lastActiveTime.value = Date.now(); // Update activity time
  studyTextAnswer.value = value;
};

const onMultipleAnswersChanged = (value: string[]) => {
  lastActiveTime.value = Date.now(); // Update activity time
  studyMultipleAnswers.value = value;
};

const completeStudySession = async () => {
  try {
    const sessionDuration = Math.floor((Date.now() - sessionStartTime.value) / 1000 / 60); // minutes
    const correctAnswers = answeredQuestions.value.size; // For study mode, we count revealed questions as "correct"

    const response = await fetch('/api/v1/progress/session/complete', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        questionsCompleted: answeredQuestions.value.size,
        correctAnswers: correctAnswers,
        sessionDurationMinutes: sessionDuration,
        startTime: new Date(sessionStartTime.value).toISOString(),
        endTime: new Date().toISOString(),
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to complete study session');
    }

    const result = await response.json();
    console.log('Study session completed:', result);

    // Track successful completion
    track('study_session_completed', {
      difficulty: difficulty.value,
      framework: framework.value,
      sessionDuration,
      questionsCompleted: answeredQuestions.value.size,
      xpEarned: result.xpEarned || 0,
      newLevel: result.newLevel || 0,
    });
  } catch (error) {
    console.error('Failed to complete study session:', error);
    // Don't block navigation on API failure
  }
};

const goBack = async () => {
  const currentLocale = route.params.locale || 'en';

  // Complete study session if user answered questions
  if (answeredQuestions.value.size > 0) {
    await completeStudySession();
  }

  // Mark as explicitly leaving and clear session state
  isExplicitlyLeaving.value = true;
  if (framework.value) {
    localStorage.removeItem(`study_session_${difficulty.value}_${framework.value}`);
  }
  // Go back to framework selection page: /:locale/study/:difficulty
  router.push(`/${currentLocale}/study/${difficulty.value}`);
};

const changeFramework = () => {
  const currentLocale = route.params.locale || 'en';
  // Mark as explicitly leaving and clear session state
  isExplicitlyLeaving.value = true;
  if (framework.value) {
    localStorage.removeItem(`study_session_${difficulty.value}_${framework.value}`);
  }
  // Navigate to framework selection page
  router.push(`/${currentLocale}/study/${difficulty.value}`);
};

// Session timer functions
const startSessionTimer = () => {
  if (sessionTimerInterval) return;

  sessionTimerInterval = setInterval(() => {
    if (!isTimerPaused.value) {
      sessionElapsedTime.value = Math.floor((Date.now() - sessionStartTime.value) / 1000);

      // Update last active time every second when timer is running
      lastActiveTime.value = Date.now();

      if (sessionElapsedTime.value % 10 === 0) {
        saveSessionState();
      }
    }

    // Update display every second
    updateSessionDisplay();
  }, 1000);
};

const pauseSessionTimer = () => {
  isTimerPaused.value = true;
  saveSessionState();
  updateSessionDisplay();
};

const resumeSessionTimer = () => {
  const pausedDuration = Date.now() - (sessionStartTime.value + sessionElapsedTime.value * 1000);
  sessionStartTime.value += pausedDuration;
  isTimerPaused.value = false;
  saveSessionState();
  updateSessionDisplay();
};

const resetSessionTimer = () => {
  sessionStartTime.value = Date.now();
  sessionElapsedTime.value = 0;
  isTimerPaused.value = false;
  lastActiveTime.value = Date.now();
  saveSessionState();
  updateSessionDisplay();
};

const saveSessionState = () => {
  // Don't save if framework is undefined
  if (!framework.value) {
    return;
  }

  const sessionState = {
    startTime: sessionStartTime.value,
    elapsedTime: sessionElapsedTime.value,
    isPaused: isTimerPaused.value,
    difficulty: difficulty.value,
    framework: framework.value,
    lastActiveTime: lastActiveTime.value,
  };
  localStorage.setItem(`study_session_${difficulty.value}_${framework.value}`, JSON.stringify(sessionState));
};

const loadSessionState = () => {
  // Don't load if framework is undefined
  if (!framework.value) {
    resetSessionTimer();
    return;
  }

  const saved = localStorage.getItem(`study_session_${difficulty.value}_${framework.value}`);
  if (saved) {
    try {
      const state = JSON.parse(saved);

      // Validate state matches current context
      const isMatchingContext = state.difficulty === difficulty.value && state.framework === framework.value;

      if (isMatchingContext) {
        // Calculate time away from this framework
        const timeAway = Date.now() - (state.lastActiveTime || state.startTime);
        const fiveMinutes = 5 * 60 * 1000;

        if (timeAway < fiveMinutes) {
          // User was away for less than 5 minutes - restore session
          sessionStartTime.value = state.startTime;
          sessionElapsedTime.value = state.elapsedTime;
          isTimerPaused.value = state.isPaused ?? false;
          lastActiveTime.value = Date.now(); // Update last active time

          // Save the updated state
          saveSessionState();
          updateSessionDisplay();
        } else {
          // User was away for more than 5 minutes - start fresh
          localStorage.removeItem(`study_session_${difficulty.value}_${framework.value}`);
          resetSessionTimer();
        }
      } else {
        // Mismatched context - start fresh
        resetSessionTimer();
      }
    } catch (e) {
      console.error('Failed to load session state:', e);
      resetSessionTimer();
    }
  } else {
    // No saved session - start fresh
    resetSessionTimer();
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

// Clean up localStorage keys with undefined values
const cleanupInvalidKeys = () => {
  const keysToRemove: string[] = [];

  // Check all localStorage keys for undefined values
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && (key.includes('undefined') || key.includes('_undefined'))) {
      keysToRemove.push(key);
    }
  }

  // Remove invalid keys
  keysToRemove.forEach(key => localStorage.removeItem(key));
};

onMounted(() => {
  // Clean up any existing invalid keys
  cleanupInvalidKeys();

  loadQuestions();
  loadSessionState();
  startSessionTimer();
  updateSessionDisplay(); // Initial display update
  window.addEventListener('keydown', handleKeyboard);
  window.addEventListener('touchstart', handleTouchStart, { passive: true });
  window.addEventListener('touchend', handleTouchEnd, { passive: true });
  window.addEventListener('scroll', handleScroll, { passive: true });
});

onUnmounted(async () => {
  if (sessionTimerInterval) {
    clearInterval(sessionTimerInterval);
    sessionTimerInterval = null;
  }

  // Complete study session if user answered questions and hasn't already completed it
  if (answeredQuestions.value.size > 0 && !isExplicitlyLeaving.value) {
    try {
      await completeStudySession();
    } catch (error) {
      console.error('Failed to complete study session on unmount:', error);
    }
  }

  // Only save session state if user is not explicitly leaving
  if (!isExplicitlyLeaving.value) {
    saveSessionState();
  }
  window.removeEventListener('keydown', handleKeyboard);
  window.removeEventListener('touchstart', handleTouchStart);
  window.removeEventListener('touchend', handleTouchEnd);
  window.removeEventListener('scroll', handleScroll);
});
</script>
}}}