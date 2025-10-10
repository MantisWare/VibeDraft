import inquirer from 'inquirer';
import boxen from 'boxen';
import chalk from 'chalk';

export const AI_CHOICES = {
  claude: 'Claude Code',
  cursor: 'Cursor',
  copilot: 'GitHub Copilot',
  gemini: 'Gemini CLI',
  windsurf: 'Windsurf',
  qwen: 'Qwen Code',
  opencode: 'opencode',
  q: 'Amazon Q Developer CLI',
  codex: 'Codex CLI',
  kilocode: 'Kilo Code',
  auggie: 'Auggie CLI',
  roo: 'Roo Code'
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
