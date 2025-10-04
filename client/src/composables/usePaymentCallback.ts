/**
 * Payment Callback Composable
 *
 * Handles payment success/failure callbacks from payment gateways
 */

/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
/* TODO: Legacy patterns - Replace 'any' types with proper typing and remove unused vars in next PR */
import { ref, computed } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useI18n } from "vue-i18n";
import { usePaymentStore } from "@/stores/payment";
import { useAuthStore } from "@/stores/auth";

export interface PaymentCallbackData {
  paymentId?: string;
  payerId?: string;
  token?: string;
  PayerID?: string; // PayPal alternative naming
  gateway?: string;
  success?: boolean;
  error?: string;
  orderId?: string;
  amount?: string;
  currency?: string;
  plan?: string;
}

export function usePaymentCallback() {
  const router = useRouter();
  const route = useRoute();
  const { t } = useI18n();
  const paymentStore = usePaymentStore();
  const authStore = useAuthStore();

  const isProcessing = ref(false);
  const callbackResult = ref<{
    success: boolean;
    message: string;
    data?: any;
  } | null>(null);

  // Extract callback data from URL parameters
  const extractCallbackData = (): PaymentCallbackData => {
    const {query} = route;

    return {
      paymentId: query.paymentId as string,
      payerId: query.payerId as string,
      token: query.token as string,
      PayerID: query.PayerID as string,
      gateway: query.gateway as string,
      success: query.success === "true",
      error: query.error as string,
      orderId: query.orderId as string,
      amount: query.amount as string,
      currency: query.currency as string,
      plan: query.plan as string,
    };
  };

  // Determine payment gateway from URL or data
  const detectPaymentGateway = (data: PaymentCallbackData): string => {
    if (data.gateway) return data.gateway;

    // Detect from URL path
    const {path} = route;
    if (path.includes("/paypal")) return "paypal";
    if (path.includes("/aps")) return "aps";
    if (path.includes("/hyperpay")) return "hyperpay";

    // Detect from callback data
    if (data.payerId || data.PayerID || data.token) return "paypal";
    if (data.paymentId && data.paymentId.startsWith("APS_")) return "aps";
    if (data.paymentId && data.paymentId.startsWith("HP_")) return "hyperpay";

    return "unknown";
  };

  // Handle payment success callback
  const handlePaymentSuccess = async (data: PaymentCallbackData) => {
    try {
      isProcessing.value = true;

      const gateway = detectPaymentGateway(data);

      if (!data.paymentId) {
        throw new Error("Payment ID is required");
      }

      // Prepare callback payload based on gateway
      const callbackPayload: any = {
        paymentId: data.paymentId,
      };

      switch (gateway) {
        case "paypal":
          callbackPayload.payerId = data.payerId || data.PayerID;
          callbackPayload.token = data.token;
          break;
        case "aps":
          // APS doesn't require additional parameters
          break;
        case "hyperpay":
          // HyperPay doesn't require additional parameters
          break;
        default:
          throw new Error(`Unsupported payment gateway: ${gateway}`);
      }

      // Process payment callback
      const result = await paymentStore.handlePaymentCallback(gateway, callbackPayload);

      if (result.success) {
        callbackResult.value = {
          success: true,
          message: t("payment.success.message"),
          data: {
            purchaseId: result.purchaseId,
            gateway,
            orderId: data.orderId,
            amount: data.amount,
            currency: data.currency,
            plan: data.plan,
          },
        };

        // Redirect to success page with order details
        await router.push({
          path: "/payment/success",
          query: {
            orderId: data.orderId,
            plan: data.plan,
            amount: data.amount,
            currency: data.currency,
            purchaseId: result.purchaseId,
          },
        });
      } else {
        throw new Error(result.error || "Payment verification failed");
      }
    } catch (error) {
      console.error("Payment success callback error:", error);

      callbackResult.value = {
        success: false,
        message: error instanceof Error ? error.message : t("payment.error.verificationFailed"),
      };

      // Redirect to error page
      await router.push({
        path: "/payment/error",
        query: {
          error: "verification_failed",
          message: callbackResult.value.message,
          orderId: data.orderId,
          plan: data.plan,
        },
      });
    } finally {
      isProcessing.value = false;
    }
  };

  // Handle payment failure callback
  const handlePaymentFailure = async (data: PaymentCallbackData) => {
    try {
      isProcessing.value = true;

      const errorMessage = data.error || t("payment.error.default");

      callbackResult.value = {
        success: false,
        message: errorMessage,
        data: {
          orderId: data.orderId,
          plan: data.plan,
          amount: data.amount,
          currency: data.currency,
        },
      };

      // Redirect to error page
      await router.push({
        path: "/payment/error",
        query: {
          error: "payment_failed",
          message: errorMessage,
          orderId: data.orderId,
          plan: data.plan,
          amount: data.amount,
          currency: data.currency,
        },
      });
    } finally {
      isProcessing.value = false;
    }
  };

  // Handle payment cancellation
  const handlePaymentCancellation = async () => {
    try {
      isProcessing.value = true;

      callbackResult.value = {
        success: false,
        message: t("payment.error.cancelled"),
      };

      // Redirect to pricing page
      await router.push({
        path: "/subscribe",
        query: {
          cancelled: "true",
        },
      });
    } finally {
      isProcessing.value = false;
    }
  };

  // Process callback based on current route
  const processCallback = async () => {
    const data = extractCallbackData();

    // Check for cancellation
    if (route.query.cancelled === "true" || route.query.cancel === "true") {
      await handlePaymentCancellation();
      return;
    }

    // Check for success/failure
    if (data.success === true || route.query.success === "true") {
      await handlePaymentSuccess(data);
    } else if (data.error || route.query.error) {
      await handlePaymentFailure(data);
    } else {
      // Unknown callback state
      callbackResult.value = {
        success: false,
        message: t("payment.error.unknownState"),
      };
    }
  };

  // Check if current route is a payment callback
  const isPaymentCallback = computed(() => {
    const {path} = route;
    return (
      path.includes("/payment/success") ||
      path.includes("/payment/error") ||
      path.includes("/payment/cancel") ||
      path.includes("/paypal/callback") ||
      path.includes("/aps/callback") ||
      path.includes("/hyperpay/callback") ||
      route.query.paymentId ||
      route.query.success ||
      route.query.error ||
      route.query.cancelled
    );
  });

  // Get callback status message
  const getCallbackStatusMessage = computed(() => {
    if (!callbackResult.value) return null;

    return {
      type: callbackResult.value.success ? "success" : "error",
      message: callbackResult.value.message,
      data: callbackResult.value.data,
    };
  });

  // Clear callback result
  const clearCallbackResult = () => {
    callbackResult.value = null;
  };

  return {
    // State
    isProcessing,
    callbackResult,

    // Computed
    isPaymentCallback,
    getCallbackStatusMessage,

    // Methods
    processCallback,
    handlePaymentSuccess,
    handlePaymentFailure,
    handlePaymentCancellation,
    extractCallbackData,
    detectPaymentGateway,
    clearCallbackResult,
  };
}

// PayPal specific callback handler
export function usePayPalCallback() {
  const callback = usePaymentCallback();

  const handlePayPalCallback = async () => {
    const data = callback.extractCallbackData();

    // PayPal specific validation
    if (!data.paymentId) {
      throw new Error("PayPal payment ID is required");
    }

    // PayPal uses payerId or PayerID
    if (!data.payerId && !data.PayerID) {
      throw new Error("PayPal payer ID is required");
    }

    await callback.handlePaymentSuccess({
      ...data,
      gateway: "paypal",
    });
  };

  return {
    ...callback,
    handlePayPalCallback,
  };
}

// APS specific callback handler
export function useAPSCallback() {
  const callback = usePaymentCallback();

  const handleAPSCallback = async () => {
    const data = callback.extractCallbackData();

    // APS specific validation
    if (!data.paymentId) {
      throw new Error("APS payment ID is required");
    }

    await callback.handlePaymentSuccess({
      ...data,
      gateway: "aps",
    });
  };

  return {
    ...callback,
    handleAPSCallback,
  };
}

// HyperPay specific callback handler
export function useHyperPayCallback() {
  const callback = usePaymentCallback();

  const handleHyperPayCallback = async () => {
    const data = callback.extractCallbackData();

    // HyperPay specific validation
    if (!data.paymentId) {
      throw new Error("HyperPay payment ID is required");
    }

    await callback.handlePaymentSuccess({
      ...data,
      gateway: "hyperpay",
    });
  };

  return {
    ...callback,
    handleHyperPayCallback,
  };
}
