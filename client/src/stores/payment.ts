/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
/* TODO: Legacy patterns - Replace 'any' types with proper typing and remove unused vars in next PR */
import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { useErrorHandler } from "@/composables/useErrorHandler";
import type {
  PricingInfo,
  PlanPricing,
  Purchase,
  Subscription,
  PaymentRequest,
  PaymentResponse,
  CurrencyRates,
  UserEntitlements,
  EntitlementCheck,
  ContentAccess,
  SignedDownloadUrl,
  ContentCategory,
} from "@/types/domain/payment";

export const usePaymentStore = defineStore("payment", () => {
  // State
  const pricing = ref<PlanPricing[]>([]);
  const currentCurrency = ref<"USD" | "JOD" | "SAR">("USD");
  const purchases = ref<Purchase[]>([]);
  const purchaseHistory = ref<Purchase[]>([]);
  const subscription = ref<Subscription | null>(null);
  const isLoading = ref(false);
  const error = ref<string | null>(null);
  const currencyRates = ref<CurrencyRates | null>(null);
  const userEntitlements = ref<UserEntitlements | null>(null);
  const contentCategories = ref<ContentCategory[]>([]);

  // Error handling and notifications
  const errorHandler = useErrorHandler();

  // Getters
  const isSubscribed = computed(() => {
    return subscription.value?.isActive || false;
  });

  const hasEntitlement = computed(() => {
    return (entitlement: string) => {
      return subscription.value?.entitlements.includes(entitlement) || false;
    };
  });

  const currentPlan = computed(() => {
    if (!subscription.value) return "JUNIOR";
    return subscription.value.planType;
  });

  const subscriptionStatus = computed(() => {
    if (!subscription.value) return "inactive";
    return subscription.value.status;
  });

  const daysUntilExpiry = computed(() => {
    if (!subscription.value) return 0;
    return subscription.value.daysRemaining;
  });

  const isTrialUser = computed(() => {
    return subscription.value?.isInTrial || false;
  });

  const needsUpgrade = computed(() => {
    return (requiredPlan: string) => {
      const planHierarchy = ["JUNIOR", "INTERMEDIATE", "SENIOR", "BUNDLE"];
      const currentIndex = planHierarchy.indexOf(currentPlan.value);
      const requiredIndex = planHierarchy.indexOf(requiredPlan);
      return requiredIndex > currentIndex;
    };
  });

  const userLevel = computed(() => {
    if (!userEntitlements.value) return "JUNIOR";
    const hierarchy = ["BUNDLE", "SENIOR", "INTERMEDIATE", "JUNIOR"];
    for (const level of hierarchy) {
      if (userEntitlements.value.entitlements.includes(level)) {
        return level;
      }
    }
    return "JUNIOR";
  });

  const hasContentAccess = computed(() => {
    return (contentLevel: string) => {
      if (!userEntitlements.value?.isActive) return false;
      const hierarchy = {
        JUNIOR: ["JUNIOR"],
        INTERMEDIATE: ["JUNIOR", "INTERMEDIATE"],
        SENIOR: ["JUNIOR", "SENIOR"],
        BUNDLE: ["JUNIOR", "INTERMEDIATE", "SENIOR", "BUNDLE"],
      };
      const userLevelEntitlements = hierarchy[userLevel.value as keyof typeof hierarchy] || [];
      return userLevelEntitlements.includes(contentLevel);
    };
  });

  // Actions
  const setLoading = (loading: boolean) => {
    isLoading.value = loading;
  };

  const setError = (err: string | null) => {
    error.value = err;
  };

  const setCurrentCurrency = (currency: "USD" | "JOD" | "SAR") => {
    currentCurrency.value = currency;
    localStorage.setItem("preferred_currency", currency);
  };

  // Alias for setCurrentCurrency for backward compatibility
  const setCurrency = setCurrentCurrency;

  const clearError = () => {
    setError(null);
  };

  // Initialize currency from localStorage or detect from browser
  const initializeCurrency = async () => {
    const savedCurrency = localStorage.getItem("preferred_currency") as "USD" | "JOD" | "SAR";
    if (savedCurrency && ["USD", "JOD", "SAR"].includes(savedCurrency)) {
      currentCurrency.value = savedCurrency;
    } else {
      // Auto-detect currency based on location (simplified)
      await detectUserCurrency();
    }
  };

  // Detect user currency based on location
  const detectUserCurrency = async () => {
    try {
      // In a real implementation, you might use a geolocation API
      // For now, we'll default to USD
      currentCurrency.value = "USD";
    } catch (error) {
      console.warn("Failed to detect user currency:", error);
      currentCurrency.value = "USD";
    }
  };

  // Get pricing information
  const fetchPricing = async (currency?: "USD" | "JOD" | "SAR") => {
    try {
      setLoading(true);
      setError(null);

      const targetCurrency = currency || currentCurrency.value;
      const response = await fetch(`/api/payments/pricing/${targetCurrency}`);

      if (!response.ok) {
        throw new Error("Failed to fetch pricing information");
      }

      const data = await response.json();
      if (data.success) {
        pricing.value = data.pricing;
      } else {
        throw new Error(data.error || "Failed to fetch pricing");
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch pricing";
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Get all pricing for currency comparison
  const fetchAllPricing = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/payments/pricing");

      if (!response.ok) {
        throw new Error("Failed to fetch pricing information");
      }

      const data = await response.json();
      if (data.success) {
        pricing.value = data.pricing;
      } else {
        throw new Error(data.error || "Failed to fetch pricing");
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch pricing";
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Get currency exchange rates
  const fetchCurrencyRates = async () => {
    try {
      const response = await fetch("/api/payments/currencies/rates");

      if (!response.ok) {
        throw new Error("Failed to fetch currency rates");
      }

      const data = await response.json();
      if (data.success) {
        currencyRates.value = {
          USD: 1,
          JOD: 0.709, // This would come from the API
          SAR: 3.75, // This would come from the API
          lastUpdated: new Date().toISOString(),
        };
      }
    } catch (err) {
      console.warn("Failed to fetch currency rates:", err);
    }
  };

  // Create payment
  const createPayment = async (paymentRequest: PaymentRequest): Promise<PaymentResponse> => {
    try {
      setLoading(true);
      setError(null);
      errorHandler.clearError();

      const response = await fetch("/api/payments/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        },
        body: JSON.stringify(paymentRequest),
      });

      if (!response.ok) {
        const errorData = await response.json();
        const error = new Error(errorData.error || "Failed to create payment");
        error.name = errorData.code || "PAYMENT_FAILED";
        throw error;
      }

      const data = await response.json();
      if (data.success) {
        return data;
      } else {
        const error = new Error(data.error || "Failed to create payment");
        error.name = data.code || "PAYMENT_FAILED";
        throw error;
      }
    } catch (err) {
      const errorState = errorHandler.handlePaymentError(err);
      const errorMessage = errorState.message || "Failed to create payment";
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Get purchase history
  const fetchPurchaseHistory = async (limit: number = 10, skip: number = 0) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/payments/history?limit=${limit}&skip=${skip}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch purchase history");
      }

      const data = await response.json();
      if (data.success) {
        purchases.value = data.purchases;
        return data;
      } else {
        throw new Error(data.error || "Failed to fetch purchase history");
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch purchase history";
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Get current subscription
  const fetchSubscription = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/payments/subscription", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          subscription.value = null;
          return;
        }
        throw new Error("Failed to fetch subscription");
      }

      const data = await response.json();
      if (data.success) {
        subscription.value = data.subscription;
      } else {
        throw new Error(data.error || "Failed to fetch subscription");
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch subscription";
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Cancel subscription
  const cancelSubscription = async (reason: string = "user_request") => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/payments/subscription/cancel", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        },
        body: JSON.stringify({ reason }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to cancel subscription");
      }

      const data = await response.json();
      if (data.success) {
        subscription.value = data.subscription;
        return data;
      } else {
        throw new Error(data.error || "Failed to cancel subscription");
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to cancel subscription";
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Handle payment callback
  const handlePaymentCallback = async (gateway: string, paymentData: any) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/payments/callback/${gateway}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(paymentData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Payment callback failed");
      }

      const data = await response.json();
      if (data.success) {
        // Refresh subscription after successful payment
        await fetchSubscription();
        return data;
      } else {
        throw new Error(data.error || "Payment callback failed");
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Payment callback failed";
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Initialize payment store
  const initialize = async () => {
    await initializeCurrency();
    await fetchCurrencyRates();
    await fetchPricing();
    await fetchUserEntitlements();
    await fetchContentCategories();
  };

  // Get plan pricing for specific plan and currency
  const getPlanPricing = (planId: string, currency?: string) => {
    const targetCurrency = currency || currentCurrency.value;
    const plan = pricing.value.find((p) => p.planId === planId);
    return plan?.pricing[targetCurrency];
  };

  // Calculate yearly discount percentage
  const getYearlyDiscount = (monthlyPrice: number, yearlyPrice: number) => {
    const monthlyTotal = monthlyPrice * 12;
    return Math.round(((monthlyTotal - yearlyPrice) / monthlyTotal) * 100);
  };

  // Format currency amount
  const formatCurrency = (amount: number, currency: string) => {
    const formatters: Record<string, Intl.NumberFormat> = {
      USD: new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }),
      JOD: new Intl.NumberFormat("ar-JO", {
        style: "currency",
        currency: "JOD",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }),
      SAR: new Intl.NumberFormat("ar-SA", {
        style: "currency",
        currency: "SAR",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }),
    };

    return formatters[currency]?.format(amount) || `${amount} ${currency}`;
  };

  // Get user entitlements
  const fetchUserEntitlements = async () => {
    try {
      setLoading(true);
      setError(null);
      errorHandler.clearError();

      const response = await fetch("/api/entitlements/me/entitlements", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        const error = new Error(errorData.error || "Failed to fetch user entitlements");
        error.name = errorData.code || "NETWORK_ERROR";
        throw error;
      }

      const data = await response.json();
      if (data.success) {
        userEntitlements.value = data.entitlements;
        return data.entitlements;
      } else {
        const error = new Error(data.error || "Failed to fetch user entitlements");
        error.name = data.code || "NETWORK_ERROR";
        throw error;
      }
    } catch (err) {
      const errorState = errorHandler.handleNetworkError(err);
      const errorMessage = errorState.message || "Failed to fetch user entitlements";
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Check specific entitlement
  const checkEntitlement = async (requiredEntitlement: string): Promise<EntitlementCheck> => {
    try {
      const response = await fetch("/api/entitlements/check", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        },
        body: JSON.stringify({ requiredEntitlement }),
      });

      if (!response.ok) {
        throw new Error("Failed to check entitlement");
      }

      const data = await response.json();
      if (data.success) {
        return {
          hasAccess: data.hasAccess,
          reason: data.reason,
          upgradeRequired: data.upgradeRequired,
          subscriptionExpired: data.subscriptionExpired,
          trialExpired: data.trialExpired,
        };
      } else {
        throw new Error(data.error || "Failed to check entitlement");
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to check entitlement";
      setError(errorMessage);
      throw err;
    }
  };

  // Check content access
  const checkContentAccess = async (contentLevel: string): Promise<ContentAccess> => {
    try {
      const response = await fetch("/api/entitlements/check-content", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        },
        body: JSON.stringify({ contentLevel }),
      });

      if (!response.ok) {
        throw new Error("Failed to check content access");
      }

      const data = await response.json();
      if (data.success) {
        return {
          hasAccess: data.hasAccess,
          reason: data.reason,
          upgradeRequired: data.upgradeRequired,
        };
      } else {
        throw new Error(data.error || "Failed to check content access");
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to check content access";
      setError(errorMessage);
      throw err;
    }
  };

  // Generate signed download URL
  const generateDownloadUrl = async (
    category: string,
    filename: string,
    expiresIn: number = 3600
  ): Promise<SignedDownloadUrl> => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `/api/downloads/generate/${category}/${filename}?expiresIn=${expiresIn}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
          },
        }
      );

      if (!response.ok) {
        if (response.status === 403) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Access denied to this content");
        }
        throw new Error("Failed to generate download URL");
      }

      const data = await response.json();
      if (data.success) {
        return {
          downloadUrl: data.downloadUrl,
          expiresAt: data.expiresAt,
          filePath: data.filePath,
          category: data.category,
          requiredLevel: data.requiredLevel,
        };
      } else {
        throw new Error(data.error || "Failed to generate download URL");
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to generate download URL";
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Get available content categories
  const fetchContentCategories = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/downloads/categories", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch content categories");
      }

      const data = await response.json();
      if (data.success) {
        contentCategories.value = data.categories;
        return data.categories;
      } else {
        throw new Error(data.error || "Failed to fetch content categories");
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch content categories";
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Download file using signed URL
  const downloadFile = async (downloadUrl: string, filename: string) => {
    try {
      const response = await fetch(downloadUrl);
      if (!response.ok) {
        throw new Error("Failed to download file");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to download file";
      setError(errorMessage);
      throw err;
    }
  };

  return {
    // State
    pricing,
    currentCurrency,
    purchases,
    purchaseHistory,
    subscription,
    isLoading,
    error,
    currencyRates,
    userEntitlements,
    contentCategories,

    // Getters
    isSubscribed,
    hasEntitlement,
    currentPlan,
    subscriptionStatus,
    daysUntilExpiry,
    isTrialUser,
    needsUpgrade,
    userLevel,
    hasContentAccess,

    // Actions
    initialize,
    fetchPricing,
    fetchAllPricing,
    fetchCurrencyRates,
    createPayment,
    fetchPurchaseHistory,
    fetchSubscription,
    cancelSubscription,
    handlePaymentCallback,
    setCurrentCurrency,
    setCurrency,
    clearError,
    getPlanPricing,
    getYearlyDiscount,
    formatCurrency,
    fetchUserEntitlements,
    checkEntitlement,
    checkContentAccess,
    generateDownloadUrl,
    fetchContentCategories,
    downloadFile,
  };
});
