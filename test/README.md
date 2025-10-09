# VibeDraft CLI Test Suite

Comprehensive test suite for the VibeDraft CLI covering all commands and functionality.

## Running Tests

### Run all tests
```bash
npm test
```

### Run with verbose output
```bash
npm run test:verbose
```

### Run directly with Node
```bash
node --test test/cli.test.js
```

### Run with coverage (requires Node 20+)
```bash
node --test --experimental-test-coverage test/cli.test.js
```

## Test Coverage

### CLI Help and Version
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
  - `check-prerequisites.sh`
  - `create-new-feature.sh`
  - `setup-plan.sh`
  - `update-agent-context.sh`
- ✅ Creates `templates/` directory with:
  - `spec-template.md`
  - `plan-template.md`
  - `tasks-template.md`
  - `checklist-template.md`
- ✅ Creates `templates/commands/` with all command files
  - `specify.md`
  - `plan.md`
  - `tasks.md`
  - `implement.md`
  - `analyze.md`
  - `clarify.md`
  - `checklist.md`
- ✅ Creates `memory/constitution.md`
- ✅ Creates agent-specific directories
- ✅ Creates `specs/` directory
- ✅ Creates `README.md` and `.gitignore`

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

### Edge Cases
- ✅ Very long project names
- ✅ Special characters in project names
- ✅ Rapid successive initializations
- ✅ Project names with spaces

### Integration Tests
- ✅ Bash scripts are executable (Unix systems)
- ✅ Command files have valid frontmatter
- ✅ Templates have consistent structure
- ✅ All files have appropriate content

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

#### `checkVibeDraftStructure(projectDir)`
Validate project structure.

```javascript
const structure = checkVibeDraftStructure('my-project');
assert.strictEqual(structure.hasVibeDraftDir, true);
```

#### `fileExists(filePath)`
Check if a file exists in the test directory.

```javascript
assert.strictEqual(fileExists('my-project/.vibedraft/memory/constitution.md'), true);
```

#### `readFile(filePath)`
Read file contents from test directory.

```javascript
const content = readFile('my-project/README.md');
assert.match(content, /VibeDraft/);
```

## Continuous Integration

These tests are designed to run in CI environments:
- Set `CI=true` environment variable for non-interactive mode
- Tests are deterministic and don't rely on external services
- All network calls can be mocked or skipped with appropriate flags

## Troubleshooting

### Tests hanging
- Check if any CLI commands are waiting for user input
- Ensure `CI=true` is set or use `--ignore-agent-tools` flag

### Permission errors
- Ensure test-tmp directory is writable
- Check file system permissions

### Network errors
- Use `--no-git` flag to skip Git operations if needed
- Use `--ignore-agent-tools` to skip external tool checks

## Contributing

When adding new CLI features:
1. Add corresponding tests to `cli.test.js`
2. Update this README with test coverage
3. Run tests locally before submitting PR
4. Ensure all tests pass in CI

## Test Metrics

Current test count: **60+ test cases**

Coverage areas:
- ✅ All CLI commands
- ✅ All command-line flags
- ✅ All AI agent integrations
- ✅ File structure validation
- ✅ Error handling
- ✅ Edge cases

