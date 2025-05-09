// Complete API Test script for the NNA Registry Service
import fs from 'fs';
import fetch from 'node-fetch';
import FormData from 'form-data';

// Configuration
const BACKEND_API = 'https://registry.reviz.dev/api';
const LOCAL_PROXY = 'http://localhost:3000/api'; // Use this when the local dev server is running
const TEST_IMAGE_PATH = './test-assets/test-image.jpg';

// Test asset creation directly with the backend API
async function testDirectAssetCreation(token) {
  try {
    console.log('\n=== Testing Direct Asset Creation with Backend API ===');
    
    // Create test image if it doesn't exist
    const imagePath = await createTestFile();
    console.log('Test image available at:', imagePath);
    
    // Create FormData for the request
    const formData = new FormData();
    
    // Add file
    formData.append('file', fs.createReadStream(imagePath));
    
    // Add required fields
    formData.append('name', 'Direct API Test Asset ' + new Date().toISOString());
    formData.append('layer', 'S');
    formData.append('category', 'POP');
    formData.append('subcategory', 'BAS');
    formData.append('description', 'Test asset created via direct API call');
    formData.append('source', 'NNA Registry Frontend Test');
    
    // Add tags
    formData.append('tags[]', 'test');
    formData.append('tags[]', 'direct-api');
    
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
    
    // Add empty components
    formData.append('components[]', '');
    
    // Log what we're sending (excluding file contents)
    console.log('\nSending request to:', `${BACKEND_API}/assets`);
    console.log('Authorization:', `Bearer ${token.substring(0, 5)}...`);
    console.log('FormData keys:');
    console.log(' - file');
    console.log(' - name');
    console.log(' - layer');
    console.log(' - category');
    console.log(' - subcategory');
    console.log(' - description');
    console.log(' - source');
    console.log(' - tags[]');
    console.log(' - trainingData');
    console.log(' - rights');
    console.log(' - components[]');
    
    // Send the request
    console.log('\nSending request...');
    const response = await fetch(`${BACKEND_API}/assets`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });
    
    console.log('Response status:', response.status);
    
    // Get response data
    const responseText = await response.text();
    console.log('\nResponse preview:');
    console.log(responseText.substring(0, 500) + (responseText.length > 500 ? '...' : ''));
    
    // Try to parse as JSON
    try {
      const responseData = JSON.parse(responseText);
      
      if (responseData.success) {
        console.log('\n✅ Asset created successfully!');
        console.log('Asset ID:', responseData.data.id);
        console.log('Asset Name:', responseData.data.name);
        console.log('Asset NNA Address:', responseData.data.nnaAddress);
        
        return {
          success: true,
          asset: responseData.data
        };
      } else {
        console.log('\n❌ Asset creation failed');
        console.log('Error:', responseData.error || responseData.message || 'Unknown error');
        
        return {
          success: false,
          error: responseData.error || responseData.message || 'Unknown error'
        };
      }
    } catch (e) {
      console.log('\n❌ Failed to parse response as JSON');
      console.log('Error:', e.message);
      
      return {
        success: false,
        error: 'Invalid JSON response'
      };
    }
  } catch (error) {
    console.error('\n❌ Error during direct API test:', error);
    
    return {
      success: false,
      error: error.message
    };
  }
}

// Test asset creation via the proxy API
async function testProxyAssetCreation(token) {
  try {
    console.log('\n=== Testing Asset Creation via Proxy API ===');
    
    // Create test image if it doesn't exist
    const imagePath = await createTestFile();
    console.log('Test image available at:', imagePath);
    
    // Create FormData for the request
    const formData = new FormData();
    
    // Add file
    formData.append('file', fs.createReadStream(imagePath));
    
    // Add required fields
    formData.append('name', 'Proxy API Test Asset ' + new Date().toISOString());
    formData.append('layer', 'S');
    formData.append('category', 'POP');
    formData.append('subcategory', 'BAS');
    formData.append('description', 'Test asset created via proxy API call');
    formData.append('source', 'NNA Registry Frontend Test');
    
    // Add tags
    formData.append('tags[]', 'test');
    formData.append('tags[]', 'proxy-api');
    
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
    
    // Add empty components
    formData.append('components[]', '');
    
    // Log what we're sending (excluding file contents)
    console.log('\nSending request to:', `${LOCAL_PROXY}/assets`);
    console.log('Authorization:', `Bearer ${token.substring(0, 5)}...`);
    
    // Send the request
    console.log('\nSending request...');
    const response = await fetch(`${LOCAL_PROXY}/assets`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });
    
    console.log('Response status:', response.status);
    
    // Get response data
    const responseText = await response.text();
    console.log('\nResponse preview:');
    console.log(responseText.substring(0, 500) + (responseText.length > 500 ? '...' : ''));
    
    // Try to parse as JSON
    try {
      const responseData = JSON.parse(responseText);
      
      if (responseData.success) {
        console.log('\n✅ Asset created successfully via proxy!');
        console.log('Asset ID:', responseData.data.id);
        console.log('Asset Name:', responseData.data.name);
        console.log('Asset NNA Address:', responseData.data.nnaAddress);
        
        return {
          success: true,
          asset: responseData.data
        };
      } else {
        console.log('\n❌ Asset creation via proxy failed');
        console.log('Error:', responseData.error || responseData.message || 'Unknown error');
        
        return {
          success: false,
          error: responseData.error || responseData.message || 'Unknown error'
        };
      }
    } catch (e) {
      console.log('\n❌ Failed to parse response as JSON');
      console.log('Error:', e.message);
      
      return {
        success: false,
        error: 'Invalid JSON response'
      };
    }
  } catch (error) {
    console.error('\n❌ Error during proxy API test:', error);
    
    return {
      success: false,
      error: error.message
    };
  }
}

// Test uploaded files parsing and handling
async function testFileUpload(token, useProxy = false) {
  try {
    const baseUrl = useProxy ? LOCAL_PROXY : BACKEND_API;
    console.log(`\n=== Testing File Upload via ${useProxy ? 'Proxy' : 'Direct'} API ===`);
    
    // Create test image if it doesn't exist
    const imagePath = await createTestFile();
    console.log('Test image available at:', imagePath);
    
    // Create FormData for the file upload
    const formData = new FormData();
    formData.append('file', fs.createReadStream(imagePath));
    
    // Log details
    console.log(`\nSending file upload request to: ${baseUrl}/assets/upload`);
    console.log('Authorization:', `Bearer ${token.substring(0, 5)}...`);
    
    // Send the request
    const response = await fetch(`${baseUrl}/assets/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });
    
    console.log('Response status:', response.status);
    
    // Get response data
    const responseText = await response.text();
    console.log('\nResponse preview:');
    console.log(responseText.substring(0, 500) + (responseText.length > 500 ? '...' : ''));
    
    // Try to parse as JSON
    try {
      const responseData = JSON.parse(responseText);
      
      if (responseData.success) {
        console.log('\n✅ File uploaded successfully!');
        console.log('File URL:', responseData.data.url);
        
        return {
          success: true,
          fileData: responseData.data
        };
      } else {
        console.log('\n❌ File upload failed');
        console.log('Error:', responseData.error || responseData.message || 'Unknown error');
        
        return {
          success: false,
          error: responseData.error || responseData.message || 'Unknown error'
        };
      }
    } catch (e) {
      console.log('\n❌ Failed to parse response as JSON');
      console.log('Error:', e.message);
      
      return {
        success: false,
        error: 'Invalid JSON response'
      };
    }
  } catch (error) {
    console.error(`\n❌ Error during file upload test via ${useProxy ? 'proxy' : 'direct'} API:`, error);
    
    return {
      success: false,
      error: error.message
    };
  }
}

// Test GET assets endpoint
async function testGetAssets(token, useProxy = false) {
  try {
    const baseUrl = useProxy ? LOCAL_PROXY : BACKEND_API;
    console.log(`\n=== Testing GET Assets via ${useProxy ? 'Proxy' : 'Direct'} API ===`);
    
    // Log details
    console.log(`\nSending GET request to: ${baseUrl}/assets`);
    console.log('Authorization:', `Bearer ${token.substring(0, 5)}...`);
    
    // Send the request
    const response = await fetch(`${baseUrl}/assets`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('Response status:', response.status);
    
    // Get response data
    const responseText = await response.text();
    console.log('\nResponse preview:');
    console.log(responseText.substring(0, 500) + (responseText.length > 500 ? '...' : ''));
    
    // Try to parse as JSON
    try {
      const responseData = JSON.parse(responseText);
      
      if (responseData.success) {
        console.log('\n✅ Got assets successfully!');
        console.log('Total assets:', responseData.data.length);
        
        return {
          success: true,
          assets: responseData.data
        };
      } else {
        console.log('\n❌ Getting assets failed');
        console.log('Error:', responseData.error || responseData.message || 'Unknown error');
        
        return {
          success: false,
          error: responseData.error || responseData.message || 'Unknown error'
        };
      }
    } catch (e) {
      console.log('\n❌ Failed to parse response as JSON');
      console.log('Error:', e.message);
      
      return {
        success: false,
        error: 'Invalid JSON response'
      };
    }
  } catch (error) {
    console.error(`\n❌ Error during GET assets test via ${useProxy ? 'proxy' : 'direct'} API:`, error);
    
    return {
      success: false,
      error: error.message
    };
  }
}

// Helper function to create test file
async function createTestFile() {
  // Check if test directory exists
  if (!fs.existsSync('./test-assets')) {
    fs.mkdirSync('./test-assets');
  }

  // Create a simple JPG file using a base64 encoded transparent GIF
  const base64Image = 'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
  const buffer = Buffer.from(base64Image, 'base64');
  
  if (!fs.existsSync(TEST_IMAGE_PATH)) {
    fs.writeFileSync(TEST_IMAGE_PATH, buffer);
    console.log('Test image created at:', TEST_IMAGE_PATH);
  } else {
    console.log('Test image already exists at:', TEST_IMAGE_PATH);
  }
  
  return TEST_IMAGE_PATH;
}

// Main test function
async function runTests() {
  console.log('=== NNA Registry Service API Test Suite ===');
  console.log('Date:', new Date().toISOString());
  
  // Get token from command line arguments or environment variable
  console.log('\nThis test requires a valid authentication token from the backend API.');
  
  let token = '';
  
  // Check command line arguments
  if (process.argv.length > 2) {
    token = process.argv[2];
    console.log('Using token from command line argument');
  } else if (process.env.API_TOKEN) {
    token = process.env.API_TOKEN;
    console.log('Using token from API_TOKEN environment variable');
  } else {
    token = 'MOCK-test-token';
    console.log('No token provided, using mock token (will likely fail)');
  }
  
  console.log('Token (first 5 chars):', token.substring(0, 5) + '...');
  
  // Test direct API access for GET assets
  const directGetResult = await testGetAssets(token, false);
  
  // Test proxy API access for GET assets
  let proxyGetResult = { success: false, error: 'Not attempted' };
  try {
    proxyGetResult = await testGetAssets(token, true);
  } catch (error) {
    console.error('❌ Error testing proxy GET - is the local server running?');
    console.log('To test with the proxy API, make sure to start the dev server with `npm start`');
  }
  
  // Test direct file upload
  const directFileUploadResult = await testFileUpload(token, false);
  
  // Test proxy file upload
  let proxyFileUploadResult = { success: false, error: 'Not attempted' };
  try {
    proxyFileUploadResult = await testFileUpload(token, true);
  } catch (error) {
    console.error('❌ Error testing proxy file upload - is the local server running?');
  }
  
  // Test direct asset creation
  const directAssetResult = await testDirectAssetCreation(token);
  
  // Test proxy asset creation
  let proxyAssetResult = { success: false, error: 'Not attempted' };
  try {
    proxyAssetResult = await testProxyAssetCreation(token);
  } catch (error) {
    console.error('❌ Error testing proxy asset creation - is the local server running?');
  }
  
  // Print summary
  console.log('\n=== Test Summary ===');
  console.log('Direct API GET Assets:', directGetResult.success ? '✅ SUCCESS' : '❌ FAILED');
  console.log('Proxy API GET Assets:', proxyGetResult.success ? '✅ SUCCESS' : '❌ FAILED');
  console.log('Direct API File Upload:', directFileUploadResult.success ? '✅ SUCCESS' : '❌ FAILED');
  console.log('Proxy API File Upload:', proxyFileUploadResult.success ? '✅ SUCCESS' : '❌ FAILED');
  console.log('Direct API Asset Creation:', directAssetResult.success ? '✅ SUCCESS' : '❌ FAILED');
  console.log('Proxy API Asset Creation:', proxyAssetResult.success ? '✅ SUCCESS' : '❌ FAILED');
  
  console.log('\n=== Detailed Results ===');
  if (directGetResult.success) {
    console.log('Direct GET Assets: Found', directGetResult.assets.length, 'assets');
  } else {
    console.log('Direct GET Assets Error:', directGetResult.error);
  }
  
  if (proxyGetResult.success) {
    console.log('Proxy GET Assets: Found', proxyGetResult.assets.length, 'assets');
  } else {
    console.log('Proxy GET Assets Error:', proxyGetResult.error);
  }
  
  if (directFileUploadResult.success) {
    console.log('Direct File Upload: File URL', directFileUploadResult.fileData.url);
  } else {
    console.log('Direct File Upload Error:', directFileUploadResult.error);
  }
  
  if (proxyFileUploadResult.success) {
    console.log('Proxy File Upload: File URL', proxyFileUploadResult.fileData.url);
  } else {
    console.log('Proxy File Upload Error:', proxyFileUploadResult.error);
  }
  
  if (directAssetResult.success) {
    console.log('Direct Asset Creation: Created asset with ID', directAssetResult.asset.id);
    console.log('NNA Address:', directAssetResult.asset.nnaAddress);
  } else {
    console.log('Direct Asset Creation Error:', directAssetResult.error);
  }
  
  if (proxyAssetResult.success) {
    console.log('Proxy Asset Creation: Created asset with ID', proxyAssetResult.asset.id);
    console.log('NNA Address:', proxyAssetResult.asset.nnaAddress);
  } else {
    console.log('Proxy Asset Creation Error:', proxyAssetResult.error);
  }
  
  console.log('\n=== Test Complete ===');
}

// Run the tests
runTests().catch(error => {
  console.error('Test suite failed with error:', error);
});