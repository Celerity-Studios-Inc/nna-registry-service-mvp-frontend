# NNA Registry Frontend - Codebase Review and Test Implementation Guide

## Project Overview

The NNA Registry Frontend is a React TypeScript application for registering and managing Neural Network Architecture (NNA) assets. The application provides a multi-step registration process for various types of assets, categorized by layers, and implements the NNA addressing system (HFN/MFA) for unique asset identification.

### Key Technologies

- **React 18** with **TypeScript**
- **Material UI** (v5) for UI components and styling
- **React Router** (v6) for navigation
- **React Hook Form** with **Yup** for form validation
- **Axios** for API communication
- **Jest** and **React Testing Library** for testing

## Application Structure

### Core Feature Areas

1. **Asset Registration Flow** - Multi-step form for registering new assets with the NNA Registry
2. **Taxonomy Management** - Layer, category, subcategory selection with NNA address generation
3. **File Management** - File upload, preview, and metadata handling
4. **Training Data Support** - Special flow for training data assets
5. **Authentication** - User login/registration with JWT token management

### Component Organization

- `/src/api/` - API service layer
- `/src/components/` - Reusable UI components organized by feature area
- `/src/contexts/` - React context providers (auth, notifications)
- `/src/hooks/` - Custom React hooks
- `/src/pages/` - Page-level components
- `/src/types/` - TypeScript interfaces and types
- `/src/utils/` - Utility functions

## Focus Areas for Code Review

### 1. Asset Registration Flow

The application implements a multi-step asset registration process in `RegisterAssetPage.tsx`:

1. Layer Selection
2. Taxonomy Selection (Category/Subcategory)
3. File Upload and Asset Details
4. (Conditional) Training Data Collection
5. Review & Submit

Recent changes have improved the Review & Submit page UI/UX:
- Relocated the NNA Address card under Asset Files card
- Added file preview functionality
- Aligned Back and Submit buttons horizontally

### 2. Component Architecture

Review the component architecture, focusing on:

- Component composition and reusability
- State management approach
- Prop passing and data flow
- TypeScript implementation
- Error handling and loading states

### 3. API Integration

The application uses a service layer to communicate with the backend:

- Currently uses mock implementations for development
- Services encapsulate API logic with proper error handling
- Uses TypeScript interfaces for request/response types

### 4. Form Validation and Error Handling

The registration flow implements form validation:

- Yup schema validation
- Form state management with React Hook Form
- Real-time validation feedback
- Step progression validation
- API-level validation handling

## Testing Strategy

### Unit Testing Focus Areas

1. **Component Tests**
   - Render tests for UI components
   - Event handling tests for interactive components
   - Conditional rendering tests

2. **Form Validation Tests**
   - Schema validation tests
   - Form submission tests
   - Error handling tests

3. **Service Layer Tests**
   - API call tests (with mocked responses)
   - Error handling tests
   - Data transformation tests

4. **Hook Tests**
   - Custom hook behavior testing
   - State management testing

### Integration Test Focus Areas

1. **Multi-step Form Flow**
   - Complete registration flow testing
   - Conditional logic testing (e.g., training layer flow)
   - Form submission testing

2. **Feature Integration Tests**
   - Asset registration + viewing
   - NNA address generation and validation
   - File upload and preview

### Test Setup Guidelines

1. Use Jest and React Testing Library
2. Mock API calls using Jest mock functions
3. Create test utilities for common testing tasks
4. Use test-ids for component selection
5. Test both success and error paths

## Current Implementation Notes

### Implemented Components

1. **Registration Flow Components**
   - `LayerSelection.tsx`: Card-based UI for selecting asset layers
   - `TaxonomySelection.tsx`: Selection for categories and subcategories
   - `FileUpload.tsx`: File upload with progress tracking
   - `TrainingDataCollection.tsx`: For training data assets
   - `ReviewSubmit.tsx`: Final review before submission

2. **Context Providers**
   - `AuthContext.tsx`: User authentication state management
   - `NotificationsContext.tsx`: System notifications management

3. **Service Layer**
   - `assetService.ts`: Asset CRUD operations
   - `taxonomyService.ts`: Taxonomy data retrieval
   - `nnaRegistryService.ts`: NNA address generation and validation

### Recently Modified Files

1. `/src/components/asset/ReviewSubmit.tsx` - Layout improvements
2. `/src/pages/RegisterAssetPage.tsx` - Navigation flow improvements

## Known Mocked Areas

The application currently uses mock implementations for:

1. API responses in assetService
2. File uploads
3. NNA address uniqueness validation
4. Asset registry for duplicate detection

## Implementation Tasks for Testing

1. **Setup Test Environment**
   - Configure Jest properly
   - Create test utilities
   - Set up mock implementations

2. **Component Tests**
   - Unit tests for all key components
   - Snapshot tests for UI consistency
   - Edge case testing (empty states, error states)

3. **Integration Tests**
   - Multi-step form flow tests
   - Form state persistence tests
   - Form validation tests

4. **Mock Service Tests**
   - Test mock implementations
   - Test error handling
   - Test edge cases

## Key Files for Test Implementation

1. Component Tests:
   - `/src/components/asset/LayerSelection.test.tsx`
   - `/src/components/asset/TaxonomySelection.test.tsx`
   - `/src/components/asset/FileUpload.test.tsx`
   - `/src/components/asset/ReviewSubmit.test.tsx`

2. Page Tests:
   - `/src/pages/RegisterAssetPage.test.tsx`

3. Service Tests:
   - `/src/api/assetService.test.ts`
   - `/src/api/taxonomyService.test.ts`

4. Hook Tests:
   - `/src/hooks/useFileUpload.test.ts`

## Implementation Strategy

1. Start with unit tests for individual components
2. Move on to integration tests for multi-step flows
3. Create mock implementations for services
4. Test error handling and edge cases
5. Add snapshot tests for UI consistency

## NNA Registry Specific Concepts

1. **NNA Address System**
   - Human Friendly Name (HFN): Format `L.CAT.SUB.SEQ`
   - Machine Friendly Address (MFA): Format `0.000.000.000`
   - Sequential numbering for uniqueness

2. **Asset Layer System**
   - G: Songs (Generator layer)
   - S: Stars (Scorer layer)
   - L: Looks (Visual layer)
   - M: Moves (Motion layer)
   - W: Worlds (World layer)
   - B: Branded (Branded content)
   - P: Personalize (Personalization layer)
   - T: Training Data (Training data assets)
   - C: Composite (Composite assets)
   - R: Rights (Rights management)

3. **Taxonomy Hierarchy**
   - Layer → Category → Subcategory → Sequential
   - Each level has both human-readable and machine codes

## Test Coverage Goals

1. **Core Components**: 90%+ coverage
2. **API Services**: 90%+ coverage
3. **Utility Functions**: 95%+ coverage
4. **Page Components**: 80%+ coverage
5. **Integration Flows**: Key user journeys fully covered

## Deliverables

1. Comprehensive test suite covering all key components
2. Documentation of testing approach
3. Documentation of any discovered issues
4. Recommendations for code quality improvements
5. Performance optimization suggestions