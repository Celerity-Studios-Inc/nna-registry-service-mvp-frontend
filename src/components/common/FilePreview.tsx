import React from 'react';
import {
  Box,
  Typography,
  Paper,
  IconButton,
  Tooltip,
  Stack,
  Link,
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Download as DownloadIcon,
  InsertDriveFile as FileIcon,
  Image as ImageIcon,
  AudioFile as AudioIcon,
  VideoFile as VideoIcon,
  PictureAsPdf as PdfIcon,
  Description as TextIcon,
  Code as CodeIcon,
} from '@mui/icons-material';

interface FilePreviewProps {
  // Accept File object, URL string, or object with url property (for API responses)
  file: File | string | { url: string; name?: string; size?: number; type?: string; [key: string]: any };
  height?: string;
  showInfo?: boolean;
  showControls?: boolean;
  allowDelete?: boolean;
  allowDownload?: boolean;
  onDelete?: () => void;
}

// Format bytes to human-readable size
const formatFileSize = (bytes: number, decimals = 2) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

// Get icon based on file type
const getFileIcon = (type: string | undefined) => {
  if (!type) {
    return <FileIcon fontSize="large" />;
  }

  if (type.startsWith('image/')) {
    return <ImageIcon fontSize="large" color="primary" />;
  } else if (type.startsWith('audio/')) {
    return <AudioIcon fontSize="large" color="secondary" />;
  } else if (type.startsWith('video/')) {
    return <VideoIcon fontSize="large" color="success" />;
  } else if (type === 'application/pdf') {
    return <PdfIcon fontSize="large" color="error" />;
  } else if (type.startsWith('text/')) {
    return <TextIcon fontSize="large" color="info" />;
  } else if (type.includes('json') || type.includes('javascript') || type.includes('xml')) {
    return <CodeIcon fontSize="large" color="warning" />;
  }
  return <FileIcon fontSize="large" />;
};

// Enhanced isPreviewable function with better error handling and type detection
const isPreviewable = (file: File | string | { url: string; type?: string; [key: string]: any }) => {
  // Add extra debug logging to trace issues
  console.log('Checking if file is previewable:', typeof file, file);
  
  // Handle null or undefined file
  if (!file) {
    console.warn("Received null or undefined file in isPreviewable");
    return false;
  }

  try {
    // Handle string URLs - assume they are previewable if they have common media extensions
    if (typeof file === 'string') {
      // More forgiving validation for string URLs
      if (!file.includes('.') && !file.startsWith('data:') && !file.includes('blob:')) {
        console.warn("String URL lacks recognized pattern:", file);
        // Try to be more permissive - if it starts with http/https, it might be an image
        if (file.startsWith('http')) {
          console.log("URL starts with http, attempting to treat as image");
          return true; // Try to render it anyway
        }
        return false;
      }

      const url = file.toLowerCase();
      return url.endsWith('.jpg') || url.endsWith('.jpeg') || url.endsWith('.png') ||
             url.endsWith('.gif') || url.endsWith('.webp') || url.endsWith('.mp4') ||
             url.endsWith('.webm') || url.endsWith('.mp3') || url.endsWith('.wav') ||
             url.endsWith('.ogg') || url.endsWith('.pdf') ||
             url.startsWith('data:image/') || url.startsWith('data:video/') ||
             url.startsWith('data:audio/') || url.includes('gcpStorageUrl') ||
             url.startsWith('blob:') || // Handle blob URLs
             url.includes('storage.googleapis.com'); // Handle GCP storage URLs
    }

    // Handle object with url property
    if (typeof file === 'object' && file !== null && 'url' in file) {
      // First check content type/MIME type (most reliable)
      // Check multiple possible properties for content type
      const contentType = file.type || file.contentType || file.mimeType;
      
      if (contentType) {
        console.log(`Found content type: ${contentType}`);
        return contentType.startsWith('image/') ||
               contentType === 'application/pdf' ||
               contentType.startsWith('video/') ||
               contentType.startsWith('audio/');
      }

      // Missing URL check (server response might have null URL)
      if (!file.url) {
        console.warn("Object with url property has null or undefined url:", file);
        
        // If we have a file/filename property, try to get a type from that
        const fileName = file.fileName || file.filename || file.name;
        if (fileName && typeof fileName === 'string') {
          console.log(`No URL but found filename: ${fileName}`);
          const ext = fileName.split('.').pop()?.toLowerCase();
          if (ext) {
            return ['jpg','jpeg','png','gif','webp','mp4','webm','mp3','wav','ogg','pdf'].includes(ext);
          }
        }
        
        return false;
      }

      // Check multiple URL properties
      const urlToCheck = (file.url || file.fileUrl || file.downloadUrl || file.thumbnailUrl).toLowerCase();
      
      // Advanced URL recognition
      return urlToCheck.endsWith('.jpg') || urlToCheck.endsWith('.jpeg') || urlToCheck.endsWith('.png') ||
             urlToCheck.endsWith('.gif') || urlToCheck.endsWith('.webp') || urlToCheck.endsWith('.mp4') ||
             urlToCheck.endsWith('.webm') || urlToCheck.endsWith('.mp3') || urlToCheck.endsWith('.wav') ||
             urlToCheck.endsWith('.ogg') || urlToCheck.endsWith('.pdf') ||
             urlToCheck.startsWith('data:image/') || urlToCheck.startsWith('data:video/') ||
             urlToCheck.startsWith('data:audio/') || urlToCheck.includes('gcpStorageUrl') ||
             urlToCheck.startsWith('blob:') || // Handle blob URLs 
             urlToCheck.includes('storage.googleapis.com') || // Handle GCP storage URLs
             urlToCheck.includes('/api/files/') || // Handle API file routes
             urlToCheck.includes('/uploads/'); // Handle upload directories
    }

    // Handle File object
    if (file instanceof File) {
      // For files, check by MIME type and filename as fallback
      if (file.type) {
        return file.type.startsWith('image/') ||
               file.type === 'application/pdf' ||
               file.type.startsWith('video/') ||
               file.type.startsWith('audio/');
      }
      
      // Fallback to checking file extension
      const fileName = file.name.toLowerCase();
      const ext = fileName.split('.').pop();
      if (ext) {
        return ['jpg','jpeg','png','gif','webp','mp4','webm','mp3','wav','ogg','pdf'].includes(ext);
      }
    }

    console.warn("Unhandled file type in isPreviewable:", typeof file, file);
    return false;
  } catch (error) {
    console.error("Error in isPreviewable:", error);
    return false;
  }
};

const FilePreview: React.FC<FilePreviewProps> = ({
  file,
  height = '200px',
  showInfo = true,
  showControls = true,
  allowDelete = false,
  allowDownload = false,
  onDelete,
}) => {
  // Create object URL for preview with enhanced reliability
  const [objectUrl, setObjectUrl] = React.useState<string>('');
  const [fallbackMode, setFallbackMode] = React.useState<boolean>(false);

  React.useEffect(() => {
    // Generate preview URL with improved error handling
    if (!file) {
      console.warn("File is null or undefined in useEffect");
      setObjectUrl('');
      setFallbackMode(false);
      return;
    }

    try {
      // Reset state
      setFallbackMode(false);
      
      // Check if file is already a string URL (happens when editing an existing asset)
      if (typeof file === 'string') {
        console.log("Setting object URL from string:", file);
        setObjectUrl(file);
        // No cleanup needed for string URLs
        return;
      }

      // Special case for MongoDB's format in DB responses (gcpStorageUrl is common)
      if (typeof file === 'object' && file !== null && 'gcpStorageUrl' in file) {
        const url = file.gcpStorageUrl;
        if (url) {
          console.log("Setting object URL from gcpStorageUrl:", url);
          setObjectUrl(url);
          return;
        }
      }

      // Check if file already has a URL property (for uploaded files)
      if (typeof file === 'object' && file !== null && 'url' in file && file.url) {
        console.log("Setting object URL from file.url:", file.url);
        setObjectUrl(file.url);
        return;
      }

      // Try thumbnailUrl if available
      if (typeof file === 'object' && file !== null && 'thumbnailUrl' in file && file.thumbnailUrl) {
        console.log("Setting object URL from thumbnailUrl:", file.thumbnailUrl);
        setObjectUrl(file.thumbnailUrl);
        return;
      }
      
      // Check for file.file property (common in some API responses)
      if (typeof file === 'object' && file !== null && 'file' in file) {
        const fileObj = file.file;
        if (typeof fileObj === 'object' && fileObj !== null && 'url' in fileObj) {
          console.log("Setting object URL from file.file.url:", fileObj.url);
          setObjectUrl(fileObj.url);
          return;
        }
      }

      // Regular File object - create a blob URL
      if (file instanceof Blob) {
        const url = URL.createObjectURL(file);
        console.log("Created blob URL for File object:", url);
        setObjectUrl(url);

        // Cleanup function to revoke object URL
        return () => {
          URL.revokeObjectURL(url);
        };
      }

      // Enhanced fallback strategy - check multiple common property names
      if (typeof file === 'object' && file !== null) {
        // Check for common URL property names (expanded list)
        const urlProps = [
          'imageUrl', 'fileUrl', 'src', 'source', 'link', 'href', 'path', 
          'location', 'downloadUrl', 'previewUrl', 'cdnUrl', 'publicUrl', 
          'assetUrl', 'uri', 'media', 'thumbnail'
        ];
        
        for (const prop of urlProps) {
          if (prop in file && typeof file[prop] === 'string' && file[prop]) {
            console.log(`Setting object URL from ${prop}:`, file[prop]);
            setObjectUrl(file[prop]);
            return;
          }
        }
        
        // If we have a filename, try to use it to create a data URI 
        // or search for matching elements in the DOM
        const fileName = file.fileName || file.filename || file.name;
        if (fileName && typeof fileName === 'string') {
          console.log(`No direct URL found, but found filename: ${fileName}`);
          
          // Try to see if we have a matching <img> with this alt text in the document
          const images = document.querySelectorAll('img');
          for (let i = 0; i < images.length; i++) {
            const img = images[i];
            if (img.alt === fileName && img.src) {
              console.log(`Found image with matching alt text, using its src:`, img.src);
              setObjectUrl(img.src);
              setFallbackMode(true);
              return;
            }
          }
        }
      }

      console.warn("Could not extract a valid URL from the provided file object:", file);
      
      // Create a placeholder data URL for fallback display
      if (typeof file === 'object' && file.type && file.type.startsWith('image/')) {
        console.log("Creating placeholder for image type");
        setObjectUrl('data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22100%22%20height%3D%22100%22%3E%3Crect%20fill%3D%22%23ddd%22%20width%3D%22100%22%20height%3D%22100%22%2F%3E%3Ctext%20fill%3D%22%23666%22%20x%3D%2250%22%20y%3D%2250%22%20text-anchor%3D%22middle%22%20dominant-baseline%3D%22middle%22%3EImage%3C%2Ftext%3E%3C%2Fsvg%3E');
        setFallbackMode(true);
        return;
      }
      
      // If we get here, we couldn't extract a valid URL - set a blank URL
      setObjectUrl('');
    } catch (error) {
      console.error("Error setting object URL:", error);
      setObjectUrl('');
      setFallbackMode(true);
    }
  }, [file]);

  // Enhanced image preview with error handling and fallbacks
  const renderImagePreview = () => {
    return (
      <div style={{ position: 'relative', width: '100%', height: '100%' }}>
        <img
          src={objectUrl}
          alt={getFileName()}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            opacity: fallbackMode ? 0.7 : 1, // Indicate fallback mode visually
          }}
          onError={(e) => {
            console.error('Image failed to load:', objectUrl);
            
            // Set a fallback data URL for the broken image
            const imgElement = e.target as HTMLImageElement;
            imgElement.src = 'data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22100%22%20height%3D%22100%22%3E%3Crect%20fill%3D%22%23f8f9fa%22%20width%3D%22100%22%20height%3D%22100%22%2F%3E%3Ctext%20fill%3D%22%23888%22%20font-family%3D%22Arial%22%20font-size%3D%2212%22%20x%3D%2250%22%20y%3D%2250%22%20text-anchor%3D%22middle%22%3EImage%20unavailable%3C%2Ftext%3E%3C%2Fsvg%3E';
            
            // Set the alt text for accessibility
            imgElement.alt = 'Image preview unavailable';
            
            // Add a class to indicate the error state
            imgElement.classList.add('preview-error');
          }}
        />
        {fallbackMode && (
          <div style={{
            position: 'absolute',
            bottom: '10px',
            left: '10px',
            right: '10px',
            background: 'rgba(0,0,0,0.5)',
            color: 'white',
            fontSize: '12px',
            padding: '4px',
            borderRadius: '4px',
            textAlign: 'center'
          }}>
            Preview may not be accurate
          </div>
        )}
      </div>
    );
  };

  // Audio preview
  const renderAudioPreview = () => {
    return (
      <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <audio controls style={{ width: '100%' }}>
          <source src={objectUrl} type={getFileType()} />
          Your browser does not support the audio element.
        </audio>
      </Box>
    );
  };

  // Video preview
  const renderVideoPreview = () => {
    return (
      <video
        controls
        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
      >
        <source src={objectUrl} type={getFileType()} />
        Your browser does not support the video element.
      </video>
    );
  };

  // PDF preview
  const renderPdfPreview = () => {
    return (
      <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
        <PdfIcon sx={{ fontSize: 64 }} color="error" />
        <Typography variant="caption">PDF Preview</Typography>
        <Link href={objectUrl} target="_blank" rel="noopener noreferrer">
          Open PDF
        </Link>
      </Box>
    );
  };

  // Generic file preview with icon
  const renderGenericPreview = () => {
    return (
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        justifyContent: 'center', 
        alignItems: 'center',
        height: '100%',
      }}>
        {getFileIcon(getFileType())}
        <Typography variant="caption" sx={{ mt: 1 }}>
          {getFileType() || 'Unknown file type'}
        </Typography>
      </Box>
    );
  };

  // Get file type based on different file formats
  const getFileType = () => {
    if (!file) return '';

    // Handle File object
    if (file instanceof File) {
      return file.type;
    }

    // Handle object with type property
    if (typeof file === 'object' && 'type' in file) {
      return file.type;
    }

    // Handle string URL by checking extension
    if (typeof file === 'string') {
      const url = file.toLowerCase();
      if (url.endsWith('.jpg') || url.endsWith('.jpeg') || url.endsWith('.png') || url.endsWith('.gif') || url.endsWith('.webp')) {
        return 'image/jpeg'; // Generic image type
      } else if (url.endsWith('.mp4') || url.endsWith('.webm')) {
        return 'video/mp4'; // Generic video type
      } else if (url.endsWith('.mp3') || url.endsWith('.wav') || url.endsWith('.ogg')) {
        return 'audio/mpeg'; // Generic audio type
      } else if (url.endsWith('.pdf')) {
        return 'application/pdf';
      }
    }

    // Handle object with url property
    if (typeof file === 'object' && 'url' in file) {
      const url = file.url.toLowerCase();
      if (url.endsWith('.jpg') || url.endsWith('.jpeg') || url.endsWith('.png') || url.endsWith('.gif') || url.endsWith('.webp')) {
        return 'image/jpeg'; // Generic image type
      } else if (url.endsWith('.mp4') || url.endsWith('.webm')) {
        return 'video/mp4'; // Generic video type
      } else if (url.endsWith('.mp3') || url.endsWith('.wav') || url.endsWith('.ogg')) {
        return 'audio/mpeg'; // Generic audio type
      } else if (url.endsWith('.pdf')) {
        return 'application/pdf';
      }
    }

    return '';
  };

  // Get file name for display from different file types
  const getFileName = () => {
    if (!file) return 'Unknown file';

    // Handle File object
    if (file instanceof File) {
      return file.name;
    }

    // Handle object with name property
    if (typeof file === 'object' && 'name' in file) {
      return file.name;
    }

    // Handle object with filename property
    if (typeof file === 'object' && 'filename' in file) {
      return file.filename;
    }

    // Handle object with url property as fallback
    if (typeof file === 'object' && 'url' in file) {
      // Extract filename from URL
      const url = file.url;
      const parts = url.split('/');
      return parts[parts.length - 1];
    }

    // Handle string URL
    if (typeof file === 'string') {
      // Extract filename from URL
      const parts = file.split('/');
      return parts[parts.length - 1];
    }

    return 'Unknown file';
  };

  // Get file size for display from different file types
  const getFileSize = (): number => {
    if (!file) return 0;

    // Handle File object
    if (file instanceof File) {
      return file.size;
    }

    // Handle object with size property
    if (typeof file === 'object' && 'size' in file) {
      return typeof file.size === 'number' ? file.size : 0;
    }

    return 0;
  };

  // Render appropriate preview based on file type
  const renderPreview = () => {
    if (!file) {
      console.warn("Attempting to render preview for null or undefined file");
      return renderGenericPreview();
    }

    try {
      const fileType = getFileType();
      console.log(`Rendering preview for file type: ${fileType}`);

      if (!fileType) {
        return renderGenericPreview();
      }

      // Detect GCP Storage URLs which should use image preview
      if (typeof file === 'object' && file !== null && 'url' in file &&
          typeof file.url === 'string' && file.url.includes('gcpStorageUrl')) {
        console.log("Detected GCP Storage URL, using image preview");
        return renderImagePreview();
      }

      // Normal file type detection
      if (fileType.startsWith('image/')) {
        return renderImagePreview();
      } else if (fileType.startsWith('audio/')) {
        return renderAudioPreview();
      } else if (fileType.startsWith('video/')) {
        return renderVideoPreview();
      } else if (fileType === 'application/pdf') {
        return renderPdfPreview();
      } else {
        return renderGenericPreview();
      }
    } catch (err) {
      console.error("Error rendering file preview:", err);
      return renderGenericPreview();
    }
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Paper
        elevation={1}
        sx={{
          height,
          overflow: 'hidden',
          position: 'relative',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: 'background.default',
        }}
      >
        {renderPreview()}

        {/* Control buttons (delete, download) */}
        {showControls && (
          <Box
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              display: 'flex',
            }}
          >
            {allowDelete && onDelete && (
              <Tooltip title="Delete">
                <IconButton
                  size="small"
                  onClick={onDelete}
                  sx={{ bgcolor: 'rgba(255,255,255,0.7)' }}
                  color="error"
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
            {allowDownload && objectUrl && (
              <Tooltip title="Download">
                <IconButton
                  size="small"
                  component="a"
                  href={objectUrl}
                  download={getFileName()}
                  sx={{ bgcolor: 'rgba(255,255,255,0.7)', ml: 1 }}
                  color="primary"
                >
                  <DownloadIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        )}
      </Paper>
      
      {/* File info */}
      {showInfo && (
        <Box sx={{ mt: 1 }}>
          <Typography variant="body2" noWrap title={getFileName()}>
            {getFileName()}
          </Typography>
          <Stack direction="row" spacing={1} alignItems="center">
            {getFileSize() > 0 && (
              <>
                <Typography variant="caption" color="text.secondary">
                  {formatFileSize(getFileSize())}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  •
                </Typography>
              </>
            )}
            <Typography variant="caption" color="text.secondary">
              {getFileType() || 'Unknown type'}
            </Typography>
          </Stack>
        </Box>
      )}
    </Box>
  );
};

export default FilePreview;