import { describe, it, before, after } from 'node:test';
import assert from 'node:assert';
import fs from 'fs-extra';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { analyzeProjectStructure, generateStructureSummary } from '../lib/structure-analyzer.js';
import { detectPatterns, generatePatternSummary, extractKeyPatterns } from '../lib/pattern-detector.js';
import { parseDocumentation, extractProjectContext } from '../lib/docs-parser.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const testFixturesDir = path.join(rootDir, 'test-tmp', 'analyzer-fixtures');

/**
 * Create a test project structure
 */
async function createTestProject(projectPath) {
  await fs.ensureDir(projectPath);

  // Create package.json
  await fs.writeJson(path.join(projectPath, 'package.json'), {
    name: 'test-project',
    version: '1.0.0',
    description: 'A test project for analyzer testing',
    dependencies: {
      react: '^18.0.0',
      'react-dom': '^18.0.0'
    },
    devDependencies: {
      vite: '^4.0.0',
      typescript: '^5.0.0',
      jest: '^29.0.0'
    }
  });

  // Create README.md
  await fs.writeFile(
    path.join(projectPath, 'README.md'),
    `# Test Project

This is a test project for testing the analyzers.

## Features

- Feature one
- Feature two
- Feature three

## Setup

Install dependencies:

\`\`\`bash
npm install
\`\`\`

## Architecture

This project uses a component-based architecture with React.
`
  );

  // Create directory structure
  await fs.ensureDir(path.join(projectPath, 'src', 'components'));
  await fs.ensureDir(path.join(projectPath, 'src', 'services'));
  await fs.ensureDir(path.join(projectPath, 'src', 'utils'));
  await fs.ensureDir(path.join(projectPath, 'test'));

  // Create some React component files
  await fs.writeFile(
    path.join(projectPath, 'src', 'components', 'Button.tsx'),
    `import React from 'react';

export const Button = () => {
  const [count, setCount] = React.useState(0);
  
  return (
    <button onClick={() => setCount(count + 1)}>
      Count: {count}
    </button>
  );
};
`
  );

  await fs.writeFile(
    path.join(projectPath, 'src', 'App.tsx'),
    `import React from 'react';
import { Button } from './components/Button';

function App() {
  return (
    <div>
      <h1>Test App</h1>
      <Button />
    </div>
  );
}

export default App;
`
  );

  // Create utility file with modern JS patterns
  await fs.writeFile(
    path.join(projectPath, 'src', 'utils', 'helpers.ts'),
    `export const formatName = (name?: string) => name ?? 'Unknown';

export const fetchData = async (url: string) => {
  const response = await fetch(url);
  return response.json();
};

export const mergeObjects = (...objects: object[]) => ({
  ...objects.reduce((acc, obj) => ({ ...acc, ...obj }), {})
});
`
  );

  // Create test file
  await fs.writeFile(
    path.join(projectPath, 'test', 'App.test.ts'),
    `import { describe, it, expect } from '@jest/globals';

describe('App', () => {
  it('should render', () => {
    expect(true).toBe(true);
  });
});
`
  );

  // Create vite config
  await fs.writeFile(
    path.join(projectPath, 'vite.config.ts'),
    `import { defineConfig } from 'vite';

export default defineConfig({
  // config
});
`
  );

  // Create tsconfig
  await fs.writeJson(path.join(projectPath, 'tsconfig.json'), {
    compilerOptions: {
      target: 'ES2020',
      module: 'ESNext'
    }
  });
}

describe('Structure Analyzer', () => {
  let testProjectPath;

  before(async () => {
    testProjectPath = path.join(testFixturesDir, 'structure-test');
    await createTestProject(testProjectPath);
  });

  after(async () => {
    await fs.remove(testFixturesDir);
  });

  it('should analyze project structure', async () => {
    const result = await analyzeProjectStructure(testProjectPath);

    assert.ok(result, 'Analysis result should exist');
    assert.ok(Array.isArray(result.directories), 'Should have directories array');
    assert.ok(typeof result.fileCount === 'number', 'Should have file count');
    assert.ok(typeof result.directoryCount === 'number', 'Should have directory count');
  });

  it('should detect directories', async () => {
    const result = await analyzeProjectStructure(testProjectPath);

    const dirNames = result.directories.map(d => d.name);
    assert.ok(dirNames.includes('src'), 'Should detect src directory');
    assert.ok(dirNames.includes('components'), 'Should detect components directory');
    assert.ok(dirNames.includes('services'), 'Should detect services directory');
    assert.ok(dirNames.includes('utils'), 'Should detect utils directory');
  });

  it('should categorize directories by type', async () => {
    const result = await analyzeProjectStructure(testProjectPath);

    assert.ok(result.organizedByType, 'Should have organized types');
    assert.ok(result.organizedByType.components, 'Should categorize components');
    assert.ok(result.organizedByType.services, 'Should categorize services');
    assert.ok(result.organizedByType.utilities, 'Should categorize utilities');
  });

  it('should detect entry points', async () => {
    const result = await analyzeProjectStructure(testProjectPath);

    assert.ok(Array.isArray(result.entryPoints), 'Should have entry points array');
    const hasAppEntry = result.entryPoints.some(e => e.file.includes('App.tsx'));
    assert.ok(hasAppEntry, 'Should detect App.tsx as entry point');
  });

  it('should identify patterns', async () => {
    const result = await analyzeProjectStructure(testProjectPath);

    assert.ok(Array.isArray(result.patterns), 'Should have patterns array');
    const hasComponentPattern = result.patterns.some(p => p.name === 'Component-Based');
    assert.ok(hasComponentPattern, 'Should detect component-based pattern');
  });

  it('should generate structure summary', async () => {
    const result = await analyzeProjectStructure(testProjectPath);
    const summary = generateStructureSummary(result);

    assert.ok(typeof summary === 'string', 'Summary should be a string');
    assert.ok(summary.includes('Project Structure'), 'Should include structure heading');
    assert.ok(summary.includes('Total Files'), 'Should include file count');
  });

  it('should handle empty directory', async () => {
    const emptyDir = path.join(testFixturesDir, 'empty');
    await fs.ensureDir(emptyDir);

    const result = await analyzeProjectStructure(emptyDir);

    assert.ok(result, 'Should return result for empty directory');
    assert.strictEqual(result.fileCount, 0, 'File count should be 0');
    assert.strictEqual(result.directoryCount, 0, 'Directory count should be 0');
  });

  it('should handle non-existent directory', async () => {
    const nonExistent = path.join(testFixturesDir, 'does-not-exist');

    const result = await analyzeProjectStructure(nonExistent);

    assert.ok(result, 'Should return result for non-existent directory');
    assert.strictEqual(result.fileCount, 0, 'File count should be 0');
  });
});

describe('Pattern Detector', () => {
  let testProjectPath;

  before(async () => {
    testProjectPath = path.join(testFixturesDir, 'pattern-test');
    await createTestProject(testProjectPath);
  });

  after(async () => {
    await fs.remove(testFixturesDir);
  });

  it('should detect patterns in project', async () => {
    const result = await detectPatterns(testProjectPath);

    assert.ok(result, 'Result should exist');
    assert.ok(Array.isArray(result.frameworkPatterns), 'Should have framework patterns array');
    assert.ok(Array.isArray(result.codingPatterns), 'Should have coding patterns array');
  });

  it('should detect React components', async () => {
    const result = await detectPatterns(testProjectPath);

    const hasReact = result.frameworkPatterns.some(p => p.name === 'React Components');
    assert.ok(hasReact, 'Should detect React components');
  });

  it('should detect TypeScript', async () => {
    const result = await detectPatterns(testProjectPath);

    const hasTypeScript = result.frameworkPatterns.some(p => p.name === 'TypeScript');
    assert.ok(hasTypeScript, 'Should detect TypeScript');
  });

  it('should detect Jest tests', async () => {
    const result = await detectPatterns(testProjectPath);

    const hasJest = result.frameworkPatterns.some(p => p.name === 'Jest Tests');
    assert.ok(hasJest, 'Should detect Jest tests');
  });

  it('should detect coding patterns', async () => {
    const result = await detectPatterns(testProjectPath);

    assert.ok(result.codingPatterns.length > 0, 'Should detect coding patterns');

    const patternNames = result.codingPatterns.map(p => p.name);
    assert.ok(patternNames.includes('Async/Await') ||
              patternNames.includes('Arrow Functions') ||
              patternNames.includes('Nullish Coalescing'),
    'Should detect modern JS patterns');
  });

  it('should provide confidence levels', async () => {
    const result = await detectPatterns(testProjectPath);

    if (result.frameworkPatterns.length > 0) {
      const pattern = result.frameworkPatterns[0];
      assert.ok(['low', 'medium', 'high'].includes(pattern.confidence),
        'Should have valid confidence level');
    }
  });

  it('should extract key patterns', async () => {
    const result = await detectPatterns(testProjectPath);
    const keyPatterns = extractKeyPatterns(result);

    assert.ok(Array.isArray(keyPatterns), 'Should return array of key patterns');
  });

  it('should generate pattern summary', async () => {
    const result = await detectPatterns(testProjectPath);
    const summary = generatePatternSummary(result);

    assert.ok(typeof summary === 'string', 'Summary should be a string');
  });

  it('should handle empty directory', async () => {
    const emptyDir = path.join(testFixturesDir, 'empty-patterns');
    await fs.ensureDir(emptyDir);

    const result = await detectPatterns(emptyDir);

    assert.ok(result, 'Should return result');
    assert.strictEqual(result.frameworkPatterns.length, 0, 'Should have no patterns');
  });
});

describe('Documentation Parser', () => {
  let testProjectPath;

  before(async () => {
    testProjectPath = path.join(testFixturesDir, 'docs-test');
    await createTestProject(testProjectPath);
  });

  after(async () => {
    await fs.remove(testFixturesDir);
  });

  it('should parse documentation', async () => {
    const result = await parseDocumentation(testProjectPath);

    assert.ok(result, 'Result should exist');
    assert.ok(result.hasDocumentation, 'Should detect documentation');
  });

  it('should parse README', async () => {
    const result = await parseDocumentation(testProjectPath);

    assert.ok(result.readme, 'Should have README data');
    assert.ok(result.readme.description, 'Should extract description');
    assert.ok(result.readme.features, 'Should have features array');
    assert.ok(result.readme.features.length > 0, 'Should extract features');
  });

  it('should parse package.json', async () => {
    const result = await parseDocumentation(testProjectPath);

    assert.ok(result.packageJson, 'Should have package.json data');
    assert.strictEqual(result.packageJson.name, 'test-project', 'Should extract name');
    assert.strictEqual(result.packageJson.version, '1.0.0', 'Should extract version');
    assert.ok(result.packageJson.description, 'Should extract description');
  });

  it('should extract features', async () => {
    const result = await parseDocumentation(testProjectPath);

    assert.ok(result.readme.features.length === 3, 'Should extract all features');
    assert.ok(result.readme.features[0].includes('Feature one'), 'Should extract feature text');
  });

  it('should extract architecture info', async () => {
    const result = await parseDocumentation(testProjectPath);

    assert.ok(result.readme.architecture, 'Should extract architecture section');
    assert.ok(result.readme.architecture.includes('component-based'), 'Should have architecture content');
  });

  it('should extract project context', async () => {
    const result = await parseDocumentation(testProjectPath);
    const context = extractProjectContext(result);

    assert.ok(context, 'Should extract context');
    assert.strictEqual(context.name, 'test-project', 'Should have project name');
    assert.ok(context.description, 'Should have description');
    assert.ok(Array.isArray(context.features), 'Should have features array');
  });

  it('should handle missing README', async () => {
    const noReadmeDir = path.join(testFixturesDir, 'no-readme');
    await fs.ensureDir(noReadmeDir);
    await fs.writeJson(path.join(noReadmeDir, 'package.json'), {
      name: 'no-readme-project',
      version: '1.0.0'
    });

    const result = await parseDocumentation(noReadmeDir);

    assert.ok(result, 'Should return result');
    assert.strictEqual(result.readme, null, 'README should be null');
    assert.ok(result.packageJson, 'Should still parse package.json');
  });

  it('should handle project without package.json', async () => {
    const noPkgDir = path.join(testFixturesDir, 'no-package');
    await fs.ensureDir(noPkgDir);
    await fs.writeFile(
      path.join(noPkgDir, 'README.md'),
      '# Test\n\nA test project'
    );

    const result = await parseDocumentation(noPkgDir);

    assert.ok(result, 'Should return result');
    assert.ok(result.readme, 'Should parse README');
    assert.strictEqual(result.packageJson, null, 'package.json should be null');
  });

  it('should handle empty directory', async () => {
    const emptyDir = path.join(testFixturesDir, 'empty-docs');
    await fs.ensureDir(emptyDir);

    const result = await parseDocumentation(emptyDir);

    assert.ok(result, 'Should return result');
    assert.strictEqual(result.hasDocumentation, false, 'Should have no documentation');
    assert.strictEqual(result.readme, null, 'README should be null');
    assert.strictEqual(result.packageJson, null, 'package.json should be null');
  });

  it('should parse markdown sections correctly', async () => {
    const result = await parseDocumentation(testProjectPath);

    assert.ok(result.readme.sections, 'Should have sections');
    assert.ok(result.readme.sections.length > 0, 'Should parse sections');

    const headings = result.readme.sections.map(s => s.heading);
    assert.ok(headings.includes('Features'), 'Should include Features section');
    assert.ok(headings.includes('Setup'), 'Should include Setup section');
    assert.ok(headings.includes('Architecture'), 'Should include Architecture section');
  });
});

describe('Integration - Full Analysis', () => {
  let testProjectPath;

  before(async () => {
    testProjectPath = path.join(testFixturesDir, 'integration-test');
    await createTestProject(testProjectPath);
  });

  after(async () => {
    await fs.remove(testFixturesDir);
  });

  it('should perform complete analysis', async () => {
    // Run all analyzers
    const [structure, patterns, docs] = await Promise.all([
      analyzeProjectStructure(testProjectPath),
      detectPatterns(testProjectPath),
      parseDocumentation(testProjectPath)
    ]);

    assert.ok(structure, 'Should have structure analysis');
    assert.ok(patterns, 'Should have pattern detection');
    assert.ok(docs, 'Should have documentation parsing');

    // Verify they all detected the project
    assert.ok(structure.fileCount > 0, 'Structure should find files');
    assert.ok(patterns.frameworkPatterns.length > 0, 'Patterns should find frameworks');
    assert.ok(docs.hasDocumentation, 'Should find documentation');
  });

  it('should provide consistent results', async () => {
    const [structure, patterns, docs] = await Promise.all([
      analyzeProjectStructure(testProjectPath),
      detectPatterns(testProjectPath),
      parseDocumentation(testProjectPath)
    ]);

    const projectContext = extractProjectContext(docs);

    // All should identify it as a React project
    const hasReactPattern = patterns.frameworkPatterns.some(p =>
      p.name.includes('React')
    );
    const hasComponentDir = structure.organizedByType.components !== undefined;

    assert.ok(hasReactPattern, 'Pattern detector should find React');
    assert.ok(hasComponentDir, 'Structure analyzer should find components');
    assert.strictEqual(projectContext.name, 'test-project', 'Should have consistent project name');
  });

  it('should handle concurrent analysis safely', async () => {
    // Run multiple analyses concurrently
    const results = await Promise.all([
      analyzeProjectStructure(testProjectPath),
      analyzeProjectStructure(testProjectPath),
      detectPatterns(testProjectPath),
      detectPatterns(testProjectPath),
      parseDocumentation(testProjectPath),
      parseDocumentation(testProjectPath)
    ]);

    // All should succeed
    assert.strictEqual(results.length, 6, 'All analyses should complete');
    results.forEach(result => {
      assert.ok(result, 'Each result should be valid');
    });
  });
});
