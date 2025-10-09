import { spawn, exec } from 'child_process';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import os from 'os';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const CLAUDE_LOCAL_PATH = path.join(os.homedir(), '.claude', 'local', 'claude');

/**
 * Check if a tool is installed
 */
export async function checkTool(tool) {
  // Special handling for Claude CLI
  if (tool === 'claude') {
    if (await fs.pathExists(CLAUDE_LOCAL_PATH)) {
      const stats = await fs.stat(CLAUDE_LOCAL_PATH);
      if (stats.isFile()) {
        return true;
      }
    }
  }

  return new Promise((resolve) => {
    const command = process.platform === 'win32' ? 'where' : 'which';
    exec(`${command} ${tool}`, (error) => {
      resolve(!error);
    });
  });
}

/**
 * Run a command
 */
export async function runCommand(cmd, args = [], options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, {
      stdio: options.capture ? 'pipe' : 'inherit',
      shell: options.shell ?? false,
      cwd: options.cwd
    });

    let stdout = '';
    let stderr = '';

    if (options.capture) {
      child.stdout?.on('data', (data) => {
        stdout += data.toString();
      });
      child.stderr?.on('data', (data) => {
        stderr += data.toString();
      });
    }

    child.on('close', (code) => {
      if (code === 0 || !options.checkReturn) {
        resolve(options.capture ? stdout.trim() : null);
      } else {
        reject(new Error(`Command failed with exit code ${code}${stderr ? `: ${stderr}` : ''}`));
      }
    });

    child.on('error', (err) => {
      reject(err);
    });
  });
}

/**
 * Get GitHub token from environment or parameter
 */
export function getGithubToken(cliToken = null) {
  const token = cliToken ?? process.env.GH_TOKEN ?? process.env.GITHUB_TOKEN ?? '';
  return token.trim() || null;
}

/**
 * Get GitHub auth headers
 */
export function getGithubAuthHeaders(cliToken = null) {
  const token = getGithubToken(cliToken);
  return token ? { Authorization: `Bearer ${token}` } : {};
}

/**
 * Ensure scripts are executable (Unix-like systems only)
 */
export async function ensureExecutableScripts(projectPath, tracker = null) {
  if (process.platform === 'win32') {
    return; // Skip on Windows
  }

  const scriptsRoot = path.join(projectPath, '.vibedraft', 'scripts');
  if (!(await fs.pathExists(scriptsRoot))) {
    return;
  }

  const failures = [];
  let updated = 0;

  async function processFile(filePath) {
    try {
      const stats = await fs.stat(filePath);
      if (!stats.isFile() || stats.isSymbolicLink()) {
        return;
      }

      // Check if it's a shell script
      if (!filePath.endsWith('.sh')) {
        return;
      }

      // Check if starts with shebang
      const fd = await fs.open(filePath, 'r');
      const buffer = Buffer.alloc(2);
      await fd.read(buffer, 0, 2, 0);
      await fd.close();

      if (buffer.toString() !== '#!') {
        return;
      }

      // Check if already executable
      const mode = stats.mode;
      if (mode & 0o111) {
        return; // Already executable
      }

      // Add execute permissions
      let newMode = mode;
      if (mode & 0o400) newMode |= 0o100;
      if (mode & 0o040) newMode |= 0o010;
      if (mode & 0o004) newMode |= 0o001;
      if (!(newMode & 0o100)) newMode |= 0o100;

      await fs.chmod(filePath, newMode);
      updated++;
    } catch (e) {
      failures.push(`${path.relative(scriptsRoot, filePath)}: ${e.message}`);
    }
  }

  async function walkDir(dir) {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        await walkDir(fullPath);
      } else if (entry.isFile()) {
        await processFile(fullPath);
      }
    }
  }

  await walkDir(scriptsRoot);

  if (tracker) {
    const detail = `${updated} updated${failures.length ? `, ${failures.length} failed` : ''}`;
    tracker.add('chmod', 'Set script permissions recursively');
    if (failures.length) {
      tracker.error('chmod', detail);
    } else {
      tracker.complete('chmod', detail);
    }
  }
}
