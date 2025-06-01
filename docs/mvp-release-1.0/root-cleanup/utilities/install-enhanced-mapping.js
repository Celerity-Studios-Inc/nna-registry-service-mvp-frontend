// Script to install the enhanced code mapping solution
const fs = require('fs');
const path = require('path');

console.log('Installing enhanced code mapping solution...');

// Paths
const enhancedPath = path.join(__dirname, 'src/api/codeMapping.enhanced.ts');
const originalPath = path.join(__dirname, 'src/api/codeMapping.ts');
const backupPath = path.join(__dirname, 'src/api/codeMapping.ts.bak');

// Check if the enhanced file exists
if (!fs.existsSync(enhancedPath)) {
  console.error('Error: Enhanced code mapping file not found!');
  process.exit(1);
}

// Backup the original file if it hasn't been backed up yet
if (!fs.existsSync(backupPath)) {
  console.log('Backing up original code mapping file...');
  fs.copyFileSync(originalPath, backupPath);
  console.log('Backup created at:', backupPath);
}

// Copy the enhanced file to the original location
console.log('Installing enhanced code mapping...');
fs.copyFileSync(enhancedPath, originalPath);

console.log('Enhanced code mapping successfully installed!');
console.log('You can now use the standard import path:');
console.log('import { formatNNAAddressForDisplay } from \'../api/codeMapping\';');
console.log('');
console.log('To revert back to the original mapping, run:');
console.log('node revert-code-mapping.js');

// Create a revert script
const revertScript = `// Script to revert to the original code mapping
const fs = require('fs');
const path = require('path');

console.log('Reverting to original code mapping...');

// Paths
const originalPath = path.join(__dirname, 'src/api/codeMapping.ts');
const backupPath = path.join(__dirname, 'src/api/codeMapping.ts.bak');

// Check if the backup file exists
if (!fs.existsSync(backupPath)) {
  console.error('Error: Backup file not found!');
  process.exit(1);
}

// Restore the original file
console.log('Restoring original code mapping...');
fs.copyFileSync(backupPath, originalPath);

console.log('Original code mapping successfully restored!');
`;

// Write the revert script
fs.writeFileSync(path.join(__dirname, 'revert-code-mapping.js'), revertScript);
console.log('Revert script created at: revert-code-mapping.js');