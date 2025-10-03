import { vi } from "vitest";
import { config } from "@vue/test-utils";

// Mock fetch globally
global.fetch = vi.fn();

// Mock localStorage
Object.defineProperty(window, "localStorage", {
  value: {
    getItem: vi.fn(() => "mock-token"),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
  },
  writable: true,
});

// Mock window.location
Object.defineProperty(window, "location", {
  value: {
    href: "http://localhost:3000",
    assign: vi.fn(),
    reload: vi.fn(),
    replace: vi.fn(),
  },
  writable: true,
});

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock matchMedia
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Global test configuration
config.global.mocks = {
  $t: (key: string) => key,
  $tc: (key: string) => key,
  $te: (key: string) => true,
  $d: (value: any) => value,
  $n: (value: any) => value,
};

// Mock composables
vi.mock("@/composables/useErrorHandler", () => ({
  useErrorHandler: () => ({
    errorState: { value: { message: null, code: null, details: null, timestamp: null } },
    hasError: { value: false },
    isRecentError: { value: false },
    clearError: vi.fn(),
    handleError: vi.fn((error) => ({
      message: error.message || "Mock error",
      code: "MOCK_ERROR",
      details: null,
      timestamp: Date.now(),
    })),
    handlePaymentError: vi.fn((error) => ({
      message: error.message || "Payment error",
      code: "PAYMENT_ERROR",
      details: null,
      timestamp: Date.now(),
    })),
    handleAuthError: vi.fn((error) => ({
      message: error.message || "Auth error",
      code: "AUTH_ERROR",
      details: null,
      timestamp: Date.now(),
    })),
    handleNetworkError: vi.fn((error) => ({
      message: error.message || "Network error",
      code: "NETWORK_ERROR",
      details: null,
      timestamp: Date.now(),
    })),
    handleValidationError: vi.fn((error) => ({
      message: error.message || "Validation error",
      code: "VALIDATION_ERROR",
      details: null,
      timestamp: Date.now(),
    })),
    translateError: vi.fn((code, message) => message || "Translated error"),
  }),
}));

vi.mock("@/composables/useToast", () => ({
  useToast: () => ({
    toasts: { value: [] },
    addToast: vi.fn(),
    removeToast: vi.fn(),
    clearAllToasts: vi.fn(),
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
    info: vi.fn(),
    paymentSuccess: vi.fn(),
    paymentError: vi.fn(),
    subscriptionUpdated: vi.fn(),
    subscriptionCancelled: vi.fn(),
    authSuccess: vi.fn(),
    authError: vi.fn(),
    networkError: vi.fn(),
    currencyUpdated: vi.fn(),
    entitlementUpgraded: vi.fn(),
  }),
}));

// Mock stores
vi.mock("@/stores/auth", () => ({
  useAuthStore: () => ({
    user: { value: { id: "1", email: "test@example.com", name: "Test User" } },
    isAuthenticated: { value: true },
    isLoading: { value: false },
    error: { value: null },
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
    initializeAuth: vi.fn(),
  }),
}));

vi.mock("@/stores/payment", () => ({
  usePaymentStore: () => ({
    pricing: { value: [] },
    currentCurrency: { value: "USD" },
    purchases: { value: [] },
    subscription: { value: null },
    isLoading: { value: false },
    error: { value: null },
    currencyRates: { value: null },
    userEntitlements: { value: null },
    contentCategories: { value: [] },
    isSubscribed: { value: false },
    userLevel: { value: "JUNIOR" },
    hasContentAccess: vi.fn(() => true),
    createPayment: vi.fn(),
    fetchPurchaseHistory: vi.fn(),
    fetchUserEntitlements: vi.fn(),
    checkEntitlement: vi.fn(),
    checkContentAccess: vi.fn(),
    generateDownloadUrl: vi.fn(),
    fetchContentCategories: vi.fn(),
    downloadFile: vi.fn(),
    setCurrency: vi.fn(),
    fetchCurrencyRates: vi.fn(),
    formatPrice: vi.fn((amount, currency) => `${amount} ${currency}`),
    initialize: vi.fn(),
  }),
}));

// Mock router
vi.mock("vue-router", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    go: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
  }),
  useRoute: () => ({
    params: {},
    query: {},
    path: "/",
    name: "home",
  }),
}));

// Mock i18n
vi.mock("vue-i18n", () => ({
  useI18n: () => ({
    t: (key: string) => key,
    tc: (key: string) => key,
    te: (key: string) => true,
    d: (value: any) => value,
    n: (value: any) => value,
    locale: { value: "en" },
    availableLocales: ["en", "ar"],
  }),
}));

// Mock Heroicons
vi.mock("@heroicons/vue/24/outline/CheckCircleIcon", () => ({
  default: { name: "CheckCircleIcon" },
}));

vi.mock("@heroicons/vue/24/outline/XCircleIcon", () => ({
  default: { name: "XCircleIcon" },
}));

vi.mock("@heroicons/vue/24/outline/ExclamationTriangleIcon", () => ({
  default: { name: "ExclamationTriangleIcon" },
}));

vi.mock("@heroicons/vue/24/outline/InformationCircleIcon", () => ({
  default: { name: "InformationCircleIcon" },
}));
