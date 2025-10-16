/**
 * Route Helper Types
 * Common type definitions for routes to avoid repetitive typing
 */

import type { ObjectId } from "mongoose";

/**
 * Populated user data from mongoose queries
 */
export interface PopulatedUser {
  _id: string | ObjectId;
  name: string;
  email?: string;
  avatar?: string;
  gamification?: {
    level?: number;
    xp?: number;
  };
}

/**
 * Challenge data from lean queries
 */
export interface LeanChallenge {
  _id: string;
  challengerId: string | PopulatedUser;
  challengedUserId: string | PopulatedUser;
  status: string;
  winnerId?: string;
  isTie?: boolean;
  challengerScore?: number;
  challengedScore?: number;
  challengerTime?: number;
  challengedTime?: number;
  difficulty?: string;
  framework?: string;
  questionCount?: number;
  timeLimit?: number;
  questions?: unknown[];
  challengerAnswers?: unknown[];
  challengedAnswers?: unknown[];
  message?: string;
  expiresAt?: Date;
  completedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Discussion data from lean queries
 */
export interface LeanDiscussion {
  _id: string;
  questionId: string;
  userId: string | PopulatedUser;
  content: string;
  parentId?: string | null;
  likes?: string[];
  reports?: Array<{
    userId: string;
    reason: string;
    createdAt: Date;
  }>;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * User connection data from lean queries
 */
export interface LeanUserConnection {
  _id: string;
  userId: string;
  friendId: string | PopulatedUser;
  status: "pending" | "accepted" | "blocked";
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Friend data for responses
 */
export interface FriendData {
  _id: string;
  id: string;
  name: string;
  email?: string;
  avatar?: string;
  level?: number;
  xp?: number;
  status?: string;
}
