/**
 * E2E Tests: Conversion Modal
 * Tests the embedded checkout modal for plan upgrades
 */

import { test, expect } from '@playwright/test';

test.describe('Conversion Modal - Display', () => {
  test.beforeEach(async ({ page }) => {
    // Mock free user
    await page.addInitScript(() => {
      localStorage.setItem('auth_token', 'mock-free-user-token');
      localStorage.setItem('user', JSON.stringify({ id: '1', email: 'free@example.com', planTier: 'free' }));
    });
  });

  test('should display conversion modal when triggered', async ({ page }) => {
    // Navigate to pricing page or trigger modal via study gate
    await page.goto('/en/study');
    await page.getByRole('button', { name: /medium/i }).click();

    // Assuming soft paywall has a "View Plans" button that opens convert modal
    await page.getByRole('button', { name: /view plans|see pricing/i }).click();

    // Should show conversion modal
    await expect(page.locator('[data-testid="convert-modal"]')).toBeVisible();
  });

  test('should show correct plan information', async ({ page }) => {
    // Trigger modal (assuming via study gate -> medium)
    await page.goto('/en/study');
    await page.getByRole('button', { name: /medium/i }).click();
    await page.getByRole('button', { name: /view plans/i }).click();

    // Should show intermediate plan details
    await expect(page.locator('text=/intermediate/i')).toBeVisible();

    // Should show pricing
    await expect(page.locator('[data-testid="plan-price"]')).toBeVisible();
  });

  test('should display trust badges', async ({ page }) => {
    await page.goto('/en/pricing');

    // Assuming pricing page has a CTA that opens convert modal
    await page.getByRole('button', { name: /start free trial|upgrade/i }).first().click();

    // Should show trust badges
    await expect(page.locator('text=/cancel anytime/i')).toBeVisible();
    await expect(page.locator('text=/secure payment/i')).toBeVisible();
    await expect(page.locator('text=/money.*back.*guarantee/i')).toBeVisible();
  });
});

test.describe('Conversion Modal - Billing Cycle', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('auth_token', 'mock-free-user-token');
      localStorage.setItem('user', JSON.stringify({ id: '1', email: 'free@example.com', planTier: 'free' }));
    });

    await page.goto('/en/pricing');
    await page.getByRole('button', { name: /start free trial|upgrade/i }).first().click();
  });

  test('should toggle between monthly and annual billing', async ({ page }) => {
    // Should default to annual (usually the recommended option)
    await expect(page.getByRole('button', { name: /annual|yearly/i })).toHaveClass(/active|selected/);

    // Click monthly
    await page.getByRole('button', { name: /monthly/i }).click();

    // Should update price
    const monthlyPrice = await page.locator('[data-testid="plan-price"]').textContent();
    expect(monthlyPrice).toContain('/mo');

    // Click annual
    await page.getByRole('button', { name: /annual|yearly/i }).click();

    // Should show annual price
    const annualPrice = await page.locator('[data-testid="plan-price"]').textContent();
    expect(annualPrice).toContain('/yr');

    // Should show savings badge
    await expect(page.locator('text=/save.*20%/i')).toBeVisible();
  });

  test('should calculate correct price for billing cycle', async ({ page }) => {
    // Get monthly price
    await page.getByRole('button', { name: /monthly/i }).click();
    const monthlyText = await page.locator('[data-testid="plan-price"]').textContent();
    const monthlyPrice = parseInt(monthlyText?.replace(/[^0-9]/g, '') || '0');

    // Get annual price
    await page.getByRole('button', { name: /annual|yearly/i }).click();
    const annualText = await page.locator('[data-testid="plan-price"]').textContent();
    const annualPrice = parseInt(annualText?.replace(/[^0-9]/g, '') || '0');

    // Annual should be less than monthly * 12 (with discount)
    expect(annualPrice).toBeLessThan(monthlyPrice * 12);

    // Annual should be about 80% of monthly * 12 (20% discount)
    const expectedAnnual = monthlyPrice * 12 * 0.8;
    expect(Math.abs(annualPrice - expectedAnnual)).toBeLessThan(10); // Allow small rounding errors
  });

  test('should track billing cycle change', async ({ page }) => {
    const analyticsEvents: unknown[] = [];
    await page.exposeFunction('captureAnalytics', (event: unknown) => {
      analyticsEvents.push(event);
    });

    await page.addInitScript(() => {
      (window as Window & { gtag?: (...args: unknown[]) => void }).gtag = function (...args: unknown[]) {
        (window as Window & { captureAnalytics?: (event: unknown) => void }).captureAnalytics?.(args);
      };
    });

    // Toggle billing cycle
    await page.getByRole('button', { name: /monthly/i }).click();

    // Should track event
    const cycleChangeEvent = analyticsEvents.find((e: unknown) =>
      Array.isArray(e) && e[1] === 'convert_plan_changed'
    );
    expect(cycleChangeEvent).toBeDefined();
  });
});

test.describe('Conversion Modal - Coupon Code', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('auth_token', 'mock-free-user-token');
      localStorage.setItem('user', JSON.stringify({ id: '1', email: 'free@example.com', planTier: 'free' }));
    });

    await page.goto('/en/pricing');
    await page.getByRole('button', { name: /upgrade/i }).first().click();
  });

  test('should expand coupon input on toggle', async ({ page }) => {
    // Click "Have a coupon?"
    await page.getByRole('button', { name: /have.*coupon|coupon.*code/i }).click();

    // Should show coupon input
    await expect(page.locator('[data-testid="coupon-input"]')).toBeVisible();
    await expect(page.getByPlaceholder(/enter.*code/i)).toBeVisible();
  });

  test('should apply valid coupon code', async ({ page }) => {
    // Expand coupon section
    await page.getByRole('button', { name: /coupon/i }).click();

    // Enter code
    await page.getByPlaceholder(/enter.*code/i).fill('SAVE20');

    // Click apply
    await page.getByRole('button', { name: /apply/i }).click();

    // Should show success message
    await expect(page.locator('text=/coupon applied|discount applied/i')).toBeVisible();

    // Price should be updated (reduced)
    await expect(page.locator('[data-testid="discount-indicator"]')).toBeVisible();
  });

  test('should reject invalid coupon code', async ({ page }) => {
    // Expand coupon section
    await page.getByRole('button', { name: /coupon/i }).click();

    // Enter invalid code
    await page.getByPlaceholder(/enter.*code/i).fill('INVALID');

    // Click apply
    await page.getByRole('button', { name: /apply/i }).click();

    // Should show error message
    await expect(page.locator('text=/invalid.*coupon|coupon.*invalid/i')).toBeVisible();
  });

  test('should track coupon application', async ({ page }) => {
    const analyticsEvents: unknown[] = [];
    await page.exposeFunction('captureAnalytics', (event: unknown) => {
      analyticsEvents.push(event);
    });

    await page.addInitScript(() => {
      (window as Window & { gtag?: (...args: unknown[]) => void }).gtag = function (...args: unknown[]) {
        (window as Window & { captureAnalytics?: (event: unknown) => void }).captureAnalytics?.(args);
      };
    });

    // Apply coupon
    await page.getByRole('button', { name: /coupon/i }).click();
    await page.getByPlaceholder(/enter.*code/i).fill('SAVE20');
    await page.getByRole('button', { name: /apply/i }).click();

    // Should track event
    const couponEvent = analyticsEvents.find((e: unknown) =>
      Array.isArray(e) && e[1] === 'convert_coupon_applied'
    );
    expect(couponEvent).toBeDefined();
  });
});

test.describe('Conversion Modal - Checkout Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('auth_token', 'mock-free-user-token');
      localStorage.setItem('user', JSON.stringify({ id: '1', email: 'free@example.com', planTier: 'free' }));
    });

    await page.goto('/en/pricing');
    await page.getByRole('button', { name: /upgrade/i }).first().click();
  });

  test('should proceed to checkout on CTA click', async ({ page }) => {
    // Click main CTA
    await page.getByRole('button', { name: /subscribe|start.*trial/i }).click();

    // Should navigate to checkout page or show payment form
    await expect(
      page.locator('[data-testid="checkout-form"]').or(page.locator('text=/payment.*method/i'))
    ).toBeVisible();
  });

  test('should show PayPal option', async ({ page }) => {
    await page.getByRole('button', { name: /subscribe/i }).click();

    // Should see PayPal button or option
    await expect(
      page.locator('[data-testid="paypal-button"]').or(page.locator('text=/paypal/i'))
    ).toBeVisible();
  });

  test('should disable checkout button while processing', async ({ page }) => {
    const checkoutBtn = page.getByRole('button', { name: /subscribe/i });

    // Click checkout
    await checkoutBtn.click();

    // Button should show loading state
    await expect(checkoutBtn).toBeDisabled();
    await expect(checkoutBtn).toContainText(/processing|loading/i);
  });

  test('should track checkout initiation', async ({ page }) => {
    const analyticsEvents: unknown[] = [];
    await page.exposeFunction('captureAnalytics', (event: unknown) => {
      analyticsEvents.push(event);
    });

    await page.addInitScript(() => {
      (window as Window & { gtag?: (...args: unknown[]) => void }).gtag = function (...args: unknown[]) {
        (window as Window & { captureAnalytics?: (event: unknown) => void }).captureAnalytics?.(args);
      };
    });

    // Click checkout
    await page.getByRole('button', { name: /subscribe/i }).click();

    // Should track event
    const checkoutEvent = analyticsEvents.find((e: unknown) =>
      Array.isArray(e) && e[1] === 'checkout_opened'
    );
    expect(checkoutEvent).toBeDefined();
  });
});

test.describe('Conversion Modal - Dismissal', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('auth_token', 'mock-free-user-token');
      localStorage.setItem('user', JSON.stringify({ id: '1', email: 'free@example.com', planTier: 'free' }));
    });

    await page.goto('/en/pricing');
    await page.getByRole('button', { name: /upgrade/i }).first().click();
  });

  test('should close modal on X button click', async ({ page }) => {
    // Click close button
    await page.getByRole('button', { name: /close/i }).click();

    // Modal should be hidden
    await expect(page.locator('[data-testid="convert-modal"]')).not.toBeVisible();
  });

  test('should close modal on backdrop click', async ({ page }) => {
    // Click backdrop (outside modal)
    await page.locator('[data-testid="modal-backdrop"]').click({ position: { x: 10, y: 10 } });

    // Modal should be hidden
    await expect(page.locator('[data-testid="convert-modal"]')).not.toBeVisible();
  });

  test('should close modal on "Maybe Later" click', async ({ page }) => {
    // Click "Maybe Later"
    await page.getByRole('button', { name: /maybe later/i }).click();

    // Modal should be hidden
    await expect(page.locator('[data-testid="convert-modal"]')).not.toBeVisible();
  });

  test('should track dismissal with source', async ({ page }) => {
    const analyticsEvents: unknown[] = [];
    await page.exposeFunction('captureAnalytics', (event: unknown) => {
      analyticsEvents.push(event);
    });

    await page.addInitScript(() => {
      (window as Window & { gtag?: (...args: unknown[]) => void }).gtag = function (...args: unknown[]) {
        (window as Window & { captureAnalytics?: (event: unknown) => void }).captureAnalytics?.(args);
      };
    });

    // Dismiss via "Maybe Later"
    await page.getByRole('button', { name: /maybe later/i }).click();

    // Should track dismissal with source
    const dismissEvent = analyticsEvents.find((e: unknown) =>
      Array.isArray(e) && e[1] === 'convert_dismissed'
    );
    expect(dismissEvent).toBeDefined();
  });
});

test.describe('Conversion Modal - Accessibility', () => {
  test('should be keyboard navigable', async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('auth_token', 'mock-free-user-token');
      localStorage.setItem('user', JSON.stringify({ id: '1', email: 'free@example.com', planTier: 'free' }));
    });

    await page.goto('/en/pricing');
    await page.getByRole('button', { name: /upgrade/i }).first().click();

    // Tab through elements
    await page.keyboard.press('Tab'); // Should focus first interactive element
    await page.keyboard.press('Tab'); // Next element
    await page.keyboard.press('Enter'); // Should interact with focused element

    // Escape should close modal
    await page.keyboard.press('Escape');
    await expect(page.locator('[data-testid="convert-modal"]')).not.toBeVisible();
  });

  test('should have proper ARIA attributes', async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('auth_token', 'mock-free-user-token');
      localStorage.setItem('user', JSON.stringify({ id: '1', email: 'free@example.com', planTier: 'free' }));
    });

    await page.goto('/en/pricing');
    await page.getByRole('button', { name: /upgrade/i }).first().click();

    const modal = page.locator('[data-testid="convert-modal"]');

    // Should have role=dialog
    await expect(modal).toHaveAttribute('role', 'dialog');

    // Should have aria-modal=true
    await expect(modal).toHaveAttribute('aria-modal', 'true');

    // Should have aria-labelledby
    await expect(modal).toHaveAttribute('aria-labelledby', /.+/);
  });

  test('should trap focus within modal', async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('auth_token', 'mock-free-user-token');
      localStorage.setItem('user', JSON.stringify({ id: '1', email: 'free@example.com', planTier: 'free' }));
    });

    await page.goto('/en/pricing');
    await page.getByRole('button', { name: /upgrade/i }).first().click();

    // Tab multiple times
    for (let i = 0; i < 20; i++) {
      await page.keyboard.press('Tab');
    }

    // Focus should still be within modal
    const focusedElement = await page.evaluateHandle(() => document.activeElement);
    const modalContainsFocus = await page.locator('[data-testid="convert-modal"]').evaluate(
      (modal, focused) => modal.contains(focused as Node),
      focusedElement
    );

    expect(modalContainsFocus).toBe(true);
  });
});

test.describe('Conversion Modal - Responsive Design', () => {
  test('should display correctly on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });

    await page.addInitScript(() => {
      localStorage.setItem('auth_token', 'mock-free-user-token');
      localStorage.setItem('user', JSON.stringify({ id: '1', email: 'free@example.com', planTier: 'free' }));
    });

    await page.goto('/en/pricing');
    await page.getByRole('button', { name: /upgrade/i }).first().click();

    // Modal should be visible and properly sized
    const modal = page.locator('[data-testid="convert-modal"]');
    await expect(modal).toBeVisible();

    // Should not overflow viewport
    const boundingBox = await modal.boundingBox();
    expect(boundingBox?.width).toBeLessThanOrEqual(375);
  });

  test('should display correctly on tablet', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });

    await page.addInitScript(() => {
      localStorage.setItem('auth_token', 'mock-free-user-token');
      localStorage.setItem('user', JSON.stringify({ id: '1', email: 'free@example.com', planTier: 'free' }));
    });

    await page.goto('/en/pricing');
    await page.getByRole('button', { name: /upgrade/i }).first().click();

    // Modal should be visible
    await expect(page.locator('[data-testid="convert-modal"]')).toBeVisible();
  });
});
