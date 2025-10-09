#!/usr/bin/env node

/**
 * Create GitHub release with all template packages
 * Requires GitHub CLI (gh) to be installed and authenticated
 */

import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';
import chalk from 'chalk';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const REPO_ROOT = path.resolve(__dirname, '..');
const RELEASE_DIR = path.join(REPO_ROOT, '.genreleases');

/**
 * Check if GitHub CLI is installed
 */
function checkGhCli() {
  try {
    execSync('gh --version', { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

/**
 * Check if user is authenticated with GitHub CLI
 */
function checkGhAuth() {
  try {
    execSync('gh auth status', { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

/**
 * Get release notes from CHANGELOG.md
 */
async function getReleaseNotes(version) {
  const changelogPath = path.join(REPO_ROOT, 'CHANGELOG.md');

  if (!(await fs.pathExists(changelogPath))) {
    return `Release v${version}`;
  }

  try {
    const changelog = await fs.readFile(changelogPath, 'utf-8');

    // Try to extract the section for this version
    const versionPattern = new RegExp(`## \\[?${version}\\]?[\\s\\S]*?(?=## \\[?\\d|$)`, 'i');
    const match = changelog.match(versionPattern);

    if (match) {
      return match[0].trim();
    }

    return `Release v${version}`;
  } catch {
    return `Release v${version}`;
  }
}

/**
 * Create GitHub release
 */
async function createRelease(version, packages, isDraft = false, isPrerelease = false) {
  console.log(chalk.cyan(`\nCreating GitHub release v${version}...`));

  // Get release notes
  const notes = await getReleaseNotes(version);
  const notesFile = path.join(RELEASE_DIR, 'release-notes.md');
  await fs.writeFile(notesFile, notes, 'utf-8');

  // Build gh release create command
  const tag = `v${version}`;
  let cmd = `gh release create ${tag}`;

  // Add flags
  cmd += ` --title "VibeDraft v${version}"`;
  cmd += ` --notes-file "${notesFile}"`;

  if (isDraft) {
    cmd += ' --draft';
  }

  if (isPrerelease) {
    cmd += ' --prerelease';
  }

  // Add all package files
  for (const pkg of packages) {
    cmd += ` "${pkg}"`;
  }

  console.log(chalk.dim(`\nExecuting: ${cmd}\n`));

  try {
    const output = execSync(cmd, {
      cwd: REPO_ROOT,
      encoding: 'utf-8',
      stdio: 'pipe'
    });

    console.log(chalk.green('✅ Release created successfully!\n'));
    console.log(output);

    // Cleanup notes file
    await fs.remove(notesFile);

    return true;
  } catch (error) {
    console.error(chalk.red('❌ Failed to create release:'));
    console.error(error.message);
    if (error.stdout) {
      console.error(chalk.dim(error.stdout.toString()));
    }
    if (error.stderr) {
      console.error(chalk.dim(error.stderr.toString()));
    }
    return false;
  }
}

/**
 * Main execution
 */
async function main() {
  console.log(chalk.bold.cyan('\n🚀 VibeDraft GitHub Release Creator\n'));

  // Check prerequisites
  if (!checkGhCli()) {
    console.error(chalk.red('❌ GitHub CLI (gh) is not installed'));
    console.log(chalk.yellow('\nInstall it from: https://cli.github.com/'));
    process.exit(1);
  }

  if (!checkGhAuth()) {
    console.error(chalk.red('❌ Not authenticated with GitHub CLI'));
    console.log(chalk.yellow('\nRun: gh auth login'));
    process.exit(1);
  }

  // Check if release directory exists
  if (!(await fs.pathExists(RELEASE_DIR))) {
    console.error(chalk.red('❌ Release directory not found'));
    console.log(chalk.yellow('\nRun: npm run build:releases'));
    process.exit(1);
  }

  // Get version from package.json
  const packageJson = await fs.readJson(path.join(REPO_ROOT, 'package.json'));
  const version = packageJson.version;

  console.log(chalk.cyan(`Version: ${version}\n`));

  // Get all ZIP files in release directory
  const files = await fs.readdir(RELEASE_DIR);
  const packages = files
    .filter(f => f.endsWith('.zip') && f.includes(version))
    .map(f => path.join(RELEASE_DIR, f));

  if (packages.length === 0) {
    console.error(chalk.red('❌ No release packages found'));
    console.log(chalk.yellow('\nRun: npm run build:releases'));
    process.exit(1);
  }

  console.log(chalk.bold('Packages to upload:'));
  for (const pkg of packages) {
    const stats = await fs.stat(pkg);
    console.log(chalk.dim(`  • ${path.basename(pkg)} (${(stats.size / 1024).toFixed(2)} KB)`));
  }
  console.log();

  // Parse command line arguments
  const args = process.argv.slice(2);
  const isDraft = args.includes('--draft');
  const isPrerelease = args.includes('--prerelease');

  if (isDraft) {
    console.log(chalk.yellow('⚠️  Creating as DRAFT release'));
  }
  if (isPrerelease) {
    console.log(chalk.yellow('⚠️  Creating as PRE-RELEASE'));
  }

  // Create the release
  const success = await createRelease(version, packages, isDraft, isPrerelease);

  if (success) {
    console.log(chalk.bold.green('\n✅ All done!\n'));
    console.log(chalk.white('View your release at:'));
    console.log(chalk.cyan(`https://github.com/MantisWare/VibeDraft/releases/tag/v${version}\n`));
  } else {
    process.exit(1);
  }
}

// Run
main().catch((error) => {
  console.error(chalk.red('\n❌ Fatal error:'), error.message);
  if (error.stack) {
    console.error(chalk.dim(error.stack));
  }
  process.exit(1);
});
