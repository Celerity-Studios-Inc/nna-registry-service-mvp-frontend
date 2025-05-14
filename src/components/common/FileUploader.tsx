import React, { useState, useCallback, useEffect } from 'react';
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
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  Delete as DeleteIcon,
  CheckCircle as SuccessIcon,
  Error as ErrorIcon,
  Refresh as RetryIcon,
  AttachFile as AttachIcon,
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

// Format accepted file types into more readable groups
const formatAcceptedFileTypes = (accept: string): string => {
  const types = accept.split(',').map(t => t.trim());

  // Group by major type
  const imageTypes = types.filter(t => t.startsWith('image/')).map(t => t.replace('image/', ''));
  const audioTypes = types.filter(t => t.startsWith('audio/')).map(t => t.replace('audio/', ''));
  const videoTypes = types.filter(t => t.startsWith('video/')).map(t => t.replace('video/', ''));
  const modelTypes = types.filter(t => t.includes('model/')).map(t => t.replace('model/', ''));
  const otherTypes = types.filter(t =>
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
  const [uploadResponses, setUploadResponses] = useState<FileUploadResponse[]>([]);
  
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
  const validateFiles = (newFiles: File[]) => {
    // Check file count
    if (files.length + newFiles.length > maxFiles) {
      setError(`Maximum ${maxFiles} file${maxFiles === 1 ? '' : 's'} allowed`);
      return false;
    }

    // Check file size and run custom validation
    for (const file of newFiles) {
      if (file.size > maxSize) {
        setError(`File "${file.name}" exceeds the maximum size of ${maxSize / (1024 * 1024)}MB`);
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
  };

  // Handle file drop/selection
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) return;

      // Validate files
      if (!validateFiles(acceptedFiles)) return;

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

      // Notify parent
      if (onFilesAdded) {
        onFilesAdded(newFiles);
      }

      // Upload immediately if option is set
      if (uploadImmediately) {
        uploadFiles(acceptedFiles);
      }
    },
    [files, onFilesAdded, uploadImmediately]
  );

  // Configure dropzone
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: accept.split(',').reduce((acc: Record<string, string[]>, item) => {
      const trimmed = item.trim();
      const key = trimmed.includes('/') ? trimmed : `.${trimmed}`;
      acc[key] = [];
      return acc;
    }, {}),
    maxSize,
    multiple: maxFiles > 1,
    disabled: files.length >= maxFiles,
  });

  // Remove a file
  const handleRemoveFile = (fileToRemove: File) => {
    setFiles(files.filter(file => file !== fileToRemove));
    setFileStatuses(fileStatuses.filter(status => status.file !== fileToRemove));
    
    if (onFileRemoved) {
      onFileRemoved(fileToRemove);
    }
  };

  // Upload files
  const uploadFiles = async (filesToUpload: File[]) => {
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
        
        if (successfulResponses.length === filesToUpload.length && onAllUploadsComplete) {
          onAllUploadsComplete(successfulResponses);
        }
      }
    } catch (err) {
      console.error('Error uploading files:', err);
      setError('Error uploading files');
    }
  };

  // Upload a single file
  const uploadFile = async (file: File): Promise<FileUploadResponse | null> => {
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
      const uploadResult = await assetService.uploadFile(file, (progress) => {
        // Update progress
        setFileStatuses(prev => 
          prev.map(status => 
            status.file === file 
              ? { ...status, progress } 
              : status
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
                  response
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
      const errorMessage = err instanceof Error ? err.message : 'Upload failed';
      
      // Update status to error
      setFileStatuses(prev => 
        prev.map(status => 
          status.file === file 
            ? { 
                ...status, 
                status: 'error' as const,
                error: errorMessage
              } 
            : status
        )
      );
      
      if (onUploadError) {
        onUploadError(file.name, errorMessage);
      }
      
      return null;
    }
  };

  // Retry a failed upload
  const handleRetry = (file: File) => {
    uploadFile(file);
  };

  // Upload all pending files
  const handleUploadAll = () => {
    const pendingFiles = fileStatuses
      .filter(status => status.status === 'pending' || status.status === 'error')
      .map(status => status.file);
      
    if (pendingFiles.length > 0) {
      uploadFiles(pendingFiles);
    }
  };

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
            : 'divider',
          backgroundColor: isDragActive
            ? `${theme.palette.primary.main}10`
            : 'background.paper',
          cursor: files.length >= maxFiles ? 'default' : 'pointer',
          transition: 'all 0.2s ease',
          textAlign: 'center',
          '&:hover': files.length >= maxFiles
            ? {}
            : {
                borderColor: 'primary.main',
                backgroundColor: `${theme.palette.primary.main}05`,
              },
        }}
      >
        <input {...getInputProps()} />
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
            }} 
          />
          <Typography variant="body1" gutterBottom>
            {uploadLabel}
          </Typography>
          {files.length >= maxFiles && (
            <Typography variant="caption" color="error">
              Maximum number of files reached
            </Typography>
          )}
          <Typography variant="caption" color="text.secondary">
            Maximum file size: {maxSize / (1024 * 1024)}MB
          </Typography>
          <Box sx={{ mt: 1, px: 2, maxWidth: '100%', overflow: 'hidden' }}>
            <Typography variant="caption" color="text.secondary" sx={{ 
              display: 'flex', 
              flexWrap: 'wrap', 
              gap: 0.5, 
              justifyContent: 'center',
              fontSize: '0.75rem'
            }}>
              {formatAcceptedFileTypes(accept).split(',').map((group, idx) => (
                <Chip 
                  key={idx} 
                  label={group.trim()} 
                  size="small" 
                  variant="outlined" 
                  sx={{ fontSize: '0.65rem', height: 20 }}
                />
              ))}
            </Typography>
          </Box>
        </Box>
      </Paper>

      {/* Error message */}
      {error && (
        <Alert 
          severity="error" 
          onClose={() => setError(null)}
          sx={{ mt: 2 }}
        >
          {error}
        </Alert>
      )}

      {/* File list */}
      {fileStatuses.length > 0 && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            Files ({fileStatuses.length})
          </Typography>
          <List>
            {fileStatuses.map((status) => (
              <ListItem key={status.id}>
                <ListItemIcon>
                  <AttachIcon />
                </ListItemIcon>
                <ListItemText 
                  primary={status.file.name}
                  secondary={
                    <span>
                      {status.status === 'uploading' && (
                        <Box component="span" sx={{ display: 'block', width: '100%', mt: 1 }}>
                          <LinearProgress 
                            variant="determinate" 
                            value={status.progress} 
                            sx={{ height: 5, borderRadius: 5 }}
                          />
                          <Typography component="span" variant="caption" color="text.secondary" align="right" display="block">
                            {Math.round(status.progress)}%
                          </Typography>
                        </Box>
                      )}
                      {status.status === 'success' && (
                        <Typography component="span" variant="caption" color="success.main" sx={{ display: 'flex', alignItems: 'center' }}>
                          <SuccessIcon fontSize="small" sx={{ mr: 0.5 }} />
                          Upload successful
                        </Typography>
                      )}
                      {status.status === 'error' && (
                        <Typography component="span" variant="caption" color="error" sx={{ display: 'flex', alignItems: 'center' }}>
                          <ErrorIcon fontSize="small" sx={{ mr: 0.5 }} />
                          {status.error || 'Upload failed'}
                        </Typography>
                      )}
                      {status.status === 'pending' && (
                        <Typography component="span" variant="caption" color="text.secondary">
                          Pending upload
                        </Typography>
                      )}
                    </span>
                  }
                />
                <ListItemSecondaryAction>
                  {status.status === 'error' && (
                    <IconButton edge="end" onClick={() => handleRetry(status.file)}>
                      <RetryIcon />
                    </IconButton>
                  )}
                  <IconButton edge="end" onClick={() => handleRemoveFile(status.file)}>
                    <DeleteIcon />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
          
          {/* Upload button (if not uploading immediately) */}
          {!uploadImmediately && fileStatuses.some(s => s.status === 'pending' || s.status === 'error') && (
            <Button
              variant="contained"
              color="primary"
              startIcon={<UploadIcon />}
              onClick={handleUploadAll}
              sx={{ mt: 2 }}
            >
              Upload All
            </Button>
          )}
        </Box>
      )}
    </Box>
  );
};

export default FileUploader;