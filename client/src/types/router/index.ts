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
  requiresRole?: string;
  title?: string;
  description?: string;
  breadcrumb?: string;
  layout?: string;
  locale?: boolean;
  access?: "free" | "paid" | "paid:intermediate" | "paid:advanced" | "paid:pro";
  [key: string]: string | boolean | undefined;
}
