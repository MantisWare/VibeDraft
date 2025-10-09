# 🚀 VibeDraft Setup Guide

## ⚡ Quick Start - Let's Get You Vibing!

### 1. 📦 Grab the Dependencies

```bash
cd src/node
npm install
```

### 2. 🔓 Make It Executable (Unix/Mac/Linux)

```bash
chmod +x index.js
```

### 3. 🧪 Test the Vibes Locally

```bash
# Link the package locally (one-time setup)
npm link

# Now summon the vibes from anywhere! ✨
vibedraft --help
vibedraft check
vibedraft init test-project
```

### 4. 🎯 Alternative: Direct Run (No Link Required)

```bash
# Just run it directly!
node index.js --help
node index.js check
node index.js init test-project
```

### 5. ⚡ Alternative: Quick Vibe with npx

```bash
# From within the project directory
npx . --help
npx . check
npx . init test-project
```

## 🌍 Share the Vibes (Publishing to npm)

Ready to share VibeDraft with the world?

```bash
# Login to npm (first time only)
npm login

# Release the vibes! 🎉
npm publish
```

Then everyone can join the party:

```bash
npm install -g vibedraft-cli
vibedraft init my-project
```

## 🔧 Development Mode

### 🧪 Running Tests & Vibing Out Features

```bash
# Test the init command
node index.js init test-project --ai claude --script sh

# Test in current directory
mkdir temp-test && cd temp-test
node ../index.js init --here --ai copilot --force

# Test check command
node index.js check
```

### Environment Variables

Set these for testing with private repos:

```bash
export GH_TOKEN="your_github_token"
# or
export GITHUB_TOKEN="your_github_token"
```

## 🚨 Troubleshooting (When the Vibes Are Off)

### 🔒 Permission Denied

If you get "permission denied" on Unix-like systems:

```bash
chmod +x index.js
```

### Module Not Found

Make sure you're in the `src/node` directory and have run:

```bash
npm install
```

### SSL/TLS Errors

If you encounter SSL/TLS verification errors:

```bash
node index.js init test-project --skip-tls
```

(Not recommended for production use)

## ✨ Feature Complete - All the Vibes!

✅ We've got all the goods from the Python version:

- Interactive AI assistant selection
- Interactive script type selection
- GitHub release downloading
- Template extraction
- Git repository initialization
- Cross-platform support
- Progress tracking with live updates
- Error handling and validation
- Executable script permissions (Unix)
- Multiple AI agent support
- Force/skip options
- Debug mode

## Structure

```
src/node/
├── index.js                 # CLI entry point
├── commands/
│   ├── init.js             # Init command
│   └── check.js            # Check command
├── lib/
│   ├── banner.js           # ASCII banner
│   ├── tracker.js          # Progress tracker
│   ├── ui.js               # UI components
│   ├── utils.js            # Utilities
│   ├── git.js              # Git operations
│   └── download.js         # GitHub download
└── package.json            # Dependencies
```

## 📝 Good to Know

- 🎨 We're using ES modules (`type: "module"` in package.json) - nice and modern!
- ⚡ Minimum Node.js version: 18.0.0 (gotta keep up with the times!)
- 📌 All dependencies are pinned for maximum stability
- 🎯 The complexity in `init.js` is intentional - it mirrors the Python version's structure

