#!/usr/bin/env node

/**
 * This script tests different taxonomy combinations to find valid subcategories
 * for layer S and category POP
 */

import fetch from 'node-fetch';
import FormData from 'form-data';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current directory
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Configuration
const BACKEND_URL = 'https://registry.reviz.dev/api';
const TEST_FILE_PATH = path.join(__dirname, '..', 'test-assets', 'test-image.jpg');

// Subcategory options to try
const SUBCATEGORY_OPTIONS = [
  'BAS', // Base
  'BASE', // Another spelling of Base
  'DIV', // Pop_Diva_Female_Stars
  'IDF', // Pop_Idol_Female_Stars
  'GLB', // Global
  '001', // Numeric version
  'B', // First letter
  'POP', // Same as category
  '' // Empty
];

// Main function
async function testTaxonomyCombinations() {
  console.log('=== TESTING TAXONOMY COMBINATIONS ===');
  console.log('Date:', new Date().toISOString());
  
  // Get token from command line
  const token = process.argv[2];
  if (!token) {
    console.error('Error: No token provided');
    console.log('Usage: node test-taxonomy-combinations.mjs YOUR_TOKEN');
    process.exit(1);
  }
  
  // Check if test file exists
  if (!fs.existsSync(TEST_FILE_PATH)) {
    console.error(`Test file not found: ${TEST_FILE_PATH}`);
    console.log('Creating test file directory...');
    fs.mkdirSync(path.dirname(TEST_FILE_PATH), { recursive: true });
    
    console.log('Creating test image...');
    // Base64-encoded 1x1 pixel PNG
    const base64Image = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';
    fs.writeFileSync(TEST_FILE_PATH, Buffer.from(base64Image, 'base64'));
  }
  
  // Test each subcategory option
  for (const subcategory of SUBCATEGORY_OPTIONS) {
    console.log(`\n--- Testing subcategory: "${subcategory}" ---`);
    
    try {
      // Create FormData object
      const formData = new FormData();
      
      // Add file to FormData
      formData.append('file', fs.createReadStream(TEST_FILE_PATH));
      
      // Add required fields
      formData.append('layer', 'S');
      formData.append('category', 'POP');
      formData.append('subcategory', subcategory);
      formData.append('source', 'ReViz');
      formData.append('description', `Test with subcategory: ${subcategory}`);
      
      // Add other required fields
      formData.append('tags', JSON.stringify(['test', 'taxonomy-test']));
      formData.append('trainingData', JSON.stringify({
        prompts: [],
        images: [],
        videos: []
      }));
      formData.append('rights', JSON.stringify({
        source: 'Original',
        rights_split: '100%'
      }));
      
      // Try both formats for components
      formData.append('components[]', '');
      
      // Log what we're sending
      console.log(`Testing S.POP.${subcategory}`);
      
      // Send the request
      const response = await fetch(`${BACKEND_URL}/assets`, {
        method: 'POST',
        headers: {
          ...formData.getHeaders(),
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });
      
      console.log(`Response status: ${response.status} ${response.statusText}`);
      const responseText = await response.text();
      
      try {
        const responseData = JSON.parse(responseText);
        
        if (response.status >= 400) {
          console.log('Error:', responseData.message || responseData.error || 'Unknown error');
          if (responseData.errors) {
            console.log('Validation errors:', responseData.errors);
          }
        } else {
          console.log('SUCCESS! S.POP.' + subcategory + ' is valid!');
          console.log('Created asset ID:', responseData.data?.id || responseData.id || 'Unknown');
          return; // Exit on first success
        }
      } catch (e) {
        console.log('Response is not valid JSON');
        console.log('Raw response:', responseText);
      }
    } catch (error) {
      console.error('Error making request:', error);
    }
  }
}

// Run the test
testTaxonomyCombinations().catch(error => {
  console.error('Test failed:', error);
});