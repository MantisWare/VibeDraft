import fs from 'fs-extra';
import chalk from 'chalk';

/**
 * Enrich constitution template with detected technology stack
 * @param {string} constitutionPath - Path to constitution.md file
 * @param {Object} techStack - Detected technology stack information
 * @returns {Promise<void>}
 */
export async function enrichConstitutionWithTechStack(constitutionPath, techStack) {
  try {
    // Read existing constitution template
    const constitutionContent = await fs.readFile(constitutionPath, 'utf8');

    // Format the technology stack section
    const techStackSection = formatTechStackSection(techStack);

    // Find the insertion point (before Governance section or at the end of Core Principles)
    const governanceIndex = constitutionContent.indexOf('## Governance');

    let enrichedContent;
    if (governanceIndex !== -1) {
      // Insert before Governance section
      enrichedContent =
        `${constitutionContent.slice(0, governanceIndex) +
        techStackSection
        }\n${
          constitutionContent.slice(governanceIndex)}`;
    } else {
      // Append to end
      enrichedContent = `${constitutionContent}\n\n${techStackSection}`;
    }

    // Add detection metadata as HTML comment at the top
    const metadata = formatDetectionMetadata(techStack);
    enrichedContent = `${metadata}\n\n${enrichedContent}`;

    // Write back to file
    await fs.writeFile(constitutionPath, enrichedContent, 'utf8');

    // Also save raw detection data for future reference
    const metadataPath = constitutionPath.replace('constitution.md', 'tech-stack-detected.json');
    await fs.writeFile(metadataPath, JSON.stringify(techStack, null, 2), 'utf8');
  } catch (error) {
    console.error(chalk.red(`Error enriching constitution: ${error.message}`));
    throw error;
  }
}

/**
 * Format technology stack as Markdown section
 * @param {Object} techStack - Detected technology stack
 * @returns {string} Formatted Markdown
 */
export function formatTechStackSection(techStack) {
  const lines = [];

  lines.push('## Technology Stack');
  lines.push(
    `<!-- Auto-populated during initialization from existing project scan on ${
      new Date(techStack.detectedAt).toLocaleDateString()
    } -->`
  );
  lines.push('');

  // Project Information
  if (techStack.packageJson !== null) {
    lines.push('### Project Information');
    lines.push(`- **Name**: ${techStack.packageJson.name}`);
    lines.push(`- **Version**: ${techStack.packageJson.version}`);
    lines.push(`- **Module Type**: ${techStack.packageJson.type}`);

    if (techStack.projectStructure.type !== 'unknown') {
      lines.push(`- **Project Type**: ${formatProjectType(techStack.projectStructure.type)}`);
    }

    if (techStack.packageManager !== 'unknown') {
      lines.push(`- **Package Manager**: ${techStack.packageManager}`);
    }

    lines.push('');
  }

  // Primary Languages
  if (techStack.languages.length > 0) {
    lines.push('### Primary Languages');
    const primaryLanguages = techStack.languages.filter(lang => lang.primary);
    const otherLanguages = techStack.languages.filter(lang => !lang.primary);

    if (primaryLanguages.length > 0) {
      for (const lang of primaryLanguages) {
        lines.push(
          `- **${lang.name}** - Primary language (${lang.fileCount} files with extensions: ${lang.extensions.join(', ')})`
        );
      }
    }

    if (otherLanguages.length > 0) {
      for (const lang of otherLanguages) {
        lines.push(
          `- **${lang.name}** - Supporting language (${lang.fileCount} files)`
        );
      }
    }

    lines.push('');
  }

  // Frameworks & Libraries
  const frameworksByCategory = groupFrameworksByCategory(techStack.frameworks);

  if (Object.keys(frameworksByCategory).length > 0) {
    lines.push('### Frameworks & Libraries');

    for (const [category, frameworks] of Object.entries(frameworksByCategory)) {
      const categoryTitle = formatCategoryTitle(category);

      for (const framework of frameworks) {
        const confidenceBadge = framework.confidence === 'high' ? '✓' : framework.confidence === 'medium' ? '~' : '?';
        lines.push(
          `- **${formatFrameworkName(framework.name)}** ${framework.version} - ${categoryTitle} ${confidenceBadge}`
        );
      }
    }

    lines.push('');
  }

  // Build & Development Tools
  if (techStack.buildTools.length > 0) {
    lines.push('### Build & Development Tools');
    for (const tool of techStack.buildTools) {
      lines.push(`- **${formatFrameworkName(tool.name)}** - ${tool.purpose}`);
    }
    lines.push('');
  }

  // Node.js Version Requirements
  if (techStack.packageJson?.engines?.node !== undefined) {
    lines.push('### Runtime Requirements');
    lines.push(`- **Node.js**: ${techStack.packageJson.engines.node}`);
    if (techStack.packageJson.engines.npm !== undefined) {
      lines.push(`- **npm**: ${techStack.packageJson.engines.npm}`);
    }
    lines.push('');
  }

  // Architectural Patterns Detected
  const architecturalPatterns = detectArchitecturalPatterns(techStack);
  if (architecturalPatterns.length > 0) {
    lines.push('### Architectural Patterns Detected');
    for (const pattern of architecturalPatterns) {
      lines.push(`- **${pattern.name}**: ${pattern.description}`);
    }
    lines.push('');
  }

  // Technology Constraints
  const constraints = generateTechnologyConstraints(techStack);
  if (constraints.length > 0) {
    lines.push('### Technology Constraints');
    lines.push('<!-- Auto-generated based on detected stack -->');
    for (const constraint of constraints) {
      lines.push(`- **${constraint.rule}**: ${constraint.reason}`);
    }
    lines.push('');
  }

  // Stack-Specific Principles
  lines.push('### Stack-Specific Principles');
  lines.push('<!-- Define principles specific to your technology choices -->');
  lines.push('');

  const stackPrinciples = generateStackSpecificPrinciples(techStack);
  for (const principle of stackPrinciples) {
    lines.push(`#### ${principle.title}`);
    lines.push(principle.description);
    lines.push('');
  }

  return lines.join('\n');
}

/**
 * Format detection metadata as HTML comment
 * @param {Object} techStack - Detected technology stack
 * @returns {string} HTML comment with metadata
 */
function formatDetectionMetadata(techStack) {
  const lines = [
    '<!--',
    'Technology Stack Detection Report',
    `Detected: ${new Date(techStack.detectedAt).toLocaleString()}`,
    'Detection Method: Automated scan during VibeDraft initialization',
    '',
    'Summary:',
    `- Frameworks: ${techStack.frameworks.length}`,
    `- Languages: ${techStack.languages.length}`,
    `- Build Tools: ${techStack.buildTools.length}`,
    `- Project Type: ${techStack.projectStructure.type}`,
    '',
    'Note: This constitution was automatically enhanced with the detected',
    'technology stack. Review and adjust as needed for your project.',
    '-->'
  ];

  return lines.join('\n');
}

/**
 * Group frameworks by category
 * @param {Array} frameworks - List of detected frameworks
 * @returns {Object} Frameworks grouped by category
 */
function groupFrameworksByCategory(frameworks) {
  const grouped = {};

  for (const framework of frameworks) {
    if (grouped[framework.category] === undefined) {
      grouped[framework.category] = [];
    }
    grouped[framework.category].push(framework);
  }

  // Sort frameworks within each category by confidence and then name
  for (const category of Object.keys(grouped)) {
    grouped[category].sort((a, b) => {
      const confidenceOrder = { high: 0, medium: 1, low: 2 };
      const confDiff = confidenceOrder[a.confidence] - confidenceOrder[b.confidence];
      if (confDiff !== 0) return confDiff;
      return a.name.localeCompare(b.name);
    });
  }

  return grouped;
}

/**
 * Format category title
 * @param {string} category - Category name
 * @returns {string} Formatted title
 */
function formatCategoryTitle(category) {
  const titles = {
    frontend: 'Frontend Framework',
    backend: 'Backend Framework',
    testing: 'Testing Framework',
    build: 'Build Tool',
    mobile: 'Mobile Framework',
    language: 'Language'
  };

  return titles[category] ?? category;
}

/**
 * Format framework name for display
 * @param {string} name - Framework name
 * @returns {string} Formatted name
 */
function formatFrameworkName(name) {
  const nameMap = {
    react: 'React',
    nextjs: 'Next.js',
    vue: 'Vue.js',
    angular: 'Angular',
    svelte: 'Svelte',
    express: 'Express',
    nestjs: 'NestJS',
    fastify: 'Fastify',
    koa: 'Koa',
    vite: 'Vite',
    webpack: 'Webpack',
    jest: 'Jest',
    vitest: 'Vitest',
    mocha: 'Mocha',
    typescript: 'TypeScript',
    'react-native': 'React Native',
    rollup: 'Rollup',
    esbuild: 'esbuild',
    parcel: 'Parcel',
    turbo: 'Turborepo',
    nx: 'Nx'
  };

  return nameMap[name] ?? name.charAt(0).toUpperCase() + name.slice(1);
}

/**
 * Format project type for display
 * @param {string} type - Project type
 * @returns {string} Formatted type
 */
function formatProjectType(type) {
  const typeMap = {
    monorepo: 'Monorepo',
    'web-app': 'Web Application',
    mobile: 'Mobile Application',
    fullstack: 'Full-stack Application',
    api: 'API/Backend Service',
    library: 'Library/Package',
    cli: 'CLI Tool',
    unknown: 'Unknown'
  };

  return typeMap[type] ?? type;
}

/**
 * Detect architectural patterns from technology stack
 * @param {Object} techStack - Detected technology stack
 * @returns {Array} List of detected patterns
 */
function detectArchitecturalPatterns(techStack) {
  const patterns = [];

  // Monorepo pattern
  if (techStack.projectStructure.type === 'monorepo') {
    patterns.push({
      name: 'Monorepo Architecture',
      description: 'Multiple related packages/applications in a single repository'
    });
  }

  // Full-stack pattern
  if (techStack.projectStructure.hasBackend && techStack.projectStructure.hasFrontend) {
    patterns.push({
      name: 'Full-stack Architecture',
      description: 'Integrated frontend and backend in a single project'
    });
  }

  // JAMstack pattern
  const hasStaticSiteGenerator = techStack.frameworks.some(f =>
    ['nextjs', 'gatsby', 'nuxt', 'gridsome'].includes(f.name)
  );
  if (hasStaticSiteGenerator) {
    patterns.push({
      name: 'JAMstack',
      description: 'JavaScript, APIs, and Markup architecture for modern web applications'
    });
  }

  // Microservices (if multiple service directories detected)
  const serviceDirectories = techStack.projectStructure.directories.filter(d =>
    d.includes('service') || d.includes('api')
  );
  if (serviceDirectories.length > 1) {
    patterns.push({
      name: 'Microservices',
      description: 'Application split into multiple independent services'
    });
  }

  // TypeScript-first
  const tsFramework = techStack.frameworks.find(f => f.name === 'typescript');
  if (tsFramework !== undefined && tsFramework.confidence === 'high') {
    patterns.push({
      name: 'TypeScript-First',
      description: 'Strong typing and type safety throughout the codebase'
    });
  }

  return patterns;
}

/**
 * Generate technology constraints based on stack
 * @param {Object} techStack - Detected technology stack
 * @returns {Array} List of constraints
 */
function generateTechnologyConstraints(techStack) {
  const constraints = [];

  // Node.js version constraint
  if (techStack.packageJson?.engines?.node !== undefined) {
    constraints.push({
      rule: 'Node.js Version',
      reason: `Project requires Node.js ${techStack.packageJson.engines.node} as specified in package.json`
    });
  }

  // Module type constraint
  if (techStack.packageJson?.type === 'module') {
    constraints.push({
      rule: 'ES Modules Only',
      reason: 'Project uses ES modules (type: "module" in package.json), all code must use import/export syntax'
    });
  }

  // Framework-specific constraints
  const reactFramework = techStack.frameworks.find(f => f.name === 'react');
  if (reactFramework !== undefined) {
    constraints.push({
      rule: 'React Component Standards',
      reason: 'All UI components must follow React component patterns and hooks guidelines'
    });
  }

  const nextjsFramework = techStack.frameworks.find(f => f.name === 'nextjs');
  if (nextjsFramework !== undefined) {
    constraints.push({
      rule: 'Next.js Conventions',
      reason: 'Routing, data fetching, and API routes must follow Next.js conventions'
    });
  }

  const tsFramework = techStack.frameworks.find(f => f.name === 'typescript');
  if (tsFramework !== undefined) {
    constraints.push({
      rule: 'Type Safety',
      reason: 'All code must be properly typed; avoid using "any" type unless explicitly justified'
    });
  }

  // Testing constraint
  const testingFramework = techStack.frameworks.find(f => f.category === 'testing');
  if (testingFramework !== undefined) {
    constraints.push({
      rule: 'Test Coverage',
      reason: `All new features must include ${formatFrameworkName(testingFramework.name)} tests`
    });
  }

  return constraints;
}

/**
 * Generate stack-specific principles
 * @param {Object} techStack - Detected technology stack
 * @returns {Array} List of principles
 */
function generateStackSpecificPrinciples(techStack) {
  const principles = [];

  // React-specific principles
  const reactFramework = techStack.frameworks.find(f => f.name === 'react');
  if (reactFramework !== undefined) {
    principles.push({
      title: 'React Best Practices',
      description: [
        '- Use functional components and hooks exclusively',
        '- Follow the Rules of Hooks (only call hooks at top level)',
        '- Implement proper component memoization (React.memo, useMemo, useCallback) where needed',
        '- Keep components small and focused on a single responsibility',
        '- Use TypeScript for all React components with proper prop types'
      ].join('\n')
    });
  }

  // TypeScript-specific principles
  const tsFramework = techStack.frameworks.find(f => f.name === 'typescript');
  if (tsFramework !== undefined) {
    principles.push({
      title: 'TypeScript Guidelines',
      description: [
        '- Maintain strict TypeScript configuration',
        '- Define interfaces for all data structures',
        '- Use type guards for runtime type checking',
        '- Avoid "any" type; use "unknown" and narrow types when needed',
        '- Export types/interfaces alongside implementation'
      ].join('\n')
    });
  }

  // Testing principles
  const testingFramework = techStack.frameworks.find(f => f.category === 'testing');
  if (testingFramework !== undefined) {
    principles.push({
      title: 'Testing Standards',
      description: [
        `- Write tests using ${formatFrameworkName(testingFramework.name)}`,
        '- Maintain minimum 80% code coverage for critical paths',
        '- Test behavior, not implementation details',
        '- Include unit tests, integration tests, and end-to-end tests as appropriate',
        '- Ensure all tests pass before merging to main branch'
      ].join('\n')
    });
  }

  // If no specific principles generated, add a placeholder
  if (principles.length === 0) {
    principles.push({
      title: 'Technology-Specific Guidelines',
      description:
        '<!-- Add principles specific to your detected technology stack -->\n\n' +
        '[PRINCIPLE_CONTENT - Define coding standards, patterns, and best practices for your stack]'
    });
  }

  return principles;
}

/**
 * Display technology stack summary to console
 * @param {Object} techStack - Detected technology stack
 */
export function displayTechStackSummary(techStack) {
  if (techStack.packageJson !== null) {
    console.log(chalk.cyan('   📦 Package:'), chalk.white(`${techStack.packageJson.name} v${techStack.packageJson.version}`));
  }

  if (techStack.frameworks.length > 0 || techStack.languages.length > 0 || techStack.buildTools.length > 0) {
    console.log(chalk.cyan('   🔧 Tech Stack:'));

    // Show primary language
    const primaryLang = techStack.languages.find(l => l.primary);
    if (primaryLang !== undefined) {
      console.log(chalk.white(`      • ${primaryLang.name} (primary language)`));
    }

    // Show high-confidence frameworks
    const highConfidenceFrameworks = techStack.frameworks
      .filter(f => f.confidence === 'high')
      .slice(0, 3); // Limit to top 3

    for (const framework of highConfidenceFrameworks) {
      const categoryLabel = formatCategoryTitle(framework.category);
      console.log(chalk.white(`      • ${formatFrameworkName(framework.name)} ${framework.version} (${categoryLabel})`));
    }

    // Show build tools
    for (const tool of techStack.buildTools.slice(0, 2)) {
      console.log(chalk.white(`      • ${formatFrameworkName(tool.name)} (build tool)`));
    }
  }

  if (techStack.projectStructure.type !== 'unknown') {
    console.log(chalk.cyan('   📁 Project Type:'), chalk.white(formatProjectType(techStack.projectStructure.type)));
  }

  if (techStack.projectStructure.directories.length > 0) {
    const keyDirs = techStack.projectStructure.directories
      .filter(d => ['src', 'app', 'pages', 'components', 'server', 'api', 'backend', 'frontend'].includes(d))
      .slice(0, 4);

    if (keyDirs.length > 0) {
      console.log(chalk.cyan('   📂 Structure:'), chalk.white(`${keyDirs.join('/, ')}/`));
    }
  }

  console.log('');
}
