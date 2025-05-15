#!/usr/bin/env node

/**
 * Script to authenticate with the backend API and save the token
 * 
 * Usage:
 * node scripts/auth-api.mjs <email> <password>
 * 
 * The email and password should be credentials for an existing user on the backend
 */

import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';
import readline from 'readline';

// Configuration
const BACKEND_API_URL = 'https://registry.reviz.dev/api';

// Create readline interface for user input if needed
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Get credentials from command line or prompt user
async function getCredentials() {
  const email = process.argv[2];
  const password = process.argv[3];
  
  if (email && password) {
    return { email, password };
  }
  
  // Prompt user for credentials
  const promptEmail = () => new Promise(resolve => {
    rl.question('Enter your email: ', resolve);
  });
  
  const promptPassword = () => new Promise(resolve => {
    rl.question('Enter your password: ', resolve);
  });
  
  console.log('No credentials provided as command line arguments.');
  const promptedEmail = await promptEmail();
  const promptedPassword = await promptPassword();
  
  return { email: promptedEmail, password: promptedPassword };
}

// Login to get a token
async function login(email, password) {
  const endpoint = `${BACKEND_API_URL}/auth/login`;
  
  console.log(`Logging in as ${email} to ${endpoint}`);
  
  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });
    
    console.log(`Response status: ${response.status} ${response.statusText}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error response:', errorText);
      throw new Error(`Login failed with status ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.success && data.data && data.data.token) {
      console.log('Login successful! Token received.');
      return data.data.token;
    } else {
      console.error('Invalid response format:', data);
      throw new Error('Login response did not contain a token');
    }
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
}

// Save token to local file
function saveToken(token) {
  const localStoragePath = path.join(process.env.HOME || process.env.USERPROFILE, '.nna-registry-ls-backup.json');
  
  // Create or update the local storage backup file
  try {
    let data = {};
    
    // Read existing file if it exists
    if (fs.existsSync(localStoragePath)) {
      data = JSON.parse(fs.readFileSync(localStoragePath, 'utf8'));
    }
    
    // Update with new token
    data.accessToken = token;
    
    // Write back to file
    fs.writeFileSync(localStoragePath, JSON.stringify(data, null, 2), 'utf8');
    
    console.log(`Token saved to ${localStoragePath}`);
    return true;
  } catch (error) {
    console.error('Error saving token:', error);
    return false;
  }
}

// Main function
async function main() {
  try {
    // Get credentials
    const { email, password } = await getCredentials();
    
    // Login
    const token = await login(email, password);
    
    // Save token
    const saved = saveToken(token);
    
    if (saved) {
      console.log('\nToken has been saved and will be used by the test-direct-api.mjs script.');
      console.log('You can now run: node scripts/test-direct-api.mjs');
    } else {
      console.log('\nToken could not be saved, but you can still use it directly:');
      console.log(`node scripts/test-direct-api.mjs ${token}`);
    }
    
    // Print the token for reference
    console.log('\nToken:');
    console.log(token);
  } catch (error) {
    console.error('Script failed:', error);
    process.exit(1);
  } finally {
    rl.close();
  }
}

// Run the script
main();