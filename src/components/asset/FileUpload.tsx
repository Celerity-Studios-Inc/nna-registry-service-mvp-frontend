import React, { useState, useCallback, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Divider,
  Button,
  IconButton,
  LinearProgress,
  Grid,
  Alert,
  Chip,
  Tooltip,
  Stack,
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  Delete as DeleteIcon,
  Replay as RetryIcon,
} from '@mui/icons-material';
import { FileUploadResponse } from '../../types/asset.types';
import assetService from '../../services/api/asset.service';
import FileUploader from '../common/FileUploader';
import FilePreview from '../common/FilePreview';

interface FileUploadProps {
  /**
   * Callback when files change (added, removed)
   */
  onFilesChange: (files: File[]) => void;

  /**
   * Accepted file types (MIME types)
   */
  acceptedFileTypes?: string;

  /**
   * Maximum number of files allowed
   * @default 5
   */
  maxFiles?: number;

  /**
   * Maximum file size in bytes
   * @default 100MB
   */
  maxSize?: number;

  /**
   * Layer code for layer-specific file type filtering
   */
  layerCode?: string;

  options?: any;

  /**
   * Files that are already selected
   */
  initialFiles?: File[];

  /**
   * Called when upload progress updates
   */
  onUploadProgress?: (fileId: string, progress: number) => void;

  /**
   * Called when a file upload completes
   */
  onUploadComplete?: (fileId: string, fileData: FileUploadResponse) => void;

  /**
   * Called when a file upload errors
   */
  onUploadError?: (fileId: string, error: string) => void;
}

// Get layer-specific accepted file types string
const getAcceptedFileTypesByLayer = (layerCode?: string): string => {
  switch (layerCode) {
    case 'G': // Songs
      return 'audio/mpeg,audio/wav,audio/ogg,audio/flac,audio/aac';
    case 'S': // Stars
      return 'image/jpeg,image/png,image/gif,image/svg+xml';
    case 'L': // Looks
      return 'image/jpeg,image/png,image/gif,image/svg+xml';
    case 'M': // Moves
      return 'video/mp4,video/webm,video/quicktime,application/json';
    case 'W': // Worlds
      return 'application/json,model/gltf-binary,model/gltf+json,application/octet-stream';
    case 'V': // Videos
      return 'video/mp4,video/webm,video/quicktime';
    case 'B': // Branded assets
      return 'image/jpeg,image/png,image/gif,image/svg+xml,video/mp4,video/webm';
    default:
      return 'image/*,audio/*,video/*,application/json,application/pdf';
  }
};

const FileUpload: React.FC<FileUploadProps> = ({
  onFilesChange,
  acceptedFileTypes,
  maxFiles = 1, // Only allow one file for regular assets, multiple for .set type assets
  maxSize = 104857600, // 100MB default
  layerCode,
  initialFiles = [],
  options,
  onUploadProgress,
  onUploadComplete,
  onUploadError,
}) => {
  // Adjust maxFiles based on asset type
  const effectiveMaxFiles =
    layerCode && (layerCode.includes('.set') || layerCode === 'T' || layerCode === 'P') ? 5 : 1;
  const [files, setFiles] = useState<File[]>(initialFiles);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<FileUploadResponse[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [uploadState, setUploadState] = useState<'idle' | 'uploading' | 'success' | 'error'>(
    'idle'
  );
  const [retryQueue, setRetryQueue] = useState<{ file: File; error: string }[]>([]);

  // Use layer-specific file types if none provided
  const accept = acceptedFileTypes || getAcceptedFileTypesByLayer(layerCode);

  // For layer-specific validation
  const validateFile = useCallback(
    (file: File) => {
      // Add any layer-specific validation logic here
      if (layerCode === 'G' && !file.type.startsWith('audio/')) {
        return `${file.name} is not an audio file. Songs layer only accepts audio files.`;
      }

      if (layerCode === 'S' && !file.type.startsWith('image/')) {
        return `${file.name} is not an image file. Stars layer only accepts image files.`;
      }

      return true;
    },
    [layerCode]
  );

  // Handle file selection
  const handleFileSelect = useCallback(
    (selectedFiles: File[]) => {
      setFiles(selectedFiles);
      onFilesChange(selectedFiles);

      // Auto-select the first file for preview if available
      if (selectedFiles.length > 0 && !selectedFile) {
        setSelectedFile(selectedFiles[0]);
      }
    },
    [onFilesChange, selectedFile]
  );

  // Handle file upload completion
  const handleUploadComplete = useCallback(
    (fileId: string, fileData: FileUploadResponse) => {
      setUploadedFiles(prev => [...prev, fileData]);
      setUploadState('success');

      if (onUploadComplete) {
        onUploadComplete(fileId, fileData);
      }
    },
    [onUploadComplete]
  );

  // Handle file upload error
  const handleUploadError = useCallback(
    (fileId: string, errorMessage: string) => {
      // Find the file that failed
      const failedFile = files.find(file => {
        // This is a rough check, in production you'd have a better way to match
        return errorMessage.includes(file.name);
      });

      if (failedFile) {
        setRetryQueue(prev => [...prev, { file: failedFile, error: errorMessage }]);
      }

      setUploadState('error');
      setError(`Upload failed: ${errorMessage}`);

      if (onUploadError) {
        onUploadError(fileId, errorMessage);
      }
    },
    [files, onUploadError]
  );

  // Adapter for FileUploader which expects a different signature
  const handleFileUploaderError = useCallback(
    (file: File, error: string) => {
      const fileId = file.name; // Use filename as a fallback ID
      handleUploadError(fileId, error);
    },
    [handleUploadError]
  );

  // Handle retry of failed uploads
  const handleRetry = (file: File) => {
    // Remove from retry queue
    setRetryQueue(prev => prev.filter(item => item.file !== file));

    // Add back to files list if not already there
    if (!files.includes(file)) {
      const newFiles = [...files, file];
      setFiles(newFiles);
      onFilesChange(newFiles);
    }

    setError(null);
    setUploadState('idle');
  };

  // Handle removal of a file from the retry queue
  const handleRemoveFromRetryQueue = (file: File) => {
    setRetryQueue(prev => prev.filter(item => item.file !== file));

    // If retry queue is now empty, clear the error
    if (retryQueue.length === 1) {
      setError(null);
      if (files.length > 0) {
        setUploadState('idle');
      }
    }
  };

  // Clear all files including those in retry queue
  const handleClearAll = () => {
    setFiles([]);
    setRetryQueue([]);
    setError(null);
    setUploadState('idle');
    setSelectedFile(null);
    setUploadedFiles([]);
    onFilesChange([]);
  };

  return (
    <Paper sx={{ p: 3, mb: 4 }}>
      <Typography variant="h6" gutterBottom>
        Upload Files
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        {layerCode && layerCode !== 'P' && layerCode !== 'T' && !layerCode.includes('.set')
          ? 'Upload a single file for your asset. Only one file is allowed per individual asset.'
          : `Upload one or more files for your asset. ${
              effectiveMaxFiles > 1
                ? `You can upload up to ${effectiveMaxFiles} files for set type assets.`
                : ''
            }`}
      </Typography>
      <Divider sx={{ mb: 3 }} />

      {error && (
        <Alert
          severity="error"
          sx={{ mb: 2 }}
          action={
            <Button color="inherit" size="small" onClick={() => setError(null)}>
              Dismiss
            </Button>
          }
        >
          {error}
        </Alert>
      )}

      {/* Retry queue */}
      {retryQueue.length > 0 && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" gutterBottom>
            Failed Uploads
          </Typography>
          <Stack spacing={1}>
            {retryQueue.map((item, index) => (
              <Alert
                key={`retry-${index}`}
                severity="warning"
                action={
                  <Box>
                    <IconButton size="small" onClick={() => handleRetry(item.file)} color="inherit">
                      <RetryIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleRemoveFromRetryQueue(item.file)}
                      color="inherit"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                }
              >
                <Typography variant="body2">Failed to upload: {item.file.name}</Typography>
                <Typography variant="caption">{item.error}</Typography>
              </Alert>
            ))}
          </Stack>
        </Box>
      )}

      {/* File status summary */}
      {files.length > 0 && (
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box>
            <Chip
              label={`${files.length} file${files.length > 1 ? 's' : ''} selected`}
              color="primary"
              size="small"
              sx={{ mr: 1 }}
            />
            {uploadedFiles.length > 0 && (
              <Chip
                label={`${uploadedFiles.length} uploaded`}
                color="success"
                size="small"
                sx={{ mr: 1 }}
              />
            )}
            {retryQueue.length > 0 && (
              <Chip label={`${retryQueue.length} failed`} color="error" size="small" />
            )}
          </Box>
          <Button
            variant="outlined"
            size="small"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={handleClearAll}
          >
            Clear All
          </Button>
        </Box>
      )}

      {/* Main uploader */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <FileUploader
            accept={accept}
            maxSize={maxSize}
            options={options}
            maxFiles={effectiveMaxFiles}
            initialFiles={initialFiles}
            onFilesUploaded={responses => {
              setUploadedFiles(prev => [...prev, ...responses]);
              if (onUploadComplete) {
                responses.forEach(response => {
                  onUploadComplete(response.id, response);
                });
              }
            }}
            onFilesAdded={handleFileSelect}
            onFileRemoved={file => {
              setFiles(prev => prev.filter(f => f !== file));
              if (selectedFile === file) {
                setSelectedFile(files.length > 1 ? files[0] : null);
              }
              onFilesChange(files.filter(f => f !== file));
            }}
            onAllUploadsComplete={responses => {
              setUploadState('success');
            }}
            onUploadProgress={onUploadProgress}
            onUploadComplete={handleUploadComplete}
            onUploadError={handleFileUploaderError}
            validateFile={validateFile}
            uploadImmediately={true}
            showPreviews={false}
            uploadLabel={`Drag and drop files for ${
              layerCode ? `${layerCode} layer` : 'your asset'
            }, or click to select`}
          />
        </Grid>

        <Grid item xs={12} md={4}>
          {/* Selected file preview */}
          <Paper
            sx={{
              p: 2,
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: 'background.default',
            }}
          >
            {selectedFile ? (
              <FilePreview
                file={selectedFile}
                height="250px"
                showInfo={true}
                allowDelete={false}
                allowDownload={false}
              />
            ) : (
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '100%',
                  width: '100%',
                  color: 'text.secondary',
                }}
              >
                <UploadIcon sx={{ fontSize: 64, mb: 2, opacity: 0.5 }} />
                <Typography variant="body2" align="center">
                  {files.length > 0 ? 'Select a file to preview' : 'No files uploaded yet'}
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* File preview list */}
      {files.length > 0 && (
        <Box sx={{ mt: 3 }}>
          <Typography variant="subtitle2" gutterBottom>
            Selected Files
          </Typography>
          <Grid container spacing={2}>
            {files.map(file => (
              <Grid item xs={6} sm={4} md={3} key={`preview-${file.name}`}>
                <Paper
                  sx={{
                    p: 1,
                    cursor: 'pointer',
                    borderColor: selectedFile === file ? 'primary.main' : 'transparent',
                    borderWidth: selectedFile === file ? 2 : 0,
                    borderStyle: 'solid',
                  }}
                  onClick={() => setSelectedFile(file)}
                >
                  <FilePreview
                    file={file}
                    height="120px"
                    showInfo={true}
                    showControls={false}
                    allowDelete={true}
                    onDelete={() => {
                      setFiles(prev => prev.filter(f => f !== file));
                      if (selectedFile === file) {
                        setSelectedFile(files.length > 1 ? files.filter(f => f !== file)[0] : null);
                      }
                      onFilesChange(files.filter(f => f !== file));
                    }}
                  />
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}
    </Paper>
  );
};

export default FileUpload;
