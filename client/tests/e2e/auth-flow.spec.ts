import { test, expect } from "@playwright/test";

test.describe("Authentication Flow", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the app
    await page.goto("/");
  });

  test("should register a new user successfully", async ({ page }) => {
    // Click on register button
    await page.click('text="Register"');

    // Fill registration form
    await page.fill('input[name="email"]', "e2etest@example.com");
    await page.fill('input[name="password"]', "SecurePassword123!");
    await page.fill('input[name="confirmPassword"]', "SecurePassword123!");
    await page.fill('input[name="firstName"]', "E2E");
    await page.fill('input[name="lastName"]', "Test");

    // Submit form
    await page.click('button[type="submit"]');

    // Check for success message
    await expect(page.locator('text="Registration successful"')).toBeVisible();

    // Check that user is redirected to verification page
    await expect(page).toHaveURL(/.*verify-email/);
  });

  test("should show validation errors for invalid registration data", async ({ page }) => {
    // Click on register button
    await page.click('text="Register"');

    // Try to submit empty form
    await page.click('button[type="submit"]');

    // Check for validation errors
    await expect(page.locator('text="Email is required"')).toBeVisible();
    await expect(page.locator('text="Password is required"')).toBeVisible();
    await expect(page.locator('text="First name is required"')).toBeVisible();
    await expect(page.locator('text="Last name is required"')).toBeVisible();
  });

  test("should show password mismatch error", async ({ page }) => {
    // Click on register button
    await page.click('text="Register"');

    // Fill form with mismatched passwords
    await page.fill('input[name="email"]', "test@example.com");
    await page.fill('input[name="password"]', "SecurePassword123!");
    await page.fill('input[name="confirmPassword"]', "DifferentPassword123!");
    await page.fill('input[name="firstName"]', "Test");
    await page.fill('input[name="lastName"]', "User");

    // Submit form
    await page.click('button[type="submit"]');

    // Check for password mismatch error
    await expect(page.locator('text="Passwords do not match"')).toBeVisible();
  });

  test("should login with valid credentials", async ({ page }) => {
    // Assuming user is already registered
    // Click on login button
    await page.click('text="Login"');

    // Fill login form
    await page.fill('input[name="email"]', "e2etest@example.com");
    await page.fill('input[name="password"]', "SecurePassword123!");

    // Submit form
    await page.click('button[type="submit"]');

    // Check for success message
    await expect(page.locator('text="Login successful"')).toBeVisible();

    // Check that user is redirected to dashboard
    await expect(page).toHaveURL(/.*dashboard/);
  });

  test("should show error for invalid login credentials", async ({ page }) => {
    // Click on login button
    await page.click('text="Login"');

    // Fill login form with invalid credentials
    await page.fill('input[name="email"]', "nonexistent@example.com");
    await page.fill('input[name="password"]', "WrongPassword123!");

    // Submit form
    await page.click('button[type="submit"]');

    // Check for error message
    await expect(page.locator('text="Invalid credentials"')).toBeVisible();
  });

  test("should handle forgot password flow", async ({ page }) => {
    // Click on login button
    await page.click('text="Login"');

    // Click forgot password link
    await page.click('text="Forgot password?"');

    // Fill email for password reset
    await page.fill('input[name="email"]', "e2etest@example.com");

    // Submit form
    await page.click('button[type="submit"]');

    // Check for success message
    await expect(page.locator('text="Password reset email sent"')).toBeVisible();

    // Check that user is redirected to login page
    await expect(page).toHaveURL(/.*login/);
  });

  test("should logout successfully", async ({ page }) => {
    // First login
    await page.click('text="Login"');
    await page.fill('input[name="email"]', "e2etest@example.com");
    await page.fill('input[name="password"]', "SecurePassword123!");
    await page.click('button[type="submit"]');

    // Wait for login to complete
    await expect(page).toHaveURL(/.*dashboard/);

    // Click logout button
    await page.click('text="Logout"');

    // Check for logout confirmation
    await expect(page.locator('text="Logged out successfully"')).toBeVisible();

    // Check that user is redirected to home page
    await expect(page).toHaveURL("/");
  });

  test("should handle Google OAuth login", async ({ page }) => {
    // Click on login button
    await page.click('text="Login"');

    // Click Google login button
    await page.click('button:has-text("Continue with Google")');

    // Check that OAuth flow is initiated
    await expect(page).toHaveURL(/.*accounts\.google\.com/);
  });

  test("should maintain authentication state on page refresh", async ({ page }) => {
    // Login first
    await page.click('text="Login"');
    await page.fill('input[name="email"]', "e2etest@example.com");
    await page.fill('input[name="password"]', "SecurePassword123!");
    await page.click('button[type="submit"]');

    // Wait for login to complete
    await expect(page).toHaveURL(/.*dashboard/);

    // Refresh the page
    await page.reload();

    // Check that user is still authenticated
    await expect(page.locator('text="Welcome back"')).toBeVisible();
  });

  test("should redirect unauthenticated users to login", async ({ page }) => {
    // Try to access protected route
    await page.goto("/dashboard");

    // Check that user is redirected to login
    await expect(page).toHaveURL(/.*login/);

    // Check for redirect message
    await expect(page.locator('text="Please login to continue"')).toBeVisible();
  });

  test("should handle email verification flow", async ({ page }) => {
    // First register a user
    await page.click('text="Register"');
    await page.fill('input[name="email"]', "verifytest@example.com");
    await page.fill('input[name="password"]', "SecurePassword123!");
    await page.fill('input[name="confirmPassword"]', "SecurePassword123!");
    await page.fill('input[name="firstName"]', "Verify");
    await page.fill('input[name="lastName"]', "Test");
    await page.click('button[type="submit"]');

    // Should be on verification page
    await expect(page).toHaveURL(/.*verify-email/);

    // Check for verification message
    await expect(page.locator('text="Please check your email"')).toBeVisible();

    // Check for resend button
    await expect(page.locator('button:has-text("Resend Email")')).toBeVisible();
  });

  test("should handle password reset flow", async ({ page }) => {
    // Go to forgot password
    await page.click('text="Login"');
    await page.click('text="Forgot password?"');

    // Fill email
    await page.fill('input[name="email"]', "e2etest@example.com");
    await page.click('button[type="submit"]');

    // Check for success message
    await expect(page.locator('text="Password reset email sent"')).toBeVisible();

    // Check for back to login link
    await expect(page.locator('text="Back to Login"')).toBeVisible();
  });

  test("should handle form validation on blur", async ({ page }) => {
    // Click on register button
    await page.click('text="Register"');

    // Focus and blur email field without entering anything
    await page.focus('input[name="email"]');
    await page.blur('input[name="email"]');

    // Check for validation error
    await expect(page.locator('text="Email is required"')).toBeVisible();

    // Enter invalid email
    await page.fill('input[name="email"]', "invalid-email");
    await page.blur('input[name="email"]');

    // Check for email format error
    await expect(page.locator('text="Please enter a valid email"')).toBeVisible();
  });

  test("should handle loading states during authentication", async ({ page }) => {
    // Click on login button
    await page.click('text="Login"');

    // Fill login form
    await page.fill('input[name="email"]', "e2etest@example.com");
    await page.fill('input[name="password"]', "SecurePassword123!");

    // Submit form and check for loading state
    await page.click('button[type="submit"]');

    // Check that submit button shows loading state
    await expect(page.locator('button[type="submit"]:has-text("Logging in...")')).toBeVisible();

    // Wait for login to complete
    await expect(page).toHaveURL(/.*dashboard/);
  });

  test("should handle network errors gracefully", async ({ page }) => {
    // Mock network failure
    await page.route("**/api/auth/login", (route) => {
      route.abort("failed");
    });

    // Try to login
    await page.click('text="Login"');
    await page.fill('input[name="email"]', "e2etest@example.com");
    await page.fill('input[name="password"]', "SecurePassword123!");
    await page.click('button[type="submit"]');

    // Check for network error message
    await expect(page.locator('text="Network error. Please try again."')).toBeVisible();
  });

  test("should handle rate limiting", async ({ page }) => {
    // Mock rate limiting response
    await page.route("**/api/auth/login", (route) => {
      route.fulfill({
        status: 429,
        contentType: "application/json",
        body: JSON.stringify({
          error: "Too many login attempts. Please try again later.",
        }),
      });
    });

    // Try to login
    await page.click('text="Login"');
    await page.fill('input[name="email"]', "e2etest@example.com");
    await page.fill('input[name="password"]', "SecurePassword123!");
    await page.click('button[type="submit"]');

    // Check for rate limit error message
    await expect(page.locator('text="Too many login attempts"')).toBeVisible();
  });

  test("should navigate from Register to Login page with locale", async ({ page }) => {
    // Navigate to Register page with English locale
    await page.goto("/en/register");

    // Click on "Sign in" link
    await page.click('text="Sign in"');

    // Check that user is redirected to Login page with locale preserved
    await expect(page).toHaveURL(/\/en\/login/);

    // Check that Login page is displayed
    await expect(page.locator('h2:has-text("Welcome back")')).toBeVisible();
  });

  test("should navigate from Register to Login page with Arabic locale", async ({ page }) => {
    // Navigate to Register page with Arabic locale
    await page.goto("/ar/register");

    // Click on "Sign in" link (in Arabic)
    await page.click('text="تسجيل الدخول"');

    // Check that user is redirected to Login page with locale preserved
    await expect(page).toHaveURL(/\/ar\/login/);

    // Check that Login page is displayed in Arabic
    await expect(page.locator('h2:has-text("مرحباً بعودتك")')).toBeVisible();
  });

  test("should navigate from Login to Register page with locale", async ({ page }) => {
    // Navigate to Login page with English locale
    await page.goto("/en/login");

    // Click on "Sign up" link
    await page.click('text="Sign up"');

    // Check that user is redirected to Register page with locale preserved
    await expect(page).toHaveURL(/\/en\/register/);

    // Check that Register page is displayed
    await expect(page.locator('h2:has-text("Your new job is waiting")')).toBeVisible();
  });

  test("should redirect to signInSuccessUrl after successful login", async ({ page }) => {
    // Navigate to Login page with redirect param
    await page.goto("/en/login?signInSuccessUrl=%2Fdashboard");

    // Fill and submit login form
    await page.fill('input[type="email"]', "e2etest@example.com");
    await page.fill('input[type="password"]', "SecurePassword123!");
    await page.click('button[type="submit"]:has-text("Sign in")');

    // Check that user is redirected to dashboard with locale
    await expect(page).toHaveURL(/\/en\/dashboard/);
  });

  test("should redirect to default path when signInSuccessUrl is missing", async ({ page }) => {
    // Navigate to Login page without redirect param
    await page.goto("/en/login");

    // Fill and submit login form
    await page.fill('input[type="email"]', "e2etest@example.com");
    await page.fill('input[type="password"]', "SecurePassword123!");
    await page.click('button[type="submit"]:has-text("Sign in")');

    // Check that user is redirected to default path (home)
    await expect(page).toHaveURL(/\/en$/);
  });

  test("should reject invalid signInSuccessUrl (absolute URL)", async ({ page }) => {
    // Navigate to Login page with malicious redirect param
    await page.goto("/en/login?signInSuccessUrl=http%3A%2F%2Fevil.com");

    // Fill and submit login form
    await page.fill('input[type="email"]', "e2etest@example.com");
    await page.fill('input[type="password"]', "SecurePassword123!");
    await page.click('button[type="submit"]:has-text("Sign in")');

    // Check that user is redirected to default path, not evil.com
    await expect(page).toHaveURL(/\/en$/);
    await expect(page).not.toHaveURL(/evil\.com/);
  });

  test("should redirect authenticated user from Login to signInSuccessUrl", async ({ page, context }) => {
    // First login to create authenticated session
    await page.goto("/en/login");
    await page.fill('input[type="email"]', "e2etest@example.com");
    await page.fill('input[type="password"]', "SecurePassword123!");
    await page.click('button[type="submit"]:has-text("Sign in")');

    // Wait for login to complete
    await expect(page).toHaveURL(/\/en$/);

    // Now try to visit login page with redirect param (while already authenticated)
    await page.goto("/en/login?signInSuccessUrl=%2Fpricing");

    // Check that user is immediately redirected to pricing
    await expect(page).toHaveURL(/\/en\/pricing/);
  });

  test("should preserve locale in signInSuccessUrl redirect", async ({ page }) => {
    // Navigate to Arabic Login page with redirect param
    await page.goto("/ar/login?signInSuccessUrl=%2Fquiz");

    // Fill and submit login form
    await page.fill('input[type="email"]', "e2etest@example.com");
    await page.fill('input[type="password"]', "SecurePassword123!");
    await page.click('button[type="submit"]');

    // Check that user is redirected to quiz with Arabic locale
    await expect(page).toHaveURL(/\/ar\/quiz/);
  });

  test("should handle signInSuccessUrl with query params", async ({ page }) => {
    // Navigate to Login page with redirect param that includes query params
    await page.goto("/en/login?signInSuccessUrl=%2Fdashboard%3Ftab%3Dsettings");

    // Fill and submit login form
    await page.fill('input[type="email"]', "e2etest@example.com");
    await page.fill('input[type="password"]', "SecurePassword123!");
    await page.click('button[type="submit"]:has-text("Sign in")');

    // Check that user is redirected with query params preserved
    await expect(page).toHaveURL(/\/en\/dashboard\?tab=settings/);
  });
});
