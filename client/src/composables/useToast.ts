import { ref, readonly } from "vue";
import { useI18n } from "vue-i18n";
import type { Toast, ToastOptions } from "@/types/composables/toast";

export function useToast() {
  const { t } = useI18n();
  const toasts = ref<Toast[]>([]);

  const addToast = (
    type: Toast["type"],
    title: string,
    message: string = "",
    options: ToastOptions = {}
  ): string => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const duration = options.duration ?? (type === "error" ? 8000 : 5000);

    const toast: Toast = {
      id,
      type,
      title,
      message,
      duration: options.persistent ? undefined : duration,
      persistent: options.persistent ?? false,
      action: options.action,
      createdAt: new Date(),
    };

    toasts.value.push(toast);

    // Auto-remove toast after duration
    if (!options.persistent && duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }

    return id;
  };

  const removeToast = (id: string) => {
    const index = toasts.value.findIndex((toast) => toast.id === id);
    if (index > -1) {
      toasts.value.splice(index, 1);
    }
  };

  const clearAllToasts = () => {
    toasts.value = [];
  };

  // Convenience methods
  const success = (title: string, message?: string, options?: ToastOptions) =>
    addToast("success", title, message, options);

  const error = (title: string, message?: string, options?: ToastOptions) =>
    addToast("error", title, message, options);

  const warning = (title: string, message?: string, options?: ToastOptions) =>
    addToast("warning", title, message, options);

  const info = (title: string, message?: string, options?: ToastOptions) =>
    addToast("info", title, message, options);

  // Predefined common toasts
  const paymentSuccess = (amount: string, currency: string) =>
    success(
      t("toasts.payment.success.title"),
      t("toasts.payment.success.message", { amount, currency })
    );

  const paymentError = (errorMessage: string) =>
    error(t("toasts.payment.error.title"), errorMessage || t("toasts.payment.error.generic"));

  const subscriptionUpdated = (plan: string) =>
    success(
      t("toasts.subscription.updated.title"),
      t("toasts.subscription.updated.message", { plan })
    );

  const subscriptionCancelled = () =>
    warning(t("toasts.subscription.cancelled.title"), t("toasts.subscription.cancelled.message"));

  const authSuccess = (action: string) =>
    success(t("toasts.auth.success.title"), t("toasts.auth.success.message", { action }));

  const authError = (errorMessage: string) =>
    error(t("toasts.auth.error.title"), errorMessage || t("toasts.auth.error.generic"));

  const networkError = () =>
    error(t("toasts.network.error.title"), t("toasts.network.error.message"));

  const currencyUpdated = (currency: string) =>
    info(t("toasts.currency.updated.title"), t("toasts.currency.updated.message", { currency }));

  const entitlementUpgraded = (level: string) =>
    success(
      t("toasts.entitlement.upgraded.title"),
      t("toasts.entitlement.upgraded.message", { level })
    );

  return {
    toasts: readonly(toasts),
    addToast,
    removeToast,
    clearAllToasts,
    success,
    error,
    warning,
    info,
    paymentSuccess,
    paymentError,
    subscriptionUpdated,
    subscriptionCancelled,
    authSuccess,
    authError,
    networkError,
    currencyUpdated,
    entitlementUpgraded,
  };
}
