/**
 * E2E Tests: Study Flow
 * Tests the complete study mode workflow including plan gating
 */

import { test, expect } from "@playwright/test";

test.describe("Study Flow", () => {
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

  test("should allow free users to access easy difficulty", async ({ page }) => {
    await page.goto("/en/study");

    // Wait for page to load
    await expect(page.locator("h1")).toContainText("Study Mode");

    // Click on easy difficulty card
    await page.getByRole("button", { name: /easy/i }).click();

    // Should navigate to study practice page
    await expect(page).toHaveURL(/\/study\/easy/);

    // Should see questions loaded
    await expect(page.locator('[data-testid="question-text"]')).toBeVisible();
  });

  test("should block free users from accessing medium difficulty", async ({ page }) => {
    await page.goto("/en/study");

    // Try to click medium difficulty
    await page.getByRole("button", { name: /medium/i }).click();

    // Should show upgrade modal or paywall
    await expect(page.locator('[data-testid="soft-paywall-modal"]')).toBeVisible();

    // Should suggest intermediate plan
    await expect(page.locator("text=/intermediate/i")).toBeVisible();
  });

  test("should block free users from accessing hard difficulty", async ({ page }) => {
    await page.goto("/en/study");

    // Try to click hard difficulty
    await page.getByRole("button", { name: /hard/i }).click();

    // Should show upgrade modal
    await expect(page.locator('[data-testid="soft-paywall-modal"]')).toBeVisible();

    // Should suggest advanced plan
    await expect(page.locator("text=/advanced/i")).toBeVisible();
  });

  test("should reveal answer when button clicked", async ({ page }) => {
    await page.goto("/en/study/easy");

    // Wait for question to load
    await page.waitForSelector('[data-testid="question-text"]');

    // Click reveal answer button
    await page.getByRole("button", { name: /reveal answer/i }).click();

    // Should show explanation
    await expect(page.locator('[data-testid="answer-explanation"]')).toBeVisible();
  });

  test("should navigate between questions", async ({ page }) => {
    await page.goto("/en/study/easy");

    // Wait for first question
    await page.waitForSelector('[data-testid="question-text"]');

    // Reveal answer
    await page.getByRole("button", { name: /reveal answer/i }).click();

    // Click next button
    await page.getByRole("button", { name: /next/i }).click();

    // Should show different question (check if question index changed)
    await expect(page.locator('[data-testid="question-index"]')).toContainText("2");
  });

  test("should bookmark questions", async ({ page }) => {
    await page.goto("/en/study/easy");

    // Wait for question
    await page.waitForSelector('[data-testid="question-text"]');

    // Reveal answer first
    await page.getByRole("button", { name: /reveal answer/i }).click();

    // Click bookmark button
    await page.getByRole("button", { name: /bookmark/i }).click();

    // Should show bookmarked state
    await expect(page.locator('[data-testid="bookmark-icon"]')).toHaveClass(/bookmarked/);
  });

  test("should display Study Mode badge", async ({ page }) => {
    await page.goto("/en/study/easy");

    // Wait for page to load
    await page.waitForSelector('[data-testid="question-text"]');

    // Study Mode badge should be visible
    await expect(page.getByText(/Study Mode/i)).toBeVisible();
  });

  test("should NOT show timer in Study Mode", async ({ page }) => {
    await page.goto("/en/study/easy");

    // Wait for page to load
    await page.waitForSelector('[data-testid="question-text"]');

    // Timer UI should NOT be visible in Study Mode
    await expect(page.locator('[data-testid="session-timer"]')).not.toBeVisible();

    // Pause/Resume buttons should NOT be visible
    await expect(page.getByRole("button", { name: /pause/i })).not.toBeVisible();
    await expect(page.getByRole("button", { name: /resume/i })).not.toBeVisible();
  });

  test("should switch practice modes", async ({ page }) => {
    await page.goto("/en/study/easy");

    // Click on practice mode dropdown
    await page.getByRole("button", { name: /sequential/i }).click();

    // Select random mode
    await page.getByRole("button", { name: /random/i }).click();

    // Should reload with random order
    await expect(page.getByRole("button", { name: /random/i })).toHaveClass(/active/);
  });

  test("should filter questions by type", async ({ page }) => {
    await page.goto("/en/study/easy");

    // Open filters
    await page.getByRole("button", { name: /filters/i }).click();

    // Select multiple choice only
    await page.getByRole("combobox", { name: /question type/i }).selectOption("multiple-choice");

    // Questions should be filtered
    await expect(page.locator('[data-testid="results-count"]')).toContainText(/filtered/i);
  });

  test("should search questions", async ({ page }) => {
    await page.goto("/en/study/easy");

    // Type in search box
    await page.getByPlaceholder(/search/i).fill("react hooks");

    // Results should update
    await expect(page.locator('[data-testid="question-text"]')).toContainText(/hook/i);
  });

  test("should respect keyboard shortcuts", async ({ page }) => {
    await page.goto("/en/study/easy");

    // Wait for question
    await page.waitForSelector('[data-testid="question-text"]');

    // Press Space to reveal answer
    await page.keyboard.press("Space");

    // Should show answer
    await expect(page.locator('[data-testid="answer-explanation"]')).toBeVisible();

    // Press Space again to go to next question
    await page.keyboard.press("Space");

    // Should move to next question
    await expect(page.locator('[data-testid="question-index"]')).toContainText("2");
  });

  test("should persist session state on reload", async ({ page }) => {
    await page.goto("/en/study/easy");

    // Wait for questions to load
    await page.waitForSelector('[data-testid="question-text"]');

    // Navigate to question 3
    await page.getByRole("button", { name: /reveal answer/i }).click();
    await page.getByRole("button", { name: /next/i }).click();
    await page.getByRole("button", { name: /reveal answer/i }).click();
    await page.getByRole("button", { name: /next/i }).click();

    // Reload page
    await page.reload();

    // Should resume at question 3 (or offer to resume)
    const questionIndex = await page.locator('[data-testid="question-index"]').textContent();
    expect(questionIndex).toContain("3");
  });
});

test.describe("Study Flow - Authenticated Users", () => {
  test.beforeEach(async ({ page }) => {
    // Mock authentication - intermediate user
    await page.addInitScript(() => {
      localStorage.setItem("auth_token", "mock-intermediate-user-token");
      localStorage.setItem(
        "user",
        JSON.stringify({ id: "2", email: "intermediate@example.com", planTier: "intermediate" })
      );
    });
  });

  test("should allow intermediate users to access medium difficulty", async ({ page }) => {
    await page.goto("/en/study");

    // Click medium difficulty
    await page.getByRole("button", { name: /medium/i }).click();

    // Should navigate without paywall
    await expect(page).toHaveURL(/\/study\/medium/);

    // Should see questions
    await expect(page.locator('[data-testid="question-text"]')).toBeVisible();
  });

  test("should block intermediate users from hard difficulty", async ({ page }) => {
    await page.goto("/en/study");

    // Try hard difficulty
    await page.getByRole("button", { name: /hard/i }).click();

    // Should show paywall
    await expect(page.locator('[data-testid="soft-paywall-modal"]')).toBeVisible();
  });
});

test.describe("Study Flow - Mobile", () => {
  test.use({ viewport: { width: 375, height: 667 } });

  test("should work on mobile devices", async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem("auth_token", "mock-free-user-token");
      localStorage.setItem(
        "user",
        JSON.stringify({ id: "1", email: "free@example.com", planTier: "free" })
      );
    });

    await page.goto("/en/study/easy");

    // Should show mobile-optimized layout
    await expect(page.locator('[data-testid="question-text"]')).toBeVisible();

    // Study Mode badge should be visible on mobile
    await expect(page.getByText(/Study Mode/i)).toBeVisible();
  });

  test("should support swipe gestures", async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem("auth_token", "mock-free-user-token");
      localStorage.setItem(
        "user",
        JSON.stringify({ id: "1", email: "free@example.com", planTier: "free" })
      );
    });

    await page.goto("/en/study/easy");

    // Reveal answer
    await page.getByRole("button", { name: /reveal answer/i }).click();

    // Simulate swipe left (next question)
    const questionCard = page.locator('[data-testid="question-card"]');
    await questionCard.dispatchEvent("touchstart", { touches: [{ clientX: 300, clientY: 100 }] });
    await questionCard.dispatchEvent("touchend", {
      changedTouches: [{ clientX: 50, clientY: 100 }],
    });

    // Should move to next question
    await expect(page.locator('[data-testid="question-index"]')).toContainText("2");
  });
});
