#!/usr/bin/env node

/**
 * ✨ VibeDraft CLI - Where Specs Meet Vibes! 🎨
 *
 * Quick vibe:
 *     npx vibedraft-cli init <project-name>
 *     npx vibedraft-cli init .
 *     npx vibedraft-cli init --here
 *
 * Keep the vibes flowing (global install):
 *     npm install -g vibedraft-cli
 *     vibedraft init <project-name>
 *     vibedraft init .
 *     vibedraft init --here
 *
 * Let's goooo! 🚀
 */

import { Command } from 'commander';
import { initCommand } from './commands/init.js';
import { checkCommand } from './commands/check.js';
import { showBanner } from './lib/banner.js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Get version from package.json
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const packageJson = JSON.parse(readFileSync(join(__dirname, 'package.json'), 'utf-8'));

const program = new Command();

program
  .name('vibedraft')
  .description('Setup tool for VibeDraft spec-driven development projects')
  .version(packageJson.version)
  .hook('preAction', (_thisCommand) => {
    // Show banner for all commands
    if (!process.argv.includes('--help') && !process.argv.includes('-h')) {
      showBanner();
    }
  });

// Init command
program
  .command('init [project-name]')
  .description('Initialize a new VibeDraft project from the latest template')
  .option('--ai <assistant>', 'AI assistant to use: claude, gemini, copilot, cursor, qwen, opencode, codex, windsurf, kilocode, auggie, roo, or q')
  .option('--ignore-agent-tools', 'Skip checks for AI agent tools like Claude Code', false)
  .option('--no-git', 'Skip git repository initialization')
  .option('--here', 'Initialize project in the current directory instead of creating a new one', false)
  .option('--force', 'Force merge/overwrite when using --here (skip confirmation)', false)
  .option('--local', 'Use local templates instead of downloading from GitHub (for development)', false)
  .option('--skip-tls', 'Skip SSL/TLS verification (not recommended)', false)
  .option('--debug', 'Show verbose diagnostic output for network and extraction failures', false)
  .option('--github-token <token>', 'GitHub token to use for API requests')
  .action(initCommand);

// Check command
program
  .command('check')
  .description('Check that all required tools are installed')
  .action(checkCommand);

// Show banner when no command provided
if (process.argv.length === 2) {
  showBanner();
  console.log('\nRun \'vibedraft --help\' for usage information\n');
  process.exit(0);
}

program.parse(process.argv);
