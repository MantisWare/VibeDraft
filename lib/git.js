import simpleGit from 'simple-git';
import fs from 'fs-extra';

/**
 * Check if a directory is a git repository
 */
export async function isGitRepo(projectPath = process.cwd()) {
  try {
    if (!(await fs.pathExists(projectPath))) {
      return false;
    }

    const git = simpleGit(projectPath);
    await git.revparse(['--is-inside-work-tree']);
    return true;
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
