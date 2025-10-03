/**
 * DTO Types (Data Transfer Objects)
 * 
 * API request/response shapes and wire formats.
 * These types represent the exact structure of data sent over the network.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
/* TODO: Legacy patterns - Replace 'any' types with proper typing in next PR */

/**
 * Mock payment request DTO
 */
export interface MockPaymentRequestDto {
  planType: "INTERMEDIATE" | "SENIOR" | "BUNDLE";
  currency: "USD" | "JOD" | "SAR";
  amount: number;
  customerEmail: string;
  customerName: string;
  returnUrl: string;
  cancelUrl: string;
}

/**
 * Mock payment response DTO
 */
export interface MockPaymentResponseDto {
  success: boolean;
  checkoutUrl?: string;
  paymentId?: string;
  orderId?: string;
  error?: string;
}

/**
 * Mock webhook data DTO
 */
export interface MockWebhookDataDto {
  id: string;
  event: string;
  data: {
    paymentId: string;
    status: string;
    amount: number;
    currency: string;
  };
}

/**
 * HyperPay payment request DTO
 */
export interface HyperPayPaymentRequestDto {
  planType: "INTERMEDIATE" | "SENIOR" | "BUNDLE";
  currency: "USD" | "JOD" | "SAR";
  amount: number;
  customerEmail: string;
  customerName: string;
  returnUrl: string;
  cancelUrl: string;
  merchantId: string;
  apiKey: string;
}

/**
 * HyperPay payment response DTO
 */
export interface HyperPayPaymentResponseDto {
  success: boolean;
  checkoutUrl?: string;
  paymentId?: string;
  error?: string;
}

/**
 * HyperPay webhook data DTO
 */
export interface HyperPayWebhookDataDto {
  id: string;
  entity: {
    id: string;
    status: string;
    amount: number;
    currency: string;
  };
}

/**
 * APS payment request DTO
 */
export interface APSPaymentRequestDto {
  amount: number;
  currency: "USD" | "JOD" | "SAR";
  planType: "INTERMEDIATE" | "SENIOR" | "BUNDLE";
  customerEmail: string;
  customerName: string;
  returnUrl: string;
  cancelUrl: string;
  merchantId: string;
  apiKey: string;
  accessCode: string;
}

/**
 * APS payment response DTO
 */
export interface APSPaymentResponseDto {
  paymentId: string;
  checkoutUrl: string;
  success: boolean;
}

/**
 * APS webhook data DTO
 */
export interface APSWebhookDataDto {
  event: string;
  data: {
    id: string;
    status: string;
    amount: number;
    currency: string;
  };
}

/**
 * PayPal payment request DTO
 */
export interface PayPalPaymentRequestDto {
  amount: number;
  currency: "USD" | "JOD" | "SAR";
  planType: "INTERMEDIATE" | "SENIOR" | "BUNDLE";
  customerEmail: string;
  customerName: string;
  returnUrl: string;
  cancelUrl: string;
  clientId: string;
  clientSecret: string;
}

/**
 * PayPal payment response DTO
 */
export interface PayPalPaymentResponseDto {
  paymentId: string;
  approvalUrl: string;
  success: boolean;
}

/**
 * PayPal webhook data DTO
 */
export interface PayPalWebhookDataDto {
  event_type: string;
  resource: any;
  id: string;
  create_time: string;
}
