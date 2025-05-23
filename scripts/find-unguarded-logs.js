const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

// Only look in the src directory to avoid other directories
exec('find ./src -type f -name "*.ts" -o -name "*.tsx" -not -path "*/node_modules/*" -not -path "*/dist/*" -not -path "*/build/*"', (error, stdout, stderr) => {
  if (error) {
    console.error(`Error: ${error.message}`);
    return;
  }
  if (stderr) {
    console.error(`stderr: ${stderr}`);
    return;
  }
  
  const files = stdout.trim().split('\n');
  const results = [];

  files.forEach(file => {
    try {
      const content = fs.readFileSync(file, 'utf8');
      const lines = content.split('\n');
      let unguardedLogCount = 0;
      const unguardedLogLines = [];
      
      lines.forEach((line, index) => {
        // Check for console.log that isn't inside a conditional
        if (line.includes('console.log(') && 
            !line.includes('if') && 
            !line.includes('process.env') && 
            !line.includes('NODE_ENV') &&
            !line.includes('DEBUG') &&
            !line.includes('VERBOSE') &&
            !line.includes('debugLog')) {
          unguardedLogCount++;
          unguardedLogLines.push(index + 1);
        }
      });
      
      if (unguardedLogCount > 0) {
        results.push({
          file,
          count: unguardedLogCount,
          lines: unguardedLogLines
        });
      }
    } catch (err) {
      console.error(`Error reading file ${file}: ${err.message}`);
    }
  });
  
  // Sort by count in descending order
  results.sort((a, b) => b.count - a.count);
  
  // Print top 5 results
  console.log('Top 5 files with unguarded console.log statements:');
  for (let i = 0; i < Math.min(5, results.length); i++) {
    console.log(`${i+1}. ${results[i].file} - ${results[i].count} unguarded logs`);
  }
  
  // Print details for the top file
  if (results.length > 0) {
    console.log('\nDetails for the top file:');
    console.log(`File: ${results[0].file}`);
    console.log(`Lines with unguarded console.log: ${results[0].lines.join(', ')}`);
    
    // Print the actual console.log lines from the top file
    console.log('\nConsole log statements in the top file:');
    const topFileContent = fs.readFileSync(results[0].file, 'utf8');
    const topFileLines = topFileContent.split('\n');
    results[0].lines.forEach(lineNum => {
      console.log(`Line ${lineNum}: ${topFileLines[lineNum-1].trim()}`);
    });
  }
});