/**
 * Select Page Types
 * Types for the level/difficulty selection page
 */

export interface ISelectOption {
  /** Unique identifier for the option */
  id: string;

  /** i18n key for the title */
  titleKey: string;

  /** i18n key for the subtitle */
  subtitleKey: string;

  /** i18n key for the description */
  descriptionKey: string;

  /** i18n key for the duration text */
  durationKey: string;

  /** Difficulty level identifier */
  difficulty: "junior" | "intermediate" | "senior" | "custom";

  /** Whether the option is locked (requires upgrade) */
  isLocked?: boolean;

  /** Whether the option is currently selected */
  isSelected?: boolean;

  /** Icon or emoji to display */
  icon?: string;

  /** Recommended badge configuration */
  badge?: {
    /** i18n key for badge text */
    textKey: string;
    /** Badge visual variant */
    variant: "success" | "warning" | "info" | "primary";
  };

  /** Required plan tier (if locked) */
  requiredPlan?: string;

  /** User's progress percentage (0-100) */
  progress?: number;

  /** Whether this option is disabled */
  disabled?: boolean;

  /** Highlight points as i18n keys */
  highlightsKeys?: string[];
}

export interface ISelectFilters {
  /** Search query string */
  searchQuery: string;

  /** Selected category filter */
  category: "all" | "beginner" | "advanced" | "custom";

  /** Sort order */
  sortBy: "recommended" | "popular" | "newest" | "alphabetical";
}

export interface ISelectState {
  /** Currently selected option ID */
  selectedId: string;

  /** Whether navigation is in progress */
  isNavigating: boolean;

  /** Whether data is loading */
  isLoading: boolean;

  /** Error message if fetch failed */
  error: string | null;

  /** Available options */
  options: ISelectOption[];
}

export interface IUserStats {
  /** Current streak in days */
  streak: number;

  /** Total coins earned */
  coins: number;

  /** User level */
  level: number;

  /** Progress percentage (0-100) */
  progress: number;
}

export interface IRecentBadge {
  /** Badge unique ID */
  id: string;

  /** Badge name */
  name: string;

  /** Badge emoji/icon */
  emoji: string;
}
