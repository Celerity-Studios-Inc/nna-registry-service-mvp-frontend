import { useState } from 'react';
import assetService from '../api/assetService';
import { FileUploadResponse } from '../types/asset.types';

export const useFileUpload = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<FileUploadResponse[]>([]);

  const uploadFile = async (file: File): Promise<FileUploadResponse | null> => {
    try {
      setIsUploading(true);
      setError(null);
      const response = await assetService.uploadFile(file);

      // Convert response to FileUploadResponse
      if (response && response.response) {
        return {
          filename: response.response.filename || file.name,
          url: response.response.url || '',
          size: response.response.size || file.size,
          mimeType: response.response.mimeType || file.type,
          originalName: file.name,
        };
      }
      return null;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload file');
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const addFiles = async (files: File[], type: string) => {
    try {
      setIsUploading(true);
      setError(null);

      const uploadPromises = files.map(file => uploadFile(file));
      const responses = await Promise.all(uploadPromises);

      const successfulUploads = responses.filter(
        (r): r is FileUploadResponse => r !== null
      );
      setUploadedFiles(prev => [...prev, ...successfulUploads]);

      return successfulUploads;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload files');
      return [];
    } finally {
      setIsUploading(false);
    }
  };

  const clearUploadState = () => {
    setUploadedFiles([]);
    setError(null);
    setIsUploading(false);
  };

  return {
    uploadFile,
    addFiles,
    clearUploadState,
    isUploading,
    error,
    uploadedFiles,
  };
};
