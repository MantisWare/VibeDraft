# System Patterns

## Architecture Overview
VibeDraft follows a modular CLI architecture with clear separation of concerns:

```
vibedraft (CLI Entry) 
    ↓
Commander.js (Routing)
    ↓
Commands (init, check)
    ↓
Lib Utilities (banner, download, git, tracker, ui, utils)
    ↓
Scripts (Node.js/PowerShell) → Templates → AI Agent Config
```

**Key Architectural Decisions:**
- **ES Modules**: Modern JavaScript with `type: "module"` in package.json
- **Commander.js**: Industry-standard CLI framework for routing and options
- **Modular Design**: Each feature in its own file/directory
- **Cross-Platform**: Dual implementation (Node.js + PowerShell) for scripts
- **Template-Driven**: All specs/plans/tasks use markdown templates

## Data Flow

### Project Initialization Flow
```
User → vibedraft init [options]
    ↓
1. Parse options (AI agent, script type, flags)
    ↓
2. Create project directory structure
    ↓
3. Download latest templates from GitHub
    ↓
4. Generate AI agent-specific command files
    ↓
5. Set script permissions (Unix only)
    ↓
6. Initialize Git repository (optional)
    ↓
7. Display next steps to user
```

### Spec-Driven Development Flow
```
User in AI Agent → /vibedraft.[command]
    ↓
1. AI reads command template from .vibedraft/templates/commands/
    ↓
2. Executes automation script (.vibedraft/scripts/)
    ↓
3. Script checks prerequisites and validates context
    ↓
4. AI follows template instructions to generate content
    ↓
5. Content written to specs/[feature-number]-[feature-name]/
    ↓
6. User reviews and proceeds to next command
```

## Key Patterns

- **Template Pattern**: All specs, plans, and tasks use markdown templates with placeholder syntax
  - Allows consistent structure across features
  - AI follows template guidance for content generation
  - User can customize templates for project needs

- **Command Pattern**: Each slash command is self-contained with clear inputs/outputs
  - Commands are composable (output of one feeds into next)
  - Each command validates prerequisites before executing
  - Clear error messages when prerequisites missing

- **Strategy Pattern**: Platform-specific script selection
  - Auto-detects OS (Windows → PowerShell, Unix → Bash)
  - Manual override with `--script sh|ps` flag
  - Both implementations provide identical functionality

- **Builder Pattern**: Project initialization builds up configuration progressively
  - Prompts for missing options interactively
  - Validates each step before proceeding
  - Creates complete project structure atomically

## Component Relationships

```
index.js (Entry Point)
    ↓
├── commands/
│   ├── init.js (Initialization)
│   │   ├── lib/ui.js (User Interaction)
│   │   ├── lib/download.js (Template Download)
│   │   ├── lib/git.js (Repository Setup)
│   │   ├── lib/utils.js (File Operations)
│   │   └── lib/tracker.js (Progress Display)
│   │
│   └── check.js (Environment Check)
│       ├── lib/utils.js (Tool Detection)
│       └── lib/tracker.js (Status Display)
│
├── lib/ (Shared Utilities)
│   ├── banner.js (ASCII Art)
│   ├── download.js (GitHub API)
│   ├── git.js (Git Operations)
│   ├── tracker.js (Progress Tracking)
│   ├── ui.js (Prompts, Panels)
│   └── utils.js (File/Tool Utils)
│
└── scripts/ (Automation)
    ├── Node.js versions (*.js)
    └── PowerShell versions (*.ps1)
```

## Design Patterns in Use

- **Facade Pattern**: CLI commands provide simple interfaces hiding complexity
  - `vibedraft init` abstracts 10+ steps into one command
  - `vibedraft check` wraps multiple tool checks with clear output

- **Factory Pattern**: Command file generation per AI agent
  - Each agent gets appropriate file format (Markdown or TOML)
  - Correct directory structure per agent (.claude/, .cursor/, etc.)
  - Agent-specific argument placeholder syntax

- **Observer Pattern**: Progress tracking with live updates
  - StepTracker monitors operation progress
  - Visual feedback during long operations (download, extract)
  - Colored output indicates success/failure states

## Integration Points

- **GitHub API**: Download latest template releases
  - Uses GitHub REST API for release information
  - Supports authentication via GH_TOKEN or GITHUB_TOKEN
  - Falls back gracefully if API unavailable

- **Git**: Repository initialization and branch management
  - Uses simple-git library for Git operations
  - Creates initial commit with template files
  - Branch naming: `[###]-[feature-name]`

- **AI Agent Tools**: 8 supported agents with specific integrations
  - Claude Code: `.claude/commands/` (Markdown, CLI tool: `claude`)
  - Gemini CLI: `.gemini/commands/` (TOML, CLI tool: `gemini`)
  - Cursor: `.cursor/commands/` (Markdown, CLI tool: `cursor-agent`)
  - GitHub Copilot: `.github/prompts/` (Markdown, IDE-based)
  - Windsurf: `.windsurf/workflows/` (Markdown, IDE-based)
  - Qwen Code: `.qwen/commands/` (TOML, CLI tool: `qwen`)
  - Opencode: `.opencode/command/` (Markdown, CLI tool: `opencode`)
  - Amazon Q: `.amazonq/prompts/` (Markdown, CLI tool: `q`)

## Security Patterns
- **Input Validation**: All user inputs validated before processing
- **Path Sanitization**: File paths sanitized to prevent directory traversal
- **Safe Downloads**: Only download from official GitHub releases
- **Permission Setting**: Execute permissions only on intended script files
- **Token Handling**: Environment variables for GitHub tokens, never hardcoded

## Performance Patterns
- **Lazy Loading**: Modules loaded only when needed
- **Streaming Downloads**: Large files streamed rather than loaded into memory
- **Concurrent Operations**: Multiple tool checks run in parallel
- **Caching**: Downloaded templates cached temporarily during extraction
- **Minimal Dependencies**: Only essential npm packages included

## Error Handling
- **Graceful Degradation**: Missing tools reported but don't block initialization
- **Clear Messages**: Error messages explain what went wrong and how to fix it
- **Recovery Mechanisms**: Cleanup on failure, retry logic for network operations
- **User Feedback**: Colored output distinguishes errors from warnings from success
- **Logging**: Debug mode available with `--verbose` flag (planned)

