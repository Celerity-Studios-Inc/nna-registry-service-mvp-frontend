/**
 * Simple Asset Registration Test Script - Based on successful production logs
 * 
 * This script creates a FormData object matching exactly what worked in production
 * and shows how to properly register an asset with the backend API.
 */

// Use this in a browser console or adapt to Node.js with FormData polyfill
async function testAssetUpload() {
  console.log('Starting asset upload test using exact production format');
  
  // 1. Get your auth token (from localStorage in browser)
  const token = localStorage.getItem('accessToken');
  if (!token) {
    console.error('No auth token found. Please log in first.');
    return;
  }
  
  // 2. Create a sample file (or use a real one)
  // For browser testing, you need a real File object
  // This example assumes you have a file input: <input type="file" id="fileInput">
  const fileInput = document.getElementById('fileInput');
  if (!fileInput || !fileInput.files || !fileInput.files[0]) {
    console.error('Please select a file first using the file input');
    return;
  }
  const file = fileInput.files[0];
  
  // 3. Create FormData with exact structure from successful logs
  const formData = new FormData();
  
  // Add the file - this is critical
  formData.append('file', file);
  
  // Basic metadata exactly as seen in logs
  formData.append('layer', 'S');
  formData.append('category', 'Pop');  // Note: using 'Pop', not 'POP'
  formData.append('subcategory', 'Base'); // Using 'Base', not code format
  formData.append('description', '400 x 400 Test image');
  formData.append('source', 'ReViz');
  
  // Tags as JSON string
  formData.append('tags', JSON.stringify(['Base Star']));
  
  // Required JSON objects
  formData.append('trainingData', JSON.stringify({
    prompts: [],
    images: [],
    videos: []
  }));
  
  formData.append('rights', JSON.stringify({
    source: 'Original',
    rights_split: '100%'
  }));
  
  // Empty components array
  formData.append('components[]', '');
  
  // 4. Log the FormData for verification
  console.log('FormData structure:');
  for (const key of formData.keys()) {
    console.log(` - ${key}: ${key === 'file' ? '[File Data]' : formData.get(key)}`);
  }
  
  // 5. Make the API request
  console.log('Sending request to /api/assets...');
  try {
    const response = await fetch('/api/assets', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });
    
    console.log('Response status:', response.status);
    
    const responseData = await response.json();
    console.log('Asset created successfully:', responseData);
    
    if (responseData.data) {
      console.log('New NNA Address:', responseData.data.nna_address);
      console.log('Asset Name:', responseData.data.name);
    }
    
  } catch (error) {
    console.error('Error uploading asset:', error);
  }
}

// For browser use, export as global function
if (typeof window !== 'undefined') {
  window.testAssetUpload = testAssetUpload;
  console.log('Run testAssetUpload() to test asset upload with the exact production format');
}

// For Node.js use, export the function
if (typeof module !== 'undefined') {
  module.exports = { testAssetUpload };
}