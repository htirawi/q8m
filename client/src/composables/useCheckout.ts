/**
 * Checkout Composable
 * Handles payment flow: plan selection, embedded checkout, 1-click confirm
 * Provider-agnostic with adapters for PayPal, Credit Card, etc.
 */

import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { useAnalytics } from "./useAnalytics";
import type { PlanTier } from "@shared/types/plan";

export type BillingCycle = "monthly" | "annual";
export type CheckoutStep = "plan_selection" | "checkout" | "processing" | "success" | "error";
export type PaymentProvider = "stripe" | "paypal" | "aps" | "hyperpay";

export interface IPlanOption {
  tier: PlanTier;
  cycle: BillingCycle;
  price: number;
  currency: string;
  discountPercent?: number;
  isRecommended?: boolean;
}

export interface ISavedPaymentMethod {
  id: string;
  provider: PaymentProvider;
  last4: string;
  type: "card" | "paypal";
  expiryMonth?: number;
  expiryYear?: number;
}

export interface ICheckoutSession {
  sessionId: string;
  planTier: PlanTier;
  cycle: BillingCycle;
  amount: number;
  currency: string;
  provider: PaymentProvider;
  embedUrl?: string; // For iframe checkout
}

export function useCheckout() {
  const router = useRouter();
  const authStore = useAuthStore();
  const { trackGenericEvent } = useAnalytics();

  const currentStep = ref<CheckoutStep>("plan_selection");
  const selectedPlan = ref<IPlanOption | null>(null);
  const selectedCycle = ref<BillingCycle>("annual");
  const couponCode = ref("");
  const checkoutSession = ref<ICheckoutSession | null>(null);
  const errorMessage = ref<string | null>(null);
  const isProcessing = ref(false);

  // Mock: In real app, fetch from API
  const savedPaymentMethods = ref<ISavedPaymentMethod[]>([]);
  const hasSavedPayment = computed(() => savedPaymentMethods.value.length > 0);

  /**
   * Available plan options
   * Maps to difficulty levels: free (Junior), intermediate (Intermediate), advanced (Senior), pro (Bundle)
   */
  const planOptions = computed((): IPlanOption[] => [
    {
      tier: "intermediate",
      cycle: "monthly",
      price: 10,
      currency: "USD",
    },
    {
      tier: "intermediate",
      cycle: "annual",
      price: 100,
      currency: "USD",
      discountPercent: 17,
      isRecommended: true,
    },
    {
      tier: "advanced",
      cycle: "monthly",
      price: 15,
      currency: "USD",
    },
    {
      tier: "advanced",
      cycle: "annual",
      price: 150,
      currency: "USD",
      discountPercent: 17,
      isRecommended: true,
    },
    {
      tier: "pro",
      cycle: "monthly",
      price: 20,
      currency: "USD",
    },
    {
      tier: "pro",
      cycle: "annual",
      price: 200,
      currency: "USD",
      discountPercent: 17,
      isRecommended: true,
    },
  ]);

  /**
   * Get plan option by tier and cycle
   */
  const getPlanOption = (tier: PlanTier, cycle: BillingCycle): IPlanOption | undefined => {
    return planOptions.value.find((p) => p.tier === tier && p.cycle === cycle);
  };

  /**
   * Select a plan
   */
  const selectPlan = (tier: PlanTier, cycle: BillingCycle = "annual") => {
    const plan = getPlanOption(tier, cycle);
    if (!plan) {
      console.error(`Plan not found: ${tier} ${cycle}`);
      return;
    }

    selectedPlan.value = plan;
    selectedCycle.value = cycle;

    trackGenericEvent("plan_changed", {
      tier,
      cycle,
      price: plan.price,
      hasSavedPayment: hasSavedPayment.value,
    });
  };

  /**
   * Apply coupon code
   */
  const applyCoupon = async (code: string): Promise<boolean> => {
    if (!code || !selectedPlan.value) {
      return false;
    }

    try {
      const response = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          code,
          tier: selectedPlan.value.tier,
          cycle: selectedPlan.value.cycle,
          amount: selectedPlan.value.price,
          currency: selectedPlan.value.currency,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success || !data.valid) {
        trackGenericEvent("coupon_failed", {
          code,
          error: data.error || "Invalid coupon",
        });
        return false;
      }

      // Update coupon code and track success
      couponCode.value = code;
      trackGenericEvent("coupon_applied", {
        code,
        discountAmount: data.coupon.discountAmount,
        finalAmount: data.coupon.finalAmount,
      });

      return true;
    } catch (error) {
      trackGenericEvent("coupon_failed", {
        code,
        error: error instanceof Error ? error.message : "Unknown error",
      });
      return false;
    }
  };

  /**
   * Start checkout flow
   */
  const startCheckout = async (source: string = "convert_modal"): Promise<void> => {
    if (!selectedPlan.value) {
      errorMessage.value = "Please select a plan";
      return;
    }

    isProcessing.value = true;
    currentStep.value = "processing";

    try {
      trackGenericEvent("subscribe_click", {
        tier: selectedPlan.value.tier,
        cycle: selectedPlan.value.cycle,
        price: selectedPlan.value.price,
        source,
        hasSavedPayment: hasSavedPayment.value,
      });

      // Call backend to create checkout session
      const response = await fetch("/api/checkout/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          tier: selectedPlan.value.tier,
          cycle: selectedPlan.value.cycle,
          couponCode: couponCode.value || undefined,
          currency: selectedPlan.value.currency,
          embedUrl: false, // Request embedded checkout URL if supported
          source,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to create checkout session");
      }

      // Store session data
      checkoutSession.value = {
        sessionId: data.session.sessionId,
        planTier: data.session.planTier,
        cycle: data.session.cycle,
        amount: data.session.amount,
        currency: data.session.currency,
        provider: "stripe", // TODO: Get from API response when provider logic is added
        embedUrl: data.session.embedUrl,
      };

      currentStep.value = "checkout";

      trackGenericEvent("checkout_view", {
        sessionId: checkoutSession.value.sessionId,
        provider: checkoutSession.value.provider,
      });

      // If no embedded checkout support, redirect to subscribe page
      if (!checkoutSession.value.embedUrl) {
        const locale = router.currentRoute.value.params.locale || "en";
        await router.push({
          path: `/${locale}/subscribe`,
          query: {
            plan: selectedPlan.value.tier,
            cycle: selectedPlan.value.cycle,
            ...(couponCode.value && { coupon: couponCode.value }),
          },
        });
      }
    } catch (error) {
      errorMessage.value = error instanceof Error ? error.message : "Failed to start checkout";
      currentStep.value = "error";

      trackGenericEvent("checkout_error", {
        error: errorMessage.value,
        step: "start",
      });
    } finally {
      isProcessing.value = false;
    }
  };

  /**
   * 1-click confirm for users with saved payment
   */
  const confirmOneClick = async (): Promise<void> => {
    if (!hasSavedPayment.value || !selectedPlan.value) {
      await startCheckout("one_click");
      return;
    }

    isProcessing.value = true;
    currentStep.value = "processing";

    try {
      trackGenericEvent("one_click_confirm", {
        tier: selectedPlan.value.tier,
        cycle: selectedPlan.value.cycle,
        price: selectedPlan.value.price,
      });

      // Get first saved payment method
      const paymentMethod = savedPaymentMethods.value[0];
      if (!paymentMethod) {
        throw new Error("No saved payment method found");
      }

      // Call API to process with saved payment
      const response = await fetch("/api/checkout/one-click", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          tier: selectedPlan.value.tier,
          cycle: selectedPlan.value.cycle,
          couponCode: couponCode.value || undefined,
          currency: selectedPlan.value.currency,
          paymentMethodId: paymentMethod.id,
          source: "one_click",
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Payment processing failed");
      }

      handleSuccess({
        subscriptionId: data.subscription.id,
        tier: selectedPlan.value!.tier,
        cycle: selectedPlan.value!.cycle,
      });
    } catch (error) {
      errorMessage.value = error instanceof Error ? error.message : "Payment failed";
      currentStep.value = "error";

      trackGenericEvent("one_click_failed", {
        error: errorMessage.value,
      });
    } finally {
      isProcessing.value = false;
    }
  };

  /**
   * Handle successful payment
   */
  const handleSuccess = (data: { subscriptionId: string; tier: PlanTier; cycle: BillingCycle }) => {
    currentStep.value = "success";

    trackGenericEvent("checkout_completed", {
      subscriptionId: data.subscriptionId,
      tier: data.tier,
      cycle: data.cycle,
    });

    // Refresh user data
    authStore.getCurrentUser();

    // Redirect to success page or close modal
    const locale = router.currentRoute.value.params.locale || "en";
    router.push(`/${locale}/subscribe/success?subscription=${data.subscriptionId}`);
  };

  /**
   * Handle payment failure
   */
  const handleFailure = (error: string) => {
    currentStep.value = "error";
    errorMessage.value = error;

    trackGenericEvent("checkout_failed", {
      error,
      step: currentStep.value,
    });
  };

  /**
   * Reset checkout state
   */
  const reset = () => {
    currentStep.value = "plan_selection";
    selectedPlan.value = null;
    couponCode.value = "";
    checkoutSession.value = null;
    errorMessage.value = null;
    isProcessing.value = false;
  };

  return {
    // State
    currentStep,
    selectedPlan,
    selectedCycle,
    couponCode,
    checkoutSession,
    errorMessage,
    isProcessing,
    hasSavedPayment,
    savedPaymentMethods,

    // Computed
    planOptions,

    // Methods
    getPlanOption,
    selectPlan,
    applyCoupon,
    startCheckout,
    confirmOneClick,
    handleSuccess,
    handleFailure,
    reset,
  };
}
