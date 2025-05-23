#!/usr/bin/env node

/**
 * Console Log Detection Script
 * 
 * This script scans the codebase for unguarded console.log statements
 * that might be executed in production. It helps identify places where
 * console logs should be replaced with environmentSafeLog or other
 * appropriate logging utilities.
 * 
 * Usage:
 *   node detect-unguarded-logs.js
 */

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

// Configure colors for terminal output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
};

// Define patterns to search for
const patterns = [
  {
    name: 'Unguarded console.log',
    regex: /console\.log\(/g,
    exclude: /process\.env\.NODE_ENV|isProduction\(\)|isDevelopment\(\)|isDebuggingAllowed\(\)|environmentSafeLog/,
    severity: 'high',
    color: colors.red
  },
  {
    name: 'Unguarded console.warn',
    regex: /console\.warn\(/g,
    exclude: /process\.env\.NODE_ENV|isProduction\(\)|isDevelopment\(\)|isDebuggingAllowed\(\)|environmentSafeWarn/,
    severity: 'high',
    color: colors.red
  },
  {
    name: 'Unguarded console.info',
    regex: /console\.info\(/g,
    exclude: /process\.env\.NODE_ENV|isProduction\(\)|isDevelopment\(\)|isDebuggingAllowed\(\)|environmentSafeInfo/,
    severity: 'high',
    color: colors.red
  },
  {
    name: 'Unguarded console.debug',
    regex: /console\.debug\(/g,
    exclude: /process\.env\.NODE_ENV|isProduction\(\)|isDevelopment\(\)|isDebuggingAllowed\(\)|environmentSafeDebug/,
    severity: 'high',
    color: colors.red
  },
  {
    name: 'Direct NODE_ENV check',
    regex: /process\.env\.NODE_ENV/g,
    exclude: /environment\.ts|logger\.ts|envCheck\.ts/,
    severity: 'medium',
    color: colors.yellow
  },
  {
    name: 'localStorage access without try/catch',
    regex: /localStorage\./g,
    exclude: /try\s*{[^}]*localStorage|environment\.ts|safeLocalStorageGet/,
    severity: 'medium',
    color: colors.yellow
  }
];

// Define directories to exclude
const excludeDirs = [
  'node_modules',
  'build',
  'dist',
  'coverage',
  '.git',
  'scripts'
];

// Define file extensions to scan
const includeExts = [
  '.ts',
  '.tsx',
  '.js',
  '.jsx'
];

console.log(`${colors.cyan}=== Console Log Detection Tool ===${colors.reset}`);
console.log(`${colors.cyan}Scanning for unguarded console logs in the codebase...${colors.reset}\n`);

// Get the source directory
const srcDir = path.join(__dirname, '../src');

// Keep track of issues found
let issuesFound = 0;
let fileWithIssues = 0;
const issuesByType = {};

// Initialize counters for each pattern
patterns.forEach(pattern => {
  issuesByType[pattern.name] = 0;
});

// Function to scan a file
function scanFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const fileName = path.relative(process.cwd(), filePath);
    let fileHasIssues = false;
    
    // Check each pattern
    patterns.forEach(pattern => {
      const matches = content.match(pattern.regex);
      
      if (matches) {
        // Check if the match has the exclude pattern nearby
        const lines = content.split('\n');
        let issueCount = 0;
        
        lines.forEach((line, index) => {
          if (pattern.regex.test(line)) {
            // Reset the regex state
            pattern.regex.lastIndex = 0;
            
            // Check if the exclude pattern is present in context (5 lines before and after)
            const contextStart = Math.max(0, index - 5);
            const contextEnd = Math.min(lines.length - 1, index + 5);
            const context = lines.slice(contextStart, contextEnd + 1).join('\n');
            
            if (!pattern.exclude.test(context)) {
              if (!fileHasIssues) {
                console.log(`\n${colors.magenta}File: ${fileName}${colors.reset}`);
                fileHasIssues = true;
                fileWithIssues++;
              }
              
              issueCount++;
              issuesFound++;
              issuesByType[pattern.name]++;
              
              // Print the issue with line numbers and context
              console.log(`${pattern.color}[${pattern.severity.toUpperCase()}] Line ${index + 1}: ${pattern.name}${colors.reset}`);
              console.log(`${colors.white}${line.trim()}${colors.reset}`);
              
              // Suggest a fix
              console.log(`${colors.green}Suggested fix: Replace with appropriate safe logging utility from environment.ts${colors.reset}`);
            }
          }
        });
      }
    });
    
    return fileHasIssues;
  } catch (err) {
    console.error(`Error scanning file ${filePath}: ${err.message}`);
    return false;
  }
}

// Function to recursively scan a directory
function scanDirectory(dirPath) {
  try {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);
      
      if (entry.isDirectory()) {
        // Skip excluded directories
        if (excludeDirs.includes(entry.name)) {
          continue;
        }
        
        scanDirectory(fullPath);
      } else if (entry.isFile()) {
        // Check file extension
        const ext = path.extname(entry.name).toLowerCase();
        if (includeExts.includes(ext)) {
          scanFile(fullPath);
        }
      }
    }
  } catch (err) {
    console.error(`Error scanning directory ${dirPath}: ${err.message}`);
  }
}

// Start scanning from the source directory
scanDirectory(srcDir);

// Print summary
console.log(`\n${colors.cyan}=== Scan Summary ===${colors.reset}`);
console.log(`${colors.white}Total issues found: ${issuesFound}${colors.reset}`);
console.log(`${colors.white}Files with issues: ${fileWithIssues}${colors.reset}`);
console.log(`\n${colors.cyan}Issues by type:${colors.reset}`);

for (const [patternName, count] of Object.entries(issuesByType)) {
  if (count > 0) {
    const pattern = patterns.find(p => p.name === patternName);
    console.log(`${pattern.color}${patternName}: ${count}${colors.reset}`);
  }
}

if (issuesFound === 0) {
  console.log(`\n${colors.green}No unguarded console logs found! 🎉${colors.reset}`);
} else {
  console.log(`\n${colors.yellow}Found ${issuesFound} potential issues that should be addressed.${colors.reset}`);
  console.log(`${colors.cyan}Recommendation: Replace direct console.log calls with environmentSafeLog from environment.ts${colors.reset}`);
}

console.log(`\n${colors.cyan}=== Done ===${colors.reset}`);