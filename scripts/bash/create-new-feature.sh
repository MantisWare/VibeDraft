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

# Determine specs directory (prefer new location, support old for backward compatibility)
if [ -d ".vibedraft/specs" ]; then
    SPECS_DIR=".vibedraft/specs"
elif [ -d "specs" ]; then
    SPECS_DIR="specs"
else
    # Create new location by default
    SPECS_DIR=".vibedraft/specs"
    mkdir -p "$SPECS_DIR"
fi

# Create feature spec file
SPEC_FILE="${SPECS_DIR}/${FEATURE_SLUG}.md"

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

# Discover ALL markdown files in project (excluding common non-doc directories and VibeDraft's own README)
echo -e "${CYAN}🔍 Discovering project documentation...${NC}" >&2

PRIORITY_FILES=()
SPEC_FILES=()
OTHER_FILES=()

# Priority files in root
for file in README.md ARCHITECTURE.md CONTRIBUTING.md DESIGN.md DESIGN_SYSTEM.md; do
    if [ -f "$file" ]; then
        PRIORITY_FILES+=("$(pwd)/$file")
    fi
done

# Find all other markdown files recursively, excluding common build/dependency dirs
while IFS= read -r -d '' file; do
    # Get relative path
    rel_path="${file#./}"
    
    # Skip the spec file we just created
    [ "$rel_path" = "$SPEC_FILE" ] && continue
    
    # Categorize the file
    if [[ "$rel_path" == specs/* ]]; then
        SPEC_FILES+=("$(pwd)/$rel_path")
    else
        OTHER_FILES+=("$(pwd)/$rel_path")
    fi
done < <(find . -type f -name "*.md" \
    -not -path "*/node_modules/*" \
    -not -path "*/.git/*" \
    -not -path "*/build/*" \
    -not -path "*/dist/*" \
    -not -path "*/coverage/*" \
    -not -path "*/.next/*" \
    -not -path "*/.nuxt/*" \
    -not -path "*/vendor/*" \
    -not -path "*/__pycache__/*" \
    -not -path "*/.venv/*" \
    -not -path "*/venv/*" \
    -not -name "VIBEDRAFT_README.md" \
    -print0 2>/dev/null)

# Combine all context files in priority order
ALL_CONTEXT_FILES=("${PRIORITY_FILES[@]}" "${SPEC_FILES[@]}" "${OTHER_FILES[@]}")
FILE_COUNT=${#ALL_CONTEXT_FILES[@]}

if [ $FILE_COUNT -gt 0 ]; then
    echo -e "${GREEN}✓${NC} Found ${FILE_COUNT} documentation file(s)" >&2
else
    echo -e "${CYAN}ℹ${NC} No additional documentation found (that's okay!)" >&2
fi

# Output JSON with categorized context files
echo "{"
echo "  \"branch_name\": \"feature-${FEATURE_SLUG}\","
echo "  \"spec_file\": \"$(pwd)/$SPEC_FILE\","
echo "  \"feature_dir\": \"$(pwd)/specs\","
echo "  \"context_files\": {"
echo "    \"priority\": ["
for i in "${!PRIORITY_FILES[@]}"; do
    echo -n "      \"${PRIORITY_FILES[$i]}\""
    [ $i -lt $(( ${#PRIORITY_FILES[@]} - 1 )) ] && echo "," || echo ""
done
echo "    ],"
echo "    \"specs\": ["
for i in "${!SPEC_FILES[@]}"; do
    echo -n "      \"${SPEC_FILES[$i]}\""
    [ $i -lt $(( ${#SPEC_FILES[@]} - 1 )) ] && echo "," || echo ""
done
echo "    ],"
echo "    \"other\": ["
for i in "${!OTHER_FILES[@]}"; do
    echo -n "      \"${OTHER_FILES[$i]}\""
    [ $i -lt $(( ${#OTHER_FILES[@]} - 1 )) ] && echo "," || echo ""
done
echo "    ],"
echo "    \"total_count\": $FILE_COUNT"
echo "  }"
echo "}"
