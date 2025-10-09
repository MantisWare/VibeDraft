#!/usr/bin/env bash

# check-prerequisites.sh
# Check for required tools and dependencies

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${CYAN}=== VibeDraft Prerequisites Check ===${NC}"
echo ""

# Track if all checks pass
ALL_CHECKS_PASSED=true

# Check for Node.js
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo -e "${GREEN}✓${NC} Node.js: ${NODE_VERSION}"
else
    echo -e "${RED}✗${NC} Node.js: Not found"
    ALL_CHECKS_PASSED=false
fi

# Check for npm
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version)
    echo -e "${GREEN}✓${NC} npm: ${NPM_VERSION}"
else
    echo -e "${RED}✗${NC} npm: Not found"
    ALL_CHECKS_PASSED=false
fi

# Check for git
if command -v git &> /dev/null; then
    GIT_VERSION=$(git --version)
    echo -e "${GREEN}✓${NC} Git: ${GIT_VERSION}"
else
    echo -e "${YELLOW}!${NC} Git: Not found (optional, but recommended)"
fi

echo ""

if [ "$ALL_CHECKS_PASSED" = true ]; then
    echo -e "${GREEN}All required prerequisites are installed!${NC}"
    exit 0
else
    echo -e "${RED}Some required prerequisites are missing. Please install them and try again.${NC}"
    exit 1
fi

