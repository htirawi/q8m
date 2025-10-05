# Database Migrations

This directory contains database migration scripts for the q8m platform.

## Overview

Migrations are used to:

- Update database schemas
- Seed initial data
- Transform existing data
- Add indexes and constraints

## Available Migrations

### Migration 001: Update User Schema

**File:** `001_update_user_schema.ts`

**Changes:**

- Adds `permissions` field to User model
- Adds `acceptTerms`, `acceptTermsAt`, `acceptTermsVersion` fields
- Creates new indexes for performance
- Updates existing users with default values

### Migration 002: Seed Questions Database

**File:** `002_seed_questions.ts`

**Changes:**

- Creates sample questions for all frameworks (Angular, Vue, Next.js, Redux)
- Adds questions in multiple difficulty levels
- Includes both English and Arabic content
- Sets up proper categorization and tagging

## Running Migrations

### Run All Migrations

```bash
# From server directory
pnpm migrate

# Or using the full command
pnpm db:migrate
```

### Run Specific Migration

```bash
# Run migration 001
pnpm migrate:001

# Run migration 002 (seed questions)
pnpm migrate:002
pnpm db:seed
```

### Migration Runner

The `migrate.ts` script handles:

- Database connection
- Migration execution order
- Error handling and rollback
- Progress reporting
- Validation of results

## Environment Setup

Ensure your environment variables are set:

```bash
# .env file
MONGODB_URI=mongodb://localhost:27017/q8m
JWT_SECRET=your-jwt-secret
```

## Migration Safety

### Before Running Migrations

1. **Backup your database** - Always backup before running migrations
2. **Test in development** - Run migrations in dev environment first
3. **Check dependencies** - Ensure all required packages are installed

### Migration Best Practices

- Each migration is atomic (all or nothing)
- Migrations are idempotent (safe to run multiple times)
- Failed migrations don't leave the database in an inconsistent state
- All migrations include validation and error handling

## Creating New Migrations

### Template Structure

```typescript
export async function migrateXXX(): Promise<MigrationResult> {
  try {
    console.log("🔄 Starting Migration XXX: Description...");

    // Migration logic here

    console.log("✅ Migration XXX completed successfully!");
    return {
      success: true,
      message: "Migration completed",
      affectedDocuments: count,
    };
  } catch (error) {
    console.error("❌ Migration XXX failed:", error);
    return {
      success: false,
      message: "Migration failed",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
```

### Steps to Add New Migration

1. Create `00X_new_migration.ts` file
2. Implement the migration function
3. Add to `migrations` array in `migrate.ts`
4. Update this README
5. Test the migration

## Troubleshooting

### Common Issues

**Connection Errors:**

- Check `MONGODB_URI` environment variable
- Ensure MongoDB is running
- Verify network connectivity

**Permission Errors:**

- Check database user permissions
- Ensure write access to collections

**Schema Conflicts:**

- Check for existing indexes
- Verify field types and constraints
- Review existing data compatibility

### Recovery

If a migration fails:

1. Check the error message
2. Fix the underlying issue
3. Re-run the migration (they're idempotent)
4. If needed, restore from backup

## Migration History

| Version | Name               | Description                               | Date       |
| ------- | ------------------ | ----------------------------------------- | ---------- |
| 001     | Update User Schema | Added permissions and terms acceptance    | 2024-01-XX |
| 002     | Seed Questions     | Added sample questions for all frameworks | 2024-01-XX |

## Support

For migration issues:

1. Check the logs for detailed error messages
2. Review the migration code for potential issues
3. Test in a development environment
4. Create an issue with full error details
