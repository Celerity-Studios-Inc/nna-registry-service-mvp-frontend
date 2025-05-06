import assetService from './assetService';
import axios from 'axios';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

beforeAll(() => {
  // Mock URL.createObjectURL for the test environment
  global.URL.createObjectURL = jest.fn(() => 'mock-url');
});

describe('assetService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('uploadFile', () => {
    const mockFile = new File(['test content'], 'test.jpg', { type: 'image/jpeg' });
    const mockResponse = {
      data: {
        filename: 'test.jpg',
        url: 'http://example.com/test.jpg',
        size: 1024,
        mimeType: 'image/jpeg',
      },
    };

    it('uploads file successfully', async () => {
      mockedAxios.post.mockResolvedValueOnce(mockResponse);

      const result = await assetService.uploadFile(mockFile);

      expect(mockedAxios.post).toHaveBeenCalledWith(
        '/api/assets/upload',
        expect.any(FormData),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Content-Type': 'multipart/form-data',
          }),
          onUploadProgress: expect.any(Function),
        })
      );
      expect(result).toEqual(mockResponse);
    });

    it('handles upload progress', async () => {
      mockedAxios.post.mockImplementationOnce((url, data, config) => {
        if (config?.onUploadProgress) {
          config.onUploadProgress({ loaded: 50, total: 100 } as any);
        }
        return Promise.resolve(mockResponse);
      });

      const onProgress = jest.fn();
      await assetService.uploadFile(mockFile, onProgress);

      expect(onProgress).toHaveBeenCalledWith(50);
    });

    it('handles upload error', async () => {
      const error = new Error('Upload failed');
      mockedAxios.post.mockRejectedValueOnce(error);

      await expect(assetService.uploadFile(mockFile)).rejects.toThrow('Upload failed');
    });
  });

  describe('createAsset', () => {
    const mockAssetData = {
      name: 'Test Asset',
      layer: 'M',
      categoryCode: 'CV',
      subcategoryCode: 'OD',
      description: 'Test description',
      files: [new File(['test'], 'test.jpg')],
      metadata: {
        layerName: 'Model',
        categoryName: 'Computer Vision',
        subcategoryName: 'Object Detection',
        humanFriendlyName: 'Model-CV-OD-001',
        machineFriendlyAddress: 'M-CV-OD-001',
      },
    };

    const mockResponse = {
      data: {
        id: '1',
        ...mockAssetData,
      },
    };

    it('creates asset successfully', async () => {
      mockedAxios.post.mockResolvedValueOnce(mockResponse);

      const result = await assetService.createAsset(mockAssetData);

      expect(mockedAxios.post).toHaveBeenCalledWith(
        '/api/assets',
        mockAssetData,
        expect.any(Object)
      );
      expect(result).toEqual(mockResponse.data);
    });

    it('handles creation error', async () => {
      const error = new Error('Creation failed');
      mockedAxios.post.mockRejectedValueOnce(error);

      await expect(assetService.createAsset(mockAssetData)).rejects.toThrow('Creation failed');
    });
  });

  describe('checkDuplicateAsset', () => {
    const mockFile = new File(['test content'], 'test.jpg', { type: 'image/jpeg' });
    const mockResponse = {
      data: {
        isDuplicate: true,
        confidence: 'high',
        existingAsset: {
          id: '2',
          name: 'Similar Asset',
        },
      },
    };

    it('checks for duplicates successfully', async () => {
      mockedAxios.post.mockResolvedValueOnce(mockResponse);

      const result = await assetService.checkDuplicateAsset(mockFile);

      expect(mockedAxios.post).toHaveBeenCalledWith(
        '/api/assets/check-duplicate',
        expect.any(FormData),
        expect.any(Object)
      );
      expect(result).toEqual(mockResponse.data);
    });

    it('handles no duplicates found', async () => {
      mockedAxios.post.mockResolvedValueOnce({
        data: {
          asset: null,
          confidence: 'low' as const,
        },
      });

      const result = await assetService.checkDuplicateAsset(mockFile);

      expect(result!.asset).toBeNull();
      expect(result!.confidence).toBe('low');
    });

    it('handles duplicate check error', async () => {
      const error = new Error('Check failed');
      mockedAxios.post.mockRejectedValueOnce(error);

      await expect(assetService.checkDuplicateAsset(mockFile)).rejects.toThrow('Check failed');
    });
  });

  describe('getAssetByNnaAddress', () => {
    const mockNnaAddress = 'M-CV-OD-001';
    const mockResponse = {
      data: {
        id: '1',
        name: 'Test Asset',
        nnaAddress: mockNnaAddress,
      },
    };

    it('retrieves asset by NNA address successfully', async () => {
      mockedAxios.get.mockResolvedValueOnce(mockResponse);

      const result = await assetService.getAssetByNnaAddress(mockNnaAddress);

      expect(mockedAxios.get).toHaveBeenCalledWith(
        `/api/assets/nna/${mockNnaAddress}`,
        expect.any(Object)
      );
      expect(result).toEqual(mockResponse.data);
    });

    it('handles asset not found', async () => {
      mockedAxios.get.mockRejectedValueOnce({
        response: {
          status: 404,
          data: { message: 'Asset not found' },
        },
      });

      await expect(assetService.getAssetByNnaAddress(mockNnaAddress)).rejects.toThrow('Asset not found');
    });
  });

  describe('error handling', () => {
    it('handles network errors', async () => {
      const networkError = new Error('Network Error');
      mockedAxios.post.mockRejectedValueOnce(networkError);

      await expect(assetService.createAsset({} as any)).rejects.toThrow('Network Error');
    });

    it('handles validation errors', async () => {
      const validationError = {
        response: {
          status: 400,
          data: {
            message: 'Validation failed',
            errors: ['Name is required'],
          },
        },
      };
      mockedAxios.post.mockRejectedValueOnce(validationError);

      await expect(assetService.createAsset({} as any)).rejects.toThrow('Validation failed');
    });

    it('handles server errors', async () => {
      const serverError = {
        response: {
          status: 500,
          data: {
            message: 'Internal server error',
          },
        },
      };
      mockedAxios.post.mockRejectedValueOnce(serverError);

      await expect(assetService.createAsset({} as any)).rejects.toThrow('Internal server error');
    });
  });
}); 