#!/usr/bin/env node

/**
 * NNA Registry Service Asset Registration Test
 * 
 * This script tests asset registration with the backend API.
 * Usage: node test-asset-registration.mjs YOUR_TOKEN
 */

import fs from 'fs';
import fetch from 'node-fetch';
import FormData from 'form-data';
import path from 'path';
import { fileURLToPath } from 'url';

// Define constants
const BACKEND_API = 'https://registry.reviz.dev/api';
const TEST_DIR = './test-assets';
const TEST_IMAGE_NAME = 'test-image.jpg';

// Get token from command line
let token = process.argv[2];
if (!token) {
  console.error('Error: No token provided');
  console.log('Usage: node test-asset-registration.mjs YOUR_TOKEN');
  console.log('Get a token by logging in to the app and copying it from localStorage');
  process.exit(1);
}

// Main function
async function testAssetRegistration() {
  console.log('=== NNA Registry Service Asset Registration Test ===');
  console.log('Date:', new Date().toISOString());
  
  // Create test directory and files
  await prepareTestFiles();
  
  // Test backend availability
  const backendAvailable = await testBackendAvailability(token);
  
  if (!backendAvailable) {
    console.error('❌ Backend API is not available or token is invalid. Cannot proceed with tests.');
    process.exit(1);
  }
  
  // Upload test file
  const uploadResult = await uploadFile(token);
  if (!uploadResult.success) {
    console.error('❌ File upload failed. Cannot proceed with asset creation.');
    process.exit(1);
  }
  
  // Create test asset
  const assetResult = await createAsset(token, uploadResult.fileUrl);
  
  // Display final results
  console.log('\n=== Test Results ===');
  console.log('Backend Availability:', backendAvailable ? '✅ Success' : '❌ Failed');
  console.log('File Upload:', uploadResult.success ? '✅ Success' : '❌ Failed');
  console.log('Asset Creation:', assetResult.success ? '✅ Success' : '❌ Failed');
  
  if (assetResult.success && assetResult.asset) {
    console.log('\n=== Created Asset Details ===');
    console.log('Asset ID:', assetResult.asset.id);
    console.log('Asset Name:', assetResult.asset.name);
    console.log('NNA Address:', assetResult.asset.nnaAddress);
  }
}

// Helper function to create test files
async function prepareTestFiles() {
  console.log('\n--- Preparing Test Files ---');
  
  // Create test directory if it doesn't exist
  if (!fs.existsSync(TEST_DIR)) {
    console.log(`Creating test directory: ${TEST_DIR}`);
    fs.mkdirSync(TEST_DIR);
  }
  
  // Create test image if it doesn't exist
  const testImagePath = path.join(TEST_DIR, TEST_IMAGE_NAME);
  if (!fs.existsSync(testImagePath)) {
    console.log(`Creating test image: ${testImagePath}`);
    
    // Create a simple 1px transparent GIF
    const base64Image = 'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
    const buffer = Buffer.from(base64Image, 'base64');
    fs.writeFileSync(testImagePath, buffer);
  } else {
    console.log(`Test image already exists: ${testImagePath}`);
  }
  
  return testImagePath;
}

// Test backend availability
async function testBackendAvailability(token) {
  console.log('\n--- Testing Backend Availability ---');
  try {
    console.log(`Sending GET request to: ${BACKEND_API}/assets`);
    
    const response = await fetch(`${BACKEND_API}/assets`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('Response status:', response.status);
    
    // Check if token is valid
    if (response.status === 401) {
      console.error('❌ Authentication failed! Token is likely invalid or expired.');
      console.error('Please provide a valid token from a logged-in session.');
      return false;
    }
    
    // Parse response
    const text = await response.text();
    try {
      const data = JSON.parse(text);
      console.log('Backend API is available and returned data:', 
                 data.success ? '✅ Success' : '❌ Failed');
      console.log(`Found ${data.data?.length || 0} assets`);
      return true;
    } catch (e) {
      console.error('Failed to parse response as JSON:', text.substring(0, 200));
      return false;
    }
  } catch (error) {
    console.error('Error accessing backend API:', error);
    return false;
  }
}

// Upload test file
async function uploadFile(token) {
  console.log('\n--- Uploading Test File ---');
  
  try {
    // Get test file path
    const testImagePath = path.join(TEST_DIR, TEST_IMAGE_NAME);
    console.log(`Using test file: ${testImagePath}`);
    
    // Create form data
    const formData = new FormData();
    formData.append('file', fs.createReadStream(testImagePath));
    
    // Upload file
    console.log(`Sending POST request to: ${BACKEND_API}/assets/upload`);
    
    const response = await fetch(`${BACKEND_API}/assets/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });
    
    console.log('Response status:', response.status);
    
    // Handle 404 for upload endpoint
    if (response.status === 404) {
      console.log('⚠️ Upload endpoint not found. This is expected if the backend uses a different endpoint.');
      console.log('Continuing with asset creation using local file...');
      return { 
        success: true, 
        fileUrl: null,
        message: 'Upload endpoint not available, will use direct file upload with asset creation'
      };
    }
    
    // Parse response
    const text = await response.text();
    try {
      const data = JSON.parse(text);
      console.log('File upload result:', data.success ? '✅ Success' : '❌ Failed');
      
      if (data.success && data.data && data.data.url) {
        console.log('File URL:', data.data.url);
        return { success: true, fileUrl: data.data.url };
      } else {
        console.error('Upload successful but no file URL in response:', data);
        return { success: false, error: 'No file URL in response' };
      }
    } catch (e) {
      console.error('Failed to parse response as JSON:', text.substring(0, 200));
      return { success: false, error: 'Invalid JSON response' };
    }
  } catch (error) {
    console.error('Error uploading file:', error);
    return { success: false, error: error.message };
  }
}

// Create test asset
async function createAsset(token, fileUrl = null) {
  console.log('\n--- Creating Test Asset ---');
  
  try {
    // Get test file path
    const testImagePath = path.join(TEST_DIR, TEST_IMAGE_NAME);
    
    // Create form data
    const formData = new FormData();
    
    // Always include file for direct upload if no fileUrl provided
    if (!fileUrl) {
      console.log('Adding file to request (direct upload)');
      formData.append('file', fs.createReadStream(testImagePath));
    }
    
    // Add all required fields
    const assetName = `Test Asset ${new Date().toISOString().replace(/[:.]/g, '-')}`;
    formData.append('name', assetName);
    formData.append('layer', 'S');
    formData.append('category', 'POP');
    formData.append('subcategory', 'BAS');
    formData.append('description', 'Test asset created via API testing script');
    formData.append('tags[]', 'test');
    formData.append('tags[]', 'api-test');
    
    // Add training data (required)
    formData.append('trainingData', JSON.stringify({
      prompts: [],
      images: [],
      videos: []
    }));
    
    // Add rights (required)
    formData.append('rights', JSON.stringify({
      source: 'Original',
      rights_split: '100%'
    }));
    
    // Add empty components array (required)
    formData.append('components[]', '');
    
    // If we have a file URL from previous upload, include it
    if (fileUrl) {
      console.log('Adding file URL from previous upload:', fileUrl);
      formData.append('fileUrl', fileUrl);
    }
    
    // Send request
    console.log(`Sending POST request to: ${BACKEND_API}/assets`);
    console.log('Form data fields:');
    
    // Log out all keys in formData 
    for (const [key, value] of Object.entries(formData)) {
      console.log(` - ${key}`);
    }
    
    const response = await fetch(`${BACKEND_API}/assets`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });
    
    console.log('Response status:', response.status);
    
    // Parse response
    const text = await response.text();
    try {
      const data = JSON.parse(text);
      console.log('Asset creation result:', data.success ? '✅ Success' : '❌ Failed');
      
      if (data.success && data.data) {
        return { success: true, asset: data.data };
      } else {
        console.error('Creation failed:', data.error || 'Unknown error');
        return { success: false, error: data.error || 'Unknown error' };
      }
    } catch (e) {
      console.error('Failed to parse response as JSON:', text.substring(0, 200));
      return { success: false, error: 'Invalid JSON response' };
    }
  } catch (error) {
    console.error('Error creating asset:', error);
    return { success: false, error: error.message };
  }
}

// Run the test
testAssetRegistration().catch(error => {
  console.error('Test script failed with error:', error);
});