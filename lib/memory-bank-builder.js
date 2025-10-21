import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import chalk from 'chalk';
import { analyzeProjectStructure, generateStructureSummary } from './structure-analyzer.js';
import { detectPatterns, generatePatternSummary, extractKeyPatterns } from './pattern-detector.js';
import { parseDocumentation, extractProjectContext } from './docs-parser.js';

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
    techStack: techStack,
    structure: null,
    patterns: null,
    documentation: null,
    projectContext: null
  };

  // Analyze project structure
  try {
    data.structure = await analyzeProjectStructure(projectPath);
  } catch (error) {
    console.error(`Error analyzing structure: ${error.message}`);
  }

  // Detect patterns
  try {
    data.patterns = await detectPatterns(projectPath);
  } catch (error) {
    console.error(`Error detecting patterns: ${error.message}`);
  }

  // Parse documentation
  try {
    data.documentation = await parseDocumentation(projectPath);
    data.projectContext = extractProjectContext(data.documentation);
  } catch (error) {
    console.error(`Error parsing documentation: ${error.message}`);
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

  // Project name
  const projectName = data.projectContext?.name ?? data.projectName;
  content = content.replace(/\{PROJECT_NAME\}/g, projectName);

  // Project description/objective
  let objective = '[Add project objective]';
  if (data.projectContext?.description !== null && data.projectContext?.description !== undefined) {
    objective = data.projectContext.description;
  } else if (data.documentation?.packageJson?.description !== null && data.documentation?.packageJson?.description !== undefined) {
    objective = data.documentation.packageJson.description;
  }
  content = content.replace(/\{PROJECT_OBJECTIVE\}/g, objective);

  // Project scope from features
  let scope = '[Define project scope - key features and boundaries]';
  if (data.projectContext?.features !== undefined && data.projectContext.features.length > 0) {
    scope = 'Key features:\n' + data.projectContext.features.map(f => `- ${f}`).join('\n');
  }
  content = content.replace(/\{PROJECT_SCOPE\}/g, scope);

  // Features list
  let features = '[List key features]';
  if (data.projectContext?.features !== undefined && data.projectContext.features.length > 0) {
    features = data.projectContext.features.map(f => `- ${f}`).join('\n');
  }
  content = content.replace(/\{PROJECT_FEATURES\}/g, features);

  // Deliverables based on project type
  let deliverables = '[List main deliverables]';
  if (data.structure?.projectType !== undefined) {
    switch (data.techStack?.projectStructure?.type) {
      case 'web-app':
        deliverables = '- Functional web application\n- User interface components\n- API integration\n- Deployment-ready build';
        break;
      case 'api':
        deliverables = '- REST/GraphQL API\n- API documentation\n- Authentication & authorization\n- Database schema';
        break;
      case 'library':
        deliverables = '- Reusable library package\n- API documentation\n- Usage examples\n- Test suite';
        break;
      case 'fullstack':
        deliverables = '- Full-stack application\n- Frontend UI\n- Backend API\n- Database integration';
        break;
      case 'mobile':
        deliverables = '- Mobile application\n- Platform-specific builds\n- App store deployment';
        break;
      default:
        deliverables = '[List main deliverables]';
    }
  }
  content = content.replace(/\{PROJECT_DELIVERABLES\}/g, deliverables);

  // Placeholders for items we can't infer
  content = content.replace(/\{PROJECT_STAKEHOLDERS\}/g, '[Identify stakeholders and their roles]');
  content = content.replace(/\{PROJECT_SUCCESS_CRITERIA\}/g, '[Define success metrics]');
  content = content.replace(/\{PROJECT_TIMELINE\}/g, '[Define project phases and timeline]');
  content = content.replace(/\{PROJECT_CONSTRAINTS\}/g, '[Document technical and resource constraints]');

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
      frontend += `\n${frontendLangs.map(l => `- **Language**: ${l.name}`).join('\n')}`;
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
 * Populate system patterns
 */
function populateSystemPatterns(template, data) {
  let content = template;

  // Architecture overview from structure and patterns
  let archOverview = '[Document high-level architecture]';
  if (data.structure?.patterns !== undefined && data.structure.patterns.length > 0) {
    archOverview = 'Detected architectural patterns:\n\n';
    for (const pattern of data.structure.patterns) {
      archOverview += `### ${pattern.name}\n${pattern.description}\n\n`;
    }
    
    if (data.techStack?.projectStructure?.type !== undefined) {
      archOverview += `\n**Project Type**: ${data.techStack.projectStructure.type}\n`;
    }
  } else if (data.techStack?.projectStructure?.type !== undefined) {
    archOverview = `**Project Type**: ${data.techStack.projectStructure.type}\n\n`;
    archOverview += generateDefaultArchitecture(data.techStack.projectStructure.type);
  }
  content = content.replace(/\{ARCHITECTURE_OVERVIEW\}/g, archOverview);

  // Key patterns from pattern detection
  let keyPatterns = '[Document key architectural patterns]';
  if (data.patterns !== null && data.patterns !== undefined) {
    const extracted = extractKeyPatterns(data.patterns);
    if (extracted.length > 0) {
      keyPatterns = '';
      for (const pattern of extracted) {
        keyPatterns += `- **${pattern.name}**: ${pattern.details}\n`;
      }
    }
  }
  content = content.replace(/\{KEY_PATTERNS\}/g, keyPatterns);

  // Component relationships from structure
  let componentRels = '[Document component relationships]';
  if (data.structure?.organizedByType !== undefined && Object.keys(data.structure.organizedByType).length > 0) {
    componentRels = 'Directory organization suggests:\n\n';
    for (const [type, dirs] of Object.entries(data.structure.organizedByType)) {
      componentRels += `- **${type}**: ${dirs.map(d => `\`${d.name}\``).join(', ')}\n`;
    }
  }
  content = content.replace(/\{COMPONENT_RELATIONSHIPS\}/g, componentRels);

  // Design patterns from pattern detection
  let designPatterns = '[Document design patterns in use]';
  if (data.patterns?.codingPatterns !== undefined && data.patterns.codingPatterns.length > 0) {
    designPatterns = 'Code analysis detected:\n\n';
    for (const pattern of data.patterns.codingPatterns.slice(0, 10)) {
      designPatterns += `- **${pattern.name}**: ${pattern.description}\n`;
    }
  }
  content = content.replace(/\{DESIGN_PATTERNS\}/g, designPatterns);

  // Placeholders for items we can't detect
  content = content.replace(/\{DATA_FLOW\}/g, '[Document data flow patterns]');
  content = content.replace(/\{INTEGRATION_POINTS\}/g, '[Document external integrations]');
  content = content.replace(/\{SECURITY_PATTERNS\}/g, '[Document security approach]');
  content = content.replace(/\{PERFORMANCE_PATTERNS\}/g, '[Document performance strategies]');
  content = content.replace(/\{ERROR_HANDLING\}/g, '[Document error handling approach]');

  return content;
}

/**
 * Generate default architecture description based on project type
 */
function generateDefaultArchitecture(projectType) {
  const architectures = {
    'web-app': 'Web application with frontend components and potential API integration. Typically follows component-based architecture.',
    'api': 'API-focused architecture with routes/controllers handling requests. Likely follows REST or GraphQL patterns.',
    'library': 'Library package with exported modules and functions. Designed for reusability and distribution.',
    'fullstack': 'Full-stack application with both frontend and backend components. Separation between client and server code.',
    'mobile': 'Mobile application with platform-specific code. May include native modules and cross-platform components.',
    'monorepo': 'Monorepo structure with multiple packages/apps. Shared code and dependencies across projects.'
  };
  
  return architectures[projectType] ?? '[Document high-level architecture]';
}

function populateProductContext(template, data) {
  let content = template;

  // Product purpose from description
  let purpose = '[Explain why this product exists]';
  if (data.projectContext?.description !== null && data.projectContext?.description !== undefined) {
    purpose = data.projectContext.description;
  } else if (data.documentation?.readme?.description !== null && data.documentation?.readme?.description !== undefined) {
    purpose = data.documentation.readme.description;
  }
  content = content.replace(/\{PRODUCT_PURPOSE\}/g, purpose);

  // Problems solved - infer from features
  let problems = '[Describe problems solved]';
  if (data.projectContext?.features !== undefined && data.projectContext.features.length > 0) {
    problems = 'This project aims to address:\n';
    problems += data.projectContext.features.slice(0, 5).map(f => `- ${f}`).join('\n');
  }
  content = content.replace(/\{PROBLEMS_SOLVED\}/g, problems);

  // Target users - try to infer from project type
  let users = '[Define target users]';
  if (data.techStack?.projectStructure?.type !== undefined) {
    switch (data.techStack.projectStructure.type) {
      case 'web-app':
        users = 'End users accessing the web application through browsers';
        break;
      case 'api':
        users = 'Developers integrating with the API, client applications';
        break;
      case 'library':
        users = 'Developers using this library in their projects';
        break;
      case 'mobile':
        users = 'Mobile device users (iOS/Android)';
        break;
      case 'fullstack':
        users = 'End users interacting with both web interface and backend services';
        break;
      default:
        users = '[Define target users]';
    }
  }
  content = content.replace(/\{TARGET_USERS\}/g, users);

  // Placeholders for items we can't infer
  content = content.replace(/\{USER_JOURNEY\}/g, '[Document user journey]');
  content = content.replace(/\{UX_GOALS\}/g, '[Define UX goals]');
  content = content.replace(/\{BUSINESS_VALUE\}/g, '[Describe business value]');
  content = content.replace(/\{SUCCESS_METRICS\}/g, '[Define success metrics]');

  return content;
}

function populateActiveContext(template, data) {
  let content = template;

  const today = new Date().toLocaleDateString();
  
  // Current focus
  let focus = `Initial setup - Memory Bank created on ${today}`;
  if (data.techStack?.hasExistingApp === true) {
    focus += '\n\nExisting project detected with the following characteristics:\n';
    if (data.structure?.patterns !== undefined && data.structure.patterns.length > 0) {
      focus += `- Architecture: ${data.structure.patterns.map(p => p.name).join(', ')}\n`;
    }
    if (data.techStack?.frameworks !== undefined && data.techStack.frameworks.length > 0) {
      focus += `- Frameworks: ${data.techStack.frameworks.map(f => f.name).join(', ')}\n`;
    }
  }
  content = content.replace(/\{CURRENT_FOCUS\}/g, focus);

  // Recent changes
  let changes = 'Project initialized with VibeDraft';
  if (data.techStack?.hasExistingApp === true) {
    changes = 'VibeDraft added to existing project';
  }
  content = content.replace(/\{RECENT_CHANGES\}/g, changes);

  // Next steps based on project state
  let nextSteps = '[Define immediate next steps]';
  if (data.techStack?.hasExistingApp === true) {
    nextSteps = '1. Review and refine Memory Bank files with project-specific details\n';
    nextSteps += '2. Run `/vibedraft.constitution` to establish project principles\n';
    nextSteps += '3. Document any existing features not captured in current documentation\n';
    nextSteps += '4. Begin new feature development with `/vibedraft.draft`';
  } else {
    nextSteps = '1. Establish project constitution with `/vibedraft.constitution`\n';
    nextSteps += '2. Create first feature spec with `/vibedraft.draft`\n';
    nextSteps += '3. Build implementation plan with `/vibedraft.plan`\n';
    nextSteps += '4. Generate tasks with `/vibedraft.tasks`';
  }
  content = content.replace(/\{NEXT_STEPS\}/g, nextSteps);

  // Placeholders
  content = content.replace(/\{ACTIVE_DECISIONS\}/g, '[Document active decisions]');
  content = content.replace(/\{CURRENT_CHALLENGES\}/g, '[Note current challenges]');
  content = content.replace(/\{CONTEXT_NOTES\}/g, '[Add contextual notes]');

  return content;
}

function populateProgress(template, data) {
  let content = template;

  // Completed features
  let completed = 'Project structure initialized';
  if (data.techStack?.hasExistingApp === true) {
    completed = 'Existing application with:\n';
    if (data.projectContext?.features !== undefined && data.projectContext.features.length > 0) {
      completed += data.projectContext.features.map(f => `- ${f}`).join('\n');
    } else {
      completed += '- Core functionality in place\n';
      completed += '- [Document existing features]';
    }
  }
  content = content.replace(/\{COMPLETED_FEATURES\}/g, completed);

  // In progress
  let inProgress = '[Document tasks in progress]';
  if (data.techStack?.hasExistingApp === false) {
    inProgress = 'Initial setup and planning phase';
  }
  content = content.replace(/\{IN_PROGRESS_TASKS\}/g, inProgress);

  // Phase 1 tasks
  let phase1 = '[Define immediate priorities]';
  if (data.techStack?.hasExistingApp === true) {
    phase1 = '1. Document existing architecture and patterns\n';
    phase1 += '2. Set up development environment\n';
    phase1 += '3. Review and update dependencies\n';
    phase1 += '4. Establish testing strategy';
  } else {
    phase1 = '1. Define project constitution\n';
    phase1 += '2. Create initial feature specifications\n';
    phase1 += '3. Set up core project structure\n';
    phase1 += '4. Implement MVP features';
  }
  content = content.replace(/\{PHASE_1_TASKS\}/g, phase1);

  // Recent achievements
  let achievements = 'Memory Bank system set up';
  if (data.techStack?.hasExistingApp === true) {
    achievements += '\nProject analysis completed:\n';
    if (data.structure !== null && data.structure !== undefined) {
      achievements += `- ${data.structure.fileCount} files analyzed\n`;
      achievements += `- ${data.structure.directoryCount} directories scanned\n`;
    }
    if (data.patterns?.frameworkPatterns !== undefined && data.patterns.frameworkPatterns.length > 0) {
      achievements += `- ${data.patterns.frameworkPatterns.length} framework patterns detected\n`;
    }
  }
  content = content.replace(/\{RECENT_ACHIEVEMENTS\}/g, achievements);

  // Placeholders
  content = content.replace(/\{PHASE_2_TASKS\}/g, '[Define short-term goals]');
  content = content.replace(/\{PHASE_3_TASKS\}/g, '[Define long-term goals]');
  content = content.replace(/\{KNOWN_ISSUES\}/g, '[Document known issues]');
  content = content.replace(/\{TECHNICAL_DEBT\}/g, '[Document technical debt]');
  content = content.replace(/\{UPCOMING_MILESTONES\}/g, '[Define milestones]');
  content = content.replace(/\{RISK_FACTORS\}/g, '[Document risk factors]');

  return content;
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

  // Extract current project data (for future use)
  const _projectData = await extractProjectData(projectPath, null);

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
