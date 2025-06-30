#!/usr/bin/env node

/**
 * Staging Frontend Integration Test
 * Tests the deployed staging frontend with custom backend domain
 */

const https = require('https');

const STAGING_FRONTEND = 'https://nna-registry-service-mvp-frontend.vercel.app';
const STAGING_BACKEND = 'https://registry.stg.reviz.dev';

console.log('🎯 Testing Staging Frontend Integration...\n');

// Test 1: Frontend Health
function testFrontendAccess() {
  return new Promise((resolve) => {
    const url = new URL(STAGING_FRONTEND);
    const options = {
      hostname: url.hostname,
      port: 443,
      path: '/',
      method: 'GET',
      headers: {
        'User-Agent': 'NNA-Staging-Test/1.0'
      }
    };

    console.log('🌐 Testing frontend access:', STAGING_FRONTEND);
    
    const req = https.request(options, (res) => {
      console.log('📊 Frontend Status Code:', res.statusCode);
      console.log('🔑 Frontend Headers:', {
        'content-type': res.headers['content-type'],
        'cache-control': res.headers['cache-control'],
        'x-vercel-cache': res.headers['x-vercel-cache']
      });
      
      if (res.statusCode === 200) {
        console.log('✅ Frontend Access: PASS\n');
      } else {
        console.log('❌ Frontend Access: FAIL\n');
      }
      resolve();
    });

    req.on('error', (error) => {
      console.log('❌ Frontend Access Error:', error.message);
      resolve();
    });

    req.end();
  });
}

// Test 2: API Proxy Routing
function testApiProxy() {
  return new Promise((resolve) => {
    const url = new URL(STAGING_FRONTEND + '/api/health');
    const options = {
      hostname: url.hostname,
      port: 443,
      path: '/api/health',
      method: 'GET',
      headers: {
        'User-Agent': 'NNA-Staging-Test/1.0'
      }
    };

    console.log('🔄 Testing API proxy routing: /api/health');
    
    const req = https.request(options, (res) => {
      console.log('📊 Proxy Status Code:', res.statusCode);
      console.log('🔑 Proxy Headers:', {
        'x-powered-by': res.headers['x-powered-by'],
        'access-control-allow-origin': res.headers['access-control-allow-origin']
      });

      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          console.log('✅ Proxy Health Response:', response);
          
          if (response.status === 'healthy') {
            console.log('✅ API Proxy Routing: PASS\n');
          } else {
            console.log('❌ API Proxy Routing: FAIL\n');
          }
        } catch (error) {
          console.log('❌ Proxy Response Parse Error:', error.message);
          console.log('📄 Raw Response:', data.substring(0, 200));
        }
        resolve();
      });
    });

    req.on('error', (error) => {
      console.log('❌ API Proxy Error:', error.message);
      resolve();
    });

    req.end();
  });
}

// Test 3: Direct Backend Comparison
function testDirectBackend() {
  return new Promise((resolve) => {
    const url = new URL(STAGING_BACKEND + '/api/health');
    const options = {
      hostname: url.hostname,
      port: 443,
      path: '/api/health',
      method: 'GET'
    };

    console.log('📡 Testing direct backend:', STAGING_BACKEND + '/api/health');
    
    const req = https.request(options, (res) => {
      console.log('📊 Direct Status Code:', res.statusCode);

      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          console.log('✅ Direct Backend Response:', response);
          console.log('✅ Direct Backend Access: PASS\n');
        } catch (error) {
          console.log('❌ Direct Backend Parse Error:', error.message);
        }
        resolve();
      });
    });

    req.on('error', (error) => {
      console.log('❌ Direct Backend Error:', error.message);
      resolve();
    });

    req.end();
  });
}

// Run all tests
async function runAllTests() {
  console.log('🎯 Starting comprehensive staging tests...\n');
  
  await testFrontendAccess();
  await testApiProxy();
  await testDirectBackend();
  
  console.log('📋 TEST SUMMARY:');
  console.log('================');
  console.log('Frontend URL:', STAGING_FRONTEND);
  console.log('Backend URL:', STAGING_BACKEND);
  console.log('Custom Domain: registry.stg.reviz.dev');
  console.log('\n🚀 Manual Testing Steps:');
  console.log('1. Visit:', STAGING_FRONTEND);
  console.log('2. Check for staging banner (orange warning)');
  console.log('3. Test asset registration workflow');
  console.log('4. Verify backend routing in Network tab');
  console.log('5. Test file upload with size threshold routing');
}

runAllTests().catch(console.error);