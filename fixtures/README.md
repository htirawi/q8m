# Fixtures Directory

This directory contains development-only files that are **NOT** included in production builds.

## Purpose

The fixtures directory serves as a repository for:
- Development data files (question datasets, templates)
- Internal development scripts and tools
- Test data and sample files
- Development documentation

## Structure

```
fixtures/
├── questions/          # Question datasets and templates
│   ├── angular-*.csv  # Angular question files
│   ├── react-*.csv    # React question files
│   └── sample-*.json  # Sample question data
├── scripts/           # Internal development scripts
│   ├── add-questions.js
│   ├── csv-parser.js
│   └── README.md
└── README.md          # This file
```

## Important Notes

⚠️ **DEVELOPMENT ONLY**: Files in this directory are:
- ❌ **NOT** included in production builds
- ❌ **NOT** distributed to end users
- ❌ **NOT** accessible via the web application
- ✅ **ONLY** for internal development use

## Usage

### For Developers

```bash
# Access question data for development
cat fixtures/questions/sample-questions.json

# Run internal scripts
node fixtures/scripts/add-questions.js

# Parse CSV files
node fixtures/scripts/csv-parser.js fixtures/questions/angular-p1.csv
```

### For CI/CD

The fixtures directory is excluded from production builds via:
- `.gitignore` - Excludes from version control in production
- `vite.config.ts` - Excludes from build process
- `tsconfig.json` - Excludes from TypeScript compilation

## Security

- **No API Keys**: No sensitive data should be stored here
- **No Secrets**: No production secrets or credentials
- **Local Only**: Files are for local development only
- **Version Control**: Files are tracked in git for development

## Maintenance

### Adding New Fixtures

1. Place development files in appropriate subdirectory
2. Update this README if adding new categories
3. Ensure files are properly excluded from production builds

### Removing Fixtures

1. Verify files are not referenced in production code
2. Update documentation if removing categories
3. Clean up any related configuration

## Related Documentation

- [Data Sweep Report](../docs/data-sweep-report.md) - Details on fixture organization
- [Internal Scripts README](scripts/README.md) - Script usage documentation
- [Project Structure](../docs/development/PROJECT-STRUCTURE.md) - Overall project organization

---

**Remember**: This directory is for development use only. Never include fixtures in production deployments.
