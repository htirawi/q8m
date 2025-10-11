/**
 * Payment Callback Composable Types
 */

export interface PaymentCallbackData {
  paymentId?: string;
  payerId?: string;
  token?: string;
  PayerID?: string;
  gateway?: string;
  success?: boolean;
  error?: string;
  orderId?: string;
  amount?: string;
  currency?: string;
  plan?: string;
}

export interface CallbackResultData {
  purchaseId?: string;
  gateway?: string;
  orderId?: string;
  amount?: string;
  currency?: string;
  plan?: string;
}

export interface PaymentCallbackPayload {
  paymentId: string;
  payerId?: string;
  token?: string;
  [key: string]: string | undefined;
}
