#!/usr/bin/env node

/**
 * Final solution test for asset creation
 * This script tests the final solution for asset creation with the backend API
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

// Main function
async function testFinalSolution() {
  console.log('=== TESTING FINAL SOLUTION FOR ASSET CREATION ===');
  console.log('Date:', new Date().toISOString());
  
  // Get token from command line
  const token = process.argv[2];
  if (!token) {
    console.error('Error: No token provided');
    console.log('Usage: node test-final-solution.mjs YOUR_TOKEN');
    console.log('Get a token by logging in to the app and copying it from localStorage');
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
  
  // Create the final solution FormData
  const formData = new FormData();
  
  // Add file to FormData
  formData.append('file', fs.createReadStream(TEST_FILE_PATH));

  // FINAL SOLUTION: Add all required fields in the exact format expected by backend
  // Using the format from test-asset-registration.mjs which is known to work

  // Do NOT include 'name' - backend rejects it
  // formData.append('name', `Test Asset ${new Date().toISOString()}`);

  formData.append('layer', 'S');
  formData.append('category', 'POP');
  formData.append('subcategory', 'BAS');
  formData.append('source', 'ReViz');
  formData.append('description', 'Final solution test description');

  // Use array-style format for tags
  formData.append('tags[]', 'test');
  formData.append('tags[]', 'final-solution');

  // Add nested objects
  formData.append('trainingData', JSON.stringify({
    prompts: [],
    images: [],
    videos: []
  }));

  formData.append('rights', JSON.stringify({
    source: 'Original',
    rights_split: '100%'
  }));

  // Components - use empty array format
  formData.append('components[]', '');
  
  // Log what we're sending
  console.log('Sending FormData with fields:');
  console.log(' - file (File Stream)');
  console.log(' - layer: S');
  console.log(' - category: POP');
  console.log(' - subcategory: BAS');
  console.log(' - source: ReViz');
  console.log(' - description: Final solution test description');
  console.log(' - tags[]: test, final-solution');
  console.log(' - trainingData: {}');
  console.log(' - rights: {source: "Original", rights_split: "100%"}');
  console.log(' - components[]: ""');
  
  // Send the request
  try {
    console.log(`Sending request to ${BACKEND_URL}/assets`);
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
        console.log('FINAL SOLUTION TEST FAILED!');
        console.log('Error:', responseData.message || responseData.error || 'Unknown error');
        if (responseData.errors) {
          console.log('Validation errors:', responseData.errors);
        }
      } else {
        console.log('FINAL SOLUTION TEST SUCCEEDED!');
        console.log('Created asset ID:', responseData.data?.id || responseData.id || 'Unknown');
        console.log('✅ This confirms our solution works!');
      }
      
      console.log('Response data:', JSON.stringify(responseData, null, 2));
    } catch (e) {
      console.log('Response is not valid JSON');
      console.log('Raw response:', responseText);
    }
  } catch (error) {
    console.error('Error making request:', error);
  }
}

// Run the test
testFinalSolution().catch(error => {
  console.error('Test failed:', error);
});