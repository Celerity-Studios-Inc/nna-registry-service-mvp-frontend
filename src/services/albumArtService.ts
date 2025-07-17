/**
 * Phase 2A: Album Art Service for Songs Layer
 * Fetches album artwork from multiple sources for enhanced Songs metadata
 */

export interface AlbumArtResult {
  url: string;
  size: string;
  source: 'itunes' | 'lastfm' | 'spotify';
  quality: 'low' | 'medium' | 'high';
}

export interface SongSearchData {
  songName: string;
  artistName: string;
  albumName?: string;
}

class AlbumArtService {
  private cache = new Map<string, AlbumArtResult>();
  
  /**
   * Main method to fetch album art with fallback sources
   */
  async fetchAlbumArt(songData: SongSearchData): Promise<AlbumArtResult | null> {
    const cacheKey = `${songData.songName}-${songData.artistName}`.toLowerCase();
    
    // Check cache first
    if (this.cache.has(cacheKey)) {
      console.log('[ALBUM ART] Using cached result for:', songData.songName);
      return this.cache.get(cacheKey)!;
    }
    
    console.log('[ALBUM ART] Fetching album art for:', songData);
    
    try {
      // Try iTunes API first (no API key required, good coverage)
      const iTunesResult = await this.fetchFromItunes(songData);
      if (iTunesResult) {
        this.cache.set(cacheKey, iTunesResult);
        return iTunesResult;
      }
      
      // Try alternative search patterns if the main search failed
      if (songData.artistName && songData.songName) {
        console.log('[ALBUM ART] Trying alternative search patterns...');
        
        // Try just artist name
        const artistOnlyResult = await this.fetchFromItunes({
          songName: '',
          artistName: songData.artistName,
          albumName: songData.albumName
        });
        if (artistOnlyResult) {
          console.log('[ALBUM ART] Found result using artist-only search');
          this.cache.set(cacheKey, artistOnlyResult);
          return artistOnlyResult;
        }
        
        // ENHANCED CLEANING: Better handling of extracted song data
        const cleanedSongData = {
          songName: this.cleanSongName(songData.songName),
          artistName: this.cleanArtistName(songData.artistName),
          albumName: songData.albumName
        };
        
        if (cleanedSongData.songName !== songData.songName || cleanedSongData.artistName !== songData.artistName) {
          console.log('[ALBUM ART] Trying cleaned search terms:', cleanedSongData);
          const cleanedResult = await this.fetchFromItunes(cleanedSongData);
          if (cleanedResult) {
            console.log('[ALBUM ART] Found result using cleaned search terms');
            this.cache.set(cacheKey, cleanedResult);
            return cleanedResult;
          }
        }
      }
      
      // Could add additional sources here (Last.fm, Spotify, etc.)
      console.log('[ALBUM ART] No album art found for:', songData.songName, 'by', songData.artistName);
      return null;
      
    } catch (error) {
      console.warn('[ALBUM ART] Error fetching album art:', error);
      return null;
    }
  }
  
  /**
   * Fetch from iTunes API
   */
  private async fetchFromItunes(songData: SongSearchData): Promise<AlbumArtResult | null> {
    try {
      // Build search query
      let searchTerm = songData.songName;
      if (songData.artistName) {
        searchTerm += ` ${songData.artistName}`;
      }
      
      const url = `https://itunes.apple.com/search?term=${encodeURIComponent(searchTerm)}&media=music&limit=10&entity=song`;
      
      console.log('[ALBUM ART] iTunes API request:', url);
      
      const response = await fetch(url);
      if (!response.ok) {
        console.warn('[ALBUM ART] iTunes API error:', response.status);
        return null;
      }
      
      const data = await response.json();
      
      if (!data.results || data.results.length === 0) {
        console.log('[ALBUM ART] No iTunes results found');
        return null;
      }
      
      // Find best match
      const bestMatch = this.findBestMatch(data.results, songData);
      if (!bestMatch || !bestMatch.artworkUrl100) {
        console.log('[ALBUM ART] No suitable iTunes match found');
        return null;
      }
      
      // Get high-resolution artwork URL
      const artworkUrl = this.getHighResolutionUrl(bestMatch.artworkUrl100);
      
      // CRITICAL FIX: Validate URL before returning
      if (!artworkUrl || !this.isValidImageUrl(artworkUrl)) {
        console.warn('[ALBUM ART] Generated artwork URL is invalid:', artworkUrl);
        return null;
      }
      
      console.log('[ALBUM ART] iTunes match found:', {
        track: bestMatch.trackName,
        artist: bestMatch.artistName,
        artwork: artworkUrl
      });
      
      return {
        url: artworkUrl,
        size: '600x600',
        source: 'itunes',
        quality: 'high'
      };
      
    } catch (error) {
      console.warn('[ALBUM ART] iTunes fetch error:', error);
      return null;
    }
  }
  
  /**
   * Find the best matching result from iTunes API
   */
  private findBestMatch(results: any[], songData: SongSearchData): any | null {
    // Scoring algorithm to find best match
    let bestMatch = null;
    let bestScore = 0;
    
    for (const result of results) {
      let score = 0;
      
      // Check track name match
      if (result.trackName) {
        const trackSimilarity = this.calculateSimilarity(
          songData.songName.toLowerCase(),
          result.trackName.toLowerCase()
        );
        score += trackSimilarity * 3; // Weight track name heavily
      }
      
      // Check artist name match
      if (result.artistName && songData.artistName) {
        const artistSimilarity = this.calculateSimilarity(
          songData.artistName.toLowerCase(),
          result.artistName.toLowerCase()
        );
        score += artistSimilarity * 2; // Weight artist name moderately
      }
      
      // Check album name match if available
      if (result.collectionName && songData.albumName) {
        const albumSimilarity = this.calculateSimilarity(
          songData.albumName.toLowerCase(),
          result.collectionName.toLowerCase()
        );
        score += albumSimilarity; // Weight album name lightly
      }
      
      if (score > bestScore) {
        bestScore = score;
        bestMatch = result;
      }
    }
    
    // Only return match if score is reasonable
    return bestScore > 0.3 ? bestMatch : null;
  }
  
  /**
   * Calculate string similarity (simple implementation)
   */
  private calculateSimilarity(str1: string, str2: string): number {
    // Simple substring matching for now
    if (str1 === str2) return 1.0;
    if (str1.includes(str2) || str2.includes(str1)) return 0.8;
    
    // Check for partial word matches
    const words1 = str1.split(/\s+/);
    const words2 = str2.split(/\s+/);
    let matchingWords = 0;
    
    for (const word1 of words1) {
      for (const word2 of words2) {
        if (word1.length > 2 && word2.length > 2 && 
            (word1.includes(word2) || word2.includes(word1))) {
          matchingWords++;
          break;
        }
      }
    }
    
    return matchingWords / Math.max(words1.length, words2.length);
  }
  
  /**
   * Convert iTunes artwork URL to higher resolution
   */
  private getHighResolutionUrl(artworkUrl: string): string {
    // iTunes provides different resolutions by changing the size parameter
    return artworkUrl
      .replace(/100x100/, '600x600')
      .replace(/60x60/, '600x600')
      .replace(/30x30/, '600x600');
  }
  
  /**
   * Clean song name for better iTunes API search results
   * Removes common patterns that interfere with search
   */
  private cleanSongName(songName: string): string {
    return songName
      .replace(/^["'`]|["'`]$/g, '') // Remove leading/trailing quotes
      .replace(/\s*song\s*$/i, '') // Remove " song" suffix
      .replace(/\s*track\s*$/i, '') // Remove " track" suffix
      .replace(/\s*-\s*official\s*/i, '') // Remove "- official"
      .replace(/\s*\(official[^)]*\)/i, '') // Remove "(official...)"
      .replace(/\s*\[official[^\]]*\]/i, '') // Remove "[official...]"
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();
  }
  
  /**
   * Clean artist name for better iTunes API search results
   * Removes common patterns that interfere with search
   */
  private cleanArtistName(artistName: string): string {
    return artistName
      .replace(/^["'`]|["'`]$/g, '') // Remove leading/trailing quotes
      .replace(/\s*-\s*topic$/i, '') // Remove "- Topic" suffix
      .replace(/\s*official$/i, '') // Remove "Official" suffix
      .replace(/\s*\(official[^)]*\)/i, '') // Remove "(official...)"
      .replace(/\s*\[official[^\]]*\]/i, '') // Remove "[official...]"
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();
  }

  /**
   * Validate that a URL is a proper image URL
   */
  private isValidImageUrl(url: string): boolean {
    try {
      const urlObj = new URL(url);
      
      // Check if it's HTTPS
      if (urlObj.protocol !== 'https:') {
        return false;
      }
      
      // Check if it's from a trusted domain
      const trustedDomains = ['is1-ssl.mzstatic.com', 'is2-ssl.mzstatic.com', 'is3-ssl.mzstatic.com', 'is4-ssl.mzstatic.com', 'is5-ssl.mzstatic.com'];
      if (!trustedDomains.some(domain => urlObj.hostname.includes(domain))) {
        console.warn('[ALBUM ART] URL from untrusted domain:', urlObj.hostname);
        return false;
      }
      
      // Check if it looks like an image URL
      const pathname = urlObj.pathname.toLowerCase();
      if (!pathname.includes('.jpg') && !pathname.includes('.jpeg') && !pathname.includes('.png')) {
        console.warn('[ALBUM ART] URL does not appear to be an image:', pathname);
        return false;
      }
      
      return true;
    } catch (error) {
      console.warn('[ALBUM ART] Invalid URL format:', url, error);
      return false;
    }
  }

  /**
   * Clear the cache (useful for testing)
   */
  clearCache(): void {
    this.cache.clear();
    console.log('[ALBUM ART] Cache cleared');
  }
  
  /**
   * Get cache statistics
   */
  getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }
}

// Export singleton instance
export const albumArtService = new AlbumArtService();
export default albumArtService;