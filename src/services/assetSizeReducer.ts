/**
 * Asset Size Reducer Service
 * Utility to help reduce file sizes for asset uploads
 */

/**
 * Compresses an image file to a maximum size
 * @param file The image file to compress
 * @param maxSizeKB Maximum size in kilobytes
 * @param quality Compression quality (0-1)
 * @returns Promise resolving to a new File with reduced size
 */
export const compressImageFile = async (
  file: File,
  maxSizeKB: number = 1024,
  quality: number = 0.7
): Promise<File> => {
  // Only process image files
  if (!file.type.startsWith('image/')) {
    console.log('Not an image file, returning original');
    return file;
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = event => {
      const img = new Image();
      img.src = event.target?.result as string;

      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Calculate maximum dimensions while maintaining aspect ratio
        const maxDimension = 1200; // Maximum width or height
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round(height * (maxDimension / width));
            width = maxDimension;
          } else {
            width = Math.round(width * (maxDimension / height));
            height = maxDimension;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);

        // Convert to blob with specified quality
        canvas.toBlob(
          blob => {
            if (!blob) {
              console.error('Failed to create blob from canvas');
              resolve(file); // Return original file on error
              return;
            }

            // Check if we achieved target size
            if (blob.size > maxSizeKB * 1024) {
              console.log(
                `Compressed to ${Math.round(
                  blob.size / 1024
                )}KB, still over limit`
              );
              // Retry with lower quality if still too large
              if (quality > 0.3) {
                compressImageFile(file, maxSizeKB, quality - 0.1)
                  .then(resolve)
                  .catch(reject);
                return;
              }
            }

            // Create a new File from the blob
            const newFile = new File([blob], file.name, {
              type: file.type,
              lastModified: file.lastModified,
            });

            console.log(
              `Compressed image from ${Math.round(
                file.size / 1024
              )}KB to ${Math.round(newFile.size / 1024)}KB`
            );
            resolve(newFile);
          },
          file.type,
          quality
        );
      };

      img.onerror = () => {
        console.error('Error loading image for compression');
        resolve(file); // Return original file on error
      };
    };

    reader.onerror = () => {
      console.error('Error reading file for compression');
      resolve(file); // Return original file on error
    };
  });
};

/**
 * Processes a file before upload to ensure it fits size limits
 * @param file The file to process
 * @param maxSizeMB Maximum size in megabytes
 * @returns Promise resolving to processed file
 */
export const processFileForUpload = async (
  file: File,
  maxSizeMB: number = 4
): Promise<File> => {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;

  // Check if file already fits size requirements
  if (file.size <= maxSizeBytes) {
    console.log(
      `File ${file.name} already under size limit, skipping processing`
    );
    return file;
  }

  console.log(
    `File ${file.name} is ${Math.round(
      file.size / (1024 * 1024)
    )}MB, processing to reduce size`
  );

  // Process different file types
  if (file.type.startsWith('image/')) {
    return compressImageFile(file, maxSizeBytes / 1024);
  }

  // For other file types, we can't compress them automatically
  console.warn(`Can't automatically compress file of type ${file.type}`);
  return file;
};

export default {
  compressImageFile,
  processFileForUpload,
};
