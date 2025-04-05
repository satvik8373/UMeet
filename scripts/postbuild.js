import { copyFileSync, mkdirSync, readdirSync, statSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

// Helper function to copy directory recursively
function copyDir(src, dest) {
  // Create destination directory if it doesn't exist
  if (!statSync(src).isDirectory()) {
    copyFileSync(src, dest);
    return;
  }

  try {
    mkdirSync(dest, { recursive: true });
  } catch (err) {
    if (err.code !== 'EEXIST') throw err;
  }

  const entries = readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = join(src, entry.name);
    const destPath = join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      copyFileSync(srcPath, destPath);
    }
  }
}

// Copy public directory
copyDir(
  join(rootDir, 'public'),
  join(rootDir, '.next', 'standalone', 'public')
);

// Copy static directory
copyDir(
  join(rootDir, '.next', 'static'),
  join(rootDir, '.next', 'standalone', '.next', 'static')
);

console.log('✅ Post-build steps completed successfully'); 