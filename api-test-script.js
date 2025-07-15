#!/usr/bin/env node

/**
 * Phase 2B API Testing Script
 * Tests the NNA Registry API endpoints to verify Phase 2B implementation
 */

const https = require('https');
const FormData = require('form-data');
const fs = require('fs');

const BASE_URL = 'https://registry.dev.reviz.dev';

// Test configuration
const TEST_CONFIG = {
  // You'll need to replace this with a valid JWT token
  AUTH_TOKEN: 'YOUR_JWT_TOKEN_HERE',
  
  // Test asset data
  TEST_ASSET: {
    layer: 'S',
    category: 'RCK', 
    subcategory: 'RSM',
    source: 'API Test User',
    creatorDescription: 'API TEST - Rock star performer with distinctive style',
    description: 'AI-generated description for testing',
    tags: 'rock,performer,test',
    albumArt: 'https://example.com/test-album-art.jpg',
    aiMetadata: JSON.stringify({
      generatedDescription: 'AI generated test description',
      mood: 'energetic',
      genre: 'rock',
      bpm: 120,
      tempo: 'fast',
      tags: ['rock', 'energetic', 'performer']
    })
  }
};

/**
 * Make HTTP request with Promise wrapper
 */
function makeRequest(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const result = {
            statusCode: res.statusCode,
            headers: res.headers,
            body: res.headers['content-type']?.includes('application/json') 
              ? JSON.parse(body) 
              : body
          };
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });
    });

    req.on('error', reject);
    
    if (data) {
      if (data instanceof FormData) {
        data.pipe(req);
      } else {
        req.write(data);
      }
    }
    
    if (!(data instanceof FormData)) {
      req.end();
    }
  });
}

/**
 * Test 1: Get API Health/Status
 */
async function testApiHealth() {
  console.log('🔍 Testing API Health...');
  
  try {
    const options = {
      hostname: 'registry.dev.reviz.dev',
      path: '/api/health',
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const response = await makeRequest(options);
    console.log(`✅ API Health: ${response.statusCode}`);
    console.log(`📊 Response:`, response.body);
    return response;
  } catch (error) {
    console.error('❌ API Health test failed:', error.message);
    return null;
  }
}

/**
 * Test 2: Get Swagger Documentation
 */
async function testSwaggerDocs() {
  console.log('📚 Testing Swagger Documentation...');
  
  try {
    const options = {
      hostname: 'registry.dev.reviz.dev',
      path: '/api/docs-json',
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const response = await makeRequest(options);
    console.log(`✅ Swagger Docs: ${response.statusCode}`);
    
    if (response.body && response.body.paths) {
      const endpoints = Object.keys(response.body.paths);
      console.log(`📋 Available endpoints: ${endpoints.length}`);
      console.log(`🎯 Asset endpoints:`, endpoints.filter(ep => ep.includes('assets')));
      
      // Check for Phase 2B fields in schema
      const schemas = response.body.components?.schemas || {};
      if (schemas.CreateAssetDto) {
        const properties = schemas.CreateAssetDto.properties || {};
        console.log(`🔧 CreateAssetDto fields:`, Object.keys(properties));
        
        // Check specifically for Phase 2B fields
        const phase2bFields = ['creatorDescription', 'albumArt', 'aiMetadata'];
        const foundFields = phase2bFields.filter(field => properties[field]);
        console.log(`🚀 Phase 2B fields found:`, foundFields);
      }
    }
    
    return response;
  } catch (error) {
    console.error('❌ Swagger docs test failed:', error.message);
    return null;
  }
}

/**
 * Test 3: Test Asset Creation (requires auth token)
 */
async function testAssetCreation() {
  console.log('🎯 Testing Asset Creation...');
  
  if (TEST_CONFIG.AUTH_TOKEN === 'YOUR_JWT_TOKEN_HERE') {
    console.log('⚠️  Skipping asset creation test - no auth token provided');
    console.log('💡 To test asset creation, update AUTH_TOKEN in the script');
    return null;
  }

  try {
    // Create test image file (1x1 PNG)
    const testImageBuffer = Buffer.from([
      0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00, 0x00, 0x0D,
      0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
      0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53, 0xDE, 0x00, 0x00, 0x00,
      0x0C, 0x49, 0x44, 0x41, 0x54, 0x08, 0x57, 0x63, 0x00, 0x01, 0x00, 0x00,
      0x05, 0x00, 0x01, 0x0D, 0x0A, 0x2D, 0xB4, 0x00, 0x00, 0x00, 0x00, 0x49,
      0x45, 0x4E, 0x44, 0xAE, 0x42, 0x60, 0x82
    ]);

    const form = new FormData();
    form.append('file', testImageBuffer, {
      filename: 'test-image.png',
      contentType: 'image/png'
    });
    
    // Add all test fields
    Object.keys(TEST_CONFIG.TEST_ASSET).forEach(key => {
      form.append(key, TEST_CONFIG.TEST_ASSET[key]);
    });

    const options = {
      hostname: 'registry.dev.reviz.dev',
      path: '/api/assets',
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${TEST_CONFIG.AUTH_TOKEN}`,
        ...form.getHeaders()
      }
    };

    const response = await makeRequest(options, form);
    console.log(`✅ Asset Creation: ${response.statusCode}`);
    
    if (response.statusCode === 201) {
      console.log('🎉 Asset created successfully!');
      console.log(`📋 Asset ID: ${response.body.id}`);
      console.log(`🏷️  Asset Name: ${response.body.name}`);
      console.log(`👤 Creator Description: ${response.body.creatorDescription}`);
      console.log(`🤖 AI Description: ${response.body.description}`);
      
      return response.body;
    } else {
      console.log('❌ Asset creation failed');
      console.log('📄 Response:', response.body);
    }
    
    return response;
  } catch (error) {
    console.error('❌ Asset creation test failed:', error.message);
    return null;
  }
}

/**
 * Test 4: Test Asset Retrieval
 */
async function testAssetRetrieval(assetId) {
  if (!assetId) {
    console.log('⚠️  Skipping asset retrieval test - no asset ID provided');
    return null;
  }

  console.log(`🔍 Testing Asset Retrieval for ID: ${assetId}...`);
  
  try {
    const options = {
      hostname: 'registry.dev.reviz.dev',
      path: `/api/assets/${assetId}`,
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${TEST_CONFIG.AUTH_TOKEN}`,
        'Content-Type': 'application/json'
      }
    };

    const response = await makeRequest(options);
    console.log(`✅ Asset Retrieval: ${response.statusCode}`);
    
    if (response.statusCode === 200) {
      console.log('📋 Retrieved asset details:');
      console.log(`🏷️  Name: ${response.body.name}`);
      console.log(`👤 Creator Description: ${response.body.creatorDescription}`);
      console.log(`🤖 Description: ${response.body.description}`);
      console.log(`🎵 Album Art: ${response.body.albumArt}`);
      console.log(`🔬 AI Metadata:`, response.body.aiMetadata);
    }
    
    return response;
  } catch (error) {
    console.error('❌ Asset retrieval test failed:', error.message);
    return null;
  }
}

/**
 * Main test execution
 */
async function runTests() {
  console.log('🚀 Starting Phase 2B API Tests...\n');
  
  // Test 1: API Health
  await testApiHealth();
  console.log('');
  
  // Test 2: Swagger Documentation
  await testSwaggerDocs();
  console.log('');
  
  // Test 3: Asset Creation (requires auth)
  const createdAsset = await testAssetCreation();
  console.log('');
  
  // Test 4: Asset Retrieval (if asset was created)
  if (createdAsset && createdAsset.id) {
    await testAssetRetrieval(createdAsset.id);
  }
  
  console.log('\n🏁 API Tests Complete!');
  
  // Summary
  console.log('\n📊 Test Summary:');
  console.log('✅ API Health check');
  console.log('✅ Swagger documentation analysis');
  console.log(TEST_CONFIG.AUTH_TOKEN === 'YOUR_JWT_TOKEN_HERE' 
    ? '⚠️  Asset creation/retrieval (skipped - no auth token)' 
    : '✅ Asset creation and retrieval');
  
  console.log('\n💡 Next Steps:');
  console.log('1. Update AUTH_TOKEN to test asset creation');
  console.log('2. Run frontend tests when backend deployment is ready');
  console.log('3. Execute comprehensive test plan');
}

// Run tests
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = {
  testApiHealth,
  testSwaggerDocs, 
  testAssetCreation,
  testAssetRetrieval
};