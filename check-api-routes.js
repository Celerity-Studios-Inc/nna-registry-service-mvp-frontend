#!/usr/bin/env node

/**
 * Check available API routes
 */

const baseUrl = 'https://registry.dev.reviz.dev';

async function checkRoutes() {
  try {
    console.log('🔍 Checking available API routes...\n');
    
    // First, let's see what the API root tells us
    const apiResponse = await fetch(`${baseUrl}/api`);
    if (apiResponse.ok) {
      const apiData = await apiResponse.json();
      console.log('📋 API Root Response:');
      console.log(JSON.stringify(apiData, null, 2));
    }
    
    console.log('\n🔍 Testing common endpoint patterns...\n');
    
    // Test common REST API patterns for taxonomy
    const possibleEndpoints = [
      '/api/taxonomy',
      '/api/taxonomy/layers',
      '/api/taxonomy/categories', 
      '/api/taxonomy/subcategories',
      '/api/registries/taxonomy',
      '/api/assets/taxonomy',
      '/api/v1/taxonomy',
      '/api/v1/taxonomy/layers',
      '/taxonomy',
      '/layers',
      '/categories',
    ];
    
    for (const endpoint of possibleEndpoints) {
      try {
        const response = await fetch(`${baseUrl}${endpoint}`);
        console.log(`${endpoint} - ${response.status} ${response.statusText}`);
        
        if (response.ok) {
          const text = await response.text();
          const preview = text.substring(0, 150).replace(/\n/g, ' ');
          console.log(`   ✅ Response preview: ${preview}...`);
        }
      } catch (error) {
        console.log(`${endpoint} - Error: ${error.message}`);
      }
    }
    
  } catch (error) {
    console.error('Error checking routes:', error);
  }
}

checkRoutes();