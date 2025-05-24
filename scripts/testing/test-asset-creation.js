// Test script for asset creation and backend API validation
import fs from 'fs';
import fetch from 'node-fetch';
import FormData from 'form-data';

// Configuration
const BACKEND_API = 'https://registry.reviz.dev/api';
const LOCAL_PROXY = 'http://localhost:3000/api';
const TEST_IMAGE_PATH = './test-assets/test-image.jpg'; // Create a test image in this path
const TEST_EMAIL = 'test@example.com';
const TEST_PASSWORD = 'password123';

// Helper functions
async function login() {
  try {
    console.log('Attempting to login...');
    const response = await fetch(`${LOCAL_PROXY}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: TEST_EMAIL,
        password: TEST_PASSWORD,
      }),
    });

    const data = await response.json();
    console.log('Login response:', data);

    if (data.success && data.data && data.data.token) {
      return data.data.token;
    } else {
      console.log('Login failed, creating mock token for testing');
      return 'MOCK-test-token';
    }
  } catch (error) {
    console.error('Error during login:', error);
    console.log('Using mock token for testing');
    return 'MOCK-test-token';
  }
}

async function testDirectBackendAccess(token) {
  try {
    console.log('\n--- Testing direct backend access ---');
    const response = await fetch(`${BACKEND_API}/assets`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    const status = response.status;
    console.log('Direct backend status:', status);
    
    try {
      const data = await response.text();
      console.log('Response preview:', data.substring(0, 200) + (data.length > 200 ? '...' : ''));
      
      return status >= 200 && status < 300;
    } catch (err) {
      console.log('Could not parse response from backend');
      return false;
    }
  } catch (error) {
    console.error('Error accessing backend directly:', error);
    return false;
  }
}

async function testLocalProxyAccess(token) {
  try {
    console.log('\n--- Testing local proxy access ---');
    const response = await fetch(`${LOCAL_PROXY}/assets`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    const status = response.status;
    console.log('Local proxy status:', status);
    
    try {
      const data = await response.text();
      console.log('Response preview:', data.substring(0, 200) + (data.length > 200 ? '...' : ''));
      
      return status >= 200 && status < 300;
    } catch (err) {
      console.log('Could not parse response from proxy');
      return false;
    }
  } catch (error) {
    console.error('Error accessing local proxy:', error);
    return false;
  }
}

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

async function testFileUploadViaProxy(token) {
  try {
    console.log('\n--- Testing file upload via proxy ---');
    const imagePath = await createTestFile();
    
    const formData = new FormData();
    formData.append('file', fs.createReadStream(imagePath));
    
    const response = await fetch(`${LOCAL_PROXY}/assets/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });
    
    const status = response.status;
    console.log('File upload status:', status);
    
    try {
      const data = await response.text();
      console.log('Response preview:', data.substring(0, 200) + (data.length > 200 ? '...' : ''));
      
      try {
        const jsonData = JSON.parse(data);
        console.log('Upload successful:', jsonData.success === true);
        if (jsonData.data && jsonData.data.url) {
          console.log('File URL:', jsonData.data.url);
          return jsonData.data;
        }
      } catch (e) {
        console.log('Response is not valid JSON');
      }
      
      return null;
    } catch (err) {
      console.log('Could not parse response');
      return null;
    }
  } catch (error) {
    console.error('Error during file upload:', error);
    return null;
  }
}

async function testAssetCreationViaProxy(token, fileData) {
  try {
    console.log('\n--- Testing asset creation via proxy ---');
    
    // Create a test asset payload
    const assetData = {
      name: 'Test Asset ' + new Date().toISOString(),
      layer: 'S',
      category: 'POP',
      subcategory: 'BAS',
      description: 'Test asset created for backend API validation',
      tags: ['test', 'api', 'validation'],
    };
    
    // If we have file data, add it to the asset
    const formData = new FormData();
    
    // Add all fields to FormData
    Object.entries(assetData).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        value.forEach(item => formData.append(`${key}[]`, item));
      } else {
        formData.append(key, value);
      }
    });
    
    // Add file if we have one
    if (fileData) {
      const imagePath = await createTestFile();
      formData.append('file', fs.createReadStream(imagePath));
    }
    
    // Add empty training data and rights (required by API)
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
    
    // Send the request
    const response = await fetch(`${LOCAL_PROXY}/assets`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });
    
    const status = response.status;
    console.log('Asset creation status:', status);
    
    try {
      const data = await response.text();
      console.log('Response preview:', data.substring(0, 200) + (data.length > 200 ? '...' : ''));
      
      try {
        const jsonData = JSON.parse(data);
        console.log('Asset creation successful:', jsonData.success === true);
        
        if (jsonData.data && jsonData.data.id) {
          console.log('Created asset ID:', jsonData.data.id);
          console.log('Asset NNA Address:', jsonData.data.nnaAddress);
          return jsonData.data;
        }
      } catch (e) {
        console.log('Response is not valid JSON');
      }
      
      return null;
    } catch (err) {
      console.log('Could not parse response');
      return null;
    }
  } catch (error) {
    console.error('Error during asset creation:', error);
    return null;
  }
}

// Main test function
async function runTest() {
  console.log('=== NNA Registry Service Backend API Validation ===');
  console.log('Date:', new Date().toISOString());
  
  // Step 1: Login and get token
  const token = await login();
  console.log('Token:', token.substring(0, 15) + '...');
  
  // Step 2: Test direct backend access
  const directBackendWorks = await testDirectBackendAccess(token);
  console.log('Direct backend access works:', directBackendWorks);
  
  // Step 3: Test local proxy access
  const localProxyWorks = await testLocalProxyAccess(token);
  console.log('Local proxy access works:', localProxyWorks);
  
  // Step 4: Test file upload via proxy
  const fileData = await testFileUploadViaProxy(token);
  console.log('File upload successful:', !!fileData);
  
  // Step 5: Test asset creation via proxy
  const assetData = await testAssetCreationViaProxy(token, fileData);
  console.log('Asset creation successful:', !!assetData);
  
  console.log('\n=== Test Complete ===');
  console.log('Summary:');
  console.log('- Direct Backend Access:', directBackendWorks ? '✓' : '✗');
  console.log('- Local Proxy Access:', localProxyWorks ? '✓' : '✗');
  console.log('- File Upload:', fileData ? '✓' : '✗');
  console.log('- Asset Creation:', assetData ? '✓' : '✗');
}

// Run the test
runTest().catch(error => {
  console.error('Test failed with error:', error);
});