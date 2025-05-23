const fs = require('fs');
const path = require('path');

// File to fix
const filePath = './src/components/asset/SimpleTaxonomySelectionV2.tsx';

try {
  // Read the file
  const fileContent = fs.readFileSync(filePath, 'utf8');
  
  // Replace unguarded console.log statements with debugLog
  const updatedContent = fileContent.replace(
    /console\.log\(/g, 
    'debugLog('
  );
  
  // Write the modified content back to the file
  fs.writeFileSync(filePath, updatedContent, 'utf8');
  
  console.log(`Successfully replaced console.log with debugLog in ${filePath}`);
  
  // Count the number of replacements
  const originalMatches = (fileContent.match(/console\.log\(/g) || []).length;
  const remainingMatches = (updatedContent.match(/console\.log\(/g) || []).length;
  const replacements = originalMatches - remainingMatches;
  
  console.log(`Made ${replacements} replacements in the file.`);
} catch (err) {
  console.error(`Error processing file: ${err.message}`);
}