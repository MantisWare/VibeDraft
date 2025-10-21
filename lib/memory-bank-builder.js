import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import chalk from 'chalk';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Agent configuration for Memory Bank
 */
export const AGENT_MEMORY_BANK_CONFIG = {
  cursor: {
    rulesDir: '.cursor/rules',
    coreFile: 'core.mdc',
    memoryBankFile: 'memory-bank.mdc',
    memoryBankDir: '.cursor/rules/memory-bank',
    format: 'mdc',
    frontmatter: {
      description: '',
      globs: '',
      alwaysApply: true
    }
  },
  claude: {
    rulesDir: '.claude',
    coreFile: 'core-rules.md',
    memoryBankFile: 'memory-bank-rules.md',
    memoryBankDir: '.claude/memory-bank',
    format: 'md'
  },
  gemini: {
    rulesDir: '.gemini',
    coreFile: 'core-rules.md',
    memoryBankFile: 'memory-bank-rules.md',
    memoryBankDir: '.gemini/memory-bank',
    format: 'md'
  },
  copilot: {
    rulesDir: '.github',
    coreFile: 'core-rules.md',
    memoryBankFile: 'memory-bank-rules.md',
    memoryBankDir: '.github/memory-bank',
    format: 'md'
  },
  windsurf: {
    rulesDir: '.windsurf',
    coreFile: 'core-rules.md',
    memoryBankFile: 'memory-bank-rules.md',
    memoryBankDir: '.windsurf/memory-bank',
    format: 'md'
  },
  qwen: {
    rulesDir: '.qwen',
    coreFile: 'core-rules.md',
    memoryBankFile: 'memory-bank-rules.md',
    memoryBankDir: '.qwen/memory-bank',
    format: 'md'
  },
  opencode: {
    rulesDir: '.opencode',
    coreFile: 'core-rules.md',
    memoryBankFile: 'memory-bank-rules.md',
    memoryBankDir: '.opencode/memory-bank',
    format: 'md'
  },
  q: {
    rulesDir: '.amazonq',
    coreFile: 'core-rules.md',
    memoryBankFile: 'memory-bank-rules.md',
    memoryBankDir: '.amazonq/memory-bank',
    format: 'md'
  },
  codex: {
    rulesDir: '.codex',
    coreFile: 'core-rules.md',
    memoryBankFile: 'memory-bank-rules.md',
    memoryBankDir: '.codex/memory-bank',
    format: 'md'
  },
  kilocode: {
    rulesDir: '.kilocode',
    coreFile: 'core-rules.md',
    memoryBankFile: 'memory-bank-rules.md',
    memoryBankDir: '.kilocode/memory-bank',
    format: 'md'
  },
  auggie: {
    rulesDir: '.augment',
    coreFile: 'core-rules.md',
    memoryBankFile: 'memory-bank-rules.md',
    memoryBankDir: '.augment/memory-bank',
    format: 'md'
  },
  roo: {
    rulesDir: '.roo',
    coreFile: 'core-rules.md',
    memoryBankFile: 'memory-bank-rules.md',
    memoryBankDir: '.roo/memory-bank',
    format: 'md'
  }
};

/**
 * Core Memory Bank files (in dependency order)
 */
const CORE_MB_FILES = [
  'projectbrief.md',
  'productContext.md',
  'systemPatterns.md',
  'techContext.md',
  'activeContext.md',
  'progress.md'
];

/**
 * Minimal Memory Bank files (for small projects)
 */
const MINIMAL_MB_FILES = [
  'projectbrief.md',
  'techContext.md',
  'activeContext.md'
];

/**
 * Generate Memory Bank for a specific agent
 * @param {string} projectPath - Path to project
 * @param {string} agentType - Type of AI agent
 * @param {Object} options - Generation options
 * @returns {Promise<Object>} Summary of created files
 */
export async function generateMemoryBank(projectPath, agentType, options = {}) {
  const {
    minimal = false,
    populate = true,
    techStack = null,
    verbose = true
  } = options;

  const config = AGENT_MEMORY_BANK_CONFIG[agentType];
  if (!config) {
    throw new Error(`Unknown agent type: ${agentType}`);
  }

  const created = {
    coreRules: false,
    memoryBankRules: false,
    files: []
  };

  try {
    // 1. Create rules directory
    const rulesDir = path.join(projectPath, config.rulesDir);
    await fs.ensureDir(rulesDir);

    // 2. Create memory bank directory
    const mbDir = path.join(projectPath, config.memoryBankDir);
    await fs.ensureDir(mbDir);

    // 3. Create Notes subdirectory
    const notesDir = path.join(mbDir, 'Notes');
    await fs.ensureDir(notesDir);

    // 4. Copy and format core rules
    const coreRulesPath = path.join(rulesDir, config.coreFile);
    if (!(await fs.pathExists(coreRulesPath))) {
      const templatePath = path.join(__dirname, '..', 'templates', 'memory-bank', 'core-rules.md');
      let content = await fs.readFile(templatePath, 'utf8');
      content = formatForAgent(content, config.format, config.frontmatter);
      await fs.writeFile(coreRulesPath, content, 'utf8');
      created.coreRules = true;
    }

    // 5. Copy and format memory bank rules
    const mbRulesPath = path.join(rulesDir, config.memoryBankFile);
    if (!(await fs.pathExists(mbRulesPath))) {
      const templatePath = path.join(__dirname, '..', 'templates', 'memory-bank', 'memory-bank-rules.md');
      let content = await fs.readFile(templatePath, 'utf8');
      content = formatForAgent(content, config.format, config.frontmatter);
      await fs.writeFile(mbRulesPath, content, 'utf8');
      created.memoryBankRules = true;
    }

    // 6. Create Memory Bank files
    const filesToCreate = minimal ? MINIMAL_MB_FILES : CORE_MB_FILES;
    
    for (const filename of filesToCreate) {
      const filePath = path.join(mbDir, filename);
      
      if (!(await fs.pathExists(filePath))) {
        const templatePath = path.join(__dirname, '..', 'templates', 'memory-bank', filename);
        let content = await fs.readFile(templatePath, 'utf8');

        // Auto-populate if requested
        if (populate) {
          const projectData = await extractProjectData(projectPath, techStack);
          content = populateTemplate(content, filename, projectData);
        }

        await fs.writeFile(filePath, content, 'utf8');
        created.files.push(filename);
      }
    }

    if (verbose) {
      console.log(chalk.green(`✓ Memory Bank created for ${agentType}`));
      console.log(chalk.cyan(`  Location: ${config.memoryBankDir}`));
      console.log(chalk.cyan(`  Files: ${created.files.length} ${minimal ? '(minimal)' : '(full)'}`));
    }

    return created;
  } catch (error) {
    throw new Error(`Failed to generate Memory Bank: ${error.message}`);
  }
}

/**
 * Extract project data for auto-population
 * @param {string} projectPath - Path to project
 * @param {Object} techStack - Tech stack detection data
 * @returns {Promise<Object>} Project data
 */
async function extractProjectData(projectPath, techStack) {
  const data = {
    projectName: path.basename(projectPath),
    readme: null,
    packageJson: null,
    constitution: null,
    techStack: techStack
  };

  // Read README.md
  const readmePath = path.join(projectPath, 'README.md');
  if (await fs.pathExists(readmePath)) {
    data.readme = await fs.readFile(readmePath, 'utf8');
  }

  // Read package.json
  const packagePath = path.join(projectPath, 'package.json');
  if (await fs.pathExists(packagePath)) {
    data.packageJson = JSON.parse(await fs.readFile(packagePath, 'utf8'));
  }

  // Read constitution
  const constitutionPath = path.join(projectPath, '.vibedraft', 'memory', 'constitution.md');
  if (await fs.pathExists(constitutionPath)) {
    data.constitution = await fs.readFile(constitutionPath, 'utf8');
  }

  return data;
}

/**
 * Populate template with project data
 * @param {string} template - Template content
 * @param {string} filename - Template filename
 * @param {Object} projectData - Project data
 * @returns {string} Populated content
 */
function populateTemplate(template, filename, projectData) {
  let content = template;

  // Only populate what we're confident about
  switch (filename) {
    case 'projectbrief.md':
      content = populateProjectBrief(content, projectData);
      break;
    case 'techContext.md':
      content = populateTechContext(content, projectData);
      break;
    case 'systemPatterns.md':
      content = populateSystemPatterns(content, projectData);
      break;
    case 'productContext.md':
      content = populateProductContext(content, projectData);
      break;
    case 'activeContext.md':
      content = populateActiveContext(content, projectData);
      break;
    case 'progress.md':
      content = populateProgress(content, projectData);
      break;
  }

  return content;
}

/**
 * Populate project brief
 */
function populateProjectBrief(template, data) {
  let content = template;

  // Project name (100% confident)
  content = content.replace('{PROJECT_NAME}', data.projectName);

  // Extract from package.json
  if (data.packageJson) {
    const desc = data.packageJson.description || '[Add project objective]';
    content = content.replace('{PROJECT_OBJECTIVE}', desc);
  } else {
    content = content.replace('{PROJECT_OBJECTIVE}', '[Add project objective]');
  }

  // Placeholder for items we're not confident about
  content = content.replace('{PROJECT_SCOPE}', '[Define project scope - key features and boundaries]');
  content = content.replace('{PROJECT_DELIVERABLES}', '[List main deliverables]');
  content = content.replace('{PROJECT_STAKEHOLDERS}', '[Identify stakeholders and their roles]');
  content = content.replace('{PROJECT_FEATURES}', '[List key features]');
  content = content.replace('{PROJECT_SUCCESS_CRITERIA}', '[Define success metrics]');
  content = content.replace('{PROJECT_TIMELINE}', '[Define project phases and timeline]');
  content = content.replace('{PROJECT_CONSTRAINTS}', '[Document technical and resource constraints]');

  return content;
}

/**
 * Populate tech context
 */
function populateTechContext(template, data) {
  let content = template;

  // Use tech stack detection if available
  if (data.techStack && data.techStack.hasExistingApp) {
    content = populateTechContextFromDetection(content, data.techStack);
  } else if (data.packageJson) {
    content = populateTechContextFromPackageJson(content, data.packageJson);
  } else {
    // Placeholders
    content = content.replace('{FRONTEND_STACK}', '[Document frontend technologies]');
    content = content.replace('{BACKEND_STACK}', '[Document backend technologies]');
    content = content.replace('{INFRASTRUCTURE}', '[Document infrastructure and deployment]');
    content = content.replace('{SETUP_REQUIREMENTS}', '[List setup requirements]');
    content = content.replace('{DEV_TOOLS}', '[List development tools]');
    content = content.replace('{BUILD_PROCESS}', '[Document build process]');
    content = content.replace('{CORE_DEPENDENCIES}', '[List core dependencies]');
    content = content.replace('{DEV_DEPENDENCIES}', '[List development dependencies]');
    content = content.replace('{ENVIRONMENT_VARIABLES}', '[Document required environment variables]');
    content = content.replace('{CONFIG_FILES}', '[List configuration files]');
    content = content.replace('{TECH_CONSTRAINTS}', '[Document technical constraints]');
    content = content.replace('{BEST_PRACTICES}', '[Document coding standards and best practices]');
  }

  return content;
}

/**
 * Populate tech context from detection
 */
function populateTechContextFromDetection(content, techStack) {
  // Frontend stack
  const frontendFrameworks = techStack.frameworks.filter(f => f.category === 'frontend');
  const frontendLangs = techStack.languages.filter(l => l.primary);
  
  let frontend = '';
  if (frontendFrameworks.length > 0 || frontendLangs.length > 0) {
    if (frontendFrameworks.length > 0) {
      frontend += frontendFrameworks.map(f => `- **Framework**: ${f.name} ${f.version}`).join('\n');
    }
    if (frontendLangs.length > 0) {
      frontend += '\n' + frontendLangs.map(l => `- **Language**: ${l.name}`).join('\n');
    }
  } else {
    frontend = '[No frontend framework detected]';
  }
  content = content.replace('{FRONTEND_STACK}', frontend);

  // Backend stack
  const backendFrameworks = techStack.frameworks.filter(f => f.category === 'backend');
  let backend = '';
  if (backendFrameworks.length > 0) {
    backend = backendFrameworks.map(f => `- **Framework**: ${f.name} ${f.version}`).join('\n');
  } else {
    backend = '[No backend framework detected]';
  }
  content = content.replace('{BACKEND_STACK}', backend);

  // Build tools
  let buildTools = '';
  if (techStack.buildTools.length > 0) {
    buildTools = techStack.buildTools.map(t => `- **${t.name}**: ${t.purpose}`).join('\n');
  } else {
    buildTools = '[No build tools detected]';
  }

  // Infrastructure
  const infra = `- **Package Manager**: ${techStack.packageManager}\n- **Build Tools**:\n${buildTools}`;
  content = content.replace('{INFRASTRUCTURE}', infra);

  // Dependencies
  let coreDeps = '';
  if (techStack.packageJson && techStack.packageJson.dependencies) {
    const deps = Object.entries(techStack.packageJson.dependencies).slice(0, 10);
    coreDeps = deps.map(([name, version]) => `- ${name} - ${version}`).join('\n');
    if (Object.keys(techStack.packageJson.dependencies).length > 10) {
      coreDeps += '\n- ... and more (see package.json)';
    }
  } else {
    coreDeps = '[See package.json]';
  }
  content = content.replace('{CORE_DEPENDENCIES}', coreDeps);

  // Setup requirements
  let setup = '';
  if (techStack.packageJson?.engines?.node) {
    setup = `- **Node.js**: ${techStack.packageJson.engines.node}\n`;
  }
  if (techStack.packageManager !== 'unknown') {
    setup += `- **Package Manager**: ${techStack.packageManager}\n`;
  }
  setup += '- [Add other setup requirements]';
  content = content.replace('{SETUP_REQUIREMENTS}', setup);

  // Placeholders for items we can't detect
  content = content.replace('{DEV_TOOLS}', '[Document development tools and IDE setup]');
  content = content.replace('{BUILD_PROCESS}', '[Document build and deployment process]');
  content = content.replace('{DEV_DEPENDENCIES}', '[See package.json devDependencies]');
  content = content.replace('{ENVIRONMENT_VARIABLES}', '[Document required environment variables]');
  content = content.replace('{CONFIG_FILES}', '[List configuration files and their purposes]');
  content = content.replace('{TECH_CONSTRAINTS}', '[Document technical constraints and requirements]');
  content = content.replace('{BEST_PRACTICES}', '[Document coding standards and best practices]');

  return content;
}

/**
 * Populate tech context from package.json
 */
function populateTechContextFromPackageJson(content, pkg) {
  // Basic placeholders with package.json data
  content = content.replace('{FRONTEND_STACK}', '[Document frontend technologies]');
  content = content.replace('{BACKEND_STACK}', '[Document backend technologies]');
  content = content.replace('{INFRASTRUCTURE}', `- **Package Manager**: ${pkg.packageManager || 'npm'}`);
  
  const deps = Object.entries(pkg.dependencies || {}).slice(0, 10);
  const coreDeps = deps.length > 0 
    ? deps.map(([name, version]) => `- ${name} - ${version}`).join('\n')
    : '[No dependencies]';
  content = content.replace('{CORE_DEPENDENCIES}', coreDeps);

  content = content.replace('{SETUP_REQUIREMENTS}', pkg.engines?.node ? `- **Node.js**: ${pkg.engines.node}` : '[Document setup requirements]');
  content = content.replace('{DEV_TOOLS}', '[Document development tools]');
  content = content.replace('{BUILD_PROCESS}', '[Document build process]');
  content = content.replace('{DEV_DEPENDENCIES}', '[See package.json devDependencies]');
  content = content.replace('{ENVIRONMENT_VARIABLES}', '[Document environment variables]');
  content = content.replace('{CONFIG_FILES}', '[List configuration files]');
  content = content.replace('{TECH_CONSTRAINTS}', '[Document constraints]');
  content = content.replace('{BEST_PRACTICES}', '[Document best practices]');

  return content;
}

/**
 * Populate other templates with placeholders
 */
function populateSystemPatterns(template, data) {
  return template
    .replace('{ARCHITECTURE_OVERVIEW}', '[Document high-level architecture]')
    .replace('{DATA_FLOW}', '[Document data flow patterns]')
    .replace('{KEY_PATTERNS}', '[Document key architectural patterns]')
    .replace('{COMPONENT_RELATIONSHIPS}', '[Document component relationships]')
    .replace('{DESIGN_PATTERNS}', '[Document design patterns in use]')
    .replace('{INTEGRATION_POINTS}', '[Document external integrations]')
    .replace('{SECURITY_PATTERNS}', '[Document security approach]')
    .replace('{PERFORMANCE_PATTERNS}', '[Document performance strategies]')
    .replace('{ERROR_HANDLING}', '[Document error handling approach]');
}

function populateProductContext(template, data) {
  return template
    .replace('{PRODUCT_PURPOSE}', '[Explain why this product exists]')
    .replace('{PROBLEMS_SOLVED}', '[Describe problems solved]')
    .replace('{TARGET_USERS}', '[Define target users]')
    .replace('{USER_JOURNEY}', '[Document user journey]')
    .replace('{UX_GOALS}', '[Define UX goals]')
    .replace('{BUSINESS_VALUE}', '[Describe business value]')
    .replace('{SUCCESS_METRICS}', '[Define success metrics]');
}

function populateActiveContext(template, data) {
  return template
    .replace('{CURRENT_FOCUS}', `Initial setup - Memory Bank created on ${new Date().toLocaleDateString()}`)
    .replace('{RECENT_CHANGES}', 'Project initialized with VibeDraft')
    .replace('{NEXT_STEPS}', '[Define immediate next steps]')
    .replace('{ACTIVE_DECISIONS}', '[Document active decisions]')
    .replace('{CURRENT_CHALLENGES}', '[Note current challenges]')
    .replace('{CONTEXT_NOTES}', '[Add contextual notes]');
}

function populateProgress(template, data) {
  return template
    .replace('{COMPLETED_FEATURES}', 'Project structure initialized')
    .replace('{IN_PROGRESS_TASKS}', '[Document tasks in progress]')
    .replace('{PHASE_1_TASKS}', '[Define immediate priorities]')
    .replace('{PHASE_2_TASKS}', '[Define short-term goals]')
    .replace('{PHASE_3_TASKS}', '[Define long-term goals]')
    .replace('{KNOWN_ISSUES}', '[Document known issues]')
    .replace('{TECHNICAL_DEBT}', '[Document technical debt]')
    .replace('{RECENT_ACHIEVEMENTS}', 'Memory Bank system set up')
    .replace('{UPCOMING_MILESTONES}', '[Define milestones]')
    .replace('{RISK_FACTORS}', '[Document risk factors]');
}

/**
 * Format content for specific agent
 * @param {string} content - Content to format
 * @param {string} format - Target format
 * @param {Object} frontmatter - Frontmatter data
 * @returns {string} Formatted content
 */
function formatForAgent(content, format, frontmatter = null) {
  switch (format) {
    case 'mdc':
      // Cursor format with frontmatter
      if (frontmatter) {
        const yaml = Object.entries(frontmatter)
          .map(([key, val]) => `${key}: ${val}`)
          .join('\n');
        return `---\n${yaml}\n---\n${content}`;
      }
      return content;

    case 'md':
    default:
      return content;
  }
}

/**
 * Update existing Memory Bank with current project state
 * @param {string} projectPath - Path to project
 * @param {string} agentType - Type of AI agent
 * @returns {Promise<Object>} Update summary
 */
export async function updateMemoryBank(projectPath, agentType) {
  const config = AGENT_MEMORY_BANK_CONFIG[agentType];
  if (!config) {
    throw new Error(`Unknown agent type: ${agentType}`);
  }

  const mbDir = path.join(projectPath, config.memoryBankDir);
  if (!(await fs.pathExists(mbDir))) {
    throw new Error(`Memory Bank not found at ${mbDir}. Run 'vibedraft memory-bank --agent ${agentType}' to create it.`);
  }

  // Extract current project data
  const projectData = await extractProjectData(projectPath, null);

  const updated = [];

  // Update activeContext.md with current date
  const activeContextPath = path.join(mbDir, 'activeContext.md');
  if (await fs.pathExists(activeContextPath)) {
    let content = await fs.readFile(activeContextPath, 'utf8');
    // Add update marker
    content = `<!-- Last updated: ${new Date().toISOString()} -->\n\n${content}`;
    await fs.writeFile(activeContextPath, content, 'utf8');
    updated.push('activeContext.md');
  }

  return { updated };
}

