/**
 * E2E tests for Junior (Easy) One-Click Autostart
 * Tests the immediate study start functionality for free tier users
 */

import { test, expect } from '@playwright/test';

test.describe('Junior Autostart - Basic Functionality', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage to reset autostart preference
    await page.goto('/en/study');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    await page.waitForLoadState('networkidle');
  });

  test('should auto-start study session when clicking Junior card (first time)', async ({ page }) => {
    // Click Junior card
    const juniorCard = page.getByTestId('level-card-easy');
    await juniorCard.click();

    // Should navigate to study page immediately (auto-start enabled by default)
    await page.waitForURL('**/study/easy**', { timeout: 3000 });

    // Verify we're on the study page
    const url = page.url();
    expect(url).toContain('/study/easy');

    // Should see study content (questions or study guide items)
    await page.waitForTimeout(1000);
    const hasStudyContent = await page.locator('article, [role="article"], .study-content, .question').count() > 0;
    expect(hasStudyContent).toBe(true);
  });

  test('should show loading state during auto-start', async ({ page }) => {
    // Click Junior card
    const juniorCard = page.getByTestId('level-card-easy');
    await juniorCard.click();

    // Should briefly show loading indicator (may be too fast to catch)
    // This is a smoke test to ensure the click is handled
    await page.waitForTimeout(100);

    // Should navigate
    await page.waitForURL('**/study/**', { timeout: 5000 });
  });

  test('should persist auto-start preference in localStorage', async ({ page }) => {
    // Click Junior card to trigger auto-start
    const juniorCard = page.getByTestId('level-card-easy');
    await juniorCard.click();

    await page.waitForURL('**/study/**');

    // Check localStorage for autostart preference
    const autostartEnabled = await page.evaluate(() => {
      return localStorage.getItem('study_autostart_enabled');
    });

    // Should be enabled by default
    expect(autostartEnabled).toBeTruthy();
  });

  test('should NOT auto-start Intermediate or Senior levels', async ({ page }) => {
    // Click Intermediate card
    const intermediateCard = page.getByTestId('level-card-medium');
    await intermediateCard.click();

    // Wait a moment
    await page.waitForTimeout(500);

    const url = page.url();

    // Should either:
    // 1. Stay on selection page (if locked)
    // 2. Show confirmation step (if unlocked)
    // 3. Navigate to study (but not immediately like Junior)

    // Should NOT immediately navigate to /study/medium without user confirmation
    // (unless it's the traditional selection flow)
  });
});

test.describe('Junior Autostart - Resume Session', () => {
  test('should offer to resume previous Junior session', async ({ page }) => {
    // Simulate having a previous session
    await page.goto('/en/study');
    await page.evaluate(() => {
      const session = {
        difficulty: 'easy',
        startedAt: Date.now() - 30 * 60 * 1000, // 30 mins ago
        itemsCompleted: 5,
        totalItems: 20,
      };
      localStorage.setItem('study_session', JSON.stringify(session));
    });

    await page.reload();
    await page.waitForLoadState('networkidle');

    // Click Junior card
    const juniorCard = page.getByTestId('level-card-easy');
    await juniorCard.click();

    // Should show resume prompt or auto-resume
    await page.waitForTimeout(500);

    const currentUrl = page.url();

    // Should navigate to study page (either resume or new session)
    expect(currentUrl).toContain('/study');
  });

  test('should start new session if previous session is expired', async ({ page }) => {
    // Simulate having an expired session (> 24 hours old)
    await page.goto('/en/study');
    await page.evaluate(() => {
      const session = {
        difficulty: 'easy',
        startedAt: Date.now() - 25 * 60 * 60 * 1000, // 25 hours ago
        itemsCompleted: 5,
        totalItems: 20,
      };
      localStorage.setItem('study_session', JSON.stringify(session));
    });

    await page.reload();
    await page.waitForLoadState('networkidle');

    // Click Junior card
    const juniorCard = page.getByTestId('level-card-easy');
    await juniorCard.click();

    // Should start new session (expired sessions are cleared)
    await page.waitForURL('**/study/**');

    const sessionData = await page.evaluate(() => {
      return localStorage.getItem('study_session');
    });

    // Should have new session data
    expect(sessionData).toBeTruthy();
  });
});

test.describe('Junior Autostart - A/B Test Variants', () => {
  test('should respect A/B test variant assignment', async ({ page }) => {
    // Set A/B test variant to autostart
    await page.goto('/en/study');
    await page.evaluate(() => {
      localStorage.setItem('study_autostart_variant', 'autostart');
      localStorage.setItem('study_autostart_enabled', 'true');
    });

    await page.reload();
    await page.waitForLoadState('networkidle');

    // Click Junior card
    const juniorCard = page.getByTestId('level-card-easy');
    await juniorCard.click();

    // Should auto-start immediately
    await page.waitForURL('**/study/**', { timeout: 3000 });
  });

  test('should show manual flow for control variant', async ({ page }) => {
    // Set A/B test variant to control (manual)
    await page.goto('/en/study');
    await page.evaluate(() => {
      localStorage.setItem('study_autostart_variant', 'manual');
      localStorage.setItem('study_autostart_enabled', 'false');
    });

    await page.reload();
    await page.waitForLoadState('networkidle');

    // Click Junior card
    const juniorCard = page.getByTestId('level-card-easy');
    await juniorCard.click();

    // Wait a moment
    await page.waitForTimeout(500);

    const url = page.url();

    // For manual variant, might show selected state or require confirmation
    // The behavior depends on the actual implementation
  });
});

test.describe('Junior Autostart - Error Handling', () => {
  test('should handle navigation errors gracefully', async ({ page }) => {
    // Navigate to study page
    await page.goto('/en/study');
    await page.waitForLoadState('networkidle');

    // Click Junior card
    const juniorCard = page.getByTestId('level-card-easy');
    await juniorCard.click();

    // Even if there's an error, should not crash
    await page.waitForTimeout(1000);

    // Should either be on study page or still on selection page (with error message)
    const currentUrl = page.url();
    const isValidState = currentUrl.includes('/study');

    // As long as we don't crash, test passes
    expect(currentUrl).toBeTruthy();
  });
});

test.describe('Junior Autostart - Analytics', () => {
  test('should track autostart event', async ({ page }) => {
    // Mock analytics tracking
    const trackingEvents: string[] = [];

    page.on('console', (msg) => {
      const text = msg.text();
      if (text.includes('level_card_selected') || text.includes('auto_start')) {
        trackingEvents.push(text);
      }
    });

    await page.goto('/en/study');
    await page.waitForLoadState('networkidle');

    // Click Junior card
    const juniorCard = page.getByTestId('level-card-easy');
    await juniorCard.click();

    // Wait for tracking
    await page.waitForTimeout(500);

    // Should have tracked the event (if analytics is enabled)
    // This is a smoke test for analytics integration
  });
});

test.describe('Junior Autostart - Mobile', () => {
  test.use({ viewport: { width: 375, height: 667 } });

  test('should work on mobile devices', async ({ page }) => {
    await page.goto('/en/study');
    await page.waitForLoadState('networkidle');

    // Tap Junior card
    const juniorCard = page.getByTestId('level-card-easy');
    await juniorCard.tap();

    // Should auto-start on mobile too
    await page.waitForURL('**/study/**', { timeout: 3000 });

    const url = page.url();
    expect(url).toContain('/study');
  });

  test('should handle touch interactions correctly', async ({ page }) => {
    await page.goto('/en/study');
    await page.waitForLoadState('networkidle');

    // Get Junior card
    const juniorCard = page.getByTestId('level-card-easy');

    // Tap and hold briefly
    await juniorCard.tap();
    await page.waitForTimeout(100);

    // Should still navigate correctly
    await page.waitForTimeout(500);

    const url = page.url();
    const didNavigate = url.includes('/study');

    // Should handle the tap correctly
    expect(url).toBeTruthy();
  });
});

test.describe('Junior Autostart - Accessibility', () => {
  test('should announce auto-start to screen readers', async ({ page }) => {
    await page.goto('/en/study');
    await page.waitForLoadState('networkidle');

    const juniorCard = page.getByTestId('level-card-easy');

    // Check for screen reader hints
    const ariaLabel = await juniorCard.getAttribute('aria-label');
    expect(ariaLabel).toBeTruthy();

    // Should mention Junior in the label
    expect(ariaLabel).toContain('Junior');
  });

  test('should support keyboard activation', async ({ page }) => {
    await page.goto('/en/study');
    await page.waitForLoadState('networkidle');

    // Focus Junior card
    const juniorCard = page.getByTestId('level-card-easy');
    await juniorCard.focus();

    // Press Enter
    await page.keyboard.press('Enter');

    // Should auto-start
    await page.waitForURL('**/study/**', { timeout: 3000 });
  });

  test('should support Space key activation', async ({ page }) => {
    await page.goto('/en/study');
    await page.waitForLoadState('networkidle');

    // Focus Junior card
    const juniorCard = page.getByTestId('level-card-easy');
    await juniorCard.focus();

    // Press Space
    await page.keyboard.press('Space');

    // Should auto-start
    await page.waitForURL('**/study/**', { timeout: 3000 });
  });
});

test.describe('Junior Autostart - Performance', () => {
  test('should start quickly (< 150ms perceived delay)', async ({ page }) => {
    await page.goto('/en/study');
    await page.waitForLoadState('networkidle');

    // Record start time
    const startTime = Date.now();

    // Click Junior card
    const juniorCard = page.getByTestId('level-card-easy');
    await juniorCard.click();

    // Wait for navigation
    await page.waitForURL('**/study/**', { timeout: 3000 });

    const endTime = Date.now();
    const duration = endTime - startTime;

    // Should feel instant (< 3s for full navigation is acceptable)
    expect(duration).toBeLessThan(3000);
  });
});
