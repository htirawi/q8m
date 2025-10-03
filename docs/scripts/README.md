# Scripts Documentation

Complete documentation for all scripts in the Frontend Interview Prep project, organized by category and usage.

## 📁 Scripts Overview

The project contains scripts organized into two main categories:

- **🔧 Tools Scripts** (`scripts/tools/`) - Development and deployment tools
- **🔒 Internal Scripts** (`scripts/internal/`) - Question management and data processing

## 🔧 Tools Scripts

### Overview

Tools scripts are safe for regular use and designed for development and deployment tasks.

### Available Tools

#### **Activation Scripts**

##### `activate-pro-ui.sh` ⭐ **Recommended**

**Purpose**: Activates the professional UI with sidebar layout and distraction-free design.

**Usage**:

```bash
./scripts/tools/activate-pro-ui.sh
```

**What it does**:

- Backs up current version
- Switches to professional UI (sidebar + focused content)
- Answer hidden by default for better learning
- Expert UX design with mobile-friendly layout

**Best for**: Actual studying & portfolio showcase

##### `activate-enhanced.sh`

**Purpose**: Activates the enhanced version with all features visible.

**Usage**:

```bash
./scripts/tools/activate-enhanced.sh
```

**What it does**:

- Backs up current version
- Switches to enhanced App.tsx with all features
- Shows all controls in main area
- Displays what's new

**Best for**: Showcasing all features

##### `activate-multi-framework.sh`

**Purpose**: Activates multi-framework mode for testing multiple frameworks.

**Usage**:

```bash
./scripts/tools/activate-multi-framework.sh
```

**What it does**:

- Enables multi-framework support
- Allows switching between Angular, React, Next.js, and Redux
- Sets up framework-specific configurations

**Best for**: Testing multiple frameworks

#### **GitHub Management Scripts**

##### `push-to-github.sh`

**Purpose**: Automated GitHub repository setup and push with validation.

**Usage**:

```bash
./scripts/tools/push-to-github.sh YOUR_GITHUB_USERNAME
```

**What it does**:

- Validates prerequisites
- Runs tests and linting
- Initializes git repository
- Creates comprehensive initial commit
- Pushes to GitHub
- Shows next steps

**Example**:

```bash
./scripts/tools/push-to-github.sh htirawi
```

**Best for**: Initial repository setup

##### `setup-github-repo.sh`

**Purpose**: GitHub repository setup and configuration.

**Usage**:

```bash
./scripts/tools/setup-github-repo.sh
```

**What it does**:

- Configures GitHub repository settings
- Sets up branch protection rules
- Configures issue templates
- Sets up GitHub Actions workflows

**Best for**: Repository configuration

##### `rename-repo.sh`

**Purpose**: Repository renaming utility.

**Usage**:

```bash
./scripts/tools/rename-repo.sh "new-repo-name"
```

**What it does**:

- Renames the repository
- Updates all references
- Updates package.json
- Updates documentation

**Best for**: Repository renaming

##### `update-github-about.sh`

**Purpose**: Update GitHub about page and repository metadata.

**Usage**:

```bash
./scripts/tools/update-github-about.sh
```

**What it does**:

- Updates repository description
- Sets up topics and tags
- Configures repository visibility
- Updates README badges

**Best for**: Repository metadata management

### Prerequisites for Tools Scripts

**Required Tools**:

- **Git**: Version control
- **GitHub CLI**: For GitHub management scripts
- **Bash**: For shell scripts
- **Node.js**: For JavaScript tools

**Installation**:

```bash
# Install GitHub CLI
brew install gh  # macOS
# or
sudo apt install gh  # Ubuntu

# Authenticate with GitHub
gh auth login
```

**Making Scripts Executable**:

```bash
# All tools scripts
chmod +x scripts/tools/*.sh

# Individual scripts
chmod +x scripts/tools/activate-pro-ui.sh
chmod +x scripts/tools/push-to-github.sh
```

## 🔒 Internal Scripts

### Overview

Internal scripts are for development use only and should not be used in production. They require proper safety measures and testing.

### Available Internal Scripts

#### **Question Management Scripts**

##### `add-questions.js` ✅ **Safe**

**Purpose**: Add new questions to the database with validation.

**Usage**:

```bash
node scripts/internal/add-questions.js
node scripts/internal/add-questions.js --help
node scripts/internal/add-questions.js --test
```

**What it does**:

- Validates question format
- Adds questions to appropriate framework files
- Generates unique IDs
- Validates data integrity
- Provides progress feedback

**Safety**: Safe for internal use with proper validation

**Best for**: Adding new questions to the database

##### `advanced-question-manager.js` ⚠️ **Review Required**

**Purpose**: Advanced question management with multiple format support.

**Usage**:

```bash
node scripts/internal/advanced-question-manager.js --help
node scripts/internal/advanced-question-manager.js --formats
node scripts/internal/advanced-question-manager.js --input questions.csv --format csv
```

**What it does**:

- Supports multiple input formats (CSV, JSON, Markdown)
- Batch processing of questions
- Advanced validation and transformation
- Export to multiple formats
- Comprehensive error handling

**Safety**: Requires review before use due to high complexity

**Best for**: Advanced question management and batch operations

#### **Data Processing Scripts**

##### `csv-parser.js` ✅ **Safe**

**Purpose**: Parse CSV files into question format with validation.

**Usage**:

```bash
node scripts/internal/csv-parser.js input.csv
node scripts/internal/csv-parser.js input.csv --output questions.ts
node scripts/internal/csv-parser.js --help
```

**What it does**:

- Parses CSV files with proper encoding
- Validates data format and structure
- Converts to TypeScript format
- Handles special characters and escaping
- Provides detailed error reporting

**Safety**: Safe for internal use with comprehensive validation

**Best for**: Converting CSV question files to TypeScript

##### `csv-inspector.js` ✅ **Safe**

**Purpose**: Inspect and validate CSV files (read-only operation).

**Usage**:

```bash
node scripts/internal/csv-inspector.js file.csv
node scripts/internal/csv-inspector.js file.csv --detailed
node scripts/internal/csv-inspector.js --help
```

**What it does**:

- Analyzes CSV file structure
- Validates data integrity
- Reports encoding issues
- Identifies potential problems
- Provides detailed statistics

**Safety**: Read-only operation, completely safe

**Best for**: Validating CSV files before processing

##### `csv-recovery.js` ⚠️ **Use with Caution**

**Purpose**: Recover corrupted CSV files.

**Usage**:

```bash
node scripts/internal/csv-recovery.js corrupted-file.csv
node scripts/internal/csv-recovery.js corrupted-file.csv --backup
node scripts/internal/csv-recovery.js --help
```

**What it does**:

- Attempts to recover corrupted CSV data
- Multiple recovery strategies
- Creates backup files
- Reports recovery success rate
- Handles various corruption types

**Safety**: Data recovery script, backup required

**Best for**: Recovering corrupted CSV files

#### **Cleanup Scripts**

##### `angular-cleanup.js` ⚠️ **Use with Caution**

**Purpose**: Clean up Angular-specific data and remove duplicates.

**Usage**:

```bash
node scripts/internal/angular-cleanup.js
node scripts/internal/angular-cleanup.js --dry-run
node scripts/internal/angular-cleanup.js --backup
node scripts/internal/angular-cleanup.js --help
```

**What it does**:

- Removes duplicate questions
- Cleans up malformed data
- Validates Angular-specific content
- Optimizes data structure
- Creates backup before cleanup

**Safety**: Data modification script, backup required

**Best for**: Cleaning up Angular question data

#### **Conversion Scripts**

##### `convert-md-to-ts.cjs` ✅ **Safe**

**Purpose**: Convert Markdown documentation to TypeScript format.

**Usage**:

```bash
node scripts/internal/convert-md-to-ts.cjs
node scripts/internal/convert-md-to-ts.cjs input.md
node scripts/internal/convert-md-to-ts.cjs --help
```

**What it does**:

- Parses markdown question files
- Extracts questions and answers
- Generates TypeScript files with proper types
- Handles code blocks and formatting
- Creates one .ts file per framework

**Safety**: Safe for internal use, read-only operation

**Best for**: Converting markdown questions to TypeScript

#### **Evaluation Scripts**

##### `evaluate-scripts.js` ✅ **Safe**

**Purpose**: Evaluate internal scripts for safety and usability.

**Usage**:

```bash
node scripts/internal/evaluate-scripts.js
node scripts/internal/evaluate-scripts.js --detailed
node scripts/internal/evaluate-scripts.js --help
```

**What it does**:

- Analyzes all internal scripts
- Evaluates safety and usability
- Generates comprehensive reports
- Identifies potential risks
- Provides recommendations

**Safety**: Read-only analysis, completely safe

**Best for**: Evaluating script safety and quality

### Prerequisites for Internal Scripts

**Required Tools**:

- **Node.js**: JavaScript runtime
- **Git**: Version control for backups
- **Text Editor**: For reviewing script code

**Safety Requirements**:

- Always backup data before running data-modifying scripts
- Test scripts in isolated environment first
- Review script code before execution
- Use proper permissions and authentication

## 🛡️ Safety Guidelines

### Before Using Any Script

1. **✅ Read Documentation**: Check script-specific documentation
2. **✅ Test Safely**: Use `--test` flag or test environment
3. **✅ Backup Data**: Always backup before data modification
4. **✅ Review Code**: Understand what the script does
5. **✅ Check Dependencies**: Ensure all prerequisites are met

### High-Risk Scripts

**Scripts requiring extra caution**:

- `advanced-question-manager.js` - Complex multi-format management
- `angular-cleanup.js` - Data cleanup (backup required)
- `csv-recovery.js` - File recovery (backup required)

**Safety measures**:

- **Backup Strategy**: Always backup data before running
- **Testing Environment**: Test in isolated environment first
- **Rollback Plan**: Have rollback procedures ready
- **Monitoring**: Monitor script execution closely

### Safe Scripts

**Scripts safe for regular use**:

- `csv-inspector.js` - Read-only CSV analysis
- `convert-md-to-ts.cjs` - Markdown conversion
- `add-questions.js` - Question management
- `csv-parser.js` - CSV processing
- `evaluate-scripts.js` - Script evaluation

## 📋 Usage Examples

### First Time Setup

```bash
# 1. Activate professional UI (recommended)
./scripts/tools/activate-pro-ui.sh

# 2. Test locally
pnpm dev

# 3. If you haven't pushed to GitHub yet
./scripts/tools/push-to-github.sh YOUR_USERNAME
```

### Adding New Questions

```bash
# 1. Use internal question management scripts
node scripts/internal/add-questions.js

# 2. Or convert from markdown
node scripts/internal/convert-md-to-ts.cjs

# 3. Or parse from CSV
node scripts/internal/csv-parser.js questions.csv
```

### Script Evaluation

```bash
# Evaluate all internal scripts
node scripts/internal/evaluate-scripts.js
```

### GitHub Management

```bash
# Push changes to GitHub
./scripts/tools/push-to-github.sh

# Setup repository
./scripts/tools/setup-github-repo.sh

# Update about page
./scripts/tools/update-github-about.sh
```

## 🔧 Troubleshooting

### Common Issues

1. **Script Not Executable**

   ```bash
   chmod +x scripts/tools/*.sh
   chmod +x scripts/internal/*.js
   ```

2. **Permission Denied**

   ```bash
   # Check file permissions
   ls -la scripts/

   # Fix permissions
   chmod +x scripts/tools/script-name.sh
   ```

3. **Dependencies Missing**

   ```bash
   # Install GitHub CLI
   brew install gh

   # Authenticate
   gh auth login
   ```

4. **Script Errors**

   ```bash
   # Check script help
   node scripts/internal/script-name.js --help

   # Run in test mode
   node scripts/internal/script-name.js --test
   ```

### Debug Steps

1. **Check Script Documentation**: Read the script's README
2. **Verify Prerequisites**: Ensure all dependencies are installed
3. **Test in Safe Environment**: Use test mode or isolated environment
4. **Check Logs**: Review script output for error messages
5. **Backup and Retry**: Backup data and try again

## 📊 Script Statistics

```
Total Scripts:        15
Tools Scripts:        7
Internal Scripts:     8
Shell Scripts:        7
Node.js Scripts:      8
Lines of Code:        ~2000
Questions Processed:  500+ (across all frameworks)
Time Saved:          Hours of manual work!
```

## 📚 Related Documentation

- **[Tools Documentation](../scripts/tools/README.md)** - Detailed tools information
- **[Internal Scripts](../scripts/internal/README.md)** - Question management scripts
- **[Script Evaluation](../scripts/internal/EVALUATION-REPORT.md)** - Safety evaluation
- **[Project Documentation](../README.md)** - Complete project docs

## 🎯 Best Practices

### For Development

- Use tools scripts for regular development tasks
- Test internal scripts thoroughly before use
- Always backup data before running data-modifying scripts
- Keep scripts organized and documented

### For Production

- Never use internal scripts in production
- Only use tools scripts for deployment
- Ensure all scripts are properly tested
- Maintain proper version control

### For Team Collaboration

- Document all script usage
- Share safety guidelines with team members
- Regular script evaluation and updates
- Maintain script quality standards

---

**All scripts are designed to make your workflow easier!** ⚡

_Keep scripts organized, documented, and safe for team collaboration._
