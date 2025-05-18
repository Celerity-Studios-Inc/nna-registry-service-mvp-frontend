/**
 * Script to update test files to use the new taxonomy test helper
 * 
 * This script replaces any hardcoded special case mappings in test files
 * with references to the taxonomyTestHelper utility.
 */

const fs = require('fs');
const path = require('path');

// Files to update
const files = [
  '../src/api/codeMapping.test.ts',
  '../src/hooks/__tests__/useTaxonomy.test.tsx',
  '../src/tests/utils/taxonomyTestUtils.ts'
];

// Main update function
async function updateTestFiles() {
  console.log('Updating test files to use taxonomyTestHelper...');
  
  for (const file of files) {
    const filePath = path.resolve(__dirname, file);
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      console.log(`File not found: ${filePath}`);
      continue;
    }
    
    console.log(`Updating ${filePath}...`);
    
    try {
      // Read the file
      let content = fs.readFileSync(filePath, 'utf8');
      
      // Replace hardcoded S.POP.HPM.001 -> 2.004.003.001 mappings
      content = content.replace(
        /S\.POP\.HPM\.001['"]\)\s*(?:\.toBe\(|,\s*expectedMfa:\s*['"])2\.004\.003\.001/g,
        'S.POP.HPM.001\').toBe(getExpectedMappingForTest(\'S.POP.HPM.001\')'
      );
      
      // Replace hardcoded W.HIP.BAS.001 -> 5.003.001.001 mappings
      content = content.replace(
        /W\.HIP\.BAS\.001['"]\)\s*(?:\.toBe\(|,\s*expectedMfa:\s*['"])5\.003\.001\.001/g,
        'W.HIP.BAS.001\').toBe(getExpectedMappingForTest(\'W.HIP.BAS.001\')'
      );
      
      // Add import for getExpectedMappingForTest if not already present
      if (!content.includes('getExpectedMappingForTest')) {
        // Find the last import statement
        const lastImportIndex = content.lastIndexOf('import ');
        const endOfImports = content.indexOf('\n', lastImportIndex);
        
        if (lastImportIndex !== -1 && endOfImports !== -1) {
          // Insert new import after the last import
          const beforeImports = content.substring(0, endOfImports + 1);
          const afterImports = content.substring(endOfImports + 1);
          
          content = beforeImports + 
                    'import { getExpectedMappingForTest } from \'../tests/utils/taxonomyTestHelper\';\n' + 
                    afterImports;
        }
      }
      
      // Write the updated content back to the file
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Updated ${filePath}`);
    } catch (error) {
      console.error(`Error updating ${filePath}:`, error);
    }
  }
  
  console.log('All files updated!');
}

// Run the main function
updateTestFiles().catch(console.error);