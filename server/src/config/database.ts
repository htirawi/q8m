import { env } from "@config/env";
import mongoose from "mongoose";


export const connectDatabase = async (): Promise<void> => {
  try {
    const mongoUri = env.MONGODB_URI;

    if (!mongoUri) {
      throw new Error("MONGODB_URI is not defined in environment variables");
    }

    const options: mongoose.ConnectOptions = {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      bufferCommands: false,
    };

    // Parse additional MongoDB options if provided
    if (env.MONGODB_OPTIONS) {
      const additionalOptions = JSON.parse(env.MONGODB_OPTIONS);
      Object.assign(options, additionalOptions);
    }

    await mongoose.connect(mongoUri, options);

    console.warn("✅ Connected to MongoDB");

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
