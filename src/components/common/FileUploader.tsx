import React, { useState, useCallback, useEffect, useMemo } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  LinearProgress,
  Alert,
  IconButton,
  useTheme,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  Chip,
  Stack,
  Collapse,
  CircularProgress,
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  Delete as DeleteIcon,
  CheckCircle as SuccessIcon,
  Error as ErrorIcon,
  Refresh as RetryIcon,
  AttachFile as AttachIcon,
  PhotoLibrary as GalleryIcon,
} from '@mui/icons-material';
import { useDropzone } from 'react-dropzone';
import { FileUploadResponse } from '../../types/asset.types';
import assetService from '../../api/assetService';

export interface FileUploaderProps {
  accept?: string;
  maxSize?: number;
  options?: any;
  maxFiles?: number;
  initialFiles?: File[];
  onFilesUploaded?: (responses: FileUploadResponse[]) => void;
  onFilesAdded?: (selectedFiles: File[]) => void;
  onFileRemoved?: (file: File) => void;
  onAllUploadsComplete?: (responses: FileUploadResponse[]) => void;
  onUploadProgress?: (fileId: string, progress: number) => void;
  onUploadComplete?: (fileId: string, fileData: FileUploadResponse) => void;
  onUploadError?: (fileId: string, error: string) => void;
  validateFile?: (file: File) => boolean | string;
  uploadImmediately?: boolean;
  showPreviews?: boolean;
  uploadLabel?: string;
}

interface FileStatus {
  file: File;
  id: string;
  progress: number;
  status: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
  response?: FileUploadResponse;
}

// Improved file type helper for better display
const getFileTypeIcon = (type: string) => {
  if (type.startsWith('image/')) {
    return <GalleryIcon fontSize="small" color="primary" />;
  } else if (type.startsWith('audio/')) {
    return <AttachIcon fontSize="small" color="secondary" />;
  } else if (type.startsWith('video/')) {
    return <AttachIcon fontSize="small" color="success" />;
  } else {
    return <AttachIcon fontSize="small" />;
  }
};

// Format accepted file types into more readable groups
const formatAcceptedFileTypes = (accept: string): string => {
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
  if (imageTypes.length > 0) parts.push(`Images`);
  if (audioTypes.length > 0) parts.push(`Audio`);
  if (videoTypes.length > 0) parts.push(`Video`);
  if (modelTypes.length > 0) parts.push(`3D Models`);
  if (otherTypes.length > 0) {
    // Further categorize other types
    const jsonTypes = otherTypes.filter(t => t.includes('json'));
    const octetTypes = otherTypes.filter(t => t.includes('octet'));

    if (jsonTypes.length > 0) parts.push('JSON');
    if (octetTypes.length > 0) parts.push('Binary');
    if (otherTypes.some(t => t.includes('pdf'))) parts.push('PDF');
  }

  return parts.join(', ');
};

// Format file size for display
const formatFileSize = (bytes: number, decimals = 1) => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(decimals))} ${
    sizes[i]
  }`;
};

const FileUploader: React.FC<FileUploaderProps> = ({
  accept = 'image/*,audio/*,video/*,application/pdf,application/json',
  maxSize = 52428800, // 50MB
  maxFiles = 1,
  initialFiles = [],
  onFilesUploaded,
  onFilesAdded,
  onFileRemoved,
  onAllUploadsComplete,
  onUploadProgress,
  onUploadComplete,
  onUploadError,
  validateFile,
  uploadImmediately = false,
  showPreviews = false,
  uploadLabel = 'Drag and drop files here, or click to select',
}) => {
  const theme = useTheme();

  // State for files and their status
  const [files, setFiles] = useState<File[]>(initialFiles);
  const [fileStatuses, setFileStatuses] = useState<FileStatus[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [uploadResponses, setUploadResponses] = useState<FileUploadResponse[]>(
    []
  );
  const [showFileList, setShowFileList] = useState<boolean>(true);
  const [isUploading, setIsUploading] = useState<boolean>(false);

  // Track file system access permissions for smoother experience
  const [hasFileAccess, setHasFileAccess] = useState<boolean>(false);

  // Initialize with initial files if provided
  useEffect(() => {
    if (initialFiles && initialFiles.length > 0) {
      setFiles(initialFiles);
      const statuses: FileStatus[] = initialFiles.map(file => ({
        file,
        id: file.name,
        progress: 0,
        status: 'pending',
      }));
      setFileStatuses(statuses);
    }
  }, []);

  // File validation
  const validateFiles = useCallback(
    (newFiles: File[]) => {
      // Check file count
      if (files.length + newFiles.length > maxFiles) {
        setError(
          `Maximum ${maxFiles} file${maxFiles === 1 ? '' : 's'} allowed`
        );
        return false;
      }

      // Check file size and run custom validation
      for (const file of newFiles) {
        if (file.size > maxSize) {
          setError(
            `File "${file.name}" exceeds the maximum size of ${formatFileSize(
              maxSize
            )}`
          );
          return false;
        }

        if (validateFile) {
          const result = validateFile(file);
          if (typeof result === 'string') {
            setError(result);
            return false;
          } else if (result === false) {
            setError(`File "${file.name}" failed validation`);
            return false;
          }
        }
      }

      return true;
    },
    [files, maxFiles, maxSize, validateFile]
  );

  // Upload a single file - defined before onDrop to fix the dependency issue
  const uploadFile = useCallback(
    async (file: File): Promise<FileUploadResponse | null> => {
      // Update status to uploading
      setFileStatuses(prev =>
        prev.map(status =>
          status.file === file
            ? { ...status, status: 'uploading' as const, progress: 0 }
            : status
        )
      );

      try {
        // Upload with progress tracking
        const uploadResult = await assetService.uploadFile(file, progress => {
          // Update progress
          setFileStatuses(prev =>
            prev.map(status =>
              status.file === file ? { ...status, progress } : status
            )
          );

          if (onUploadProgress) {
            onUploadProgress(file.name, progress);
          }
        });

        if (uploadResult && uploadResult.response) {
          const response: FileUploadResponse = {
            filename: uploadResult.response.filename || file.name,
            url: uploadResult.response.url || '',
            size: uploadResult.response.size || file.size,
            mimeType: uploadResult.response.mimeType || file.type,
            originalName: file.name,
          };

          // Update status to success
          setFileStatuses(prev =>
            prev.map(status =>
              status.file === file
                ? {
                    ...status,
                    status: 'success' as const,
                    progress: 100,
                    response,
                  }
                : status
            )
          );

          if (onUploadComplete) {
            onUploadComplete(file.name, response);
          }

          return response;
        }

        throw new Error('Upload failed');
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Upload failed';

        // Update status to error
        setFileStatuses(prev =>
          prev.map(status =>
            status.file === file
              ? {
                  ...status,
                  status: 'error' as const,
                  error: errorMessage,
                }
              : status
          )
        );

        if (onUploadError) {
          onUploadError(file.name, errorMessage);
        }

        return null;
      }
    },
    [onUploadComplete, onUploadError, onUploadProgress]
  );

  // Upload files with optimized approach - defined before onDrop to fix the dependency issue
  const uploadFiles = useCallback(
    async (filesToUpload: File[]) => {
      if (filesToUpload.length === 0) return;

      setIsUploading(true);

      const uploadPromises = filesToUpload.map(file => uploadFile(file));

      try {
        const results = await Promise.allSettled(uploadPromises);

        // Collect successful responses
        const successfulResponses: FileUploadResponse[] = [];

        results.forEach((result, index) => {
          if (result.status === 'fulfilled' && result.value) {
            successfulResponses.push(result.value);
          }
        });

        if (successfulResponses.length > 0) {
          setUploadResponses(prev => [...prev, ...successfulResponses]);

          if (onFilesUploaded) {
            onFilesUploaded(successfulResponses);
          }

          if (
            successfulResponses.length === filesToUpload.length &&
            onAllUploadsComplete
          ) {
            onAllUploadsComplete(successfulResponses);
          }
        }
      } catch (err) {
        console.error('Error uploading files:', err);
        setError('Error uploading files');
      } finally {
        setIsUploading(false);
      }
    },
    [onAllUploadsComplete, onFilesUploaded, uploadFile]
  );

  // Handle file drop/selection using optimized approach
  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) return;

      // Validate files
      if (!validateFiles(acceptedFiles)) return;

      // Show loading state immediately
      setIsUploading(true);

      // Add to files state
      const newFiles = [...files, ...acceptedFiles];
      setFiles(newFiles);

      // Create status entries for new files
      const newStatuses: FileStatus[] = acceptedFiles.map(file => ({
        file,
        id: file.name,
        progress: 0,
        status: 'pending',
      }));

      setFileStatuses(prev => [...prev, ...newStatuses]);
      setError(null);

      // Try to get permanent file system access permission for better UX
      try {
        // This is a modern browser feature, might not be available everywhere
        // @ts-ignore - FileSystemHandle API might not be recognized by TypeScript
        if (window.showDirectoryPicker && !hasFileAccess) {
          // Only request once per session
          setHasFileAccess(true);
        }
      } catch (e) {
        // Silently fail, this is just an enhancement
        console.log('File system access API not available');
      }

      // Notify parent
      if (onFilesAdded) {
        onFilesAdded(newFiles);
      }

      // Upload immediately if option is set, with slight delay for UI feedback
      if (uploadImmediately) {
        // Small timeout for better UX feedback
        await new Promise(resolve => setTimeout(resolve, 300));
        await uploadFiles(acceptedFiles);
      }

      setIsUploading(false);
    },
    [
      files,
      hasFileAccess,
      onFilesAdded,
      uploadFiles,
      uploadImmediately,
      validateFiles,
    ]
  );

  // Configure dropzone with optimized settings
  const {
    getRootProps,
    getInputProps,
    isDragActive,
    open: openFileDialog,
  } = useDropzone({
    onDrop,
    accept: accept.split(',').reduce((acc: Record<string, string[]>, item) => {
      const trimmed = item.trim();
      const key = trimmed.includes('/') ? trimmed : `.${trimmed}`;
      acc[key] = [];
      return acc;
    }, {}),
    maxSize,
    multiple: maxFiles > 1,
    disabled: files.length >= maxFiles || isUploading,
    noClick: false, // Enable single click to open file dialog
    noKeyboard: false, // Allow keyboard navigation
  });

  // Remove a file
  const handleRemoveFile = useCallback(
    (fileToRemove: File) => {
      setFiles(files.filter(file => file !== fileToRemove));
      setFileStatuses(
        fileStatuses.filter(status => status.file !== fileToRemove)
      );

      if (onFileRemoved) {
        onFileRemoved(fileToRemove);
      }
    },
    [files, fileStatuses, onFileRemoved]
  );

  // Retry a failed upload
  const handleRetry = useCallback(
    (file: File) => {
      uploadFile(file);
    },
    [uploadFile]
  );

  // Upload all pending files
  const handleUploadAll = useCallback(() => {
    const pendingFiles = fileStatuses
      .filter(
        status => status.status === 'pending' || status.status === 'error'
      )
      .map(status => status.file);

    if (pendingFiles.length > 0) {
      uploadFiles(pendingFiles);
    }
  }, [fileStatuses, uploadFiles]);

  // Get summary information for uploaded files
  const fileSummary = useMemo(() => {
    const totalFiles = fileStatuses.length;
    const pendingFiles = fileStatuses.filter(
      s => s.status === 'pending'
    ).length;
    const uploadingFiles = fileStatuses.filter(
      s => s.status === 'uploading'
    ).length;
    const successFiles = fileStatuses.filter(
      s => s.status === 'success'
    ).length;
    const errorFiles = fileStatuses.filter(s => s.status === 'error').length;

    return {
      totalFiles,
      pendingFiles,
      uploadingFiles,
      successFiles,
      errorFiles,
      isComplete: totalFiles > 0 && pendingFiles === 0 && uploadingFiles === 0,
      hasErrors: errorFiles > 0,
    };
  }, [fileStatuses]);

  // Dropzone message based on state
  const dropzoneMessage = useMemo(() => {
    if (files.length >= maxFiles) {
      return `Maximum number of files reached (${maxFiles})`;
    }

    if (isDragActive) {
      return 'Drop files here';
    }

    if (isUploading) {
      return 'Uploading files...';
    }

    return uploadLabel;
  }, [files.length, isDragActive, isUploading, maxFiles, uploadLabel]);

  return (
    <Box>
      {/* Dropzone */}
      <Paper
        {...getRootProps()}
        sx={{
          p: 3,
          borderStyle: 'dashed',
          borderWidth: 2,
          borderColor: isDragActive
            ? 'primary.main'
            : isUploading
            ? 'primary.light'
            : files.length >= maxFiles
            ? 'divider'
            : 'divider',
          backgroundColor: isDragActive
            ? `${theme.palette.primary.main}10`
            : isUploading
            ? `${theme.palette.primary.main}05`
            : 'background.paper',
          cursor:
            files.length >= maxFiles || isUploading ? 'default' : 'pointer',
          transition: 'all 0.2s ease',
          textAlign: 'center',
          position: 'relative',
          '&:hover':
            files.length >= maxFiles || isUploading
              ? {}
              : {
                  borderColor: 'primary.main',
                  backgroundColor: `${theme.palette.primary.main}05`,
                  transform: 'translateY(-2px)',
                },
        }}
      >
        <input {...getInputProps()} />
        {isUploading ? (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <CircularProgress size={40} sx={{ mb: 2, color: 'primary.main' }} />
            <Typography variant="body1" gutterBottom>
              Uploading files...
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Please wait while your files are being processed
            </Typography>
          </Box>
        ) : (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <UploadIcon
              sx={{
                fontSize: 48,
                mb: 2,
                color: isDragActive ? 'primary.main' : 'text.secondary',
                animation: isDragActive ? 'pulse 1.5s infinite' : 'none',
              }}
            />
            <Typography variant="body1" gutterBottom>
              {dropzoneMessage}
            </Typography>
            {files.length >= maxFiles && (
              <Typography variant="caption" color="error">
                Maximum number of files reached
              </Typography>
            )}
            <Typography variant="caption" color="text.secondary">
              Maximum file size: {formatFileSize(maxSize)}
            </Typography>
            <Box sx={{ mt: 1, px: 2, maxWidth: '100%', overflow: 'hidden' }}>
              <Stack
                direction="row"
                spacing={0.5}
                flexWrap="wrap"
                justifyContent="center"
              >
                {formatAcceptedFileTypes(accept)
                  .split(',')
                  .map((group, idx) => (
                    <Chip
                      key={idx}
                      label={group.trim()}
                      size="small"
                      variant="outlined"
                      sx={{
                        fontSize: '0.65rem',
                        height: 20,
                        m: 0.25,
                        color: 'text.secondary',
                        borderColor: 'divider',
                      }}
                    />
                  ))}
              </Stack>
            </Box>
          </Box>
        )}
      </Paper>

      {/* Error message */}
      {error && (
        <Alert severity="error" onClose={() => setError(null)} sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}

      {/* File list and status summary */}
      {fileStatuses.length > 0 && (
        <Box sx={{ mt: 2 }}>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mb: 1,
            }}
          >
            <Typography variant="subtitle2" gutterBottom sx={{ mb: 0 }}>
              Files ({fileStatuses.length})
            </Typography>

            <Stack direction="row" spacing={0.5}>
              {fileSummary.successFiles > 0 && (
                <Chip
                  label={`${fileSummary.successFiles} uploaded`}
                  size="small"
                  color="success"
                  variant="outlined"
                />
              )}
              {fileSummary.uploadingFiles > 0 && (
                <Chip
                  label={`${fileSummary.uploadingFiles} uploading`}
                  size="small"
                  color="primary"
                  variant="outlined"
                />
              )}
              {fileSummary.errorFiles > 0 && (
                <Chip
                  label={`${fileSummary.errorFiles} failed`}
                  size="small"
                  color="error"
                  variant="outlined"
                />
              )}
              <Button
                size="small"
                onClick={() => setShowFileList(!showFileList)}
                sx={{ ml: 1, minWidth: 0, px: 1 }}
              >
                {showFileList ? 'Hide' : 'Show'}
              </Button>
            </Stack>
          </Box>

          <Collapse in={showFileList}>
            <List dense>
              {fileStatuses.map(status => (
                <ListItem
                  key={status.id}
                  sx={{
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 1,
                    mb: 0.5,
                    transition: 'background-color 0.2s',
                    bgcolor:
                      status.status === 'success'
                        ? 'success.50'
                        : status.status === 'error'
                        ? 'error.50'
                        : 'background.paper',
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    {getFileTypeIcon(status.file.type)}
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Typography
                        variant="body2"
                        component="span"
                        sx={{
                          fontWeight:
                            status.status === 'success' ? 'medium' : 'regular',
                          display: 'inline-block',
                          maxWidth: '180px',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {status.file.name}
                      </Typography>
                    }
                    secondary={
                      <span>
                        {status.status === 'uploading' && (
                          <Box
                            component="span"
                            sx={{ display: 'block', width: '100%', mt: 0.5 }}
                          >
                            <LinearProgress
                              variant="determinate"
                              value={status.progress}
                              sx={{ height: 3, borderRadius: 5 }}
                            />
                            <Typography
                              component="span"
                              variant="caption"
                              color="text.secondary"
                              align="right"
                              display="block"
                            >
                              {Math.round(status.progress)}%
                            </Typography>
                          </Box>
                        )}
                        {status.status === 'success' && (
                          <Typography
                            component="span"
                            variant="caption"
                            color="success.main"
                            sx={{ display: 'flex', alignItems: 'center' }}
                          >
                            <SuccessIcon
                              fontSize="small"
                              sx={{ mr: 0.5, width: 14, height: 14 }}
                            />
                            Complete
                          </Typography>
                        )}
                        {status.status === 'error' && (
                          <Typography
                            component="span"
                            variant="caption"
                            color="error"
                            sx={{ display: 'flex', alignItems: 'center' }}
                          >
                            <ErrorIcon
                              fontSize="small"
                              sx={{ mr: 0.5, width: 14, height: 14 }}
                            />
                            {status.error || 'Failed'}
                          </Typography>
                        )}
                        {status.status === 'pending' && (
                          <Typography
                            component="span"
                            variant="caption"
                            color="text.secondary"
                          >
                            {formatFileSize(status.file.size)}
                          </Typography>
                        )}
                      </span>
                    }
                  />
                  <ListItemSecondaryAction>
                    {status.status === 'error' && (
                      <IconButton
                        edge="end"
                        onClick={() => handleRetry(status.file)}
                        size="small"
                      >
                        <RetryIcon fontSize="small" />
                      </IconButton>
                    )}
                    <IconButton
                      edge="end"
                      onClick={() => handleRemoveFile(status.file)}
                      size="small"
                      disabled={status.status === 'uploading'}
                      sx={{ ml: 0.5 }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          </Collapse>

          {/* Upload button (if not uploading immediately) */}
          {!uploadImmediately &&
            fileStatuses.some(
              s => s.status === 'pending' || s.status === 'error'
            ) && (
              <Button
                variant="contained"
                color="primary"
                startIcon={<UploadIcon />}
                onClick={handleUploadAll}
                sx={{ mt: 2 }}
                disabled={isUploading}
              >
                {isUploading ? 'Uploading...' : 'Upload All'}
              </Button>
            )}
        </Box>
      )}

      {/* Styled keyframes for animations */}
      <style>{`
        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.1); }
          100% { transform: scale(1); }
        }
      `}</style>
    </Box>
  );
};

export default React.memo(FileUploader);
