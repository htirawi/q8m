#!/bin/bash

echo "Scanning for emit mismatches in all Vue files..."
echo "================================================"
echo ""

mismatches_found=0

# Find all Vue files
for file in $(find src -name "*.vue" -type f); do
    # Check if file has defineEmits
    if grep -q 'defineEmits' "$file"; then
        # Extract defined emit names
        defined_emits=$(sed -n '/<script setup lang="ts">/,/<\/script>/p' "$file" | \
            awk '/defineEmits<{/,/}>()/' | \
            grep -o '"[^"]*":' | \
            sed 's/"//g' | sed 's/://g' || true)

        # Extract actual emit calls
        emit_calls=$(grep -o 'emit("[^"]*"' "$file" 2>/dev/null | \
            sed 's/emit("\(.*\)"/\1/' | sort -u || true)

        if [ -n "$defined_emits" ] && [ -n "$emit_calls" ]; then
            # Check for mismatches
            for call in $emit_calls; do
                if ! echo "$defined_emits" | grep -q "^$call$"; then
                    echo "⚠ Mismatch in $file:"
                    echo "   Called: $call"
                    echo "   Defined: $defined_emits"
                    echo ""
                    ((mismatches_found++))
                fi
            done
        fi
    fi
done

echo "================================================"
echo "Total mismatches found: $mismatches_found"
