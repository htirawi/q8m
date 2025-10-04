/* eslint-disable @typescript-eslint/no-explicit-any */
/* TODO: Legacy patterns - Replace 'any' types with proper typing and remove unused vars in next PR */
import { ref, computed, readonly } from "vue";
import { useI18n } from "vue-i18n";

export interface ErrorState {
  message: string | null;
  code: string | null;
  details: Record<string, any> | null;
  timestamp: number | null;
}

export interface ErrorHandlerOptions {
  showToast?: boolean;
  logToConsole?: boolean;
  showDetails?: boolean;
}

export function useErrorHandler() {
  const { t } = useI18n();
  const errorState = ref<ErrorState>({
    message: null,
    code: null,
    details: null,
    timestamp: null,
  });

  const hasError = computed(() => !!errorState.value.message);
  const isRecentError = computed(() => {
    if (!errorState.value.timestamp) return false;
    return Date.now() - errorState.value.timestamp < 5000; // 5 seconds
  });

  const clearError = () => {
    errorState.value = {
      message: null,
      code: null,
      details: null,
      timestamp: null,
    };
  };

  const handleError = (error: unknown, options: ErrorHandlerOptions = {}): ErrorState => {
    const { showToast = true, logToConsole = true, showDetails = false } = options;

    let errorMessage = t("errors.generic");
    let errorCode = "UNKNOWN_ERROR";
    let errorDetails: Record<string, any> | null = null;

    // Parse different error types
    if (error instanceof Error) {
      errorMessage = error.message;
      errorCode = error.name || "ERROR";
      errorDetails = {
        stack: error.stack,
        cause: error.cause,
      };
    } else if (typeof error === "string") {
      errorMessage = error;
      errorCode = "STRING_ERROR";
    } else if (typeof error === "object" && error !== null) {
      const errorObj = error as Record<string, any>;
      errorMessage = errorObj.message || errorObj.error || t("errors.generic");
      errorCode = errorObj.code || errorObj.status || "OBJECT_ERROR";
      errorDetails = errorObj;
    }

    // Translate common error codes
    const translatedMessage = translateError(errorCode, errorMessage);

    // Update error state
    errorState.value = {
      message: translatedMessage,
      code: errorCode,
      details: showDetails ? errorDetails : null,
      timestamp: Date.now(),
    };

    // Log to console if enabled
    if (logToConsole) {
      console.error("Error handled:", {
        code: errorCode,
        message: translatedMessage,
        originalError: error,
        details: errorDetails,
      });
    }

    // Show toast if enabled
    if (showToast) {
      // TODO: Integrate with toast notification system
      console.warn("Toast notification:", translatedMessage);
    }

    return errorState.value;
  };

  const translateError = (code: string, defaultMessage: string): string => {
    const errorTranslations: Record<string, string> = {
      // Payment errors
      PAYMENT_FAILED: t("errors.payment.failed"),
      PAYMENT_CANCELLED: t("errors.payment.cancelled"),
      PAYMENT_INVALID: t("errors.payment.invalid"),
      PAYMENT_EXPIRED: t("errors.payment.expired"),
      PAYMENT_DECLINED: t("errors.payment.declined"),
      PAYMENT_INSUFFICIENT_FUNDS: t("errors.payment.insufficientFunds"),
      PAYMENT_GATEWAY_ERROR: t("errors.payment.gatewayError"),
      PAYMENT_NETWORK_ERROR: t("errors.payment.networkError"),

      // Authentication errors
      AUTH_REQUIRED: t("errors.auth.required"),
      AUTH_INVALID_TOKEN: t("errors.auth.invalidToken"),
      AUTH_TOKEN_EXPIRED: t("errors.auth.tokenExpired"),
      AUTH_INVALID_CREDENTIALS: t("errors.auth.invalidCredentials"),
      AUTH_ACCOUNT_LOCKED: t("errors.auth.accountLocked"),
      AUTH_EMAIL_NOT_VERIFIED: t("errors.auth.emailNotVerified"),

      // Network errors
      NETWORK_ERROR: t("errors.network.generic"),
      NETWORK_TIMEOUT: t("errors.network.timeout"),
      NETWORK_OFFLINE: t("errors.network.offline"),
      NETWORK_SERVER_ERROR: t("errors.network.serverError"),

      // Validation errors
      VALIDATION_ERROR: t("errors.validation.generic"),
      VALIDATION_REQUIRED: t("errors.validation.required"),
      VALIDATION_INVALID_FORMAT: t("errors.validation.invalidFormat"),
      VALIDATION_TOO_SHORT: t("errors.validation.tooShort"),
      VALIDATION_TOO_LONG: t("errors.validation.tooLong"),

      // Entitlement errors
      ENTITLEMENT_INSUFFICIENT: t("errors.entitlement.insufficient"),
      ENTITLEMENT_EXPIRED: t("errors.entitlement.expired"),
      ENTITLEMENT_NOT_FOUND: t("errors.entitlement.notFound"),

      // Currency errors
      CURRENCY_NOT_SUPPORTED: t("errors.currency.notSupported"),
      CURRENCY_RATE_ERROR: t("errors.currency.rateError"),

      // Generic errors
      UNKNOWN_ERROR: t("errors.generic"),
      PERMISSION_DENIED: t("errors.permission.denied"),
      RESOURCE_NOT_FOUND: t("errors.resource.notFound"),
      RATE_LIMIT_EXCEEDED: t("errors.rateLimit.exceeded"),
    };

    return errorTranslations[code] || defaultMessage || t("errors.generic");
  };

  const handlePaymentError = (error: unknown) => {
    return handleError(error, {
      showToast: true,
      logToConsole: true,
      showDetails: false,
    });
  };

  const handleAuthError = (error: unknown) => {
    return handleError(error, {
      showToast: true,
      logToConsole: true,
      showDetails: false,
    });
  };

  const handleNetworkError = (error: unknown) => {
    return handleError(error, {
      showToast: true,
      logToConsole: true,
      showDetails: false,
    });
  };

  const handleValidationError = (error: unknown) => {
    return handleError(error, {
      showToast: false, // Validation errors are usually shown inline
      logToConsole: true,
      showDetails: false,
    });
  };

  return {
    errorState: readonly(errorState),
    hasError,
    isRecentError,
    clearError,
    handleError,
    handlePaymentError,
    handleAuthError,
    handleNetworkError,
    handleValidationError,
    translateError,
  };
}
