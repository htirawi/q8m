/**
 * Discussion and Community Types
 * Shared types for discussion forums and community features
 */

/**
 * User info in discussion context
 */
export interface DiscussionUser {
  _id: string;
  name: string;
  avatar?: string;
  gamification?: {
    level: number;
  };
}

/**
 * Discussion reply
 */
export interface DiscussionReply {
  _id: string;
  userId: DiscussionUser;
  content: string;
  likes: string[];
  likesCount: number;
  likedByCurrentUser: boolean;
  isEdited: boolean;
  editedAt?: Date;
  isBestAnswer?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Main discussion entity
 */
export interface Discussion {
  _id: string;
  questionId: string;
  userId: DiscussionUser;
  content: string;
  parentId?: string | null;
  likes: string[];
  likesCount: number;
  likedByCurrentUser: boolean;
  replies?: DiscussionReply[];
  isEdited: boolean;
  isPinned: boolean;
  isReported: boolean;
  reportCount: number;
  isBestAnswer: boolean;
  editedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * DTO for creating a new discussion or reply
 */
export interface CreateDiscussionDto {
  questionId: string;
  content: string;
  parentId?: string;
}

/**
 * DTO for updating a discussion
 */
export interface UpdateDiscussionDto {
  content: string;
}

/**
 * Pagination metadata
 */
export interface Pagination {
  page: number;
  limit: number;
  total: number;
  hasMore: boolean;
}
