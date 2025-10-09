#!/usr/bin/env node

/**
 * Setup implementation plan for current feature
 */

import fs from 'fs-extra';
import path from 'path';
import { getFeaturePaths, checkFeatureBranch } from './common.js';

const args = process.argv.slice(2);
let jsonMode = false;

// Parse arguments
for (const arg of args) {
  if (arg === '--json') {
    jsonMode = true;
  } else if (arg === '--help' || arg === '-h') {
    console.log(`Usage: node setup-plan.js [--json]
  --json    Output results in JSON format
  --help    Show this help message`);
    process.exit(0);
  }
}

// Get all paths and variables from common functions
const paths = getFeaturePaths();

// Check if we're on a proper feature branch (only for git repos)
if (!checkFeatureBranch(paths.CURRENT_BRANCH, paths.HAS_GIT)) {
  process.exit(1);
}

// Ensure the feature directory exists
fs.ensureDirSync(paths.FEATURE_DIR);

// Copy plan template if it exists
const template = path.join(paths.REPO_ROOT, '.vibedraft', 'templates', 'plan-template.md');
if (fs.existsSync(template)) {
  fs.copyFileSync(template, paths.IMPL_PLAN);
  console.log(`Copied plan template to ${paths.IMPL_PLAN}`);
} else {
  console.log(`Warning: Plan template not found at ${template}`);
  // Create a basic plan file if template doesn't exist
  fs.writeFileSync(paths.IMPL_PLAN, '');
}

// Output results
if (jsonMode) {
  console.log(JSON.stringify({
    FEATURE_SPEC: paths.FEATURE_SPEC,
    IMPL_PLAN: paths.IMPL_PLAN,
    SPECS_DIR: paths.FEATURE_DIR,
    BRANCH: paths.CURRENT_BRANCH,
    HAS_GIT: paths.HAS_GIT
  }));
} else {
  console.log(`FEATURE_SPEC: ${paths.FEATURE_SPEC}`);
  console.log(`IMPL_PLAN: ${paths.IMPL_PLAN}`);
  console.log(`SPECS_DIR: ${paths.FEATURE_DIR}`);
  console.log(`BRANCH: ${paths.CURRENT_BRANCH}`);
  console.log(`HAS_GIT: ${paths.HAS_GIT}`);
}
