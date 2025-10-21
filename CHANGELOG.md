# Changelog

All notable changes to VibeDraft CLI are documented here.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

## [1.1.1] - 2025-01-21

### Changed

- **Check Command Enhancement**
  - Added version display to `vibedraft check` output
  - Added author attribution (MantisWare - Waldo Marais)
  - Improved output formatting with panel design
  - Added tools availability summary (X/Y tools available)
  - Enhanced completion messages and tips
  - Better visual hierarchy and organization
  
- **Banner Improvement**
  - Added spacing at the top of banner for better visual appeal
  - Improved breathing room in terminal output

## [1.1.0] - 2025-01-21

### 🧠 Memory Bank System - Multi-Agent Support

This release introduces the comprehensive Memory Bank system for all supported AI agents, providing persistent project context across sessions.

### Added

- **Memory Bank System** - Persistent knowledge base for AI assistants
  - Automatic creation during `vibedraft init` for all agents
  - Support for all 12 AI agents (Cursor, Claude, Copilot, Gemini, Windsurf, Qwen, opencode, Amazon Q, Codex, Kilocode, Auggie, Roo)
  - Core files: projectbrief.md, productContext.md, systemPatterns.md, techContext.md, activeContext.md, progress.md
  - Agent-specific formats and directory structures
  - Notes/ subdirectory for additional documentation
  
- **Memory Bank CLI Command** - `vibedraft memory-bank`
  - Create Memory Bank for specific agent: `--agent <type>`
  - Create for all detected agents: `--all`
  - Update existing Memory Bank: `--update`
  - Minimal mode for smaller projects: `--minimal`
  - Auto-population with project data: `--populate` (default)
  
- **Minimal Memory Bank Mode** - `--minimal` flag
  - Streamlined structure for small/focused projects
  - Only creates essential files: projectbrief.md, techContext.md, activeContext.md
  - Can be upgraded to full structure later
  - Available in both `init` and `memory-bank` commands
  
- **Intelligent Auto-Population**
  - Populates Memory Bank with detected project information
  - Integrates with technology stack detection from v1.0.0
  - Conservative approach - only fills in 100% certain information
  - Clear placeholders for items requiring user input
  - Project name, tech stack, dependencies auto-filled
  
- **Slash Command Template** - `/vibedraft.memory-bank`
  - Comprehensive guide for AI agents on Memory Bank usage
  - Update process and workflow documentation
  - Consistency checking guidelines
  - Minimal vs Full mode recommendations
  
- **Core & Memory Bank Rules** - Agent-specific documentation
  - Plan/Act mode operating principles
  - Memory Bank structure and hierarchy
  - Update workflows and best practices
  - File relationship documentation

### Changed

- **Init Command** - Now creates Memory Bank by default
  - Automatically generates Memory Bank during project initialization
  - Respects `--minimal` flag for streamlined setup
  - Integrates with tech stack detection for auto-population
  
- **Agent Configuration** - Enhanced support for all agents
  - Cursor: `.cursor/rules/memory-bank/` with .mdc format
  - Claude: `.claude/memory-bank/` with Markdown
  - Copilot: `.github/memory-bank/` with Markdown
  - Gemini: `.gemini/memory-bank/` with Markdown
  - Windsurf: `.windsurf/memory-bank/` with Markdown
  - Qwen: `.qwen/memory-bank/` with Markdown
  - opencode: `.opencode/memory-bank/` with Markdown
  - Amazon Q: `.amazonq/memory-bank/` with Markdown
  - And more...

### Documentation

- **README.md** - Added Memory Bank section
  - Complete feature documentation
  - Usage examples for all commands
  - Minimal vs Full mode comparison
  - Agent support matrix
  
- **Agent Support** - Memory Bank available for all agents
  - Full support across all 12+ AI coding assistants
  - Consistent structure with agent-specific formatting
  - Auto-detection of installed agents

### Benefits

- **Persistent Context** - AI assistants maintain project understanding across sessions
- **Reduced Onboarding** - New team members and AI agents get up to speed faster
- **Consistent Documentation** - Structured approach to project knowledge
- **Multi-Agent Flexibility** - Use any supported AI assistant with same context
- **Incremental Adoption** - Start minimal, expand as needed

## [1.0.0] - 2025-01-21

### 🎉 Major Release: File Structure Reorganization

This release reorganizes VibeDraft's file structure to keep all VibeDraft-managed files within the `.vibedraft/` directory, preventing conflicts with existing applications.

### ⚠️ BREAKING CHANGES

- **Specs Directory Moved**: Feature specifications now live in `.vibedraft/specs/` instead of root `specs/`
  - **Backward Compatibility**: Both locations are supported - VibeDraft will check both paths
  - Existing projects with `specs/` in root continue to work
  - New projects use `.vibedraft/specs/` by default
  
- **Documentation Moved**:
  - `VIBEDRAFT_README.md` → `.vibedraft/docs/VIBEDRAFT_README.md`
  - `spec-driven.md` → `.vibedraft/docs/spec-driven.md`
  
### Added

- **Reorganized File Structure** - All VibeDraft files now in `.vibedraft/`
  - Created `.vibedraft/docs/` for VibeDraft documentation
  - Created `.vibedraft/specs/` for feature specifications
  - Created `.vibedraft/.gitignore` for VibeDraft-specific ignores
  - New utility module `lib/specs-locator.js` for finding specs in both locations
  
- **Automatic README Creation** - Creates basic `README.md` in root if it doesn't exist
  - Includes links to VibeDraft documentation
  - Provides project structure template
  - Only created when no README exists (preserves existing README)
  
- **Enhanced .gitignore Management**
  - Creates project-level `.gitignore` in root if it doesn't exist
  - Includes comprehensive ignore patterns (node_modules, build outputs, etc.)
  - Creates `.vibedraft/.gitignore` for VibeDraft-specific temporary files
  
- **Technology Stack Detection** (from v0.1.0) - Intelligent existing project analysis
  - Automatic detection of existing applications during initialization with `--here` flag
  - Scans `package.json` for dependencies, devDependencies, scripts, and engines
  - Detects frameworks (React, Next.js, Vue, Angular, Express, NestJS, and more)
  - Identifies programming languages by file extensions (TypeScript, JavaScript, Python, etc.)
  - Recognizes build tools (Vite, Webpack, Rollup, esbuild, Turborepo, Nx)
  - Determines project type (monorepo, web-app, fullstack, mobile, library, cli)
  - Detects package manager (npm, yarn, pnpm)
  - Identifies architectural patterns (JAMstack, microservices, TypeScript-first)
  - Automatically enriches constitution with detected technology stack
  - Generates technology-specific constraints and principles
  - Pre-populates plan template Technical Context from detected stack
  - Displays beautiful summary of detected stack before initialization
  - Saves detection metadata to `.vibedraft/memory/tech-stack-detected.json`
  - New modules: `lib/tech-detector.js` and `lib/constitution-builder.js`

- **Release Package System** - Automated GitHub release creation
  - `npm run build:releases` - Generate template packages for all AI agents
  - `npm run release:github` - Create GitHub release with packages
  - `npm run release:github:draft` - Create draft release for review
  - Supports all 12 AI agents (claude, cursor, copilot, gemini, qwen, opencode, windsurf, q, codex, kilocode, auggie, roo)
  - Generates Bash (sh) template packages
  - Complete documentation in `docs/creating-releases.md`

- **Local Template Support** - Development and testing improvements
  - `--local` flag for `init` command - Use local templates instead of GitHub downloads
  - Auto-fallback to local templates when GitHub is unavailable
  - Better error messages with actionable solutions

- **Agent Settings Files** - IDE configuration support
  - Cursor projects now include `.cursor/settings.json` for command recommendations
  - GitHub Copilot projects include `.vscode/settings.json`
  - Enables automatic command discovery in IDEs

- **Installation Guide** - Comprehensive HTML installation guide
  - Beautiful single-page guide in `INSTALLATION.html`
  - Step-by-step installation instructions
  - Complete workflow walkthrough with all 8 commands
  - Real-world examples and best practices
  - Troubleshooting section
  - Responsive design for all devices

### Changed
- **Agent Ordering** - Reordered AI agents to prioritize Claude and Cursor
  - Claude appears first in selection list
  - Cursor appears second
  - Other agents follow in logical order
  - Release packages build in same priority order
- **Command File Naming** - All command files now use `vibedraft.` prefix
  - Example: `vibedraft.constitution.md`, `vibedraft.draft.md`, etc.
  - Improves clarity and avoids naming conflicts
  - Better namespacing for IDE command discovery
- **README Preservation** - VibeDraft README now copied as `VIBEDRAFT_README.md`
  - Existing project `README.md` files are never overwritten
  - `.gitignore` only copied if it doesn't exist in target directory
  - Respects your project's documentation
  - `VIBEDRAFT_README.md` automatically excluded from context scanning in slash commands
- Updated `.gitignore` to exclude `.genreleases/` directory
- Enhanced error handling for GitHub API failures
- Improved developer experience with clearer fallback messaging
- Updated Cursor settings to include all 8 commands (added analyze and checklist)

### Removed
- **PowerShell Support** - Removed unused PowerShell (ps1) script variants
  - No PowerShell scripts existed in the codebase
  - Reduces package count from 24 to 12 (12 agents × 1 script type)
  - Cleaner release artifacts and faster build times
  - Only Bash scripts are supported going forward

### Fixed
- **Version Command** - `vibedraft --version` now dynamically reads from `package.json` instead of hardcoded value
- Resolved GitHub release dependency for first-time users
- Template download failures now gracefully fallback to local templates
- Fixed ZIP file creation using proper `addLocalFolder()` method for correct archive format
- Fixed script permission handling to properly use file handle API and set correct executable permissions
- **Critical**: Fixed file stream handling in download - now properly waits for file write to complete before extraction
  - Resolves "Invalid or unsupported zip format" errors when downloading from GitHub releases
  - File streams now use proper async/await pattern with 'finish' event

## [1.0.0] - 2025-10-09

### 🎉 Initial Release - VibeDraft is Here!

**VibeDraft** is a delightfully vibey JavaScript/Node.js CLI toolkit for Spec-Driven Development. Where specs meet vibes, and code flows like magic! ✨

### ✨ Features

#### 🎸 Core CLI Commands
- **`vibedraft init`** - Bootstrap new projects with style
  - Interactive prompts for smooth onboarding
  - Multi-AI agent support (choose your vibe)
  - Cross-platform script generation (Bash)
  - Automatic Git repository initialization
  - Smart defaults with manual override options
  - Current directory initialization with `--here` or `.`
  - Force mode for non-empty directories

- **`vibedraft check`** - Verify your development environment
  - Detects Git installation
  - Checks for 8+ AI agent CLI tools
  - Visual status table with color coding
  - Helpful installation links
  - Clear pass/fail indicators

#### 🎯 Slash Commands (8 Total)
Complete Spec-Driven Development workflow:

1. **`/vibedraft.constitution`** - Define project principles and development guidelines
2. **`/vibedraft.draft`** - Create feature specifications from natural language
3. **`/vibedraft.clarify`** - Ask targeted questions to remove ambiguity
4. **`/vibedraft.plan`** - Generate technical implementation plans
5. **`/vibedraft.analyze`** - Verify consistency across specifications, plans, and tasks
6. **`/vibedraft.tasks`** - Break down plans into actionable, dependency-ordered tasks
7. **`/vibedraft.checklist`** - Generate quality checklists for requirements validation
8. **`/vibedraft.implement`** - Execute implementation with AI assistance

#### 🤖 AI Agent Support (8 Agents)
Full integration with major AI coding assistants:
- **Claude Code** (Anthropic) - Markdown format, CLI tool support
- **Gemini CLI** (Google) - TOML format, CLI tool support
- **GitHub Copilot** (Microsoft) - Markdown format, IDE-based
- **Cursor** - Markdown format, CLI tool support
- **Windsurf** - Markdown format, IDE-based workflows
- **Qwen Code** (Alibaba) - TOML format, CLI tool support
- **Opencode** - Markdown format, CLI tool support
- **Amazon Q Developer** - Markdown format, CLI tool support

#### 🌍 Cross-Platform Support
- **Node.js 18+** - Modern ES Modules architecture
- **Bash Scripts** - Complete automation for Unix/Linux/macOS/Windows
- **Cross-Platform Compatible** - Works seamlessly across all major platforms

#### 📋 Template System
Pre-built, production-ready templates:
- Feature specifications (`spec-template.md`)
- Implementation plans (`plan-template.md`)
- Task breakdowns (`tasks-template.md`)
- Quality checklists (`checklist-template.md`)
- Project constitution (`constitution.md`)
- AI agent file templates (`agent-file-template.md`)

#### 🎨 Developer Experience
- **Vibey Documentation** - Fun, engaging, and comprehensive
- **Colored Output** - Clear visual feedback with emojis
- **Progress Tracking** - Visual spinners and progress bars
- **Interactive Prompts** - Smooth user interactions
- **Clear Error Messages** - Actionable guidance when things go wrong
- **Success Celebrations** - Because wins should feel good! 🎉

#### 🔄 Git Integration
- Automatic repository initialization
- Sequential feature numbering (001, 002, 003...)
- Branch creation per feature (`###-feature-name`)
- Initial commit with template files
- Clean, organized feature structure

#### 📁 Project Structure
Organized, predictable directory layout:
```
.vibedraft/
├── scripts/          # Automation (Node.js + Bash)
├── templates/        # Document templates
└── memory/          # Project constitution

specs/               # Your features live here
└── 001-feature/
    ├── spec.md      # What to build
    ├── plan.md      # How to build it
    └── tasks.md     # Steps to take
```

#### 🎛️ Configuration Options
- Environment variable support (`VIBEDRAFT_FEATURE`, `GH_TOKEN`)
- Optional Git repository initialization (`--no-git`)
- Agent tool check bypass (`--ignore-agent-tools`)
- Force overwrite mode (`--force`)
- Script type selection (`--script sh|ps`)

#### 🧠 Cursor Memory Bank
Complete persistent context system:
- 6 core memory bank files for project intelligence
- Plan/Act mode operational rules
- Automatic context loading between sessions
- Living documentation that evolves with project

### 📚 Documentation
- **Comprehensive README** - Full feature coverage with examples
- **Quick Start Guide** - Get up and running in minutes
- **Installation Guide** - Multiple installation methods
- **Spec-Driven Development Guide** - Deep dive into methodology
- **Agent Integration Guide** - How to add new AI agents
- **Local Development Guide** - Contributing to VibeDraft

### 🎯 Philosophy
- **Specs Are Executable** - Specifications drive implementation
- **Constitution-Driven** - Principles guide every decision
- **Feature Isolation** - Each feature is self-contained
- **AI-Augmented, Human-Guided** - Best of both worlds
- **Quality Built-In** - Checklists and analysis ensure excellence

### 🚀 Getting Started
```bash
# Install globally
npm install -g vibedraft-cli

# Initialize your project
vibedraft init my-awesome-project --ai claude

# Start building!
/vibedraft.constitution
/vibedraft.draft "Build an amazing feature"
/vibedraft.plan
/vibedraft.tasks
/vibedraft.implement
```

### 🎸 What Makes VibeDraft Special
- **Pure JavaScript** - Native Node.js, no Python dependencies
- **Vibey UX** - Fun, engaging, personality-filled
- **Multi-Agent** - Works with your favorite AI tools
- **Cross-Platform** - True Unix and Windows support
- **Template-Driven** - Consistent, high-quality outputs
- **Git-Native** - Version control built in from day one

---

**Keep the vibes flowing! Stop coding, start vibing!** ✨🎨🚀

[1.0.0]: https://github.com/mantisware/vibedraft/releases/tag/v1.0.0
