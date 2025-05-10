#!/usr/bin/env node

/**
 * Systematic Field Requirements Test
 * 
 * This script tests various field combinations to determine exactly what
 * the backend API requires for asset creation.
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

// Test credentials - replace with actual test credentials
const TEST_CREDENTIALS = {
  email: 'test@example.com',
  password: 'password123'
};

// Helper to get an authentication token
async function getAuthToken() {
  try {
    console.log('Attempting to login to backend directly...');
    console.log(`Using credentials: ${TEST_CREDENTIALS.email} / [password hidden]`);
    
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

// Function to systematically test field combinations
async function testFieldCombinations(token) {
  console.log('\n===== SYSTEMATIC FIELD REQUIREMENTS TEST =====');
  
  // Check if test file exists
  if (!fs.existsSync(TEST_FILE_PATH)) {
    console.error(`Test file not found: ${TEST_FILE_PATH}`);
    return;
  }
  
  // Define field tests to run
  const tests = [
    {
      name: "Minimal Required Fields Only",
      fields: {
        file: true,
        layer: "S",
        category: "POP", 
        subcategory: "BASE",
        source: "ReViz",
        tags: ["test"]
      }
    },
    {
      name: "With Name Field",
      fields: {
        file: true,
        name: "Test Asset", // Testing if name is valid
        layer: "S",
        category: "POP", 
        subcategory: "BASE",
        source: "ReViz",
        tags: ["test"]
      }
    },
    {
      name: "With FriendlyName Instead of Name",
      fields: {
        file: true,
        friendlyName: "Test Asset", // Testing if friendlyName is expected
        layer: "S",
        category: "POP", 
        subcategory: "BASE",
        source: "ReViz",
        tags: ["test"]
      }
    },
    {
      name: "With Metadata Fields",
      fields: {
        file: true,
        layer: "S",
        category: "POP", 
        subcategory: "BASE",
        source: "ReViz",
        tags: ["test"],
        description: "This is a test asset with metadata",
        rights: {
          source: "Original",
          rights_split: "100%"
        },
        trainingData: {
          prompts: [],
          images: [],
          videos: []
        }
      }
    },
    {
      name: "With CategoryCode/SubcategoryCode",
      fields: {
        file: true,
        layer: "S",
        categoryCode: "POP", // Testing if categoryCode works
        subcategoryCode: "BASE", // Testing if subcategoryCode works
        source: "ReViz",
        tags: ["test"]
      }
    },
    {
      name: "Without Source Field",
      fields: {
        file: true,
        layer: "S",
        category: "POP", 
        subcategory: "BASE",
        // source field intentionally omitted
        tags: ["test"]
      }
    },
    {
      name: "With Tags as String Array",
      fields: {
        file: true,
        layer: "S",
        category: "POP", 
        subcategory: "BASE",
        source: "ReViz",
        tags: ["test", "multi", "tags"]
      }
    },
    {
      name: "With Tags as String",
      fields: {
        file: true,
        layer: "S",
        category: "POP", 
        subcategory: "BASE",
        source: "ReViz",
        tags: "test,multi,tags" // Testing if tags can be a comma-separated string
      }
    }
  ];
  
  // Run each test
  for (const [i, test] of tests.entries()) {
    console.log(`\n----- TEST ${i+1}: ${test.name} -----`);
    
    // Create FormData
    const formData = new FormData();
    
    // Add file if needed
    if (test.fields.file) {
      formData.append('file', fs.createReadStream(TEST_FILE_PATH));
      console.log('- Added file to FormData');
    }
    
    // Add each field based on test config
    for (const [key, value] of Object.entries(test.fields)) {
      if (key === 'file') continue; // Skip file, already handled
      
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        // Handle nested objects like rights and trainingData
        formData.append(key, JSON.stringify(value));
        console.log(`- Added ${key} as stringified JSON object`);
      } else if (Array.isArray(value)) {
        // Handle arrays (like tags)
        formData.append(key, JSON.stringify(value));
        console.log(`- Added ${key} as stringified JSON array: ${JSON.stringify(value)}`);
      } else {
        // Handle simple values
        formData.append(key, value);
        console.log(`- Added ${key}: ${value}`);
      }
    }
    
    // Send the request
    try {
      console.log(`Sending request to ${BACKEND_URL}/assets`);
      console.log('FormData fields summary:', Object.keys(test.fields).join(', '));
      
      const response = await fetch(`${BACKEND_URL}/assets`, {
        method: 'POST',
        headers: {
          ...formData.getHeaders(),
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });
      
      const responseText = await response.text();
      console.log(`Response status: ${response.status} ${response.statusText}`);
      
      let result;
      try {
        result = JSON.parse(responseText);
        
        if (response.status >= 400) {
          console.log(`TEST ${i+1} FAILED:`);
          console.log(`Error: ${result.message || result.error || 'Unknown error'}`);
          if (result.errors) {
            console.log('Validation errors:', result.errors);
          }
        } else {
          console.log(`TEST ${i+1} SUCCEEDED!`);
          console.log('Created asset ID:', result.data?.id || 'Unknown');
        }
        
        // Record detailed result
        console.log('Full response data:', JSON.stringify(result, null, 2).substring(0, 500) + '...');
      } catch (e) {
        console.log('Response is not valid JSON');
        console.log('Raw response:', responseText.substring(0, 500) + '...');
      }
      
      console.log(`----- END TEST ${i+1} -----`);
    } catch (error) {
      console.error(`Error in test ${i+1}:`, error);
    }
  }
}

// Main function
async function main() {
  try {
    // First, check if the test image exists or create it
    const testDir = path.join(__dirname, '..', 'test-assets');
    if (!fs.existsSync(testDir)) {
      console.log('Creating test-assets directory...');
      fs.mkdirSync(testDir, { recursive: true });
    }
    
    if (!fs.existsSync(TEST_FILE_PATH)) {
      console.log('Creating test image...');
      // Base64-encoded 1x1 pixel PNG
      const base64Image = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';
      fs.writeFileSync(TEST_FILE_PATH, Buffer.from(base64Image, 'base64'));
    }
    
    // Get auth token 
    const token = await getAuthToken();
    if (!token) {
      console.log('\nPlease provide your token as a command line argument:');
      console.log('node field-requirement-test.mjs YOUR_TOKEN');
      process.exit(1);
    }
    
    // Run field combination tests
    await testFieldCombinations(token);
    
    console.log('\n===== TESTING COMPLETE =====');
    console.log('Review the results above to determine the exact field requirements');
  } catch (error) {
    console.error('Test failed:', error);
  }
}

// Command line argument handling
if (process.argv.length > 2) {
  // If token is provided directly, use it instead of logging in
  const providedToken = process.argv[2];
  console.log('Using provided token from command line');
  testFieldCombinations(providedToken).catch(error => {
    console.error('Test failed with provided token:', error);
  });
} else {
  // Run the main function with login sequence
  main().catch(error => {
    console.error('Script failed:', error);
  });
}