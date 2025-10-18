/**
 * Common Component Props & Types
 */

import type { Component } from "vue";

export interface IActivity {
  id: string;
  type: string;
  title?: string;
  description?: string;
  timestamp: Date | string;
  icon?: string;
  [key: string]: unknown;
}

export interface IRecentActivityProps {
  activities: IActivity[];
  displayLimit?: number;
}

export interface IMarkdownRendererProps {
  content: string;
  enableCodeHighlight?: boolean;
  enableMath?: boolean;
  sanitize?: boolean;
}

export interface IParsedBlock {
  type?: "text" | "code" | "math";
  content?: string;
  language?: string;
  component?: Component | string;
  props?: Record<string, unknown>;
}
