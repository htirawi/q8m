#!/usr/bin/env node

/* eslint-disable no-console */

/**
 * Migration Runner
 *
 * Runs database migrations in sequence
 *
 * Usage:
 *   npm run migrate
 *   npm run migrate:001
 *   npm run migrate:002
 */

import { connect } from "mongoose";

import { migrate001 } from "./001_update_user_schema.js";
import { migrate002 } from "./002_seed_questions.js";

interface Migration {
  name: string;
  version: string;
  run: () => Promise<{ success: boolean; message: string; error?: string }>;
}

const migrations: Migration[] = [
  {
    name: "Update User Schema",
    version: "001",
    run: migrate001,
  },
  {
    name: "Seed Questions Database",
    version: "002",
    run: migrate002,
  },
];

async function runAllMigrations(): Promise<void> {
  try {
    console.log("🚀 Starting database migrations...\n");

    // Connect to database
    await connect(process.env.MONGODB_URI || "mongodb://localhost:27017/q8m");
    console.log("✅ Connected to database\n");

    let successCount = 0;
    let failCount = 0;

    for (const migration of migrations) {
      console.log(`🔄 Running migration ${migration.version}: ${migration.name}`);

      try {
        const result = await migration.run();

        if (result.success) {
          console.log(`✅ Migration ${migration.version} completed successfully`);
          console.log(`   ${result.message}\n`);
          successCount++;
        } else {
          console.log(`❌ Migration ${migration.version} failed`);
          console.log(`   ${result.message}`);
          if (result.error) {
            console.log(`   Error: ${result.error}\n`);
          }
          failCount++;
        }
      } catch (error) {
        console.log(`❌ Migration ${migration.version} failed with exception`);
        console.log(`   Error: ${error instanceof Error ? error.message : "Unknown error"}\n`);
        failCount++;
      }
    }

    console.log("📊 Migration Summary:");
    console.log(`   ✅ Successful: ${successCount}`);
    console.log(`   ❌ Failed: ${failCount}`);
    console.log(`   📝 Total: ${migrations.length}`);

    if (failCount > 0) {
      console.log("\n⚠️  Some migrations failed. Please check the logs above.");
      process.exit(1);
    } else {
      console.log("\n🎉 All migrations completed successfully!");
      process.exit(0);
    }
  } catch (error) {
    console.error("❌ Migration runner failed:", error);
    process.exit(1);
  }
}

async function runSingleMigration(version: string): Promise<void> {
  try {
    const migration = migrations.find((m) => m.version === version);

    if (!migration) {
      console.error(`❌ Migration ${version} not found`);
      process.exit(1);
    }

    console.log(`🚀 Running migration ${version}: ${migration.name}\n`);

    // Connect to database
    await connect(process.env.MONGODB_URI || "mongodb://localhost:27017/q8m");
    console.log("✅ Connected to database\n");

    const result = await migration.run();

    if (result.success) {
      console.log(`✅ Migration ${version} completed successfully`);
      console.log(`   ${result.message}`);
      process.exit(0);
    } else {
      console.log(`❌ Migration ${version} failed`);
      console.log(`   ${result.message}`);
      if (result.error) {
        console.log(`   Error: ${result.error}`);
      }
      process.exit(1);
    }
  } catch (error) {
    console.error(`❌ Migration ${version} failed:`, error);
    process.exit(1);
  }
}

// Parse command line arguments
const args = process.argv.slice(2);
const command = args[0];

if (command?.startsWith("00")) {
  // Run specific migration
  runSingleMigration(command);
} else {
  // Run all migrations
  runAllMigrations();
}
