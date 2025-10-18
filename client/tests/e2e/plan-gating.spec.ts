/**
 * E2E Tests: Plan Gating
 * Tests server-side plan enforcement and upgrade flows
 */

import { test, expect } from "@playwright/test";

test.describe("Plan Gating - Backend Enforcement", () => {
  test("should enforce plan requirements at API level", async ({ page, request }) => {
    // Mock free user authentication
    await page.addInitScript(() => {
      localStorage.setItem("auth_token", "mock-free-user-token");
      localStorage.setItem(
        "user",
        JSON.stringify({ id: "1", email: "free@example.com", planTier: "free" })
      );
    });

    // Try to access medium difficulty questions via API
    const response = await request.get("/api/questions?difficulty=medium", {
      headers: {
        Cookie: "auth_token=mock-free-user-token",
      },
    });

    // Should return 403 Forbidden
    expect(response.status()).toBe(403);

    const body = await response.json();
    expect(body.code).toBe(403);
    expect(body.error).toBe("Forbidden");
    expect(body.requiredPlan).toBe("intermediate");
    expect(body.suggestedPlan).toBe("intermediate");
    expect(body.upgradeUrl).toContain("/pricing");
  });

  test("should allow access with correct plan tier", async ({ page, request }) => {
    // Mock intermediate user
    await page.addInitScript(() => {
      localStorage.setItem("auth_token", "mock-intermediate-user-token");
      localStorage.setItem(
        "user",
        JSON.stringify({ id: "2", email: "intermediate@example.com", planTier: "intermediate" })
      );
    });

    // Try to access medium difficulty questions
    const response = await request.get("/api/questions?difficulty=medium", {
      headers: {
        Cookie: "auth_token=mock-intermediate-user-token",
      },
    });

    // Should return 200 OK
    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body.questions).toBeDefined();
    expect(Array.isArray(body.questions)).toBe(true);
  });

  test("should handle missing authentication", async ({ request }) => {
    // Try to access questions without authentication
    const response = await request.get("/api/questions?difficulty=medium");

    // Should return 401 Unauthorized or 403 Forbidden
    expect([401, 403]).toContain(response.status());
  });

  test("should apply rate limiting", async ({ request }) => {
    // Make many requests quickly
    const requests = Array.from({ length: 150 }, () =>
      request.get("/api/questions?difficulty=easy", {
        headers: {
          Cookie: "auth_token=mock-free-user-token",
        },
      })
    );

    const responses = await Promise.all(requests);

    // Some should be rate limited (429 Too Many Requests)
    const rateLimitedResponses = responses.filter((r) => r.status() === 429);
    expect(rateLimitedResponses.length).toBeGreaterThan(0);
  });
});

test.describe("Plan Gating - UI Flow", () => {
  test.beforeEach(async ({ page }) => {
    // Mock free user
    await page.addInitScript(() => {
      localStorage.setItem("auth_token", "mock-free-user-token");
      localStorage.setItem(
        "user",
        JSON.stringify({ id: "1", email: "free@example.com", planTier: "free" })
      );
    });
  });

  test("should show paywall when accessing locked content", async ({ page }) => {
    await page.goto("/en/study");

    // Try to access medium difficulty
    await page.getByRole("button", { name: /medium/i }).click();

    // Should show soft paywall modal
    await expect(page.locator('[data-testid="soft-paywall-modal"]')).toBeVisible();

    // Should display recommended plan
    await expect(page.locator("text=/upgrade to intermediate/i")).toBeVisible();

    // Should have upgrade button
    await expect(page.getByRole("button", { name: /upgrade/i })).toBeVisible();
  });

  test("should redirect to pricing page on upgrade click", async ({ page }) => {
    await page.goto("/en/study");

    // Click medium difficulty
    await page.getByRole("button", { name: /medium/i }).click();

    // Wait for paywall
    await page.waitForSelector('[data-testid="soft-paywall-modal"]');

    // Click upgrade button
    await page.getByRole("button", { name: /upgrade/i }).click();

    // Should navigate to pricing page with plan parameter
    await expect(page).toHaveURL(/\/pricing\?plan=intermediate/);
  });

  test("should dismiss paywall and return to selection", async ({ page }) => {
    await page.goto("/en/study");

    // Click medium difficulty
    await page.getByRole("button", { name: /medium/i }).click();

    // Wait for paywall
    await page.waitForSelector('[data-testid="soft-paywall-modal"]');

    // Click "Maybe Later" or close button
    await page.getByRole("button", { name: /maybe later|dismiss/i }).click();

    // Should stay on study selection page
    await expect(page).toHaveURL(/\/study$/);

    // Modal should be hidden
    await expect(page.locator('[data-testid="soft-paywall-modal"]')).not.toBeVisible();
  });

  test("should show different plans for different content", async ({ page }) => {
    await page.goto("/en/study");

    // Medium difficulty should suggest intermediate
    await page.getByRole("button", { name: /medium/i }).click();
    await page.waitForSelector('[data-testid="soft-paywall-modal"]');
    await expect(page.locator("text=/intermediate/i")).toBeVisible();
    await page.getByRole("button", { name: /close|dismiss/i }).click();

    // Hard difficulty should suggest advanced
    await page.getByRole("button", { name: /hard/i }).click();
    await page.waitForSelector('[data-testid="soft-paywall-modal"]');
    await expect(page.locator("text=/advanced/i")).toBeVisible();
  });

  test("should track analytics when paywall is shown", async ({ page }) => {
    // Mock analytics
    const analyticsEvents: unknown[] = [];
    await page.exposeFunction("captureAnalytics", (event: unknown) => {
      analyticsEvents.push(event);
    });

    await page.addInitScript(() => {
      (window as Window & { gtag?: (...args: unknown[]) => void }).gtag = function (
        ...args: unknown[]
      ) {
        (window as Window & { captureAnalytics?: (event: unknown) => void }).captureAnalytics?.(
          args
        );
      };
    });

    await page.goto("/en/study");

    // Trigger paywall
    await page.getByRole("button", { name: /medium/i }).click();
    await page.waitForSelector('[data-testid="soft-paywall-modal"]');

    // Should track paywall shown event
    expect(analyticsEvents.length).toBeGreaterThan(0);

    const paywallEvent = analyticsEvents.find(
      (e: unknown) => Array.isArray(e) && e[0] === "event" && e[1] === "study_gate_shown"
    );
    expect(paywallEvent).toBeDefined();
  });
});

test.describe("Plan Gating - Direct URL Access", () => {
  test("should block direct URL access to locked content", async ({ page }) => {
    // Mock free user
    await page.addInitScript(() => {
      localStorage.setItem("auth_token", "mock-free-user-token");
      localStorage.setItem(
        "user",
        JSON.stringify({ id: "1", email: "free@example.com", planTier: "free" })
      );
    });

    // Try to directly navigate to medium difficulty
    await page.goto("/en/study/medium");

    // Should show paywall or redirect
    await expect(
      page
        .locator('[data-testid="soft-paywall-modal"]')
        .or(page.locator("text=/upgrade required/i"))
    ).toBeVisible();
  });

  test("should allow direct URL access to accessible content", async ({ page }) => {
    // Mock free user
    await page.addInitScript(() => {
      localStorage.setItem("auth_token", "mock-free-user-token");
      localStorage.setItem(
        "user",
        JSON.stringify({ id: "1", email: "free@example.com", planTier: "free" })
      );
    });

    // Navigate directly to easy difficulty
    await page.goto("/en/study/easy");

    // Should load questions without paywall
    await expect(page.locator('[data-testid="question-text"]')).toBeVisible();
    await expect(page.locator('[data-testid="soft-paywall-modal"]')).not.toBeVisible();
  });

  test("should handle deep links with query parameters", async ({ page }) => {
    // Mock free user
    await page.addInitScript(() => {
      localStorage.setItem("auth_token", "mock-free-user-token");
      localStorage.setItem(
        "user",
        JSON.stringify({ id: "1", email: "free@example.com", planTier: "free" })
      );
    });

    // Try deep link to medium difficulty with question index
    await page.goto("/en/study/medium?index=5");

    // Should show paywall
    await expect(page.locator('[data-testid="soft-paywall-modal"]')).toBeVisible();

    // After upgrade or dismissal, should remember the intent
    // (This would be tested in integration with authentication flow)
  });
});

test.describe("Plan Gating - Quiz Mode", () => {
  test("should enforce plan requirements for quiz levels", async ({ page, request }) => {
    // Mock free user
    await page.addInitScript(() => {
      localStorage.setItem("auth_token", "mock-free-user-token");
      localStorage.setItem(
        "user",
        JSON.stringify({ id: "1", email: "free@example.com", planTier: "free" })
      );
    });

    // Try to access intermediate quiz via API
    const response = await request.get("/api/questions?level=intermediate&limit=20", {
      headers: {
        Cookie: "auth_token=mock-free-user-token",
      },
    });

    // Should return 403
    expect(response.status()).toBe(403);

    const body = await response.json();
    expect(body.requiredPlan).toBe("intermediate");
  });

  test("should allow quiz access for correct plan", async ({ page }) => {
    // Mock intermediate user
    await page.addInitScript(() => {
      localStorage.setItem("auth_token", "mock-intermediate-user-token");
      localStorage.setItem(
        "user",
        JSON.stringify({ id: "2", email: "intermediate@example.com", planTier: "intermediate" })
      );
    });

    await page.goto("/en/quiz");

    // Click intermediate level
    await page.getByRole("button", { name: /intermediate/i }).click();

    // Should start quiz without paywall
    await expect(page).toHaveURL(/\/quiz\/intermediate/);
    await expect(page.locator('[data-testid="quiz-question"]')).toBeVisible();
  });
});

test.describe("Plan Gating - Upgrade Flow", () => {
  test("should complete full upgrade journey", async ({ page }) => {
    // Start as free user
    await page.addInitScript(() => {
      localStorage.setItem("auth_token", "mock-free-user-token");
      localStorage.setItem(
        "user",
        JSON.stringify({ id: "1", email: "free@example.com", planTier: "free" })
      );
    });

    // Try to access medium difficulty
    await page.goto("/en/study");
    await page.getByRole("button", { name: /medium/i }).click();

    // Click upgrade on paywall
    await page.waitForSelector('[data-testid="soft-paywall-modal"]');
    await page.getByRole("button", { name: /upgrade/i }).click();

    // Should be on pricing page
    await expect(page).toHaveURL(/\/pricing/);

    // Select intermediate plan
    await page.getByRole("button", { name: /select.*intermediate/i }).click();

    // Should show checkout or payment form
    await expect(
      page.locator('[data-testid="checkout-form"]').or(page.locator("text=/payment/i"))
    ).toBeVisible();
  });
});
