import { test, expect } from "@playwright/test";

test.describe("Pricing Page - 3-Card Layout", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/en/pricing");
    await page.waitForLoadState("networkidle");
  });

  test("should display 3 plan cards by default", async ({ page }) => {
    const cards = page.locator('[data-testid^="plan-card-"]');
    await expect(cards).toHaveCount(3); // Junior, Intermediate, Senior
  });

  test("should show Intermediate as Most Popular", async ({ page }) => {
    const intermediateCard = page.locator('[data-testid="plan-card-intermediate"]');
    await expect(intermediateCard.locator(".plan-card-badge")).toContainText("Most Popular");
  });

  test("should display plan names from registry", async ({ page }) => {
    await expect(page.locator('[data-testid="plan-card-junior"]')).toContainText("Junior");
    await expect(page.locator('[data-testid="plan-card-intermediate"]')).toContainText(
      "Intermediate"
    );
    await expect(page.locator('[data-testid="plan-card-senior"]')).toContainText("Senior");
  });

  test("should show correct prices (monthly)", async ({ page }) => {
    await expect(page.locator('[data-testid="plan-card-junior"]')).toContainText("$0");
    await expect(page.locator('[data-testid="plan-card-intermediate"]')).toContainText("$10");
    await expect(page.locator('[data-testid="plan-card-senior"]')).toContainText("$15");
  });

  test("should toggle between monthly and annual billing", async ({ page }) => {
    // Check monthly prices
    await expect(page.locator('[data-testid="plan-card-intermediate"]')).toContainText("$10");
    await expect(page.locator('[data-testid="plan-card-senior"]')).toContainText("$15");

    // Click annual toggle
    await page.click('[data-testid="toggle-annual"]');
    await page.waitForTimeout(300); // Wait for transition

    // Check annual prices
    await expect(page.locator('[data-testid="plan-card-intermediate"]')).toContainText("$100");
    await expect(page.locator('[data-testid="plan-card-senior"]')).toContainText("$150");
  });

  test("should show savings message when annual is selected", async ({ page }) => {
    await page.click('[data-testid="toggle-annual"]');
    await expect(page.locator(".pricing-cards__savings-message")).toBeVisible();
  });

  test("should have correct CTA labels", async ({ page }) => {
    const juniorCTA = page.locator('[data-testid="plan-cta-junior"]');
    const intermediateCTA = page.locator('[data-testid="plan-cta-intermediate"]');
    const seniorCTA = page.locator('[data-testid="plan-cta-senior"]');

    await expect(juniorCTA).toContainText("Start Learning Free");
    await expect(intermediateCTA).toContainText("Upgrade to Intermediate");
    await expect(seniorCTA).toContainText("Upgrade to Senior");
  });

  test("should show reassurance text", async ({ page }) => {
    const intermediateCard = page.locator('[data-testid="plan-card-intermediate"]');
    await expect(intermediateCard).toContainText("Cancel anytime");
    await expect(intermediateCard).toContainText("Secure payments");
  });
});

test.describe("Checkout Flow", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/en/pricing");
    await page.waitForLoadState("networkidle");
  });

  test("should complete junior signup flow", async ({ page }) => {
    await page.click('[data-testid="plan-cta-junior"]');

    // Should go to registration
    await expect(page).toHaveURL(/\/auth\/register/);
  });

  test("should navigate to pricing page with plan query param on paid plan click", async ({
    page,
  }) => {
    await page.click('[data-testid="plan-cta-intermediate"]');

    // Should stay on pricing page with plan query param
    await page.waitForURL("**/pricing?plan=intermediate**", { timeout: 2000 });
    expect(page.url()).toContain("plan=intermediate");
    expect(page.url()).toContain("/pricing");
  });

  test("should pre-select plan from query params", async ({ page }) => {
    await page.goto("/en/pricing?plan=senior&billing=annual");
    await page.waitForLoadState("networkidle");

    // Annual toggle should be selected
    const annualToggle = page.locator('[data-testid="toggle-annual"]');
    await expect(annualToggle).toHaveAttribute("aria-pressed", "true");

    // Senior plan should show annual price
    await expect(page.locator('[data-testid="plan-card-senior"]')).toContainText("$150");
  });
});

test.describe("Legacy URL Redirects", () => {
  test("should redirect legacy plan=pro to plan=intermediate", async ({ page }) => {
    await page.goto("/en/pricing?plan=pro&billing=month");

    // Should redirect to canonical
    await page.waitForURL("**/pricing?plan=intermediate&billing=monthly", { timeout: 5000 });
    expect(page.url()).toContain("plan=intermediate");
    expect(page.url()).toContain("billing=monthly");
  });

  test("should redirect legacy plan=expert to plan=senior", async ({ page }) => {
    await page.goto("/en/pricing?plan=expert&billing=year");

    // Should redirect to canonical
    await page.waitForURL("**/pricing?plan=senior&billing=annual", { timeout: 5000 });
    expect(page.url()).toContain("plan=senior");
    expect(page.url()).toContain("billing=annual");
  });

  test("should redirect legacy plan=easy to plan=junior", async ({ page }) => {
    await page.goto("/en/pricing?plan=easy");

    // Should redirect to canonical
    await page.waitForURL("**/pricing?plan=junior", { timeout: 5000 });
    expect(page.url()).toContain("plan=junior");
  });

  test("should redirect legacy plan=medium to plan=intermediate", async ({ page }) => {
    await page.goto("/en/pricing?plan=medium");

    // Should redirect to canonical
    await page.waitForURL("**/pricing?plan=intermediate", { timeout: 5000 });
    expect(page.url()).toContain("plan=intermediate");
  });

  test("should redirect legacy plan=hard to plan=senior", async ({ page }) => {
    await page.goto("/en/pricing?plan=hard");

    // Should redirect to canonical
    await page.waitForURL("**/pricing?plan=senior", { timeout: 5000 });
    expect(page.url()).toContain("plan=senior");
  });
});

test.describe("Arabic (RTL) Support", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/ar/pricing");
    await page.waitForLoadState("networkidle");
  });

  test("should work in Arabic RTL mode", async ({ page }) => {
    const html = page.locator("html");
    await expect(html).toHaveAttribute("dir", "rtl");

    // Check cards display
    const cards = page.locator('[data-testid^="plan-card-"]');
    await expect(cards).toHaveCount(3);
  });

  test("should show Arabic plan names", async ({ page }) => {
    await expect(page.locator('[data-testid="plan-card-junior"]')).toContainText("المبتدئ");
    await expect(page.locator('[data-testid="plan-card-intermediate"]')).toContainText("متوسط");
    await expect(page.locator('[data-testid="plan-card-senior"]')).toContainText("متقدم");
  });

  test("should show Arabic CTA labels", async ({ page }) => {
    const juniorCTA = page.locator('[data-testid="plan-cta-junior"]');
    await expect(juniorCTA).toContainText("ابدأ التعلم مجانًا");
  });
});

test.describe("Accessibility", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/en/pricing");
    await page.waitForLoadState("networkidle");
  });

  test("should have keyboard accessibility", async ({ page }) => {
    // Focus first card
    await page.keyboard.press("Tab");

    // Tab to CTA buttons
    let focused = null;
    for (let i = 0; i < 15; i++) {
      await page.keyboard.press("Tab");
      focused = await page.evaluate(() => document.activeElement?.getAttribute("data-testid"));
      if (focused?.includes("plan-cta")) {
        break;
      }
    }

    expect(focused).toContain("plan-cta");

    // Press Enter to activate
    await page.keyboard.press("Enter");

    // Should navigate or open modal
    await page.waitForTimeout(500);
    const modalVisible = await page
      .locator('[data-testid="checkout-modal"]')
      .isVisible({ timeout: 1000 })
      .catch(() => false);
    const urlChanged = !page.url().endsWith("/pricing");

    expect(modalVisible || urlChanged).toBeTruthy();
  });

  test("should have proper ARIA labels", async ({ page }) => {
    const monthlyToggle = page.locator('[data-testid="toggle-monthly"]');
    const annualToggle = page.locator('[data-testid="toggle-annual"]');

    await expect(monthlyToggle).toHaveAttribute("aria-pressed");
    await expect(annualToggle).toHaveAttribute("aria-pressed");
  });

  test("should have semantic HTML", async ({ page }) => {
    // Check for proper heading structure
    const h1 = page.locator("h1");
    await expect(h1).toBeVisible();

    // Check cards have proper structure
    const cards = page.locator('[data-testid^="plan-card-"]');
    const firstCard = cards.first();

    const heading = firstCard.locator("h3, h2");
    await expect(heading).toBeVisible();

    const button = firstCard.locator("button");
    await expect(button).toBeVisible();
  });

  test("should respect prefers-reduced-motion", async ({ page, context }) => {
    await context.addInitScript(() => {
      Object.defineProperty(window, "matchMedia", {
        value: (query: string) => ({
          matches: query === "(prefers-reduced-motion: reduce)",
          media: query,
          addEventListener: () => {},
          removeEventListener: () => {},
        }),
      });
    });

    await page.goto("/en/pricing");
    await page.waitForLoadState("networkidle");

    // Click annual toggle (should have no animation)
    await page.click('[data-testid="toggle-annual"]');

    // Transitions should be disabled or instant
    const card = page.locator('[data-testid="plan-card-intermediate"]');
    const transitionDuration = await card.evaluate(
      (el) => window.getComputedStyle(el).transitionDuration
    );

    // Should be 0s or very short
    expect(transitionDuration).toMatch(/^0s|^0\.0/);
  });
});

test.describe("Mobile Responsiveness", () => {
  test.use({ viewport: { width: 375, height: 667 } }); // iPhone SE

  test.beforeEach(async ({ page }) => {
    await page.goto("/en/pricing");
    await page.waitForLoadState("networkidle");
  });

  test("should display stacked cards on mobile", async ({ page }) => {
    const cards = page.locator('[data-testid^="plan-card-"]');
    await expect(cards).toHaveCount(3);

    // Cards should be in a single column
    const firstCard = cards.first();
    const secondCard = cards.nth(1);

    const firstBox = await firstCard.boundingBox();
    const secondBox = await secondCard.boundingBox();

    expect(firstBox).toBeTruthy();
    expect(secondBox).toBeTruthy();

    // Second card should be below first card (stacked)
    expect(secondBox!.y).toBeGreaterThan(firstBox!.y + firstBox!.height - 20);
  });

  test("should have large tap targets", async ({ page }) => {
    const cta = page.locator('[data-testid="plan-cta-intermediate"]');
    const box = await cta.boundingBox();

    expect(box).toBeTruthy();
    expect(box!.height).toBeGreaterThanOrEqual(44); // iOS minimum tap target
  });
});

test.describe("Performance", () => {
  test("should load pricing page quickly", async ({ page }) => {
    const startTime = Date.now();
    await page.goto("/en/pricing");
    await page.waitForLoadState("networkidle");
    const endTime = Date.now();

    const loadTime = endTime - startTime;
    expect(loadTime).toBeLessThan(3000); // Should load in under 3 seconds
  });
});
