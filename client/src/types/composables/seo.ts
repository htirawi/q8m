/**
 * SEO Composable Types
 */

export type StructuredDataValue =
  | string
  | number
  | boolean
  | string[]
  | number[]
  | StructuredDataObject
  | StructuredDataObject[];

export interface StructuredDataObject {
  "@context"?: string;
  "@type"?: string;
  [key: string]: StructuredDataValue | undefined;
}

export type StructuredData = StructuredDataObject;

export interface SEOData {
  title?: string;
  description?: string;
  keywords?: string[];
  canonical?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogType?: string;
  ogUrl?: string;
  twitterCard?: string;
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImage?: string;
  twitterSite?: string;
  twitterCreator?: string;
  noindex?: boolean;
  nofollow?: boolean;
  structuredData?: StructuredData;
}

export interface QuizQuestion {
  id: string;
  question: string;
  answer: string;
}

export interface QuizData {
  title: string;
  description: string;
  level: string;
  category: string;
  createdAt: string;
  updatedAt: string;
  estimatedTime?: string;
  questions?: QuizQuestion[];
  tags?: string[];
}

export interface PlanData {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
}

export interface PricingData {
  plans?: PlanData[];
}
