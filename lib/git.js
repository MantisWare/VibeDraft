import simpleGit from 'simple-git';
import fs from 'fs-extra';
import path from 'path';

/**
 * Check if a directory is a git repository (has its own .git directory)
 */
export async function isGitRepo(projectPath = process.cwd()) {
  try {
    if (!(await fs.pathExists(projectPath))) {
      return false;
    }

    // Check if this specific directory has a .git folder
    // (not just if it's inside a parent git repository)
    const gitDir = path.join(projectPath, '.git');
    return await fs.pathExists(gitDir);
  } catch (_e) {
    return false;
  }
}

/**
 * Initialize a git repository
 */
export async function initGitRepo(projectPath, quiet = false) {
  try {
    const git = simpleGit(projectPath);
    await git.init();

    // Configure git user if not already set (important for CI/test environments)
    try {
      await git.addConfig('user.name', 'VibeDraft', false, 'local');
      await git.addConfig('user.email', 'vibedraft@example.com', false, 'local');
    } catch (_e) {
      // Ignore if config already exists
    }

    await git.add('.');
    await git.commit('Initial commit from VibeDraft template');
    return true;
  } catch (e) {
    if (!quiet) {
      console.error('🚨 Oops! Couldn\'t initialize git repository:', e.message);
    }
    return false;
  }
}
