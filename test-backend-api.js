#!/usr/bin/env node

/**
 * Quick test script to check backend API endpoints
 * Run with: node test-backend-api.js
 */

const baseUrl = 'https://registry.dev.reviz.dev';

async function testEndpoint(endpoint, description) {
  try {
    console.log(`\n🔍 Testing: ${description}`);
    console.log(`   URL: ${baseUrl}${endpoint}`);
    
    const response = await fetch(`${baseUrl}${endpoint}`);
    console.log(`   Status: ${response.status} ${response.statusText}`);
    
    if (response.ok) {
      const data = await response.json();
      console.log(`   ✅ Success:`, JSON.stringify(data, null, 2).substring(0, 200) + '...');
    } else {
      console.log(`   ❌ Failed: ${response.status}`);
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
  }
}

async function main() {
  console.log('🧪 Testing Backend API Endpoints');
  console.log('==================================');
  
  // Test different possible endpoint structures
  const endpointsToTest = [
    // Current structure (what we're using)
    ['/api/taxonomy/layers', 'Get all layers (current)'],
    ['/api/taxonomy/layers/G/categories', 'Get G layer categories (current)'],
    
    // Alternative structures
    ['/api/taxonomy', 'Taxonomy root'],
    ['/api/layers', 'Layers (alternative 1)'],
    ['/taxonomy/layers', 'Taxonomy layers (alternative 2)'],
    ['/api/docs', 'API Documentation'],
    ['/api', 'API root'],
    ['/health', 'Health check'],
    ['/api/health', 'API health check'],
    
    // Based on the TaxonomyController_getLayers name
    ['/api/taxonomy/getLayers', 'Get layers (controller style)'],
    ['/taxonomy/getLayers', 'Get layers (direct)'],
  ];
  
  for (const [endpoint, description] of endpointsToTest) {
    await testEndpoint(endpoint, description);
  }
  
  console.log('\n🏁 Testing complete!');
}

main().catch(console.error);