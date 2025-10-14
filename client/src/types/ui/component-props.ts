/**
 * Component Props Types
 *
 * Centralized props interfaces for all UI components
 */

import type { PlanPricing, Purchase, Subscription } from "@/types/domain/payment";
import type { BillingCycle } from "@/types/domain/billing";
import type { Plan } from "@/types/domain/pricing";

/**
 * Props interfaces - alphabetically organized
 */

export interface BillingFormProps {
  modelValue: BillingFormData;
  errors: FormErrors;
  disabled?: boolean;
}

export interface BillingFormData {
  name: string;
  email: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface BillingHistorySectionProps {
  purchases: Purchase[];
}

export interface BillingToggleProps {
  modelValue: BillingCycle;
}

export interface BillingToggleEmits {
  (e: "update:modelValue", value: BillingCycle): void;
}

export interface ButtonProps {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  loading?: boolean;
  to?: string | Record<string, string | number>;
  href?: string;
  type?: "button" | "submit" | "reset";
  ariaLabel?: string;
  ariaDescribedby?: string;
  ariaPressed?: boolean | "true" | "false";
  ariaExpanded?: boolean | "true" | "false";
  ariaControls?: string;
}

export interface CancelSubscriptionModalProps {
  show: boolean;
  reasons: Record<string, string>;
  isLoading?: boolean;
}

export interface CardProps {
  variant?: "default" | "elevated" | "outlined";
  padding?: "none" | "sm" | "md" | "lg";
  ariaLabelledby?: string;
  ariaDescribedby?: string;
}

export interface CheckoutFormProps {
  selectedPlan: PlanPricing;
}

export interface CheckoutSummaryProps {
  selectedPlan: PlanPricing;
  billingCycle: BillingCycle;
  priceInfo?: PricingInfo;
  isProcessing: boolean;
  isFormValid: boolean;
}

export interface ContentAccessGuardProps {
  requiredEntitlement?: string;
  requiredContentLevel?: string;
  category?: string;
  showPreview?: boolean;
  showPlanComparison?: boolean;
  customTitle?: string;
  customDescription?: string;
}

export interface CurrentPlanCardProps {
  subscription: Subscription;
  entitlements: string[];
  features: string[];
}

export interface EmailStepProps {
  email: string;
  isLoading: boolean;
}

export interface ErrorBoundaryProps {
  fallback?: boolean;
  showDetails?: boolean;
  onRetry?: () => void;
}

export interface FinalCtaEmits {
  (e: "cta-click"): void;
}

export interface FormErrors {
  email?: string;
  password?: string;
  name?: string;
  confirmPassword?: string;
  address?: string;
  city?: string;
  country?: string;
  postalCode?: string;
  phone?: string;
  paymentMethod?: string;
  terms?: string;
  acceptTerms?: string;
  [key: string]: string | undefined;
}

export interface FormFieldProps {
  id?: string;
  label?: string;
  helperText?: string;
  error?: string;
  required?: boolean;
}

export interface HelperTextProps {
  id?: string;
  text?: string;
  error?: string;
  ariaLive?: "polite" | "assertive" | "off";
}

export interface InputProps {
  id?: string;
  type?: "text" | "email" | "password" | "number" | "tel" | "url" | "search";
  modelValue?: string | number;
  placeholder?: string;
  disabled?: boolean;
  readonly?: boolean;
  required?: boolean;
  error?: string;
  ariaLabel?: string;
  ariaDescribedby?: string;
}

export interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  color?: "primary" | "white" | "gray";
}

export interface LoadingStateProps {
  type?: "page" | "section" | "inline" | "overlay";
  size?: "sm" | "md" | "lg" | "xl";
  color?: "primary" | "secondary" | "white" | "gray";
  text?: string;
  description?: string;
  showText?: boolean;
  showProgress?: boolean;
  progress?: number;
  progressText?: string;
  centered?: boolean;
  fullHeight?: boolean;
}

export interface LoginFormData {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface ModalProps {
  isOpen: boolean;
  title?: string;
  description?: string;
  size?: "sm" | "md" | "lg" | "xl" | "full";
  closable?: boolean;
  closeOnOverlay?: boolean;
  closeOnEscape?: boolean;
}

export interface OAuthButtonsProps {
  isLoading: boolean;
}

export interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  lazy?: boolean;
  quality?: number;
  format?: "webp" | "jpeg" | "png" | "auto";
  sizes?: string;
  class?: string;
  decoding?: "async" | "auto" | "sync";
}

export interface OrderSummaryProps {
  selectedPlan: PlanPricing;
  billingCycle: BillingCycle;
  priceInfo?: PricingInfo;
}

export interface PricingInfo {
  currency: string;
  amount: number;
  formatted: string;
  exchangeRate?: number;
  isEstimated: boolean;
}

export interface PasswordStrengthIndicatorProps {
  password: string;
}

export interface PaymentMethodSelectorProps {
  modelValue: string;
  currency: string;
  disabled?: boolean;
}

export interface PaymentMethod {
  id: string;
  name: string;
  description: string;
  icon: string;
  available: boolean;
}

export interface PlanCardProps {
  plan: Plan;
  billing: BillingCycle;
}

export interface PlanCardEmits {
  (e: "select-plan", plan: Plan): void;
}

export interface ProfileStepProps {
  name: string;
  password: string;
  acceptTerms: boolean;
  nameError?: string;
  passwordError?: string;
  termsError?: string;
  isLoading: boolean;
}

export interface ProtectedDownloadProps {
  category: string;
  filename: string;
  fileSize?: string;
  fileFormat?: string;
  buttonText?: string;
  expiresIn?: number;
}

export interface RegisterFormData {
  email: string;
  password: string;
  name: string;
  acceptTerms: boolean;
}

export interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

export interface SelectGroup {
  label: string;
  options: SelectOption[];
}

export interface SelectProps {
  id?: string;
  modelValue?: string | number;
  options: SelectOption[];
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  error?: string;
  ariaLabel?: string;
  ariaDescribedby?: string;
}

export interface SubscriptionActionsProps {
  canUpgrade: boolean;
  isActive: boolean;
}

export interface ToastComponentProps {
  toast: ToastData;
}

export interface ToastData {
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
}

export interface VirtualScrollProps<T = Record<string, string | number | boolean>> {
  items: T[];
  itemHeight: number;
  containerHeight: number;
  overscan?: number;
  getItemKey?: (item: T, index: number) => string | number;
}

/**
 * Auth Component Interfaces
 */

export interface LoginFormEmits {
  (e: "oauth-login", provider: "google"): void;
  (e: "show-forgot-password"): void;
  (e: "login-success"): void;
}

export interface AuthenticationFormData {
  email: string;
  name: string;
  password: string;
  acceptTerms: boolean;
}

export interface AuthenticationFormEmits {
  (e: "oauth-login", provider: "google"): void;
  (e: "show-forgot-password"): void;
  (e: "login-success"): void;
  (e: "registration-success", email: string): void;
}

export interface PasswordRequirements {
  minLength: boolean;
  hasUppercase: boolean;
  hasLowercase: boolean;
  hasNumber: boolean;
}

export interface PasswordStrength {
  score: number;
  level: string;
  text: string;
}
