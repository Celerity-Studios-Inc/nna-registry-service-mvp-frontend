/**
 * Enhanced video thumbnail generation utility for asset cards
 * Generates thumbnail images from video URLs with improved CORS handling and error recovery
 */

// Global cache for generated thumbnails to persist across component re-renders
const thumbnailCache = new Map<string, string>();

/**
 * Generate a thumbnail from a video URL with enhanced error handling
 * @param videoUrl The URL of the video
 * @param timeOffset Time in seconds to capture frame (default: 1 second)
 * @returns Promise resolving to base64 data URL of thumbnail
 */
export const generateVideoThumbnail = (
  videoUrl: string, 
  timeOffset: number = 1
): Promise<string> => {
  return new Promise((resolve, reject) => {
    console.log(`🎬 Starting thumbnail generation for: ${videoUrl}`);
    
    // Check cache first
    const cacheKey = `${videoUrl}-${timeOffset}`;
    if (thumbnailCache.has(cacheKey)) {
      const cachedUrl = thumbnailCache.get(cacheKey)!;
      console.log(`✅ Using cached thumbnail (${cachedUrl.length} chars)`);
      resolve(cachedUrl);
      return;
    }

    const video = document.createElement('video');
    
    // Enhanced CORS and security settings
    video.crossOrigin = 'anonymous';
    video.muted = true; // Required for autoplay policies
    video.preload = 'metadata';
    video.playsInline = true; // Important for mobile
    video.autoplay = false; // Prevent autoplay
    
    // Set up canvas for thumbnail generation
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d', { willReadFrequently: false });
    
    if (!ctx) {
      reject(new Error('Canvas context not available'));
      return;
    }

    // Set thumbnail dimensions (16:9 aspect ratio, higher resolution)
    canvas.width = 320;
    canvas.height = 180;

    let hasResolved = false;
    let attemptCount = 0;
    let readyStateAttempts = 0;
    const maxAttempts = 3;
    const maxReadyStateAttempts = 5;

    const cleanup = () => {
      // Remove all event listeners to prevent memory leaks
      video.removeEventListener('loadedmetadata', onLoadedMetadata);
      video.removeEventListener('seeked', onSeeked);
      video.removeEventListener('loadeddata', onLoadedData);
      video.removeEventListener('canplay', onCanPlay);
      video.removeEventListener('error', onError);
      
      // Clean up video element
      video.src = '';
      video.load();
    };

    const resolveWithThumbnail = () => {
      if (hasResolved) return;
      hasResolved = true;

      try {
        console.log(`🎯 Capturing frame at time ${video.currentTime}s (video duration: ${video.duration}s)`);
        
        // Ensure video has valid dimensions
        if (video.videoWidth === 0 || video.videoHeight === 0) {
          throw new Error('Video has no valid dimensions');
        }

        // CRITICAL FIX: Check if video is actually ready for drawing
        if (video.readyState < 2) { // HAVE_CURRENT_DATA
          console.log(`⏳ Video not ready (readyState: ${video.readyState}), waiting... (attempt ${readyStateAttempts + 1}/${maxReadyStateAttempts})`);
          
          // Increment readyState attempt counter to prevent infinite loops
          readyStateAttempts++;
          if (readyStateAttempts <= maxReadyStateAttempts) {
            setTimeout(resolveWithThumbnail, 800); // Increased wait time for slow networks
            return;
          } else {
            console.warn(`⚠️ Video readyState timeout after ${maxReadyStateAttempts} attempts, proceeding anyway`);
            // Continue anyway - sometimes we can still get a frame even with low readyState
          }
        }

        // Verify video dimensions are loaded
        console.log(`📐 Video dimensions: ${video.videoWidth}x${video.videoHeight}, readyState: ${video.readyState}`);
        
        // Clear canvas with black background (not white) to detect if frame is captured
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw video frame to canvas with proper scaling
        const aspectRatio = video.videoWidth / video.videoHeight;
        let drawWidth = canvas.width;
        let drawHeight = canvas.height;
        let offsetX = 0;
        let offsetY = 0;

        if (aspectRatio > canvas.width / canvas.height) {
          // Video is wider than canvas
          drawHeight = canvas.width / aspectRatio;
          offsetY = (canvas.height - drawHeight) / 2;
        } else {
          // Video is taller than canvas
          drawWidth = canvas.height * aspectRatio;
          offsetX = (canvas.width - drawWidth) / 2;
        }

        // ENHANCED: Draw the video frame
        ctx.drawImage(video, offsetX, offsetY, drawWidth, drawHeight);
        
        // VALIDATION: Check if canvas actually has content (not just black)
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const pixels = imageData.data;
        let hasContent = false;
        
        // Sample pixels to see if there's actual content (not all black)
        for (let i = 0; i < pixels.length; i += 4) {
          const r = pixels[i];
          const g = pixels[i + 1]; 
          const b = pixels[i + 2];
          // If we find any non-black pixel, we have content
          if (r > 10 || g > 10 || b > 10) {
            hasContent = true;
            break;
          }
        }

        if (!hasContent) {
          console.warn(`⚠️ Canvas appears to be empty/black, video may not be ready`);
          // Don't fail, but log this for debugging
        }
        
        // Convert to base64 data URL with higher quality
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        
        console.log(`✅ Successfully generated thumbnail data URL (${dataUrl.length} chars)${hasContent ? ' with content' : ' - may be empty'}`);
        
        // Cache the result
        thumbnailCache.set(cacheKey, dataUrl);
        
        cleanup();
        resolve(dataUrl);
      } catch (error) {
        console.error(`❌ Canvas drawing failed:`, error);
        cleanup();
        reject(error);
      }
    };

    const trySeekAndCapture = () => {
      attemptCount++;
      console.log(`🔍 Seek attempt ${attemptCount}/${maxAttempts}`);
      
      if (video.duration && video.duration > 0) {
        // Try different time positions for better frame capture
        let seekTime;
        switch (attemptCount) {
          case 1:
            // First attempt: 25% into video
            seekTime = Math.min(video.duration * 0.25, 3);
            break;
          case 2:
            // Second attempt: 10% into video
            seekTime = Math.min(video.duration * 0.1, 1);
            break;
          case 3:
            // Third attempt: 50% into video
            seekTime = Math.min(video.duration * 0.5, 5);
            break;
          default:
            seekTime = 1;
        }
        
        console.log(`⏱️ Seeking to ${seekTime}s (attempt ${attemptCount})`);
        video.currentTime = seekTime;
      } else {
        // If duration is not available, try a fixed time
        console.log(`⏱️ Duration unknown, seeking to ${timeOffset}s`);
        video.currentTime = timeOffset;
      }
    };

    // Event handlers
    const onLoadedMetadata = () => {
      console.log(`📊 Video metadata loaded: ${video.videoWidth}x${video.videoHeight}, duration: ${video.duration}s`);
      trySeekAndCapture();
    };

    const onSeeked = () => {
      console.log(`✅ Seek completed to ${video.currentTime}s`);
      // Small delay to ensure frame is rendered
      setTimeout(resolveWithThumbnail, 100);
    };

    const onLoadedData = () => {
      console.log(`📝 Video data loaded at time ${video.currentTime}s`);
      if (video.currentTime > 0) {
        setTimeout(resolveWithThumbnail, 100);
      }
    };

    const onCanPlay = () => {
      console.log(`▶️ Video can play, current time: ${video.currentTime}s`);
      if (video.currentTime > 0) {
        setTimeout(resolveWithThumbnail, 100);
      }
    };

    const onError = (e: Event) => {
      console.error(`❌ Video error:`, e);
      console.error('Video error details:', video.error);
      
      if (attemptCount < maxAttempts) {
        console.log(`🔄 Retrying with different approach (attempt ${attemptCount + 1})`);
        setTimeout(() => {
          // Try different CORS settings on retry
          video.crossOrigin = attemptCount === 1 ? 'use-credentials' : null;
          video.src = videoUrl;
          video.load();
        }, 1000);
      } else {
        cleanup();
        reject(new Error(`Failed to load video after ${maxAttempts} attempts: ${video.error?.message || 'Unknown error'}`));
      }
    };

    // Add event listeners
    video.addEventListener('loadedmetadata', onLoadedMetadata);
    video.addEventListener('seeked', onSeeked);
    video.addEventListener('loadeddata', onLoadedData);
    video.addEventListener('canplay', onCanPlay);
    video.addEventListener('error', onError);

    // Timeout after 25 seconds (increased for slow networks)
    const timeout = setTimeout(() => {
      if (!hasResolved) {
        console.warn(`⏰ Video thumbnail generation timed out for ${videoUrl}`);
        cleanup();
        reject(new Error('Video thumbnail generation timed out'));
      }
    }, 25000);

    // Start loading the video
    console.log(`🚀 Loading video: ${videoUrl}`);
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