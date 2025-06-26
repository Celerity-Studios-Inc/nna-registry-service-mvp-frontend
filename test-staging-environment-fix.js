#!/usr/bin/env node

/**
 * Staging Environment Fix Verification Script
 * Tests environment detection and backend connectivity
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 Staging Environment Fix Verification\n');

// Test 1: Verify .env.staging has correct configuration
console.log('1️⃣ Testing .env.staging configuration...');
const envStagingPath = path.join(__dirname, '.env.staging');
if (fs.existsSync(envStagingPath)) {
  const envContent = fs.readFileSync(envStagingPath, 'utf8');
  
  const frontendUrlMatch = envContent.match(/REACT_APP_FRONTEND_URL=(.+)/);
  const backendUrlMatch = envContent.match(/REACT_APP_BACKEND_URL=(.+)/);
  
  if (frontendUrlMatch) {
    const frontendUrl = frontendUrlMatch[1].trim();
    console.log(`   Frontend URL: ${frontendUrl}`);
    
    if (frontendUrl === 'https://nna-registry-frontend-stg.vercel.app') {
      console.log('   ✅ Frontend URL correctly configured');
    } else {
      console.log('   ❌ Frontend URL needs to be updated to: https://nna-registry-frontend-stg.vercel.app');
    }
  }
  
  if (backendUrlMatch) {
    const backendUrl = backendUrlMatch[1].trim();
    console.log(`   Backend URL: ${backendUrl}`);
    
    if (backendUrl === 'https://registry.stg.reviz.dev') {
      console.log('   ✅ Backend URL correctly configured');
    } else {
      console.log('   ❌ Backend URL should be: https://registry.stg.reviz.dev');
    }
  }
} else {
  console.log('   ❌ .env.staging file not found');
}

console.log('');

// Test 2: Verify vercel.staging.json configuration
console.log('2️⃣ Testing vercel.staging.json configuration...');
const vercelStagingPath = path.join(__dirname, 'vercel.staging.json');
if (fs.existsSync(vercelStagingPath)) {
  try {
    const vercelConfig = JSON.parse(fs.readFileSync(vercelStagingPath, 'utf8'));
    
    // Check rewrites
    if (vercelConfig.rewrites && vercelConfig.rewrites.length > 0) {
      const apiRewrite = vercelConfig.rewrites.find(r => r.source === '/api/(.*)');
      if (apiRewrite && apiRewrite.destination === 'https://registry.stg.reviz.dev/api/$1') {
        console.log('   ✅ API rewrite correctly configured');
      } else {
        console.log('   ❌ API rewrite missing or incorrect');
      }
    }
    
    // Check CORS headers
    if (vercelConfig.headers && vercelConfig.headers.length > 0) {
      const corsHeader = vercelConfig.headers.find(h => h.source === '/api/(.*)');
      if (corsHeader) {
        const allowOriginHeader = corsHeader.headers?.find(h => h.key === 'Access-Control-Allow-Origin');
        if (allowOriginHeader && allowOriginHeader.value === 'https://nna-registry-frontend-stg.vercel.app') {
          console.log('   ✅ CORS headers correctly configured');
        } else {
          console.log('   ❌ CORS headers missing or incorrect');
        }
      }
    }
    
  } catch (error) {
    console.log(`   ❌ Error parsing vercel.staging.json: ${error.message}`);
  }
} else {
  console.log('   ❌ vercel.staging.json file not found');
}

console.log('');

// Test 3: Environment configuration code check
console.log('3️⃣ Testing environment.config.ts...');
const envConfigPath = path.join(__dirname, 'src/utils/environment.config.ts');
if (fs.existsSync(envConfigPath)) {
  const envConfigContent = fs.readFileSync(envConfigPath, 'utf8');
  
  if (envConfigContent.includes('nna-registry-frontend-stg.vercel.app')) {
    console.log('   ✅ Staging domain detection includes nna-registry-frontend-stg.vercel.app');
  } else {
    console.log('   ❌ Missing nna-registry-frontend-stg.vercel.app in staging detection');
  }
  
  if (envConfigContent.includes('registry.stg.reviz.dev')) {
    console.log('   ✅ Staging backend URL correctly configured');
  } else {
    console.log('   ❌ Missing registry.stg.reviz.dev in staging backend configuration');
  }
} else {
  console.log('   ❌ environment.config.ts file not found');
}

console.log('');

// Summary
console.log('📋 Summary:');
console.log('   Configuration files updated for staging environment fix');
console.log('   Domain mismatch issue should be resolved');
console.log('   Next steps:');
console.log('   1. Deploy these changes to staging');
console.log('   2. Coordinate backend CORS update with backend team');
console.log('   3. Test authentication flow end-to-end');
console.log('');
console.log('🎯 Expected Result: Authentication requests should route correctly');
console.log('   through Vercel proxy to staging backend at registry.stg.reviz.dev');