import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import axios from 'axios';
import { toast } from 'react-toastify';
import CompositeAssetSelection from '../CompositeAssetSelection';
import { Asset } from '../../types/asset.types';

// Mock dependencies
jest.mock('axios');
jest.mock('react-toastify');

const mockedAxios = axios as jest.Mocked<typeof axios>;
const mockedToast = toast as jest.Mocked<typeof toast>;

describe('CompositeAssetSelection', () => {
  const mockOnComponentsSelected = jest.fn();
  
  const mockAssets: Asset[] = [
    {
      id: 'asset-1',
      name: 'G.POP.TSW.001',
      friendlyName: 'G.POP.TSW.001',
      nnaAddress: 'G.POP.TSW.001',
      layer: 'G',
      categoryCode: 'POP',
      subcategoryCode: 'TSW',
      type: 'audio',
      gcpStorageUrl: 'gs://bucket/file1.mp3',
      files: [],
      metadata: {},
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
      createdBy: 'user1',
      status: 'active',
      tags: ['pop', 'taylor-swift']
    },
    {
      id: 'asset-2', 
      name: 'S.POP.PNK.001',
      friendlyName: 'S.POP.PNK.001',
      nnaAddress: 'S.POP.PNK.001',
      layer: 'S',
      categoryCode: 'POP',
      subcategoryCode: 'PNK',
      type: 'avatar',
      gcpStorageUrl: 'gs://bucket/file2.png',
      files: [],
      metadata: {},
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
      createdBy: 'user1',
      status: 'active',
      tags: ['pop', 'pink']
    }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    // Mock axios.isAxiosError for proper error detection
    mockedAxios.isAxiosError = jest.fn().mockImplementation((error: any) => {
      return error && error.isAxiosError === true;
    });
    
    // Mock successful rights verification by default
    mockedAxios.post.mockImplementation((url) => {
      if (url.includes('/v1/rights/verify/')) {
        return Promise.resolve({
          data: {
            status: 'approved',
            message: 'Rights verified'
          }
        });
      }
      return Promise.reject(new Error('Unknown endpoint'));
    });
  });

  it('generates correct composite HFN', async () => {
    const registrationResponse = {
      data: {
        id: 'composite-1',
        hfn: 'C.001.001.001:G.POP.TSW.001+S.POP.PNK.001',
        friendlyName: 'C.001.001.001:G.POP.TSW.001+S.POP.PNK.001',
        name: 'C.001.001.001:G.POP.TSW.001+S.POP.PNK.001',
        layer: 'C',
        components: ['G.POP.TSW.001', 'S.POP.PNK.001']
      }
    };

    // Mock registration endpoint
    mockedAxios.post.mockImplementation((url) => {
      if (url.includes('/v1/rights/verify/')) {
        return Promise.resolve({
          data: { status: 'approved', message: 'Rights verified' }
        });
      }
      if (url === '/v1/asset/register') {
        return Promise.resolve(registrationResponse);
      }
      return Promise.reject(new Error('Unknown endpoint'));
    });

    render(
      <CompositeAssetSelection 
        onComponentsSelected={mockOnComponentsSelected}
        initialComponents={mockAssets}
      />
    );

    // Wait for components to load and validate
    await waitFor(() => {
      expect(screen.getByText('Selected Components (2)')).toBeInTheDocument();
    });

    // Click validate button
    const validateButton = screen.getByText('Validate');
    fireEvent.click(validateButton);

    // Wait for validation and register button to appear
    await waitFor(() => {
      expect(screen.getByText('Register')).toBeInTheDocument();
    });

    // Click register button
    const registerButton = screen.getByText('Register');
    fireEvent.click(registerButton);

    // Wait for registration to complete
    await waitFor(() => {
      expect(mockedAxios.post).toHaveBeenCalledWith('/v1/asset/register', 
        expect.objectContaining({
          layer: 'C',
          category: '001',
          subcategory: '001',
          sequential: '001',
          components: 'G.POP.TSW.001,S.POP.PNK.001',
          name: 'C.001.001.001:G.POP.TSW.001+S.POP.PNK.001',
          friendlyName: 'C.001.001.001:G.POP.TSW.001+S.POP.PNK.001'
        })
      );
    });

    // Verify success message
    await waitFor(() => {
      expect(mockedToast.success).toHaveBeenCalledWith(
        expect.stringContaining('Composite registered successfully')
      );
    });
  });

  it('handles HTTP 409 for duplicate HFN', async () => {
    // Create a proper Axios error object
    const duplicateError = new Error('Request failed with status code 409');
    (duplicateError as any).isAxiosError = true;
    (duplicateError as any).response = {
      status: 409,
      data: { message: 'HFN already exists' }
    };

    // Mock registration endpoint to return 409
    mockedAxios.post.mockImplementation((url) => {
      if (url.includes('/v1/rights/verify/')) {
        return Promise.resolve({
          data: { status: 'approved', message: 'Rights verified' }
        });
      }
      if (url === '/v1/asset/register') {
        return Promise.reject(duplicateError);
      }
      return Promise.reject(new Error('Unknown endpoint'));
    });

    render(
      <CompositeAssetSelection 
        onComponentsSelected={mockOnComponentsSelected}
        initialComponents={mockAssets}
      />
    );

    // Wait for components to load
    await waitFor(() => {
      expect(screen.getByText('Selected Components (2)')).toBeInTheDocument();
    });

    // Click validate button
    const validateButton = screen.getByText('Validate');
    fireEvent.click(validateButton);

    // Wait for register button to appear
    await waitFor(() => {
      expect(screen.getByText('Register')).toBeInTheDocument();
    });

    // Click register button
    const registerButton = screen.getByText('Register');
    fireEvent.click(registerButton);

    // Wait for error handling
    await waitFor(() => {
      expect(screen.getByText(/Registration Error:/)).toBeInTheDocument();
      expect(screen.getByText(/HFN conflict: A composite with this combination already exists/)).toBeInTheDocument();
    });

    // Verify error toast
    expect(mockedToast.error).toHaveBeenCalledWith(
      expect.stringContaining('HFN conflict')
    );
  });

  it('validates component compatibility correctly', () => {
    const incompatibleAsset: Asset = {
      ...mockAssets[0],
      id: 'asset-3',
      layer: 'X', // Invalid layer
      name: 'X.TEST.001',
      friendlyName: 'X.TEST.001'
    };

    render(
      <CompositeAssetSelection 
        onComponentsSelected={mockOnComponentsSelected}
        initialComponents={[...mockAssets, incompatibleAsset]}
      />
    );

    // Click validate button
    const validateButton = screen.getByText('Validate');
    fireEvent.click(validateButton);

    // Should show validation error
    expect(screen.getByText(/Validation Errors:/)).toBeInTheDocument();
    expect(screen.getByText(/incompatible layers/i)).toBeInTheDocument();
    
    // Register button should not appear
    expect(screen.queryByText('Register')).not.toBeInTheDocument();
  });

  it('requires minimum 2 components for validation', () => {
    render(
      <CompositeAssetSelection 
        onComponentsSelected={mockOnComponentsSelected}
        initialComponents={[mockAssets[0]]} // Only 1 component
      />
    );

    // Click validate button
    const validateButton = screen.getByText('Validate');
    fireEvent.click(validateButton);

    // Should show validation error about minimum components
    expect(screen.getByText(/Validation Errors:/)).toBeInTheDocument();
    expect(screen.getByText(/at least 2 components/i)).toBeInTheDocument();
  });

  it('includes components metadata in registration payload', async () => {
    // Mock successful registration
    mockedAxios.post.mockImplementation((url) => {
      if (url.includes('/v1/rights/verify/')) {
        return Promise.resolve({
          data: { status: 'approved', message: 'Rights verified' }
        });
      }
      if (url === '/v1/asset/register') {
        return Promise.resolve({
          data: {
            id: 'composite-1',
            hfn: 'C.001.001.001:G.POP.TSW.001+S.POP.PNK.001'
          }
        });
      }
      return Promise.reject(new Error('Unknown endpoint'));
    });

    render(
      <CompositeAssetSelection 
        onComponentsSelected={mockOnComponentsSelected}
        initialComponents={mockAssets}
      />
    );

    // Validate and register
    fireEvent.click(screen.getByText('Validate'));
    await waitFor(() => {
      expect(screen.getByText('Register')).toBeInTheDocument();
    });
    
    fireEvent.click(screen.getByText('Register'));

    // Verify metadata is included in registration payload
    await waitFor(() => {
      expect(mockedAxios.post).toHaveBeenCalledWith('/v1/asset/register',
        expect.objectContaining({
          metadata: expect.objectContaining({
            components: ['G.POP.TSW.001', 'S.POP.PNK.001'],
            componentCount: 2,
            createdFrom: 'CompositeAssetSelection'
          })
        })
      );
    });
  });

  // Step 5: Preview optimization tests
  it('generates preview in <2s', async () => {
    const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
    
    mockedAxios.post.mockImplementation((url) => {
      if (url.includes('/v1/rights/verify/')) {
        return Promise.resolve({
          data: { status: 'approved', message: 'Rights verified' }
        });
      }
      if (url === '/v1/asset/preview') {
        // Simulate fast preview generation (under 2s)
        return Promise.resolve({ 
          data: { previewUrl: 'http://preview.com/fast.mp4' } 
        });
      }
      return Promise.reject(new Error('Unknown endpoint'));
    });

    render(
      <CompositeAssetSelection 
        onComponentsSelected={mockOnComponentsSelected}
        initialComponents={mockAssets}
      />
    );

    // Click preview button
    const previewButton = screen.getByText('Preview');
    fireEvent.click(previewButton);

    // Wait for preview player to appear
    await waitFor(() => {
      expect(screen.getByTestId('preview-player')).toBeInTheDocument();
    });

    // Should not have logged any performance warnings
    expect(consoleSpy).not.toHaveBeenCalledWith(
      expect.stringContaining('exceeded 2s')
    );

    consoleSpy.mockRestore();
  });

  it('logs warning for slow preview', async () => {
    const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
    
    mockedAxios.post.mockImplementation((url) => {
      if (url.includes('/v1/rights/verify/')) {
        return Promise.resolve({
          data: { status: 'approved', message: 'Rights verified' }
        });
      }
      if (url === '/v1/asset/preview') {
        // Simulate slow preview generation (over 2s)
        return new Promise((resolve) => 
          setTimeout(() => resolve({ 
            data: { previewUrl: 'http://preview.com/slow.mp4' } 
          }), 2500) // 2.5 seconds
        );
      }
      return Promise.reject(new Error('Unknown endpoint'));
    });

    render(
      <CompositeAssetSelection 
        onComponentsSelected={mockOnComponentsSelected}
        initialComponents={mockAssets}
      />
    );

    // Click preview button
    const previewButton = screen.getByText('Preview');
    fireEvent.click(previewButton);

    // Wait for preview player to appear (with longer timeout for slow preview)
    await waitFor(() => {
      expect(screen.getByTestId('preview-player')).toBeInTheDocument();
    }, { timeout: 5000 });

    // Should have logged performance warning
    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('exceeded 2s target')
      );
    });

    consoleSpy.mockRestore();
  });

  it('includes performance optimization headers in preview request', async () => {
    mockedAxios.post.mockImplementation((url) => {
      if (url.includes('/v1/rights/verify/')) {
        return Promise.resolve({
          data: { status: 'approved', message: 'Rights verified' }
        });
      }
      if (url === '/v1/asset/preview') {
        return Promise.resolve({ 
          data: { previewUrl: 'http://preview.com/optimized.mp4' } 
        });
      }
      return Promise.reject(new Error('Unknown endpoint'));
    });

    render(
      <CompositeAssetSelection 
        onComponentsSelected={mockOnComponentsSelected}
        initialComponents={mockAssets}
      />
    );

    // Click preview button
    fireEvent.click(screen.getByText('Preview'));

    // Wait for request and verify optimization headers
    await waitFor(() => {
      expect(mockedAxios.post).toHaveBeenCalledWith(
        '/v1/asset/preview',
        expect.objectContaining({
          components: ['asset-1', 'asset-2'],
          optimization: expect.objectContaining({
            targetDuration: 2000,
            fastMode: true,
            resolution: '720p'
          })
        }),
        expect.objectContaining({
          headers: expect.objectContaining({
            'X-Performance-Target': '2000ms',
            'X-Component-Count': '2'
          })
        })
      );
    });
  });

  // Additional tests for Grok's recommendations
  it('handles network failures gracefully', async () => {
    const networkError = new Error('Network Error');
    (networkError as any).isAxiosError = true;
    (networkError as any).response = null; // No response = network failure

    mockedAxios.post.mockImplementation((url) => {
      if (url.includes('/v1/rights/verify/')) {
        return Promise.resolve({
          data: { status: 'approved', message: 'Rights verified' }
        });
      }
      if (url === '/v1/asset/register') {
        return Promise.reject(networkError);
      }
      return Promise.reject(new Error('Unknown endpoint'));
    });

    render(
      <CompositeAssetSelection 
        onComponentsSelected={mockOnComponentsSelected}
        initialComponents={mockAssets}
      />
    );

    // Validate and register
    fireEvent.click(screen.getByText('Validate'));
    await waitFor(() => {
      expect(screen.getByText('Register')).toBeInTheDocument();
    });
    
    fireEvent.click(screen.getByText('Register'));

    // Should handle network error gracefully
    await waitFor(() => {
      expect(screen.getByText(/Registration Error:/)).toBeInTheDocument();
      expect(screen.getByText(/Failed to register composite asset: Network Error/)).toBeInTheDocument();
    });
  });

  it('validates components with missing or invalid data', () => {
    const invalidAssets = [
      mockAssets[0], // Valid asset
      { ...mockAssets[1], id: 'invalid-layer-asset', name: 'Invalid Layer Asset', layer: null }, // Invalid layer with unique ID
      { ...mockAssets[0], id: 'empty-id-asset', name: 'Empty ID Asset', layer: 'G' }, // Valid layer, different ID  
      { ...mockAssets[1], id: 'invalid-layer-x', name: 'Invalid Layer X', layer: 'X' }, // Invalid layer value with unique ID
    ];

    render(
      <CompositeAssetSelection 
        onComponentsSelected={mockOnComponentsSelected}
        initialComponents={invalidAssets}
      />
    );

    // Click validate button
    fireEvent.click(screen.getByText('Validate'));

    // Should show validation errors for invalid components
    expect(screen.getByText(/Validation Errors:/)).toBeInTheDocument();
    expect(screen.getByText(/missing or invalid layer/i)).toBeInTheDocument();
    expect(screen.getByText(/incompatible layers/i)).toBeInTheDocument();
  });

  it('handles registration timeout errors', async () => {
    const timeoutError = new Error('timeout of 5000ms exceeded');
    (timeoutError as any).isAxiosError = true;
    (timeoutError as any).code = 'ECONNABORTED';

    mockedAxios.post.mockImplementation((url) => {
      if (url.includes('/v1/rights/verify/')) {
        return Promise.resolve({
          data: { status: 'approved', message: 'Rights verified' }
        });
      }
      if (url === '/v1/asset/register') {
        return Promise.reject(timeoutError);
      }
      return Promise.reject(new Error('Unknown endpoint'));
    });

    render(
      <CompositeAssetSelection 
        onComponentsSelected={mockOnComponentsSelected}
        initialComponents={mockAssets}
      />
    );

    // Validate and register
    fireEvent.click(screen.getByText('Validate'));
    await waitFor(() => {
      expect(screen.getByText('Register')).toBeInTheDocument();
    });
    
    fireEvent.click(screen.getByText('Register'));

    // Should handle timeout error appropriately
    await waitFor(() => {
      expect(screen.getByText(/Registration Error:/)).toBeInTheDocument();
    });
  });

  it('validates maximum component limit', () => {
    // Create 11 components (exceeds 10 limit)
    const tooManyAssets = Array.from({ length: 11 }, (_, i) => ({
      ...mockAssets[0],
      id: `asset-${i}`,
      name: `Asset-${i}`,
      friendlyName: `Asset-${i}`
    }));

    render(
      <CompositeAssetSelection 
        onComponentsSelected={mockOnComponentsSelected}
        initialComponents={tooManyAssets}
      />
    );

    // Click validate button
    fireEvent.click(screen.getByText('Validate'));

    // Should show error about too many components
    expect(screen.getByText(/Validation Errors:/)).toBeInTheDocument();
    expect(screen.getByText(/cannot have more than 10 components/i)).toBeInTheDocument();
  });

  it('displays rights validation warning', () => {
    render(
      <CompositeAssetSelection 
        onComponentsSelected={mockOnComponentsSelected}
        initialComponents={[]}
      />
    );

    // Should show rights validation warning
    expect(screen.getByText(/Rights Validation Notice:/)).toBeInTheDocument();
    expect(screen.getByText(/Rights verification is currently unavailable/)).toBeInTheDocument();
    expect(screen.getByText(/Clearity service endpoint.*is not yet implemented/)).toBeInTheDocument();
  });
});