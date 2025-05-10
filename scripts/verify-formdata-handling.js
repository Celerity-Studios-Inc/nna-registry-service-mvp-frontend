/**
 * FormData Handling Verification Script
 * 
 * This script specifically tests the FormData handling with fetch API
 * to ensure proper Content-Type headers are set for multipart/form-data.
 */

// Import required modules if running in Node.js
// If running in browser, these can be omitted
const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');
const FormData = require('form-data');

/**
 * Test function to verify FormData handling
 * @param {string} token - Authentication token 
 * @param {string} endpoint - The API endpoint to test
 * @param {boolean} useFetch - Whether to use fetch API (true) or simulate axios (false)
 */
async function verifyFormDataHandling(token, endpoint, useFetch = true) {
  console.log('=== FormData Handling Verification ===');
  console.log(`Date: ${new Date().toISOString()}`);
  console.log(`Endpoint: ${endpoint}`);
  console.log(`Using: ${useFetch ? 'Native fetch API' : 'Axios-like approach'}`);
  console.log('------------------------------------------');
  
  try {
    // Create a test file if needed
    const testFile = await createTestFile();
    
    // Create FormData
    const formData = new FormData();
    
    // Add file to FormData
    formData.append('file', fs.createReadStream(testFile));
    
    // Add asset metadata
    formData.append('name', `Test Asset ${Date.now()}`);
    formData.append('layer', 'S');
    formData.append('category', 'POP');
    formData.append('subcategory', 'BAS');
    formData.append('description', 'FormData test asset');
    
    // Add tags
    formData.append('tags[]', 'test');
    formData.append('tags[]', 'formdata-test');
    
    // Add training data
    formData.append('trainingData', JSON.stringify({
      prompts: [],
      images: [],
      videos: []
    }));
    
    // Add rights
    formData.append('rights', JSON.stringify({
      source: 'Original',
      rights_split: '100%'
    }));
    
    // Add empty components array
    formData.append('components[]', '');
    
    console.log('FormData created with the following fields:');
    for (const key of Object.keys(formData)) {
      console.log(` - ${key}`);
    }
    
    let response;
    
    if (useFetch) {
      // Use native fetch API with correct FormData handling
      console.log('Making request with native fetch API...');
      response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
    } else {
      // Simulate axios-like approach with potential issues
      console.log('Making request with axios-like approach...');
      response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: formData
      });
    }
    
    console.log(`Response status: ${response.status}`);
    
    // Get response text
    const responseText = await response.text();
    
    try {
      // Try to parse as JSON
      const responseData = JSON.parse(responseText);
      console.log('Response data:');
      console.log(JSON.stringify(responseData, null, 2));
      
      return {
        success: response.status >= 200 && response.status < 300,
        status: response.status,
        data: responseData,
        method: useFetch ? 'fetch' : 'axios-like'
      };
    } catch (e) {
      console.log('Response is not valid JSON:');
      console.log(responseText.substring(0, 1000));
      
      return {
        success: false,
        status: response.status,
        error: 'Invalid JSON response',
        text: responseText.substring(0, 1000),
        method: useFetch ? 'fetch' : 'axios-like'
      };
    }
  } catch (error) {
    console.error('Error during verification:', error);
    
    return {
      success: false,
      error: error.message,
      method: useFetch ? 'fetch' : 'axios-like'
    };
  }
}

/**
 * Helper function to create a test file
 */
async function createTestFile() {
  const testDir = './test-files';
  const testFile = path.join(testDir, 'test-image.png');
  
  // Create directory if it doesn't exist
  if (!fs.existsSync(testDir)) {
    fs.mkdirSync(testDir);
  }
  
  // Create test file if it doesn't exist
  if (!fs.existsSync(testFile)) {
    // Create a simple 1px PNG
    const pngHeader = Buffer.from([
      0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, // PNG signature
      0x00, 0x00, 0x00, 0x0D, // IHDR chunk length
      0x49, 0x48, 0x44, 0x52, // "IHDR"
      0x00, 0x00, 0x00, 0x01, // width: 1
      0x00, 0x00, 0x00, 0x01, // height: 1
      0x08, // bit depth: 8
      0x06, // color type: RGBA
      0x00, // compression: deflate
      0x00, // filter: standard
      0x00, // interlace: none
      0x1F, 0x15, 0xC4, 0x89, // IHDR CRC
      0x00, 0x00, 0x00, 0x0C, // IDAT chunk length
      0x49, 0x44, 0x41, 0x54, // "IDAT"
      0x08, 0xD7, 0x63, 0xF8, 0xFF, 0xFF, 0x3F, 0x00, 0x05, 0x01, 0x01, 0x00, // IDAT data
      0x1F, 0x37, 0x65, 0xC0, // IDAT CRC
      0x00, 0x00, 0x00, 0x00, // IEND chunk length
      0x49, 0x45, 0x4E, 0x44, // "IEND"
      0xAE, 0x42, 0x60, 0x82 // IEND CRC
    ]);
    
    fs.writeFileSync(testFile, pngHeader);
  }
  
  return testFile;
}

/**
 * Run tests for both fetch and axios-like approaches
 */
async function runTests() {
  // Get token from command line or use a default
  const token = process.argv[2] || 'MOCK-TEST-TOKEN';
  
  // Test endpoints
  const endpoints = [
    '/api/assets', // Proxy endpoint
    'https://registry.reviz.dev/api/assets' // Direct API
  ];
  
  console.log('Starting FormData handling verification tests...');
  
  const results = [];
  
  // Test fetch with proxy
  results.push(await verifyFormDataHandling(token, endpoints[0], true));
  
  // Test axios-like with proxy
  results.push(await verifyFormDataHandling(token, endpoints[0], false));
  
  // Test fetch with direct API
  results.push(await verifyFormDataHandling(token, endpoints[1], true));
  
  // Test axios-like with direct API
  results.push(await verifyFormDataHandling(token, endpoints[1], false));
  
  // Summarize results
  console.log('\n=== Test Results Summary ===');
  
  results.forEach((result, index) => {
    const endpoint = index % 2 === 0 ? endpoints[0] : endpoints[1];
    const method = result.method;
    
    console.log(`\nTest #${index + 1}: ${endpoint} with ${method}`);
    console.log(`Success: ${result.success ? 'Yes' : 'No'}`);
    console.log(`Status: ${result.status || 'N/A'}`);
    
    if (result.error) {
      console.log(`Error: ${result.error}`);
    }
    
    if (result.data && result.data.success) {
      console.log('Asset created successfully!');
      if (result.data.data && result.data.data.id) {
        console.log(`Asset ID: ${result.data.data.id}`);
        console.log(`NNA Address: ${result.data.data.nnaAddress || 'N/A'}`);
      }
    }
  });
  
  // Determine overall success
  const fetchProxyResult = results[0].success;
  const fetchDirectResult = results[2].success;
  
  console.log('\n=== Conclusion ===');
  console.log(`Native fetch with proxy: ${fetchProxyResult ? '✅ Working' : '❌ Not working'}`);
  console.log(`Native fetch with direct API: ${fetchDirectResult ? '✅ Working' : '❌ Not working'}`);
  console.log('Based on these results, we recommend:');
  
  if (fetchProxyResult) {
    console.log('✅ Use native fetch with proxy endpoint (/api/assets)');
  } else if (fetchDirectResult) {
    console.log('✅ Use native fetch with direct API (https://registry.reviz.dev/api/assets)');
  } else {
    console.log('❌ Both methods are failing. Check token validity and backend availability.');
  }
}

// If running as a script, execute tests
if (require.main === module) {
  runTests().catch(error => {
    console.error('Test script failed:', error);
  });
} else {
  // Export for use in other modules
  module.exports = {
    verifyFormDataHandling,
    createTestFile
  };
}