#!/bin/bash

# Fix camelCase Function Naming Issues
# This script fixes the most common pattern: functions defined as lowercase but called as camelCase

set -e

echo "🔧 Fixing camelCase function naming issues..."
echo ""

# Common patterns to fix (lowercase → camelCase)
declare -A REPLACEMENTS=(
  ["handleclick"]="handleClick"
  ["handlesubmit"]="handleSubmit"
  ["handleclose"]="handleClose"
  ["handlecancel"]="handleCancel"
  ["handleinput"]="handleInput"
  ["handleblur"]="handleBlur"
  ["handlefocus"]="handleFocus"
  ["handlechange"]="handleChange"
  ["handlesave"]="handleSave"
  ["handledelete"]="handleDelete"
  ["handleedit"]="handleEdit"
  ["handlerefresh"]="handleRefresh"
  ["handleretry"]="handleRetry"
  ["handleupgrade"]="handleUpgrade"
  ["handlelogout"]="handleLogout"
  ["handlemouseleave"]="handleMouseLeave"
  ["togglemenu"]="toggleMenu"
  ["togglefilter"]="toggleFilter"
  ["togglefullscreen"]="toggleFullscreen"
  ["togglevoice"]="toggleVoice"
  ["openmenu"]="openMenu"
  ["closemenu"]="closeMenu"
  ["clearfilters"]="clearFilters"
  ["loadhistory"]="loadHistory"
  ["loadpreferences"]="loadPreferences"
  ["savepreferences"]="savePreferences"
  ["selectoption"]="selectOption"
  ["selectplan"]="selectPlan"
  ["selectframework"]="selectFramework"
  ["selectlevel"]="selectLevel"
  ["goback"]="goBack"
  ["gotoquizzes"]="goToQuizzes"
  ["gotostudy"]="goToStudy"
  ["gotobilling"]="goToBilling"
  ["gotopricing"]="goToPricing"
  ["gotoprogress"]="goToProgress"
  ["formatdate"]="formatDate"
  ["formattime"]="formatTime"
  ["getdifficultyicon"]="getDifficultyIcon"
  ["getdifficultylabel"]="getDifficultyLabel"
  ["getdifficultybadgeclass"]="getDifficultyBadgeClass"
  ["animategradient"]="animateGradient"
)

COUNT=0

for old in "${!REPLACEMENTS[@]}"; do
  new="${REPLACEMENTS[$old]}"
  
  # Find all Vue and TS files with the lowercase function definition
  files=$(grep -rl "const $old = " client/src --include="*.vue" --include="*.ts" 2>/dev/null || true)
  
  if [ -n "$files" ]; then
    echo "✅ Renaming $old → $new"
    
    # Replace in each file
    while IFS= read -r file; do
      if [ -f "$file" ]; then
        # Use sed to replace the function name
        if [[ "$OSTYPE" == "darwin"* ]]; then
          # macOS sed
          sed -i '' "s/const $old =/const $new =/g" "$file"
          sed -i '' "s/function $old(/function $new(/g" "$file"
        else
          # Linux sed
          sed -i "s/const $old =/const $new =/g" "$file"
          sed -i "s/function $old(/function $new(/g" "$file"
        fi
        COUNT=$((COUNT + 1))
      fi
    done <<< "$files"
  fi
done

echo ""
echo "✅ Fixed camelCase naming in $COUNT file instances"
echo "🔍 Run 'pnpm typecheck' to verify fixes"

