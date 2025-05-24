# NNA Registry Service - Frontend Architecture

## Technology Stack

The frontend application is built with:

- **React 18** with TypeScript for UI components
- **Material UI** (MUI) for component library
- **React Router** for navigation
- **React Hook Form** for form handling and validation
- **Axios** for API requests
- **Context API** for state management

## Architectural Overview

The frontend follows a component-based architecture with clear separation of concerns:

1. **Presentation Layer**: React components for UI
2. **Data Access Layer**: Services and contexts for data management
3. **State Management**: Context API and local component state
4. **API Integration**: Axios-based services

## Component Structure

Components are organized into the following categories:

### Pages
Full page components that represent different routes in the application:
- `RegisterAssetPage`: Asset registration workflow
- `DashboardPage`: Dashboard for asset management
- `SearchAssetsPage`: Search interface for assets
- `AssetDetailPage`: Detail view for a single asset
- `LoginPage`: Authentication page

### Components
Reusable UI components organized by functionality:

- **Asset Components**
  - `TaxonomySelector`: Layer, category, subcategory selection
  - `FileUpload`: File upload component
  - `ReviewSubmit`: Review and submit form
  - `NNAAddressPreview`: Preview of generated addresses

- **Layout Components**
  - `MainLayout`: Main layout with header, sidebar, and content area

- **Common Components**
  - `ErrorBoundary`: Error handling component
  - `FeedbackMessage`: User feedback displays
  - `BackendStatus`: Backend connectivity indicator

### Context Providers

State management through React Context:

- `TaxonomyContext`: Manages taxonomy selection state
- `AuthContext`: Handles authentication state
- `FeedbackContext`: Manages user feedback messages
- `ErrorContext`: Handles error state

### Custom Hooks

- `useTaxonomy`: Access taxonomy data and operations
- `useAuth`: Authentication operations
- `useFileUpload`: File upload operations
- `useFormUISync`: Form UI synchronization

### Services

- `assetService`: Asset registration and management
- `taxonomyService`: Taxonomy data access
- `authService`: Authentication operations
- `simpleTaxonomyService`: Basic taxonomy operations
- `enhancedTaxonomyService`: Advanced taxonomy operations with error handling

## Data Flow

1. User interacts with a UI component
2. Component calls appropriate hook/context methods
3. Hook/context executes business logic via services
4. Services make API calls to the backend
5. Results update state in context/component
6. UI re-renders with updated data

## Key Architectural Patterns

### Provider Pattern
The application uses React Context with providers to manage global state:

```jsx
<TaxonomyProvider>
  <AuthProvider>
    <FeedbackProvider>
      <App />
    </FeedbackProvider>
  </AuthProvider>
</TaxonomyProvider>
```

### Composition Pattern
Components are composed from smaller, specialized components:

```jsx
<RegisterAssetPage>
  <TaxonomySelector />
  <FileUpload />
  <ReviewSubmit />
</RegisterAssetPage>
```

### Error Boundary Pattern
Error boundaries catch and handle errors at component level:

```jsx
<ErrorBoundary>
  <TaxonomySelector />
</ErrorBoundary>
```

### Custom Hook Pattern
Custom hooks encapsulate reusable logic:

```jsx
const { 
  selectedLayer, 
  selectedCategory, 
  selectedSubcategory,
  selectLayer,
  selectCategory,
  selectSubcategory
} = useTaxonomy();
```

## Taxonomy System Architecture

The taxonomy system has a layered architecture:

1. **UI Components**: `TaxonomySelector`, `LayerGrid`, `CategoryGrid`, `SubcategoryGrid`
2. **Data Provider**: `TaxonomyDataProvider` handles data loading and error recovery
3. **Service Layer**: `enhancedTaxonomyService` provides taxonomy data with error handling
4. **State Management**: `useTaxonomy` hook provides access to taxonomy data and operations
5. **Data Sources**: Flattened taxonomy data from JSON and in-memory lookups

## File Upload Architecture

The file upload system uses:

1. **UI Component**: `FileUpload` handles file selection and preview
2. **Service**: `assetService.uploadFile` manages file upload to backend
3. **State Management**: Local component state and form context
4. **Validation**: File type and size validation

## Form Architecture

Forms use React Hook Form with:

1. **Form Provider**: `FormProvider` from React Hook Form
2. **Validation**: Yup schema validation
3. **Field Registration**: `register` function for field registration
4. **Form Submission**: `handleSubmit` for form submission
5. **Error Handling**: Field-level error display