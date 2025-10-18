#!/bin/bash

echo "==================================="
echo "Comprehensive Vue File Error Fixer"
echo "==================================="
echo ""

# Counter
total_fixes=0

# 1. Fix emit name mismatches
echo "1. Checking for emit name mismatches..."
echo "-----------------------------------"

# Check RecentActivity.vue specifically
file="src/components/dashboard/RecentActivity.vue"
if [ -f "$file" ]; then
    if grep -q 'emit("activity-click"' "$file"; then
        echo "Fixing emit mismatch in $file"
        sed -i '' 's/emit("activity-click"/emit("action-click"/g' "$file"
        ((total_fixes++))
    fi
fi

echo ""

# 2. Fix )$t }} patterns (already done, but double-check)
echo "2. Checking for )$t }} patterns..."
echo "-----------------------------------"

remaining=$(grep -r '\$t\s*}}' src/ 2>/dev/null | wc -l | tr -d ' ')
if [ "$remaining" != "0" ]; then
    echo "Found $remaining instances of )$t }} pattern"
    files_with_errors=$(grep -rl '\$t\s*}}' src/ 2>/dev/null || true)

    for file in $files_with_errors; do
        echo "Fixing: $file"
        sed -i '' 's/)\$t }}/) }}/g' "$file"
        ((total_fixes++))
    done
else
    echo "✓ No )$t }} patterns found"
fi

echo ""

# 3. Check for missing lang="ts" in script tags
echo "3. Checking script tags..."
echo "-----------------------------------"

# Find Vue files with <script setup> but without lang="ts"
missing_lang=$(grep -l '<script setup>' src/**/*.vue 2>/dev/null | while read file; do
    if ! grep -q '<script setup lang="ts">' "$file"; then
        echo "$file"
    fi
done)

if [ -n "$missing_lang" ]; then
    echo "Files with missing lang=\"ts\":"
    echo "$missing_lang"
else
    echo "✓ All script tags have lang=\"ts\""
fi

echo ""

# 4. Look for common TypeScript errors in emits
echo "4. Scanning for emit-related issues..."
echo "-----------------------------------"

# Find files where emits are used but not defined
for file in $(find src -name "*.vue" -type f); do
    # Extract emit calls
    emit_calls=$(grep -o 'emit("[^"]*"' "$file" 2>/dev/null | sed 's/emit("\(.*\)"/\1/' | sort -u)

    if [ -n "$emit_calls" ]; then
        # Check if defineEmits exists
        if ! grep -q 'defineEmits' "$file" 2>/dev/null; then
            echo "⚠ $file has emit calls but no defineEmits"
        fi
    fi
done

echo ""

# 5. Summary
echo "==================================="
echo "Fix Summary"
echo "==================================="
echo "Total fixes applied: $total_fixes"
echo ""

# Final verification
echo "Running final verification..."
errors_remaining=$(grep -r '\$t\s*}}' src/ 2>/dev/null | wc -l | tr -d ' ')
echo "Corrupted templates remaining: $errors_remaining"

echo ""
echo "Done!"
echo ""
echo "Note: If VS Code still shows errors in templates,"
echo "try reloading the VS Code window (Cmd+Shift+P -> Reload Window)"
