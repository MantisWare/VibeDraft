# 🚀 Quick Release Guide

## TL;DR - Create Your First Release

```bash
# 1. Build all release packages
npm run build:releases

# 2. Create GitHub release (requires gh CLI)
npm run release:github

# Done! 🎉
```

## What Just Happened?

You now have a complete automated release system that:

1. ✅ Generates template packages for **all 12 AI agents**
2. ✅ Creates **Bash script** variants
3. ✅ Uploads packages to **GitHub Releases**
4. ✅ Allows **local development** without releases

## Quick Commands

| Command | What It Does |
|---------|-------------|
| `npm run build:releases` | Generate all release packages (12 ZIP files) |
| `npm run release:github` | Create GitHub release + upload packages |
| `npm run release:github:draft` | Create draft release (for review) |
| `vibedraft init Test --local` | Test using local templates (no GitHub needed) |

## First Time Setup

### If You Have GitHub CLI

```bash
# Install GitHub CLI (if needed)
brew install gh          # macOS
# or visit: https://cli.github.com/

# Login
gh auth login

# Build and release
npm run build:releases
npm run release:github
```

### If You Don't Have GitHub CLI

```bash
# 1. Build packages
npm run build:releases

# 2. Go to GitHub and create release manually
open https://github.com/MantisWare/VibeDraft/releases/new

# 3. Upload files from .genreleases/ directory
```

## Testing Without Releases

```bash
# Use local templates during development
vibedraft init TestProject --local --ai cursor

# Auto-fallback also works if GitHub is unavailable
vibedraft init TestProject --ai cursor
# ↑ Will automatically use local templates if GitHub fails
```

## Complete Release Workflow

```bash
# 1. Make changes and commit
git add .
git commit -m "Add awesome feature"

# 2. Update CHANGELOG.md (manually)

# 3. Bump version
npm run release:patch    # 0.0.7 → 0.0.8

# 4. Build release packages
npm run build:releases

# 5. Create GitHub release
npm run release:github

# 6. Publish to npm
npm run publish:npm
```

## What's In Each Package?

```
vibedraft-template-cursor-sh-0.0.7.zip
├── .vibedraft/
│   ├── scripts/bash/         # All automation scripts
│   ├── templates/            # Document templates
│   └── memory/               # Project constitution
├── .cursor/
│   └── commands/             # Cursor-specific commands
├── specs/                    # Empty, ready for features
├── README.md
├── .gitignore
└── spec-driven.md
```

## New Features You Got

### 1. Release System
- **`scripts/create-release-packages.js`** - Package generator
- **`scripts/create-github-release.js`** - GitHub release creator
- Generates 12 packages (12 agents × 1 script type)
- Output: `.genreleases/` (gitignored)

### 2. Local Development
- **`--local` flag** - Use local templates
- **Auto-fallback** - Gracefully handles GitHub failures
- Better error messages with solutions

### 3. Documentation
- **`docs/creating-releases.md`** - Complete release guide
- **`CHANGELOG.md`** - Updated with new features
- **`package.json`** - New npm scripts

## Troubleshooting

### "GitHub API returned 404"
```bash
# Just use local templates until you create a release
vibedraft init Test --local --ai cursor
```

### "gh: command not found"
```bash
# Install GitHub CLI
brew install gh

# Or manually upload packages
npm run build:releases
# Then upload .genreleases/*.zip to GitHub manually
```

### Want to test before releasing?
```bash
# Always test with local templates first
vibedraft init TestProject --local --ai cursor
cd TestProject
# Test your commands...
```

## File Structure Added

```
VibeDraft/
├── scripts/
│   ├── create-release-packages.js    ← NEW
│   └── create-github-release.js      ← NEW
├── docs/
│   └── creating-releases.md          ← NEW
├── .genreleases/                     ← NEW (gitignored)
│   ├── vibedraft-template-claude-sh-0.0.7.zip
│   ├── vibedraft-template-cursor-sh-0.0.7.zip
│   └── ... (12 total packages)
├── CHANGELOG.md                      ← UPDATED
├── package.json                      ← UPDATED (new scripts)
├── .gitignore                        ← UPDATED
└── QUICK-RELEASE-GUIDE.md           ← THIS FILE
```

## What Changed

### package.json Scripts
```json
{
  "build:releases": "node scripts/create-release-packages.js",
  "release:github": "node scripts/create-github-release.js",
  "release:github:draft": "node scripts/create-github-release.js --draft"
}
```

### CLI Options
```bash
vibedraft init <name> --local    # Use local templates
```

### Auto-Fallback
If GitHub download fails → automatically tries local templates → better error messages if both fail

## Next Steps

1. **Test locally first:**
   ```bash
   vibedraft init TestProject --local --ai cursor
   ```

2. **Build release packages:**
   ```bash
   npm run build:releases
   ```

3. **Create GitHub release:**
   ```bash
   npm run release:github
   # or manually upload from .genreleases/
   ```

4. **Test production download:**
   ```bash
   vibedraft init ProductionTest --ai cursor
   # Should download from GitHub now!
   ```

## Resources

- **Full Documentation:** `docs/creating-releases.md`
- **Package Generator:** `scripts/create-release-packages.js`
- **GitHub Release Creator:** `scripts/create-github-release.js`
- **GitHub CLI:** https://cli.github.com/

---

**You're ready to release! 🎉**

For detailed information, see `docs/creating-releases.md`.

