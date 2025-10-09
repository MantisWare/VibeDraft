import inquirer from 'inquirer';
import boxen from 'boxen';
import chalk from 'chalk';

export const AI_CHOICES = {
  copilot: 'GitHub Copilot',
  claude: 'Claude Code',
  gemini: 'Gemini CLI',
  cursor: 'Cursor',
  qwen: 'Qwen Code',
  opencode: 'opencode',
  codex: 'Codex CLI',
  windsurf: 'Windsurf',
  kilocode: 'Kilo Code',
  auggie: 'Auggie CLI',
  roo: 'Roo Code',
  q: 'Amazon Q Developer CLI'
};

/**
 * Interactive selection using arrow keys
 */
export async function selectWithArrows(options, promptText = 'Select an option', defaultKey = null) {
  const choices = Object.entries(options).map(([key, description]) => ({
    name: `${chalk.cyan(key)} ${chalk.dim(`(${description})`)}`,
    value: key,
    short: key
  }));

  const answer = await inquirer.prompt([
    {
      type: 'list',
      name: 'selection',
      message: promptText,
      choices,
      default: defaultKey ?? Object.keys(options)[0],
      pageSize: 15
    }
  ]);

  return answer.selection;
}

/**
 * Create a panel/box around content
 */
export function createPanel(content, title = '', borderColor = 'cyan') {
  const colors = {
    cyan: 'cyan',
    red: 'red',
    yellow: 'yellow',
    green: 'green'
  };

  return boxen(content, {
    padding: 1,
    margin: { top: 1, bottom: 0 },
    borderStyle: 'round',
    borderColor: colors[borderColor] ?? 'cyan',
    title: title ? ` ${title} ` : undefined,
    titleAlignment: 'left'
  });
}

/**
 * Confirm action
 */
export async function confirm(message) {
  const answer = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'confirmed',
      message,
      default: false
    }
  ]);

  return answer.confirmed;
}
