#!/usr/bin/env node

/**
 * Create a new feature spec with proper numbering and branch
 */

import { execSync } from 'child_process';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import specs locator utility
const specsLocatorPath = path.join(__dirname, '..', 'lib', 'specs-locator.js');
const { findSpecsDirectory } = await import(specsLocatorPath);

const args = process.argv.slice(2);
let jsonMode = false;
const featureArgs = [];

// Parse arguments
for (const arg of args) {
  if (arg === '--json') {
    jsonMode = true;
  } else if (arg === '--help' || arg === '-h') {
    console.log('Usage: node create-new-feature.js [--json] <feature_description>');
    process.exit(0);
  } else {
    featureArgs.push(arg);
  }
}

const featureDescription = featureArgs.join(' ');
if (!featureDescription) {
  console.error('Usage: node create-new-feature.js [--json] <feature_description>');
  process.exit(1);
}

/**
 * Find the repository root by searching for existing project markers
 */
function findRepoRoot(dir) {
  while (dir !== path.parse(dir).root) {
    if (fs.existsSync(path.join(dir, '.git')) || fs.existsSync(path.join(dir, '.vibedraft'))) {
      return dir;
    }
    dir = path.dirname(dir);
  }
  return null;
}

// Resolve repository root
let repoRoot;
let hasGit = false;

try {
  repoRoot = execSync('git rev-parse --show-toplevel', {
    encoding: 'utf-8',
    stdio: ['pipe', 'pipe', 'pipe']
  }).trim();
  hasGit = true;
} catch (_error) {
  repoRoot = findRepoRoot(process.cwd());
  if (!repoRoot) {
    console.error('Error: Could not determine repository root. Please run this script from within the repository.');
    process.exit(1);
  }
  hasGit = false;
}

process.chdir(repoRoot);

// Find specs directory (supports both old and new locations)
const specsDir = await findSpecsDirectory(repoRoot);
fs.ensureDirSync(specsDir);

// Find highest existing feature number
let highest = 0;
if (fs.existsSync(specsDir)) {
  const dirs = fs.readdirSync(specsDir);
  for (const dirname of dirs) {
    const fullPath = path.join(specsDir, dirname);
    if (fs.statSync(fullPath).isDirectory()) {
      const match = dirname.match(/^(\d+)/);
      if (match) {
        const number = parseInt(match[1], 10);
        if (number > highest) {
          highest = number;
        }
      }
    }
  }
}

const next = highest + 1;
const featureNum = next.toString().padStart(3, '0');

// Create branch name
let branchName = featureDescription
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-+|-+$/g, '');

// Take first 3 words
const words = branchName.split('-').filter(w => w).slice(0, 3).join('-');
branchName = `${featureNum}-${words}`;

// Create git branch if we have git
if (hasGit) {
  try {
    execSync(`git checkout -b ${branchName}`, { stdio: 'inherit' });
  } catch (error) {
    console.error(`Error creating branch: ${error.message}`);
    process.exit(1);
  }
} else {
  console.error(`[vibedraft] Warning: Git repository not detected; skipped branch creation for ${branchName}`);
}

// Create feature directory
const featureDir = path.join(specsDir, branchName);
fs.ensureDirSync(featureDir);

// Copy template
const template = path.join(repoRoot, '.vibedraft', 'templates', 'spec-template.md');
const specFile = path.join(featureDir, 'spec.md');

if (fs.existsSync(template)) {
  fs.copyFileSync(template, specFile);
} else {
  fs.writeFileSync(specFile, '');
}

// Set the VIBEDRAFT_FEATURE environment variable
process.env.VIBEDRAFT_FEATURE = branchName;

// Output results
if (jsonMode) {
  console.log(JSON.stringify({
    BRANCH_NAME: branchName,
    SPEC_FILE: specFile,
    FEATURE_NUM: featureNum
  }));
} else {
  console.log(`BRANCH_NAME: ${branchName}`);
  console.log(`SPEC_FILE: ${specFile}`);
  console.log(`FEATURE_NUM: ${featureNum}`);
  console.log(`VIBEDRAFT_FEATURE environment variable set to: ${branchName}`);
}
