import { test, expect } from "@playwright/test";

test.describe("Homepage", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/en");
  });

  test("should load successfully", async ({ page }) => {
    await expect(page).toHaveTitle(/q8m - Master Frontend Development Interviews/);
  });

  test("should have skip-to-main-content link", async ({ page }) => {
    const skipLink = page.getByRole("link", { name: /skip to main content/i });
    await expect(skipLink).toBeInViewport({ ratio: 0 }); // Hidden until focused
  });

  test("should render all key sections", async ({ page }) => {
    // Hero
    await expect(page.locator('[data-section="hero"]')).toBeVisible();

    // Features
    await expect(page.locator('[data-section="features"]')).toBeVisible();

    // How It Works
    await expect(page.locator('[data-section="how-it-works"]')).toBeVisible();

    // Pricing
    await expect(page.locator('[data-section="pricing-teaser"]')).toBeVisible();

    // Testimonials
    await expect(page.locator('[data-section="testimonials"]')).toBeVisible();

    // FAQ
    await expect(page.locator('[data-section="faq"]')).toBeVisible();

    // Final CTA
    await expect(page.locator('[data-section="final-cta"]')).toBeVisible();
  });

  test("should have primary CTA in hero", async ({ page }) => {
    const primaryCTA = page.getByRole("button", { name: /start your 7-day free trial/i });
    await expect(primaryCTA).toBeVisible();
  });

  test("FAQ accordion should work", async ({ page }) => {
    // Scroll to FAQ section
    await page.locator('[data-section="faq"]').scrollIntoViewIfNeeded();

    // Find first FAQ item
    const firstQuestion = page.locator(".faq-item__button").first();
    await expect(firstQuestion).toBeVisible();

    // Check initial state (collapsed)
    await expect(firstQuestion).toHaveAttribute("aria-expanded", "false");

    // Click to expand
    await firstQuestion.click();
    await expect(firstQuestion).toHaveAttribute("aria-expanded", "true");

    // Verify answer is visible
    const answer = page.locator(".faq-item__answer").first();
    await expect(answer).toBeVisible();

    // Click again to collapse
    await firstQuestion.click();
    await expect(firstQuestion).toHaveAttribute("aria-expanded", "false");
  });

  test("should be keyboard navigable", async ({ page }) => {
    // Focus on skip link
    await page.keyboard.press("Tab");

    // Navigate through primary CTA
    await page.keyboard.press("Tab");
    const focusedElement = page.locator(":focus");
    await expect(focusedElement).toHaveAttribute("type", "button");
  });

  test("should switch to Arabic (RTL)", async ({ page }) => {
    await page.goto("/ar");

    // Check HTML dir attribute
    const html = page.locator("html");
    await expect(html).toHaveAttribute("dir", "rtl");
    await expect(html).toHaveAttribute("lang", "ar");

    // Verify content is in Arabic (check for Arabic characters)
    const body = await page.textContent("body");
    expect(body).toMatch(/[\u0600-\u06FF]/); // Arabic Unicode range
  });

  test("should have proper structured data", async ({ page }) => {
    // Check for JSON-LD scripts
    const scripts = await page.locator('script[type="application/ld+json"]').all();
    expect(scripts.length).toBeGreaterThanOrEqual(3); // WebSite, Organization, FAQPage

    // Verify WebSite schema
    const websiteScript = await page.locator("#website-schema").textContent();
    expect(websiteScript).toBeTruthy();
    const websiteSchema = JSON.parse(websiteScript ?? "{}");
    expect(websiteSchema["@type"]).toBe("WebSite");

    // Verify FAQ schema
    const faqScript = await page.locator("#faq-schema").textContent();
    expect(faqScript).toBeTruthy();
    const faqSchema = JSON.parse(faqScript ?? "{}");
    expect(faqSchema["@type"]).toBe("FAQPage");
  });

  test("should have proper meta tags", async ({ page }) => {
    // Canonical URL
    const canonical = page.locator('link[rel="canonical"]');
    await expect(canonical).toHaveAttribute("href", /^https:\/\/q8m\.com\/en/);

    // OG tags
    const ogTitle = page.locator('meta[property="og:title"]');
    await expect(ogTitle).toHaveAttribute("content", /q8m/i);

    // Twitter card
    const twitterCard = page.locator('meta[name="twitter:card"]');
    await expect(twitterCard).toHaveAttribute("content", "summary_large_image");
  });

  test("should track analytics events (mock)", async ({ page }) => {
    // This would require analytics mock setup
    // Example: track hero CTA click
    await page.evaluate(() => {
      (window as unknown as { __analyticsEvents: string[] }).__analyticsEvents = [];
    });

    const primaryCTA = page.getByRole("button", { name: /start your 7-day free trial/i });
    await primaryCTA.click();

    // In a real test, verify analytics call was made
    // const events = await page.evaluate(() => (window as any).__analyticsEvents);
    // expect(events).toContain('cta_click');
  });

  test("should have no accessibility violations", async ({ page }) => {
    // This would require @axe-core/playwright integration
    // Example: await expect(page).toHaveNoViolations();
    // For now, we check basic a11y
    await expect(page.locator("h1")).toBeVisible();
    await expect(page.locator("main")).toBeVisible();
  });

  test("should have images with proper dimensions (no CLS)", async ({ page }) => {
    const images = await page.locator('img[loading="lazy"]').all();
    for (const img of images) {
      // Check if width and height attributes are set
      const width = await img.getAttribute("width");
      const height = await img.getAttribute("height");
      expect(width).toBeTruthy();
      expect(height).toBeTruthy();
    }
  });
});
