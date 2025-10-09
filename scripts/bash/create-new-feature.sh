#!/usr/bin/env bash

# create-new-feature.sh
# Create a new feature specification with proper structure

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Get feature name from argument or prompt
FEATURE_NAME="${1:-}"

if [ -z "$FEATURE_NAME" ]; then
    echo -e "${CYAN}Enter feature name:${NC}"
    read -r FEATURE_NAME
fi

if [ -z "$FEATURE_NAME" ]; then
    echo -e "${RED}Error: Feature name is required${NC}"
    exit 1
fi

# Sanitize feature name for filename
FEATURE_SLUG=$(echo "$FEATURE_NAME" | tr '[:upper:]' '[:lower:]' | tr ' ' '-' | sed 's/[^a-z0-9-]//g')

# Create specs directory if it doesn't exist
mkdir -p specs

# Create feature spec file
SPEC_FILE="specs/${FEATURE_SLUG}.md"

if [ -f "$SPEC_FILE" ]; then
    echo -e "${RED}Error: Feature spec already exists: ${SPEC_FILE}${NC}"
    exit 1
fi

# Get template path
TEMPLATE_PATH=".vibedraft/templates/spec-template.md"

if [ -f "$TEMPLATE_PATH" ]; then
    # Copy template and replace placeholder
    sed "s/{{FEATURE_NAME}}/${FEATURE_NAME}/g" "$TEMPLATE_PATH" > "$SPEC_FILE"
else
    # Create basic spec if template doesn't exist
    cat > "$SPEC_FILE" << EOF
# Feature Specification: ${FEATURE_NAME}

## Overview

Brief description of the feature.

## Requirements

### Functional Requirements

1. Requirement 1
2. Requirement 2

### Non-Functional Requirements

1. Performance considerations
2. Security considerations

## Implementation Notes

Key implementation details and considerations.

## Acceptance Criteria

- [ ] Criterion 1
- [ ] Criterion 2

EOF
fi

echo -e "${GREEN}✓${NC} Created feature spec: ${SPEC_FILE}"
echo ""
echo "Next steps:"
echo "  1. Edit the spec file: ${SPEC_FILE}"
echo "  2. Run /vibedraft.plan to create implementation plan"
echo "  3. Run /vibedraft.tasks to generate actionable tasks"

