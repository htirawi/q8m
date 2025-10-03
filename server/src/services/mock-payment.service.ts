/**
 * Mock Payment Service for Testing
 *
 * This service provides mock implementations of all payment gateways
 * for testing and development purposes.
 */

import { Plan } from "@shared/types/pricing";
import { User } from "../models/User.js";
import { Purchase } from "../models/Purchase.js";
import { Subscription } from "../models/Subscription.js";
import { entitlementService } from "./entitlement.service.js";

interface MockPaymentRequest {
  planType: Plan;
  currency: "USD" | "JOD" | "SAR";
  amount: number;
  billingCycle: "monthly" | "yearly";
  userId: string;
  returnUrl: string;
  cancelUrl: string;
  customerEmail: string;
  customerName: string;
}

interface MockPaymentResponse {
  success: boolean;
  checkoutUrl?: string;
  paymentId: string;
  purchaseId: string;
  error?: string;
}

interface MockWebhookData {
  id: string;
  event: string;
  data: any;
}

export class MockPaymentService {
  private static instance: MockPaymentService;
  private mockPayments = new Map<string, any>();
  private isEnabled = false;

  private constructor() {
    this.isEnabled = process.env.NODE_ENV === "test" || process.env.MOCK_PAYMENTS === "true";
  }

  public static getInstance(): MockPaymentService {
    if (!MockPaymentService.instance) {
      MockPaymentService.instance = new MockPaymentService();
    }
    return MockPaymentService.instance;
  }

  public isServiceConfigured(): boolean {
    return this.isEnabled;
  }

  public getConfigurationStatus(): { isConfigured: boolean; environment: string } {
    return {
      isConfigured: this.isEnabled,
      environment: "mock",
    };
  }

  /**
   * Create a mock payment
   */
  public async createPayment(request: MockPaymentRequest): Promise<MockPaymentResponse> {
    if (!this.isEnabled) {
      throw new Error("Mock payment service not enabled");
    }

    const paymentId = `mock-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const orderId = `MOCK-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    // Create purchase record
    const purchase = new Purchase({
      userId: request.userId,
      planType: request.planType,
      gateway: "mock",
      amount: request.amount,
      currency: request.currency,
      billingCycle: request.billingCycle,
      gatewayPaymentId: orderId,
      metadata: {
        originalCurrency: request.currency,
        originalAmount: request.amount.toString(),
        mockPayment: true,
        testMode: true,
      },
    });
    await purchase.save();

    // Store mock payment data
    this.mockPayments.set(paymentId, {
      id: paymentId,
      purchaseId: purchase._id.toString(),
      status: "pending",
      amount: request.amount,
      currency: request.currency,
      planType: request.planType,
      billingCycle: request.billingCycle,
      userId: request.userId,
      customerEmail: request.customerEmail,
      customerName: request.customerName,
      createdAt: new Date(),
    });

    // Generate mock checkout URL
    const checkoutUrl = `${request.returnUrl}?paymentId=${paymentId}&success=true`;

    return {
      success: true,
      checkoutUrl,
      paymentId,
      purchaseId: purchase._id.toString(),
    };
  }

  /**
   * Verify a mock payment
   */
  public async verifyPayment(paymentId: string): Promise<{
    success: boolean;
    status: string;
    purchaseId?: string;
    error?: string;
  }> {
    if (!this.isEnabled) {
      throw new Error("Mock payment service not enabled");
    }

    const mockPayment = this.mockPayments.get(paymentId);
    if (!mockPayment) {
      return {
        success: false,
        status: "not_found",
        error: "Mock payment not found",
      };
    }

    // Simulate payment verification delay
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Auto-complete mock payments after 2 seconds
    const timeSinceCreation = Date.now() - mockPayment.createdAt.getTime();
    if (timeSinceCreation > 2000 && mockPayment.status === "pending") {
      mockPayment.status = "completed";
      await this.processMockPaymentCompletion(mockPayment);
    }

    return {
      success: true,
      status: mockPayment.status,
      purchaseId: mockPayment.purchaseId,
    };
  }

  /**
   * Handle mock webhook
   */
  public async handleWebhook(
    webhookData: MockWebhookData
  ): Promise<{ success: boolean; error?: string }> {
    if (!this.isEnabled) {
      console.warn("Mock webhook handler not enabled.");
      return { success: false, error: "Service not enabled" };
    }

    try {
      const { id, event } = webhookData;
      const mockPayment = this.mockPayments.get(id);

      if (!mockPayment) {
        return { success: false, error: "Mock payment not found" };
      }

      switch (event) {
        case "payment.completed":
          mockPayment.status = "completed";
          await this.processMockPaymentCompletion(mockPayment);
          break;

        case "payment.failed":
          mockPayment.status = "failed";
          await this.processMockPaymentFailure(mockPayment);
          break;

        case "payment.refunded":
          await this.processMockRefund(mockPayment);
          break;

        default:
          console.log(`Unhandled mock webhook event: ${event}`);
          break;
      }

      return { success: true };
    } catch (error) {
      console.error("Mock webhook processing error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Process refund
   * @param paymentId - Payment ID to refund
   * @param _amount - Amount to refund (unused in mock implementation)
   */
  public async processRefund(
    paymentId: string,
    _amount: number, // eslint-disable-line @typescript-eslint/no-unused-vars
  ): Promise<{ success: boolean; refundId?: string; error?: string }> {
    if (!this.isEnabled) {
      throw new Error("Mock payment service not enabled");
    }

    const mockPayment = this.mockPayments.get(paymentId);
    if (!mockPayment) {
      return {
        success: false,
        error: "Mock payment not found",
      };
    }

    const refundId = `mock-refund-${Date.now()}`;

    return {
      success: true,
      refundId,
    };
  }

  /**
   * Process mock payment completion
   */
  private async processMockPaymentCompletion(mockPayment: any): Promise<void> {
    const purchase = await Purchase.findById(mockPayment.purchaseId);
    if (!purchase || purchase.status === "completed") {
      return;
    }

    await purchase.markAsCompleted({
      mockPayment: true,
      completedAt: new Date(),
    });

    await this.createMockSubscription(purchase);
  }

  /**
   * Process mock payment failure
   */
  private async processMockPaymentFailure(mockPayment: any): Promise<void> {
    const purchase = await Purchase.findById(mockPayment.purchaseId);
    if (!purchase || purchase.status !== "pending") {
      return;
    }

    await purchase.markAsFailed("Mock payment failed");
  }

  /**
   * Process mock refund
   */
  private async processMockRefund(mockPayment: any): Promise<void> {
    const purchase = await Purchase.findById(mockPayment.purchaseId);
    if (!purchase) {
      return;
    }

    await purchase.processRefund({
      refundId: `mock-refund-${Date.now()}`,
      amount: mockPayment.amount,
      reason: "mock_refund",
      processedAt: new Date(),
    });

    // Cancel associated subscription
    const subscription = await Subscription.findOne({ purchaseId: purchase._id });
    if (subscription && subscription.status === "active") {
      await subscription.cancel("refunded");
      await entitlementService.revokeUserEntitlements(subscription.userId.toString(), "refunded");
    }
  }

  /**
   * Create mock subscription
   */
  private async createMockSubscription(purchase: any): Promise<void> {
    const user = await User.findById(purchase.userId);
    if (!user) {
      console.error(`User ${purchase.userId} not found for mock subscription creation.`);
      return;
    }

    // Check for existing active subscription and cancel it
    const existingSubscription = await Subscription.findActiveForUser(user._id.toString());
    if (existingSubscription) {
      await existingSubscription.cancel("new_subscription_purchased");
      await entitlementService.revokeUserEntitlements(
        user._id.toString(),
        "new_subscription_purchased"
      );
    }

    const subscription = new Subscription({
      userId: purchase.userId,
      purchaseId: purchase._id,
      planType: purchase.planType,
      status: "active",
      billingCycle: purchase.billingCycle,
      currentPeriodStart: new Date(),
      currentPeriodEnd:
        purchase.billingCycle === "monthly"
          ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
          : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 365 days
      metadata: {
        gateway: "mock",
        mockSubscription: true,
        testMode: true,
      },
    });
    await subscription.save();

    // Update user entitlements
    await entitlementService.updateUserEntitlements(user._id.toString(), purchase.planType);
  }

  /**
   * Get payment status
   */
  public async getPaymentStatus(
    paymentId: string
  ): Promise<{ status: string; details: any } | null> {
    if (!this.isEnabled) {
      throw new Error("Mock payment service not enabled");
    }

    const mockPayment = this.mockPayments.get(paymentId);
    return mockPayment ? { status: mockPayment.status, details: mockPayment } : null;
  }

  /**
   * Simulate payment failure
   */
  public simulatePaymentFailure(paymentId: string): void {
    if (!this.isEnabled) {
      throw new Error("Mock payment service not enabled");
    }

    const mockPayment = this.mockPayments.get(paymentId);
    if (mockPayment) {
      mockPayment.status = "failed";
      this.processMockPaymentFailure(mockPayment);
    }
  }

  /**
   * Simulate payment completion
   */
  public simulatePaymentCompletion(paymentId: string): void {
    if (!this.isEnabled) {
      throw new Error("Mock payment service not enabled");
    }

    const mockPayment = this.mockPayments.get(paymentId);
    if (mockPayment && mockPayment.status === "pending") {
      mockPayment.status = "completed";
      this.processMockPaymentCompletion(mockPayment);
    }
  }

  /**
   * Clear all mock payments (for testing)
   */
  public clearMockPayments(): void {
    this.mockPayments.clear();
  }

  /**
   * Get all mock payments (for testing)
   */
  public getAllMockPayments(): any[] {
    return Array.from(this.mockPayments.values());
  }

  /**
   * Enable/disable mock service
   */
  public setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
  }
}

// Export singleton instance
export const mockPaymentService = MockPaymentService.getInstance();
