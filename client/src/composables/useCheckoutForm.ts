import { ref, reactive, computed, watch } from "vue";
import { useI18n } from "vue-i18n";
import { usePaymentStore } from "@/stores/payment";
import { useAuthStore } from "@/stores/auth";
import { useErrorHandler } from "@/composables/useErrorHandler";
import { useToast } from "@/composables/useToast";
import type { PlanPricing, PaymentRequest } from "@/types/domain/payment";
import type { BillingFormData } from "@/types/composables/checkout";

export function useCheckoutForm() {
  const { t } = useI18n();
  const paymentStore = usePaymentStore();
  const authStore = useAuthStore();
  const errorHandler = useErrorHandler();
  const toast = useToast();

  // Form state
  const billingForm = reactive<BillingFormData>({
    name: "",
    email: "",
    street: "",
    city: "",
    state: "",
    postalCode: "",
    country: "",
  });

  const selectedPaymentMethod = ref("paypal");
  const billingCycle = ref<"monthly" | "yearly">("monthly");
  const isProcessing = ref(false);
  const errors = reactive<Record<string, string>>({});

  // Form validation
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!billingForm.name.trim()) {
      newErrors.name = t("validation.nameRequired");
    }

    if (!billingForm.email.trim()) {
      newErrors.email = t("validation.emailRequired");
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(billingForm.email)) {
      newErrors.email = t("validation.emailInvalid");
    }

    if (!billingForm.street.trim()) {
      newErrors.street = t("validation.streetRequired");
    }

    if (!billingForm.city.trim()) {
      newErrors.city = t("validation.cityRequired");
    }

    if (!billingForm.state.trim()) {
      newErrors.state = t("validation.stateRequired");
    }

    if (!billingForm.postalCode.trim()) {
      newErrors.postalCode = t("validation.postalCodeRequired");
    }

    if (!billingForm.country) {
      newErrors.country = t("validation.countryRequired");
    }

    Object.assign(errors, newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isFormValid = computed(() => {
    return Boolean(
      billingForm.name.trim() &&
        billingForm.email.trim() &&
        billingForm.street.trim() &&
        billingForm.city.trim() &&
        billingForm.state.trim() &&
        billingForm.postalCode.trim() &&
        billingForm.country &&
        selectedPaymentMethod.value &&
        Object.keys(errors).length === 0
    );
  });

  // Pre-fill user data if available
  watch(
    () => authStore.user,
    (user) => {
      if (user) {
        billingForm.name = user.name || "";
        billingForm.email = user.email || "";
      }
    },
    { immediate: true }
  );

  // Payment processing
  const processPayment = async (selectedPlan: PlanPricing) => {
    if (!validateForm()) {
      toast.error(t("checkout.error.title"), t("checkout.validationError"));
      return;
    }

    isProcessing.value = true;
    Object.keys(errors).forEach((key) => delete errors[key]);

    try {
      const paymentRequest: PaymentRequest = {
        planType: selectedPlan.planId as "INTERMEDIATE" | "SENIOR" | "BUNDLE",
        currency: paymentStore.currentCurrency,
        billingCycle: billingCycle.value,
        billingAddress: {
          street: billingForm.street,
          city: billingForm.city,
          state: billingForm.state,
          postalCode: billingForm.postalCode,
          country: billingForm.country,
        },
      };

      const result = await paymentStore.createPayment(paymentRequest);

      if (result.success) {
        toast.success(t("checkout.success.title"), t("checkout.paymentCreated"));
        // Redirect to payment gateway
        window.location.href = result.checkoutUrl;
      } else {
        throw new Error(t("checkout.paymentFailed"));
      }
    } catch (err) {
      const error =
        err instanceof Error
          ? err
          : new Error(typeof err === "string" ? err : t("checkout.paymentFailed"));
      const errorMessage = error.message;
      errorHandler.handlePaymentError(error);
      toast.error(t("checkout.error.title"), errorMessage);
    } finally {
      isProcessing.value = false;
    }
  };

  const toggleBillingCycle = () => {
    billingCycle.value = billingCycle.value === "monthly" ? "yearly" : "monthly";
  };

  const clearErrors = () => {
    Object.keys(errors).forEach((key) => {
      delete errors[key];
    });
  };

  return {
    // State
    billingForm,
    selectedPaymentMethod,
    billingCycle,
    isProcessing,
    errors,

    // Computed
    isFormValid,

    // Methods
    validateForm,
    processPayment,
    toggleBillingCycle,
    clearErrors,
  };
}
