const fs = require('fs');
const path = require('path');

// Path to the file
const filePath = path.join(__dirname, 'src/components/asset/ReviewSubmit.tsx');

// Read the file
let content = fs.readFileSync(filePath, 'utf8');

// Replace both occurrences of the warning with our new comment
const warningPattern = /\{\/\* Extra validation for S\.POP\.HPM \*\/\}\n\s+\{layer === 'S' && categoryCode === 'POP' && subcategoryCode === 'HPM' && mfa !== '2\.001\.007\.001' && \(\n\s+<Typography variant="caption" color="error" sx=\{\{ ml: 6 \}\}>\n\s+Warning: Expected 2\.001\.007\.001 for S\.POP\.HPM\n\s+<\/Typography>\n\s+\)\}/g;

const replacement = '{/* Special case warnings are no longer needed with enhanced formatter */}';

// Apply the replacement
const updatedContent = content.replace(warningPattern, replacement);

// Write the updated content back to the file
fs.writeFileSync(filePath, updatedContent, 'utf8');

console.log('Successfully updated ReviewSubmit.tsx');