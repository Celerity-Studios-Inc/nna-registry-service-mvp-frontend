#!/usr/bin/env node

/**
 * Direct API testing script
 * This script allows you to test the backend API directly, bypassing the frontend
 * 
 * Usage:
 *   node scripts/test-api.js
 */

const fetch = require('node-fetch');

const API_URL = 'https://registry.reviz.dev/api';

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
    console.log('\nTesting assets endpoint...');
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

// Run the test
testApiEndpoint().then(() => {
  console.log('API test completed');
}).catch(err => {
  console.error('API test failed:', err);
  process.exit(1);
});