---
description: "Create or update Memory Bank for persistent project context"
---

# /vibedraft.memory-bank

## Purpose
Create or update the Memory Bank - a persistent knowledge system that helps AI assistants maintain context across sessions and memory resets.

## When to Use
- **Initial Setup**: After running `vibedraft init` to create comprehensive project documentation
- **Regular Updates**: After significant changes, new features, or architectural decisions
- **Context Refresh**: When the AI needs a refresher on project state and structure
- **User Request**: When user explicitly asks to "update memory bank"

## Memory Bank Structure

The Memory Bank consists of core files that build upon each other:

```
.cursor/rules/memory-bank/  (or .claude/, .github/, etc.)
├── projectbrief.md         # Foundation - what we're building
├── productContext.md       # Why - problems solved, users, value
├── systemPatterns.md       # How - architecture, patterns, design
├── techContext.md          # What - technologies, setup, constraints
├── activeContext.md        # Now - current focus, recent changes
├── progress.md             # Status - what works, what's left
└── Notes/                  # Additional documentation
```

## File Hierarchy

Files depend on each other:
1. **projectbrief.md** → Foundation for everything
2. **productContext.md, systemPatterns.md, techContext.md** → Build on brief
3. **activeContext.md** → Combines all perspectives for current work
4. **progress.md** → Tracks implementation status

## Process

### 1. Determine Action

**Creating Memory Bank** (if files don't exist):
```bash
vibedraft memory-bank --agent cursor
vibedraft memory-bank --all --minimal
```

**Updating Memory Bank** (if files exist):
- Review all core files
- Update based on recent changes
- Maintain consistency across files

### 2. Gather Information

Before creating/updating, collect:

**From Project Files**:
- `README.md` - Project overview
- `package.json` - Dependencies, scripts, tech stack
- `.vibedraft/memory/constitution.md` - Project principles
- Tech stack detection data (if available)

**From Codebase**:
- Architecture patterns
- Component structure
- Integration points
- Current state of features

**From User**:
- Project goals and vision
- Target users and use cases
- Current priorities
- Known issues or challenges

### 3. Populate Templates

#### projectbrief.md
**What to populate** (100% confident only):
- Project name (from directory/package.json)
- Objective (from package.json description or README)

**What to leave as placeholder**:
- Scope, deliverables, stakeholders (require user input)
- Success criteria, timeline, constraints

#### techContext.md
**What to populate** (from tech detection):
- Technology stack (frontend, backend, languages)
- Build tools and package manager
- Core dependencies (top 10 from package.json)
- Setup requirements (Node.js version if specified)

**What to leave as placeholder**:
- Development tools and IDE setup
- Build and deployment process
- Environment variables
- Configuration details
- Best practices and coding standards

#### systemPatterns.md
**What to populate**:
- Basic architecture from project structure
- Detected patterns (monorepo, microservices, etc.)

**What to leave as placeholder**:
- Detailed data flow
- Security and performance patterns
- Integration specifications
- Error handling approach

#### productContext.md
**What to leave as placeholder**:
- Purpose, problems solved (require user input)
- Target users and journey
- UX goals and business value

#### activeContext.md
**What to populate**:
- Current date and "Initial setup" as focus
- "Memory Bank created" as recent change

**What to leave as placeholder**:
- Next steps
- Active decisions
- Current challenges

#### progress.md
**What to populate**:
- "Project initialized" as completed
- "Memory Bank created" as achievement

**What to leave as placeholder**:
- In-progress tasks
- Phases and milestones
- Known issues and technical debt

### 4. Maintain Consistency

When updating, ensure:

✓ **Cross-References Match**
- Tech stack is consistent between techContext.md and systemPatterns.md
- Features mentioned in progress.md align with activeContext.md
- Constraints in projectbrief.md match techContext.md

✓ **Dates are Current**
- Update activeContext.md with current date
- Mark progress.md achievements with recent work

✓ **Placeholders are Clear**
- Use format: `[Action needed - specific guidance]`
- Don't mix populated and placeholder content confusingly

✓ **File Purposes Respected**
- projectbrief.md = high-level scope
- techContext.md = technologies only
- systemPatterns.md = architecture only
- productContext.md = user/business perspective
- activeContext.md = current state
- progress.md = status tracking

### 5. Update Process (when user says "update memory bank")

**MUST review ALL files**, even if no changes needed:

1. **projectbrief.md**
   - Has project scope changed?
   - Are goals still accurate?
   - Update if scope expanded or constraints changed

2. **productContext.md**
   - Has target audience changed?
   - Are there new use cases?
   - Update user journey if workflow changed

3. **systemPatterns.md**
   - New architectural patterns introduced?
   - Changed data flow or integration points?
   - Update with new design decisions

4. **techContext.md**
   - New dependencies added?
   - Tech stack changes?
   - Update if build process or setup changed

5. **activeContext.md** (almost always update)
   - What's the current focus?
   - What changed recently?
   - What are immediate next steps?
   - Any active decisions or challenges?

6. **progress.md** (almost always update)
   - Move completed items to "What Works"
   - Update "In Progress" with current tasks
   - Adjust phases based on reality
   - Document new achievements

### 6. Output Format

After creating/updating, provide:

```markdown
## Memory Bank Update Summary

### Files Created/Updated:
- ✓ projectbrief.md - [description of changes]
- ✓ techContext.md - [description of changes]
- ✓ activeContext.md - [description of changes]
- ✓ progress.md - [description of changes]

### Key Changes:
1. [Significant change 1]
2. [Significant change 2]

### Still Needs User Input:
- [ ] Project scope definition (projectbrief.md)
- [ ] Target users and use cases (productContext.md)
- [ ] Success metrics (productContext.md)

### Next Actions:
1. Review populated files for accuracy
2. Fill in remaining placeholders
3. Start first feature spec
```

## Minimal vs Full Memory Bank

### Minimal (--minimal flag)
**Best for**: Small projects, prototypes, focused tools, single-purpose apps

**Files included**:
- projectbrief.md
- techContext.md
- activeContext.md

**Use when**:
- Project scope is small and well-defined
- Team is small or solo developer
- Minimal documentation overhead desired

### Full (default)
**Best for**: Large projects, teams, complex systems, long-term projects

**Files included**:
- All 6 core files
- Notes/ directory for additional documentation

**Use when**:
- Complex architecture needs documentation
- Multiple stakeholders or team members
- Project will evolve significantly over time

## Tips

1. **Start Minimal, Expand Later**
   - Begin with --minimal flag
   - Add full structure when complexity grows

2. **Regular Updates**
   - Update activeContext.md frequently (weekly)
   - Update progress.md after features complete
   - Update others when major changes occur

3. **Use Notes/ for Details**
   - Create feature-specific docs in Notes/
   - Keep core files concise
   - Link from core files to detailed notes

4. **Respect File Boundaries**
   - Don't duplicate information across files
   - Reference other files instead of repeating
   - Keep each file focused on its purpose

5. **Auto-Population Balance**
   - Only populate what's 100% certain
   - Leave clear placeholders for unknowns
   - Don't guess or assume requirements

## Example Update Session

```markdown
User: "update memory bank"

AI Response:
# Memory Bank Update

Reviewing all core files...

## Updates Made

### activeContext.md
- **Current Focus**: Implementing user authentication feature
- **Recent Changes**: 
  - Added JWT token handling
  - Created login/signup UI components
  - Set up auth middleware
- **Next Steps**: Password reset flow, email verification

### progress.md
- **Completed**: 
  - ✓ User registration
  - ✓ Login functionality
  - ✓ Token-based auth
- **In Progress**: Password reset
- **Phase 1 Status**: 60% complete

### techContext.md
- **New Dependencies**: 
  - jsonwebtoken@9.0.0
  - bcrypt@5.1.0
- **Security Patterns**: Added token refresh strategy

### Other Files
- projectbrief.md: ✓ No changes needed
- productContext.md: ✓ No changes needed
- systemPatterns.md: ✓ No changes needed

## Summary
Memory Bank updated with authentication feature progress.
All files reviewed and current as of {date}.
```

## Remember

- Memory Bank is for AI persistence across sessions
- Keep information accurate and up-to-date
- Balance between detail and maintainability
- Update regularly but don't over-document
- Use placeholders liberally for unknowns
- Only populate what you're certain about

## Related Commands

- `/vibedraft.init` - Initialize VibeDraft project
- `/vibedraft.constitution` - Update project constitution
- `/vibedraft.plan` - Create feature implementation plan

