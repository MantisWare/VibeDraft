import fs from 'fs-extra';
import path from 'path';

/**
 * Find the specs directory, supporting both old and new locations
 * Priority: .vibedraft/specs/ (new) > specs/ (old for backward compatibility)
 * 
 * @param {string} projectRoot - Project root directory
 * @returns {Promise<string>} Path to specs directory
 */
export async function findSpecsDirectory(projectRoot) {
  // New location (preferred)
  const newSpecsDir = path.join(projectRoot, '.vibedraft', 'specs');
  if (await fs.pathExists(newSpecsDir)) {
    return newSpecsDir;
  }

  // Old location (backward compatibility)
  const oldSpecsDir = path.join(projectRoot, 'specs');
  if (await fs.pathExists(oldSpecsDir)) {
    return oldSpecsDir;
  }

  // Default to new location if neither exists
  return newSpecsDir;
}

/**
 * Get the specs directory path (synchronous version for bash script generation)
 * Returns the path without checking existence
 * 
 * @param {string} projectRoot - Project root directory
 * @returns {string} Path to new specs directory location
 */
export function getSpecsDirectory(projectRoot) {
  return path.join(projectRoot, '.vibedraft', 'specs');
}

/**
 * Find a specific feature directory by name or number
 * Checks both old and new locations
 * 
 * @param {string} projectRoot - Project root directory
 * @param {string} featureName - Feature name or number
 * @returns {Promise<string|null>} Path to feature directory or null if not found
 */
export async function findFeatureDirectory(projectRoot, featureName) {
  const specsDir = await findSpecsDirectory(projectRoot);
  
  // Check if feature directory exists in found specs location
  const featurePath = path.join(specsDir, featureName);
  if (await fs.pathExists(featurePath)) {
    return featurePath;
  }

  // Also check the other location for backward compatibility
  const altSpecsDir = specsDir.includes('.vibedraft') 
    ? path.join(projectRoot, 'specs')
    : path.join(projectRoot, '.vibedraft', 'specs');
  
  const altFeaturePath = path.join(altSpecsDir, featureName);
  if (await fs.pathExists(altFeaturePath)) {
    return altFeaturePath;
  }

  return null;
}

/**
 * Get all feature directories from both locations
 * 
 * @param {string} projectRoot - Project root directory
 * @returns {Promise<Array<{name: string, path: string, location: 'new'|'old'}>>} Array of feature info
 */
export async function getAllFeatures(projectRoot) {
  const features = [];
  
  // Check new location
  const newSpecsDir = path.join(projectRoot, '.vibedraft', 'specs');
  if (await fs.pathExists(newSpecsDir)) {
    const newEntries = await fs.readdir(newSpecsDir, { withFileTypes: true });
    for (const entry of newEntries) {
      if (entry.isDirectory()) {
        features.push({
          name: entry.name,
          path: path.join(newSpecsDir, entry.name),
          location: 'new'
        });
      }
    }
  }

  // Check old location
  const oldSpecsDir = path.join(projectRoot, 'specs');
  if (await fs.pathExists(oldSpecsDir)) {
    const oldEntries = await fs.readdir(oldSpecsDir, { withFileTypes: true });
    for (const entry of oldEntries) {
      if (entry.isDirectory()) {
        // Only add if not already found in new location
        if (!features.some(f => f.name === entry.name)) {
          features.push({
            name: entry.name,
            path: path.join(oldSpecsDir, entry.name),
            location: 'old'
          });
        }
      }
    }
  }

  return features;
}

