// Test Backend Validation for S.POP subcategories
const https = require('https');

// Define different subcategory values to test
const testCases = [
  { layer: 'S', category: 'POP', subcategory: 'DIV', description: 'Testing S.POP.DIV' },
  { layer: 'S', category: 'POP', subcategory: 'HPM', description: 'Testing S.POP.HPM' },
  { layer: 'S', category: 'POP', subcategory: 'BAS', description: 'Testing S.POP.BAS' },
  { layer: 'S', category: 'POP', subcategory: 'LGM', description: 'Testing S.POP.LGM' },
  { layer: 'S', category: 'POP', subcategory: 'IDF', description: 'Testing S.POP.IDF' }
];

// Test function to validate subcategories without actually creating assets
async function testSubcategoryValidation() {
  // Replace this with a real token from the UI (copy from network request)
  const token = 'YOUR_AUTH_TOKEN';
  
  console.log('Testing backend validation for S.POP subcategories...');
  
  for (const testCase of testCases) {
    const data = JSON.stringify({
      layer: testCase.layer,
      category: testCase.category,
      subcategory: testCase.subcategory,
      description: testCase.description,
      source: 'ReViz',
      tags: ['test']
    });
    
    const options = {
      hostname: 'registry.reviz.dev',
      port: 443,
      path: '/api/assets/validate',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length,
        'Authorization': `Bearer ${token}`
      }
    };
    
    try {
      const response = await new Promise((resolve, reject) => {
        const req = https.request(options, (res) => {
          let responseData = '';
          
          res.on('data', (chunk) => {
            responseData += chunk;
          });
          
          res.on('end', () => {
            resolve({
              statusCode: res.statusCode,
              headers: res.headers,
              body: responseData
            });
          });
        });
        
        req.on('error', (error) => {
          reject(error);
        });
        
        req.write(data);
        req.end();
      });
      
      console.log(`Testing ${testCase.layer}.${testCase.category}.${testCase.subcategory}:`, {
        statusCode: response.statusCode,
        response: response.body.substring(0, 100) + '...'
      });
    } catch (error) {
      console.error(`Error testing ${testCase.layer}.${testCase.category}.${testCase.subcategory}:`, error.message);
    }
  }
}

// Instructions:
// 1. Replace YOUR_AUTH_TOKEN with a real token from the UI
// 2. Run this script with: node test-backend-validation.js

console.log('This is a test script to validate backend subcategory compatibility.');
console.log('Please add your auth token before running this script.');