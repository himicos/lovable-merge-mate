#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rootDir = path.resolve(__dirname, '..');
const srcDir = path.join(rootDir, 'src');

function processFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');

  const updatedLines = lines.map(line => {
    // Match import statements with relative paths
    const importMatch = line.match(/^(import .* from ['"])(\.\.?\/[^'"]+)(['"];?)$/);
    if (importMatch) {
      const [_, start, importPath, end] = importMatch;
      // Don't add .js if it's already there or if it's importing a directory index
      if (!importPath.endsWith('.js') && !importPath.endsWith('/')) {
        return `${start}${importPath}.js${end}`;
      }
    }
    return line;
  });

  const updatedContent = updatedLines.join('\n');
  if (content !== updatedContent) {
    fs.writeFileSync(filePath, updatedContent);
    console.log(`Updated imports in ${filePath}`);
  }
}

function processDirectory(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      processDirectory(fullPath);
    } else if (entry.isFile() && /\.(ts|js)$/.test(entry.name)) {
      processFile(fullPath);
    }
  }
}

processDirectory(srcDir);
