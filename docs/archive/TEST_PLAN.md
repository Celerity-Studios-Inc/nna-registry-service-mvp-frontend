# NNA Registry Frontend Test Plan

## Overview

This document outlines the testing strategy for the NNA Registry Frontend application. It covers unit testing, integration testing, and end-to-end testing for various components and features of the application.

## Test Environment Setup

### Requirements

- Jest for test framework
- React Testing Library for component testing
- Jest-DOM for additional matchers
- Mock Service Worker (MSW) for API mocking
- Jest-Axe for accessibility testing

### Configuration

- Configure Jest to use TypeScript
- Set up test utilities for common testing tasks
- Create mock implementations for API services
- Set up test fixtures for common data structures

## Unit Testing

### 1. Component Tests

#### 1.1. LayerSelection Component

Test cases:
- Renders correctly with provided layers
- Displays loading state when loading is true
- Shows error alert when error is present
- Calls onLayerSelect when a layer is clicked
- Calls onLayerSelect with isDoubleClick=true when a layer is double-clicked
- Highlights the selected layer

#### 1.2. TaxonomySelection Component

Test cases:
- Renders correctly with initial state
- Shows info alert when no layer is selected
- Populates categories dropdown when layer is selected
- Populates subcategories dropdown when category is selected
- Calls onCategorySelect when a category is selected
- Calls onSubcategorySelect when a subcategory is selected
- Displays NNA Address Preview when both category and subcategory are selected
- Calls onNNAAddressChange with correct parameters when selection is complete

#### 1.3. FileUpload Component

Test cases:
- Renders correctly with initial state
- Allows file selection via input
- Shows preview of selected files
- Handles multiple file selection
- Shows upload progress
- Prevents selecting more than maxFiles
- Shows error when inappropriate file is selected
- Calls onFilesChange when files are selected

#### 1.4. ReviewSubmit Component

Test cases:
- Renders correctly with provided asset data
- Shows warning when required fields are missing
- Shows file preview for image files
- Shows appropriate icon for non-image files
- Displays file information correctly
- Shows error alert when error is provided
- Disables submit button when isSubmitting is true
- Calls onSubmit when submit button is clicked
- Calls onEditStep with correct step index when edit buttons are clicked
- Shows back and submit buttons in the same horizontal row

#### 1.5. TrainingDataCollection Component

Test cases:
- Renders correctly with initial state
- Allows adding and removing prompts
- Allows adding and removing images
- Allows adding and removing videos
- Allows updating documentation
- Calls onChange with updated data when changes are made

### 2. Service Tests

#### 2.1. assetService Tests

Test cases:
- getAssets returns paginated assets
- getAssetById returns asset with specified ID
- uploadFile handles file upload correctly
- uploadFile reports progress correctly
- createAsset creates asset with correct data
- checkDuplicateAsset correctly identifies duplicates with different confidence levels
- Error handling for all methods

#### 2.2. taxonomyService Tests

Test cases:
- getLayers returns all available layers
- getCategories returns categories for specified layer
- getSubcategories returns subcategories for specified category
- getTaxonomyPath returns correct path for given inputs
- getSequentialNumber returns unique sequential number
- Error handling for all methods

### 3. Hook Tests

#### 3.1. useFileUpload Hook

Test cases:
- Initializes with empty files array
- Adds files correctly
- Removes files correctly
- Handles upload progress updates
- Handles upload completion
- Handles upload errors

### 4. Context Tests

#### 4.1. AuthContext

Test cases:
- Provides authentication state to children
- login method sets user and token
- logout method clears user and token
- isAuthenticated returns correct value based on token
- getToken returns the current token

#### 4.2. NotificationsContext

Test cases:
- Provides notifications state to children
- addNotification adds notification to state
- removeNotification removes notification from state
- Updates notification status correctly

## Integration Tests

### 1. Registration Flow Tests

Test cases:
- Complete registration flow works end-to-end
- Form data persists between steps
- Validation prevents progression with invalid data
- Training data flow works correctly for T layer
- Success page displays correct information after submission

### 2. Form State Management Tests

Test cases:
- Form state is preserved when navigating between steps
- Form state is cleared when reset is called
- Default values are set correctly

### 3. API Integration Tests

Test cases:
- API calls are made with correct parameters
- API responses are handled correctly
- Error responses are handled gracefully

## End-to-End Tests

### 1. User Journeys

Test cases:
- User can register, login, and access dashboard
- User can register a new asset
- User can search for assets
- User can view asset details
- User can edit asset metadata

## Accessibility Testing

- Test all components with jest-axe
- Ensure all interactive elements are keyboard accessible
- Verify correct aria attributes are used
- Check color contrast ratios

## Test Coverage Goals

- Components: 90%+ coverage
- Services: 90%+ coverage
- Hooks: 95%+ coverage
- Contexts: 95%+ coverage
- Overall: 85%+ coverage

## Test Implementation Process

1. Start with unit tests for individual components
2. Implement service and hook tests
3. Add integration tests for multi-step flows
4. Implement end-to-end tests for critical user journeys
5. Add accessibility tests

## Test File Organization

- Component tests should be co-located with components
- Service tests should be in `/src/api/__tests__/`
- Hook tests should be in `/src/hooks/__tests__/`
- Context tests should be in `/src/contexts/__tests__/`
- Integration tests should be in `/src/__tests__/integration/`
- End-to-end tests should be in `/src/__tests__/e2e/`

## Mock Implementations

- Create mock implementations for all API services
- Use fixtures for common data structures
- Mock browser APIs as needed (e.g., localStorage)

## Example Test Structure

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { ReviewSubmit } from './ReviewSubmit';

describe('ReviewSubmit Component', () => {
  const mockAssetData = {
    name: 'Test Asset',
    description: 'Test Description',
    layer: 'G',
    layerName: 'Songs',
    categoryCode: 'CAT',
    categoryName: 'Category',
    subcategoryCode: 'SUB',
    subcategoryName: 'Subcategory',
    hfn: 'G.CAT.SUB.001',
    mfa: '0.123.456.001',
    sequential: '001',
    files: [new File(['test'], 'test.jpg', { type: 'image/jpeg' })],
    uploadedFiles: [
      {
        filename: 'test.jpg',
        url: 'http://example.com/test.jpg',
        size: 1024,
        mimeType: 'image/jpeg',
        originalName: 'test.jpg',
      },
    ],
    tags: ['tag1', 'tag2'],
  };

  const mockProps = {
    assetData: mockAssetData,
    onEditStep: jest.fn(),
    loading: false,
    error: null,
    onSubmit: jest.fn(),
    isSubmitting: false,
  };

  test('renders correctly with provided asset data', () => {
    render(<ReviewSubmit {...mockProps} />);
    
    expect(screen.getByText('Review Asset Details')).toBeInTheDocument();
    expect(screen.getByText('Test Asset')).toBeInTheDocument();
    expect(screen.getByText('Test Description')).toBeInTheDocument();
    expect(screen.getByText('G.CAT.SUB.001')).toBeInTheDocument();
    expect(screen.getByText('0.123.456.001')).toBeInTheDocument();
    expect(screen.getByText('Songs (G)')).toBeInTheDocument();
    expect(screen.getByText('Category (CAT)')).toBeInTheDocument();
    expect(screen.getByText('Subcategory (SUB)')).toBeInTheDocument();
    expect(screen.getByText('test.jpg')).toBeInTheDocument();
    expect(screen.getByText('tag1')).toBeInTheDocument();
    expect(screen.getByText('tag2')).toBeInTheDocument();
  });

  test('calls onEditStep when edit button is clicked', () => {
    render(<ReviewSubmit {...mockProps} />);
    
    // Find edit buttons and click them
    const editButtons = screen.getAllByRole('button', { name: /edit/i });
    fireEvent.click(editButtons[0]);
    
    expect(mockProps.onEditStep).toHaveBeenCalled();
  });

  test('calls onSubmit when submit button is clicked', () => {
    render(<ReviewSubmit {...mockProps} />);
    
    const submitButton = screen.getByRole('button', { name: /submit asset/i });
    fireEvent.click(submitButton);
    
    expect(mockProps.onSubmit).toHaveBeenCalled();
  });

  test('shows back and submit buttons in the same row', () => {
    render(<ReviewSubmit {...mockProps} />);
    
    const backButton = screen.getByRole('button', { name: /back/i });
    const submitButton = screen.getByRole('button', { name: /submit asset/i });
    
    // Both buttons should be contained within the same parent element
    const parentElement = backButton.closest('div');
    expect(parentElement).toContainElement(submitButton);
    
    // The parent should have a display flex style
    expect(parentElement).toHaveStyle('display: flex');
  });
});
```

## Test Documentation

- Document any assumptions made in tests
- Document any mocks or fixtures used
- Document any test utility functions
- Document test coverage results

## Continuous Integration

- Run tests on every pull request
- Run tests on every push to main branch
- Generate and save test coverage reports
- Fail builds if coverage falls below thresholds