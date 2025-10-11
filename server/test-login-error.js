import { buildApp } from "./src/app.js";
import { User } from "./src/models/User.js";
import { connectDatabase } from "./src/config/database.js";

// Set environment variables before importing anything else
process.env.NODE_ENV = "test";
process.env.MONGODB_URI = "mongodb://localhost:27017/quiz-platform-test";
process.env.MONGODB_DB_NAME = "quiz-platform-test";
process.env.JWT_SECRET = "test-jwt-secret-key-that-is-long-enough-for-security";
process.env.JWT_EXPIRES_IN = "15m";
process.env.LOG_LEVEL = "error";

async function test() {
  try {
    await connectDatabase();
    await User.deleteMany({});

    const app = await buildApp();
    await app.ready();

    // Register
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
    if (registerResponse.statusCode !== 201) {
      console.log("Register error:", JSON.parse(registerResponse.body));
      process.exit(1);
    }

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
    console.log("Login response:", loginResponse.body);

    await app.close();
    process.exit(loginResponse.statusCode === 200 ? 0 : 1);
  } catch (error) {
    console.error("Test error:", error);
    process.exit(1);
  }
}

test();
