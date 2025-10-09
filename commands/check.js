import chalk from 'chalk';
import { checkTool } from '../lib/utils.js';
import { StepTracker } from '../lib/tracker.js';

export async function checkCommand() {
  console.log(chalk.bold('🔍 Vibing out your toolkit...\n'));

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

  console.log(chalk.bold.green('\n🎉 Your VibeDraft is locked and loaded! Let\'s goooo! 🚀'));

  if (!results.git) {
    console.log(chalk.dim('💡 Psst... git makes the vibe even better!'));
  }

  const aiTools = ['claude', 'gemini', 'cursor-agent', 'qwen', 'windsurf', 'kilocode', 'opencode', 'codex', 'auggie', 'q'];
  if (!aiTools.some((tool) => results[tool])) {
    console.log(chalk.dim('✨ Pro tip: An AI assistant will supercharge your flow!'));
  }
}
