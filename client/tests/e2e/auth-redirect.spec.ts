import { test, expect } from "@playwright/test";

test.describe("Auth Redirect to Checkout", () => {
  test.beforeEach(async ({ page }) => {
    // Clear any existing auth state
    await page.context().clearCookies();
    await page.goto("/en");
  });

  test("Case 1: Login with query params redirects to checkout with preserved params", async ({
    page,
  }) => {
    // Navigate to login page with query params
    await page.goto("/en/login?plan=intermediate&billing=monthly&redirect=/checkout");

    // Wait for the login page to load
    await expect(page.locator("h2:has-text('Welcome Back')")).toBeVisible();

    // Fill in login form
    await page.fill('input[type="email"]', "test@example.com");
    await page.fill('input[type="password"]', "testpassword123");

    // Submit the form
    await page.click('button[type="submit"]');

    // Wait for navigation to complete
    await page.waitForURL(/\/en\/checkout\?plan=intermediate&billing=monthly/);

    // Verify we're on the checkout page with correct params
    expect(page.url()).toContain("/en/checkout");
    expect(page.url()).toContain("plan=intermediate");
    expect(page.url()).toContain("billing=monthly");
  });

  test("Case 2: Signup with query params (no redirect) defaults to checkout", async ({
    page,
  }) => {
    // Navigate to signup page with plan and billing but no explicit redirect
    await page.goto("/en/register?plan=advanced&billing=yearly");

    // Wait for the register page to load
    await expect(page.locator("h2:has-text('Your new job is waiting')")).toBeVisible();

    // Fill in registration form
    await page.fill('input[type="email"]', "newuser@example.com");
    // Assuming there's a continue button to proceed to next step
    await page.click('button:has-text("Continue")');

    // Fill in name and password
    await page.fill('input[name="name"]', "Test User");
    await page.fill('input[type="password"]', "testpassword123");
    await page.check('input[type="checkbox"]'); // Accept terms

    // Submit the form
    await page.click('button[type="submit"]');

    // After registration, user is redirected to login with preserved params
    await page.waitForURL(/\/en\/login\?plan=advanced&billing=yearly/);

    // Verify we're on the login page with correct params
    expect(page.url()).toContain("/en/login");
    expect(page.url()).toContain("plan=advanced");
    expect(page.url()).toContain("billing=yearly");

    // Now login
    await page.fill('input[type="email"]', "newuser@example.com");
    await page.fill('input[type="password"]', "testpassword123");
    await page.click('button[type="submit"]');

    // Should redirect to checkout with preserved params
    await page.waitForURL(/\/en\/checkout\?plan=advanced&billing=yearly/);
    expect(page.url()).toContain("/en/checkout");
    expect(page.url()).toContain("plan=advanced");
    expect(page.url()).toContain("billing=yearly");
  });

  test("Case 3: Already-authenticated user with invalid params gets sanitized redirect", async ({
    page,
  }) => {
    // First, login to establish authentication
    await page.goto("/en/login");
    await page.fill('input[type="email"]', "authenticated@example.com");
    await page.fill('input[type="password"]', "testpassword123");
    await page.click('button[type="submit"]');

    // Wait for successful login
    await page.waitForURL(/\/en\/checkout/);

    // Now try to visit login page with invalid query params
    await page.goto("/en/login?plan=bad&billing=invalid");

    // Should immediately redirect to checkout with sanitized params
    await page.waitForURL(/\/en\/checkout\?plan=intermediate&billing=monthly/);

    // Verify sanitized params
    expect(page.url()).toContain("/en/checkout");
    expect(page.url()).toContain("plan=intermediate");
    expect(page.url()).toContain("billing=monthly");
  });

  test("Case 4: Page refresh during login preserves params from sessionStorage", async ({
    page,
  }) => {
    // Navigate to login page with query params
    await page.goto("/en/login?plan=intermediate&billing=monthly&redirect=/checkout");

    // Wait for page to load
    await expect(page.locator("h2:has-text('Welcome Back')")).toBeVisible();

    // Verify params are stored in sessionStorage
    const storedPlan = await page.evaluate(() => sessionStorage.getItem("checkout_plan"));
    const storedBilling = await page.evaluate(() =>
      sessionStorage.getItem("checkout_billing")
    );
    const storedRedirect = await page.evaluate(() =>
      sessionStorage.getItem("checkout_redirect")
    );

    expect(storedPlan).toBe("intermediate");
    expect(storedBilling).toBe("monthly");
    expect(storedRedirect).toBe("/checkout");

    // Refresh the page
    await page.reload();

    // Fill in login form
    await page.fill('input[type="email"]', "test@example.com");
    await page.fill('input[type="password"]', "testpassword123");

    // Submit the form
    await page.click('button[type="submit"]');

    // Wait for navigation to complete
    await page.waitForURL(/\/en\/checkout\?plan=intermediate&billing=monthly/);

    // Verify we're on the checkout page with correct params
    expect(page.url()).toContain("/en/checkout");
    expect(page.url()).toContain("plan=intermediate");
    expect(page.url()).toContain("billing=monthly");
  });

  test("Locale is preserved during redirect (Arabic)", async ({ page }) => {
    // Navigate to Arabic login page with query params
    await page.goto("/ar/login?plan=intermediate&billing=monthly");

    // Wait for the login page to load
    await page.waitForSelector('input[type="email"]');

    // Fill in login form
    await page.fill('input[type="email"]', "test@example.com");
    await page.fill('input[type="password"]', "testpassword123");

    // Submit the form
    await page.click('button[type="submit"]');

    // Wait for navigation to complete
    await page.waitForURL(/\/ar\/checkout\?plan=intermediate&billing=monthly/);

    // Verify we're on the Arabic checkout page
    expect(page.url()).toContain("/ar/checkout");
    expect(page.url()).toContain("plan=intermediate");
    expect(page.url()).toContain("billing=monthly");

    // Verify RTL is set
    const htmlDir = await page.getAttribute("html", "dir");
    expect(htmlDir).toBe("rtl");
  });

  test("Invalid redirect URL falls back to /checkout", async ({ page }) => {
    // Navigate to login page with a potentially malicious redirect
    await page.goto("/en/login?plan=intermediate&billing=monthly&redirect=https://evil.com");

    // Wait for the login page to load
    await expect(page.locator("h2:has-text('Welcome Back')")).toBeVisible();

    // Fill in login form
    await page.fill('input[type="email"]', "test@example.com");
    await page.fill('input[type="password"]', "testpassword123");

    // Submit the form
    await page.click('button[type="submit"]');

    // Wait for navigation to complete
    await page.waitForURL(/\/en\/checkout\?plan=intermediate&billing=monthly/);

    // Verify we're on the checkout page (not evil.com)
    expect(page.url()).toContain("/en/checkout");
    expect(page.url()).not.toContain("evil.com");
  });

  test("Missing query params use defaults", async ({ page }) => {
    // Navigate to login page without any query params
    await page.goto("/en/login");

    // Wait for the login page to load
    await expect(page.locator("h2:has-text('Welcome Back')")).toBeVisible();

    // Fill in login form
    await page.fill('input[type="email"]', "test@example.com");
    await page.fill('input[type="password"]', "testpassword123");

    // Submit the form
    await page.click('button[type="submit"]');

    // Wait for navigation to complete
    await page.waitForURL(/\/en\/checkout\?plan=intermediate&billing=monthly/);

    // Verify defaults are used
    expect(page.url()).toContain("/en/checkout");
    expect(page.url()).toContain("plan=intermediate");
    expect(page.url()).toContain("billing=monthly");
  });

  test("Keyboard navigation works correctly on login form", async ({ page }) => {
    // Navigate to login page
    await page.goto("/en/login?plan=intermediate&billing=monthly");

    // Wait for the login page to load
    await expect(page.locator("h2:has-text('Welcome Back')")).toBeVisible();

    // Tab through the form
    await page.keyboard.press("Tab"); // Email field
    await page.keyboard.type("test@example.com");
    await page.keyboard.press("Tab"); // Password field
    await page.keyboard.type("testpassword123");
    await page.keyboard.press("Tab"); // Show password toggle
    await page.keyboard.press("Tab"); // Remember me checkbox
    await page.keyboard.press("Tab"); // Forgot password link
    await page.keyboard.press("Tab"); // Submit button
    await page.keyboard.press("Enter"); // Submit form

    // Wait for navigation to complete
    await page.waitForURL(/\/en\/checkout\?plan=intermediate&billing=monthly/);

    // Verify we're on the checkout page
    expect(page.url()).toContain("/en/checkout");
  });
});

