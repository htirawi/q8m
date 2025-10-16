/**
 * Common Component Props & Types
 */

export interface IMarkdownRendererProps {
  content: string;
  enableCodeHighlight?: boolean;
  enableMath?: boolean;
  sanitize?: boolean;
}

export interface IParsedBlock {
  type: "text" | "code" | "math";
  content: string;
  language?: string;
}

