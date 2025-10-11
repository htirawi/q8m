import { computed } from "vue";
import { useRoute } from "vue-router";
import { useLocale } from "@/composables/useLocale";

/**
 * Valid plan tiers for checkout
 */
const VALID_PLANS = ["basic", "intermediate", "advanced"] as const;
type ValidPlan = (typeof VALID_PLANS)[number];

/**
 * Valid billing cycles
 */
const VALID_BILLING = ["monthly", "yearly"] as const;
type ValidBilling = (typeof VALID_BILLING)[number];

/**
 * Default values for query parameters
 */
const DEFAULT_PLAN: ValidPlan = "intermediate";
const DEFAULT_BILLING: ValidBilling = "monthly";
const DEFAULT_REDIRECT = "/checkout";

/**
 * SessionStorage keys for preserving parameters
 */
const STORAGE_KEYS = {
  PLAN: "checkout_plan",
  BILLING: "checkout_billing",
  REDIRECT: "checkout_redirect",
} as const;

/**
 * Sanitize and validate plan parameter
 */
function sanitizePlan(plan: string | undefined): ValidPlan {
  if (!plan) return DEFAULT_PLAN;
  
  const normalized = plan.toLowerCase().trim();
  return VALID_PLANS.includes(normalized as ValidPlan) 
    ? (normalized as ValidPlan) 
    : DEFAULT_PLAN;
}

/**
 * Sanitize and validate billing parameter
 */
function sanitizeBilling(billing: string | undefined): ValidBilling {
  if (!billing) return DEFAULT_BILLING;
  
  const normalized = billing.toLowerCase().trim();
  return VALID_BILLING.includes(normalized as ValidBilling) 
    ? (normalized as ValidBilling) 
    : DEFAULT_BILLING;
}

/**
 * Sanitize redirect parameter
 */
function sanitizeRedirect(redirect: string | undefined): string {
  if (!redirect) return DEFAULT_REDIRECT;
  
  // Ensure redirect starts with / and doesn't contain protocol or domain
  const cleaned = redirect.trim();
  if (!cleaned.startsWith("/") || cleaned.includes("://")) {
    return DEFAULT_REDIRECT;
  }
  
  return cleaned;
}

/**
 * Save parameters to sessionStorage
 */
function saveToSession(plan: ValidPlan, billing: ValidBilling, redirect: string): void {
  try {
    sessionStorage.setItem(STORAGE_KEYS.PLAN, plan);
    sessionStorage.setItem(STORAGE_KEYS.BILLING, billing);
    sessionStorage.setItem(STORAGE_KEYS.REDIRECT, redirect);
  } catch {
    // Silently fail if sessionStorage is not available
  }
}

/**
 * Load parameters from sessionStorage
 */
function loadFromSession(): {
  plan: ValidPlan;
  billing: ValidBilling;
  redirect: string;
} {
  try {
    const plan = sessionStorage.getItem(STORAGE_KEYS.PLAN);
    const billing = sessionStorage.getItem(STORAGE_KEYS.BILLING);
    const redirect = sessionStorage.getItem(STORAGE_KEYS.REDIRECT);
    
    return {
      plan: sanitizePlan(plan ?? undefined),
      billing: sanitizeBilling(billing ?? undefined),
      redirect: sanitizeRedirect(redirect ?? undefined),
    };
  } catch {
    return {
      plan: DEFAULT_PLAN,
      billing: DEFAULT_BILLING,
      redirect: DEFAULT_REDIRECT,
    };
  }
}

/**
 * Clear checkout parameters from sessionStorage
 */
function clearSession(): void {
  try {
    sessionStorage.removeItem(STORAGE_KEYS.PLAN);
    sessionStorage.removeItem(STORAGE_KEYS.BILLING);
    sessionStorage.removeItem(STORAGE_KEYS.REDIRECT);
  } catch {
    // Silently fail if sessionStorage is not available
  }
}

/**
 * Composable for handling checkout redirect with preserved query parameters
 * 
 * Reads plan, billing, and redirect from route query or sessionStorage,
 * sanitizes values, and provides a computed checkout URL with locale preservation.
 * 
 * @example
 * ```ts
 * const { checkoutUrl, plan, billing, clearParams } = useCheckoutRedirect();
 * 
 * // After successful login:
 * await router.replace(checkoutUrl.value);
 * clearParams();
 * ```
 */
export function useCheckoutRedirect() {
  const route = useRoute();
  const { currentLocale } = useLocale();

  /**
   * Sanitized plan from query or sessionStorage
   */
  const plan = computed<ValidPlan>(() => {
    const queryPlan = route.query.plan as string | undefined;
    if (queryPlan) {
      return sanitizePlan(queryPlan);
    }
    return loadFromSession().plan;
  });

  /**
   * Sanitized billing from query or sessionStorage
   */
  const billing = computed<ValidBilling>(() => {
    const queryBilling = route.query.billing as string | undefined;
    if (queryBilling) {
      return sanitizeBilling(queryBilling);
    }
    return loadFromSession().billing;
  });

  /**
   * Sanitized redirect from query or sessionStorage
   */
  const redirect = computed<string>(() => {
    const queryRedirect = route.query.redirect as string | undefined;
    if (queryRedirect) {
      return sanitizeRedirect(queryRedirect);
    }
    return loadFromSession().redirect;
  });

  /**
   * Full checkout URL with locale and query parameters
   */
  const checkoutUrl = computed<string>(() => {
    const locale = currentLocale.value;
    const path = redirect.value;
    
    // Build query string
    const params = new URLSearchParams();
    params.set("plan", plan.value);
    params.set("billing", billing.value);
    
    // Construct full URL with locale
    const base = path.startsWith(`/${locale}`) ? path : `/${locale}${path}`;
    return `${base}?${params.toString()}`;
  });

  /**
   * Save current parameters to sessionStorage
   */
  const saveParams = (): void => {
    saveToSession(plan.value, billing.value, redirect.value);
  };

  /**
   * Clear parameters from sessionStorage
   */
  const clearParams = (): void => {
    clearSession();
  };

  // Auto-save to session on mount if query params exist
  if (route.query.plan ?? route.query.billing ?? route.query.redirect) {
    saveParams();
  }

  return {
    plan,
    billing,
    redirect,
    checkoutUrl,
    saveParams,
    clearParams,
  };
}

