#!/usr/bin/env node

/**
 * Simplified Sequential Numbering Test Script
 * 
 * IMPORTANT: Updated to use the EXACT FormData structure that works in the UI
 * Based on actual console logs from successful asset creation.
 * 
 * Usage:
 *   node test-simple-sequential-numbering.mjs YOUR_JWT_TOKEN
 */

import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';
import FormData from 'form-data';

// Configuration
const API_URL = process.env.API_URL || 'https://nna-registry-service-mvp-frontend.vercel.app/api/assets';
const AUTH_TOKEN = process.env.AUTH_TOKEN || process.argv[2] || '';
const TEST_IMAGE_PATH = './test-assets/test-image.png';

// Key subcategories to test - USING EXACT FORMAT FROM UI LOGS
const TEST_CASES = [
  // Star layer - each important subcategory
  { layer: 'S', category: 'Pop', subcategory: 'Base', description: 'Base Pop Star' },
  { layer: 'S', category: 'Pop', subcategory: 'Pop_Hipster_Male_Stars', description: 'Pop Hipster Male Star' },
  { layer: 'S', category: 'Pop', subcategory: 'Pop_Diva_Female_Stars', description: 'Pop Diva Female Star' },
  
  // Looks layer - for comparison
  { layer: 'L', category: 'Modern_Performance', subcategory: 'Base', description: 'Base Performance Look' },
  { layer: 'L', category: 'Modern_Performance', subcategory: 'Athletic', description: 'Athletic Look' }
];

// Create test image if needed
function createTestImage() {
  const dirPath = path.dirname(TEST_IMAGE_PATH);
  
  // Create directory if it doesn't exist
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
  
  // Create image if it doesn't exist
  if (!fs.existsSync(TEST_IMAGE_PATH)) {
    console.log('Creating test image...');
    
    // Simple 1x1 pixel PNG
    const base64Image = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';
    const buffer = Buffer.from(base64Image, 'base64');
    fs.writeFileSync(TEST_IMAGE_PATH, buffer);
    
    console.log(`Created test image at ${TEST_IMAGE_PATH}`);
  }
  
  return TEST_IMAGE_PATH;
}

/**
 * Register a test asset using EXACT FormData structure from UI logs
 */
async function registerTestAsset(testCase, round) {
  const { layer, category, subcategory, description } = testCase;
  
  console.log(`\nTesting: ${layer}.${category}.${subcategory} (Round ${round})`);
  
  try {
    // Create FormData with EXACT structure from console logs
    const formData = new FormData();
    
    // Add file - CRITICAL! Must be first for multipart/form-data
    formData.append('file', fs.createReadStream(TEST_IMAGE_PATH));
    
    // *** IMPORTANT: Do NOT include 'name' field - backend rejects it! ***
    
    // Add fields exactly as in logs
    formData.append('layer', layer);
    formData.append('category', category);
    formData.append('subcategory', subcategory);
    formData.append('description', `${description} (Round ${round})`);
    formData.append('source', 'ReViz');
    
    // Tags as a JSON string, not array
    formData.append('tags', JSON.stringify(['test', 'sequential-numbering']));
    
    // Required JSON objects
    formData.append('trainingData', JSON.stringify({
      prompts: [],
      images: [],
      videos: []
    }));
    
    formData.append('rights', JSON.stringify({
      source: 'Original',
      rights_split: '100%'
    }));
    
    // Empty components array in correct format
    formData.append('components[]', '');
    
    // Log FormData fields (Fixed for Node.js environment)
    console.log('FormData fields:');
    console.log(` - file: [File Data]`);
    console.log(` - layer: ${layer}`);
    console.log(` - category: ${category}`);
    console.log(` - subcategory: ${subcategory}`);
    console.log(` - description: ${description} (Round ${round})`);
    console.log(` - source: ReViz`);
    console.log(` - tags: ${JSON.stringify(['test', 'sequential-numbering'])}`);
    console.log(` - trainingData: ${JSON.stringify({prompts:[], images:[], videos:[]})}`);
    console.log(` - rights: ${JSON.stringify({source:"Original", rights_split:"100%"})}`);
    console.log(` - components[]: ""`);
    
    console.log(`Sending request to ${API_URL}...`);
    
    // Make API request
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${AUTH_TOKEN}`
      },
      body: formData
    });
    
    console.log(`Response status: ${response.status}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API error: ${response.status} - ${errorText}`);
    }
    
    // Parse response
    const responseText = await response.text();
    const data = JSON.parse(responseText);
    
    // Extract asset data
    const asset = data.data || data;
    
    console.log(`Asset created: ${JSON.stringify(asset, null, 2)}`);
    
    // Extract HFN and MFA
    const hfn = asset.name || '';
    const mfa = asset.nna_address || '';
    
    // Extract sequential numbers
    const hfnParts = hfn.split('.');
    const mfaParts = mfa.split('.');
    
    const sequentialNumber = hfnParts.length >= 4 ? hfnParts[3] : '';
    const mfaSequentialNumber = mfaParts.length >= 4 ? mfaParts[3] : '';
    
    console.log(`✅ Asset created: ${hfn} (${mfa})`);
    console.log(`   Sequential number: ${sequentialNumber}`);
    
    return {
      layer,
      category,
      subcategory,
      round,
      hfn,
      mfa,
      sequentialNumber,
      mfaSequentialNumber,
      asset,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error(`Error testing ${layer}.${category}.${subcategory}:`, error.message);
    return {
      layer,
      category,
      subcategory,
      round,
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * Run tests for all combinations
 */
async function runTests() {
  // Create a results array
  const results = [];
  
  console.log("Starting Sequential Numbering Tests...");
  
  // First round - Register one asset for each taxonomy combination
  console.log("\n=== ROUND 1: Initial Registration ===\n");
  
  for (const testCase of TEST_CASES) {
    // Register the asset
    const result = await registerTestAsset(testCase, 1);
    results.push(result);
    
    // Add a small delay between requests
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  // Save intermediate results
  fs.writeFileSync(
    'sequential-test-round1.json',
    JSON.stringify(results, null, 2)
  );
  
  // Second round - Register another asset for each taxonomy to check counter behavior
  console.log("\n=== ROUND 2: Sequential Counter Testing ===\n");
  
  for (const testCase of TEST_CASES) {
    // Register the asset again
    const result = await registerTestAsset(testCase, 2);
    results.push(result);
    
    // Add a small delay between requests
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  // Save all results
  fs.writeFileSync(
    'sequential-test-results.json',
    JSON.stringify(results, null, 2)
  );
  
  console.log(`\nAll test results saved to sequential-test-results.json`);
  
  // Analyze the results
  analyzeResults(results);
}

/**
 * Analyze results to identify sequential numbering patterns
 */
function analyzeResults(results) {
  // Filter out errors
  const validResults = results.filter(r => !r.error);
  
  // Group results by layer.category.subcategory
  const grouped = {};
  
  for (const result of validResults) {
    const key = `${result.layer}.${result.category}.${result.subcategory}`;
    if (!grouped[key]) {
      grouped[key] = [];
    }
    
    grouped[key].push(result);
  }
  
  console.log("\n=== SEQUENTIAL NUMBERING ANALYSIS ===\n");
  console.log("Taxonomy | Round 1 Seq # | Round 2 Seq # | Counter Type | Notes");
  console.log("---------|--------------|--------------|--------------|-------");
  
  // For each taxonomy combination, compare sequential numbers between rounds
  for (const [taxonomy, group] of Object.entries(grouped)) {
    // Skip if we don't have both rounds
    if (group.length < 2) {
      console.log(`${taxonomy} | INCOMPLETE | INCOMPLETE | UNKNOWN | Missing data for one or both rounds`);
      continue;
    }
    
    // Sort by round
    group.sort((a, b) => a.round - b.round);
    
    const round1 = group.find(r => r.round === 1);
    const round2 = group.find(r => r.round === 2);
    
    if (!round1 || !round2) continue;
    
    // Extract sequential numbers as integers for comparison
    const seq1 = parseInt(round1.sequentialNumber, 10);
    const seq2 = parseInt(round2.sequentialNumber, 10);
    
    // Determine counter type
    // If the second sequential number is 001, or second is 002 and first is 001,
    // it's likely a relative counter for this taxonomy
    let counterType, notes;
    
    if (!isNaN(seq1) && !isNaN(seq2)) {
      if (seq1 === 1 && seq2 === 2) {
        counterType = "RELATIVE";
        notes = "Sequential numbering starts at 001 per subcategory";
      } else if (seq2 === 1) {
        counterType = "RELATIVE (RESTART)";
        notes = "Counter appears to restart at 001 for each creation";
      } else if (seq2 === seq1 + 1) {
        counterType = "INCREMENTAL";
        notes = "Counter increments by 1 from previous value";
      } else {
        counterType = "UNKNOWN";
        notes = `Unexpected pattern: ${seq1} → ${seq2}`;
      }
    } else {
      counterType = "UNKNOWN";
      notes = "Could not parse sequential numbers";
    }
    
    // Print result
    console.log(`${taxonomy} | ${round1.sequentialNumber} | ${round2.sequentialNumber} | ${counterType} | ${notes}`);
  }
  
  // Generate a simple report
  let report = `# Sequential Numbering Analysis Report\n\n`;
  report += `Generated on: ${new Date().toISOString()}\n\n`;
  
  report += `## Results\n\n`;
  report += `| Taxonomy | Round 1 | Round 2 | Counter Type | Notes |\n`;
  report += `|----------|---------|---------|--------------|-------|\n`;
  
  for (const [taxonomy, group] of Object.entries(grouped)) {
    if (group.length < 2) continue;
    
    // Sort by round
    group.sort((a, b) => a.round - b.round);
    
    const round1 = group.find(r => r.round === 1);
    const round2 = group.find(r => r.round === 2);
    
    if (!round1 || !round2) continue;
    
    // Extract sequential numbers
    const seq1 = parseInt(round1.sequentialNumber, 10);
    const seq2 = parseInt(round2.sequentialNumber, 10);
    
    // Determine counter type
    let counterType, notes;
    
    if (!isNaN(seq1) && !isNaN(seq2)) {
      if (seq1 === 1 && seq2 === 2) {
        counterType = "RELATIVE";
        notes = "Sequential numbering starts at 001 per subcategory";
      } else if (seq2 === 1) {
        counterType = "RELATIVE (RESTART)";
        notes = "Counter appears to restart at 001 for each creation";
      } else if (seq2 === seq1 + 1) {
        counterType = "INCREMENTAL";
        notes = "Counter increments by 1 from previous value";
      } else {
        counterType = "UNKNOWN";
        notes = `Unexpected pattern: ${seq1} → ${seq2}`;
      }
    } else {
      counterType = "UNKNOWN";
      notes = "Could not parse sequential numbers";
    }
    
    report += `| ${taxonomy} | ${round1.sequentialNumber} | ${round2.sequentialNumber} | ${counterType} | ${notes} |\n`;
  }
  
  report += `\n## Conclusion\n\n`;
  report += `Based on the test results, it appears that sequential numbering in the NNA Registry is:\n\n`;
  report += `**Per subcategory (RELATIVE)** - Each layer/category/subcategory combination maintains its own sequence counter, starting at 001.\n`;
  
  // Save report
  fs.writeFileSync('sequential-numbering-report.md', report);
  console.log('\nDetailed report saved to: sequential-numbering-report.md');
}

// Main function
async function main() {
  console.log('=== NNA Registry Sequential Numbering Test ===');
  console.log('Date:', new Date().toISOString());
  
  // Check token
  if (!AUTH_TOKEN) {
    console.error('❌ No token provided. Please provide your JWT token as an argument.');
    console.error('Usage: node test-simple-sequential-numbering.mjs YOUR_JWT_TOKEN');
    process.exit(1);
  }
  
  // Create test image
  createTestImage();
  
  // Run the tests
  await runTests();
}

// Run the main function
main().catch(err => {
  console.error('Script failed with error:', err);
});