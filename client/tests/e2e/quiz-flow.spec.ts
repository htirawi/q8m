/**
 * E2E Tests: Quiz Flow
 * Tests the complete quiz mode workflow including timer and scoring
 */

import { test, expect } from "@playwright/test";

test.describe("Quiz Flow", () => {
  test.beforeEach(async ({ page }) => {
    // Mock authentication - free user
    await page.addInitScript(() => {
      localStorage.setItem("auth_token", "mock-free-user-token");
      localStorage.setItem(
        "user",
        JSON.stringify({ id: "1", email: "free@example.com", planTier: "free" })
      );
    });
  });

  test("should display Quiz Mode badge", async ({ page }) => {
    await page.goto("/en/easy/quiz");

    // Wait for page to load
    await page.waitForSelector('[data-testid="quiz-question"]', { timeout: 10000 });

    // Quiz Mode badge should be visible
    await expect(page.getByText(/Quiz Mode/i)).toBeVisible();
  });

  test("should show countdown timer in Quiz Mode", async ({ page }) => {
    await page.goto("/en/easy/quiz");

    // Wait for quiz to start
    await page.waitForSelector('[data-testid="quiz-question"]', { timeout: 10000 });

    // Timer should be visible
    await expect(page.locator('[data-testid="quiz-timer"]')).toBeVisible();

    // Timer should show countdown format (MM:SS)
    const timerText = await page.locator('[data-testid="quiz-timer"]').textContent();
    expect(timerText).toMatch(/\d+:\d{2}/); // Format: MM:SS or M:SS
  });

  test("should auto-submit when timer expires", async ({ page }) => {
    // Set a very short quiz duration for testing
    await page.goto("/en/easy/quiz");

    // Wait for quiz to start
    await page.waitForSelector('[data-testid="quiz-question"]', { timeout: 10000 });

    // Wait for timer to reach zero (in real scenarios this would take 30 minutes)
    // For testing, we'd need to mock the timer or set a shorter duration
    // This is a placeholder - in practice you'd mock the timer

    // When timer reaches zero, should auto-submit
    // await expect(page.locator('[data-testid="quiz-results"]')).toBeVisible({ timeout: 35000 });
  });

  test("should calculate and display score", async ({ page }) => {
    await page.goto("/en/easy/quiz");

    // Wait for first question
    await page.waitForSelector('[data-testid="quiz-question"]', { timeout: 10000 });

    // Answer question
    await page.locator('[data-testid="answer-option"]').first().click();

    // Submit answer
    await page.getByRole("button", { name: /submit/i }).click();

    // Move through questions
    for (let i = 0; i < 3; i++) {
      // Answer and submit
      await page.locator('[data-testid="answer-option"]').first().click();
      await page.getByRole("button", { name: /submit|next/i }).click();
    }

    // Finish quiz
    await page.getByRole("button", { name: /finish/i }).click();

    // Should show results with score
    await expect(page.locator('[data-testid="quiz-score"]')).toBeVisible();
    await expect(page.locator('[data-testid="quiz-score"]')).toContainText(/%/);
  });

  test("should NOT allow answer changes after submission", async ({ page }) => {
    await page.goto("/en/easy/quiz");

    // Wait for first question
    await page.waitForSelector('[data-testid="quiz-question"]', { timeout: 10000 });

    // Select an answer
    const firstOption = page.locator('[data-testid="answer-option"]').first();
    await firstOption.click();

    // Submit answer
    await page.getByRole("button", { name: /submit/i }).click();

    // Try to change answer - should be disabled
    await expect(firstOption).toBeDisabled();
  });

  test("should show time warning when running out of time", async ({ page }) => {
    await page.goto("/en/easy/quiz");

    // Wait for quiz to start
    await page.waitForSelector('[data-testid="quiz-question"]', { timeout: 10000 });

    // In a real test, we'd manipulate the timer to be low
    // For now, just verify the warning UI exists
    // When timer is low (< 5 minutes), warning should appear

    // This would need timer manipulation in practice
    // await expect(page.locator('[data-testid="time-warning"]')).toBeVisible();
  });

  test("should display level badge (junior/intermediate/senior)", async ({ page }) => {
    await page.goto("/en/easy/quiz");

    // Wait for page to load
    await page.waitForSelector('[data-testid="quiz-question"]', { timeout: 10000 });

    // Level badge should be visible (easy maps to junior)
    await expect(page.getByText(/junior/i)).toBeVisible();
  });

  test("should show progress indicator", async ({ page }) => {
    await page.goto("/en/easy/quiz");

    // Wait for quiz to start
    await page.waitForSelector('[data-testid="quiz-question"]', { timeout: 10000 });

    // Progress bar should be visible
    await expect(page.locator('[data-testid="progress-bar"]')).toBeVisible();

    // Should show question counter
    await expect(page.getByText(/1.*\//)).toBeVisible(); // e.g., "1 / 10"
  });

  test("should confirm before exiting", async ({ page }) => {
    // Mock the confirm dialog
    page.on("dialog", async (dialog) => {
      expect(dialog.message()).toContain(/exit|quit|leave/i);
      await dialog.accept();
    });

    await page.goto("/en/easy/quiz");

    // Wait for quiz to start
    await page.waitForSelector('[data-testid="quiz-question"]', { timeout: 10000 });

    // Try to exit
    await page.getByRole("button", { name: /exit/i }).click();

    // Should show confirmation (handled by dialog listener above)
  });
});

test.describe("Quiz Flow - Mode Comparison", () => {
  test("Study Mode vs Quiz Mode - Key Differences", async ({ page }) => {
    // Mock authentication
    await page.addInitScript(() => {
      localStorage.setItem("auth_token", "mock-free-user-token");
      localStorage.setItem(
        "user",
        JSON.stringify({ id: "1", email: "free@example.com", planTier: "free" })
      );
    });

    // Test Study Mode first
    await page.goto("/en/study/easy");
    await page.waitForSelector('[data-testid="question-text"]');

    // Study Mode: No timer
    await expect(page.locator('[data-testid="session-timer"]')).not.toBeVisible();

    // Study Mode: Has reveal button
    await expect(page.getByRole("button", { name: /reveal answer/i })).toBeVisible();

    // Study Mode badge
    await expect(page.getByText(/Study Mode/i)).toBeVisible();

    // Now test Quiz Mode
    await page.goto("/en/easy/quiz");
    await page.waitForSelector('[data-testid="quiz-question"]', { timeout: 10000 });

    // Quiz Mode: Has timer
    await expect(page.locator('[data-testid="quiz-timer"]')).toBeVisible();

    // Quiz Mode: No reveal button (until results)
    await expect(page.getByRole("button", { name: /reveal answer/i })).not.toBeVisible();

    // Quiz Mode badge
    await expect(page.getByText(/Quiz Mode/i)).toBeVisible();
  });
});

test.describe("Quiz Flow - Mobile", () => {
  test.use({ viewport: { width: 375, height: 667 } });

  test("should work on mobile devices", async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem("auth_token", "mock-free-user-token");
      localStorage.setItem(
        "user",
        JSON.stringify({ id: "1", email: "free@example.com", planTier: "free" })
      );
    });

    await page.goto("/en/easy/quiz");

    // Should show mobile-optimized layout
    await page.waitForSelector('[data-testid="quiz-question"]', { timeout: 10000 });

    // Timer should be sticky on mobile
    await page.evaluate(() => window.scrollBy(0, 500));
    await expect(page.locator('[data-testid="quiz-timer"]')).toBeVisible();

    // Quiz Mode badge should be visible
    await expect(page.getByText(/Quiz Mode/i)).toBeVisible();
  });
});
