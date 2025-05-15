#!/usr/bin/env node

/**
 * Simple script to fetch assets from the backend API
 * 
 * Usage:
 * node scripts/fetch-assets.mjs
 */

import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';

// The backend API URL
const API_URL = 'https://registry.reviz.dev/api';

// Get token from local storage backup file
function getToken() {
  try {
    const localStoragePath = path.join(process.env.HOME || process.env.USERPROFILE, '.nna-registry-ls-backup.json');
    if (fs.existsSync(localStoragePath)) {
      const data = JSON.parse(fs.readFileSync(localStoragePath, 'utf8'));
      return data.accessToken;
    }
  } catch (error) {
    console.error('Error reading token:', error.message);
  }
  return null;
}

// Main function to fetch assets
async function fetchAssets() {
  console.log('=== Fetching Recent Assets ===\n');
  
  // Get the token
  const token = getToken();
  
  if (!token) {
    console.log('No authentication token found.');
    console.log('Please run: node scripts/auth-api.mjs first');
    return;
  }
  
  console.log('Token found. Fetching assets...\n');
  
  try {
    // Make the API request
    const response = await fetch(`${API_URL}/assets?page=1&limit=10`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log(`Response status: ${response.status} ${response.statusText}`);
    
    // Check if successful
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error from API:', errorText);
      console.log('\nThe request failed. Please check:');
      console.log('1. Your authentication token is valid');
      console.log('2. The backend API is running');
      console.log('3. You have permission to access assets');
      return;
    }
    
    // Parse the response
    const responseText = await response.text();
    try {
      const data = JSON.parse(responseText);
      
      // Extract the assets
      let assets = [];
      
      if (data.success && data.data) {
        // Format 1: { success: true, data: [...] }
        assets = Array.isArray(data.data) ? data.data : [];
        
        // Format 2: { success: true, data: { items: [...] } }
        if (!Array.isArray(data.data) && data.data.items) {
          assets = data.data.items;
        }
      } else if (Array.isArray(data)) {
        // Format 3: Direct array of assets
        assets = data;
      }
      
      // Display the assets
      if (assets.length === 0) {
        console.log('No assets found. You may need to create some first.');
      } else {
        console.log(`Found ${assets.length} assets:\n`);
        
        assets.forEach((asset, index) => {
          console.log(`Asset ${index + 1}: ${asset.name || 'Unnamed'}`);
          console.log(`  ID: ${asset.id || asset._id || 'Unknown'}`);
          console.log(`  NNA Address: ${asset.nnaAddress || 'N/A'}`);
          console.log(`  Created: ${asset.createdAt ? new Date(asset.createdAt).toLocaleString() : 'Unknown'}`);
          console.log(`  Type: ${asset.type || 'Unknown'}`);
          console.log(`  Tags: ${asset.tags ? asset.tags.join(', ') : 'None'}`);
          console.log('');
        });
      }
    } catch (error) {
      console.error('Error parsing response:', error.message);
      console.log('Response was not valid JSON:', responseText.substring(0, 200) + '...');
    }
  } catch (error) {
    console.error('Error fetching assets:', error.message);
    console.log('\nPlease check:');
    console.log('1. Your internet connection');
    console.log('2. The backend API is running at', API_URL);
  }
}

// Run the script
fetchAssets().catch(error => {
  console.error('Script failed:', error);
  process.exit(1);
});