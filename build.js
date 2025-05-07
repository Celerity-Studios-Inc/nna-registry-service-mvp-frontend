const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Run the React build
console.log('Building React application...');
execSync('npm run build', { stdio: 'inherit' });
console.log('React build completed');

// Create an empty build directory if it doesn't exist
const buildDir = path.join(__dirname, 'build');
if (!fs.existsSync(buildDir)) {
  fs.mkdirSync(buildDir, { recursive: true });
}

console.log('Build process completed successfully');