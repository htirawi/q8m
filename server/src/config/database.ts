import { env } from "@config/env";
import mongoose from "mongoose";


export const connectDatabase = async (): Promise<void> => {
  try {
    // Check if already connected
    if (mongoose.connection.readyState === 1) {
      console.warn("✅ Already connected to MongoDB");
      return;
    }

    // If currently connecting, wait for it to complete
    if (mongoose.connection.readyState === 2) {
      console.warn("⏳ Waiting for pending MongoDB connection...");
      await new Promise((resolve) => {
        mongoose.connection.once("connected", resolve);
      });
      return;
    }

    const mongoUri = env.MONGODB_URI;

    if (!mongoUri) {
      throw new Error("MONGODB_URI is not defined in environment variables");
    }

    // Detect if using MongoDB Atlas (cloud) by checking protocol and hostname
    let isAtlas = false;
    try {
      const parsedUri = new URL(mongoUri);
      // Check if using mongodb+srv protocol and hostname is mongodb.net or subdomain
      isAtlas =
        parsedUri.protocol === "mongodb+srv:" &&
        (parsedUri.hostname === "mongodb.net" || parsedUri.hostname.endsWith(".mongodb.net"));
    } catch {
      // If parse fails, fallback to protocol check only
      isAtlas = mongoUri.startsWith("mongodb+srv://");
    }

    const options: mongoose.ConnectOptions = {
      // Connection pool settings
      maxPoolSize: isAtlas ? 50 : 10, // Larger pool for Atlas
      minPoolSize: isAtlas ? 10 : 5,

      // Timeout settings
      serverSelectionTimeoutMS: isAtlas ? 10000 : 5000, // More time for cloud
      socketTimeoutMS: 45000,
      connectTimeoutMS: isAtlas ? 10000 : 5000,

      // Retry settings for cloud reliability
      retryWrites: isAtlas,
      retryReads: isAtlas,

      // Performance
      bufferCommands: false,
      autoIndex: env.NODE_ENV !== "production", // Only create indexes in dev

      // Compression for cloud connections
      compressors: isAtlas ? ["zlib"] : undefined,
    };

    // Parse additional MongoDB options if provided
    if (env.MONGODB_OPTIONS) {
      const additionalOptions = JSON.parse(env.MONGODB_OPTIONS);
      Object.assign(options, additionalOptions);
    }

    const connectionType = isAtlas ? "MongoDB Atlas (Cloud)" : "MongoDB (Local)";
    console.warn(`🔌 Connecting to ${connectionType}...`);

    await mongoose.connect(mongoUri, options);

    console.warn(`✅ Connected to ${connectionType}`);

    // Handle connection events
    mongoose.connection.on("connected", () => {
      console.warn("MongoDB connected");
    });

    mongoose.connection.on("error", (error) => {
      console.error("MongoDB connection error:", error);
    });

    mongoose.connection.on("disconnected", () => {
      console.warn("MongoDB disconnected");
    });

    // Graceful shutdown
    process.on("SIGINT", async () => {
      await mongoose.connection.close();
      console.warn("MongoDB connection closed through app termination");
      process.exit(0);
    });
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error);
    // Don't exit during tests, throw error instead
    if (process.env.NODE_ENV === "test") {
      throw error;
    }
    process.exit(1);
  }
};

export const disconnectDatabase = async (): Promise<void> => {
  try {
    await mongoose.connection.close();
      console.warn("MongoDB connection closed");
  } catch (error) {
    console.error("Error closing MongoDB connection:", error);
  }
};
