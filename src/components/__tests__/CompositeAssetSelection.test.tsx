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
    const duplicateError = {
      response: {
        status: 409,
        data: { message: 'HFN already exists' }
      }
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
      expect(screen.getByText(/HFN conflict/)).toBeInTheDocument();
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
});