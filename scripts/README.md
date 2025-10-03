# Scripts Directory

This directory contains development scripts organized into two main categories for better management and safety.

## 📁 Directory Structure

### 🔧 Tools (`tools/`)

Development and deployment tools for regular use:

- **Activation Scripts**: Mode switching utilities
- **GitHub Management**: Repository and deployment tools
- **Deployment**: Production deployment scripts

### 🔒 Internal (`internal/`)

Internal development scripts for question management:

- **Question Management**: Add, edit, and manage questions
- **Data Processing**: CSV parsing and data conversion
- **Cleanup Tools**: Data cleanup and maintenance scripts

## 🚨 Important Notice

**Internal scripts are for development use only:**

- ❌ Do not use in production
- ❌ Do not distribute to end users
- ✅ Use only for development and content management
- ✅ Always test and backup before use

## 📚 Documentation

- **[Tools Documentation](./tools/README.md)** - Development and deployment tools
- **[Internal Scripts Documentation](./internal/README.md)** - Question management scripts
- **[Script Evaluation Report](./internal/EVALUATION-REPORT.md)** - Safety and usability evaluation

## 🛠️ Quick Start

### For Development Tools

```bash
# Make scripts executable
chmod +x scripts/tools/*.sh

# Activate professional UI (recommended)
./scripts/tools/activate-pro-ui.sh

# Push to GitHub
./scripts/tools/push-to-github.sh YOUR_USERNAME
```

### For Internal Scripts

```bash
# Read documentation first
cat scripts/internal/README.md

# Test scripts safely
node scripts/internal/script-name.js --test
```

## 🎯 Which Script Should I Use?

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
```

### Already on GitHub?

```bash
# Just activate the pro UI
./scripts/tools/activate-pro-ui.sh
pnpm dev
```

## 🔍 Available Scripts

### Development Tools (`tools/`)

#### `activate-pro-ui.sh` ⭐ **Recommended**

- **Purpose**: Professional, distraction-free design
- **Best for**: Actual studying & portfolio showcase
- **UI**: Sidebar + focused question area
- **Benefits**: Better learning, less cognitive load, professional appearance

#### `activate-enhanced.sh`

- **Purpose**: Feature-rich version (all features visible)
- **Best for**: Showcasing all features
- **UI**: All controls in main area

#### `activate-multi-framework.sh`

- **Purpose**: Multi-framework mode activation
- **Best for**: Testing multiple frameworks

#### `push-to-github.sh`

- **Purpose**: One-command GitHub setup
- **Best for**: Initial repository setup
- **Automated**: Git initialization, comprehensive commit, push to remote

#### `setup-github-repo.sh`

- **Purpose**: GitHub repository setup
- **Best for**: Initial repository configuration

#### `update-github-about.sh`

- **Purpose**: Update GitHub about page
- **Best for**: Repository metadata management

### Internal Scripts (`internal/`)

#### `add-questions.js` ✅ **Safe**

- **Purpose**: Add new questions to database
- **Safety**: Safe for internal use
- **Usage**: `node scripts/internal/add-questions.js`

#### `csv-parser.js` ✅ **Safe**

- **Purpose**: Parse CSV files into question format
- **Safety**: Safe for internal use
- **Usage**: `node scripts/internal/csv-parser.js input.csv`

#### `csv-inspector.js` ✅ **Safe**

- **Purpose**: Inspect and validate CSV files
- **Safety**: Read-only operation, completely safe
- **Usage**: `node scripts/internal/csv-inspector.js file.csv`

#### `convert-md-to-ts.cjs` ✅ **Safe**

- **Purpose**: Convert Markdown to TypeScript
- **Safety**: Safe for internal use
- **Usage**: `node scripts/internal/convert-md-to-ts.cjs`

#### `advanced-question-manager.js` ⚠️ **Review Required**

- **Purpose**: Advanced question management
- **Safety**: Requires review before use
- **Complexity**: High complexity with multiple features

#### `angular-cleanup.js` ⚠️ **Use with Caution**

- **Purpose**: Clean up Angular-specific data
- **Safety**: Data modification script, backup required
- **Risk**: Could modify production data

#### `csv-recovery.js` ⚠️ **Use with Caution**

- **Purpose**: Recover corrupted CSV files
- **Safety**: Data recovery script, backup required
- **Risk**: Could modify file structure

## ⚠️ Safety Guidelines

### Before Running Any Script

1. ✅ **Read documentation** before using any script
2. ✅ **Test in safe environment** before production use
3. ✅ **Backup important data** before running data-modifying scripts
4. ✅ **Review script code** for understanding and safety
5. ✅ **Use proper permissions** and authentication

### High-Risk Scripts

- **Backup Strategy**: Always backup data before running
- **Testing Environment**: Test in isolated environment first
- **Rollback Plan**: Have rollback procedures ready
- **Monitoring**: Monitor script execution closely

## 🔧 Prerequisites

### Required Tools

- **Git**: Version control
- **GitHub CLI**: For GitHub management scripts (`brew install gh`)
- **Bash**: For shell scripts
- **Node.js**: For JavaScript tools

### Installation

```bash
# Install GitHub CLI
brew install gh  # macOS
# or
sudo apt install gh  # Ubuntu

# Authenticate with GitHub
gh auth login
```

## 🛠️ Making Scripts Executable

If scripts aren't executable:

```bash
# All tools scripts
chmod +x scripts/tools/*.sh

# Individual scripts
chmod +x scripts/tools/activate-pro-ui.sh
chmod +x scripts/tools/push-to-github.sh
```

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

## 🔒 Security

These scripts:

- ✅ Run locally only
- ✅ No external downloads (except GitHub CLI)
- ✅ No secrets required
- ✅ Safe to execute (with proper precautions)
- ✅ Can be reviewed (plain text)

## 🎯 Recommended Workflow

```bash
# 1. Clone repo
git clone https://github.com/htirawi/frontend-interview-prep.git
cd frontend-interview-prep

# 2. Install dependencies
pnpm install

# 3. Activate professional UI
./scripts/tools/activate-pro-ui.sh

# 4. Start development
pnpm dev

# 5. Add new questions (if needed)
# Read internal scripts documentation first
cat scripts/internal/README.md
node scripts/internal/add-questions.js

# 6. Make changes, test, commit, push
# (pre-push validation runs automatically!)
```

## 📖 Related Documentation

- **[Tools Documentation](./tools/README.md)** - Detailed tools information
- **[Internal Scripts](./internal/README.md)** - Question management scripts
- **[Script Evaluation](./internal/EVALUATION-REPORT.md)** - Safety evaluation
- **[Project Documentation](../docs/README.md)** - Complete project docs

---

**All scripts are designed to make your workflow easier!** ⚡

_Keep scripts organized and documented for team collaboration._
