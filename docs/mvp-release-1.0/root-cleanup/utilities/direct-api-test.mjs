// Direct API test script for the NNA Registry Service backend
import fs from 'fs';
import fetch from 'node-fetch';
import FormData from 'form-data';

// Configuration
const BACKEND_API = 'https://registry.reviz.dev/api';
const TEST_IMAGE_PATH = './test-assets/test-image.jpg';

// Test asset creation directly with the backend API
async function testDirectAssetCreation() {
  try {
    console.log('=== Testing Direct Asset Creation with Backend API ===');
    
    // Check if test image exists
    if (!fs.existsSync(TEST_IMAGE_PATH)) {
      console.log('Creating test image...');
      if (!fs.existsSync('./test-assets')) {
        fs.mkdirSync('./test-assets');
      }
      
      // Create a simple JPG file using a base64 encoded transparent GIF
      const base64Image = 'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
      const buffer = Buffer.from(base64Image, 'base64');
      fs.writeFileSync(TEST_IMAGE_PATH, buffer);
    }
    
    console.log('Test image available at:', TEST_IMAGE_PATH);
    
    // Create FormData for the request
    const formData = new FormData();
    
    // Add file
    formData.append('file', fs.createReadStream(TEST_IMAGE_PATH));
    
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
    
    // Log what we're sending (excluding file contents)
    console.log('\nSending request to:', `${BACKEND_API}/assets`);
    console.log('Authorization:', `Bearer ${token.substring(0, 5)}...`);
    console.log('FormData keys:');
    
    // List the keys in FormData (simpler approach)
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

// Run the test
testDirectAssetCreation().then(result => {
  console.log('\n=== Test Complete ===');
  console.log('Success:', result.success);
  
  if (result.success) {
    console.log('Created Asset:', result.asset.id);
  } else {
    console.log('Error:', result.error);
  }
});