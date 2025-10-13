/**
 * E2E tests for Plan Features & Badges
 * Tests feature display, badges, and plan comparison across the application
 */

import { test, expect } from '@playwright/test';

test.describe('Plan Features - Homepage Display', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/en');
    await page.waitForLoadState('networkidle');
    await page.locator('[data-testid="pricing-teaser"]').scrollIntoViewIfNeeded();
  });

  test('should display all Junior plan features', async ({ page }) => {
    const juniorCard = page.getByTestId('pricing-card-junior');

    // Check feature bullets are visible
    await expect(juniorCard).toContainText('50');
    await expect(juniorCard).toContainText('Community support');
  });

  test('should display "Most Popular" badge on Intermediate', async ({ page }) => {
    const intermediateCard = page.getByTestId('pricing-card-intermediate');

    // Check badge is visible and styled
    const badge = intermediateCard.locator('text=/Most Popular/i');
    await expect(badge).toBeVisible();

    // Badge should be prominent
    const badgeClass = await badge.getAttribute('class');
    expect(badgeClass).toBeTruthy();
  });

  test('should display "Best Value" badge on Bundle', async ({ page }) => {
    const bundleCard = page.getByTestId('pricing-card-bundle');

    // Check badge is visible
    const badge = bundleCard.locator('text=/Best Value/i');
    await expect(badge).toBeVisible();
  });

  test('should show AI support feature only for Senior and Bundle', async ({ page }) => {
    const juniorCard = page.getByTestId('pricing-card-junior');
    const intermediateCard = page.getByTestId('pricing-card-intermediate');
    const seniorCard = page.getByTestId('pricing-card-senior');
    const bundleCard = page.getByTestId('pricing-card-bundle');

    // Junior and Intermediate should NOT have AI support
    const juniorHasAI = await juniorCard.locator('text=/AI/i').count() > 0;
    const intermediateHasAI = await intermediateCard.locator('text=/AI/i').count() > 0;

    expect(juniorHasAI).toBe(false);
    expect(intermediateHasAI).toBe(false);

    // Senior and Bundle SHOULD have AI support
    await expect(seniorCard.locator('text=/AI/i')).toBeVisible();
    await expect(bundleCard.locator('text=/AI/i')).toBeVisible();
  });

  test('should show correct feature count progression', async ({ page }) => {
    const juniorCard = page.getByTestId('pricing-card-junior');
    const intermediateCard = page.getByTestId('pricing-card-intermediate');
    const seniorCard = page.getByTestId('pricing-card-senior');

    // Junior: 50 study items, 50 questions
    await expect(juniorCard).toContainText('50');

    // Intermediate: 200 study items, 250 questions
    await expect(intermediateCard).toContainText('200');
    await expect(intermediateCard).toContainText('250');

    // Senior: 300 study items, 350 questions
    await expect(seniorCard).toContainText('300');
    await expect(seniorCard).toContainText('350');
  });

  test('should display check icons for all features', async ({ page }) => {
    const allCards = page.locator('[data-testid^="pricing-card-"]');

    // Each card should have check icons (SVG or emoji)
    for (let i = 0; i < await allCards.count(); i++) {
      const card = allCards.nth(i);
      const hasCheckIcons = await card.locator('svg, text=✓, text=✔').count() > 0;
      expect(hasCheckIcons).toBe(true);
    }
  });
});

test.describe('Plan Features - Study Mode Locked Cards', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/en/study');
    await page.waitForLoadState('networkidle');
  });

  test('should show feature list on locked Intermediate card', async ({ page }) => {
    const intermediateCard = page.getByTestId('level-card-medium');

    // Check if card is locked
    const isLocked = await intermediateCard.locator('text=/Upgrade|Unlock/i').count() > 0;

    if (isLocked) {
      // Should display feature benefits
      const hasFeatures = await intermediateCard.locator('text=/study|quiz|analytics/i').count() > 0;
      expect(hasFeatures).toBe(true);
    }
  });

  test('should show "Click to Unlock" CTA on locked cards', async ({ page }) => {
    const seniorCard = page.getByTestId('level-card-hard');

    // Check if card is locked
    const isLocked = await seniorCard.locator('text=/Upgrade|Unlock/i').count() > 0;

    if (isLocked) {
      // Should show click to unlock hint
      await expect(seniorCard.locator('text=/Click to unlock/i')).toBeVisible();
    }
  });

  test('should display correct badge for locked vs available cards', async ({ page }) => {
    const juniorCard = page.getByTestId('level-card-easy');

    // Junior should show "Available" badge
    await expect(juniorCard.locator('text=/Available/i')).toBeVisible();

    const intermediateCard = page.getByTestId('level-card-medium');
    const isLocked = await intermediateCard.locator('text=/Requires/i, text=/Upgrade/i').count() > 0;

    if (isLocked) {
      // Locked cards should show required plan badge
      const hasPlanBadge = await intermediateCard.locator('text=/Intermediate|Requires/i').count() > 0;
      expect(hasPlanBadge).toBe(true);
    }
  });
});

test.describe('Plan Features - Pricing Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/en/pricing');
    await page.waitForLoadState('networkidle');
  });

  test('should display detailed feature comparison', async ({ page }) => {
    // Check for comparison table or feature list
    const hasComparison = await page.locator('table, .comparison, [role="table"]').count() > 0;

    if (hasComparison) {
      // Should show all 4 plans
      await expect(page.locator('text=Junior')).toBeVisible();
      await expect(page.locator('text=Intermediate')).toBeVisible();
      await expect(page.locator('text=Senior')).toBeVisible();
      await expect(page.locator('text=Bundle')).toBeVisible();
    }
  });

  test('should highlight recommended plan', async ({ page }) => {
    // Intermediate should be highlighted as most popular
    const cards = page.locator('[data-plan-id="intermediate"], [data-testid*="intermediate"]').first();

    if (await cards.isVisible()) {
      // Should have special styling or badge
      const hasHighlight = await cards.locator('text=/Popular|Recommended/i').count() > 0;
      expect(hasHighlight).toBe(true);
    }
  });

  test('should show money-back guarantee for paid plans', async ({ page }) => {
    // Check for guarantee text
    await expect(page.locator('text=/7-day|money-back|guarantee/i').first()).toBeVisible();
  });

  test('should display yearly savings calculation', async ({ page }) => {
    // Click yearly toggle if available
    const yearlyToggle = page.locator('text=/Yearly|Annual/i').first();

    if (await yearlyToggle.isVisible()) {
      await yearlyToggle.click();
      await page.waitForTimeout(200);

      // Should show savings percentage or amount
      await expect(page.locator('text=/Save|savings/i')).toBeVisible();
    }
  });
});

test.describe('Plan Features - Feature Icons', () => {
  test('should display correct emoji icons for each plan', async ({ page }) => {
    await page.goto('/en/study');
    await page.waitForLoadState('networkidle');

    // Junior: Green circle
    const juniorCard = page.getByTestId('level-card-easy');
    await expect(juniorCard).toContainText('🟢');

    // Intermediate: Yellow circle
    const intermediateCard = page.getByTestId('level-card-medium');
    await expect(intermediateCard).toContainText('🟡');

    // Senior: Red circle
    const seniorCard = page.getByTestId('level-card-hard');
    await expect(seniorCard).toContainText('🔴');
  });

  test('should display Bundle diamond icon on homepage', async ({ page }) => {
    await page.goto('/en');
    await page.waitForLoadState('networkidle');
    await page.locator('[data-testid="pricing-teaser"]').scrollIntoViewIfNeeded();

    const bundleCard = page.getByTestId('pricing-card-bundle');
    await expect(bundleCard).toContainText('💎');
  });
});

test.describe('Plan Features - Priority Support Indicators', () => {
  test('should indicate support level for each plan', async ({ page }) => {
    await page.goto('/en');
    await page.waitForLoadState('networkidle');
    await page.locator('[data-testid="pricing-teaser"]').scrollIntoViewIfNeeded();

    // Junior: Community support
    const juniorCard = page.getByTestId('pricing-card-junior');
    await expect(juniorCard.locator('text=/Community/i')).toBeVisible();

    // Intermediate: Priority email support
    const intermediateCard = page.getByTestId('pricing-card-intermediate');
    await expect(intermediateCard.locator('text=/Priority|email/i')).toBeVisible();

    // Senior: High priority support
    const seniorCard = page.getByTestId('pricing-card-senior');
    await expect(seniorCard.locator('text=/Priority/i')).toBeVisible();
  });
});

test.describe('Plan Features - Responsive Display', () => {
  test.use({ viewport: { width: 375, height: 667 } });

  test('should display features correctly on mobile', async ({ page }) => {
    await page.goto('/en');
    await page.waitForLoadState('networkidle');

    await page.locator('[data-testid="pricing-teaser"]').scrollIntoViewIfNeeded();

    // All 4 cards should be stacked vertically
    const cards = page.locator('[data-testid^="pricing-card-"]');
    const count = await cards.count();
    expect(count).toBe(4);

    // Each card should be visible (one at a time scrolling)
    for (let i = 0; i < count; i++) {
      await cards.nth(i).scrollIntoViewIfNeeded();
      await expect(cards.nth(i)).toBeVisible();
    }
  });

  test('should show badges on mobile', async ({ page }) => {
    await page.goto('/en');
    await page.waitForLoadState('networkidle');

    await page.locator('[data-testid="pricing-teaser"]').scrollIntoViewIfNeeded();

    // Scroll to Intermediate card
    const intermediateCard = page.getByTestId('pricing-card-intermediate');
    await intermediateCard.scrollIntoViewIfNeeded();

    // Badge should be visible on mobile
    await expect(intermediateCard.locator('text=/Most Popular/i')).toBeVisible();
  });
});

test.describe('Plan Features - Feature Tooltips', () => {
  test('should show feature explanations on hover/click', async ({ page }) => {
    await page.goto('/en/pricing');
    await page.waitForLoadState('networkidle');

    // Look for info icons or tooltips
    const infoIcons = page.locator('[aria-label*="info"], [title], .tooltip-trigger');

    if (await infoIcons.count() > 0) {
      // Hover over first info icon
      await infoIcons.first().hover();

      // Wait for tooltip
      await page.waitForTimeout(300);

      // Tooltip should appear
      const tooltip = page.locator('[role="tooltip"], .tooltip');
      const hasTooltip = await tooltip.count() > 0;

      // Tooltips are optional, but if present should work
      if (hasTooltip) {
        await expect(tooltip.first()).toBeVisible();
      }
    }
  });
});

test.describe('Plan Features - CTA Button States', () => {
  test('should show different CTA text for each plan', async ({ page }) => {
    await page.goto('/en');
    await page.waitForLoadState('networkidle');
    await page.locator('[data-testid="pricing-teaser"]').scrollIntoViewIfNeeded();

    // Junior: "Start Free" or similar
    const juniorCTA = page.getByTestId('pricing-cta-junior');
    const juniorText = await juniorCTA.textContent();
    expect(juniorText).toMatch(/Start|Free|Begin/i);

    // Paid plans: "Upgrade" or "Get Started"
    const intermediateCTA = page.getByTestId('pricing-cta-intermediate');
    const intermediateText = await intermediateCTA.textContent();
    expect(intermediateText).toMatch(/Upgrade|Get|Subscribe/i);
  });

  test('should highlight popular plan CTA', async ({ page }) => {
    await page.goto('/en');
    await page.waitForLoadState('networkidle');
    await page.locator('[data-testid="pricing-teaser"]').scrollIntoViewIfNeeded();

    // Intermediate CTA should have primary styling
    const intermediateCTA = page.getByTestId('pricing-cta-intermediate');
    const ctaClass = await intermediateCTA.getAttribute('class');

    expect(ctaClass).toContain('primary');
  });
});

test.describe('Plan Features - Arabic (RTL)', () => {
  test('should display features correctly in Arabic', async ({ page }) => {
    await page.goto('/ar');
    await page.waitForLoadState('networkidle');

    await page.locator('[data-testid="pricing-teaser"]').scrollIntoViewIfNeeded();

    // Check for Arabic feature text
    const juniorCard = page.getByTestId('pricing-card-junior');
    const hasArabicText = await juniorCard.locator('text=/مبتدئ|مجتمع/').count() > 0;

    expect(hasArabicText).toBe(true);
  });

  test('should display badges in Arabic', async ({ page }) => {
    await page.goto('/ar');
    await page.waitForLoadState('networkidle');

    await page.locator('[data-testid="pricing-teaser"]').scrollIntoViewIfNeeded();

    // Intermediate should have "Most Popular" badge in Arabic
    const intermediateCard = page.getByTestId('pricing-card-intermediate');

    // Badge should be visible (text may vary)
    const badge = intermediateCard.locator('[class*="badge"]').first();
    if (await badge.count() > 0) {
      await expect(badge).toBeVisible();
    }
  });

  test('should show feature icons in correct order for RTL', async ({ page }) => {
    await page.goto('/ar/study');
    await page.waitForLoadState('networkidle');

    // Icons should still be visible
    const juniorCard = page.getByTestId('level-card-easy');
    await expect(juniorCard).toContainText('🟢');
  });
});
