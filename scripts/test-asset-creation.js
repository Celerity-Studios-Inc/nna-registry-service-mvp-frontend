/**
 * Script to test asset creation with FormData
 * 
 * This script uses the native fetch API to test asset creation
 * with the multipart/form-data format, simulating a file upload.
 */

// The asset API endpoint
const API_URL = '/api/assets';

// The mock file to upload
// This simulates a file object in the browser
const mockFileData = new Uint8Array([
  0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, // PNG signature
  // PNG header (IHDR)
  0x00, 0x00, 0x00, 0x0D, // 13-byte length
  0x49, 0x48, 0x44, 0x52, // IHDR
  0x00, 0x00, 0x00, 0x01, // width
  0x00, 0x00, 0x00, 0x01, // height
  0x08, // bit depth
  0x06, // color type
  0x00, // compression method
  0x00, // filter method
  0x00, // interlace method
  0x1F, 0x15, 0xC4, 0x89 // CRC
]);

// Create a mock file
const mockFile = new File([mockFileData], 'test-image.png', { type: 'image/png' });

// Function to test asset creation with FormData
async function testAssetCreation() {
  try {
    console.log('Creating FormData...');
    
    // Create FormData
    const formData = new FormData();
    
    // Add file to FormData
    formData.append('file', mockFile);
    
    // Add asset metadata
    formData.append('name', 'Test Asset');
    formData.append('layer', 'S');
    formData.append('category', 'POP');
    formData.append('subcategory', 'BASE');
    formData.append('description', 'Test asset description');
    formData.append('tags[]', 'test');
    formData.append('tags[]', 'mock');
    
    // Add empty trainingData and rights objects
    formData.append('trainingData', JSON.stringify({
      "prompts": [],
      "images": [],
      "videos": []
    }));
    
    formData.append('rights', JSON.stringify({
      "source": "Original",
      "rights_split": "100%"
    }));
    
    // Empty array for components
    formData.append('components[]', '');
    
    console.log('FormData created with the following fields:');
    for (const key of formData.keys()) {
      console.log(` - ${key}`);
    }
    
    console.log('Getting auth token...');
    
    // Get auth token from localStorage
    // Note: In a browser environment, you would use localStorage.getItem('accessToken')
    // For this test script, we'll set a mock token
    const authToken = 'MOCK-TOKEN-FOR-TESTING';
    
    console.log('Making API request...');
    
    // Use fetch API to send FormData
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authToken}`
      },
      body: formData
    });
    
    console.log('API response status:', response.status);
    
    // Parse response
    const responseText = await response.text();
    console.log('API response text:', responseText);
    
    try {
      const responseData = JSON.parse(responseText);
      console.log('API response data:', JSON.stringify(responseData, null, 2));
    } catch (error) {
      console.log('Failed to parse response as JSON');
    }
    
    console.log('Asset creation test complete');
  } catch (error) {
    console.error('Error during asset creation test:', error);
  }
}

// Export the test function
module.exports = {
  testAssetCreation
};

// Run the test if this script is executed directly
if (require.main === module) {
  testAssetCreation();
}