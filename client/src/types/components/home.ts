/**
 * Home Component Props & Types
 */

export interface IHeroSectionProps {
  title?: string;
  subtitle?: string;
  ctaText?: string;
}

export interface IMobileStickyBarEmits {
  (e: "start"): void;
}

export interface ISocialProofBarProps {
  userCount?: number;
  companyLogos?: string[];
  showAnimation?: boolean;
}

