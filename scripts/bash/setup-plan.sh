#!/usr/bin/env bash

# setup-plan.sh
# Set up planning artifacts and directory structure

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${CYAN}=== VibeDraft Planning Setup ===${NC}"
echo ""

# Create planning directory structure
mkdir -p plans
mkdir -p specs
mkdir -p tasks

# Create plans directory
if [ ! -d "plans" ]; then
    mkdir -p plans
    echo -e "${GREEN}✓${NC} Created plans directory"
else
    echo -e "${CYAN}→${NC} Plans directory already exists"
fi

# Create specs directory
if [ ! -d "specs" ]; then
    mkdir -p specs
    echo -e "${GREEN}✓${NC} Created specs directory"
else
    echo -e "${CYAN}→${NC} Specs directory already exists"
fi

# Create tasks directory
if [ ! -d "tasks" ]; then
    mkdir -p tasks
    echo -e "${GREEN}✓${NC} Created tasks directory"
else
    echo -e "${CYAN}→${NC} Tasks directory already exists"
fi

# Create .gitkeep files to ensure directories are tracked
touch plans/.gitkeep 2>/dev/null || true
touch specs/.gitkeep 2>/dev/null || true
touch tasks/.gitkeep 2>/dev/null || true

echo ""
echo -e "${GREEN}Planning structure is ready!${NC}"
echo ""
echo "Directory structure:"
echo "  plans/  - Implementation plans"
echo "  specs/  - Feature specifications"
echo "  tasks/  - Actionable task lists"

