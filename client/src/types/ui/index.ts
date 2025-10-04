/**
 * UI Component Types
 *
 * Types for component props and UI-related interfaces.
 * These types define the contracts for reusable UI components.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
/* TODO: Legacy patterns - Replace 'any' types with proper typing in next PR */

/**
 * Virtual scroll component props
 */
export interface VirtualScrollProps {
  items: any[];
  itemHeight: number;
  containerHeight: number;
  overscan?: number;
}

/**
 * Optimized image component props
 */
export interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  loading?: "lazy" | "eager";
  placeholder?: string;
}

/**
 * Modal component props
 */
export interface ModalProps {
  modelValue: boolean;
  title?: string;
  size?: "sm" | "md" | "lg" | "xl";
  closable?: boolean;
  persistent?: boolean;
}

/**
 * Form field component props
 */
export interface FormFieldProps {
  label?: string;
  helpText?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
}

/**
 * Card component props
 */
export interface CardProps {
  title?: string;
  subtitle?: string;
  loading?: boolean;
  clickable?: boolean;
  hoverable?: boolean;
}

/**
 * Select option structure
 */
export interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

/**
 * Select group structure
 */
export interface SelectGroup {
  label: string;
  options: SelectOption[];
}

/**
 * Select component props
 */
export interface SelectProps {
  modelValue?: string | number;
  options?: SelectOption[];
  groups?: SelectGroup[];
  placeholder?: string;
  disabled?: boolean;
  clearable?: boolean;
  searchable?: boolean;
}

/**
 * Input component props
 */
export interface InputProps {
  modelValue?: string | number;
  type?: "text" | "email" | "password" | "number" | "tel" | "url" | "search";
  placeholder?: string;
  disabled?: boolean;
  readonly?: boolean;
  required?: boolean;
  min?: number;
  max?: number;
  step?: number;
  pattern?: string;
  autocomplete?: string;
}

/**
 * Button component props
 */
export interface ButtonProps {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger" | "success" | "warning";
  size?: "sm" | "md" | "lg" | "xl";
  disabled?: boolean;
  loading?: boolean;
  type?: "button" | "submit" | "reset";
  fullWidth?: boolean;
  icon?: string;
  iconPosition?: "left" | "right";
}

/**
 * Loading spinner component props
 */
export interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg" | "xl";
  color?: "primary" | "secondary" | "white" | "gray";
  text?: string;
}

/**
 * Toast component props
 */
export interface ToastProps {
  toast: {
    id: string;
    type: "success" | "error" | "warning" | "info";
    title: string;
    message: string;
    duration?: number;
    persistent?: boolean;
    action?: {
      label: string;
      handler: () => void;
    };
    createdAt: Date;
  };
}

/**
 * Loading state component props
 */
export interface LoadingStateProps {
  type?: "page" | "section" | "inline" | "overlay";
  size?: "sm" | "md" | "lg" | "xl";
  text?: string;
  showSpinner?: boolean;
}

/**
 * Error boundary component props
 */
export interface ErrorBoundaryProps {
  fallback?: boolean;
  showDetails?: boolean;
  onError?: (error: Error) => void;
}

/**
 * Checkout summary component props
 */
export interface CheckoutSummaryProps {
  selectedPlan: {
    planId: string;
    name: string;
    description: string;
    features: string[];
    usdPrice: number;
    pricing: Record<
      string,
      {
        currency: string;
        amount: number;
        formatted: string;
        exchangeRate?: number;
        isEstimated: boolean;
      }
    >;
    popular?: boolean;
    recommended?: boolean;
  };
  billingCycle: "monthly" | "yearly";
}

/**
 * Payment method selector component props
 */
export interface PaymentMethodSelectorProps {
  modelValue: string;
  currency: string;
  disabled?: boolean;
}

/**
 * Billing form component props
 */
export interface BillingFormProps {
  modelValue: {
    name: string;
    email: string;
    address: string;
    city: string;
    country: string;
    postalCode: string;
    phone?: string;
  };
  errors: Record<string, string>;
  disabled?: boolean;
}

/**
 * Order summary component props
 */
export interface OrderSummaryProps {
  selectedPlan: {
    planId: string;
    name: string;
    description: string;
    features: string[];
    usdPrice: number;
    pricing: Record<
      string,
      {
        currency: string;
        amount: number;
        formatted: string;
        exchangeRate?: number;
        isEstimated: boolean;
      }
    >;
    popular?: boolean;
    recommended?: boolean;
  };
  billingCycle: "monthly" | "yearly";
}

/**
 * Checkout form component props
 */
export interface CheckoutFormProps {
  selectedPlan: {
    planId: string;
    name: string;
    description: string;
    features: string[];
    usdPrice: number;
    pricing: Record<
      string,
      {
        currency: string;
        amount: number;
        formatted: string;
        exchangeRate?: number;
        isEstimated: boolean;
      }
    >;
    popular?: boolean;
    recommended?: boolean;
  };
}

/**
 * Content access guard component props
 */
export interface ContentAccessGuardProps {
  requiredEntitlement?: string;
  requiredContentLevel?: string;
  fallback?: boolean;
  showUpgradePrompt?: boolean;
}

/**
 * Protected download component props
 */
export interface ProtectedDownloadProps {
  category: string;
  filename: string;
  title?: string;
  description?: string;
}
