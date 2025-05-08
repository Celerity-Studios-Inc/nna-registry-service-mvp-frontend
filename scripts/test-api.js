#!/usr/bin/env node

/**
 * Direct API testing script
 * This script allows you to test the backend API directly, bypassing the frontend
 * 
 * Usage:
 *   node scripts/test-api.js
 *   node scripts/test-api.js --auth-test <token>
 * 
 * Note: If you get an error about fetch not being a function, you may need to:
 *   npm install node-fetch@2
 */

// Use native fetch if available (Node 18+), otherwise use polyfill
const fetch = globalThis.fetch || require('node-fetch');

const API_URL = 'https://registry.reviz.dev/api';

// Check for auth testing
const args = process.argv.slice(2);
const authTestFlag = args.findIndex(arg => arg === '--auth-test');
const authToken = authTestFlag !== -1 && args.length > authTestFlag + 1 ? args[authTestFlag + 1] : null;

/**
 * Test basic API endpoints without authentication
 */
async function testApiEndpoint() {
  try {
    console.log(`Testing API endpoint: ${API_URL}`);
    
    // Simple GET request to check if the API is responding
    const getResponse = await fetch(`${API_URL}/health`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      }
    });
    
    console.log(`GET /health Status: ${getResponse.status} ${getResponse.statusText}`);
    
    if (getResponse.ok) {
      const data = await getResponse.json();
      console.log('Response data:', data);
    } else {
      const text = await getResponse.text();
      console.error('Error response:', text);
    }
    
    // Try a more complex request
    console.log('\nTesting assets endpoint without authentication...');
    const assetsResponse = await fetch(`${API_URL}/assets?limit=1`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      }
    });
    
    console.log(`GET /assets Status: ${assetsResponse.status} ${assetsResponse.statusText}`);
    
    if (assetsResponse.ok) {
      const data = await assetsResponse.json();
      console.log('Response data preview:', JSON.stringify(data).substring(0, 200) + '...');
    } else {
      const text = await assetsResponse.text();
      console.error('Error response:', text);
    }
  } catch (error) {
    console.error('Error testing API:', error);
  }
}

/**
 * Test API with authentication
 * @param {string} token - Authentication token to use
 */
async function testWithAuthentication(token) {
  try {
    console.log('\n=== TESTING API WITH AUTHENTICATION ===');
    console.log(`Using token: ${token.substring(0, 5)}...${token.substring(token.length - 5)}`);
    
    // Test assets endpoint with authentication
    console.log('\nTesting assets endpoint with authentication...');
    const assetsAuthResponse = await fetch(`${API_URL}/assets?limit=1`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log(`GET /assets (auth) Status: ${assetsAuthResponse.status} ${assetsAuthResponse.statusText}`);
    
    if (assetsAuthResponse.ok) {
      const data = await assetsAuthResponse.json();
      console.log('Auth response data preview:', JSON.stringify(data).substring(0, 200) + '...');
    } else {
      const text = await assetsAuthResponse.text();
      console.error('Auth error response:', text);
    }
    
    // Test a POST request
    if (assetsAuthResponse.ok) {
      console.log('\nTesting asset creation with authentication...');
      const createAssetResponse = await fetch(`${API_URL}/assets`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: 'Test Asset',
          description: 'Created using API test script',
          layer: 'TEST',
        })
      });
      
      console.log(`POST /assets Status: ${createAssetResponse.status} ${createAssetResponse.statusText}`);
      
      if (createAssetResponse.ok) {
        const data = await createAssetResponse.json();
        console.log('Created asset response preview:', JSON.stringify(data).substring(0, 200) + '...');
      } else {
        const text = await createAssetResponse.text();
        console.error('Asset creation error:', text);
      }
    }
  } catch (error) {
    console.error('Error testing API with authentication:', error);
  }
}

// Run the tests
async function runTests() {
  await testApiEndpoint();
  
  // If an auth token was provided, test with authentication
  if (authToken) {
    await testWithAuthentication(authToken);
  } else {
    console.log('\nSkipping authentication tests. Use --auth-test <token> to test with authentication.');
  }
  
  console.log('\nAPI testing completed');
}

runTests().catch(err => {
  console.error('API test failed:', err);
  process.exit(1);
});