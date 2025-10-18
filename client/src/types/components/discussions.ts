/**
 * Discussion Component Props & Types
 */

import type { IDiscussion } from "@/types/stores";

export interface IDiscussionActionsProps {
  discussionId: string;
  discussion: IDiscussion; // Full discussion object (required for actions)
  questionCreatorId?: string;
  likes: number;
  likedByUser: boolean;
  canEdit: boolean;
  canDelete: boolean;
}

export interface IDiscussionActionsEmits {
  (e: "like"): void;
  (e: "reply"): void;
  (e: "edit"): void;
  (e: "delete"): void;
}

export interface IDiscussionItemProps {
  discussion: IDiscussion;
  questionId: string;
  questionCreatorId?: string;
  isReply?: boolean;
}

export interface IDiscussionListProps {
  questionId: string;
  discussions: IDiscussion[];
  questionCreatorId?: string;
  showForm?: boolean;
}

export interface IDiscussionFormProps {
  questionId: string;
  parentId?: string;
  initialContent?: string;
  placeholder?: string;
  showCancel?: boolean;
  maxLength?: number;
  minRows?: number;
}

export interface IDiscussionFormEmits {
  (e: "submit", content: string): void;
  (e: "cancel"): void;
}

export interface IReplyFormProps {
  discussionId: string;
  placeholder?: string;
}

export interface IReplyFormEmits {
  (e: "submit", content: string): void;
  (e: "cancel"): void;
}
