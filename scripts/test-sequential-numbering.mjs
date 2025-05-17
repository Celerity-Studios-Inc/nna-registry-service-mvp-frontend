#!/usr/bin/env node

/**
 * NNA Registry Sequential Numbering Test Script
 * 
 * This script tests sequential numbering for the Star layer (S)
 * across all category and subcategory combinations using the exact
 * FormData structure from successful console logs.
 * 
 * Usage: 
 * 1. Log in to the application to get a valid JWT token
 * 2. Run: 
 *    AUTH_TOKEN=your_jwt_token node test-sequential-numbering.mjs
 *    OR
 *    node test-sequential-numbering.mjs YOUR_JWT_TOKEN
 *
 * The script will:
 * - Test all Star layer category and subcategory combinations
 * - Verify sequential numbering behavior
 * - Log the assigned NNA addresses for analysis
 */

import fs from 'fs';
import path from 'path';
import FormData from 'form-data';
import fetch from 'node-fetch';

// Configuration
const API_URL = process.env.API_URL || 'https://nna-registry-service-mvp-frontend.vercel.app/api/assets';
const AUTH_TOKEN = process.env.AUTH_TOKEN || process.argv[2] || '';
const OUTPUT_FILE = './sequential-numbering-results.json';
const TEST_DIR = './test-assets';
const TEST_IMAGE = 'test-image.png';

// Star layer taxonomy combinations to test
// Using the exact format from console logs (Pop, not POP, etc.)
const TAXONOMY_COMBINATIONS = [
  // Pop category
  { layer: 'S', category: 'Pop', subcategory: 'Base' },
  { layer: 'S', category: 'Pop', subcategory: 'Pop_Diva_Female_Stars' },
  { layer: 'S', category: 'Pop', subcategory: 'Pop_Hipster_Male_Stars' },
  { layer: 'S', category: 'Pop', subcategory: 'Pop_Legendary_Female_Stars' },
  { layer: 'S', category: 'Pop', subcategory: 'Pop_Legendary_Male_Stars' },
  { layer: 'S', category: 'Pop', subcategory: 'Pop_Alternative_Stars' },
  
  // Rock category
  { layer: 'S', category: 'Rock', subcategory: 'Base' },
  { layer: 'S', category: 'Rock', subcategory: 'Rock_Alternative_Stars' },
  { layer: 'S', category: 'Rock', subcategory: 'Rock_Classic_Stars' },
  
  // Jazz category
  { layer: 'S', category: 'Jazz', subcategory: 'Base' },
  
  // Hip-Hop category
  { layer: 'S', category: 'Hip-Hop', subcategory: 'Base' },
  
  // Electronic category
  { layer: 'S', category: 'Electronic', subcategory: 'Base' }
];

// Results storage
const results = [];

/**
 * Register a test asset with exact format from console logs
 */
async function registerAsset(layer, category, subcategory, imagePath) {
  console.log(`Testing: ${layer}.${category}.${subcategory}`);
  
  try {
    // Create a FormData object with EXACT format from console logs
    const formData = new FormData();
    
    // Add file to FormData - CRITICAL
    formData.append('file', fs.createReadStream(imagePath));
    
    // Add exact format seen in logs - category is "Pop" not "POP"
    formData.append('layer', layer);
    formData.append('category', category);
    formData.append('subcategory', subcategory);
    formData.append('description', `Sequential numbering test for ${layer}.${category}.${subcategory}`);
    formData.append('source', 'ReViz');
    
    // Add tags as JSON string
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
    
    // Empty components array with exact syntax
    formData.append('components[]', '');
    
    // Log what we're sending
    console.log(`Sending request to ${API_URL}`);
    
    // Make the API request
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
    try {
      const data = JSON.parse(responseText);
      
      // Extract asset data
      const assetData = data.data || data;
      
      // Extract important fields
      const hfn = assetData.name || '';
      const mfa = assetData.nna_address || assetData.nnaAddress || '';
      
      // Extract sequential numbers
      const hfnParts = hfn.split('.');
      const mfaParts = mfa.split('.');
      
      const sequentialNumber = hfnParts.length >= 4 ? hfnParts[3] : '';
      const mfaSequentialNumber = mfaParts.length >= 4 ? mfaParts[3] : '';
      
      console.log(`✅ Created asset: ${hfn} (${mfa})`);
      
      return {
        layer,
        category,
        subcategory,
        assetData: assetData,
        hfn,
        mfa,
        sequentialNumber,
        mfaSequentialNumber,
        timestamp: new Date().toISOString()
      };
    } catch (e) {
      console.error('Failed to parse response:', e);
      throw new Error(`Invalid JSON response: ${responseText.slice(0, 100)}...`);
    }
  } catch (error) {
    console.error(`❌ Error testing ${layer}.${category}.${subcategory}:`, error.message);
    return {
      layer,
      category,
      subcategory,
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * Prepare the test image
 */
async function prepareTestImage() {
  // Create test directory if needed
  if (!fs.existsSync(TEST_DIR)){
    fs.mkdirSync(TEST_DIR, { recursive: true });
  }
  
  const imagePath = path.join(TEST_DIR, TEST_IMAGE);
  
  // Create a test image if it doesn't exist
  if (!fs.existsSync(imagePath)) {
    console.log('Creating test image...');
    
    // Create a simple 1x1 pixel PNG
    const base64Image = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';
    const buffer = Buffer.from(base64Image, 'base64');
    fs.writeFileSync(imagePath, buffer);
    
    console.log(`Created test image at ${imagePath}`);
  }
  
  return imagePath;
}

/**
 * Run all the test cases
 */
async function runTests() {
  console.log("=== NNA Registry Sequential Numbering Test ===");
  console.log("Date:", new Date().toISOString());
  
  // Check if we have an auth token
  if (!AUTH_TOKEN) {
    console.error("❌ ERROR: Please provide an authentication token!");
    console.error("Usage: AUTH_TOKEN=your_jwt_token node test-sequential-numbering.mjs");
    console.error("   OR: node test-sequential-numbering.mjs YOUR_JWT_TOKEN");
    process.exit(1);
  }
  
  // Prepare test image
  const imagePath = await prepareTestImage();
  console.log(`Using test image: ${imagePath}`);
  
  // Run tests for each taxonomy combination
  for (const combo of TAXONOMY_COMBINATIONS) {
    // Register test asset
    const result = await registerAsset(
      combo.layer,
      combo.category,
      combo.subcategory,
      imagePath
    );
    
    // Store result
    results.push(result);
    
    // Delay between requests to avoid overwhelming the API
    await new Promise(resolve => setTimeout(resolve, 1500));
  }
  
  // Save results to file
  fs.writeFileSync(
    OUTPUT_FILE,
    JSON.stringify(results, null, 2)
  );
  
  console.log(`\nTest results saved to ${OUTPUT_FILE}`);
  
  // Analyze sequential numbering patterns
  analyzeSequentialNumbering(results);
}

/**
 * Analyze the sequential numbering patterns
 */
function analyzeSequentialNumbering(results) {
  console.log("\n=== SEQUENTIAL NUMBERING ANALYSIS ===\n");
  
  // Filter out errors
  const validResults = results.filter(r => !r.error);
  
  // Group by layer.category
  const groupedByLayerCategory = {};
  
  for (const result of validResults) {
    const key = `${result.layer}.${result.category}`;
    if (!groupedByLayerCategory[key]) {
      groupedByLayerCategory[key] = [];
    }
    
    groupedByLayerCategory[key].push(result);
  }
  
  // For each layer.category group, analyze sequential numbers
  for (const [layerCategory, group] of Object.entries(groupedByLayerCategory)) {
    console.log(`\n${layerCategory} Subcategories:`);
    console.log("-".repeat(50));
    
    // Sort by subcategory
    group.sort((a, b) => a.subcategory.localeCompare(b.subcategory));
    
    for (const item of group) {
      console.log(`${item.subcategory}:`);
      console.log(`  HFN: ${item.hfn}`);
      console.log(`  MFA: ${item.mfa}`);
      
      // Sequential number analysis
      const seqNum = parseInt(item.sequentialNumber, 10);
      const mfaSeqNum = parseInt(item.mfaSequentialNumber, 10);
      
      // Basic counter type determination - this is a heuristic
      let counterType = "Unknown";
      if (!isNaN(seqNum)) {
        if (seqNum <= 10 && item.subcategory !== 'Base') {
          counterType = "Likely RELATIVE (subcategory has its own counter)";
        } else if (seqNum > 100) {
          counterType = "Likely ABSOLUTE (layer-wide counter)";
        } else {
          counterType = "Possibly CATEGORY counter (shared within category)";
        }
      }
      
      console.log(`  HFN Sequential Number: ${item.sequentialNumber}`);
      console.log(`  MFA Sequential Number: ${item.mfaSequentialNumber}`);
      console.log(`  Counter Type: ${counterType}`);
    }
  }
  
  // Overall pattern analysis
  console.log("\n=== OVERALL PATTERN ANALYSIS ===\n");
  
  // Extract all sequential numbers
  const seqNumbers = validResults
    .map(r => parseInt(r.sequentialNumber, 10))
    .filter(n => !isNaN(n))
    .sort((a, b) => a - b);
  
  // Check if numbers form a continuous sequence
  const isSequential = seqNumbers.every((num, i) => {
    return i === 0 || num === seqNumbers[i-1] + 1;
  });
  
  console.log(`Total assets created: ${validResults.length}`);
  console.log(`Sequential numbers found: ${seqNumbers.join(', ')}`);
  console.log(`Continuous sequence: ${isSequential ? 'Yes' : 'No'}`);
  
  if (seqNumbers.length > 0) {
    console.log(`Lowest number: ${seqNumbers[0]}`);
    console.log(`Highest number: ${seqNumbers[seqNumbers.length - 1]}`);
  }
  
  // Analyze by subcategory
  console.log("\n=== SUBCATEGORY COUNTER ANALYSIS ===\n");
  
  // Group by subcategory
  const bySubcategory = {};
  for (const result of validResults) {
    if (!bySubcategory[result.subcategory]) {
      bySubcategory[result.subcategory] = [];
    }
    bySubcategory[result.subcategory].push(result);
  }
  
  // Check numbers within each subcategory
  for (const [subcategory, items] of Object.entries(bySubcategory)) {
    const subSeqNumbers = items
      .map(r => parseInt(r.sequentialNumber, 10))
      .filter(n => !isNaN(n))
      .sort((a, b) => a - b);
    
    console.log(`${subcategory}: ${subSeqNumbers.join(', ')}`);
    
    // If we have multiple items for a subcategory, check if they're sequential
    if (subSeqNumbers.length > 1) {
      const isSubSequential = subSeqNumbers.every((num, i) => {
        return i === 0 || num === subSeqNumbers[i-1] + 1;
      });
      
      console.log(`  Sequential within subcategory: ${isSubSequential ? 'Yes' : 'No'}`);
    }
  }
  
  console.log("\nNOTE: For accurate determination of relative vs. absolute counters, more tests per subcategory are needed.");
}

// Run the tests
runTests();