# Tech Context

## Technology Stack

### Runtime & Language
- **Runtime**: Node.js 18.0.0+ (ES Modules)
- **Language**: Modern JavaScript (ES2020+)
- **Module System**: ES Modules (`type: "module"`)
- **Package Manager**: npm (compatible with yarn/pnpm)

### Core Dependencies
- **commander** (^11.1.0) - CLI framework and command routing
- **chalk** (^5.3.0) - Terminal string styling and colors
- **inquirer** (^9.2.12) - Interactive command-line prompts
- **boxen** (^7.1.1) - Create boxes in terminal for UI panels
- **ora** (^7.0.1) - Elegant terminal spinners
- **cli-progress** (^3.12.0) - Progress bars for long operations
- **cli-table3** (^0.6.3) - Formatted tables in terminal

### Utility Libraries
- **fs-extra** (^11.2.0) - Enhanced file system operations
- **simple-git** (^3.21.0) - Git repository management
- **node-fetch** (^3.3.2) - HTTP requests (GitHub API)
- **adm-zip** (^0.5.10) - ZIP file extraction
- **strip-ansi** (^7.1.0) - Remove ANSI escape codes from strings

### Scripting Languages
- **Node.js/JavaScript** - Primary automation scripts
- **PowerShell** - Windows automation scripts
- **Bash** - Unix/Linux/macOS automation scripts

## Development Environment

### Setup Requirements
1. **Node.js 18.0.0 or higher**
   - Required for ES Modules support
   - Recommended: Use nvm for version management

2. **npm** (comes with Node.js)
   - For dependency installation
   - For global CLI installation

3. **Git** (optional but recommended)
   - For repository initialization
   - For version control features

4. **AI Coding Assistant** (optional)
   - One of: Claude Code, Gemini CLI, Cursor, etc.
   - For using slash commands

### Development Tools
- **IDE**: VS Code, Cursor, or any modern editor
- **Terminal**: Any POSIX terminal or PowerShell
- **Package Manager**: npm (primary), yarn/pnpm (compatible)
- **Linting**: None enforced (follows user code quality rules)
- **Testing**: None implemented yet (planned)

### Installation & Setup

**Global Installation:**
```bash
cd VibeDraft
npm install -g .
```

**Development Mode:**
```bash
cd VibeDraft
npm install
npm link
```

**Verify Installation:**
```bash
vibedraft --help
vibedraft check
```

## Configuration

### Environment Variables
- `VIBEDRAFT_FEATURE` - Override feature detection for non-Git repos
  - Example: `001-chat-feature`
  - Used when not on a Git branch
  
- `GH_TOKEN` or `GITHUB_TOKEN` - GitHub API authentication
  - Example: `ghp_xxxxxxxxxxxxx`
  - Optional, increases API rate limits
  - Used for downloading releases

### Configuration Files

**package.json:**
- Defines CLI binary (`vibedraft`)
- Specifies ES Modules (`"type": "module"`)
- Lists all dependencies with pinned versions
- Minimum Node.js version requirement

**index.js:**
- CLI entry point with shebang
- Commander.js setup
- Command registration
- Banner display hook

## Project Structure

```
VibeDraft/
├── .cursor/              # Cursor IDE configuration
│   └── rules/           # Memory Bank and core rules
├── commands/            # CLI command implementations
│   ├── check.js        # Environment checking
│   └── init.js         # Project initialization
├── lib/                # Shared utilities
│   ├── banner.js       # ASCII art banner
│   ├── download.js     # GitHub release download
│   ├── git.js          # Git operations wrapper
│   ├── tracker.js      # Progress tracking
│   ├── ui.js           # User interface components
│   └── utils.js        # File and tool utilities
├── scripts/            # Automation scripts
│   ├── *.js           # Node.js versions
│   └── powershell/    # PowerShell versions
├── templates/         # Document templates
│   ├── commands/      # Slash command definitions
│   ├── spec-template.md
│   ├── plan-template.md
│   └── tasks-template.md
├── docs/              # User documentation
├── media/             # Images and assets
├── memory/            # Project memory (constitution)
├── index.js           # CLI entry point
├── package.json       # npm package definition
└── README.md          # Main documentation
```

## Dependencies Deep Dive

### CLI Framework (commander)
- Command registration and routing
- Option parsing with validation
- Help text generation
- Subcommand support

### Terminal UI (chalk, boxen, ora, cli-progress)
- **chalk**: Colored output, text styling
- **boxen**: Bordered boxes for panels
- **ora**: Spinning progress indicators
- **cli-progress**: Download/extraction progress bars

### User Interaction (inquirer)
- Interactive prompts (select, confirm, input)
- Validation and error handling
- Multi-step wizards

### File System (fs-extra)
- Promise-based file operations
- Directory creation with parents
- Recursive copy and move
- Safe file deletion

### Git Integration (simple-git)
- Repository initialization
- Branch creation and management
- Commit operations
- Status checking

### HTTP & Downloads (node-fetch, adm-zip)
- **node-fetch**: GitHub API requests
- **adm-zip**: Extract downloaded templates

## Constraints

### Technical Constraints
- **Node.js Version**: Must support 18.0.0+ (ES Modules requirement)
- **Platform Support**: macOS, Linux, Windows
- **File System**: Must handle different path separators (/ vs \)
- **Permissions**: Unix systems require execute permissions on scripts

### Performance Requirements
- Project initialization: < 10 seconds
- Environment check: < 3 seconds
- Template download: Dependent on network speed
- No blocking operations in UI thread

### Compatibility Requirements
- **Shell Scripts**: Must work on Bash 3.2+ (macOS default)
- **PowerShell**: Must work on PowerShell 5.1+ and PowerShell Core 7+
- **AI Agents**: Support multiple agent formats (Markdown, TOML)
- **Git**: Support Git 2.0+

## Best Practices

### Code Style
- Use ES Modules (`import`/`export`)
- Prefer `const` over `let`, avoid `var`
- Use `??` instead of `||` for nullish coalescing
- Async/await for asynchronous operations
- Explicit error handling with try/catch

### File Operations
- Always use `fs-extra` for cross-platform compatibility
- Handle errors gracefully (e.g., file not found)
- Set execute permissions on Unix systems
- Use path.join() for cross-platform paths

### User Experience
- Provide visual feedback for long operations
- Use colored output to distinguish message types
- Include emojis for personality (not overwhelming)
- Clear error messages with actionable solutions
- Success messages should be celebratory

### Git Operations
- Always check if Git is available before using
- Handle non-Git repositories gracefully
- Provide clear messages if Git operations fail
- Use `--no-git` flag to skip Git entirely

## Testing Strategy
Currently no automated tests implemented.

**Future Testing Plans:**
- Unit tests for utility functions
- Integration tests for CLI commands
- E2E tests for full workflow
- Cross-platform testing on CI/CD

