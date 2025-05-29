/**
 * Video thumbnail generation utility for asset cards
 * Generates thumbnail images from video URLs for better UI display
 */

// Cache for generated thumbnails to avoid regenerating
const thumbnailCache = new Map<string, string>();

/**
 * Generate a thumbnail from a video URL
 * @param videoUrl The URL of the video
 * @param timeOffset Time in seconds to capture frame (default: 1 second)
 * @returns Promise resolving to base64 data URL of thumbnail
 */
export const generateVideoThumbnail = (
  videoUrl: string, 
  timeOffset: number = 1
): Promise<string> => {
  return new Promise((resolve, reject) => {
    // Check cache first
    const cacheKey = `${videoUrl}-${timeOffset}`;
    if (thumbnailCache.has(cacheKey)) {
      resolve(thumbnailCache.get(cacheKey)!);
      return;
    }

    const video = document.createElement('video');
    video.crossOrigin = 'anonymous';
    video.muted = true; // Required for autoplay policies
    video.preload = 'metadata';
    
    console.log(`🎬 Starting thumbnail generation for: ${videoUrl}`);
    
    // Set up canvas for thumbnail generation
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      reject(new Error('Canvas context not available'));
      return;
    }

    // Set thumbnail dimensions (16:9 aspect ratio)
    canvas.width = 160;
    canvas.height = 90;

    let hasResolved = false;

    const cleanup = () => {
      if (video.parentNode) {
        video.parentNode.removeChild(video);
      }
    };

    const resolveWithThumbnail = () => {
      if (hasResolved) return;
      hasResolved = true;

      try {
        console.log(`🖼️ Drawing video frame to canvas for ${videoUrl}`);
        // Draw video frame to canvas
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Convert to base64 data URL
        const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
        console.log(`✅ Successfully generated thumbnail data URL (${dataUrl.length} chars)`);
        
        // Cache the result
        thumbnailCache.set(cacheKey, dataUrl);
        
        cleanup();
        resolve(dataUrl);
      } catch (error) {
        console.error(`❌ Canvas drawing failed for ${videoUrl}:`, error);
        cleanup();
        reject(error);
      }
    };

    // Handle successful metadata load
    video.addEventListener('loadedmetadata', () => {
      console.log(`📹 Video metadata loaded for ${videoUrl}, duration: ${video.duration}s`);
      // Seek to a better position in the video to avoid black frames
      // Try 25% into the video, but not less than 0.5s and not more than 3s
      const seekTime = Math.max(0.5, Math.min(3, video.duration * 0.25));
      console.log(`⏰ Seeking to ${seekTime}s (25% of duration) for thumbnail capture`);
      video.currentTime = seekTime;
    });

    // Handle successful seek - capture frame
    video.addEventListener('seeked', resolveWithThumbnail);

    // Handle successful frame load (for some browsers)
    video.addEventListener('loadeddata', () => {
      if (video.currentTime > 0) {
        resolveWithThumbnail();
      }
    });

    // Handle errors
    video.addEventListener('error', (e) => {
      console.error(`❌ Video error for ${videoUrl}:`, e);
      console.error('Video error details:', video.error);
      cleanup();
      reject(new Error(`Failed to load video: ${video.error?.message || 'Unknown error'}`));
    });

    // Timeout after 10 seconds
    const timeout = setTimeout(() => {
      if (!hasResolved) {
        console.warn('Video thumbnail generation timed out');
        cleanup();
        reject(new Error('Video thumbnail generation timed out'));
      }
    }, 10000);

    // Start loading the video
    video.src = videoUrl;
    video.load();

    // Clean up timeout when done
    const originalResolve = resolve;
    const originalReject = reject;
    resolve = (value: string | PromiseLike<string>) => {
      clearTimeout(timeout);
      originalResolve(value);
    };
    reject = (error: Error) => {
      clearTimeout(timeout);
      originalReject(error);
    };
  });
};

/**
 * Check if a URL points to a video file
 * @param url The URL to check
 * @returns True if the URL appears to be a video file
 */
export const isVideoUrl = (url: string): boolean => {
  if (!url) return false;
  
  const videoExtensions = ['.mp4', '.webm', '.ogg', '.mov', '.avi', '.mkv'];
  const lowerUrl = url.toLowerCase();
  
  return videoExtensions.some(ext => lowerUrl.includes(ext));
};

/**
 * Clear the thumbnail cache (useful for memory management)
 */
export const clearThumbnailCache = (): void => {
  thumbnailCache.clear();
};

/**
 * Get cache size for debugging
 */
export const getThumbnailCacheSize = (): number => {
  return thumbnailCache.size;
};