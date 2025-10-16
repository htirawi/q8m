/**
 * User Preferences Types
 * Shared types for user preferences and settings
 */

/**
 * Incomplete quiz state for resume functionality
 */
export interface IncompleteQuiz {
  framework: string;
  level: string;
  difficulty: string;
  mode: 'quiz' | 'study';
  questions: string[];
  currentIndex: number;
  currentQuestionIndex?: number; // Backward compatibility alias for currentIndex
  totalQuestions?: number;
  answers: Array<{
    questionId: string;
    answer: string | string[];
    selectedAnswer?: string; // Backward compatibility alias for answer
    correct?: boolean;
    isCorrect?: boolean; // Backward compatibility alias for correct
    timeSpent?: number;
  }>;
  startedAt: Date;
  lastUpdatedAt?: Date;
}

/**
 * User UI preferences
 */
export interface UIPreferences {
  theme: 'light' | 'dark' | 'auto' | 'system';
  language: 'en' | 'ar';
  enableAnimations: boolean;
  enableSoundEffects: boolean;
  showHints: boolean;
  autoPlayNext: boolean;
  fontSize: 'small' | 'medium' | 'large';
  reducedMotion: boolean;
}
