import chalk from 'chalk';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { checkTool } from '../lib/utils.js';
import { StepTracker } from '../lib/tracker.js';
import { createPanel } from '../lib/ui.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const packageJson = JSON.parse(readFileSync(join(__dirname, '..', 'package.json'), 'utf-8'));

export async function checkCommand() {
  // Display header with version and attribution
  const headerLines = [
    chalk.bold.cyan('VibeDraft Environment Check'),
    '',
    `${chalk.dim('Version:')} ${chalk.green(packageJson.version)}`,
    `${chalk.dim('Author:')} ${chalk.cyan('MantisWare')} ${chalk.dim('(Waldo Marais)')}`,
    '',
    chalk.dim('Checking your development environment...')
  ];

  console.log(createPanel(headerLines.join('\n'), '', 'cyan'));
  console.log('');

  const tracker = new StepTracker('Check Available Tools');

  const tools = [
    ['git', 'Git version control'],
    ['claude', 'Claude Code CLI'],
    ['gemini', 'Gemini CLI'],
    ['qwen', 'Qwen Code CLI'],
    ['code', 'Visual Studio Code'],
    ['code-insiders', 'Visual Studio Code Insiders'],
    ['cursor-agent', 'Cursor IDE agent'],
    ['windsurf', 'Windsurf IDE'],
    ['kilocode', 'Kilo Code IDE'],
    ['opencode', 'opencode'],
    ['codex', 'Codex CLI'],
    ['auggie', 'Auggie CLI'],
    ['q', 'Amazon Q Developer CLI']
  ];

  const results = {};

  for (const [tool, label] of tools) {
    tracker.add(tool, label);
    const available = await checkTool(tool);
    results[tool] = available;
    if (available) {
      tracker.complete(tool, 'available');
    } else {
      tracker.error(tool, 'not found');
    }
  }

  console.log(tracker.render());

  // Summary
  const availableCount = Object.values(results).filter(Boolean).length;
  const totalCount = tools.length;

  console.log('');
  console.log(chalk.bold.green('✓ Environment Check Complete'));
  console.log(chalk.cyan(`  ${availableCount}/${totalCount} tools available`));
  console.log('');

  if (!results.git) {
    console.log(chalk.yellow('💡 Tip: Git is recommended for version control'));
  }

  const aiTools = ['claude', 'gemini', 'cursor-agent', 'qwen', 'windsurf', 'kilocode', 'opencode', 'codex', 'auggie', 'q'];
  if (!aiTools.some((tool) => results[tool])) {
    console.log(chalk.yellow('✨ Tip: Install an AI coding assistant for the best experience'));
  }

  if (availableCount === totalCount) {
    console.log('');
    console.log(chalk.bold.green('🎉 Perfect setup! You\'re ready to rock! 🚀\n\n'));
  }
}
