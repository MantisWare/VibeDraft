import fs from 'fs-extra';
import path from 'path';

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
  'vendor',
  '__pycache__',
  '.pytest_cache',
  '.venv',
  'venv'
]);

/**
 * File patterns to look for
 */
const FILE_PATTERNS = {
  // React patterns
  reactComponent: {
    extensions: ['.jsx', '.tsx'],
    indicators: ['React.', 'useState', 'useEffect', 'Component'],
    pattern: 'React Components'
  },
  reactHooks: {
    extensions: ['.js', '.ts', '.jsx', '.tsx'],
    indicators: ['use', 'useState', 'useEffect', 'useContext', 'useMemo', 'useCallback'],
    pattern: 'React Hooks'
  },

  // State management
  redux: {
    extensions: ['.js', '.ts'],
    indicators: ['createSlice', 'createAction', 'configureStore', 'useSelector', 'useDispatch'],
    pattern: 'Redux Toolkit'
  },
  zustand: {
    extensions: ['.js', '.ts'],
    indicators: ['create(', 'zustand'],
    pattern: 'Zustand State Management'
  },

  // API patterns
  apiRoutes: {
    extensions: ['.js', '.ts'],
    indicators: ['router.', 'app.get', 'app.post', 'express.Router', 'fastify.'],
    pattern: 'REST API Routes'
  },
  graphql: {
    extensions: ['.js', '.ts', '.graphql', '.gql'],
    indicators: ['gql`', 'GraphQL', 'useQuery', 'useMutation', 'resolver'],
    pattern: 'GraphQL'
  },

  // Testing patterns
  jest: {
    extensions: ['.test.js', '.test.ts', '.spec.js', '.spec.ts'],
    indicators: ['describe(', 'test(', 'it(', 'expect('],
    pattern: 'Jest Tests'
  },
  cypress: {
    extensions: ['.cy.js', '.cy.ts'],
    indicators: ['cy.', 'cypress'],
    pattern: 'Cypress E2E Tests'
  },

  // TypeScript patterns
  typescript: {
    extensions: ['.ts', '.tsx'],
    indicators: ['interface ', 'type ', ': ', 'enum '],
    pattern: 'TypeScript'
  },

  // CSS patterns
  cssModules: {
    extensions: ['.module.css', '.module.scss'],
    indicators: [],
    pattern: 'CSS Modules'
  },
  styledComponents: {
    extensions: ['.js', '.ts', '.jsx', '.tsx'],
    indicators: ['styled.', 'styled-components', 'css`'],
    pattern: 'Styled Components'
  },
  tailwind: {
    extensions: ['.jsx', '.tsx', '.html'],
    indicators: ['className="', 'className={'],
    pattern: 'Tailwind CSS'
  }
};

/**
 * Coding patterns to detect from content
 */
const CODING_PATTERNS = {
  asyncAwait: {
    regex: /async\s+.*?\s*\(|await\s+/,
    name: 'Async/Await',
    description: 'Modern asynchronous JavaScript patterns'
  },
  arrowFunctions: {
    regex: /=>\s*{|=>\s*\(/,
    name: 'Arrow Functions',
    description: 'ES6 arrow function syntax'
  },
  destructuring: {
    regex: /const\s*{.*?}\s*=/,
    name: 'Destructuring',
    description: 'ES6 destructuring assignment'
  },
  spreadOperator: {
    regex: /\.\.\.[\w]+/,
    name: 'Spread Operator',
    description: 'ES6 spread syntax'
  },
  optionalChaining: {
    regex: /\?\./,
    name: 'Optional Chaining',
    description: 'Optional chaining operator'
  },
  nullishCoalescing: {
    regex: /\?\?/,
    name: 'Nullish Coalescing',
    description: 'Nullish coalescing operator'
  },
  templateLiterals: {
    regex: /`.*?\$\{.*?\}.*?`/,
    name: 'Template Literals',
    description: 'Template literal strings'
  }
};

/**
 * Maximum files to scan for performance
 */
const MAX_FILES_TO_SCAN = 500;

/**
 * Detect patterns in the codebase
 * @param {string} projectPath - Path to the project directory
 * @returns {Promise<Object>} Pattern detection results
 */
export async function detectPatterns(projectPath) {
  try {
    const results = {
      frameworkPatterns: [],
      codingPatterns: [],
      filePatterns: {},
      sampleFiles: {},
      confidence: {}
    };

    const scannedFiles = 0;

    // Initialize file pattern counters
    for (const patternKey of Object.keys(FILE_PATTERNS)) {
      results.filePatterns[patternKey] = 0;
      results.sampleFiles[patternKey] = [];
    }

    // Initialize coding pattern counters
    const codingPatternCounts = {};
    for (const patternKey of Object.keys(CODING_PATTERNS)) {
      codingPatternCounts[patternKey] = 0;
    }

    // Scan the project
    await scanForPatterns(projectPath, projectPath, results, codingPatternCounts, scannedFiles);

    // Analyze results and determine patterns
    analyzeFilePatterns(results);
    analyzeCodingPatterns(results, codingPatternCounts, scannedFiles);

    return results;
  } catch (error) {
    console.error(`Error detecting patterns: ${error.message}`);
    return createEmptyPatternResults();
  }
}

/**
 * Recursively scan for patterns
 */
async function scanForPatterns(basePath, currentPath, results, codingPatternCounts, scannedFiles, depth = 0) {
  if (depth > 6 || scannedFiles >= MAX_FILES_TO_SCAN) return scannedFiles;

  try {
    const items = await fs.readdir(currentPath, { withFileTypes: true });

    for (const item of items) {
      if (scannedFiles >= MAX_FILES_TO_SCAN) break;

      const itemPath = path.join(currentPath, item.name);

      if (item.isDirectory()) {
        if (!EXCLUDED_DIRS.has(item.name) && !item.name.startsWith('.')) {
          scannedFiles = await scanForPatterns(basePath, itemPath, results, codingPatternCounts, scannedFiles, depth + 1);
        }
      } else if (item.isFile()) {
        await analyzeFile(itemPath, basePath, results, codingPatternCounts);
        scannedFiles++;
      }
    }
  } catch {
    // Skip directories/files we can't read
  }

  return scannedFiles;
}

/**
 * Analyze a single file for patterns
 */
async function analyzeFile(filePath, basePath, results, codingPatternCounts) {
  const ext = path.extname(filePath);
  const fileName = path.basename(filePath);
  const relativePath = path.relative(basePath, filePath);

  // Check file patterns by extension
  for (const [patternKey, pattern] of Object.entries(FILE_PATTERNS)) {
    const matchesExtension = pattern.extensions.some(pext =>
      fileName.endsWith(pext) || ext === pext
    );

    if (matchesExtension) {
      results.filePatterns[patternKey]++;

      // Store sample files (max 3 per pattern)
      if (results.sampleFiles[patternKey].length < 3) {
        results.sampleFiles[patternKey].push(relativePath);
      }

      // For files with indicators, check content
      if (pattern.indicators.length > 0) {
        try {
          const content = await fs.readFile(filePath, 'utf8');
          const hasIndicators = pattern.indicators.some(indicator =>
            content.includes(indicator)
          );

          if (!hasIndicators) {
            results.filePatterns[patternKey]--;
          }
        } catch {
          // Skip files we can't read
        }
      }
    }
  }

  // Check coding patterns in source files
  const isSourceFile = ['.js', '.ts', '.jsx', '.tsx', '.py', '.go', '.rs'].includes(ext);
  if (isSourceFile) {
    try {
      const content = await fs.readFile(filePath, 'utf8');

      for (const [patternKey, pattern] of Object.entries(CODING_PATTERNS)) {
        if (pattern.regex.test(content)) {
          codingPatternCounts[patternKey]++;
        }
      }
    } catch {
      // Skip files we can't read
    }
  }
}

/**
 * Analyze file patterns and determine framework usage
 */
function analyzeFilePatterns(results) {
  for (const [patternKey, count] of Object.entries(results.filePatterns)) {
    if (count > 0) {
      const pattern = FILE_PATTERNS[patternKey];

      let confidence = 'low';
      if (count >= 10) {
        confidence = 'high';
      } else if (count >= 3) {
        confidence = 'medium';
      }

      results.frameworkPatterns.push({
        name: pattern.pattern,
        fileCount: count,
        confidence,
        examples: results.sampleFiles[patternKey]
      });

      results.confidence[patternKey] = confidence;
    }
  }

  // Sort by file count
  results.frameworkPatterns.sort((a, b) => b.fileCount - a.fileCount);
}

/**
 * Analyze coding patterns
 */
function analyzeCodingPatterns(results, codingPatternCounts, totalFiles) {
  for (const [patternKey, count] of Object.entries(codingPatternCounts)) {
    if (count > 0) {
      const pattern = CODING_PATTERNS[patternKey];
      const percentage = (count / totalFiles) * 100;

      let confidence = 'low';
      if (percentage >= 30) {
        confidence = 'high';
      } else if (percentage >= 10) {
        confidence = 'medium';
      }

      results.codingPatterns.push({
        name: pattern.name,
        description: pattern.description,
        occurrences: count,
        confidence
      });
    }
  }

  // Sort by occurrences
  results.codingPatterns.sort((a, b) => b.occurrences - a.occurrences);
}

/**
 * Create empty pattern results
 */
function createEmptyPatternResults() {
  return {
    frameworkPatterns: [],
    codingPatterns: [],
    filePatterns: {},
    sampleFiles: {},
    confidence: {}
  };
}

/**
 * Generate human-readable summary of patterns
 */
export function generatePatternSummary(patterns) {
  const lines = [];

  if (patterns.frameworkPatterns.length > 0) {
    lines.push('## Detected Framework Patterns');
    lines.push('');

    for (const pattern of patterns.frameworkPatterns) {
      lines.push(`### ${pattern.name}`);
      lines.push(`- **Files**: ${pattern.fileCount}`);
      lines.push(`- **Confidence**: ${pattern.confidence}`);

      if (pattern.examples.length > 0) {
        lines.push('- **Examples**:');
        for (const example of pattern.examples) {
          lines.push(`  - \`${example}\``);
        }
      }
      lines.push('');
    }
  }

  if (patterns.codingPatterns.length > 0) {
    lines.push('## Coding Patterns');
    lines.push('');

    for (const pattern of patterns.codingPatterns) {
      lines.push(`- **${pattern.name}**: ${pattern.description} (${pattern.occurrences} occurrences, confidence: ${pattern.confidence})`);
    }
    lines.push('');
  }

  return lines.join('\n');
}

/**
 * Extract key patterns for memory bank
 */
export function extractKeyPatterns(patterns) {
  const key = [];

  // Get high confidence framework patterns
  const highConfidence = patterns.frameworkPatterns.filter(p =>
    p.confidence === 'high'
  );

  for (const pattern of highConfidence) {
    key.push({
      type: 'framework',
      name: pattern.name,
      details: `Used in ${pattern.fileCount} files`
    });
  }

  // Get high confidence coding patterns
  const codingHigh = patterns.codingPatterns.filter(p =>
    p.confidence === 'high'
  );

  for (const pattern of codingHigh.slice(0, 5)) { // Top 5
    key.push({
      type: 'coding',
      name: pattern.name,
      details: pattern.description
    });
  }

  return key;
}
