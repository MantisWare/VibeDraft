# VibeDraft CLI Test Suite

Comprehensive test suite for the VibeDraft CLI covering all commands, analyzers, and functionality.

## Running Tests

### Run all tests
```bash
npm test
```

### Run with verbose output
```bash
npm run test:verbose
```

### Run specific test file
```bash
node --test test/cli.test.js
node --test test/analyzers.test.js
```

### Run with coverage (requires Node 20+)
```bash
npm run test:coverage
```

## Test Structure

### CLI Tests (`cli.test.js`)
Tests for CLI commands and initialization workflow.

### Analyzer Tests (`analyzers.test.js`)
Tests for deep codebase analysis modules:
- **Structure Analyzer**: Directory structure and pattern identification
- **Pattern Detector**: Framework and coding pattern detection
- **Documentation Parser**: README and package.json parsing
- **Integration**: Full analysis workflow and concurrent execution

## Test Coverage

### CLI Commands
- ✅ `--help` flag displays usage information
- ✅ `--version` flag displays version number
- ✅ `init --help` displays init command help
- ✅ `check --help` displays check command help

### vibedraft check
- ✅ Runs environment check successfully
- ✅ Detects Git installation
- ✅ Lists available AI agent tools
- ✅ Displays results in formatted table

### vibedraft init - Basic Functionality
- ✅ Creates new project with default settings
- ✅ Creates project with specific AI agent (claude, cursor, gemini, copilot, etc.)
- ✅ Initializes Git repository by default
- ✅ Skips Git initialization with `--no-git`
- ✅ Validates against invalid AI agent names
- ✅ Handles project names with special characters

### vibedraft init - Current Directory
- ✅ Initializes in current directory with `--here`
- ✅ Initializes in current directory with `.` argument
- ✅ Warns about non-empty directories
- ✅ Rejects both project name and `--here` flag together
- ✅ Handles existing files with `--force` flag

### File Structure Validation
- ✅ Creates `.vibedraft/` directory
- ✅ Creates `scripts/bash/` with all required scripts
- ✅ Creates `templates/` directory with templates
- ✅ Creates `templates/commands/` with all command files
- ✅ Creates `memory/constitution.md`
- ✅ Creates agent-specific directories
- ✅ Creates Memory Bank files (v1.2.0+)
- ✅ Creates `specs/` directory
- ✅ Creates `README.md` and `.gitignore`

### Structure Analyzer Tests
- ✅ Analyzes project directory structure
- ✅ Detects and categorizes directories (components, services, utilities, etc.)
- ✅ Identifies entry points (index.js, main.ts, App.tsx, etc.)
- ✅ Detects architectural patterns (MVC, Component-Based, Redux, etc.)
- ✅ Generates human-readable structure summaries
- ✅ Handles empty and non-existent directories gracefully

### Pattern Detector Tests
- ✅ Detects framework patterns (React, TypeScript, Jest, etc.)
- ✅ Identifies coding patterns (async/await, arrow functions, optional chaining, etc.)
- ✅ Provides confidence levels for detected patterns
- ✅ Extracts key patterns for memory bank population
- ✅ Generates pattern summaries
- ✅ Handles projects without patterns

### Documentation Parser Tests
- ✅ Parses README.md files and extracts sections
- ✅ Extracts project description and features
- ✅ Parses package.json for metadata
- ✅ Identifies architecture documentation
- ✅ Extracts setup and installation instructions
- ✅ Extracts project context for memory bank
- ✅ Handles missing or incomplete documentation

### Integration Tests
- ✅ Performs complete multi-analyzer analysis
- ✅ Provides consistent results across analyzers
- ✅ Handles concurrent analysis execution safely
- ✅ All analyzers work together correctly

### Multiple AI Agent Support
Tests initialization with all supported agents:
- ✅ Claude Code (`.claude/`)
- ✅ Gemini CLI (`.gemini/`)
- ✅ GitHub Copilot (`.github/`)
- ✅ Cursor (`.cursor/`)
- ✅ Qwen Code (`.qwen/`)
- ✅ Opencode (`.opencode/`)
- ✅ Windsurf (`.windsurf/`)
- ✅ Amazon Q Developer (`.amazonq/`)

### Error Handling
- ✅ Handles existing project directories
- ✅ Handles network errors gracefully
- ✅ Handles permission errors gracefully
- ✅ Validates input parameters
- ✅ Handles malformed files gracefully

## Test Environment

Tests run in an isolated temporary directory (`test-tmp/`) that is:
- Created before each test suite
- Cleaned up after each test suite
- Isolated from your actual projects

## Requirements

- Node.js 18.0.0 or higher (uses built-in `node:test` module)
- All VibeDraft CLI dependencies installed (`npm install`)

## Writing New Tests

### Test Structure

```javascript
describe('Feature Name', () => {
  it('should do something specific', () => {
    const result = runCLI('command --args');
    assert.strictEqual(result.success, true);
  });
});
```

### Helper Functions

#### `runCLI(args, options)`
Execute CLI commands synchronously.

```javascript
const result = runCLI('init my-project --no-git', {
  cwd: customDir,
  env: { CI: 'true' }
});
```

#### `runCLIInteractive(args, inputs, options)`
Execute CLI commands with simulated user input.

```javascript
const result = await runCLIInteractive(
  'init --here',
  ['claude', 'y'],  // User inputs
  { cwd: testDir }
);
```

## Continuous Integration

These tests are designed to run in CI environments:
- Set `CI=true` environment variable for non-interactive mode
- Tests are deterministic and don't rely on external services
- All network calls can be mocked or skipped with appropriate flags

## Test Metrics

**Current test count: 90+ test cases**

Coverage areas:
- ✅ All CLI commands
- ✅ All command-line flags
- ✅ All AI agent integrations
- ✅ File structure validation
- ✅ Codebase analysis (structure, patterns, docs)
- ✅ Error handling
- ✅ Edge cases
- ✅ Integration scenarios

## Test Results Summary

### CLI Tests
- **60+ tests** covering initialization, commands, and file structure

### Analyzer Tests
- **30 tests** covering deep codebase analysis:
  - 8 tests for structure analyzer
  - 9 tests for pattern detector
  - 10 tests for documentation parser
  - 3 integration tests

## Contributing

When adding new CLI features:
1. Add corresponding tests to appropriate test file
2. Update this README with test coverage
3. Run tests locally before submitting PR: `npm test`
4. Ensure all tests pass in CI
