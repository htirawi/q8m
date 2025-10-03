import { test, expect } from "@playwright/test";

test.describe("Payment Flow", () => {
  test.beforeEach(async ({ page }) => {
    // Mock authentication
    await page.addInitScript(() => {
      localStorage.setItem("auth_token", "mock-auth-token");
      localStorage.setItem(
        "user",
        JSON.stringify({
          id: "user-123",
          email: "test@example.com",
          firstName: "Test",
          lastName: "User",
        })
      );
    });

    // Navigate to the app
    await page.goto("/");
  });

  test("should display pricing plans correctly", async ({ page }) => {
    // Navigate to pricing page
    await page.goto("/pricing");

    // Check that all plan types are displayed
    await expect(page.locator('text="Junior Plan"')).toBeVisible();
    await expect(page.locator('text="Intermediate Plan"')).toBeVisible();
    await expect(page.locator('text="Senior Plan"')).toBeVisible();
    await expect(page.locator('text="Bundle Plan"')).toBeVisible();

    // Check that prices are displayed
    await expect(page.locator('text="$0"')).toBeVisible();
    await expect(page.locator('text="$29.99"')).toBeVisible();
    await expect(page.locator('text="$49.99"')).toBeVisible();
    await expect(page.locator('text="$69.99"')).toBeVisible();
  });

  test("should allow currency selection", async ({ page }) => {
    // Navigate to pricing page
    await page.goto("/pricing");

    // Check currency selector
    await expect(page.locator('select[name="currency"]')).toBeVisible();

    // Change currency to EUR
    await page.selectOption('select[name="currency"]', "EUR");

    // Check that prices are updated
    await expect(page.locator('text="€27.99"')).toBeVisible();
    await expect(page.locator('text="€46.99"')).toBeVisible();
  });

  test("should proceed to checkout when selecting a plan", async ({ page }) => {
    // Navigate to pricing page
    await page.goto("/pricing");

    // Select Intermediate plan
    await page.click('button:has-text("Choose Intermediate")');

    // Check that user is redirected to checkout
    await expect(page).toHaveURL(/.*checkout/);

    // Check that plan details are displayed
    await expect(page.locator('text="Intermediate Plan"')).toBeVisible();
    await expect(page.locator('text="$29.99"')).toBeVisible();
  });

  test("should display checkout form with billing information", async ({ page }) => {
    // Navigate to checkout
    await page.goto("/checkout?plan=INTERMEDIATE");

    // Check that billing form is displayed
    await expect(page.locator('input[name="street"]')).toBeVisible();
    await expect(page.locator('input[name="city"]')).toBeVisible();
    await expect(page.locator('input[name="state"]')).toBeVisible();
    await expect(page.locator('input[name="postalCode"]')).toBeVisible();
    await expect(page.locator('select[name="country"]')).toBeVisible();

    // Check that payment method selection is displayed
    await expect(page.locator('input[name="paymentMethod"][value="paypal"]')).toBeVisible();
    await expect(page.locator('input[name="paymentMethod"][value="aps"]')).toBeVisible();
    await expect(page.locator('input[name="paymentMethod"][value="hyperpay"]')).toBeVisible();
  });

  test("should validate billing information", async ({ page }) => {
    // Navigate to checkout
    await page.goto("/checkout?plan=INTERMEDIATE");

    // Try to submit without filling billing information
    await page.click('button[type="submit"]');

    // Check for validation errors
    await expect(page.locator('text="Street address is required"')).toBeVisible();
    await expect(page.locator('text="City is required"')).toBeVisible();
    await expect(page.locator('text="State is required"')).toBeVisible();
    await expect(page.locator('text="Postal code is required"')).toBeVisible();
    await expect(page.locator('text="Country is required"')).toBeVisible();
  });

  test("should process PayPal payment", async ({ page }) => {
    // Mock PayPal payment creation
    await page.route("**/api/payments/create", (route) => {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          paymentGateway: "paypal",
          checkoutUrl: "https://paypal.com/checkout/mock-123",
          orderId: "order-123",
        }),
      });
    });

    // Navigate to checkout
    await page.goto("/checkout?plan=INTERMEDIATE");

    // Fill billing information
    await page.fill('input[name="street"]', "123 Main St");
    await page.fill('input[name="city"]', "New York");
    await page.fill('input[name="state"]', "NY");
    await page.fill('input[name="postalCode"]', "10001");
    await page.selectOption('select[name="country"]', "US");

    // Select PayPal payment method
    await page.check('input[name="paymentMethod"][value="paypal"]');

    // Submit form
    await page.click('button[type="submit"]');

    // Check for loading state
    await expect(page.locator('text="Processing payment..."')).toBeVisible();

    // Check that user is redirected to PayPal
    await expect(page).toHaveURL(/.*paypal\.com/);
  });

  test("should process APS payment", async ({ page }) => {
    // Mock APS payment creation
    await page.route("**/api/payments/create", (route) => {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          paymentGateway: "aps",
          checkoutUrl: "https://aps.com/checkout/mock-456",
          orderId: "order-456",
        }),
      });
    });

    // Navigate to checkout
    await page.goto("/checkout?plan=INTERMEDIATE");

    // Fill billing information
    await page.fill('input[name="street"]', "456 Oak Ave");
    await page.fill('input[name="city"]', "Amman");
    await page.fill('input[name="state"]', "Amman");
    await page.fill('input[name="postalCode"]', "11183");
    await page.selectOption('select[name="country"]', "JO");

    // Select APS payment method
    await page.check('input[name="paymentMethod"][value="aps"]');

    // Submit form
    await page.click('button[type="submit"]');

    // Check for loading state
    await expect(page.locator('text="Processing payment..."')).toBeVisible();

    // Check that user is redirected to APS
    await expect(page).toHaveURL(/.*aps\.com/);
  });

  test("should process HyperPay payment", async ({ page }) => {
    // Mock HyperPay payment creation
    await page.route("**/api/payments/create", (route) => {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          paymentGateway: "hyperpay",
          checkoutUrl: "https://hyperpay.com/checkout/mock-789",
          orderId: "order-789",
        }),
      });
    });

    // Navigate to checkout
    await page.goto("/checkout?plan=SENIOR");

    // Fill billing information
    await page.fill('input[name="street"]', "789 Pine St");
    await page.fill('input[name="city"]', "Riyadh");
    await page.fill('input[name="state"]', "Riyadh");
    await page.fill('input[name="postalCode"]', "11564");
    await page.selectOption('select[name="country"]', "SA");

    // Select HyperPay payment method
    await page.check('input[name="paymentMethod"][value="hyperpay"]');

    // Submit form
    await page.click('button[type="submit"]');

    // Check for loading state
    await expect(page.locator('text="Processing payment..."')).toBeVisible();

    // Check that user is redirected to HyperPay
    await expect(page).toHaveURL(/.*hyperpay\.com/);
  });

  test("should handle payment creation errors", async ({ page }) => {
    // Mock payment creation error
    await page.route("**/api/payments/create", (route) => {
      route.fulfill({
        status: 400,
        contentType: "application/json",
        body: JSON.stringify({
          error: "Payment creation failed",
        }),
      });
    });

    // Navigate to checkout
    await page.goto("/checkout?plan=INTERMEDIATE");

    // Fill billing information
    await page.fill('input[name="street"]', "123 Main St");
    await page.fill('input[name="city"]', "New York");
    await page.fill('input[name="state"]', "NY");
    await page.fill('input[name="postalCode"]', "10001");
    await page.selectOption('select[name="country"]', "US");

    // Select PayPal payment method
    await page.check('input[name="paymentMethod"][value="paypal"]');

    // Submit form
    await page.click('button[type="submit"]');

    // Check for error message
    await expect(page.locator('text="Payment creation failed"')).toBeVisible();
  });

  test("should handle payment success callback", async ({ page }) => {
    // Navigate to payment success page
    await page.goto("/payment/success?orderId=order-123&paymentId=payment-456");

    // Check for success message
    await expect(page.locator('text="Payment Successful!"')).toBeVisible();

    // Check for order details
    await expect(page.locator('text="Order ID: order-123"')).toBeVisible();
    await expect(page.locator('text="Payment ID: payment-456"')).toBeVisible();

    // Check for continue button
    await expect(page.locator('button:has-text("Continue to Dashboard")')).toBeVisible();
  });

  test("should handle payment error callback", async ({ page }) => {
    // Navigate to payment error page
    await page.goto("/payment/error?orderId=order-123&error=Payment failed");

    // Check for error message
    await expect(page.locator('text="Payment Failed"')).toBeVisible();

    // Check for error details
    await expect(page.locator('text="Payment failed"')).toBeVisible();

    // Check for retry button
    await expect(page.locator('button:has-text("Try Again")')).toBeVisible();

    // Check for contact support button
    await expect(page.locator('button:has-text("Contact Support")')).toBeVisible();
  });

  test("should display subscription status", async ({ page }) => {
    // Mock subscription data
    await page.route("**/api/payments/subscription", (route) => {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          subscription: {
            id: "sub-123",
            planType: "INTERMEDIATE",
            status: "active",
            currentPeriodStart: "2024-01-01T00:00:00Z",
            currentPeriodEnd: "2024-02-01T00:00:00Z",
          },
        }),
      });
    });

    // Navigate to subscription page
    await page.goto("/subscription");

    // Check for subscription details
    await expect(page.locator('text="Intermediate Plan"')).toBeVisible();
    await expect(page.locator('text="Active"')).toBeVisible();
    await expect(page.locator('text="Next billing date"')).toBeVisible();
  });

  test("should display purchase history", async ({ page }) => {
    // Mock purchase history data
    await page.route("**/api/payments/history", (route) => {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          purchases: [
            {
              id: "purchase-1",
              planType: "INTERMEDIATE",
              amount: 29.99,
              currency: "USD",
              status: "completed",
              createdAt: "2024-01-01T00:00:00Z",
            },
            {
              id: "purchase-2",
              planType: "SENIOR",
              amount: 49.99,
              currency: "USD",
              status: "completed",
              createdAt: "2024-02-01T00:00:00Z",
            },
          ],
        }),
      });
    });

    // Navigate to subscription page
    await page.goto("/subscription");

    // Check for purchase history
    await expect(page.locator('text="Purchase History"')).toBeVisible();
    await expect(page.locator('text="Intermediate Plan"')).toBeVisible();
    await expect(page.locator('text="Senior Plan"')).toBeVisible();
    await expect(page.locator('text="$29.99"')).toBeVisible();
    await expect(page.locator('text="$49.99"')).toBeVisible();
  });

  test("should handle currency conversion", async ({ page }) => {
    // Mock currency conversion
    await page.route("**/api/currency/convert", (route) => {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          rates: {
            USD: 1.0,
            EUR: 0.85,
            JOD: 0.71,
            SAR: 3.75,
          },
        }),
      });
    });

    // Navigate to pricing page
    await page.goto("/pricing");

    // Change currency to EUR
    await page.selectOption('select[name="currency"]', "EUR");

    // Check that prices are converted
    await expect(page.locator('text="€25.49"')).toBeVisible(); // $29.99 * 0.85
    await expect(page.locator('text="€42.49"')).toBeVisible(); // $49.99 * 0.85
  });

  test("should handle payment gateway status", async ({ page }) => {
    // Mock payment gateway status
    await page.route("**/api/payments/gateway-status", (route) => {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          gateways: {
            paypal: { status: "active", available: true },
            aps: { status: "active", available: true },
            hyperpay: { status: "maintenance", available: false },
          },
        }),
      });
    });

    // Navigate to checkout
    await page.goto("/checkout?plan=INTERMEDIATE");

    // Check that HyperPay is disabled
    await expect(page.locator('input[name="paymentMethod"][value="hyperpay"]')).toBeDisabled();

    // Check for maintenance message
    await expect(page.locator('text="HyperPay is currently under maintenance"')).toBeVisible();
  });

  test("should handle network errors during payment", async ({ page }) => {
    // Mock network error
    await page.route("**/api/payments/create", (route) => {
      route.abort("failed");
    });

    // Navigate to checkout
    await page.goto("/checkout?plan=INTERMEDIATE");

    // Fill billing information
    await page.fill('input[name="street"]', "123 Main St");
    await page.fill('input[name="city"]', "New York");
    await page.fill('input[name="state"]', "NY");
    await page.fill('input[name="postalCode"]', "10001");
    await page.selectOption('select[name="country"]', "US");

    // Select PayPal payment method
    await page.check('input[name="paymentMethod"][value="paypal"]');

    // Submit form
    await page.click('button[type="submit"]');

    // Check for network error message
    await expect(page.locator('text="Network error. Please try again."')).toBeVisible();
  });

  test("should handle payment timeout", async ({ page }) => {
    // Mock payment timeout
    await page.route("**/api/payments/create", (route) => {
      route.fulfill({
        status: 408,
        contentType: "application/json",
        body: JSON.stringify({
          error: "Payment request timeout",
        }),
      });
    });

    // Navigate to checkout
    await page.goto("/checkout?plan=INTERMEDIATE");

    // Fill billing information
    await page.fill('input[name="street"]', "123 Main St");
    await page.fill('input[name="city"]', "New York");
    await page.fill('input[name="state"]', "NY");
    await page.fill('input[name="postalCode"]', "10001");
    await page.selectOption('select[name="country"]', "US");

    // Select PayPal payment method
    await page.check('input[name="paymentMethod"][value="paypal"]');

    // Submit form
    await page.click('button[type="submit"]');

    // Check for timeout error message
    await expect(page.locator('text="Payment request timeout"')).toBeVisible();
  });
});
