# Installation Guide

## Prerequisites

- **Linux/macOS/Windows** (cross-platform compatible)
- AI coding agent: [Claude Code](https://www.anthropic.com/claude-code), [GitHub Copilot](https://code.visualstudio.com/), or [Gemini CLI](https://github.com/google-gemini/gemini-cli)
- [uv](https://docs.astral.sh/uv/) for package management
- [Python 3.11+](https://www.python.org/downloads/)
- [Git](https://git-scm.com/downloads)

## Installation

### Initialize a New Project

The easiest way to get started is to initialize a new project:

```bash
uvx --from git+https://github.com/MantisWare/VibeDraft.git vibedraft init <PROJECT_NAME>
```

Or initialize in the current directory:

```bash
uvx --from git+https://github.com/MantisWare/VibeDraft.git vibedraft init .
# or use the --here flag
uvx --from git+https://github.com/MantisWare/VibeDraft.git vibedraft init --here
```

### Choose Your AI Agent

You can choose your AI agent during initialization:

```bash
uvx --from git+https://github.com/MantisWare/VibeDraft.git vibedraft init <project_name> --ai claude
uvx --from git+https://github.com/MantisWare/VibeDraft.git vibedraft init <project_name> --ai gemini
uvx --from git+https://github.com/MantisWare/VibeDraft.git vibedraft init <project_name> --ai copilot
```

### Script Compatibility

All automation scripts are available in both Node.js (`.js`) and Bash (`.sh`) formats for cross-platform compatibility on Linux/macOS/Windows.

### Ignore Agent Tools Check

If you prefer to get the templates without checking for the right tools:

```bash
uvx --from git+https://github.com/MantisWare/VibeDraft.git vibedraft init <project_name> --ai claude --ignore-agent-tools
```

## Verification

After initialization, you should see the following commands available in your AI agent:
- `/vibedraft.draft` - Create specifications
- `/vibedraft.plan` - Generate implementation plans  
- `/vibedraft.tasks` - Break down into actionable tasks

The `.vibedraft/scripts` directory will contain both `.js` and `.sh` scripts.

## Troubleshooting

### Git Credential Manager on Linux

If you're having issues with Git authentication on Linux, you can install Git Credential Manager:

```bash
#!/usr/bin/env bash
set -e
echo "Downloading Git Credential Manager v2.6.1..."
wget https://github.com/git-ecosystem/git-credential-manager/releases/download/v2.6.1/gcm-linux_amd64.2.6.1.deb
echo "Installing Git Credential Manager..."
sudo dpkg -i gcm-linux_amd64.2.6.1.deb
echo "Configuring Git to use GCM..."
git config --global credential.helper manager
echo "Cleaning up..."
rm gcm-linux_amd64.2.6.1.deb
```
