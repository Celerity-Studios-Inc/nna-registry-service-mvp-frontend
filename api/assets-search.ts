import type { VercelRequest, VercelResponse } from '@vercel/node';
import fetch from 'node-fetch';

/**
 * Advanced assets search endpoint handler
 * This specialized endpoint handles complex search queries for assets
 * It supports all the advanced filtering options in AssetSearchParams
 */
async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers upfront
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, Accept, Authorization');
  
  // Handle preflight requests immediately
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  console.log(`ASSETS SEARCH HANDLER: ${req.method} ${req.url}`);
  
  try {
    // Hard-code the backend URL for search endpoint
    const backendUrl = 'https://registry.reviz.dev/api/assets/search';
    
    if (req.method !== 'POST') {
      // Only POST is supported for advanced search
      return res.status(405).json({
        error: 'Method not allowed',
        message: 'Only POST method is supported for advanced search'
      });
    }
    
    // Create headers object to forward
    const headers: Record<string, string> = {};
    
    // Copy relevant headers
    Object.entries(req.headers).forEach(([key, value]) => {
      // Skip host header which will be set by fetch
      if (key.toLowerCase() !== 'host' && typeof value === 'string') {
        headers[key] = value;
      }
    });
    
    // Set a specific Host header for the backend
    headers['host'] = 'registry.reviz.dev';
    
    console.log('Forwarding search request to backend with headers:', {
      contentType: headers['content-type'],
      authorization: headers['authorization'] ? 'Present' : 'Missing'
    });

    // Log search parameters for debugging (but not sensitive data)
    const searchParams = req.body;
    console.log('Search parameters:', {
      search: searchParams.search,
      layer: searchParams.layer,
      category: searchParams.category,
      subcategory: searchParams.subcategory,
      hasAdvancedFilters: !!searchParams.advancedFilter,
      hasPagination: !!(searchParams.page || searchParams.limit),
      hasSorting: !!(searchParams.sort || searchParams.sortBy || searchParams.sortFields)
    });
    
    // Forward the request to the backend
    const response = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        ...headers,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(req.body)
    });
    
    // Get the response body
    const responseBody = await response.text();
    
    // Log response details
    console.log(`ASSETS SEARCH HANDLER - Backend response: ${response.status} ${response.statusText}`);
    
    // For debugging: Log detailed error information for non-success responses
    if (response.status >= 400) {
      console.error(`ASSETS SEARCH HANDLER - Backend returned error status: ${response.status}`);
      console.error(`ASSETS SEARCH HANDLER - Error response body: ${responseBody.substring(0, 1000)}`);
    }
    
    // Try to parse response as JSON
    let parsedResponse;
    try {
      parsedResponse = JSON.parse(responseBody);
      
      // Add helpful debug information for errors
      if (response.status === 400) {
        parsedResponse = {
          ...parsedResponse,
          _debug: {
            message: "The server returned a 400 Bad Request error. This typically indicates invalid search parameters.",
            possibleSolutions: [
              "Check that all parameters have valid values",
              "Ensure date formats are ISO strings (YYYY-MM-DD)",
              "Verify operators in advancedFilter are valid"
            ],
            timestamp: new Date().toISOString()
          }
        };
      }
    } catch (e) {
      // If not valid JSON, return the raw text
      parsedResponse = { 
        text: responseBody,
        error: "Response couldn't be parsed as JSON"
      };
    }
    
    // Copy response headers
    for (const [key, value] of Object.entries(response.headers.raw())) {
      if (key.toLowerCase() !== 'transfer-encoding') {
        res.setHeader(key, value);
      }
    }
    
    // Return the response
    return res.status(response.status).json(parsedResponse);
    
  } catch (error) {
    console.error('ASSETS SEARCH HANDLER ERROR:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
}

module.exports = handler;