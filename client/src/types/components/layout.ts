/**
 * Layout Component Props & Types
 */

import type { VNode } from "vue";

export interface IMenuItem {
  path: string;
  label: string;
  icon: VNode;
  badge?: {
    type: "new" | "count" | "dot";
    value?: number | string;
  };
}

export interface IUserMenuProps {
  userName?: string;
  userEmail?: string;
  userAvatar?: string;
  planName?: string;
  isPaidUser?: boolean;
}
