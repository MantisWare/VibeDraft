#!/usr/bin/env node

/**
 * 🎨 Common functions and variables for all VibeDraft scripts
 * Where the magic happens! ✨
 */

import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs-extra';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Get repository root, with fallback for non-git repositories
 */
export function getRepoRoot() {
  try {
    const root = execSync('git rev-parse --show-toplevel', {
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'pipe']
    }).trim();
    return root;
  } catch (_error) {
    // Fall back to script location for non-git repos
    return path.resolve(__dirname, '../../..');
  }
}

/**
 * Get current branch, with fallback for non-git repositories
 */
export function getCurrentBranch() {
  // First check if VIBEDRAFT_FEATURE environment variable is set
  if (process.env.VIBEDRAFT_FEATURE) {
    return process.env.VIBEDRAFT_FEATURE;
  }

  // Then check git if available
  try {
    const branch = execSync('git rev-parse --abbrev-ref HEAD', {
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'pipe']
    }).trim();
    return branch;
  } catch (_error) {
    // For non-git repos, try to find the latest feature directory
    const repoRoot = getRepoRoot();
    const specsDir = path.join(repoRoot, 'specs');

    if (fs.existsSync(specsDir)) {
      let latestFeature = '';
      let highest = 0;

      const dirs = fs.readdirSync(specsDir);
      for (const dirname of dirs) {
        const fullPath = path.join(specsDir, dirname);
        if (fs.statSync(fullPath).isDirectory()) {
          const match = dirname.match(/^(\d{3})-/);
          if (match) {
            const number = parseInt(match[1], 10);
            if (number > highest) {
              highest = number;
              latestFeature = dirname;
            }
          }
        }
      }

      if (latestFeature) {
        return latestFeature;
      }
    }

    return 'main'; // Final fallback
  }
}

/**
 * Check if we have git available
 */
export function hasGit() {
  try {
    execSync('git rev-parse --show-toplevel', {
      stdio: ['pipe', 'pipe', 'pipe']
    });
    return true;
  } catch (_error) {
    return false;
  }
}

/**
 * Check if we're on a valid feature branch
 */
export function checkFeatureBranch(branch, hasGitRepo) {
  // For non-git repos, we can't enforce branch naming but still provide output
  if (!hasGitRepo) {
    console.error('[vibedraft] Warning: Git repository not detected; skipped branch validation');
    return true;
  }

  if (!/^\d{3}-/.test(branch)) {
    console.error(`ERROR: Not on a feature branch. Current branch: ${branch}`);
    console.error('Feature branches should be named like: 001-feature-name');
    return false;
  }

  return true;
}

/**
 * Get feature directory path
 */
export function getFeatureDir(repoRoot, branch) {
  return path.join(repoRoot, 'specs', branch);
}

/**
 * Get all feature paths
 */
export function getFeaturePaths() {
  const repoRoot = getRepoRoot();
  const currentBranch = getCurrentBranch();
  const hasGitRepo = hasGit();
  const featureDir = getFeatureDir(repoRoot, currentBranch);

  return {
    REPO_ROOT: repoRoot,
    CURRENT_BRANCH: currentBranch,
    HAS_GIT: hasGitRepo,
    FEATURE_DIR: featureDir,
    FEATURE_SPEC: path.join(featureDir, 'spec.md'),
    IMPL_PLAN: path.join(featureDir, 'plan.md'),
    TASKS: path.join(featureDir, 'tasks.md'),
    RESEARCH: path.join(featureDir, 'research.md'),
    DATA_MODEL: path.join(featureDir, 'data-model.md'),
    QUICKSTART: path.join(featureDir, 'quickstart.md'),
    CONTRACTS_DIR: path.join(featureDir, 'contracts')
  };
}

/**
 * Check if a file exists and return status string
 */
export function checkFile(filePath, label) {
  return fs.existsSync(filePath) ? `  ✓ ${label}` : `  ✗ ${label}`;
}

/**
 * Check if a directory exists and has contents
 */
export function checkDir(dirPath, label) {
  if (!fs.existsSync(dirPath)) {
    return `  ✗ ${label}`;
  }

  try {
    const files = fs.readdirSync(dirPath);
    return files.length > 0 ? `  ✓ ${label}` : `  ✗ ${label}`;
  } catch (_error) {
    return `  ✗ ${label}`;
  }
}
