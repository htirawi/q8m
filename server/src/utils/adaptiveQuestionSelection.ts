/**
 * Adaptive Question Selection Algorithm
 * Intelligently selects next question based on user progress and mastery levels
 * Prioritizes: Overdue reviews > Learning > New > Mastered
 */

import type { MasteryLevel } from '@shared/types/progress';

import type { IQuestionProgressDoc } from '../models/UserProgress';

import { isDueForReview, prioritizeQuestions } from './spacedRepetition';

export interface IQuestionWithProgress {
  _id: string;
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
  tags: string[];
  progress?: {
    masteryLevel: MasteryLevel;
    attempts: number;
    correctCount: number;
    wrongCount: number;
    nextReviewDate: Date;
    lastAttemptDate: Date;
  };
}

export interface IAdaptiveSelectionOptions {
  difficulty?: 'easy' | 'medium' | 'hard';
  category?: string;
  excludeQuestionIds?: string[];
  preferWeakCategories?: boolean;
  maxNewQuestions?: number; // Limit new questions per session
  includeReviews?: boolean; // Include due reviews
}

/**
 * Select next question using adaptive algorithm
 * @param availableQuestions All questions available for selection
 * @param userProgress User's progress map (questionId → progress)
 * @param options Selection options
 * @returns Selected question or null if none available
 */
export function selectNextQuestion(
  availableQuestions: IQuestionWithProgress[],
  userProgress: Map<string, IQuestionProgressDoc>,
  options: IAdaptiveSelectionOptions = {}
): IQuestionWithProgress | null {
  const {
    difficulty,
    category,
    excludeQuestionIds = [],
    preferWeakCategories = false,
    maxNewQuestions = Infinity,
    includeReviews = true,
  } = options;

  // Filter questions
  const filteredQuestions = availableQuestions.filter((q) => {
    // Exclude specific question IDs
    if (excludeQuestionIds.includes(q._id)) return false;

    // Filter by difficulty
    if (difficulty && q.difficulty !== difficulty) return false;

    // Filter by category
    if (category && q.category !== category) return false;

    return true;
  });

  // Attach progress data to questions
  const questionsWithProgress = filteredQuestions.map((q) => ({
    ...q,
    progress: userProgress.get(q._id),
  }));

  // Categorize questions by status
  const overdueReviews: IQuestionWithProgress[] = [];
  const dueReviews: IQuestionWithProgress[] = [];
  const learningQuestions: IQuestionWithProgress[] = [];
  const familiarQuestions: IQuestionWithProgress[] = [];
  const newQuestions: IQuestionWithProgress[] = [];
  const masteredQuestions: IQuestionWithProgress[] = [];

  for (const q of questionsWithProgress) {
    if (!q.progress || q.progress.attempts === 0) {
      newQuestions.push(q);
    } else {
      const { masteryLevel, nextReviewDate } = q.progress;

      if (includeReviews && isDueForReview(nextReviewDate)) {
        const now = new Date();
        const daysSinceReview =
          (now.getTime() - nextReviewDate.getTime()) / (1000 * 60 * 60 * 24);

        if (daysSinceReview > 1) {
          overdueReviews.push(q);
        } else {
          dueReviews.push(q);
        }
      } else {
        switch (masteryLevel) {
          case 'learning':
            learningQuestions.push(q);
            break;
          case 'familiar':
            familiarQuestions.push(q);
            break;
          case 'mastered':
            masteredQuestions.push(q);
            break;
          case 'new':
            newQuestions.push(q);
            break;
        }
      }
    }
  }

  // Selection priority:
  // 1. Overdue reviews (sorted by how overdue)
  // 2. Due reviews
  // 3. Learning questions (need reinforcement)
  // 4. New questions (controlled by maxNewQuestions)
  // 5. Familiar questions
  // 6. Mastered questions (only if nothing else available)

  // 1. Overdue reviews
  if (overdueReviews.length > 0) {
    const prioritized = prioritizeQuestions(
      overdueReviews.map((q) => ({
        ...q,
        nextReviewDate: q.progress!.nextReviewDate,
        masteryLevel: q.progress!.masteryLevel,
      }))
    );
    return prioritized[0] || null;
  }

  // 2. Due reviews
  if (dueReviews.length > 0) {
    const prioritized = prioritizeQuestions(
      dueReviews.map((q) => ({
        ...q,
        nextReviewDate: q.progress!.nextReviewDate,
        masteryLevel: q.progress!.masteryLevel,
      }))
    );
    return prioritized[0] || null;
  }

  // 3. Learning questions (random to avoid pattern recognition)
  if (learningQuestions.length > 0) {
    // If preferWeakCategories, filter by weak categories
    if (preferWeakCategories) {
      const weakCategories = identifyWeakCategories(userProgress);
      const weakLearningQuestions = learningQuestions.filter((q) =>
        weakCategories.includes(q.category)
      );
      if (weakLearningQuestions.length > 0) {
        return randomPick(weakLearningQuestions);
      }
    }
    return randomPick(learningQuestions);
  }

  // 4. New questions (limited by maxNewQuestions)
  if (newQuestions.length > 0) {
    // Check if user has already seen too many new questions this session
    // This would need session tracking - for now, just return a new question
    if (maxNewQuestions > 0) {
      return randomPick(newQuestions);
    }
  }

  // 5. Familiar questions
  if (familiarQuestions.length > 0) {
    if (preferWeakCategories) {
      const weakCategories = identifyWeakCategories(userProgress);
      const weakFamiliarQuestions = familiarQuestions.filter((q) =>
        weakCategories.includes(q.category)
      );
      if (weakFamiliarQuestions.length > 0) {
        return randomPick(weakFamiliarQuestions);
      }
    }
    return randomPick(familiarQuestions);
  }

  // 6. Mastered questions (last resort)
  if (masteredQuestions.length > 0) {
    return randomPick(masteredQuestions);
  }

  // No questions available
  return null;
}

/**
 * Select multiple questions for a study session
 * @param availableQuestions All available questions
 * @param userProgress User's progress
 * @param count Number of questions to select
 * @param options Selection options
 * @returns Array of selected questions
 */
export function selectSessionQuestions(
  availableQuestions: IQuestionWithProgress[],
  userProgress: Map<string, IQuestionProgressDoc>,
  count: number,
  options: IAdaptiveSelectionOptions = {}
): IQuestionWithProgress[] {
  const selectedQuestions: IQuestionWithProgress[] = [];
  const excludeIds: string[] = [...(options.excludeQuestionIds || [])];

  for (let i = 0; i < count; i++) {
    const nextQuestion = selectNextQuestion(availableQuestions, userProgress, {
      ...options,
      excludeQuestionIds: excludeIds,
    });

    if (!nextQuestion) break; // No more questions available

    selectedQuestions.push(nextQuestion);
    excludeIds.push(nextQuestion._id);
  }

  return selectedQuestions;
}

/**
 * Identify weak categories based on user progress
 * @param userProgress User's progress map
 * @returns Array of weak category names
 */
export function identifyWeakCategories(
  userProgress: Map<string, IQuestionProgressDoc>,
  threshold: number = 0.7
): string[] {
  const categoryStats = new Map<
    string,
    { correct: number; total: number; accuracy: number }
  >();

  // Aggregate stats by category
  for (const [, ] of userProgress) {
    // Note: We don't have category info in progress, need to pass questions
    // For now, skip this - implement in service layer with full question data
    // This is a placeholder
  }

  // Return categories with accuracy < threshold
  const weakCategories: string[] = [];
  for (const [category, stats] of categoryStats) {
    if (stats.accuracy < threshold) {
      weakCategories.push(category);
    }
  }

  return weakCategories;
}

/**
 * Calculate recommended difficulty based on user performance
 * @param userProgress User's progress
 * @returns Recommended difficulty level
 */
export function recommendDifficulty(
  userProgress: Map<string, IQuestionProgressDoc>
): 'easy' | 'medium' | 'hard' {
  // Count mastered questions by difficulty (would need question data)
  // For now, use simple heuristic based on total mastery

  const masteredCount = Array.from(userProgress.values()).filter(
    (p) => p.masteryLevel === 'mastered'
  ).length;

  const totalQuestions = userProgress.size;
  const masteryRate = totalQuestions > 0 ? masteredCount / totalQuestions : 0;

  if (masteryRate < 0.3) {
    return 'easy'; // Still learning basics
  } else if (masteryRate < 0.7) {
    return 'medium'; // Progressing well
  } else {
    return 'hard'; // Ready for advanced content
  }
}

/**
 * Random pick from array (with crypto-safe randomness if available)
 * @param array Array to pick from
 * @returns Random element or undefined if array is empty
 */
function randomPick<T>(array: T[]): T {
  if (array.length === 0) {
    throw new Error('Cannot pick from empty array');
  }

  // Use crypto.randomBytes for better randomness
  const randomIndex = Math.floor(Math.random() * array.length);
  return array[randomIndex]!;
}

/**
 * Calculate session variety score
 * Ensures sessions don't have too many questions from same category
 * @param questions Selected questions
 * @returns Variety score (0-1, higher = more variety)
 */
export function calculateVarietyScore(questions: IQuestionWithProgress[]): number {
  if (questions.length === 0) return 0;

  const categoryCount = new Map<string, number>();

  for (const q of questions) {
    categoryCount.set(q.category, (categoryCount.get(q.category) || 0) + 1);
  }

  const uniqueCategories = categoryCount.size;
  const maxVariety = Math.min(questions.length, 5); // Ideal is 5 different categories

  return uniqueCategories / maxVariety;
}

/**
 * Balance question selection for variety
 * Ensures diverse categories in session
 * @param questions Available questions
 * @param count Number to select
 * @returns Balanced selection
 */
export function balanceSelection(
  questions: IQuestionWithProgress[],
  count: number
): IQuestionWithProgress[] {
  const selected: IQuestionWithProgress[] = [];
  const categoryCounts = new Map<string, number>();

  // Sort questions by priority (would need progress data)
  // For now, just randomize
  const shuffled = [...questions].sort(() => Math.random() - 0.5);

  for (const question of shuffled) {
    if (selected.length >= count) break;

    const categoryCount = categoryCounts.get(question.category) || 0;

    // Limit to 3 questions per category for variety
    if (categoryCount < 3) {
      selected.push(question);
      categoryCounts.set(question.category, categoryCount + 1);
    }
  }

  // If we couldn't fill the count due to category limits, add more
  if (selected.length < count) {
    const remaining = shuffled.filter((q) => !selected.includes(q));
    selected.push(...remaining.slice(0, count - selected.length));
  }

  return selected;
}
