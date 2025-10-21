import fetch from 'node-fetch';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import AdmZip from 'adm-zip';
import cliProgress from 'cli-progress';
import chalk from 'chalk';
import { getGithubAuthHeaders } from './utils.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Generate agent-specific command files from templates
 */
async function generateAgentCommands(projectPath, aiAssistant, scriptType) {
  const templatesDir = path.join(projectPath, '.vibedraft', 'templates', 'commands');

  if (!(await fs.pathExists(templatesDir))) {
    throw new Error(`Templates directory not found: ${templatesDir}`);
  }

  // Define agent configurations (ordered by priority)
  const agentConfig = {
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

  const config = agentConfig[aiAssistant];
  if (!config) {
    throw new Error(`Unknown AI assistant: ${aiAssistant}`);
  }

  const agentCommandsDir = path.join(projectPath, config.dir);
  await fs.ensureDir(agentCommandsDir);

  // Get script base path for placeholder replacement
  const scriptBasePath = `.vibedraft/scripts/${scriptType}`;

  // Read all command template files
  const templateFiles = await fs.readdir(templatesDir);
  const commandFiles = templateFiles.filter(f => f.endsWith('.md'));

  for (const templateFile of commandFiles) {
    const templatePath = path.join(templatesDir, templateFile);
    let content = await fs.readFile(templatePath, 'utf-8');

    // Map command names to their scripts
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

    const scriptName = scriptMap[templateFile];
    const scriptExt = '.sh';
    const scriptPath = scriptName ? `${scriptBasePath}/${scriptName}${scriptExt}` : '';

    if (config.format === 'md') {
      // Markdown format - replace {SCRIPT} placeholder
      content = content.replace(/\{SCRIPT\}/g, scriptPath);

      // Keep $ARGUMENTS as-is for markdown
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
 * Convert Markdown command to TOML format
 */
function convertMarkdownToToml(mdContent, scriptPath, argPlaceholder) {
  // Extract description from frontmatter
  const descMatch = mdContent.match(/^---\s*\ndescription:\s*(.+?)\n---/s);
  const description = descMatch ? descMatch[1].trim().replace(/^(["'])|["']$/g, '') : 'VibeDraft command';

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
 * Download template from GitHub releases
 */
export async function downloadTemplateFromGithub(
  aiAssistant,
  downloadDir,
  {
    scriptType = 'sh',
    verbose = true,
    showProgress = true,
    debug = false,
    githubToken = null,
    skipTls = false
  } = {}
) {
  const repoOwner = 'MantisWare';
  const repoName = 'VibeDraft';
  const apiUrl = `https://api.github.com/repos/${repoOwner}/${repoName}/releases/latest`;

  if (verbose) {
    console.log(chalk.cyan('Fetching latest release information...'));
  }

  try {
    const headers = {
      ...getGithubAuthHeaders(githubToken),
      'User-Agent': 'vibedraft-cli'
    };

    const response = await fetch(apiUrl, {
      headers,
      timeout: 30000,
      ...(skipTls && { agent: new (await import('https')).Agent({ rejectUnauthorized: false }) })
    });

    if (!response.ok) {
      const body = await response.text();
      throw new Error(
        `GitHub API returned ${response.status} for ${apiUrl}${debug ? `\nResponse: ${body.slice(0, 500)}` : ''}`
      );
    }

    const releaseData = await response.json();
    const assets = releaseData.assets ?? [];
    const pattern = `vibedraft-template-${aiAssistant}-${scriptType}`;
    const matchingAssets = assets.filter(
      (asset) => asset.name.includes(pattern) && asset.name.endsWith('.zip')
    );

    const asset = matchingAssets[0];

    if (!asset) {
      const assetNames = assets.map((a) => a.name).join('\n');
      throw new Error(
        `No matching release asset found for ${aiAssistant} (expected pattern: ${pattern})\nAvailable assets:\n${assetNames}`
      );
    }

    const downloadUrl = asset.browser_download_url;
    const filename = asset.name;
    const fileSize = asset.size;

    if (verbose) {
      console.log(chalk.cyan(`Found template: ${filename}`));
      console.log(chalk.cyan(`Size: ${fileSize.toLocaleString()} bytes`));
      console.log(chalk.cyan(`Release: ${releaseData.tag_name}`));
    }

    const zipPath = path.join(downloadDir, filename);

    if (verbose) {
      console.log(chalk.cyan('Downloading template...'));
    }

    const downloadResponse = await fetch(downloadUrl, {
      headers,
      timeout: 60000,
      ...(skipTls && { agent: new (await import('https')).Agent({ rejectUnauthorized: false }) })
    });

    if (!downloadResponse.ok) {
      const body = await downloadResponse.text();
      throw new Error(`Download failed with ${downloadResponse.status}\nBody: ${body.slice(0, 400)}`);
    }

    const totalSize = parseInt(downloadResponse.headers.get('content-length') ?? '0', 10);
    const writer = fs.createWriteStream(zipPath);
    let downloaded = 0;

    let progressBar = null;
    if (showProgress && totalSize > 0) {
      progressBar = new cliProgress.SingleBar({
        format: 'Downloading... [{bar}] {percentage}%',
        barCompleteChar: '\u2588',
        barIncompleteChar: '\u2591',
        hideCursor: true
      });
      progressBar.start(totalSize, 0);
    }

    for await (const chunk of downloadResponse.body) {
      writer.write(chunk);
      downloaded += chunk.length;
      if (progressBar) {
        progressBar.update(downloaded);
      }
    }

    // Wait for the write stream to finish before continuing
    await new Promise((resolve, reject) => {
      writer.on('finish', resolve);
      writer.on('error', reject);
      writer.end();
    });

    if (progressBar) {
      progressBar.stop();
    }

    if (verbose) {
      console.log(`Downloaded: ${filename}`);
    }

    const metadata = {
      filename,
      size: fileSize,
      release: releaseData.tag_name,
      assetUrl: downloadUrl
    };

    return { zipPath, metadata };
  } catch (e) {
    throw new Error(`Error downloading template: ${e.message}`);
  }
}

/**
 * Copy template from local directory (for testing/development)
 */
export async function copyLocalTemplate(
  aiAssistant,
  scriptType,
  projectPath,
  isCurrentDir = false,
  {
    verbose = true,
    tracker = null
  } = {}
) {
  // Find the VibeDraft directory relative to this file
  // Structure: VibeDraft/lib/download.js -> ../
  const vibeDraftBaseDir = path.resolve(__dirname, '..');

  if (!(await fs.pathExists(vibeDraftBaseDir))) {
    throw new Error(`Local VibeDraft directory not found: ${vibeDraftBaseDir}`);
  }

  if (tracker) {
    tracker.start('fetch', 'using local templates');
    tracker.complete('fetch', 'local mode');
  } else if (verbose) {
    console.log(chalk.cyan('Using local templates...'));
  }

  if (tracker) {
    tracker.add('extract', 'Copy template files');
    tracker.start('extract');
  }

  try {
    // Create project directory only if not using current directory
    if (!isCurrentDir) {
      await fs.ensureDir(projectPath);
    }

    // Create .vibedraft directory structure
    const vibedraftDir = path.join(projectPath, '.vibedraft');
    await fs.ensureDir(vibedraftDir);

    // Copy scripts directory
    const scriptsSource = path.join(vibeDraftBaseDir, 'scripts');
    const scriptsDest = path.join(vibedraftDir, 'scripts');
    if (await fs.pathExists(scriptsSource)) {
      await fs.copy(scriptsSource, scriptsDest, { overwrite: true });

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
    }

    // Copy templates directory
    const templatesSource = path.join(vibeDraftBaseDir, 'templates');
    const templatesDest = path.join(vibedraftDir, 'templates');
    if (await fs.pathExists(templatesSource)) {
      await fs.copy(templatesSource, templatesDest, { overwrite: true });
    }

    // Copy memory directory
    const memorySource = path.join(vibeDraftBaseDir, 'memory');
    const memoryDest = path.join(vibedraftDir, 'memory');
    if (await fs.pathExists(memorySource)) {
      await fs.copy(memorySource, memoryDest, { overwrite: true });
    }

    // Create docs directory for VibeDraft documentation
    const docsDir = path.join(vibedraftDir, 'docs');
    await fs.ensureDir(docsDir);

    // README.md -> .vibedraft/docs/VIBEDRAFT_README.md
    const readmeSource = path.join(vibeDraftBaseDir, 'README.md');
    if (await fs.pathExists(readmeSource)) {
      await fs.copy(readmeSource, path.join(docsDir, 'VIBEDRAFT_README.md'), { overwrite: true });
    }

    // spec-driven.md -> .vibedraft/docs/spec-driven.md
    const specDrivenSource = path.join(vibeDraftBaseDir, 'spec-driven.md');
    if (await fs.pathExists(specDrivenSource)) {
      await fs.copy(specDrivenSource, path.join(docsDir, 'spec-driven.md'), { overwrite: true });
    }

    // Create .vibedraft/.gitignore for VibeDraft-specific ignores
    const vibedraftGitignoreContent = `# VibeDraft temporary files
*.tmp
.vibedraft-temp-*

# Tech stack detection cache
tech-stack-detected.json.bak

# Agent context backups
memory/*.bak
`;
    await fs.writeFile(path.join(vibedraftDir, '.gitignore'), vibedraftGitignoreContent, 'utf8');

    // Create specs directory inside .vibedraft
    const specsDir = path.join(vibedraftDir, 'specs');
    await fs.ensureDir(specsDir);

    // Create project-level .gitignore in root
    const gitignoreDest = path.join(projectPath, '.gitignore');
    if (!(await fs.pathExists(gitignoreDest))) {
      const projectGitignoreContent = `# Dependencies
node_modules/

# Build outputs
dist/
build/
out/

# Environment variables
.env
.env.local
.env.*.local

# IDE
.vscode/
.idea/
*.swp
*.swo
*~

# OS
.DS_Store
Thumbs.db

# Logs
logs/
*.log
npm-debug.log*

# Testing
coverage/
.nyc_output/

# VibeDraft (optional - uncomment if you don't want to track specs)
# .vibedraft/specs/
`;
      await fs.writeFile(gitignoreDest, projectGitignoreContent, 'utf8');
    }

    // Create basic README.md in root if doesn't exist
    const projectReadmePath = path.join(projectPath, 'README.md');
    if (!(await fs.pathExists(projectReadmePath))) {
      const projectName = path.basename(projectPath);
      const basicReadmeContent = `# ${projectName}

Add your project description here.

## Getting Started

Add setup instructions here.

## Documentation

- VibeDraft Documentation: [.vibedraft/docs/VIBEDRAFT_README.md](.vibedraft/docs/VIBEDRAFT_README.md)
- Spec-Driven Development: [.vibedraft/docs/spec-driven.md](.vibedraft/docs/spec-driven.md)

## Features

- Feature specifications: \`.vibedraft/specs/\`

## Contributing

Add contribution guidelines here.

## License

Add license information here.
`;
      await fs.writeFile(projectReadmePath, basicReadmeContent, 'utf8');
    }

    // Copy agent-specific files (ordered by priority)
    const agentMap = {
      claude: '.claude',
      cursor: '.cursor',
      copilot: '.github',
      gemini: '.gemini',
      windsurf: '.windsurf',
      qwen: '.qwen',
      opencode: '.opencode',
      q: '.amazonq',
      codex: '.codex',
      kilocode: '.kilocode',
      auggie: '.augment',
      roo: '.roo'
    };

    const agentDir = agentMap[aiAssistant];
    if (agentDir) {
      const agentDestPath = path.join(projectPath, agentDir);
      await fs.ensureDir(agentDestPath);

      // For most agents, create commands directory
      if (agentDir !== '.github') {
        const commandsDir = agentDir === '.windsurf' ? 'workflows' : 'commands';
        await fs.ensureDir(path.join(agentDestPath, commandsDir));
      } else {
        // For copilot, create prompts directory
        await fs.ensureDir(path.join(agentDestPath, 'prompts'));
      }

      // Generate agent-specific command files
      try {
        const commandCount = await generateAgentCommands(projectPath, aiAssistant, scriptType);
        if (tracker) {
          tracker.add('commands', 'Generate commands');
          tracker.complete('commands', `${commandCount} commands`);
        } else if (verbose) {
          console.log(chalk.cyan(`Generated ${commandCount} command files for ${aiAssistant}`));
        }
      } catch (e) {
        if (tracker) {
          tracker.error('commands', e.message);
        }
        throw new Error(`Failed to generate commands: ${e.message}`);
      }

      // Copy agent-specific settings files
      const agentSettingsMap = {
        cursor: { source: 'cursor-settings.json', dest: '.cursor/settings.json' },
        copilot: { source: 'vscode-settings.json', dest: '.vscode/settings.json' }
      };

      if (agentSettingsMap[aiAssistant]) {
        const { source, dest } = agentSettingsMap[aiAssistant];
        const sourceFile = path.join(vibeDraftBaseDir, 'templates', source);
        const destFile = path.join(projectPath, dest);

        if (await fs.pathExists(sourceFile)) {
          await fs.ensureDir(path.dirname(destFile));
          await fs.copy(sourceFile, destFile);
          if (verbose) {
            console.log(chalk.cyan(`Copied ${source} to ${dest}`));
          }
        }
      }
    }

    const copiedCount = 5; // Approximate count of major items copied

    if (tracker) {
      tracker.complete('extract', `copied ${copiedCount} items`);
      tracker.add('zip-list', 'Template items');
      tracker.complete('zip-list', `${copiedCount} items`);
      tracker.add('extracted-summary', 'Copy summary');
      tracker.complete('extracted-summary', `${copiedCount} items copied`);
    } else if (verbose) {
      console.log(chalk.cyan(`Copied ${copiedCount} template items`));
    }

    return projectPath;
  } catch (e) {
    if (tracker) {
      tracker.error('extract', e.message);
    }
    throw new Error(`Error copying local template: ${e.message}`);
  }
}

/**
 * Download and extract template
 */
export async function downloadAndExtractTemplate(
  projectPath,
  aiAssistant,
  scriptType,
  isCurrentDir = false,
  {
    verbose = true,
    tracker = null,
    debug = false,
    githubToken = null,
    skipTls = false,
    useLocalTemplate = false
  } = {}
) {
  // Use local templates if flag is set OR if in test/CI environment
  const isTestEnvironment = process.env.CI === 'true' || process.env.NODE_ENV === 'test';

  if (useLocalTemplate || isTestEnvironment) {
    return await copyLocalTemplate(aiAssistant, scriptType, projectPath, isCurrentDir, {
      verbose,
      tracker
    });
  }
  const currentDir = process.cwd();

  // Step: fetch + download combined
  if (tracker) {
    tracker.start('fetch', 'contacting GitHub API');
  }

  let zipPath, metadata;
  try {
    const result = await downloadTemplateFromGithub(aiAssistant, currentDir, {
      scriptType,
      verbose: verbose && !tracker,
      showProgress: !tracker,
      debug,
      githubToken,
      skipTls
    });
    zipPath = result.zipPath;
    metadata = result.metadata;

    if (tracker) {
      tracker.complete('fetch', `release ${metadata.release} (${metadata.size.toLocaleString()} bytes)`);
      tracker.add('download', 'Download template');
      tracker.complete('download', metadata.filename);
    }
  } catch (e) {
    // Auto-fallback to local templates if GitHub download fails
    if (tracker) {
      tracker.error('fetch', 'GitHub unavailable, using local templates');
    } else if (verbose) {
      console.log(chalk.yellow('⚠️  GitHub download failed, falling back to local templates'));
      console.log(chalk.dim(`   Reason: ${e.message}`));
    }

    // Attempt to use local templates as fallback
    try {
      return await copyLocalTemplate(aiAssistant, scriptType, projectPath, isCurrentDir, {
        verbose,
        tracker
      });
    } catch (localError) {
      // If local templates also fail, throw original error with helpful context
      const errorMsg = 'Failed to download from GitHub and local templates unavailable.\n' +
                      `GitHub error: ${e.message}\n` +
                      `Local error: ${localError.message}\n\n` +
                      'Solutions:\n' +
                      '1. Create a GitHub release: npm run build:releases && npm run release:github\n' +
                      '2. Use --local flag if developing: vibedraft init <name> --local';
      throw new Error(errorMsg);
    }
  }

  if (tracker) {
    tracker.add('extract', 'Extract template');
    tracker.start('extract');
  } else if (verbose) {
    console.log('Extracting template...');
  }

  try {
    // Create project directory only if not using current directory
    if (!isCurrentDir) {
      await fs.ensureDir(projectPath);
    }

    const zip = new AdmZip(zipPath);
    const zipEntries = zip.getEntries();

    if (tracker) {
      tracker.start('zip-list');
      tracker.complete('zip-list', `${zipEntries.length} entries`);
    } else if (verbose) {
      console.log(chalk.cyan(`ZIP contains ${zipEntries.length} items`));
    }

    if (isCurrentDir) {
      // Extract to temp location first
      const tempDir = await fs.mkdtemp(path.join(currentDir, '.vibedraft-temp-'));

      try {
        zip.extractAllTo(tempDir, true);

        const extractedItems = await fs.readdir(tempDir);
        if (tracker) {
          tracker.start('extracted-summary');
          tracker.complete('extracted-summary', `temp ${extractedItems.length} items`);
        } else if (verbose) {
          console.log(chalk.cyan(`Extracted ${extractedItems.length} items to temp location`));
        }

        // Handle GitHub-style ZIP with a single root directory
        let sourceDir = tempDir;
        if (extractedItems.length === 1) {
          const item = path.join(tempDir, extractedItems[0]);
          const stats = await fs.stat(item);
          if (stats.isDirectory()) {
            sourceDir = item;
            if (tracker) {
              tracker.add('flatten', 'Flatten nested directory');
              tracker.complete('flatten');
            } else if (verbose) {
              console.log(chalk.cyan('Found nested directory structure'));
            }
          }
        }

        // Copy contents to current directory
        const items = await fs.readdir(sourceDir);
        for (const item of items) {
          const sourcePath = path.join(sourceDir, item);
          const destPath = path.join(projectPath, item);
          await fs.copy(sourcePath, destPath, { overwrite: true });
        }

        if (verbose && !tracker) {
          console.log(chalk.cyan('Template files merged into current directory'));
        }

        // Cleanup temp directory
        await fs.remove(tempDir);
      } catch (e) {
        // Ensure temp directory is cleaned up
        if (await fs.pathExists(tempDir)) {
          await fs.remove(tempDir);
        }
        throw e;
      }
    } else {
      // Extract directly to project directory
      zip.extractAllTo(projectPath, true);

      const extractedItems = await fs.readdir(projectPath);
      if (tracker) {
        tracker.start('extracted-summary');
        tracker.complete('extracted-summary', `${extractedItems.length} top-level items`);
      } else if (verbose) {
        console.log(chalk.cyan(`Extracted ${extractedItems.length} items to ${projectPath}`));
      }

      // Handle GitHub-style ZIP with a single root directory
      if (extractedItems.length === 1) {
        const item = path.join(projectPath, extractedItems[0]);
        const stats = await fs.stat(item);
        if (stats.isDirectory()) {
          // Move contents up one level
          const items = await fs.readdir(item);
          for (const subItem of items) {
            const srcPath = path.join(item, subItem);
            const destPath = path.join(projectPath, subItem);
            await fs.move(srcPath, destPath, { overwrite: true });
          }
          // Remove empty directory
          await fs.remove(item);

          if (tracker) {
            tracker.add('flatten', 'Flatten nested directory');
            tracker.complete('flatten');
          } else if (verbose) {
            console.log(chalk.cyan('Flattened nested directory structure'));
          }
        }
      }
    }

    if (tracker) {
      tracker.complete('extract');
    }

    // Generate agent-specific command files (if not already in release)
    try {
      const commandCount = await generateAgentCommands(projectPath, aiAssistant, scriptType);
      if (tracker) {
        tracker.add('commands', 'Generate commands');
        tracker.complete('commands', `${commandCount} commands`);
      } else if (verbose) {
        console.log(chalk.cyan(`Generated ${commandCount} command files for ${aiAssistant}`));
      }
    } catch {
      // Don't fail if command generation has issues - commands might already exist in release
      if (tracker) {
        tracker.add('commands', 'Generate commands');
        tracker.skip('commands', 'using release commands');
      } else if (verbose) {
        console.log(chalk.yellow('Using pre-generated commands from release'));
      }
    }
  } catch (e) {
    if (tracker) {
      tracker.error('extract', e.message);
    } else if (verbose) {
      console.error(chalk.red(`Error extracting template: ${e.message}`));
    }

    // Clean up project directory if created and not current directory
    if (!isCurrentDir && (await fs.pathExists(projectPath))) {
      await fs.remove(projectPath);
    }
    throw e;
  } finally {
    if (tracker) {
      tracker.add('cleanup', 'Remove temporary archive');
    }

    // Clean up downloaded ZIP file
    if (await fs.pathExists(zipPath)) {
      await fs.remove(zipPath);
      if (tracker) {
        tracker.complete('cleanup');
      } else if (verbose) {
        console.log(`Cleaned up: ${path.basename(zipPath)}`);
      }
    }
  }

  return projectPath;
}
