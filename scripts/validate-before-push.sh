#!/bin/bash

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m' # No Color

# Track failures
FAILURES=0

echo -e "${BOLD}${CYAN}"
echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║                                                               ║"
echo "║         🚀 PRE-PUSH VALIDATION CHECKLIST                      ║"
echo "║         Running all checks before push...                    ║"
echo "║                                                               ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
echo -e "${NC}\n"

# Function to print section headers
print_section() {
    echo -e "\n${BOLD}${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BOLD}${CYAN}🔍 $1${NC}"
    echo -e "${BOLD}${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"
}

# Function to handle success
success() {
    echo -e "${GREEN}✅ $1${NC}"
}

# Function to handle failure
fail() {
    echo -e "${RED}❌ $1${NC}"
    FAILURES=$((FAILURES + 1))
}

# Function to handle warning
warn() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# Function to handle info
info() {
    echo -e "${CYAN}ℹ️  $1${NC}"
}

# 1. Check for uncommitted changes
print_section "Git Status Check"
if [[ -n $(git status --porcelain) ]]; then
    warn "You have uncommitted changes"
    git status --short
else
    success "Working directory is clean"
fi

# 2. Prettier Format Check
print_section "Code Formatting (Prettier)"
if pnpm format:check > /dev/null 2>&1; then
    success "Code formatting is correct"
else
    fail "Code formatting check failed"
    info "Run: pnpm format"
fi

# 3. TypeScript Type Checking
print_section "TypeScript Type Checking"
if pnpm typecheck; then
    success "TypeScript type checking passed"
else
    fail "TypeScript type checking failed"
    info "Fix type errors before pushing"
fi

# 4. ESLint
print_section "ESLint Code Quality"
if pnpm lint:strict > /dev/null 2>&1 || pnpm lint > /dev/null 2>&1; then
    success "ESLint validation passed"
else
    fail "ESLint validation failed"
    info "Run: pnpm lint:fix"
fi

# 5. Unit Tests
print_section "Unit Tests"
if pnpm test:unit; then
    success "All unit tests passed"
else
    fail "Unit tests failed"
    info "Fix failing tests before pushing"
fi

# 6. Production Build
print_section "Production Build"
if pnpm build; then
    success "Production build successful"
else
    fail "Production build failed"
    info "This is the most important check - fix build errors!"
fi

# Summary
echo -e "\n${BOLD}${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BOLD}${CYAN}📊 VALIDATION SUMMARY${NC}"
echo -e "${BOLD}${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"

if [ $FAILURES -eq 0 ]; then
    echo -e "${BOLD}${GREEN}"
    echo "╔═══════════════════════════════════════════════════════════════╗"
    echo "║                                                               ║"
    echo "║                    ✅ ALL CHECKS PASSED!                      ║"
    echo "║                                                               ║"
    echo "║         Your code is ready to be pushed! 🚀                  ║"
    echo "║                                                               ║"
    echo "╚═══════════════════════════════════════════════════════════════╝"
    echo -e "${NC}\n"
    exit 0
else
    echo -e "${BOLD}${RED}"
    echo "╔═══════════════════════════════════════════════════════════════╗"
    echo "║                                                               ║"
    echo "║              ❌ $FAILURES CHECK(S) FAILED                           ║"
    echo "║                                                               ║"
    echo "║         Please fix the issues above before pushing           ║"
    echo "║                                                               ║"
    echo "╚═══════════════════════════════════════════════════════════════╝"
    echo -e "${NC}\n"
    
    echo -e "${YELLOW}${BOLD}💡 Quick Fixes:${NC}"
    echo -e "${YELLOW}  • Code formatting:     ${NC}pnpm format"
    echo -e "${YELLOW}  • Linting issues:      ${NC}pnpm lint:fix"
    echo -e "${YELLOW}  • Type errors:         ${NC}Fix manually based on errors above"
    echo -e "${YELLOW}  • Build errors:        ${NC}Fix manually - these are critical!"
    echo -e "${YELLOW}  • Test failures:       ${NC}Fix failing tests\n"
    
    exit 1
fi

