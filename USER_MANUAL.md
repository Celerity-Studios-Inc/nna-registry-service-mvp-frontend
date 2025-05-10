# NNA Registry Service Frontend - User Manual

**Version**: 1.0.0  
**Last Updated**: May 9, 2025

## Table of Contents

1. [Introduction](#introduction)
2. [Getting Started](#getting-started)
   - [Accessing the Application](#accessing-the-application)
   - [User Authentication](#user-authentication)
3. [Asset Registration](#asset-registration)
   - [Step 1: Layer Selection](#step-1-layer-selection)
   - [Step 2: Taxonomy Selection](#step-2-taxonomy-selection)
   - [Step 3: File Upload and Metadata](#step-3-file-upload-and-metadata)
   - [Step 4: Training Data (For T Layer)](#step-4-training-data-for-t-layer)
   - [Step 4: Component Selection (For C Layer)](#step-4-component-selection-for-c-layer)
   - [Step 5: Review and Submit](#step-5-review-and-submit)
4. [Asset Search and Management](#asset-search-and-management)
   - [Searching for Assets](#searching-for-assets)
   - [Asset Details View](#asset-details-view)
5. [Understanding NNA Addresses](#understanding-nna-addresses)
   - [Human-Friendly Names (HFN)](#human-friendly-names-hfn)
   - [Machine-Friendly Addresses (MFA)](#machine-friendly-addresses-mfa)
6. [Special Layer Types](#special-layer-types)
   - [Training Data Assets (T)](#training-data-assets-t)
   - [Composite Assets (C)](#composite-assets-c)
   - [Personalized Assets (P)](#personalized-assets-p)
   - [Branded Assets (B)](#branded-assets-b)
   - [Rights Assets (R)](#rights-assets-r)
7. [Troubleshooting](#troubleshooting)
   - [Common Issues](#common-issues)
   - [Error Messages](#error-messages)
   - [Support Contacts](#support-contacts)

## Introduction

The NNA Registry Service is a platform for managing digital assets within the Naming, Numbering, and Addressing (NNA) Framework. It enables users to register, categorize, and retrieve digital assets according to a hierarchical taxonomy, supporting a dual addressing system with Human-Friendly Names and Machine-Friendly Addresses.

This frontend application provides an intuitive interface for content creators and administrators to interact with the NNA Registry Service, uploading assets, assigning taxonomy categories, and generating NNA addresses.

## Getting Started

### Accessing the Application

To access the NNA Registry Service frontend:

1. Navigate to the application URL: `https://nna-registry.reviz.dev/`
2. The application will load and display the login screen.

### User Authentication

To authenticate with the NNA Registry Service:

1. On the login screen, enter your credentials:
   - Email: Your registered email address
   - Password: Your secure password
2. Click "Login" to authenticate.
3. If authentication is successful, you will be redirected to the dashboard.

**Note**: During the MVP phase, you may see a "Use Demo Mode" option which allows access with sample data if the backend is unavailable.

## Asset Registration

The asset registration process guides you through selecting a taxonomy, uploading files, and submitting assets for registration. Follow these steps to register a new asset:

### Step 1: Layer Selection

1. From the dashboard, click "Register New Asset."
2. You will see a grid of available layers. Select the appropriate layer for your asset:
   - **G - Songs**: For music tracks and audio assets
   - **S - Stars**: For virtual avatars and performers
   - **L - Looks**: For wardrobe and styling assets
   - **M - Moves**: For choreography and dance assets
   - **W - Worlds**: For environmental and backdrop assets
   - **B - Branded**: For premium branded product placements
   - **P - Personalize**: For user-uploaded customizations
   - **T - Training_Data**: For AI training datasets
   - **C - Composites**: For aggregated multi-layer assets
   - **R - Rights**: For rights management assets

3. Click on your chosen layer to proceed to the next step.

### Step 2: Taxonomy Selection

1. After selecting a layer, you'll need to choose a category and subcategory for your asset:
   - **Category**: Major classifications within a layer (e.g., "POP" in the Songs layer)
   - **Subcategory**: Specific types within a category (e.g., "KPO" for K-Pop within "POP")

2. For each selection, you'll see both the human-friendly code (3-letter alphabetic) and the machine-friendly code (3-digit numeric).

3. Once you select a category and subcategory, the system will display a preview of your asset's NNA address (both Human-Friendly Name and Machine-Friendly Address).

4. Click "Next" to proceed to file upload.

### Step 3: File Upload and Metadata

1. In the File Upload step, you can:
   - Drag and drop files onto the upload area
   - Click "Browse Files" to select files from your device

2. Select the appropriate **Source** for your asset from the dropdown:
   - **ReViz**: Assets created by or for ReViz
   - **Original**: Original content created by you
   - **Licensed**: Content licensed from third parties
   - **External**: Content from external sources

3. After uploading files, provide additional metadata:
   - **Name**: A descriptive name for your asset
   - **Description**: Detailed information about the asset
   - **Tags**: Keywords related to your asset (press Enter after each tag)

4. The application may show you a preview of your uploaded file if it's a supported format (image, audio, video, etc.).

5. Click "Next" to proceed.

### Step 4: Training Data (For T Layer)

If you selected the "T - Training_Data" layer, you'll see an additional step for training data collection:

1. Upload prompts, images, and videos used to train AI models.
2. Organize your training data into categories.
3. Add descriptive tags to help with searchability.
4. Provide documentation about how the training data should be used.

### Step 4: Component Selection (For C Layer)

If you selected the "C - Composites" layer, you'll see an additional step for component selection:

1. Search for existing assets to include as components.
2. Select assets from different layers to combine into a composite.
3. Review the selected components before proceeding.

### Step 5: Review and Submit

1. Review all the information you've provided:
   - Layer, category, and subcategory selections
   - NNA addresses (HFN and MFA)
   - File information
   - Metadata (name, description, source, tags)
   - Component assets (for Composite layer)
   - Training data (for Training Data layer)

2. If you need to edit any information, click the "Edit" button next to the respective section.

3. Once you're satisfied with the information, click "Submit Asset" to register your asset.

4. After successful submission, you'll see a confirmation screen with your new asset's details and NNA addresses.

## Asset Search and Management

### Searching for Assets

1. From the dashboard, click "Search Assets" or use the search bar at the top of the page.

2. In the search interface, you can:
   - Enter keywords in the search box
   - Filter by layer, category, and subcategory
   - Filter by date range, tags, or other metadata
   - Sort results by various criteria

3. Click "Search" to execute your query.

4. Search results will display assets matching your criteria, showing previews, names, and NNA addresses.

### Asset Details View

1. Click on any asset in the search results to view its details.

2. The Asset Details page shows:
   - Asset preview
   - NNA addresses (HFN and MFA)
   - Metadata (name, description, source, tags)
   - File information
   - Version history
   - Related assets

3. From this page, you can:
   - Download the asset files
   - View asset statistics
   - Edit asset metadata (if you have permission)
   - Manage asset versions

## Understanding NNA Addresses

The NNA Framework uses a dual addressing system to provide both human-friendly and machine-friendly identifiers for assets.

### Human-Friendly Names (HFN)

Human-Friendly Names use alphabetic codes for easy recognition and memory:

- **Format**: `[Layer].[CategoryCode].[SubCategoryCode].[Sequential]`
- **Example**: `S.POP.KPO.001` (Star layer, Pop category, K-Pop subcategory, first asset)

Special formats exist for certain layers:
- **Branded (B)**: `B.[Layer].[Category].[Subcategory].[Sequential].[Brand]`
- **Personalize (P)**: `P.[Layer].[Category].[Sequential].[Type]`
- **Training_Data (T)**: `T.[Layer].[Category].[Subcategory].[Sequential].set`
- **Composites (C)**: `C.[Category].[Subcategory].[Sequential]`
- **Rights (R)**: `R.[Asset_HFN].[Right_Type].[Sequential]`

### Machine-Friendly Addresses (MFA)

Machine-Friendly Addresses use numeric codes for computational efficiency:

- **Format**: `[Layer].[CategoryNum].[SubCategoryNum].[Sequential]`
- **Example**: `S.001.013.001` (Same asset as above in numeric format)

## Special Layer Types

### Training Data Assets (T)

Training Data assets contain datasets used to train AI models:

- These assets link to the primary assets they were used to generate
- They include prompts, images, videos, and documentation
- They use the special format: `T.[Layer].[Category].[Subcategory].[Sequential].set`

### Composite Assets (C)

Composite assets combine multiple component assets into a cohesive whole:

- They reference other existing assets as components
- They track relationships between component assets
- They include metadata about how components interact

### Personalized Assets (P)

Personalized assets represent user-specific customizations:

- They may include user-uploaded faces, voices, or styles
- They are processed on-device for enhanced privacy
- They use the special format: `P.[Layer].[Category].[Sequential].[Type]`

### Branded Assets (B)

Branded assets represent premium product placements:

- They include branded items like Gucci bags or Coke banners
- They are marked with a crown icon in the UI
- They use the special format: `B.[Layer].[Category].[Subcategory].[Sequential].[Brand]`

### Rights Assets (R)

Rights assets track provenance and rights information:

- They link to primary assets to document ownership and usage rights
- They facilitate automated monetization through Clearity
- They use the special format: `R.[Asset_HFN].[Right_Type].[Sequential]`

## Troubleshooting

### Common Issues

**File Upload Failures**

If your file uploads are failing:
- Ensure your file is under the size limit (100MB by default)
- Check that the file type is supported for the selected layer
- Try refreshing the page and uploading again
- Check your network connection

**Authentication Issues**

If you're having trouble logging in:
- Verify your username and password
- Clear your browser cache and cookies
- Ensure you have an active account
- Contact an administrator if issues persist

**Missing Categories or Subcategories**

If you don't see expected taxonomy options:
- Ensure you've selected the correct layer
- Check if the taxonomy has been updated recently
- Contact an administrator if categories are missing

### Error Messages

**"Backend API unavailable"**
- The application is having trouble connecting to the backend service
- The system will use mock data where possible
- Your changes may not be saved to the database

**"Asset creation failed"**
- Check that all required fields are filled
- Verify that file uploads completed successfully
- Check the provided error details for specific issues

**"Invalid NNA address format"**
- The system detected an issue with the auto-generated NNA address
- Try selecting a different category/subcategory
- Contact an administrator if the issue persists

### Support Contacts

For technical support with the NNA Registry Service:
- Email: support@reviz.dev
- Internal Slack: #nna-registry-support
- Documentation: https://registry.reviz.dev/docs