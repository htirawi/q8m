/**
 * HTML escaping utilities for preventing XSS attacks
 */

/**
 * Escape HTML special characters to prevent XSS
 * @param input - The input to escape
 * @returns HTML-escaped string
 */
export function escapeHtml(input: unknown): string {
  const s = String(input ?? "");
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/**
 * Escape HTML attributes (quotes and other special characters)
 * @param input - The input to escape
 * @returns HTML attribute-escaped string
 */
export function escapeHtmlAttribute(input: unknown): string {
  const s = String(input ?? "");
  return s
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/**
 * Escape JavaScript string literals
 * @param input - The input to escape
 * @returns JavaScript-escaped string
 */
export function escapeJavaScript(input: unknown): string {
  const s = String(input ?? "");
  return s
    .replace(/\\/g, "\\\\")
    .replace(/'/g, "\\'")
    .replace(/"/g, '\\"')
    .replace(/\n/g, "\\n")
    .replace(/\r/g, "\\r")
    .replace(/\t/g, "\\t");
}

/**
 * Validate and sanitize redirect URLs to prevent open redirects
 * @param url - The URL to validate
 * @param allowedHosts - Array of allowed hosts
 * @returns Sanitized URL or null if invalid
 */
export function sanitizeRedirectUrl(url: string, allowedHosts: string[] = []): string | null {
  try {
    const parsedUrl = new URL(url);

    // Only allow http and https protocols
    if (!["http:", "https:"].includes(parsedUrl.protocol)) {
      return null;
    }

    // Check if host is in allowed list
    if (allowedHosts.length > 0 && !allowedHosts.includes(parsedUrl.hostname)) {
      return null;
    }

    // For internal redirects, only allow relative paths
    if (parsedUrl.hostname === "localhost" || parsedUrl.hostname.startsWith("127.0.0.1")) {
      return parsedUrl.pathname + parsedUrl.search + parsedUrl.hash;
    }

    return url;
  } catch {
    // If URL parsing fails, treat as relative path
    if (url.startsWith("/") && !url.startsWith("//")) {
      return url;
    }
    return null;
  }
}

/**
 * Sanitize user input for display in error messages
 * @param input - The input to sanitize
 * @returns Sanitized string safe for display
 */
export function sanitizeForDisplay(input: unknown): string {
  const s = String(input ?? "");
  // Remove control characters and limit length
  return s.replace(/[\x00-\x1F\x7F-\x9F]/g, "").slice(0, 1000);
}
