import { buildApp } from "./src/app.js";
import { User } from "./src/models/User.js";
import { connectDatabase } from "./src/config/database.js";

async function test() {
  try {
    // Set test environment
    process.env.NODE_ENV = "test";
    process.env.MONGODB_URI = "mongodb://localhost:27017/quiz-platform-test";
    process.env.MONGODB_DB_NAME = "quiz-platform-test";
    process.env.JWT_SECRET = "test-jwt-secret-key-that-is-long-enough-for-security";
    process.env.JWT_EXPIRES_IN = "15m";
    process.env.JWT_REFRESH_SECRET = "test-jwt-refresh-secret-key-that-is-long-enough";
    process.env.CSRF_SECRET = "test-csrf-secret-key-that-is-long-enough";
    process.env.API_BASE_URL = "http://localhost:3001";
    process.env.CLIENT_URL = "http://localhost:5173";
    process.env.CORS_ORIGIN = "http://localhost:5173";
    process.env.CORS_CREDENTIALS = "true";
    process.env.MAX_FILE_SIZE = "10485760";
    process.env.LOG_LEVEL = "error";

    // Connect to database
    await connectDatabase();

    // Clear database
    await User.deleteMany({});

    // Build app
    const app = await buildApp();
    await app.ready();

    // Register user
    console.log("Registering user...");
    const registerResponse = await app.inject({
      method: "POST",
      url: "/api/auth/register",
      payload: {
        email: "test@example.com",
        password: "SecurePassword123!",
        name: "Test User",
        acceptTerms: true,
      },
    });

    console.log("Register status:", registerResponse.statusCode);
    console.log("Register body:", JSON.parse(registerResponse.body));

    // Login
    console.log("\nLogging in...");
    const loginResponse = await app.inject({
      method: "POST",
      url: "/api/auth/login",
      payload: {
        email: "test@example.com",
        password: "SecurePassword123!",
      },
    });

    console.log("Login status:", loginResponse.statusCode);
    console.log("Login body:", loginResponse.body);

    await app.close();
    process.exit(0);
  } catch (error) {
    console.error("Test error:", error);
    process.exit(1);
  }
}

test();
