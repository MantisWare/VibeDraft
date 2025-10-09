import fetch from 'node-fetch';
import fs from 'fs-extra';
import path from 'path';
import AdmZip from 'adm-zip';
import cliProgress from 'cli-progress';
import chalk from 'chalk';
import { getGithubAuthHeaders } from './utils.js';

/**
 * Download template from GitHub releases
 */
export async function downloadTemplateFromGithub(
  aiAssistant,
  downloadDir,
  {
    scriptType = 'sh',
    verbose = true,
    showProgress = true,
    debug = false,
    githubToken = null,
    skipTls = false
  } = {}
) {
  const repoOwner = 'github';
  const repoName = 'spec-kit';
  const apiUrl = `https://api.github.com/repos/${repoOwner}/${repoName}/releases/latest`;

  if (verbose) {
    console.log(chalk.cyan('Fetching latest release information...'));
  }

  try {
    const headers = {
      ...getGithubAuthHeaders(githubToken),
      'User-Agent': 'vibedraft-cli'
    };

    const response = await fetch(apiUrl, {
      headers,
      timeout: 30000,
      ...(skipTls && { agent: new (await import('https')).Agent({ rejectUnauthorized: false }) })
    });

    if (!response.ok) {
      const body = await response.text();
      throw new Error(
        `GitHub API returned ${response.status} for ${apiUrl}${debug ? `\nResponse: ${body.slice(0, 500)}` : ''}`
      );
    }

    const releaseData = await response.json();
    const assets = releaseData.assets ?? [];
    const pattern = `spec-kit-template-${aiAssistant}-${scriptType}`;
    const matchingAssets = assets.filter(
      (asset) => asset.name.includes(pattern) && asset.name.endsWith('.zip')
    );

    const asset = matchingAssets[0];

    if (!asset) {
      const assetNames = assets.map((a) => a.name).join('\n');
      throw new Error(
        `No matching release asset found for ${aiAssistant} (expected pattern: ${pattern})\nAvailable assets:\n${assetNames}`
      );
    }

    const downloadUrl = asset.browser_download_url;
    const filename = asset.name;
    const fileSize = asset.size;

    if (verbose) {
      console.log(chalk.cyan(`Found template: ${filename}`));
      console.log(chalk.cyan(`Size: ${fileSize.toLocaleString()} bytes`));
      console.log(chalk.cyan(`Release: ${releaseData.tag_name}`));
    }

    const zipPath = path.join(downloadDir, filename);

    if (verbose) {
      console.log(chalk.cyan('Downloading template...'));
    }

    const downloadResponse = await fetch(downloadUrl, {
      headers,
      timeout: 60000,
      ...(skipTls && { agent: new (await import('https')).Agent({ rejectUnauthorized: false }) })
    });

    if (!downloadResponse.ok) {
      const body = await downloadResponse.text();
      throw new Error(`Download failed with ${downloadResponse.status}\nBody: ${body.slice(0, 400)}`);
    }

    const totalSize = parseInt(downloadResponse.headers.get('content-length') ?? '0', 10);
    const writer = fs.createWriteStream(zipPath);
    let downloaded = 0;

    let progressBar = null;
    if (showProgress && totalSize > 0) {
      progressBar = new cliProgress.SingleBar({
        format: 'Downloading... [{bar}] {percentage}%',
        barCompleteChar: '\u2588',
        barIncompleteChar: '\u2591',
        hideCursor: true
      });
      progressBar.start(totalSize, 0);
    }

    for await (const chunk of downloadResponse.body) {
      writer.write(chunk);
      downloaded += chunk.length;
      if (progressBar) {
        progressBar.update(downloaded);
      }
    }

    writer.end();

    if (progressBar) {
      progressBar.stop();
    }

    if (verbose) {
      console.log(`Downloaded: ${filename}`);
    }

    const metadata = {
      filename,
      size: fileSize,
      release: releaseData.tag_name,
      assetUrl: downloadUrl
    };

    return { zipPath, metadata };
  } catch (e) {
    throw new Error(`Error downloading template: ${e.message}`);
  }
}

/**
 * Download and extract template
 */
export async function downloadAndExtractTemplate(
  projectPath,
  aiAssistant,
  scriptType,
  isCurrentDir = false,
  {
    verbose = true,
    tracker = null,
    debug = false,
    githubToken = null,
    skipTls = false
  } = {}
) {
  const currentDir = process.cwd();

  // Step: fetch + download combined
  if (tracker) {
    tracker.start('fetch', 'contacting GitHub API');
  }

  let zipPath, metadata;
  try {
    const result = await downloadTemplateFromGithub(aiAssistant, currentDir, {
      scriptType,
      verbose: verbose && !tracker,
      showProgress: !tracker,
      debug,
      githubToken,
      skipTls
    });
    zipPath = result.zipPath;
    metadata = result.metadata;

    if (tracker) {
      tracker.complete('fetch', `release ${metadata.release} (${metadata.size.toLocaleString()} bytes)`);
      tracker.add('download', 'Download template');
      tracker.complete('download', metadata.filename);
    }
  } catch (e) {
    if (tracker) {
      tracker.error('fetch', e.message);
    }
    throw e;
  }

  if (tracker) {
    tracker.add('extract', 'Extract template');
    tracker.start('extract');
  } else if (verbose) {
    console.log('Extracting template...');
  }

  try {
    // Create project directory only if not using current directory
    if (!isCurrentDir) {
      await fs.ensureDir(projectPath);
    }

    const zip = new AdmZip(zipPath);
    const zipEntries = zip.getEntries();

    if (tracker) {
      tracker.start('zip-list');
      tracker.complete('zip-list', `${zipEntries.length} entries`);
    } else if (verbose) {
      console.log(chalk.cyan(`ZIP contains ${zipEntries.length} items`));
    }

    if (isCurrentDir) {
      // Extract to temp location first
      const tempDir = await fs.mkdtemp(path.join(currentDir, '.vibedraft-temp-'));

      try {
        zip.extractAllTo(tempDir, true);

        const extractedItems = await fs.readdir(tempDir);
        if (tracker) {
          tracker.start('extracted-summary');
          tracker.complete('extracted-summary', `temp ${extractedItems.length} items`);
        } else if (verbose) {
          console.log(chalk.cyan(`Extracted ${extractedItems.length} items to temp location`));
        }

        // Handle GitHub-style ZIP with a single root directory
        let sourceDir = tempDir;
        if (extractedItems.length === 1) {
          const item = path.join(tempDir, extractedItems[0]);
          const stats = await fs.stat(item);
          if (stats.isDirectory()) {
            sourceDir = item;
            if (tracker) {
              tracker.add('flatten', 'Flatten nested directory');
              tracker.complete('flatten');
            } else if (verbose) {
              console.log(chalk.cyan('Found nested directory structure'));
            }
          }
        }

        // Copy contents to current directory
        const items = await fs.readdir(sourceDir);
        for (const item of items) {
          const sourcePath = path.join(sourceDir, item);
          const destPath = path.join(projectPath, item);
          await fs.copy(sourcePath, destPath, { overwrite: true });
        }

        if (verbose && !tracker) {
          console.log(chalk.cyan('Template files merged into current directory'));
        }

        // Cleanup temp directory
        await fs.remove(tempDir);
      } catch (e) {
        // Ensure temp directory is cleaned up
        if (await fs.pathExists(tempDir)) {
          await fs.remove(tempDir);
        }
        throw e;
      }
    } else {
      // Extract directly to project directory
      zip.extractAllTo(projectPath, true);

      const extractedItems = await fs.readdir(projectPath);
      if (tracker) {
        tracker.start('extracted-summary');
        tracker.complete('extracted-summary', `${extractedItems.length} top-level items`);
      } else if (verbose) {
        console.log(chalk.cyan(`Extracted ${extractedItems.length} items to ${projectPath}`));
      }

      // Handle GitHub-style ZIP with a single root directory
      if (extractedItems.length === 1) {
        const item = path.join(projectPath, extractedItems[0]);
        const stats = await fs.stat(item);
        if (stats.isDirectory()) {
          // Move contents up one level
          const items = await fs.readdir(item);
          for (const subItem of items) {
            const srcPath = path.join(item, subItem);
            const destPath = path.join(projectPath, subItem);
            await fs.move(srcPath, destPath, { overwrite: true });
          }
          // Remove empty directory
          await fs.remove(item);

          if (tracker) {
            tracker.add('flatten', 'Flatten nested directory');
            tracker.complete('flatten');
          } else if (verbose) {
            console.log(chalk.cyan('Flattened nested directory structure'));
          }
        }
      }
    }

    if (tracker) {
      tracker.complete('extract');
    }
  } catch (e) {
    if (tracker) {
      tracker.error('extract', e.message);
    } else if (verbose) {
      console.error(chalk.red(`Error extracting template: ${e.message}`));
    }

    // Clean up project directory if created and not current directory
    if (!isCurrentDir && (await fs.pathExists(projectPath))) {
      await fs.remove(projectPath);
    }
    throw e;
  } finally {
    if (tracker) {
      tracker.add('cleanup', 'Remove temporary archive');
    }

    // Clean up downloaded ZIP file
    if (await fs.pathExists(zipPath)) {
      await fs.remove(zipPath);
      if (tracker) {
        tracker.complete('cleanup');
      } else if (verbose) {
        console.log(`Cleaned up: ${path.basename(zipPath)}`);
      }
    }
  }

  return projectPath;
}
