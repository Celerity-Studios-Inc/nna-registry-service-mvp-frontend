/**
 * Direct test against the backend API
 * This script bypasses the frontend and directly tests what the backend expects
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
const TEST_CREDENTIALS = {
  email: 'test@example.com',
  password: 'password123'
};

// Helper to get an authentication token
async function getAuthToken() {
  try {
    console.log('Attempting to login to backend directly...');
    const response = await fetch(`${BACKEND_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: TEST_CREDENTIALS.email,
        password: TEST_CREDENTIALS.password,
      }),
    });

    if (!response.ok) {
      console.log(`Login failed with status ${response.status}`);
      console.log('Response:', await response.text());
      throw new Error('Login failed');
    }

    const data = await response.json();
    console.log('Login response status:', response.status);
    
    if (data.success && data.data && data.data.token) {
      console.log('Successfully obtained auth token');
      return data.data.token;
    } else {
      console.log('Failed to extract token from response');
      console.log('Response data:', data);
      throw new Error('No token in response');
    }
  } catch (error) {
    console.error('Error getting auth token:', error);
    throw error;
  }
}

// Test variant 1 - Basic fields with minimal data
async function testBasicAssetCreation(token) {
  console.log('\n==== TEST 1: Basic Asset Creation ====');
  
  // Check if test file exists
  if (!fs.existsSync(TEST_FILE_PATH)) {
    console.error(`Test file not found: ${TEST_FILE_PATH}`);
    return;
  }
  
  // Create FormData
  const formData = new FormData();
  
  // Add file to FormData
  formData.append('file', fs.createReadStream(TEST_FILE_PATH));
  
  // Add required fields
  formData.append('layer', 'S');
  formData.append('category', 'POP');
  formData.append('subcategory', 'BASE');
  formData.append('source', 'ReViz');
  formData.append('description', 'Test asset description');
  formData.append('tags', JSON.stringify(['test']));
  
  // Log what we're sending
  console.log('Sending FormData with fields:');
  for (const [key, value] of Object.entries(formData.getHeaders())) {
    console.log(` - ${key}: ${value}`);
  }
  console.log('FormData content keys:');
  console.log(' - file (File Stream)');
  console.log(' - layer: S');
  console.log(' - category: POP');
  console.log(' - subcategory: BASE');
  console.log(' - source: ReViz');
  console.log(' - description: Test asset description');
  console.log(' - tags: ["test"]');
  
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
    
    const responseText = await response.text();
    console.log(`Response status: ${response.status}`);
    console.log(`Response text preview: ${responseText.substring(0, 200)}${responseText.length > 200 ? '...' : ''}`);
    
    try {
      const responseData = JSON.parse(responseText);
      console.log('Response data:', JSON.stringify(responseData, null, 2));
    } catch (e) {
      console.log('Response is not valid JSON');
    }
  } catch (error) {
    console.error('Error making request:', error);
  }
}

// Test variant 2 - Complete asset data including all optional fields
async function testCompleteAssetCreation(token) {
  console.log('\n==== TEST 2: Complete Asset Creation ====');
  
  // Create FormData
  const formData = new FormData();
  
  // Add file to FormData
  formData.append('file', fs.createReadStream(TEST_FILE_PATH));
  
  // Add all fields (required and optional)
  formData.append('layer', 'S');
  formData.append('category', 'POP');
  formData.append('subcategory', 'BASE');
  formData.append('source', 'ReViz');
  formData.append('description', 'Complete test asset description');
  formData.append('tags', JSON.stringify(['test', 'complete']));
  formData.append('trainingData', JSON.stringify({
    prompts: [],
    images: [],
    videos: []
  }));
  formData.append('rights', JSON.stringify({
    source: 'Original',
    rights_split: '100%'
  }));
  formData.append('components', JSON.stringify([]));
  
  // Log what we're sending
  console.log('Sending FormData with all fields:');
  console.log(' - file (File Stream)');
  console.log(' - layer: S');
  console.log(' - category: POP');
  console.log(' - subcategory: BASE');
  console.log(' - source: ReViz');
  console.log(' - description: Complete test asset description');
  console.log(' - tags: ["test", "complete"]');
  console.log(' - trainingData: {}');
  console.log(' - rights: {}');
  console.log(' - components: []');
  
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
    
    const responseText = await response.text();
    console.log(`Response status: ${response.status}`);
    console.log(`Response text preview: ${responseText.substring(0, 200)}${responseText.length > 200 ? '...' : ''}`);
    
    try {
      const responseData = JSON.parse(responseText);
      console.log('Response data:', JSON.stringify(responseData, null, 2));
    } catch (e) {
      console.log('Response is not valid JSON');
    }
  } catch (error) {
    console.error('Error making request:', error);
  }
}

// Run tests
async function runTests() {
  try {
    // Login to get auth token
    const token = await getAuthToken();
    
    // Run test variants
    await testBasicAssetCreation(token);
    await testCompleteAssetCreation(token);
    
    console.log('\nAll tests completed');
  } catch (error) {
    console.error('Test suite failed:', error);
  }
}

// Run the tests
runTests();