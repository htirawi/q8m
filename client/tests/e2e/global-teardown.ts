import { FullConfig } from "@playwright/test";

async function globalTeardown(config: FullConfig) {
  console.log("Cleaning up global test environment...");

  // Clean up any test data or resources
  // This could include:
  // - Clearing test databases
  // - Removing test files
  // - Cleaning up mock services
  // - Resetting environment variables

  // Example: Clear test localStorage data
  if (typeof window !== "undefined") {
    window.localStorage.clear();
    window.sessionStorage.clear();
  }

  // Reset environment variables
  delete process.env.NODE_ENV;
  delete process.env.API_BASE_URL;

  console.log("Global teardown completed");
}

export default globalTeardown;
