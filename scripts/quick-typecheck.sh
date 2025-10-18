#!/usr/bin/env bash

#################################################################
# Quick TypeScript Type Check Script
#
# Purpose: Fast type checking for development workflow
# Usage: ./scripts/quick-typecheck.sh [--watch] [--client] [--server]
#################################################################

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Options
WATCH=false
CLIENT_ONLY=false
SERVER_ONLY=false

# Parse arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    --watch|-w)
      WATCH=true
      shift
      ;;
    --client|-c)
      CLIENT_ONLY=true
      shift
      ;;
    --server|-s)
      SERVER_ONLY=true
      shift
      ;;
    --help|-h)
      echo "Usage: $0 [OPTIONS]"
      echo ""
      echo "Options:"
      echo "  --watch, -w    Watch mode for continuous type checking"
      echo "  --client, -c   Check client only"
      echo "  --server, -s   Check server only"
      echo "  --help, -h     Show this help message"
      exit 0
      ;;
    *)
      echo "Unknown option: $1"
      exit 1
      ;;
  esac
done

echo -e "${BLUE}🔍 Running TypeScript type check...${NC}"
echo ""

# Check client
check_client() {
  if [ "$SERVER_ONLY" = false ]; then
    echo -e "${YELLOW}📦 Checking client...${NC}"
    cd client
    if [ "$WATCH" = true ]; then
      npx vue-tsc --noEmit --watch
    else
      npx vue-tsc --noEmit
    fi
    cd ..
    echo -e "${GREEN}✅ Client type check passed${NC}"
  fi
}

# Check server
check_server() {
  if [ "$CLIENT_ONLY" = false ]; then
    echo -e "${YELLOW}🖥️  Checking server...${NC}"
    cd server
    if [ "$WATCH" = true ]; then
      npx tsc --noEmit --watch
    else
      npx tsc --noEmit
    fi
    cd ..
    echo -e "${GREEN}✅ Server type check passed${NC}"
  fi
}

# Run checks
ERROR=false

if ! check_client; then
  ERROR=true
fi

if ! check_server; then
  ERROR=true
fi

# Final result
echo ""
if [ "$ERROR" = true ]; then
  echo -e "${RED}❌ Type check failed!${NC}"
  echo -e "${YELLOW}💡 Fix the errors above before committing.${NC}"
  exit 1
else
  echo -e "${GREEN}✅ All type checks passed!${NC}"
  exit 0
fi
