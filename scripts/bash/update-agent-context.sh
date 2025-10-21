#!/usr/bin/env bash

# update-agent-context.sh
# Update agent context files with latest project information

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${CYAN}=== VibeDraft Agent Context Update ===${NC}"
echo ""

# Find the repository root
REPO_ROOT=$(git rev-parse --show-toplevel 2>/dev/null || pwd)

# Detect which agent directories exist
AGENT_DIRS=()
[ -d "$REPO_ROOT/.claude" ] && AGENT_DIRS+=(".claude")
[ -d "$REPO_ROOT/.cursor" ] && AGENT_DIRS+=(".cursor")
[ -d "$REPO_ROOT/.gemini" ] && AGENT_DIRS+=(".gemini")
[ -d "$REPO_ROOT/.github" ] && AGENT_DIRS+=(".github")
[ -d "$REPO_ROOT/.qwen" ] && AGENT_DIRS+=(".qwen")
[ -d "$REPO_ROOT/.opencode" ] && AGENT_DIRS+=(".opencode")
[ -d "$REPO_ROOT/.windsurf" ] && AGENT_DIRS+=(".windsurf")
[ -d "$REPO_ROOT/.amazonq" ] && AGENT_DIRS+=(".amazonq")
[ -d "$REPO_ROOT/.codex" ] && AGENT_DIRS+=(".codex")
[ -d "$REPO_ROOT/.augment" ] && AGENT_DIRS+=(".augment")
[ -d "$REPO_ROOT/.roo" ] && AGENT_DIRS+=(".roo")

if [ ${#AGENT_DIRS[@]} -eq 0 ]; then
    echo -e "${YELLOW}No agent directories found${NC}"
    exit 0
fi

echo "Found agent directories:"
for dir in "${AGENT_DIRS[@]}"; do
    echo "  - $dir"
done
echo ""

# Update context for each agent
for agent_dir in "${AGENT_DIRS[@]}"; do
    AGENT_NAME=$(basename "$agent_dir")
    
    # Determine rules/context file location based on agent
    case $agent_dir in
        .claude)
            RULES_FILE="$REPO_ROOT/.claude/rules/vibedraft-rules.md"
            ;;
        .cursor)
            RULES_FILE="$REPO_ROOT/.cursor/rules/vibedraft-rules.md"
            ;;
        .gemini)
            RULES_FILE="$REPO_ROOT/.gemini/context/vibedraft-context.md"
            ;;
        .github)
            RULES_FILE="$REPO_ROOT/.github/copilot/vibedraft-context.md"
            ;;
        *)
            RULES_FILE="$REPO_ROOT/${agent_dir}/context/vibedraft-context.md"
            ;;
    esac
    
    # Create rules directory if it doesn't exist
    mkdir -p "$(dirname "$RULES_FILE")"
    
    # Create or update rules file
    if [ ! -f "$RULES_FILE" ]; then
        cat > "$RULES_FILE" << EOF
# VibeDraft Context

This project uses VibeDraft for spec-driven development.

## Key Directories

- \`.vibedraft/specs/\` - Feature specifications (or \`specs/\` for legacy projects)
- \`plans/\` - Implementation plans
- \`tasks/\` - Actionable task lists
- \`.vibedraft/\` - Templates and scripts

## Available Commands

- \`/vibedraft.constitution\` - Establish project principles
- \`/vibedraft.draft\` - Create baseline specification
- \`/vibedraft.plan\` - Create implementation plan
- \`/vibedraft.tasks\` - Generate actionable tasks
- \`/vibedraft.implement\` - Execute implementation
- \`/vibedraft.analyze\` - Cross-artifact consistency check
- \`/vibedraft.clarify\` - Ask structured questions
- \`/vibedraft.checklist\` - Generate quality checklists

## Last Updated

$(date)
EOF
        echo -e "${GREEN}✓${NC} Created context file for ${AGENT_NAME}"
    else
        # Update timestamp
        sed -i.bak "s/^## Last Updated$/## Last Updated\n\n$(date)/" "$RULES_FILE" 2>/dev/null || true
        rm -f "${RULES_FILE}.bak" 2>/dev/null || true
        echo -e "${GREEN}✓${NC} Updated context file for ${AGENT_NAME}"
    fi
done

echo ""
echo -e "${GREEN}Agent context files updated successfully!${NC}"

