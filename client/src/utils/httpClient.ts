/**
 * HTTP Client Utility
 * Centralized HTTP request handling with auth, headers, and error handling
 */

import { HTTP_METHODS, JSON_HEADERS, AUTH_CONSTANTS, HTTP_HEADERS } from "@/config/constants";
import { handleApiResponse, getErrorMessage } from "./apiHelpers";

// ============================================
// Types
// ============================================

// eslint-disable-next-line no-undef
export interface IRequestOptions extends RequestInit {
  timeout?: number;
  requireAuth?: boolean;
  useBearer?: boolean;
  silent?: boolean; // Don't throw errors, return null instead
}

export interface IHttpClientConfig {
  baseURL?: string;
  defaultHeaders?: Record<string, string>;
  timeout?: number;
}

// ============================================
// Auth Helper
// ============================================

/**
 * Get authentication headers based on auth type
 * @param useBearer - If true, uses Bearer token; otherwise uses cookies
 * @param token - Optional token override
 */
// eslint-disable-next-line no-undef
export function getAuthHeaders(useBearer: boolean = false, token?: string): HeadersInit {
  if (!useBearer) {
    // Cookie-based auth - no Authorization header needed
    return {};
  }

  const authToken = token || AUTH_CONSTANTS.COOKIE_BASED_TOKEN;
  return {
    [HTTP_HEADERS.AUTHORIZATION]: `${AUTH_CONSTANTS.BEARER_PREFIX} ${authToken}`,
  };
}

// ============================================
// HTTP Client Class
// ============================================

class HttpClient {
  private config: IHttpClientConfig;

  constructor(config: IHttpClientConfig = {}) {
    this.config = {
      defaultHeaders: JSON_HEADERS,
      timeout: 30000,
      ...config,
    };
  }

  /**
   * Make HTTP request with common settings
   */
  private async request<T>(url: string, options: IRequestOptions = {}): Promise<T> {
    const {
      timeout = this.config.timeout,
      requireAuth = false,
      useBearer = false,
      silent = false,
      headers = {},
      ...fetchOptions
    } = options;

    // Merge headers
    const mergedHeaders = {
      ...this.config.defaultHeaders,
      ...(requireAuth ? getAuthHeaders(useBearer) : {}),
      ...headers,
    };

    // Create abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        ...fetchOptions,
        headers: mergedHeaders,
        credentials: "include", // Always include cookies
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Use existing API response handler
      return await handleApiResponse<T>(response);
    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof Error && error.name === "AbortError") {
        throw new Error("Request timeout");
      }

      // If silent mode, return null instead of throwing
      if (silent) {
        return null as T;
      }

      throw error;
    }
  }

  /**
   * GET request
   */
  async get<T>(url: string, options?: IRequestOptions): Promise<T> {
    return this.request<T>(url, {
      ...options,
      method: HTTP_METHODS.GET,
    });
  }

  /**
   * POST request
   */
  async post<T>(url: string, body?: unknown, options?: IRequestOptions): Promise<T> {
    return this.request<T>(url, {
      ...options,
      method: HTTP_METHODS.POST,
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  /**
   * PUT request
   */
  async put<T>(url: string, body?: unknown, options?: IRequestOptions): Promise<T> {
    return this.request<T>(url, {
      ...options,
      method: HTTP_METHODS.PUT,
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  /**
   * PATCH request
   */
  async patch<T>(url: string, body?: unknown, options?: IRequestOptions): Promise<T> {
    return this.request<T>(url, {
      ...options,
      method: HTTP_METHODS.PATCH,
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  /**
   * DELETE request
   */
  async delete<T>(url: string, options?: IRequestOptions): Promise<T> {
    return this.request<T>(url, {
      ...options,
      method: HTTP_METHODS.DELETE,
    });
  }
}

// ============================================
// Exports
// ============================================

// Singleton instance
export const httpClient = new HttpClient();

// Also export class for custom instances
export { HttpClient };

// Re-export error handler for convenience
export { getErrorMessage };
