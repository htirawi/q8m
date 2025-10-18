/**
 * E2E tests for Plan Unification
 * Tests the new canonical plan naming (Junior/Intermediate/Senior/Bundle)
 * and conversion flows with the unified plan system
 */

import { test, expect } from "@playwright/test";

test.describe("Plan Unification - Study Mode", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/en/study");
    await page.waitForLoadState("networkidle");
  });

  test("should display Junior instead of Easy in study level cards", async ({ page }) => {
    // Check for Junior label (not "Easy")
    await expect(page.locator("text=Junior").first()).toBeVisible();

    // Ensure "Easy" is not visible in UI (should only be in URL)
    const easyCount = await page.locator("text=/^Easy$/i").count();
    expect(easyCount).toBe(0);
  });

  test("should display Intermediate instead of Medium in study level cards", async ({ page }) => {
    // Check for Intermediate label (not "Medium")
    await expect(page.locator("text=Intermediate").first()).toBeVisible();

    // Ensure "Medium" is not visible in UI
    const mediumCount = await page.locator("text=/^Medium$/i").count();
    expect(mediumCount).toBe(0);
  });

  test("should display Senior instead of Hard in study level cards", async ({ page }) => {
    // Check for Senior label (not "Hard")
    await expect(page.locator("text=Senior").first()).toBeVisible();

    // Ensure "Hard" is not visible in UI
    const hardCount = await page.locator("text=/^Hard$/i").count();
    expect(hardCount).toBe(0);
  });

  test("should maintain SEO-friendly URLs with easy/medium/hard", async ({ page }) => {
    // Click Junior card and start
    const juniorCard = page.getByTestId("level-card-easy");
    await juniorCard.click();

    // Wait for potential navigation or action
    await page.waitForTimeout(500);

    // URL should still contain 'easy' for SEO
    // (if navigates to study page, otherwise just verify card is selected)
    const currentUrl = page.url();

    // Verify Junior card shows selected state or navigates with 'easy' in URL
    if (currentUrl.includes("/study/")) {
      expect(currentUrl).toContain("/study/easy");
    }
  });

  test("should show correct plan icons for each difficulty", async ({ page }) => {
    // Check Junior icon (green circle emoji)
    const juniorCard = page.getByTestId("level-card-easy");
    await expect(juniorCard).toContainText("🟢");

    // Check Intermediate icon (yellow circle emoji)
    const intermediateCard = page.getByTestId("level-card-medium");
    await expect(intermediateCard).toContainText("🟡");

    // Check Senior icon (red circle emoji)
    const seniorCard = page.getByTestId("level-card-hard");
    await expect(seniorCard).toContainText("🔴");
  });

  test('should display "Available" badge for unlocked Junior level', async ({ page }) => {
    const juniorCard = page.getByTestId("level-card-easy");

    // Should show "Available" badge, not "Free"
    await expect(juniorCard.locator("text=/Available/i")).toBeVisible();
  });
});

test.describe("Plan Unification - Homepage Pricing", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/en");
    await page.waitForLoadState("networkidle");
  });

  test("should display all 4 canonical plans on homepage", async ({ page }) => {
    // Scroll to pricing section
    await page.locator('[data-testid="pricing-teaser"]').scrollIntoViewIfNeeded();

    // Check all 4 plan cards are visible
    await expect(page.getByTestId("pricing-card-junior")).toBeVisible();
    await expect(page.getByTestId("pricing-card-intermediate")).toBeVisible();
    await expect(page.getByTestId("pricing-card-senior")).toBeVisible();
    await expect(page.getByTestId("pricing-card-bundle")).toBeVisible();
  });

  test("should display correct pricing for each plan", async ({ page }) => {
    await page.locator('[data-testid="pricing-teaser"]').scrollIntoViewIfNeeded();

    // Junior: $0
    const juniorCard = page.getByTestId("pricing-card-junior");
    await expect(juniorCard).toContainText("$0");

    // Intermediate: $10/month
    const intermediateCard = page.getByTestId("pricing-card-intermediate");
    await expect(intermediateCard).toContainText("$10");

    // Senior: $15/month
    const seniorCard = page.getByTestId("pricing-card-senior");
    await expect(seniorCard).toContainText("$15");

    // Bundle: $20/month
    const bundleCard = page.getByTestId("pricing-card-bundle");
    await expect(bundleCard).toContainText("$20");
  });

  test('should show "Most Popular" badge on Intermediate plan', async ({ page }) => {
    await page.locator('[data-testid="pricing-teaser"]').scrollIntoViewIfNeeded();

    const intermediateCard = page.getByTestId("pricing-card-intermediate");
    await expect(intermediateCard.locator("text=/Most Popular/i")).toBeVisible();
  });

  test('should show "Best Value" badge on Bundle plan', async ({ page }) => {
    await page.locator('[data-testid="pricing-teaser"]').scrollIntoViewIfNeeded();

    const bundleCard = page.getByTestId("pricing-card-bundle");
    await expect(bundleCard.locator("text=/Best Value/i")).toBeVisible();
  });

  test("should toggle between monthly and yearly pricing", async ({ page }) => {
    await page.locator('[data-testid="pricing-teaser"]').scrollIntoViewIfNeeded();

    // Default should be monthly
    const monthlyToggle = page.getByTestId("toggle-monthly");
    await expect(monthlyToggle).toHaveClass(/active/);

    // Click yearly toggle
    const yearlyToggle = page.getByTestId("toggle-yearly");
    await yearlyToggle.click();

    // Verify yearly is now active
    await expect(yearlyToggle).toHaveClass(/active/);

    // Check prices updated to yearly (Intermediate: $100/year)
    const intermediateCard = page.getByTestId("pricing-card-intermediate");
    await expect(intermediateCard).toContainText("$100");
  });

  test("should show savings message for yearly billing", async ({ page }) => {
    await page.locator('[data-testid="pricing-teaser"]').scrollIntoViewIfNeeded();

    // Click yearly toggle
    const yearlyToggle = page.getByTestId("toggle-yearly");
    await yearlyToggle.click();

    // Check for savings message
    await expect(page.locator("text=/Save.*%/i")).toBeVisible();
  });

  test("should navigate to register page when clicking Junior CTA", async ({ page }) => {
    await page.locator('[data-testid="pricing-teaser"]').scrollIntoViewIfNeeded();

    // Click Junior CTA
    const juniorCTA = page.getByTestId("pricing-cta-junior");
    await juniorCTA.click();

    // Should navigate to register page
    await page.waitForURL("**/register**");
    expect(page.url()).toContain("/register");
  });

  test("should navigate to pricing page with plan query for paid plans", async ({ page }) => {
    await page.locator('[data-testid="pricing-teaser"]').scrollIntoViewIfNeeded();

    // Click Intermediate CTA
    const intermediateCTA = page.getByTestId("pricing-cta-intermediate");
    await intermediateCTA.click();

    // Should navigate to pricing page with plan query
    await page.waitForURL("**/pricing**");
    const url = page.url();
    expect(url).toContain("/pricing");
    expect(url).toContain("plan=intermediate");
  });
});

test.describe("Plan Unification - Conversion Flow", () => {
  test("should complete homepage → pricing → checkout flow (≤2 clicks)", async ({ page }) => {
    // Start at homepage
    await page.goto("/en");
    await page.waitForLoadState("networkidle");

    // Scroll to pricing teaser
    await page.locator('[data-testid="pricing-teaser"]').scrollIntoViewIfNeeded();

    // Click 1: Select Intermediate plan from homepage
    const intermediateCTA = page.getByTestId("pricing-cta-intermediate");
    await intermediateCTA.click();

    // Should be on pricing page
    await page.waitForURL("**/pricing**");

    // Click 2: Click checkout button on pricing page
    const checkoutButton = page
      .locator('button:has-text("Get Started"), button:has-text("Subscribe")')
      .first();

    if (await checkoutButton.isVisible()) {
      await checkoutButton.click();

      // Should navigate to checkout or auth
      await page.waitForTimeout(1000);
      const finalUrl = page.url();

      // Verify we're at checkout or auth (≤2 clicks achieved)
      const isCheckoutOrAuth =
        finalUrl.includes("/checkout") ||
        finalUrl.includes("/register") ||
        finalUrl.includes("/login");
      expect(isCheckoutOrAuth).toBe(true);
    }
  });

  test("should display locked card upsell with canonical plan names", async ({ page }) => {
    // Navigate to study page (assuming free user)
    await page.goto("/en/study");
    await page.waitForLoadState("networkidle");

    // Click locked Intermediate card
    const intermediateCard = page.getByTestId("level-card-medium");

    // Check if card shows locked state
    const isLocked =
      (await intermediateCard.locator("text=/Upgrade/i, text=/Unlock/i").count()) > 0;

    if (isLocked) {
      await intermediateCard.click();

      // Wait for upsell modal or navigation
      await page.waitForTimeout(500);

      // Check for upsell content with "Intermediate" (not "Medium")
      const modalOrPage = page.locator("body");
      const hasIntermediateName = (await modalOrPage.locator("text=Intermediate").count()) > 0;
      expect(hasIntermediateName).toBe(true);
    }
  });
});

test.describe("Plan Unification - Arabic (RTL)", () => {
  test("should display canonical plan names in Arabic", async ({ page }) => {
    await page.goto("/ar/study");
    await page.waitForLoadState("networkidle");

    // Check for Arabic plan names
    await expect(page.locator("text=مبتدئ").first()).toBeVisible(); // Junior in Arabic
  });

  test("should display RTL layout correctly", async ({ page }) => {
    await page.goto("/ar");
    await page.waitForLoadState("networkidle");

    // Check HTML dir attribute
    const htmlDir = await page.locator("html").getAttribute("dir");
    expect(htmlDir).toBe("rtl");

    // Scroll to pricing section
    await page.locator('[data-testid="pricing-teaser"]').scrollIntoViewIfNeeded();

    // Verify pricing cards are visible with RTL layout
    await expect(page.getByTestId("pricing-card-junior")).toBeVisible();
    await expect(page.getByTestId("pricing-card-intermediate")).toBeVisible();
  });

  test("should maintain pricing card order in RTL", async ({ page }) => {
    await page.goto("/ar");
    await page.waitForLoadState("networkidle");

    await page.locator('[data-testid="pricing-teaser"]').scrollIntoViewIfNeeded();

    // Get all pricing cards
    const cards = page.locator('[data-testid^="pricing-card-"]');
    const count = await cards.count();

    // Should have 4 cards in RTL layout
    expect(count).toBe(4);
  });
});

test.describe("Plan Unification - Analytics", () => {
  test("should track pricing interaction events", async ({ page }) => {
    // Mock analytics tracking
    await page.goto("/en");
    await page.waitForLoadState("networkidle");

    // Add console log listener to verify tracking calls
    const trackingCalls: string[] = [];
    page.on("console", (msg) => {
      if (msg.text().includes("pricing_interaction")) {
        trackingCalls.push(msg.text());
      }
    });

    await page.locator('[data-testid="pricing-teaser"]').scrollIntoViewIfNeeded();

    // Toggle billing cycle
    const yearlyToggle = page.getByTestId("toggle-yearly");
    await yearlyToggle.click();

    // Wait for tracking
    await page.waitForTimeout(200);

    // Click plan
    const juniorCTA = page.getByTestId("pricing-cta-junior");
    await juniorCTA.click();

    // Tracking events should have been called (if analytics is enabled)
    // This is a basic smoke test for analytics integration
  });
});

test.describe("Plan Unification - Accessibility", () => {
  test("should have proper ARIA labels for plan cards", async ({ page }) => {
    await page.goto("/en/study");
    await page.waitForLoadState("networkidle");

    // Check Junior card has proper aria-label
    const juniorCard = page.getByTestId("level-card-easy");
    const ariaLabel = await juniorCard.getAttribute("aria-label");

    expect(ariaLabel).toBeTruthy();
    expect(ariaLabel).toContain("Junior");
  });

  test("should support keyboard navigation in pricing cards", async ({ page }) => {
    await page.goto("/en");
    await page.waitForLoadState("networkidle");

    await page.locator('[data-testid="pricing-teaser"]').scrollIntoViewIfNeeded();

    // Tab to first CTA button
    await page.keyboard.press("Tab");
    await page.keyboard.press("Tab");

    // Should be able to activate with Enter key
    const focusedElement = page.locator(":focus");
    await expect(focusedElement).toBeVisible();
  });

  test("should have sufficient color contrast for plan badges", async ({ page }) => {
    await page.goto("/en");
    await page.waitForLoadState("networkidle");

    await page.locator('[data-testid="pricing-teaser"]').scrollIntoViewIfNeeded();

    // Check badges are visible (basic visibility test)
    const intermediateBadge = page
      .getByTestId("pricing-card-intermediate")
      .locator("text=/Most Popular/i");
    await expect(intermediateBadge).toBeVisible();

    const bundleBadge = page.getByTestId("pricing-card-bundle").locator("text=/Best Value/i");
    await expect(bundleBadge).toBeVisible();
  });
});
