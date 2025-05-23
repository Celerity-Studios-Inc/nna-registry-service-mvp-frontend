const fs = require('fs');
const path = require('path');

// Top files with the most unguarded console.log statements
const filesToFix = [
  './src/api/assetService.ts',
  './src/pages/RegisterAssetPage.tsx',
  './src/api/taxonomyService.ts',
  './src/hooks/useTaxonomy.ts'
];

// Process each file
filesToFix.forEach(filePath => {
  try {
    // Read the file
    const fileContent = fs.readFileSync(filePath, 'utf8');
    
    // Replace unguarded console.log statements with debugLog
    const updatedContent = fileContent.replace(
      /console\.log\(/g, 
      'debugLog('
    );
    
    // Make sure the debugLog import is present
    if (!updatedContent.includes('debugLog')) {
      // Check if there's a logger import to modify
      if (updatedContent.includes('import { logger')) {
        // Add debugLog to the existing logger import
        const updatedWithImport = updatedContent.replace(
          /import \{ logger(.*?) \} from '\.\.\/utils\/logger';/,
          "import { logger$1, debugLog } from '../utils/logger';"
        );
        fs.writeFileSync(filePath, updatedWithImport, 'utf8');
      } else {
        // Add a new import for debugLog
        const updatedWithImport = updatedContent.replace(
          /(import .* from .*;\n)(\n|import)/,
          "$1import { debugLog } from '../utils/logger';\n$2"
        );
        fs.writeFileSync(filePath, updatedWithImport, 'utf8');
      }
    } else {
      // If debugLog is already imported, just write the updated content
      fs.writeFileSync(filePath, updatedContent, 'utf8');
    }
    
    // Count the number of replacements
    const originalMatches = (fileContent.match(/console\.log\(/g) || []).length;
    const remainingMatches = (updatedContent.match(/console\.log\(/g) || []).length;
    const replacements = originalMatches - remainingMatches;
    
    console.log(`Made ${replacements} replacements in ${filePath}`);
  } catch (err) {
    console.error(`Error processing file ${filePath}: ${err.message}`);
  }
});