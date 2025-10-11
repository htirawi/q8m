/**
 * SEO Route Types
 *
 * Type definitions for SEO routes
 */

export interface SitemapRoute {
  url: string;
  lastmod: string;
  changefreq?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority?: number;
}
