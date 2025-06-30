#!/usr/bin/env node

/**
 * Staging Backend Connectivity Test
 * Tests the live staging backend before frontend deployment
 */

const https = require('https');

const STAGING_BACKEND = 'https://registry.stg.reviz.dev';

console.log('🧪 Testing Staging Backend Connectivity...\n');

// Test 1: Health Check
function testHealthCheck() {
  return new Promise((resolve, reject) => {
    const url = `${STAGING_BACKEND}/api/health`;
    console.log(`📡 Testing health endpoint: ${url}`);
    
    https.get(url, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        console.log(`📊 Status Code: ${res.statusCode}`);
        console.log(`📋 Headers:`, res.headers);
        
        try {
          const json = JSON.parse(data);
          console.log(`✅ Health Check Response:`, json);
          resolve({ success: true, data: json, status: res.statusCode });
        } catch (e) {
          console.log(`📄 Raw Response:`, data);
          resolve({ success: true, data: data, status: res.statusCode });
        }
      });
    }).on('error', (err) => {
      console.error(`❌ Health Check Failed:`, err.message);
      reject(err);
    });
  });
}

// Test 2: CORS Preflight Check
function testCORSPreflight() {
  return new Promise((resolve, reject) => {
    const url = `${STAGING_BACKEND}/api/assets`;
    console.log(`\n🔒 Testing CORS preflight: ${url}`);
    
    const options = {
      method: 'OPTIONS',
      headers: {
        'Origin': 'https://nna-registry-staging.vercel.app',
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'Authorization, Content-Type'
      }
    };
    
    const req = https.request(url, options, (res) => {
      console.log(`📊 CORS Status Code: ${res.statusCode}`);
      console.log(`🔑 CORS Headers:`, {
        'access-control-allow-origin': res.headers['access-control-allow-origin'],
        'access-control-allow-methods': res.headers['access-control-allow-methods'],
        'access-control-allow-headers': res.headers['access-control-allow-headers'],
        'access-control-max-age': res.headers['access-control-max-age']
      });
      
      const corsConfigured = res.statusCode === 200 || res.statusCode === 204;
      if (corsConfigured) {
        console.log(`✅ CORS Preflight: Configured correctly`);
      } else {
        console.log(`⚠️ CORS Preflight: May need configuration`);
      }
      
      resolve({ success: corsConfigured, status: res.statusCode, headers: res.headers });
    });
    
    req.on('error', (err) => {
      console.error(`❌ CORS Preflight Failed:`, err.message);
      reject(err);
    });
    
    req.end();
  });
}

// Test 3: Basic Assets Endpoint
function testAssetsEndpoint() {
  return new Promise((resolve, reject) => {
    const url = `${STAGING_BACKEND}/api/assets`;
    console.log(`\n📂 Testing assets endpoint: ${url}`);
    
    https.get(url, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        console.log(`📊 Assets Status Code: ${res.statusCode}`);
        
        if (res.statusCode === 200) {
          try {
            const json = JSON.parse(data);
            console.log(`✅ Assets Endpoint: Working (${json.data?.length || 0} assets found)`);
            resolve({ success: true, data: json, status: res.statusCode });
          } catch (e) {
            console.log(`⚠️ Assets Endpoint: Returns non-JSON response`);
            resolve({ success: false, data: data, status: res.statusCode });
          }
        } else if (res.statusCode === 401) {
          console.log(`🔐 Assets Endpoint: Requires authentication (expected)`);
          resolve({ success: true, status: res.statusCode, message: 'Auth required' });
        } else {
          console.log(`❌ Assets Endpoint: Unexpected status ${res.statusCode}`);
          resolve({ success: false, status: res.statusCode, data: data });
        }
      });
    }).on('error', (err) => {
      console.error(`❌ Assets Endpoint Failed:`, err.message);
      reject(err);
    });
  });
}

// Run all tests
async function runTests() {
  const results = {
    health: null,
    cors: null,
    assets: null
  };
  
  try {
    console.log('🎯 Starting staging backend connectivity tests...\n');
    
    // Test 1: Health Check
    results.health = await testHealthCheck();
    
    // Test 2: CORS Preflight
    results.cors = await testCORSPreflight();
    
    // Test 3: Assets Endpoint
    results.assets = await testAssetsEndpoint();
    
    // Summary
    console.log('\n📋 TEST SUMMARY:');
    console.log('================');
    console.log(`Health Check: ${results.health.success ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`CORS Setup: ${results.cors.success ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`Assets Endpoint: ${results.assets.success ? '✅ PASS' : '❌ FAIL'}`);
    
    const allPassed = results.health.success && results.cors.success && results.assets.success;
    
    if (allPassed) {
      console.log('\n🎉 ALL TESTS PASSED - Staging backend is ready for frontend deployment!');
      console.log('\n🚀 Next steps:');
      console.log('1. Deploy frontend to Vercel staging');
      console.log('2. Run full user workflow tests');
      console.log('3. Test file upload routing (small and large files)');
    } else {
      console.log('\n⚠️ Some tests failed - check backend configuration');
    }
    
  } catch (error) {
    console.error('\n💥 Test suite failed:', error.message);
    process.exit(1);
  }
}

// Run the tests
runTests();