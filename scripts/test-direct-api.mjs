#!/usr/bin/env node

/**
 * Script to directly fetch assets from the backend API without going through the frontend proxy
 * This is useful for testing the backend API directly and diagnosing issues
 * 
 * Usage:
 * node scripts/test-direct-api.mjs [token]
 * 
 * The token is optional - if provided, it will be used for authentication
 * If not provided, the script will try to get a token from the local storage file
 */

import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';

// Configuration
const BACKEND_API_URL = 'https://registry.reviz.dev/api';
const DEFAULT_LIMIT = 10;

// Get token from command line args or local storage
async function getToken() {
  // Check if provided as command line arg
  const providedToken = process.argv[2];
  if (providedToken) {
    console.log('Using token provided as command line argument');
    return providedToken;
  }
  
  // Try to read token from localStorage backup file if available
  try {
    const localStoragePath = path.join(process.env.HOME || process.env.USERPROFILE, '.nna-registry-ls-backup.json');
    if (fs.existsSync(localStoragePath)) {
      const data = JSON.parse(fs.readFileSync(localStoragePath, 'utf8'));
      if (data.accessToken) {
        console.log('Using token from local storage backup file');
        return data.accessToken;
      }
    }
  } catch (error) {
    console.error('Error reading local storage backup file:', error);
  }
  
  console.log('No token available. Requests to protected endpoints will fail.');
  return null;
}

/**
 * Fetch assets directly from the backend API
 */
async function fetchAssets(token, limit = DEFAULT_LIMIT) {
  const endpoint = `${BACKEND_API_URL}/assets`;
  const params = new URLSearchParams({
    page: 1,
    limit,
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });
  
  console.log(`Fetching ${limit} most recent assets from ${endpoint}?${params.toString()}`);
  
  const headers = {
    'Content-Type': 'application/json'
  };
  
  // Add authorization header if token is available
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  try {
    const response = await fetch(`${endpoint}?${params.toString()}`, {
      method: 'GET',
      headers
    });
    
    console.log(`Response status: ${response.status} ${response.statusText}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error response:', errorText);
      throw new Error(`API request failed with status ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching assets:', error);
    throw error;
  }
}

/**
 * Fetch a single asset by ID
 */
async function fetchAssetById(id, token) {
  const endpoint = `${BACKEND_API_URL}/assets/${id}`;
  
  console.log(`Fetching asset by ID from ${endpoint}`);
  
  const headers = {
    'Content-Type': 'application/json'
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  try {
    const response = await fetch(endpoint, {
      method: 'GET',
      headers
    });
    
    console.log(`Response status: ${response.status} ${response.statusText}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error response:', errorText);
      throw new Error(`API request failed with status ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Error fetching asset ${id}:`, error);
    throw error;
  }
}

/**
 * Search for assets by keyword
 */
async function searchAssets(query, token, limit = DEFAULT_LIMIT) {
  const endpoint = `${BACKEND_API_URL}/assets`;
  const params = new URLSearchParams({
    search: query,
    page: 1,
    limit,
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });
  
  console.log(`Searching assets with query "${query}" from ${endpoint}?${params.toString()}`);
  
  const headers = {
    'Content-Type': 'application/json'
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  try {
    const response = await fetch(`${endpoint}?${params.toString()}`, {
      method: 'GET',
      headers
    });
    
    console.log(`Response status: ${response.status} ${response.statusText}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error response:', errorText);
      throw new Error(`API request failed with status ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error searching assets:', error);
    throw error;
  }
}

/**
 * Main function
 */
async function main() {
  try {
    // Get token
    const token = await getToken();
    
    // Fetch recent assets
    console.log('\n=== Fetching 10 Most Recent Assets ===\n');
    const assets = await fetchAssets(token);
    
    // Process and display the assets
    if (assets.success && assets.data) {
      const assetItems = Array.isArray(assets.data) ? assets.data : 
                        assets.data.items ? assets.data.items : [];
      
      if (assetItems.length === 0) {
        console.log('No assets found');
      } else {
        console.log(`Found ${assetItems.length} assets\n`);
        
        // Display each asset
        assetItems.forEach((asset, index) => {
          const id = asset.id || asset._id;
          console.log(`${index + 1}. ${asset.name || 'Unnamed Asset'} (ID: ${id})`);
          console.log(`   NNA Address: ${asset.nnaAddress || 'N/A'}`);
          console.log(`   Created: ${new Date(asset.createdAt).toLocaleString()}`);
          console.log(`   Creator: ${asset.createdBy || 'Unknown'}`);
          console.log(`   Tags: ${asset.tags?.join(', ') || 'None'}`);
          console.log(`   URL: ${asset.gcpStorageUrl || 'N/A'}`);
          console.log('');
        });
        
        // If assets are available, fetch one by ID as example
        if (assetItems.length > 0) {
          const firstAssetId = assetItems[0].id || assetItems[0]._id;
          
          console.log(`\n=== Fetching Asset Detail for ID: ${firstAssetId} ===\n`);
          try {
            const assetDetail = await fetchAssetById(firstAssetId, token);
            console.log('Asset detail:', JSON.stringify(assetDetail, null, 2));
          } catch (error) {
            console.log('Could not fetch asset detail:', error.message);
          }
        }
        
        // Try a search with the word "sunset" if assets are available
        console.log('\n=== Searching for Assets with "sunset" ===\n');
        try {
          const searchResults = await searchAssets('sunset', token);
          
          // Process search results
          if (searchResults.success && searchResults.data) {
            const searchItems = Array.isArray(searchResults.data) ? searchResults.data : 
                              searchResults.data.items ? searchResults.data.items : [];
            
            console.log(`Found ${searchItems.length} assets matching "sunset"\n`);
            
            searchItems.forEach((asset, index) => {
              console.log(`${index + 1}. ${asset.name || 'Unnamed Asset'} (ID: ${asset.id || asset._id})`);
              console.log(`   NNA Address: ${asset.nnaAddress || 'N/A'}`);
              console.log('');
            });
          } else {
            console.log('No search results found or invalid response format');
          }
        } catch (error) {
          console.log('Search failed:', error.message);
        }
      }
    } else {
      console.log('Failed to get assets or invalid response format');
      console.log('Response:', JSON.stringify(assets, null, 2));
    }
  } catch (error) {
    console.error('Script failed:', error);
    process.exit(1);
  }
}

// Run the script
main();