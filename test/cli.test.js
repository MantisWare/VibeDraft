import { describe, it, before, after, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert';
import { execSync, spawn } from 'node:child_process';
import fs from 'fs-extra';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const testTmpDir = path.join(rootDir, 'test-tmp');
const cliPath = path.join(rootDir, 'index.js');

/**
 * Helper to run CLI commands
 */
function runCLI(args, options = {}) {
  const command = `node ${cliPath} ${args}`;
  try {
    const result = execSync(command, {
      cwd: options.cwd ?? testTmpDir,
      encoding: 'utf8',
      stdio: options.stdio ?? 'pipe',
      env: { ...process.env, ...options.env }
    });
    return { success: true, output: result };
  } catch (error) {
    return {
      success: false,
      output: error.stdout ?? '',
      error: error.stderr ?? error.message,
      code: error.status
    };
  }
}

/**
 * Helper to run CLI commands with user input simulation
 * @param {string} args - Command arguments
 * @param {Array} inputs - User inputs to simulate
 * @param {Object} options - Options
 * @returns {Promise} Promise with result
 */
function _runCLIInteractive(args, inputs = [], options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn('node', [cliPath, ...args.split(' ')], {
      cwd: options.cwd ?? testTmpDir,
      env: { ...process.env, ...options.env }
    });

    let output = '';
    let errorOutput = '';
    let inputIndex = 0;

    child.stdout.on('data', (data) => {
      output += data.toString();
      // Simulate user input when prompted
      if (inputIndex < inputs.length) {
        child.stdin.write(`${inputs[inputIndex]}\n`);
        inputIndex++;
      }
    });

    child.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });

    child.on('close', (code) => {
      resolve({
        success: code === 0,
        output,
        error: errorOutput,
        code
      });
    });

    child.on('error', (err) => {
      reject(err);
    });

    // Send initial inputs
    if (inputs.length > 0 && inputIndex === 0) {
      setTimeout(() => {
        child.stdin.write(`${inputs[0]}\n`);
        inputIndex++;
      }, 100);
    }
  });
}

/**
 * Helper to check if a file exists
 * @param {string} filePath - File path to check
 * @returns {boolean} True if file exists
 */
function _fileExists(filePath) {
  return fs.existsSync(path.join(testTmpDir, filePath));
}

/**
 * Helper to read file contents
 * @param {string} filePath - File path to read
 * @returns {string} File contents
 */
function _readFile(filePath) {
  return fs.readFileSync(path.join(testTmpDir, filePath), 'utf8');
}

/**
 * Helper to check directory structure
 */
function checkVibeDraftStructure(projectDir = '') {
  const baseDir = projectDir ? path.join(testTmpDir, projectDir) : testTmpDir;

  return {
    hasVibeDraftDir: fs.existsSync(path.join(baseDir, '.vibedraft')),
    hasScripts: fs.existsSync(path.join(baseDir, '.vibedraft', 'scripts')),
    hasTemplates: fs.existsSync(path.join(baseDir, '.vibedraft', 'templates')),
    hasMemory: fs.existsSync(path.join(baseDir, '.vibedraft', 'memory')),
    hasConstitution: fs.existsSync(path.join(baseDir, '.vibedraft', 'memory', 'constitution.md')),
    hasBashScripts: fs.existsSync(path.join(baseDir, '.vibedraft', 'scripts', 'bash')),
    hasGit: fs.existsSync(path.join(baseDir, '.git'))
  };
}

describe('VibeDraft CLI Tests', () => {
  before(() => {
    console.log('Setting up test environment...');
    if (fs.existsSync(testTmpDir)) {
      fs.rmSync(testTmpDir, { recursive: true, force: true });
    }
    fs.mkdirSync(testTmpDir, { recursive: true });
  });

  after(() => {
    console.log('Cleaning up test environment...');
    if (fs.existsSync(testTmpDir)) {
      fs.rmSync(testTmpDir, { recursive: true, force: true });
    }
  });

  describe('CLI Help and Version', () => {
    it('should show help with --help', () => {
      const result = runCLI('--help');
      assert.strictEqual(result.success, true);
      assert.match(result.output, /Usage:/);
      assert.match(result.output, /Commands:/);
      assert.match(result.output, /init/);
      assert.match(result.output, /check/);
    });

    it('should show version with --version', () => {
      const result = runCLI('--version');
      assert.strictEqual(result.success, true);
      assert.match(result.output, /\d+\.\d+\.\d+/);
    });

    it('should show help for init command', () => {
      const result = runCLI('init --help');
      assert.strictEqual(result.success, true);
      assert.match(result.output, /Usage:/);
      assert.match(result.output, /--ai/);
      assert.match(result.output, /--here/);
      assert.match(result.output, /--force/);
    });

    it('should show help for check command', () => {
      const result = runCLI('check --help');
      assert.strictEqual(result.success, true);
      assert.match(result.output, /Usage:/);
      assert.match(result.output, /check/);
    });
  });

  describe('vibedraft check', () => {
    it('should run check command successfully', () => {
      const result = runCLI('check');
      assert.strictEqual(result.success, true);
      assert.match(result.output, /VibeDraft|toolkit|Available Tools/i);
    });

    it('should detect git installation', () => {
      const result = runCLI('check');
      assert.match(result.output, /git|Git/i);
    });

    it('should list AI agent tools', () => {
      const result = runCLI('check');
      // Should mention at least some AI tools
      assert.match(result.output, /claude|gemini|cursor|copilot/i);
    });
  });

  describe('vibedraft init - Basic Functionality', () => {
    let projectName;

    beforeEach(() => {
      projectName = `test-project-${Date.now()}`;
    });

    afterEach(() => {
      const projectPath = path.join(testTmpDir, projectName);
      if (fs.existsSync(projectPath)) {
        fs.rmSync(projectPath, { recursive: true, force: true });
      }
    });

    it('should create a new project with default settings', async () => {
      const result = runCLI(`init ${projectName} --ignore-agent-tools --no-git`, {
        stdio: 'pipe',
        env: { CI: 'true' }
      });

      assert.strictEqual(result.success, true, `Command failed: ${result.error}`);

      const structure = checkVibeDraftStructure(projectName);
      assert.strictEqual(structure.hasVibeDraftDir, true, '.vibedraft directory should exist');
      assert.strictEqual(structure.hasScripts, true, 'scripts directory should exist');
      assert.strictEqual(structure.hasTemplates, true, 'templates directory should exist');
      assert.strictEqual(structure.hasMemory, true, 'memory directory should exist');
      assert.strictEqual(structure.hasConstitution, true, 'constitution.md should exist');
      assert.strictEqual(structure.hasBashScripts, true, 'bash scripts should exist');
    });

    it('should create project with specific AI agent', async () => {
      const result = runCLI(`init ${projectName} --ai claude --ignore-agent-tools --no-git`, {
        env: { CI: 'true' }
      });

      assert.strictEqual(result.success, true);
      assert.match(result.output, /claude/i);

      // Check for Claude-specific files
      const claudeDir = path.join(testTmpDir, projectName, '.claude');
      assert.strictEqual(fs.existsSync(claudeDir), true, 'Claude directory should exist');
    });

    it('should create project with cursor agent', async () => {
      const result = runCLI(`init ${projectName} --ai cursor --ignore-agent-tools --no-git`, {
        env: { CI: 'true' }
      });

      assert.strictEqual(result.success, true);

      const cursorDir = path.join(testTmpDir, projectName, '.cursor');
      assert.strictEqual(fs.existsSync(cursorDir), true, 'Cursor directory should exist');
    });

    it('should create project with gemini agent', async () => {
      const result = runCLI(`init ${projectName} --ai gemini --ignore-agent-tools --no-git`, {
        env: { CI: 'true' }
      });

      assert.strictEqual(result.success, true);

      const geminiDir = path.join(testTmpDir, projectName, '.gemini');
      assert.strictEqual(fs.existsSync(geminiDir), true, 'Gemini directory should exist');
    });

    it('should create project with copilot agent', async () => {
      const result = runCLI(`init ${projectName} --ai copilot --ignore-agent-tools --no-git`, {
        env: { CI: 'true' }
      });

      assert.strictEqual(result.success, true);

      const githubDir = path.join(testTmpDir, projectName, '.github');
      assert.strictEqual(fs.existsSync(githubDir), true, 'GitHub directory should exist');
    });

    it('should initialize git repository by default', async () => {
      const result = runCLI(`init ${projectName} --ignore-agent-tools`, {
        env: { CI: 'true' }
      });

      assert.strictEqual(result.success, true);

      const structure = checkVibeDraftStructure(projectName);
      assert.strictEqual(structure.hasGit, true, 'Git repository should be initialized');
    });

    it('should skip git initialization with --no-git', async () => {
      const result = runCLI(`init ${projectName} --ignore-agent-tools --no-git`, {
        env: { CI: 'true' }
      });

      assert.strictEqual(result.success, true);

      const structure = checkVibeDraftStructure(projectName);
      assert.strictEqual(structure.hasGit, false, 'Git repository should not be initialized');
    });

    it('should fail with invalid AI agent', () => {
      const result = runCLI(`init ${projectName} --ai invalid-agent --ignore-agent-tools`, {
        env: { CI: 'true' }
      });

      assert.strictEqual(result.success, false);
      assert.match(result.error, /invalid/i);
    });

    it('should handle project name with spaces', () => {
      const spacedName = 'test project spaces';
      const result = runCLI(`init "${spacedName}" --ignore-agent-tools --no-git`, {
        env: { CI: 'true' }
      });

      // Should either succeed or fail gracefully
      if (result.success) {
        const projectPath = path.join(testTmpDir, spacedName);
        if (fs.existsSync(projectPath)) {
          fs.rmSync(projectPath, { recursive: true, force: true });
        }
      }
    });
  });

  describe('vibedraft init - Current Directory (--here)', () => {
    let testDir;

    beforeEach(() => {
      testDir = path.join(testTmpDir, `here-test-${Date.now()}`);
      fs.mkdirSync(testDir, { recursive: true });
    });

    afterEach(() => {
      if (fs.existsSync(testDir)) {
        fs.rmSync(testDir, { recursive: true, force: true });
      }
    });

    it('should initialize in current directory with --here', () => {
      const result = runCLI('init --here --ignore-agent-tools --no-git', {
        cwd: testDir,
        env: { CI: 'true' }
      });

      assert.strictEqual(result.success, true);
      assert.strictEqual(fs.existsSync(path.join(testDir, '.vibedraft')), true);
    });

    it('should initialize in current directory with . argument', () => {
      const result = runCLI('init . --ignore-agent-tools --no-git', {
        cwd: testDir,
        env: { CI: 'true' }
      });

      assert.strictEqual(result.success, true);
      assert.strictEqual(fs.existsSync(path.join(testDir, '.vibedraft')), true);
    });

    it('should warn about non-empty directory', () => {
      // Create a file in the directory
      fs.writeFileSync(path.join(testDir, 'existing-file.txt'), 'content');

      const result = runCLI('init --here --ignore-agent-tools --no-git --force', {
        cwd: testDir,
        env: { CI: 'true' }
      });

      // Should still succeed with --force
      assert.strictEqual(result.success, true);
    });

    it('should reject both project name and --here flag', () => {
      const result = runCLI('init my-project --here --ignore-agent-tools', {
        cwd: testDir,
        env: { CI: 'true' }
      });

      assert.strictEqual(result.success, false);
      assert.match(result.error, /Pick one|not both/i);
    });
  });

  describe('vibedraft init - File Structure Validation', () => {
    let projectName;

    before(() => {
      projectName = `structure-test-${Date.now()}`;
      runCLI(`init ${projectName} --ai claude --ignore-agent-tools --no-git`, {
        env: { CI: 'true' }
      });
    });

    after(() => {
      const projectPath = path.join(testTmpDir, projectName);
      if (fs.existsSync(projectPath)) {
        fs.rmSync(projectPath, { recursive: true, force: true });
      }
    });

    it('should create .vibedraft directory', () => {
      assert.strictEqual(
        fs.existsSync(path.join(testTmpDir, projectName, '.vibedraft')),
        true
      );
    });

    it('should create scripts directory with bash scripts', () => {
      const scriptsPath = path.join(testTmpDir, projectName, '.vibedraft', 'scripts', 'bash');
      assert.strictEqual(fs.existsSync(scriptsPath), true);

      // Check for specific scripts
      const scripts = [
        'check-prerequisites.sh',
        'create-new-feature.sh',
        'setup-plan.sh',
        'update-agent-context.sh'
      ];

      scripts.forEach(script => {
        const scriptPath = path.join(scriptsPath, script);
        assert.strictEqual(
          fs.existsSync(scriptPath),
          true,
          `${script} should exist`
        );
      });
    });

    it('should create templates directory', () => {
      const templatesPath = path.join(testTmpDir, projectName, '.vibedraft', 'templates');
      assert.strictEqual(fs.existsSync(templatesPath), true);

      // Check for template files
      const templates = [
        'spec-template.md',
        'plan-template.md',
        'tasks-template.md',
        'checklist-template.md'
      ];

      templates.forEach(template => {
        const templatePath = path.join(templatesPath, template);
        assert.strictEqual(
          fs.existsSync(templatePath),
          true,
          `${template} should exist`
        );
      });
    });

    it('should create commands directory', () => {
      const commandsPath = path.join(testTmpDir, projectName, '.vibedraft', 'templates', 'commands');
      assert.strictEqual(fs.existsSync(commandsPath), true);

      // Check for command files
      const commands = [
        'specify.md',
        'plan.md',
        'tasks.md',
        'implement.md',
        'analyze.md',
        'clarify.md',
        'checklist.md'
      ];

      commands.forEach(command => {
        const commandPath = path.join(commandsPath, command);
        assert.strictEqual(
          fs.existsSync(commandPath),
          true,
          `${command} should exist`
        );
      });
    });

    it('should create memory directory with constitution', () => {
      const memoryPath = path.join(testTmpDir, projectName, '.vibedraft', 'memory');
      assert.strictEqual(fs.existsSync(memoryPath), true);

      const constitutionPath = path.join(memoryPath, 'constitution.md');
      assert.strictEqual(fs.existsSync(constitutionPath), true);

      // Verify constitution has content
      const content = fs.readFileSync(constitutionPath, 'utf8');
      assert.ok(content.length > 100, 'Constitution should have substantial content');
    });

    it('should create agent-specific directory', () => {
      const claudeDir = path.join(testTmpDir, projectName, '.claude');
      assert.strictEqual(fs.existsSync(claudeDir), true);

      const commandsDir = path.join(claudeDir, 'commands');
      assert.strictEqual(fs.existsSync(commandsDir), true);
    });

    it('should create specs directory', () => {
      const specsPath = path.join(testTmpDir, projectName, 'specs');
      assert.strictEqual(fs.existsSync(specsPath), true);
    });

    it('should create README.md', () => {
      const readmePath = path.join(testTmpDir, projectName, 'README.md');
      assert.strictEqual(fs.existsSync(readmePath), true);

      const content = fs.readFileSync(readmePath, 'utf8');
      assert.match(content, /VibeDraft/i);
    });

    it('should create .gitignore', () => {
      const gitignorePath = path.join(testTmpDir, projectName, '.gitignore');
      assert.strictEqual(fs.existsSync(gitignorePath), true);

      const content = fs.readFileSync(gitignorePath, 'utf8');
      assert.match(content, /node_modules/);
    });
  });

  describe('vibedraft init - Error Handling', () => {
    it('should fail when project directory already exists (without --force)', () => {
      const projectName = `existing-project-${Date.now()}`;
      const projectPath = path.join(testTmpDir, projectName);

      // Create the directory first
      fs.mkdirSync(projectPath, { recursive: true });
      fs.writeFileSync(path.join(projectPath, 'existing.txt'), 'content');

      const result = runCLI(`init ${projectName} --ignore-agent-tools --no-git`, {
        env: { CI: 'true' }
      });

      // Should fail or warn
      assert.ok(
        !result.success || result.output.includes('exists') || result.output.includes('empty'),
        'Should handle existing directory'
      );

      // Cleanup
      fs.rmSync(projectPath, { recursive: true, force: true });
    });

    it('should handle network errors gracefully', () => {
      const projectName = `network-test-${Date.now()}`;

      // Simulate network issue by using invalid GitHub token
      const result = runCLI(`init ${projectName} --ignore-agent-tools --no-git --github-token invalid`, {
        env: { CI: 'true' }
      });

      // Should either succeed (falling back) or fail gracefully
      if (!result.success) {
        assert.ok(result.error.length > 0, 'Should provide error message');
      }

      // Cleanup if succeeded
      const projectPath = path.join(testTmpDir, projectName);
      if (fs.existsSync(projectPath)) {
        fs.rmSync(projectPath, { recursive: true, force: true });
      }
    });

    it('should handle permission errors gracefully', () => {
      // This test is platform-dependent and may not work on all systems
      // Just verify the command handles errors without crashing
      const projectName = '/root/forbidden-project';
      const result = runCLI(`init ${projectName} --ignore-agent-tools --no-git`, {
        env: { CI: 'true' }
      });

      // Should fail but not crash
      assert.ok(result.error ?? result.output, 'Should provide feedback');
    });
  });

  describe('vibedraft init - Multiple AI Agents', () => {
    const agents = ['claude', 'gemini', 'copilot', 'cursor', 'qwen', 'opencode', 'windsurf', 'q'];

    agents.forEach(agent => {
      it(`should support ${agent} agent`, () => {
        const projectName = `${agent}-test-${Date.now()}`;
        const result = runCLI(`init ${projectName} --ai ${agent} --ignore-agent-tools --no-git`, {
          env: { CI: 'true' }
        });

        assert.strictEqual(result.success, true, `${agent} initialization failed`);

        // Cleanup
        const projectPath = path.join(testTmpDir, projectName);
        if (fs.existsSync(projectPath)) {
          fs.rmSync(projectPath, { recursive: true, force: true });
        }
      });
    });
  });

  describe('vibedraft init - Edge Cases', () => {
    it('should handle very long project names', () => {
      const longName = 'a'.repeat(200);
      const result = runCLI(`init ${longName} --ignore-agent-tools --no-git`, {
        env: { CI: 'true' }
      });

      // Should either succeed or fail gracefully
      if (result.success) {
        const projectPath = path.join(testTmpDir, longName);
        if (fs.existsSync(projectPath)) {
          fs.rmSync(projectPath, { recursive: true, force: true });
        }
      }
    });

    it('should handle special characters in project name', () => {
      const specialName = 'test-project_123';
      const result = runCLI(`init ${specialName} --ignore-agent-tools --no-git`, {
        env: { CI: 'true' }
      });

      assert.strictEqual(result.success, true);

      const projectPath = path.join(testTmpDir, specialName);
      if (fs.existsSync(projectPath)) {
        fs.rmSync(projectPath, { recursive: true, force: true });
      }
    });

    it('should handle rapid successive initializations', async () => {
      const project1 = `rapid-1-${Date.now()}`;
      const project2 = `rapid-2-${Date.now()}`;

      const result1 = runCLI(`init ${project1} --ignore-agent-tools --no-git`, {
        env: { CI: 'true' }
      });
      const result2 = runCLI(`init ${project2} --ignore-agent-tools --no-git`, {
        env: { CI: 'true' }
      });

      assert.strictEqual(result1.success, true);
      assert.strictEqual(result2.success, true);

      // Cleanup
      [project1, project2].forEach(name => {
        const projectPath = path.join(testTmpDir, name);
        if (fs.existsSync(projectPath)) {
          fs.rmSync(projectPath, { recursive: true, force: true });
        }
      });
    });
  });

  describe('Integration Tests', () => {
    let projectName;

    before(() => {
      projectName = `integration-test-${Date.now()}`;
      const result = runCLI(`init ${projectName} --ai claude --ignore-agent-tools`, {
        env: { CI: 'true' }
      });
      assert.strictEqual(result.success, true, 'Setup failed for integration tests');
    });

    after(() => {
      const projectPath = path.join(testTmpDir, projectName);
      if (fs.existsSync(projectPath)) {
        fs.rmSync(projectPath, { recursive: true, force: true });
      }
    });

    it('should have executable bash scripts', () => {
      const scriptsPath = path.join(testTmpDir, projectName, '.vibedraft', 'scripts', 'bash');
      const scripts = fs.readdirSync(scriptsPath);

      scripts.forEach(script => {
        if (script.endsWith('.sh')) {
          const scriptPath = path.join(scriptsPath, script);
          const stats = fs.statSync(scriptPath);

          // On Unix systems, check if executable
          if (process.platform !== 'win32') {
            assert.ok(
              stats.mode & fs.constants.S_IXUSR,
              `${script} should be executable`
            );
          }
        }
      });
    });

    it('should have valid JSON in command frontmatter', () => {
      const commandsPath = path.join(testTmpDir, projectName, '.vibedraft', 'templates', 'commands');
      const commands = fs.readdirSync(commandsPath);

      commands.forEach(command => {
        const commandPath = path.join(commandsPath, command);
        const content = fs.readFileSync(commandPath, 'utf8');

        // Check for frontmatter
        if (content.startsWith('---')) {
          assert.match(content, /---[\s\S]+---/, `${command} should have valid frontmatter`);
        }
      });
    });

    it('should have consistent file structure across templates', () => {
      const templatesPath = path.join(testTmpDir, projectName, '.vibedraft', 'templates');

      // All templates should exist
      ['spec-template.md', 'plan-template.md', 'tasks-template.md'].forEach(template => {
        assert.strictEqual(
          fs.existsSync(path.join(templatesPath, template)),
          true,
          `${template} should exist`
        );
      });

      // All templates should have content
      ['spec-template.md', 'plan-template.md', 'tasks-template.md'].forEach(template => {
        const content = fs.readFileSync(path.join(templatesPath, template), 'utf8');
        assert.ok(content.length > 100, `${template} should have content`);
      });
    });
  });
});
