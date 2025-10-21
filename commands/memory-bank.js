import { Command } from 'commander';
import chalk from 'chalk';
import inquirer from 'inquirer';
import path from 'path';
import fs from 'fs-extra';
import ora from 'ora';
import { generateMemoryBank, updateMemoryBank, AGENT_MEMORY_BANK_CONFIG } from '../lib/memory-bank-builder.js';
import { detectTechnologyStack } from '../lib/tech-detector.js';
import { displayTechStackSummary } from '../lib/constitution-builder.js';

/**
 * Memory Bank management command
 */
export const memoryBankCommand = new Command('memory-bank')
  .description('Create or manage Memory Bank for AI agents')
  .option('--agent <type>', 'AI agent type (cursor, claude, copilot, etc.)')
  .option('--all', 'Create Memory Banks for all detected agents')
  .option('--minimal', 'Create minimal Memory Bank (for smaller projects)')
  .option('--update', 'Update existing Memory Bank')
  .option('--no-populate', 'Skip auto-population of templates')
  .option('--here', 'Create in current directory')
  .option('--verbose', 'Show detailed output', true)
  .action(async (options) => {
    try {
      const projectPath = options.here ? process.cwd() : process.cwd();

      // Verify we're in a VibeDraft project
      const vibedraftDir = path.join(projectPath, '.vibedraft');
      if (!(await fs.pathExists(vibedraftDir))) {
        console.log(chalk.red('✗ Not a VibeDraft project'));
        console.log(chalk.yellow('  Run "vibedraft init" first'));
        process.exit(1);
      }

      console.log(chalk.cyan('📚 Memory Bank Setup'));
      console.log('');

      // Detect tech stack if populating
      let techStack = null;
      if (options.populate !== false) {
        const spinner = ora('Analyzing project...').start();
        try {
          techStack = await detectTechnologyStack(projectPath);
          if (techStack.hasExistingApp) {
            spinner.succeed('Project analyzed');
            if (options.verbose) {
              displayTechStackSummary(techStack);
              console.log('');
            }
          } else {
            spinner.info('No existing application detected');
          }
        } catch (error) {
          spinner.fail('Could not analyze project');
          console.log(chalk.yellow(`  ${error.message}`));
        }
      }

      // Determine which agents to process
      let agentsToProcess = [];

      if (options.all) {
        // Detect all agent directories
        agentsToProcess = await detectAgentDirectories(projectPath);
        if (agentsToProcess.length === 0) {
          console.log(chalk.yellow('⚠ No AI agent directories detected'));
          console.log(chalk.cyan('  Available agents: cursor, claude, copilot, gemini, windsurf, qwen, opencode, q'));
          console.log('');
          
          const { agent } = await inquirer.prompt([
            {
              type: 'list',
              name: 'agent',
              message: 'Select an AI agent to create Memory Bank:',
              choices: Object.keys(AGENT_MEMORY_BANK_CONFIG)
            }
          ]);
          agentsToProcess = [agent];
        } else {
          console.log(chalk.green(`✓ Detected ${agentsToProcess.length} AI agent(s): ${agentsToProcess.join(', ')}`));
          console.log('');
        }
      } else if (options.agent) {
        agentsToProcess = [options.agent];
      } else {
        // Interactive selection
        const detectedAgents = await detectAgentDirectories(projectPath);
        const allAgents = Object.keys(AGENT_MEMORY_BANK_CONFIG);
        
        const { agent } = await inquirer.prompt([
          {
            type: 'list',
            name: 'agent',
            message: 'Select an AI agent:',
            choices: allAgents,
            default: detectedAgents.length > 0 ? detectedAgents[0] : 'cursor'
          }
        ]);
        agentsToProcess = [agent];
      }

      // Confirm minimal mode if not specified
      let useMinimal = options.minimal;
      if (useMinimal === undefined) {
        const { minimal } = await inquirer.prompt([
          {
            type: 'confirm',
            name: 'minimal',
            message: 'Create minimal Memory Bank? (Recommended for small/focused projects)',
            default: false
          }
        ]);
        useMinimal = minimal;
      }

      console.log('');
      console.log(chalk.cyan('Creating Memory Bank...'));
      console.log('');

      // Process each agent
      const results = [];
      for (const agentType of agentsToProcess) {
        try {
          if (options.update) {
            // Update existing Memory Bank
            const result = await updateMemoryBank(projectPath, agentType);
            results.push({ agent: agentType, success: true, action: 'updated', result });
          } else {
            // Create new Memory Bank
            const result = await generateMemoryBank(projectPath, agentType, {
              minimal: useMinimal,
              populate: options.populate !== false,
              techStack: techStack,
              verbose: options.verbose
            });
            results.push({ agent: agentType, success: true, action: 'created', result });
          }
        } catch (error) {
          results.push({ agent: agentType, success: false, error: error.message });
          console.log(chalk.red(`✗ Failed to process ${agentType}: ${error.message}`));
        }
      }

      // Summary
      console.log('');
      console.log(chalk.green.bold('✓ Memory Bank Setup Complete'));
      console.log('');

      const successful = results.filter(r => r.success);
      if (successful.length > 0) {
        console.log(chalk.cyan('Created Memory Banks:'));
        for (const { agent, action, result } of successful) {
          const config = AGENT_MEMORY_BANK_CONFIG[agent];
          console.log(chalk.green(`  ✓ ${agent}: ${config.memoryBankDir}/`));
          if (result.files && result.files.length > 0) {
            console.log(chalk.gray(`    Files: ${result.files.join(', ')}`));
          }
        }
        console.log('');
      }

      const failed = results.filter(r => !r.success);
      if (failed.length > 0) {
        console.log(chalk.red('Failed:'));
        for (const { agent, error } of failed) {
          console.log(chalk.red(`  ✗ ${agent}: ${error}`));
        }
        console.log('');
      }

      // Next steps
      console.log(chalk.cyan('📖 Next Steps:'));
      console.log('');
      console.log('1. Review and fill in Memory Bank files:');
      for (const { agent } of successful) {
        const config = AGENT_MEMORY_BANK_CONFIG[agent];
        console.log(chalk.gray(`   ${config.memoryBankDir}/`));
      }
      console.log('');
      console.log('2. Use in your AI assistant:');
      console.log(chalk.gray('   The Memory Bank will be automatically available'));
      console.log('');
      console.log('3. Update Memory Bank as project evolves:');
      console.log(chalk.gray('   vibedraft memory-bank --update --agent <agent>'));
      console.log('');

      if (useMinimal) {
        console.log(chalk.yellow('💡 Tip: Running with --minimal created a focused Memory Bank.'));
        console.log(chalk.yellow('   For larger projects, run without --minimal for full structure.'));
        console.log('');
      }

      if (options.populate !== false && techStack?.hasExistingApp) {
        console.log(chalk.green('✨ Auto-populated with detected project information'));
        console.log('');
      }

    } catch (error) {
      console.error(chalk.red('Error:'), error.message);
      if (options.verbose) {
        console.error(error.stack);
      }
      process.exit(1);
    }
  });

/**
 * Detect which AI agent directories exist in the project
 * @param {string} projectPath - Path to project
 * @returns {Promise<string[]>} List of detected agent types
 */
async function detectAgentDirectories(projectPath) {
  const detected = [];

  for (const [agentType, config] of Object.entries(AGENT_MEMORY_BANK_CONFIG)) {
    const agentDir = path.join(projectPath, config.rulesDir);
    if (await fs.pathExists(agentDir)) {
      detected.push(agentType);
    }
  }

  return detected;
}

