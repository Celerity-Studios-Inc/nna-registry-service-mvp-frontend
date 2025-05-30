import React, { useState, useCallback, useMemo } from 'react';
import { debugLog, logger, LogLevel } from '../../utils/logger';
import {
  Box,
  Typography,
  Paper,
  Divider,
  Button,
  IconButton,
  Grid,
  Alert,
  Chip,
  Stack,
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  Delete as DeleteIcon,
  Replay as RetryIcon,
} from '@mui/icons-material';
import { FileUploadResponse } from '../../types/asset.types';
import FileUploader from '../common/FileUploader';
import FilePreview from '../common/FilePreview';

interface FileUploadProps {
  /**
   * Callback when files change (added, removed)
   */
  onFilesChange: (files: File[]) => void;

  /**
   * Callback when source changes
   */
  onSourceChange?: (source: string) => void;

  /**
   * Initial source value
   */
  initialSource?: string;

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

// Source options have been moved to asset.types.ts

// Get layer-specific accepted file types string - memoized to prevent recreation
const getAcceptedFileTypesByLayer = (layerCode?: string): string => {
  // This lookup table could be moved to a constant to avoid recreation, but keeping it here for clarity
  const fileTypesMap: Record<string, string> = {
    'G': 'audio/mpeg,audio/wav,audio/ogg,audio/flac,audio/aac', // Songs
    'S': 'image/jpeg,image/png,image/gif,image/svg+xml', // Stars
    'L': 'image/jpeg,image/png,image/gif,image/svg+xml', // Looks
    'M': 'video/mp4,video/webm,video/quicktime,application/json', // Moves
    'W': 'image/jpeg,image/png,image/gif,image/svg+xml,video/mp4,video/webm,video/quicktime,application/json,model/gltf-binary,model/gltf+json,application/octet-stream', // Worlds
    'V': 'video/mp4,video/webm,video/quicktime', // Videos
    'B': 'image/jpeg,image/png,image/gif,image/svg+xml,video/mp4,video/webm', // Branded assets
    // Composite layers - Video (primary), Audio, Images only
    'C': 'video/mp4,video/webm,video/quicktime,audio/mpeg,audio/wav,audio/ogg,audio/flac,audio/aac,image/jpeg,image/png,image/gif,image/svg+xml', // Composites
    'P': 'video/mp4,video/webm,video/quicktime,audio/mpeg,audio/wav,audio/ogg,audio/flac,audio/aac,image/jpeg,image/png,image/gif,image/svg+xml', // Personalize
    'T': 'video/mp4,video/webm,video/quicktime,audio/mpeg,audio/wav,audio/ogg,audio/flac,audio/aac,image/jpeg,image/png,image/gif,image/svg+xml', // Training Data
    'R': 'video/mp4,video/webm,video/quicktime,audio/mpeg,audio/wav,audio/ogg,audio/flac,audio/aac,image/jpeg,image/png,image/gif,image/svg+xml', // Rights
  };
  
  // Use lookup table instead of switch for better performance
  return fileTypesMap[layerCode || ''] || 'image/*,audio/*,video/*'; // Removed JSON and PDF from default
};

// Format file size to human-readable format - memoization would be overkill for this simple function
const formatFileSize = (bytes: number, decimals = 2) => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

// Format file types for better display - kept as a pure function as it's rarely called
const formatFileTypes = (accept: string): string => {
  const types = accept.split(',').map(t => t.trim());

  // Group by major type
  const imageTypes = types
    .filter(t => t.startsWith('image/'))
    .map(t => t.replace('image/', ''));
  const audioTypes = types
    .filter(t => t.startsWith('audio/'))
    .map(t => t.replace('audio/', ''));
  const videoTypes = types
    .filter(t => t.startsWith('video/'))
    .map(t => t.replace('video/', ''));
  const modelTypes = types
    .filter(t => t.includes('model/'))
    .map(t => t.replace('model/', ''));
  const otherTypes = types.filter(
    t =>
      !t.startsWith('image/') &&
      !t.startsWith('audio/') &&
      !t.startsWith('video/') &&
      !t.includes('model/')
  );

  const parts = [];
  if (imageTypes.length > 0) parts.push(`Images (${imageTypes.join(', ')})`);
  if (audioTypes.length > 0) parts.push(`Audio (${audioTypes.join(', ')})`);
  if (videoTypes.length > 0) parts.push(`Video (${videoTypes.join(', ')})`);
  if (modelTypes.length > 0) parts.push(`Models (${modelTypes.join(', ')})`);
  if (otherTypes.length > 0) parts.push(`Other (${otherTypes.join(', ')})`);

  return parts.join('; ');
};

const FileUpload: React.FC<FileUploadProps> = ({
  onFilesChange,
  onSourceChange,
  initialSource = 'ReViz', // Default to ReViz as shown in Swagger docs
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
  // Adjust maxFiles based on asset type - memoized to prevent recalculation
  const effectiveMaxFiles = useMemo(() => {
    debugLog(`[FileUpload] Calculating effective max files for layer ${layerCode}`);
    return layerCode &&
      (layerCode.includes('.set') || layerCode === 'T' || layerCode === 'P')
        ? 5
        : 1;
  }, [layerCode]);
  const [files, setFiles] = useState<File[]>(initialFiles);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<FileUploadResponse[]>([]);
  const [error, setError] = useState<string | null>(null);
  // Source state removed as it's no longer needed (moved to MetadataForm)
  const [retryQueue, setRetryQueue] = useState<{ file: File; error: string }[]>(
    []
  );

  // Use layer-specific file types if none provided - memoized to prevent recalculation
  const accept = useMemo(() => {
    debugLog(`[FileUpload] Determining accepted file types for layer ${layerCode}`);
    return acceptedFileTypes || getAcceptedFileTypesByLayer(layerCode);
  }, [acceptedFileTypes, layerCode]);

  // Handle source change - commented out as source UI moved to MetadataForm
  // Keeping this handler for future use if source gets moved back
  /*
  const handleSourceChange = (newSource: string) => {
    setSource(newSource);
    if (onSourceChange) {
      onSourceChange(newSource);
    }
  };
  */

  // For layer-specific validation
  const validateFile = useCallback(
    (file: File) => {
      // Check file size first
      if (file.size > maxSize) {
        return `${file.name} exceeds the maximum size of ${formatFileSize(
          maxSize
        )}. Please upload a smaller file.`;
      }

      // Add any layer-specific validation logic here
      if (layerCode === 'G' && !file.type.startsWith('audio/')) {
        return `${file.name} is not an audio file. Songs layer only accepts audio files.`;
      }

      if (layerCode === 'S' && !file.type.startsWith('image/')) {
        return `${file.name} is not an image file. Stars layer only accepts image files.`;
      }

      if (layerCode === 'L' && !file.type.startsWith('image/')) {
        return `${file.name} is not an image file. Looks layer only accepts image files.`;
      }

      if (
        layerCode === 'M' &&
        !file.type.startsWith('video/') &&
        file.type !== 'application/json'
      ) {
        return `${file.name} is not a valid file type. Moves layer only accepts video files or JSON.`;
      }

      if (layerCode === 'V' && !file.type.startsWith('video/')) {
        return `${file.name} is not a video file. Videos layer only accepts video files.`;
      }

      // W layer accepts multiple types: images, videos, models, JSON
      if (layerCode === 'W') {
        const acceptedTypes = [
          'image/jpeg', 'image/png', 'image/gif', 'image/svg+xml',
          'video/mp4', 'video/webm', 'video/quicktime',
          'application/json', 'model/gltf-binary', 'model/gltf+json', 'application/octet-stream'
        ];
        if (!acceptedTypes.includes(file.type)) {
          return `${file.name} is not a valid file type for Worlds layer. Accepted types: images, videos, 3D models, or JSON.`;
        }
      }

      return true;
    },
    [layerCode, maxSize]
  );

  // Handle file selection
  const handleFileSelect = useCallback(
    (selectedFiles: File[]) => {
      debugLog(`[FileUpload] Selected ${selectedFiles.length} files`);
      logger.ui(LogLevel.INFO, `User selected ${selectedFiles.length} files`);
      
      // Clear uploadedFiles if selectedFiles is empty
      if (selectedFiles.length === 0) {
        setUploadedFiles([]);
      }
      
      setFiles(selectedFiles);
      onFilesChange(selectedFiles);

      // Auto-select the first file for preview if available
      if (selectedFiles.length > 0 && !selectedFile) {
        setSelectedFile(selectedFiles[0]);
      } else if (selectedFiles.length === 0) {
        // Clear selected file if no files
        setSelectedFile(null);
      }
    },
    [onFilesChange, selectedFile]
  );

  // Handle file upload completion
  const handleUploadComplete = useCallback(
    (fileId: string, fileData: FileUploadResponse) => {
      debugLog(`[FileUpload] Upload complete for file ${fileId}`);
      logger.ui(LogLevel.INFO, `File upload complete: ${fileId}`);
      
      setUploadedFiles(prev => [...prev, fileData]);
      if (onUploadComplete) {
        onUploadComplete(fileId, fileData);
      }
    },
    [onUploadComplete]
  );

  // Handle file upload error
  const handleUploadError = useCallback(
    (fileId: string, errorMessage: string) => {
      debugLog(`[FileUpload] Upload error for file ${fileId}: ${errorMessage}`);
      logger.ui(LogLevel.ERROR, `File upload error: ${fileId}`, { error: errorMessage });
      // Find the file that failed
      const failedFile = files.find(file => {
        // This is a rough check, in production you'd have a better way to match
        return errorMessage.includes(file.name);
      });

      if (failedFile) {
        setRetryQueue(prev => [
          ...prev,
          { file: failedFile, error: errorMessage },
        ]);
      }

      setError(`Upload failed: ${errorMessage}`);

      if (onUploadError) {
        onUploadError(fileId, errorMessage);
      }
    },
    [files, onUploadError]
  );

  // Adapter for FileUploader which expects a different signature
  const handleFileUploaderError = useCallback(
    (fileId: string, error: string) => {
      handleUploadError(fileId, error);
    },
    [handleUploadError]
  );

  // Handle retry of failed uploads
  const handleRetry = useCallback((file: File) => {
    debugLog(`[FileUpload] Retrying upload for file ${file.name}`);
    logger.ui(LogLevel.INFO, `User retrying upload for ${file.name}`);
    // Remove from retry queue
    setRetryQueue(prev => prev.filter(item => item.file !== file));

    // Add back to files list if not already there
    if (!files.includes(file)) {
      const newFiles = [...files, file];
      setFiles(newFiles);
      onFilesChange(newFiles);
    }

    setError(null);
  }, [files, onFilesChange]);

  // Handle removal of a file from the retry queue
  const handleRemoveFromRetryQueue = useCallback((file: File) => {
    debugLog(`[FileUpload] Removing file ${file.name} from retry queue`);
    logger.ui(LogLevel.INFO, `User removed file from retry queue: ${file.name}`);
    setRetryQueue(prev => prev.filter(item => item.file !== file));

    // If retry queue is now empty, clear the error
    if (retryQueue.length === 1) {
      setError(null);
      if (files.length > 0) {
        setError(null);
      }
    }
  }, [retryQueue.length, files.length]);

  // Clear all files including those in retry queue
  const handleClearAll = useCallback(() => {
    debugLog(`[FileUpload] Clearing all files and retry queue`);
    logger.ui(LogLevel.INFO, `User cleared all files`);
    setFiles([]);
    setRetryQueue([]);
    setError(null);
    setSelectedFile(null);
    setUploadedFiles([]);
    onFilesChange([]);
    
    // This delay ensures the UI updates completely before any potential re-renders
    setTimeout(() => {
      debugLog('[FileUpload] Verifying cleared state');
      // Verify state is cleared
      if (files.length > 0) {
        debugLog('[FileUpload] State not properly cleared, forcing update');
        setFiles([]);
        onFilesChange([]);
      }
    }, 50);
  }, [onFilesChange, files.length]);

  // Memoize the layer name for consistent reference
  const layerDisplay = useMemo(() => {
    if (!layerCode) return '';
    
    // Map layer codes to full names
    const layerNames: Record<string, string> = {
      G: 'Songs',
      S: 'Stars',
      L: 'Looks',
      M: 'Moves',
      W: 'Worlds',
      V: 'Videos',
      B: 'Branded Assets',
      C: 'Composites',
      T: 'Training Data',
      P: 'Patterns',
    };
    
    return `${layerNames[layerCode] || `Layer ${layerCode}`} (${layerCode})`;
  }, [layerCode]);
  
  return (
    <Paper sx={{ p: 3, mb: 4 }}>
      <Typography variant="h6" gutterBottom>
        Upload Files
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        {layerCode &&
        layerCode !== 'P' &&
        layerCode !== 'T' &&
        !layerCode.includes('.set')
          ? 'Upload a single file for your asset. Only one file is allowed per individual asset.'
          : `Upload one or more files for your asset. ${
              effectiveMaxFiles > 1
                ? `You can upload up to ${effectiveMaxFiles} files for set type assets.`
                : ''
            }`}
      </Typography>

      {/* Layer name display removed - now shown in TaxonomyContext */}

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
                    <IconButton
                      size="small"
                      onClick={() => handleRetry(item.file)}
                      color="inherit"
                    >
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
                <Typography variant="body2">
                  Failed to upload: {item.file.name}
                </Typography>
                <Typography variant="caption">{item.error}</Typography>
              </Alert>
            ))}
          </Stack>
        </Box>
      )}

      {/* File status summary */}
      {files.length > 0 && (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 2,
          }}
        >
          <Box>
            <Chip
              label={`${files.length} file${
                files.length > 1 ? 's' : ''
              } selected`}
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
              <Chip
                label={`${retryQueue.length} failed`}
                color="error"
                size="small"
              />
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

      {/* Source field has been moved to the Asset Details section */}

      {/* Main uploader */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Box sx={{ mb: 2 }}>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: 'block', mb: 1 }}
            >
              Maximum file size: {formatFileSize(maxSize)}
            </Typography>
          </Box>
          <FileUploader
            accept={accept}
            maxSize={maxSize}
            options={options}
            maxFiles={effectiveMaxFiles}
            initialFiles={initialFiles}
            onFilesUploaded={(responses: FileUploadResponse[]) => {
              setUploadedFiles(prev => [...prev, ...responses]);
              if (onUploadComplete) {
                responses.forEach((response: FileUploadResponse) => {
                  onUploadComplete(response.filename, response);
                });
              }
            }}
            onFilesAdded={handleFileSelect}
            onFileRemoved={(file: File) => {
              setFiles(prev => prev.filter(f => f !== file));
              if (selectedFile === file) {
                setSelectedFile(files.length > 1 ? files[0] : null);
              }
              onFilesChange(files.filter(f => f !== file));
            }}
            onAllUploadsComplete={(responses: FileUploadResponse[]) => {
              setError(null);
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
                  {files.length > 0
                    ? 'Select a file to preview'
                    : 'No files uploaded yet'}
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
                    borderColor:
                      selectedFile === file ? 'primary.main' : 'transparent',
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
                        setSelectedFile(
                          files.length > 1
                            ? files.filter(f => f !== file)[0]
                            : null
                        );
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

// Custom equality function for props to prevent unnecessary rerenders
const arePropsEqual = (prevProps: FileUploadProps, nextProps: FileUploadProps) => {
  // Compare critical props that would cause visual/behavior changes
  return (
    prevProps.layerCode === nextProps.layerCode &&
    prevProps.maxSize === nextProps.maxSize &&
    prevProps.maxFiles === nextProps.maxFiles &&
    prevProps.acceptedFileTypes === nextProps.acceptedFileTypes &&
    prevProps.initialSource === nextProps.initialSource &&
    // Compare initial files length (not checking contents as they're only used for initialization)
    (prevProps.initialFiles?.length || 0) === (nextProps.initialFiles?.length || 0)
    // Callback props are intentionally excluded as they should be wrapped in useCallback by parent
  );
};

// Add displayName for debugging in React DevTools
FileUpload.displayName = 'FileUpload';

export default React.memo(FileUpload, arePropsEqual);
