# Internal Scripts Documentation

This folder contains internal development scripts for question management and data processing. These scripts are **NOT** intended for public use and should not be included in production deployments.

## 🚨 Important Notice

**These scripts are for internal development use only:**

- ❌ Do not include in production builds
- ❌ Do not distribute to end users
- ❌ Do not commit sensitive data or API keys
- ✅ Use only for development and content management
- ✅ Keep in internal folder for organization

## 📁 Script Categories

### Question Management Scripts

- `add-questions.js` - Add new questions to the database
- `advanced-question-manager.js` - Advanced question management tools
- `angular-cleanup.js` - Angular-specific data cleanup
- `csv-parser.js` - Parse CSV question files
- `csv-recovery.js` - Recover corrupted CSV files
- `csv-inspector.js` - Inspect and validate CSV files
- `convert-md-to-ts.cjs` - Convert Markdown to TypeScript

## 🛠️ Script Evaluation & Usage

### ✅ Production Ready Scripts

These scripts are well-structured and safe for internal use:

#### `add-questions.js`

- **Purpose**: Add new questions to the database
- **Safety**: ✅ Safe for internal use
- **Dependencies**: Minimal external dependencies
- **Error Handling**: Basic error handling implemented
- **Usage**: `node scripts/internal/add-questions.js`

#### `csv-parser.js`

- **Purpose**: Parse CSV files into question format
- **Safety**: ✅ Safe for internal use
- **Validation**: Includes data validation
- **Error Handling**: Comprehensive error handling
- **Usage**: `node scripts/internal/csv-parser.js input.csv`

#### `csv-inspector.js`

- **Purpose**: Inspect and validate CSV files
- **Safety**: ✅ Safe for internal use
- **Read-only**: No data modification
- **Usage**: `node scripts/internal/csv-inspector.js file.csv`

### ⚠️ Scripts Requiring Review

#### `advanced-question-manager.js`

- **Purpose**: Advanced question management with multiple formats
- **Safety**: ⚠️ Requires review
- **Complexity**: High complexity with multiple features
- **Dependencies**: Multiple external dependencies
- **Recommendation**: Review before use, test in isolated environment

#### `angular-cleanup.js`

- **Purpose**: Clean up Angular-specific data
- **Safety**: ⚠️ Data modification script
- **Risk**: Could modify production data
- **Recommendation**: Test thoroughly, backup data before use

#### `csv-recovery.js`

- **Purpose**: Recover corrupted CSV files
- **Safety**: ⚠️ Data recovery script
- **Risk**: Could modify file structure
- **Recommendation**: Use with caution, backup original files

### 🔧 Utility Scripts

#### `convert-md-to-ts.cjs`

- **Purpose**: Convert Markdown documentation to TypeScript
- **Safety**: ✅ Safe for internal use
- **Read-only**: No data modification
- **Usage**: `node scripts/internal/convert-md-to-ts.cjs input.md`

## 📋 Usage Guidelines

### Before Using Any Script

1. **Read the script documentation**
2. **Test in a safe environment**
3. **Backup important data**
4. **Review the code for safety**

### Safe Usage Pattern

```bash
# 1. Navigate to project root
cd /path/to/project

# 2. Backup data (if script modifies data)
cp -r src/data src/data.backup

# 3. Test script with sample data
node scripts/internal/script-name.js --test

# 4. Run script with real data
node scripts/internal/script-name.js --input data.csv
```

### Error Handling

All scripts should:

- ✅ Validate input parameters
- ✅ Handle file not found errors
- ✅ Provide meaningful error messages
- ✅ Exit gracefully on errors

## 🔒 Security Considerations

### Data Protection

- **No API Keys**: Scripts should not contain hardcoded API keys
- **No Sensitive Data**: Remove any sensitive information before committing
- **Input Validation**: All inputs should be validated
- **File Permissions**: Ensure proper file permissions

### Network Security

- **No External Calls**: Scripts should not make unnecessary external API calls
- **Local Processing**: Prefer local processing over remote services
- **Secure Protocols**: Use HTTPS for any required external calls

## 📊 Script Performance

### Performance Metrics

- **Execution Time**: Most scripts complete in < 30 seconds
- **Memory Usage**: Minimal memory footprint
- **File I/O**: Optimized for large file processing
- **Error Recovery**: Graceful error handling

### Optimization Recommendations

- Use streaming for large files
- Implement progress indicators for long-running scripts
- Add logging for debugging
- Use efficient data structures

## 🧪 Testing Scripts

### Test Environment Setup

```bash
# Create test directory
mkdir -p scripts/internal/test-data

# Copy sample data
cp questions/sample-questions.json scripts/internal/test-data/

# Run tests
node scripts/internal/script-name.js --test
```

### Test Cases

Each script should have:

- ✅ Valid input test
- ✅ Invalid input test
- ✅ Empty file test
- ✅ Large file test
- ✅ Error condition test

## 📝 Maintenance

### Regular Tasks

- **Update Dependencies**: Monthly dependency updates
- **Security Review**: Quarterly security review
- **Performance Testing**: Annual performance testing
- **Documentation Updates**: Update docs with script changes

### Version Control

- **Git Ignore**: Add sensitive files to .gitignore
- **Commit Messages**: Use descriptive commit messages
- **Branch Strategy**: Use feature branches for script development
- **Code Review**: Review all script changes

## 🚫 What NOT to Do

### Security Violations

- ❌ Hardcode API keys or passwords
- ❌ Commit sensitive data
- ❌ Use insecure file operations
- ❌ Make unnecessary external calls

### Development Mistakes

- ❌ Skip input validation
- ❌ Ignore error handling
- ❌ Use deprecated APIs
- ❌ Skip testing

## 📞 Support

### Getting Help

- **Documentation**: Check script-specific documentation
- **Code Review**: Review script source code
- **Testing**: Test in isolated environment
- **Backup**: Always backup before running scripts

### Reporting Issues

- **Bug Reports**: Use GitHub Issues for script bugs
- **Feature Requests**: Submit enhancement requests
- **Security Issues**: Report security concerns privately
- **Documentation**: Suggest documentation improvements

---

**Remember**: These scripts are for internal development use only. Always test thoroughly and backup data before use.
