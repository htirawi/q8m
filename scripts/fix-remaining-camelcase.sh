#!/bin/bash

# Fix remaining camelCase issues that the first script missed
# Targets specific corrupted patterns found in type errors

set -e

echo "🔧 Fixing remaining camelCase issues..."

cd "$(dirname "$0")/.."

# Additional patterns missed by first script
declare -A FIXES=(
  ["handlegoback"]="handleGoBack"
  ["handlereload"]="handleReload"
  ["togglemultipleanswer"]="toggleMultipleAnswer"
  ["isanswerrevealed"]="isAnswerRevealed"
  ["iscorrectoption"]="isCorrectOption"
  ["handledragstart"]="handleDragStart"
)

COUNT=0

for old in "${!FIXES[@]}"; do
  new="${FIXES[$old]}"
  
  # Replace in Vue and TS files
  files=$(grep -rl "const $old " client/src --include="*.vue" --include="*.ts" 2>/dev/null || true)
  
  if [ -n "$files" ]; then
    echo "  ✅ $old → $new"
    
    while IFS= read -r file; do
      if [ -f "$file" ]; then
        if [[ "$OSTYPE" == "darwin"* ]]; then
          sed -i '' "s/const $old =/const $new =/g" "$file"
        else
          sed -i "s/const $old =/const $new =/g" "$file"
        fi
        COUNT=$((COUNT + 1))
      fi
    done <<< "$files"
  fi
done

echo "✅ Fixed $COUNT instances"

