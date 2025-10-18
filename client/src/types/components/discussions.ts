/**
 * Discussion Component Props & Types
 */

export interface IDiscussionActionsProps {
  discussionId: string;
  discussion?: Record<string, unknown>; // Full discussion object for convenience
  questionCreatorId?: string;
  likes: number;
  likedByUser: boolean;
  canEdit: boolean;
  canDelete: boolean;
}

export interface IDiscussionActionsEmits {
  (e: "like"): void;
  (e: "edit"): void;
  (e: "delete"): void;
}

export interface IDiscussionFormProps {
  questionId: string;
  parentId?: string;
  initialContent?: string;
}

export interface IDiscussionFormEmits {
  (e: "submit", content: string): void;
  (e: "cancel"): void;
}

export interface IDiscussionItemProps {
  discussion: Record<string, unknown>;
  questionId: string;
}

export interface IDiscussionListProps {
  questionId: string;
  discussions: Record<string, unknown>[];
}

export interface IReplyFormProps {
  discussionId: string;
}

export interface IReplyFormEmits {
  (e: "submit", content: string): void;
}
