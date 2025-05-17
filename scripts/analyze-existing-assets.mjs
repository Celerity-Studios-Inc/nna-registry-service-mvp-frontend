#!/usr/bin/env node

/**
 * Analyze Existing Assets Script
 * 
 * This script fetches existing assets from the API and analyzes their sequential numbering patterns
 * to identify which subcategories use relative vs. absolute counters.
 * 
 * Usage:
 *   node analyze-existing-assets.mjs
 */

import fetch from 'node-fetch';

// Configuration
const API_URL = process.env.API_URL || 'https://registry.reviz.dev/api';
const AUTH_TOKEN = process.env.AUTH_TOKEN || ''; // Set this before running the script

/**
 * Fetch all assets from the API
 */
async function fetchAssets() {
  try {
    console.log("Fetching assets from API...");
    
    const response = await fetch(`${API_URL}/assets`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${AUTH_TOKEN}`
      }
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }
    
    const result = await response.json();
    console.log(`Found ${result.length || result.data?.length || 0} assets`);
    
    // Return the assets array from the response
    return result.data || result;
  } catch (error) {
    console.error("Error fetching assets:", error);
    return [];
  }
}

/**
 * Analyze assets to identify sequential numbering patterns
 */
function analyzeAssets(assets) {
  // Group assets by layer.category.subcategory
  const grouped = {};
  
  for (const asset of assets) {
    // Skip assets without proper data
    if (!asset.layer || !asset.category || !asset.subcategory) continue;
    
    const key = `${asset.layer}.${asset.category}.${asset.subcategory}`;
    if (!grouped[key]) {
      grouped[key] = [];
    }
    
    // Extract sequential number from HFN
    let sequentialNumber = '';
    if (asset.name && asset.name.includes('.')) {
      const parts = asset.name.split('.');
      if (parts.length === 4) {
        sequentialNumber = parts[3];
      }
    }
    
    grouped[key].push({
      id: asset.id || asset._id,
      hfn: asset.name,
      mfa: asset.nna_address || asset.metadata?.machineFriendlyAddress,
      sequentialNumber
    });
  }
  
  console.log("\n=== SEQUENTIAL NUMBERING ANALYSIS ===\n");
  
  // For each group, analyze sequential numbers
  for (const [key, group] of Object.entries(grouped)) {
    // Sort by sequential number
    group.sort((a, b) => {
      const seqA = parseInt(a.sequentialNumber, 10) || 0;
      const seqB = parseInt(b.sequentialNumber, 10) || 0;
      return seqA - seqB;
    });
    
    console.log(`\n${key} (${group.length} assets):`);
    console.log("-".repeat(50));
    
    // Get array of sequential numbers
    const sequentialNumbers = group.map(a => parseInt(a.sequentialNumber, 10) || 0);
    
    // Check if numbers are sequential (relative counter)
    const isSequential = sequentialNumbers.every((num, i) => {
      if (i === 0) return true;
      return num === sequentialNumbers[i-1] + 1;
    });
    
    // Check if numbers are all different from other groups (relative counter)
    const allSequentialNumbers = Object.values(grouped)
      .flat()
      .map(a => parseInt(a.sequentialNumber, 10) || 0);
      
    const hasUniqueNumbers = !sequentialNumbers.some(num => {
      const count = allSequentialNumbers.filter(n => n === num).length;
      return count > 1;
    });
    
    // Print sequential numbers
    console.log("Assets:", group.map(a => `${a.hfn} -> ${a.mfa}`).join('\n        '));
    
    // Determine if this group likely uses a relative counter
    const likelyRelativeCounter = isSequential || hasUniqueNumbers;
    console.log(`\nCounter Type: ${likelyRelativeCounter ? "Likely RELATIVE" : "Likely ABSOLUTE"}`);
    console.log(`Sequential Pattern: ${isSequential ? "YES" : "NO"}`);
    console.log(`Unique Numbers: ${hasUniqueNumbers ? "YES" : "NO"}`);
  }
}

/**
 * Main function
 */
async function main() {
  // Check if we have an auth token
  if (!AUTH_TOKEN) {
    console.error("ERROR: Please set the AUTH_TOKEN environment variable before running this script.");
    console.error("Example: AUTH_TOKEN=your_jwt_token node analyze-existing-assets.mjs");
    process.exit(1);
  }
  
  // Fetch assets and analyze them
  const assets = await fetchAssets();
  
  if (assets && assets.length > 0) {
    analyzeAssets(assets);
  } else {
    console.error("No assets found or unable to fetch assets.");
  }
}

// Run the main function
main();