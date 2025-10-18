#!/usr/bin/env bash

#################################################################
# Pre-commit Type Check for Staged Files
#
# Purpose: Fast type checking ONLY for staged files
# This prevents committing type errors while being fast enough
# that developers won't skip it with --no-verify
#################################################################

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Get staged TypeScript and Vue files
STAGED_CLIENT_FILES=$(git diff --cached --name-only --diff-filter=ACMR | grep "^client/src/.*\.\(ts\|vue\)$" || true)
STAGED_SERVER_FILES=$(git diff --cached --name-only --diff-filter=ACMR | grep "^server/src/.*\.ts$" || true)

# Skip if no TypeScript/Vue files are staged
if [ -z "$STAGED_CLIENT_FILES" ] && [ -z "$STAGED_SERVER_FILES" ]; then
  echo -e "${GREEN}✅ No TypeScript/Vue files staged, skipping type check${NC}"
  exit 0
fi

echo -e "${BLUE}🔍 Running quick type check on staged files...${NC}"

# Check client files
if [ -n "$STAGED_CLIENT_FILES" ]; then
  echo -e "${YELLOW}📦 Type checking staged client files...${NC}"

  # Run full typecheck (fast in strict mode, catches cross-file errors)
  cd client
  npx vue-tsc --noEmit || {
    echo -e "${RED}❌ Client type check failed!${NC}"
    echo -e "${YELLOW}💡 Staged files with potential type errors:${NC}"
    echo "$STAGED_CLIENT_FILES" | sed 's/^client\//  - /'
    echo ""
    echo -e "${YELLOW}Fix the errors or use 'git commit --no-verify' to skip (NOT recommended)${NC}"
    exit 1
  }
  cd ..
  echo -e "${GREEN}✅ Client type check passed${NC}"
fi

# Check server files
if [ -n "$STAGED_SERVER_FILES" ]; then
  echo -e "${YELLOW}🖥️  Type checking staged server files...${NC}"

  cd server
  npx tsc --noEmit || {
    echo -e "${RED}❌ Server type check failed!${NC}"
    echo -e "${YELLOW}💡 Staged files with potential type errors:${NC}"
    echo "$STAGED_SERVER_FILES" | sed 's/^server\//  - /'
    echo ""
    echo -e "${YELLOW}Fix the errors or use 'git commit --no-verify' to skip (NOT recommended)${NC}"
    exit 1
  }
  cd ..
  echo -e "${GREEN}✅ Server type check passed${NC}"
fi

echo -e "${GREEN}✅ Type check passed for all staged files!${NC}"
exit 0
