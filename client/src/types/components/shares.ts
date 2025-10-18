/**
 * Share Component Props & Types
 */

export interface IShareButtonProps {
  text?: string;
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  showText?: boolean;
  disabled?: boolean;
  openModal?: boolean;
  platform?: string;
  shareType?: string;
  entityId?: string;
}

export interface IShareModalProps {
  show: boolean;
  title?: string;
  description?: string;
  url?: string;
  shareType?: string;
  entityId?: string;
}

export interface IShareModalEmits {
  (e: "close"): void;
  (e: "share", platform: string): void;
}
