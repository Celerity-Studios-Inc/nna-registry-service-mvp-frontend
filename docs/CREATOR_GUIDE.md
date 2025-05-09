# NNA Registry Service: Creator's Guide

## Introduction

Welcome to the NNA Registry Service! This guide is designed to help creators register and manage digital assets within the Naming, Numbering, and Addressing (NNA) Framework. The NNA Registry Service uses a dual addressing system for organizing digital assets across various layers (Songs, Stars, Looks, Moves, Worlds, etc.).

### What is the NNA Framework?

The NNA Framework provides a structured way to catalog and reference digital assets using:

1. **Human-Friendly Names (HFN)** - Readable format like `S.POP.KPO.001`
2. **Machine-Friendly Addresses (MFA)** - Numeric format like `S.001.013.001`

This dual addressing system allows both humans and AI systems to efficiently reference and work with assets.

## Getting Started

### Accessing the Registry Service

1. Navigate to [https://registry-service-frontend.vercel.app](https://registry-service-frontend.vercel.app)
2. Sign in with your account credentials
3. If you don't have an account, click "Register" to create one

### Dashboard Overview

After logging in, you'll see the main dashboard containing:

- Recently registered assets
- Quick statistics about your assets
- Navigation menu for different functions
- Quick action buttons for common tasks

## Registering a New Asset

The asset registration process guides you through several steps to ensure proper categorization and metadata assignment.

### Step 1: Layer Selection

1. Click the **Register New Asset** button from the dashboard
2. Select the appropriate **layer** for your asset:
   - **G (Songs)** - Music tracks and audio elements
   - **S (Stars)** - Virtual avatars and characters
   - **L (Looks)** - Wardrobe and styling assets
   - **M (Moves)** - Choreography and movement assets
   - **W (Worlds)** - Environmental backdrops
   - **B (Branded)** - Premium product placements
   - **P (Personalize)** - User-uploaded customizations
   - **T (Training Data)** - Datasets for AI training
   - **C (Composite)** - Aggregated multi-layer assets
   - **R (Rights)** - Provenance and rights tracking

> **Tip:** Double-click a layer card to select it and automatically proceed to the next step.

### Step 2: Taxonomy Selection

1. Choose a **Category** from the dropdown menu
2. Select a **Subcategory** that best describes your asset
3. Notice the NNA Address Preview will automatically generate based on your selections

For example, if registering a K-Pop Star asset:
- Layer: S (Stars)
- Category: POP (Pop)
- Subcategory: KPO (K-Pop)

This will generate an NNA Address like: `S.POP.KPO.001`

### Step 3: File Upload

1. Drag and drop your asset file(s) or click to browse
2. The system supports various file types depending on the selected layer:
   - Songs (G): MP3, WAV, OGG, FLAC
   - Stars (S): JPG, PNG, GIF, SVG
   - Moves (M): MP4, WebM, MOV, JSON
   - Worlds (W): GLTF, GLB, JSON

> **Note:** Most layers allow only one file per asset. Training Data (T) and Composite (C) layers support multiple files.

After uploading:
1. Fill in the **Asset Name** (automatically populated from filename by default)
2. Provide a detailed **Description**
3. Add relevant **Tags** to improve searchability

### Step 4: Special Layer Options

Depending on the selected layer, you may see additional options:

#### For Training Data (T)
1. Upload prompts, images, or videos used to generate the asset
2. Add documentation about the training process
3. Link to the target asset this training data is associated with

#### For Composite Assets (C)
1. Search and select component assets from other layers
2. Establish relationships between assets
3. Define how components are combined

### Step 5: Review and Submit

1. Review all information for accuracy
2. Check the generated NNA addresses (HFN and MFA)
3. Verify file uploads have completed successfully
4. Click **Submit Asset** to complete registration

After submission, you'll see a confirmation page with details about your newly registered asset.

## Managing Your Assets

### Viewing Asset Details

1. From the dashboard, click on any asset to view its details
2. The asset detail page shows:
   - NNA addresses (HFN and MFA)
   - File previews
   - Metadata and tags
   - Related assets (for composites)

### Searching for Assets

Use the search functionality to find assets:

1. Click **Search Assets** in the navigation menu
2. Filter by layer, category, and subcategory
3. Search by name, tags, or description
4. Sort results by various criteria

### Updating Assets

To update an existing asset:

1. Navigate to the asset's detail page
2. Click the **Edit** button
3. Make necessary changes to metadata, tags, or files
4. Submit your updates

## Working with Special Layers

### Composite Assets (C Layer)

Composite assets represent combinations of assets from other layers:

1. Start by selecting the **C (Composite)** layer in Step 1
2. After taxonomy selection, you'll see a component selection interface
3. Search for and select existing assets from other layers
4. Establish relationships between components
5. Upload a preview file for the composite
6. Review and submit

### Training Data (T Layer)

For AI/ML practitioners:

1. Select the **T (Training Data)** layer in Step 1
2. After taxonomy selection, you'll see specialized inputs for:
   - Prompt collection
   - Image datasets
   - Video samples
3. Link this training data to target assets
4. Add detailed documentation about data processing
5. Review and submit

## Best Practices

### Naming and Descriptions

- Use clear, descriptive names for assets
- Include key information in descriptions
- Mention technical specifications when relevant

### Effective Tagging

- Use specific, relevant tags
- Include genre, style, mood where applicable
- Consider searchability when choosing tags

### File Management

- Ensure files are properly formatted before uploading
- Use appropriate compression for optimal quality vs. file size
- Double-check file types match the selected layer

## Troubleshooting

### Connection Issues

If you encounter connection problems:

1. Check your internet connection
2. Visit the Connectivity Help page for diagnostics
3. Try disabling VPN or proxy services

### Upload Problems

If file uploads fail:

1. Check file size limits (100MB default)
2. Verify file format is compatible with the selected layer
3. Try a different browser if issues persist

### Missing Backend Connection

If the system shows "Using Mock Data":

1. The backend may be temporarily unavailable
2. Your authentication may have expired (try logging in again)
3. Contact support if the issue persists

## Getting Help

For additional assistance:

- Check the FAQ section on the website
- Contact support via the Help Center
- Join the creator community forum for peer assistance

---

© 2025 ReViz - NNA Registry Service