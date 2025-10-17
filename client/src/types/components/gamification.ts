/**
 * Gamification Component Props & Types
 */

export interface IAchievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  date: Date;
  xpEarned?: number;
}

export interface IAchievementTimelineProps {
  achievements: IAchievement[];
  loading?: boolean;
}

export interface IBadge {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: "common" | "rare" | "epic" | "legendary";
  earned: boolean;
  earnedAt?: Date;
}

export interface IBadgeCardProps {
  badge: IBadge;
  size?: "sm" | "md" | "lg";
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
  name: string;
  avatar?: string;
  score: number;
  change?: number;
}

export interface IUserRank {
  rank: number;
  score: number;
}

export interface ILeaderboardProps {
  entries: ILeaderboardEntry[];
  userRank?: IUserRank;
  type?: "weekly" | "monthly" | "all_time";
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
}

export interface IStreakDisplayProps {
  variant?: "compact" | "card" | "detailed";
}

export interface IXPSource {
  label: string;
  amount: number;
  icon?: string;
  color?: string;
}

export interface IMultiplier {
  label: string;
  value: number;
}

export interface IXPBreakdownProps {
  sources: IXPSource[];
  multipliers?: IMultiplier[];
  totalXP: number;
}

export interface IXPDisplayProps {
  currentXP: number;
  requiredXP: number;
  level: number;
  showProgress?: boolean;
}
