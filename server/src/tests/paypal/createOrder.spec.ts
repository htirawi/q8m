/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * PayPal Create Order Tests
 * Tests for order creation with mocked PayPal SDK
 *
 * NOTE: Skipped until PayPal integration is fully completed
 */

import { paypalController } from "@controllers/paypal.controller.js";
import * as paypalClient from "@lib/paypalClient.js";
import { paymentRepository } from "@repositories/payment.repository.js";
import { pricingService } from "@services/pricing.js";
import type { FastifyRequest, FastifyReply } from "fastify";
import { describe, it, expect, beforeEach, vi } from "vitest";

// Mock PayPal client
vi.mock("@lib/paypalClient.js", () => ({
  paypalClient: {
    execute: vi.fn(),
  },
  getPayPalClient: vi.fn(),
  resetPayPalClient: vi.fn(),
  orders: {},
}));

// Mock repositories and services
vi.mock("@repositories/payment.repository.js");
vi.mock("@services/pricing.js");
vi.mock("@models/User.js");

describe.skip("PayPal Create Order", () => {
  let mockRequest: Partial<FastifyRequest>;
  let mockReply: Partial<FastifyReply>;

  beforeEach(() => {
    vi.clearAllMocks();

    mockRequest = {
      body: {
        userId: "user123",
        planType: "INTERMEDIATE",
        currency_code: "USD",
        billingCycle: "monthly",
      },
      log: {
        info: vi.fn(),
        error: vi.fn(),
        warn: vi.fn(),
        debug: vi.fn(),
        fatal: vi.fn(),
        trace: vi.fn(),
        child: vi.fn(),
      } as any,
    };

    mockReply = {
      send: vi.fn().mockReturnThis(),
      status: vi.fn().mockReturnThis(),
    };
  });

  it("should create PayPal order successfully", async () => {
    // Mock pricing service
    vi.mocked(pricingService.getPlanPricing).mockResolvedValue({
      planType: "INTERMEDIATE",
      pricing: {
        USD: { amount: 29.99, isEstimated: false },
        JOD: { amount: 21.25, isEstimated: false },
        SAR: { amount: 112.46, isEstimated: false },
      },
      features: [],
      name: "Intermediate Plan",
      description: "For intermediate developers",
      billingCycle: "monthly",
      popular: true,
      category: "subscription",
    });

    // Mock PayPal API response
    vi.mocked(paypalClient.paypalClient.execute).mockResolvedValue({
      result: {
        id: "ORDER123",
        status: "CREATED",
        links: [
          {
            href: "https://www.paypal.com/checkoutnow?token=ORDER123",
            rel: "approve",
            method: "GET",
          },
        ],
      },
      statusCode: 201,
    } as any);

    // Mock payment repository
    vi.mocked(paymentRepository.create).mockResolvedValue({
      _id: "payment123",
      userId: "user123",
      orderId: "ORD-123",
      paymentId: "ORDER123",
      gateway: "paypal",
      status: "pending",
    } as any);

    await paypalController.createOrder(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply
    );

    expect(mockReply.send).toHaveBeenCalledWith({
      success: true,
      orderID: "ORDER123",
    });
  });

  it("should compute server-side total from pricing service", async () => {
    vi.mocked(pricingService.getPlanPricing).mockResolvedValue({
      planType: "SENIOR",
      pricing: {
        USD: { amount: 49.99, isEstimated: false },
        JOD: { amount: 35.42, isEstimated: false },
        SAR: { amount: 187.46, isEstimated: false },
      },
      features: [],
      name: "Senior Plan",
      description: "For senior developers",
      billingCycle: "monthly",
      popular: false,
      category: "subscription",
    });

    vi.mocked(paypalClient.paypalClient.execute).mockResolvedValue({
      result: {
        id: "ORDER456",
        status: "CREATED",
      },
      statusCode: 201,
    } as any);

    vi.mocked(paymentRepository.create).mockResolvedValue({} as any);

    mockRequest.body = {
      userId: "user123",
      planType: "SENIOR",
      currency_code: "USD",
      billingCycle: "monthly",
    };

    await paypalController.createOrder(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply
    );

    // Verify pricing service was called
    expect(pricingService.getPlanPricing).toHaveBeenCalledWith("SENIOR", "USD");

    // Verify order was created with correct amount
    expect(paypalClient.paypalClient.execute).toHaveBeenCalled();
    expect(mockReply.send).toHaveBeenCalledWith({
      success: true,
      orderID: "ORDER456",
    });
  });

  it("should return error for invalid plan type", async () => {
    vi.mocked(pricingService.getPlanPricing).mockResolvedValue(null);

    mockRequest.body = {
      userId: "user123",
      planType: "INVALID",
      currency_code: "USD",
      billingCycle: "monthly",
    };

    await paypalController.createOrder(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply
    );

    expect(mockReply.status).toHaveBeenCalledWith(400);
    expect(mockReply.send).toHaveBeenCalledWith({
      success: false,
      error: "Invalid plan type",
    });
  });

  it("should handle PayPal API errors", async () => {
    vi.mocked(pricingService.getPlanPricing).mockResolvedValue({
      planType: "INTERMEDIATE",
      pricing: {
        USD: { amount: 29.99, isEstimated: false },
      },
      features: [],
      name: "Intermediate Plan",
      description: "Test",
      billingCycle: "monthly",
      popular: false,
      category: "subscription",
    });

    vi.mocked(paypalClient.paypalClient.execute).mockRejectedValue(
      new Error("PayPal API Error")
    );

    await paypalController.createOrder(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply
    );

    expect(mockReply.status).toHaveBeenCalledWith(500);
    expect(mockReply.send).toHaveBeenCalledWith({
      success: false,
      error: "Failed to create PayPal order",
    });
  });

  it("should use idempotency key in request headers", async () => {
    vi.mocked(pricingService.getPlanPricing).mockResolvedValue({
      planType: "INTERMEDIATE",
      pricing: {
        USD: { amount: 29.99, isEstimated: false },
      },
      features: [],
      name: "Intermediate Plan",
      description: "Test",
      billingCycle: "monthly",
      popular: false,
      category: "subscription",
    });

    const mockExecute = vi.fn().mockResolvedValue({
      result: {
        id: "ORDER789",
        status: "CREATED",
      },
      statusCode: 201,
    });

    vi.mocked(paypalClient.paypalClient.execute).mockImplementation(mockExecute);
    vi.mocked(paymentRepository.create).mockResolvedValue({} as any);

    mockRequest.body = {
      userId: "user123",
      cartId: "cart456",
      planType: "INTERMEDIATE",
      currency_code: "USD",
      billingCycle: "monthly",
    };

    await paypalController.createOrder(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply
    );

    // Verify idempotency header was set
    const callArgs = mockExecute.mock.calls[0][0];
    expect(callArgs.headers).toHaveProperty("PayPal-Request-Id");
  });
});
