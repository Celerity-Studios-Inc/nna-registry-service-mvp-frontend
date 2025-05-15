import { Asset, AssetSearchParams } from '../types/asset.types';
import { PaginatedResponse } from '../types/api.types';

/**
 * Mock implementation of asset service for testing and development
 */
export class MockAssetService {
  /**
   * Get assets with filtering and pagination
   */
  getAssets(params: AssetSearchParams = {}): PaginatedResponse<Asset> {
    console.log('[MOCK] Generating mock assets with params:', params);
    
    // Default pagination values
    const page = params.page || 1;
    const limit = params.limit || 12;
    
    // Generate a larger pool of assets to allow for pagination
    const allAssets = this.generateDummyAssets(100);
    
    // Apply search filters if provided
    let filteredAssets = allAssets;
    
    if (params.search) {
      const searchLower = params.search.toLowerCase();
      filteredAssets = allAssets.filter(asset =>
        (asset.name?.toLowerCase().includes(searchLower) || false) ||
        (asset.description?.toLowerCase().includes(searchLower) || false) ||
        (asset.tags && asset.tags.some(tag => (tag?.toLowerCase().includes(searchLower)) || false))
      );
    }
    
    if (params.layer) {
      filteredAssets = filteredAssets.filter(asset => asset.layer === params.layer);
    }
    
    if (params.category) {
      filteredAssets = filteredAssets.filter(asset => asset.categoryCode === params.category);
    }
    
    if (params.subcategory) {
      filteredAssets = filteredAssets.filter(asset => asset.subcategoryCode === params.subcategory);
    }
    
    // Apply sorting
    if (params.sortBy) {
      const sortOrder = params.order === 'asc' ? 1 : -1;
      const sortBy = params.sortBy;
      
      filteredAssets.sort((a, b) => {
        const valueA = (a as any)[sortBy];
        const valueB = (b as any)[sortBy];
        
        // Handle dates
        if (sortBy === 'createdAt' || sortBy === 'updatedAt') {
          return sortOrder * (new Date(valueA).getTime() - new Date(valueB).getTime());
        }
        
        // Handle strings
        if (typeof valueA === 'string' && typeof valueB === 'string') {
          return sortOrder * valueA.localeCompare(valueB);
        }
        
        // Handle numbers
        if (typeof valueA === 'number' && typeof valueB === 'number') {
          return sortOrder * (valueA - valueB);
        }
        
        return 0;
      });
    }
    
    // Apply pagination
    const totalItems = filteredAssets.length;
    const totalPages = Math.ceil(totalItems / limit);
    const startIndex = (page - 1) * limit;
    const endIndex = Math.min(startIndex + limit, totalItems);
    const paginatedAssets = filteredAssets.slice(startIndex, endIndex);
    
    console.log(`[MOCK] Page ${page} of ${totalPages}, showing ${paginatedAssets.length} of ${totalItems} assets`);
    
    return {
      data: paginatedAssets,
      pagination: {
        total: totalItems,
        page: page,
        limit: limit,
        pages: totalPages
      }
    };
  }
  
  /**
   * Generate dummy assets for development and fallback scenarios
   * @param count Number of dummy assets to generate
   * @returns Array of dummy assets
   */
  generateDummyAssets(count: number = 10): Asset[] {
    const assets: Asset[] = [];

    const layers = ['G', 'S', 'L', 'M', 'W'];
    const categories = ['POP', 'ROK', 'HIP', 'TRO', 'FAN'];
    const subcategories = ['BAS', 'PRO', 'ADV', 'HRD', 'HPM'];
    const names = [
      'Moonlight Serenade',
      'Star Dancer',
      'Ocean Waves',
      'Mountain Echo',
      'Desert Wind',
      'Forest Whisper',
      'City Lights',
      'River Flow',
      'Sunset Glow',
      'Northern Lights',
      'Urban Jungle',
      'Neon Dreams',
      'Digital Sunset',
      'Virtual Horizons',
      'Crystal Cave',
      'Emerald Forest',
      'Golden Beach',
      'Silver Stream',
      'Diamond Sky',
      'Ruby Twilight'
    ];
    const tags = [
      'popular', 'trending', 'new', 'featured', 'classic',
      'rock', 'pop', 'electronic', 'acoustic', 'instrumental',
      'beach', 'mountain', 'forest', 'desert', 'city',
      'sunset', 'sunrise', 'night', 'day', 'twilight'
    ];

    for (let i = 0; i < count; i++) {
      const layer = layers[Math.floor(Math.random() * layers.length)];
      const category = categories[Math.floor(Math.random() * categories.length)];
      const subcategory = subcategories[Math.floor(Math.random() * subcategories.length)];
      const sequentialNumber = String(Math.floor(Math.random() * 999) + 1).padStart(3, '0');
      const nnaAddress = `${layer}.${category}.${subcategory}.${sequentialNumber}`;

      const name = names[i % names.length];

      // Generate 1-3 random tags
      const assetTags: string[] = [];
      const tagCount = Math.floor(Math.random() * 3) + 1;
      for (let j = 0; j < tagCount; j++) {
        const tag = tags[Math.floor(Math.random() * tags.length)];
        if (!assetTags.includes(tag)) {
          assetTags.push(tag);
        }
      }

      // Add 'sunset' tag to some assets for testing search
      if (i % 5 === 0) {
        assetTags.push('sunset');
      }

      // Add some variety to the dummy assets - mix of images and videos
      const isVideo = i % 3 === 0; // Every third asset is a video

      // Use placeholder images from Lorem Picsum
      const imageUrl = `https://picsum.photos/id/${(i + 10) * 5}/300/300`;

      // Generate asset ID that's stable across refreshes
      const stableId = `mock-${i}-${layer}-${category}-${subcategory}`;

      const asset: Asset = {
        id: stableId,
        _id: stableId,
        name: `${name} (${nnaAddress})`,
        friendlyName: name,
        nnaAddress: nnaAddress,
        layer,
        categoryCode: category,
        subcategoryCode: subcategory,
        category: this.getCategoryNameForCode(layer, category),
        subcategory: this.getSubcategoryNameForCode(layer, category, subcategory),
        type: isVideo ? 'video' : 'image',
        gcpStorageUrl: isVideo ?
          'https://storage.googleapis.com/cloud-samples-data/video/gbike.mp4' :
          imageUrl,
        files: [
          {
            id: `file-${stableId}`,
            filename: isVideo ?
              `${name.toLowerCase().replace(/\s+/g, '-')}.mp4` :
              `${name.toLowerCase().replace(/\s+/g, '-')}.jpg`,
            contentType: isVideo ? 'video/mp4' : 'image/jpeg',
            size: 1024 * 1024 * (Math.floor(Math.random() * 5) + 1), // 1-5MB
            url: isVideo ?
              'https://storage.googleapis.com/cloud-samples-data/video/gbike.mp4' :
              imageUrl,
            uploadedAt: new Date(Date.now() - Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000)).toISOString(),
            thumbnailUrl: isVideo ?
              'https://storage.googleapis.com/cloud-samples-data/video/gbike.jpg' :
              imageUrl
          }
        ],
        metadata: {
          humanFriendlyName: name,
          machineFriendlyAddress: nnaAddress,
          description: `A sample ${layer} layer asset in the ${category} category.`
        },
        description: `A sample ${layer} layer asset in the ${category} category.`,
        tags: assetTags,
        createdAt: new Date(Date.now() - Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000)).toISOString(), // Random date in last 30 days
        updatedAt: new Date().toISOString(),
        createdBy: this.getCurrentUsername() || 'system',
        status: 'active' as any
      };

      assets.push(asset);
    }

    return assets;
  }

  /**
   * Helper to get a human-readable category name for a code
   */
  private getCategoryNameForCode(layer: string, code: string): string {
    const layerNames: Record<string, Record<string, string>> = {
      'G': { 'POP': 'Pop', 'ROK': 'Rock', 'HIP': 'Hip Hop' },
      'S': { 'POP': 'Pop', 'ROK': 'Rock', 'HIP': 'Hip Hop' },
      'L': { 'POP': 'Popular', 'FAS': 'Fashion', 'CAS': 'Casual' },
      'M': { 'DNC': 'Dance', 'ACT': 'Action', 'SPT': 'Sports' },
      'W': { 'BCH': 'Beach', 'TRO': 'Tropical', 'URB': 'Urban', 'FAN': 'Fantasy' }
    };

    return (layerNames[layer] && layerNames[layer][code]) || code;
  }

  /**
   * Helper to get a human-readable subcategory name for a code
   */
  private getSubcategoryNameForCode(layer: string, category: string, code: string): string {
    const specialCases: Record<string, Record<string, string>> = {
      'S.POP': { 'HPM': 'Hipster Male' },
      'S.ROK': { 'LGM': 'Legend Male' }
    };

    if (specialCases[`${layer}.${category}`] && specialCases[`${layer}.${category}`][code]) {
      return specialCases[`${layer}.${category}`][code];
    }

    const commonNames: Record<string, string> = {
      'BAS': 'Base',
      'PRO': 'Professional',
      'ADV': 'Advanced',
      'HRD': 'Hard',
      'HPM': 'Hipster Male'
    };

    return commonNames[code] || code;
  }
  
  /**
   * Helper to get the current user's username
   * @returns The current username or a meaningful fallback
   */
  private getCurrentUsername(): string {
    try {
      // Try to get the user profile from localStorage
      const userProfileStr = localStorage.getItem('userProfile');
      if (userProfileStr) {
        const userProfile = JSON.parse(userProfileStr);
        if (userProfile.username || userProfile.email) {
          return userProfile.username || userProfile.email;
        }
      }

      // If no user profile, check token for embedded username
      const token = localStorage.getItem('accessToken');
      if (token) {
        // Simple JWT parsing - split token into parts and decode the payload
        const parts = token.split('.');
        if (parts.length === 3) {
          try {
            const payload = JSON.parse(atob(parts[1]));
            if (payload.username || payload.email || payload.sub) {
              return payload.username || payload.email || payload.sub;
            }
          } catch (e) {
            console.warn('Error parsing JWT payload:', e);
          }
        }
      }

      // Try to get a name from localStorage (for persisting the dummy creator name)
      const savedCreator = localStorage.getItem('dummyCreatorName');
      if (savedCreator) {
        return savedCreator;
      }
    } catch (e) {
      console.warn('Error getting username:', e);
    }

    // Create more personalized creator names with roles
    const creators = [
      'Alex (Content Creator)',
      'Jordan (Digital Artist)',
      'Taylor (Designer)',
      'Morgan (Producer)',
      'Casey (Developer)'
    ];

    // Select a creator name and save it to localStorage for consistency
    const selectedCreator = creators[Math.floor(Math.random() * creators.length)];
    try {
      localStorage.setItem('dummyCreatorName', selectedCreator);
    } catch (e) {
      // Ignore localStorage errors
    }

    return selectedCreator;
  }
}

// Create a singleton instance
const mockAssetService = new MockAssetService();
export default mockAssetService;