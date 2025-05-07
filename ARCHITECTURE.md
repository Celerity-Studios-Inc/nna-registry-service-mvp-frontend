# NNA Registry Frontend Architecture

## Overview

The NNA Registry Service is a frontend application built with React, TypeScript, and Material UI that allows users to register, categorize, search, and manage Neural Network Assets (NNAs). This document provides an overview of the application structure, key components, and architectural patterns.

## Application Structure

The application follows a standard React application structure:

```
/src
  /api           - API service modules for backend communication
  /assets        - Static assets including taxonomy data
  /components    - React components organized by feature
    /asset       - Asset-related components
    /common      - Shared/common components
    /layout      - Layout components
    /search      - Search-related components
  /contexts      - React context providers
  /hooks         - Custom React hooks
  /pages         - Page components (top-level route components)
  /types         - TypeScript type definitions
  /utils         - Utility functions
```

## Key Concepts

### NNA (naming, Numbering, and Addressing) Assets (NNAs)

NNAs are the core entities in the system. They represent registered neural network assets with the following characteristics:
- Unique NNA address in both human-friendly and machine-friendly formats
- Associated with a layer, category, and subcategory (taxonomy)
- May contain uploaded files, metadata, and rights information

### Dual Addressing System

The NNA Registry uses a dual addressing system:

1. **Human-Friendly Names (HFN)**: e.g., `G.POP.TSW.001`
   - Formatted as `Layer.Category.Subcategory.Sequential`
   - Uses alphabetic codes that are human-readable

2. **Machine-Friendly Addresses (MFA)**: e.g., `G.001.042.001`
   - Formatted as `Layer.NumericCategory.NumericSubcategory.Sequential`
   - Uses numeric codes for machine optimization

### Taxonomy

The taxonomy system is hierarchical with the following levels:

1. **Layers**: Top level (e.g., G, S, L, M, W)
   - G (General) - For general assets
   - S (Style) - For style-related assets
   - L (Look) - For visual appearance assets
   - M (Movement) - For motion/animation assets
   - W (World View) - For environment/world assets

2. **Categories**: Within each layer (e.g., POP in G.POP.TSW.001)
   - Groups related subcategories

3. **Subcategories**: Specific asset types (e.g., TSW in G.POP.TSW.001)
   - Most specific classification level

4. **Sequential Number**: Unique identifier within a subcategory (e.g., 001)

## Key Components

### Taxonomy Selection
`TaxonomySelection.tsx` handles the selection of layer, category, and subcategory, generating the NNA address.

### Asset Registration
`RegisterAssetPage.tsx` orchestrates the asset registration flow:
1. Layer selection
2. Category/subcategory selection
3. File upload
4. Rights data entry
5. Review and submission

### Asset Search
`AssetSearch.tsx` provides search functionality with filtering options based on taxonomy and metadata.

### Asset Card
`AssetCard.tsx` displays asset information in a card format for search results and listings.

### File Upload
`FileUpload.tsx` handles file uploading with progress tracking, preview, and validation.

## Services

### TaxonomyService
Manages the taxonomy data and provides methods for retrieving layers, categories, and subcategories.

### AssetService
Handles asset CRUD operations, search, and organization.

### AuthService
Manages authentication and user profile information.

### AssetRegistryService
Client-side mock service for tracking registered assets during development.

## State Management

The application uses React Context for global state management:

1. **AuthContext**: User authentication state
2. **NotificationsContext**: Task notifications and pending items

## Development Setup

The application can run in two modes:

1. **Mock API mode**: Uses mock data and simulated API responses for development
2. **Real API mode**: Connects to backend API for production

## Error Handling

Error handling is managed through:
- Try/catch blocks in service methods
- Error state in components
- Alert components for user feedback

## Styling

The application uses Material UI components with a custom theme defined in App.tsx.

## Routing

React Router is used for navigation with the following main routes:
- `/login` - Login page
- `/register` - User registration page
- `/dashboard` - Dashboard home page
- `/register-asset` - Asset registration flow
- `/search-assets` - Asset search page
- `/assets/:id` - Asset detail page

## Future Enhancements

Potential areas for future enhancement:
- Enhanced analytics for asset usage
- Batch upload capabilities
- Advanced rights management
- Integration with AI/ML platforms for asset utilization