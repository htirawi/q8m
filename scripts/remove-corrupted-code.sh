#!/bin/bash

# Remove Corrupted Code Lines
# This script removes syntax-error lines that are duplicates/mangled code

set -e

echo "🧹 Removing corrupted code lines..."

CLIENT_SRC="client/src"

# Array of corrupted patterns to remove (exact line matches)
PATTERNS=(
  "Defaultto100ifnodatastats.value.completionPercentagetotalQuestions0Math"
  "titleObjtitleObj.title"
  "datetypeoftimestampnewDate"
  "errorMessageerrinstanceofErrorerr.message"
  "Adduser - friendlyerrormessageconsterrorMessageerrorinstanceofErrorerror.message"
  "currentHintIndexhints.valueproblemIdproblem.hints.indexOf"
  "dtypeofdatenewDate"
  "inputfield.value"
  "Cannot find name"
  "Defaultto100"
  "optiont ="
  "valuetype ="
)

COUNT=0

for pattern in "${PATTERNS[@]}"; do
  # Find files containing the pattern
  files=$(grep -rl "$pattern" "$CLIENT_SRC" 2>/dev/null || true)
  
  if [ -n "$files" ]; then
    echo "  Removing pattern: $pattern"
    
    while IFS= read -r file; do
      if [ -f "$file" ]; then
        # Remove lines containing the pattern
        if [[ "$OSTYPE" == "darwin"* ]]; then
          # macOS sed
          sed -i '' "/$pattern/d" "$file"
        else
          # Linux sed
          sed -i "/$pattern/d" "$file"
        fi
        COUNT=$((COUNT + 1))
      fi
    done <<< "$files"
  fi
done

echo "✅ Removed corrupted code from $COUNT file instances"

