#!/usr/bin/env node

/**
 * NNA Registry Service - FormData Structure Test Script
 * 
 * This script creates a FormData object with the exact structure expected by the backend API
 * and logs it for debugging and verification purposes.
 * 
 * Usage: node test-formdata-structure.mjs
 */

import FormData from 'form-data';
import fs from 'fs';
import path from 'path';

// Define test values
const TEST_LAYER = 'S';
const TEST_CATEGORY = 'Pop';
const TEST_SUBCATEGORY = 'Base';
const TEST_FILE_PATH = '../test-assets/test-image.jpg';
const TEST_DESCRIPTION = 'Test asset created for FormData structure verification';
const TEST_SOURCE = 'ReViz';
const TEST_TAGS = ['test', 'formdata', 'verification'];

// Helper function to display FormData contents
function logFormData(formData) {
  console.log('FormData structure:');
  
  // Log each key-value pair
  for (const [key, value] of Object.entries(formData.getBuffer ? formData.getBuffer() : {})) {
    if (key === 'file') {
      console.log(` - ${key}: [Binary File Data]`);
    } else {
      console.log(` - ${key}: ${value}`);
    }
  }
  
  // Log all boundary and content info for debugging
  console.log('\nFormData as multipart/form-data:');
  console.log(formData.getBuffer ? formData.getBuffer().toString() : 'Cannot display FormData buffer');
}

// Main function to test FormData structure
async function testFormDataStructure() {
  try {
    console.log('=== NNA Registry Service FormData Structure Test ===');
    
    // Create FormData object
    const formData = new FormData();
    
    // Check for test file
    const testFilePath = path.resolve(__dirname, TEST_FILE_PATH);
    if (!fs.existsSync(testFilePath)) {
      console.error(`Error: Test file not found at ${testFilePath}`);
      console.log('Creating a test directory and sample image...');
      
      // Create test directory if it doesn't exist
      const testDir = path.dirname(testFilePath);
      if (!fs.existsSync(testDir)) {
        fs.mkdirSync(testDir, { recursive: true });
      }
      
      // Create a simple 1px transparent GIF
      const base64Image = 'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
      const buffer = Buffer.from(base64Image, 'base64');
      fs.writeFileSync(testFilePath, buffer);
      console.log(`Created test image at: ${testFilePath}`);
    }
    
    // Add file to FormData
    console.log(`Adding file: ${testFilePath}`);
    formData.append('file', fs.createReadStream(testFilePath));
    
    // Add all required fields exactly as expected by backend
    formData.append('layer', TEST_LAYER);
    formData.append('category', TEST_CATEGORY);
    formData.append('subcategory', TEST_SUBCATEGORY);
    formData.append('description', TEST_DESCRIPTION);
    formData.append('source', TEST_SOURCE);
    
    // Convert tags array to JSON string
    formData.append('tags', JSON.stringify(TEST_TAGS));
    
    // Add empty trainingData and rights objects as JSON strings
    formData.append('trainingData', JSON.stringify({
      prompts: [],
      images: [],
      videos: []
    }));
    
    formData.append('rights', JSON.stringify({
      source: 'Original',
      rights_split: '100%'
    }));
    
    // Add empty components array
    formData.append('components[]', '');
    
    // Log FormData structure
    console.log('\nSuccessfully created FormData with proper structure');
    
    // List all FormData headers
    console.log('\nFormData fields:');
    console.log(' - file: [Binary File Data]');
    console.log(` - layer: ${TEST_LAYER}`);
    console.log(` - category: ${TEST_CATEGORY}`);
    console.log(` - subcategory: ${TEST_SUBCATEGORY}`);
    console.log(` - description: ${TEST_DESCRIPTION}`);
    console.log(` - source: ${TEST_SOURCE}`);
    console.log(` - tags: ${JSON.stringify(TEST_TAGS)}`);
    console.log(` - trainingData: ${JSON.stringify({prompts: [], images: [], videos: []})}`);
    console.log(` - rights: ${JSON.stringify({source: 'Original', rights_split: '100%'})}`);
    console.log(' - components[]: ""');
    
    console.log('\n=== Form Data Structure Reference ===');
    console.log(`
In your browser's Network panel, look for a POST request to /api/assets
and verify that the FormData shown in the request payload matches this structure.

Note that the 'name' field is NOT included as it will be rejected by the backend.
The backend determines the asset name based on taxonomy.
    `);
    
    console.log('\n=== Test Complete ===');

  } catch (error) {
    console.error('Error testing FormData structure:', error);
  }
}

// Run the test
testFormDataStructure();