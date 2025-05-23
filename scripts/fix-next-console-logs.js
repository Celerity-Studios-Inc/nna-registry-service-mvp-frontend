const fs = require('fs');
const path = require('path');

// Next files with unguarded console.log statements
const filesToFix = [
  './src/pages/new/RegisterAssetPageNew.tsx',
  './src/api/assetService.new.ts',
  './src/utils/taxonomyFormatter.ts',
  './src/api/authService.ts',
  './src/components/asset/TaxonomySelection.tsx'
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
      } else if (updatedContent.includes("from '../utils/logger'")) {
        // Different logger import pattern
        const updatedWithImport = updatedContent.replace(
          /from '\.\.\/utils\/logger'/,
          "from '../utils/logger'"
        );
        // Add debugLog import
        const finalUpdated = updatedWithImport.replace(
          /import .* from '\.\.\/utils\/logger';/,
          (match) => match.replace('}', ', debugLog }')
        );
        fs.writeFileSync(filePath, finalUpdated, 'utf8');
      } else {
        // Add a new import for debugLog
        const importMatches = updatedContent.match(/import .* from .*;\n/g);
        if (importMatches && importMatches.length > 0) {
          const lastImport = importMatches[importMatches.length - 1];
          const updatedWithImport = updatedContent.replace(
            lastImport,
            `${lastImport}import { debugLog } from '../../utils/logger';\n`
          );
          fs.writeFileSync(filePath, updatedWithImport, 'utf8');
        } else {
          // If no imports found, add at the top after any comments
          const updatedWithImport = updatedContent.replace(
            /^(\/\*[\s\S]*?\*\/\s*)?/,
            `$1import { debugLog } from '../../utils/logger';\n\n`
          );
          fs.writeFileSync(filePath, updatedWithImport, 'utf8');
        }
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