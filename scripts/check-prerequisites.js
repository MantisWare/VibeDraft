#!/usr/bin/env node

/**
 * Consolidated prerequisite checking script
 *
 * This script provides unified prerequisite checking for Spec-Driven Development workflow.
 * It replaces the functionality previously spread across multiple scripts.
 *
 * Usage: node check-prerequisites.js [OPTIONS]
 *
 * OPTIONS:
 *   --json              Output in JSON format
 *   --require-tasks     Require tasks.md to exist (for implementation phase)
 *   --include-tasks     Include tasks.md in AVAILABLE_DOCS list
 *   --paths-only        Only output path variables (no validation)
 *   --help, -h          Show help message
 */

import fs from 'fs-extra';
import { getFeaturePaths, checkFeatureBranch, checkFile, checkDir } from './common.js';

const args = process.argv.slice(2);
let jsonMode = false;
let requireTasks = false;
let includeTasks = false;
let pathsOnly = false;

// Parse arguments
for (const arg of args) {
  switch (arg) {
    case '--json':
      jsonMode = true;
      break;
    case '--require-tasks':
      requireTasks = true;
      break;
    case '--include-tasks':
      includeTasks = true;
      break;
    case '--paths-only':
      pathsOnly = true;
      break;
    case '--help':
    case '-h':
      console.log(`Usage: node check-prerequisites.js [OPTIONS]

Consolidated prerequisite checking for Spec-Driven Development workflow.

OPTIONS:
  --json              Output in JSON format
  --require-tasks     Require tasks.md to exist (for implementation phase)
  --include-tasks     Include tasks.md in AVAILABLE_DOCS list
  --paths-only        Only output path variables (no prerequisite validation)
  --help, -h          Show this help message

EXAMPLES:
  # Check task prerequisites (plan.md required)
  node check-prerequisites.js --json
  
  # Check implementation prerequisites (plan.md + tasks.md required)
  node check-prerequisites.js --json --require-tasks --include-tasks
  
  # Get feature paths only (no validation)
  node check-prerequisites.js --paths-only
`);
      process.exit(0);
      break;
    default:
      console.error(`ERROR: Unknown option '${arg}'. Use --help for usage information.`);
      process.exit(1);
  }
}

// Get feature paths and validate branch
const paths = getFeaturePaths();
if (!checkFeatureBranch(paths.CURRENT_BRANCH, paths.HAS_GIT)) {
  process.exit(1);
}

// If paths-only mode, output paths and exit
if (pathsOnly) {
  if (jsonMode) {
    console.log(JSON.stringify({
      REPO_ROOT: paths.REPO_ROOT,
      BRANCH: paths.CURRENT_BRANCH,
      FEATURE_DIR: paths.FEATURE_DIR,
      FEATURE_SPEC: paths.FEATURE_SPEC,
      IMPL_PLAN: paths.IMPL_PLAN,
      TASKS: paths.TASKS
    }));
  } else {
    console.log(`REPO_ROOT: ${paths.REPO_ROOT}`);
    console.log(`BRANCH: ${paths.CURRENT_BRANCH}`);
    console.log(`FEATURE_DIR: ${paths.FEATURE_DIR}`);
    console.log(`FEATURE_SPEC: ${paths.FEATURE_SPEC}`);
    console.log(`IMPL_PLAN: ${paths.IMPL_PLAN}`);
    console.log(`TASKS: ${paths.TASKS}`);
  }
  process.exit(0);
}

// Validate required directories and files
if (!fs.existsSync(paths.FEATURE_DIR)) {
  console.error(`ERROR: Feature directory not found: ${paths.FEATURE_DIR}`);
  console.error('Run /vibedraft.draft first to create the feature structure.');
  process.exit(1);
}

if (!fs.existsSync(paths.IMPL_PLAN)) {
  console.error(`ERROR: plan.md not found in ${paths.FEATURE_DIR}`);
  console.error('Run /vibedraft.plan first to create the implementation plan.');
  process.exit(1);
}

// Check for tasks.md if required
if (requireTasks && !fs.existsSync(paths.TASKS)) {
  console.error(`ERROR: tasks.md not found in ${paths.FEATURE_DIR}`);
  console.error('Run /vibedraft.tasks first to create the task list.');
  process.exit(1);
}

// Build list of available documents
const docs = [];

// Always check these optional docs
if (fs.existsSync(paths.RESEARCH)) docs.push('research.md');
if (fs.existsSync(paths.DATA_MODEL)) docs.push('data-model.md');

// Check contracts directory (only if it exists and has files)
if (fs.existsSync(paths.CONTRACTS_DIR)) {
  const files = fs.readdirSync(paths.CONTRACTS_DIR);
  if (files.length > 0) {
    docs.push('contracts/');
  }
}

if (fs.existsSync(paths.QUICKSTART)) docs.push('quickstart.md');

// Include tasks.md if requested and it exists
if (includeTasks && fs.existsSync(paths.TASKS)) {
  docs.push('tasks.md');
}

// Output results
if (jsonMode) {
  console.log(JSON.stringify({
    FEATURE_DIR: paths.FEATURE_DIR,
    AVAILABLE_DOCS: docs
  }));
} else {
  console.log(`FEATURE_DIR:${paths.FEATURE_DIR}`);
  console.log('AVAILABLE_DOCS:');
  console.log(checkFile(paths.RESEARCH, 'research.md'));
  console.log(checkFile(paths.DATA_MODEL, 'data-model.md'));
  console.log(checkDir(paths.CONTRACTS_DIR, 'contracts/'));
  console.log(checkFile(paths.QUICKSTART, 'quickstart.md'));

  if (includeTasks) {
    console.log(checkFile(paths.TASKS, 'tasks.md'));
  }
}
