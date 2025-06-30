# Step-by-Step Prompts for Claude Code to Implement the NNA Registry Service Frontend

Here are the step-by-step prompts you can use with Claude Code to implement the NNA Registry Service Frontend. Each prompt is designed to be clear, focused on a specific section, and ready to copy-paste.

## 1. Project Setup

### Prompt 1: Create React Application with Required Dependencies

```
I'm building the frontend for an NNA Registry Service. Please help me create a new React application with TypeScript and install the necessary dependencies. I need:

1. Command to create a new React app with TypeScript template
2. Commands to install:
   - React Router Dom
   - Material UI and icons
   - Axios
   - React Hook Form with Yup resolver
   - JWT-decode
   - Notistack
   - MUI Lab and Data Grid

Please provide the exact npm commands I should run.
```

### Prompt 2: Set up Folder Structure

```
I need to set up the folder structure for my NNA Registry Service frontend. Please provide the commands to create the following directory structure in my React project:

src/
├── api/              # API service functions
├── assets/           # Static assets (images, icons)
├── components/       # Reusable UI components
│   ├── common/       # Shared components (buttons, inputs)
│   ├── layout/       # Layout components (header, sidebar)
│   ├── asset/        # Asset-related components
│   └── auth/         # Authentication components
├── config/           # Configuration files
├── contexts/         # React context providers
├── hooks/            # Custom React hooks
├── pages/            # Page components
│   ├── assets/       # Asset management pages
│   ├── auth/         # Authentication pages
│   └── dashboard/    # Dashboard pages
├── types/            # TypeScript type definitions
└── utils/            # Utility functions

Please provide the mkdir commands needed to create this structure.
```

### Prompt 3: Configure Environment Variables

```
I need to set up environment variables for my NNA Registry Service frontend. Please create:

1. A .env file with:
   - REACT_APP_API_URL=http://localhost:3001
   - REACT_APP_NAME=NNA Registry Service

2. A .env.example file with the same content

3. Also, explain what to add to .gitignore to ensure the .env file is not committed to Git.
```

## 2. Authentication Implementation

### Prompt 4: Define Authentication Types

```
I need to create TypeScript type definitions for authentication in my NNA Registry Service. Please create a file called src/types/auth.ts with the following interfaces:

1. User - with userId, email, and role properties
2. LoginRequest - with email and password properties
3. RegisterRequest - with email and password properties
4. AuthResponse - with success, data (containing token), and metadata properties
5. ProfileResponse - with success, data (User), and metadata properties

Please provide the complete TypeScript code for these interfaces.
```

### Prompt 5: Create Authentication API Service

```
I need to create an authentication API service for my NNA Registry Service. Please implement a file called src/api/authService.ts that includes:

1. A function to configure axios with base URL and interceptors for JWT tokens
2. Functions for:
   - Register: to create a new user account (POST /auth/register)
   - Login: to authenticate a user and store the token in localStorage (POST /auth/login)
   - GetProfile: to get the current user profile (GET /auth/profile)
   - Logout: to remove the token from localStorage
   - IsAuthenticated: to check if the user is authenticated based on token presence

Please use the auth types from our previous step and provide error handling.
```

### Prompt 6: Create Authentication Context

```
I need to create an authentication context for my NNA Registry Service to manage user state. Please implement src/contexts/AuthContext.tsx with:

1. A context provider that stores and manages the authenticated user
2. Functions for login, register, and logout that use the authService
3. Loading state management for auth operations
4. Methods to check if user is authenticated and if user is an admin
5. A custom hook (useAuth) to use the context

The context should use the User type and authService from our previous steps, and include token parsing with jwt_decode.
```

### Prompt 7: Implement Login Page Component

```
I need to create a login page for my NNA Registry Service. Please implement src/pages/auth/LoginPage.tsx with:

1. A form with email and password fields using Material UI
2. Form validation
3. Integration with the useAuth hook for login functionality
4. Loading state and error handling
5. Redirect to dashboard on successful login
6. Link to the registration page

The component should use Material UI components including Container, Paper, Typography, TextField, Button, Alert, and CircularProgress.
```

## 3. Asset Types and Services

### Prompt 8: Define Asset Types

```
I need to create TypeScript type definitions for assets in my NNA Registry Service. Please create a file called src/types/asset.ts with the following interfaces:

1. Asset - with properties like _id, layer, category, subcategory, name, nna_address, gcpStorageUrl, source, tags, description, trainingData, rights, components, createdAt, updatedAt
2. CreateAssetDto - for asset creation requests
3. UpdateAssetDto - for asset update requests
4. SearchAssetParams - for search parameters
5. AssetResponse and AssetsResponse - for API responses
6. Layer taxonomy types (LayerInfo, Category, Subcategory, TaxonomyData)

Please provide the complete TypeScript code for these interfaces.
```

### Prompt 9: Create Asset API Service

```
I need to create an API service for asset management in my NNA Registry Service. Please implement a file called src/api/assetService.ts that includes functions for:

1. Create asset (with file upload)
2. Get assets (with search/filter)
3. Get asset by name
4. Update asset
5. Delete asset
6. Curate asset
7. Get asset image URL for display

The service should use the asset types from our previous step and the API client from the auth service.
```

### Prompt 10: Create Taxonomy Service

```
I need to create a taxonomy service for my NNA Registry Service. Please implement a file called src/api/taxonomyService.ts that:

1. Loads taxonomy data from the enriched_nna_layer_taxonomy_v1.2.json file
2. Provides functions to:
   - Get all layers
   - Get categories for a layer
   - Get subcategories for a category
   - Get the full taxonomy data

The service should use the taxonomy types from our asset types and provide proper error handling.
```

## 4. Layout and Navigation

### Prompt 11: Create Protected Route Component

```
I need to create a protected route component for my NNA Registry Service to restrict access to authenticated users. Please implement src/components/common/ProtectedRoute.tsx that:

1. Checks if the user is authenticated using the useAuth hook
2. Shows a loading indicator while checking authentication
3. Redirects to login if not authenticated
4. Has an option to require admin role
5. Uses React Router's Outlet to render child routes

Please provide the complete code for this component.
```

### Prompt 12: Create App Layout Component

```
I need to create the main application layout for my NNA Registry Service. Please implement src/components/layout/AppLayout.tsx that includes:

1. A responsive layout with Material UI
2. A top app bar with navigation and user menu
3. A side drawer that can be toggled open/closed
4. Navigation links to dashboard, asset registration, search, etc.
5. User menu with profile and logout options
6. Integration with useAuth hook for user information

The component should use Material UI components and React Router for navigation.
```

### Prompt 13: Create Routes Configuration

```
I need to set up routing for my NNA Registry Service. Please implement src/App.tsx with:

1. BrowserRouter setup
2. Routes for:
   - Public routes (login, register)
   - Protected routes (dashboard, profile, asset management)
   - Admin-only routes
   - Default route (redirect to dashboard)
3. SnackbarProvider for notifications
4. AuthProvider wrapper
5. Theme configuration with Material UI

Please provide the complete code for this setup using React Router v6.
```

## 5. Dashboard and Profile Pages

### Prompt 14: Create Dashboard Page

```
I need to create a dashboard page for my NNA Registry Service. Please implement src/pages/dashboard/DashboardPage.tsx that:

1. Shows a welcome message and overview
2. Displays quick action buttons for registering assets, searching, etc.
3. Shows a grid of recent assets (fetched from the API)
4. Has loading states and error handling
5. Uses Material UI components like Grid, Paper, Card, etc.

Please provide the complete code for this dashboard page.
```

### Prompt 15: Create Profile Page

```
I need to create a profile page for my NNA Registry Service. Please implement src/pages/profile/ProfilePage.tsx that:

1. Displays the user's profile information
2. Includes a form to change password
3. Shows user role (admin or regular user)
4. Has loading states and error handling
5. Uses Material UI components for the layout

Please provide the complete code for this profile page.
```

## 6. Asset Registration Implementation

### Prompt 16: Create Step Control Component

```
I need to create a step control component for my asset registration process. Please implement src/components/asset/StepControl.tsx that:

1. Displays a stepper with the current step
2. Shows back and next buttons
3. Handles step navigation
4. Has proper validation to prevent advancing without completing required fields
5. Shows a finish button on the last step

Please provide the complete code for this component using Material UI's Stepper.
```

### Prompt 17: Create Layer Selection Component

```
I need to create a component for selecting asset layers in my NNA Registry Service. Please implement src/components/asset/LayerSelection.tsx that:

1. Displays available layers (G, S, L, M, W, V, B, P) as selectable cards
2. Shows an icon and description for each layer
3. Highlights the selected layer
4. Fetches layer data from the taxonomy service
5. Has loading states and error handling

Please provide the complete code for this component.
```

### Prompt 18: Create Taxonomy Selection Component

```
I need to create a component for selecting asset categories and subcategories in my NNA Registry Service. Please implement src/components/asset/TaxonomySelection.tsx that:

1. Shows dropdown selectors for category and subcategory based on the selected layer
2. Updates subcategory options when category changes
3. Fetches data from the taxonomy service
4. Has loading states and error handling
5. Uses Material UI form components

Please provide the complete code for this component.
```

### Prompt 19: Create Metadata Form Component

```
I need to create a form component for asset metadata in my NNA Registry Service. Please implement src/components/asset/MetadataForm.tsx that:

1. Uses React Hook Form for form management
2. Includes fields for:
   - Description
   - Source
   - Tags (with autocomplete)
   - Layer-specific metadata (e.g., move speed for M layer)
   - Training data (optional section)
   - Rights information (optional section)
3. Has validation for required fields
4. Uses Material UI form components

Please provide the complete code for this component.
```

### Prompt 20: Create File Upload Component

```
I need to create a file upload component for my NNA Registry Service. Please implement src/components/asset/FileUpload.tsx that:

1. Supports drag-and-drop file uploads
2. Shows a preview of the uploaded file (image, audio, video, or document)
3. Validates file type against accepted types
4. Shows file information (name, size, type)
5. Allows removing the uploaded file
6. Uses Material UI components for the UI

Please provide the complete code for this component.
```

### Prompt 21: Create Review and Submit Component

```
I need to create a review and submit component for my asset registration process. Please implement src/components/asset/ReviewSubmit.tsx that:

1. Displays a summary of all the asset information entered
2. Shows the uploaded file preview
3. Provides buttons to edit each section
4. Includes a submit button with loading state
5. Uses Material UI components for the layout

Please provide the complete code for this component.
```

### Prompt 22: Create Registration Success Component

```
I need to create a success component to show after successful asset registration. Please implement src/components/asset/RegistrationSuccess.tsx that:

1. Shows a success message with animation or icon
2. Displays the registered asset details
3. Provides buttons to:
   - Register another asset
   - View the asset details
4. Uses Material UI components for the layout

Please provide the complete code for this component.
```

### Prompt 23: Implement Asset Registration Page

```
I need to create the main asset registration page for my NNA Registry Service. Please implement src/pages/assets/RegisterAssetPage.tsx that:

1. Manages the multi-step registration flow
2. Integrates all the step components we've created
3. Handles form state across steps
4. Submits the asset data and file to the API
5. Shows loading states and error handling
6. Navigates to success screen on successful registration

Please provide the complete code for this page.
```

## 7. Asset Search Implementation

### Prompt 24: Create Asset Search Component

```
I need to create an asset search component for my NNA Registry Service. Please implement src/components/search/AssetSearch.tsx that:

1. Provides a search bar for text search
2. Includes filter dropdowns for layer, category, and subcategory
3. Shows search results in a grid with pagination
4. Fetches results from the asset API
5. Has loading states and error handling
6. Uses Material UI components for the layout

Please provide the complete code for this component.
```

### Prompt 25: Create Asset Card Component

```
I need to create a component to display asset cards in search results. Please implement src/components/search/AssetCard.tsx that:

1. Shows asset thumbnail or type icon based on file type
2. Displays asset name, description, and taxonomy information
3. Shows tags
4. Links to the asset detail page
5. Has a visually appealing design using Material UI Card
6. Handles different asset types appropriately

Please provide the complete code for this component.
```

### Prompt 26: Create Asset Search Page

```
I need to create the main asset search page for my NNA Registry Service. Please implement src/pages/assets/SearchAssetsPage.tsx that:

1. Uses the AssetSearch component we created
2. Provides a page title and description
3. Uses Material UI Container for layout
4. Has proper spacing and margins

Please provide the complete code for this page.
```

### Prompt 27: Create Asset Detail Page

```
I need to create an asset detail page for my NNA Registry Service. Please implement src/pages/assets/AssetDetailPage.tsx that:

1. Fetches asset details by name from the URL parameter
2. Displays comprehensive asset information:
   - File/media preview
   - Metadata
   - Taxonomy information
   - Training data (if available)
   - Rights information (if available)
2. Provides edit and delete options for admins
3. Has loading states and error handling
4. Uses Material UI components for layout

Please provide the complete code for this page.
```

## 8. Authentication Flow Pages

### Prompt 28: Create Register Page

```
I need to create a registration page for my NNA Registry Service. Please implement src/pages/auth/RegisterPage.tsx that:

1. Has a form with email, password, and confirm password fields
2. Validates inputs (email format, password match, etc.)
3. Integrates with the useAuth hook for registration
4. Shows loading state and error messages
5. Redirects to dashboard on successful registration
6. Links back to login page
7. Uses Material UI components for layout

Please provide the complete code for this page.
```

## 9. Final Components

### Prompt 29: Create 404 Not Found Page

```
I need to create a 404 Not Found page for my NNA Registry Service. Please implement src/pages/NotFoundPage.tsx that:

1. Shows a clear "Page Not Found" message
2. Includes an appropriate icon
3. Provides a button to return to the home page
4. Uses Material UI components for layout

Please provide the complete code for this page.
```

### Prompt 30: Update Main App Component

```
I need to finalize the main App component for my NNA Registry Service. Please update src/App.tsx to:

1. Include all the routes we've created
2. Add the NotFoundPage for 404 routes
3. Configure the theme with Material UI ThemeProvider
4. Set up proper context providers (Auth, Snackbar)
5. Ensure all components are properly imported

Please provide the complete updated code for App.tsx.
```

### Prompt 31: Configure Build and Deployment

```
I'm ready to build and deploy my NNA Registry Service frontend. Please provide:

1. Updates needed for package.json scripts
2. Command to create a production build
3. Instructions for deploying to:
   - Static hosting (Netlify/Vercel)
   - Traditional web hosting
   - Google Cloud Storage
4. Instructions for environment configuration for production

Please provide detailed steps for each part.
```

By following these prompts in sequence with Claude Code, you should be able to build the complete frontend for the NNA Registry Service. Each prompt is focused on a specific component or functionality, making it easier to work through the implementation systematically.



I'll create step-by-step prompts for Claude Code to help you implement the asset upload functionality for the NNA Registry Service frontend. These prompts will guide you through enhancing the existing implementation to work with real assets instead of dummy data.

# Step-by-Step Prompts for Implementing Asset Upload Functionality

## Step 1: Update Asset Types and API Services

**Prompt for Claude Code:**

```
I need to update the asset types and API service for my NNA Registry Service frontend to handle real file uploads. Please help me enhance the following files:

1. First, update the `src/types/asset.ts` file to include proper file handling types:
- Add a FileUpload interface that tracks upload progress
- Update CreateAssetDto to handle file uploads
- Add proper response types for upload operations

2. Then update the `src/api/assetService.ts` file to:
- Add real file upload functionality with progress tracking
- Handle multipart form data properly
- Add error handling specific to file uploads
- Include the ability to cancel ongoing uploads

Please provide complete code for both files with proper TypeScript types. The file upload should include progress tracking and should work with the backend API endpoints we have.
```

## Step 2: Create File Upload Components

**Prompt for Claude Code:**

```
I need to create enhanced file upload components for the NNA Registry Service. Please provide complete code for the following components:

1. A `FileUploader.tsx` component in `src/components/common/FileUploader.tsx` that:
- Handles drag and drop file uploads
- Shows upload progress with a progress bar
- Validates file size and type
- Provides preview for image files
- Allows canceling uploads
- Shows appropriate error messages

2. A `FilePreview.tsx` component in `src/components/common/FilePreview.tsx` that:
- Displays appropriate preview based on file type (image, audio, video, other)
- Shows file metadata (name, size, type)
- Allows removing the file
- Provides playback controls for audio/video files

Both components should use Material UI and be fully typed with TypeScript. Make them reusable so they can be used in different parts of the application.
```

## Step 3: Enhance the Asset Registration Form

**Prompt for Claude Code:**

```
I need to enhance the Asset Registration form to handle real file uploads. Please update the following components:

1. First, update `src/components/asset/FileUpload.tsx` to:
- Use the new FileUploader component
- Handle upload states (idle, uploading, success, error)
- Track and report upload progress
- Provide meaningful error messages
- Allow retrying failed uploads

2. Then update `src/pages/assets/RegisterAssetPage.tsx` to:
- Handle form submission with actual file upload
- Properly manage upload states
- Show loading state during upload
- Display appropriate success/error messages
- Store uploaded file information for the final submission

Please provide the complete code for both files, ensuring they integrate well with the existing application structure and use the updated asset service.
```

## Step 4: Implement Upload Progress Tracking

**Prompt for Claude Code:**

```
I need to implement upload progress tracking for asset uploads in the NNA Registry Service. Please provide code for:

1. A custom hook called `useFileUpload` in `src/hooks/useFileUpload.ts` that:
- Manages file upload state (idle, uploading, success, error)
- Tracks upload progress percentage
- Handles upload cancellation
- Provides error handling
- Returns upload status, progress, and control functions

2. Update the `assetService.ts` file to:
- Use axios with upload progress tracking
- Support cancellation tokens
- Report progress through callbacks
- Handle errors properly

The hook should be reusable and the implementation should work with the existing API structure. Please provide complete TypeScript code with proper type definitions.
```

## Step 5: Enhance Asset Detail View with File Preview

**Prompt for Claude Code:**

```
I need to enhance the Asset Detail view to properly display uploaded files. Please update the following:

1. Update `src/pages/assets/AssetDetailsPage.tsx` to:
- Display appropriate file previews based on file type
- Add playback controls for audio/video files
- Show a download button for all file types
- Display file metadata (type, size, dimensions for images, duration for media)
- Handle loading states for file preview

2. Create a new component `src/components/asset/MediaPlayer.tsx` that:
- Renders appropriate player based on file type
- Provides controls for audio/video playback
- Handles different file formats
- Shows loading state while media is loading
- Provides fallback for unsupported formats

Please provide complete code for both files with proper TypeScript types and Material UI styling. Ensure the components work well on different screen sizes.
```

## Step 6: Implement Multi-file Upload for Training Data

**Prompt for Claude Code:**

```
I need to implement multi-file upload functionality for training data in the asset registration process. Please provide code for:

1. A new component `src/components/asset/TrainingDataUpload.tsx` that:
- Allows uploading multiple files for training data
- Categorizes uploads (prompts, images, videos)
- Shows a list of uploaded files with previews
- Allows removing individual files
- Tracks overall upload progress

2. Update `src/components/asset/MetadataForm.tsx` to:
- Integrate the new TrainingDataUpload component
- Handle the training data section properly
- Store uploaded training data files for form submission
- Validate training data requirements

Please provide complete code for both files with proper TypeScript typing and Material UI styling. Make sure the components integrate well with the existing form structure.
```

## Step 7: Implement Asset Update Functionality

**Prompt for Claude Code:**

```
I need to implement asset update functionality for the NNA Registry Service. Please provide code for:

1. Create a new page `src/pages/assets/UpdateAssetPage.tsx` that:
- Loads existing asset data
- Pre-fills the form with current asset data
- Allows updating metadata and taxonomy
- Optionally allows replacing the asset file
- Submits changes to the API

2. Update the `assetService.ts` to include:
- A function to fetch asset details for editing
- A function to update an existing asset
- Proper error handling for update operations
- Support for partial updates

3. Update the routing in `App.tsx` to:
- Add a route for the update page
- Ensure proper authorization checks

Please provide complete code for all files with proper TypeScript types and Material UI styling. Ensure the update functionality works seamlessly with the existing application.
```

## Step 8: Implement Asset Batch Upload

**Prompt for Claude Code:**

```
I need to implement batch upload functionality for assets in the NNA Registry Service. Please provide code for:

1. Create a new page `src/pages/assets/BatchUploadPage.tsx` that:
- Allows uploading multiple assets at once
- Provides a CSV template for batch metadata
- Supports drag-and-drop for multiple files
- Shows upload progress for each file
- Displays success/error status for each item

2. Create a supporting component `src/components/asset/BatchUploadTable.tsx` that:
- Displays a table of assets being uploaded
- Shows progress for each asset
- Indicates success or errors
- Allows retrying failed uploads
- Provides a summary of the batch upload

3. Update the `assetService.ts` to include:
- A function for batch upload
- Handling of CSV metadata
- Progress tracking for multiple files

Please provide complete code for all files with proper TypeScript typing and Material UI styling. Ensure the batch upload functionality is user-friendly and robust.
```

## Step 9: Add Drag-and-Drop Asset Organization

**Prompt for Claude Code:**

```
I need to implement a drag-and-drop interface for organizing assets in the NNA Registry Service. Please provide code for:

1. Create a new component `src/components/asset/AssetOrganizer.tsx` that:
- Shows assets in a grid or list view
- Allows dragging and dropping to organize assets
- Supports grouping assets by category/subcategory
- Provides a search filter
- Updates asset order/grouping via API

2. Create a new page `src/pages/assets/OrganizeAssetsPage.tsx` that:
- Uses the AssetOrganizer component
- Provides controls for different organization views
- Saves organization changes
- Shows success/error feedback

3. Update the `assetService.ts` to include:
- Functions to update asset order/grouping
- Batch update capabilities

Please provide complete code for all files with proper TypeScript typing and Material UI styling. Use react-beautiful-dnd or a similar library for the drag-and-drop functionality.
```

## Step 10: Implement Asset Versioning

**Prompt for Claude Code:**

```
I need to implement asset versioning functionality for the NNA Registry Service. Please provide code for:

1. Update the asset types in `src/types/asset.ts` to:
- Include version information
- Track version history
- Define version comparison interfaces

2. Create a new component `src/components/asset/VersionHistory.tsx` that:
- Displays asset version history
- Shows changes between versions
- Allows reverting to previous versions
- Displays version metadata (date, user, changes)

3. Update `src/pages/assets/AssetDetailsPage.tsx` to:
- Include the version history component
- Provide UI for creating new versions
- Show current version information

4. Update the `assetService.ts` to include:
- Functions to fetch version history
- Create new versions
- Revert to previous versions

Please provide complete code for all files with proper TypeScript typing and Material UI styling. Ensure the versioning functionality is intuitive and well-integrated.
```

## Step 11: Implement Asset Analytics Dashboard

**Prompt for Claude Code:**

```
I need to implement an analytics dashboard for assets in the NNA Registry Service. Please provide code for:

1. Create a new page `src/pages/dashboard/AssetAnalyticsDashboard.tsx` that:
- Shows usage statistics for assets
- Displays charts of asset views/downloads
- Provides filters by date range, asset type, etc.
- Shows top assets by usage
- Displays user interaction metrics

2. Create supporting components:
- `src/components/analytics/AssetUsageChart.tsx`
- `src/components/analytics/TopAssetsTable.tsx`
- `src/components/analytics/UsageMetricsCard.tsx`

3. Update the `assetService.ts` to include:
- Functions to fetch analytics data
- Support for different analytics queries

Please use recharts or a similar charting library for the visualizations. Provide complete code for all files with proper TypeScript typing and Material UI styling. Make sure the dashboard is responsive and user-friendly.
```

## Step 12: Implement Asset Recommendations

**Prompt for Claude Code:**

```
I need to implement asset recommendation functionality for the NNA Registry Service to connect with the AlgoRhythm service. Please provide code for:

1. Create a new service `src/api/recommendationService.ts` that:
- Fetches recommended assets based on various criteria
- Supports different recommendation types (similar assets, frequently used together, etc.)
- Handles error states and loading

2. Create a new component `src/components/asset/RecommendedAssets.tsx` that:
- Displays a list of recommended assets
- Shows why each asset is recommended
- Allows filtering recommendations
- Handles loading and empty states

3. Update `src/pages/assets/AssetDetailsPage.tsx` to:
- Include the RecommendedAssets component
- Pass the current asset for context

Please provide complete code for all files with proper TypeScript typing and Material UI styling. Ensure the recommendation functionality aligns with the AlgoRhythm service described in the documentation.
```

## Step 13: Enhance Search with Advanced Filters

**Prompt for Claude Code:**

```
I need to enhance the asset search functionality with advanced filters for the NNA Registry Service. Please provide code for:

1. Update `src/components/search/AssetSearch.tsx` to:
- Add advanced filter options (date range, file type, metadata fields)
- Support saving search filters
- Include sorting options
- Add a toggle between basic and advanced search
- Support complex queries with AND/OR conditions

2. Create a new component `src/components/search/AdvancedFilters.tsx` that:
- Provides a comprehensive filter interface
- Allows building complex search queries
- Supports date range selection
- Includes metadata field filtering

3. Update the `assetService.ts` to include:
- Enhanced search functionality
- Support for complex queries
- Saved searches

Please provide complete code for all files with proper TypeScript typing and Material UI styling. Make sure the advanced search is powerful yet user-friendly.
```

## Step 14: Implement Asset Collections

**Prompt for Claude Code:**

```
I need to implement asset collections functionality for the NNA Registry Service. Please provide code for:

1. Update the asset types in `src/types/asset.ts` to:
- Define collection interfaces
- Track collection membership
- Support collection metadata

2. Create a new service `src/api/collectionService.ts` that:
- Manages asset collections
- Handles CRUD operations for collections
- Manages assets within collections

3. Create a new page `src/pages/collections/CollectionsPage.tsx` that:
- Lists user's collections
- Allows creating and editing collections
- Shows collection contents

4. Create a supporting component `src/components/collection/CollectionGrid.tsx` that:
- Displays assets in a collection
- Allows adding/removing assets
- Supports reordering assets

5. Update routes in `App.tsx` for collection management

Please provide complete code for all files with proper TypeScript typing and Material UI styling. Ensure the collections functionality is intuitive and well-integrated.
```

## Step 15: Implement Asset Rights Management

**Prompt for Claude Code:**

```
I need to implement rights management functionality for assets in the NNA Registry Service to connect with the Clearity service. Please provide code for:

1. Update asset types in `src/types/asset.ts` to:
- Include detailed rights information
- Track usage rights and limitations
- Support rights verification

2. Create a new service `src/api/rightsService.ts` that:
- Verifies usage rights for assets
- Tracks rights usage
- Manages rights clearance

3. Create a new component `src/components/asset/RightsManagement.tsx` that:
- Displays rights information for an asset
- Shows usage limitations
- Provides interfaces for rights clearance
- Displays verification status

4. Update `src/pages/assets/AssetDetailsPage.tsx` to:
- Include the RightsManagement component
- Show rights status prominently

Please provide complete code for all files with proper TypeScript typing and Material UI styling. Ensure the rights management functionality aligns with the Clearity service described in the documentation.
```



## NNA Dual Addressing System Implementation

**Prompt for Claude Code:**

I need to implement the NNA dual addressing system for the NNA Registry Service frontend. This should generate both human-friendly names and machine-friendly addresses based on the taxonomy selection. Please provide code for:



1. Create a new utility file `src/utils/nnaAddressing.ts` that:

- Generates human-friendly names (e.g., G.POP.TSW.001) based on layer, category, and subcategory selections

- Creates machine-friendly addresses with numeric codes (e.g., G.003.042.001)

- Provides functions to convert between the two formats

- Includes validation for both name formats

- Handles sequential numbering generation



2. Update the `src/api/taxonomyService.ts` to:

- Include methods to get the numeric code for a category/subcategory

- Add mapping functions between alphabetic codes and numeric codes

- Provide next available sequential number for a given taxonomy path



3. Update `src/components/asset/TaxonomySelection.tsx` to:

- Preview the generated NNA name as the user selects taxonomy options

- Show both human-friendly and machine-friendly formats

- Validate that the generated name is unique

- Handle sequential numbering appropriately



4. Create a new component `src/components/asset/NNAAddressPreview.tsx` that:

- Displays the generated NNA address in both formats

- Shows a visual explanation of each part of the address

- Updates in real-time as taxonomy selections change



Please provide complete code for all files with proper TypeScript typing. Include comprehensive error handling and validation to ensure the NNA addressing system works correctly.



## Training Data Collection Implementation

**Prompt for Claude Code:**

I need to implement a comprehensive training data collection section for asset registration in the NNA Registry Service. This should allow uploading multiple types of training data including text prompts, reference images, and reference video URLs. Please provide code for:



1. Update `src/types/asset.ts` to include detailed training data types:

- Text prompts (to be saved as .txt files)

- Reference images (file uploads)

- Reference video URLs (URL inputs)

- Training dataset metadata



2. Create a new component `src/components/asset/TrainingDataCollection.tsx` that:

- Provides separate sections for different training data types

- For text prompts:

* Includes a multi-line text input

* Allows adding multiple prompts

* Shows a preview of how they'll be saved

- For reference images:

* Supports multiple image uploads

* Shows image previews

* Allows organizing and removing images

- For reference video URLs:

* Validates video URLs

* Allows adding multiple URLs

* Optionally shows video previews if supported



3. Update `src/components/asset/MetadataForm.tsx` to:

- Integrate the TrainingDataCollection component

- Store training data in the form state

- Validate training data requirements

- Format training data for submission



4. Update `src/api/assetService.ts` to:

- Handle the submission of text prompts as files

- Process reference images correctly

- Store video URLs appropriately

- Associate all training data with the main asset



Please provide complete code for all files with proper TypeScript typing and Material UI styling. Ensure the training data collection is intuitive, provides good feedback, and properly prepares the data for backend processing.



## Combined Implementation for Both Features

If you'd prefer a more comprehensive approach that addresses both features together, here's a prompt that covers both:

**Prompt for Claude Code:**

I need to implement both the NNA dual addressing system and comprehensive training data collection for the NNA Registry Service frontend. Please provide code for:



1. NNA Dual Addressing System:

- Create `src/utils/nnaAddressing.ts` to generate both human-friendly names (e.g., G.POP.TSW.001) and machine-friendly addresses (e.g., G.003.042.001)

- Update taxonomy selection to generate and preview addresses in real-time

- Handle sequential numbering and uniqueness validation

- Create a visual preview component for the NNA address



2. Training Data Collection:

- Update asset types to include detailed training data (text prompts as .txt files, image uploads, video URLs)

- Create a comprehensive training data collection component with separate sections for each type

- Include validation and preview for all training data types

- Prepare training data for submission to the backend



3. Integration of Both Features:

- Update the asset registration form to include both features

- Ensure the NNA addressing is tied to the form state

- Connect training data collection to the asset being registered

- Update asset service to handle submission of both features correctly



Please provide complete code for all necessary files with proper TypeScript typing and Material UI styling. Include detailed comments explaining how each part works and how they integrate together.



### Prompt for Claude Code to Fix NNA Addressing Issue

I need to fix the NNA dual addressing system in my implementation. As you can see in my screenshot, both the human-friendly format and machine-friendly format are showing the same numeric codes (S.001.002.001). According to the NNA Framework specifications, the human-friendly name should use three-letter alphabetic codes.

Please update the `src/utils/nnaAddressing.ts` file (or the relevant file handling the address generation) to:

1. Generate the human-friendly name in the format `S.POP.DVA.001` using:

- The layer code (single letter)

- The category code (three uppercase letters, e.g., POP)

- The subcategory code (three uppercase letters, e.g., DVA)

- The sequential number (three digits with padding)

2. Keep the machine-friendly format as `S.001.002.001` using:

- The layer code (single letter)

- The category number (three digits with padding)

- The subcategory number (three digits with padding)

- The sequential number (three digits with padding)

3. Create proper mapping functions that:

- Convert between alphabetic codes and numeric codes

- Extract the correct alphabetic codes from the category and subcategory names

- Use the actual codes from the taxonomy data rather than just using the numeric IDs

4. Update the NNA address preview component to properly display the different formats

Here's how the code should derive the alphabetic codes:

- For "Pop (001)", the alphabetic code should be "POP"

- For "Pop_Diva_Female_Stars (002)", the alphabetic code should be "DVA" (or some appropriate 3-letter code)

If needed, create a helper function that can generate 3-letter codes from longer names (e.g., extracting first letters of words or syllables).

Please provide the complete updated code to fix this issue.



1. The auto-generated NNA name field shows placeholder text instead of the actual human-friendly name that should be generated from the previous selections (S.POP.DVA.001)
1. The Training Data section is minimal and doesn't include the comprehensive collection options for text prompts, reference images, and video URLs as specified in the requirements

Let me provide prompts to fix both issues:

## Prompt 1: Fix the Auto-generated NNA Name Field

I need to fix the issue with the auto-generated NNA name not displaying properly in the Asset Details form. As shown in my screenshot, the field shows placeholder text "Auto-generated NNA Name" instead of the actual generated human-friendly name (which should be S.POP.DVA.001 based on my previous selections).

Please update the asset details form to:

1. Pass the generated human-friendly NNA name from the taxonomy selection step to the asset details form

2. Display the actual human-friendly name in the "Asset Name" field rather than just showing placeholder text

3. Ensure this field is read-only since it's auto-generated but clearly shows the actual value

4. Update any relevant components and state management to maintain the NNA name throughout the form workflow

Please provide the updated code for the components involved in this flow, focusing on how the name gets passed between steps and displayed in the form.



## Prompt 2: Enhance the Training Data Section

I need to enhance the Training Data section in the asset registration form. Currently, it only shows a checkbox saying "This asset can be used for training AI models" but according to our requirements, it should collect:

- Text prompts that are saved as .txt files

- Reference image uploads

- Reference video URLs



Please update the Training Data section to:



1. Create a comprehensive expandable section for training data that appears when the checkbox is checked



2. Include three distinct subsections:

- Text Prompts: A text area where users can enter multiple prompts, with explanation that these will be saved as .txt files

- Reference Images: A file upload area for images with preview capabilities

- Reference Videos: URL input fields for video references (not file uploads)



3. Add appropriate validation:

- Text prompts should not be empty if provided

- Image uploads should validate file type and size

- Video URLs should be valid URLs to YouTube, Vimeo, or other video platforms



4. Properly format this data to be included with the asset submission



5. Include clear instructions and tooltips explaining how this training data will be used



Please provide the complete updated code for the Training Data component and any other files that need to be modified to support this functionality.



I understand the issue now. Let's look at the core requirement from the NNA whitepaper regarding the dual addressing system formatting.

The key points from the NNA Framework whitepaper are:

1. Human-Friendly Names should use **exactly three-character alphabetic codes** for categories and subcategories:
    - Format: `[Layer].[CategoryCode].[SubCategoryCode].[Sequential]`
    - Example: `G.POP.TSW.001` (not G.POP.BASE.002 or S · POP · BASE · 002)
1. NNA Addresses (machine-friendly) should use **three-digit numeric codes**:
    - Format: `[Layer].[CategoryNum].[SubCategoryNum].[Sequential]`
    - Example: `G.003.042.001`
1. The registry maintains a 1:1 mapping between these formats.

### Here's a prompt for Claude Code to fix this formatting issue:

I need to fix the formatting of the NNA human-friendly name in my implementation. According to the NNA Framework whitepaper, the human-friendly name should consist of:

- A single-letter layer code

- A exactly THREE-character category code (uppercase)

- A exactly THREE-character subcategory code (uppercase)

- A three-digit sequential number



For example: G.POP.TSW.001 (not "G · POP · BASE · 002" with spaces or longer codes)



The current implementation is showing "S · POP · BASE · 002" with dots replaced by bullets and using category/subcategory names that are longer than 3 characters.



Please update the relevant code to:



1. Generate proper THREE-character codes for categories and subcategories:

- If a predefined 3-character code exists in the taxonomy data, use it

- Otherwise, derive a 3-character code algorithmically:

* For single words: Use first three letters (e.g., "Pop" → "POP")

* For multi-word names: Use first letter of each word, then fill with first word letters

(e.g., "Pop_Diva_Female" → "PDF", "Base" → "BAS")

- Ensure ALL codes are EXACTLY 3 characters, uppercase

2. Format the human-friendly name as:

- `[Layer].[CategoryCode].[SubCategoryCode].[Sequential]`

- Use actual periods (not bullets or other separators)

- No spaces between components

- Example: "S.POP.BAS.002"

3. Update the display in both the preview and the Asset Details form

4. Create a proper mapping function between these 3-character codes and the 3-digit numeric codes used in the machine-friendly format



Please provide the updated code that fixes this formatting issue, focusing on generating proper 3-character codes and correctly formatting the human-friendly name.



Given that there can be 17576 possible three-character codes (26 x 26 x 26) but only 1000 three-digit codes and the registry service should maintain the list of the 1000 three-character category and sub-category codes for each layer to ensure there are no duplicate three-character codes within a category or a sub-category and there total number does not exceed than 1000. Does the prompt above captures this understanding?



You've highlighted a critical aspect of the NNA addressing system that my previous prompt didn't fully address. The constraint that there can only be 1000 three-digit numeric codes (000-999) despite 17,576 possible three-character alphabetic codes (26³) means the registry must carefully manage these mappings.

### Let me revise the prompt to better capture this understanding:

I need to fix the NNA dual addressing system in my implementation to properly handle the mapping constraints between human-friendly names and machine-friendly addresses. According to the NNA Framework whitepaper:



1. Human-friendly names use THREE-character alphabetic codes: [Layer].[CategoryCode].[SubCategoryCode].[Sequential]

Example: G.POP.TSW.001

2. Machine-friendly addresses use THREE-digit numeric codes (000-999): [Layer].[CategoryNum].[SubCategoryNum].[Sequential]

Example: G.003.042.001

3. Most importantly, while there are 17,576 possible three-character codes (26³), the system is constrained to map to only 1,000 three-digit codes (000-999).



Currently, my implementation is showing "S · POP · BASE · 002" with incorrect formatting and not properly maintaining the category/subcategory code registry.

Please update the code to:

1. Implement a proper registry service that:

- Maintains a list of registered three-character codes for each layer

- Maps each three-character code to a unique three-digit code (000-999)

- Ensures no duplicate three-character codes within a layer

- Validates that the total number of codes does not exceed 1000 per layer

- Uses predefined mappings from the taxonomy data when available



2. Generate human-friendly names with:

- EXACTLY three uppercase characters for category and subcategory codes

- Proper period separators (not bullets)

- Example: "S.POP.BAS.002"



3. For new category/subcategory codes not in the predefined registry:

- Generate a three-character code using the algorithm (first letters of words or first three letters)

- Verify the generated code isn't already registered

- If a conflict exists, generate an alternative (e.g., add a number or modify letters)

- Register the new code with the next available three-digit number



4. Add validation to prevent exceeding the 1000 code limit per layer



Please provide the updated code with a proper registry implementation that manages these constraints and correctly formats the human-friendly names.
