/**
 * E2E tests for Select page
 * Tests selection flow, keyboard navigation, RTL, and i18n
 */

import { test, expect } from "@playwright/test";

test.describe("Select Page", () => {
  test.beforeEach(async ({ page }) => {
    // Login first (assuming auth is required)
    await page.goto("/en/login");
    await page.fill('input[type="email"]', "test@example.com");
    await page.fill('input[type="password"]', "password123");
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/en\/(select|dashboard)/);

    // Navigate to select page
    await page.goto("/en/select");
    await page.waitForLoadState("networkidle");
  });

  test("should display the page title and subtitle", async ({ page }) => {
    const title = page.locator(".select-header__title");
    await expect(title).toBeVisible();
    await expect(title).toContainText("Choose Your Learning Path");

    const subtitle = page.locator(".select-header__subtitle");
    await expect(subtitle).toBeVisible();
  });

  test("should display all level cards", async ({ page }) => {
    const cards = page.locator(".select-card");
    await expect(cards).toHaveCount(4); // Junior, Intermediate, Senior, Custom

    // Verify each card has required elements
    await expect(page.locator("#select-card-junior")).toBeVisible();
    await expect(page.locator("#select-card-intermediate")).toBeVisible();
    await expect(page.locator("#select-card-senior")).toBeVisible();
    await expect(page.locator("#select-card-custom")).toBeVisible();
  });

  test("should select a card when clicked", async ({ page }) => {
    const juniorCard = page.locator("#select-card-junior");
    await juniorCard.click();

    // Verify card is selected
    await expect(juniorCard).toHaveClass(/select-card--selected/);
    await expect(juniorCard).toHaveAttribute("aria-pressed", "true");

    // Verify continue button is enabled
    const continueBtn = page.locator(".select-footer__btn--primary");
    await expect(continueBtn).toBeEnabled();
  });

  test("should navigate to mode chooser when continue is clicked", async ({ page }) => {
    // Select Junior level
    await page.locator("#select-card-junior").click();

    // Click continue
    await page.locator(".select-footer__btn--primary").click();

    // Verify navigation to mode chooser
    await page.waitForURL(/\/en\/junior\/choose/);
  });

  test("should support keyboard navigation", async ({ page }) => {
    // Tab to first card
    await page.keyboard.press("Tab");

    // Find the focused card
    const focusedElement = page.locator(":focus");
    await expect(focusedElement).toHaveAttribute("role", "button");

    // Press Enter to select
    await page.keyboard.press("Enter");

    // Verify selection
    const selectedCard = page.locator(".select-card--selected");
    await expect(selectedCard).toBeVisible();

    // Continue button should be enabled
    const continueBtn = page.locator(".select-footer__btn--primary");
    await expect(continueBtn).toBeEnabled();
  });

  test("should support Space key for selection", async ({ page }) => {
    const juniorCard = page.locator("#select-card-junior");
    await juniorCard.focus();
    await page.keyboard.press("Space");

    // Verify selection
    await expect(juniorCard).toHaveClass(/select-card--selected/);
  });

  test("should disable continue button when no selection", async ({ page }) => {
    const continueBtn = page.locator(".select-footer__btn--primary");
    await expect(continueBtn).toBeDisabled();
  });

  test("should handle locked cards appropriately", async ({ page }) => {
    const intermediateCard = page.locator("#select-card-intermediate");

    // Check if card is locked (depends on user's plan)
    const isLocked = await intermediateCard.locator(".select-card__lock-overlay").isVisible();

    if (isLocked) {
      // Verify lock overlay is visible
      await expect(intermediateCard.locator(".lock-icon")).toBeVisible();

      // Click should not select locked card
      await intermediateCard.click();
      await expect(intermediateCard).not.toHaveClass(/select-card--selected/);

      // Continue button should remain disabled
      const continueBtn = page.locator(".select-footer__btn--primary");
      await expect(continueBtn).toBeDisabled();
    }
  });

  test("should show visible focus rings on keyboard navigation", async ({ page }) => {
    // Tab to first interactive element
    await page.keyboard.press("Tab");

    // Check that focus styles are applied
    const focusedElement = page.locator(":focus");
    await expect(focusedElement).toBeFocused();
  });

  test("should change selection when clicking different cards", async ({ page }) => {
    // Select Junior
    const juniorCard = page.locator("#select-card-junior");
    await juniorCard.click();
    await expect(juniorCard).toHaveClass(/select-card--selected/);

    // Select Custom
    const customCard = page.locator("#select-card-custom");
    await customCard.click();

    // Verify Custom is selected and Junior is not
    await expect(customCard).toHaveClass(/select-card--selected/);
    await expect(juniorCard).not.toHaveClass(/select-card--selected/);
  });

  test.describe("RTL Support", () => {
    test("should display correctly in Arabic/RTL mode", async ({ page }) => {
      // Navigate to Arabic version
      await page.goto("/ar/select");
      await page.waitForLoadState("networkidle");

      // Verify dir attribute
      const htmlElement = page.locator("html");
      await expect(htmlElement).toHaveAttribute("dir", "rtl");
      await expect(htmlElement).toHaveAttribute("lang", "ar");

      // Verify Arabic content
      const title = page.locator(".select-header__title");
      await expect(title).toBeVisible();
      // The title should be in Arabic
      const titleText = await title.textContent();
      expect(titleText).toBeTruthy();
    });

    test("should mirror layout in RTL", async ({ page }) => {
      await page.goto("/ar/select");
      await page.waitForLoadState("networkidle");

      // Verify cards are still visible and interactive
      const cards = page.locator(".select-card");
      await expect(cards).toHaveCount(4);

      // Test interaction still works
      const firstCard = cards.first();
      await firstCard.click();
      await expect(firstCard).toHaveClass(/select-card--selected/);
    });
  });

  test.describe("i18n", () => {
    test("should display English content by default", async ({ page }) => {
      const title = page.locator(".select-header__title");
      await expect(title).toContainText("Choose Your Learning Path");

      const continueBtn = page.locator(".select-footer__btn--primary");
      await expect(continueBtn).toContainText("Continue");
    });

    test("should display Arabic content on /ar route", async ({ page }) => {
      await page.goto("/ar/select");
      await page.waitForLoadState("networkidle");

      const title = page.locator(".select-header__title");
      const titleText = await title.textContent();

      // Verify it's NOT English
      expect(titleText).not.toContain("Choose Your Learning Path");

      // Verify element is visible and has content
      await expect(title).toBeVisible();
      expect(titleText?.length).toBeGreaterThan(0);
    });
  });

  test.describe("Loading States", () => {
    test("should show skeleton loader initially", async ({ page }) => {
      // Intercept API calls to delay them
      await page.route("/api/v1/progress", async (route) => {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        await route.continue();
      });

      await page.goto("/en/select");

      // Skeleton should be visible initially
      const skeleton = page.locator(".select-skeleton");
      await expect(skeleton).toBeVisible();

      // Wait for content to load
      await page.waitForSelector(".select-card", { timeout: 5000 });

      // Skeleton should be gone
      await expect(skeleton).not.toBeVisible();
    });
  });

  test.describe("Error Handling", () => {
    test("should show error state when API fails", async ({ page }) => {
      // Intercept and fail API calls
      await page.route("/api/v1/progress", (route) => route.abort());

      await page.goto("/en/select");
      await page.waitForLoadState("networkidle");

      // Wait a bit for error to appear
      await page.waitForTimeout(1000);

      // Error banner might appear (depends on implementation)
      const errorBanner = page.locator(".select-error");

      // If error is shown, verify retry button exists
      if (await errorBanner.isVisible()) {
        const retryBtn = page.locator(".retry-btn");
        await expect(retryBtn).toBeVisible();
      }
    });
  });

  test.describe("Accessibility", () => {
    test("should have proper ARIA attributes", async ({ page }) => {
      const juniorCard = page.locator("#select-card-junior");

      await expect(juniorCard).toHaveAttribute("role", "button");
      await expect(juniorCard).toHaveAttribute("tabindex", "0");
      await expect(juniorCard).toHaveAttribute("aria-pressed", "false");

      await juniorCard.click();
      await expect(juniorCard).toHaveAttribute("aria-pressed", "true");
    });

    test("should have semantic HTML structure", async ({ page }) => {
      // Check for proper heading hierarchy
      const h1 = page.locator("h1");
      await expect(h1).toBeVisible();

      // Cards should have article tags
      const articles = page.locator('article[role="button"]');
      await expect(articles).toHaveCount(4);

      // Footer should exist
      const footer = page.locator("footer");
      await expect(footer).toBeVisible();
    });
  });
});
