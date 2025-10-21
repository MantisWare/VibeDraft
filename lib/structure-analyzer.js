import fs from 'fs-extra';
import path from 'path';

/**
 * Directories to exclude from analysis
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
  'vendor',
  '__pycache__',
  '.pytest_cache',
  '.venv',
  'venv'
]);

/**
 * Common project directory patterns
 */
const DIRECTORY_PATTERNS = {
  // Source directories
  src: { type: 'source', purpose: 'Main source code' },
  lib: { type: 'source', purpose: 'Library code' },
  app: { type: 'source', purpose: 'Application code' },

  // Component directories
  components: { type: 'components', purpose: 'Reusable UI components' },
  pages: { type: 'routing', purpose: 'Page components' },
  views: { type: 'routing', purpose: 'View components' },
  screens: { type: 'routing', purpose: 'Screen components (mobile)' },
  routes: { type: 'routing', purpose: 'Route handlers' },

  // Business logic
  services: { type: 'services', purpose: 'Business logic services' },
  api: { type: 'services', purpose: 'API layer' },
  controllers: { type: 'services', purpose: 'Controllers' },
  handlers: { type: 'services', purpose: 'Request handlers' },
  models: { type: 'data', purpose: 'Data models' },
  schemas: { type: 'data', purpose: 'Data schemas' },
  entities: { type: 'data', purpose: 'Domain entities' },

  // State management
  store: { type: 'state', purpose: 'State management' },
  redux: { type: 'state', purpose: 'Redux state' },
  reducers: { type: 'state', purpose: 'Redux reducers' },
  actions: { type: 'state', purpose: 'Redux actions' },

  // Utilities
  utils: { type: 'utilities', purpose: 'Utility functions' },
  helpers: { type: 'utilities', purpose: 'Helper functions' },
  hooks: { type: 'utilities', purpose: 'Custom React hooks' },

  // Configuration
  config: { type: 'configuration', purpose: 'Configuration files' },
  constants: { type: 'configuration', purpose: 'Constants' },

  // Testing
  test: { type: 'testing', purpose: 'Test files' },
  tests: { type: 'testing', purpose: 'Test files' },
  __tests__: { type: 'testing', purpose: 'Jest tests' },
  spec: { type: 'testing', purpose: 'Spec files' },

  // Documentation
  docs: { type: 'documentation', purpose: 'Documentation' },
  documentation: { type: 'documentation', purpose: 'Documentation' },

  // Assets
  assets: { type: 'assets', purpose: 'Static assets' },
  images: { type: 'assets', purpose: 'Images' },
  styles: { type: 'styles', purpose: 'Stylesheets' },
  css: { type: 'styles', purpose: 'CSS files' },
  scss: { type: 'styles', purpose: 'SCSS files' },

  // Backend specific
  middleware: { type: 'backend', purpose: 'Middleware' },
  database: { type: 'backend', purpose: 'Database layer' },
  migrations: { type: 'backend', purpose: 'Database migrations' },

  // Mobile specific
  android: { type: 'mobile', purpose: 'Android native code' },
  ios: { type: 'mobile', purpose: 'iOS native code' }
};

/**
 * Analyze project directory structure
 * @param {string} projectPath - Path to the project directory
 * @returns {Promise<Object>} Structure analysis results
 */
export async function analyzeProjectStructure(projectPath) {
  try {
    const analysis = {
      directories: [],
      organizedByType: {},
      entryPoints: [],
      depth: 0,
      fileCount: 0,
      directoryCount: 0,
      patterns: []
    };

    // Scan the directory structure
    await scanDirectory(projectPath, projectPath, analysis, 0);

    // Categorize directories
    analysis.organizedByType = categorizeDirs(analysis.directories);

    // Detect entry points
    analysis.entryPoints = await detectEntryPoints(projectPath);

    // Identify architectural patterns
    analysis.patterns = identifyPatterns(analysis.directories, analysis.entryPoints);

    return analysis;
  } catch (error) {
    console.error(`Error analyzing project structure: ${error.message}`);
    return createEmptyAnalysis();
  }
}

/**
 * Recursively scan directory structure
 */
async function scanDirectory(basePath, currentPath, analysis, depth) {
  if (depth > 6) return; // Limit recursion depth

  try {
    const items = await fs.readdir(currentPath, { withFileTypes: true });

    for (const item of items) {
      const itemPath = path.join(currentPath, item.name);
      const relativePath = path.relative(basePath, itemPath);

      if (item.isDirectory()) {
        if (!EXCLUDED_DIRS.has(item.name) && !item.name.startsWith('.')) {
          analysis.directoryCount++;
          analysis.directories.push({
            name: item.name,
            path: relativePath,
            depth
          });

          // Update max depth
          if (depth > analysis.depth) {
            analysis.depth = depth;
          }

          await scanDirectory(basePath, itemPath, analysis, depth + 1);
        }
      } else if (item.isFile()) {
        analysis.fileCount++;
      }
    }
  } catch {
    // Skip directories we can't read
  }
}

/**
 * Categorize directories by type
 */
function categorizeDirs(directories) {
  const categorized = {};

  for (const dir of directories) {
    const dirName = dir.name.toLowerCase();
    const pattern = DIRECTORY_PATTERNS[dirName];

    if (pattern !== undefined) {
      if (categorized[pattern.type] === undefined) {
        categorized[pattern.type] = [];
      }

      categorized[pattern.type].push({
        name: dir.name,
        path: dir.path,
        purpose: pattern.purpose
      });
    }
  }

  return categorized;
}

/**
 * Detect potential entry points
 */
async function detectEntryPoints(projectPath) {
  const entryPoints = [];

  const commonEntryPoints = [
    // JavaScript/TypeScript
    { file: 'index.js', type: 'javascript' },
    { file: 'index.ts', type: 'typescript' },
    { file: 'main.js', type: 'javascript' },
    { file: 'main.ts', type: 'typescript' },
    { file: 'app.js', type: 'javascript' },
    { file: 'app.ts', type: 'typescript' },
    { file: 'server.js', type: 'backend' },
    { file: 'server.ts', type: 'backend' },

    // Frontend specific
    { file: 'src/index.js', type: 'frontend' },
    { file: 'src/index.ts', type: 'frontend' },
    { file: 'src/index.tsx', type: 'frontend' },
    { file: 'src/App.js', type: 'frontend' },
    { file: 'src/App.jsx', type: 'frontend' },
    { file: 'src/App.tsx', type: 'frontend' },
    { file: 'src/main.ts', type: 'frontend' },

    // Next.js
    { file: 'pages/_app.js', type: 'nextjs' },
    { file: 'pages/_app.tsx', type: 'nextjs' },
    { file: 'app/layout.tsx', type: 'nextjs' },

    // Python
    { file: 'main.py', type: 'python' },
    { file: 'app.py', type: 'python' },
    { file: '__main__.py', type: 'python' },

    // Go
    { file: 'main.go', type: 'go' },

    // Rust
    { file: 'main.rs', type: 'rust' },
    { file: 'src/main.rs', type: 'rust' }
  ];

  for (const entry of commonEntryPoints) {
    const entryPath = path.join(projectPath, entry.file);
    if (await fs.pathExists(entryPath)) {
      entryPoints.push({
        file: entry.file,
        type: entry.type,
        exists: true
      });
    }
  }

  return entryPoints;
}

/**
 * Identify architectural patterns from structure
 */
function identifyPatterns(directories, entryPoints) {
  const patterns = [];
  const dirNames = new Set(directories.map(d => d.name.toLowerCase()));

  // MVC pattern
  if (dirNames.has('models') && dirNames.has('views') && dirNames.has('controllers')) {
    patterns.push({
      name: 'MVC',
      confidence: 'high',
      description: 'Model-View-Controller architecture detected'
    });
  }

  // Component-based (React/Vue/etc.)
  if (dirNames.has('components')) {
    patterns.push({
      name: 'Component-Based',
      confidence: 'high',
      description: 'Component-based architecture'
    });
  }

  // Feature-based organization
  if (dirNames.has('features')) {
    patterns.push({
      name: 'Feature-Based',
      confidence: 'high',
      description: 'Feature-based code organization'
    });
  }

  // Layered architecture
  const hasLayers = dirNames.has('services') &&
                    (dirNames.has('models') || dirNames.has('repositories'));
  if (hasLayers) {
    patterns.push({
      name: 'Layered',
      confidence: 'medium',
      description: 'Layered architecture with separation of concerns'
    });
  }

  // Redux pattern
  if (dirNames.has('reducers') || dirNames.has('actions') || dirNames.has('store')) {
    patterns.push({
      name: 'Redux',
      confidence: 'high',
      description: 'Redux state management pattern'
    });
  }

  // API-based
  if (dirNames.has('api') || dirNames.has('routes')) {
    patterns.push({
      name: 'API-Driven',
      confidence: 'medium',
      description: 'API-driven architecture'
    });
  }

  // Monorepo
  if (dirNames.has('packages') || dirNames.has('apps')) {
    patterns.push({
      name: 'Monorepo',
      confidence: 'high',
      description: 'Monorepo structure with multiple packages/apps'
    });
  }

  // Next.js app router
  const hasNextAppRouter = entryPoints.some(e => e.file === 'app/layout.tsx');
  if (hasNextAppRouter) {
    patterns.push({
      name: 'Next.js App Router',
      confidence: 'high',
      description: 'Next.js 13+ App Router architecture'
    });
  }

  // Next.js pages router
  const hasNextPagesRouter = entryPoints.some(e => e.file.startsWith('pages/'));
  if (hasNextPagesRouter && !hasNextAppRouter) {
    patterns.push({
      name: 'Next.js Pages Router',
      confidence: 'high',
      description: 'Next.js Pages Router architecture'
    });
  }

  return patterns;
}

/**
 * Create empty analysis result
 */
function createEmptyAnalysis() {
  return {
    directories: [],
    organizedByType: {},
    entryPoints: [],
    depth: 0,
    fileCount: 0,
    directoryCount: 0,
    patterns: []
  };
}

/**
 * Generate human-readable summary of structure
 */
export function generateStructureSummary(analysis) {
  const lines = [];

  lines.push('## Project Structure');
  lines.push('');
  lines.push(`- **Total Files**: ${analysis.fileCount}`);
  lines.push(`- **Total Directories**: ${analysis.directoryCount}`);
  lines.push(`- **Maximum Depth**: ${analysis.depth} levels`);
  lines.push('');

  if (analysis.entryPoints.length > 0) {
    lines.push('### Entry Points');
    for (const entry of analysis.entryPoints) {
      lines.push(`- \`${entry.file}\` (${entry.type})`);
    }
    lines.push('');
  }

  if (analysis.patterns.length > 0) {
    lines.push('### Architectural Patterns');
    for (const pattern of analysis.patterns) {
      lines.push(`- **${pattern.name}**: ${pattern.description} (confidence: ${pattern.confidence})`);
    }
    lines.push('');
  }

  if (Object.keys(analysis.organizedByType).length > 0) {
    lines.push('### Directory Organization');
    for (const [type, dirs] of Object.entries(analysis.organizedByType)) {
      lines.push(`- **${type}**: ${dirs.map(d => `\`${d.name}\``).join(', ')}`);
    }
    lines.push('');
  }

  return lines.join('\n');
}
