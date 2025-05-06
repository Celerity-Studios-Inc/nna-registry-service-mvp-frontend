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
  file: File;
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
const getFileIcon = (type: string) => {
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
const isPreviewable = (file: File) => {
  return file.type.startsWith('image/') || 
         file.type === 'application/pdf' || 
         file.type.startsWith('video/') || 
         file.type.startsWith('audio/');
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
      const url = URL.createObjectURL(file);
      setObjectUrl(url);

      // Cleanup function to revoke object URL
      return () => {
        URL.revokeObjectURL(url);
      };
    }
  }, [file]);

  // Image preview
  const renderImagePreview = () => {
    return (
      <img
        src={objectUrl}
        alt={file.name}
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
          <source src={objectUrl} type={file.type} />
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
        <source src={objectUrl} type={file.type} />
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
        {getFileIcon(file.type)}
        <Typography variant="caption" sx={{ mt: 1 }}>
          {file.type || 'Unknown file type'}
        </Typography>
      </Box>
    );
  };

  // Render appropriate preview based on file type
  const renderPreview = () => {
    if (!file) return null;

    if (file.type.startsWith('image/')) {
      return renderImagePreview();
    } else if (file.type.startsWith('audio/')) {
      return renderAudioPreview();
    } else if (file.type.startsWith('video/')) {
      return renderVideoPreview();
    } else if (file.type === 'application/pdf') {
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
          <Typography variant="body2" noWrap title={file.name}>
            {file.name}
          </Typography>
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography variant="caption" color="text.secondary">
              {formatFileSize(file.size)}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              •
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {file.type || 'Unknown type'}
            </Typography>
          </Stack>
        </Box>
      )}
    </Box>
  );
};

export default FilePreview;