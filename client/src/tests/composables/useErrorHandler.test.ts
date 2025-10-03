import { describe, it, expect, vi, beforeEach } from "vitest";
import { setActivePinia, createPinia } from "pinia";
import { useErrorHandler } from "@/composables/useErrorHandler";

describe("useErrorHandler Integration Tests", () => {
  let errorHandler: ReturnType<typeof useErrorHandler>;

  beforeEach(() => {
    setActivePinia(createPinia());
    errorHandler = useErrorHandler();
    vi.clearAllMocks();
  });

  describe("handleError", () => {
    it("should handle Error objects correctly", () => {
      const error = new Error("Test error");
      error.name = "TEST_ERROR";

      const result = errorHandler.handleError(error);

      expect(result.message).toBe("Test error");
      expect(result.code).toBe("TEST_ERROR");
      expect(result.details).toBeNull();
      expect(result.timestamp).toBeTypeOf("number");
      expect(errorHandler.hasError.value).toBe(true);
    });

    it("should handle string errors correctly", () => {
      const error = "String error message";

      const result = errorHandler.handleError(error);

      expect(result.message).toBe("String error message");
      expect(result.code).toBe("STRING_ERROR");
      expect(errorHandler.hasError.value).toBe(true);
    });

    it("should handle object errors correctly", () => {
      const error = {
        message: "Object error",
        code: "OBJECT_ERROR",
        details: { field: "test" },
      };

      const result = errorHandler.handleError(error, { showDetails: true });

      expect(result.message).toBe("Object error");
      expect(result.code).toBe("OBJECT_ERROR");
      expect(result.details).toEqual(error.details);
      expect(errorHandler.hasError.value).toBe(true);
    });

    it("should handle null/undefined errors", () => {
      const result = errorHandler.handleError(null);

      expect(result.message).toBe("errors.generic");
      expect(result.code).toBe("UNKNOWN_ERROR");
      expect(errorHandler.hasError.value).toBe(true);
    });
  });

  describe("handlePaymentError", () => {
    it("should handle payment-specific errors", () => {
      const error = new Error("Payment declined");
      error.name = "PAYMENT_DECLINED";

      const result = errorHandler.handlePaymentError(error);

      expect(result.message).toBe("errors.payment.declined");
      expect(result.code).toBe("PAYMENT_DECLINED");
      expect(errorHandler.hasError.value).toBe(true);
    });

    it("should handle generic payment errors", () => {
      const error = new Error("Payment failed");

      const result = errorHandler.handlePaymentError(error);

      expect(result.message).toBe("Payment failed");
      expect(result.code).toBe("ERROR");
      expect(errorHandler.hasError.value).toBe(true);
    });
  });

  describe("handleAuthError", () => {
    it("should handle authentication errors", () => {
      const error = new Error("Invalid credentials");
      error.name = "AUTH_INVALID_CREDENTIALS";

      const result = errorHandler.handleAuthError(error);

      expect(result.message).toBe("errors.auth.invalidCredentials");
      expect(result.code).toBe("AUTH_INVALID_CREDENTIALS");
      expect(errorHandler.hasError.value).toBe(true);
    });
  });

  describe("handleNetworkError", () => {
    it("should handle network errors", () => {
      const error = new Error("Network timeout");
      error.name = "NETWORK_TIMEOUT";

      const result = errorHandler.handleNetworkError(error);

      expect(result.message).toBe("errors.network.timeout");
      expect(result.code).toBe("NETWORK_TIMEOUT");
      expect(errorHandler.hasError.value).toBe(true);
    });
  });

  describe("handleValidationError", () => {
    it("should handle validation errors", () => {
      const error = new Error("Required field missing");
      error.name = "VALIDATION_REQUIRED";

      const result = errorHandler.handleValidationError(error);

      expect(result.message).toBe("errors.validation.required");
      expect(result.code).toBe("VALIDATION_REQUIRED");
      expect(errorHandler.hasError.value).toBe(true);
    });
  });

  describe("translateError", () => {
    it("should translate known error codes", () => {
      const translated = errorHandler.translateError("PAYMENT_FAILED", "Payment failed");
      expect(translated).toBe("errors.payment.failed");
    });

    it("should return original message for unknown codes", () => {
      const translated = errorHandler.translateError("UNKNOWN_CODE", "Original message");
      expect(translated).toBe("Original message");
    });

    it("should return generic error for null/undefined", () => {
      const translated = errorHandler.translateError("UNKNOWN_CODE", null as any);
      expect(translated).toBe("errors.generic");
    });
  });

  describe("clearError", () => {
    it("should clear error state", () => {
      errorHandler.handleError(new Error("Test error"));
      expect(errorHandler.hasError.value).toBe(true);

      errorHandler.clearError();

      expect(errorHandler.hasError.value).toBe(false);
      expect(errorHandler.errorState.value.message).toBeNull();
      expect(errorHandler.errorState.value.code).toBeNull();
      expect(errorHandler.errorState.value.details).toBeNull();
      expect(errorHandler.errorState.value.timestamp).toBeNull();
    });
  });

  describe("isRecentError", () => {
    it("should return true for recent errors", () => {
      errorHandler.handleError(new Error("Recent error"));
      expect(errorHandler.isRecentError.value).toBe(true);
    });

    it("should return false for old errors", () => {
      // Mock an old error by setting timestamp to past
      errorHandler.handleError(new Error("Old error"));
      const oldTimestamp = Date.now() - 10000; // 10 seconds ago
      errorHandler.errorState.value.timestamp = oldTimestamp;

      expect(errorHandler.isRecentError.value).toBe(false);
    });
  });

  describe("error options", () => {
    it("should respect showToast option", () => {
      const error = new Error("Test error");

      // This should not show toast
      errorHandler.handleError(error, { showToast: false });

      // This should show toast (default behavior)
      errorHandler.handleError(error, { showToast: true });

      // Both should set error state
      expect(errorHandler.hasError.value).toBe(true);
    });

    it("should respect logToConsole option", () => {
      const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
      const error = new Error("Test error");

      errorHandler.handleError(error, { logToConsole: true });
      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockClear();
      errorHandler.handleError(error, { logToConsole: false });
      expect(consoleSpy).not.toHaveBeenCalled();

      consoleSpy.mockRestore();
    });

    it("should respect showDetails option", () => {
      const error = {
        message: "Test error",
        code: "TEST_ERROR",
        details: { field: "test" },
      };

      const resultWithoutDetails = errorHandler.handleError(error, { showDetails: false });
      expect(resultWithoutDetails.details).toBeNull();

      const resultWithDetails = errorHandler.handleError(error, { showDetails: true });
      expect(resultWithDetails.details).toEqual(error.details);
    });
  });
});
