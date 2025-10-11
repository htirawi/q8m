/**
 * Payment Gateway Types
 *
 * Type definitions for payment gateway responses and data structures
 */

export interface GatewayResponseBase {
  id: string;
  status: string;
  create_time?: string;
  update_time?: string;
}

export interface GatewayAmount {
  currency: string;
  value: string;
  total?: string;
  details?: Record<string, string | number>;
}

export interface GatewayPayer {
  email?: string;
  name?: string;
  payer_id?: string;
  [key: string]: string | undefined;
}

export interface PayPalGatewayResponse extends GatewayResponseBase {
  intent?: string;
  payer?: GatewayPayer;
  purchase_units?: Array<{
    amount: GatewayAmount;
    payee?: GatewayPayer;
    description?: string;
  }>;
  links?: Array<{
    href: string;
    rel: string;
    method: string;
  }>;
}

export interface HyperPayGatewayResponse extends GatewayResponseBase {
  result?: {
    code: string;
    description: string;
  };
  paymentBrand?: string;
  paymentType?: string;
  amount?: string;
  currency?: string;
}

export interface APSGatewayResponse extends GatewayResponseBase {
  response_code?: string;
  response_message?: string;
  merchant_reference?: string;
  authorization_code?: string;
}

export type PaymentGatewayResponse =
  | PayPalGatewayResponse
  | HyperPayGatewayResponse
  | APSGatewayResponse
  | GatewayResponseBase;

export interface PaymentStatusDetails {
  status: string;
  transactionId?: string;
  amount?: string | number;
  currency?: string;
  paymentBrand?: string;
  responseCode?: string;
  responseMessage?: string;
  [key: string]: string | number | undefined;
}
