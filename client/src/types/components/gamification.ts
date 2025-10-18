/**
 * Gamification Component Props & Types
 */

export interface IAchievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  date: Date;
  type?: string;
  xp?: number; // Alias for xpEarned
  xpEarned?: number;
  rarity?: "common" | "rare" | "epic" | "legendary";
  category?: string;
  details?: string;
}

export interface IAchievementTimelineProps {
  achievements: IAchievement[];
  loading?: boolean;
  showHeader?: boolean;
  showFilters?: boolean;
  itemsPerPage?: number;
}

export type BadgeTier = "common" | "rare" | "epic" | "legendary";

export interface IBadge {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: BadgeTier;
  tier?: BadgeTier; // Alias for rarity
  earned: boolean;
  earnedAt?: Date;
}

export interface IBadgeCardProps {
  badge: IBadge;
  earned?: boolean; // Flattened from badge.earned for convenience
  size?: "sm" | "md" | "lg";
  variant?: "default" | "compact" | "detailed";
  clickable?: boolean;
  showLock?: boolean;
  showProgress?: boolean;
  progress?: number;
}

export interface IBadgeData {
  badge: IBadge;
  progress?: number;
}

export interface IBadgesGridProps {
  badges: IBadgeData[];
  filter?: string;
}

export interface IBadgeUnlockNotificationBadge {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: "common" | "rare" | "epic" | "legendary";
}

export interface ICoinBalanceProps {
  variant?: "compact" | "badge" | "card" | "detailed";
}

export interface ILeaderboardEntry {
  rank: number;
  userId: string;
  currentUserId?: string; // For comparison
  name: string;
  displayName?: string; // Alias for name
  avatar?: string;
  score: number;
  xp?: number; // Alias for score
  level?: number;
  change?: number;
  badges?: unknown[];
}

export interface IUserRank {
  rank: number;
  score: number;
}

export interface ILeaderboardProps {
  entries: ILeaderboardEntry[];
  userRank?: IUserRank;
  type?: "weekly" | "monthly" | "all_time";
  variant?: "compact" | "detailed" | "card";
  loading?: boolean;
  getLevelDescriptionClass?: (level: number) => string;
  scrollTargetSelector?: string;
}

export interface IReward {
  type: "badge" | "xp" | "coins";
  value: string | number;
  icon?: string;
}

export interface ILevelUpCelebrationProps {
  newLevel: number;
  rewards?: IReward[];
  show?: boolean;
}

export interface IMilestoneReward {
  type: string;
  value: number;
  icon?: string;
}

export interface IMilestoneStat {
  label: string;
  value: number;
}

export interface IMilestone {
  type: string;
  value: number;
  rewards: IMilestoneReward[];
  stats?: IMilestoneStat[];
}

export interface IMilestoneCelebrationProps {
  milestone: IMilestone;
  show?: boolean;
  celebrationStyle?: string;
  duration?: number;
  badges?: unknown[];
  xpReward?: number;
  title?: string;
  description?: string;
  icon?: string;
}

export interface IStreakDisplayProps {
  variant?: "compact" | "card" | "detailed";
}

export interface IXPSource {
  label: string;
  amount: number;
  xp?: number; // Alias for amount
  icon?: string;
  color?: string;
  description?: string;
  detail?: string;
}

export interface IMultiplier {
  label: string;
  value: number;
}

export interface IXPBreakdownProps {
  sources: IXPSource[];
  multipliers?: IMultiplier[];
  totalXP: number;
  variant?: "compact" | "detailed" | "card";
  showTips?: boolean;
  breakdown?: Record<string, unknown>; // For detailed breakdown data
}

export interface IXPDisplayProps {
  currentXP: number;
  requiredXP: number;
  level: number;
  levelTitle?: string;
  levelProgress?: number;
  showProgress?: boolean;
  xpToNextLevel?: number;
}
