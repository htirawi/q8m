/**
 * Composables Types
 * Shared types for Vue composables return types and parameters
 */

// Note: Using 'any' for Ref/ComputedRef to avoid Vue dependency in shared types
// These will be properly typed when used in client code
// Using _T to indicate intentionally unused type parameter
type Ref<_T = unknown> = any;
type ComputedRef<_T = unknown> = any;
import type { Challenge, ChallengeStats } from './challenges';
import type { Discussion } from './discussions';
import type { Friend, FriendRequest, FriendStatus } from './friends';

/**
 * Quiz answer for results
 */
export interface IQuizAnswer {
  questionId: string;
  answer: string | string[];
  correct: boolean;
  timeSpent: number;
  difficulty?: string;
  category?: string;
}

/**
 * Payload for quiz submission
 */
export interface ISubmitQuizPayload {
  framework: string;
  level: string;
  mode: 'quiz' | 'study';
  answers: IQuizAnswer[];
  totalTime: number;
}

/**
 * Response from quiz submission
 */
export interface ISubmitQuizResponse {
  score: number;
  percentage: number;
  xpGained: number;
  xpEarned?: number; // Backward compatibility alias for xpGained
  badgesEarned: Array<{
    id: string;
    name: string;
    description: string;
    icon: string;
  }> | string[]; // Support both formats
  leveledUp: boolean;
  newLevel?: number;
  previousLevel?: number;
  weakCategories?: string[];
  strongCategories?: string[];
}

/**
 * Quiz result entity
 */
export interface IQuizResult {
  _id: string;
  id?: string; // Backward compatibility alias
  userId: string;
  framework: string;
  level: string;
  mode: 'quiz' | 'study';
  quizType?: string; // Backward compatibility alias for mode
  score: number;
  totalQuestions: number;
  correctAnswers?: number; // Backward compatibility alias for score
  percentage: number;
  answers: IQuizAnswer[];
  totalTimeSeconds?: number;
  xpEarned?: number;
  badgesEarned?: string[];
  weakCategories?: string[];
  createdAt: Date;
}

/**
 * Weak area analysis
 */
export interface IWeakArea {
  category: string;
  successRate: number;
  questionsAttempted: number;
  accuracy?: number; // Backward compatibility alias for successRate
  questionsCorrect?: number;
  lastAttemptDate?: Date;
}

/**
 * Scroll tracking configuration
 */
export interface IScrollTrackingConfig {
  threshold?: number;
  debounce?: number;
  milestones?: number[];
  debounceMs?: number;
  trackingEnabled?: boolean;
}

/**
 * Scroll tracking result
 */
export interface IScrollTrackingResult {
  scrollY: Ref<number>;
  scrollPercentage: Ref<number>;
  isScrollingDown: Ref<boolean>;
  scrollDepth: Ref<number>;
  hasReachedMilestone: (milestone: number) => boolean;
}

/**
 * Homepage analytics result
 */
export interface IHomepageAnalyticsResult {
  trackFeatureView: (featureName: string) => void;
  trackCTAClick: (ctaName: string | any) => void; // Accept string or object
  trackSectionView: (sectionName: string | any, viewDuration?: number) => void; // Accept string or object
  trackFaqInteraction?: (question: string, action: string) => void;
  trackPricingInteraction?: (action: string, planId?: string) => void;
  trackSocialProofInteraction?: (type: string) => void;
  setupSectionObserver?: (sectionId: string) => void;
}

/**
 * Number copy mode for plans
 */
export type NumberCopyMode = 'totals' | 'deltas' | 'totals-with-deltas';

/**
 * Plan pricing information
 */
export interface IPlanPrice {
  monthly: number;
  yearly: number;
  annual: number;
  currency: string;
  annualSavings?: number;
  annualSavingsPercent?: number;
}

/**
 * Upsell modal context
 */
export interface IUpsellModalContext {
  feature: string;
  currentPlan: string;
  requiredPlan: string;
  ctaText?: string;
  source?: string;
  difficulty?: string;
}

/**
 * Badge with progress
 */
export interface IBadgeWithProgress {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  progress: number;
  maxProgress: number;
  unlocked: boolean;
  unlockedAt?: Date;
  earned?: boolean; // Backward compatibility alias for unlocked
  earnedAt?: Date; // Backward compatibility alias for unlockedAt
  rarity?: string;
  xpReward?: number;
}

/**
 * XP information
 */
export interface IXPInfo {
  currentXP: number;
  requiredXP: number;
  level: number;
  percentage: number;
}

/**
 * Gamification summary
 */
export interface IGamificationSummary {
  level: number;
  totalXP: number;
  xp?: number; // Backward compatibility alias
  coins: number;
  streak: number;
  currentStreak?: number; // Backward compatibility alias
  longestStreak?: number;
  badges: IBadgeWithProgress[];
  totalBadges?: number;
  rareBadges?: number;
  leaderboardRank?: number;
  leaderboardPercentile?: number;
  xpToNextLevel?: number;
  xpProgress?: number;
  levelTitle?: string;
}

/**
 * Leaderboard ranking
 */
export interface ILeaderboardRank {
  rank: number;
  totalUsers: number;
  percentile: number;
  totalEntries?: number;
  score?: number;
}

/**
 * Notification permission state
 */
export interface NotificationPermissionState {
  granted: boolean;
  denied: boolean;
  default: boolean;
  supported?: boolean;
}

/**
 * Foreground notification
 */
export interface ForegroundNotification {
  title: string;
  body: string;
  icon?: string;
  data?: Record<string, unknown>;
}

/**
 * Resolved plan information
 */
export interface IResolvedPlan {
  id: string;
  name: string;
  price: IPlanPrice;
  features: string[];
  planId?: string;
  billing?: 'monthly' | 'yearly';
  isLegacy?: boolean;
  originalParam?: string;
}

/**
 * Update question progress payload
 */
export interface IUpdateQuestionProgressPayload {
  questionId: string;
  correct: boolean;
  timeSpent: number;
  difficulty: string;
}

/**
 * Update question progress response
 */
export interface IUpdateQuestionProgressResponse {
  success: boolean;
  xpGained: number;
  masteryLevel?: string;
}

/**
 * Complete session payload
 */
export interface ICompleteSessionPayload {
  framework: string;
  level: string;
  mode: 'quiz' | 'study';
  questionsAttempted: number;
  correctAnswers: number;
  timeSpent: number;
}

/**
 * Complete session response
 */
export interface ICompleteSessionResponse {
  success: boolean;
  xpGained: number;
  coinsEarned: number;
  streakMaintained: boolean;
  badgesUnlocked: string[];
}

/**
 * Progress with mastery statistics
 */
export interface IProgressWithMastery {
  questionsAttempted: number;
  correctAnswers: number;
  masteryLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  successRate: number;
  xp?: number;
  level?: number;
  badges?: number;
  streaks?: {
    current: number;
    currentStreak?: number; // Backward compatibility alias
    longest: number;
    longestStreak?: number; // Backward compatibility alias
    lastUpdated: Date;
    lastActivityDate?: Date; // Backward compatibility alias
  };
  difficultyProgress?: Record<string, {
    attempted: number;
    correct: number;
    accuracy: number;
    mastered?: number;
    familiar?: number;
    learning?: number;
    new?: number;
  }>;
  masteryStats?: {
    level: string;
    progress: number;
    nextLevel: string;
    mastered?: number;
    familiar?: number;
    learning?: number;
    new?: number;
    totalQuestions?: number;
    accuracy?: number;
    dueForReview?: number;
    overdueReviews?: number;
  };
}

/**
 * Detailed progress statistics
 */
export interface IProgressStats {
  totalSessions: number;
  totalQuestions: number;
  totalQuestionsAttempted?: number; // Backward compatibility alias
  correctAnswers: number;
  averageAccuracy: number;
  averageTimePerQuestion: number;
  totalStudyTimeMinutes?: number;
  averageSessionDurationMinutes?: number;
  strongCategories: string[];
  weakCategories: string[];
  recentActivity: Array<{
    date: Date;
    questionsAttempted: number;
    accuracy: number;
  }>;
}

/**
 * A/B test configuration
 */
export interface IABTestConfig {
  name: string;
  variants: string[];
  defaultVariant: string;
  testId?: string;
  weights?: Record<string, number>;
  storageKey?: string;
}

/**
 * A/B test result
 */
export interface IABTestResult {
  variant: string;
  isControl: boolean;
  trackAssignment?: (testName: string, variant: string) => void;
}

/**
 * Study loading state
 */
export type StudyLoadingState = 'idle' | 'loading' | 'error';

/**
 * Study flow variant
 */
export type StudyFlowVariant = 'autostart' | 'manual';

/**
 * useChallenges composable return type
 */
export interface UseChallengesReturn {
  challenges: Ref<Challenge[]>;
  stats: Ref<ChallengeStats | null>;
  loading: Ref<boolean>;
  error: Ref<string | null>;
  fetchChallenges: (filter?: string) => Promise<void>;
  createChallenge: (data: any) => Promise<void>;
  acceptChallenge: (id: string) => Promise<void>;
  declineChallenge: (id: string) => Promise<void>;
  submitChallenge: (id: string, answers: any[]) => Promise<void>;
}

/**
 * useDiscussions composable return type
 */
export interface UseDiscussionsReturn {
  discussions: Ref<Discussion[]>;
  loading: Ref<boolean>;
  error: Ref<string | null>;
  fetchDiscussions: (questionId: string) => Promise<void>;
  createDiscussion: (data: any) => Promise<void>;
  updateDiscussion: (id: string, content: string) => Promise<void>;
  deleteDiscussion: (id: string) => Promise<void>;
  toggleLike: (id: string) => Promise<void>;
}

/**
 * useFriends composable return type
 */
export interface UseFriendsReturn {
  friends: Ref<Friend[]>;
  requests: Ref<FriendRequest[]>;
  suggestions: Ref<Friend[]>;
  loading: Ref<boolean>;
  error: Ref<string | null>;
  hasSuggestions?: ComputedRef<boolean>;
  fetchFriends: () => Promise<void>;
  fetchRequests: () => Promise<void>;
  fetchSuggestions: () => Promise<void>;
  sendRequest: (userId: string) => Promise<void>;
  acceptRequest: (userId: string) => Promise<void>;
  rejectRequest: (userId: string) => Promise<void>;
  removeFriend: (userId: string) => Promise<void>;
  checkFriendStatus: (userId: string) => Promise<FriendStatus>;
  getAvatarColor?: (name: string) => string;
}
