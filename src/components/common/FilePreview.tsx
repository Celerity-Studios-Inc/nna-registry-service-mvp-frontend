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

// Determine if file is previewable in browser
const isPreviewable = (file: File | string | { url: string; type?: string; [key: string]: any }) => {
  // Handle string URLs - assume they are previewable if they have common media extensions
  if (typeof file === 'string') {
    const url = file.toLowerCase();
    return url.endsWith('.jpg') || url.endsWith('.jpeg') || url.endsWith('.png') ||
           url.endsWith('.gif') || url.endsWith('.webp') || url.endsWith('.mp4') ||
           url.endsWith('.webm') || url.endsWith('.mp3') || url.endsWith('.wav') ||
           url.endsWith('.ogg') || url.endsWith('.pdf');
  }

  // Handle object with url property
  if (typeof file === 'object' && 'url' in file) {
    // If it has a type property, use that
    if (file.type) {
      return file.type.startsWith('image/') ||
             file.type === 'application/pdf' ||
             file.type.startsWith('video/') ||
             file.type.startsWith('audio/');
    }

    // Otherwise check URL extension
    const url = file.url.toLowerCase();
    return url.endsWith('.jpg') || url.endsWith('.jpeg') || url.endsWith('.png') ||
           url.endsWith('.gif') || url.endsWith('.webp') || url.endsWith('.mp4') ||
           url.endsWith('.webm') || url.endsWith('.mp3') || url.endsWith('.wav') ||
           url.endsWith('.ogg') || url.endsWith('.pdf');
  }

  // Handle File object
  if (file instanceof File) {
    return file.type.startsWith('image/') ||
           file.type === 'application/pdf' ||
           file.type.startsWith('video/') ||
           file.type.startsWith('audio/');
  }

  return false;
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
  // Create object URL for preview
  const [objectUrl, setObjectUrl] = React.useState<string>('');

  React.useEffect(() => {
    // Generate preview URL
    if (file && isPreviewable(file)) {
      // Check if file is already a string URL (happens when editing an existing asset)
      if (typeof file === 'string') {
        setObjectUrl(file);
        // No cleanup needed for string URLs
        return;
      }

      // Check if file already has a URL property (for uploaded files)
      if ((file as any).url) {
        setObjectUrl((file as any).url);
        return;
      }

      // Regular File object - create a blob URL
      if (file instanceof Blob) {
        const url = URL.createObjectURL(file);
        setObjectUrl(url);

        // Cleanup function to revoke object URL
        return () => {
          URL.revokeObjectURL(url);
        };
      } else {
        console.warn("Unable to create object URL for non-Blob object", file);
      }
    }
  }, [file]);

  // Image preview
  const renderImagePreview = () => {
    return (
      <img
        src={objectUrl}
        alt={getFileName()}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'contain',
        }}
      />
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
  const getFileSize = () => {
    if (!file) return 0;

    // Handle File object
    if (file instanceof File) {
      return file.size;
    }

    // Handle object with size property
    if (typeof file === 'object' && 'size' in file) {
      return file.size;
    }

    return 0;
  };

  // Render appropriate preview based on file type
  const renderPreview = () => {
    if (!file) return null;

    const fileType = getFileType();

    if (!fileType) {
      return renderGenericPreview();
    }

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
                  download={file.name}
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