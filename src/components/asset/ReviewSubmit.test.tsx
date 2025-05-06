import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import ReviewSubmit from './ReviewSubmit';
import { FileUploadResponse } from '../../types/asset.types';

// Extend expect with jest-axe matchers
expect.extend(toHaveNoViolations);

// Mock data for testing
const mockAssetData = {
  name: 'Test Asset',
  description: 'Test Description',
  layer: 'M',
  layerName: 'Model',
  categoryCode: 'CV',
  categoryName: 'Computer Vision',
  subcategoryCode: 'OD',
  subcategoryName: 'Object Detection',
  hfn: 'Model-CV-OD-001',
  mfa: 'M-CV-OD-001',
  sequential: '001',
  files: [
    new File(['test content'], 'test.jpg', { type: 'image/jpeg' }),
    new File(['test content'], 'test.pdf', { type: 'application/pdf' }),
  ],
  uploadedFiles: [
    {
      filename: 'test.jpg',
      url: 'http://example.com/test.jpg',
      size: 1024,
      mimeType: 'image/jpeg',
      originalName: 'test.jpg',
    },
  ] as FileUploadResponse[],
  tags: ['test', 'example'],
};

// Mock functions
const mockOnEditStep = jest.fn();
const mockOnSubmit = jest.fn();

describe('ReviewSubmit Component', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    
    // Mock URL.createObjectURL
    URL.createObjectURL = jest.fn(() => 'mock-url');
  });

  afterEach(() => {
    // Clean up URL.createObjectURL mock
    if (typeof URL.createObjectURL === 'function' && 'mockRestore' in URL.createObjectURL) {
      (URL.createObjectURL as any).mockRestore();
    }
  });

  it('renders correctly with complete asset data', () => {
    render(
      <ReviewSubmit
        assetData={mockAssetData}
        onEditStep={mockOnEditStep}
        onSubmit={mockOnSubmit}
      />
    );

    // Check for main sections
    expect(screen.getByText('Review Asset Details')).toBeInTheDocument();
    expect(screen.getByText('Asset Information')).toBeInTheDocument();
    expect(screen.getByText('Taxonomy Information')).toBeInTheDocument();
    expect(screen.getAllByText('NNA Address').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('Asset Files')).toBeInTheDocument();

    // Check for asset details
    expect(screen.getByText('Test Asset')).toBeInTheDocument();
    expect(screen.getByText('Test Description')).toBeInTheDocument();
    expect(screen.getByText('Model (M)')).toBeInTheDocument();
    expect(screen.getByText('Computer Vision (CV)')).toBeInTheDocument();
    expect(screen.getByText('Object Detection (OD)')).toBeInTheDocument();

    // Check for NNA address
    expect(screen.getAllByText('Model-CV-OD-001')[0]).toBeInTheDocument();
    expect(screen.getAllByText('M-CV-OD-001')[0]).toBeInTheDocument();
    expect(screen.getAllByText('001')[0]).toBeInTheDocument();

    // Check for tags
    expect(screen.getByText('test')).toBeInTheDocument();
    expect(screen.getByText('example')).toBeInTheDocument();
  });

  it('shows warning when required fields are missing', () => {
    const incompleteData = {
      ...mockAssetData,
      name: '',
      files: [],
    };

    render(
      <ReviewSubmit
        assetData={incompleteData}
        onEditStep={mockOnEditStep}
        onSubmit={mockOnSubmit}
      />
    );

    expect(screen.getByText('Some required information is missing. Please complete all required fields.')).toBeInTheDocument();
    expect(screen.getByText('No files have been uploaded.')).toBeInTheDocument();
  });

  it('handles file preview correctly for different file types', () => {
    render(
      <ReviewSubmit
        assetData={mockAssetData}
        onEditStep={mockOnEditStep}
        onSubmit={mockOnSubmit}
      />
    );

    // Check if image preview is rendered
    const imagePreview = screen.getByAltText('test.jpg');
    expect(imagePreview).toBeInTheDocument();
    expect(imagePreview).toHaveAttribute('src', 'mock-url');

    // Check if file list shows correct status
    expect(screen.getByText('test.jpg')).toBeInTheDocument();
    expect(screen.getByText('test.pdf')).toBeInTheDocument();
    expect(screen.getByText('Uploaded')).toBeInTheDocument();
    expect(screen.getByText('Pending')).toBeInTheDocument();
  });

  it('handles edit step navigation correctly', () => {
    render(
      <ReviewSubmit
        assetData={mockAssetData}
        onEditStep={mockOnEditStep}
        onSubmit={mockOnSubmit}
      />
    );

    // Click edit buttons by aria-label
    fireEvent.click(screen.getByLabelText('Edit Asset Information'));
    fireEvent.click(screen.getByLabelText('Edit Taxonomy Information'));
    fireEvent.click(screen.getAllByLabelText('Edit NNA Address')[0]);
    fireEvent.click(screen.getAllByLabelText('Edit Asset Files')[0]);

    // Check if onEditStep was called with correct step numbers
    expect(mockOnEditStep).toHaveBeenCalledTimes(4); // One for each section
    expect(mockOnEditStep).toHaveBeenCalledWith(2); // For asset info and files
    expect(mockOnEditStep).toHaveBeenCalledWith(1); // For taxonomy and NNA address
  });

  it('handles submit button correctly', async () => {
    render(
      <ReviewSubmit
        assetData={mockAssetData}
        onEditStep={mockOnEditStep}
        onSubmit={mockOnSubmit}
      />
    );

    // Check if submit button is enabled and click it
    const submitButton = screen.getByRole('button', { name: /submit asset/i });
    expect(submitButton).toBeEnabled();
    fireEvent.click(submitButton);

    // Check if onSubmit was called
    expect(mockOnSubmit).toHaveBeenCalledTimes(1);
  });

  it('disables submit button when submitting', () => {
    render(
      <ReviewSubmit
        assetData={mockAssetData}
        onEditStep={mockOnEditStep}
        onSubmit={mockOnSubmit}
        isSubmitting={true}
      />
    );

    const submitButton = screen.getByRole('button', { name: /submitting/i });
    expect(submitButton).toBeDisabled();
  });

  it('shows error message when provided', () => {
    const errorMessage = 'Test error message';
    render(
      <ReviewSubmit
        assetData={mockAssetData}
        onEditStep={mockOnEditStep}
        onSubmit={mockOnSubmit}
        error={errorMessage}
      />
    );

    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });

  it('handles back button navigation correctly', () => {
    render(
      <ReviewSubmit
        assetData={mockAssetData}
        onEditStep={mockOnEditStep}
        onSubmit={mockOnSubmit}
      />
    );

    const backButton = screen.getByRole('button', { name: /back/i });
    fireEvent.click(backButton);

    expect(mockOnEditStep).toHaveBeenCalledWith(2);
  });

  it('meets accessibility requirements', async () => {
    const { container } = render(
      <ReviewSubmit
        assetData={mockAssetData}
        onEditStep={mockOnEditStep}
        onSubmit={mockOnSubmit}
      />
    );

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
}); 