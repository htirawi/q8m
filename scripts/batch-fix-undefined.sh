#!/bin/bash

# Batch fix TS18048 (possibly undefined) errors
# Adds ?? defaults and optional chaining

cd "$(dirname "$0")/.."

echo "🔧 Batch fixing TS18048 (possibly undefined) errors..."

# Get list of files with TS18048 errors
FILES=$(cd client && npx vue-tsc --noEmit 2>&1 | grep "error TS18048" | sed 's/^src\///' | sed 's/([0-9]*,.*//' | sort -u)

FIXED=0

for file in $FILES; do
  fullpath="client/src/$file"
  if [ -f "$fullpath" ]; then
    # Backup
    cp "$fullpath" "$fullpath.bak"
    
    # Fix common patterns
    sed -i '' \
      -e 's/\.level)/\.level ?? 0)/g' \
      -e 's/\.total)/\.total ?? 0)/g' \
      -e 's/\.total >/\.total ?? 0 >/g' \
      -e 's/priceMonthly)/priceMonthly ?? 0)/g' \
      -e 's/priceYearly)/priceYearly ?? 0)/g' \
      "$fullpath" 2>/dev/null || true
    
    # Check if file changed
    if ! diff -q "$fullpath" "$fullpath.bak" > /dev/null 2>&1; then
      ((FIXED++))
      echo "✅ Fixed: $file"
      rm "$fullpath.bak"
    else
      # Restore if no changes
      mv "$fullpath.bak" "$fullpath"
    fi
  fi
done

echo ""
echo "📊 Fixed patterns in $FIXED files"
echo "🔍 Run typecheck to see remaining errors"

