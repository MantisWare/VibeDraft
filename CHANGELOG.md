# Changelog

All notable changes to VibeDraft CLI are documented here.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

### Added
- **Release Package System** - Automated GitHub release creation
  - `npm run build:releases` - Generate template packages for all AI agents
  - `npm run release:github` - Create GitHub release with packages
  - `npm run release:github:draft` - Create draft release for review
  - Supports all 12 AI agents (claude, cursor, copilot, gemini, qwen, opencode, windsurf, q, codex, kilocode, auggie, roo)
  - Generates both Bash (sh) and PowerShell (ps1) variants
  - Complete documentation in `docs/creating-releases.md`

- **Local Template Support** - Development and testing improvements
  - `--local` flag for `init` command - Use local templates instead of GitHub downloads
  - Auto-fallback to local templates when GitHub is unavailable
  - Better error messages with actionable solutions

- **Agent Settings Files** - IDE configuration support
  - Cursor projects now include `.cursor/settings.json` for command recommendations
  - GitHub Copilot projects include `.vscode/settings.json`
  - Enables automatic command discovery in IDEs

### Changed
- Updated `.gitignore` to exclude `.genreleases/` directory
- Enhanced error handling for GitHub API failures
- Improved developer experience with clearer fallback messaging

### Fixed
- Resolved GitHub release dependency for first-time users
- Template download failures now gracefully fallback to local templates
- Fixed ZIP file creation using proper `addLocalFolder()` method for correct archive format
- Fixed script permission handling to properly use file handle API and set correct executable permissions

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
