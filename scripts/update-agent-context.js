#!/usr/bin/env node

/**
 * Update agent context files with information from plan.md
 *
 * This script maintains AI agent context files by parsing feature specifications
 * and updating agent-specific configuration files with project information.
 *
 * Usage: node update-agent-context.js [agent_type]
 * Agent types: claude|gemini|copilot|cursor|qwen|opencode|codex|windsurf|kilocode|auggie|roo|q
 * Leave empty to update all existing agent files
 */

import fs from 'fs-extra';
import path from 'path';
import { getFeaturePaths } from './common.js';

const paths = getFeaturePaths();
const agentType = process.argv[2] ?? '';

// Agent-specific file paths
const agentFiles = {
  claude: path.join(paths.REPO_ROOT, 'CLAUDE.md'),
  gemini: path.join(paths.REPO_ROOT, 'GEMINI.md'),
  copilot: path.join(paths.REPO_ROOT, '.github', 'copilot-instructions.md'),
  cursor: path.join(paths.REPO_ROOT, '.cursor', 'rules', 'vibedraft-rules.mdc'),
  qwen: path.join(paths.REPO_ROOT, 'QWEN.md'),
  opencode: path.join(paths.REPO_ROOT, 'AGENTS.md'),
  codex: path.join(paths.REPO_ROOT, 'AGENTS.md'),
  windsurf: path.join(paths.REPO_ROOT, '.windsurf', 'rules', 'vibedraft-rules.md'),
  kilocode: path.join(paths.REPO_ROOT, '.kilocode', 'rules', 'vibedraft-rules.md'),
  auggie: path.join(paths.REPO_ROOT, '.augment', 'rules', 'vibedraft-rules.md'),
  roo: path.join(paths.REPO_ROOT, '.roo', 'rules', 'vibedraft-rules.md'),
  q: path.join(paths.REPO_ROOT, 'AGENTS.md')
};

const templateFile = path.join(paths.REPO_ROOT, '.vibedraft', 'templates', 'agent-file-template.md');

// Global variables for parsed plan data
let newLang = '';
let newFramework = '';
let newDb = '';
let newProjectType = '';

/**
 * Logging utilities
 */
function logInfo(msg) {
  console.log(`INFO: ${msg}`);
}

function logSuccess(msg) {
  console.log(`✓ ${msg}`);
}

function logError(msg) {
  console.error(`ERROR: ${msg}`);
}

function logWarning(msg) {
  console.error(`WARNING: ${msg}`);
}

/**
 * Validate environment
 */
function validateEnvironment() {
  // Check if we have a current branch/feature
  if (!paths.CURRENT_BRANCH) {
    logError('Unable to determine current feature');
    if (paths.HAS_GIT) {
      logInfo('Make sure you\'re on a feature branch');
    } else {
      logInfo('Set VIBEDRAFT_FEATURE environment variable or create a feature first');
    }
    process.exit(1);
  }

  // Check if plan.md exists
  if (!fs.existsSync(paths.IMPL_PLAN)) {
    logError(`No plan.md found at ${paths.IMPL_PLAN}`);
    logInfo('Make sure you\'re working on a feature with a corresponding spec directory');
    if (!paths.HAS_GIT) {
      logInfo('Use: export VIBEDRAFT_FEATURE=your-feature-name or create a new feature first');
    }
    process.exit(1);
  }

  // Check if template exists
  if (!fs.existsSync(templateFile)) {
    logWarning(`Template file not found at ${templateFile}`);
    logWarning('Creating new agent files will fail');
  }
}

/**
 * Extract a field from plan.md
 */
function extractPlanField(fieldPattern, planFile) {
  try {
    const content = fs.readFileSync(planFile, 'utf-8');
    const lines = content.split('\n');

    for (const line of lines) {
      if (line.startsWith(`**${fieldPattern}**: `)) {
        const value = line.substring(`**${fieldPattern}**: `.length).trim();
        if (value.includes('NEEDS CLARIFICATION') || value === 'N/A') {
          return '';
        }
        return value;
      }
    }

    return '';
  } catch (_error) {
    return '';
  }
}

/**
 * Parse plan data
 */
function parsePlanData(planFile) {
  if (!fs.existsSync(planFile)) {
    logError(`Plan file not found: ${planFile}`);
    return false;
  }

  logInfo(`Parsing plan data from ${planFile}`);

  newLang = extractPlanField('Language/Version', planFile);
  newFramework = extractPlanField('Primary Dependencies', planFile);
  newDb = extractPlanField('Storage', planFile);
  newProjectType = extractPlanField('Project Type', planFile);

  if (newLang) logInfo(`Found language: ${newLang}`);
  else logWarning('No language information found in plan');

  if (newFramework) logInfo(`Found framework: ${newFramework}`);
  if (newDb && newDb !== 'N/A') logInfo(`Found database: ${newDb}`);
  if (newProjectType) logInfo(`Found project type: ${newProjectType}`);

  return true;
}

/**
 * Format technology stack
 */
function formatTechnologyStack(lang, framework) {
  const parts = [];

  if (lang && lang !== 'NEEDS CLARIFICATION') parts.push(lang);
  if (framework && framework !== 'NEEDS CLARIFICATION' && framework !== 'N/A') parts.push(framework);

  return parts.join(' + ');
}

/**
 * Get project structure based on type
 */
function getProjectStructure(projectType) {
  if (projectType?.toLowerCase().includes('web')) {
    return 'backend/\nfrontend/\ntests/';
  }
  return 'src/\ntests/';
}

/**
 * Get commands for language
 */
function getCommandsForLanguage(lang) {
  if (lang.includes('Python')) {
    return 'cd src && pytest && ruff check .';
  } else if (lang.includes('Rust')) {
    return 'cargo test && cargo clippy';
  } else if (lang.includes('JavaScript') || lang.includes('TypeScript')) {
    return 'npm test && npm run lint';
  }
  return `# Add commands for ${lang}`;
}

/**
 * Get language conventions
 */
function getLanguageConventions(lang) {
  return `${lang}: Follow standard conventions`;
}

/**
 * Create new agent file
 */
function createNewAgentFile(targetFile, projectName, currentDate) {
  if (!fs.existsSync(templateFile)) {
    logError(`Template not found at ${templateFile}`);
    return false;
  }

  logInfo('Creating new agent context file from template...');

  let content = fs.readFileSync(templateFile, 'utf-8');

  // Build tech stack and recent change strings
  let techStack;
  if (newLang && newFramework) {
    techStack = `- ${newLang} + ${newFramework} (${paths.CURRENT_BRANCH})`;
  } else if (newLang) {
    techStack = `- ${newLang} (${paths.CURRENT_BRANCH})`;
  } else if (newFramework) {
    techStack = `- ${newFramework} (${paths.CURRENT_BRANCH})`;
  } else {
    techStack = `- (${paths.CURRENT_BRANCH})`;
  }

  let recentChange;
  if (newLang && newFramework) {
    recentChange = `- ${paths.CURRENT_BRANCH}: Added ${newLang} + ${newFramework}`;
  } else if (newLang) {
    recentChange = `- ${paths.CURRENT_BRANCH}: Added ${newLang}`;
  } else if (newFramework) {
    recentChange = `- ${paths.CURRENT_BRANCH}: Added ${newFramework}`;
  } else {
    recentChange = `- ${paths.CURRENT_BRANCH}: Added`;
  }

  const projectStructure = getProjectStructure(newProjectType);
  const commands = getCommandsForLanguage(newLang);
  const languageConventions = getLanguageConventions(newLang);

  // Replace placeholders
  content = content.replace(/\[PROJECT NAME\]/g, projectName);
  content = content.replace(/\[DATE\]/g, currentDate);
  content = content.replace(/\[EXTRACTED FROM ALL PLAN.MD FILES\]/g, techStack);
  content = content.replace(/\[ACTUAL STRUCTURE FROM PLANS\]/g, projectStructure);
  content = content.replace(/\[ONLY COMMANDS FOR ACTIVE TECHNOLOGIES\]/g, commands);
  content = content.replace(/\[LANGUAGE-SPECIFIC, ONLY FOR LANGUAGES IN USE\]/g, languageConventions);
  content = content.replace(/\[LAST 3 FEATURES AND WHAT THEY ADDED\]/g, recentChange);

  // Ensure parent directory exists
  fs.ensureDirSync(path.dirname(targetFile));
  fs.writeFileSync(targetFile, content, 'utf-8');

  return true;
}

/**
 * Update existing agent file
 */
function updateExistingAgentFile(targetFile, currentDate) {
  logInfo('Updating existing agent context file...');

  const content = fs.readFileSync(targetFile, 'utf-8');
  const lines = content.split('\n');
  const output = [];

  const techStack = formatTechnologyStack(newLang, newFramework);
  const newTechEntries = [];
  let newChangeEntry = '';

  // Prepare new technology entries
  if (techStack && !content.includes(techStack)) {
    newTechEntries.push(`- ${techStack} (${paths.CURRENT_BRANCH})`);
  }

  if (newDb && newDb !== 'N/A' && newDb !== 'NEEDS CLARIFICATION' && !content.includes(newDb)) {
    newTechEntries.push(`- ${newDb} (${paths.CURRENT_BRANCH})`);
  }

  // Prepare new change entry
  if (techStack) {
    newChangeEntry = `- ${paths.CURRENT_BRANCH}: Added ${techStack}`;
  } else if (newDb && newDb !== 'N/A' && newDb !== 'NEEDS CLARIFICATION') {
    newChangeEntry = `- ${paths.CURRENT_BRANCH}: Added ${newDb}`;
  }

  let inTechSection = false;
  let inChangesSection = false;
  let techEntriesAdded = false;
  let existingChangesCount = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Handle Active Technologies section
    if (line === '## Active Technologies') {
      output.push(line);
      inTechSection = true;
      continue;
    } else if (inTechSection && line.match(/^##\s/)) {
      // Add new tech entries before closing the section
      if (!techEntriesAdded && newTechEntries.length > 0) {
        output.push(...newTechEntries);
        techEntriesAdded = true;
      }
      output.push(line);
      inTechSection = false;
      continue;
    } else if (inTechSection && line === '') {
      // Add new tech entries before empty line in tech section
      if (!techEntriesAdded && newTechEntries.length > 0) {
        output.push(...newTechEntries);
        techEntriesAdded = true;
      }
      output.push(line);
      continue;
    }

    // Handle Recent Changes section
    if (line === '## Recent Changes') {
      output.push(line);
      // Add new change entry right after the heading
      if (newChangeEntry) {
        output.push(newChangeEntry);
      }
      inChangesSection = true;
      continue;
    } else if (inChangesSection && line.match(/^##\s/)) {
      output.push(line);
      inChangesSection = false;
      continue;
    } else if (inChangesSection && line.startsWith('- ')) {
      // Keep only first 2 existing changes
      if (existingChangesCount < 2) {
        output.push(line);
        existingChangesCount++;
      }
      continue;
    }

    // Update timestamp
    if (line.match(/\*\*Last updated\*\*:.*\d{4}-\d{2}-\d{2}/)) {
      output.push(line.replace(/\d{4}-\d{2}-\d{2}/, currentDate));
    } else {
      output.push(line);
    }
  }

  fs.writeFileSync(targetFile, output.join('\n'), 'utf-8');
  return true;
}

/**
 * Update agent file
 */
function updateAgentFile(targetFile, agentName) {
  logInfo(`Updating ${agentName} context file: ${targetFile}`);

  const projectName = path.basename(paths.REPO_ROOT);
  const currentDate = new Date().toISOString().split('T')[0];

  // Ensure parent directory exists
  fs.ensureDirSync(path.dirname(targetFile));

  if (!fs.existsSync(targetFile)) {
    // Create new file from template
    if (createNewAgentFile(targetFile, projectName, currentDate)) {
      logSuccess(`Created new ${agentName} context file`);
      return true;
    } else {
      logError('Failed to create new agent file');
      return false;
    }
  } else {
    // Update existing file
    if (updateExistingAgentFile(targetFile, currentDate)) {
      logSuccess(`Updated existing ${agentName} context file`);
      return true;
    } else {
      logError('Failed to update existing agent file');
      return false;
    }
  }
}

/**
 * Update specific agent
 */
function updateSpecificAgent(type) {
  const agentNames = {
    claude: 'Claude Code',
    gemini: 'Gemini CLI',
    copilot: 'GitHub Copilot',
    cursor: 'Cursor IDE',
    qwen: 'Qwen Code',
    opencode: 'opencode',
    codex: 'Codex CLI',
    windsurf: 'Windsurf',
    kilocode: 'Kilo Code',
    auggie: 'Auggie CLI',
    roo: 'Roo Code',
    q: 'Amazon Q Developer CLI'
  };

  if (!agentFiles[type]) {
    logError(`Unknown agent type '${type}'`);
    logError('Expected: claude|gemini|copilot|cursor|qwen|opencode|codex|windsurf|kilocode|auggie|roo|q');
    process.exit(1);
  }

  updateAgentFile(agentFiles[type], agentNames[type]);
}

/**
 * Update all existing agents
 */
function updateAllExistingAgents() {
  let foundAgent = false;

  const agentNames = {
    claude: 'Claude Code',
    gemini: 'Gemini CLI',
    copilot: 'GitHub Copilot',
    cursor: 'Cursor IDE',
    qwen: 'Qwen Code',
    opencode: 'opencode/Codex',
    windsurf: 'Windsurf',
    kilocode: 'Kilo Code',
    auggie: 'Auggie CLI',
    roo: 'Roo Code',
    q: 'Amazon Q Developer CLI'
  };

  // Check each possible agent file and update if it exists
  for (const [type, file] of Object.entries(agentFiles)) {
    if (fs.existsSync(file)) {
      updateAgentFile(file, agentNames[type] ?? type);
      foundAgent = true;
    }
  }

  // If no agent files exist, create a default Claude file
  if (!foundAgent) {
    logInfo('No existing agent files found, creating default Claude file...');
    updateAgentFile(agentFiles.claude, 'Claude Code');
  }
}

/**
 * Print summary
 */
function printSummary() {
  console.log();
  logInfo('Summary of changes:');

  if (newLang) console.log(`  - Added language: ${newLang}`);
  if (newFramework) console.log(`  - Added framework: ${newFramework}`);
  if (newDb && newDb !== 'N/A') console.log(`  - Added database: ${newDb}`);

  console.log();
  logInfo('Usage: node update-agent-context.js [claude|gemini|copilot|cursor|qwen|opencode|codex|windsurf|kilocode|auggie|roo|q]');
}

/**
 * Main execution
 */
function main() {
  // Validate environment
  validateEnvironment();

  logInfo(`=== Updating agent context files for feature ${paths.CURRENT_BRANCH} ===`);

  // Parse the plan file
  if (!parsePlanData(paths.IMPL_PLAN)) {
    logError('Failed to parse plan data');
    process.exit(1);
  }

  // Process based on agent type argument
  if (!agentType) {
    // No specific agent provided
    logInfo('No agent specified, updating all existing agent files...');
    updateAllExistingAgents();
  } else {
    // Specific agent provided
    logInfo(`Updating specific agent: ${agentType}`);
    updateSpecificAgent(agentType);
  }

  // Print summary
  printSummary();

  logSuccess('Agent context update completed successfully');
}

main();
