import { defineStore } from 'pinia';
import { ref, watch } from 'vue';
import { storage } from '@/utils/storage';
import { STORAGE_KEYS } from '@/config/constants';
import type { IncompleteQuiz, UIPreferences } from '@shared/types/preferences';

export const usePreferencesStore = defineStore('preferences', () => {
  // State
  const lastFramework = ref<string | null>(null);
  const lastDifficulty = ref<'easy' | 'medium' | 'hard' | null>(null);
  const lastMode = ref<'quiz' | 'study' | null>(null);
  const incompleteQuiz = ref<IncompleteQuiz | null>(null);
  const uiPreferences = ref<UIPreferences>({
    theme: 'system',
    language: 'en',
    enableAnimations: true,
    enableSoundEffects: false,
    showHints: true,
    autoPlayNext: false,
    fontSize: 'medium',
    reducedMotion: false,
  });

  // Initialize from storage
  function initialize() {
    lastFramework.value = storage.get<string>(STORAGE_KEYS.USER_LAST_FRAMEWORK);
    lastDifficulty.value = storage.get<'easy' | 'medium' | 'hard'>(STORAGE_KEYS.USER_LAST_DIFFICULTY);
    lastMode.value = storage.get<'quiz' | 'study'>(STORAGE_KEYS.USER_LAST_MODE);

    const storedIncompleteQuiz = storage.get<IncompleteQuiz>(STORAGE_KEYS.USER_INCOMPLETE_QUIZ);
    if (storedIncompleteQuiz) {
      // Validate that storedIncompleteQuiz is actually an object and has the expected structure
      if (typeof storedIncompleteQuiz === 'object' && storedIncompleteQuiz !== null && 'startedAt' in storedIncompleteQuiz) {
        try {
          // Convert date strings back to Date objects
          storedIncompleteQuiz.startedAt = new Date(storedIncompleteQuiz.startedAt);
          if (storedIncompleteQuiz.lastUpdatedAt) {
            storedIncompleteQuiz.lastUpdatedAt = new Date(storedIncompleteQuiz.lastUpdatedAt);
          }
          incompleteQuiz.value = storedIncompleteQuiz;
        } catch (error) {
          // If date conversion fails, clear the corrupted data
          console.warn('Corrupted incomplete quiz data detected, clearing...', error);
          storage.remove(STORAGE_KEYS.USER_INCOMPLETE_QUIZ);
        }
      } else {
        // Data is corrupted (not an object), clear it
        console.warn('Invalid incomplete quiz data detected, clearing...');
        storage.remove(STORAGE_KEYS.USER_INCOMPLETE_QUIZ);
      }
    }

    const storedUIPrefs = storage.get<UIPreferences>(STORAGE_KEYS.USER_UI_PREFERENCES);
    if (storedUIPrefs) {
      uiPreferences.value = { ...uiPreferences.value, ...storedUIPrefs };
    }
  }

  // Watch for changes and persist to storage
  watch(lastFramework, (value) => {
    if (value) {
      storage.set(STORAGE_KEYS.USER_LAST_FRAMEWORK, value);
    } else {
      storage.remove(STORAGE_KEYS.USER_LAST_FRAMEWORK);
    }
  });

  watch(lastDifficulty, (value) => {
    if (value) {
      storage.set(STORAGE_KEYS.USER_LAST_DIFFICULTY, value);
    } else {
      storage.remove(STORAGE_KEYS.USER_LAST_DIFFICULTY);
    }
  });

  watch(lastMode, (value) => {
    if (value) {
      storage.set(STORAGE_KEYS.USER_LAST_MODE, value);
    } else {
      storage.remove(STORAGE_KEYS.USER_LAST_MODE);
    }
  });

  watch(incompleteQuiz, (value) => {
    if (value) {
      storage.set(STORAGE_KEYS.USER_INCOMPLETE_QUIZ, value);
    } else {
      storage.remove(STORAGE_KEYS.USER_INCOMPLETE_QUIZ);
    }
  }, { deep: true });

  watch(uiPreferences, (value) => {
    storage.set(STORAGE_KEYS.USER_UI_PREFERENCES, value);
  }, { deep: true });

  // Actions
  function setLastFramework(framework: string) {
    lastFramework.value = framework;
  }

  function setLastDifficulty(difficulty: 'easy' | 'medium' | 'hard') {
    lastDifficulty.value = difficulty;
  }

  function setLastMode(mode: 'quiz' | 'study') {
    lastMode.value = mode;
  }

  function saveIncompleteQuiz(quiz: IncompleteQuiz) {
    quiz.lastUpdatedAt = new Date();
    incompleteQuiz.value = quiz;
  }

  function clearIncompleteQuiz() {
    incompleteQuiz.value = null;
  }

  function updateUIPreference<K extends keyof UIPreferences>(
    key: K,
    value: UIPreferences[K]
  ) {
    uiPreferences.value[key] = value;
  }

  function resetUIPreferences() {
    uiPreferences.value = {
      theme: 'system',
      language: 'en',
      enableAnimations: true,
      enableSoundEffects: false,
      showHints: true,
      autoPlayNext: false,
      fontSize: 'medium',
      reducedMotion: false,
    };
  }

  function hasIncompleteQuiz(): boolean {
    if (!incompleteQuiz.value) return false;

    // Check if incomplete quiz is still valid (not too old)
    if (incompleteQuiz.value.lastUpdatedAt) {
      const MAX_AGE_HOURS = 24;
      const now = new Date();
      const lastUpdated = new Date(incompleteQuiz.value.lastUpdatedAt);
      const ageHours = (now.getTime() - lastUpdated.getTime()) / (1000 * 60 * 60);

      if (ageHours > MAX_AGE_HOURS) {
        // Quiz is too old, clear it
        clearIncompleteQuiz();
        return false;
      }
    }

    return true;
  }

  function getLastSelection() {
    return {
      framework: lastFramework.value,
      difficulty: lastDifficulty.value,
      mode: lastMode.value,
    };
  }

  function clearAllPreferences() {
    lastFramework.value = null;
    lastDifficulty.value = null;
    lastMode.value = null;
    incompleteQuiz.value = null;
    resetUIPreferences();
  }

  // Initialize on store creation
  initialize();

  return {
    // State
    lastFramework,
    lastDifficulty,
    lastMode,
    incompleteQuiz,
    uiPreferences,

    // Actions
    setLastFramework,
    setLastDifficulty,
    setLastMode,
    saveIncompleteQuiz,
    clearIncompleteQuiz,
    updateUIPreference,
    resetUIPreferences,
    hasIncompleteQuiz,
    getLastSelection,
    clearAllPreferences,
    initialize,
  };
});
