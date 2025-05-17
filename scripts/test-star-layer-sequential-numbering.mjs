#!/usr/bin/env node

/**
 * Star Layer Sequential Numbering Test Script
 * 
 * This script tests sequential numbering patterns for all category x subcategory 
 * combinations in the Star (S) layer to determine if they use absolute or relative counters.
 * 
 * Usage:
 *   AUTH_TOKEN=your_jwt_token node test-star-layer-sequential-numbering.mjs
 */

import fetch from 'node-fetch';
import fs from 'fs/promises';
import path from 'path';
import FormData from 'form-data';

// Configuration
const API_URL = process.env.API_URL || 'https://registry.reviz.dev/api';
const AUTH_TOKEN = process.env.AUTH_TOKEN || '';
const OUTPUT_FILE = './star-layer-sequential-test-results.json';
const SAMPLE_ASSETS_DIR = '/Users/ajaymadhok/nna-registry-workspace/nna-registry-service-mvp-frontend/Sample Assets/Stars';

// Star layer taxonomy combinations to test
const STAR_TAXONOMY = [
  // POP category subcategories
  { category: 'POP', subcategory: 'BAS', description: 'Base Pop Star' },
  { category: 'POP', subcategory: 'DIV', description: 'Pop Diva Female Star' },
  { category: 'POP', subcategory: 'IDF', description: 'Pop Idol Female Star' },
  { category: 'POP', subcategory: 'LGF', description: 'Pop Legend Female Star' },
  { category: 'POP', subcategory: 'LGM', description: 'Pop Legend Male Star' },
  { category: 'POP', subcategory: 'ICM', description: 'Pop Icon Male Star' },
  { category: 'POP', subcategory: 'HPM', description: 'Pop Hipster Male Star' },
  
  // ROK category subcategories
  { category: 'ROK', subcategory: 'BAS', description: 'Base Rock Star' },
  { category: 'ROK', subcategory: 'ICO', description: 'Rock Icon Star' },
  
  // HIP category subcategories
  { category: 'HIP', subcategory: 'BAS', description: 'Base Hip Hop Star' },
  
  // Alternative subcategories from other categories
  { category: 'IND', subcategory: 'BAS', description: 'Base Indie Star' },
  { category: 'ALT', subcategory: 'BAS', description: 'Base Alternative Star' }
];

// Sample asset files to use for testing
const getRandomSampleAsset = async () => {
  try {
    // Get list of available sample assets
    const files = await fs.readdir(SAMPLE_ASSETS_DIR);
    const imageFiles = files.filter(file => 
      file.toLowerCase().endsWith('.png') || 
      file.toLowerCase().endsWith('.jpg') ||
      file.toLowerCase().endsWith('.jpeg')
    );
    
    if (imageFiles.length === 0) {
      throw new Error('No image files found in sample assets directory');
    }
    
    // Pick a random sample asset
    const randomFile = imageFiles[Math.floor(Math.random() * imageFiles.length)];
    return path.join(SAMPLE_ASSETS_DIR, randomFile);
  } catch (error) {
    console.error('Error getting sample asset:', error);
    return null;
  }
};

/**
 * Upload a file to the API
 */
async function uploadFile(filePath) {
  try {
    console.log(`Uploading file: ${filePath}`);
    
    const form = new FormData();
    const fileStream = fs.createReadStream(filePath);
    form.append('file', fileStream);
    
    const response = await fetch(`${API_URL}/assets/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${AUTH_TOKEN}`
      },
      body: form
    });
    
    if (!response.ok) {
      throw new Error(`API error uploading file: ${response.status} ${response.statusText}`);
    }
    
    const result = await response.json();
    console.log(`File uploaded successfully: ${result.filename || 'unnamed'}`);
    
    return result;
  } catch (error) {
    console.error('Error uploading file:', error);
    return null;
  }
}

/**
 * Register a test asset with specific taxonomy
 */
async function registerTestAsset(category, subcategory, description, filePath) {
  try {
    console.log(`Testing: S.${category}.${subcategory}`);
    
    // Upload the file first
    const uploadResult = await uploadFile(filePath);
    if (!uploadResult) {
      throw new Error('File upload failed');
    }
    
    // Create the asset data
    const assetName = `Test S.${category}.${subcategory}`;
    const assetData = {
      name: assetName,
      layer: 'S',
      category: category,
      subcategory: subcategory,
      description: description || `${assetName} - Sequential number test`,
      source: 'Test',
      files: [
        {
          url: uploadResult.url,
          filename: uploadResult.filename,
          contentType: uploadResult.contentType || 'image/png',
          size: uploadResult.size || 0
        }
      ],
      tags: ['SequentialTest', category, subcategory],
      metadata: {
        test: true,
        sequentialTest: true,
        uploadId: uploadResult.filename
      }
    };
    
    console.log(`Registering asset: ${JSON.stringify(assetData, null, 2)}`);
    
    // Call the API to register the asset
    const response = await fetch(`${API_URL}/assets`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${AUTH_TOKEN}`
      },
      body: JSON.stringify(assetData)
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API error: ${response.status} ${response.statusText} - ${errorText}`);
    }
    
    const result = await response.json();
    console.log(`Asset registered: ${JSON.stringify(result, null, 2)}`);
    
    // Extract the assigned sequential number
    const hfn = result.name || '';
    const mfa = result.nna_address || result.metadata?.machineFriendlyAddress || '';
    
    const hfnParts = hfn.split('.');
    const mfaParts = mfa.split('.');
    
    const sequentialNumber = hfnParts.length === 4 ? hfnParts[3] : '';
    const mfaSequentialNumber = mfaParts.length === 4 ? mfaParts[3] : '';
    
    return {
      layer: 'S',
      category,
      subcategory,
      description,
      hfn,
      mfa,
      sequentialNumber,
      mfaSequentialNumber,
      timestamp: new Date().toISOString(),
      assetId: result.id || result._id
    };
  } catch (error) {
    console.error(`Error testing S.${category}.${subcategory}:`, error);
    return {
      layer: 'S',
      category,
      subcategory,
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * Run a second registration for the same taxonomy to check counter behavior
 */
async function testCounterBehavior() {
  // Create a results array
  const results = [];
  
  console.log("Starting Star Layer Sequential Numbering Tests...");
  
  // First round - Register one asset for each taxonomy combination
  console.log("\n=== ROUND 1: Initial Registration ===\n");
  
  for (const taxonomy of STAR_TAXONOMY) {
    // Get a random sample asset
    const sampleAsset = await getRandomSampleAsset();
    if (!sampleAsset) {
      console.error(`No sample asset available for S.${taxonomy.category}.${taxonomy.subcategory}`);
      continue;
    }
    
    // Register the asset
    const result = await registerTestAsset(
      taxonomy.category,
      taxonomy.subcategory,
      taxonomy.description,
      sampleAsset
    );
    
    results.push({
      ...result,
      round: 1
    });
    
    // Add a small delay between requests
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  // Save intermediate results
  await fs.writeFile(
    `${OUTPUT_FILE}.round1`,
    JSON.stringify(results.filter(r => r.round === 1), null, 2)
  );
  
  // Second round - Register another asset for each taxonomy to check counter behavior
  console.log("\n=== ROUND 2: Sequential Counter Testing ===\n");
  
  for (const taxonomy of STAR_TAXONOMY) {
    // Get a random sample asset
    const sampleAsset = await getRandomSampleAsset();
    if (!sampleAsset) {
      console.error(`No sample asset available for S.${taxonomy.category}.${taxonomy.subcategory}`);
      continue;
    }
    
    // Register the asset
    const result = await registerTestAsset(
      taxonomy.category,
      taxonomy.subcategory,
      `${taxonomy.description} - Second Registration`,
      sampleAsset
    );
    
    results.push({
      ...result,
      round: 2
    });
    
    // Add a small delay between requests
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  // Save all results
  await fs.writeFile(
    OUTPUT_FILE,
    JSON.stringify(results, null, 2)
  );
  
  console.log(`Test results saved to ${OUTPUT_FILE}`);
  
  // Analyze the results
  analyzeResults(results);
}

/**
 * Analyze results to identify sequential numbering patterns
 */
function analyzeResults(results) {
  // Group results by category.subcategory
  const grouped = {};
  
  for (const result of results) {
    if (result.error) continue;
    
    const key = `S.${result.category}.${result.subcategory}`;
    if (!grouped[key]) {
      grouped[key] = [];
    }
    
    grouped[key].push(result);
  }
  
  console.log("\n=== SEQUENTIAL NUMBERING ANALYSIS ===\n");
  console.log("Taxonomy | Round 1 Seq # | Round 2 Seq # | Counter Type | Notes");
  console.log("---------|--------------|--------------|--------------|-------");
  
  // Create a summary table
  const summary = [];
  
  // For each taxonomy combination, compare sequential numbers between rounds
  for (const [taxonomy, group] of Object.entries(grouped)) {
    // Skip if we don't have both rounds
    if (group.length < 2) continue;
    
    // Sort by round
    group.sort((a, b) => a.round - b.round);
    
    const round1 = group.find(r => r.round === 1);
    const round2 = group.find(r => r.round === 2);
    
    if (!round1 || !round2) continue;
    
    // Extract sequential numbers as integers for comparison
    const seq1 = parseInt(round1.sequentialNumber, 10);
    const seq2 = parseInt(round2.sequentialNumber, 10);
    
    // Determine counter type
    // If the second sequential number is close to the first one, 
    // it's likely a relative counter for this taxonomy
    const isRelativeCounter = seq2 === seq1 + 1 || seq2 === seq1 + 2;
    
    // Special cases like HPM are known to use relative counters
    const isKnownRelative = taxonomy.includes('.HPM');
    
    const counterType = isRelativeCounter || isKnownRelative ? 
      "RELATIVE" : "ABSOLUTE";
    
    // Add to summary
    summary.push({
      taxonomy,
      round1Seq: round1.sequentialNumber,
      round2Seq: round2.sequentialNumber,
      counterType,
      notes: isKnownRelative ? "Known relative counter" : ""
    });
    
    // Print result
    console.log(`${taxonomy} | ${round1.sequentialNumber} | ${round2.sequentialNumber} | ${counterType} | ${isKnownRelative ? "Known relative counter" : ""}`);
  }
  
  // Save summary
  fs.writeFile(
    `${OUTPUT_FILE}.summary`,
    JSON.stringify(summary, null, 2)
  );
  
  console.log("\nTest complete. Summary saved to:", `${OUTPUT_FILE}.summary`);
}

// Main function
async function main() {
  // Check if we have an auth token
  if (!AUTH_TOKEN) {
    console.error("ERROR: Please set the AUTH_TOKEN environment variable before running this script.");
    console.error("Example: AUTH_TOKEN=your_jwt_token node test-star-layer-sequential-numbering.mjs");
    process.exit(1);
  }
  
  // Run the counter behavior test
  await testCounterBehavior();
}

// Run the main function
main();