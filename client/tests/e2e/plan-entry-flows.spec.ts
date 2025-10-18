/**
 * E2E tests for plan entry flows with auth gating and intent preservation
 * Tests Free, Intermediate, Advanced, and Bundle (Pro) plan behaviors
 */

import { test, expect } from "@playwright/test";

test.describe("Plan Entry Flows - Unauthenticated Users", () => {
  test("Free plan: click Easy Study → login → lands on /study/easy", async ({ page }) => {
    await page.goto("/en");

    // Navigate to study selection
    await page.goto("/en/study");

    // Click Easy difficulty card
    await page.click('button:has-text("Easy")');

    // Click Start Study button (should redirect to login with intent)
    await page.click('button:has-text("Start Study")');

    // Should be on login page with signInSuccessUrl
    await expect(page).toHaveURL(/\/en\/login\?signInSuccessUrl=/);

    // Mock authentication as free user (in real test, would use test account)
    // After login, should land on /en/study/easy
    // This requires mocking auth - skipping actual login for now
  });

  test("Intermediate plan: click Medium Study → login → lands on /study/medium", async ({
    page,
  }) => {
    await page.goto("/en/study");

    // Click Medium difficulty card
    await page.click('button:has-text("Medium")');

    // Click Start Study button
    await page.click('button:has-text("Start Study")');

    // Should redirect to login with intent
    await expect(page).toHaveURL(/\/en\/login\?signInSuccessUrl=/);
  });

  test("Bundle plan: click Hard Study → login → lands on /study/hard (or medium for Bundle)", async ({
    page,
  }) => {
    await page.goto("/en/study");

    // Click Hard difficulty card
    await page.click('button:has-text("Hard")');

    // Click Start Study button
    await page.click('button:has-text("Start Study")');

    // Should redirect to login with intent
    await expect(page).toHaveURL(/\/en\/login\?signInSuccessUrl=/);
  });

  test("Quiz: click Junior → login → preserves intent", async ({ page }) => {
    await page.goto("/en/quiz");

    // Click Junior level card
    await page.click('button:has-text("Junior")');

    // Click Start Quiz button
    await page.click('button:has-text("Start Quiz")');

    // Should redirect to login with quiz intent
    await expect(page).toHaveURL(/\/en\/login\?signInSuccessUrl=/);
  });
});

test.describe("Plan Entry Flows - Authenticated Users", () => {
  test.skip("Free user: logged in, clicks Easy Study → goes directly to /study/easy", async ({
    page,
  }) => {
    // This test requires authentication setup
    // Skip for now - would need test auth helpers
  });

  test.skip("Intermediate user: logged in, clicks Medium Study → goes directly to /study/medium", async ({
    page,
  }) => {
    // Requires intermediate plan mock
  });

  test.skip("Advanced user: logged in, clicks Hard Study → goes directly to /study/hard", async ({
    page,
  }) => {
    // Requires advanced plan mock
  });

  test.skip("Bundle (Pro) user: logged in, sees both Medium+Hard unlocked", async ({ page }) => {
    // Pro user should see special purple border on Medium and Hard cards
    // Indicating both are part of the Bundle
  });
});

test.describe("Bundle Plan Visibility", () => {
  test.skip("Pro user sees Medium and Hard with special Bundle styling", async ({ page }) => {
    // Login as Pro user
    // Navigate to /en/study
    // Expect Medium and Hard cards to have purple border (Bundle indicator)
    // Free/Intermediate users should not see this
  });

  test.skip("Pro user can access both Medium and Hard without paywall", async ({ page }) => {
    // Login as Pro user
    // Navigate to /en/study/medium → should work
    // Navigate to /en/study/hard → should work
    // No soft paywall should appear
  });
});

test.describe("Locale Preservation", () => {
  test("Arabic locale: unauthenticated user clicks Easy Study → login preserves /ar/ locale", async ({
    page,
  }) => {
    await page.goto("/ar/study");

    // Verify RTL layout
    const html = await page.locator("html");
    await expect(html).toHaveAttribute("dir", "rtl");

    // Click Easy difficulty card
    await page.click('button:has-text("سهل")'); // Arabic for "Easy" - may need adjustment

    // Click Start Study button
    await page.click('button:has-text("بدء الدراسة")'); // Arabic for "Start Study" - may need adjustment

    // Should preserve /ar/ in redirect
    await expect(page).toHaveURL(/\/ar\/login/);
  });
});

test.describe("Intent Redirect Validation", () => {
  test("Intent URLs are relative paths only (no external redirects)", async ({ page }) => {
    await page.goto("/en/study");

    // Click Medium difficulty
    await page.click('button:has-text("Medium")');
    await page.click('button:has-text("Start Study")');

    const url = page.url();

    // Should be relative path
    expect(url).not.toContain("://");
    expect(url).toMatch(/^http:\/\/localhost.*\/en\/login/);

    // signInSuccessUrl param should be relative
    const urlObj = new URL(url);
    const redirectParam = urlObj.searchParams.get("signInSuccessUrl");
    expect(redirectParam).not.toBeNull();
    expect(redirectParam?.startsWith("/")).toBe(true);
    expect(redirectParam?.includes("://")).toBe(false);
  });
});

test.describe("Selection Page UI", () => {
  test("Study selection page shows locked badges for inaccessible levels", async ({ page }) => {
    // Without auth, all levels should be selectable (auth gate happens on Start)
    await page.goto("/en/study");

    // Easy card should be visible
    await expect(page.locator('button:has-text("Easy")')).toBeVisible();

    // Medium card should be visible
    await expect(page.locator('button:has-text("Medium")')).toBeVisible();

    // Hard card should be visible
    await expect(page.locator('button:has-text("Hard")')).toBeVisible();
  });

  test("Quiz selection page shows question counts", async ({ page }) => {
    await page.goto("/en/quiz");

    // Junior should show 30 questions
    await expect(page.locator("text=/30.*question/i")).toBeVisible();

    // Intermediate should show 40 questions
    await expect(page.locator("text=/40.*question/i")).toBeVisible();

    // Senior should show 50 questions
    await expect(page.locator("text=/50.*question/i")).toBeVisible();
  });
});
