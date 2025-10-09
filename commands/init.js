import path from 'path';
import fs from 'fs-extra';
import chalk from 'chalk';
import { selectWithArrows, AI_CHOICES, createPanel, confirm } from '../lib/ui.js';
import { checkTool, ensureExecutableScripts } from '../lib/utils.js';
import { isGitRepo, initGitRepo } from '../lib/git.js';
import { downloadAndExtractTemplate } from '../lib/download.js';
import { StepTracker } from '../lib/tracker.js';

export async function initCommand(projectName, options) {
  // Handle '.' as shorthand for current directory
  if (projectName === '.') {
    options.here = true;
    projectName = null;
  }

  if (options.here && projectName) {
    console.error(chalk.red('Whoa there! 🛑'), 'Pick one: project name OR the --here flag, not both!');
    process.exit(1);
  }

  if (!options.here && !projectName) {
    console.error(chalk.red('Hold up! 🤔'), "Need a project name, a '.', or the --here flag to get this party started!");
    process.exit(1);
  }

  let projectPath;
  if (options.here) {
    projectName = path.basename(process.cwd());
    projectPath = process.cwd();

    const existingItems = await fs.readdir(projectPath);
    if (existingItems.length > 0) {
      console.log(chalk.yellow(`🎨 Heads up! Found ${existingItems.length} items chillin' here already`));
      console.log(chalk.yellow('We\'ll merge the vibes, but some files might get a fresh coat of paint 🖌️'));

      if (options.force) {
        console.log(chalk.cyan('💪 --force engaged! Full steam ahead, no questions asked!'));
      } else {
        const shouldContinue = await confirm('Do you want to continue?');
        if (!shouldContinue) {
          console.log(chalk.yellow('✌️ Cool, maybe next time!'));
          process.exit(0);
        }
      }
    }
  } else {
    projectPath = path.resolve(projectName);
    if (await fs.pathExists(projectPath)) {
      console.log(
        createPanel(
          `Directory '${chalk.cyan(projectName)}' already exists\nPlease choose a different project name or remove the existing directory.`,
          chalk.red('Directory Conflict'),
          'red'
        )
      );
      process.exit(1);
    }
  }

  const currentDir = process.cwd();
  const setupLines = [
    chalk.cyan('VibeDraft Project Setup'),
    '',
    `${'Project'.padEnd(15)} ${chalk.green(path.basename(projectPath))}`,
    `${'Working Path'.padEnd(15)} ${chalk.dim(currentDir)}`
  ];

  if (!options.here) {
    setupLines.push(`${'Target Path'.padEnd(15)} ${chalk.dim(projectPath)}`);
  }

  console.log(createPanel(setupLines.join('\n'), '', 'cyan'));

  // Check git only if we might need it
  let shouldInitGit = false;
  if (options.git !== false) {
    shouldInitGit = await checkTool('git');
    if (!shouldInitGit) {
      console.log(chalk.yellow('🤷 No git, no problem! We\'ll skip the repo stuff'));
    }
  }

  // Select AI assistant
  let selectedAi = options.ai;
  if (selectedAi) {
    if (!AI_CHOICES[selectedAi]) {
      console.error(
        chalk.red('Error:'),
        `Invalid AI assistant '${selectedAi}'. Choose from: ${Object.keys(AI_CHOICES).join(', ')}`
      );
      process.exit(1);
    }
  } else {
    selectedAi = await selectWithArrows(AI_CHOICES, 'Choose your AI assistant:', 'copilot');
  }

  // Check agent tools unless ignored
  if (!options.ignoreAgentTools) {
    let agentToolMissing = false;
    let installUrl = '';

    const agentChecks = {
      claude: 'https://docs.anthropic.com/en/docs/claude-code/setup',
      gemini: 'https://github.com/google-gemini/gemini-cli',
      qwen: 'https://github.com/QwenLM/qwen-code',
      opencode: 'https://opencode.ai',
      codex: 'https://github.com/openai/codex',
      auggie: 'https://docs.augmentcode.com/cli/setup-auggie/install-auggie-cli',
      q: 'https://aws.amazon.com/developer/learning/q-developer-cli/'
    };

    if (agentChecks[selectedAi]) {
      if (!(await checkTool(selectedAi))) {
        installUrl = agentChecks[selectedAi];
        agentToolMissing = true;
      }
    }

    if (agentToolMissing) {
      console.log(
        createPanel(
          `${chalk.cyan(selectedAi)} not found\nInstall with: ${chalk.cyan(installUrl)}\n${AI_CHOICES[selectedAi]} is required to continue with this project type.\n\nTip: Use ${chalk.cyan('--ignore-agent-tools')} to skip this check`,
          chalk.red('Agent Detection Error'),
          'red'
        )
      );
      process.exit(1);
    }
  }

  // Use Bash scripts (cross-platform compatible)
  const selectedScript = 'sh';

  console.log(chalk.cyan('🤖 AI Buddy:'), chalk.bold(selectedAi));

  // Download and set up project with tracker
  const tracker = new StepTracker('Initialize VibeDraft Project');

  tracker.add('precheck', 'Check required tools');
  tracker.complete('precheck', 'ok');
  tracker.add('ai-select', 'Select AI assistant');
  tracker.complete('ai-select', selectedAi);
  tracker.add('script-select', 'Select script type');
  tracker.complete('script-select', selectedScript);

  const steps = [
    ['fetch', 'Fetch latest release'],
    ['download', 'Download template'],
    ['extract', 'Extract template'],
    ['zip-list', 'Archive contents'],
    ['extracted-summary', 'Extraction summary'],
    ['chmod', 'Ensure scripts executable'],
    ['cleanup', 'Cleanup'],
    ['git', 'Initialize git repository'],
    ['final', 'Finalize']
  ];

  for (const [key, label] of steps) {
    tracker.add(key, label);
  }

  // Live update simulation (simplified for Node.js)
  const updateInterval = setInterval(() => {
    // Clear previous lines
    if (process.stdout.isTTY) {
      process.stdout.write('\x1b[2J\x1b[0f');
      console.log(tracker.render());
    }
  }, 125);

  try {
    await downloadAndExtractTemplate(projectPath, selectedAi, selectedScript, options.here, {
      verbose: false,
      tracker,
      debug: options.debug,
      githubToken: options.githubToken,
      skipTls: options.skipTls
    });

    // Ensure scripts are executable
    await ensureExecutableScripts(projectPath, tracker);

    // Git step
    if (options.git !== false) {
      tracker.start('git');
      if (await isGitRepo(projectPath)) {
        tracker.complete('git', 'existing repo detected');
      } else if (shouldInitGit) {
        if (await initGitRepo(projectPath, true)) {
          tracker.complete('git', 'initialized');
        } else {
          tracker.error('git', 'init failed');
        }
      } else {
        tracker.skip('git', 'git not available');
      }
    } else {
      tracker.skip('git', '--no-git flag');
    }

    tracker.complete('final', 'project ready');
  } catch (e) {
    tracker.error('final', e.message);
    clearInterval(updateInterval);

    if (process.stdout.isTTY) {
      process.stdout.write('\x1b[2J\x1b[0f');
    }
    console.log(tracker.render());
    console.log(createPanel(`Initialization failed: ${e.message}`, 'Failure', 'red'));

    if (options.debug) {
      console.log(
        createPanel(
          `Node: ${process.version}\nPlatform: ${process.platform}\nCWD: ${process.cwd()}`,
          'Debug Environment',
          'cyan'
        )
      );
    }

    if (!options.here && (await fs.pathExists(projectPath))) {
      await fs.remove(projectPath);
    }

    process.exit(1);
  } finally {
    clearInterval(updateInterval);
  }

  // Final static tree
  if (process.stdout.isTTY) {
    process.stdout.write('\x1b[2J\x1b[0f');
  }
  console.log(tracker.render());
  console.log(chalk.bold.green('\n🎊 Boom! Your project is ready to rock! 🎸'));

  // Agent folder security notice
  const agentFolderMap = {
    claude: '.claude/',
    gemini: '.gemini/',
    cursor: '.cursor/',
    qwen: '.qwen/',
    opencode: '.opencode/',
    codex: '.codex/',
    windsurf: '.windsurf/',
    kilocode: '.kilocode/',
    auggie: '.augment/',
    copilot: '.github/',
    roo: '.roo/',
    q: '.amazonq/'
  };

  if (agentFolderMap[selectedAi]) {
    const agentFolder = agentFolderMap[selectedAi];
    console.log(
      createPanel(
        `Some agents may store credentials, auth tokens, or other identifying and private artifacts in the agent folder within your project.\nConsider adding ${chalk.cyan(agentFolder)} (or parts of it) to ${chalk.cyan('.gitignore')} to prevent accidental credential leakage.`,
        chalk.yellow('Agent Folder Security'),
        'yellow'
      )
    );
  }

  // Next steps
  const stepsLines = [];
  let stepNum;
  if (!options.here) {
    const cdCommand = chalk.cyan(`cd ${projectName}`);
    stepsLines.push(`1. Go to the project folder: ${cdCommand}`);
    stepNum = 2;
  } else {
    stepsLines.push("1. You're already in the project directory!");
    stepNum = 2;
  }

  // Add Codex-specific setup step
  if (selectedAi === 'codex') {
    const codexPath = path.join(projectPath, '.codex');
    const cmd = process.platform === 'win32' ? `setx CODEX_HOME "${codexPath}"` : `export CODEX_HOME="${codexPath}"`;
    const codexHomeLabel = chalk.cyan('CODEX_HOME');
    const codexCmd = chalk.cyan(cmd);
    stepsLines.push(
      `${stepNum}. Set ${codexHomeLabel} environment variable before running Codex: ${codexCmd}`
    );
    stepNum++;
  }

  stepsLines.push(`${stepNum}. Start using slash commands with your AI agent:`);
  stepsLines.push(`   2.1 ${chalk.cyan('/vibedraft.constitution')} - Establish project principles`);
  stepsLines.push(`   2.2 ${chalk.cyan('/vibedraft.draft')} - Create baseline specification`);
  stepsLines.push(`   2.3 ${chalk.cyan('/vibedraft.plan')} - Create implementation plan`);
  stepsLines.push(`   2.4 ${chalk.cyan('/vibedraft.tasks')} - Generate actionable tasks`);
  stepsLines.push(`   2.5 ${chalk.cyan('/vibedraft.implement')} - Execute implementation`);

  console.log(createPanel(stepsLines.join('\n'), 'Next Steps', 'cyan'));

  // Enhancement commands
  const enhancementLines = [
    `Optional commands that you can use for your specs ${chalk.gray('(improve quality & confidence)')}`,
    '',
    `○ ${
      chalk.cyan('/vibedraft.clarify')
    } ${
      chalk.gray('(optional)')
    } - Ask structured questions to de-risk ambiguous areas before planning (run before ${
      chalk.cyan('/vibedraft.plan')
    } if used)`,
    `○ ${
      chalk.cyan('/vibedraft.analyze')
    } ${
      chalk.gray('(optional)')
    } - Cross-artifact consistency & alignment report (after ${
      chalk.cyan('/vibedraft.tasks')
    }, before ${
      chalk.cyan('/vibedraft.implement')
    })`,
    `○ ${
      chalk.cyan('/vibedraft.checklist')
    } ${
      chalk.gray('(optional)')
    } - Generate quality checklists to validate requirements completeness, clarity, and consistency (after ${
      chalk.cyan('/vibedraft.plan')
    })`
  ];

  console.log(createPanel(enhancementLines.join('\n'), 'Enhancement Commands', 'cyan'));
}
