#!/bin/bash

# Comprehensive Corrupted Code Pattern Fixer
# Fixes all remaining syntax corruption issues across the codebase

set -e

echo "🔧 Fixing all corrupted code patterns..."

cd "$(dirname "$0")/.."
CLIENT_SRC="client/src"

# Fix corrupted variable names and patterns
declare -A PATTERNS=(
  # Corrupted names  
  ["successmessage"]="successMessage"
  ["errinstanceofErrorerr"]="err"
  ["valuetype"]="valueType"
  ["ibadge"]="iBadge"
  ["loadPreview"]="loadPreview"
  ["isAnimating"]="isAnimating"
  ["initializeCheckout"]="initializeCheckout"
  ["displayValue"]="displayValue"
  ["badgeId"]="badgeId"
  
  # Interface naming (lowercase → uppercase)
  ["interface props {"]="interface Props {"
  ["interface emits {"]="interface Emits {"
)

COUNT=0

for pattern in "${!PATTERNS[@]}"; do
  replacement="${PATTERNS[$pattern]}"
  
  # Find files containing the pattern
  if [[ "$pattern" == *"interface"* ]]; then
    # For interface patterns, use exact search
    files=$(grep -rl "$pattern" "$CLIENT_SRC" --include="*.vue" --include="*.ts" 2>/dev/null || true)
  else
    # For variable patterns, search for const declarations
    files=$(grep -rl "const $pattern" "$CLIENT_SRC" --include="*.vue" --include="*.ts" 2>/dev/null || true)
  fi
  
  if [ -n "$files" ]; then
    echo "  ✅ Fixing: $pattern → $replacement"
    
    while IFS= read -r file; do
      if [ -f "$file" ]; then
        if [[ "$OSTYPE" == "darwin"* ]]; then
          if [[ "$pattern" == *"interface"* ]]; then
            sed -i '' "s/$pattern/$replacement/g" "$file"
          else
            sed -i '' "s/const $pattern/const $replacement/g" "$file"
          fi
        else
          if [[ "$pattern" == *"interface"* ]]; then
            sed -i "s/$pattern/$replacement/g" "$file"
          else
            sed -i "s/const $pattern/const $replacement/g" "$file"
          fi
        fi
        COUNT=$((COUNT + 1))
      fi
    done <<< "$files"
  fi
done

# Remove specific corrupted line patterns
echo "  🧹 Removing corrupted code lines..."

# Remove lines with obvious corruption
for file in $(find "$CLIENT_SRC" -name "*.vue" -o -name "*.ts"); do
  if [ -f "$file" ]; then
    if [[ "$OSTYPE" == "darwin"* ]]; then
      sed -i '' '/errinstanceofErrorerr/d' "$file"
      sed -i '' '/Cannot find name/d' "$file"
      sed -i '' '/titleObjtitleObj/d' "$file"
    else
      sed -i '/errinstanceofErrorerr/d' "$file"
      sed -i '/Cannot find name/d' "$file"
      sed -i '/titleObjtitleObj/d' "$file"
    fi
  fi
done

echo "✅ Fixed $COUNT file instances"
echo "💡 Run 'pnpm typecheck' to verify"

