import fs from 'fs-extra';
import path from 'path';

/**
 * Documentation files to look for
 */
const DOC_FILES = [
  'README.md',
  'readme.md',
  'Readme.md',
  'CONTRIBUTING.md',
  'ARCHITECTURE.md',
  'DESIGN.md',
  'API.md',
  'SETUP.md',
  'GETTING_STARTED.md'
];

/**
 * Documentation directories
 */
const DOC_DIRS = [
  'docs',
  'documentation',
  'doc',
  '.github'
];

/**
 * Parse documentation from project
 * @param {string} projectPath - Path to the project directory
 * @returns {Promise<Object>} Parsed documentation
 */
export async function parseDocumentation(projectPath) {
  try {
    const docs = {
      readme: null,
      architecture: null,
      setup: null,
      api: null,
      contributing: null,
      additionalDocs: [],
      packageJson: null,
      hasDocumentation: false
    };

    // Parse root-level documentation files
    await parseRootDocs(projectPath, docs);

    // Parse documentation directories
    await parseDocDirs(projectPath, docs);

    // Parse package.json for metadata
    await parsePackageJson(projectPath, docs);

    // Determine if project has documentation
    docs.hasDocumentation = docs.readme !== null || 
                           docs.architecture !== null || 
                           docs.additionalDocs.length > 0;

    return docs;
  } catch (error) {
    console.error(`Error parsing documentation: ${error.message}`);
    return createEmptyDocs();
  }
}

/**
 * Parse root-level documentation files
 */
async function parseRootDocs(projectPath, docs) {
  for (const docFile of DOC_FILES) {
    const filePath = path.join(projectPath, docFile);
    
    if (await fs.pathExists(filePath)) {
      try {
        const content = await fs.readFile(filePath, 'utf8');
        const parsed = parseMarkdownFile(content, docFile);
        
        // Categorize by filename
        const lowerName = docFile.toLowerCase();
        if (lowerName.includes('readme')) {
          docs.readme = parsed;
        } else if (lowerName.includes('architecture') || lowerName.includes('design')) {
          docs.architecture = parsed;
        } else if (lowerName.includes('setup') || lowerName.includes('getting')) {
          docs.setup = parsed;
        } else if (lowerName.includes('api')) {
          docs.api = parsed;
        } else if (lowerName.includes('contributing')) {
          docs.contributing = parsed;
        } else {
          docs.additionalDocs.push({
            file: docFile,
            ...parsed
          });
        }
      } catch (error) {
        // Skip files we can't read
      }
    }
  }
}

/**
 * Parse documentation directories
 */
async function parseDocDirs(projectPath, docs) {
  for (const docDir of DOC_DIRS) {
    const dirPath = path.join(projectPath, docDir);
    
    if (await fs.pathExists(dirPath)) {
      try {
        const files = await fs.readdir(dirPath);
        
        for (const file of files) {
          if (file.endsWith('.md')) {
            const filePath = path.join(dirPath, file);
            const content = await fs.readFile(filePath, 'utf8');
            const parsed = parseMarkdownFile(content, file);
            
            docs.additionalDocs.push({
              file: path.join(docDir, file),
              ...parsed
            });
          }
        }
      } catch (error) {
        // Skip directories we can't read
      }
    }
  }
}

/**
 * Parse package.json for metadata
 */
async function parsePackageJson(projectPath, docs) {
  const packagePath = path.join(projectPath, 'package.json');
  
  if (await fs.pathExists(packagePath)) {
    try {
      const content = await fs.readFile(packagePath, 'utf8');
      const pkg = JSON.parse(content);
      
      docs.packageJson = {
        name: pkg.name ?? 'unknown',
        version: pkg.version ?? '0.0.0',
        description: pkg.description ?? null,
        author: pkg.author ?? null,
        license: pkg.license ?? null,
        repository: pkg.repository ?? null,
        homepage: pkg.homepage ?? null,
        keywords: pkg.keywords ?? []
      };
    } catch (error) {
      // Skip if can't parse
    }
  }
}

/**
 * Parse markdown file and extract sections
 */
function parseMarkdownFile(content, filename) {
  const sections = [];
  const lines = content.split('\n');
  
  let currentSection = null;
  let currentContent = [];
  
  for (const line of lines) {
    // Check for heading
    const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);
    
    if (headingMatch !== null) {
      // Save previous section
      if (currentSection !== null) {
        sections.push({
          heading: currentSection,
          content: currentContent.join('\n').trim()
        });
      }
      
      // Start new section
      currentSection = headingMatch[2];
      currentContent = [];
    } else {
      currentContent.push(line);
    }
  }
  
  // Save last section
  if (currentSection !== null) {
    sections.push({
      heading: currentSection,
      content: currentContent.join('\n').trim()
    });
  }
  
  // Extract key information
  const description = extractDescription(content);
  const features = extractFeatures(sections);
  const setup = extractSetup(sections);
  const architecture = extractArchitecture(sections);
  
  return {
    filename,
    sections,
    description,
    features,
    setup,
    architecture,
    fullContent: content
  };
}

/**
 * Extract project description (usually first paragraph)
 */
function extractDescription(content) {
  const lines = content.split('\n');
  let description = '';
  let inDescription = false;
  
  for (const line of lines) {
    // Skip headings
    if (line.startsWith('#')) {
      if (inDescription) break;
      continue;
    }
    
    // Skip empty lines before description starts
    if (!inDescription && line.trim() === '') {
      continue;
    }
    
    // Start collecting description
    if (!inDescription && line.trim() !== '') {
      inDescription = true;
    }
    
    // Collect description lines
    if (inDescription) {
      if (line.trim() === '') {
        break; // First empty line ends description
      }
      description += line + ' ';
    }
  }
  
  return description.trim() || null;
}

/**
 * Extract features list
 */
function extractFeatures(sections) {
  const featureSections = sections.filter(s => 
    s.heading.toLowerCase().includes('feature') ||
    s.heading.toLowerCase().includes('what') ||
    s.heading.toLowerCase().includes('capability')
  );
  
  if (featureSections.length === 0) {
    return [];
  }
  
  const features = [];
  for (const section of featureSections) {
    const lines = section.content.split('\n');
    
    for (const line of lines) {
      // Look for list items
      const listMatch = line.match(/^[\s-*+]*\s*(.+)$/);
      if (listMatch !== null && line.trim().startsWith('-') || line.trim().startsWith('*')) {
        const feature = listMatch[1].trim();
        if (feature.length > 0) {
          features.push(feature);
        }
      }
    }
  }
  
  return features;
}

/**
 * Extract setup/installation instructions
 */
function extractSetup(sections) {
  const setupSections = sections.filter(s => 
    s.heading.toLowerCase().includes('setup') ||
    s.heading.toLowerCase().includes('install') ||
    s.heading.toLowerCase().includes('getting started') ||
    s.heading.toLowerCase().includes('quick start')
  );
  
  if (setupSections.length === 0) {
    return null;
  }
  
  return setupSections.map(s => s.content).join('\n\n');
}

/**
 * Extract architecture information
 */
function extractArchitecture(sections) {
  const archSections = sections.filter(s => 
    s.heading.toLowerCase().includes('architecture') ||
    s.heading.toLowerCase().includes('design') ||
    s.heading.toLowerCase().includes('structure') ||
    s.heading.toLowerCase().includes('how it works')
  );
  
  if (archSections.length === 0) {
    return null;
  }
  
  return archSections.map(s => s.content).join('\n\n');
}

/**
 * Create empty documentation result
 */
function createEmptyDocs() {
  return {
    readme: null,
    architecture: null,
    setup: null,
    api: null,
    contributing: null,
    additionalDocs: [],
    packageJson: null,
    hasDocumentation: false
  };
}

/**
 * Generate summary of documentation
 */
export function generateDocsSummary(docs) {
  const lines = [];
  
  lines.push('## Documentation Overview');
  lines.push('');
  
  if (!docs.hasDocumentation) {
    lines.push('No documentation files detected.');
    return lines.join('\n');
  }
  
  if (docs.readme !== null) {
    lines.push('### README');
    if (docs.readme.description !== null) {
      lines.push(docs.readme.description);
    }
    
    if (docs.readme.features.length > 0) {
      lines.push('');
      lines.push('**Features:**');
      for (const feature of docs.readme.features.slice(0, 5)) {
        lines.push(`- ${feature}`);
      }
    }
    lines.push('');
  }
  
  if (docs.architecture !== null) {
    lines.push('### Architecture Documentation');
    lines.push('Architecture documentation found.');
    lines.push('');
  }
  
  if (docs.setup !== null) {
    lines.push('### Setup Documentation');
    lines.push('Setup/installation instructions found.');
    lines.push('');
  }
  
  if (docs.additionalDocs.length > 0) {
    lines.push('### Additional Documentation');
    for (const doc of docs.additionalDocs) {
      lines.push(`- \`${doc.file}\``);
    }
    lines.push('');
  }
  
  return lines.join('\n');
}

/**
 * Extract project context for memory bank
 */
export function extractProjectContext(docs) {
  const context = {
    name: null,
    description: null,
    purpose: null,
    features: [],
    setup: null,
    architecture: null
  };
  
  // Get from package.json
  if (docs.packageJson !== null) {
    context.name = docs.packageJson.name;
    if (docs.packageJson.description !== null) {
      context.description = docs.packageJson.description;
    }
  }
  
  // Get from README
  if (docs.readme !== null) {
    if (context.description === null && docs.readme.description !== null) {
      context.description = docs.readme.description;
    }
    
    context.features = docs.readme.features;
    context.setup = docs.readme.setup;
  }
  
  // Get architecture
  if (docs.architecture !== null) {
    context.architecture = docs.architecture.architecture ?? docs.architecture.fullContent;
  }
  
  return context;
}

