# Local Development Guide

This guide shows how to iterate on the `vibedraft` CLI locally without publishing a release or committing to `main` first.

> Scripts are available in both Node.js (`.js`) and Bash (`.sh`) variants for cross-platform compatibility.

## 1. Clone and Switch Branches

```bash
git clone https://github.com/github/spec-kit.git
cd spec-kit
# Work on a feature branch
git checkout -b your-feature-branch
```

## 2. Run the CLI Directly (Fastest Feedback)

You can execute the CLI via the module entrypoint without installing anything:

```bash
# From repo root
python -m src.vibedraft_cli --help
python -m src.vibedraft_cli init demo-project --ai claude --ignore-agent-tools --script sh
```

If you prefer invoking the script file style (uses shebang):

```bash
python src/vibedraft_cli/__init__.py init demo-project --script ps
```

## 3. Use Editable Install (Isolated Environment)

Create an isolated environment using `uv` so dependencies resolve exactly like end users get them:

```bash
# Create & activate virtual env (uv auto-manages .venv)
uv venv
source .venv/bin/activate  # or on Windows: .venv\Scripts\activate

# Install project in editable mode
uv pip install -e .

# Now 'vibedraft' entrypoint is available
vibedraft --help
```

Re-running after code edits requires no reinstall because of editable mode.

## 4. Invoke with uvx Directly From Git (Current Branch)

`uvx` can run from a local path (or a Git ref) to simulate user flows:

```bash
uvx --from . vibedraft init demo-uvx --ai copilot --ignore-agent-tools --script sh
```

You can also point uvx at a specific branch without merging:

```bash
# Push your working branch first
git push origin your-feature-branch
uvx --from git+https://github.com/github/spec-kit.git@your-feature-branch vibedraft init demo-branch-test --script ps
```

### 4a. Absolute Path uvx (Run From Anywhere)

If you're in another directory, use an absolute path instead of `.`:

```bash
uvx --from /mnt/c/GitHub/spec-kit vibedraft --help
uvx --from /mnt/c/GitHub/spec-kit vibedraft init demo-anywhere --ai copilot --ignore-agent-tools --script sh
```

Set an environment variable for convenience:
```bash
export SPEC_KIT_SRC=/mnt/c/GitHub/spec-kit
uvx --from "$SPEC_KIT_SRC" vibedraft init demo-env --ai copilot --ignore-agent-tools --script ps
```

(Optional) Define a shell function:
```bash
vibedraft-dev() { uvx --from /mnt/c/GitHub/spec-kit vibedraft "$@"; }
# Then
vibedraft-dev --help
```

## 5. Testing Script Permission Logic

After running an `init`, check that shell scripts are executable on POSIX systems:

```bash
ls -l scripts | grep .sh
# Expect owner execute bit (e.g. -rwxr-xr-x)
```
On Windows, scripts are directly executable (no chmod needed).

## 6. Run Lint / Basic Checks (Add Your Own)

Currently no enforced lint config is bundled, but you can quickly sanity check importability:
```bash
python -c "import vibedraft_cli; print('Import OK')"
```

## 7. Build a Wheel Locally (Optional)

Validate packaging before publishing:

```bash
uv build
ls dist/
```
Install the built artifact into a fresh throwaway environment if needed.

## 8. Using a Temporary Workspace

When testing `init --here` in a dirty directory, create a temp workspace:

```bash
mkdir /tmp/spec-test && cd /tmp/spec-test
python -m src.vibedraft_cli init --here --ai claude --ignore-agent-tools --script sh  # if repo copied here
```
Or copy only the modified CLI portion if you want a lighter sandbox.

## 9. Debug Network / TLS Skips

If you need to bypass TLS validation while experimenting:

```bash
vibedraft check --skip-tls
vibedraft init demo --skip-tls --ai gemini --ignore-agent-tools --script ps
```
(Use only for local experimentation.)

## 10. Rapid Edit Loop Summary

| Action | Command |
|--------|---------|
| Run CLI directly | `python -m src.vibedraft_cli --help` |
| Editable install | `uv pip install -e .` then `vibedraft ...` |
| Local uvx run (repo root) | `uvx --from . vibedraft ...` |
| Local uvx run (abs path) | `uvx --from /mnt/c/GitHub/spec-kit vibedraft ...` |
| Git branch uvx | `uvx --from git+URL@branch vibedraft ...` |
| Build wheel | `uv build` |

## 11. Cleaning Up

Remove build artifacts / virtual env quickly:
```bash
rm -rf .venv dist build *.egg-info
```

## 12. Common Issues

| Symptom | Fix |
|---------|-----|
| `ModuleNotFoundError: typer` | Run `uv pip install -e .` |
| Scripts not executable (Linux) | Re-run init or `chmod +x scripts/*.sh` |
| Git step skipped | You passed `--no-git` or Git not installed |
| Wrong script type downloaded | Pass `--script sh` or `--script ps` explicitly |
| TLS errors on corporate network | Try `--skip-tls` (not for production) |

## 13. Next Steps

- Update docs and run through Quick Start using your modified CLI
- Open a PR when satisfied
- (Optional) Tag a release once changes land in `main`

