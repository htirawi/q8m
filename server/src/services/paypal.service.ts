/**
 * PayPal Service
 * Handles PayPal Orders v2 API operations
 */

import { env } from "@config/env.js";
import { paypalClient } from "@lib/paypalClient.js";
import { orders as paypalOrders } from "@paypal/checkout-server-sdk";

import type { PayPalGatewayResponse } from "../types/payment-gateway";

interface CreateOrderParams {
  userId: string;
  orderItems: Array<{
    name: string;
    unit_amount: { currency_code: string; value: string };
    quantity: string;
  }>;
  totalAmount: number;
  currency_code: string;
  requestId: string;
}

interface PayPalOrder {
  id: string;
  status: string;
}

export class PayPalService {
  /**
   * Create PayPal order
   */
  async createOrder(params: CreateOrderParams): Promise<PayPalOrder> {
    const orderRequest = new paypalOrders.OrdersCreateRequest();
    orderRequest.headers["PayPal-Request-Id"] = params.requestId;
    orderRequest.prefer("return=representation");

    orderRequest.requestBody({
      intent: "CAPTURE",
      purchase_units: [
        {
          amount: {
            currency_code: params.currency_code,
            value: params.totalAmount.toFixed(2),
            breakdown: {
              item_total: {
                currency_code: params.currency_code,
                value: params.totalAmount.toFixed(2),
              },
            },
          },
          items: params.orderItems,
          custom_id: params.userId,
        },
      ],
      application_context: {
        brand_name: "Q8M Quiz Platform",
        landing_page: "NO_PREFERENCE",
        shipping_preference: "NO_SHIPPING",
        user_action: "PAY_NOW",
        return_url: `${env.CLIENT_URL}/payment/success`,
        cancel_url: `${env.CLIENT_URL}/payment/cancel`,
      },
    });

    const response = await paypalClient.execute(orderRequest);
    return response.result as PayPalOrder;
  }

  /**
   * Capture PayPal order
   */
  async captureOrder(orderID: string): Promise<PayPalGatewayResponse> {
    const captureRequest = new paypalOrders.OrdersCaptureRequest(orderID);
    captureRequest.prefer("return=representation");

    const response = await paypalClient.execute(captureRequest);
    return response.result as PayPalGatewayResponse;
  }
}

export const paypalService = new PayPalService();
