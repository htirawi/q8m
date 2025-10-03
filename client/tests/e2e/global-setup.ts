import { chromium, FullConfig } from "@playwright/test";

async function globalSetup(config: FullConfig) {
  console.log("Setting up global test environment...");

  // Start the development server if not already running
  const browser = await chromium.launch();
  const page = await browser.newPage();

  try {
    // Wait for the application to be ready
    await page.goto(process.env.CLIENT_URL || "http://localhost:3000");
    await page.waitForLoadState("networkidle");
    console.log("Application is ready for testing");
  } catch (error) {
    console.error("Failed to connect to application:", error);
    throw error;
  } finally {
    await browser.close();
  }

  // Set up test data or environment variables
  process.env.NODE_ENV = "test";
  process.env.API_BASE_URL = process.env.API_BASE_URL || "http://localhost:8000";

  console.log("Global setup completed");
}

export default globalSetup;
