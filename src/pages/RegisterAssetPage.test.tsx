import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import RegisterAssetPage from './RegisterAssetPage';
import assetService from '../api/assetService';
import taxonomyService from '../api/taxonomyService';

expect.extend(toHaveNoViolations);

// Mock the assetService
jest.mock('../api/assetService', () => ({
  uploadFile: jest.fn(),
  createAsset: jest.fn(),
  checkDuplicateAsset: jest.fn(),
}));

// Mock the useAuth hook
jest.mock('../hooks/useAuth', () => ({
  useAuth: () => ({
    isAuthenticated: true,
    user: { id: '1', username: 'testuser' },
  }),
}));

// Mock localStorage and sessionStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
};

const mockSessionStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
};

Object.defineProperty(window, 'localStorage', { value: mockLocalStorage });
Object.defineProperty(window, 'sessionStorage', { value: mockSessionStorage });

// Mock data
const mockLayer = {
  code: 'M',
  name: 'Model',
  description: 'Model layer',
};

const mockCategory = {
  code: 'CV',
  name: 'Computer Vision',
  description: 'Computer Vision category',
};

const mockSubcategory = {
  code: 'OD',
  name: 'Object Detection',
  description: 'Object Detection subcategory',
  numericCode: '001',
};

const mockFile = new File(['test content'], 'test.jpg', { type: 'image/jpeg' });

// Mock taxonomyService.getLayers to return mock layers
jest.mock('../api/taxonomyService', () => ({
  getLayers: () => [
    { code: 'M', name: 'Model', description: 'Model layer', numericCode: 1 },
    { code: 'T', name: 'Training', description: 'Training layer', numericCode: 2 },
  ],
}));

describe('RegisterAssetPage Component', () => {
  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();
    
    // Reset localStorage/sessionStorage mocks
    mockLocalStorage.getItem.mockReturnValue(null);
    mockSessionStorage.getItem.mockReturnValue(null);
    
    // Mock successful API responses
    (assetService.uploadFile as jest.Mock).mockResolvedValue({
      response: {
        filename: 'test.jpg',
        url: 'http://example.com/test.jpg',
        size: 1024,
        mimeType: 'image/jpeg',
      },
    });
    
    (assetService.createAsset as jest.Mock).mockResolvedValue({
      id: '1',
      name: 'Test Asset',
      layer: 'M',
      categoryCode: 'CV',
      subcategoryCode: 'OD',
    });
    
    (assetService.checkDuplicateAsset as jest.Mock).mockResolvedValue(null);
  });

  it('renders the initial step correctly', () => {
    render(<RegisterAssetPage />);
    
    expect(screen.getByText('Register New Asset')).toBeInTheDocument();
    expect(screen.getByText('Select Layer')).toBeInTheDocument();
  });

  it('handles step navigation correctly', async () => {
    render(<RegisterAssetPage />);
    // Start at step 0 (Layer Selection)
    expect(screen.getByText('Select Layer')).toBeInTheDocument();
    // Mock layer selection using a function matcher
    const layerCard = screen.getAllByText((content, element) =>
      !!element?.textContent?.includes('Model')
    )[0];
    fireEvent.click(layerCard);
    // Click Next
    const nextButton = screen.getByText('Next');
    fireEvent.click(nextButton);
    // Should be at step 1 (Taxonomy Selection)
    expect(screen.getByText('Choose Taxonomy')).toBeInTheDocument();
  });

  it('validates required fields before proceeding', async () => {
    render(<RegisterAssetPage />);
    
    // Try to proceed without selecting a layer
    const nextButton = screen.getByText('Next');
    fireEvent.click(nextButton);
    
    // Should show error
    expect(screen.getByText('Please select a layer')).toBeInTheDocument();
  });

  it('handles file upload correctly', async () => {
    render(<RegisterAssetPage />);
    // Navigate to file upload step
    const layerCard = screen.getAllByText((content, element) =>
      !!element?.textContent?.includes('Model')
    )[0];
    fireEvent.click(layerCard);
    fireEvent.click(screen.getByText('Next'));
    // Mock file selection
    const fileInput = screen.getByLabelText(/upload files/i);
    fireEvent.change(fileInput, { target: { files: [mockFile] } });
    // Wait for upload to complete
    await waitFor(() => {
      expect(assetService.uploadFile).toHaveBeenCalledWith(mockFile);
    });
  });

  it('handles duplicate asset detection', async () => {
    // Mock duplicate detection
    (assetService.checkDuplicateAsset as jest.Mock).mockResolvedValue({
      asset: {
        id: '2',
        name: 'Similar Asset',
      },
      file: mockFile,
      message: 'Similar asset found',
      confidence: 'high',
    });
    render(<RegisterAssetPage />);
    // Navigate to file upload step
    const layerCard = screen.getAllByText((content, element) =>
      !!element?.textContent?.includes('Model')
    )[0];
    fireEvent.click(layerCard);
    fireEvent.click(screen.getByText('Next'));
    // Upload file
    const fileInput = screen.getAllByLabelText(/upload files/i)[0];
    fireEvent.change(fileInput, { target: { files: [mockFile] } });
    // Should show duplicate warning
    await waitFor(() => {
      expect(screen.getByText(/duplicate/i)).toBeInTheDocument();
    });
  });

  it('handles training layer flow correctly', async () => {
    render(<RegisterAssetPage />);
    // Select training layer
    const layerCard = screen.getByText('Training');
    fireEvent.click(layerCard);
    fireEvent.click(screen.getByText('Next'));
    // Should show training data collection
    expect(screen.getAllByText('Training Data')[0]).toBeInTheDocument();
  });

  it('handles form submission correctly', async () => {
    render(<RegisterAssetPage />);
    // Select layer
    const layerCard = screen.getByText('Model');
    fireEvent.click(layerCard);
    fireEvent.click(screen.getByText('Next'));
    // Upload file
    const fileInput = screen.getAllByLabelText(/upload files/i)[0];
    fireEvent.change(fileInput, { target: { files: [mockFile] } });
    // Fill asset details
    const nameInput = screen.getByLabelText(/name/i);
    fireEvent.change(nameInput, { target: { value: 'Test Asset' } });
    const descriptionInput = screen.getByLabelText(/description/i);
    fireEvent.change(descriptionInput, { target: { value: 'Test Description' } });
    // Submit form
    fireEvent.click(screen.getByText('Submit'));
    // Should show success message
    await waitFor(() => {
      expect(screen.getByText(/success/i)).toBeInTheDocument();
    });
  });

  it('shows success page after submission', async () => {
    render(<RegisterAssetPage />);
    // Select layer
    const layerCard = screen.getByText('Model');
    fireEvent.click(layerCard);
    fireEvent.click(screen.getByText('Next'));
    // Upload file
    const fileInput = screen.getAllByLabelText(/upload files/i)[0];
    fireEvent.change(fileInput, { target: { files: [mockFile] } });
    const nameInput = screen.getByLabelText(/name/i);
    fireEvent.change(nameInput, { target: { value: 'Test Asset' } });
    const descriptionInput = screen.getByLabelText(/description/i);
    fireEvent.change(descriptionInput, { target: { value: 'Test Description' } });
    // Submit form
    fireEvent.click(screen.getByText('Submit'));
    // Should show success page
    await waitFor(() => {
      expect(screen.getByText(/success/i)).toBeInTheDocument();
    });
  });

  it('meets accessibility requirements', async () => {
    const { container } = render(<RegisterAssetPage />);
    // Ensure heading levels increase by one
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
}); 