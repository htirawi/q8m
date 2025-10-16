/**
 * Store Types
 */

// Discussion Store Types
export interface IDiscussion {
  _id: string;
  questionId: string;
  userId: {
    _id: string;
    name: string;
    avatar?: string;
    gamification?: {
      level: number;
    };
  };
  content: string;
  parentId?: string;
  likes: string[];
  likesCount: number;
  likedByCurrentUser: boolean;
  isEdited: boolean;
  editedAt?: Date;
  isPinned: boolean;
  isBestAnswer: boolean;
  isReported: boolean;
  reportCount: number;
  createdAt: Date;
  updatedAt: Date;
  replies?: IDiscussion[];
}

export interface ICreateDiscussionDto {
  questionId: string;
  content: string;
  parentId?: string;
}

export interface IUpdateDiscussionDto {
  content: string;
}

export interface IPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasMore: boolean;
}
