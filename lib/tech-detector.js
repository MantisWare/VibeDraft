import fs from 'fs-extra';
import path from 'path';

/**
 * Framework detection patterns
 */
const FRAMEWORK_PATTERNS = {
  // Frontend Frameworks
  react: {
    dependencies: ['react', 'react-dom'],
    files: ['src/App.jsx', 'src/App.js', 'src/App.tsx'],
    directories: ['src/components'],
    category: 'frontend'
  },
  nextjs: {
    dependencies: ['next'],
    files: ['next.config.js', 'next.config.mjs', 'next.config.ts'],
    directories: ['pages', 'app'],
    category: 'frontend'
  },
  vue: {
    dependencies: ['vue'],
    files: ['src/App.vue', 'vite.config.js'],
    directories: ['src/components'],
    category: 'frontend'
  },
  angular: {
    dependencies: ['@angular/core'],
    files: ['angular.json'],
    directories: ['src/app'],
    category: 'frontend'
  },
  svelte: {
    dependencies: ['svelte'],
    files: ['svelte.config.js'],
    directories: ['src'],
    category: 'frontend'
  },
  
  // Backend Frameworks
  express: {
    dependencies: ['express'],
    files: ['server.js', 'app.js'],
    directories: ['routes', 'middleware'],
    category: 'backend'
  },
  nestjs: {
    dependencies: ['@nestjs/core'],
    files: ['nest-cli.json'],
    directories: ['src/modules'],
    category: 'backend'
  },
  fastify: {
    dependencies: ['fastify'],
    files: ['server.js'],
    directories: ['routes'],
    category: 'backend'
  },
  koa: {
    dependencies: ['koa'],
    files: ['app.js'],
    directories: ['routes'],
    category: 'backend'
  },
  
  // Build Tools
  vite: {
    dependencies: ['vite'],
    files: ['vite.config.js', 'vite.config.ts', 'vite.config.mjs'],
    directories: [],
    category: 'build'
  },
  webpack: {
    dependencies: ['webpack'],
    files: ['webpack.config.js', 'webpack.config.ts'],
    directories: [],
    category: 'build'
  },
  
  // Testing Frameworks
  jest: {
    dependencies: ['jest', '@jest/core'],
    files: ['jest.config.js', 'jest.config.ts'],
    directories: ['__tests__'],
    category: 'testing'
  },
  vitest: {
    dependencies: ['vitest'],
    files: ['vitest.config.js', 'vitest.config.ts'],
    directories: [],
    category: 'testing'
  },
  mocha: {
    dependencies: ['mocha'],
    files: ['.mocharc.json', '.mocharc.js'],
    directories: ['test'],
    category: 'testing'
  },
  
  // Mobile
  'react-native': {
    dependencies: ['react-native'],
    files: ['app.json', 'metro.config.js'],
    directories: ['android', 'ios'],
    category: 'mobile'
  }
};

/**
 * Language file extension patterns
 */
const LANGUAGE_PATTERNS = {
  typescript: { extensions: ['.ts', '.tsx'], name: 'TypeScript' },
  javascript: { extensions: ['.js', '.jsx', '.mjs', '.cjs'], name: 'JavaScript' },
  python: { extensions: ['.py'], name: 'Python' },
  rust: { extensions: ['.rs'], name: 'Rust' },
  go: { extensions: ['.go'], name: 'Go' },
  swift: { extensions: ['.swift'], name: 'Swift' },
  kotlin: { extensions: ['.kt', '.kts'], name: 'Kotlin' },
  java: { extensions: ['.java'], name: 'Java' },
  php: { extensions: ['.php'], name: 'PHP' },
  ruby: { extensions: ['.rb'], name: 'Ruby' }
};

/**
 * Build tool detection patterns
 */
const BUILD_TOOL_PATTERNS = {
  vite: { configFile: 'vite.config.js', purpose: 'Fast build tool for modern web projects' },
  webpack: { configFile: 'webpack.config.js', purpose: 'Module bundler' },
  rollup: { configFile: 'rollup.config.js', purpose: 'Module bundler for libraries' },
  esbuild: { configFile: 'esbuild.config.js', purpose: 'Extremely fast bundler' },
  parcel: { configFile: '.parcelrc', purpose: 'Zero-config bundler' },
  turbo: { configFile: 'turbo.json', purpose: 'High-performance build system for monorepos' },
  nx: { configFile: 'nx.json', purpose: 'Smart monorepo build system' }
};

/**
 * Directories to exclude from scanning
 */
const EXCLUDED_DIRS = new Set([
  'node_modules',
  '.git',
  'dist',
  'build',
  'coverage',
  '.next',
  '.nuxt',
  '.output',
  '.cache',
  '.turbo',
  '.parcel-cache',
  'out',
  'public',
  'static',
  'assets'
]);

/**
 * Maximum files to scan for performance
 */
const MAX_FILES_TO_SCAN = 1000;

/**
 * Main entry point: Detect technology stack from a project directory
 * @param {string} projectPath - Path to the project directory
 * @returns {Promise<TechStackDetection>}
 */
export async function detectTechnologyStack(projectPath) {
  try {
    // Check if directory exists
    if (!(await fs.pathExists(projectPath))) {
      return createEmptyDetection();
    }

    // Check if there are files in the directory
    const items = await fs.readdir(projectPath);
    if (items.length === 0) {
      return createEmptyDetection();
    }

    // Analyze package.json if it exists
    const packageJsonPath = path.join(projectPath, 'package.json');
    let packageInfo = null;
    if (await fs.pathExists(packageJsonPath)) {
      packageInfo = await analyzePackageJson(packageJsonPath);
    }

    // Detect project structure
    const structureInfo = await detectProjectStructure(projectPath);

    // Detect frameworks
    const frameworks = await detectFrameworks(projectPath, packageInfo, structureInfo);

    // Detect languages
    const languages = await detectLanguages(projectPath);

    // Detect build tools
    const buildTools = await detectBuildTools(projectPath, packageInfo);

    // Detect package manager
    const packageManager = await detectPackageManager(projectPath);

    // Determine if this is an existing app (has package.json or recognizable structure)
    const hasExistingApp = packageInfo !== null || frameworks.length > 0 || languages.length > 0;

    return {
      hasExistingApp,
      detectedAt: new Date().toISOString(),
      packageJson: packageInfo,
      projectStructure: structureInfo,
      frameworks,
      languages,
      buildTools,
      packageManager
    };
  } catch (error) {
    console.error(`Error detecting technology stack: ${error.message}`);
    return createEmptyDetection();
  }
}

/**
 * Create an empty detection result
 */
function createEmptyDetection() {
  return {
    hasExistingApp: false,
    detectedAt: new Date().toISOString(),
    packageJson: null,
    projectStructure: {
      type: 'unknown',
      hasBackend: false,
      hasFrontend: false,
      directories: [],
      keyFiles: []
    },
    frameworks: [],
    languages: [],
    buildTools: [],
    packageManager: 'unknown'
  };
}

/**
 * Analyze package.json file
 * @param {string} packagePath - Path to package.json
 * @returns {Promise<Object|null>}
 */
export async function analyzePackageJson(packagePath) {
  try {
    const content = await fs.readFile(packagePath, 'utf8');
    const pkg = JSON.parse(content);

    return {
      name: pkg.name ?? 'unknown',
      version: pkg.version ?? '0.0.0',
      type: pkg.type ?? 'commonjs',
      engines: pkg.engines ?? {},
      dependencies: pkg.dependencies ?? {},
      devDependencies: pkg.devDependencies ?? {},
      scripts: pkg.scripts ?? {},
      workspaces: pkg.workspaces ?? null
    };
  } catch (error) {
    console.error(`Error reading package.json: ${error.message}`);
    return null;
  }
}

/**
 * Detect project structure
 * @param {string} projectPath - Path to the project directory
 * @returns {Promise<Object>}
 */
export async function detectProjectStructure(projectPath) {
  const directories = [];
  const keyFiles = [];

  try {
    const items = await fs.readdir(projectPath, { withFileTypes: true });

    for (const item of items) {
      if (item.isDirectory() && !EXCLUDED_DIRS.has(item.name)) {
        directories.push(item.name);
      } else if (item.isFile()) {
        keyFiles.push(item.name);
      }
    }

    // Detect project type based on structure
    const hasBackend = directories.some(d =>
      ['server', 'backend', 'api', 'services'].includes(d.toLowerCase())
    );
    const hasFrontend = directories.some(d =>
      ['client', 'frontend', 'web', 'app', 'src'].includes(d.toLowerCase())
    );

    // Check for monorepo indicators
    const isMonorepo =
      keyFiles.includes('lerna.json') ||
      keyFiles.includes('pnpm-workspace.yaml') ||
      keyFiles.includes('rush.json') ||
      directories.includes('packages') ||
      directories.includes('apps');

    // Check for mobile indicators
    const isMobile =
      directories.includes('ios') ||
      directories.includes('android') ||
      keyFiles.includes('app.json');

    // Determine project type
    let projectType = 'unknown';
    if (isMonorepo) {
      projectType = 'monorepo';
    } else if (isMobile) {
      projectType = 'mobile';
    } else if (hasBackend && hasFrontend) {
      projectType = 'fullstack';
    } else if (hasFrontend || directories.includes('src')) {
      projectType = 'web-app';
    } else if (hasBackend) {
      projectType = 'api';
    } else if (keyFiles.includes('package.json')) {
      projectType = 'library';
    }

    return {
      type: projectType,
      hasBackend,
      hasFrontend,
      directories,
      keyFiles
    };
  } catch (error) {
    console.error(`Error detecting project structure: ${error.message}`);
    return {
      type: 'unknown',
      hasBackend: false,
      hasFrontend: false,
      directories: [],
      keyFiles: []
    };
  }
}

/**
 * Detect frameworks used in the project
 * @param {string} projectPath - Path to the project directory
 * @param {Object|null} packageInfo - Parsed package.json info
 * @param {Object} structureInfo - Project structure info
 * @returns {Promise<Array>}
 */
export async function detectFrameworks(projectPath, packageInfo, structureInfo) {
  const detected = [];

  if (packageInfo === null) {
    return detected;
  }

  const allDeps = {
    ...packageInfo.dependencies,
    ...packageInfo.devDependencies
  };

  // Check each framework pattern
  for (const [frameworkKey, pattern] of Object.entries(FRAMEWORK_PATTERNS)) {
    let confidence = 'low';

    // Check if dependencies match
    const hasDependency = pattern.dependencies.some(dep => dep in allDeps);

    if (!hasDependency) {
      continue;
    }

    confidence = 'medium';

    // Check for config files
    const hasConfigFile = await Promise.all(
      pattern.files.map(file => fs.pathExists(path.join(projectPath, file)))
    ).then(results => results.some(exists => exists));

    if (hasConfigFile) {
      confidence = 'high';
    }

    // Check for directories
    const hasDirectory = pattern.directories.some(dir =>
      structureInfo.directories.includes(dir)
    );

    if (hasDirectory) {
      confidence = 'high';
    }

    // Get version from dependencies
    const depKey = pattern.dependencies.find(dep => dep in allDeps);
    const version = depKey !== undefined ? allDeps[depKey] : 'unknown';

    detected.push({
      name: frameworkKey,
      version,
      category: pattern.category,
      confidence
    });
  }

  // Special case: TypeScript
  if ('typescript' in allDeps) {
    const hasConfig = await fs.pathExists(path.join(projectPath, 'tsconfig.json'));
    detected.push({
      name: 'typescript',
      version: allDeps.typescript,
      category: 'language',
      confidence: hasConfig ? 'high' : 'medium'
    });
  }

  return detected;
}

/**
 * Detect programming languages used in the project
 * @param {string} projectPath - Path to the project directory
 * @returns {Promise<Array>}
 */
export async function detectLanguages(projectPath) {
  const languageCounts = {};

  // Initialize counts
  for (const lang of Object.keys(LANGUAGE_PATTERNS)) {
    languageCounts[lang] = 0;
  }

  let totalFiles = 0;

  /**
   * Recursively scan directory for file extensions
   */
  async function scanDirectory(dirPath, depth = 0) {
    // Limit depth to avoid deep recursion
    if (depth > 5 || totalFiles >= MAX_FILES_TO_SCAN) {
      return;
    }

    try {
      const items = await fs.readdir(dirPath, { withFileTypes: true });

      for (const item of items) {
        if (totalFiles >= MAX_FILES_TO_SCAN) {
          break;
        }

        const itemPath = path.join(dirPath, item.name);

        if (item.isDirectory()) {
          if (!EXCLUDED_DIRS.has(item.name)) {
            await scanDirectory(itemPath, depth + 1);
          }
        } else if (item.isFile()) {
          totalFiles++;
          const ext = path.extname(item.name);

          // Check each language pattern
          for (const [lang, pattern] of Object.entries(LANGUAGE_PATTERNS)) {
            if (pattern.extensions.includes(ext)) {
              languageCounts[lang]++;
            }
          }
        }
      }
    } catch (error) {
      // Skip directories we can't read
    }
  }

  await scanDirectory(projectPath);

  // Convert counts to language info
  const languages = [];
  const totalLanguageFiles = Object.values(languageCounts).reduce((sum, count) => sum + count, 0);

  for (const [lang, count] of Object.entries(languageCounts)) {
    if (count > 0) {
      const pattern = LANGUAGE_PATTERNS[lang];
      languages.push({
        name: pattern.name,
        extensions: pattern.extensions,
        fileCount: count,
        primary: count > totalLanguageFiles * 0.3 // Primary if >30% of files
      });
    }
  }

  // Sort by file count (descending)
  languages.sort((a, b) => b.fileCount - a.fileCount);

  return languages;
}

/**
 * Detect build tools used in the project
 * @param {string} projectPath - Path to the project directory
 * @param {Object|null} packageInfo - Parsed package.json info
 * @returns {Promise<Array>}
 */
export async function detectBuildTools(projectPath, packageInfo) {
  const detected = [];

  // Check for build tool config files
  for (const [toolName, toolInfo] of Object.entries(BUILD_TOOL_PATTERNS)) {
    const configPath = path.join(projectPath, toolInfo.configFile);
    if (await fs.pathExists(configPath)) {
      detected.push({
        name: toolName,
        configFile: toolInfo.configFile,
        purpose: toolInfo.purpose
      });
    }
  }

  // Also check dependencies
  if (packageInfo !== null) {
    const allDeps = {
      ...packageInfo.dependencies,
      ...packageInfo.devDependencies
    };

    const buildToolDeps = ['vite', 'webpack', 'rollup', 'esbuild', 'parcel', 'turbo', 'nx'];

    for (const tool of buildToolDeps) {
      if (tool in allDeps && !detected.some(d => d.name === tool)) {
        const toolInfo = BUILD_TOOL_PATTERNS[tool];
        if (toolInfo !== undefined) {
          detected.push({
            name: tool,
            configFile: toolInfo.configFile,
            purpose: toolInfo.purpose
          });
        }
      }
    }
  }

  return detected;
}

/**
 * Detect package manager used in the project
 * @param {string} projectPath - Path to the project directory
 * @returns {Promise<string>}
 */
export async function detectPackageManager(projectPath) {
  // Check for lock files
  if (await fs.pathExists(path.join(projectPath, 'pnpm-lock.yaml'))) {
    return 'pnpm';
  }
  if (await fs.pathExists(path.join(projectPath, 'yarn.lock'))) {
    return 'yarn';
  }
  if (await fs.pathExists(path.join(projectPath, 'package-lock.json'))) {
    return 'npm';
  }

  return 'unknown';
}

