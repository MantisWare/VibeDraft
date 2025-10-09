# Creating Releases for VibeDraft

This guide explains how to create and publish VibeDraft releases with template packages.

## Overview

VibeDraft uses a release system that generates template packages for all supported AI agents and script types. These packages are uploaded to GitHub Releases, allowing users to initialize projects with `vibedraft init`.

## Quick Start

### 1. Generate Release Packages

Generate all template packages for the current version:

```bash
npm run build:releases
```

This will:
- Read the version from `package.json` (e.g., `0.0.7`)
- Generate ZIP files for all AI agents (claude, gemini, cursor, etc.)
- Create both `sh` (Bash) and `ps1` (PowerShell) variants
- Output files to `.genreleases/` directory

**Example output:**
```
.genreleases/
  ├── vibedraft-template-claude-sh-0.0.7.zip
  ├── vibedraft-template-claude-ps1-0.0.7.zip
  ├── vibedraft-template-cursor-sh-0.0.7.zip
  ├── vibedraft-template-cursor-ps1-0.0.7.zip
  └── ... (all other agent/script combinations)
```

### 2. Create GitHub Release

#### Option A: Automated (Recommended)

If you have [GitHub CLI](https://cli.github.com/) installed and authenticated:

```bash
npm run release:github
```

This will:
- Create a new GitHub release with tag `v{version}`
- Upload all generated ZIP files
- Extract release notes from `CHANGELOG.md`
- Publish the release publicly

**Create as draft** (for review before publishing):
```bash
npm run release:github:draft
```

#### Option B: Manual Upload

1. Go to: https://github.com/MantisWare/VibeDraft/releases/new
2. Create new tag: `v{version}` (e.g., `v0.0.7`)
3. Enter title: `VibeDraft v{version}`
4. Add release notes from `CHANGELOG.md`
5. Drag and drop all ZIP files from `.genreleases/`
6. Click "Publish release"

## Complete Release Workflow

### Step-by-Step Process

1. **Make your changes**
   ```bash
   # Make code changes
   git add .
   git commit -m "Add new feature"
   ```

2. **Update CHANGELOG.md**
   ```bash
   # Add entry for new version
   ## [0.0.8] - 2025-01-XX
   ### Added
   - New feature description
   ### Fixed
   - Bug fix description
   ```

3. **Update version and create git tag**
   ```bash
   # For patch release (0.0.7 → 0.0.8)
   npm run release:patch
   
   # For minor release (0.0.7 → 0.1.0)
   npm run release:minor
   
   # For major release (0.0.7 → 1.0.0)
   npm run release:major
   ```
   
   This automatically:
   - Runs linting and tests
   - Updates `package.json` version
   - Creates git commit and tag
   - Pushes to GitHub

4. **Build release packages**
   ```bash
   npm run build:releases
   ```

5. **Create GitHub release**
   ```bash
   npm run release:github
   ```

6. **Publish to npm**
   ```bash
   npm run publish:npm
   ```

### One-Command Release (Patch + NPM Only)

For quick patch releases:

```bash
npm run release
```

This runs: `release:patch` → `publish:npm`

**Note:** You still need to manually run `build:releases` and `release:github` for GitHub template packages.

## Supported AI Agents

The build system generates packages for all supported agents:

| Agent | Script Types | Directory |
|-------|-------------|-----------|
| claude | sh, ps1 | `.claude/commands/` |
| cursor | sh, ps1 | `.cursor/commands/` |
| copilot | sh, ps1 | `.github/prompts/` |
| gemini | sh, ps1 | `.gemini/commands/` |
| qwen | sh, ps1 | `.qwen/commands/` |
| opencode | sh, ps1 | `.opencode/command/` |
| windsurf | sh, ps1 | `.windsurf/workflows/` |
| q | sh, ps1 | `.amazonq/prompts/` |
| codex | sh, ps1 | `.codex/commands/` |
| kilocode | sh, ps1 | `.kilocode/commands/` |
| auggie | sh, ps1 | `.augment/commands/` |
| roo | sh, ps1 | `.roo/commands/` |

## Package Contents

Each template package contains:

```
vibedraft-template-{agent}-{script}-{version}.zip
├── .vibedraft/
│   ├── scripts/
│   │   ├── bash/           # Shell scripts
│   │   │   ├── create-new-feature.sh
│   │   │   ├── setup-plan.sh
│   │   │   └── ...
│   │   └── powershell/     # PowerShell scripts (if ps1)
│   ├── templates/
│   │   ├── commands/       # Command templates
│   │   ├── plan-template.md
│   │   └── spec-template.md
│   └── memory/
│       └── constitution.md
├── .{agent}/               # Agent-specific commands
│   └── commands/          # (or prompts/ or workflows/)
│       ├── constitution.md
│       ├── specify.md
│       ├── plan.md
│       └── ...
├── specs/                  # Empty specs directory
├── README.md
├── .gitignore
└── spec-driven.md
```

## Development & Testing

### Use Local Templates

During development, test without creating a release:

```bash
vibedraft init TestProject --local --ai cursor
```

The `--local` flag uses templates directly from your VibeDraft repository instead of downloading from GitHub.

### Auto-Fallback

If GitHub download fails (e.g., no releases exist), VibeDraft automatically falls back to local templates if available.

## Troubleshooting

### "No matching release asset found"

**Cause:** GitHub release doesn't have packages for the selected agent/script type.

**Solution:**
```bash
npm run build:releases
npm run release:github
```

### "GitHub API returned 404"

**Cause:** No releases exist yet for the repository.

**Solution:**
1. Use `--local` flag for testing: `vibedraft init Test --local`
2. Create your first release: `npm run build:releases && npm run release:github`

### "gh: command not found"

**Cause:** GitHub CLI is not installed.

**Solution:**
- Install from: https://cli.github.com/
- Or manually upload packages to GitHub releases

### "Not authenticated with GitHub CLI"

**Cause:** GitHub CLI not authenticated.

**Solution:**
```bash
gh auth login
```

### Build script fails

**Cause:** Missing dependencies or file access issues.

**Solution:**
```bash
# Clean and reinstall
npm run clean
npm install

# Try again
npm run build:releases
```

## File Locations

- **Scripts:** `scripts/create-release-packages.js`, `scripts/create-github-release.js`
- **Templates:** `templates/` directory
- **Build output:** `.genreleases/` (gitignored)
- **Package config:** `package.json`

## Related Commands

```bash
# Development
npm test                    # Run tests
npm run lint                # Lint and fix code
npm run lint:check          # Check linting without fixing

# Versioning
npm run release:patch       # Bump patch version (0.0.7 → 0.0.8)
npm run release:minor       # Bump minor version (0.0.7 → 0.1.0)
npm run release:major       # Bump major version (0.0.7 → 1.0.0)

# Publishing
npm run build:releases      # Generate release packages
npm run release:github      # Create GitHub release
npm run release:github:draft # Create draft release
npm run publish:npm         # Publish to npm
npm run release             # Patch + npm publish

# Cleanup
npm run clean               # Remove build artifacts
```

## Best Practices

1. **Always update CHANGELOG.md** before releasing
2. **Test locally** with `--local` flag before creating releases
3. **Use draft releases** for pre-release testing
4. **Follow semantic versioning** (major.minor.patch)
5. **Verify release** after publishing:
   - Check GitHub release page
   - Test installation: `npx vibedraft-cli@latest init Test`
6. **Keep release notes clear** and user-focused

## Version Strategy

- **Patch (0.0.X):** Bug fixes, documentation updates, minor improvements
- **Minor (0.X.0):** New features, new agent support, backward-compatible changes
- **Major (X.0.0):** Breaking changes, major refactors, CLI interface changes

## Support

For issues or questions:
- GitHub Issues: https://github.com/MantisWare/VibeDraft/issues
- GitHub Discussions: https://github.com/MantisWare/VibeDraft/discussions

---

**Remember:** Good releases need good tests! Always verify your changes before publishing. 🚀

