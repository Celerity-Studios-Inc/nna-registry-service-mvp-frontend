#!/usr/bin/env node

/**
 * Test script specifically for S.Pop.Pop_Hipster_Male_Stars (HPM) subcategory
 * 
 * This script creates multiple assets with the HPM subcategory to verify
 * if sequential numbering is relative (per subcategory) or absolute (layer-wide).
 * 
 * Usage: 
 * 1. Log in to the application to get a valid JWT token
 * 2. Run: node test-hipster-male-numbering.mjs YOUR_JWT_TOKEN
 */

import fs from 'fs';
import path from 'path';
import FormData from 'form-data';
import fetch from 'node-fetch';

// Configuration
const API_URL = process.env.API_URL || 'https://nna-registry-service-mvp-frontend.vercel.app/api/assets';
const AUTH_TOKEN = process.env.AUTH_TOKEN || process.argv[2] || '';
const TEST_IMAGE_PATH = './test-assets/test-image.png';
const NUM_ASSETS_TO_CREATE = 3; // Create multiple assets to observe sequence

// Taxonomy specific to this test
const LAYER = 'S';                         // Stars
const CATEGORY = 'Pop';                    // Using "Pop" exactly as in logs, not "POP"
const SUBCATEGORY = 'Pop_Hipster_Male_Stars'; // HPM subcategory

// Create a test image if needed
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

// Register an asset using the EXACT format from console logs
async function registerAsset(index) {
  console.log(`\n--- Creating HPM asset #${index+1} ---`);
  
  try {
    // Create FormData with exact format from logs
    const formData = new FormData();
    
    // Add file to FormData - CRITICAL
    formData.append('file', fs.createReadStream(TEST_IMAGE_PATH));
    
    // Add taxonomy values - using exact format from logs
    formData.append('layer', LAYER);
    formData.append('category', CATEGORY);
    formData.append('subcategory', SUBCATEGORY);
    
    // Add required fields
    formData.append('description', `HPM test #${index+1} - Validating sequential numbering`);
    formData.append('source', 'ReViz');
    
    // Add tags as JSON string (not array)
    formData.append('tags', JSON.stringify(['test', 'sequential-numbering', 'hpm']));
    
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
    
    // Empty components array
    formData.append('components[]', '');
    
    // Log what we're sending
    console.log(`Sending request to API...`);
    
    // Make the API request
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${AUTH_TOKEN}`
      },
      body: formData
    });
    
    console.log(`Response status: ${response.status}`);
    
    // Check response
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API error: ${response.status} - ${errorText}`);
    }
    
    // Parse response
    const responseText = await response.text();
    const data = JSON.parse(responseText);
    
    // Extract asset data
    const asset = data.data || data;
    
    // Extract important values
    const hfn = asset.name || '';
    const mfa = asset.nna_address || asset.nnaAddress || '';
    
    console.log(`✅ Created asset: ${hfn} (${mfa})`);
    
    return {
      index: index + 1,
      hfn,
      mfa,
      asset
    };
  } catch (error) {
    console.error(`❌ Error creating asset #${index+1}:`, error);
    return {
      index: index + 1,
      error: error.message
    };
  }
}

// Main function
async function testHipsterMaleNumbering() {
  console.log('=== Hipster Male Stars (HPM) Sequential Numbering Test ===');
  console.log('Date:', new Date().toISOString());
  
  // Check token
  if (!AUTH_TOKEN) {
    console.error('❌ No token provided. Please provide your JWT token as an argument.');
    console.error('Usage: node test-hipster-male-numbering.mjs YOUR_JWT_TOKEN');
    process.exit(1);
  }
  
  // Ensure test image exists
  createTestImage();
  console.log(`Using test image: ${TEST_IMAGE_PATH}`);
  
  // Create multiple assets to observe numbering pattern
  const results = [];
  
  for (let i = 0; i < NUM_ASSETS_TO_CREATE; i++) {
    const result = await registerAsset(i);
    results.push(result);
    
    // Delay between requests
    if (i < NUM_ASSETS_TO_CREATE - 1) {
      console.log('Waiting 2 seconds before next request...');
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
  
  // Analyze results
  console.log('\n=== Results Summary ===');
  console.log(`${results.length} assets created`);
  
  // Filter successful creations
  const successfulResults = results.filter(r => !r.error);
  console.log(`${successfulResults.length} successful, ${results.length - successfulResults.length} failed`);
  
  if (successfulResults.length > 0) {
    console.log('\n=== Sequential Numbering Analysis ===');
    
    // Extract sequential numbers from HFN (e.g., S.POP.HPM.007)
    const sequentialNumbers = successfulResults.map(r => {
      const parts = r.hfn.split('.');
      const seqNum = parts.length >= 4 ? parts[3] : null;
      return {
        index: r.index,
        hfn: r.hfn,
        mfa: r.mfa,
        sequentialNumber: seqNum
      };
    });
    
    // Sort by sequence number
    sequentialNumbers.sort((a, b) => {
      const numA = parseInt(a.sequentialNumber, 10);
      const numB = parseInt(b.sequentialNumber, 10);
      return numA - numB;
    });
    
    // Display all assets
    console.log('\nAll created assets:');
    sequentialNumbers.forEach(item => {
      console.log(`Asset #${item.index}: ${item.hfn} (${item.mfa})`);
    });
    
    // Check if sequence is continuous
    const isSequential = sequentialNumbers.every((item, i) => {
      if (i === 0) return true;
      
      const current = parseInt(item.sequentialNumber, 10);
      const previous = parseInt(sequentialNumbers[i-1].sequentialNumber, 10);
      
      return !isNaN(current) && !isNaN(previous) && current === previous + 1;
    });
    
    console.log(`\nSequential pattern: ${isSequential ? 'Continuous sequence' : 'Non-continuous sequence'}`);
    
    // Analyze numbering pattern
    if (sequentialNumbers.length >= 2) {
      const firstNum = parseInt(sequentialNumbers[0].sequentialNumber, 10);
      
      if (!isNaN(firstNum)) {
        if (firstNum <= 5) {
          console.log('\n🔍 ANALYSIS: Numbers starting from a low value (<=5) suggest a RELATIVE counter (per subcategory)');
          console.log('This indicates that HPM subcategory has its own sequence starting from 1');
        } else if (firstNum > 20) {
          console.log('\n🔍 ANALYSIS: Numbers starting from a higher value (>20) suggest an ABSOLUTE counter (layer-wide)');
          console.log('This indicates that HPM subcategory shares a sequence with other subcategories');
        } else {
          console.log('\n🔍 ANALYSIS: Inconclusive - numbers in the middle range could be either relative or absolute');
          console.log('More testing with other subcategories would be needed to determine the pattern');
        }
      }
    }
    
    console.log('\nRECOMMENDATION: Use the full test-sequential-numbering.mjs script to test all subcategories');
  }
}

// Run the test
testHipsterMaleNumbering().catch(err => {
  console.error('Test script failed with error:', err);
});