/**
 * Router Types
 */

export const SUPPORTED_LOCALES = ["en", "ar"] as const;
export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];

export interface RouteMeta {
  requiresAuth?: boolean;
  requiresGuest?: boolean;
  requiresAdmin?: boolean;
  requiresEntitlement?: string;
  title?: string;
  breadcrumb?: string;
  layout?: string;
  [key: string]: string | boolean | undefined;
}
