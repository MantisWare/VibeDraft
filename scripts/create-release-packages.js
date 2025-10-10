#!/usr/bin/env node

/**
 * Create release packages for all AI agents and script types
 * This script generates ZIP files ready for GitHub releases
 */

import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import AdmZip from 'adm-zip';
import chalk from 'chalk';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const REPO_ROOT = path.resolve(__dirname, '..');
const RELEASE_DIR = path.join(REPO_ROOT, '.genreleases');

// All supported agents (ordered by priority)
const ALL_AGENTS = ['claude', 'cursor', 'copilot', 'gemini', 'windsurf', 'qwen', 'opencode', 'q', 'codex', 'kilocode', 'auggie', 'roo'];

// Script types
const SCRIPT_TYPES = ['sh'];

// Agent configurations (ordered by priority)
const AGENT_CONFIG = {
  claude: { dir: '.claude/commands', format: 'md', argPlaceholder: '$ARGUMENTS' },
  cursor: { dir: '.cursor/commands', format: 'md', argPlaceholder: '$ARGUMENTS' },
  copilot: { dir: '.github/prompts', format: 'md', argPlaceholder: '$ARGUMENTS' },
  gemini: { dir: '.gemini/commands', format: 'toml', argPlaceholder: '{{args}}' },
  windsurf: { dir: '.windsurf/workflows', format: 'md', argPlaceholder: '$ARGUMENTS' },
  qwen: { dir: '.qwen/commands', format: 'toml', argPlaceholder: '{{args}}' },
  opencode: { dir: '.opencode/command', format: 'md', argPlaceholder: '$ARGUMENTS' },
  q: { dir: '.amazonq/prompts', format: 'md', argPlaceholder: '$ARGUMENTS' },
  codex: { dir: '.codex/commands', format: 'md', argPlaceholder: '$ARGUMENTS' },
  kilocode: { dir: '.kilocode/commands', format: 'md', argPlaceholder: '$ARGUMENTS' },
  auggie: { dir: '.augment/commands', format: 'md', argPlaceholder: '$ARGUMENTS' },
  roo: { dir: '.roo/commands', format: 'md', argPlaceholder: '$ARGUMENTS' }
};

/**
 * Convert Markdown command to TOML format
 */
function convertMarkdownToToml(mdContent, scriptPath, argPlaceholder) {
  // Extract description from frontmatter
  const descMatch = mdContent.match(/^---\s*\ndescription:\s*(.+?)\n---/s);
  const description = descMatch ? descMatch[1].trim().replace(/^["']/g, '').replace(/["']$/g, '') : 'VibeDraft command';

  // Remove frontmatter and extract main content
  let content = mdContent.replace(/^---\s*\n[\s\S]*?\n---\s*\n/, '');

  // Replace script placeholder
  content = content.replace(/\{SCRIPT\}/g, scriptPath);

  // Replace argument placeholder
  content = content.replace(/\$ARGUMENTS/g, argPlaceholder);

  // Escape quotes in content for TOML
  content = content.replace(/"/g, '\\"');

  // Build TOML structure
  const toml = `description = "${description}"

prompt = """
${content}
"""
`;

  return toml;
}

/**
 * Generate agent-specific command files
 */
async function generateAgentCommands(targetDir, agent, scriptType) {
  const templatesDir = path.join(REPO_ROOT, 'templates', 'commands');
  const config = AGENT_CONFIG[agent];

  if (!config) {
    throw new Error(`Unknown agent: ${agent}`);
  }

  const agentCommandsDir = path.join(targetDir, config.dir);
  await fs.ensureDir(agentCommandsDir);

  const scriptBasePath = `.vibedraft/scripts/${scriptType}`;

  // Script mapping
  const scriptMap = {
    'vibedraft.constitution.md': 'constitution',
    'vibedraft.draft.md': 'create-new-feature',
    'vibedraft.clarify.md': 'clarify',
    'vibedraft.plan.md': 'setup-plan',
    'vibedraft.analyze.md': 'analyze',
    'vibedraft.tasks.md': 'tasks',
    'vibedraft.checklist.md': 'checklist',
    'vibedraft.implement.md': 'implement'
  };

  const templateFiles = await fs.readdir(templatesDir);
  const commandFiles = templateFiles.filter(f => f.endsWith('.md'));

  for (const templateFile of commandFiles) {
    const templatePath = path.join(templatesDir, templateFile);
    let content = await fs.readFile(templatePath, 'utf-8');

    const scriptName = scriptMap[templateFile];
    const scriptExt = '.sh';
    const scriptPath = scriptName ? `${scriptBasePath}/${scriptName}${scriptExt}` : '';

    if (config.format === 'md') {
      // Markdown format - replace {SCRIPT} placeholder
      content = content.replace(/\{SCRIPT\}/g, scriptPath);
      const outputFile = path.join(agentCommandsDir, templateFile);
      await fs.writeFile(outputFile, content, 'utf-8');
    } else if (config.format === 'toml') {
      // Convert Markdown to TOML format
      const tomlContent = convertMarkdownToToml(content, scriptPath, config.argPlaceholder);
      const outputFile = path.join(agentCommandsDir, templateFile.replace('.md', '.toml'));
      await fs.writeFile(outputFile, tomlContent, 'utf-8');
    }
  }

  return commandFiles.length;
}

/**
 * Create a release package for a specific agent and script type
 */
async function createReleasePackage(agent, scriptType, version) {
  console.log(chalk.cyan(`Creating package for ${agent} (${scriptType})...`));

  const tempDir = await fs.mkdtemp(path.join(RELEASE_DIR, `temp-${agent}-${scriptType}-`));

  try {
    // Create .vibedraft directory structure
    const vibedraftDir = path.join(tempDir, '.vibedraft');
    await fs.ensureDir(vibedraftDir);

    // Copy scripts
    const scriptsSource = path.join(REPO_ROOT, 'scripts');
    const scriptsDest = path.join(vibedraftDir, 'scripts');
    await fs.copy(scriptsSource, scriptsDest, {
      overwrite: true,
      filter: (src) => {
        // Exclude node-specific scripts from packages
        const basename = path.basename(src);
        return !basename.endsWith('.js') || src.includes('/bash/');
      }
    });

    // Make bash scripts executable
    const bashScriptsDir = path.join(scriptsDest, 'bash');
    if (await fs.pathExists(bashScriptsDir)) {
      const scripts = await fs.readdir(bashScriptsDir);
      for (const script of scripts) {
        if (script.endsWith('.sh')) {
          const scriptPath = path.join(bashScriptsDir, script);
          await fs.chmod(scriptPath, 0o755);
        }
      }
    }

    // Copy templates
    const templatesSource = path.join(REPO_ROOT, 'templates');
    const templatesDest = path.join(vibedraftDir, 'templates');
    await fs.copy(templatesSource, templatesDest, { overwrite: true });

    // Copy memory
    const memorySource = path.join(REPO_ROOT, 'memory');
    const memoryDest = path.join(vibedraftDir, 'memory');
    await fs.copy(memorySource, memoryDest, { overwrite: true });

    // Copy root files
    // README.md -> VIBEDRAFT_README.md (preserve user's existing README)
    const readmeSource = path.join(REPO_ROOT, 'README.md');
    if (await fs.pathExists(readmeSource)) {
      await fs.copy(readmeSource, path.join(tempDir, 'VIBEDRAFT_README.md'), { overwrite: true });
    }

    // .gitignore - include as template
    const gitignoreSource = path.join(REPO_ROOT, '.gitignore');
    if (await fs.pathExists(gitignoreSource)) {
      await fs.copy(gitignoreSource, path.join(tempDir, '.gitignore'), { overwrite: true });
    }

    // spec-driven.md - include as documentation
    const specDrivenSource = path.join(REPO_ROOT, 'spec-driven.md');
    if (await fs.pathExists(specDrivenSource)) {
      await fs.copy(specDrivenSource, path.join(tempDir, 'spec-driven.md'), { overwrite: true });
    }

    // Create specs directory
    await fs.ensureDir(path.join(tempDir, 'specs'));

    // Generate agent-specific commands
    const commandCount = await generateAgentCommands(tempDir, agent, scriptType);
    console.log(chalk.green(`  ✓ Generated ${commandCount} command files`));

    // Copy agent-specific settings files
    const agentSettingsMap = {
      cursor: { source: 'cursor-settings.json', dest: '.cursor/settings.json' },
      copilot: { source: 'vscode-settings.json', dest: '.vscode/settings.json' }
    };

    if (agentSettingsMap[agent]) {
      const { source, dest } = agentSettingsMap[agent];
      const sourceFile = path.join(REPO_ROOT, 'templates', source);
      const destFile = path.join(tempDir, dest);

      if (await fs.pathExists(sourceFile)) {
        await fs.ensureDir(path.dirname(destFile));
        await fs.copy(sourceFile, destFile);
        console.log(chalk.green(`  ✓ Added ${source} → ${dest}`));
      }
    }

    // Create ZIP archive
    const zipFilename = `vibedraft-template-${agent}-${scriptType}-${version}.zip`;
    const zipPath = path.join(RELEASE_DIR, zipFilename);

    const zip = new AdmZip();

    // Add all files from temp directory using addLocalFolder
    // This properly handles the directory structure
    zip.addLocalFolder(tempDir);

    // Write the ZIP file
    zip.writeZip(zipPath);

    const stats = await fs.stat(zipPath);
    console.log(chalk.green(`  ✓ Created ${zipFilename} (${(stats.size / 1024).toFixed(2)} KB)`));

    return zipPath;
  } finally {
    // Cleanup temp directory
    await fs.remove(tempDir);
  }
}

/**
 * Main execution
 */
async function main() {
  console.log(chalk.bold.cyan('\n🎁 VibeDraft Release Package Generator\n'));

  // Get version from package.json
  const packageJson = await fs.readJson(path.join(REPO_ROOT, 'package.json'));
  const version = packageJson.version;

  console.log(chalk.cyan(`Version: ${version}\n`));

  // Clean and create release directory
  await fs.remove(RELEASE_DIR);
  await fs.ensureDir(RELEASE_DIR);

  let successCount = 0;
  let errorCount = 0;

  // Generate packages for all combinations
  for (const agent of ALL_AGENTS) {
    for (const scriptType of SCRIPT_TYPES) {
      try {
        await createReleasePackage(agent, scriptType, version);
        successCount++;
      } catch (error) {
        console.error(chalk.red(`  ✗ Error: ${error.message}`));
        errorCount++;
      }
    }
  }

  // Summary
  console.log(chalk.bold.green('\n✅ Package generation complete!\n'));
  console.log(chalk.cyan(`Success: ${successCount} packages`));
  if (errorCount > 0) {
    console.log(chalk.red(`Errors: ${errorCount} packages`));
  }
  console.log(chalk.cyan(`Location: ${RELEASE_DIR}\n`));

  // List all created packages
  console.log(chalk.bold('Created packages:'));
  const files = await fs.readdir(RELEASE_DIR);
  const zipFiles = files.filter(f => f.endsWith('.zip'));
  for (const file of zipFiles) {
    const stats = await fs.stat(path.join(RELEASE_DIR, file));
    console.log(chalk.dim(`  • ${file} (${(stats.size / 1024).toFixed(2)} KB)`));
  }

  console.log(chalk.bold.cyan('\n📦 Next steps:\n'));
  console.log(chalk.white('1. Test a package locally:'));
  console.log(chalk.dim('   vibedraft init TestProject --local\n'));
  console.log(chalk.white('2. Create GitHub release:'));
  console.log(chalk.dim('   npm run release:github\n'));
  console.log(chalk.white('3. Or manually upload packages to:'));
  console.log(chalk.dim(`   https://github.com/MantisWare/VibeDraft/releases/new?tag=v${version}\n`));
}

// Run
main().catch((error) => {
  console.error(chalk.red('\n❌ Fatal error:'), error.message);
  if (error.stack) {
    console.error(chalk.dim(error.stack));
  }
  process.exit(1);
});
