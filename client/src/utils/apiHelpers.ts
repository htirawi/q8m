/**
 * API Helper utilities for robust error handling
 */

export interface IApiError {
  message: string;
  status: number;
  data?: unknown;
}

/**
 * Safely parse JSON response, handling empty bodies and non-JSON responses
 */
export async function safeJsonParse(response: Response): Promise<unknown> {
  const text = await response.text();

  // If empty body, return null
  if (!text || text.trim() === "") {
    return null;
  }

  // Try to parse as JSON
  try {
    return JSON.parse(text);
  } catch (_err) {
    // If not valid JSON, return the text
    return { message: text };
  }
}

/**
 * Handle API response with robust error handling
 * Returns parsed data or throws ApiError
 */
export async function handleApiResponse<T = unknown>(response: Response): Promise<T> {
  const data = await safeJsonParse(response);

  if (!response.ok) {
    // Extract error message from various possible formats
    let errorMessage = "Request failed";

    if (data && typeof data === "object") {
      const dataObj = data as Record<string, unknown>;
      errorMessage = (dataObj.message as string) || (dataObj.error as string) || errorMessage;
    } else if (typeof data === "string") {
      errorMessage = data;
    }

    // Add status code context for 500 errors
    if (response.status >= 500) {
      errorMessage = `Server error: ${errorMessage}`;
    }

    const error: IApiError = {
      message: errorMessage,
      status: response.status,
      data,
    };

    throw error;
  }

  return data as T;
}

/**
 * Check if error is a network error (no response from server)
 */
export function isNetworkError(error: unknown): boolean {
  return error instanceof TypeError && error.message === "Failed to fetch";
}

/**
 * Get user-friendly error message from any error
 */
export function getErrorMessage(error: unknown, fallback: string = "An error occurred"): string {
  if (isNetworkError(error)) {
    return "Network error: Unable to connect to server. Please check your connection.";
  }

  if (error && typeof error === "object" && "message" in error) {
    return (error as IApiError).message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return fallback;
}
