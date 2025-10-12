/* eslint-disable no-console */

import { connect } from "mongoose";

/**
 * Migration 001: Update User Schema
 *
 * Changes:
 * 1. Add permissions field to User model
 * 2. Add acceptTerms tracking
 * 3. Add missing indexes
 * 4. Update validation rules
 *
 * Run: npm run migrate:001
 */

interface MigrationResult {
  success: boolean;
  message: string;
  affectedDocuments?: number;
  error?: string;
}

export async function migrate001(): Promise<MigrationResult> {
  try {
    console.log("🔄 Starting Migration 001: Update User Schema...");

    // Connect to database
    const connection = await connect(process.env.MONGODB_URI || "mongodb://localhost:27017/q8m");

    if (!connection.connection.db) {
      throw new Error("Database connection failed");
    }

    const userCollection = connection.connection.db.collection("users");

    // Step 1: Add permissions field to existing users
    const permissionsUpdateResult = await userCollection.updateMany(
      { permissions: { $exists: false } },
      {
        $set: {
          permissions: [],
          acceptTerms: false,
          acceptTermsAt: null,
          acceptTermsVersion: null,
        },
      }
    );

    console.log(`✅ Added permissions field to ${permissionsUpdateResult.modifiedCount} users`);

    // Step 2: Add acceptTerms tracking to existing users
    const termsUpdateResult = await userCollection.updateMany(
      { acceptTerms: { $exists: false } },
      {
        $set: {
          acceptTerms: false,
          acceptTermsAt: null,
          acceptTermsVersion: "1.0",
        },
      }
    );

    console.log(`✅ Added terms acceptance tracking to ${termsUpdateResult.modifiedCount} users`);

    // Step 3: Create new indexes
    await userCollection.createIndex({ permissions: 1 });
    await userCollection.createIndex({ acceptTerms: 1 });
    await userCollection.createIndex({ acceptTermsAt: 1 });

    console.log("✅ Created new indexes");

    // Step 4: Validate data integrity
    const totalUsers = await userCollection.countDocuments();
    const usersWithPermissions = await userCollection.countDocuments({
      permissions: { $exists: true },
    });
    const usersWithTerms = await userCollection.countDocuments({
      acceptTerms: { $exists: true },
    });

    console.log(`📊 Validation Results:`);
    console.log(`   Total users: ${totalUsers}`);
    console.log(`   Users with permissions: ${usersWithPermissions}`);
    console.log(`   Users with terms tracking: ${usersWithTerms}`);

    if (usersWithPermissions === totalUsers && usersWithTerms === totalUsers) {
      console.log("✅ Migration 001 completed successfully!");
      return {
        success: true,
        message: "User schema updated successfully",
        affectedDocuments: totalUsers,
      };
    } else {
      throw new Error("Data validation failed - not all users were updated");
    }
  } catch (error) {
    console.error("❌ Migration 001 failed:", error);
    return {
      success: false,
      message: "Migration failed",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// Run migration if called directly
// Note: This check is disabled for ES modules
// The migration is run via migrate.ts script
// if (import.meta.url === `file://${process.argv[1]}`) {
//   migrate001()
//     .then((result) => {
//       console.log("Migration Result:", result);
//       process.exit(result.success ? 0 : 1);
//     })
//     .catch((error) => {
//       console.error("Migration failed:", error);
//       process.exit(1);
//     });
// }
