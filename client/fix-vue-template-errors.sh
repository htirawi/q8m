#!/bin/bash

# Script to fix corrupted Vue template syntax
# This fixes the pattern where ")$t }}" should be ") }}"

echo "Starting Vue template error fix..."
echo "=================================="
echo ""

# Counter for files fixed
files_fixed=0

# Find all Vue files and fix the corrupted pattern
echo "Searching for corrupted templates..."
echo ""

# Pattern 1: Fix ")$t }}" to ") }}"
files_with_errors=$(grep -rl '\$t\s*}}' src/ 2>/dev/null || true)

if [ -z "$files_with_errors" ]; then
    echo "No files with ')$t }}' pattern found."
else
    echo "Files with corrupted templates:"
    echo "$files_with_errors"
    echo ""

    for file in $files_with_errors; do
        echo "Fixing: $file"
        # Use sed to replace )$t }} with ) }}
        sed -i '' 's/)\$t }}/) }}/g' "$file"
        ((files_fixed++))
    done
fi

echo ""
echo "=================================="
echo "Fix Summary:"
echo "Files fixed: $files_fixed"
echo ""

# Verify the fixes
echo "Verifying fixes..."
remaining_errors=$(grep -r '\$t\s*}}' src/ 2>/dev/null | wc -l)
remaining_errors=$(echo $remaining_errors | tr -d ' ')

if [ "$remaining_errors" = "0" ]; then
    echo "✓ All corrupted templates have been fixed!"
else
    echo "⚠ Warning: $remaining_errors corrupted templates still remain."
    echo "Remaining errors:"
    grep -rn '\$t\s*}}' src/
fi

echo ""
echo "Done!"
