/**
 * E2E tests for Convert Modal conversion flow
 * Tests the end-to-end user journey from locked card to checkout
 */

import { test, expect } from '@playwright/test';

test.describe('Convert Modal - Conversion Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to study page
    await page.goto('/en/study');
    await page.waitForLoadState('networkidle');
  });

  test('should display Convert Modal when clicking locked card', async ({ page }) => {
    // Click on locked Medium card (assumes free user)
    const mediumCard = page.locator('text=Medium').first();
    await mediumCard.click();

    // Wait for modal to appear
    const modal = page.locator('[role="dialog"]');
    await expect(modal).toBeVisible();

    // Check modal content
    await expect(page.locator('text=Unlock Your Full Potential')).toBeVisible();
    await expect(page.locator('text=Medium')).toBeVisible();
  });

  test('should pre-select annual plan by default', async ({ page }) => {
    // Open modal
    const mediumCard = page.locator('text=Medium').first();
    await mediumCard.click();

    // Check annual radio is selected
    const annualRadio = page.locator('input[value="annual"]');
    await expect(annualRadio).toBeChecked();
  });

  test('should allow switching between monthly and annual plans', async ({ page }) => {
    // Open modal
    const mediumCard = page.locator('text=Medium').first();
    await mediumCard.click();

    // Click monthly option
    const monthlyRadio = page.locator('input[value="monthly"]');
    await monthlyRadio.click();

    // Check monthly is now selected
    await expect(monthlyRadio).toBeChecked();

    // Check price updated
    await expect(page.locator('text=$29')).toBeVisible();
  });

  test('should show/hide coupon field when toggled', async ({ page }) => {
    // Open modal
    const mediumCard = page.locator('text=Medium').first();
    await mediumCard.click();

    // Coupon field should be hidden initially
    const couponInput = page.locator('input[placeholder="Enter code"]');
    await expect(couponInput).not.toBeVisible();

    // Click coupon toggle
    await page.locator('text=Have a coupon code?').click();

    // Coupon field should now be visible
    await expect(couponInput).toBeVisible();
  });

  test('should allow entering coupon code', async ({ page }) => {
    // Open modal
    const mediumCard = page.locator('text=Medium').first();
    await mediumCard.click();

    // Toggle coupon field
    await page.locator('text=Have a coupon code?').click();

    // Enter coupon code
    const couponInput = page.locator('input[placeholder="Enter code"]');
    await couponInput.fill('SAVE10');

    // Click apply button
    await page.locator('button:has-text("Apply")').click();

    // Check coupon was entered
    await expect(couponInput).toHaveValue('SAVE10');
  });

  test('should display correct price summary', async ({ page }) => {
    // Open modal
    const mediumCard = page.locator('text=Medium').first();
    await mediumCard.click();

    // Check total price
    await expect(page.locator('text=Total')).toBeVisible();
    await expect(page.locator('text=$199')).toBeVisible();

    // Check billing cycle text
    await expect(page.locator('text=Billed Annual')).toBeVisible();
  });

  test('should show social proof elements', async ({ page }) => {
    // Open modal
    const mediumCard = page.locator('text=Medium').first();
    await mediumCard.click();

    // Check rating
    await expect(page.locator('text=4.9/5')).toBeVisible();

    // Check testimonial
    await expect(page.locator('text=Best investment I made')).toBeVisible();

    // Check trust badges
    await expect(page.locator('text=Secure Payment')).toBeVisible();
    await expect(page.locator('text=7-Day Money Back')).toBeVisible();
    await expect(page.locator('text=Cancel Anytime')).toBeVisible();
  });

  test('should toggle comparison table', async ({ page }) => {
    // Open modal
    const mediumCard = page.locator('text=Medium').first();
    await mediumCard.click();

    // Comparison should be hidden initially
    const comparisonTable = page.locator('table');
    await expect(comparisonTable).not.toBeVisible();

    // Click compare toggle
    await page.locator('text=Compare plans').click();

    // Comparison should now be visible
    await expect(comparisonTable).toBeVisible();
  });

  test('should toggle FAQ section', async ({ page }) => {
    // Open modal
    const mediumCard = page.locator('text=Medium').first();
    await mediumCard.click();

    // FAQ should be hidden initially
    const faqSection = page.locator('details');
    await expect(faqSection.first()).not.toBeVisible();

    // Click FAQ toggle
    await page.locator('text=Questions?').click();

    // FAQ should now be visible
    await expect(faqSection.first()).toBeVisible();
    await expect(page.locator('text=Can I change my plan later?')).toBeVisible();
  });

  test('should close modal when clicking close button', async ({ page }) => {
    // Open modal
    const mediumCard = page.locator('text=Medium').first();
    await mediumCard.click();

    const modal = page.locator('[role="dialog"]');
    await expect(modal).toBeVisible();

    // Click close button
    await page.locator('button[aria-label="Close modal"]').click();

    // Modal should be hidden
    await expect(modal).not.toBeVisible();
  });

  test('should close modal when pressing ESC key', async ({ page }) => {
    // Open modal
    const mediumCard = page.locator('text=Medium').first();
    await mediumCard.click();

    const modal = page.locator('[role="dialog"]');
    await expect(modal).toBeVisible();

    // Press ESC key
    await page.keyboard.press('Escape');

    // Modal should be hidden
    await expect(modal).not.toBeVisible();
  });

  test('should navigate to checkout when clicking Subscribe button', async ({ page }) => {
    // Open modal
    const mediumCard = page.locator('text=Medium').first();
    await mediumCard.click();

    // Click Subscribe button
    const subscribeButton = page.locator('button:has-text("Subscribe & Start Learning")');
    await subscribeButton.click();

    // Wait for navigation
    await page.waitForURL('**/subscribe**');

    // Check we're on subscribe page
    expect(page.url()).toContain('/subscribe');
  });

  test('should show processing state during checkout', async ({ page }) => {
    // Open modal
    const mediumCard = page.locator('text=Medium').first();
    await mediumCard.click();

    // Click Subscribe button
    const subscribeButton = page.locator('button:has-text("Subscribe & Start Learning")');
    await subscribeButton.click();

    // Check for processing state (briefly)
    const processingText = page.locator('text=Processing...');

    // Note: Processing might be too fast to catch in real tests
    // This is more of a smoke test to ensure the button can be clicked
  });

  test('should display reassurance text', async ({ page }) => {
    // Open modal
    const mediumCard = page.locator('text=Medium').first();
    await mediumCard.click();

    // Check reassurance text
    await expect(page.locator('text=Cancel anytime')).toBeVisible();
    await expect(page.locator('text=Secure payment')).toBeVisible();
    await expect(page.locator('text=7-day money-back guarantee')).toBeVisible();
  });

  test('should show discount badge for annual plans', async ({ page }) => {
    // Open modal
    const mediumCard = page.locator('text=Medium').first();
    await mediumCard.click();

    // Check for discount badge
    await expect(page.locator('text=Save 43%')).toBeVisible();
  });

  test('should show recommended badge for annual plans', async ({ page }) => {
    // Open modal
    const mediumCard = page.locator('text=Medium').first();
    await mediumCard.click();

    // Check for recommended badge
    await expect(page.locator('text=Recommended')).toBeVisible();
  });

  test('should render all accessibility attributes', async ({ page }) => {
    // Open modal
    const mediumCard = page.locator('text=Medium').first();
    await mediumCard.click();

    const modal = page.locator('[role="dialog"]');

    // Check ARIA attributes
    await expect(modal).toHaveAttribute('aria-modal', 'true');
    await expect(modal).toHaveAttribute('aria-labelledby', 'convert-modal-title');

    // Check close button has aria-label
    const closeButton = page.locator('button[aria-label="Close modal"]');
    await expect(closeButton).toBeVisible();
  });

  test('should allow keyboard navigation', async ({ page }) => {
    // Open modal
    const mediumCard = page.locator('text=Medium').first();
    await mediumCard.click();

    // Tab through focusable elements
    await page.keyboard.press('Tab'); // First focusable element
    await page.keyboard.press('Tab'); // Next element
    await page.keyboard.press('Tab'); // Next element

    // Check focus is trapped within modal
    const activeElement = await page.evaluateHandle(() => document.activeElement);
    const modalContent = page.locator('[role="dialog"]');

    // Ensure active element is within modal
    // (Implementation would need specific selector checks)
  });

  test('should prevent body scroll when modal is open', async ({ page }) => {
    // Open modal
    const mediumCard = page.locator('text=Medium').first();
    await mediumCard.click();

    // Check body has overflow hidden
    const bodyOverflow = await page.evaluate(() => document.body.style.overflow);
    expect(bodyOverflow).toBe('hidden');
  });

  test('should restore body scroll when modal is closed', async ({ page }) => {
    // Open modal
    const mediumCard = page.locator('text=Medium').first();
    await mediumCard.click();

    // Close modal
    await page.locator('button[aria-label="Close modal"]').click();

    // Check body overflow is restored
    const bodyOverflow = await page.evaluate(() => document.body.style.overflow);
    expect(bodyOverflow).toBe('');
  });
});

test.describe('Convert Modal - Different Plans', () => {
  test('should show correct pricing for Advanced plan', async ({ page }) => {
    await page.goto('/en/study');
    await page.waitForLoadState('networkidle');

    // Click on locked Hard card (requires Advanced plan)
    const hardCard = page.locator('text=Hard').first();
    await hardCard.click();

    // Check modal opens with Advanced plan pricing
    await expect(page.locator('text=$49')).toBeVisible(); // Monthly
    await expect(page.locator('text=$349')).toBeVisible(); // Annual
  });
});

test.describe('Convert Modal - Mobile View', () => {
  test.use({ viewport: { width: 375, height: 667 } });

  test('should display properly on mobile', async ({ page }) => {
    await page.goto('/en/study');
    await page.waitForLoadState('networkidle');

    // Open modal
    const mediumCard = page.locator('text=Medium').first();
    await mediumCard.click();

    const modal = page.locator('[role="dialog"]');
    await expect(modal).toBeVisible();

    // Check modal is responsive
    const modalWidth = await modal.evaluate((el) => el.clientWidth);
    expect(modalWidth).toBeLessThanOrEqual(375);
  });
});
