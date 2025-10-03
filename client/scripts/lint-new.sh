#!/bin/bash

# Lint only the new refactored files to avoid legacy code issues
echo "🔍 Linting new refactored files..."

# Check if we're in the client directory
if [ ! -f "package.json" ]; then
  echo "❌ Please run this script from the client directory"
  exit 1
fi

# Define the new files to lint (excluding CSS files)
NEW_FILES=(
  "src/features/"
  "src/layouts/"
  "src/components/ui/"
  "src/i18n/"
  "src/store/index.ts"
  "src/router/index.ts"
  "src/main.ts"
  "src/App.vue"
)

# Run ESLint on new files only
echo "📁 Linting directories and files: ${NEW_FILES[*]}"

# Use npx to run eslint directly on the new files
npx eslint "${NEW_FILES[@]}" --ext .vue,.ts,.js --max-warnings 0

if [ $? -eq 0 ]; then
  echo "✅ All new files pass linting!"
else
  echo "❌ Some new files have linting errors"
  exit 1
fi
