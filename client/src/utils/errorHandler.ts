/**
 * Centralized Error Handling Utility
 * Provides consistent error handling across the application
 */

export interface AppError {
  message: string;
  code?: string;
  statusCode?: number;
  originalError?: Error | unknown;
}

/**
 * Parse error from various sources into a standardized format
 */
export function parseError(error: unknown): AppError {
  // Handle Response errors (fetch API)
  if (error instanceof Response) {
    return {
      message: getHttpErrorMessage(error.status),
      code: `HTTP_${error.status}`,
      statusCode: error.status,
      originalError: error,
    };
  }

  // Handle standard Error objects
  if (error instanceof Error) {
    return {
      message: error.message || "An unexpected error occurred",
      originalError: error,
    };
  }

  // Handle string errors
  if (typeof error === "string") {
    return {
      message: error,
    };
  }

  // Handle structured error objects
  if (error && typeof error === "object") {
    const errObj = error as Record<string, unknown>;
    return {
      message: String(errObj.message || errObj.error || "An unexpected error occurred"),
      code: String(errObj.code || ""),
      statusCode: typeof errObj.statusCode === "number" ? errObj.statusCode : undefined,
      originalError: error,
    };
  }

  // Fallback for unknown error types
  return {
    message: "An unexpected error occurred",
    originalError: error,
  };
}

/**
 * Get user-friendly message for HTTP status codes
 */
export function getHttpErrorMessage(statusCode: number): string {
  const messages: Record<number, string> = {
    400: "Invalid request. Please check your input and try again.",
    401: "You need to be logged in to perform this action.",
    403: "You don't have permission to perform this action.",
    404: "The requested resource was not found.",
    408: "Request timeout. Please try again.",
    409: "This action conflicts with existing data.",
    422: "Invalid data provided. Please check your input.",
    429: "Too many requests. Please slow down and try again later.",
    500: "Server error. Please try again later.",
    502: "Service temporarily unavailable. Please try again later.",
    503: "Service temporarily unavailable. Please try again later.",
    504: "Request timeout. Please try again.",
  };

  return messages[statusCode] || `An error occurred (${statusCode})`;
}

/**
 * Check if error is a network error
 */
export function isNetworkError(error: unknown): boolean {
  if (error instanceof Error) {
    return (
      error.message.includes("NetworkError") ||
      error.message.includes("Failed to fetch") ||
      error.message.includes("Network request failed") ||
      error.name === "AbortError"
    );
  }
  return false;
}

/**
 * Check if error is an authentication error
 */
export function isAuthError(error: unknown): boolean {
  const parsed = parseError(error);
  return parsed.statusCode === 401 || parsed.statusCode === 403;
}

/**
 * Check if error is a validation error
 */
export function isValidationError(error: unknown): boolean {
  const parsed = parseError(error);
  return parsed.statusCode === 400 || parsed.statusCode === 422;
}

/**
 * Get user-friendly error message with i18n support
 */
export function getUserFriendlyMessage(error: unknown, context?: string): string {
  const parsed = parseError(error);

  // Network errors
  if (isNetworkError(error)) {
    return "Unable to connect to the server. Please check your internet connection and try again.";
  }

  // Auth errors
  if (isAuthError(error)) {
    return "Your session has expired. Please log in again.";
  }

  // Validation errors
  if (isValidationError(error)) {
    return parsed.message || "Please check your input and try again.";
  }

  // Context-specific messages
  if (context) {
    const contextMessages: Record<string, string> = {
      "quiz-submit":
        "Failed to submit your quiz. Your answers have been saved locally and will be synced when the connection is restored.",
      "study-load": "Failed to load study content. Please try again or refresh the page.",
      "progress-save":
        "Failed to save your progress. Your data will be synced when the connection is restored.",
      "profile-update": "Failed to update your profile. Please try again.",
      payment: "Payment processing failed. Please try again or contact support.",
    };

    if (contextMessages[context]) {
      return contextMessages[context];
    }
  }

  // Default to parsed message
  return parsed.message;
}

/**
 * Log error for debugging (development only)
 */
export function logError(error: unknown, context?: string): void {
  if (import.meta.env.DEV) {
    const parsed = parseError(error);
    const prefix = context ? `[${context}]` : "[Error]";
    console.error(prefix, {
      message: parsed.message,
      code: parsed.code,
      statusCode: parsed.statusCode,
      originalError: parsed.originalError,
    });
  }
}

/**
 * Create a retry function with exponential backoff
 */
export function createRetryFunction<T>(
  fn: () => Promise<T>,
  options: {
    maxRetries?: number;
    initialDelay?: number;
    maxDelay?: number;
    backoffMultiplier?: number;
    shouldRetry?: (error: unknown, attempt: number) => boolean;
  } = {}
): () => Promise<T> {
  const {
    maxRetries = 3,
    initialDelay = 1000,
    maxDelay = 10000,
    backoffMultiplier = 2,
    shouldRetry = (error) => isNetworkError(error),
  } = options;

  return async () => {
    let lastError: unknown;
    let delay = initialDelay;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error;

        // Don't retry if we've exhausted attempts or shouldn't retry
        if (attempt >= maxRetries || !shouldRetry(error, attempt)) {
          throw error;
        }

        // Wait before retrying
        await new Promise((resolve) => setTimeout(resolve, delay));

        // Exponential backoff
        delay = Math.min(delay * backoffMultiplier, maxDelay);

        logError(error, `Retry attempt ${attempt + 1}/${maxRetries}`);
      }
    }

    throw lastError;
  };
}
