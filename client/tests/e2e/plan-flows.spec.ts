import { test, expect } from "@playwright/test";

test.describe("Free Plan Flow", () => {
  test("free user logs in and lands on Easy Study Guide", async ({ page }) => {
    // Navigate to login page
    await page.goto("/en/login");

    // Mock dev login
    await page.fill('input[type="email"]', "dev@example.com");
    await page.fill('input[type="password"]', "password123");
    await page.click('button[type="submit"]');

    // Should redirect to Easy Study Guide
    await expect(page).toHaveURL(/\/en\/guide\/easy/);

    // Should see welcome toast
    await expect(page.locator("text=Welcome back")).toBeVisible({ timeout: 5000 });

    // Should see free content
    await expect(page.locator("h1")).toContainText("Easy Study Guide");
  });

  test("free user can access Easy Quizzes", async ({ page }) => {
    // Setup: login as free user
    await page.goto("/en/login");
    await page.fill('input[type="email"]', "dev@example.com");
    await page.fill('input[type="password"]', "password123");
    await page.click('button[type="submit"]');

    // Navigate to Easy Quizzes
    await page.goto("/en/quizzes/easy");

    // Should see quiz content
    await expect(page.locator("h1")).toContainText("Easy Quizzes");

    // Should see free quizzes
    await expect(page.locator("text=JavaScript Basics")).toBeVisible();
  });

  test("free user sees soft paywall when accessing paid route", async ({ page }) => {
    // Setup: login as free user
    await page.goto("/en/login");
    await page.fill('input[type="email"]', "dev@example.com");
    await page.fill('input[type="password"]', "password123");
    await page.click('button[type="submit"]');

    // Try to access paid route
    await page.goto("/en/dashboard");

    // Soft paywall modal should appear
    await expect(page.locator("text=Unlock Premium Content")).toBeVisible({ timeout: 5000 });

    // Should have CTA buttons
    await expect(page.locator("text=See Plans")).toBeVisible();
    await expect(page.locator("text=Continue with Free")).toBeVisible();
  });

  test("free user can dismiss soft paywall and return to free content", async ({ page }) => {
    // Setup: login as free user
    await page.goto("/en/login");
    await page.fill('input[type="email"]', "dev@example.com");
    await page.fill('input[type="password"]', "password123");
    await page.click('button[type="submit"]');

    // Try to access paid route
    await page.goto("/en/dashboard");

    // Wait for soft paywall
    await expect(page.locator("text=Unlock Premium Content")).toBeVisible({ timeout: 5000 });

    // Click "Continue with Free"
    await page.click("text=Continue with Free");

    // Should redirect to free content
    await expect(page).toHaveURL(/\/en\/guide\/easy/);
  });

  test("free user can navigate to pricing from soft paywall", async ({ page }) => {
    // Setup: login as free user
    await page.goto("/en/login");
    await page.fill('input[type="email"]', "dev@example.com");
    await page.fill('input[type="password"]', "password123");
    await page.click('button[type="submit"]');

    // Try to access paid route
    await page.goto("/en/dashboard");

    // Wait for soft paywall
    await expect(page.locator("text=Unlock Premium Content")).toBeVisible({ timeout: 5000 });

    // Click "See Plans"
    await page.click("text=See Plans");

    // Should navigate to subscribe page
    await expect(page).toHaveURL(/\/en\/subscribe/);
  });
});

test.describe("Paid Plan Flow (Scaffold)", () => {
  test.skip("paid user logs in and lands on Dashboard", async ({ page }) => {
    // This test is skipped until paid plan mock is implemented
    // Setup: login as paid user (would need mock implementation)

    // Expected behavior:
    // - Should redirect to /en/dashboard
    // - Should see "Welcome back" message
    // - Should see VIP badge with plan name
    // - Should NOT see soft paywall
  });

  test.skip("paid user can access all paid routes", async ({ page }) => {
    // This test is skipped until paid plan mock is implemented
    // Setup: login as paid user

    // Expected behavior:
    // - Can navigate to /en/dashboard
    // - Can navigate to advanced quiz routes
    // - Does not trigger soft paywall
  });
});

test.describe("Locale Preservation", () => {
  test("free user login preserves Arabic locale", async ({ page }) => {
    // Navigate to Arabic login page
    await page.goto("/ar/login");

    // Login
    await page.fill('input[type="email"]', "dev@example.com");
    await page.fill('input[type="password"]', "password123");
    await page.click('button[type="submit"]');

    // Should stay in Arabic locale
    await expect(page).toHaveURL(/\/ar\/guide\/easy/);

    // HTML should have correct dir and lang
    const html = page.locator("html");
    await expect(html).toHaveAttribute("dir", "rtl");
    await expect(html).toHaveAttribute("lang", "ar");
  });
});

test.describe("Redirect Parameter Handling", () => {
  test("free user with valid redirect to free route", async ({ page }) => {
    // Navigate to login with redirect param
    await page.goto("/en/login?signInSuccessUrl=%2Fen%2Fquizzes%2Feasy");

    // Login
    await page.fill('input[type="email"]', "dev@example.com");
    await page.fill('input[type="password"]', "password123");
    await page.click('button[type="submit"]');

    // Should redirect to the specified free route
    await expect(page).toHaveURL(/\/en\/quizzes\/easy/);
  });

  test("free user with redirect to paid route shows soft paywall", async ({ page }) => {
    // Navigate to login with redirect to paid route
    await page.goto("/en/login?signInSuccessUrl=%2Fen%2Fdashboard");

    // Login
    await page.fill('input[type="email"]', "dev@example.com");
    await page.fill('input[type="password"]', "password123");
    await page.click('button[type="submit"]');

    // Should navigate to dashboard but show soft paywall
    await expect(page).toHaveURL(/\/en\/dashboard/);
    await expect(page.locator("text=Unlock Premium Content")).toBeVisible({ timeout: 5000 });
  });
});
