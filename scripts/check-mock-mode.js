// Simple script to check the mock mode settings
const fs = require('fs');
const path = require('path');

console.log('========================');
console.log('MOCK MODE CHECK');
console.log('========================');

// Read .env file
const envPath = path.resolve(process.cwd(), '.env');
try {
  const envContent = fs.readFileSync(envPath, 'utf8');
  console.log('Contents of .env file:');
  console.log(envContent);
  
  // Extract mock API setting
  const mockApiSetting = envContent.match(/REACT_APP_USE_MOCK_API=(.*)/);
  if (mockApiSetting && mockApiSetting[1]) {
    console.log('\nFound setting:', mockApiSetting[0]);
    console.log('Value is:', mockApiSetting[1]);
    console.log('Evaluates to:', mockApiSetting[1].trim() === 'true');
  } else {
    console.log('\nCould not find REACT_APP_USE_MOCK_API setting in .env file');
  }
} catch (err) {
  console.error('Error reading .env file:', err.message);
}

// Check localStorage (this only works in a browser environment)
console.log('\nTo check localStorage in the browser:');
console.log('1. Open developer console');
console.log('2. Run: localStorage.getItem("forceMockApi")');
console.log('3. To set it to false: localStorage.setItem("forceMockApi", "false")');

console.log('\nRecommended steps:');
console.log('1. Ensure .env has REACT_APP_USE_MOCK_API=false');
console.log('2. Set localStorage.setItem("forceMockApi", "false") in browser console');
console.log('3. Reload the page and check console for "Asset creation mode: Real API"');
console.log('========================');